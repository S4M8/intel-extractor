const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");
const fs = require('fs');
const os = require('os');
const { runRosterPuppeteerScript, runCuriousPuppeteerScript } = require("../puppeteer/script.js");
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 505,
    autoHideMenuBar: true,
    backgroundMaterial: "acrylic",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("login-submission", async (event, { username, password, path }) => {
  const csvData = await runRosterPuppeteerScript(username, password, path);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const dateTimeStr = `${dateStr}-${timeStr}`;
  const fileName = `roster-${dateTimeStr}.csv`;
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
