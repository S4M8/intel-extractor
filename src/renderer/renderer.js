const { ipcRenderer } = require("electron");

document.getElementById("scan-button").addEventListener("click", () => {
  const targetOrg = document.getElementById("target-org").value;
  ipcRenderer.send("org-submission", { targetOrg });
});

document.getElementById("admin-button").addEventListener("click", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const fileInput = document.getElementById("csv-input");
  const file = fileInput.files[0];

  if (file) {
    const filepath = file.path;
    ipcRenderer.send("admin-submission", { username, password, filepath });
  } else {
    console.error("No file selected");
  }
});

ipcRenderer.on('save-csv-reply', (event, response) => {
  console.log(response);
  alert(response);
});
