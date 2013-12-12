var Client = require("./src/client");

module.exports = {
  connect: function(port, fn) {
    var client = new Client();
    client.connect(port, function(err) {
      fn(err, client);
    });
  },

  Client: Client
};
