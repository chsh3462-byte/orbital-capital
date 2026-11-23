const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createSaveStore } = require('./saves.cjs');

const dataDirectory = app.commandLine.getSwitchValue('user-data-dir') ||
  path.join(app.getPath('appData'), 'OrbitalCapital');
app.setPath('userData', dataDirectory);
const saves = createSaveStore(path.join(dataDirectory, 'saves'));
const entry = path.resolve(__dirname, '../game/index.html');
const entryUrl = pathToFileURL(entry).href;
let gameWindow;
let finishClose;

function isGame(event) {
  return gameWindow && event.sender === gameWindow.webContents &&
    event.senderFrame === event.sender.mainFrame && event.senderFrame.url.split('#')[0] === entryUrl;
}

for (const name of ['read', 'write']) {
  ipcMain.handle('save:' + name, (event, ...args) => {
    if (!isGame(event)) throw new Error('게임 창에서만 저장할 수 있습니다.');
    return saves[name](...args);
  });
}

ipcMain.on('game:closed', (event, ok) => {
  if (isGame(event) && finishClose) finishClose(ok === true);
});

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 940, minWidth: 900, minHeight: 620,
    title: 'Orbital Capital', backgroundColor: '#090e1c', autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), sandbox: true,
      nodeIntegration: false, contextIsolation: true
    }
  });
  gameWindow = win;
  win.removeMenu();
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  let closing = false;
  win.on('close', async event => {
    event.preventDefault();
    if (closing) return;
    closing = true;
    try {
      if (!win.webContents.isCrashed() && !win.webContents.isLoadingMainFrame()) {
        const response = new Promise(resolve => { finishClose = resolve; });
        const timeout = setTimeout(() => finishClose?.(false), 5000);
        let ok;
        try {
          win.webContents.send('game:closing');
          ok = await response;
        } finally {
          clearTimeout(timeout);
          finishClose = undefined;
        }
        if (!ok) throw new Error('종료 시 자동 저장에 실패했습니다.');
      }
      await saves.flush();
    } catch {
      const choice = await dialog.showMessageBox(win, {
        type: 'warning', message: '자동 저장을 완료하지 못했습니다.',
        detail: '게임에 돌아가 수동 저장하거나 기존 저장 상태로 종료할 수 있습니다.',
        buttons: ['게임으로 돌아가기', '종료'], defaultId: 0, cancelId: 0
      });
      if (choice.response === 0) { closing = false; return; }
    }
    win.destroy();
  });
  win.once('ready-to-show', () => win.show());
  await win.loadFile(entry);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (gameWindow?.isMinimized()) gameWindow.restore();
    gameWindow?.focus();
  });
  app.whenReady().then(async () => {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
      (_details, callback) => callback({ cancel: true })
    );
    await createWindow();
  }).catch(error => {
    dialog.showErrorBox('Orbital Capital', String(error.message));
    app.exit(1);
  });
  app.on('window-all-closed', () => app.quit());
}
