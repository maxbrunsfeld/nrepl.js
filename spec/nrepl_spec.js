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

  describe("evaluating an expression", function() {
    describe("when evaluation succeeds", function() {
      it("yields the value of the expression as a string", function() {
        client.eval('(str "what" "up")', function(err, value) {
          expect(value).to.eql('"whatup"');
          done(err);
        });
      });
    });

    describe("when there is an error", function() {
      it("yields the error", function() {
        client.eval('(+ "not" "numbers")', function(err, value) {
          expect(result).to.equal("");
          expect(error).to.be.instanceof(Error);
          expect(error.type).to.equal("class java.lang.ClassCastException");
          expect(error.message).to.equal(
            "ClassCastException " +
            "java.lang.String cannot be cast to java.lang.Number  " +
            "clojure.lang.Numbers.add (Numbers.java:126)\n");
          done();
        });
      });
    });
  });

  describe("getting metadata about the nrepl server", function() {
    it("yields the metadata", function(done) {
      client.describe(function(err, value) {
        expect(value.versions.nrepl['version-string']).to.eql('0.2.1');
        expect(_.keys(value.ops)).to.eql([
          "clone", "close", "describe", "eval", "interrupt",
          "load-file", "ls-sessions", "stdin"]);
        expect(value.ops.eval).to.eql({
          doc: "Evaluates code.",
          optional: {
            id: "An opaque message ID that will be included in responses " +
                  "related to the evaluation, and which may be used to restrict " +
                  "the scope of a later \"interrupt\" operation."
          },
          requires: {
            code: "The code to be evaluated.",
            session: "The ID of the session within which to evaluate the code."
          },
          returns: {}
        })
        done(err);
      });
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
