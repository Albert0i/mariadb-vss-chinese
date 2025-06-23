import 'dotenv/config'
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLlama, LlamaChatSession, Llama3ChatWrapper } from 'node-llama-cpp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, 'models', 'Llama3-8B_Traditional_Chinese_roleplay_chat.Q4_K_M.gguf');

console.log('🔄 Loading model (this may take a few seconds)...');

const llama = await getLlama();
const model = await llama.loadModel({ modelPath });
const context = await model.createContext();
const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
  chatWrapper: new Llama3ChatWrapper(), // Matches LLaMA 3 style prompts
});

console.log('🤖 Ready to chat! Type your message below.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askUser() {
  rl.question('🧑 You: ', async (userInput) => {
    if (!userInput || userInput.toLowerCase() === 'exit') {
      console.log('👋 Chat session ended.');
      rl.close();
      process.exit(0);
    }

    const reply = await session.prompt(userInput);
    console.log('🤖 Bot:', reply.trim(), '\n');

    askUser();
  });
}

askUser();

/*
   Meta-Llama-3-8B-Instruct-GGUF 
   https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/blob/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf

   npx --no node-llama-cpp inspect estimate ./src/models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf
*/