/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */


/**
 * Google closure includes.
 */
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.array');


/**
 * XTK includes.
 */
goog.require('X.sphere');


/**
 * utils includes.
 */
goog.require('utils.string');
goog.require('utils.slicer');
goog.require('utils.style');
goog.require('utils.xtk');
goog.require('utils.xtk.ControllerMenu');
goog.require('utils.convert');
goog.require('utils.dom');


/**
 * xiv includes.
 */
goog.require('xiv.ViewBox');
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.XtkPlaneManager');
goog.require('xiv.Displayer');
goog.require('xiv.Thumbnail');





/**
 * xiv.XtkDisplayer is a subclass of the 'xiv.Displayer' class and calls on 
 * Xtk-specific methods to allow for the viewing of data (it leverages
 * xtk-utils to load in XObjects) in a given xiv.ViewBox.
 *
 * @constructor
 * @param {xiv.ViewBox, Object=}
 * @extends {xiv.Displayer}
 */
goog.provide('xiv.XtkDisplayer');
xiv.XtkDisplayer = function(ViewBox) {

    //------------------
    // Call parents, set class
    //------------------  
    xiv.Displayer.call(this, 'xiv.XtkDisplayer');
    goog.dom.classes.set(this._element, xiv.XtkDisplayer.ELEMENT_CLASS);



    //------------------
    // Reset property arrays and objects
    //------------------  
    this.currentViewables_ = {};
    this.currentViewablesSettings_ = {};
    this.onloadCallbacks_ = [];
    this.preloadCallbacks_ = [];



    //------------------
    // ViewBox
    //------------------  
    this.ViewBox_ = ViewBox;



    //------------------
    // XtkPlaneManager
    //------------------  
    this.XtkPlaneManager_ = new xiv.XtkPlaneManager(this);



    //------------------
    // Set the initial onload callbacks.
    //------------------  
    this.onloadCallbacks_.push(function(){
	this.ControllerMenu_ = new utils.xtk.ControllerMenu(this);
	this.ControllerMenu_.makeControllerMenu(this.currentViewables_);
	this.syncControllerMenuToViewables_();
    }.bind(this))
	

}
goog.inherits(xiv.XtkDisplayer, xiv.Displayer);
goog.exportSymbol('xiv.XtkDisplayer', xiv.XtkDisplayer);




xiv.XtkDisplayer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
xiv.XtkDisplayer.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.XtkDisplayer.CSS_CLASS_PREFIX, '');




/**
 * @type {?xiv.XtkPlaneManager}
 * @protected
 */
xiv.XtkDisplayer.prototype.XtkPlaneManager_ = null;


/**
 * @type {?xiv.ViewBox}
 * @private
 */    
xiv.XtkDisplayer.prototype.ViewBox_ = null;



/**
 * @return {xiv.ViewBox}
 */    
xiv.XtkDisplayer.prototype.getViewBox = function() {
    return this.ViewBox_;
}



/**
 * Returns the ViewPlane elements (not the classes) for
 * animations, and style changes. 
 *
 * @return {Array.Element}
 */    
xiv.XtkDisplayer.prototype.getViewPlaneElements = function() {
    return this.XtkPlaneManager_.getXtkPlaneElements();
}



/**
 * Returns the ViewPlane interactor elements (not the classes) for
 * animations, and style changes. In general, these are the sliders
 * but they could hypothetically be any interactor element.
 *
 * @type {Array.Element}
 */    
xiv.XtkDisplayer.prototype.getViewPlaneInteractors = function() {
    return this.XtkPlaneManager_.getXtkPlaneInteractors();
}



/**
 * @private
 * @type {!Array.function}
 */ 
xiv.XtkDisplayer.prototype.preloadCallbacks_ = null;




/**
 * @param {function}
 */ 
xiv.XtkDisplayer.prototype.addPreloadCallback = function(callback){
    this.preloadCallbacks_.push(callback);
};




/**
 * @return {Array.function}
 */ 
xiv.XtkDisplayer.prototype.getPreloadCallbacks = function(){
    return this.preloadCallbacks_;
};



/**
 * @type {?Array.function}
 * @private
 */ 
xiv.XtkDisplayer.prototype.onloadCallbacks_ = null;




/**
* @type {function()}
* @expose
*/
xiv.XtkDisplayer.prototype.onOnload = function (callback) {
    this.onloadCallbacks_.push(callback)
}



/**
 * @type {?Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentViewables_ = null;


/**
 * @type {?Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentViewablesSettings_ = null;




/**
 * @expose
 */
xiv.XtkDisplayer.prototype.getCurrViewables = function () {
    return this.currentViewables_;
}



/**
 * @expose
 */
xiv.XtkDisplayer.prototype.resetCurrViewables = function () {
    this.currentViewables_ = {};
}



/**
 * @private
 * @type {!Object}
 */ 
xiv.XtkDisplayer.prototype.ControllerMenu_ = null;




/**
 * @return {Object}
 */ 
xiv.XtkDisplayer.prototype.getControllerMenu = function(){
    return this.ControllerMenu_.getMenu();
};




/**
 * Sync all of the relevant controllerMenu
 * properties to the X.Object properties.
 *
 * @private
 */ 
xiv.XtkDisplayer.prototype.syncControllerMenuToViewables_ = function(){

    var viewablesArr = utils.convert.objectToArray(this.currentViewables_);
    var settingsArr = utils.convert.objectToArray(this.currentViewablesSettings_);
    var menuMap = this.ControllerMenu_.getMenuMap();
    for (var key in menuMap) {
	switch(key){

	    // Skip the "Master" level controls.
	case 'Annotations':
	case 'Fibers':
	case 'Volumes':
	case 'Meshes':
	    break;
	default:
	    var xObj = menuMap[key]['xtkObj'];
	    if (menuMap[key]['opacity'].setValue){
		menuMap[key]['opacity'].setValue(parseFloat(xObj.opacity));
	    } else if (menuMap[key]['opacity']['slider'] && menuMap[key]['opacity']['slider'].setValue) {
		menuMap[key]['opacity']['slider'].setValue(parseFloat(xObj.opacity));
	    }
	    
	    window.console.log(menuMap[key])

	    var i = 0; 
	    for (i = 0, len = viewablesArr.length; i < len; i++) { if (viewablesArr[i] === xObj){ break;}}


	    //
	    // Sync threshold range
	    //
	    if (menuMap[key]['threshold']){

		//window.console.log( settingsArr[i]['properties'], menuMap[key]['threshold'], 
				    //(settingsArr[i]['properties']['lowerThreshold'].toString() === 'NaN'), settingsArr[i]['properties']['lowerThreshold']);
		var thresholdSlider = menuMap[key]['threshold'];
		if (settingsArr[i]['properties']['lowerThreshold'].toString() !== 'NaN') {
		    thresholdSlider.setMinimum(settingsArr[i]['properties']['lowerThreshold']);
		    thresholdSlider.setValue(settingsArr[i]['properties']['lowerThreshold']);
		    thresholdSlider.setMinExtent(settingsArr[i]['properties']['lowerThreshold']-1);
		} else {
		    thresholdSlider.setMinimum(0);
		    thresholdSlider.setValue(0);
		    thresholdSlider.setMinExtent(0);
		}
		if (settingsArr[i]['properties']['upperThreshold'].toString() !== 'NaN') {
		    thresholdSlider.setMaximum(settingsArr[i]['properties']['upperThreshold']);
		} else {
		    thresholdSlider.setMaximum(10);
		}
	    }


	    //
	    // Sync visible
	    //
	    xObj.visible = settingsArr[i]['properties']['visible'];
	    menuMap[key]['visible'].checked = xObj.visible;
	}
	
    }
}


/**
 * Determines if the files from file collection are already loaded
 * into the displayer.
 *
 * @param {string|Array.string}
 * @expose
 */
xiv.XtkDisplayer.prototype.isLoaded = function(fileCollection) {

    //----------------
    // Convert non-array collections into an array.
    //----------------
    if (!goog.typeOf(fileCollection) == 'array') {
	fileCollection = [fileCollection];
    }



    //----------------
    // Loop through the file collection and compare
    // against the currentViewables_ property.
    //----------------    
    for (var i=0, len = fileCollection.length; i < len; i++) {

	var fileName = fileCollection[i];
	var ext = utils.xtk.getFileExt(fileName);
	var currentViewablesLen = this.currentViewables_.length;

	for (var j = 0; j < currentViewablesLen; j++) {

	    // Check for non-DICOM filetypes
	    //
	    // NOTE: The collection array may be the same as the xtkObject.file
	    // collection (xtkObject.file is either an array or a string)
	    if (this.currentViewables_[j].file == fileCollection) {
		return true;


	    // Check for DICOM filetypes
	    //
            // NOTE: DICOM are a special case...you have to do some
            // string comparisons that aren't straightforward
	    } else if (ext === 'dcm' || ext === 'dicom') {
		if (this.currentViewables_[j].file[0].indexOf(fileName.slice(0,-9)) > -1){
                    return true;		
		}
	    }
        }
    }
    return false;
}




/**
 * @param {!string | !Array.<string>}
 * @return {?X.Object}
 */
xiv.XtkDisplayer.prototype.makeXObject = function(viewable){
    if (!goog.isArray(viewable)){
	var viewable =  (viewable.indexOf(' ') > -1) ? goog.string.urlEncode(viewable) : viewable;
	viewable = decodeURIComponent(viewable);	 
    }
    return utils.xtk.createXObject(viewable);
}







/**
 * A xiv.ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {!Array.<string> | !Object} viewables The relevant Slicer files to be loaded.
 */
xiv.XtkDisplayer.prototype.loadViewables = function (viewables) {

    var that = this;
    var viewables = goog.isArray(viewables) ? utils.xtk.getViewables(viewables) : viewables;
    var renderablePlanes = (viewables['volumes'].length > 0 || viewables['dicoms'].length > 0) ? ['Sagittal', 'Coronal', 'Transverse', '3D'] : ['3D']; 

    this.currentViewables_ = utils.xtk.getEmptyViewablesObject();
    this.currentViewablesSettings_ = utils.xtk.getEmptyViewablesObject(); 

    

    //----------------
    // Run pre-load callbacks.
    //----------------
    goog.array.forEach(this.preloadCallbacks_, function(callback){ callback() })


    for (var key in viewables){
	switch (key){
	case 'volumes':
	case 'fibers':
	case 'meshes':

	    if (!viewables[key]) break;
	    goog.array.forEach(viewables[key], function(volOrFiberOrMesh){
		var xObject = this.makeXObject(volOrFiberOrMesh['file']);
		utils.xtk.setProperties(xObject, volOrFiberOrMesh['properties']); 

		// Volumes have some special qualites we have to attend to.
		if (key === 'volumes'){
		    xObject['isSelectedVolume'] = volOrFiberOrMesh['properties']['isSelectedVolume'];
		    if (volOrFiberOrMesh['properties']['lowerThreshold'] !== NaN){
			xObject.lowerThreshold = volOrFiberOrMesh['properties']['lowerThreshold'];
		    }
		    if (volOrFiberOrMesh['properties']['upperThreshold'] !== NaN){
			xObject.upperThreshold = volOrFiberOrMesh['properties']['upperThreshold'];
		    }
		}

		this.currentViewables_[key].push(xObject);
		this.currentViewablesSettings_[key].push(volOrFiberOrMesh);
		
	    }.bind(this))
	    break;

	case 'dicoms':
	    this.currentViewables_[key].push(this.makeXObject(viewables[key]));
	    this.currentViewablesSettings_[key].push(viewables[key]);
	    break;
	case 'annotations':
	     goog.array.forEach(viewables[key], function(annotationObj){
		 this.currentViewables_[key].push(utils.xtk.makeAnnotation(annotationObj));
		 this.currentViewablesSettings_[key].push({'properties': annotationObj});
	     }.bind(this))
	    break;
	}
    }



    //----------------
    // Check for 'isSelectedVolumes' in volumes. 
    // If none, select the first.
    //----------------
    var selectedFound = false;
    for (var i=0, len=this.currentViewables_['volumes']; i<len; i++) {
	if (this.currentViewables_['volumes'][i]['isSelectedVolume'] === true){
	    selectedFound = true;
	    break;
	}
    }
    if (!selectedFound){
	this.currentViewables_['volumes'][0]['isSelectedVolume'] = true;
    }


    //----------------
    // Load renderables as single array of currentViewables_
    //----------------
    this.XtkPlaneManager_.onAllRendered(this.onloadCallbacks_);
    window.console.log("EXITING");
    window.console.log("this._currentViewables", this.currentViewables_);
    //window.console.log("CONVERTED", utils.convert.objectToArray(this.currentViewables_));
    this.XtkPlaneManager_.loadInRenderers(utils.convert.objectToArray(this.currentViewables_))
}



/**
 *
 * @type {?Object}
 */
xiv.XtkDisplayer.prototype._slicerSettings = null;




/**
 *
 * @param {Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {string=} opt_onloadPlane The plane to prioritize the load on.
 */
xiv.XtkDisplayer.prototype.loadSlicer = function (fileCollection) {

    console.log("load slicer");
    this._slicerSettings = {};

    
    //
    // Get the Slicer settings from each mrml
    //
    var basename = '';
    var ext = '';
    goog.array.forEach(fileCollection, function(fileName){

	basename = utils.string.basename(fileName);
	ext = utils.string.getFileExtension(basename).toLowerCase();

	if ((ext === 'mrml') && (goog.string.startsWith(basename, '.') !== true)) {

	    // Get the Slicer settings for each file
	    console.log("MRML", ext, basename, fileName);
	    this._slicerSettings[fileName] = utils.slicer.getSlicerSettings(fileName);
	    
	}
    }.bind(this));



    

    //
    // GET THE SCREENSHOTS AS THUMBNAILS
    //
    var basename = '';
    var ext = '';
    var screenshotName = '';
    var cleanedSceneName = '';
    var mrmlFilename = '';
    goog.array.forEach(fileCollection, function(fileName){

	basename = utils.string.basename(fileName);
	ext = utils.string.getFileExtension(basename).toLowerCase();
	screenshotName = basename.split('.')[0].toLowerCase().replace(' ', '');


	//
	// Get pngs and skip and files this start with '.'
	//
	if ((ext === 'png') && !(goog.string.startsWith(basename, '.'))) {
	    for (mrmlFilename in this._slicerSettings){
		goog.array.forEach(this._slicerSettings[mrmlFilename]['__scenes__'], function(sceneName){
		    cleanedSceneName = sceneName.split('.')[0].toLowerCase().replace(' ', '');
		    //window.console.log(screenshotName, cleanedSceneName, cleanedSceneName.indexOf(screenshotName))
		    if (cleanedSceneName.indexOf(screenshotName) > -1){
			this._slicerSettings[mrmlFilename][sceneName]['thumbnail'] = fileName;
		    }
		}.bind(this))
	    }
	}
    }.bind(this));

    window.console.log("SLICER SETTINGS", this._slicerSettings);



    //
    // Update the urls of the files to be
    // to the accurate relative path.  (Since the
    // urls were read from the mrml, they start relative to 
    // the slicer file path).
    //
    var viewableArr = [];
    var updateUrl = function(mrml, url) { 
	var firstUrl = utils.string.dirname(mrml) + '/' + goog.string.remove(url, './');

	return firstUrl
    };

    
    for (var mrmlFilename in this._slicerSettings){
	for (var scene in this._slicerSettings[mrmlFilename]){
	    for (var prop in this._slicerSettings[mrmlFilename][scene]){
		viewableArr = this._slicerSettings[mrmlFilename][scene][prop];
		if (goog.isArray(viewableArr)){
		    goog.array.forEach(viewableArr, function(viewable){
			if (viewable['file']) {
			    viewable['file'] =  updateUrl(mrmlFilename, viewable['file']);
			} 
			if (viewable['properties'] && viewable['properties']['fiberDisplay']) {

			    goog.array.forEach(viewable['properties']['fiberDisplay'], function(fiberDisplay){
				if (fiberDisplay['colorTable']) {
				    fiberDisplay['colorTable'] =  updateUrl(mrmlFilename, fiberDisplay['colorTable']);
				}
			    })   
			}
		    })
		}
	    }
	}	
    }
    
    this.ViewBox_._SlicerViewMenu.reset(this._slicerSettings);
    this.ViewBox_._SlicerViewMenu.onViewSelected(function(slicerSetting){
	window.console.log("LOADING THIS GUY", slicerSetting);

	this.ViewBox_._SlicerViewMenu.hideViewSelectDialog();
	this.XtkPlaneManager_.setCamera('3D', slicerSetting['camera']);
	this.loadViewables(slicerSetting);
    }.bind(this));
    this.ViewBox_._SlicerViewMenu.showViewSelectDialog();

}





/**
* @param {Object=}
*/
xiv.XtkDisplayer.prototype.updateStyle = function (opt_args) {
    if (opt_args){
	var widgetDims = utils.dom.mergeArgs(utils.style.dims(this._element), opt_args);
	utils.style.setStyle(this._element, widgetDims);
    } 
    this.XtkPlaneManager_.updateStyle();
}




/**
* Usually this method is called from the menu.  Specifically
* in the 2D menu, where the user can toggle between
* the volume to be displayed in the 2D renderers.
*
* @param {!string}
*/
xiv.XtkDisplayer.prototype.set2DRenderObject = function(fileName) {

    var xObj = undefined;

    //----------------
    // Get the xObj from curr viewables.
    //----------------
    goog.array.forEach(this.currentViewables_['volumes'], function(vol){
	if (goog.string.endsWith(vol.file, fileName)) { 
	    xObj = vol; 
	}
    })


    //----------------
    // Load in renderers.
    //----------------
    this.XtkPlaneManager_.loadInRenderers(xObj, '2D');
}

