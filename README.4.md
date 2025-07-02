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


#### II. [FT.SEARCH](https://redis.io/docs/latest/commands/ft.search/) (TL;DR)


#### III. Building the index 
To check if your Redis installation support searching capability with: 
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