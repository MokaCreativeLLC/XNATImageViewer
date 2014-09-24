goog.require('xiv.utils.ObjectAnalyzer');
goog.require('goog.ui.SliderBase');
goog.require('goog.asserts');
goog.require('goog.testing.jsunit'); 



var testOutputExportables = function() { 
    var output = xiv.utils.ObjectAnalyzer.outputExportables(goog.ui.SliderBase)
    window.console.log(output) 
    goog.asserts.assertString(output);  
};


var testPrintMethods = function(){
    var obj = goog.ui.SliderBase;
    var output;

    for (var key in obj){
	var output = xiv.utils.ObjectAnalyzer.outputExportables(obj)
	window.console.log(output); 
	goog.asserts.assertString(
	    xiv.utils.ObjectAnalyzer.printMethods_(obj[key], key));
    }
}
