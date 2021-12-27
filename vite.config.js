// vite.config.js
const path = require("path");
const fs = require("fs");
const { defineConfig } = require("vite");
const dts = require("vite-plugin-dts");

module.exports = defineConfig({
  server: {
    https: {
      key: fs.readFileSync("ssl/localhost.key"),
      cert: fs.readFileSync("ssl/localhost.crt"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "photosphere-js",
      fileName: (format) => `index.js`,
      formats: ["es"],
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
      exclude: ["./node_modules/**", "vite-env.d.ts"],
    }),
  ],
});
