### 🚀 Oracle Text Full-Text Search Tutorial (Step-by-Step for Beginners)


Whether you're indexing Chinese news articles, cultural archives, or multilingual search apps, Oracle Text gives you serious power—if you know how to wield it. This guide shows you how to configure, index, and search tokenized Chinese text with precise control.


#### Prologue: Why Full-Text Search Matters
In today’s data-rich world, storing information isn’t enough—you need to make it searchable, fast, and intuitive. Whether you're powering a news portal, organizing cultural archives, or building a multilingual knowledge base, the ability to search text efficiently is crucial.

For languages like Chinese, where word boundaries aren't marked by spaces, full-text search becomes even more nuanced. That’s where **Oracle Text** shines—offering robust search capabilities that go far beyond simple `LIKE` queries. With the right configuration, it can give you Google-like search precision, relevance ranking, proximity control, and more.

This tutorial walks you through how to unlock that power—from creating indexes on pre-segmented Chinese text to writing rich queries with `AND`, `OR`, `NEAR`, and `SCORE`. Whether you're new to Oracle or expanding your search muscle, you’ll walk away with practical tools and working examples that translate directly into real-world projects.

---

#### 📁 Step 1: Define the Table and Data

Let's say you store Chinese text in two forms: the original and a segmented version where each word is tokenized and separated by spaces.

```sql
CREATE TABLE documents (
  id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  textChi      VARCHAR2(512 CHAR) NOT NULL,
  textChiSeg   VARCHAR2(512 CHAR) NOT NULL  -- e.g., '冬天 很冷 喝 茶'
);
```

Here, `textChiSeg` contains **pre-segmented text**. This allows you to avoid Oracle's default segmentation (which may be ambiguous in Chinese).

---

#### 🪄 Step 2: Create a Custom Lexer

Tell Oracle: "Use my space-separated tokens as-is."

```sql
BEGIN
  CTX_DDL.CREATE_PREFERENCE('segmented_lexer', 'BASIC_LEXER');
  CTX_DDL.SET_ATTRIBUTE('segmented_lexer', 'whitespace', 'YES');
  CTX_DDL.SET_ATTRIBUTE('segmented_lexer', 'printjoins', 'NO');
END;
```

- `whitespace = YES` → Oracle treats spaces as token boundaries.
- `printjoins = NO` → Punctuation is treated separately from words.

---

#### 🔧 Step 3: Create a Full-Text Index

Now create a `CONTEXT` index using that custom lexer:

```sql
CREATE INDEX ft_textChiSeg ON documents(textChiSeg)
  INDEXTYPE IS CTXSYS.CONTEXT
  PARAMETERS('LEXER segmented_lexer');
```

This builds an inverted index based on the tokens in `textChiSeg`.

---

#### 🔎 Step 4: Run Search Queries with `CONTAINS`

With the index in place, let's query it.

##### ✅ Basic Keyword Match (Single Word)
```sql
SELECT * FROM documents
WHERE CONTAINS(textChiSeg, '冬天') > 0;
```
✔️ Returns rows containing the token `"冬天"`.

---

##### 🔗 `AND`: Require All Terms
```sql
SELECT * FROM documents
WHERE CONTAINS(textChiSeg, '冬天 AND 茶') > 0;
```
✔️ Returns rows where **both** `"冬天"` and `"茶"` appear.

---

##### 🔀 `OR`: Match Any Term
```sql
SELECT * FROM documents
WHERE CONTAINS(textChiSeg, '茶 OR 咖啡') > 0;
```
✔️ Returns rows with either `"茶"` or `"咖啡"`.

---

##### 🚫 `NOT`: Exclude a Term
```sql
SELECT * FROM documents
WHERE CONTAINS(textChiSeg, '冬天 NOT 咖啡') > 0;
```
✔️ Finds rows that contain `"冬天"` **but not** `"咖啡"`.

---

##### 🧭 `NEAR`: Proximity Search

Find words that are close together:

```sql
SELECT * FROM documents
WHERE CONTAINS(textChiSeg, '冬天 NEAR3 茶') > 0;
```

✔️ Matches `"冬天"` and `"茶"` **within 3 tokens** of each other, in either direction.  
You can expand proximity with `NEAR10`, `NEAR20`, etc.

---

##### 📈 `SCORE`: Rank by Relevance

Let’s say you want to rank how well each document matches:

```sql
SELECT id, textChiSeg, SCORE(1) AS relevance
FROM documents
WHERE CONTAINS(textChiSeg, '冬天 OR 茶', 1) > 0
ORDER BY relevance DESC;
```

✔️ Assigns a score from 1 to 100 for match quality. The label `1` is linked to the `SCORE(1)` reference.

---

#### 🧼 Step 5: Keep the Index Up to Date

After any insert or update, sync the index like this:

```sql
BEGIN
  CTX_DDL.SYNC_INDEX('FT_TEXTCHISEG');
END;
```

Or automate it with background jobs for real-time systems.

---

#### 🧠 Bonus Tips

- If you're not getting results with `NEARn`, check how far apart your tokens actually are. Proximity counts token **positions**, not characters.
- If Oracle silently skips a word, check if it’s in the default stoplist. You can override it with:
  ```sql
  PARAMETERS('LEXER segmented_lexer STOPLIST CTXSYS.EMPTY_STOPLIST')
  ```

---

#### 🎬 Epilogue

By combining structured preprocessing with Oracle Text’s Boolean and proximity operators, you now have full control over search behavior—even in the nuances of Chinese! You’ve built something more than a text index: it’s a responsive, intelligent filter for knowledge.

When you're ready, we can dive into wildcard search, fuzzy matches, synonym expansion, or multilingual tricks. Your next discovery might just be one query away.

