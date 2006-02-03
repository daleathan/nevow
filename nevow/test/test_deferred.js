// -*- test-case-name: nevow.test.test_javascript -*-

load("testsupport.js");

// import Divmod
// import Divmod.Defer

function succeedDeferred() {
    var result = null;
    var error = null;
    var d = Divmod.Defer.succeed("success");
    d.addCallback(function(res) {
        result = res;
    });
    d.addErrback(function(err) {
        error = err;
    });
    assert(result == "success", "Result was not success but instead: " + result);
    assert(error == null, "Error was not null but instead: " + error);
}

function failDeferred() {
    var result = null;
    var error = null;
    var d = Divmod.Defer.fail(Error("failure"));
    d.addCallback(function(res) {
        result = res;
    });
    d.addErrback(function(err) {
        error = err;
    });
    assert(result == null, "Result was not null but instead: " + result);
    assert(error.error.message == "failure", "Error message was not failure but instead: " + error.error.message);
}

function callThisDontCallThat() {
    var thisCalled = false;
    var thatCalled = false;
    var thisCaller = function (rlst) { thisCalled = true; }
    var thatCaller = function (err) { thatCalled = true; }

    var d = new Divmod.Defer.Deferred();

    d.addCallbacks(thisCaller, thatCaller);
    d.callback(true);

    assert(thisCalled);
    assert(!thatCalled);

    thisCalled = thatCalled = false;

    d = new Divmod.Defer.Deferred();
    d.addCallbacks(thisCaller, thatCaller);
    d.errback(new Divmod.Defer.Failure(Error("Test error for errback testing")));

    assert(!thisCalled);
    assert(thatCalled);
}

function callbackResultPassedToNextCallback() {
    var interimResult = null;
    var finalResult = null;

    var d = new Divmod.Defer.Deferred();
    d.addCallback(function(result) {
            interimResult = result;
            return "final result";
        });
    d.addCallback(function(result) {
            finalResult = result;
        });
    d.callback("interim result");

    assert(interimResult == "interim result", "Incorrect interim result: " + interimResult);
    assert(finalResult == "final result", "Incorrect final result: " + finalResult);
}

function addCallbacksAfterResult() {
    var callbackResult = null;
    var d = new Divmod.Defer.Deferred();
    d.callback("callback");
    d.addCallbacks(
        function(result) {
            callbackResult = result;
        });

    assert(callbackResult == "callback", "Callback result was " + callbackResult);
}

function deferredReturnedFromCallback() {
    var theResult = null;
    var interimDeferred = new Divmod.Defer.Deferred();
    var outerDeferred = new Divmod.Defer.Deferred();

    outerDeferred.addCallback(
        function(ignored) {
            return interimDeferred;
        });
    outerDeferred.addCallback(
        function(result) {
            theResult = result;
        });

    outerDeferred.callback("callback");

    assert(theResult == null, "theResult got value too soon: " + theResult);

    interimDeferred.callback("final result");

    assert(theResult == "final result", "theResult did not get final result: " + theResult);
}

runTests([succeedDeferred,
          failDeferred,
          callThisDontCallThat,
          callbackResultPassedToNextCallback,
          addCallbacksAfterResult,
          deferredReturnedFromCallback]);
