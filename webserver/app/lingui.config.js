const { formatter } = require("@lingui/format-po");

/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "fr", "es"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: formatter({ lineNumbers: false }),
};