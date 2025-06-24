import tokenizer from 'chinese-tokenizer';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve dictionary path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dictPath = path.join(__dirname, '..', 'src', 'dictionary', 'cedict_ts.u8');

// Load the dictionary and get the tokenizer instance
const segment = tokenizer.loadFile(dictPath);

// Segment Traditional Chinese text
const text = '我想提前終止租約';
const tokens = segment(text);

// Check the token structure
//console.log(JSON.stringify(tokens, null, 2));

// Print segmented result
console.log('Segmented:', tokens.map(t => t.text).join(' '));

// Optional: show pinyin and English
tokens.forEach(({ text, matches }) => {
    const match = matches?.[0];
    const pinyin = match?.pinyin ?? '—';
    const english = match?.english ?? '—';
    console.log(`${text} (${pinyin}) → ${english}`);
  });

/*
   chinese-tokenizer
   https://www.npmjs.com/package/chinese-tokenizer

   CC-CEDICT download
   https://www.mdbg.net/chinese/dictionary?page=cc-cedict
*/