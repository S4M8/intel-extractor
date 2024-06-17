const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");
const { runRosterPuppeteerScript, runCuriousPuppeteerScript } = require("../puppeteer/script.js");
function createWindow() {
  const win = new BrowserWindow({
    // width: 650,
    // height: 550,
    width: 325,
    height: 475,
    autoHideMenuBar: true,
    backgroundMaterial: "acrylic",
    webPreferences: {
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

ipcMain.on("login-submission", async (event, { username, password }) => {
  await runRosterPuppeteerScript(username, password);
});

ipcMain.on("org-submission", async (event, { targetOrg }) => {
  await runCuriousPuppeteerScript(targetOrg);
});
