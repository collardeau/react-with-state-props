const webpack = require("webpack");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "lib");
const APP_DIR = path.resolve(__dirname, "src");

const WebpackConfig = {
  mode: "development",

  entry: APP_DIR + "/index.ts",

  output: {
    path: BUILD_DIR,
    filename: "index.js",
    libraryTarget: "umd",
    library: "react-with-state-props"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      // {
      //   test: /.js$/,
      //   use: "babel-loader",
      //   exclude: /node_modules/
      // },
      {
        test: /.tsx?$/,
        use: "awesome-typescript-loader",
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
