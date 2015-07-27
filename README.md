Hubot Slack Twitter [![NPM version][npm-image]][npm-url] [![Github issues][github-issues-image]][github-issues-url] [![Github license][github-license-image]][github-license-url]
============================

**Hubot Slack Twitter** allows to post twitt directly from slack. 

By adding the **Hubot Slack Twitter**, you can configure many twitter accounts and bind them to one or more Slack rooms. Then, anybody in the room (even private) can ask the robot to tweet on the dedicated room twitter account.

Moreover, a basic stats report is available by chan / in DM to promote people who tweet the most with **Hubot Slack Twitter**.

- - -

![](https://github.com/tilap/hubot-slack-twitter/blob/master/hubot-slack-twitter_screen.gif)

- - -

See [changelog](https://github.com/tilap/hubot-slack-twitter/blob/master/CHANGELOG.md) for releases infos.

## Installation

In hubot project repository, run:

`npm install --save hubot-slack-twitter`

Then add **hubot-slack-twitter** to your `external-scripts.json`:

```json
["hubot-slack-twitter"]
```

_If you already have the "hubot-help" script, the Hubot Slack Twitter documentation will be happened to the help response_

## Configure

Create a `twitter-config.js` at the root of your hubot directory and fill it with that text and your own config:

```
{
  "accounts": {
    "custom-twitter-account-1": {
      "consumer_key": "xxxxxxxxxxxxxxx",
      "consumer_secret":"xxxxxxxxxxxxxxx",
      "access_token": "xxxxxxxxxxxxxxx",
      "access_token_secret": "xxxxxxxxxxxxxxx"
    },
    "custom-twitter-account-1": {
      "consumer_key": "xxxxxxxxxxxxxxx",
      "consumer_secret": "xxxxxxxxxxxxxxx",
      "access_token": "xxxxxxxxxxxxxxx",
      "access_token_secret": "xxxxxxxxxxxxxxx"
    }
  },
  "rooms": {
    "roomnameA": "custom-twitter-account-1",
    "roomnameB": "custom-twitter-account-1",
    "roomnameC": "custom-twitter-account-1",
    "username": "custom-twitter-account-2"
  }
}

```

Now, you can invite your bot in one of the rooms you mentionned in the config, and send a twitt (see example below).

## Examples

### Post Twitts

**Simple link tweet**

```
user>> hubot tweet http://tilap.net/
```

**A link with some description tweet**
```
user>> hubot tweet http://tilap.net/ a smart french blog about various dev tips
```

### Bot Infos

Show the current room twitter account the bot will post on
```
user>> hubot tweet infos
```

### Statistics

Show statistics

```
user>> hubot tweet stats
```

The response will be different:
- in a direct message with the bot, this will display user stats (cross channel and accounts usage)
- in a chan with a tweeter bot set up, it will display the chan stats with users contribution ranking

[npm-image]: https://img.shields.io/npm/v/hubot-slack-twitter.svg?style=flat
[npm-url]: https://npmjs.org/package/hubot-slack-twitter
[github-issues-image]: https://img.shields.io/github/issues/tilap/hubot-slack-twitter.svg
[github-issues-url]: https://github.com/tilap/hubot-slack-twitter/issues
[github-license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[github-license-url]: https://github.com/tilap/hubot-slack-twitter/blob/master/LICENSE
