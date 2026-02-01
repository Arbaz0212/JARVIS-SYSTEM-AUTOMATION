import fs from "fs";
import path from "path";

const MEMORY_DIR = "./memory";
const LONG_TERM_FILE = path.join(MEMORY_DIR, "longTerm.json");

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR);
if (!fs.existsSync(LONG_TERM_FILE)) fs.writeFileSync(LONG_TERM_FILE, "[]");

export function saveLongTermMemory(entry) {
  const data = JSON.parse(fs.readFileSync(LONG_TERM_FILE));
  data.push({
    text: entry,
    time: new Date().toISOString()
  });
  fs.writeFileSync(LONG_TERM_FILE, JSON.stringify(data, null, 2));
}

export function getLongTermMemory() {
  return JSON.parse(fs.readFileSync(LONG_TERM_FILE));
}
