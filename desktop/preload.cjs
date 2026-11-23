const { contextBridge, ipcRenderer } = require('electron');
let saveOnClose;

contextBridge.exposeInMainWorld('desktopSaves', {
  read: slot => ipcRenderer.invoke('save:read', slot),
  write: (slot, json) => ipcRenderer.invoke('save:write', slot, json),
  onClosing: callback => { saveOnClose = callback; }
});

ipcRenderer.on('game:closing', async () => {
  try {
    if (saveOnClose) await saveOnClose();
    ipcRenderer.send('game:closed', true);
  } catch {
    ipcRenderer.send('game:closed', false);
  }
});
