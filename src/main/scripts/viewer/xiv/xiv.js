/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.window');
goog.require('goog.Disposable');

// xtk
goog.require('X.loader');
goog.require('X.parserIMA'); // custom

// moka
goog.require('moka.fx');

// gxnat
goog.require('gxnat');
goog.require('gxnat.Path');
goog.require('gxnat.ProjectTree');
goog.require('gxnat.vis.AjaxViewableTree');

//xiv 
goog.require('xiv.ui.Modal');


/**
 * The main XNAT Image Viewer class.
 * @param {!string} mode The mode of the image viewer.
 * @param {!string} dataPath The data path to begin viewable query from.
 * @param {!string} rootUrl The serverRoot.
 * @extends {goog.Disposable}
 * @constructor
 */
goog.provide('xiv');
xiv = function(mode, dataPath, rootUrl){

    // Inits on the constructor.
    xiv.loadCustomExtensions();
    xiv.adjustDocumentStyle();


    /**
     * @type {!string}
     * @private
     */
    this.mode_ = mode || 'windowed';


    /** 
     * @private
     * @type {string} 
     */
    this.rootUrl_ = rootUrl;


    /**
     * @type {Array.string}
     * @private
     */
    this.queryPrefix_ = gxnat.Path.getQueryPrefix(rootUrl);


    /** 
     * @type {xiv.ui.Modal} 
     * @private
     */
    this.Modal_;


    /**
     * @type {gxnat.ProjectTree}
     * @private
     */
    this.ProjectTree_;


    /**
     * @type {Array.string}
     * @private
     */
    this.dataPaths_;
    this.addDataPath(dataPath);

    /**
     * @type {boolean}
     * @private
     */
    this.projectTreeLoadedStarted_ = false;


    /** 
     * @type {Object.<string, Array.<gxnat.vis.ViewableTree>>}
     * @private
     */
    this.ViewableTrees_;


    /** 
     * NOTE: Necessary!!! If not done it creates weird dependency 
     * issues if declared outside of the constructor method.
     *
     * @type {Object} 
     * @private
     */
    this.modalType_ = xiv.ui.Modal;


    // Inits
    this.createModal_();


    this.loadExperiment_(this.dataPaths_[0], function() {
	//this.loadProjectTree_();
    }.bind(this)); 


};
goog.inherits(xiv, goog.Disposable);
goog.exportSymbol('xiv', xiv);



/** 
 * @type {!number} 
 * @const
 */
xiv.ANIM_TIME = 300;



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



/**
 * Begins the XNAT Image Viewer.
 *
 * @public
 */
xiv.prototype.show = function(){
    this.Modal_.getElement().style.opacity = 0;
    goog.dom.append(document.body, this.Modal_.getElement());
    this.Modal_.updateStyle();

    // The the project tab expanded
    this.Modal_.getProjectTab().setExpanded(true, 0, 0);

    // Important that this be here;
    moka.fx.fadeInFromZero(this.Modal_.getElement(), xiv.ANIM_TIME );
}



/**
 * Hides the XNAT Image Viewer.
 * @param {function=} opt_callback The callback once the hide animation
 *     finishes.
 * @public
 */
xiv.prototype.hide = function(opt_callback){
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
 * Fades out then disposes xiv.
 *
 * @public
 */
xiv.prototype.dispose = function() {
    this.hide(this.dispose_.bind(this));
}



/**
 * @param {!string} exptUrl The experiment url to load the vieables from.
 * @param {Function=} opt_callback The optional callback.
 * @private
 */
xiv.prototype.loadExperiment_ = function(exptUrl, opt_callback) {
    this.addDataPath(exptUrl);
    this.fetchViewableTrees(this.dataPaths_[this.dataPaths_.length - 1], 
			opt_callback);
}



/** 
 * @private
 */
xiv.prototype.loadProjectTree_ = function() {

    if (this.projectTreeLoadedStarted_) { return }
    this.projectTreeLoadedStarted_ = true;

    var startPath = /**@type {!string}*/ this.dataPaths_[0];

    // when tree loading is finished...
    (new gxnat.ProjectTree(startPath)).load( 
	function(projTree){
	    //window.console.log("PROJECT TREE");
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
		this.loadExperiment_(expt);
	    }.bind(this))
	    
	    // store the tree
	    this.setProjectTree_(projTree);

    }.bind(this))	
}



/**
 * Sets the events to collapse any added zippys.
 *
 * @private
 */
xiv.prototype.collapseAdditionalZippys_ = function() {
    if (!this.Modal_.getThumbnailGallery()) { return };
    goog.events.listen(this.Modal_.getThumbnailGallery().getZippyTree(),
       moka.ui.ZippyTree.EventType.NODEADDED, this.onZippyAdded_);
}



/**
 * @param {!gxnat.ProjectTree}
 * @private
 */
xiv.prototype.setProjectTree_ = function(tree){
    this.ProjectTree_ = tree;
} 



/**.
 * @private
 */
xiv.prototype.setModalButtonCallbacks_ = function(){
    goog.events.listen(this.Modal_.getPopupButton(), 
		       goog.events.EventType.CLICK, 
		       this.createModalPopup_.bind(this))

    goog.events.listen(this.Modal_.getCloseButton(), 
		       goog.events.EventType.CLICK, 
		       this.dispose.bind(this));
} 



/**
 * Creates a popup window of the modal element.
 * From: http://javascript.info/tutorial/popup-windows
 *
 * @private
 */
xiv.prototype.createModalPopup_ = function(){

    var popup = open(this.rootUrl_ + '/scripts/viewer/xiv/popup.html', 
		   'XNAT Image Viewer', 'width=600,height=600');
    popup.focus();

    var dataPath = this.dataPaths_[0];
    var pOnload = function() {
	popup.launchXImgView(dataPath, 'popup');
    }

    popup.onload = pOnload.bind(this);

    // Dispose
    this.dispose();

    // Reload window
    //window.location.reload();
}



/**
 * Gets the viewables from the xnat server.
 * @param {!string} viewablesUri The uri to retrieve the viewables from.
 * @param {function=} opt_doneCallback To the optional callback to run once the
 *     viewables have been fetched.
 * @public
 */
xiv.prototype.fetchViewableTrees = function(viewablesUri, opt_doneCallback){
    xiv.getViewableTreesFromXnat(viewablesUri, function(viewable){
	//window.console.log('VIEWABLE', viewable);
	this.storeViewableTree_(viewable);
	this.addViewableTreeToModal(viewable);
    }.bind(this), opt_doneCallback)
}



/**
 * Adds a viewable to the modal.
 * @param {gxnat.vis.ViewableTree} ViewableTree The Viewable to add.
 * @public
 */
xiv.prototype.addViewableTreeToModal = function(ViewableTree){
    //window.console.log(ViewableTree);
    if (!this.Modal_.getThumbnailGallery()) { return };
    //window.console.log("Thumb gallery");
    this.Modal_.getThumbnailGallery().createAndAddThumbnail(
	ViewableTree, // The viewable
	xiv.extractViewableTreeFolders_(ViewableTree) // The folder tree
    );
    this.Modal_.getThumbnailGallery().setHoverParent(this.Modal_.getElement());
}



/**
 * Creates the modal element.
 *
 * @private
 */
xiv.prototype.createModal_ = function(){
    this.Modal_ = new this.modalType_();
    this.Modal_.setMode(this.mode_);
    this.setModalButtonCallbacks_();
    window.onresize = function () { 
	this.Modal_.updateStyle() 
    }.bind(this);
}



/**
 * Stores the viewable in an object, using its path as a key.
 * @param {!gxnat.vis.ViewableTree} viewable The gxnat.vis.ViewableTree object to 
 *    store.
 * @param {!string} path The XNAT path associated with the Viewable.
 * @private
 */
xiv.prototype.storeViewableTree_ = function(viewable, path) {
    this.ViewableTrees_ = this.ViewableTrees_ ? this.ViewableTrees_ : {};
    if (!this.ViewableTrees_.hasOwnProperty(path)){
	 this.ViewableTrees_[path] = [];
    }
    this.ViewableTrees_[path].push(viewable);
};



/**
 * @private
 */
xiv.prototype.onZippyAdded_ = function(e) {
    var prevDur = /**@type {!number}*/
    e.currNode.getZippy().animationDuration;
    e.currNode.getZippy().animationDuration = 0;
    e.currNode.getZippy().setExpanded(false);
    e.currNode.getZippy().animationDuration = prevDur;
}


/**
 * Dispose function called back after the modal is faded out.
 *
 * @private
 */
xiv.prototype.dispose_ = function() {

    // Call superclass dispose.
    xiv.superClass_.dispose.call(this)

    // Revert the document.
    xiv.revertDocumentStyle_();

    // ViewableTrees
    goog.object.forEach(this.ViewableTrees_, function(ViewableTreeArr, key){
	goog.array.forEach(ViewableTreeArr, function(ViewableTree){
	    ViewableTree.dispose();
	});
	goog.array.clear(ViewableTreeArr);
	delete this.ViewableTrees_[key];
    }.bind(this))
    delete this.ViewableTrees_;

    // Project Tree
    if (this.ProjectTree_){
	this.ProjectTree_.dispose();
	delete this.ProjectTree_;
	delete this.projectTreeLoadedStarted_;
    }

    // Others
    delete this.dataPaths_;
    delete this.rootUrl_;
    delete this.queryPrefix_;
    delete this.iconUrl_;

    // Modal
    goog.events.removeAll(this.Modal_);
    this.Modal_.disposeInternal();
    goog.dom.removeNode(this.Modal_.getElement());
    delete this.Modal_;
}



/**
 * Extracts the folders in the provided path and returns a set of folders
 * for querying thumbnails. 
 * @param {gxnat.vis.AjaxViewableTree} ViewableTree
 * @private
 */
xiv.extractViewableTreeFolders_ = function(ViewableTree){
    var pathObj =  /**@type {!gxnat.Path}*/
    //wwindow.console.log(ViewableTree);
    new gxnat.Path(ViewableTree.getExperimentUrl());
    
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
    folders.push(ViewableTree.getCategory());
    return folders;
}





xiv.VIEWABLE_TYPES = {
    'Scan': gxnat.vis.Scan,
    'Slicer': gxnat.vis.Slicer,
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
xiv.getViewableTreesFromXnat = function (url, opt_runCallback, opt_doneCallback){


    var typeCount = /**@type {!number}*/
	goog.object.getCount(xiv.VIEWABLE_TYPES);
    var typesGotten = /**@type {!number}*/ 0;


    goog.object.forEach(xiv.VIEWABLE_TYPES, function(vType){
      gxnat.vis.AjaxViewableTree.getViewableTrees(
	  url, vType, opt_runCallback, function(){
	  typesGotten++;
	  if (typesGotten === typeCount){
	      
	      window.console.log("\n\n\nDONE GETTING VIEWABLES!\n\n\n");

	      if (opt_doneCallback) { 
		  opt_doneCallback(); 
	      }
	 }
      })
    });
}
