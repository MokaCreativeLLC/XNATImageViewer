/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.net.XhrIo');
goog.require('goog.dom.xml');
goog.require('goog.array');
goog.require('goog.object');

// utils
goog.require('utils.dom');
goog.require('utils.array');
goog.require('utils.xnat.Viewable');
goog.require('utils.xnat.Viewable.Scan');
goog.require('utils.xnat.Viewable.Slicer');




/**
 * utils.xnat is the class that handles communication with the XNAT 
 * server.  It uses RESTful calls to acquire JSON objects that are
 * parsed to construct Thumbnails, which contain information regarding
 * image sets that can be loaded into a ViewBox.  utils.xnat makes use of 
 * several Google Closure libraries to communicate with the XNAT server, 
 * especially goog.net.XhrIo and goog.dom.xml.
 *
 */
goog.provide('utils.xnat');
utils.xnat = function(){}
goog.exportSymbol('utils.xnat', utils.xnat);


/**
 * @const {string}
 * @public
 */
utils.xnat.JPEG_CONVERT_SUFFIX = '?format=image/jpeg';





/**
 * XNAT folder abbreviations.
 * @const {Object.<string, string>}
 * @public
 */
utils.xnat.folderAbbrev = {
    'projects': 'proj',
    'subjects': 'subj',
    'experiments': 'expt',
    'scans': 'scans'
};




/**
 * Queries a server for a JSON formatted object
 * for processing in the 'callback' argument.  Utilizes the
 * Google closure library 'XhrIo' to handle communication with
 * the XNAT server.
 *
 * @param {!string} url The XNAT url to run the operation on.
 * @param {!function} callback The callback to send the results to.
 */
utils.xnat.jsonGet = function(url, callback){
    //window.console.log("utils.xnat - jsonGet: ", url);

    /**
     * @type {!string}
     */
    var queryChar =  (url.indexOf('?') > -1) ? '&' : '?';

    /**
     * @type {!string}
     */
    var queryUrl = url + queryChar + "format=json";

    goog.net.XhrIo.send(queryUrl, function(e) {
	var xhr = e.target;
	var obj = xhr.getResponseJson();
	callback(obj['ResultSet']['Result'])
    });
}




/**
 * Queries a server using a generic 'GET' call. 
 * Sends the response object into the 'callback'
 * argument.
 *
 * @param {!string, !function}
 * @public
 */
utils.xnat.get = function(url, callback){
    //window.console.log("utils.xnat - get: ", url);
    goog.net.XhrIo.send(url, function(e) {
	var xhr = e.target;
	var obj = xhr;
	callback(obj)
    });
}




/**
 * Splits a url at the 'splitString' argument, then
 * returns an object with the split result.  If it cannot be
 * split, returns the entire url and the string.
 *
 * @param {!string} url
 * @param {!string} splitString
 * @return {Object.<string,string>}
 * @public
 */
utils.xnat.splitUrl = function(url, splitString){

    //------------------
    // Split the string accordingly.
    //------------------
    var splitInd = url.indexOf(splitString);
    if (splitInd > -1) {
	return {
	    'before': url.substring(0, splitInd), 
	    'splitter': splitString, 
	    'after': url.substring(splitInd + splitString.length, url.length)
	}



    //------------------
    // Otherwise return the entire url and splitString.
    //------------------
    } else {
	return {
	    'before': url, 
	    'splitter': splitString, 
	}    
    }
}




/**
 * Constructs an XNAT Uri stopping at the desired 'level'.
 * Calls on the internal 'getPathObject' method to split
 * the uri into it's various level components.  From then, it builds
 * the return string.
 *
 * @param {!string} url 
 * @param {!string} level
 * @return {string}
 * @public
 */
utils.xnat.getXnatPathByLevel = function(url, level){
    
    //------------------
    // Splits the url into its various level components.
    //------------------
    var pathObj = utils.xnat.getPathObject(url)



    //------------------
    // Construct the new URL, stopping at the given 'level'
    //------------------
    if (pathObj[level]) {
	var returnString = pathObj['prefix'];
	
	if (pathObj['projects']){
	    returnString += "projects/" + pathObj['projects'];
	}

	if (pathObj['subjects']){
	    returnString += "/subjects/" + pathObj['subjects'];
	}

	if (pathObj['experiments']){
	    returnString += "/experiments/" + pathObj['experiments'];
	}

	if (pathObj['scans']){
	    returnString += "scans/" + pathObj['scans'];
	}
	else if (pathObj['resources']){
	    returnString += "resources/" + pathObj['resources'];
	}

	if (pathObj['files']){
	    returnString += "/files/" + pathObj['files'];
	}

	return returnString;
    }
    else {
	throw new Error("utils.xnat - getXnatPathByLevel: No folder " + 
			"specified at the '" + level + "' level.")
    }
}



/**
 * @dict
 * @const
 * @public
 */
utils.xnat.defaultPathObj =  {
    'prefix': null,
    'projects':null,
    'subjects':null,
    'experiments':null,
    'scans':null,
    'resources':null,
    'files':null,
}




/**
 * Split's the 'url' argument into various XNAT level
 * folders.
 *
 * @param {!string} url The URL to derive the path object from.
 * @return {!Object<string, string>} The derived  
 */
utils.xnat.getPathObject = function(url){
    window.console.log(url);
    var pathObj = goog.object.clone(utils.xnat.defaultPathObj);
    var splitter = url.split('/');
    var levelHasValue = true;
    var i = 0;
    var j = 0;

    for (i=0, len = splitter.length; i<len; i++){

	//
	// Stay within the loop only if the XNAT level has
	// a value associated with it (i.e. a next position in the array)
	//
	levelHasValue = (pathObj.hasOwnProperty(splitter[i]) && 
			 splitter[i+1]);
	if (!levelHasValue) continue

	    
	//
	// The 'prefix' string -- usually the server name
	// and the 'data/archive/' or 'xnat/' prefix. 
	//
	if (splitter[i] === 'projects' &&  i !== 0){
	    pathObj['prefix'] = '';
	    for (j=0; j < i; j++){
		pathObj['prefix'] += splitter[j] + "/";
	    }
	}
	
	
	//
	// Construct key-value pair.  Key is the XNAT level
	// value is the folder.
	//
	pathObj[splitter[i]] = splitter[i+1];
	i++;
    }

    return pathObj;
}




utils.xnat.graftUrl = function(prefixUrl, suffixUrl, graftPoint){
    if (prefixUrl.indexOf(graftPoint) == -1){
	throw new Error('Graft folder', graftPoint, 'not in prefix:', prefixUrl)
    }
    if (prefixUrl.indexOf(graftPoint) == -1){
	throw new Error('Graft folder', graftPoint, 'not in suffix:', suffixUrl)
    }
    return prefixUrl.split(graftPoint + '/')[0] + graftPoint + 
	suffixUrl.split(graftPoint)[1];
}



/**
 * Retrieves viewables, one-by-one, for manipulation in the opt_callback
 * argument.
 * @param {!string} url The url to retrieve the viewables from.
 * @param {function=} opt_callback The optional callback applied to each 
 *     viewable.
 */
utils.xnat.getViewables = function (url, opt_callback){
    utils.xnat.VIEWABLE_TYPES = {
	'Scan': utils.xnat.Viewable.Scan,
	'Slicer': utils.xnat.Viewable.Slicer,
    }
    for (var viewableType in utils.xnat.VIEWABLE_TYPES){
	utils.xnat.Viewable.getViewables(url, 
		utils.xnat.VIEWABLE_TYPES[viewableType], opt_callback)
    }
}




/**
* @param {!string} xnatServerRoot
* @return {!string} The query prefix.
* @public
*/
utils.xnat.getQueryPrefix = function(xnatServerRoot) {
    //
    // The query prefix
    //
    var xnatQueryPrefix = xnatServerRoot + '/REST';
    if (xnatQueryPrefix.length > 0 && 
        xnatQueryPrefix[xnatQueryPrefix.length - 1] === '/') {
	xnatQueryPrefix = xnatQueryPrefix.substring(0, 
            xnatQueryPrefix.length - 1);
    }
    return xnatQueryPrefix;
}
