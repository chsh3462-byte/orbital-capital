'use strict';
const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const hashPassword = promisify(scrypt);
const root = path.resolve(__dirname, '../game');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png' };
const sha = token => createHash('sha256').update(token).digest('hex');
const fail = (status, message) => Object.assign(new Error(message), { status });

function createGameServer(directory, extraOrigins = []) {
  fs.mkdirSync(directory, { recursive:true });
  const db = new DatabaseSync(path.join(directory, 'orbital.sqlite3'));
  db.exec(`
    PRAGMA foreign_keys=ON;
    PRAGMA journal_mode=WAL;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, name_key TEXT UNIQUE NOT NULL,
      salt BLOB NOT NULL, password_hash BLOB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      digest TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS balances (
      user_id TEXT PRIMARY KEY REFERENCES accounts(id), cash INTEGER NOT NULL CHECK(cash>=0), updated INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS balance_order ON balances(cash DESC);
  `);
  const allowed = new Set(['null', 'https://chsh3462-byte.github.io', ...extraOrigins]);
  const attempts = new Map();
  const dummySalt = randomBytes(16);
  function limit(ip) {
    const now = Date.now();
    let bucket = attempts.get(ip);
    if (!bucket || bucket.end <= now) {
      for (const [key, value] of attempts) if (value.end <= now) attempts.delete(key);
      attempts.set(ip, bucket = { end:now + 600000, count:0 });
    }
    if (++bucket.count > 40) throw fail(429,'시도가 많습니다. 잠시 후 다시 이용하세요.');
  }
  async function body(req) {
    if (!(req.headers['content-type'] || '').startsWith('application/json')) throw fail(415,'JSON 요청이 필요합니다.');
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      if ((size += chunk.length) > 4096) throw fail(413,'요청이 너무 큽니다.');
      chunks.push(chunk);
    }
    try {
      const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    } catch {}
    throw fail(400,'요청 형식을 확인하세요.');
  }
  function session(req) {
    const token = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.authorization || '')?.[1];
    if (token) {
      const found = db.prepare('SELECT user_id FROM sessions WHERE digest=? AND expires>?').get(sha(token),Date.now());
      if (found) return { id:found.user_id, digest:sha(token) };
    }
    throw fail(401,'로그인이 필요합니다.');
  }
  function issue(user) {
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
    db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(sha(token), user.id, Date.now()+7*86400000);
    return { token, user:{ id:user.id, name:user.name } };
  }
  const server = http.createServer(async (req,res) => {
    const json = (status, value) => {
      res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
      res.end(JSON.stringify(value));
    };
    try {
      const pathname = new URL(req.url,'http://localhost').pathname;
      res.setHeader('X-Content-Type-Options','nosniff');
      if (!pathname.startsWith('/api/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') throw fail(405,'허용되지 않는 요청입니다.');
        const file = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
        const mime = types[path.extname(file)];
        if (!mime || !file.startsWith(root+path.sep) || !(await fs.promises.stat(file).catch(()=>null))?.isFile()) throw fail(404,'파일을 찾지 못했습니다.');
        res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});
        if (req.method==='HEAD') return res.end();
        await pipeline(fs.createReadStream(file),res);return;
      }
      const origin=req.headers.origin;
      if (origin) {
        const same = origin==='http://'+req.headers.host || origin==='https://'+req.headers.host;
        if (!same && !allowed.has(origin)) throw fail(403,'등록되지 않은 게임 주소입니다.');
        res.setHeader('Access-Control-Allow-Origin',origin);
        res.setHeader('Vary','Origin');
      }
      if (req.method==='OPTIONS') {
        res.writeHead(204,{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type'});return res.end();
      }
      if (req.method==='GET' && pathname==='/api/rankings') {
        const rows=db.prepare(`SELECT a.name,b.cash,b.updated,RANK() OVER (ORDER BY b.cash DESC) AS rank
          FROM balances b JOIN accounts a ON a.id=b.user_id ORDER BY b.cash DESC,a.name_key LIMIT 100`).all();
        return json(200,{rows});
      }
      if (req.method!=='POST') throw fail(405,'허용되지 않는 요청입니다.');
      if (pathname==='/api/register' || pathname==='/api/login') {
        limit(req.socket.remoteAddress);
        const data=await body(req);
        const name=typeof data.name==='string'?data.name.normalize('NFKC').trim():'';
        if (!/^[\p{L}\p{N}_-]{2,24}$/u.test(name) || typeof data.password!=='string' || data.password.length<8 || data.password.length>128) throw fail(400,'아이디는 글자·숫자·밑줄·붙임표 2~24자, 비밀번호는 8~128자로 입력하세요.');
        const key=name.toLowerCase();
        if (pathname==='/api/register') {
          const salt=randomBytes(16), password=await hashPassword(data.password,salt,64);
          const user={id:randomUUID(),name};
          const inserted=db.prepare('INSERT INTO accounts VALUES(?,?,?,?,?) ON CONFLICT(name_key) DO NOTHING').run(user.id,name,key,salt,password);
          if (!inserted.changes) throw fail(409,'이미 사용 중인 아이디입니다.');
          return json(201,issue(user));
        }
        const user=db.prepare('SELECT * FROM accounts WHERE name_key=?').get(key);
        const hash=await hashPassword(data.password,user?.salt || dummySalt,64);
        if (!user || !timingSafeEqual(hash,user.password_hash)) throw fail(401,'아이디 또는 비밀번호를 확인하세요.');
        return json(200,issue(user));
      }
      const current=session(req);
      if (pathname==='/api/logout') {
        db.prepare('DELETE FROM sessions WHERE digest=?').run(current.digest);return json(200,{ok:true});
      }
      if (pathname==='/api/balance') {
        const {cash}=await body(req);
        if (!Number.isSafeInteger(cash) || cash<0) throw fail(400,'보유 현금이 올바르지 않습니다.');
        db.prepare('INSERT INTO balances VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET cash=excluded.cash,updated=excluded.updated').run(current.id,cash,Date.now());
        const {rank}=db.prepare('SELECT 1+COUNT(*) AS rank FROM balances WHERE cash>?').get(cash);
        return json(200,{cash,rank});
      }
      throw fail(404,'API를 찾지 못했습니다.');
    } catch (err) {
      if (!err.status && !req.destroyed) console.error('요청 처리 오류',err.code || err.name);
      if (!res.headersSent && !res.destroyed) json(err.status || 500,{error:err.status?err.message:'서버에서 요청을 처리하지 못했습니다.'});
    }
  });
  server.requestTimeout=15000;
  server.once('close',()=>db.close());
  return server;
}
module.exports={createGameServer};
if (require.main===module) {
  const port=Number(process.env.PORT || 8717),host=process.env.HOST || '127.0.0.1';
  const server=createGameServer(process.env.ORBITAL_DATA_DIR || path.join(__dirname,'../server-data'),(process.env.ORBITAL_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean));
  server.listen(port,host,()=>console.log('Orbital Capital http://'+host+':'+port+'/'));
}

