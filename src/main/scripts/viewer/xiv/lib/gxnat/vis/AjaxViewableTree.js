/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('goog.array');
goog.require('goog.string');

// gxnat
goog.require('gxnat.Path');
goog.require('gxnat.vis.ViewableTree');



/**
 * Sub-class of ViewableTree that gets its properties through Ajax methods,
 * necessitating for callback management.
 *
 * @constructor
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @extends {goog.vis.ViewableTree}
 */
goog.provide('gxnat.vis.AjaxViewableTree');
gxnat.vis.AjaxViewableTree = 
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
goog.inherits(gxnat.vis.AjaxViewableTree, gxnat.vis.ViewableTree);
goog.exportSymbol('gxnat.vis.AjaxViewableTree', gxnat.vis.AjaxViewableTree);



/**
 * @return {!string}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getExperimentUrl = function() {
    return this.experimentUrl;
}


/**
 * Returns the URL necessary for querying the given ViewableTree.
 *
 * @return {!string}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getQueryUrl = function() {
    return this.queryUrl;
}



/**
 * Sub-class to define the property returned here.
 * 
 * @return {!string}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getFolderQuerySuffix = function() {
    return this.folderQuerySuffix;
}


/**
 * Makes the file URL relative to the XNAT server for querying later.
 * 
 * @param {!string} xnatFileJson 
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.makeFileUrl = function(xnatFileJson) {
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
 * @param {!Function} runCallback The callback to apply.
 * @param {Function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 * @public
 */
gxnat.vis.AjaxViewableTree.loopFolderContents = 
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
 * Queries for the files associated with the ViewableTree.
 *
 * @param {Function=} callback The callback to apply once ALL of the files
 *    have been gotten.
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getFiles = function(callback){
    //window.console.log("GET FILES", this);
    var fileQueryUrl = this.queryUrl + this.fileQuerySuffix;
    var absoluteUrl = '';    
    var i =  0;
    var len = 0;
    var fileUrl = '';

    //window.console.log(this, fileQueryUrl);
    gxnat.jsonGet(fileQueryUrl, function(fileUrls){
	//window.console.log(fileUrls);
	for (i=0, len = fileUrls.length; i < len; i++) {
	    fileUrl = this.makeFileUrl(fileUrls[i]);
	    //window.console.log("ABSOLUTE URL:", fileUrls[i], fileUrl); 
	    if (fileUrl) { 
		this.addFiles(fileUrl);
	    }
	}
	callback();
    }.bind(this))
}



/**
 * Gets the thumbnail image associated with the tree.
 *
 * @param {Function=} opt_callback
 */
gxnat.vis.AjaxViewableTree.prototype.getThumbnailImage = 
 function(opt_callback){
     // do nothing.
}



/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.dispose = function() {
    goog.base(this, 'dispose');

    // experiment url
    delete this.experimentUrl;

    // json
    goog.object.clear(this.json);
    delete this.json;

    // queryurl
    delete this.queryUrl;
    
    // dispose
    this.Path.dispose();
    delete this.Path;
}



/**
 * Static function to generate ViewableTrees based on a given XNAT url.  All of
 * the ViewableTrees that are generated are subclasses of 
 * gxnat.vis.AjaxViewableTree.
 *
 * @param {!string} url The url to derive the trees from.
 * @param {!gxnat.vis.AjaxViewableTree} anonViewable
 * @param {function=} opt_runCallback The optional callback applied to each 
 *     viewable.
 * @param {function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 * @public
 */
gxnat.vis.AjaxViewableTree.getViewableTrees = 
function(url, AjaxViewableTreeSubClass, opt_runCallback, opt_doneCallback) {
    
    var pathObj =  new gxnat.Path(url);
    var queryFolder = 
    url + '/' + AjaxViewableTreeSubClass.prototype.getFolderQuerySuffix();
    var viewable = null;

//    window.console.log('\n\n\nurl:', url, '\nqueryFolder:', queryFolder);
    gxnat.vis.AjaxViewableTree.loopFolderContents(queryFolder, function(json){
	//window.console.log(json, pathObj);

	viewable = new AjaxViewableTreeSubClass(
	    pathObj.pathByLevel('experiments'), json, opt_runCallback);

	//window.console.log(viewable);
	// sort list (shared, with custom parameters)
	window.console.log("need to sort the viewable list");
    }, opt_doneCallback)
}
