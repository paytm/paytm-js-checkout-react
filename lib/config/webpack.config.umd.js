const merge = require('webpack-merge');

const common = require('./webpack.config.common');
const paths = require('./paths');

const LIBRARY_NAME = 'PaytmBlinkCheckoutReact';
const OUTPUT_FILENAME = 'paytm-blink-checkout-react.js';

module.exports = merge(common, {
  output: {
    path: paths.umdBuild,
    filename: OUTPUT_FILENAME,
    library: LIBRARY_NAME,
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
});