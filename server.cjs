// ==============================
// JARVIS BACKEND BRAIN (OLLAMA)
// ==============================

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;

// ---------- MIDDLEWARE ----------
app.use(cors()); // VERY IMPORTANT for frontend fetch
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- HEALTH CHECK ----------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "Jarvis",
    creator: "Arbaz",
    brain: "ollama llama3.1",
  });
});

// ---------- CHAT (THE BRAIN) ----------
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message received." });
    }

    console.log("🧠 Jarvis thinking:", message);

    // Send prompt to Ollama
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `You are Jarvis, a smart AI assistant created by Arbaz.
Answer clearly and concisely.

User: ${message}
Jarvis:`,
        stream: false,
      }),
    });

    const data = await ollamaRes.json();

    const reply =
      data.response?.trim() ||
      "I am tired. Please try after some time.";

    res.json({ reply });
  } catch (err) {
    console.error("❌ Jarvis brain error:", err);
    res.json({
      reply: "I am tired. Please try after some time.",
    });
  }
});

// ---------- 404 FALLBACK ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🤖 Jarvis brain online at http://localhost:${PORT}`);
});
