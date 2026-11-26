const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // App web (npm start) — a API precisa estar rodando em http://localhost:3000
    baseUrl: "http://localhost:4000",
    viewportWidth: 1440,
    viewportHeight: 900,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
