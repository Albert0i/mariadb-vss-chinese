You got it! The `getLlama()` function in `node-llama-cpp` accepts a configuration object with several useful parameters. Here's a breakdown of the most relevant ones:

---

### ⚙️ Common `getLlama()` Config Parameters

| Parameter       | Type     | Description |
|----------------|----------|-------------|
| `debug`        | `boolean`| Enables verbose logging (great for troubleshooting) |
| `threads`      | `number` | Number of CPU threads to use for inference |
| `lowMemory`    | `boolean`| Enables memory-saving mode (slower but lighter) |
| `backendPath`  | `string` | Path to a custom `llama.cpp` backend binary |
| `useGpu`       | `boolean`| Enables GPU acceleration (if supported by your build) |
| `gpuType`      | `'cuda' \| 'vulkan' \| 'metal'` | Specify GPU backend (if building from source) |
| `buildFromSource` | `boolean` | Force building `llama.cpp` from source instead of using prebuilt binaries |

> Not all of these are officially documented yet, but they’re supported in the latest builds and community examples.

---

### 📚 Official Docs

You can find the most up-to-date API reference here:  
👉 [getLlama() API Reference – node-llama-cpp](https://node-llama-cpp.withcat.ai/api/functions/getLlama)

And the GitHub repo (for source code and advanced usage):  
👉 [node-llama-cpp on GitHub](https://github.com/withcatai/node-llama-cpp)

---

If you tell me what you're trying to optimize (speed, memory, GPU, etc.), I can help you craft the perfect config. Want to try enabling GPU or forcing a rebuild with a custom backend?

---

Here’s a breakdown of the most relevant configuration parameters you can pass to `getLlama()` in `node-llama-cpp`, along with their **default values** (based on the latest [API reference](https://node-llama-cpp.withcat.ai/api/functions/getLlama) and source code):

---

### ⚙️ `getLlama()` Configuration Parameters

| Parameter         | Type       | Default Value | Description |
|------------------|------------|----------------|-------------|
| `debug`          | `boolean`  | `false`        | Enables verbose logging for troubleshooting |
| `threads`        | `number`   | `undefined`    | Number of CPU threads to use (auto-detects if not set) |
| `lowMemory`      | `boolean`  | `false`        | Enables memory-saving mode (slower but uses less RAM) |
| `useGpu`         | `boolean`  | `false`        | Enables GPU acceleration (if supported by your build) |
| `gpuType`        | `'cuda' \| 'vulkan' \| 'metal'` | `undefined` | Specifies GPU backend (if building from source) |
| `backendPath`    | `string`   | `undefined`    | Path to a custom `llama.cpp` backend binary |
| `buildFromSource`| `boolean`  | `false`        | Forces building `llama.cpp` from source instead of using prebuilt binaries |
| `env`            | `object`   | `{}`           | Custom environment variables to pass to the backend process |

---

### 🧪 Example Usage

```js
const llama = await getLlama({
  debug: true,
  threads: 6,
  lowMemory: true,
  useGpu: true,
  gpuType: 'cuda'
});
```

This would enable verbose logging, use 6 threads, reduce memory usage, and attempt to run on CUDA-enabled GPU.

---

Let me know your hardware setup or performance goals—I can help you tune these settings for speed, memory, or compatibility. Want to benchmark a few configs side by side?
