# 🚀 RediSearch Tutorial: `FT.CREATE` and `FT.SEARCH` from Scratch

RediSearch lets you build blazing-fast search capabilities directly inside Redis. With it, you can index structured and unstructured data, perform full-text search, filter, sort, and even rank results—all without external search engines.

---

## 🧱 Step 1: Install RediSearch

To use `FT.CREATE` and `FT.SEARCH`, you need Redis with the RediSearch module. The easiest way is via **Redis Stack**:

```bash
docker run -p 6379:6379 redis/redis-stack-server
```

Or download from [Redis Stack Downloads](https://redis.io/docs/install/install-stack/).

---

## 📁 Step 2: Create an Index with `FT.CREATE`

### 🔧 Basic Syntax

```bash
FT.CREATE index_name
  ON HASH
  PREFIX <count> <prefix>
  SCHEMA
    field_name FIELD_TYPE [OPTIONS...]
```

### ✅ Example: Create a Book Index

```bash
FT.CREATE books:index
  ON HASH
  PREFIX 1 book:
  SCHEMA
    title TEXT WEIGHT 5.0
    author TEXT
    genre TAG
    year NUMERIC SORTABLE
    summary TEXT
```

**Explanation:**
- `ON HASH`: Indexes Redis hashes (vs. JSON).
- `PREFIX 1 book:`: Only keys starting with `book:` are indexed.
- `TEXT`: Full-text searchable.
- `TAG`: Exact-match filter (like categories).
- `NUMERIC`: For range queries and sorting.
- `SORTABLE`: Enables sorting on that field.
- `WEIGHT`: Boosts relevance in scoring.

---

## 📥 Step 3: Add Documents

Use `HSET` to add documents as Redis hashes:

```bash
HSET book:1 title "Dune" author "Frank Herbert" genre "sci-fi" year 1965 summary "A desert planet and a messiah."
HSET book:2 title "1984" author "George Orwell" genre "dystopia" year 1949 summary "Big Brother is watching."
HSET book:3 title "Foundation" author "Isaac Asimov" genre "sci-fi" year 1951 summary "A galactic empire in decline."
```

---

## 🔍 Step 4: Search with `FT.SEARCH`

### 🔎 Basic Search

```bash
FT.SEARCH books:index "dune"
```

Returns documents where `"dune"` appears in any `TEXT` field.

---

### 🔗 Boolean Queries

```bash
FT.SEARCH books:index "dune | foundation"       -- OR
FT.SEARCH books:index "dune -messiah"           -- NOT
FT.SEARCH books:index "\"desert planet\""       -- exact phrase
```

---

### 🎯 Field-Specific Search

```bash
FT.SEARCH books:index "@author:Orwell"
FT.SEARCH books:index "@genre:{sci-fi}"
FT.SEARCH books:index "@year:[1950 2000]"
```

- `@field:` targets a specific field.
- `{}` for `TAG` fields.
- `[]` for numeric ranges.

---

### 📈 Sort and Limit

```bash
FT.SEARCH books:index "sci-fi"
  SORTBY year DESC
  LIMIT 0 2
```

Returns the 2 most recent sci-fi books.

---

### 📊 Return Specific Fields

```bash
FT.SEARCH books:index "dune" RETURN 2 title author
```

---

### 🧠 Use Relevance Scores

```bash
FT.SEARCH books:index "dune" WITHSCORES
```

Returns a score (0–1) for each match.

---

## 🧪 Advanced Features

### 🔍 Fuzzy Search

```bash
FT.SEARCH books:index "%dun"  -- matches "dune", "dunk", etc.
```

### 🧮 Aggregation (with `FT.AGGREGATE`)

```bash
FT.AGGREGATE books:index "*" GROUPBY 1 @genre REDUCE COUNT 0 AS count
```

Counts how many books per genre.

---

## 🧼 Step 5: Clean Up

To delete the index and documents:

```bash
FT.DROPINDEX books:index DD
```

- `DD` = Delete associated documents too.

---

## 🧠 Final Thoughts

RediSearch gives Redis the power of a full-text search engine—without needing Elasticsearch or Solr. With `FT.CREATE`, you define how your data is indexed. With `FT.SEARCH`, you query it with precision and speed.
