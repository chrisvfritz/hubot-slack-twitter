/**
 * Stupid basic Slack heler
 */
var filePrefix = 'twitter-';

var fs = require('fs');
var path = require('path');

module.exports = {
  getStorageFile: function(name, defaultContent) {
    defaultContent = defaultContent || {
      "accounts": {
        "lansingcodes": {
          "consumer_key": process.env.TWITTER_LANSINGCODES_CONSUMER_KEY,
          "consumer_secret": process.env.TWITTER_LANSINGCODES_CONSUMER_SECRET,
          "access_token": process.env.TWITTER_LANSINGCODES_ACCESS_TOKEN,
          "access_token_secret": process.env.TWITTER_LANSINGCODES_ACCESS_TOKEN_SECRET
        }
      },
      "rooms": {
        "twitter": "lansingcodes"
      }
    };
    var pth = path.resolve(__dirname, './../../../' + filePrefix + name + '.json');
    return (fs.existsSync(pth) ? require(pth) : defaultContent);
  },

  saveStorageFile: function(name, data) {
    var pth = path.resolve(__dirname, './../../../' + filePrefix + name + '.json');
    fs.writeFileSync( pth, JSON.stringify( data ), 'utf8');
  }
};
