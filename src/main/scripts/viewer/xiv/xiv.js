/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

// goog
goog.require('goog.fx');
goog.require('goog.events');

// utils
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
 * @param {!string} dataPath
 * @param {!string} rootUrl
 * @param {!string} iconUrl
 * @param {!string} xnatQueryPrefix
 * @constructor
 */
goog.provide('xiv');
var xiv = function(mode, dataPath, rootUrl, iconUrl, xnatQueryPrefix){

    /**
     * @type {!Array.string}
     * @private
     */
    this.queryPrefix_ = xnatQueryPrefix;



    /** 
     * @private
     * @type {!string} 
     */
    this.rootUrl_ = rootUrl;



    /** 
     * @private
     * @type {!string} 
     */
    this.dataPath_ = dataPath;



    /** 
     * @private
     * @type {!string} 
     */
    this.iconUrl_ = iconUrl;



    /**
     * @type {!Array.string}
     * @private
     */
    this.xnatPaths_ = [];



    /**
     * @type {!Object.<string, Array.<utils.xnat.viewableProperties>>}
     * @private
     */
    this.viewableProperties_ = {};





    /** 
     * @type {!xiv.Modal} 
     * @private
     */
    this.Modal_ = new xiv.Modal('windowed', this.iconUrl_);




    /**
     * @type {!xiv.PathSelector}
     * @private
     */
    this.PathSelector_ = new xiv.PathSelector(this);



    //
    // Setup
    //
    window.onresize = function () { 
	this.updateStyle() 
    }.bind(this); 



    //
    // Store path
    //
    this.addXnatPath(dataPath);

};
goog.exportSymbol('xiv', xiv);





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
 * Returns the array of stored XNAT paths.
 *
 * @return {!Array.<string>} The array of stored XNAT paths.
 * @public
 */
xiv.prototype.getXnatPaths = function() {
  return this.xnatPaths_;
};





/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.prototype.addXnatPath = function(path) {
    var updatedPath = (path[0] !== "/") ? "/" + path : path;
    this.xnatPaths_.push(this.queryPrefix_ + updatedPath); 
}




/**
 * @private
 */
xiv.prototype.makeModalPopup_ = function(){
    goog.window.popup(this.rootUrl_ 
		      + '/scripts/viewer/popup.html' 
		      + '?' 
		      + this.dataPath_);
    this.destroy();
    window.location.reload();
}




/**
 * @private
 */
xiv.prototype.showPathSelector_ = function(){
    utils.fx.fadeIn(this.PathSelector_.getElement());
}






/**
 * @expose
 * Begins the XNAT Image Viewer.
 * @public
 */
xiv.prototype.begin = function(){

    
    this.Modal_.getButtons()['popup'].onclick = this.makeModalPopup_.bind(this);
    this.Modal_.getButtons()['addXnatFolders'].onclick = this.showPathSelector_.bind(this);
    this.Modal_.getButtons()['close'].onclick = this.destroy.bind(this);
    


    //this.loadThumbnails(); 


    //
    // Hide the popup if we're already in popup mode.
    //
    /*
    if (this.mode_ === 'popup'){
	button.style.visibility = 'hidden';
    }
    */


    this.Modal_.getElement().style.opacity = 0;
    goog.dom.append(document.body, this.Modal_.getElement());
    utils.fx.fadeInFromZero(this.Modal_.getElement(), 500);
}





/**
 * Fades out then deletes the modal and all of its
 * child elements.
 * @public
 */
xiv.prototype.destroy = function () {
    utils.fx.fadeOut(this.Modal_.getElement(), 300, function () {
	try{ 
	    this.Modal_.getElement().parentNode.removeChild(this.Modal_.getElement());
	    delete this.Modal_.getElement();
	}
	catch(e) {}
    }.bind(this));



    //------------------
    // NOTE: This is in response to xiv.start()
    // where it's set to hidden to prevent
    // Webkit-based browsers from scrolling.
    //------------------
    document.body.style.overflow = 'visible';
}




/**
 * @param {!string} path
 * @private
 */
xiv.deriveThumbnailFolders_ = function(path){
    var pathObj = utils.xnat.getPathObject(path);
    var folders = [];
    for (key in pathObj){ 
	if (goog.isDefAndNotNull(pathObj[key]) && key !== 'prefix'){
	    folders.push(utils.xnat.folderAbbrev[key] + ": " + pathObj[key]) 
	}
    };
    return folders;
}




/**
 * @private
 */
xiv.prototype.loadStoredProperties_ = function(){
    var key = /**@type {?string}*/null;
    var propsArr = /**@type {?Array.<utils.xnat.viewableProperties>}*/null;
    for (key in this.viewableProperties_) {
	propsArr = utils.xnat.sortViewableCollection(this.viewableProperties_[key], 
						     ['sessionInfo', 'Scan', 'value', 0]);
	this.propertiesToThumbnails_(key, propsArr);
    }
}




/**
 * @param {!string | !array.<string>} key
 * @param {!Array.<utils.xnat.viewableProperties>} propertiesArr
 * @private
 */
xiv.prototype.propertiesToThumbnails_ = function(key, propertiesArr){
    goog.array.forEach(propertiesArr, function(viewableProperties){
	this.Modal_.addThumbnail(viewableProperties, 
	    goog.isArray(key) ? key: xiv.deriveThumbnailFolders_(key));
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
    goog.array.forEach(this.xnatPaths_, function(xnatPath){

	folders = xiv.deriveThumbnailFolders_(xnatPath);

	//
	// Begin with getting the scans first.
	//
	utils.xnat.getScans(xnatPath, function(scanProps){

	    this.addViewableProperty(xnatPath, scanProps);

	    this.propertiesToThumbnails_(folders.slice(0).push('scans'), 
					 scanProps);

	    if (!slicerThumbnailsLoaded) {
		// Then, get the slicer files.
		utils.xnat.getSlicer(xnatPath, function(slicerProps){
		   
		    this.addViewableProperty(xnatPath, slicerProps);

		    this.propertiesToThumbnails_(folders.slice(0).push('Slicer'), 
						 slicerProps);

		}.bind(this));
		slicerThumbnailsLoaded = true;
	    }
	}.bind(this));
    }.bind(this))
}









