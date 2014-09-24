goog.provide('xiv.utils.ObjectAnalyzer');

/**
 * @constructor
 */
xiv.utils.ObjectAnalyzer = {};
goog.exportSymbol('xiv.utils.ObjectAnalyzer', xiv.utils.ObjectAnalyzer);



/** 
 * @param {Object}
 * @private
 */
xiv.utils.ObjectAnalyzer.tallyMethods_ = function(obj) {

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
xiv.utils.ObjectAnalyzer.printMethods_ = function (obj, objName) {

    var skippables = [
	'CSS_CLASS_PREFIX',
	'CSS',
	'ELEMENT_CLASS',
	'constructor',
	'base'
    ]

    var methodExporter = function(obj, objName) {

	var allMethods = '';
	var publicMethods = xiv.utils.ObjectAnalyzer.tallyMethods_(obj);
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
 * @return {!string}
 * @public
 */
xiv.utils.ObjectAnalyzer.outputExportables = function(obj){
    var str = '';
    var val, str1, str2, str3;
    for (var key in obj){
	val = obj[key];
	str1 = key.toUpperCase()
	str2 = xiv.utils.ObjectAnalyzer.printMethods_(val, key)
	str+= str1 + "\n" + str2 + "\n\b";
    }
    return str
};


goog.exportSymbol('xiv.utils.ObjectAnalyzer.outputExportables', 
		  xiv.utils.ObjectAnalyzer.outputExportables);



