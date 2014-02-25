/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */



/**
 * Splits the 'url' argument into various XNAT level folders.
 * @param {!string} url The URL to derive the path object from.
 * @constructor
 * @dict
 */
goog.provide('utils.xnat.Path');
utils.xnat.Path = function(url){
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
goog.exportSymbol('utils.xnat.Path', utils.xnat.Path);



/**
 * Deconstructs the URL into its various components.
 * @param {!utils.xnat.Path} the pa.
 * @param {!string} url The URL to derive the path information from.
 * @private
 */
utils.xnat.Path.prototype.deconstructUrl_ = function(url) {
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
		this['prefix'] += splitter[j] + "/";
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
 * utils.xnat.Path class to split the uri into it's various level components.  
 * From then, it builds the return string.
 * @param {!string} level The xnat level to split from.
 * @return {string} The XNAT path by level.
 * @public
 */
utils.xnat.Path.prototype.pathByLevel = function(level){
    if (this[level]) {
	var returnString = /** @type {!string}*/ this['prefix'];
	
	if (this['projects']){
	    returnString += "projects/" + this['projects'];
	}

	if (this['subjects']){
	    returnString += "/subjects/" + this['subjects'];
	}

	if (this['experiments']){
	    returnString += "/experiments/" + this['experiments'];
	}

	if (this['scans']){
	    returnString += "scans/" + this['scans'];
	}
	else if (this['resources']){
	    returnString += "resources/" + this['resources'];
	}

	if (this['files']){
	    returnString += "/files/" + this['files'];
	}

	return returnString;
    }
    else {
	throw new Error("utils.xnat - getXnatPathByLevel: No folder " + 
			"specified at the '" + level + "' level.")
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
utils.xnat.Path.graftUrl = function(prefixUrl, suffixUrl, graftSubString){
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
utils.xnat.Path.getQueryPrefix = function(xnatServerRoot) {
    var xnatQueryPrefix = /**@type {!string}*/xnatServerRoot + '/REST';
    if (xnatQueryPrefix.length > 0 && 
        xnatQueryPrefix[xnatQueryPrefix.length - 1] === '/') {
	xnatQueryPrefix = xnatQueryPrefix.substring(0, 
            xnatQueryPrefix.length - 1);
    }
    return xnatQueryPrefix;
}
