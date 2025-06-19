
import 'dotenv/config'
import {fileURLToPath} from "url";
import path from "path";
import { getLlama } from 'node-llama-cpp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", process.env.MODEL_NAME)
  });
const context = await model.createEmbeddingContext();
const { vector } = await context.getEmbeddingFor("回答我的問題");
console.log('vector = ', vector)
console.log('length = ', vector.length)

/*
   bge-small-zh-v1.5-gguf
   https://huggingface.co/CompendiumLabs/bge-small-zh-v1.5-gguf/tree/main
   
   bge-large-zh-v1.5 
   bge-large-zh-v1.5-q8_0

   Using Embedding
   https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/embedding.md
*/