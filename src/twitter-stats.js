var TwitterHelper = require('./../library/TwitterHelper');
var SlackHelper = require('./../library/SlackHelper');
var fileUtils = require('./../library/fileUtils');

// Grab the config
var config = fileUtils.getStorageFile('config', {});
if(!Object.keys(config).length) {
  console.log('Warning, the twitter config file does not exists, the hubot-slack-twitter will be useless');
}
var twitterHelper = new TwitterHelper(config);


module.exports = function(robot) {
  robot.respond(/tweet stats/, function(res) {
    // res.send('stats are currently not available, sorry');
    // return;
    var slackHelper = new SlackHelper(res);
    var logs = fileUtils.getStorageFile('logs', []);

    // Stats of a user when in it own room
    if(slackHelper.isCurrentUserDM()) {
      res.send('Your stats for tweeting :');

      var user = slackHelper.getRequestUser();
      var roomsStats = {};
      var accountsStats = {};

      logs.forEach(function(log) {
        if(log.user.name === user.name) { // Filter only current user
          var logRoom = log.user.room===user ? 'direct message with me' : '#' + log.user.room;
          var logAccount = twitterHelper.getTweeterAccountNameForRoom(log.user.room);

          roomsStats[logRoom] = roomsStats[logRoom] ? roomsStats[logRoom]+1 : 1;
          accountsStats[logAccount] = accountsStats[logAccount] ? accountsStats[logAccount]+1 : 1;
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
        var msg = [];
        Object.keys(roomsStats).forEach(function( room ) {
          var count = roomsStats[room];
          msg.push(' - ' + count + ' time' + (count>1 ? 's' : '') + ' in ' + room);
        });
        res.send(msg.join("\n"));
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
      var room = slackHelper.getCurrentRoom();
      var account = twitterHelper.getTweeterAccountNameForRoom();

      var stats = {};
      var total = 0;
      logs.forEach(function(log) {
        if(room === log.user.room) {
          stats[log.user.name] = stats[log.user.name] ? stats[log.user.name]+1 : 1;
          total++;
        }
      });

      if(!Object.keys(stats).length) {
        res.send('Nothing has been tweeted here. What are you waiting to ask me tweeting?');
        return;
      }

      nameRanks = Object.keys(stats).sort(function(a,b){
        return stats[b]-stats[a];
      });
      res.send('Already *' + total + ' tweets have been sent* from this channel. Keep going on!');
      res.send('Top contributor on this channel');
      nameRanks.forEach(function(name, index) {
        var scale = 10;
        var count = stats[name];
        var percent = Math.floor(Math.floor(count/total * (scale * 100) ) / 100);
        var icon = '';
        for(var k=1; k<=scale; k++) {
          icon+= (k<=percent ? ':sun_with_face:' : ':full_moon:');
        }
        res.send( (index+1) + '. ' + icon + ' ' + name + ' (' + count + ')' );
      });
    }
  });
};
