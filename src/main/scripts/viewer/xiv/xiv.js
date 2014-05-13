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
goog.require('X.renderer3D'); // for testing WebGL

// nrg
goog.require('nrg.fx');
goog.require('nrg.ui.ErrorOverlay');

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
     * NOTE: Necessary!!! If not done it creates weird dependency 
     * issues if declared outside of the constructor method.
     *
     * @type {Object} 
     * @private
     */
    this.modalType_ = xiv.ui.Modal;


    //
    // Add the data path
    //
    this.addDataPath(dataPath);
    //window.console.log('add data path:', dataPath);
};
goog.inherits(xiv, goog.Disposable);
goog.exportSymbol('xiv', xiv);



/**
 * @param {!boolean} loaded 
 * @param {!Object} metadata 
 * @param {!string} uri
 *
 * @struct
 */
xiv.experimentTracker = function(loaded, metadata, uri){
    this.loaded = loaded
    this.metadata =  metadata,
    this.path = new gxnat.Path(uri)
}



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
 * @const
 */
xiv.VIEWABLE_TYPES = {
    'Scan': gxnat.vis.Scan,
    'Slicer': gxnat.vis.Slicer,
}


/**
 * @private
 */
xiv.revertDocumentStyle_ = function() {
    document.body.style.overflow = 'visible';
}


/**
 * @const
 */
xiv.ZIPPY_DATA_KEY = goog.string.createUniqueString();



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
 * @type {Object.<string, Array.<gxnat.vis.ViewableTree>>}
 * @private
 */
xiv.prototype.ViewableTrees_;



/** 
 * @type {Object.<string, xiv.experimentTracker>}
 * @private
 */
xiv.prototype.loadedExperiments_;



/**
 * @public
 */
xiv.prototype.begin = function() {

    //
    // Create the modal
    //
    this.createModal_();

    //
    // Create the project tree
    //
    this.ProjectTree_ = new gxnat.ProjectTree(this.dataPaths_[0]);

    //
    // Run a partial load on the tree using the given path
    // (this won't load any other experiments within the project, ONLY
    // the experiment pertaining to the given url).
    //
    this.ProjectTree_.loadBranch(this.dataPaths_[0], function(tree){

	//
	// Once the partial path is loaded run xiv's callback 
	// 'onExperimentLoaded_'. This gets things setup for the current
	// branch to display in the modal.
	//
	this.onExperimentLoaded_(null, function(){

	    //
	    // Load all of the unloaded experiments (just one branch within
	    // the project).
	    //
	    this.loadAllUnloadedExperiments_();

	    //
	    // Then, load the entire project tree, stopping at the 'subjects'
	    // level.
	    //
	    
	    this.ProjectTree_.loadSubjects(function(){
		
		//window.console.log("PRJ", this.ProjectTree_);
		//
		// When its loaded, store the various metadata for 
		// ajax experiment creation.  We then have to listen
		// for the various zippys to expand, and conduct the relevant
		// ajax calls after they are expanded.
		//
		this.onSubjectsLoaded_(null, true)
	    }.bind(this))
	    

	}.bind(this));
    }.bind(this))

    //
    // Show the modal
    //
    this.show();
}



/**
 * Loads the experiment idenified by the argument ONLY if it's loaded
 * property is undefined.
 *
 * @param {!string} exptUri 
 * @private
 */
xiv.prototype.loadUnloadedExperiment_ = function(exptUri) {
    var key = exptUri;
    var expObj = this.loadedExperiments_[key];
    if (!expObj.loaded){
	this.loadExperiment_(key, function(){
	    this.loadedExperiments_[key].loaded = true;
	}.bind(this), expObj.metadata); 		
    }
}



/**
 * Cycles through the loadedExperiments_ property, loading only those
 * where the 'loaded' property is undefined.
 *
 * @private
 */
xiv.prototype.loadAllUnloadedExperiments_ = function() {
    goog.object.forEach(this.loadedExperiments_, function(expObj, key){
	this.loadUnloadedExperiment_(key);
    }.bind(this))
}



/**
 * NOTE: Derived from: 
 * http://stackoverflow.com/questions/11871077/proper-way-to-detect-
 *     webgl-support
 *
 * @public
 */
xiv.prototype.testForExperimentalWebGL = function(){
    var canvas = goog.dom.createDom('canvas');
    var webGlFound;

    //
    // See if webGL is suppored
    //
    try { 
	webGlFound = canvas.getContext("webgl") || 
	    canvas.getContext("experimental-webgl"); 
    }
    catch (x) { 	
	webGlFound = null; 
    }

    return goog.isDefAndNotNull(webGlFound) ? true : false;
}




/**
 * @private
 */
xiv.prototype.onNoExperimentalWebGL_ = function(){
    
    var errorString = '<br><br><br>'+
	'It looks like webgl or ' +
	'experimental-webgl on this browser is either unsupported ' +
	'or disabled.<br><br>More info:<br><br>' +

    '<a href="https://github.com/xtk/X/wiki/X:Browsers">' + 
	'https://github.com/xtk/X/wiki/X:Browsers' + '</a>'


    //alert(errorString);    
    var ErrorOverlay = new nrg.ui.ErrorOverlay(errorString);

    //
    // Add bg and closebutton
    //
    ErrorOverlay.addBackground();
    ErrorOverlay.addCloseButton();

    //
    // Add image
    //
    var errorImg = ErrorOverlay.addImage();
    goog.dom.classes.add(errorImg, nrg.ui.ErrorOverlay.CSS.NO_WEBGL_IMAGE); 

    //
    // Add above text and render
    //
    ErrorOverlay.addText(errorString)
    ErrorOverlay.render();

    //
    // Fade in the error overlay
    //
    ErrorOverlay.getElement().style.opacity = 0;
    nrg.fx.fadeInFromZero(ErrorOverlay.getElement(), xiv.ANIM_TIME );

    //
    // Dispose of XIV
    //
    this.dispose();
}



/**
 * @param {!gxnat.Path} path The gxnat.Path object associated with the zippy.
 * @private
 */
xiv.prototype.onSubjectZippyExpanded_ = function(path) {
    //window.console.log("SUBJECT URL! ", path, path.getDeepestLevel());
    this.ProjectTree_.loadExperiments(path, function(subjNode){
	this.onExperimentLoaded_(null, null);	
    }.bind(this), 'experiments');
}



/**
 * @param {!gxnat.Path} path The gxnat.Path object associated with the zippy.
 * @private
 */
xiv.prototype.onExperimentZippyExpanded_ = function(path) {
    //window.console.log(path);
    this.loadUnloadedExperiment_(path['originalUrl']);
}



/**
 * @private
 */
xiv.prototype.onZippyExpanded_ = function(e){
    var path = new gxnat.Path(e.node[xiv.ZIPPY_DATA_KEY]);
    var deepestLevel = path.getDeepestLevel();

    switch (deepestLevel){
    case 'subjects':
	this.onSubjectZippyExpanded_(path);
	break;

    case 'experiments':
	this.onExperimentZippyExpanded_(path);
	break;
    }
}



/**
 * @private
 */
xiv.prototype.setOnZippyExpanded_ = function() {
    goog.events.listen(this.Modal_.getThumbnailGallery().getZippyTree(),
	nrg.ui.ZippyNode.EventType.EXPANDED, this.onZippyExpanded_.bind(this));
}



/**
 * Begins the XNAT Image Viewer.
 *
 * @public
 */
xiv.prototype.show = function(){
    
    //
    // Test for Experimental WebGL
    //
    if (!this.testForExperimentalWebGL()){
	this.onNoExperimentalWebGL_();
	return;
    }

    //
    // Set the Modal's opacity to 0, then attatch to document.
    //
    this.Modal_.getElement().style.opacity = 0;
    this.Modal_.render();

    //----------------------------------------------
    // IMPORTANT!!!!    DO NOT ERASE!!!!!!!
    //
    // We need to listen for the zippy tree (thumbnail gallery) expands
    // in order to Async load unloaded experiments
    //----------------------------------------------
    this.setOnZippyExpanded_();

    //
    // Set the button callbacks once rendered.
    //
    this.setModalButtonCallbacks_();

    //
    // The the project tab expanded
    //
    this.Modal_.getProjectTab().setExpanded(true, 0, 1000);

    //
    // Important that this be here
    //
    nrg.fx.fadeInFromZero(this.Modal_.getElement(), xiv.ANIM_TIME);
}



/**
 * Hides the XNAT Image Viewer.
 *
 * @param {function=} opt_callback The callback once the hide animation
 *     finishes.
 * @public
 */
xiv.prototype.hide = function(opt_callback){
    nrg.fx.fadeOut(this.Modal_.getElement(), xiv.ANIM_TIME, opt_callback);
}



/**
 * Sets the governing XNAT Path from which all file IO occurs.
 *
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.prototype.addDataPath = function(path) {
    this.dataPaths_ = this.dataPaths_ ? this.dataPaths_ : [];
    var updatedPath = (path[0] !== "/") ? "/" + path : path;
    if (this.dataPaths_.indexOf(this.queryPrefix_ + updatedPath) === -1) {
	var finalPath = (updatedPath.indexOf(this.queryPrefix_) === -1) ?
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
 * @param {Object=} opt_metadata
 * @private
 */
xiv.prototype.loadExperiment_ = 
function(exptUrl, opt_callback, opt_metadata) {
    this.addDataPath(exptUrl);
    this.fetchViewableTreesAtExperiment(
	this.dataPaths_[this.dataPaths_.length - 1], opt_callback, 
	opt_metadata);
}



/** 
 * @param {Function=} opt_doneCallback
 * @param {boolean=} opt_collapse
 * @private
 */
xiv.prototype.onSubjectsLoaded_ = function(opt_doneCallback, opt_collapse) {
    //
    // Collapse further added zippys unless specified.
    //
    if (opt_collapse !== false) {
	this.collapseAdditionalZippys_();
    }

    //
    // Get the relevant nodes
    //
    var projNodes = this.ProjectTree_.getNodesByLevel('projects');
    var subjNodes = this.ProjectTree_.getNodesByLevel('subjects');
    //window.console.log('p nodes', projNodes);
    //window.console.log('subj nodes', subjNodes);

    var folders, folderUrls, level, path;
    //
    // store and add subjects to the thumbnail gallery
    //
    goog.array.forEach(subjNodes, function(subjNode, i) {
	//
	// Only create the folders of the experiments
	//
	folders = xiv.foldersFromUrl(subjNode['_Path']['originalUrl']);
	folderUrls = [];
	//window.console.log("\n\nFOLDERS", folders);

	//
	// Associate each Zippy folder with its url
	//
	goog.array.forEach(folders, function(folder, i) {
	    folderUrls.push(
		subjNode['_Path'].pathByLevel(gxnat.Path.xnatLevelOrder[i]))
	})
	
	//
	// Add folders to thumbnail gallery modal
	//
	this.addFoldersToModalThumbnailGallery(folders, folderUrls);

	//
	// Run the done callback, if provided
	//
	if (goog.isDefAndNotNull(opt_doneCallback)){
	    opt_doneCallback();
	}
    }.bind(this))

}



/** 
 * @param {gxnat.ProjectTree=} opt_projTree
 * @param {Function=} opt_doneCallback
 * @param {boolean=} opt_collapse
 * @private
 */
xiv.prototype.onExperimentLoaded_ = function(opt_projTree, 
					      opt_doneCallback, opt_collapse) {

    //window.console.log("ON FIRST EXPER");
    //
    // If specificed, collapse further added zippys
    //
    if (opt_collapse === true) {
	this.collapseAdditionalZippys_();
    }


    //
    // Get the project tree
    //
    var projTree = goog.isDefAndNotNull(opt_projTree) ? 
	opt_projTree : this.ProjectTree_;
    //window.console.log("\n\n\n\nPROJECT TREE", projTree);

    //
    // Get the relevant nodes
    //
    var projNodes = projTree.getNodesByLevel('projects');
    var subjNodes = projTree.getNodesByLevel('subjects');
    var exptNodes = projTree.getNodesByLevel('experiments');
    //window.console.log('e nodes', exptNodes, exptNodes.length);
    //window.console.log('p nodes', projNodes);
    //window.console.log('subj nodes', subjNodes);


    var j = 0;
    var len = subjNodes.length;
    var metacol, currProjMeta, currSubjMeta, currExptMeta, currExptUri;

    //
    // store and add experiments
    //
    goog.array.forEach(exptNodes, function(exptNode, i) {
	currExptUri = exptNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'];

	len = projNodes.length;
	for (j=0; j<len; j++){
	    if (currExptUri.indexOf(projNodes[j][gxnat.ProjectTree.PATH_KEY]
				    ['originalUrl']) > -1){
		currProjMeta = projNodes[j]['METADATA'];
		break;
	    }
	}


	len = subjNodes.length;
	for (j=0; j<len; j++){
	    if (currExptUri.indexOf(subjNodes[j][gxnat.ProjectTree.PATH_KEY]
				    ['originalUrl']) > -1){
		currSubjMeta = subjNodes[j]['METADATA'];
		break;
	    }
	}

	window.console.log(exptNode);
	metacol = new gxnat.vis.ViewableTree.metadataCollection(
	    currProjMeta, currSubjMeta, exptNode['METADATA']);
	window.console.log(exptNode['METADATA']);

	//
	// Load experiment
	//
	
	if (!goog.isDefAndNotNull(this.loadedExperiments_)){
	    this.loadedExperiments_ = {};
	}

	//this.loadExperiment_(currExptUri, null, metacol);
	this.loadedExperiments_[currExptUri] = new xiv.experimentTracker(
	    false, metacol, currExptUri);

	//
	// Only create the folders of the experiments
	//
	var folders = xiv.foldersFromUrl(currExptUri);
	folderUrls = [];
	//window.console.log("\n\nFOLDERS 2", folders);

	//
	// Associate each Zippy folder with its url
	//
	goog.array.forEach(folders, function(folder, i) {
	    folderUrls.push(
		 exptNode[gxnat.ProjectTree.PATH_KEY].pathByLevel(gxnat.Path.xnatLevelOrder[i]))
	})

	//window.console.log("FOLDER URLS", folderUrls);
	//window.console.log("Loaded experiments", this.loadedExperiments_);
	this.addFoldersToModalThumbnailGallery(folders, folderUrls);
	//window.console.log("\n\nFOLDERS", folders);

	//
	// Apply the metadata to the preloaded thumbnails
	//
	if (goog.isDefAndNotNull(opt_doneCallback)){
	    opt_doneCallback();
	}
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
       nrg.ui.ZippyTree.EventType.NODEADDED, this.onZippyAdded_);
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
 * @param {Function=} opt_doneCallback To the optional callback to run once the
 *     viewables have been fetched.
 * @param {Object=} opt_metadata
 * @public
 */
xiv.prototype.fetchViewableTreesAtExperiment = 
function(exptUri, opt_doneCallback, opt_metadata){
    //window.console.log(exptUri);
    //window.console.log(exptUri.split('/experiments/'))
    // var subjectMetadata = gxnat.jsonGet(exptUri.split('/experiments/')[0]);
    //window.console.log(subjectMetadata);

    xiv.getViewableTreesFromXnat(exptUri, function(ViewableTree){

	//window.console.log('VIEWABLE', ViewableTree)
	//window.console.log('VIEWABLE INFO', ViewableTree.sessionInfo)

	//
	// Store the viewable tree (this checks whether or not it already
	// exists) in the stored structure in XIV
	//
	var queryUrl = ViewableTree.getQueryUrl();
	this.storeViewableTree_(ViewableTree, queryUrl, 
	    //
	    // Add the tree to the modal only if it's new
	    //
	    function(ViewableTree){
		this.addViewableTreeToModal(ViewableTree);
		//window.console.log('VIEWABLE INFO ', ViewableTree.sessionInfo)
	    }.bind(this));


	//
	// We set the tree's metadata property afterwards in case we're 
	// dealing with a pre-stored tree;
	//
	if (goog.isDefAndNotNull(opt_metadata)){
	    this.ViewableTrees_[queryUrl].setProjectMetadata(
		opt_metadata.project);
	    this.ViewableTrees_[queryUrl].setSubjectMetadata(
		opt_metadata.subject);
	    this.ViewableTrees_[queryUrl].setExperimentMetadata(
		opt_metadata.experiment);
	}

    }.bind(this), opt_doneCallback)
}



/**
 * @param {Array.<string>} folders The zippy structure.
 * @param {Array.<Object>=} opt_correspondingData The optional corresponding
 *    data to add the the zippys.
 * @public
 */
xiv.prototype.addFoldersToModalThumbnailGallery = 
function(folders, opt_correspondingData){
    
    var thumbGalZippy = this.Modal_.getThumbnailGallery().getZippyTree();

    //
    // Add the folders to the zippyTree
    //
    thumbGalZippy.createBranch(folders);

    //
    // Get the newly added folders
    //
    zippyNodes = thumbGalZippy.getFolderNodes(folders);
 
    //
    // Loop through the newly added folders and add their corresponding data
    //
    goog.array.forEach(zippyNodes, function(node, i){
	if (goog.isDefAndNotNull(opt_correspondingData) && 
	    goog.isDefAndNotNull(opt_correspondingData[i])){

	    //
	    // Only add the data if it isn't defined
	    //
	    if (!goog.isDefAndNotNull(node[xiv.ZIPPY_DATA_KEY])){
		node[xiv.ZIPPY_DATA_KEY] = opt_correspondingData[i];
		//window.console.log('CORRESP', node.getTitle(), 
		//		   node[xiv.ZIPPY_DATA_KEY]);
	    }
	}
    }.bind(this))
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
    var ThumbGallery = this.Modal_.getThumbnailGallery();

    ThumbGallery.createAndAddThumbnail(
	ViewableTree, // The viewable
	xiv.extractViewableTreeFolders_(ViewableTree) // The folder tree
    );
    ThumbGallery.setHoverParent(this.Modal_.getElement());
}



/**
 * Creates the modal element.
 *
 * @private
 */
xiv.prototype.createModal_ = function(){
    this.Modal_ = new this.modalType_();
    this.Modal_.setMode(this.mode_);
    window.onresize = function () { 
	this.Modal_.updateStyle() 
    }.bind(this);
}



/**
 * Stores the viewable in an object, using its path as a key.
 * @param {!gxnat.vis.ViewableTree} ViewableTree The gxnat.vis.ViewableTree 
 *    object to store.
 * @param {!string} path The XNAT path associated with the ViewableTree.
 * @param {Function=} opt_onStore The function called if the ViewableTree 
 *    is stored. This will not be called if the ViewableTree already exists.
 * @private
 */
xiv.prototype.storeViewableTree_ = function(ViewableTree, path, opt_onStore) {
    this.ViewableTrees_ = this.ViewableTrees_ ? this.ViewableTrees_ : {};
    if (!goog.isDefAndNotNull(this.ViewableTrees_[path])){
	this.ViewableTrees_[path] = ViewableTree;
	opt_onStore(ViewableTree)
    }
};



/**
 * @private
 */
xiv.prototype.onZippyAdded_ = function(e) {
    var prevDur =
    e.node.getZippy().animationDuration;
    e.node.getZippy().animationDuration = 0;
    e.node.getZippy().setExpanded(false);
    e.node.getZippy().animationDuration = prevDur;
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
    goog.object.forEach(this.ViewableTrees_, function(ViewableTree, key){
	ViewableTree.dispose();
	delete this.ViewableTrees_[key];
    }.bind(this))
    delete this.ViewableTrees_;

    // Project Tree
    if (this.ProjectTree_){
	this.ProjectTree_.dispose();
	delete this.ProjectTree_;
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
 * @param {!string} exptUrl
 * @return {!Array.<string>}
 * @private
 */
xiv.foldersFromUrl = function(exptUrl){
    var pathObj = new gxnat.Path(exptUrl);
    var folders = [];
    var key = '';
    var keyValid = gxnat.folderAbbrev[key];

    //window.console.log("PATH OBJ", pathObj, "key valid", keyValid);
    for (key in pathObj){ 
	if (goog.isDefAndNotNull(pathObj[key]) && 
	    key !== 'prefix' && gxnat.folderAbbrev.hasOwnProperty(key)){
	    folders.push(gxnat.folderAbbrev[key] 
			 + ": " + pathObj[key]) 
	}
    };
    
    return folders;
}



/**
 * Extracts the folders in the provided path and returns a set of folders
 * for querying thumbnails. 
 * @param {gxnat.vis.AjaxViewableTree} ViewableTree
 * @return {!Array.<string>}
 * @private
 */
xiv.extractViewableTreeFolders_ = function(ViewableTree){
    var folders = xiv.foldersFromUrl(ViewableTree.getExperimentUrl());

    //
    // Only add non-scans to their own category folder
    //
    var category = ViewableTree.getCategory();
    if (category !== 'Scans') {
	folders.push(category);
    }
    return folders;
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
xiv.getViewableTreesFromXnat = 
function (url, opt_runCallback, opt_doneCallback) {

    //
    // Get the viewable types (e.g. Scans and Slicer scenes);
    // 
    var typeCount = goog.object.getCount(xiv.VIEWABLE_TYPES);
    var typesGotten = 0;

    //
    // Loop through the types
    //
    goog.object.forEach(xiv.VIEWABLE_TYPES, function(viewableType){

	//
	// Get the trees per type
	//
      gxnat.vis.AjaxViewableTree.getViewableTrees(
	  url, viewableType, opt_runCallback, function(){
	  typesGotten++;

	  //
	  // Once we've gotten everything, run the done callback
	  //
	  if (typesGotten === typeCount){
	      //window.console.log("\n\n\nDONE GETTING VIEWABLES!\n\n\n");
	      if (goog.isDefAndNotNull(opt_doneCallback)) { 
		  opt_doneCallback(); 
	      }
	 }
      })
    })
}
