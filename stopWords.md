In the context of **Traditional Chinese full-text search**, stop words are typically **common function words or punctuation** that carry little semantic weight and are often excluded to improve search efficiency and relevance. However, unlike English, Chinese (especially Traditional Chinese) doesn’t have a universally standardized stop word list—so it often depends on your tokenizer, search engine, or custom configuration.

That said, here are some commonly used sources and examples:

---

### 📚 Common Stop Word Sources for Traditional Chinese

1. **[stopwords-zh by stopwords-iso](https://github.com/stopwords-iso/stopwords-zh)**  
   A GitHub project offering a comprehensive list of Chinese stop words in both JSON and TXT formats. It includes words like：
   - 一、的、了、不、在、是、有、和、也、就、都、而、及、與、著、或、被、於、等

2. **[CSDN’s curated list](https://blog.csdn.net/dilifish/article/details/117885706)**  
   A massive collection of over 1,800 stop words, including:
   - Function words: 這、那、你、我、他、她、它、我們、你們、他們
   - Particles and modal words: 啊、嗎、呢、吧、啦、喔
   - Punctuation and symbols: 、。！？《》【】…—～

3. **Search engine defaults**  
   - **MySQL/MariaDB**: No built-in Chinese stop word list—you must define your own or preprocess the text.
   - **Lucene/Solr/Elasticsearch**: Often rely on external analyzers like IK or Jieba, which may include their own stop word sets.

---

### 🧠 Best Practices

- **Customize your list**: Tailor it to your domain—e.g., legal, medical, or literary texts may require different exclusions.
- **Tokenize first**: Use a good segmenter (like Jieba or CKIP) before applying stop word filtering.
- **Avoid over-filtering**: In Chinese, even short words can carry meaning, so test carefully before excluding.

Would you like me to help you integrate a stop word list into your tokenizer or MariaDB fulltext pipeline? I can also help you visualize how filtering affects your search results.
