/**
 * Stupid basic Slack heler
 */
var filePrefix = 'twitter-';

var fs = require('fs');
var path = require('path');

module.exports = {
  getStorageFile: function(name, defaultContent) {
    defaultContent = defaultContent || {};
    var pth = path.resolve(__dirname, './../../../' + filePrefix + name + '.json');
    return (fs.existsSync(pth) ? require(pth) : defaultContent);
  },

  saveStorageFile: function(name, data) {
    var pth = path.resolve(__dirname, './../../../' + filePrefix + name + '.json');
    fs.writeFileSync( pth, JSON.stringify( data ), 'utf8');
  }
};
