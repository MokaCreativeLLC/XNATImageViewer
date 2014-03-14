/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.window');

// xtk
goog.require('X.loader');
goog.require('X.parserIMA'); // custom

// moka
goog.require('moka.fx');

// gxnat
goog.require('gxnat');
goog.require('gxnat.Path');
goog.require('gxnat.ProjectTree');




/**
 * The main XNAT Image Viewer class.
 * @param {!string} mode
 * @param {!string} rootUrl
 * @param {!string} xnatQueryPrefix
 * @param {!string} opt_iconUrl
 * @constructor
 */
goog.provide('xiv');
xiv = function(mode, rootUrl, xnatQueryPrefix, opt_iconUrl){


    /** 
     * @private
     * @type {!string} 
     */
    this.rootUrl_ = rootUrl;


    /**
     * @type {!Array.string}
     * @private
     */
    this.queryPrefix_ = xnatQueryPrefix;


    /** 
     * @private
     * @type {!string} 
     */
    this.iconUrl_ =  goog.isString(opt_iconUrl) ? opt_iconUrl : '';
};
goog.exportSymbol('xiv', xiv);



/** 
 * @type {!number} 
 * @const
 */
xiv.ANIM_TIME = 300;



/** 
 * @type {Object} 
 * @private
 */
xiv.prototype.modalType_;



/** 
 * @type {xiv.ui.Modal} 
 * @private
 */
xiv.prototype.Modal_;



/**
 * @type {gxnat.ProjectTree}
 * @private
 */
xiv.prototype.ProjectTree_;



/**
 * @type {Array.string}
 * @private
 */
xiv.prototype.dataPaths_;



/**
 * @type {Object.<string, Array.<gxnat.Viewable>>}
 * @private
 */
xiv.prototype.Viewables_;



/**
 * @param {!Object} The modal type to set (e.g. xiv.ui.Modal).
 * @public
 */
xiv.prototype.setModalType = function(modalType){
    this.modalType_ = modalType;
}


/**
 * Begins the XNAT Image Viewer.
 * @public
 */
xiv.prototype.showModal = function(){
    this.Modal_.getElement().style.opacity = 0;
    goog.dom.append(document.body, this.Modal_.getElement());
    this.Modal_.updateStyle();
    // Important that this be here;

    moka.fx.fadeInFromZero(this.Modal_.getElement(), xiv.ANIM_TIME);
}



/**
 * As stated.
 * @return {!xiv.ui.Modal} The Modal class.
 * @public
 */
xiv.prototype.getModal = function(){
    return this.Modal_;
}



/**
 * Hides the XNAT Image Viewer.
 * @param {function=} opt_callback The callback once the hide animation
 *     finishes.
 * @public
 */
xiv.prototype.hideModal = function(opt_callback){
    moka.fx.fadeOut(this.Modal_.getElement(), xiv.ANIM_TIME, opt_callback);
}



/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.prototype.addDataPath = function(path) {
    this.dataPaths_ = this.dataPaths_ ? this.dataPaths_ : [];
    var updatedPath = /**@type {!string}*/ 
    (path[0] !== "/") ? "/" + path : path;
    if (this.dataPaths_.indexOf(this.queryPrefix_ + updatedPath) === -1) {
	var finalPath = /**@type {!string}*/ 
	(updatedPath.indexOf(this.queryPrefix_) === -1) ?
	    this.queryPrefix_ + updatedPath : updatedPath;
	this.dataPaths_.push(finalPath); 
    }
}



/**
 * Returns the array of stored XNAT paths.
 * @return {!Array.<string>} The array of stored XNAT paths.
 * @public
 */
xiv.prototype.getDataPaths = function() {
  return this.dataPaths_;
};



/**
 * Fades out then deletes the modal and all of its child elements.
 * @public
 */
xiv.prototype.destroy = function () {
    this.hideModal(function (){
	xiv.revertDocumentStyle_();
	this.Modal_.disposeInternal();
	this.Modal_.getElement().parentNode.removeChild(
	    this.Modal_.getElement());
	delete this.Modal_.getElement();
	this.Modal_ = null;
    }.bind(this));
}



/**
 * As stated. 
 * @public
 */
xiv.prototype.loadProjectTree = function() {

    var startPath = /**@type {!string}*/ this.getDataPaths()[0];

    // when tree loading is finished...
    (new gxnat.ProjectTree(startPath)).load( 
	function(projTree){
	    window.console.log("PROJECT TREE");
	    // Get the experiments in the tree
	    var expts = /**@type {Array.string}*/ 
	    projTree.getLevelUris('experiments');
	    
	    // get the skip index
	    var skipInd = /**@type {!number}*/ expts.indexOf(startPath);

	    // Collapse further added zippys
	    this.collapseAdditionalZippys_();

	    // store and add experiments not loaded.
	    goog.array.forEach(expts, function(expt, i) {
		if (i == skipInd) {return};
		this.loadExperiment(expt);
	    }.bind(this))
	    
	    // store the tree
	    this.setProjectTree(projTree);

    }.bind(this))	
}



/**
 * As stated.
 * @param {!string} exptUrl The experiment url to load the vieables from.
 * @public
 */
xiv.prototype.loadExperiment = function(exptUrl) {
    this.addDataPath(exptUrl);
    this.fetchViewables(this.getDataPaths()
			[this.getDataPaths().length - 1]);
}



/**
 * Sets the events to collapse any added zippys.
 * @private
 */
xiv.prototype.collapseAdditionalZippys_ = function() {
    if (this.getModal().getThumbnailManager()){
	this.getModal().getThumbnailManager().
	    getThumbnailGallery().getZippyTree()['EVENTS'].
	    onEvent('NODEADDED', function(currNode){
		var prevDur = /**@type {!number}*/
		currNode.getZippy().animationDuration;
		currNode.getZippy().animationDuration = 0;
		currNode.getZippy().setExpanded(false);
		currNode.getZippy().animationDuration = prevDur;
	    })
    }
}



/**
 * As stated.
 * @param {!gxnat.ProjectTree}
 * @public
 */
xiv.prototype.setProjectTree = function(tree){
    this.ProjectTree_ = tree;
} 




/**
 * As stated.
 * @private
 */
xiv.prototype.setModalButtonCallbacks_ = function(){
    this.Modal_.getButtons()['popup'].onclick = 
	this.makeModalPopup_.bind(this);
    //this.Modal_.getBupathOPbttons()['addXnatFolders'].onclick = 
    //	this.showPathSelector_.bind(this);
    this.Modal_.getButtons()['close'].onclick = 
	this.destroy.bind(this);
} 



/**
 * Creates a popup window of the modal element.
 * @private
 */
xiv.prototype.makeModalPopup_ = function(){

    var dataPaths = /**@type {!string}*/ '';
    goog.array.forEach(this.dataPaths_, function(dataPath){
	dataPaths += dataPath + '&'
    })
    goog.window.popup(this.rootUrl_ + '/scripts/viewer/popup.html' + '?' 
		      + dataPaths);

    // Destroy
    this.destroy();

    // Reload window
    window.location.reload();
}



/**
 * Gets the viewables from the xnat server.
 * @param {!string} viewablesUri The uri to retrieve the viewables from.
 * @param {function=} opt_doneCallback To the optional callback to run once the
 *     viewables have been fetched.
 * @public
 */
xiv.prototype.fetchViewables = function(viewablesUri, opt_doneCallback){
    gxnat.getViewables(viewablesUri, function(viewable){
	this.storeViewable_(viewable);
	this.addViewableToModal(viewable);
    }.bind(this), opt_doneCallback)
}



/**
 * Adds a viewable to the modal.
 * @param {gxnat.Viewable} Viewable The Viewable to add.
 * @public
 */
xiv.prototype.addViewableToModal = function(Viewable){
    //window.console.log(Viewable, key)
    //window.console.log(Viewable);
    //window.console.log(Viewable['thumbnailUrl']);

    if (!this.Modal_.getThumbnailManager()) { return };

    this.Modal_.getThumbnailManager().createAndAddThumbnail(
	Viewable, // The viewable
	xiv.extractViewableFolders_(Viewable), // The folder tree
	true // Toggle animation fx
    );
    this.Modal_.getThumbnailManager().setHoverParent(this.Modal_.getElement());
}



/**
 * Creates the modal element.
 * @param {!xiv.ui.Modal}
 * @public
 */
xiv.prototype.createModal = function(modalType){
    this.Modal_ = /**@type {!xiv.ui.Modal}*/ new this.modalType_();
    this.Modal_.setIconBaseUrl(this.iconUrl_);
    this.Modal_.setMode('windowed');
    this.setModalButtonCallbacks_();
    window.onresize = function () { 
	this.Modal_.updateStyle() 
    }.bind(this);
}



/**
 * Stores the viewable in an object, using its path as a key.
 * @param {!gxnat.Viewable} viweable The gxnat.Viewable object to 
 *    store.
 * @param {!string} path The XNAT path associated with the Viewable.
 * @private
 */
xiv.prototype.storeViewable_ = function(viewable, path) {
    this.Viewables_ = this.Viewables_ ? this.Viewables_ : {};
    if (!this.Viewables_.hasOwnProperty(path)){
	 this.Viewables_[path] = [];
    }
    this.Viewables_[path].push(viewable);
};



/**
 * Extracts the folders in the provided path and returns a set of folders
 * for querying thumbnails. 
 * @param {gxnat.Viewable} Viewable
 * @private
 */
xiv.extractViewableFolders_ = function(Viewable){
    var pathObj =  /**@type {!gxnat.Path}*/
    new gxnat.Path(Viewable['experimentUrl']);
    
    var folders = /**@type {!Array.string}*/ [];
    var key = /**@type {!string}*/ '';
    var keyValid = /**@type {string}*/ gxnat.folderAbbrev[key];

    //window.console.log("PATH OBJ", pathObj, "key valid", keyValid);
    for (key in pathObj){ 
	if (goog.isDefAndNotNull(pathObj[key]) && 
	    key !== 'prefix' && gxnat.folderAbbrev.hasOwnProperty(key)){
	    folders.push(gxnat.folderAbbrev[key] 
			 + ": " + pathObj[key]) 
	}
    };

    // Apply Viewable category
    folders.push(Viewable['category']);
    return folders;
}



/**
 * @public
 */
xiv.loadCustomExtensions = function() {
    X.loader.extensions['IMA'] = [X.parserIMA, null];
}



/**
 * @public
 */
xiv.adjustDocumentStyle = function() {
    document.body.style.overflow = 'hidden';
}



/**
 * @private
 */
xiv.revertDocumentStyle_ = function() {
    document.body.style.overflow = 'visible';
}




