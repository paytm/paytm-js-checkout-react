const path = require('path');

const templateFileName = 'index.html';
const publicFolder = 'public';
const libFolder = '../../lib/';

module.exports = {
    template: path.join(__dirname, '../', publicFolder, templateFileName),
    libLocal: path.join(__dirname, libFolder),
    libOriginalSource: path.join(__dirname, libFolder, 'src')
};