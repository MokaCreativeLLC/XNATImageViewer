goog.require('gxnat');
goog.require('goog.array'); 
goog.require('goog.asserts');
goog.require('goog.Uri');
goog.require('goog.testing');
//goog.require('goog.testing.jsunit');
//goog.require('goog.testing.AsyncTestCase');


/**
 * @type {?goog.Uri}
 */
var gUri = null;

var uriModified = false;

var testUris = {
    restPrefix: "/REST/",
    proj: "projects",
    jsonSuffix: "?format=json"
}



var setUp = function() { 
    alert("Please be logged into an xnat instance before test");
    gUri = new goog.Uri(window.location);

    var currUri = gUri.getPath();

    //
    // Appends any uri prefixes to the rest queries
    //
    if (currUri.indexOf("/scripts/") > 0 && !uriModified){
	testUris.restPrefix = "/" + 
	    currUri.split("/")[1] + testUris.restPrefix;
	uriModified = true;
    }
};


var testGet = function(){
    var query = testUris.restPrefix + testUris.proj
    var res;
    var count = 0;

    gxnat.get(query, function(result){
	assertNotNull(
	    "Basic Get, type unspecified (should be not be null)", result);
	assertNotUndefined(
	    "Basic Get, type unspecified (should be not be undefined)", result);
	count++;
	AsyncTestCase.continueTesting();
    });
    AsyncTestCase.waitForAsync('Waiting...');

    gxnat.get(query, function(result){
	assertNotNull(
	    "Basic Get, type 'json'; (should be object)", result);
	assertNotUndefined(
	    "Basic Get, type 'json' (should be not be undefined)", result);
	count++;
	AsyncTestCase.continueTesting();
    }, 'json');
    AsyncTestCase.waitForAsync('Waiting...');

    gxnat.get(query, function(result){
	assertNotNull(
	    "Basic Get, type 'text' (should be object)", result);
	assertNotUndefined(
	    "Basic Get, type 'text' (should be not be undefined)", result);
	count++;
	AsyncTestCase.continueTesting();
    }, 'text');
    AsyncTestCase.waitForAsync('Waiting...');
}



var testJsonGet = function(){
    var query = testUris.restPrefix + testUris.proj
    var res;
    var count = 0;
    gxnat.jsonGet(query, function(result){
	assertNotNull("Json Get: " + query, result);
	assertNotUndefined("Json Get:" + query, result);
	count++;
	assertEquals(1, count);
	goog.asserts.assertObject(result, "Should be an object (json)");
	AsyncTestCase.continueTesting();
    });
    AsyncTestCase.waitForAsync('Waiting...');
}

var tearDown = function(){
    delete gUri;
    delete testUris;
}


/**
 * @type {goog.testing.AsyncTestCase}
 */
var AsyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
