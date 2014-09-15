goog.require('xiv.utils.ErrorCatcher');
goog.require('goog.array'); 
goog.require('goog.testing.jsunit'); 


/** 
 * @type {xiv.utils.ErrorCatcher} 
 */
var ErrorCatcher; 

var setUp = function() { 
     ErrorCatcher = new xiv.utils.ErrorCatcher(); 
};

var testIsCompatible = function() { 
    assertNotNull('isCompatible: Should not be null', 
		  xiv.utils.ErrorCatcher.isCompatible()); 
    assertNotUndefined('isCompatible: Should not be undefined', 
		       xiv.utils.ErrorCatcher.isCompatible());
    assertNotThrows('isCompatible:', xiv.utils.ErrorCatcher.isCompatible);
    //assertObjectEquals('isCompatible: Should be true', true,
    //xiv.utils.ErrorCatcher.isCompatible());  
};



var testCheckForWebGL = function() { 
    assertNotNull('checkForWebGL: Should not be null', 
		  xiv.utils.ErrorCatcher.checkForWebGL()); 
    assertNotUndefined('checkForWebGL: Should not be undefined', 
		       xiv.utils.ErrorCatcher.checkForWebGL());
    assertNotThrows('checkForWebGL:', xiv.utils.ErrorCatcher.checkForWebGL); 
};



var testClear = function() { 
    assertNotThrows('Clear', ErrorCatcher.clear); 
    assertNull('Clear', ErrorCatcher.ErrorDialog_); 
};



var _testConsoleOutputGrab = function(){
    var _to = "****Test Output Catcher";
    window.console.log(_to);
    assertTrue("Console output caught: ", 
	       goog.array.contains(ErrorCatcher.getConsoleLog(), _to));
}


var _testWindowOnErrorGrab = function(){
    assertNotNull(window.onerror);
    assertNotUndefined(window.onerror);
    window.onerror();
}


var testWaitForError = function() { 

    //
    // Set the onError callback
    //
    var testErrorFound = false;
    ErrorCatcher.setOnErrorCallback(function(){
	testErrorFound = true;
    })


    //
    // Make sure the wait function isn't issue ridden
    //
    assertNotThrows(function(){ErrorCatcher.waitForError(true)});

    _testConsoleOutputGrab();
    _testWindowOnErrorGrab();
    assertTrue('Run test Error callback reached', testErrorFound);

    assertNotThrows(function(){ErrorCatcher.waitForError(false)});

};



var tearDown = function(){
    ErrorCatcher.dispose();
}
