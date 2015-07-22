// Description:
//   Twitt a link on a configured twitter account
//
// Commands:
//   hubot tweet <url> - Twitt an url
//   hubot tweet <url> <description> - Twitt a link with the description
//   hubot tweet infos - Show the twitter account bound to the current slack room

var fs = require('fs');
var path = require('path');

var Twitter = require('twit');
var slackHelper = require('./../library/slackHelper');

// Grab the config
var jsonConfigFile = path.resolve(__dirname, './../../../twitter-config.json');
if(fs.existsSync(jsonConfigFile)) {
  var twitterConfig = require(jsonConfigFile);
}
else {
  console.log('warning, the twitter config file does not exists, the hubot-slack-twitter will not');
}

// Helpers to get infos from config
function getTwitterConfigForRoom(room) {
  if(!twitterConfig || !twitterConfig.rooms || !twitterConfig.rooms[room]) {
    return null;
  }
  var account = twitterConfig.rooms[room];
  if(!twitterConfig.accounts || !twitterConfig.accounts[account]) {
    return null;
  }
  var res = twitterConfig.accounts[account];
  res.account = account;
  return res;
}

function getTwitterForRoom(room) {
  var config = getTwitterConfigForRoom(room);
  if(!config) {
    throw new Error('No config found');
  }

  var twt = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
  });

  return twt;
}

// Go robot, go!
module.exports = function(robot) {
  robot.respond(/tweet (http[^\s]+)[\s]?(.*)$/, function(res) {
    var user = slackHelper.getRequestUser(res);
    var room = slackHelper.getCurrentRoom(res);
    var twitter = getTwitterForRoom(room);

    if(!twitter) {
      res.send('Sorry, I cannot tweet anything as nobody told me what twitter account to use from that chan.');
      return;
    }

    var url = res.match[1];
    var comment = res.match[2];
    if(comment.length + 20 > 140) {
      res.send('Sorry, I cannot tweet that, your message is ' + (comment.length - 140) + ' chars too long...');
      return;
    }

    var message = url + ' : ' + comment;
    twitter.post('statuses/update', { status: message }, function(err, data, response) {
      if(data.user.screen_name) {
        var tweet_url = 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      }
      console.log('[twitter] twitt posted: ' + tweet_url);
      res.send( 'Great ' + user.name + ', I have put your wonderfull link on twitter! ' + (tweet_url || '') );
    });
  });

  robot.respond(/tweet infos?$/, function(res) {
    var user = slackHelper.getRequestUser(res);
    var room = slackHelper.getCurrentRoom(res);
    var twitterConfig = getTwitterConfigForRoom(room);

    var message = '';
    if(!twitterConfig) {
      message = 'No twitter account is set for that room. Sorry';
    }
    else {
      message = 'I will twitt on ' + twitterConfig.account + ' twitter account';
    }
    res.send(message);
  });
};
