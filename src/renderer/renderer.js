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