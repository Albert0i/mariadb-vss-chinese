import { redis } from './redis/redis.js'
import { documents } from '../data/documents.js'
import { removeWords } from './helper.js'

import tokenizer from 'chinese-tokenizer';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve dictionary path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dictPath = path.join(__dirname, '..', 'src', 'dictionary', 'cedict_ts.u8');

// Load the dictionary and get the tokenizer instance
const segment = tokenizer.loadFile(dictPath);

await redis.connect()
/*
    Flush all data 
    await redis.flushDb()
*/
await redis.flushDb()

let promises = [];

for (let i = 0; i < documents.length; i++) {
    const tokens = segment(removeWords(documents[i]));
    const now = new Date(); 
    const isoDate = now.toISOString(); 
    
    promises.push(redis.hSet(`fts:chinese:document:${i + 1}`, {
        id: i + 1, 
        textChi: documents[i],
        // textChiSeg: tokens.map(t => t.text).join(' '),
        visited:   0, 
        createdAt: isoDate, 
        updatedAt: "", 
        updateIdent: 0
    } ) )
}
await Promise.all(promises)
console.log('Done!')

await redis.close()
/*
const now = new Date(); // Creates a Date object for the current date and time
const isoDate = now.toISOString(); // Converts the Date object to an ISO string

console.log(isoDate); // Example output: 2025-06-30T14:21:00.000Z (time will vary based on execution)
*/
/*
FT.CREATE fts:chinese:index 
    ON HASH PREFIX 1 fts:chinese:document: LANGUAGE chinese 
    SCHEMA 
    id NUMERIC SORTABLE 
    textChi TEXT WEIGHT 1.0 SORTABLE     
    visited NUMERIC SORTABLE 
    createdAt TAG SORTABLE 
    updatedAt TAG SORTABLE 
    updateIdent NUMERIC SORTABLE 
*/
/*
FT.SEARCH fts:chinese:index "@textChi:夏天" NOCONTENT

findDocuments: 
FT.SEARCH fts:chinese:index "@textChi:夏天" WITHSCORES RETURN 2 textChi id

countDocuments: 
FT.SEARCH fts:chinese:index "@textChi:夏天" NOCONTENT
*/