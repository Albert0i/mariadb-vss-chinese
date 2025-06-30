When using `FT.SEARCH` in RediSearch to query Chinese characters, you don’t need to manually encode them—**but you do need to configure the index and query properly to support Chinese tokenization**. Here's how to do it right:

---

### ✅ 1. Use `LANGUAGE chinese` in `FT.CREATE`

When creating your index, specify the language as Chinese so RediSearch uses the **Friso tokenizer** for segmentation:

```bash
FT.CREATE idx:cn
  ON HASH
  PREFIX 1 doc:
  LANGUAGE chinese
  SCHEMA
    content TEXT
```

This ensures that Chinese text is segmented correctly during indexing.

---

### 🔍 2. Use `LANGUAGE chinese` in `FT.SEARCH`

When querying, also specify the language:

```bash
FT.SEARCH idx:cn "数据" LANGUAGE chinese
```

This tells RediSearch to tokenize the query using Chinese rules, matching how the documents were indexed.

---

### 🧪 3. No Need to Encode Characters

You can pass Chinese characters directly in the query string. For example:

```bash
FT.SEARCH idx:cn "主服务器" LANGUAGE chinese
```

RediSearch handles UTF-8 natively, so no URL encoding or escaping is needed.

---

### 🧠 Bonus: Custom Dictionary (Optional)

If you want to fine-tune segmentation, you can load a custom Friso dictionary by setting the `FRISOINI` path when loading the module. This is useful for domain-specific terms.

---

Let me know if you’d like a full example with document insertion and search results—or if you’re using a client library like Node.js or Python, I can show you how to pass Chinese queries there too.
