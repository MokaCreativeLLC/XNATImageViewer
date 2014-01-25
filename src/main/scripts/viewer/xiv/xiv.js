/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.dom');
goog.require('goog.dom.fullscreen');
goog.require('goog.fx');
goog.require('goog.events');

// xtk
goog.require('X.loader');
goog.require('X.parserIMA');

// utils
goog.require('utils.fx');
goog.require('utils.style');
goog.require('utils.xnat');

// xiv
goog.require('xiv.Modal');
goog.require('xiv.PathSelector');




/**
 * This is the global XNAT Image Viewer 
 * object.
 *
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


    if (goog.isString(opt_iconUrl)){
	this.iconUrl_ =  opt_iconUrl;
    }


    /**
     * @type {!Array.string}
     * @private
     */
    this.dataPaths_ = [];



    /**
     * @type {!Object.<string, Array.<utils.xnat.viewableProperties>>}
     * @private
     */
    this.viewableProperties_ = {};



    /** 
     * @type {!xiv.Modal} 
     * @private
     */
    this.Modal_ = new xiv.Modal(this.iconUrl_);
    this.Modal_.setMode(mode);
    this.setModalButtonCallbacks_();
    window.onresize = function () { 
	this.Modal_updateStyle() 
    }.bind(this);



    /**
     * @type {!xiv.PathSelector}
     * @private
     */
    this.PathSelector_ = new xiv.PathSelector();

};
goog.exportSymbol('xiv', xiv);





/** 
 * @private
 * @type {!string} 
 */
xiv.prototype.iconUrl_ =  '';




/**
 * Begins the XNAT Image Viewer.
 * @public
 */
xiv.prototype.showModal = function(){
    this.Modal_.getElement().style.opacity = 0;
    goog.dom.append(document.body, this.Modal_.getElement());
    utils.fx.fadeInFromZero(this.Modal_.getElement(), 
			    xiv.ANIM_TIME);
}




/**
 * Begins the XNAT Image Viewer.
 * @param {function=} opt_callback
 * @public
 */
xiv.prototype.hideModal = function(opt_callback){
    utils.fx.fadeOut(this.Modal_.getElement(), 
    xiv.ANIM_TIME, opt_callback);
}




/**
 * @param {!string} path 
 * @param {!utils.xnat.viewableProperties} viewableProperty
 * @public
 */
xiv.prototype.addViewableProperty = function(path, viewableProperty) {
    if (!this.viewableProperties_.hasOwnProperty(path)){
	 this.viewableProperties_[path] = [];
    }
    this.viewableProperties_[path].push(viewableProperty);
};





/**
 * @param {!string} path
 * @param {!Array.<utils.xnat.viewableProperty>} viewableProperty
 * @public
 */
xiv.prototype.addViewableProperties = function(path, viewableProperties) {
    goog.array.forEach(viewableProperties, function(viewableProperty){
	this.addViewableProperty(viewableProperty);
    }.bind(this))
};




/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.prototype.addDataPath = function(path) {
    var updatedPath = (path[0] !== "/") ? "/" + path : path;
    this.dataPaths_.push(this.queryPrefix_ + updatedPath); 
}




/**
 * Returns the array of stored XNAT paths.
 *
 * @return {!Array.<string>} The array of stored XNAT paths.
 * @public
 */
xiv.prototype.getDataPaths = function() {
  return this.dataPaths_;
};




/**
 * Fades out then deletes the modal and all of its
 * child elements.
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
 * Begins the XNAT Image Viewer.
 * @private
 */
xiv.prototype.setModalButtonCallbacks_ = function(){
    this.Modal_.getButtons()['popup'].onclick = 
	this.makeModalPopup_.bind(this);
    this.Modal_.getButtons()['addXnatFolders'].onclick = 
	this.showPathSelector_.bind(this);
    this.Modal_.getButtons()['close'].onclick = 
	this.destroy.bind(this);
} 




/**
 * @private
 */
xiv.prototype.makeModalPopup_ = function(){

    var dataPaths = '';
    goog.array.forEach(this.dataPaths_, function(dataPath){
	dataPaths += dataPath + '&'
    })
    goog.window.popup(this.rootUrl_ 
		      + '/scripts/viewer/popup.html' 
		      + '?' 
		      + dataPaths);

    // Destroy
    this.destroy();

    // Reload window
    window.location.reload();
}




/**
 * @private
 */
xiv.prototype.showPathSelector_ = function(){
    utils.fx.fadeIn(this.PathSelector_.getElement());
}



/**
 * @private
 */
xiv.prototype.loadStoredProperties_ = function(){
    var key = /**@type {?string}*/null;
    var propsArr = /**@type {?Array.<utils.xnat.viewableProperties>}*/null;
    for (key in this.viewableProperties_) {
	propsArr = utils.xnat.sortViewableCollection(
	    this.viewableProperties_[key], 
	    ['sessionInfo', 'Scan', 'value', 0]);
	this.propertiesToThumbnails_(key, propsArr);
    }
}




/**
 * @param {!string | !array.<string>} key
 * @param {!Array.<utils.xnat.viewableProperties>} propertiesArr
 * @private
 */
xiv.prototype.addThumbsToModal_ = function(key, propertiesArr){
    goog.array.forEach(propertiesArr, function(viewableProperties){
	this.Modal_.addThumbnail(viewableProperties, 
	    goog.isArray(key) ? key: 
		xiv.deriveThumbnailFolders_(key));
    }.bind(this))
}





/**
 * Generates xiv.Thumbnail property objects for creating
 * thumbnails.
 *
 * @public
 */
xiv.prototype.loadThumbnails = function(){

    var slicerThumbnailsLoaded = /**@type {!boolean}*/false;
    var folders =/**@type {!Array.string}*/[];


    //------------------
    // Load stored properties first.
    //------------------ 
    this.loadStoredProperties_();


    //------------------
    // Get Viewables from XNAT server.
    // Scans xiv.Thumbnails first, then Slicer xiv.Thumbnails.
    //------------------  
    goog.array.forEach(this.dataPaths_, function(xnatPath){

	folders = xiv.deriveThumbnailFolders_(xnatPath);

	//
	// Begin with getting the scans first.
	//
	utils.xnat.getScans(xnatPath, function(scanProps){

	    this.addViewableProperty(xnatPath, scanProps);

	    this.addThumbsToModal_(folders.slice(0).push('scans'), 
				       scanProps);

	    if (!slicerThumbnailsLoaded) {
		// Then, get the slicer files.
		utils.xnat.getSlicer(xnatPath, function(slicerProps){
		   
		    this.addViewableProperty(xnatPath, slicerProps);

		    this.addThumbsToModal_(folders.slice(0).push('Slicer'), 
					       slicerProps);

		}.bind(this));
		slicerThumbnailsLoaded = true;
	    }
	}.bind(this));
    }.bind(this))
}




/**
 * @param {!string} path
 * @private
 */
xiv.deriveThumbnailFolders_ = function(path){
    var pathObj = utils.xnat.getPathObject(path);
    var folders = [];
    for (key in pathObj){ 
	if (goog.isDefAndNotNull(pathObj[key]) && 
	    key !== 'prefix'){
	    folders.push(utils.xnat.folderAbbrev[key] 
			 + ": " + pathObj[key]) 
	}
    };
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



/**
 * The main start function to load
 * up the XNAT Image Viewer.  Sets global URIs
 * (so as to load the thumbnails from a given experiment)
 * and brings up the modal accordingly.
 *
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
			      utils.xnat.getQueryPrefix(xnatServerRoot),
			      imagePath);
    imageViewer.addDataPath(dataPath); 
    imageViewer.showModal();
    //imageViewer.loadThumbnails();
};
goog.exportSymbol('xiv.startViewer', xiv.startViewer)




xiv.ANIM_TIME = /**@const*/ 300;
