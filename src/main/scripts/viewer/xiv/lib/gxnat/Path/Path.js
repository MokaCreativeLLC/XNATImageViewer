/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */



/**
 * Splits the 'url' argument into various XNAT level folders.
 * @param {!string} url The URL to derive the path object from.
 * @constructor
 * @dict
 */
goog.provide('gxnat.Path');
gxnat.Path = function(url){
    //window.console.log(url);
    this['originalUrl'] = url;
    this['prefix'] =  null;
    this['projects'] = null;
    this['subjects'] = null;
    this['experiments'] = null;
    this['scans'] = null;
    this['resources'] = null;
    this['files'] = null;

    this.deconstructUrl_(url);
}
goog.exportSymbol('gxnat.Path', gxnat.Path);



/**
 * XNAT folder abbreviations.
 * @type {!Array.string}
 * @const
 * @public
 */
gxnat.Path.xnatLevelOrder = [
    'projects',
    'subjects',
    'experiments',
    ['scans', 'resources'],
    'files'
]



/**
 * Deconstructs the URL into its various components.
 * @param {!gxnat.Path} the pa.
 * @param {!string} url The URL to derive the path information from.
 * @private
 */
gxnat.Path.prototype.deconstructUrl_ = function(url) {
    var splitter = /** @type {!string}*/ url.split('/');
    var levelHasValue = /** @type {!boolean}*/ true;
    var i = /** @type {!number}*/ 0;
    var j = /** @type {!number}*/ 0;
    var len = /** @type {!number}*/ splitter.length;

    for (i=0; i<len; i++) {
	// Stay within the loop only if the XNAT level has
	// a value associated with it (i.e. a next position in the array)
	levelHasValue = (this.hasOwnProperty(splitter[i]) && splitter[i+1]);
	if (!levelHasValue) continue

	// The 'prefix' string -- usually the server name
	// and the 'data/archive/' or 'xnat/' prefix. 
	if (splitter[i] === 'projects' &&  i !== 0){
	    this['prefix'] = '';
	    for (j=0; j < i; j++){
		this['prefix'] += splitter[j] 
		this['prefix'] = (j < i-1) ? 
		    this['prefix'] + '/': this['prefix'];
	    }
	}

	// Construct key-value pair.  Key is the XNAT level
	// value is the folder.
	this[splitter[i]] = splitter[i+1];
	i++;
    }
}




/**
 * Constructs an XNAT Uri stopping at the desired 'level'. Creates a 
 * gxnat.Path class to split the uri into it's various level components.  
 * From then, it builds the return string.
 * @param {!string} level The xnat level to split from.
 * @return {string} The XNAT path by level.
 * @public
 */
gxnat.Path.prototype.pathByLevel = function(level){
    //window.console.log("XNAT LEVEL", level);
    if (!this.hasOwnProperty(level)){
	throw new Error("Invalid level: ", level);
    }
    
    var returnString = /** @type {!string}*/ this['prefix'];
    var currLevel = /** @type {!string}*/ '';
    var currSub = /** @type {!string}*/ '';
    var i = /**@type {!number}*/ 0;
    var j = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ gxnat.Path.xnatLevelOrder.length;
    var len2 = /**@type {!number}*/ 0;

    for (i=0; i<len; i++){
	currLevel = gxnat.Path.xnatLevelOrder[i];
	if (goog.isArray(currLevel)){
	    len2 = currLevel.length;
	    for (j=0; j<len2; j++){
		currSubLevel = currLevel[i][j];
		if (this[currSubLevel]){
		    returnString += currSubLevel + '/' + this[currSubLevel];
		}
	    }
	} else {
	    returnString += '/' + currLevel + '/' + this[currLevel];
	}
	if (level === currLevel || currLevel.indexOf(level) > -1){
	    return returnString;
	}	
    }
}



/**
 * Grafts two urls together at the 'graftSubString' argument.
 * @param {!string} prefixUrl The prefix url.
 * @param {!string} suffixUrl The suffix url.
 * @param {!string} graftSubString The string to graft at.
 * @return {!string} The grafted URL.
 * @public
 */
gxnat.Path.graftUrl = function(prefixUrl, suffixUrl, graftSubString){
    if (prefixUrl.indexOf(graftSubString) == -1){
	throw new Error('Graft folder', graftSubString, 'not in prefix:', 
			prefixUrl)
    }
    if (prefixUrl.indexOf(graftSubString) == -1){
	throw new Error('Graft folder', graftSubString, 'not in suffix:', 
			suffixUrl)
    }
    return prefixUrl.split(graftSubString + '/')[0] + graftSubString + 
	suffixUrl.split(graftSubString)[1];
}



/**
 * Returns a query prefix for a given server root (i.e. 'REST' or 'XNAT').
 * @param {!string} xnatServerRoot The server root to derive the query prefix
 *    from.
 * @return {!string} The query prefix.
 * @public
 */
gxnat.Path.getQueryPrefix = function(xnatServerRoot) {
    var xnatQueryPrefix = /**@type {!string}*/xnatServerRoot + '/REST';
    if (xnatQueryPrefix.length > 0 && 
        xnatQueryPrefix[xnatQueryPrefix.length - 1] === '/') {
	xnatQueryPrefix = xnatQueryPrefix.substring(0, 
            xnatQueryPrefix.length - 1);
    }
    return xnatQueryPrefix;
}


/**
 * Loops through gxnat.Path.xnatLevelOrder and runs a callback.
 * @param {!function} callback The callback to run on each level.
 * @public
 */
gxnat.Path.forEachXnatLevel = function(callback){
    var i = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ gxnat.Path.xnatLevelOrder.length;
    for (i=0; i < len; i++){
	callback(gxnat.Path.xnatLevelOrder[i], i);
    }
}



/**
 * Returns the shared xnat level between two uris.
 * @param {!string} uri1 The first uri to compare.
 * @param {!string} uri2 The second uri to compare.
 * @return {string} The deepest shared xnat level
 * @public
 */
gxnat.Path.getDeepestSharedXnatLevel = function(uri1, uri2){
    var path1 = /**@type {!gxnat.Path}*/ new gxnat.Path(uri1);
    var path2 = /**@type {!gxnat.Path}*/ new gxnat.Path(uri2);
    var sharedLevel = /**@type {sting} */ undefined;

    //window.console.log(path1, path2);
    gxnat.Path.forEachXnatLevel(function(level){
	//window.console.log(path1[level], path2[level], 
	//		   path1[level] === path2[level])
	if (path1[level] && (path1[level] === path2[level])){
	    sharedLevel = level;
	}
	//window.console.log(sharedLevel);
    })

    return sharedLevel;
}
