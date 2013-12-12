var _ = require("underscore");
var net = require("net");
var bencode = require("bencode");
var EvalResponse = require("./eval_response");
var DescribeResponse = require("./describe_response");

function Client() {
  this._isConnected = false;
  this._socket = new net.Socket();
  this._requests = {};
  this._nextRequestId = 0;
}

_.extend(Client.prototype, {
  connect: function(port, fn) {
    var self = this;
    self._socket
      .on("error", fn)
      .connect(port, function() {
        self._isConnected = true;
        self._socket.on("data", function(data) {
          handleData(self, data);
        });
        fn();
      });
  },

  eval: function(expression, fn) {
    sendRequest(this, {
      op: 'eval',
      code: expression
    }, new EvalResponse(), fn);
  },

  describe: function(fn) {
    sendRequest(this, {
      op: 'describe',
      'verbose?': 'true'
    }, new DescribeResponse(), fn);
  },

  end: function() {
    this._socket.end();
    this._isConnected = false;
  },

  isConnected: function() {
    return this._isConnected;
  }
});

function sendRequest(self, request, response, fn) {
  var id = requestId(self);
  var data = bencode.encode(_.extend({
    id: id
  }, request));

  self._requests[id] = {
    callback: fn,
    response: response
  };

  self._socket.write(data, 'binary');
}

function handleData(self, data) {
  var messages = decodeMessages(data);
  _.each(messages, function(message) {
    var id = message.id;
    var request = self._requests[id];
    if (!request) return;
    var response = request.response;
    response.addChunk(message);
    if (response.isDone()) {
      request.callback.call(null, response.error(), response.value());
      delete self._requests[id];
    }
  });
}

function decodeMessages(data) {
  var decode = bencode.decode;
  var result = [decode(data, 'utf8')];
  while (decode.position < data.length) {
    var message = decode.next();
    result.push(message);
  }
  return result;
}

function requestId(self) {
  return "m" + (self._nextRequestId++);
}

module.exports = Client;
