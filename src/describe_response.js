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
    return stringifyBuffers(this._value);
  }
});

function stringifyBuffers(obj) {
  var result = {};
  _.each(obj, function(value, key) {
    var newValue;
    if (Buffer.isBuffer(value))
      newValue = value.toString();
    else if (_.isObject(value))
      newValue = stringifyBuffers(value);
    else
      newValue = value;
    result[key] = newValue;
  });
  return result;
}

module.exports = DescribeResponse;
