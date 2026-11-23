const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function createSaveStore(directory) {
  const pending = new Map();

  function getFile(slot) {
    if (slot !== 'auto' && slot !== 'manual') throw new Error('알 수 없는 저장 슬롯입니다.');
    return path.join(directory, slot + '.json');
  }

  async function write(slot, json) {
    const target = getFile(slot);
    if (typeof json !== 'string' || Buffer.byteLength(json, 'utf8') > 8 * 1024 * 1024) {
      throw new Error('저장 데이터 크기가 허용 범위를 벗어났습니다.');
    }
    JSON.parse(json);
    const previous = pending.get(slot) || Promise.resolve();
    const next = previous.catch(() => {}).then(async () => {
      await fs.mkdir(directory, { recursive: true });
      const temp = path.join(directory, slot + '.' + randomUUID() + '.tmp');
      try {
        const handle = await fs.open(temp, 'wx');
        try {
          await handle.writeFile(json, 'utf8');
          await handle.sync();
        } finally {
          await handle.close();
        }
        await fs.rename(temp, target);
      } finally {
        await fs.rm(temp, { force: true });
      }
    });
    pending.set(slot, next);
    try {
      await next;
    } finally {
      if (pending.get(slot) === next) pending.delete(slot);
    }
  }

  async function read(slot) {
    const target = getFile(slot);
    await pending.get(slot);
    try {
      return await fs.readFile(target, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  return { read, write, flush: () => Promise.all([...pending.values()]) };
}

module.exports = { createSaveStore };
