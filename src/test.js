import { redis } from './redis/redis.js';

const searchIndex = async () => {    
    await redis.connect();

    try {
        const indexName = 'fts:chinese:index';
        const query = '@textChiSeg:夏天'; 
        const searchResults = await redis.sendCommand([
            'FT.SEARCH',
            indexName,
            query,
            'WITHSCORES'
        ]);
        console.log('searchResults =', searchResults)
        
        const numResults = searchResults[0];
        const results = [];
        for (let i = 1; i < searchResults.length; i += 3) {
            const docId = searchResults[i];
            const fields = searchResults[i + 1];
            const score = searchResults[i + 2];
            results.push({ docId, fields, score });
        }

        console.log('Number of Results:', numResults);
        console.log('Search Results:', results);
    } catch (err) {
        console.error('Error performing search:', err);
    } finally {
        await redis.close(); 
    }
};

searchIndex();