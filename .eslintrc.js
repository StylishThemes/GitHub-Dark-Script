module.exports = {
  "rules": {
    "indent": [0, 2],
    "quotes": [2,"double", {
      "allowTemplateLiterals": true,
      "avoidEscape": true
    }],
    "linebreak-style": [2, "unix"],
    "semi": [2, "always"],
    "no-console": 0,
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
    "no-empty": 0,
    "spaced-comment": 2,
    "arrow-spacing": 2,
    "no-var": 2,
    "no-unused-vars": 1
  },
  "env": {
    "es6": true,
    "browser": true,
    "greasemonkey": true
  },
  "parserOptions": {
    "ecmaVersion": 2019
  },
  "extends": "eslint:recommended"
};
