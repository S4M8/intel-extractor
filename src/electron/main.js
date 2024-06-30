const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");
const fs = require('fs');
const os = require('os');
const { runRosterPuppeteerScript, runCuriousPuppeteerScript } = require("../puppeteer/script");
const { initializeDatabase, closeDatabase } = require("../puppeteer/database");

function createWindow() {
  const win = new BrowserWindow({
    width: 325,
    height: 475,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await closeDatabase();
    app.quit();
  }
});

app.on('before-quit', async () => {
  await closeDatabase();
});

ipcMain.on("login-submission", async (event, { username, password }) => {
  await runRosterPuppeteerScript(username, password);
});

ipcMain.on("org-submission", async (event, { targetOrg }) => {
  csvData = await runCuriousPuppeteerScript(targetOrg);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const dateTimeStr = `${dateStr}-${timeStr}`;
  const orgName = targetOrg.toUpperCase();
  const fileName = `${orgName}-public-roster-${dateTimeStr}.csv`;

  const downloadsPath = path.join(os.homedir(), 'Downloads', fileName);
  fs.writeFile(downloadsPath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing CSV file:', err);
      event.reply('save-csv-reply', 'Error saving file');
    } else {
      console.log('CSV file saved successfully to Downloads!');
      event.reply('save-csv-reply', 'File saved successfully');
    }
  });
});
