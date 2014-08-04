 /**
 * @preserve Copyright 2014 Washington University
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */
goog.provide('gxnat');

// goog
goog.require('goog.net.XhrIo');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.array');



/**
 * gxnat is the class that handles communication with the XNAT 
 * server, leveraging google closure tools.  
 * It uses RESTful calls to acquire JSON objects that are
 * parsed to construct Thumbnails, which contain information regarding
 * image sets that can be loaded into a ViewBox.  xnat makes use of 
 * several Google Closure libraries to communicate with the XNAT server, 
 * especially goog.net.XhrIo.
 *
 */
gxnat = function(){}
goog.exportSymbol('gxnat', gxnat);



/**
 * @type {!string}
 * @const
 * @expose
 */
gxnat.JPEG_CONVERT_SUFFIX = '?format=image/jpeg';




/**
 * XNAT folder abbreviations.
 * @type {!Object.<!string, !string>}
 * @const
 * @public
 */
gxnat.folderAbbrev = {
    'projects': 'proj',
    'subjects': 'subj',
    'experiments': 'expt',
    'scans': 'scans'
};



/**
 * @const
 */
gxnat.ZIP_SUFFIX = '?format=zip'




/**
 * Queries a server for a JSON formatted object for processing in the 
 * 'callback' argument.  Utilizes the Google closure library 'XhrIo' to 
 * handle communication with the XNAT server.
 * @param {!string} url The XNAT url to run the operation on.
 * @param {!function} callback The callback to send the results to.
 * @param {string=} opt_suffix The optional suffix to add.
 * @public
 */
gxnat.jsonGet = function(url, callback, opt_suffix){
    var queryChar = (url.indexOf('?') > -1) ? '&' : '?';
    var queryUrl = url + queryChar + "format=json";
    if (goog.isDefAndNotNull(opt_suffix)){
	
	if (opt_suffix[0] !== '&') {
	    opt_suffix = '&' + opt_suffix;
	}
	queryUrl += opt_suffix;
    }
    //window.console.log('Getting XNAT json: \'' +  queryUrl + '\'');
    gxnat.get(queryUrl, callback, 'json');
}




/**
 * Queries a server using a generic 'GET' call. Sends the response object into 
 * the 'callback' argument.
 * @param {!string} url The URL to run GET on.
 * @param {!function} callback The callback once GET communication is 
 *     established.  Callback should have a parameter for the recieved xhr.
 * @param {string=} opt_getType The type of get to apply (i.e. 'json').  
 *     If none, xhr is sent to the callback.  If 'json', xhr.getResponseJson()
 *     is sent into the callback.
 * @public
 */
gxnat.get = function(url, callback, opt_getType){
    //window.console.log("\n\nxnat - get: ", url);
    goog.net.XhrIo.send(url, function(e) {
	var xhr = e.target;

	switch (opt_getType) {
	case undefined: 
	    callback(xhr);
	case 'json':
	    var responseJson = xhr.getResponseJson();
	    if (responseJson.hasOwnProperty('ResultSet')){
		callback(responseJson['ResultSet']['Result']);
	    } else {
		callback(responseJson);
	    }
	    break;
	case 'text':
	    callback(xhr.getResponseText());
	    break;
	}

	
    });
}








/**
* source: https://github.com/overset/javascript-natural-sort/blob/master/naturalSort.js
*/
gxnat.naturalSort = function(a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return gxnat.naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}






/**
 * Sorts the viewable collection, which is an array of XNAT derived JSONS
 * customized (added to) for the purposes of the Image viewer.
 * @param {!Array.<gxnat.vis.AjaxViewableTree>} viewables The array of 
 *     gxnat.vis.AjaxViewableTree to sort. 
 * @param {!Array.<String>} keyDepthArr The key depth array indicating the 
 *     sorting criteria.
 * @public
 */
gxnat.sortXnatPropertiesArray = function (viewables, keyDepthArr){

    var sorterKeys = [];
    var sorterObj =  {};
    var sortedViewableCollection = [];
    var sorterKey = {};

    //
    // Update sorting data types.
    //
    goog.array.forEach(viewables, function(viewable){
	sorterKey = viewable;
	goog.array.forEach(keyDepthArr, function(key){
	    sorterKey = sorterKey[key];
	})
	sorterKey = sorterKey.toLowerCase();
	sorterKeys.push(sorterKey);
	sorterObj[sorterKey] = viewable;
    })

    //
    // Natural sort sorterKeys.
    //
    sorterKeys = sorterKeys.sort(gxnat.naturalCompare);
    //goog.array.sort(sorterKeys);


    //
    // Construct and return the sorted collection.
    //
    goog.array.forEach(sorterKeys, function(sorterKey){
	sortedViewableCollection.push(sorterObj[sorterKey]);
    })
    return sortedViewableCollection;
}



goog.exportSymbol('gxnat.JPEG_CONVERT_SUFFIX', gxnat.JPEG_CONVERT_SUFFIX);
goog.exportSymbol('gxnat.folderAbbrev', gxnat.folderAbbrev);
goog.exportSymbol('gxnat.ZIP_SUFFIX', gxnat.ZIP_SUFFIX);
goog.exportSymbol('gxnat.jsonGet', gxnat.jsonGet);
goog.exportSymbol('gxnat.get', gxnat.get);
goog.exportSymbol('gxnat.naturalSort', gxnat.naturalSort);
goog.exportSymbol('gxnat.sortXnatPropertiesArray',
	gxnat.sortXnatPropertiesArray);
