require("./spec_helper");
var _ = require("underscore");
var async = require("async");
var nrepl = require(ROOT);
var PORT = 65335;

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

  it("is connected", function() {
    expect(client.isConnected()).to.be.true;
  });

  describe("evaluating an expression", function() {
    describe("when evaluation succeeds", function() {
      it("yields the value of the expression as a string", function(done) {
        async.forEach([
          [
            '(inc 1) (inc 2) (inc 3)',
            ['2', '3', '4']
          ],
          [
            '*ns*',
            ['#<Namespace user>']
          ],
          [
            '(map inc [1 2 3])',
            ['(2 3 4)']
          ]
        ], function(pair, f) {
          var expression = pair[0], expectedValue = pair[1];
          client.eval(expression, function(err, value) {
            expect(value).to.eql(expectedValue);
            f(err);
          });
        }, done);
      });
    });

    describe("when there is an error", function() {
      it("yields the error", function(done) {
        client.eval('(+ "not" "numbers")', function(err, value) {
          expect(value).to.eql([]);
          expect(err).to.be.instanceof(Error);
          expect(err.type).to.equal("class java.lang.ClassCastException");
          expect(err.message).to.equal(
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

  describe("disconnecting", function() {
    it("is no longer connected", function() {
      client.end();
      expect(client.isConnected()).to.be.false;
    });
  });
});

describe("connecting to a non-existent nrepl session", function() {
  it("is not connected", function() {
    var client = new nrepl.Client()
    expect(client.isConnected()).to.be.false;
  });

  it("yields an error", function(done) {
    nrepl.connect(123456, function(err) {
      expect(err).to.be.instanceof(Error);
      done();
    });
  });
});
