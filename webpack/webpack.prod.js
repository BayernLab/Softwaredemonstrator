const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const prod = {
  mode: "production",
  stats: "errors-warnings",
  output: {
    filename: "[name].[contenthash].bundle.js",
    chunkFilename: "[name].[contenthash].chunk.js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          filename: "[name].[contenthash].bundle.js",
        },
      },
    },
  },
};

module.exports = merge(common, prod);
