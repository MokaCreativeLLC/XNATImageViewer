/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.dom.fullscreen');
goog.require('goog.window');

// utils
goog.require('utils.ui.ThumbnailGallery');
goog.require('utils.xnat');
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.convert');
goog.require('utils.fx');

// xiv
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.ThumbnailManager');
goog.require('xiv.ViewBoxManager');
//goog.require('xiv.PathManager');



/**
 * 'xiv.Modal' is the central class where all of the xiv.Widgets
 * meet: ScrollableContainer, xiv.Thumbnails, xiv.ViewBoxes.  It also 
 * oversees the xiv.ViewBoxManager and xiv.ThumbnailManager classes and 
 * the actual modal window.  It should be noted that
 * the 'xiv.Modal.element' variable is the background, which is the
 * parent of the 'xiv.Modal.modal_' element.
 *
 * @constructor
 * @extends {xiv.Widget}
 */

goog.provide('xiv.Modal');
xiv.Modal = function () {

    xiv._Modal = this;


    //------------------
    // xiv.Widget init.
    //------------------
    goog.base(this, 'xiv.Modal', {'class': xiv.Modal.ELEMENT_CLASS});
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	goog.dom.classes.add(this.element, xiv.Modal.POPUP_CLASS);
    }
    //------------------
    // Fade all out
    //------------------    
    this.element.style.opacity = 0;




    /**
     * @type {!Array.string}
     * @private
     */
    this.xnatPaths_ = [];




    /**
     * @type {!Element}
     * @private
     */	
    this.modal_ = this.createModalElement_(this.element);




    /**
     * @type {!Element}
     * @private
     */	
    this.closeButton_ = this.createCloseButton_(this.modal_);



    /**
     * @type {!Element}
     * @private
     */	
    this.fullScreenButton_ = this.createFullScreenButton_(this.modal_);



    /**
     * @type {!Element}
     * @private
     */	
    this.popupButton_ = this.createPopupButton_(this.modal_);



    /**
     * @type {!Element}
     * @private
     */
    this.addPathsButton_ = this.createAddPathsButton_(this.modal_);



    /**
     * @type {!utils.ui.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_ = this.createThumbnailGallery_(this.modal_);



    /**
     * @type {!Element}
     * @private
     */
    this.columnMenu_ = this.createColumnMenu_(this.modal_);



    /**
     * @type {!Element}
     * @private
     */
    this.rowMenu_ = this.createRowMenu_(this.modal_);



    /**
     * @type {!xiv.ThumbnailManager}
     * @private
     */
    this.ThumbnailManager_ = new xiv.ThumbnailManager(this);



    /**
     * @type {?xiv.ViewBoxManager}
     * @private
     */	
    this.ViewBoxManager_ = new xiv.ViewBoxManager(this);

    

    /**
     * @type {?xiv.ViewBoxManager}
     * @private
     */
    //this.PathManager_ = new xiv.PathManager(this);




    //------------------
    // Manager callbacks
    //------------------
    this.setManagerCallbacks_();



    //------------------
    // Insert default columns on loadup
    //------------------
    this.ViewBoxManager_.insertColumn(false);
    
    

    //------------------
    // Update style
    //------------------
    window.onresize = function () { 
	this.updateStyle() 
    }.bind(this);  
    this.updateStyle();
    


    //------------------
    // Fade all out
    //------------------    
    utils.fx.fadeIn(this.element, xiv.ANIM_MED);
    
}
goog.inherits(xiv.Modal, xiv.Widget);
goog.exportSymbol('xiv.Modal', xiv.Modal);





/**
 * Get the associated modal for this object.
 *
 * @return {Element} The modal element of the Modal.js object.
 * @public
 */
xiv.Modal.prototype.getModalElement = function() {
  return this.modal_;
};



 
/**
 * Get the associated xiv.ViewBoxManager for this object.
 *
 * @return {xiv.ViewBoxManager} The xiv.ViewBoxManager for this object.
 * @public
 */
xiv.Modal.prototype.getViewBoxManager =  function() {
  return this.ViewBoxManager_;
}




/**
 * Get the associated xiv.ThumbnailManager for this object.
 *
 * @return {xiv.ThumbnailManager} The xiv.ThumbnailManager for this object.
 * @public
 */
xiv.Modal.prototype.getThumbnailManager = function() {
  return this.ThumbnailManager_;
}




/**
 * Returns the array of stored XNAT paths.
 *
 * @return {!Array.<string>} The array of stored XNAT paths.
 * @public
 */
xiv.Modal.prototype.getXnatPaths = function() {
  return this.xnatPaths_;
};




/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @param {!string} path The XNAT path to set for querying.
 * @public
 */
xiv.Modal.prototype.addXnatPath = function(path) {
    var updatedPath = (path[0] !== "/") ? "/" + path : path;
    this.xnatPaths_.push(xiv.XNAT_QUERY_PREFIX + updatedPath); 
}




/**
 * Creates a modal element.
 *
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createModalElement_ = function(opt_parent) {
    //------------------
    // NOTE: the 'xiv.Modal.element' variable is the 
    // background, which is 
    // parent of the 'xiv.Modal.modal_' element.
    //------------------
    var modal = goog.dom.createDom('div', {  
	'id': 'xiv.Modal.ModalElement_' + goog.string.createUniqueString(),
	'class' : xiv.Modal.MODAL_CLASS,
	'onclick': function (event) { 
	    utils.dom.stopPropagation(event);  
	}
    });

    if (opt_parent){
	opt_parent.appendChild(modal)
    } else {
	document.body.appendChild(modal)
    }
    modal.setAttribute('isfullscreen', '0');
    return modal;	
}









/**
 * Creates a close button.
 *
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createCloseButton_ = function(opt_parent){


    var button = utils.dom.createBasicHoverButton({
	'id': 'closeButton_' + goog.string.createUniqueString(),
	'class': xiv.Modal.CLOSEBUTTON_CLASS,
	'title': 'Close ImageViewer and return to XNAT.',
	'src': xiv.ICON_URL + "closeX.png",
	'onclick': this.destroy
    })
   opt_parent && opt_parent.appendChild(button);
   
    //
    // Hide the popup if we're already in popup mode.
    //
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	button.style.visibility = 'hidden';
    }

    return button
}  




/**
 * As stated.
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createFullScreenButton_ = function(opt_parent){
 
    var button = utils.dom.createBasicHoverButton({
	'id' : 'fullScreenButton_' + goog.string.createUniqueString(), 
	'class' : xiv.Modal.FULLSCREENBUTTON_CLASS,
	'title': 'Enter full screen mode.',
	'src': xiv.ICON_URL + "fullScreen.png",
	'onclick': function(){
	    if (this.modal_.getAttribute('isfullscreen') === '0'){
		goog.dom.fullscreen.requestFullScreen(this.modal_); 
		this.modal_.setAttribute('isfullscreen', '1');
		this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen-reverse.png";
		this.fullScreenButton_.title = 'Exit full screen mode';

	    } else {
		goog.dom.fullscreen.exitFullScreen();
		this.modal_.setAttribute('isfullscreen', '0');
		this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen.png";
		this.fullScreenButton_.title = 'Enter full screen mode';
	    }
	}.bind(this)
    })
    opt_parent && opt_parent.appendChild(button);

    return button;
}




/**
 * As stated.
 *
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createPopupButton_ = function(opt_parent){
  
    var button = utils.dom.createBasicHoverButton({    
	'id' : 'popupButton_' + goog.string.createUniqueString(),
	'class' : xiv.Modal.POPUPBUTTON_CLASS,
	'title': 'Popup viewer to new window.',
	'src': xiv.ICON_URL + "popup.png",
	'onclick': function(){
	    goog.window.popup(xiv.ROOT_URL + 
			      '/scripts/viewer/popup.html' 
			      + '?' + xiv.DATA_PATH);
	    this.destroy();
	}.bind(this)
    })		       
    opt_parent && opt_parent.appendChild(button);

    //
    // Hide the popup if we're already in popup mode.
    //
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	button.style.visibility = 'hidden';
    }

    return button;
}




/**
 * As stated.
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createAddPathsButton_ = function(opt_parent){

    var button = utils.dom.createBasicHoverButton({
	'id' : 'addPathsButton_' + goog.string.createUniqueString(), 
	'class': xiv.Modal.ADDPATHSBUTTON_CLASS,
	'innerHTML': '+',
	'onclick' : function(){
	    utils.fx.fadeIn(this.PathManager_.getElement());
	}.bind(this), 
    })
    opt_parent && opt_parent.appendChild(button);
    //addPathsButton.innerHTML = '+';
   
    return button;
}





/**
 * As stated.
 * @param {Element=} opt_parent The optional parent element.
 * @return {!utils.ui.ThumbnailGallery} The created utils.ui.ThumbnailGallery.
 * @private
 */
xiv.Modal.prototype.createThumbnailGallery_ = function(opt_parent){
    var thumbGal = new utils.ui.ThumbnailGallery();

    opt_parent = opt_parent ? opt_parent : document.body;
    opt_parent.appendChild(thumbGal.getElement());
    goog.dom.classes.add(thumbGal.getElement(), 
			 xiv.Modal.THUMBNAILGALLERY_CLASS);
    return thumbGal;

}

    

/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.setManagerCallbacks_ = function(){
    this.setThumbnailManagerCallbacks_();
    this.setViewBoxManagerCallbacks_();
}





/**
 * Sets callbacks for the following events: MOUSEOVER, MOUSEOUT, 
 * THUMBNAILDROP, THUMBNAILCLICK
 *
 * @private
 */
xiv.Modal.prototype.setThumbnailManagerCallbacks_ = function(){

    //------------------
    // Highlight the ViewBox when hovering over 
    // its Thumbnail in the Scroll Gallery
    //------------------
     this.ThumbnailManager_.getEventManager().onEvent('MOUSEOVER', function(Thumbnail){
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail){
		ViewBox.element.style.borderColor = 'white';
	    }
	})	
    }.bind(this))

    this.ThumbnailManager_.getEventManager().onEvent('MOUSEOUT', function(Thumbnail){;
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail && ViewBox.loadState !== 'loading'){
		ViewBox.element.style.borderColor = ViewBox.element.getAttribute('originalbordercolor');	
	    }
	})
    }.bind(this))


    //------------------
    // Load the thumbnail when clicking or dropping.
    //------------------
    this.ThumbnailManager_.getEventManager().onEvent('THUMBNAILDROP', function(viewBoxElement, thumbnailElement) {
	var _ViewBox = this.ViewBoxManager_.getViewBoxByElement(viewBoxElement);
	var _Thumb = this.ThumbnailManager_.getThumbnailByElement(thumbnailElement);
	_ViewBox.loadThumbnail(_Thumb);
    }.bind(this)); 

    this.ThumbnailManager_.getEventManager().onEvent('THUMBNAILCLICK', function(_Thumb) {
	this.ViewBoxManager_.getFirstEmpty().loadThumbnail(_Thumb);
    }.bind(this));
}




/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.setViewBoxManagerCallbacks_ = function(){

    //------------------
    // Highlight the Thumbnail when loading 
    // it into a ViewBox and after loading.
    //------------------
    this.ViewBoxManager_.onThumbnailPreload = function(ViewBox){ 
	ViewBox.element.style.borderColor = 'white';
	this.highlightInUseThumbnails();
    }.bind(this)

    this.ViewBoxManager_.onThumbnailLoaded = function(ViewBox){
	ViewBox.element.style.borderColor = ViewBox.element.getAttribute('originalbordercolor');
	this.highlightInUseThumbnails();
    }.bind(this)


    this.ViewBoxManager_.onViewBoxesChanged(function() {
	this.ThumbnailManager_.addDragDropTargets(this.ViewBoxManager_.getViewBoxElements());
    }.bind(this))
}





/**
 * Generates xiv.Thumbnail property objects for creating
 * thumbnails in the 'populate scroll gallery' function.
 *
 * @public
 */
xiv.Modal.prototype.loadThumbnails = function(){

    var viewableData;
    var viewableTypes = ["scans", "Slicer"];
    var slicerThumbnailsLoaded = false;


    //------------------
    // DEMO MODE: 
    //
    // Get viewables from stored json.
    //------------------    
    if (XNAT_IMAGE_VIEWER_MODE && XNAT_IMAGE_VIEWER_MODE == 'demo'){

	//
	// Do a natural sort on the demo data (by their relevant key)
	// as perscribed by XnatIO
	//	
	XNAT_IMAGE_VIEWER_DEMO_SCANS = utils.xnat.sortViewableCollection(XNAT_IMAGE_VIEWER_DEMO_SCANS, 
									 ['sessionInfo', 'Scan', 'value', 0]);
	XNAT_IMAGE_VIEWER_DEMO_SLICER = utils.xnat.sortViewableCollection(XNAT_IMAGE_VIEWER_DEMO_SLICER, 
									  ['Name']);


	//
	// Make thumbnails from the data.
	//
	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SCANS, function(demoScan){
	    this.addThumbnailsToGallery_(['sample-data', 'scans'],  
					 [demoScan]);
	}.bind(this))

	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SLICER, function(demoSlicer){
	    this.addThumbnailsToGallery_(['sample-data','Slicer'],  
					 [demoSlicer]);
	}.bind(this))

    }



    //------------------
    // LIVE MODE: 
    //
    // Get Viewables from XNAT server.
    // Scans xiv.Thumbnails first, then Slicer xiv.Thumbnails.
    //------------------  
    else {

	goog.array.forEach(this.xnatPaths_, function(xnatPath){

	    //
	    //  Get the the folders
	    //
	    var pathObj = utils.xnat.getPathObject(xnatPath);
	    var folders = [];
	    for (key in pathObj){ 
		if (goog.isDefAndNotNull(pathObj[key]) && key !== 'prefix'){
		    folders.push(utils.xnat.folderAbbrev[key] + ": " + pathObj[key]) 
		}
	    };

	    //
	    // Clone the folder array to both slicer and scans.
	    //
	    var scanFolders = folders.slice(0);
	    scanFolders.push('scans');
	    var slicerFolders = folders.slice(0);
	    slicerFolders.push('Slicer');


	    //
	    // Begin with getting the scans first.
	    //
	    utils.xnat.getScans(xnatPath, function(viewable){

		//
		// Add the scans to the thumbnail gallery once 
		// they're acquired.
		//
		this.addThumbnailsToGallery_(scanFolders,  [viewable]);


		//
		// Then load slicer thumbnails...
		//
		if (!slicerThumbnailsLoaded) {

		    //
		    // Get the slicer files.
		    //
		    folders[folders.length-1] = 'Slicer';
		    utils.xnat.getSlicer(xnatPath, function(slicerViewable){
			this.addThumbnailsToGallery_(slicerFolders,  [slicerViewable]);
		    }.bind(this));

		    slicerThumbnailsLoaded = true;
		}
	    }.bind(this));
	}.bind(this))
    }

}




/**
 * Creates xiv.Thumbnails to feed into the scroll gallery zippys.
 *
 * @param {!string | !Array.string} folder The folder which the thumbnais belong to in the zippy headers of the ThumbnailGallery.
 * @param {!Array.<utils.xnat.properties>} xnatPropsArr The viewables properties to convert to thumbnails.
 * @private
 */
xiv.Modal.prototype.addThumbnailsToGallery_ = function (folders, xnatPropsArr) {
    goog.array.forEach(xnatPropsArr, function(xnatProps) { 
	this.ThumbnailGallery_.addThumbnail(this.ThumbnailManager_.makeThumbnail(xnatProps), folders); 
    }.bind(this))	
}




/**
 * Highlights all thumbnails that are being viewed 
 * a xiv.ViewBox.
 *
 * @public
 */
xiv.Modal.prototype.highlightInUseThumbnails = function () {

    window.console.log("HIGHTLIGHT IN USE THUMBNAILS!");
    //------------------
    // Unhighlight all thumbnails.
    //------------------
    this.ThumbnailManager_.loop(function(Thumbnail){  
	Thumbnail.setActive(false);
    })


    //------------------
    // Highight only in use thumbnails by 
    // looping through the xiv.ViewBoxes.
    //------------------
    this.ViewBoxManager_.loop(function(ViewBox){  
	ViewBox.Thumbnail && ViewBox.Thumbnail.setActive(true);
    })
}








/**
 * Creates an 'addColumn' menu.
 *
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createColumnMenu_ = function (opt_parent) {


    //------------------
    // Make columnMenu element, add class.
    //------------------
    var colMenu = goog.dom.createDom("div", {
	'id': "ColumnMenu_" + goog.string.createUniqueString(),
	'class': xiv.Modal.COLUMNMENU_CLASS
    }, (opt_parent ? opt_parent : document.body));
   
   

    //------------------
    // Make 'insertColumn' button
    //------------------
    utils.dom.createBasicHoverButton({
	'id' : "InsertColumnButton", 
	'class' : xiv.Modal.COLUMNMENU_BUTTON_CLASS, 
	'src':  xiv.ICON_URL + "Arrows/insertColumn.png",
	'title': "Insert Column",
	'onclick': function () { this.ViewBoxManager_.insertColumn()}.bind(this)	
    }, colMenu, .8, .5);



    //------------------
    // Make 'removeColumn' button
    //------------------
    utils.dom.createBasicHoverButton({
	'id' : "RemoveColumnButton", 
	'class': xiv.Modal.COLUMNMENU_BUTTON_CLASS,
	'src':  xiv.ICON_URL + "/Arrows/removeColumn.png",
	'title': "Remove Column",
	'onclick': function () { this.ViewBoxManager_.removeColumn()}.bind(this)	
    }, colMenu,  .8, .5);

    return colMenu
}




/**
 * Creates an 'addRow' menu.
 *
 * @param {Element=} opt_parent The optional parent element.
 * @return {!Element} The created element.
 * @private
 */
xiv.Modal.prototype.createRowMenu_ = function (opt_parent) {


    //------------------
    // Make columnMenu element, add class.
    //------------------
    var rowMenu = goog.dom.createDom("div", {
	'id': "rowMenu_" + goog.string.createUniqueString(),
	'class': xiv.Modal.ROWMENU_CLASS
    }, (opt_parent ? opt_parent : document.body));


    //------------------
    // Make 'insertRow' button
    //------------------
    utils.dom.createBasicHoverButton({
	'id' : "InsertRowButton" + goog.string.createUniqueString(), 
	'class': xiv.Modal.ROWMENU_BUTTON_CLASS, 
	'src':  xiv.ICON_URL + "Arrows/insertRow.png",
	'title': "Insert Row",
	'onclick': function () { this.ViewBoxManager_.insertRow()}.bind(this)	
    }, rowMenu,  .8, .5);



    //------------------
    // Make 'removeRow' button
    //------------------
    utils.dom.createBasicHoverButton({
	'id' : "RemoveRowButton_" + goog.string.createUniqueString(), 
	'class': xiv.Modal.ROWMENU_BUTTON_CLASS, 
	'src':  xiv.ICON_URL + "Arrows/removeRow.png",
	'title': "Remove Row",
	'onclick': function () { this.ViewBoxManager_.removeRow()}.bind(this)	
    }, rowMenu, .8, .5);
    
    return rowMenu;
};






/**
 * Used when a row or column is inserted.  The modal animates itself
 * on its resize.
 *
 * @param {function=} opt_callback The callback for AFTER the modal is animated.
 * @public
 */
xiv.Modal.prototype.animateModal  = function (opt_callback) {

    var modalDims = this.calculateModalDims_();
    var animQueue = new goog.fx.AnimationParallelQueue();

    

    //------------------
    // Highlight only in use thumbnails
    //------------------    
    this.highlightInUseThumbnails();



    //------------------
    // Define the animation methods, leveraging
    // the goog.fx library (slide and resize)
    //------------------
    function slide(el, a, b, duration) {
	return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], [a, b], duration, goog.fx.easing.easeOut);
    }
    
    function resize(el, a, b, duration) {			
	return new goog.fx.dom.Resize(el, [el.offsetWidth, el.offsetHeight], [a, b], duration, goog.fx.easing.easeOut);
    } 
    

  
    //------------------
    // Set and add the xiv.Modal's animation methods
    // to the animation queue.
    //------------------
    var modalResize = resize(this.modal_, modalDims.width, modalDims.height, xiv.ANIM_MED)
    animQueue.add(modalResize);
    animQueue.add(slide(this.modal_, modalDims.left, modalDims.top, xiv.ANIM_MED));



    //------------------
    // Set and add the xiv.ViewBox's animation methods
    // to the animation queue.
    //------------------
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	animQueue.add(slide(ViewBox.element, modalDims.ViewBox.lefts[i][j], modalDims.ViewBox.tops[i][j], xiv.ANIM_MED));	
	animQueue.add(resize(ViewBox.element, modalDims.ViewBox.width, modalDims.ViewBox.height, xiv.ANIM_MED));	
    })
	
     

    //------------------
    // Call 'updateStyle' on every animation frame.
    //------------------
    goog.events.listen(modalResize, 'animate', function() {
	this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	    ViewBox.updateStyle();
	})
    }.bind(this))



    //------------------
    // When animation finishes, apply End Callback
    // (any new ViewVoxes fade in).
    //------------------
    goog.events.listen(animQueue, 'end', function() {
	//
	// Update style.
	//
	this.updateStyle();
	//
	// Fade in new viewers.
	//
	this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	    if (ViewBox.element.style.opacity == 0) {
		utils.fx.fadeIn(ViewBox.element, xiv.ANIM_FAST);
	    }
	})
	//
	// Run callback
	//
	if (opt_callback) { opt_callback() };
    }.bind(this))



    //------------------
    // Play animation
    //------------------
    animQueue.play();
}




/**
 * Fades out then deletes the modal and all of its
 * child elements.
 *
 * @param {number=} fadeOut The amount of desired time to fade out the modal.
 * @public
 */
xiv.Modal.prototype.destroy = function (fadeOut) {

    //------------------
    // Get the modal's root element by class
    //------------------    
    rootElt = goog.dom.getElementsByClass(xiv.Modal.ELEMENT_CLASS, document.body)[0];



    //------------------
    // Fade out root element, remove from parent, then delete it.
    //------------------
    utils.fx.fadeOut(rootElt, xiv.ANIM_MED, function () {
	try{ 
	    rootElt.parentNode.removeChild(rootElt);
	    delete rootElt;
	}
	catch(e) {}
    });



    //------------------
    // NOTE: This is in response to xiv.start()
    // where it's set to hidden to prevent
    // Webkit-based browsers from scrolling.
    //------------------
    document.body.style.overflow = 'visible';
}





/**
 * Calculates the xiv.Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 *
 * @private
 */
xiv.Modal.prototype.calculateModalDims_ = function () {
    
  
    var ScrollableContainerLeft = 0;
    var maxModalWidth = Math.round(window.innerWidth * xiv.MAX_MODAL_HEIGHT_PERCENTAGE);
    
    
    
    //**************************************************************
    //
    // Generate a prelimiary width...
    //
    //**************************************************************
    
    //------------------
    //	Get the prescribed height of the modal	
    //------------------
    var modalHeight = xiv.MAX_MODAL_HEIGHT_PERCENTAGE * window.innerHeight;

    

    //------------------
    //	Get the number of scan viewers
    //------------------
    var viewers = this.ViewBoxManager_.getViewBoxes();
    var ViewBoxColumns = this.ViewBoxManager_.totalColumns();
    var ViewBoxRows = this.ViewBoxManager_.totalRows();
    
    

    //------------------
    // Determine the minimum modal width
    //------------------
    var minModalWidth = utils.style.dims(this.ThumbnailGallery_.getElement(), 'width') + 
	xiv.MIN_VIEWER_WIDTH * ViewBoxColumns + 
	xiv.VIEWER_VERTICAL_MARGIN * ViewBoxColumns + 
	xiv.EXPAND_BUTTON_WIDTH;
    


    //------------------
    // Determine the the modal width based on prescribed proportions
    //------------------
    var ViewBoxHeight = ( modalHeight - ((ViewBoxRows + 1) * xiv.EXPAND_BUTTON_WIDTH)) / ViewBoxRows;
    var ViewBoxWidth = xiv.VIEWER_DIM_RATIO * ViewBoxHeight;
    


    //------------------
    // Determine the modal width
    //------------------
    var modalWidth = utils.style.dims(this.ThumbnailGallery_.getElement(), 'width') + 
	ViewBoxWidth  * ViewBoxColumns + 
	xiv.VIEWER_VERTICAL_MARGIN * ViewBoxColumns + 
	xiv.EXPAND_BUTTON_WIDTH;




    //**************************************************************
    // After preliminary width is generated...
    //**************************************************************

    //-------------------------
    // If the modal is too wide, scale it down
    //-------------------------
    if (modalWidth > maxModalWidth) {	
	var thumbGalleryWidth = utils.convert.toInt((utils.style.getComputedStyle(this.ThumbnailGallery_.getElement(), 'width')));
	ViewBoxWidth = (maxModalWidth - thumbGalleryWidth - xiv.EXPAND_BUTTON_WIDTH)/ViewBoxColumns - xiv.VIEWER_VERTICAL_MARGIN ;
	ViewBoxHeight = ViewBoxWidth / xiv.VIEWER_DIM_RATIO;
	modalWidth = maxModalWidth;
	//utils.dom.debug( ViewBoxHeight , ViewBoxRows , (xiv.VIEWER_VERTICAL_MARGIN), ViewBoxRows  - 1 , xiv.EXPAND_BUTTON_WIDTH);
	modalHeight = (ViewBoxHeight * ViewBoxRows) + (xiv.VIEWER_VERTICAL_MARGIN  * (ViewBoxRows  - 1)) + xiv.EXPAND_BUTTON_WIDTH * 2;

    }
    //utils.dom.debug("modalHeight: ", modalHeight);



    //-------------------------
    // Calculate master left and top of the modal window.
    //-------------------------
    var _l = (window.innerWidth - modalWidth) /2 ;
    var _t = (window.innerHeight - modalHeight)/2;
    


    //-------------------------
    // ScrollableContainer dims (holds the xiv.Thumbnails)
    //-------------------------	
    var ScrollableContainerCSS = {
	'height': Math.round(modalHeight) - xiv.EXPAND_BUTTON_WIDTH * 2,
	'top': xiv.EXPAND_BUTTON_WIDTH
    }


    //-------------------------
    // ScrollableContainer dims (holds the xiv.Thumbnails)
    //-------------------------	
    var thumbnailGalleryCSS = {
	'height': Math.round(modalHeight) - xiv.EXPAND_BUTTON_WIDTH * 2,
	'top': xiv.EXPAND_BUTTON_WIDTH + 30
    }
    
    

    //-------------------------
    // Define the xiv.ViewBox dims
    //-------------------------	
    var ViewBoxLefts = [];
    var ViewBoxTops = [];
    var ScrollableContainerDims = utils.style.dims(this.ThumbnailGallery_.getElement())
    var viewerStart = ScrollableContainerDims.width +  ScrollableContainerDims['left'] + xiv.VIEWER_VERTICAL_MARGIN;

    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	
	l = viewerStart + j * (ViewBoxWidth + xiv.VIEWER_VERTICAL_MARGIN);
	if (j==0 || !ViewBoxLefts[i]) {
	    ViewBoxLefts.push([])
	}
	
	ViewBoxLefts[i][j] = l;
	if (j==0 || !ViewBoxTops[i]) {
	    ViewBoxTops.push([]);
	}
	
	ViewBoxTops[i][j] = (-1 + i * (ViewBoxHeight + xiv.VIEWER_HORIZONTAL_MARGIN));
	
	//if (i==0)
	ViewBoxTops[i][j] +=  xiv.EXPAND_BUTTON_WIDTH;
	
    });



    //-------------------------
    // Return the dim object.
    //-------------------------	
    return  {
	
	'width': Math.round(modalWidth),
	'left': Math.round(_l),
	'height': Math.round(modalHeight),
	'top': Math.round(_t),
	'ViewBox': {
	    
	    'width': Math.round(ViewBoxWidth),
	    'height': Math.round(ViewBoxHeight),
	    'lefts': ViewBoxLefts,
	    'tops': ViewBoxTops	
	    
	},
	'ThumbnailGallery_': thumbnailGalleryCSS,
	'closeButton_': {
	    
	    'left': Math.round(_l) + Math.round(modalWidth) - 23,
	    'top': Math.round(_t) + 10
	    
	},
	'ColumnMenu_': {
	    
	    'left': Math.round(modalWidth) - xiv.EXPAND_BUTTON_WIDTH,
	    'top': ViewBoxTops[0][0] + Math.round(modalHeight)/2 - xiv.EXPAND_BUTTON_WIDTH - 20,
	    'width': xiv.EXPAND_BUTTON_WIDTH - 1,
	    'height': 40
	    
	},
	'RowMenu_': {
	    
	    'left': ViewBoxLefts[0][0] + (Math.round(modalWidth) - ViewBoxLefts[0][0] - xiv.EXPAND_BUTTON_WIDTH)/2 - 17,
	    'top': Math.round(modalHeight) - xiv.EXPAND_BUTTON_WIDTH,
	    'width': 40,
	    'height': xiv.EXPAND_BUTTON_WIDTH - 1
	    
	}

    }

}



/**
 * Method for updating the style of the '_modal' element
 * due to window resizing, or any event that requires the 
 * xiv.Modal element change its dimensions.
 *
 * @param {Object.<string, string | number>=}
 * @public
 */
xiv.Modal.prototype.updateStyle = function (opt_args) {	

    //-------------------------	
    // xiv.Modal 
    //-------------------------	
    modalDims = this.calculateModalDims_();
    //window.console.log(modalDims);
    utils.style.setStyle( this.modal_, modalDims);
    if (opt_args) {  utils.style.setStyle( this.modal_, opt_args); }	
    


    //-------------------------	
    // xiv.Thumbnail Gallery
    //-------------------------	
    if (this.ThumbnailGallery_) { this.ThumbnailGallery_.updateStyle(modalDims['ThumbnailGallery_']);}
    


    //-------------------------	
    // xiv.ViewBoxes	
    //-------------------------	
    if (this.ViewBoxManager_) {
	this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	    ViewBox.updateStyle({
		'height': modalDims['ViewBox']['height'],
		'width': modalDims['ViewBox']['width'],
		'left': modalDims['ViewBox']['lefts'][i][j],
		'top': modalDims['ViewBox']['tops'][i][j]
	    });	

	    this.ViewBoxManager_.updateDragDropHandles();
	}.bind(this)); 		
    }	
    


    //------------------
    // Highlight in use thumbnails
    //------------------    
    this.highlightInUseThumbnails();
	
}



xiv.Modal.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-modal');
xiv.Modal.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'background');
xiv.Modal.POPUP_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'popup');
xiv.Modal.MODAL_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'window');
xiv.Modal.CLOSEBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'closebutton');
xiv.Modal.FULLSCREENBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'fullscreenbutton');
xiv.Modal.POPUPBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'popupbutton');
xiv.Modal.ADDPATHSBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'addpathsbutton');
xiv.Modal.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'scrollgallery');
xiv.Modal.COLUMNMENU_CLASS = /**@type {string} @const*/goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'columnmenu');
xiv.Modal.ROWMENU_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'rowmenu');
xiv.Modal.COLUMNMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.COLUMNMENU_CLASS, 'button');
xiv.Modal.ROWMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.ROWMENU_CLASS, 'button');


