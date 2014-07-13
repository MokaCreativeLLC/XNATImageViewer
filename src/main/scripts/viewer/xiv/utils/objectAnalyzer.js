goog.provide('xiv.utils.objectAnalyzer');

/**
 * @constructor
 */
xiv.utils.objectAnalyzer = {};
goog.exportSymbol('xiv.utils.objectAnalyzer', xiv.utils.objectAnalyzer);



/** 
 * @param {Object}
 * @private
 */
xiv.utils.objectAnalyzer.tallyMethods_ = function(obj) {

    var result = [];
    for (var id in obj) {
	try {
	    //
	    // Non-prototype properties
	    //
	    
	    //window.console.log(id, obj[id]);
	    if (id == 'constructor'){
		//window.console.log(obj[id]);
	    }

	    if (!goog.string.caseInsensitiveEndsWith(id, '_')){
		result.push(id)   
	    }
	    if (typeof(obj[id]) == "function") {
		//result.push(id);
	    }
	} catch (err) {
	    result.push(id + ": inaccessible");
	}
    }
    return result;
}




/**
 * @param {!Object}
 * @param {objName}
 * @private
 */
xiv.utils.objectAnalyzer.printMethods_ = function (obj, objName) {

    var skippables = [
	'CSS_CLASS_PREFIX',
	'CSS',
	'ELEMENT_CLASS',
	'constructor',
	'base'
    ]

    var methodExporter = function(obj, objName) {

	var allMethods = '';
	var publicMethods = xiv.utils.objectAnalyzer.tallyMethods_(obj);
	goog.array.forEach(publicMethods, function(pMethod){
            pMethod = objName + '.' + pMethod;

            //
            // Check for skippables here
            //
            var skip = false;
            goog.array.forEach(skippables, function(skippable){
		if (goog.string.endsWith(pMethod, skippable)){
                    skip = true;
		}
            })
            if (skip) { return }

            exportString = 'goog.exportSymbol(\'' + 
		pMethod + '\', ' +  pMethod + ');'

            if (exportString.length > 78){
		exportString = exportString.split(', ');
		exportString = exportString[0] + ',\n\t' + exportString[1];
            }
            allMethods += exportString + '\n';
	})
	return allMethods;
    }


    var allPublicMethods = '';   


    //
    // Constructor methods
    //
    allPublicMethods += methodExporter(obj, objName);


    //
    // Prototype methods
    //
    allPublicMethods += methodExporter(obj.prototype, objName + '.prototype');


    return allPublicMethods;
}



/**
 * @param {!Object}
 * @public
 */
xiv.utils.objectAnalyzer.outputExportables = function(obj){
    for (var key in obj){
	var val = obj[key];
	window.console.log(key.toUpperCase());
	window.console.log(xiv.utils.objectAnalyzer.printMethods_(val, key));
	window.console.log('\n\n');
    }
};


goog.exportSymbol('xiv.utils.objectAnalyzer.outputExportables', 
		  xiv.utils.objectAnalyzer.outputExportables);



