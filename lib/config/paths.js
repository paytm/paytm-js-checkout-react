const path = require('path');

const BUILD = 'build';

module.exports = {
    umdBuild: path.join(__dirname, '../', BUILD, 'umd'),
    commonBuild: path.join(__dirname, '../', BUILD, 'commonjs'),
    react : path.resolve(__dirname, './node_modules/react')
};