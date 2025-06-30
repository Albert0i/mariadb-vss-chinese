import { redis } from './redis/redis.js'

/*
   main
*/
await redis.connect()
const indexName = 'fts:chinese:index';
const query = '@textChi:夏天'; // Custom query
/*
   Interface one 
*/
const searchResults = await redis.ft.search(indexName, query, {
    WITHSCORES: true,
    EXPLAINSCORE: true, 
    RETURN: ['id', 'textChi'],
    LIMIT: {
        from: 0,    // Offset
        size: 100   // Number of results to return
    }
});

// Process and log the search results
console.log('searchResults =', searchResults)
console.log('Number of Results:', searchResults.total);

searchResults.documents.forEach(document => {
    console.log(`document id: ${document.id}`);
    Object.entries(document.value).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    console.log('------');
} )

/*
   Interface two
*/
const redisCommand = `FT.SEARCH ${indexName} ${query} WITHSCORES RETURN 2 textChi id LIMIT 0 100`
const secondSearchResults = await redis.sendCommand(redisCommand.split(' '));

// Process and log the search results
console.log('secondSearchResults =', secondSearchResults)
console.log('Number of Results:', secondSearchResults[0]);

for (let i = 1; i < secondSearchResults.length; i += 3) {
   console.log(`document id: ${secondSearchResults[i]}`);
   console.log(`score: ${secondSearchResults[i+1]}`);
   //console.log(`values: ${secondSearchResults[i+2]}`);
   const values = secondSearchResults[i + 2]
   for (let j=0; j < values.length; j +=2) {
      console.log(`${values[j]}: ${values[j+1]}`);
   }
   console.log('------');
}

/*
   Testing 
*/
const count = await countDocuments(indexName, query)
console.log('count = ', count)

const docs = await findDocuments(indexName, query)
console.log('docs =', docs)

await redis.close()

/* 
   Helpers 
*/
async function findDocuments(indexName, query, limit = 5) {
   // Find documents 
   const redisCommand = `FT.SEARCH ${indexName} ${query} WITHSCORES RETURN 2 textChi id LIMIT 0 ${limit}`
   const searchResults = await redis.sendCommand(redisCommand.split(' '));
   const docs = twist(searchResults)

   // Update `visited` field

   return docs
}

async function countDocuments(indexName, query) { 
   // Count documents 
   // { total: 5, documents: [] }
   const { total } = await redis.ft.search(indexName, query, {
      NOCONTENT: true,
      LIMIT: {
         from: 0, // Offset
         size: 0  // Number of results to return
      }
  }); 

  return total
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
function twist(inputArray) {
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