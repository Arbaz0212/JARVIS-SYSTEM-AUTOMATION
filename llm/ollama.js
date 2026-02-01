const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "llama3.1";

async function askOllama(userPrompt) {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        prompt: `
You are Jarvis, a smart virtual assistant created by Arbaz.
You give short, clear, confident answers.

User: ${userPrompt}
Jarvis:
        `
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}`);
    }

    const data = await res.json();

    return data.response?.trim() || "I couldn't think of a response.";

  } catch (err) {
    console.error("OLLAMA ERROR:", err.message);
    throw new Error("I'm tired, please try after some time.");
  }
}

module.exports = askOllama;
