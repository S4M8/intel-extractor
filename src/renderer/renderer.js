const { ipcRenderer } = require("electron");

document.getElementById("scan-button").addEventListener("click", () => {
  const targetOrg = document.getElementById("target-org").value;
  console.log("Scan button clicked, targetOrg:", targetOrg); // Debugging log
  ipcRenderer.send("org-submission", { targetOrg });
});

document.getElementById("admin-button").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("Admin button clicked, username:", username); // Debugging log
  ipcRenderer.send("login-submission", { username, password });
});

ipcRenderer.on('save-csv-reply', (event, response) => {
  console.log(response); 
  alert(response); 
});
