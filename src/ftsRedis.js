import { redis } from './redis/redis.js'

/*
   main
*/
await redis.connect()
const indexName = 'fts:chinese:index';
const query = '@textChiSeg:夏天'; // Custom query
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
const redisCommand = 'FT.SEARCH fts:chinese:index "@textChiSeg:夏天" WITHSCORES RETURN 2 textChi id LIMIT 0 100'
console.log(redisCommand.split(' '))
const secondSearchResults = await redis.sendCommand(redisCommand.split(' '));
// Process and log the search results
console.log('secondSearchResults =', secondSearchResults)


// const numResults = searchResults.total;
// const results = searchResults.documents.map(doc => ({
//     id: doc.id,
//     value: doc.value
// }));
// const results = searchResults.documents.map(doc => ({
//     docId: doc.id,
//     fields: doc.value,
//     score: doc.score || doc.value.score // Adjusted to access score correctly
// }));

// console.log('Number of Results:', numResults);
// results.forEach(result => {
//     console.log(`Document ID: ${result.docId}`);
//     console.log(`Fields: ${JSON.stringify(result.fields)}`);
//     console.log(`Score: ${result.score}`);
//     console.log('---');
// } )
// console.log('searchResults = ', searchResults)
// console.log('Number of Results:', searchResults.total);
// console.log('Search Results:');
// searchResults.documents.map(document => {
//     console.log('document =', document)
// })


// const numResults = searchResults[0];
// const results = [];

// for (let i = 1; i < searchResults.length; i += 3) {
//     const docId = searchResults[i];
//     const fields = searchResults[i + 1];
//     const score = searchResults[i + 2];
//     results.push({ docId, fields, score });
// }


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