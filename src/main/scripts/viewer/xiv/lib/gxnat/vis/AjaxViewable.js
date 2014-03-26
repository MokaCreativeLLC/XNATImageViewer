/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('goog.array');

// gxnat
goog.require('gxnat.Path');
goog.require('gxnat.vis.ViewableSet');



/**
 * Class that contains a variety of string-based properties for viewable objects
 * stored on an XNAT server.  A 'Viewable' could be a set of images, Slicer mrb,
 * etc.
 * @constructor
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @extends {goog.vis.ViewableSet}
 */
goog.provide('gxnat.vis.AjaxViewable');
gxnat.vis.AjaxViewable = 
function(experimentUrl, viewableJson, opt_initComplete) {
    goog.base(this);


    /**
     * @type {!string}
     * @protected
     */
    this.experimentUrl = experimentUrl;


    /**
     * @type {!Object<string, string>}
     * @protected
     */
    this.json = viewableJson;


    /**
     * @type {!string} 
     * @protected
     */    
    this.queryUrl = gxnat.Path.graftUrl(this.experimentUrl, this.json['URI'], 
					'experiments');
    
    /**
     * @type {!string} 
     * @protected
     */
    this.Path = /** @type {!gxnat.Path} */ new gxnat.Path(this.queryUrl);


    //
    // File get query
    //
    this.getFiles(function(){
	//window.console.log("FILES GOT...NOW GETTING THUMBNAIL IMAGE");
	this.getThumbnailImage(function(){
	    if (opt_initComplete){
		//window.console.log("THUMBNAIL GOT", this['thumbnailUrl']);
		opt_initComplete(this)
	    }
	}.bind(this));;
    }.bind(this));    
}
goog.inherits(gxnat.vis.AjaxViewable, gxnat.vis.ViewableSet);
goog.exportSymbol('gxnat.vis.AjaxViewable', gxnat.vis.AjaxViewable);



/**
 * @return {!string}
 */
gxnat.vis.AjaxViewable.prototype.getExperimentUrl = function() {
    return this.experimentUrl;
}


/**
 * @return {!string}
 */
gxnat.vis.AjaxViewable.prototype.getQueryUrl = function() {
    return this.queryUrl;
}



/**
 * @return {!string}
 */
gxnat.vis.AjaxViewable.prototype.getFolderQuerySuffix = function() {
    return this.folderQuerySuffix;
}


/**
 * @public
 */
gxnat.vis.AjaxViewable.prototype.makeFileUrl = function(xnatFileJson) {
    var fileName = /** @type {!string} */
    xnatFileJson[this.fileContentsKey];
    if (!goog.string.endsWith(fileName, '/')) {
	return this.queryUrl + '!' + fileName;
    }
  				    
}

 


/**
 * Loops through the contents of a given XNAT folder url and acquires the 
 * viewables contained within it, applying 'callback' whenever a viewable is
 * acquired.
 *
 * @param {!string} viewableFolderUrl The url of the viewable folders.
 * @param {!function} runCallback The callback to apply.
 * @param {function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 * @public
 */
gxnat.vis.AjaxViewable.loopFolderContents = 
function(viewableFolderUrl, runCallback, opt_doneCallback) {
    gxnat.jsonGet(viewableFolderUrl, function(viewablesJson){
	//window.console.log(viewablesJson);
	goog.array.forEach(viewablesJson, function(viewable){
	    //window.console.log("VIEWABLE:", viewable);
	    runCallback(viewable)
	})
	if (opt_doneCallback){
	    //window.console.log("done callback", opt_doneCallback);
	    opt_doneCallback();
	}
    })
}



/** 
 * Queries for the files associated with the viewable. This is critical because
 * the paths returned in the json may not always be the necessary 
 * query paths, for instance, in the circumstance of retreiving file contents.
 *
 * @param {function=} opt_callback The callback to apply afterwards.
 * @public
 */
gxnat.vis.AjaxViewable.prototype.getFiles = function(opt_callback){

    //window.console.log("GET FILES", this);
    var fileQueryUrl = /** @type {!string} */ 
    this.queryUrl + this.fileQuerySuffix;
    var absoluteUrl = /** @type {!string} */ '';    
    var i = /** @type {!number} */ 0;
    var len = /** @type {!number} */ 0;
    var fileUrl = /** @type {!string} */ '';

    window.console.log(this, fileQueryUrl);
    gxnat.jsonGet(fileQueryUrl, function(fileUrls){
	//window.console.log(fileUrls);
	for (i=0, len = fileUrls.length; i < len; i++) {
	    fileUrl = this.makeFileUrl(fileUrls[i]);
	    //window.console.log("ABSOLUTE URL:", fileUrls[i], fileUrl); 
	    if (fileUrl) { 
		//window.console.log(fileUrl);
		this.addFiles(fileUrl);
	    };
	}
	if (opt_callback){
	    opt_callback()

	}
    }.bind(this))
}







/**
 * Static function to generate viewables based on a given XNAT url.  All of
 * the viewables that are generated are subclasses of gxnat.vis.AjaxViewable.
 * @param {!string} url
 * @param {!gxnat.vis.AjaxViewable} anonViewable
 * @param {function=} opt_runCallback The optional callback applied to each 
 *     viewable.
 * @param {function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 * @public
 */
gxnat.vis.AjaxViewable.getViewables = 
function(url, anonViewable, opt_runCallback, opt_doneCallback) {
    
    var pathObj = /** @type {!gxnat.Path} */ new gxnat.Path(url);
    var queryFolder = /** @type {!string} */ 
    url + '/' + anonViewable.prototype.getFolderQuerySuffix();
    var viewable = /** @type {?gxnat.vis.ViewableSet} */ null;

    //window.console.log('url:', url, '\nqueryFolder:', queryFolder);
    gxnat.vis.AjaxViewable.loopFolderContents(queryFolder, function(json){
	//window.console.log(json, pathObj);
	viewable = new anonViewable(pathObj.pathByLevel('experiments'), 
				    json, opt_runCallback)
	window.console.log(viewable);
	// sort list (shared, with custom parameters)
	window.console.log("need to sort the viewable list");
    }, opt_doneCallback)
}
