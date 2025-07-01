/* 
   Redis Helper Functins 
*/
import 'dotenv/config'
import { redis } from './redis/redis.js '

export function getIndexName() {
   return 'fts:chinese:index';
}

export function getDocumentKeyName(id) {
    return `fts:chinese:documents:${id}`
}

export async function checkIndex() {
   const redisCommand = `FT.INFO ${getIndexName()}`
   
   try {      
      await redis.sendCommand(redisCommand.split(' '))
      return true;
   } catch (err) {
      // "Unknown Index name"
      return false; 
   } 
}

export async function createIndex() {
   const redisCommand = `FT.CREATE ${getIndexName()} ON HASH PREFIX 1 ${getDocumentKeyName('')} LANGUAGE chinese SCHEMA id NUMERIC SORTABLE textChi TEXT WEIGHT 1.0 SORTABLE visited NUMERIC SORTABLE createdAt TAG SORTABLE updatedAt TAG SORTABLE updateIdent NUMERIC SORTABLE`

   return await redis.sendCommand(redisCommand.split(' '))
}

export async function findDocuments(query, limit = 5) {
    const indexName = getIndexName()

    // Find documents 
    const redisCommand = `FT.SEARCH ${indexName} ${query.trim()} WITHSCORES RETURN 2 textChi id LIMIT 0 ${limit}`
    const searchResults = await redis.sendCommand(redisCommand.split(' '));
    const docs = twist(searchResults)
 
    // Update `visited` field
    const promises = [];    // Collect promises 
    docs.forEach(doc => { 
         const docKey = getDocumentKeyName(doc.id)
         const now = new Date(); 
         const isoDate = now.toISOString(); 

         promises.push( 
                        redis.multi()
                        .hIncrBy(docKey, 'visited', 1)
                        .hSet(docKey, 'updatedAt', isoDate)
                        .hIncrBy(docKey, 'updateIdent', 1)
                        .exec()
            )
        })
    await Promise.all(promises); // Resolve all at once
    
    return docs
 }
 
 export async function countDocuments(query) { 
   const indexName = getIndexName()

    // Count documents 
    // { total: 5, documents: [] }
    const { total } = await redis.ft.search(indexName, query.trim(), {
       NOCONTENT: true,
       LIMIT: {
          from: 0, // Offset
          size: 0  // Number of results to return
       }
   }); 
 
   return total
 }
 
 export async function getStatus() { 
   return { 
      version: 'xxx',
      documents: 100,
      size: 13.1, 
      visited: 10, 
      results: [
         { id: '31',  textChi: '夏天的海灘充滿歡笑與快樂', visited: '10' },
         { id: '67',  textChi: '夏天的微風讓人感覺舒適', visited: '10' },
         { id: '88',  textChi: '夏天的冰淇淋讓人感到無比清涼', visited: '10' },
         { id: '246', textChi: '夏天的海灘充滿活力', visited: '10' },
         { id: '392', textChi: '夏天的微風帶來涼爽的感受',  visited: '5' }
       ]
   };
 }

 export async function getDocument(id) { 
   /*
      HGETALL fts:chinese:documents:31
   */
   return await redis.hGetAll(getDocumentKeyName(id))
 }

 /* 
    “Even the straightest road has its twist.”
    [
       5,
       'fts:chinese:document:31',
       '14',
       [ 'textChi', '夏天的海灘充滿歡笑與快樂', 'id', '31' ],
       'fts:chinese:document:88',
       '14',
       [ 'textChi', '夏天的冰淇淋讓人感到無比清涼', 'id', '88' ],
       'fts:chinese:document:67',
       '14',
       [ 'textChi', '夏天的微風讓人感覺舒適', 'id', '67' ],
       'fts:chinese:document:246',
       '14',
       [ 'textChi', '夏天的海灘充滿活力', 'id', '246' ],
       'fts:chinese:document:392',
       '7',
       [ 'textChi', '夏天的微風帶來涼爽的感受', 'id', '392' ]
    ]
   
    [
       { textChi: '夏天的海灘充滿歡笑與快樂', id: '31', score: '14' },
       { textChi: '夏天的冰淇淋讓人感到無比清涼', id: '88', score: '14' },
       { textChi: '夏天的微風讓人感覺舒適', id: '67', score: '14' },
       { textChi: '夏天的海灘充滿活力', id: '246', score: '14' },
       { textChi: '夏天的微風帶來涼爽的感受', id: '392', score: '7' }
    ]
 */   
export function twist(inputArray) {
    let outputArray = []
    let obj = {}
    
    for (let i = 1; i < inputArray.length; i += 3) {
       const values = inputArray[i + 2]
       for (let j=0; j < values.length; j +=2) {
          obj[values[j]] = values[j+1]
       }
       obj.score = inputArray[i+1]
 
       outputArray.push(obj)
       obj = {}
    }
    
    return outputArray
 }
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
FT.SEARCH fts:chinese:index "@textChi:夏天" WITHSCORES RETURN 2 textChi id LIMIT 0 100

countDocuments: 
FT.SEARCH fts:chinese:index "@textChi:夏天" NOCONTENT
*/
/*
   In the output of the FT.SEARCH command with the WITHSCORES option, the scores are the floating-point numbers that appear immediately after the document fields. Each document's score is displayed right after its fields.
*/