Thanks for sharing the full output—this confirms that your `.gguf` model uses a **newer vocabulary format (type 4)** that your current `node-llama-cpp` build doesn’t recognize.

### 🧩 What’s happening
- The **“Unknown vocabulary type: 4”** error means your version of `node-llama-cpp` (and its underlying `llama.cpp`) is **too old** to support this model.
- Vocabulary type `4` is used by newer models like **LLaMA 3**, **DeepSeek**, **Qwen2**, and **bge-m3** GGUFs.
- Even if you updated the npm package, the **native bindings may still be using an outdated `llama.cpp` backend**.

---

### ✅ How to fix it (clean rebuild)

1. **Delete and reinstall `node-llama-cpp`** to force a rebuild:
   ```bash
   npm uninstall node-llama-cpp
   npm install node-llama-cpp@latest
   ```

2. **Ensure your system has a C++ compiler** (like `build-essential` on Linux or Visual Studio Build Tools on Windows). This allows `node-llama-cpp` to compile the latest `llama.cpp` backend.

3. **Optional: Enable debug logging** to confirm the backend version:
   ```js
   const llama = await getLlama({ debug: true });
   ```

---

### 🧪 Still not working?

If the error persists, it likely means the prebuilt binary didn’t rebuild properly. In that case, I can walk you through:

- Forcing a **manual rebuild** of the native bindings
- Or using a **custom `llama.cpp` backend** with full control

Just let me know your OS and Node.js version, and I’ll tailor the steps. Want to try a known-good GGUF model to verify your setup first?
