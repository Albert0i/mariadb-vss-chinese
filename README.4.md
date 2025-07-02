### Fulltext Search in Chinese using Redis
> From vectorization to tokenization; from SQL to NoSQL; 

**DISCLAIMER: Over 90% of this article is written by HIM, i mean AI**

![alt AI-suggestion-3](img/AI-suggestion-3.JPG)


#### Prologue 
To consummate our story of Fulltext Search, we pull out our new friend... Redis is a memoory-first multi-model NoSQL database. The [Redis Query Engine](https://redis.io/docs/latest/develop/ai/search-and-query/) offers an enhanced Redis experience via the following search and query features:
- A rich query language
- Incremental indexing on JSON and hash documents
- Vector search
- Full-text search
- Geospatial queries
- Aggregations


#### I. [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/) (TL;DR)
**Syntax**
```
FT.SEARCH index query 
  [NOCONTENT] 
  [VERBATIM] 
  [NOSTOPWORDS] 
  [WITHSCORES] 
  [WITHPAYLOADS] 
  [WITHSORTKEYS] 
  [FILTER numeric_field min max [ FILTER numeric_field min max ...]] 
  [GEOFILTER geo_field lon lat radius m | km | mi | ft [ GEOFILTER geo_field lon lat radius m | km | mi | ft ...]] 
  [INKEYS count key [key ...]] 
  [INFIELDS count field [field ...]] 
  [RETURN count identifier [AS property] [ identifier [AS property] ...]] 
  [SUMMARIZE [ FIELDS count field [field ...]] [FRAGS num] [LEN fragsize] [SEPARATOR separator]] 
  [HIGHLIGHT [ FIELDS count field [field ...]] [ TAGS open close]] 
  [SLOP slop] 
  [TIMEOUT timeout] 
  [INORDER] 
  [LANGUAGE language] 
  [EXPANDER expander] 
  [SCORER scorer] 
  [EXPLAINSCORE] 
  [PAYLOAD payload] 
  [SORTBY sortby [ ASC | DESC] [WITHCOUNT]] 
  [LIMIT offset num] 
  [PARAMS nargs name value [ name value ...]] 
  [DIALECT dialect]
```

Required arguments

---

**index**

is index name. You must first create the index using [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/).

**query**

is text query to search. If it's more than a single word, put it in quotes. Refer to [Query syntax](https://redis.io/docs/latest/develop/ai/search-and-query/query/) for more details.

**Optional arguments**

NOCONTENT
returns the document ids and not the content. This is useful if RediSearch is only an index on an external document collection.

VERBATIM
does not try to use stemming for query expansion but searches the query terms verbatim.

NOSTOPWORDS (deprecated)
ignores any defined stop words in full text searches. Note: this option is deprecated as of Redis 8.0.

WITHSCORES
also returns the relative internal score of each document. This can be used to merge results from multiple instances.

WITHPAYLOADS
retrieves optional document payloads. See FT.CREATE. The payloads follow the document id and, if WITHSCORES is set, the scores.

WITHSORTKEYS
returns the value of the sorting key, right after the id and score and/or payload, if requested. This is usually not needed, and exists for distributed search coordination purposes. This option is relevant only if used in conjunction with SORTBY.

FILTER numeric_attribute min max
limits results to those having numeric values ranging between min and max, if numeric_attribute is defined as a numeric attribute in FT.CREATE. min and max follow ZRANGE syntax, and can be -inf, +inf, and use ( for exclusive ranges. Multiple numeric filters for different attributes are supported in one query. Deprecated since v2.10: Query dialect 2 explains the query syntax for numeric fields that replaces this argument.

GEOFILTER {geo_attribute} {lon} {lat} {radius} m|km|mi|ft
filter the results to a given radius from lon and lat. Radius is given as a number and units. See GEORADIUS for more details. Deprecated since v2.6: Query dialect 3 explains the query syntax for geospatial fields that replaces this argument.

INKEYS {num} {attribute} ...
limits the result to a given set of keys specified in the list. The first argument must be the length of the list and greater than zero. Non-existent keys are ignored, unless all the keys are non-existent.

INFIELDS {num} {attribute} ...
filters the results to those appearing only in specific attributes of the document, like title or URL. You must include num, which is the number of attributes you're filtering by. For example, if you request title and URL, then num is 2.

RETURN {num} {identifier} AS {property} ...
limits the attributes returned from the document. num is the number of attributes following the keyword. If num is 0, it acts like NOCONTENT. identifier is either an attribute name (for hashes and JSON) or a JSON Path expression (for JSON). property is an optional name used in the result. If not provided, the identifier is used in the result.

SUMMARIZE ...
returns only the sections of the attribute that contain the matched text. See Highlighting for more information.

HIGHLIGHT ...
formats occurrences of matched text. See Highlighting for more information.

SLOP {slop}
is the number of intermediate terms allowed to appear between the terms of the query. Suppose you're searching for a phrase hello world. If some terms appear in-between hello and world, a SLOP greater than 0 allows for these text attributes to match. By default, there is no SLOP constraint.

INORDER
requires the terms in the document to have the same order as the terms in the query, regardless of the offsets between them. Typically used in conjunction with SLOP. Default is false.

LANGUAGE {language}
use a stemmer for the supplied language during search for query expansion. If querying documents in Chinese, set to chinese to properly tokenize the query terms. Defaults to English. If an unsupported language is sent, the command returns an error. See FT.CREATE for the list of languages. If LANGUAGE was specified as part of index creation, it doesn't need to specified with FT.SEARCH.

EXPANDER {expander}
uses a custom query expander instead of the stemmer. See Extensions.

SCORER {scorer}
uses a built-in or a user-provided scoring function.

EXPLAINSCORE
returns a textual description of how the scores were calculated. Using this option requires WITHSCORES.

PAYLOAD {payload}
adds an arbitrary, binary safe payload that is exposed to custom scoring functions. See Extensions.

SORTBY {attribute} [ASC|DESC] [WITHCOUNT]
orders the results by the value of this attribute. This applies to both text and numeric attributes. Attributes needed for SORTBY should be declared as SORTABLE in the index, in order to be available with very low latency. Note that this adds memory overhead.

Sorting Optimizations: performance is optimized for sorting operations on DIALECT 4 in different scenarios:

Skip Sorter - applied when there is no sort of any kind. The query can return after it reaches the LIMIT requested results.
Partial Range - applied when there is a SORTBY clause over a numeric field, with no filter or filter by the same numeric field, the query iterate on a range large enough to satisfy the LIMIT requested results.
Hybrid - applied when there is a SORTBY clause over a numeric field and another non-numeric filter. Some results will get filtered, and the initial range may not be large enough. The iterator is then rewinding with the following ranges, and an additional iteration takes place to collect the LIMIT requested results.
No optimization - If there is a sort by score or by non-numeric field, there is no other option but to retrieve all results and compare their values.
Counts behavior: optionalWITHCOUNTargument returns accurate counts for the query results with sorting. This operation processes all results in order to get an accurate count, being less performant than the optimized option (default behavior on DIALECT 4)

LIMIT first num
limits the results to the offset and number of results given. Note that the offset is zero-indexed. The default is 0 10, which returns 10 items starting from the first result. You can use LIMIT 0 0 to count the number of documents in the result set without actually returning them.

LIMIT behavior: If you use the LIMIT option without sorting, the results returned are non-deterministic, which means that subsequent queries may return duplicated or missing values. Add SORTBY with a unique field, or use FT.AGGREGATE with the WITHCURSOR option to ensure deterministic result set paging.

TIMEOUT {milliseconds}
overrides the timeout parameter of the module.

PARAMS {nargs} {name} {value}
defines one or more value parameters. Each parameter has a name and a value.

You can reference parameters in the query by a $, followed by the parameter name, for example, $user. Each such reference in the search query to a parameter name is substituted by the corresponding parameter value. For example, with parameter definition PARAMS 4 lon 29.69465 lat 34.95126, the expression @loc:[$lon $lat 10 km] is evaluated to @loc:[29.69465 34.95126 10 km]. You cannot reference parameters in the query string where concrete values are not allowed, such as in field names, for example, @loc. To use PARAMS, set DIALECT to 2 or greater than 2 (this requires RediSearch v2.4 or above).

DIALECT {dialect_version}
selects the dialect version under which to execute the query. If not specified, the query will execute under the default dialect version set during module initial loading or via FT.CONFIG SET command. See Query dialects for more information.

Return
FT.SEARCH returns an array reply, where the first element is an integer reply of the total number of results, and then array reply pairs of document ids, and array replies of attribute/value pairs.



#### II. [FT.SEARCH](https://redis.io/docs/latest/commands/ft.search/) (TL;DR)


#### III. 

To check if your Redis installation support searching with: 
```
INFO modules
```
Or 
```
MODULE list
```

![alt ](img/rediSearch.JPG)

> [Chinese support](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/chinese/) allows Chinese documents to be added and tokenized using segmentation rather than simple tokenization using whitespace and/or punctuation.

> Indexing a Chinese document is different than indexing a document in most other languages because of how tokens are extracted. While most languages can have their tokens distinguished by separation characters and whitespace, this is not common in Chinese.

> Chinese tokenization is done by scanning the input text and checking every character or sequence of characters against a dictionary of predefined terms, and determining the most likely match based on the surrounding terms and characters.

> Redis makes use of the [Friso](https://github.com/lionsoul2014/friso) Chinese tokenization library for this purpose. This is largely transparent to the user and often no additional configuration is required.





> When using `FT.SEARCH` in RediSearch to query Chinese characters, you don’t need to manually encode them **but you do need to configure the index and query properly to support Chinese tokenization**. 

> A stemmer is used for the supplied language during indexing. If an unsupported language is sent, the command returns an error. The supported languages are Arabic, Basque, Catalan, Danish, Dutch, English, Finnish, French, German, Greek, Hungarian, Indonesian, Irish, Italian, Lithuanian, Nepali, Norwegian, Portuguese, Romanian, Russian, Spanish, Swedish, Tamil, Turkish, and Chinese.

> When adding Chinese language documents, set LANGUAGE chinese for the indexer to properly tokenize the terms. If you use the default language, then search terms are extracted based on punctuation characters and whitespace. The Chinese language tokenizer makes use of a segmentation algorithm (via [Friso](https://github.com/lionsoul2014/friso)), which segments text and checks it against a predefined dictionary. See [Stemming](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/stemming/) for more information.






#### III. Dual interfaces 

#### IV. Seeding 

#### V. Querying 

#### VI. Bonus 
1. List of articles 
2. Box of Pandora

#### VII. Bibliograhy 

[Modern Redis Crash Course: Backend with Express, TypeScript and Zod]()

“Even the straightest road has its twist.”


#### I. [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/), [FT.SEARCH](https://redis.io/docs/latest/commands/ft.search/) and [FT.AGGREGATE](https://redis.io/docs/latest/commands/ft.aggregate/) (TL;DR)


#### II. Create a full-text index
[FTCREATE Helper](https://albert0i.github.io/src/FTCREATE.html)
```
{
    "id": 1,
    "textChi":     "今天的天空晴朗且蔚藍", 
    "textChiSeg":  "今天 天空 晴朗 且 蔚藍", 
    "visited":     0, 
    "createdAt":   "2025-06-30T01:22:46.562Z", 
    "updatedAt":   "", 
    "updateIdent": 0
}
```
![alt FT.CREATE Helper](img/FT_CREATE_helper.JPG)

```
FT.CREATE fts:chinese:index 
    ON HASH PREFIX 1 fts:chinese:document: SCHEMA 
    id NUMERIC SORTABLE 
    textChi TEXT WEIGHT 1.0 SORTABLE 
    textChiSeg TEXT WEIGHT 1.0 SORTABLE 
    visited NUMERIC SORTABLE 
    createdAt TAG SORTABLE 
    updatedAt TAG SORTABLE 
    updateIdent NUMERIC SORTABLE 
```

This use [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/) to create a Fulltext index for HASH data structures. 


#### II. 


#### III. 


#### IV. 


#### V. Bibliography
1. []()
2. []()
3. []()
4. []()
5. [The Castle by Franz Kafka](https://files.libcom.org/files/Franz%20Kafka-The%20Castle%20(Oxford%20World's%20Classics)%20(2009).pdf)


#### Epilogue 


### EOF (2025/06/30)

INSERT INTO documents (textChi, textChiSeg) VALUES
('今天的天空晴朗且蔚藍', '今天 天空 晴朗 且 蔚藍');

INSERT INTO documents (textChi, textChiSeg) VALUES
('我喜歡吃加了額外起司的披薩', '我 喜歡 吃 加 額外 起司 披薩');

INSERT INTO documents (textChi, textChiSeg) VALUES
('狗狗喜歡和主人玩接球遊戲', '狗狗 喜歡 和 主人 玩 接球 遊戲');

INSERT INTO documents (textChi, textChiSeg) VALUES
('法國的首都是巴黎', '法國 首都 是 巴黎');

INSERT INTO documents (textChi, textChiSeg) VALUES
('喝水對保持身體水分很重要', '喝水 對 保持 身體 水分 很 重要');

INSERT INTO documents (textChi, textChiSeg) VALUES
('聖母峰是世界上最高的山', '聖母峰 是 世界 上 最高 山');

INSERT INTO documents (textChi, textChiSeg) VALUES
('寒冷的冬天來一杯溫暖的茶最合適', '寒冷 冬天 來 一杯 溫暖 茶 最 合適');

INSERT INTO documents (textChi, textChiSeg) VALUES
('繪畫是一種創意表達的方式', '繪畫 是 一種 創意 表達 方式');

INSERT INTO documents (textChi, textChiSeg) VALUES
('並非所有閃亮的東西都是黃金製成', '並非 所有 閃亮 東西 都是 黃金 製成');

INSERT INTO documents (textChi, textChiSeg) VALUES
('打掃房子是保持整潔的好方法', '打掃 房子 是 保持 整潔 好 方法');

```
const now = new Date(); // Creates a Date object for the current date and time
const isoDate = now.toISOString(); // Converts the Date object to an ISO string

console.log(isoDate); // Example output: 2025-06-30T14:21:00.000Z (time will vary based on execution)
```