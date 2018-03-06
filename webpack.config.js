const webpack = require("webpack");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "lib");
const APP_DIR = path.resolve(__dirname, "src");

const WebpackConfig = {
  mode: "development",

  entry: APP_DIR + "/index.js",

  output: {
    path: BUILD_DIR,
    filename: "index.js",
    libraryTarget: "umd",
    library: "react-senna"
  },

  module: {
    rules: [
      {
        test: /.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  }
};

// webpack production config.
if (process.env.NODE_ENV === "production") {
  WebpackConfig.mode = "production";
  WebpackConfig.externals = {
    react: "react",
    "react-dom": "react-dom"
  };
}

module.exports = WebpackConfig;
