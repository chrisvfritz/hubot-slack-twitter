// Description:
//   Twitt a link on a configured twitter account
//
// Commands:
//   hubot tweet <url> - Twitt an url
//   hubot tweet <url> <description> - Twitt a link with the description
//   hubot tweet infos - Show the twitter account bound to the current slack room
//   hubot show stats - Show the stats of tweets sent with slack. In DM, the user full stats. In a channel, only the channel stats with rank

// Static files
var fs = require('fs');
var path = require('path');

var Twitter = require('twit');
var slackHelper = require('./../library/slackHelper');

var configFilePath = path.resolve(__dirname, './../../../twitter-config.json');
var logsFilePath = path.resolve(__dirname, './../../../twitter-logs.json');

// Grab the config
if(fs.existsSync(configFilePath)) {
  var twitterConfig = require(configFilePath);
}
else {
  console.log('Warning, the twitter config file does not exists, the hubot-slack-twitter will be useless');
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

function getLogs() {
  return (fs.existsSync(logsFilePath) ? require(logsFilePath) : []);
}
function saveLogs(logs) {
  fs.writeFileSync( logsFilePath, JSON.stringify( logs ), 'utf8');
}

function logTwitt(account, user, url, comment, tweet_url) {
  var logs = getLogs();

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
  saveLogs(logs);
  return true;
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

    var twitterConfig = getTwitterConfigForRoom(room);
    var account = twitterConfig.account || 'unknown';

    var url = res.match[1];
    var comment = res.match[2];
    if(comment.length + 20 > 140) {
      res.send('Sorry, I cannot tweet that, your message is ' + (comment.length - 140) + ' chars too long...');
      return;
    }

    var message = url + ' : ' + comment;
    twitter.post('statuses/update', { status: message }, function(err, data, response) {
      var tweet_url;
      if(data.user.screen_name) {
         tweet_url= 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      }
      console.log('[twitter] twitt posted: ' + (tweet_url || ' no info to display'));

      // Log the tweets in a file
      logTwitt(account, user, url, comment, tweet_url);
      res.send( ':white_check_mark: Great ' + user.name + ', I have put your wonderfull link on twitter! ' + (tweet_url || '') );
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
      message = 'If you ask me, I will twitt on ' + twitterConfig.account + ' twitter account';
    }
    res.send(message);
  });



  robot.respond(/show stats/, function(res) {
    var user = slackHelper.getRequestUser(res);
    var room = slackHelper.getCurrentRoom(res);
    var logs = getLogs();

    // Stats of a user when in it own room
    if(false && user.name === room) {
      res.send('Your stats for tweeting :');

      var roomsStats = {};
      var accountsStats = {};

      logs.forEach(function(log) {
        if(log.user.name === user.name) {
          var logRoom = log.user.room===user ? 'direct message with me' : '#' + log.user.room;
          var accountData = getTwitterConfigForRoom(log.user.room);
          var logAccount = (accountData && accountData.account) ? accountData.account : 'unknown';

          if(!roomsStats[logRoom]) {
            roomsStats[logRoom] = 0;
          }
          roomsStats[logRoom]++;

          if(!accountsStats[logAccount]) {
            accountsStats[logAccount] = 0;
          }
          accountsStats[logAccount]++;
        }
      });

      if(!Object.keys(roomsStats).length) {
        res.send('Sorry, I have no stat for you. Did you really ask me to tweet somthing in the past?');
        return;
      }

      // Tweet per room
      if(Object.keys(roomsStats).length === 1) {
        Object.keys(roomsStats).forEach(function( room ) {
          var count = roomsStats[room];
          res.send('You have tweet ' + count + ' time' + (count>1 ? 's' : '') + ' in ' + room);
        });
      }
      else {
        res.send('You have tweet:');
        Object.keys(roomsStats).forEach(function( room ) {
          var count = roomsStats[room];
          res.send(' - ' + count + ' time' + (count>1 ? 's' : '') + ' in #' + room);
        });
      }

      // Tweet per account
      var countStrings = [];
      Object.keys(accountsStats).forEach(function( account ) {
        var count = accountsStats[account];
        countStrings.push(count + ' time' + (count > 1 ? 's' : '') + ' on ' + account + ' ( https://twitter.com/' + account + ' )');
      });
      res.send('_On twitter, it means ' + countStrings.join(', ') + '_');
    }

    // Stats of a chan when in another room
    // Display
    else {
      var twitterConfig = getTwitterConfigForRoom(room);
      var accountForRoom = twitterConfig.account;

      var stats = {};
      var sum = 0;
      logs.forEach(function(log) {
        if(room === log.user.room) {
          if(!stats[log.user.name]) {
            stats[log.user.name] = 0;
          }
          stats[log.user.name]++;
          sum++;
        }
      });

      nameRanks = Object.keys(stats).sort(function(a,b){
        return stats[b]-stats[a];
      });
      if(nameRanks.length===0) {
        res.send('Nothing has been tweeted here. What are you waiting to ask me tweeting?');
        return;
      }

      res.send('Already *' + sum + ' tweets have been sent* from this channel. Keep going on!');

      res.send('Top contributor on this channel');
      nameRanks.forEach(function(name, index) {
        var count = stats[name];
        var scale = 10;
        var percent = Math.floor(Math.floor(count/sum * (scale * 100) ) / 100);
        var icon = '';
        for(var k=1; k<=scale; k++) {
          icon+= (k<=percent ? ':sun_with_face:' : ':full_moon:');
        }
        res.send( (index+1) + '. ' + icon + ' ' + name + ' (' + count + ')' );
      });
    }
  });
};
