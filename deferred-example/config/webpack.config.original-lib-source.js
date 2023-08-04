const merge = require('webpack-merge');
const paths = require('./paths');

const common = require('./webpack.config.common');

module.exports = merge(common, {
  resolve: {
    alias: {
      'paytm-blink-checkout-react': paths.libOriginalSource
    }
  }
});