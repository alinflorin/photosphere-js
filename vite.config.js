// vite.config.js
const path = require("path");
const { defineConfig } = require("vite");
const dts = require("vite-plugin-dts");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
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
  plugins: [
    dts({
      include: ["./"],
    }),
  ],
});
