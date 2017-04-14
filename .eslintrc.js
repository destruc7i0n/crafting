module.exports = {
  "extends": [
    "standard",
    "standard-jsx"
  ],
  // I personally like having double quotes for my JSX
  "rules": {
    "jsx-quotes": "off"
  },
  // just to disable for localStorage being undefined
  "env": {
    "browser": true
  }
}