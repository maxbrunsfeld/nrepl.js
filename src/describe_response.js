var _ = require("underscore");

function DescribeResponse() {
  this._value = null;
}

_.extend(DescribeResponse.prototype, {
  addChunk: function(chunk) {
    this._value = chunk;
  },

  isDone: function() {
    return !!this._value;
  },

  error: function() {
    return null;
  },

  value: function() {
    return this._value;
  }
});

module.exports = DescribeResponse;
