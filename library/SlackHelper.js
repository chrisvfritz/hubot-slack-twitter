/**
 * Stupid basic Slack heler
 */

module.exports = function(res) {
  this.res = res;

  /**
   * Get the user that emit the request
   * @return: {id: string, email: string}
   */
  this.getRequestUser= function() {
    var user = this.res.message.user;
    user.id = this.res.message.user.id;
    user.email = this.res.message.user.email;
    return user;
  };

  /**
   * Get the current room name
   * @return: string
   */
  this.getCurrentRoom= function() {
    return this.res.message.user.room;
  };

  this.isCurrentUserDM = function() {
    var user = this.getRequestUser();
    var room = this.getCurrentRoom();

    // Stats of a user when in it own room
    return user.name === room;
  };
};
