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
 * the 'xiv.Modal._element' variable is the background, which is the
 * parent of the 'xiv.Modal._modal' element.
 *
 * @constructor
 * @extends {xiv.Widget}
 */

goog.provide('xiv.Modal');
xiv.Modal = function () {
    var that = this;


    //------------------
    // SEt the global modal object
    //------------------
    xiv._Modal = this;



    //------------------
    // xiv.Widget init.
    //------------------
    xiv.Widget.call(this, 'xiv.Modal');
    document.body.appendChild(this._element);
    goog.dom.classes.set(this._element, xiv.Modal.ELEMENT_CLASS);


    //------------------
    // Fade all out
    //------------------    
    this._element.style.opacity = 0;




    //------------------
    // Define modal window.
    //
    // NOTE: the 'xiv.Modal._element' variable is the background, which is 
    // parent of the 'xiv.Modal._modal' element.
    //------------------
    this._modal = utils.dom.makeElement("div", this._element, xiv.MODAL_ID);
    goog.dom.classes.set(this._modal, xiv.Modal.MODAL_CLASS);
    this._modal.setAttribute('isfullscreen', '0');

	

    //------------------
    // Define close button.
    //------------------
    this.closeButton_ = utils.dom.makeElement("img", this._modal, "closeButton", {'opacity':.5});
    this.closeButton_.title = 'Close the Image Viewer'
    this.closeButton_.src = xiv.ICON_URL + "closeX.png";
    goog.events.listen(this.closeButton_, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(this.closeButton_, {'opacity':1});}.bind(this));
    goog.events.listen(this.closeButton_, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(this.closeButton_, {'opacity':.5});}.bind(this));
    goog.dom.classes.set(this.closeButton_, xiv.Modal.CLOSEBUTTON_CLASS);
    this.closeButton_.onclick = this.destroy;
    


    //------------------
    // Define full screen button
    //------------------
    this.fullScreenButton_ = utils.dom.makeElement("img", this._modal, "fullScreenButton", {'opacity':.5});
    this.fullScreenButton_.title = 'Enter full screen mode';
    this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen.png";
    goog.events.listen(this.fullScreenButton_, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(this.fullScreenButton_, {'opacity':1})}.bind(this));
    goog.events.listen(this.fullScreenButton_, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(this.fullScreenButton_, {'opacity':.5})}.bind(this));
    goog.dom.classes.set(this.fullScreenButton_, xiv.Modal.FULLSCREENBUTTON_CLASS);
    this.fullScreenButton_.onclick = function(){
	if (this._modal.getAttribute('isfullscreen') === '0'){
	    goog.dom.fullscreen.requestFullScreen(this._modal); 
	    this._modal.setAttribute('isfullscreen', '1');
	    this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen-reverse.png";
	    this.fullScreenButton_.title = 'Exit full screen mode';
	} else {
	    goog.dom.fullscreen.exitFullScreen();
	    this._modal.setAttribute('isfullscreen', '0');
	    this.fullScreenButton_.src = xiv.ICON_URL + "fullScreen.png";
	    this.fullScreenButton_.title = 'Enter full screen mode';
	}
    }.bind(this);



    //------------------
    // Define popup
    //------------------
    this.popupButton_ = utils.dom.makeElement("img", this._modal, "popupButton", {'opacity':.5});
    this.popupButton_.title = 'Popup viewer to new window.';
    this.popupButton_.src = xiv.ICON_URL + "popup.png";
    goog.events.listen(this.popupButton_, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(this.popupButton_, {'opacity':1})}.bind(this));
    goog.events.listen(this.popupButton_, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(this.popupButton_, {'opacity':.5})}.bind(this));
    goog.dom.classes.set(this.popupButton_, xiv.Modal.POPUPBUTTON_CLASS);
    this.popupButton_.onclick = function(){
	goog.window.popup('Demo.html');
    }.bind(this);



    //------------------
    // Thumb gallery
    //------------------
    this.ThumbnailGallery_ = new utils.ui.ScrollableContainer.ThumbnailGallery();
    this._modal.appendChild(this.ThumbnailGallery_._element);
    goog.dom.classes.add(this.ThumbnailGallery_._element, xiv.Modal.THUMBNAILGALLERY_CLASS);



    
    //------------------
    // Managers
    //------------------
    this._ThumbnailManager = new xiv.ThumbnailManager(this);
    this._ViewBoxManager = new xiv.ViewBoxManager(this);



    //------------------
    // Set onresize 
    //------------------
    window.onresize = function () { this.updateStyle() }.bind(this);    
	


    //------------------
    // Don't propagate when clicking on modal
    //------------------
    this._modal.onclick = function (event) { utils.dom.stopPropagation(event);  }
 


    //------------------
    // Add Row and Column Menus
    //------------------
    that.addRowMenu_();
    that.addColumnMenu_();
   


    //------------------    
    // xiv.Thumbnail DragDrop callbacks
    //------------------
    this._ThumbnailManager.addDropCallback(function(viewBoxElement, thumbnailElement) {
	var _ViewBox = that._ViewBoxManager.getViewBoxByElement(viewBoxElement);
	var _Thumb = that._ThumbnailManager.getThumbnailByElement(thumbnailElement);
	_ViewBox.loadThumbnail(_Thumb);
    }); 
    this._ThumbnailManager.addClickCallback(function(_Thumb) {
	that._ViewBoxManager.getFirstEmpty().loadThumbnail(_Thumb);
    });



    //------------------
    //	ViewBox changed callback
    //------------------
    that._ViewBoxManager.addViewBoxesChangedCallback(function() {
	that._ThumbnailManager.addDragDropTargets(that._ViewBoxManager.getViewBoxElements());
    })



    //------------------
    // Insert default columns on loadup
    //------------------
    that._ViewBoxManager.insertColumn(false);
    
    

    //------------------
    // Update style
    //------------------
    that.updateStyle();
    


    //------------------
    // Fade all out
    //------------------    
    utils.fx.fadeIn(this._element, xiv.ANIM_MED);
    
}
goog.inherits(xiv.Modal, xiv.Widget);
goog.exportSymbol('xiv.Modal', xiv.Modal);



xiv.Modal.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-modal');
xiv.Modal.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'background');
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
 * @type {String}
 * @private
 */
xiv.Modal.prototype.xnatPath_ = '';




/**
 * @type {?Element}
 * @expose
 */	
xiv.Modal.prototype._modal = null;




/**
 * @type {?Element}
 * @private
 */	
xiv.Modal.prototype.closeButton_ = null;


/**
 * @type {?Element}
 * @private
 */	
xiv.Modal.prototype.fullScreenButton_ = null;


/**
 * @type {?Element}
 * @private
 */	
xiv.Modal.prototype.popupButton_ = null;



/**
 * @type {?utils.ui.ScrollableContainer.ThumbnailGallery}
 * @private
 */
xiv.Modal.prototype.ThumbnailGallery_ = null;




/**
 * @type {?xiv.ThumbnailManager}
 * @expose
 */
xiv.Modal.prototype._ThumbnailManager = null;




/**
 * @type {?xiv.ViewBoxManager}
 * @expose
 */	
xiv.Modal.prototype._ViewBoxManager = null;



/**
* @type {?Element}
*/
xiv.Modal.prototype.columnMenu_ = null;




/**
* @type {?Element}
*/
xiv.Modal.prototype.rowMenu_ = null;




/**
 * @return {!string}
 */
xiv.Modal.prototype.getXnatPath = function() { 
    return this.xnatPath_;
}




/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @param {!string}
 * @expose
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
 * @param {!string}
 * @expose
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
	    this.addThumbnailsToThumbnailGallery('scans',  [demoScan]);
	}.bind(this))
	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SLICER, function(demoSlicer){
	    this.addThumbnailsToThumbnailGallery('Slicer',  [demoSlicer]);
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
	    this.addThumbnailsToThumbnailGallery('scans',  [viewable]);
	    //
	    // Attempt to load Slicer thumbnails after the Scan thumbnails.
	    //
	    if (!slicerThumbnailsLoaded) {
		utils.xnat.getViewables(this.xnatPath_, 'Slicer', function(viewable2){

		    window.console.log("\n\nSLICER VIEWABLE", viewable2);
		    this.addThumbnailsToThumbnailGallery('Slicer',  [viewable2]);
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
 * @param {!Array.<Object>} viewablePropertiesArray The viewables properties to convert to thumbnails.
 * @private
 */
xiv.Modal.prototype.addThumbnailsToThumbnailGallery = function (folder, viewablePropertiesArray) {

    goog.array.forEach(viewablePropertiesArray, function(viewableProperties) { 
	thumbnail = this._ThumbnailManager.makeXivThumbnail(viewableProperties);	
	this.ThumbnailGallery_.addThumbnail(thumbnail, folder.toString()); 

    }.bind(this))	
}




/**
 * Highlights all thumgnails that are being viewed 
 * a xiv.ViewBox.
 *
 * @public
 */
xiv.Modal.prototype.highlightInUseThumbnails = function () {
    //------------------
    // Unhighlight all thumbnails.
    //------------------
    this._ThumbnailManager.loop(function(Thumbnail){  
	Thumbnail.setActive(false, false);
    })


    //------------------
    // Highight only in use thumbnails by 
    // looping through the xiv.ViewBoxes.
    //------------------
    this._ViewBoxManager.loop(function(ViewBox){  
	xiv.ViewBox.currentThumbnail_ && ViewBox.currentThumbnail_.setActive(true, false);
    })
}




/**
 * Makes the buttons for Row / Column insertion and removal. 
 *
 * @param {!Element, !string, !Object.<string,number|string>}
 */
xiv.Modal.prototype.makeRowColButton = function(parent, className, args) {

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
 */
xiv.Modal.prototype.addColumnMenu_ = function () {
    var that = this;



    //------------------
    // Make columnMenu element, add class.
    //------------------
    this.columnMenu_ = utils.dom.makeElement("div", this._modal, "ColumnMenu_");
    goog.dom.classes.add(this.columnMenu_, xiv.Modal.COLUMNMENU_CLASS);
    


    //------------------
    // Make 'insertColumn' button
    //------------------
    this.makeRowColButton(that.columnMenu_, xiv.Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "InsertColumnButton", 
	'src':  xiv.ICON_URL + "Arrows/insertColumn.png",
	'style': {'top': 0},
	'title': "Insert Column",
	'onclick': function () { that._ViewBoxManager.insertColumn(); 
	}	
    });



    //------------------
    // Make 'removeColumn' button
    //------------------
    this.makeRowColButton(that.columnMenu_, xiv.Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "RemoveColumnButton", 
	'src':  xiv.ICON_URL + "/Arrows/removeColumn.png",
	'style': {'top': 22},
	'title': "Remove Column",
	'onclick': function () { that._ViewBoxManager.removeColumn();  
	}	
    });
}




/**
 * Adds the 'addRow' menu to the modal window.
 */
xiv.Modal.prototype.addRowMenu_ = function () {
    var that = this;



    //------------------
    // Make rowMenu element, add class.
    //------------------
    this.rowMenu_ = utils.dom.makeElement("div", this._modal, "RowMenu_");
    goog.dom.classes.add(this.rowMenu_, xiv.Modal.ROWMENU_CLASS);



    //------------------
    // Make 'insertRow' button
    //------------------
    this.makeRowColButton(that.rowMenu_, xiv.Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "InsertRowButton", 
	'src':  xiv.ICON_URL + "Arrows/insertRow.png",
	'style': {'left': 0},
	'title': "Insert Row",
	'onclick': function () { that._ViewBoxManager.insertRow(); 
	}	
    });



    //------------------
    // Make 'removeRow' button
    //------------------
    this.makeRowColButton(that.rowMenu_, xiv.Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "RemoveRowButton", 
	'src':  xiv.ICON_URL + "Arrows/removeRow.png",
	'style': {'left': 22},
	'title': "Remove Row",
	'onclick': function () { that._ViewBoxManager.removeRow();  
	}	
    });
};






/**
 * Used when a row or column is inserted.  The modal animates itself
 * on its resize.
 *
 * @param {function=}
 */
xiv.Modal.prototype.animateModal  = function (opt_callback) {

    var that = this;
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
    var modalResize = resize(this._modal, modalDims.width, modalDims.height, xiv.ANIM_MED)
    animQueue.add(modalResize);
    animQueue.add(slide(this._modal, modalDims.left, modalDims.top, xiv.ANIM_MED));






    //------------------
    // Set and add the xiv.ViewBox's animation methods
    // to the animation queue.
    //------------------
    this._ViewBoxManager.loop( function(ViewBox, i, j) { 
	animQueue.add(slide(ViewBox._element, modalDims.ViewBox.lefts[i][j], modalDims.ViewBox.tops[i][j], xiv.ANIM_MED));	
	animQueue.add(resize(ViewBox._element, modalDims.ViewBox.width, modalDims.ViewBox.height, xiv.ANIM_MED));	
    })
	
     


    //------------------
    // Call 'updateStyle' on every animation frame.
    //------------------
    goog.events.listen(modalResize, 'animate', function() {
	that._ViewBoxManager.loop( function(ViewBox, i, j) { 
	    ViewBox.updateStyle();
	})
    })



    //------------------
    // When animation finishes, apply End Callback
    // (any new ViewVoxes fade in).
    //------------------
    goog.events.listen(animQueue, 'end', function() {
	//
	// Update style.
	//
	that.updateStyle();
	//
	// Fade in new viewers.
	//
	that._ViewBoxManager.loop( function(ViewBox, i, j) { 
	    if (ViewBox._element.style.opacity == 0) {
		utils.fx.fadeIn(ViewBox._element, xiv.ANIM_FAST);
	    }
	})
	//
	// Run callback
	//
	if (opt_callback) { opt_callback() };
    })



    //------------------
    // Play animation
    //------------------
    animQueue.play();
}




/**
 * Fades out then deletes the modal and all of its
 * child elements.
 *
 * @param {number=}
 */
xiv.Modal.prototype.destroy = function (fadeOut) {
    var that = this;


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
    
    var that = this;
    var ScrollableContainerLeft = 0;
    var maxModalWidth = Math.round(window.innerWidth * xiv.MAX_MODAL_HEIGHT_PERCENTAGE);
    
    
    
    //**************************************************************
    // Generate a prelimiary width...
    //**************************************************************
    
    //------------------
    //	Get the prescribed height of the modal	
    //------------------
    var modalHeight = xiv.MAX_MODAL_HEIGHT_PERCENTAGE * window.innerHeight;

    

    //------------------
    //	Get the number of scan viewers
    //------------------
    var viewers = this._ViewBoxManager.getViewBoxes();
    var ViewBoxColumns = this._ViewBoxManager.numCols();
    var ViewBoxRows = this._ViewBoxManager.numRows();
    
    

    //------------------
    // Determine the minimum modal width
    //------------------
    var minModalWidth = utils.style.dims(that.ThumbnailGallery_._element, 'width') + 
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
    var modalWidth = utils.style.dims(that.ThumbnailGallery_._element, 'width') + 
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
	var thumbGalleryWidth = utils.convert.toInt((utils.style.getComputedStyle(that.ThumbnailGallery_._element, 'width')));
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
    var ScrollableContainerDims = utils.style.dims(this.ThumbnailGallery_._element)
    var viewerStart = ScrollableContainerDims.width +  ScrollableContainerDims['left'] + xiv.VIEWER_VERTICAL_MARGIN;

    that._ViewBoxManager.loop( function(ViewBox, i, j) { 
	
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
 */
xiv.Modal.prototype.updateStyle = function (opt_args) {	

    var that = this;
    

    //-------------------------	
    // xiv.Modal 
    //-------------------------	
    modalDims = this.calculateModalDims_();
    //window.console.log(modalDims);
    utils.style.setStyle( this._modal, modalDims);
    if (opt_args) {  utils.style.setStyle( this._modal, opt_args); }	
    


    //-------------------------	
    // xiv.Thumbnail Gallery
    //-------------------------	
    if (this.ThumbnailGallery_) { this.ThumbnailGallery_.updateStyle(modalDims['ThumbnailGallery_']);}
    


    //-------------------------	
    // xiv.ViewBoxes	
    //-------------------------	
    if (that._ViewBoxManager) {
	that._ViewBoxManager.loop( function(ViewBox, i, j) { 
	    ViewBox.updateStyle({
		'height': modalDims['ViewBox']['height'],
		'width': modalDims['ViewBox']['width'],
		'left': modalDims['ViewBox']['lefts'][i][j],
		'top': modalDims['ViewBox']['tops'][i][j]
	    });	

	    that._ViewBoxManager.updateDragDropHandles();
	}); 		
    }	
    


    //------------------
    // Highlight in use thumbnails
    //------------------    
    this.highlightInUseThumbnails();
	
}
