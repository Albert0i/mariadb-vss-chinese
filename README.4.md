### Fulltext Search in Chinese using Redis
> From vectorization to tokenization; from SQL to NoSQL; 

**DISCLAIMER: Over 90% of this article is written by HIM, i mean AI**


#### Prologue 
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

FT.CREATE fts:chinese:index
    ON JSON
    PREFIX 1 fts:chinese:document:
    SCHEMA
    $.id AS id NUMERIC SORTABLE
    $.textChi AS textChi TEXT SORTABLE
    $.textChiSeg AS textChiSeg TEXT SORTABLE
```

**Explanation**
- `FT.CREATE fts:chinese:index`: Creates a new index named `fts:chinese:index`.
- `ON JSON`: Specifies that the index is for JSON documents.
- `PREFIX 1 fts:chinese:document:`: Specifies that the index should include documents with the prefix `fts:chinese:document:`.
- `SCHEMA`: Defines the schema for the index.

`$.id AS id NUMERIC SORTABLE`: Maps the JSON path `$.id` to the field `id` of type `NUMERIC` and makes it sortable.
`$.textChi AS textChi TEXT SORTABLE`: Maps the JSON path `$.textChi` to the field `textChi` of type `TEXT` and makes it sortable.
`$.textChiSeg AS textChiSeg TEXT SORTABLE`: Maps the JSON path `$.textChiSeg` to the field `textChiSeg` of type `TEXT` and makes it sortable.

**Summary**
The corrected command ensures that each field in the schema has an alias and follows the correct syntax for creating a RediSearch index on JSON documents. Here is the final command:



This command will create an index on JSON documents with the specified schema, allowing you to perform efficient searches and sorts on the `id`, `textChi`, and `textChiSeg` fields.




#### I. 


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