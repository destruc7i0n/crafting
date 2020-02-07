module.exports = {
  "extends": ["standard", "standard-jsx"],
  // just to disable for localStorage being undefined and jest being undefined
  "env": {
    "browser": true,
    "jest": true
  },
  "rules": {
    "prefer-const": 0,
    "react/jsx-handler-names": 0
  }
}
