const merge = require('webpack-merge');

const common = require('./webpack.config.common');
const paths = require('./paths');

module.exports = merge(common, {
  output: {
    path: paths.commonBuild,
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  }
});
