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

// utils
goog.require('utils.fx');
goog.require('utils.xnat');
goog.require('utils.xnat.Path');
goog.require('utils.xnat.ProjectTree');

// xiv
goog.require('X.parserIMA'); // custom
goog.require('xiv.Modal');




/**
 * The main XNAT Image Viewer class.
 * @param {!string} mode
 * @param {!string} rootUrl
 * @param {!string} xnatQueryPrefix
 * @param {!string} opt_iconUrl
 * @constructor
 */
goog.provide('xiv');
var xiv = function(mode, rootUrl, xnatQueryPrefix, opt_iconUrl){

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
    


    /**
     * @type {!Array.string}
     * @private
     */
    this.dataPaths_ = [];



    /**
     * @type {!Object.<string, Array.<utils.xnat.Viewable>>}
     * @private
     */
    this.Viewables_ = {};


    this.createModal_();
};
goog.exportSymbol('xiv', xiv);




/**
 * The main start function to load up the XNAT Image Viewer.  Sets global URIs
 * (so as to load the thumbnails from a given experiment) and brings up the 
 * modal accordingly.
 * @public
 * @param {!string} windowMode
 * @param {!string} xnatServerRoot
 * @param {!string} dataPath
 * @param {!string} imagePath
 */
xiv.startViewer = function (windowMode, xnatServerRoot, dataPath, imagePath) {
    xiv.loadCustomExtensions_();
    xiv.adjustDocumentStyle_();
    var imageViewer = new xiv(windowMode, 
                               xnatServerRoot,  
			      utils.xnat.Path.getQueryPrefix(xnatServerRoot),
			      imagePath);

    // First add and load the current data path
    imageViewer.addDataPath(dataPath); 
    imageViewer.loadViewables(imageViewer.getDataPaths()[0]);
    imageViewer.loadProjectTree();

    // Show the modal
    imageViewer.showModal();
};
goog.exportSymbol('xiv.startViewer', xiv.startViewer)



/** 
 * @type {!number} 
 * @const
 */
xiv.ANIM_TIME = 300;



/** 
 * @type {xiv.Modal} 
 * @private
 */
xiv.prototype.Modal_;



/**
 * @type {utils.xnat.ProjectTree}
 * @private
 */
xiv.prototype.ProjectTree_;



/**
 * Begins the XNAT Image Viewer.
 * @public
 */
xiv.prototype.showModal = function(){
    this.Modal_.getElement().style.opacity = 0;
    goog.dom.append(document.body, this.Modal_.getElement());
    utils.fx.fadeInFromZero(this.Modal_.getElement(), xiv.ANIM_TIME);
}



/**
 * Hides the XNAT Image Viewer.
 * @param {function=} opt_callback The callback once the hide animation
 *     finishes.
 * @public
 */
xiv.prototype.hideModal = function(opt_callback){
    utils.fx.fadeOut(this.Modal_.getElement(), xiv.ANIM_TIME, opt_callback);
}



/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.prototype.addDataPath = function(path) {
    var updatedPath = /**@type {!string}*/ 
    (path[0] !== "/") ? "/" + path : path;

    if (this.dataPaths_.indexOf(this.queryPrefix_ + updatedPath) === -1) {
	this.dataPaths_.push(this.queryPrefix_ + updatedPath); 
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
	this.Modal_.getElement().parentNode.removeChild(
	    this.Modal_.getElement());
	delete this.Modal_.getElement();
    }.bind(this));
}



/**
 * As stated. 
 * @public
 */
xiv.prototype.loadProjectTree = function() {
    // Query the project tree based on the stored path.
    var projTree = /**@type {!utils.xnat.ProjectTree}*/
    new utils.xnat.ProjectTree(this.getDataPaths()[0]);

    var allExpt = /**@type {!Array.string}*/
    projTree.getLevelUris('experiments')

    var storedExptInd = /**@type {!number}*/
    allExpt.indexOf(this.getDataPaths()[0]);

    var i = /**@type {!number}*/ 0;

    // Store the tree
    projTree.load(function(projTree){
	allExpt = projTree.getLevelUris('experiments')
	storedExptInd = allExpt.indexOf(this.getDataPaths()[0]);
	for (i=0; i<allExpt.length; i++){
	    if (i != storedExptInd){
		this.addDataPath(allExpt[i]);
		this.loadViewables(allExpt[i]);
	    }
	}
	this.setProjectTree(projTree);
    }.bind(this))	
}




/**
 * As stated.
 * @param {!utils.xnat.ProjectTree}
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
 * @public
 */
xiv.prototype.loadViewables = function(viewablesUri){
    //goog.array.forEach(this.dataPaths_, function(viewablesUri){
    utils.xnat.getViewables(viewablesUri, function(viewable){
	this.storeViewable_(viewable);
	this.addViewableToModal_(viewable);
    }.bind(this))
    //}.bind(this))
}



/**
 * Adds a thumbnail to the modal.
 * @param {!string | !array.<string>} key
 * @private
 */
xiv.prototype.addViewableToModal_ = function(Viewable){
    //window.console.log(Viewable, key)
    var folders = /**@type {!Array.string}*/ 
    xiv.extractViewableFolders_(Viewable);
    window.console.log(Viewable, folders);
    //window.console.log(Viewable['thumbnailUrl']);
    this.Modal_.getThumbnailManager().createAndAddThumbnail(Viewable, 
							    folders);
    this.Modal_.getThumbnailManager().setHoverParent(this.Modal_.getElement());
}



/**
 * Creates the modal element.
 * @private
 */
xiv.prototype.createModal_ = function(){
    this.Modal_ = /**@type {!xiv.Modal}*/ new xiv.Modal(this.iconUrl_);
    this.Modal_.setMode('windowed');
    this.setModalButtonCallbacks_();
    window.onresize = function () { 
	this.Modal_.updateStyle() 
    }.bind(this);
}




/**
 * Stores the viewable in an object, using its path as a key.
 * @param {!utils.xnat.Viewable} viweable The utils.xnat.Viewable object to 
 *    store.
 * @param {!string} path The XNAT path associated with the Viewable.
 * @private
 */
xiv.prototype.storeViewable_ = function(viewable, path) {
    if (!this.Viewables_.hasOwnProperty(path)){
	 this.Viewables_[path] = [];
    }
    this.Viewables_[path].push(viewable);
};



/**
 * Extracts the folders in the provided path and returns a set of folders
 * for querying thumbnails. 
 * @param {utils.xnat.Viewable} Viewable
 * @private
 */
xiv.extractViewableFolders_ = function(Viewable){
    var pathObj =  /**@type {!utils.xnat.Path}*/
    new utils.xnat.Path(Viewable['experimentUrl']);
    
    var folders = /**@type {!Array.string}*/ [];
    var key = /**@type {!string}*/ '';
    var keyValid = /**@type {string}*/ utils.xnat.folderAbbrev[key];

    //window.console.log("PATH OBJ", pathObj, "key valid", keyValid);
    for (key in pathObj){ 
	if (goog.isDefAndNotNull(pathObj[key]) && 
	    key !== 'prefix' && utils.xnat.folderAbbrev.hasOwnProperty(key)){
	    folders.push(utils.xnat.folderAbbrev[key] 
			 + ": " + pathObj[key]) 
	}
    };

    //
    // Apply Viewable category
    //
    folders.push(Viewable['category']);
    return folders;
}



/**
 * @private
 */
xiv.loadCustomExtensions_ = function() {
    X.loader.extensions['IMA'] = [X.parserIMA, null];
}



/**
 * @private
 */
xiv.adjustDocumentStyle_ = function() {
    document.body.style.overflow = 'hidden';
}



/**
 * @private
 */
xiv.revertDocumentStyle_ = function() {
    document.body.style.overflow = 'visible';
}




