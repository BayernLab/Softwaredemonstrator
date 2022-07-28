const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const dev = {
  mode: "development",
  stats: "errors-warnings",
  devtool: "eval-source-map",
  devServer: {
    open: true,
    port: 4200,
  },
};

module.exports = merge(common, dev);
