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
 * @param {!string} category The category of the viewable.
 * @param {Object=} opt_viewableJson The json associated with the viewable.
 * @param {string=} opt_experimentUrl The experiment-level url of the viewable.
 * @extends {goog.vis.ViewableTree}
 */
goog.provide('gxnat.vis.AjaxViewableTree');
gxnat.vis.AjaxViewableTree = 
function(category,  opt_viewableJson, opt_experimentUrl) {
    goog.base(this);

    //
    // Set the category
    //
    this.setCategory(category);

    //
    // Add the path parameters
    //
    if (goog.isDefAndNotNull(opt_experimentUrl) && 
	goog.isDefAndNotNull(opt_viewableJson)){

	this.experimentUrl = opt_experimentUrl;   

	this.queryUrl = gxnat.Path.graftUrl(this.experimentUrl, 
					    opt_viewableJson['URI'], 
					    'experiments');

	this.Path = new gxnat.Path(this.queryUrl);
    }


    /**
     * @type {Object<string, string>=}
     * @protected
     */
    this.json = opt_viewableJson;

    /**
     * @type {Object}
     * @protected
     */
    this.sessionInfo = {};
}
goog.inherits(gxnat.vis.AjaxViewableTree, gxnat.vis.ViewableTree);
goog.exportSymbol('gxnat.vis.AjaxViewableTree', gxnat.vis.AjaxViewableTree);



/**
 * @const
 * @private
 */
gxnat.vis.AjaxViewableTree.VIEWABLE_KEY_MAP = {
    'ID': 'Scan ID',
    'Name': 'Name',
    'type': 'Scan Type'
}



/**
 * @const
 * @private
 */
gxnat.vis.AjaxViewableTree.SUBJECT_KEY_MAP = {
    'yob': 'Year of Birth',
    'acquisition_site': 'Acq. Site',
    'date': 'Date',
    'scanner': 'Scanner'
}



/**
 * @type {string=}
 * @protected
 */
gxnat.vis.AjaxViewableTree.prototype.experimentUrl;


/**
 * @type {string=} 
 * @protected
 */    
gxnat.vis.AjaxViewableTree.prototype.queryUrl;

/**
 * @type {gxnat.Path=} 
 * @protected
 */
gxnat.vis.AjaxViewableTree.prototype.Path;



/**
 * @type {!boolean}
 * @protected
 */
gxnat.vis.AjaxViewableTree.prototype.filesGotten = false;



/**
 * @return {!boolean}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getFilesGotten = function(){
    return this.filesGotten;
}



/**
 * @param {!boolean}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.setFilesGotten = function(bool){
    this.filesGotten = bool;
}



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
 * @return {!Object}
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.getSessionInfo = function() {
    return this.sessionInfo;
}


/**
 * @param {!Object} sessionInfo
 * @public
 */
gxnat.vis.AjaxViewableTree.prototype.setSessionInfo = function(sessionInfo) {
    this.sessionInfo = sessionInfo;
}



/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.setViewableMetadata = function() {
    goog.object.forEach(gxnat.vis.AjaxViewableTree.VIEWABLE_KEY_MAP, 
    function(val, key){
	if (goog.isDefAndNotNull(this.json[key])){
	    this.sessionInfo[val] = this.json[key]
	}
    }.bind(this))
}



/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.setProjectMetadata = function(meta) {
    goog.base(this, 'setProjectMetadata', meta);
    //window.console.log('\n\nPROJ METADATA', this.projectMetadata);
}


/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.setSubjectMetadata = function(meta) {
    goog.base(this, 'setSubjectMetadata', meta);
     goog.object.forEach(gxnat.vis.AjaxViewableTree.SUBJECT_KEY_MAP, 
     function(val, key){
	if (goog.isDefAndNotNull(this.subjectMetadata[key])){
	    this.sessionInfo[val] = this.subjectMetadata[key]
	}
    }.bind(this))


    /*
      acquisition_site: "WashU"
      date: "1993-03-08"
      id: "localhost_E00001"
      label: "1"
      project: "1"
      scanner: "Siemens"
      subject_ID: "localhost_S00001"
      visit_id: "5-10-2008"
    */

    //window.console.log(this.getSessionInfo());
}



/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.setExperimentMetadata = function(meta) {
    goog.base(this, 'setExperimentMetadata', meta);

    //window.console.log('Expt METADATA', this.experimentMetadata, 
    //this.sessionInfo);
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
    var fileName = 
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
	
	if (!goog.isArray(viewablesJson)) {
	    //runCallback(viewablesJson);
	    //return;
	}
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
gxnat.vis.AjaxViewableTree.prototype.getFileList = function(callback){

    //
    // Run callback if we already have the files
    //
    if (this.filesGotten){
	callback();
	return;
    }

    //
    // Otherwise, run query
    //
    //window.console.log("GET FILES", this);
    var fileQueryUrl = this.queryUrl + this.fileQuerySuffix;
    var absoluteUrl = '';    
    var i =  0;
    var len = 0;
    var fileUrl = '';

    //window.console.log(this, fileQueryUrl);
    gxnat.jsonGet(fileQueryUrl, function(fileUrls){
	//window.console.log(fileUrls);
	len = fileUrls.length;
	for (; i < len; i++) {
	    fileUrl = this.makeFileUrl(fileUrls[i]);
	    //window.console.log("ABSOLUTE URL:", fileUrls[i], fileUrl); 
	    if (fileUrl) { 
		this.addFiles(fileUrl, this.fileFilter);
	    }
	}
	callback();
	this.filesGotten = true;
    }.bind(this))
}



/**
 * @param {!string} fileName
 * @protected
 */
gxnat.vis.AjaxViewableTree.prototype.fileFilter = function(fileName){
     // do nothing -- inherited by subclasses
    if (fileName.indexOf('_MACOSX') > -1 ){
	return null;;
    }
    return fileName;
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
    //window.console.log('\n\n\nurl:', url, '\nqueryFolder:', queryFolder);
    gxnat.vis.AjaxViewableTree.loopFolderContents(queryFolder, function(json){
	//window.console.log(json, pathObj);
	viewable = new AjaxViewableTreeSubClass(
	     json, pathObj.pathByLevel('experiments'), opt_runCallback);

    }, opt_doneCallback)
}



/**
 * @inheritDoc
 */
gxnat.vis.AjaxViewableTree.prototype.dispose = function() {
    goog.base(this, 'dispose');

    
    delete this.filesGotten;

    // Session info.
    goog.object.clear(this.sessionInfo);
    delete this.sessionInfo;


    // json
    if (goog.isDefAndNotNull(this.json)){
	goog.object.clear(this.json);
	delete this.json;
    }
    
    // dispose
    if (goog.isDefAndNotNull(this.Path)){
	this.Path.dispose();
	delete this.Path;
    }

    // experiment url
    delete this.experimentUrl;

    // queryurl
    delete this.queryUrl;
}
