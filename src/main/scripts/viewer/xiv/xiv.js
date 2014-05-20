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

    /**
     * @type {gxnat.Path}
     * @private
     */
    this.initPath_ = new gxnat.Path(this.dataPaths_[0]);
    //window.console.log('add data path:', dataPath);
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
 * @type {Array.<!string>}
 * @private
 */
xiv.prototype.loadedExperiments_;



/** 
 * @type {gxnat.PrjectTree.TreeNode}
 * @private
 */
xiv.prototype.initProjNode_;



/** 
 * @type {gxnat.PrjectTree.TreeNode}
 * @private
 */
xiv.prototype.initSubjNode_;



/** 
 * @type {gxnat.PrjectTree.TreeNode}
 * @private
 */
xiv.prototype.initExptNode_;


/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.prototype.initProjFolderNode_;



/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.prototype.initSubjFolderNode_;



/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.prototype.initExptFolderNode_;



/** 
 * @type {!boolean}
 * @private
 */
xiv.prototype.initExperimentExpanding_ = false;



/** 
 * @type {!boolean}
 * @private
 */
xiv.prototype.initSubjecttExpanding_ = false;



/**
 * @public
 */
xiv.prototype.begin = function() {

    //
    // Create the modal
    //
    this.createModal_();

    //
    // Show the modal
    //
    this.show();


    //
    // Create the project tree
    //
    var zippyTree = this.Modal_.getThumbnailGallery().getZippyTree();
    var nodeCount = 0;

    this.collapseZippys_();
    this.ProjectTree_ = new gxnat.ProjectTree(this.dataPaths_[0]);
    this.ProjectTree_.loadInitBranch(function(node){
	//
	// Create zippy folders
	//
	var folders = this.createFoldersFromTreeNode_(node);
	
	if (nodeCount == 0){
	    //window.console.log("TEST: toggling fadeIn fx of zippy tree.");
	    //zippyTree.toggleFadeInFx(true);
	    this.initProjNode_ = node;
	    this.initProjFolderNode_ = zippyTree.setExpanded(folders[0])
	}

	if (nodeCount == 1){
	    this.initSubjectExpanding_ = true;
	    this.initSubjNode_ = node;
	    this.initSubjFolderNode_ = zippyTree.setExpanded(folders[1], 
						this.initProjFolderNode_)
	}

	if (nodeCount == 2){
	    this.initExperimentExpanding_ = true;
	    this.initExptNode_ = node;
	    this.initExptFolderNode_ = 
		zippyTree.setExpanded(folders[2], 
				      this.initSubjFolderNode_)

	    //zippyTree.playFx();
	}

	nodeCount++;
	//window.console.log(this.ProjectTree_);
    }.bind(this))
}



/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {Array.<Array.string>>} The folder titles.
 * @private
 */
xiv.prototype.getFolderTitlesFromTreeNode_ = function(treeNode){
    
    //window.console.log(treeNode);

    var branch = this.ProjectTree_.getBranchFromEndNode(treeNode);
    var branchTitles = this.ProjectTree_.getBranchTitles(treeNode);
    var i = 0;
    goog.object.forEach(branch, function(treeNode, key){
	branchTitles[i] = gxnat.folderAbbrev[key] + ': ' + branchTitles[i];
	i++;
    })
    return branchTitles;
}


/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {Array.<Array.string>>} The folder collection/
 * @private
 */
xiv.prototype.createFoldersFromTreeNode_ = function(treeNode){
    var branchUris = this.ProjectTree_.getBranchUris(treeNode);    
    var branchTitles = this.getFolderTitlesFromTreeNode_(treeNode);
    //window.console.log(branchTitles, branchUris);
    this.addFoldersToGallery_(branchTitles, branchUris);
    return branchTitles;
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

    this.ProjectTree_.loadExperiments(path['originalUrl'], null, 
	function(exptNodes){

	    


	//
	// If we are in the init subject
	//
	if (path.pathByLevel('subjects') == 
	    this.initPath_.pathByLevel('subjects')  && 
	    this.initSubjectExpanding_){
	    //
	    // Set the subject node pertaining to the current data path
	    // to be on top
	    //
	    //window.console.log('\n\n\n*********', exptNodes);
	    var tempPath = this.initPath_.pathByLevel('experiments');
	    this.initExptNode_ = this.ProjectTree_.
		getExperimentNodeByUri(tempPath);
	    goog.array.remove(exptNodes, this.initExptNode_);
	    goog.array.insertAt(exptNodes, this.initExptNode_, 0);
	    this.initSubjectExpanding_ = false;
	    //window.console.log('\n\n\n*********', exptNodes);
	    
	}

	//
	// This will check for redundance.
	//
	goog.array.forEach(exptNodes, function(exptNode){
	    //window.console.log(exptNode);
	    this.createFoldersFromTreeNode_(exptNode);
	}.bind(this))

    }.bind(this), 'experiments');
}



/**
 * @param {!gxnat.Path} path The gxnat.Path object associated with the zippy.
 * @private
 */
xiv.prototype.onExperimentZippyExpanded_ = function(path) {
    this.loadExperiment_(path['originalUrl']);
}



/**
 * @private
 */
xiv.prototype.onZippyExpanded_ = function(e){
    if (!goog.isDefAndNotNull(e.node[xiv.ZIPPY_DATA_KEY])) { return };

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
 * @private
 */
xiv.prototype.loadExperiment_ = function(exptUrl, opt_callback) {

    //window.console.log("fetch viewable trees 1");

    //
    // Exit out if the experiment is loaded
    //
    if (!goog.isDefAndNotNull(this.loadedExperiments_)) { 
	this.loadedExperiments_ = [] 
    }
    else if (this.loadedExperiments_.indexOf(exptUrl) > -1) { 
	window.console.log('don\'t need to reload', exptUrl);
	return;
    };

    //
    // Get the experiment node
    //
    var exptNode = this.ProjectTree_.getExperimentNodeByUri(exptUrl);

    //
    // Get the node branch
    //
    var branch = this.ProjectTree_.getBranchFromEndNode(exptNode);

    //
    // Create the metadata object
    //
    var metadata = new gxnat.vis.ViewableTree.metadataCollection(
	branch['projects'][gxnat.ProjectTree.METADATA_KEY], 
	branch['subjects'][gxnat.ProjectTree.METADATA_KEY], 
	branch['experiments'][gxnat.ProjectTree.METADATA_KEY]);

    //
    // Get the viewable trees
    //
    this.fetchViewableTreesAtExperiment(exptUrl, function(){
	//window.console.log("fetch viewable trees");
	this.loadedExperiments_.push(exptUrl);
	if (goog.isDefAndNotNull(opt_callback)){
	    opt_callback();
	}

	if (this.initExperimentExpanding_){
	    //this.Modal_.getThumbnailGallery().getZippyTree().playFx();
	    this.initExperimentExpanding_ = false;

	    //
	    // Contract other experiments
	    //
	    goog.object.forEach(this.initSubjFolderNode_.getNodes(), 
				function(node){
				    
				}.bind(this))
	    
	    this.ProjectTree_.loadSubjects(null, function(subjNodes){
		//
		// Expand the init Subject's zippy and store that zippy 
		// to expand the experiment after
		//
		//window.console.log("SUBN JH", subjNode);
		goog.array.forEach(subjNodes, function(subjNode){
		    this.createFoldersFromTreeNode_(subjNode);
		}.bind(this))



		//
		// This updates the slider size
		//
		this.Modal_.getThumbnailGallery().mapSliderToContents();
	    }.bind(this))
	}
    }.bind(this), metadata);
  
}


/**
 * @private
 */
xiv.prototype.onZippyAdded_ = function(e) {
    var prevDur =
    e.node.getZippy().animationDuration;
    e.node.getZippy().animationDuration = 0;
    e.node.getZippy().animationDuration = prevDur;
}



/**
 * Sets the events to collapse any added zippys.
 *
 * @private
 */
xiv.prototype.collapseZippys_ = function() {
    if (!this.Modal_.getThumbnailGallery()) { return };
    goog.events.listen(this.Modal_.getThumbnailGallery().getZippyTree(),
       nrg.ui.ZippyTree.EventType.NODEADDED, this.onZippyAdded_.bind(this));
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
	popup.launchXImgView(dataPath, 'popup', serverRoot);
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
 * @private
 */
xiv.prototype.addFoldersToGallery_ = 
function(folders, opt_correspondingData){
    
    //window.console.log("ADD FOLDERS", folders);
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

    var endNode = this.ProjectTree_.getExperimentNodeByUri(
	    ViewableTree.getExperimentUrl());

    var folderPath = this.getFolderTitlesFromTreeNode_(endNode);
    
    
    //
    // Only add an additional folder if the ViewableTree is a slicer scene
    //
    if (ViewableTree.getCategory() != 'Scans'){
	folderPath.push(ViewableTree.getCategory());
    }
    
    ThumbGallery.createAndAddThumbnail(
	ViewableTree, // The viewable
	folderPath
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

    this.initPath_.dispose();
    delete this.initPath_;

    delete this.initExperimentExpanding_;
    delete this.initSubjectExpanding_;
    delete this.initProjNode_;
    delete this.initSubjNode_;
    delete this.initExptNode_;
    delete this.initProjFolderNode_;
    delete this.initSubjFolderNode_;
    delete this.initExptFolderNode_;

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
