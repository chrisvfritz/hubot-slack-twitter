// Description:
//   Twitt a link on a configured twitter account
//
// Commands:
//   hubot tweet <url> - Twitt an url
//   hubot tweet <url> <description> - Twitt a link with the description
//   hubot tweet infos - Show the twitter account bound to the current slack room
//   hubot tweet stats - Show the stats of tweets sent with slack. In DM, the user full stats. In a channel, only the channel stats with rank

// Static files
var TwitterHelper = require('./../library/TwitterHelper');
var SlackHelper = require('./../library/SlackHelper');
var fileUtils = require('./../library/fileUtils');

// Grab the config
var config = fileUtils.getStorageFile('config', {});
if(!Object.keys(config).length) {
  console.log('Warning, the twitter config file does not exists, the hubot-slack-twitter will be useless');
}
var twitterHelper = new TwitterHelper(config);


// Go robot, go!
module.exports = function(robot) {
  robot.respond(/tweet (http[^\s]+)[\s]?(.*)$/, function(res) {
    var slackHelper = new SlackHelper(res);
    var room = slackHelper.getCurrentRoom();
    var twitter = twitterHelper.getTwitterForRoom(room);

    if(!twitter) {
      res.send('Sorry, I cannot tweet anything as nobody told me what twitter account to use from that chan.');
      return;
    }

    // Build twitter message
    var url = res.match[1];
    var comment = res.match[2];
    var commentMaxLength = twitter.MESSAGE_MAXLENGTH - twitter.URL_SHORTENED_LENGTH;
    if(comment.length > commentMaxLength) {
      res.send('Sorry, I cannot tweet that, your comment is ' + (comment.length - commentMaxLength) + ' chars too long...');
      return;
    }
    var message = comment + ' ' + url;

    twitter.post('statuses/update', { status: message }, function(err, data, response) {
      var tweet_url;
      if(data.user.screen_name) {
         tweet_url= 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      }
      console.log('[twitter] twitt posted: ' + (tweet_url || ' no info to display'));

      // Log the tweets in a file
      var account = twitterHelper.getTweeterAccountNameForRoom(room);
      var user = slackHelper.getRequestUser();
      twitterHelper.logTwitt(account, user, url, comment, tweet_url);

      // Send user message
      res.send( ':white_check_mark: Great ' + user.name + ', I have put your wonderfull link on twitter! ' + (tweet_url || '') );
    });
  });


  robot.respond(/tweet infos?$/, function(res) {
    var slackHelper = new SlackHelper(res);

    var room = slackHelper.getCurrentRoom();
    var account = twitterHelper.getTweeterAccountNameForRoom(room) || 'unknown';

    var message = '';
    if(!account) {
      res.send('No twitter account is set for that room. Sorry');
      return;
    }
    res.send('If you ask me, I will twitt on ' + account + ' twitter account');
  });
};
