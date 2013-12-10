var net = require("net");
var Client = require("./src/client");

module.exports = {
  connect: function(port, fn) {
    var socket = net.connect(port);
    socket.on("error", fn);
    socket.on("connect", function(err) {
      var client = new Client(socket);
      fn(err, client);
    });
  },

  Client: Client
};
