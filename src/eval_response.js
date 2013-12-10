var _ = require("underscore");
var DONE = "done";
var EVAL_ERROR = "eval-error";

function EvalResponse() {
  this._isSuccess = false;
  this._errorType = null;
  this._valueChunks = [];
  this._errorChunks = [];
}

_.extend(EvalResponse.prototype, {
  addChunk: function(chunk) {
    if (chunk.value)
      this._valueChunks.push(chunk.value);
    if (chunk.ex)
      this._errorType = chunk.ex.toString();
    if (chunk.err)
      this._errorChunks.push(chunk.err);
    if (chunk.status && chunk.status[0] === DONE)
      this._isSuccess = true;
  },

  isDone: function() {
    return (
      this._isSuccess ||
      (this._errorType && this._errorChunks.length > 0)
    );
  },

  error: function() {
    if (this._errorType) {
      var result = new Error(this._errorChunks.join());
      result.type = this._errorType;
      return result;
    }
  },

  value: function() {
    return this._valueChunks;
  }
});

module.exports = EvalResponse;
