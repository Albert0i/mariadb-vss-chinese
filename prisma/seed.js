import 'dotenv/config'
import { addDocument } from '../src/embedder.js'

// Prisma 
import { PrismaClient } from '../src/generated/prisma/index.js'; 
const prisma = new PrismaClient();

/*
   documents
*/
import { documents } from '../data/documents.js'

async function seedDB() {  
  /*
     Flush all data 
     await prisma.$executeRaw`TRUNCATE TABLE documents`
  */

  for (let i = 0; i < documents.length; i++) {
    await addDocument(documents[i])
    console.log(`Document ${i + 1}/${documents.length}: ${documents[i]}`);
  }
}

/*
   main 
*/
seedDB()
  .then(() => prisma.$disconnect()) // Ensure disconnect is awaited
  .then(() => console.log('Done!'))
  .catch((error) => {
    console.error('Error:', error);
    return prisma.$disconnect(); // Ensure disconnect happens even on failure
  });