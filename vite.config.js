// vite.config.js
const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      name: "photosphere-js",
      fileName: (format) => `photosphere-js.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },

    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
});
