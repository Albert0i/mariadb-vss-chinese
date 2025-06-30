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
console.log(redisCommand.split(' '))
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
}

await redis.close()
/*
FT.SEARCH fts:chinese:index "@textChiSeg:夏天" NOCONTENT

findDocuments: 
FT.SEARCH fts:chinese:index "@textChiSeg:夏天" WITHSCORES RETURN 2 textChi id LIMIT 0 100

countDocuments: 
FT.SEARCH fts:chinese:index "@textChiSeg:夏天" NOCONTENT
*/
/*
   In the output of the FT.SEARCH command with the WITHSCORES option, the scores are the floating-point numbers that appear immediately after the document fields. Each document's score is displayed right after its fields.
*/