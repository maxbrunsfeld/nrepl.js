require("./spec_helper");
var _ = require("underscore");
var nrepl = require(ROOT);
var PORT = 53939;

describe("connecting to an nrepl session", function() {
  var client;

  beforeEach(function(done) {
    nrepl.connect(PORT, function(err, result) {
      client = result;
      done(err);
    });
  });

  afterEach(function() {
    client.end();
  });

  it("yields an nrepl client", function() {
    expect(client).to.be.instanceof(nrepl.Client);
  });

  describe("evaluating a valid clojure expression", function() {
    var value;

    beforeEach(function(done) {
      client.eval('(str "what" "up")', function(err, result) {
        value = result;
        done(err);
      });
    });

    it("yields the value of the expression as a string", function() {
      expect(value).to.eql('"whatup"');
    });
  });

  describe("evaluating an invalid clojure expression", function() {
    var value, error;

    beforeEach(function(done) {
      client.eval('(+ "not" "numbers")', function(err, result) {
        error = err;
        value = result;
        done();
      });
    });

    it("yields the error", function() {
      expect(error).to.be.instanceof(Error);
      expect(error.type).to.equal("class java.lang.ClassCastException");
      expect(error.message).to.equal(
        "ClassCastException " +
        "java.lang.String cannot be cast to java.lang.Number  " +
        "clojure.lang.Numbers.add (Numbers.java:126)\n");
    });
  });
});

describe("connecting to a non-existent nrepl session", function() {
  it("yields an error", function(done) {
    nrepl.connect(123456, function(err) {
      expect(err).to.be.instanceof(Error);
      done();
    });
  });
});
