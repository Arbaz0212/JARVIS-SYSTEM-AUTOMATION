const { exec } = require("child_process");

function runSkill(text) {
  const lower = text.toLowerCase();

  if (lower.includes("open youtube")) {
    exec("start https://youtube.com");
    return "Opening YouTube.";
  }

  if (lower.includes("open google")) {
    exec("start https://google.com");
    return "Opening Google.";
  }

  if (lower.includes("who are you")) {
    return "I am Jarvis, a virtual assistant created by Arbaz.";
  }

  return null;
}

module.exports = { runSkill };
