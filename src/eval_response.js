var _ = require("underscore");
var DONE = "done";
var EVAL_ERROR = "eval-error";

function EvalResponse() {
  this._isSuccess = false;
  this._exceptionType = null;
  this._valueChunks = [];
  this._messageChunks = [];
}

_.extend(EvalResponse.prototype, {
  addChunk: function(chunk) {
    if (chunk.value)
      this._valueChunks.push(chunk.value);
    if (chunk.ex)
      this._exceptionType = chunk.ex.toString();
    if (chunk.err)
      this._messageChunks.push(chunk.err);
    if (chunk.status && chunk.status == DONE)
      this._isSuccess = true;
  },

  isDone: function() {
    return (
      this._isSuccess ||
      (this._exceptionType && this._messageChunks.length > 0)
    );
  },

  error: function() {
    if (this._exceptionType) {
      var result = new Error(this._messageChunks.join());
      result.type = this._exceptionType;
      return result;
    }
  },

  value: function() {
    return this._valueChunks.join();
  }
});

module.exports = EvalResponse;
