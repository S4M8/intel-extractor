const { ipcRenderer } = require("electron");

document.getElementById("scan-button").addEventListener("click", () => {
  const targetOrg = document.getElementById("target-org").value;
  ipcRenderer.send("org-submission", { targetOrg });
});

document.getElementById("admin-button").addEventListener("click", (event) => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const filepath = document.getElementById("csv-input").files[0].path;
  ipcRenderer.send("login-submission", { username, password, filepath });
});

ipcRenderer.on('save-csv-reply', (event, response) => {
  console.log(response); 
  alert(response); 
});


// Note: Functions related to the typing-text effect.
// var title = document.querySelector("p");
// var CHAR_TIME = 30;

// var text = void 0, index = void 0;
// function requestCharAnimation(char, value) {
//   setTimeout(function () {
//     char.textContent = value;
//     char.classList.add("fade-in");
//   }, CHAR_TIME);
// }

// function addChar() {
//   var char = document.createElement("span");
//   char.classList.add("char");
//   char.textContent = "▌";
//   title.appendChild(char);
//   requestCharAnimation(char, text.substr(index++, 1));
//   if (index < text.length) {
//     requestChar();
//   }
// }

// function requestChar() {
//   var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
//   setTimeout(addChar, CHAR_TIME + delay);
// }

// function start() {
//   index = 0;
//   text = title.textContent.trim();
//   title.textContent = "";
//   requestChar(1000);
// }
// start();

// document.getElementById("run-script")?.addEventListener("click", () => {
//   ipcRenderer.send("run-puppeteer-script");
// });