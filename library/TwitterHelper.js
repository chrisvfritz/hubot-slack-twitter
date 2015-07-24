var Twitter = require('twit');
var fileUtils = require('./../library/fileUtils');

module.exports = function(config) {
  this.config = config;
  this.MESSAGE_MAXLENGTH = 140;
  this.URL_SHORTENED_LENGTH = 20;

  // Helpers to get infos from config
  this.getTwitterConfigForRoom = function (room) {
    if(!this.config || !this.config.rooms || !this.config.rooms[room]) {
      return null;
    }
    var account = this.config.rooms[room];
    if(!this.config.accounts || !this.config.accounts[account]) {
      return null;
    }
    var res = this.config.accounts[account];
    res.account = account;
    return res;
  };

  this.getTweeterAccountNameForRoom= function(room) {
    var config = this.getTwitterConfigForRoom(room);
    return (!config || !config.account)  ? null : config.account;
  };

  this.getTwitterForRoom = function (room) {
    var accountConfig = this.getTwitterConfigForRoom(room);

    if(!accountConfig) {
      throw new Error('No config found');
    }

    var twt = new Twitter({
      consumer_key: accountConfig.consumer_key,
      consumer_secret: accountConfig.consumer_secret,
      access_token: accountConfig.access_token,
      access_token_secret: accountConfig.access_token_secret
    });

    return twt;
  };

  this.logTwitt = function (account, user, url, comment, tweet_url) {
    var logs = fileUtils.getStorageFile('logs', []);

    // Full item
    var logItem = {
      time: Date.now(),
      account: account,
      user: user,
      url: url,
      comment: comment,
      tweet_url: tweet_url
    };

    logs.push(logItem);
    fileUtils.saveStorageFile('logs', logs);
    return true;
  };

};
