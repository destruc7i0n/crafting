/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,jsx,mjs,ts,tsx}": ["oxlint --fix .", "oxfmt ."],
};
