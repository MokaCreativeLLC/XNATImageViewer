/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.net.XhrIo');
goog.require('goog.object');

// gxnat
goog.require('gxnat.Path');
goog.require('gxnat.Viewable');
goog.require('gxnat.Scan');
goog.require('gxnat.Slicer');




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
goog.provide('gxnat');
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
 * Queries a server for a JSON formatted object for processing in the 
 * 'callback' argument.  Utilizes the Google closure library 'XhrIo' to 
 * handle communication with the XNAT server.
 * @param {!string} url The XNAT url to run the operation on.
 * @param {!function} callback The callback to send the results to.
 * @public
 */
gxnat.jsonGet = function(url, callback){
    var queryChar =  /** @type {!string}*/ (url.indexOf('?') > -1) ? '&' : '?';
    var queryUrl = /** @type {!string}*/ url + queryChar + "format=json";
    //window.console.log("\n\nxnat - jsonGet: ", queryUrl);
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
	var xhr = /** @type {!Object}*/ e.target;
	switch (opt_getType) {
	case undefined: 
	    callback(xhr);
	case 'json':
	    var responseJson = /**@type {!Object}*/ xhr.getResponseJson();
	    if (responseJson.hasOwnProperty('ResultSet')){
		callback(responseJson['ResultSet']['Result']);
	    } else {
		callback(responseJson);
	    }
	}
    });
}



/**
 * Retrieves viewables, one-by-one, for manipulation in the opt_runCallback
 * argument, and when complete the opt_doneCallback.
 * @param {!string} url The url to retrieve the viewables from.
 * @param {function=} opt_runCallback The optional callback applied to each 
 *     viewable.
 * @param {function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 */
gxnat.getViewables = function (url, opt_runCallback, opt_doneCallback){
    gxnat.VIEWABLE_TYPES = {
	'Scan': gxnat.Scan,
	'Slicer': gxnat.Slicer,
    }

    var typeCount = /**@type {!number}*/
	goog.object.getCount(gxnat.VIEWABLE_TYPES);
    var typesGotten = /**@type {!number}*/ 0;

    goog.object.forEach(gxnat.VIEWABLE_TYPES, function(vType){
      gxnat.Viewable.getViewables(url, vType, opt_runCallback, function(){
	 typesGotten++;
	  if (typesGotten === typeCount){
	      window.console.log("DONE!");
	      if (opt_doneCallback) { 
		  
		  opt_doneCallback(); 
	      }
	 }
      })
    });
}




/**
 * Utility class that uses a natural comparision method (for strings
 * with numbers in them).
 * From: http://my.opera.com/GreyWyvern/blog/show.dml/1671288
 * Usage: 
 * // An alpha sorted sorted key set. 
 * alphaSortedKeys = ['a1','a100','a11']
 * var nautralSortedKeys = alphaSortedKeys.sort(gnxat.naturalCompare);
 * // naturalSortedKeys output:
 * // ['a1', 'a11', 'a100']
 * @param {!string} a The first compare string.
 * @param {!string} b The second compare string.
 * @return {!number} The comparison length for sorting.
 * @public
 */
gxnat.naturalCompare = function (a, b) {
    function chunkify(t) {
	var tz = /**@type {!Array.number}*/ []; 
	var x = /**@type {!number}*/ 0; 
	var y =/**@type {!number}*/ -1; 
	var n = /**@type {!number}*/ 0; 
	var /**@type {number}*/ i;
	var /**@type {number}*/ j;
	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
	    var m = /**@type {!number}*/ (i == 46 || (i >=48 && i <= 57));
	    if (m !== n) {
		tz[++y] = "";
		n = m;
	    }
	    tz[y] += j;
	}
	return tz;
    }
    var aa = /**@type {!Array.number}*/ chunkify(a);
    var bb = /**@type {!Array.number}*/ chunkify(b);
    for (x = 0; aa[x] && bb[x]; x++) {
	if (aa[x] !== bb[x]) {
	    var c = /**@type {!number}*/ Number(aa[x]), d = Number(bb[x]);
	    if (c == aa[x] && d == bb[x]) {
		return c - d;
	    } else return (aa[x] > bb[x]) ? 1 : -1;
	}
    }
  return aa.length - bb.length;
}
