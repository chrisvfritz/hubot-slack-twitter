/**
 * Stupid basic Slack heler
 */
module.exports = {
  /**
   * Get the user that emit the request
   * @return: {id: string, email: string}
   */
  getRequestUser: function(res) {
    var user = res.message.user;
    user.id = res.message.user.id;
    user.email = res.message.user.email;
    return user;
  },
  /**
   * Get the current room name
   * @return: string
   */
  getCurrentRoom: function(res) {
    return res.message.user.room;
  }
};
