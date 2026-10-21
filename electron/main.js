import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Gerador de Cartaz Coagro",
    webPreferences: {
      // endurecimento: o renderer não usa API do Node (verificado por grep em src/)
      // e carrega conteúdo remoto (fundos) — sem isso, qualquer XSS = RCE na loja.
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    autoHideMenuBar: true,
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
