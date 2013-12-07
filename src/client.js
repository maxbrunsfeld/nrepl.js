var _ = require("underscore");
var bencode = require("bencode");
var uuid = require("node-uuid");
var EvalResponse = require("./eval_response");
var DescribeResponse = require("./describe_response");

function Client(socket) {
  this._socket = socket;
  this._conversations = {};
  startListening(this);
}

_.extend(Client.prototype, {
  eval: function(expressionString, fn) {
    sendMessage(this, {
      op: 'eval',
      code: expressionString
    }, new EvalResponse(), fn);
  },

  describe: function(fn) {
    sendMessage(this, {
      op: 'describe',
      'verbose?': 'true'
    }, new DescribeResponse(), fn);
  },

  end: function() {
    this._socket.end();
  },
});

function startListening(self) {
  self._socket.on("data", function(data) {
    handleData(self, data);
  });
}

function sendMessage(self, message, response, fn) {
  var id = requestId();
  var request = bencode.encode(_.extend({
    id: id
  }, message));

  self._conversations[id] = {
    callback: fn,
    response: response
  };

  self._socket.write(request, 'binary');
}

function handleData(self, data) {
  var message = bencode.decode(data);
  var id = message.id.toString();
  var conversation = self._conversations[id];
  var response = conversation.response;
  response.addChunk(message);
  if (response.isDone()) {
    conversation.callback.call(null, response.error(), response.value());
    delete self._conversations[id];
  }
}

function requestId() {
  return uuid.v1();
}

module.exports = Client;
