/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.dom.fullscreen');
goog.require('goog.window');

/**
 * utils includes
 */
goog.require('utils.ui.ScrollableContainer.ThumbnailGallery');
goog.require('utils.xnat');
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.convert');
goog.require('utils.fx');

/**
 * viewer-widget includes
 */
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.ThumbnailManager');
goog.require('xiv.ViewBoxManager');



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



    /**
     * @type {String}
     * @private
     */
    this.xnatPath_ = '';




    /**
     * @type {?Element}
     * @private
     */	
    this.modal_ = null;




    /**
     * @type {?Element}
     * @private
     */	
    this.closeButton_ = null;




    /**
     * @type {?Element}
     * @private
     */	
    this.fullScreenButton_ = null;




    /**
     * @type {?Element}
     * @private
     */	
    this.popupButton_ = null;




    /**
     * @type {?utils.ui.ScrollableContainer.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_ = null;




    /**
     * @type {?xiv.ThumbnailManager}
     * @private
     */
    this.ThumbnailManager_ = null;




    /**
     * @type {?xiv.ViewBoxManager}
     * @private
     */	
    this.ViewBoxManager_ = null;




    /**
     * @type {?Element}
     * @private
     */
    this.columnMenu_ = null;




    /**
     * @type {?Element}
     * @private
     */
    this.rowMenu_ = null;





    //------------------
    // xiv.Widget init.
    //------------------
    xiv.Widget.call(this, 'xiv.Modal');
    document.body.appendChild(this.element);
    goog.dom.classes.set(this.element, xiv.Modal.ELEMENT_CLASS);
    //
    //  Apply the appropriate class if in popup mode.
    //
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	goog.dom.classes.add(this.element, xiv.Modal.POPUP_CLASS);
    }


    //------------------
    // Fade all out
    //------------------    
    this.element.style.opacity = 0;



    //------------------
    // Define modal window.
    //
    // NOTE: the 'xiv.Modal.element' variable is the background, which is 
    // parent of the 'xiv.Modal.modal_' element.
    //------------------
    this.modal_ = utils.dom.makeElement("div", this.element, xiv.MODAL_ID);
    goog.dom.classes.set(this.modal_, xiv.Modal.MODAL_CLASS);
    this.modal_.setAttribute('isfullscreen', '0');



    //------------------
    // Set onresize 
    //------------------
    window.onresize = function () { this.updateStyle() }.bind(this);    
	


    //------------------
    // Prevent propagation when clicking on modal
    //------------------
    this.modal_.onclick = function (event) { utils.dom.stopPropagation(event);  }
	


    //------------------
    // All all interactive objects/classes.
    //------------------
    this.addCloseButton_();
    this.addFullScreenButton_();
    this.addPopupButton_();
    this.addThumbnailGallery_();
    this.addManagers_();
    this.addRowMenu_();
    this.addColumnMenu_();
    


    //------------------
    // Callbacks
    //------------------
    this.setThumbnailCallbacks_();
    this.setViewBoxCallbacks_();



    //------------------
    // Insert default columns on loadup
    //------------------
    this.ViewBoxManager_.insertColumn(false);
    
    

    //------------------
    // Update style
    //------------------
    this.updateStyle();
    


    //------------------
    // Fade all out
    //------------------    
    utils.fx.fadeIn(this.element, xiv.ANIM_MED);
    
}
goog.inherits(xiv.Modal, xiv.Widget);
goog.exportSymbol('xiv.Modal', xiv.Modal);



xiv.Modal.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-modal');
xiv.Modal.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'background');
xiv.Modal.POPUP_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'popup');
xiv.Modal.MODAL_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'window');
xiv.Modal.CLOSEBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'closebutton');
xiv.Modal.FULLSCREENBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'fullscreenbutton');
xiv.Modal.POPUPBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'popupbutton');
xiv.Modal.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'scrollgallery');
xiv.Modal.COLUMNMENU_CLASS = /**@type {string} @const*/goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'columnmenu');
xiv.Modal.ROWMENU_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'rowmenu');
xiv.Modal.COLUMNMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.COLUMNMENU_CLASS, 'button');
xiv.Modal.ROWMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.ROWMENU_CLASS, 'button');



/**
 * Get the associated modal for this object.
 *
 * @return {Element} The modal element of the Modal.js object.
 */
xiv.Modal.prototype.__defineGetter__('modal', function() {
  return this.modal_;
});



/**
 * Get the associated xiv.ViewBoxManager for this object.
 *
 * @return {xiv.ViewBoxManager} The xiv.ViewBoxManager for this object.
 */
xiv.Modal.prototype.__defineGetter__('ViewBoxManager', function() {
  return this.ViewBoxManager_;
});




/**
 * Get the associated xiv.ThumbnailManager for this object.
 *
 * @return {xiv.ThumbnailManager} The xiv.ThumbnailManager for this object.
 */
xiv.Modal.prototype.__defineGetter__('ThumbnailManager', function() {
  return this.ThumbnailManager_;
});






/**
 * @return {!string}
 * @public
 */
xiv.Modal.prototype.getXnatPath = function() { 
    return this.xnatPath_;
}




/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.addCloseButton_ = function(){
    this.closeButton_ = utils.dom.makeElement("img", this.modal_, "closeButton", {'opacity':.5});
    this.closeButton_.title = 'Close the Image Viewer'
    this.closeButton_.src = xiv.ICON_URL + "closeX.png";
    goog.events.listen(this.closeButton_, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(this.closeButton_, {'opacity':1});}.bind(this));
    goog.events.listen(this.closeButton_, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(this.closeButton_, {'opacity':.5});}.bind(this));
    goog.dom.classes.set(this.closeButton_, xiv.Modal.CLOSEBUTTON_CLASS);
    this.closeButton_.onclick = this.destroy;

    //
    // Hide the popup if we're already in popup mode.
    //
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	this.closeButton_.style.visibility = 'hidden';
    }
}  




/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.addFullScreenButton_ = function(){
    this.fullScreenButton_ = utils.dom.makeElement("img", this.modal_, "fullScreenButton", {'opacity':.5});
    this.fullScreenButton_.title = 'Enter full screen mode';
    this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen.png";


    goog.events.listen(this.fullScreenButton_, 
		       goog.events.EventType.MOUSEOVER, 
		       function(event) { utils.style.setStyle(this.fullScreenButton_, {'opacity':1})}.bind(this));


    goog.events.listen(this.fullScreenButton_, 
		       goog.events.EventType.MOUSEOUT, 
		       function(event) { utils.style.setStyle(this.fullScreenButton_, {'opacity':.5})}.bind(this));


    goog.dom.classes.set(this.fullScreenButton_, xiv.Modal.FULLSCREENBUTTON_CLASS);


    this.fullScreenButton_.onclick = function(){
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
    }.bind(this);
}




/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.addPopupButton_ = function(){

    
    this.popupButton_ = utils.dom.makeElement("img", this.modal_, "popupButton", {'opacity':.5});
    this.popupButton_.title = 'Popup viewer to new window.';
    this.popupButton_.src = xiv.ICON_URL + "popup.png";

    goog.events.listen(this.popupButton_, 
		       goog.events.EventType.MOUSEOVER, 
		       function(event) { utils.style.setStyle(this.popupButton_, {'opacity':1})}.bind(this));

    goog.events.listen(this.popupButton_, 
		       goog.events.EventType.MOUSEOUT, 
		       function(event) { utils.style.setStyle(this.popupButton_, {'opacity':.5})}.bind(this));

    goog.dom.classes.set(this.popupButton_, xiv.Modal.POPUPBUTTON_CLASS);
    this.popupButton_.onclick = function(){
	//window.console.log("OPENING POPUP");
	goog.window.popup(xiv.ROOT_URL + '/scripts/viewer/popup.html' + '?' + xiv.DATA_PATH);
	this.destroy();
	//goog.window.popup(xiv.ROOT_URL + '/templates/screens/XImgView.vm');
    }.bind(this);


    //
    // Hide the popup if we're already in popup mode.
    //
    if (XNAT_IMAGE_VIEWER_MODE === 'popup'){
	this.popupButton_.style.visibility = 'hidden';
    }
}



/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.addThumbnailGallery_ = function(){
    //------------------
    // Thumb gallery
    //------------------
    this.ThumbnailGallery_ = new utils.ui.ScrollableContainer.ThumbnailGallery();
    this.modal_.appendChild(this.ThumbnailGallery_.element);
    goog.dom.classes.add(this.ThumbnailGallery_.element, xiv.Modal.THUMBNAILGALLERY_CLASS);

}

    

/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.addManagers_ = function(){

    this.ThumbnailManager_ = new xiv.ThumbnailManager(this);
    this.ViewBoxManager_ = new xiv.ViewBoxManager(this);



    //------------------
    // Highlight the ViewBox when hovering over 
    // its Thumbnail in the Scroll Gallery
    //------------------
     this.ThumbnailManager_.onMouseOver = function(Thumbnail){
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail){
		ViewBox.element.style.borderColor = 'white';
	    }
	})	
    }.bind(this)
    this.ThumbnailManager_.onMouseOut = function(Thumbnail){;
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail && ViewBox.loadState !== 'loading'){
		ViewBox.element.style.borderColor = ViewBox.element.getAttribute('originalbordercolor');	
	    }
	})
    }.bind(this)




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


}





/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.setThumbnailCallbacks_ = function(){
    this.ThumbnailManager_.addDropCallback(function(viewBoxElement, thumbnailElement) {
	var _ViewBox = this.ViewBoxManager_.getViewBoxByElement(viewBoxElement);
	var _Thumb = this.ThumbnailManager_.getThumbnailByElement(thumbnailElement);
	_ViewBox.loadThumbnail(_Thumb);
    }.bind(this)); 

    this.ThumbnailManager_.addClickCallback(function(_Thumb) {
	this.ViewBoxManager_.getFirstEmpty().loadThumbnail(_Thumb);
    }.bind(this));
}




/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.setViewBoxCallbacks_ = function(){
    this.ViewBoxManager_.onViewBoxesChanged(function() {
	this.ThumbnailManager_.addDragDropTargets(this.ViewBoxManager_.getViewBoxElements());
    }.bind(this))
}





/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @param {!string} path The XNAT to set for querying.
 * @public
 */
xiv.Modal.prototype.setXnatPath = function(path) {


    path = (path[0] !== "/") ? "/" + path : path;

    //------------------
    // Set the private var 'xnatPath_'.
    //------------------
    this.xnatPath_ = xiv.XNAT_QUERY_PREFIX + path; 
};




/**
 * Generates xiv.Thumbnail property objects for creating
 * thumbnails in the 'populate scroll gallery' function.
 * Calls on the internal 'setXnatPath' method to define
 * the private var 'xnatPath_'.
 *
 * @param {!string} path The XNAT to set for querying.
 * @public
 */
xiv.Modal.prototype.setXnatPathAndLoadThumbnails = function(path){

    var viewableData;
    var viewableTypes = ["scans", "Slicer"];
    var slicerThumbnailsLoaded = false;


    //------------------
    // Set the XNAT path.
    //
    // IMPORTANT: Critical pre-step!
    //------------------
    this.setXnatPath(path);




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
	XNAT_IMAGE_VIEWER_DEMO_SCANS = utils.xnat.sortViewableCollection(XNAT_IMAGE_VIEWER_DEMO_SCANS, ['sessionInfo', 'Scan', 'value', 0]);
	XNAT_IMAGE_VIEWER_DEMO_SLICER = utils.xnat.sortViewableCollection(XNAT_IMAGE_VIEWER_DEMO_SLICER, ['Name']);


	//
	// Make thumbnails from the data.
	//
	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SCANS, function(demoScan){
	    this.addThumbnailsToGallery_('scans',  [demoScan]);
	}.bind(this))
	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SLICER, function(demoSlicer){
	    this.addThumbnailsToGallery_('Slicer',  [demoSlicer]);
	}.bind(this))

    }


    
    //------------------
    // LIVE MODE: 
    //
    // Get Viewables from XNAT server.
    // Scans xiv.Thumbnails first, then Slicer xiv.Thumbnails.
    //------------------  
    else {
	utils.xnat.getViewables(this.xnatPath_, 'scans', function(viewable){
	    //
	    // Add Scans xiv.Thumbnails to the xiv.ThumbnailGallery.
	    //
	    this.addThumbnailsToGallery_('scans',  [viewable]);
	    //
	    // Attempt to load Slicer thumbnails after the Scan thumbnails.
	    //
	    if (!slicerThumbnailsLoaded) {
		utils.xnat.getViewables(this.xnatPath_, 'Slicer', function(viewable2){

		    //window.console.log("\n\nSLICER VIEWABLE", viewable2);
		    this.addThumbnailsToGallery_('Slicer',  [viewable2]);
		}.bind(this));
		slicerThumbnailsLoaded = true;
	    }
	}.bind(this));
    }
}




/**
 * Creates xiv.Thumbnails to feed into the scroll gallery zippys.
 *
 * @param {!string} folder The folder which the thumbnais belong to in the zippy headers of the ThumbnailGallery.
 * @param {!Array.<utils.xnat.properties>} viewablePropertiesArray The viewables properties to convert to thumbnails.
 * @private
 */
xiv.Modal.prototype.addThumbnailsToGallery_ = function (folder, viewablePropertiesArray) {
    goog.array.forEach(viewablePropertiesArray, function(viewableProperties) { 
	var thumbnail = this.ThumbnailManager_.makeXivThumbnail(viewableProperties);	
	this.ThumbnailGallery_.addThumbnail(thumbnail, folder.toString()); 
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
	Thumbnail.setActive(false, false);
    })


    //------------------
    // Highight only in use thumbnails by 
    // looping through the xiv.ViewBoxes.
    //------------------
    this.ViewBoxManager_.loop(function(ViewBox){  
	ViewBox.Thumbnail && ViewBox.Thumbnail.setActive(true, false);
    })
}




/**
 * Makes the buttons for Row / Column insertion and removal. 
 *
 * @param {!Element} parent The parent of the row/column button.
 * @param {!string} className The classname of the row/column button.
 * @param {!Object.<string,number|string>} args The style args for the row/column button.
 * @private
 */
xiv.Modal.prototype.makeRowColButton_ = function(parent, className, args) {

    //------------------
    // Make the Button element
    //------------------
    var button = utils.dom.makeElement("img", parent, args.id, args['style'] );	
    goog.dom.classes.add(button, className);



    //------------------
    // STYLE: Its natural state -- slightly faded
    //------------------
    utils.style.setStyle(button, {'opacity':.5});
    


    //------------------
    // Define the mouseover functions.	
    //------------------
    goog.events.listen(button, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(button, {'opacity':.8});});
    goog.events.listen(button, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(button, {'opacity':.5});});
    button.src = args.src;	
    button.title = args.title;



    //------------------
    // Define the onclick function.
    //------------------
    goog.events.listen(button, goog.events.EventType.CLICK, function(event) { 
	utils.style.setStyle(button, {'opacity':.5});
	args.onclick();
    });		
}




/**
 * Adds the 'addColumn' menu to the modal window.
 *
 * @private
 */
xiv.Modal.prototype.addColumnMenu_ = function () {


    //------------------
    // Make columnMenu element, add class.
    //------------------
    this.columnMenu_ = utils.dom.makeElement("div", this.modal_, "ColumnMenu_");
    goog.dom.classes.add(this.columnMenu_, xiv.Modal.COLUMNMENU_CLASS);
    


    //------------------
    // Make 'insertColumn' button
    //------------------
    this.makeRowColButton_(this.columnMenu_, xiv.Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "InsertColumnButton", 
	'src':  xiv.ICON_URL + "Arrows/insertColumn.png",
	'style': {'top': 0},
	'title': "Insert Column",
	'onclick': function () { this.ViewBoxManager_.insertColumn()}.bind(this)	
    });



    //------------------
    // Make 'removeColumn' button
    //------------------
    this.makeRowColButton_(this.columnMenu_, xiv.Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "RemoveColumnButton", 
	'src':  xiv.ICON_URL + "/Arrows/removeColumn.png",
	'style': {'top': 22},
	'title': "Remove Column",
	'onclick': function () { this.ViewBoxManager_.removeColumn()}.bind(this)	
    });
}




/**
 * Adds the 'addRow' menu to the modal window.
 *
 * @private
 */
xiv.Modal.prototype.addRowMenu_ = function () {


    //------------------
    // Make rowMenu element, add class.
    //------------------
    this.rowMenu_ = utils.dom.makeElement("div", this.modal_, "RowMenu_");
    goog.dom.classes.add(this.rowMenu_, xiv.Modal.ROWMENU_CLASS);



    //------------------
    // Make 'insertRow' button
    //------------------
    this.makeRowColButton_(this.rowMenu_, xiv.Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "InsertRowButton", 
	'src':  xiv.ICON_URL + "Arrows/insertRow.png",
	'style': {'left': 0},
	'title': "Insert Row",
	'onclick': function () { this.ViewBoxManager_.insertRow()}.bind(this)	
    });



    //------------------
    // Make 'removeRow' button
    //------------------
    this.makeRowColButton_(this.rowMenu_, xiv.Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "RemoveRowButton", 
	'src':  xiv.ICON_URL + "Arrows/removeRow.png",
	'style': {'left': 22},
	'title': "Remove Row",
	'onclick': function () { this.ViewBoxManager_.removeRow()}.bind(this)	
    });
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
    var minModalWidth = utils.style.dims(this.ThumbnailGallery_.element, 'width') + 
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
    var modalWidth = utils.style.dims(this.ThumbnailGallery_.element, 'width') + 
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
	var thumbGalleryWidth = utils.convert.toInt((utils.style.getComputedStyle(this.ThumbnailGallery_.element, 'width')));
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
    // Define the xiv.ViewBox dims
    //-------------------------	
    var ViewBoxLefts = [];
    var ViewBoxTops = [];
    var ScrollableContainerDims = utils.style.dims(this.ThumbnailGallery_.element)
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
	'ThumbnailGallery_': ScrollableContainerCSS,
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



goog.exportSymbol('xiv.Modal.prototype.getXnatPath', xiv.Modal.prototype.getXnatPath);
goog.exportSymbol('xiv.Modal.prototype.setXnatPath', xiv.Modal.prototype.setXnatPath);
goog.exportSymbol('xiv.Modal.prototype.setXnatPathAndLoadThumbnails', xiv.Modal.prototype.setXnatPathAndLoadThumbnails);
goog.exportSymbol('xiv.Modal.prototype.highlightInUseThumbnails', xiv.Modal.prototype.highlightInUseThumbnails);
goog.exportSymbol('xiv.Modal.prototype.animateModal', xiv.Modal.prototype.animateModal);
goog.exportSymbol('xiv.Modal.prototype.destroy', xiv.Modal.prototype.destroy);
goog.exportSymbol('xiv.Modal.prototype.updateStyle', xiv.Modal.prototype.updateStyle);
