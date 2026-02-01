// ==============================
// JARVIS FRONTEND CORE (FIXED)
// ==============================

console.log("Jarvis frontend loaded");

// ---------- UI ----------
const orb = document.getElementById("orb");
const startBtn = document.getElementById("startBtn");

// ---------- STATE ----------
let isListening = false;
let isAwake = false;
let isSpeaking = false;
let waitingForCommand = false;
let lastCommands = [];

// ---------- SPEECH RECOGNITION ----------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser");
  throw new Error("SpeechRecognition not supported");
}

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-IN";

// ---------- ORB ----------
function animateOrb(active) {
  orb.classList.toggle("active", active);
}

// ---------- MEMORY ----------
function remember(cmd) {
  lastCommands.push(cmd);
  if (lastCommands.length > 10) lastCommands.shift();
}

// ---------- TEXT TO SPEECH ----------
function speak(text, lang = "en-IN", isWakeReply = false) {
  if (!text) return;

  console.log("🗣️ Jarvis speaking:", text);

  try {
    recognition.abort();
  } catch {}

  isSpeaking = true;
  animateOrb(true);

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  utter.pitch = 0.9;

  utter.onend = () => {
    isSpeaking = false;
    animateOrb(false);

    // ❗ IMPORTANT FIX
    // Only sleep AFTER answering a command
    if (!isWakeReply) {
      isAwake = false;
      waitingForCommand = false;
    }

    if (isListening) {
      setTimeout(() => {
        try {
          recognition.start();
          console.log("🎤 Jarvis listening again");
        } catch {}
      }, 300);
    }
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// ---------- BACKEND ----------
async function askBrain(message) {
  console.log("🧠 Sending to Jarvis brain:", message);

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  return data.reply;
}

// ---------- HELPERS ----------
function containsWakeWord(text) {
  const clean = text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .trim();

  return (
    clean === "jarvis" ||
    clean.includes("hey jarvis") ||
    clean.includes("hi jarvis") ||
    clean.startsWith("jarvis")
  );
}

function detectLanguage(text) {
  return /[ऀ-ॿ]/.test(text) ? "hi-IN" : "en-IN";
}

// ---------- MAIN LISTENER ----------
recognition.onresult = async (event) => {
  const transcript =
    event.results[event.results.length - 1][0].transcript
      .toLowerCase()
      .trim();

  console.log("🎧 Heard:", transcript);

  if (isSpeaking) return;

  // ---- WAKE WORD ----
  if (!isAwake && containsWakeWord(transcript)) {
    isAwake = true;
    waitingForCommand = true;
    speak("Yes Arbaz?", "en-IN", true);
    return;
  }

  // Ignore noise before wake
  if (!isAwake || !waitingForCommand) return;

  remember(transcript);
  const lang = detectLanguage(transcript);

  try {
    const reply = await askBrain(transcript);
    speak(reply, lang);
  } catch (e) {
    speak("I am tired. Please try after some time.", "en-IN");
  }
};

// ---------- ERROR HANDLING ----------
recognition.onerror = (e) => {
  console.warn("Recognition error:", e.error);
};

// ---------- AUTO RESTART ----------
recognition.onend = () => {
  if (isListening && !isSpeaking) {
    try {
      recognition.start();
    } catch {}
  }
};

// ---------- START ----------
startBtn.addEventListener("click", async () => {
  console.log("▶ Starting Jarvis");

  await navigator.mediaDevices.getUserMedia({ audio: true });

  isListening = true;

  recognition.start();
  speak("Hello Arbaz. Jarvis systems online.", "en-IN");
});
