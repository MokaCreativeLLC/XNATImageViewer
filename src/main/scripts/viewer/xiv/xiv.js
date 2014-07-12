/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */
goog.provide('xiv');
goog.provide('xiv.start');

// goog
goog.require('goog.labs.userAgent.browser');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.window');
goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.events.EventType');

// X
goog.require('X.loader');
goog.require('X.parserIMA');

// nrg
goog.require('nrg.fx');
goog.require('nrg.ui.ErrorDialog');
goog.require('nrg.ui.ZippyNode');

// gxnat
goog.require('gxnat');
goog.require('gxnat.Path');
goog.require('gxnat.ProjectTree');
goog.require('gxnat.vis.AjaxViewableTree');
goog.require('gxnat.vis.ViewableTree');
goog.require('gxnat.vis.Scan');
goog.require('gxnat.vis.Slicer');



/**
 * @constructor
 */
xiv = function(){}
goog.exportSymbol('xiv', xiv);




/**
 * The main XNAT Image Viewer class.
 * @param {!state} xivState The state of XIV ('live' or 'demo').
 * @param {!string} modalState The state of the xiv's Modal object.
 * @param {!string} dataPath The data path to begin viewable query from.
 * @param {!string} rootUrl The serverRoot.
 * @extends {goog.Disposable}
 * @constructor
 */
xiv.start = function(xivState, modalState, dataPath, rootUrl){
    //
    // Superclass init
    //
    goog.base(this);


    // 
    // Load the custom extensions
    //
    xiv.start.loadCustomExtensions();


    //
    // Adjust the document style (this gets reverted when we close out
    // of the viwer)
    //
    xiv.start.adjustDocumentStyle();


    /**
     * @const
     * @private
     * @type {!Object.<string, gxnat.vis.ViewableTree>}
     */
    this.ViewableTypes_ = {
	scan: gxnat.vis.Scan,
	slicer: gxnat.vis.Slicer,
    }


    /**
     * @type {!boolean}
     * @private
     */
    this.currState_ = goog.isDefAndNotNull(xivState) ? xivState : 
	xiv.start.States.DEMO;


    /**
     * @type {!string}
     * @private
     */
    this.modalState_ = modalState;


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


    //
    // Add the data path
    //
    this.addDataPath_(dataPath);

};
goog.inherits(xiv.start, goog.Disposable);
goog.exportSymbol('xiv.start', xiv.start);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.start.EventType = {
  ADD_SUBJECTS: goog.events.getUniqueId('add_subjects')
}



/**
 * @enum {string}
 * @expose  
 */
xiv.start.ModalStates = {
    FULLSCREEN: 'fullscreen',
    POPUP: 'popup',
    FULLSCREEN_POPUP: 'fullscreen-popup',
    WINDOWED: 'windowed',
    DEMO: 'demo',
    DEMO_FULLSCREEN: 'demp-fullscreen',
}



/**
 * @enum {string}
 * @expose
 */
xiv.start.States = {
    DEMO: 'demo',
    LIVE: 'live'
}


/**
 * @public
 */
xiv.start.loadCustomExtensions = function() {
    X.loader.extensions['IMA'] = [X.parserIMA, null];
}



/**
 * @public
 */
xiv.start.adjustDocumentStyle = function() {
    document.body.style.overflow = 'hidden';
}



/**
 * @private
 */
xiv.start.revertDocumentStyle_ = function() {
    document.body.style.overflow = 'visible';
}



/**
 * @type {!string}
 * @private 
 * @const
 */
xiv.start.prototype.zippyDataKey_ = goog.string.createUniqueString();



/** 
 * @type {!number}
 * @private 
 * @const
 */
xiv.start.prototype.animTime_ = 300;



/**
 * @const
 * @type {!number}
 * @private
 */
xiv.start.prototype.introTabSlideTime_ = 1000;



/**
 * @type {gxnat.Path}
 * @private
 */
xiv.start.prototype.initPath_;



/** 
 * @type {nrg.ui.Component} 
 * @private
 */
xiv.start.prototype.Modal_;



/**
 * @type {gxnat.ProjectTree}
 * @private
 */
xiv.start.prototype.ProjectTree_;



/**
 * @type {string}
 * @private
 */
xiv.start.prototype.serverRoot_;



/**
 * @type {Array.string}
 * @private
 */
xiv.start.prototype.dataPaths_;



/** 
 * @type {Object.<string, Array.<gxnat.vis.ViewableTree>>}
 * @private
 */
xiv.start.prototype.ViewableTrees_;



/** 
 * @type {Array.<!string>}
 * @private
 */
xiv.start.prototype.loadedExperiments_;



/** 
 * @type {gxnat.ProjectTree.TreeNode}
 * @private
 */
xiv.start.prototype.initProjNode_;



/** 
 * @type {gxnat.ProjectTree.TreeNode}
 * @private
 */
xiv.start.prototype.initSubjNode_;



/** 
 * @type {gxnat.PrjectTree.TreeNode}
f * @private
 */
xiv.start.prototype.initExptNode_;


/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.start.prototype.initProjFolderNode_;



/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.start.prototype.initSubjFolderNode_;



/** 
 * @type {nrg.ui.ZippyNode}
 * @private
 */
xiv.start.prototype.initExptFolderNode_;



/** 
 * @type {!boolean}
 * @private
 */
xiv.start.prototype.initExptExpanding_ = false;



/** 
 * @type {!boolean}
 * @private
 */
xiv.start.prototype.initSubjExpanding_ = false;



/**
 * @type {string}
 * @private
 */
xiv.start.prototype.serverRoot_;



/**
 * @param {!string} _serverRoot
 * @public
 */
xiv.start.prototype.setServerRoot = function(_serverRoot) {
    this.serverRoot_ = _serverRoot
}



/**
 * @public
 */
xiv.start.prototype.begin = function() {
    //
    // Create the modal
    //
    this.createModal_();
    //
    // Show the modal
    //
    this.show();

    //
    // Demo load chain
    //
    if (this.currState_ == xiv.start.States.DEMO){
	//
	// Remove the popup (we don't need it)
	//
	goog.dom.removeNode(this.Modal_.getPopupButton());
	goog.dom.removeNode(this.Modal_.getCloseButton());

	//
	// Load the tree only when the tab is done with its init move
	//
	var timer = goog.Timer.callOnce(function(){
	    delete timer;
	    this.startDemoLoadChain_();
	}.bind(this), this.introTabSlideTime_);
	return;

    } 

    //
    // Set the state to windowed
    //
    this.Modal_.setState(this.modalState_);
    //
    // Live load chain
    //
    this.startLiveLoadChain_();
}



/**
 * @param {nrg.ui.Component} modalType
 * @public
 */
xiv.start.prototype.setModalType = function(modalType){
    this.modalType_ = modalType;
}



/**
 * Creates the modal element.
 *
 * @private
 */
xiv.start.prototype.createModal_ = function(){
    //
    // Create new Modal object
    //
    this.Modal_ = new this.modalType_();
    //window.console.log(xiv.start.ui);
    //window.console.log(xiv.start.ui.Modal);
    //this.Modal_ = new xiv.start.ui.Modal();

    //
    // Set the image prefix of the modal
    //
    this.Modal_.setImagePrefix(serverRoot);

    //
    // Listen for the addSubjects event
    //
    goog.events.listen(this.Modal_, 
		       xiv.start.EventType.ADD_SUBJECTS,
		       this.onModalAddSubjectsClicked_.bind(this));

    //
    // Link window's onresize to Modal's updateStyle
    //
    window.onresize = function () {
	if (goog.isDefAndNotNull(this.Modal_)){
	    this.Modal_.updateStyle();
	} 
    }.bind(this);
}




/**
 * @private
 */
xiv.start.prototype.onModalAddSubjectsClicked_ = function() {
    this.ProjectTree_.loadSubjects(null, function(subjNodes){
	//
	// Expand the init Subject's zippy and store that zippy 
	// to expand the experiment after
	//
	//window.console.log("SUBN JH", subjNode);
	goog.array.forEach(subjNodes, function(subjNode){
	    this.createFoldersFromTreeNode_(subjNode);
	    //
	    // This updates the slider size
	    //
	    this.Modal_.getThumbnailGallery().mapSliderToContents();
	}.bind(this))
    }.bind(this))
}




/**
 * Begins the XNAT Image Viewer.
 *
 * @param {Function=} opt_callback
 * @public
 */
xiv.start.prototype.show = function(opt_callback){
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
    this.Modal_.getProjectTab().setExpanded(true, 0, this.introTabSlideTime_);

    //
    // Important that this be here
    //
    nrg.fx.fadeInFromZero(this.Modal_.getElement(), this.animTime_);

}



/**
 * @private
 */
xiv.start.prototype.startDemoLoadChain_ = function(){
    var ThumbGallery = this.Modal_.getThumbnailGallery();
    var sampleDatasets = {
	'slicer':  (new xiv.sampleData.SlicerScenes()).getSamples(), 
	'scan' : (new xiv.sampleData.Scans()).getSamples()
    }    
    var viewable;

    goog.object.forEach(sampleDatasets, function(sampleData, key){
	goog.array.forEach(sampleData, function(sample){
	    //window.console.log(sample, key);
	    viewable = (key == 'scan') ? new this.ViewableTypes_.scan() :
		new this.ViewableTypes_.slicer();
	    viewable.addFiles(sample.files);
	    viewable.setFilesGotten(true);
	    viewable.setSessionInfo(sample.metadata);
	    viewable.setThumbnailUrl(sample.thumbnail);
	    this.addViewableTreeToModal_(viewable, sample.folders);
	}.bind(this))
    }.bind(this))

    ThumbGallery.getZippyTree().expandAll();
    /**
    var thumb = ThumbGallery.createAndAddThumbnail(
	ViewableTree, // The viewable
	folderPath
    );
    ThumbGallery.setHoverParent(this.Modal_.getElement());
    thumb.setImage(ViewableTree.getThumbnailUrl());
    thumb.updateHoverable();
    */
}



/**
 * @private
 */
xiv.start.prototype.startLiveLoadChain_ = function(){

    //
    // Get the modal's zippy tree
    //
    var zippyTree = this.Modal_.getThumbnailGallery().getZippyTree();
    var nodeCount = 0;

    //
    // Make sure everything is collapsed
    //
    this.collapseZippys_();


    //
    // Create the project tree
    //
    this.ProjectTree_ = new gxnat.ProjectTree(this.dataPaths_[0]);
    this.ProjectTree_.loadInitBranch(function(node){

	//
	// Create zippy folders
	//
	var folders = this.createFoldersFromTreeNode_(node);

	//
	// For the first project
	//
	if (nodeCount == 0){
	    this.initProjNode_ = node;
	    this.initProjFolderNode_ = zippyTree.setExpanded(folders[0])
	}

	//
	// For the first scan
	//
	if (nodeCount == 1){
	    this.initSubjExpanding_ = true;
	    this.initSubjNode_ = node;
	    this.initSubjFolderNode_ = zippyTree.setExpanded(folders[1], 
						this.initProjFolderNode_)
	}

	//
	// For the first project
	//
	if (nodeCount == 2){
	    this.initExptExpanding_ = true;
	    this.initExptNode_ = node;
	    this.initExptFolderNode_ = 
		zippyTree.setExpanded(folders[2], 
				      this.initSubjFolderNode_)
	}
	nodeCount++;
    }.bind(this))
}



/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {Array.<Array.string>>} The folder titles.
 * @private
 */
xiv.start.prototype.getFolderTitlesFromTreeNode_ = function(treeNode){
    
    //window.console.log(treeNode);

    var branch = this.ProjectTree_.getBranchFromEndNode(treeNode);
    var branchTitles = this.ProjectTree_.getBranchTitles(treeNode);
    var i = 0;
    goog.object.forEach(branch, function(treeNode, key){
	branchTitles[i] = 
	    '<font color="black"><b>' + key.toUpperCase() 
	    + ':</b></font>&nbsp&nbsp&nbsp&nbsp&nbsp' + branchTitles[i];

	//window.console.log(branchTitles[i]);
	i++;
    })
    return branchTitles;
}


/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {Array.<Array.string>>} The folder collection
 * @private
 */
xiv.start.prototype.createFoldersFromTreeNode_ = function(treeNode){
    var branchUris = this.ProjectTree_.getBranchUris(treeNode);    
    var branchTitles = this.getFolderTitlesFromTreeNode_(treeNode);
    //window.console.log(branchTitles, branchUris);
    this.addFoldersToGallery_(branchTitles, branchUris);
    return branchTitles;
}




/**
 * @param {!gxnat.Path} path The gxnat.Path object associated with the zippy.
 * @private
 */
xiv.start.prototype.onSubjectZippyExpanded_ = function(path) {
    //window.console.log(path, path.getDeepestLevel());

    //
    // Begin the loadExperiments sequence...
    //
    this.ProjectTree_.loadExperiments(path['originalUrl'], null, 
	function(exptNodes){

	//
	// If we are in the init subject, then... 
	//
	if (path.pathByLevel('subjects') == 
	    this.initPath_.pathByLevel('subjects')  && 
	    this.initSubjExpanding_){

	    //
	    // We set the experiment node pertaining to the current data path
	    // to be on top of ALL other experiments
	    //

	    //window.console.log('\n\n\n*********', exptNodes);
	    var tempPath = this.initPath_.pathByLevel('experiments');
	    this.initExptNode_ = this.ProjectTree_.
		getExperimentNodeByUri(tempPath);
	    goog.array.remove(exptNodes, this.initExptNode_);
	    goog.array.insertAt(exptNodes, this.initExptNode_, 0);
	    this.initSubjExpanding_ = false;
	    //window.console.log('\n\n\n*********', exptNodes);
	    
	}

	//
	// Then, we create folders from tree node.
	// This will also check for redundance.
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
xiv.start.prototype.onExperimentZippyExpanded_ = function(path) {
    this.loadExperiment_(path['originalUrl']);
}



/**
 * @private
 */
xiv.start.prototype.onZippyExpanded_ = function(e){
    if (!goog.isDefAndNotNull(e.node[this.zippyDataKey_])) { return };
    var path = new gxnat.Path(e.node[this.zippyDataKey_]);
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
xiv.start.prototype.setOnZippyExpanded_ = function() {
    goog.events.listen(this.Modal_.getThumbnailGallery().getZippyTree(),
	nrg.ui.ZippyNode.EventType.EXPANDED, this.onZippyExpanded_.bind(this));
}




/**
 * Hides the XNAT Image Viewer.
 *
 * @param {function=} opt_callback The callback once the hide animation
 *     finishes.
 * @public
 */
xiv.start.prototype.hide = function(opt_callback){
    nrg.fx.fadeOut(this.Modal_.getElement(), this.animTime_, opt_callback);
}



/**
 * Sets the governing XNAT Path from which all file IO occurs.
 *
 * @param {!string} path The XNAT path to set for querying.
 * @private
 */
xiv.start.prototype.addDataPath_ = function(path) {

    this.dataPaths_ = this.dataPaths_ ? this.dataPaths_ : [];


    var updatedPath = (path[0] !== "/") ? "/" + path : path;

    if (this.dataPaths_.indexOf(this.queryPrefix_ + updatedPath) === -1) {
	var finalPath = (updatedPath.indexOf(this.queryPrefix_) === -1) ?
	    this.queryPrefix_ + updatedPath : updatedPath;
	this.dataPaths_.push(finalPath); 
    }

    if (this.dataPaths_.length == 1){
	this.initPath_ = new gxnat.Path(this.dataPaths_[0]);
    }
}



/**
 * Fades out then disposes xiv.
 *
 * @public
 */
xiv.start.prototype.dispose = function() {
    this.hide(this.dispose_.bind(this));
}



/**
 * @param {!string} exptUrl The experiment url to load the vieables from.
 * @param {Function=} opt_callback The optional callback.
 * @private
 */
xiv.start.prototype.loadExperiment_ = function(exptUrl, opt_callback) {

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
    this.fetchViewableTreesAtExperiment_(exptUrl, function(){
	//window.console.log("fetch viewable trees");
	this.loadedExperiments_.push(exptUrl);
	if (goog.isDefAndNotNull(opt_callback)){
	    opt_callback();
	}

	if (this.initExptExpanding_){
	    //this.Modal_.getThumbnailGallery().getZippyTree().playFx();
	    this.initExptExpanding_ = false;

	    //
	    // Contract other experiments
	    //
	    goog.object.forEach(this.initSubjFolderNode_.getNodes(), 
				function(node){
				    
				}.bind(this))
	}
    }.bind(this), metadata);
  
}


/**
 * @private
 */
xiv.start.prototype.onZippyAdded_ = function(e) {
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
xiv.start.prototype.collapseZippys_ = function() {
    if (!this.Modal_.getThumbnailGallery()) { return };
    goog.events.listen(this.Modal_.getThumbnailGallery().getZippyTree(),
       nrg.ui.ZippyTree.EventType.NODEADDED, this.onZippyAdded_.bind(this));
}



/**.
 * @private
 */
xiv.start.prototype.setModalButtonCallbacks_ = function(){
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
xiv.start.prototype.createModalPopup_ = function(){
    //
    // Create the popup
    //
    //alert(this.queryPrefix_, this.dataPaths_[0].split(this.queryPrefix_));
    var popup = open(this.rootUrl_ + '/scripts/viewer/xiv/popup.html?' + 
		     this.dataPaths_[0],//.split(this.queryPrefix_)[1], 
		   'XImgView', 'width=1200,height=800');
    popup.focus();

    //
    // Set the popup to re-launch the image viewere once opened
    //
    var dataPath = this.dataPaths_[0];
    var pOnload = function() {
	popup.launchXImgView(dataPath, xiv.start.ModalStates.POPUP, serverRoot);
    }
    popup.onload = pOnload.bind(this);

    //
    // Dispose of the existing
    //
    this.dispose();
}



/**
 * Gets the viewables from the xnat server.
 * @param {!string} viewablesUri The uri to retrieve the viewables from.
 * @param {Function=} opt_doneCallback To the optional callback to run once the
 *     viewables have been fetched.
 * @param {Object=} opt_metadata
 * @private
 */
xiv.start.prototype.fetchViewableTreesAtExperiment_ = 
function(exptUri, opt_doneCallback, opt_metadata){
    //window.console.log(exptUri);
    //window.console.log(exptUri.split('/experiments/'))
    // var subjectMetadata = gxnat.jsonGet(exptUri.split('/experiments/')[0]);
    //window.console.log(subjectMetadata);

    this.getViewableTreesFromXnat_(exptUri, function(ViewableTree){

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
		this.addViewableTreeToModal_(ViewableTree);
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
xiv.start.prototype.addFoldersToGallery_ = 
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
	    if (!goog.isDefAndNotNull(node[this.zippyDataKey_])){
		node[this.zippyDataKey_] = opt_correspondingData[i];
		//window.console.log('CORRESP', node.getTitle(), 
		//		   node[this.zippyDataKey_]);
	    }
	}
    }.bind(this))
}



/**
 * Adds a viewable to the modal.
 *
 * @param {gxnat.vis.ViewableTree} ViewableTree The Viewable to add.
 * @param {!Array.<string>=} opt_folderList The optional folders.  They're 
 *    derived from the ViewableTree argument, otherwise.
 * @private
 */
xiv.start.prototype.addViewableTreeToModal_ = 
function(ViewableTree, opt_folderList){
    //window.console.log("Add Viewable Tree to Modal", ViewableTree, 
    //opt_folderList);

    //
    // Get the thumbnail gallery
    //
    var ThumbGallery = this.Modal_.getThumbnailGallery();

    //
    // Do nothing if there's no thumbnail gallery
    //
    if (!goog.isDefAndNotNull(ThumbGallery)) { return };


    //
    // Derive the folderList if it's not provided
    //
    if (!goog.isDefAndNotNull(opt_folderList) &&
	goog.isDefAndNotNull(this.ProjectTree_)){
	//
	// Get the experiment node of the ViewableTree
	//
	var endNode = this.ProjectTree_.getExperimentNodeByUri(
	    ViewableTree.getExperimentUrl());
	opt_folderList = this.getFolderTitlesFromTreeNode_(endNode);
    }


    //
    // Only add an additional folder if the ViewableTree is a slicer scene
    //
    if (ViewableTree.getCategory() != 'Scans'){
	opt_folderList.push(ViewableTree.getCategory());
    }

    //
    // IMPORTANT!!
    // 
    // Query for the fileList of the ViewableTree.  Once the files have been
    // retrieved, then we add the ViewableTree to the thumbnail gallery.
    //
    ViewableTree.getFileList(function(){

	//
	// IMPORTANT!!! 
	//
	// Filters out empty ViewableTrees!!
	//
	if (ViewableTree.getViewableGroups().length > 0){
	    
	    //
	    // Create and add the thumbnail, with its folders
	    //
	    var thumb = ThumbGallery.createAndAddThumbnail(
		ViewableTree, opt_folderList);

	    //
	    // Expand any non-scan folders (e.g. Slicer)
	    //
	    if (ViewableTree.getCategory() != 'Scans'){
		var folderNodes = ThumbGallery.getZippyTree().
				   getFolderNodes(opt_folderList);
		if (opt_folderList.length > 0 && folderNodes.length > 1){

		    ThumbGallery.setExpanded(
			opt_folderList[opt_folderList.length -1],  
			folderNodes[folderNodes.length - 2]);
		}
	    }

	    //
	    // Set the hoverable parent for the thumbnail gallery.
	    // TODO: Determine if this needs to be called *every* time (?)
	    //
	    ThumbGallery.setHoverParent(this.Modal_.getElement());

	    //
	    // Set the thumbnail's image.
	    //
	    thumb.setImage(ViewableTree.getThumbnailUrl());

	    //
	    // Update the hoverable of the thumbnail for positioning.
	    //
	    thumb.updateHoverable();
	}
    }.bind(this))
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
xiv.start.prototype.storeViewableTree_ = function(ViewableTree, path, opt_onStore) {
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
xiv.start.prototype.dispose_ = function() {

    // Call superclass dispose.
    xiv.start.superClass_.dispose.call(this)

    // Revert the document.
    xiv.start.revertDocumentStyle_();

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
    
    if (goog.isDefAndNotNull(this.initPath_)){
	this.initPath_.dispose();
	delete this.initPath_;
    }

    delete this.initExptExpanding_;
    delete this.initSubjExpanding_;
    delete this.initProjNode_;
    delete this.initSubjNode_;
    delete this.initExptNode_;
    delete this.initProjFolderNode_;
    delete this.initSubjFolderNode_;
    delete this.initExptFolderNode_;

    // Modal
    goog.events.removeAll(this.Modal_);
    this.Modal_.dispose();
    goog.dom.removeNode(this.Modal_.getElement());
    delete this.Modal_;
}




/**
 * Retrieves viewables, one-by-one, for manipulation in the opt_runCallback
 * argument, and when complete the opt_doneCallback.
 * 
 * @param {!string} url The url to retrieve the viewables from.
 * @param {function=} opt_runCallback The optional callback applied to each 
 *     viewable.
 * @param {function=} opt_doneCallback The optional callback applied to each 
 *     when retrieval is complete.
 * @private
 */
xiv.start.prototype.getViewableTreesFromXnat_ = 
function (url, opt_runCallback, opt_doneCallback) {

    //
    // Get the viewable types (e.g. Scans and Slicer scenes);
    // 
    var typeCount = goog.object.getCount(this.ViewableTypes_);
    var typesGotten = 0;

    //
    // Loop through the types
    //
    goog.object.forEach(this.ViewableTypes_, function(viewableType){

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



goog.exportSymbol('xiv.start.States', xiv.start.States);
goog.exportSymbol('xiv.start.loadCustomExtensions', 
		  xiv.start.loadCustomExtensions);
goog.exportSymbol('xiv.start.adjustDocumentStyle', 
		  xiv.start.adjustDocumentStyle);
goog.exportSymbol('xiv.start.ModalStates', xiv.start.ModalStates);
goog.exportSymbol('xiv.start.checkForWebGL', xiv.start.checkForWebGL);
goog.exportSymbol('xiv.start.isCompatible', xiv.start.isCompatible);
goog.exportSymbol('xiv.start.prototype.setServerRoot', 
		  xiv.start.prototype.setServerRoot);
goog.exportSymbol('xiv.start.prototype.setModalType', 
		  xiv.start.prototype.setModalType);
goog.exportSymbol('xiv.start.prototype.begin', xiv.start.prototype.begin);
goog.exportSymbol('xiv.start.prototype.show', xiv.start.prototype.show);
goog.exportSymbol('xiv.start.prototype.hide', xiv.start.prototype.hide);
goog.exportSymbol('xiv.start.prototype.dispose', xiv.start.prototype.dispose);



//
// These functions are accessed outside of the scope of the application,
// which is why we have to export them to the global scope
//
window['xiv.start.isCompatible'] = xiv.start.isCompatible;
window['xiv.start.checkForWebGL'] = xiv.start.checkForWebGL;
window['xiv.start.ModalStates'] = xiv.start.ModalStates;
xiv.start.prototype['setServerRoot'] = xiv.start.prototype.setServerRoot;
xiv.start.prototype['begin'] = xiv.start.prototype.begin;

