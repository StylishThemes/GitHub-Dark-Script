module.exports = {
  "rules": {
    "indent": [0, 2],
    "quotes": [0, "single"],
    "linebreak-style": [2, "unix"],
    "semi": [2, "always"],
    "no-console": 0,
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
    "no-empty": 0
  },
  "env": {
    "es6": true,
    "browser": true
  },
  "extends": "eslint:recommended"
};