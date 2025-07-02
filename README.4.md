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
The `FT.CREATE` command defines a **search index** over Redis data structures (either `HASH` or `JSON`) to enable full-text, structured, and hybrid search capabilities.

##### 1. Basic Syntax
```bash
FT.CREATE index_name 
  [ON HASH|JSON] 
  [PREFIX count prefix ...] 
  [FILTER expression] 
  [LANGUAGE default_lang] 
  [LANGUAGE_FIELD lang_field] 
  [SCORE default_score] 
  [SCORE_FIELD score_field] 
  [PAYLOAD_FIELD payload_field] 
  [MAXTEXTFIELDS] 
  [TEMPORARY seconds] 
  [NOOFFSETS] 
  [NOFIELDS] 
  [NOHL] 
  [STOPWORDS num word ...] 
  SCHEMA field [AS attribute] type [options...]
```

##### 2. Index Scope and Target

| Option | Description |
|--------|-------------|
| `ON HASH` / `ON JSON` | Specifies the data type to index. Default is `HASH`. |
| `PREFIX count prefix ...` | Restricts indexing to keys with specific prefixes. |
| `FILTER expression` | Lua-like expression to filter which documents are indexed. |
| `TEMPORARY seconds` | Creates a temporary index that expires after the given time. |

##### 3. Language and Scoring

| Option | Description |
|--------|-------------|
| `LANGUAGE lang` | Sets the default language for stemming (e.g., `english`, `chinese`). |
| `LANGUAGE_FIELD field` | Dynamically sets language per document using a field. |
| `SCORE float` | Assigns a default relevance score to all documents. |
| `SCORE_FIELD field` | Dynamically assigns scores from a document field. |
| `PAYLOAD_FIELD field` | Stores custom metadata (payload) for each document. |

##### 4. Performance and Memory Flags

| Flag | Effect |
|------|--------|
| `MAXTEXTFIELDS` | Optimizes indexing when many text fields are used. |
| `NOOFFSETS` | Disables term offset tracking (saves memory, disables highlighting/summarization). |
| `NOFIELDS` | Disables field name indexing (saves memory). |
| `NOHL` | Disables highlighting support. |
| `STOPWORDS num word ...` | Custom stopword list; use `0` to disable stopwords entirely. |

##### 5. SCHEMA Definition

The `SCHEMA` section defines which fields to index and how. Each field can be renamed using `AS`.

- Field Types and Options

| Type | Description | Options |
|------|-------------|---------|
| `TEXT` | Full-text searchable field | `WEIGHT`, `PHONETIC`, `NOSTEM`, `SORTABLE`, `UNF`, `WITHSUFFIXTRIE` |
| `TAG` | Exact-match field with comma-separated values | `SEPARATOR`, `CASE-SENSITIVE`, `SORTABLE` |
| `NUMERIC` | Numeric field for range queries | `SORTABLE` |
| `GEO` | Geospatial field (lat/lon) | — |
| `VECTOR` | Vector field for similarity search | `FLAT` or `HNSW` algorithm with parameters |

- Example: Indexing Books
```bash
FT.CREATE booksIdx ON HASH PREFIX 1 book: 
  SCHEMA 
    title TEXT WEIGHT 5.0 
    author TEXT 
    genre TAG 
    published NUMERIC 
    location GEO
```
This creates an index on keys like `book:*`, indexing title and author for full-text, genre for filtering, published year for range queries, and location for geo queries.

##### 6. Advanced Use Cases

- **Multilingual Search**: Use `LANGUAGE_FIELD` to stem documents in their native language.
- **Dynamic Scoring**: Combine `SCORE_FIELD` with user engagement metrics.
- **Hybrid Search**: Combine `TEXT` and `VECTOR` fields for semantic + lexical search.
- **Payloads**: Store metadata like click-through rates or categories for downstream use.


#### II. [FT.SEARCH](https://redis.io/docs/latest/commands/ft.search/) (TL;DR)
The `FT.SEARCH` command performs **full-text, structured, and hybrid queries** on a RediSearch index. It retrieves documents that match a given query string, with support for filtering, sorting, highlighting, summarization, and vector similarity.

##### 1. Basic Syntax
```bash
FT.SEARCH index query 
  [NOCONTENT] 
  [LIMIT offset num] 
  [SORTBY field [ASC|DESC]] 
  [RETURN num field ...] 
  [WITHSCORES] 
  [WITHPAYLOADS] 
  [FILTER field min max] 
  [GEOFILTER field lon lat radius m|km|ft|mi] 
  [INKEYS num key ...] 
  [INFIELDS num field ...] 
  [HIGHLIGHT [FIELDS num field ...] [TAGS open close]] 
  [SUMMARIZE [FIELDS num field ...] [FRAGS num] [LEN num] [SEPARATOR str]] 
  [PARAMS num name value ...] 
  [DIALECT dialect_version]
```

##### 2. Query Language Features

| Feature | Description |
|--------|-------------|
| **Free-text search** | Supports stemming, stopword filtering, and tokenization. |
| **Field targeting** | Use `@field:term` to restrict search to specific fields. |
| **Boolean logic** | Combine terms with `AND`, `OR`, `-` (NOT). |
| **Wildcards** | Use `*` and `?` for prefix/suffix/infix matching. |
| **Fuzzy search** | Use `%term%` for Levenshtein distance-based matching. |
| **Exact match** | Use double quotes `"exact phrase"` or `==value`. |
| **Numeric ranges** | Use `FILTER` for numeric fields. |
| **Geo queries** | Use `GEOFILTER` for lat/lon + radius filtering. |
| **Vector search** | Combine with `VECTOR` clause for hybrid semantic search. |

##### 3. Result Control Options

| Option | Description |
|--------|-------------|
| `LIMIT offset num` | Pagination control. |
| `SORTBY field ASC|DESC` | Sort results by a sortable field. |
| `RETURN num field ...` | Specify which fields to return. |
| `WITHSCORES` | Include relevance scores. |
| `WITHPAYLOADS` | Return payloads stored with documents. |
| `NOCONTENT` | Return only document IDs (no fields). |

##### 4. Highlighting & Summarization

| Feature | Description |
|--------|-------------|
| `HIGHLIGHT` | Wrap matching terms in tags (default: `<b>`, `</b>`). |
| `SUMMARIZE` | Extracts text fragments with matches. Options: `FRAGS`, `LEN`, `SEPARATOR`. |

##### 5. Filtering & Targeting

| Option | Description |
|--------|-------------|
| `FILTER field min max` | Numeric range filter. |
| `GEOFILTER field lon lat radius unit` | Geospatial filtering. |
| `INKEYS num key ...` | Restrict search to specific keys. |
| `INFIELDS num field ...` | Restrict search to specific fields. |

##### 6. Parameters & Dialects

| Option | Description |
|--------|-------------|
| `PARAMS num name value ...` | Pass named parameters for dynamic queries. |
| `DIALECT version` | Use advanced query syntax (e.g., `DIALECT 2` for vector search). |

##### 7. Examples

- Example 1: Basic Full-Text Search
```bash
FT.SEARCH booksIdx "redis search engine"
```
Searches for documents containing all three terms.

- Example 2: Field-Specific + Sorting + Pagination
```bash
FT.SEARCH booksIdx "@genre:{sci-fi} @author:Asimov"
  SORTBY published DESC 
  LIMIT 0 5 
  RETURN 3 title published genre
```
Finds sci-fi books by Asimov, sorted by publish date, returning top 5 with selected fields.

- Example 3: Highlighting and Summarization
```bash
FT.SEARCH booksIdx "quantum computing"
  HIGHLIGHT FIELDS 1 description TAGS <em> </em>
  SUMMARIZE FIELDS 1 description FRAGS 2 LEN 30 SEPARATOR "..."
```
Returns snippets from the `description` field with highlighted terms.

- Example 4: Hybrid Vector + Text Search
```bash
FT.SEARCH myIdx "*"
  PARAMS 2 vec_blob $blob
  VECTOR_RANGE v_field 1 BLOB $blob DIALECT 2
```
Performs a vector similarity search using a binary blob and RediSearch dialect 2.

##### 8. Notes & Best Practices

- **Stemming and stopwords** are language-dependent; configure via `FT.CREATE`.
- **Performance**: Use `NOCONTENT`, `RETURN`, and `LIMIT` to reduce payload.
- **Security**: Only returns keys the user has read access to.
- **Vector search** requires RediSearch 2.4+ and proper `FT.CREATE` schema.


#### III. Building the index 
First, check to see if your Redis installation has search capability with either `INFO modules` or `MODULE list`. 
![alt ](img/rediSearch.JPG)

Redis Query Engine supports Fulltext Search in Chinese out of the box! 
> [Chinese support](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/chinese/) allows Chinese documents to be added and tokenized using segmentation rather than simple tokenization using whitespace and/or punctuation.

> Indexing a Chinese document is different than indexing a document in most other languages because of how tokens are extracted. While most languages can have their tokens distinguished by separation characters and whitespace, this is not common in Chinese.

> Chinese tokenization is done by scanning the input text and checking every character or sequence of characters against a dictionary of predefined terms, and determining the most likely match based on the surrounding terms and characters.

> Redis makes use of the [Friso](https://github.com/lionsoul2014/friso) Chinese tokenization library for this purpose. This is largely transparent to the user and often no additional configuration is required.

According to [FT.CREATE](https://redis.io/docs/latest/commands/ft.create/) documentation: 
**LANGUAGE_FIELD {lang_attribute}**
> is a document attribute set as the document language.

> A stemmer is used for the supplied language during indexing. If an unsupported language is sent, the command returns an error. The supported languages are Arabic, Basque, Catalan, Danish, Dutch, English, Finnish, French, German, Greek, Hungarian, Indonesian, Irish, Italian, Lithuanian, Nepali, Norwegian, Portuguese, Romanian, Russian, Spanish, Swedish, Tamil, Turkish, and Chinese.

> When adding Chinese language documents, set LANGUAGE chinese for the indexer to properly tokenize the terms. If you use the default language, then search terms are extracted based on punctuation characters and whitespace. The Chinese language tokenizer makes use of a segmentation algorithm (via [Friso](https://github.com/lionsoul2014/friso)), which segments text and checks it against a predefined dictionary. See [Stemming](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/stemming/) for more information.

According to [FT.SEARCH](https://redis.io/docs/latest/commands/ft.search/) documentation: 
**LANGUAGE_FIELD {lang_attribute}**
use a stemmer for the supplied language during search for query expansion. If querying documents in Chinese, set to chinese to properly tokenize the query terms. Defaults to English. If an unsupported language is sent, the command returns an error. See F[T.CREATE](https://redis.io/docs/latest/commands/ft.create/) for the list of languages. If LANGUAGE was specified as part of index creation, it doesn't need to specified with FT.SEARCH.

Instead of crafting `FT.CREATE` command from scratch, a small utility [FTCREATE Helper](https://albert0i.github.io/src/FTCREATE.html) may give you a hand. To envisage the data model in JSON format, for example: 
```
{
    "id": 1,
    "textChi":     "今天的天空晴朗且蔚藍", 
    "visited":     0, 
    "createdAt":   "2025-06-30T01:22:46.562Z", 
    "updatedAt":   "", 
    "updateIdent": 0
}
```

Paste it in, answer a couple of questions and press `generate`: 
![alt FT.CREATE Helper](img/FT_CREATE_helper.JPG)

Slightly modify and beautify as needed: 
```
FT.CREATE fts:chinese:index 
    ON HASH PREFIX 1 fts:chinese:document: LANGUAGE chinese 
    SCHEMA 
    id NUMERIC SORTABLE 
    textChi TEXT WEIGHT 1.0 SORTABLE     
    visited NUMERIC SORTABLE 
    createdAt TAG SORTABLE 
    updatedAt TAG SORTABLE 
    updateIdent NUMERIC SORTABLE 
```
**Caveat**

1. `LANGUAGE chinese` is added as needed; 
2. Only fields to be searched should be indexed; 
```
FT.CREATE fts:chinese:index 
    ON HASH PREFIX 1 fts:chinese:document: LANGUAGE chinese 
    SCHEMA 
    textChi TEXT WEIGHT 1.0 SORTABLE     
    visited NUMERIC SORTABLE 
```
Our minimum version of index can save more space. 
3. Index can be built on a subset of data:
```
FT.CREATE idx_name ON HASH 
  PREFIX 1 doc: 
  FILTER "@status == 'active'" 
  SCHEMA title TEXT body TEXT
```
```
FT.CREATE idx ON JSON 
  FILTER '@type == "article"' 
  SCHEMA $.title AS title TEXT $.tags AS tags TAG
```
> You can create a **partial index** using the `FILTER` clause in the `FT.CREATE` command. This allows you to index only a subset of documents that match a specific condition, similar to partial indexes in traditional RDBMS systems.
4. Index can be built accoss multiple sets of data; 
```
FT.CREATE people_idx ON HASH 
  PREFIX 2 user: customer: 
  SCHEMA name TEXT email TEXT signup_date NUMERIC
```
> RediSearch fully supports indexing across **multiple key prefixes** using the `PREFIX` option in `FT.CREATE`. This allows you to build a single unified index that spans different logical datasets, like user: and customer: —as long as they share a compatible schema.


#### III. Dual interfaces 

#### IV. Seeding 

#### V. Querying 

#### VI. Bonus 
1. List of articles 
2. Box of Pandora


#### VII. Bibliograhy 
1. []()
2. []()
3. []()
4. []()
5. [The Castle by Franz Kafka](https://files.libcom.org/files/Franz%20Kafka-The%20Castle%20(Oxford%20World's%20Classics)%20(2009).pdf)

[Modern Redis Crash Course: Backend with Express, TypeScript and Zod]()

“Even the straightest road has its twist.”


#### II. Create a full-text index
[FTCREATE Helper](https://albert0i.github.io/src/FTCREATE.html)

#### Epilogue 


### EOF (2025/06/30)
