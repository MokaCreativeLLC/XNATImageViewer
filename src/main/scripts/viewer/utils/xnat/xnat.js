/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.net.XhrIo');
goog.require('goog.object');

// utils
goog.require('utils.dom');
goog.require('utils.array');
goog.require('utils.xnat.Path');
goog.require('utils.xnat.Viewable');
goog.require('utils.xnat.Viewable.Scan');
goog.require('utils.xnat.Viewable.Slicer');




/**
 * utils.xnat is the class that handles communication with the XNAT 
 * server.  It uses RESTful calls to acquire JSON objects that are
 * parsed to construct Thumbnails, which contain information regarding
 * image sets that can be loaded into a ViewBox.  utils.xnat makes use of 
 * several Google Closure libraries to communicate with the XNAT server, 
 * especially goog.net.XhrIo.
 *
 */
goog.provide('utils.xnat');
utils.xnat = function(){}
goog.exportSymbol('utils.xnat', utils.xnat);



/**
 * @type {!string}
 * @const
 * @expose
 */
utils.xnat.JPEG_CONVERT_SUFFIX = '?format=image/jpeg';




/**
 * XNAT folder abbreviations.
 * @type {!Object.<!string, !string>}
 * @const
 * @public
 */
utils.xnat.folderAbbrev = {
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
utils.xnat.jsonGet = function(url, callback){
    var queryChar =  /** @type {!string}*/ (url.indexOf('?') > -1) ? '&' : '?';
    var queryUrl = /** @type {!string}*/ url + queryChar + "format=json";
    //window.console.log("\n\nutils.xnat - jsonGet: ", queryUrl);
    utils.xnat.get(queryUrl, callback, 'json');
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
utils.xnat.get = function(url, callback, opt_getType){
    //window.console.log("\n\nutils.xnat - get: ", url);
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
utils.xnat.getViewables = function (url, opt_runCallback, opt_doneCallback){
    utils.xnat.VIEWABLE_TYPES = {
	'Scan': utils.xnat.Viewable.Scan,
	'Slicer': utils.xnat.Viewable.Slicer,
    }

    var typeCount = /**@type {!number}*/
	goog.object.getCount(utils.xnat.VIEWABLE_TYPES);
    var typesGotten = /**@type {!number}*/ 0;

    goog.object.forEach(utils.xnat.VIEWABLE_TYPES, function(vType){
      utils.xnat.Viewable.getViewables(url, vType, opt_runCallback, function(){
	 typesGotten++;
	 if ((typesGotten === typeCount) && opt_doneCallback) { 
	     opt_doneCallback(); 
	 }
      })
    });
}

