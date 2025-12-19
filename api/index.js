const server = require("../dist/index.cjs");

module.exports = (req, res) => {
  server(req, res);
};
