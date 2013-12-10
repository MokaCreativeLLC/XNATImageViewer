/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */
goog.require('utils.gui.ScrollableContainer');

/**
 * viewer-widget includes
 */
goog.require('XnatViewerGlobals');
goog.require('XnatViewerWidget');
goog.require('ViewBoxManager');




/**
 * 'Modal' is the central class where all of the XnatViewerWidgets
 * meet: XnatIO, ScrollableContainer, Thumbnails, ViewBoxes.  It also 
 * oversees the ViewBoxManager and ThumbnailManager classes and 
 * the actual modal window.  It should be noted that
 * the 'Modal._element' variable is the background, which is the
 * parent of the 'Modal._modal' element.
 *
 * @constructor
 * @param {Object=}
 * @extends {XnatViewerWidget}
 */
goog.provide('Modal');
Modal = function (opt_args) {
    var that = this;



    //------------------
    // XnatViewerWidget init.
    //------------------
    XnatViewerWidget.call(this, utils.dom.mergeArgs(opt_args, {'id' : 'Modal'}));



    //------------------
    // Fade all out
    //------------------    
    this._element.style.opacity = 0;



    //------------------
    // Set class.  
    //------------------
    goog.dom.classes.set(this._element, Modal.ELEMENT_CLASS);



    //------------------
    // Define modal window.
    //
    // NOTE: the 'Modal._element' variable is the background, which is 
    // parent of the 'Modal._modal' element.
    //------------------
    this._modal = utils.dom.makeElement("div", this._element, XnatViewerGlobals.MODAL_ID);
    goog.dom.classes.set(this._modal, Modal.MODAL_CLASS);

	

    //------------------
    // Define close button.
    //------------------
    this.closeButton_ = utils.dom.makeElement("img", this._element, "closeButton", {'opacity':.5});
    this.closeButton_.src = XnatViewerGlobals.ICON_URL + "closeX.png";
    goog.events.listen(that.closeButton_, goog.events.EventType.MOUSEOVER, function(event) { utils.style.setStyle(that.closeButton_, {'opacity':1});});
    goog.events.listen(that.closeButton_, goog.events.EventType.MOUSEOUT, function(event) { utils.style.setStyle(that.closeButton_, {'opacity':.5});});
    goog.dom.classes.set(this.closeButton_, Modal.CLOSEBUTTON_CLASS);



    //------------------
    // Close button onlcick: destoy.
    //------------------
    this.closeButton_.onclick = this.destroy;



    //------------------
    // Thumb gallery
    //------------------
    this.ThumbnailGallery_ = new utils.gui.ScrollableContainer({ 'parent': this._modal });
    goog.dom.classes.add(this.ThumbnailGallery_._element, Modal.THUMBNAILGALLERY_CLASS);


    
    //------------------
    // Managers
    //------------------
    this.ThumbnailManager = new ThumbnailManager(this);
    this.ViewBoxManager = new ViewBoxManager(this);
    this.XnatIO_ = new XnatIO()



    //------------------
    // Set onresize 
    //------------------
    window.onresize = function () { that.updateStyle(); };    
	


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
    // Thumbnail DragDrop callbacks
    //------------------
    this.ThumbnailManager.addDropCallback(function(viewBoxElement, thumbnailElement) {
	var _ViewBox = that.ViewBoxManager.getViewBoxByElement(viewBoxElement);
	var _Thumb = that.ThumbnailManager.getThumbnailByElement(thumbnailElement);
	_ViewBox.loadThumbnail(_Thumb);
    }); 
    this.ThumbnailManager.addClickCallback(function(_Thumb) {
	that.ViewBoxManager.getFirstEmpty().loadThumbnail(_Thumb);
    });



    //------------------
    //	ViewBox changed callback
    //------------------
    that.ViewBoxManager.addViewBoxesChangedCallback(function() {
	that.ThumbnailManager.addDragDropTargets(that.ViewBoxManager.getViewBoxElements());
    })



    //------------------
    // Insert default columns on loadup
    //------------------
    that.ViewBoxManager.insertColumn(false);

    

    //------------------
    // Update style
    //------------------
    that.updateStyle();



    //------------------
    // Fade all out
    //------------------    
    utils.fx.fadeIn(this._element, XnatViewerGlobals.ANIM_MED);
}
goog.inherits(Modal, XnatViewerWidget);
goog.exportSymbol('Modal', Modal);




Modal.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-modal');
Modal.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.CSS_CLASS_PREFIX, 'background');
Modal.MODAL_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.CSS_CLASS_PREFIX, 'window');
Modal.CLOSEBUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.CSS_CLASS_PREFIX, 'closebutton');
Modal.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.CSS_CLASS_PREFIX, 'scrollgallery');
Modal.COLUMNMENU_CLASS = /**@type {string} @const*/goog.getCssName(Modal.CSS_CLASS_PREFIX, 'columnmenu');
Modal.ROWMENU_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.CSS_CLASS_PREFIX, 'rowmenu');
Modal.COLUMNMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.COLUMNMENU_CLASS, 'button');
Modal.ROWMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(Modal.ROWMENU_CLASS, 'button');




/**
 * @type {string}
 * @private
 */
Modal.prototype.xnatPath_ = ""




/**
 * @type {?Element}
 * @expose
 */	
Modal.prototype._modal = undefined;




/**
 * @type {?Element}
 * @private
 */	
Modal.prototype.closeButton_ = undefined;



/**
 * @type {?utils.gui.ScrollableContainer}
 * @private
 */
Modal.prototype.ThumbnailGallery_ = undefined;




/**
 * @type {?ThumbnailManager}
 * @expose
 */
Modal.prototype.ThumbnailManager = undefined;




/**
 * @type {?ViewBoxManager}
 * @expose
 */	
Modal.prototype.ViewBoxManager = undefined;




/**
 * @type {?Object}
 * @expose
 */
Modal.prototype.XnatIO_ = undefined;




/**
 * @type {Array.<Object>}
 * @private
 */
Modal.prototype.dragDropThumbnails_ = [];




/**
 * @type {function():string}
 */
Modal.prototype.getXnatPath = function() { 
    return this.xnatPath_;
}




/**
* @type {Element | undefined}
*/
Modal.prototype.columnMenu_ = undefined;




/**
* @type {Element | undefined}
*/
Modal.prototype.rowMenu_ = undefined;





/**
 * Sets the governing XNAT Path from which all file IO occurs.
 * As of now, this XNAT Path must be at the 'experiment level.'
 *
 * @type {function(string)}
 * @expose
 */
Modal.prototype.setXnatPath = function(path) {

    //------------------
    // Clean up the path string: 
    // prefixes and slashes must be managed.
    //------------------
    if (this.args.pathPrepend.length > 0 && this.args.pathPrepend[this.args.pathPrepend.length - 1] === "/") {
	this.args.pathPrepend = this.args.pathPrepend.substring(0, this.args.pathPrepend.length - 1);
    }
    path = (path[0] !== "/") ? "/" + path : path;



    //------------------
    // Set the private var 'xnatPath_'.
    //------------------
    this.xnatPath_ = this.args.pathPrepend + path; 
};




/**
 * Generates Thumbnail property objects for creating
 * thumbnails in the 'populate scroll gallery' function.
 * Calls on the internal 'setXnatPath' method to define
 * the private var 'xnatPath_'.
 *
 * @param {!string}
 * @expose
 */
Modal.prototype.setXnatPathAndLoadThumbnails = function(path){

    var that = this;
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
    // IF IN DEMO MODE: 
    // Get viewables from stored json.
    //------------------    
    if (XNAT_IMAGE_VIEWER_MODE && XNAT_IMAGE_VIEWER_MODE == 'demo'){



	XNAT_IMAGE_VIEWER_DEMO_SCANS.sort(that.XnatIO_.compareScan);
	XNAT_IMAGE_VIEWER_DEMO_SLICER.sort(that.XnatIO_.compareSlicer);


	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SCANS, function(demoScan){
	    that.addThumbnailsToThumbnailGallery('scans',  [demoScan]);
	})
	goog.array.forEach(XNAT_IMAGE_VIEWER_DEMO_SLICER, function(demoSlicer){
	    that.addThumbnailsToThumbnailGallery('Slicer',  [demoSlicer]);
	})

    }


    
    //------------------
    // ELSE: Get Viewables from XNAT server.
    // Scans Thumbnails first, then Slicer Thumbnails.
    else {
	that.XnatIO_.getViewables(that.xnatPath_, 'scans', function(viewable){
	    //
	    // Add Scans Thumbnails to the ThumbnailGallery.
	    //
	    that.addThumbnailsToThumbnailGallery('scans',  [viewable]);
	    //
	    // Attempt to load Slicer thumbnails after the Scan thumbnails.
	    //
	    if (!slicerThumbnailsLoaded) {
		that.XnatIO_.getViewables(that.xnatPath_, 'Slicer', function(viewable2){
		    that.addThumbnailsToThumbnailGallery('Slicer',  [viewable2]);
		});
		slicerThumbnailsLoaded = true;
	    }
	});
    }
}




/**
 * Creates Thumbnails to feed into the scroll gallery zippys.
 *
 * @type {function(string, Object)}
 * @private
 */
Modal.prototype.addThumbnailsToThumbnailGallery = function (zippyKey, viewablePropertiesArray) {

    var that = this;
    var contents = {};
    var thumbnail = /**@type{?Thumbnail}*/ null;
    //utils.dom.debug(viewablePropertiesArray);



    //------------------
    // Convert every viewableProperty object to a new Thumbnail.
    //------------------
    goog.array.forEach(viewablePropertiesArray, function(viewableProperties) { 
	thumbnail = that.ThumbnailManager.makeThumbnail(document.body, viewableProperties, {'position': "relative",'left': 0,'width': '100%'}, true);
	//
	// Initialize the contents key-value pair via an array.
	//
	if (!contents[zippyKey.toString()]) {contents[zippyKey.toString()] = []};
	contents[zippyKey.toString()].push(thumbnail._element);
    })	

    this.ThumbnailGallery_.addContents(contents);   
    
}




/**
 * Highlights all thumgnails that are being viewed 
 * a ViewBox.
 *
 * @public
 */
Modal.prototype.highlightInUseThumbnails = function () {
    //------------------
    // Unhighlight all thumbnails.
    //------------------
    this.ThumbnailManager.loop(function(Thumbnail){  
	Thumbnail.setActive(false, false);
    })


    //------------------
    // Highight only in use thumbnails by 
    // looping through the ViewBoxes.
    //------------------
    this.ViewBoxManager.loop(function(ViewBox){  
	ViewBox.currentThumbnail_ && ViewBox.currentThumbnail_.setActive(true, false);
    })
}




/**
 * Makes the buttons for Row / Column insertion and removal. 
 *
 * @param {!Element, !string, !Object.<string,number|string>}
 */
Modal.prototype.makeRowColButton = function(parent, className, args) {

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
Modal.prototype.addColumnMenu_ = function () {
    var that = this;



    //------------------
    // Make columnMenu element, add class.
    //------------------
    this.columnMenu_ = utils.dom.makeElement("div", this._modal, "ColumnMenu_");
    goog.dom.classes.add(this.columnMenu_, Modal.COLUMNMENU_CLASS);
    


    //------------------
    // Make 'insertColumn' button
    //------------------
    this.makeRowColButton(that.columnMenu_, Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "InsertColumnButton", 
	'src':  XnatViewerGlobals.ICON_URL + "Arrows/insertColumn.png",
	'style': {'top': 0},
	'title': "Insert Column",
	'onclick': function () { that.ViewBoxManager.insertColumn(); 
	}	
    });



    //------------------
    // Make 'removeColumn' button
    //------------------
    this.makeRowColButton(that.columnMenu_, Modal.COLUMNMENU_BUTTON_CLASS, {
	'id' : "RemoveColumnButton", 
	'src':  XnatViewerGlobals.ICON_URL + "/Arrows/removeColumn.png",
	'style': {'top': 22},
	'title': "Remove Column",
	'onclick': function () { that.ViewBoxManager.removeColumn();  
	}	
    });
}




/**
 * Adds the 'addRow' menu to the modal window.
 */
Modal.prototype.addRowMenu_ = function () {
    var that = this;



    //------------------
    // Make rowMenu element, add class.
    //------------------
    this.rowMenu_ = utils.dom.makeElement("div", this._modal, "RowMenu_");
    goog.dom.classes.add(this.rowMenu_, Modal.ROWMENU_CLASS);



    //------------------
    // Make 'insertRow' button
    //------------------
    this.makeRowColButton(that.rowMenu_, Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "InsertRowButton", 
	'src':  XnatViewerGlobals.ICON_URL + "Arrows/insertRow.png",
	'style': {'left': 0},
	'title': "Insert Row",
	'onclick': function () { that.ViewBoxManager.insertRow(); 
	}	
    });



    //------------------
    // Make 'removeRow' button
    //------------------
    this.makeRowColButton(that.rowMenu_, Modal.ROWMENU_BUTTON_CLASS, {
	'id' : "RemoveRowButton", 
	'src':  XnatViewerGlobals.ICON_URL + "Arrows/removeRow.png",
	'style': {'left': 22},
	'title': "Remove Row",
	'onclick': function () { that.ViewBoxManager.removeRow();  
	}	
    });
};






/**
 * Used when a row or column is inserted.  The modal animates itself
 * on its resize.
 *
 * @param {function=}
 */
Modal.prototype.animateModal  = function (opt_callback) {

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
    // Set and add the Modal's animation methods
    // to the animation queue.
    //------------------
    var modalResize = resize(this._modal, modalDims.width, modalDims.height, XnatViewerGlobals.ANIM_MED)
    animQueue.add(modalResize);
    animQueue.add(slide(this._modal, modalDims.left, modalDims.top, XnatViewerGlobals.ANIM_MED));



    //------------------
    // Set and add the CloseButton's animation methods
    // to the animation queue.
    //------------------
    animQueue.add(slide(this.closeButton_, modalDims.closeButton_.left, modalDims.closeButton_.top, XnatViewerGlobals.ANIM_MED));



    //------------------
    // Set and add the ViewBox's animation methods
    // to the animation queue.
    //------------------
    this.ViewBoxManager.loop( function (ViewBox, i, j) { 
	animQueue.add(slide(ViewBox._element, modalDims.ViewBox.lefts[i][j], modalDims.ViewBox.tops[i][j], XnatViewerGlobals.ANIM_MED));	
	animQueue.add(resize(ViewBox._element, modalDims.ViewBox.width, modalDims.ViewBox.height, XnatViewerGlobals.ANIM_MED));	
    })



    //------------------
    // Set and add the Row/ColumMenu's animation methods
    // to the animation queue.
    //------------------
    animQueue.add(slide(this.rowMenu_, modalDims['RowMenu_']['left'], modalDims['RowMenu_']['top'], XnatViewerGlobals.ANIM_MED));	
    animQueue.add(slide(this.columnMenu_, modalDims['ColumnMenu_']['left'], modalDims['ColumnMenu_']['top'], XnatViewerGlobals.ANIM_MED));	
     


    //------------------
    // Call 'updateStyle' on every animation frame.
    //------------------
    goog.events.listen(modalResize, 'animate', function() {
	that.ViewBoxManager.loop( function (ViewBox, i, j) { 
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
	that.ViewBoxManager.loop( function (ViewBox, i, j) { 
	    if (ViewBox._element.style.opacity == 0) {
		utils.fx.fadeIn(ViewBox._element, XnatViewerGlobals.ANIM_FAST);
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
Modal.prototype.destroy = function (fadeOut) {
    var that = this;


    //------------------
    // Get the modal's root element by class
    //------------------    
    rootElt = goog.dom.getElementsByClass(Modal.ELEMENT_CLASS, document.body)[0];



    //------------------
    // Fade out root element, remove from parent, then delete it.
    //------------------
    utils.fx.fadeOut(rootElt, XnatViewerGlobals.ANIM_MED, function () {
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
 * Calculates the Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 *
 * @private
 */
Modal.prototype.calculateModalDims_ = function () {
    
    var that = this;
    var ScrollableContainerLeft = 0;
    var maxModalWidth = Math.round(window.innerWidth * XnatViewerGlobals.MAX_MODAL_HEIGHT_PERCENTAGE);
    
    
    
    //**************************************************************
    // Generate a prelimiary width...
    //**************************************************************
    
    //------------------
    //	Get the prescribed height of the modal	
    //------------------
    var modalHeight = XnatViewerGlobals.MAX_MODAL_HEIGHT_PERCENTAGE * window.innerHeight;

    

    //------------------
    //	Get the number of scan viewers
    //------------------
    var viewers = this.ViewBoxManager.getViewBoxes();
    var ViewBoxColumns = this.ViewBoxManager.numCols();
    var ViewBoxRows = this.ViewBoxManager.numRows();
    
    

    //------------------
    // Determine the minimum modal width
    //------------------
    var minModalWidth = utils.style.dims(that.ThumbnailGallery_._element, 'width') + 
	XnatViewerGlobals.MIN_VIEWER_WIDTH * ViewBoxColumns + 
	XnatViewerGlobals.VIEWER_VERTICAL_MARGIN * ViewBoxColumns + 
	XnatViewerGlobals.EXPAND_BUTTON_WIDTH;
    


    //------------------
    // Determine the the modal width based on prescribed proportions
    //------------------
    var ViewBoxHeight = ( modalHeight - ((ViewBoxRows + 1) * XnatViewerGlobals.EXPAND_BUTTON_WIDTH)) / ViewBoxRows;
    var ViewBoxWidth = XnatViewerGlobals.VIEWER_DIM_RATIO * ViewBoxHeight;
    


    //------------------
    // Determine the modal width
    //------------------
    var modalWidth = utils.style.dims(that.ThumbnailGallery_._element, 'width') + 
	ViewBoxWidth  * ViewBoxColumns + 
	XnatViewerGlobals.VIEWER_VERTICAL_MARGIN * ViewBoxColumns + 
	XnatViewerGlobals.EXPAND_BUTTON_WIDTH;




    //**************************************************************
    // After preliminary width is generated...
    //**************************************************************

    //-------------------------
    // If the modal is too wide, scale it down
    //-------------------------
    if (modalWidth > maxModalWidth) {	
	var thumbGalleryWidth = utils.convert.toInt((utils.style.getComputedStyle(that.ThumbnailGallery_._element, 'width')));
	ViewBoxWidth = (maxModalWidth - thumbGalleryWidth - XnatViewerGlobals.EXPAND_BUTTON_WIDTH)/ViewBoxColumns - XnatViewerGlobals.VIEWER_VERTICAL_MARGIN ;
	ViewBoxHeight = ViewBoxWidth / XnatViewerGlobals.VIEWER_DIM_RATIO;
	modalWidth = maxModalWidth;
	//utils.dom.debug( ViewBoxHeight , ViewBoxRows , (XnatViewerGlobals.VIEWER_VERTICAL_MARGIN), ViewBoxRows  - 1 , XnatViewerGlobals.EXPAND_BUTTON_WIDTH);
	modalHeight = (ViewBoxHeight * ViewBoxRows) + (XnatViewerGlobals.VIEWER_VERTICAL_MARGIN  * (ViewBoxRows  - 1)) + XnatViewerGlobals.EXPAND_BUTTON_WIDTH * 2;

    }
    //utils.dom.debug("modalHeight: ", modalHeight);



    //-------------------------
    // Calculate master left and top of the modal window.
    //-------------------------
    var _l = (window.innerWidth - modalWidth) /2 ;
    var _t = (window.innerHeight - modalHeight)/2;
    


    //-------------------------
    // ScrollableContainer dims (holds the Thumbnails)
    //-------------------------	
    var ScrollableContainerCSS = {
	'height': Math.round(modalHeight) - XnatViewerGlobals.EXPAND_BUTTON_WIDTH * 2,
	'top': XnatViewerGlobals.EXPAND_BUTTON_WIDTH
    }
    
    

    //-------------------------
    // Define the ViewBox dims
    //-------------------------	
    var ViewBoxLefts = [];
    var ViewBoxTops = [];
    var ScrollableContainerDims = utils.style.dims(this.ThumbnailGallery_._element)
    var viewerStart = ScrollableContainerDims.width +  ScrollableContainerDims['left'] + XnatViewerGlobals.VIEWER_VERTICAL_MARGIN;

    that.ViewBoxManager.loop( function (ViewBox, i, j) { 
	
	l = viewerStart + j * (ViewBoxWidth + XnatViewerGlobals.VIEWER_VERTICAL_MARGIN);
	if (j==0 || !ViewBoxLefts[i]) {
	    ViewBoxLefts.push([])
	}
	
	ViewBoxLefts[i][j] = l;
	if (j==0 || !ViewBoxTops[i]) {
	    ViewBoxTops.push([]);
	}
	
	ViewBoxTops[i][j] = (-1 + i * (ViewBoxHeight + XnatViewerGlobals.VIEWER_HORIZONTAL_MARGIN));
	
	//if (i==0)
	ViewBoxTops[i][j] +=  XnatViewerGlobals.EXPAND_BUTTON_WIDTH;
	
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
	    
	    'left': Math.round(modalWidth) - XnatViewerGlobals.EXPAND_BUTTON_WIDTH,
	    'top': ViewBoxTops[0][0] + Math.round(modalHeight)/2 - XnatViewerGlobals.EXPAND_BUTTON_WIDTH - 20,
	    'width': XnatViewerGlobals.EXPAND_BUTTON_WIDTH - 1,
	    'height': 40
	    
	},
	'RowMenu_': {
	    
	    'left': ViewBoxLefts[0][0] + (Math.round(modalWidth) - ViewBoxLefts[0][0] - XnatViewerGlobals.EXPAND_BUTTON_WIDTH)/2 - 17,
	    'top': Math.round(modalHeight) - XnatViewerGlobals.EXPAND_BUTTON_WIDTH,
	    'width': 40,
	    'height': XnatViewerGlobals.EXPAND_BUTTON_WIDTH - 1
	    
	}

    }

}



/**
 * Method for updating the style of the '_modal' element
 * due to window resizing, or any event that requires the 
 * Modal element change its dimensions.
 *
 * @param {Object.<string, string | number>=}
 */
Modal.prototype.updateStyle = function (opt_args) {	

    var that = this;
    

    //-------------------------	
    // Modal 
    //-------------------------	
    modalDims = this.calculateModalDims_();
    utils.style.setStyle( this._modal, modalDims);
    if (opt_args) {  utils.style.setStyle( this._modal, opt_args); }	
    


    //-------------------------	
    // Thumbnail Gallery
    //-------------------------	
    if (this.ThumbnailGallery_) { this.ThumbnailGallery_.updateStyle(modalDims['ThumbnailGallery_']);}
    


    //-------------------------	
    // ViewBoxes	
    //-------------------------	
    if (that.ViewBoxManager) {
	that.ViewBoxManager.loop( function (ViewBox, i, j) { 
	    ViewBox.updateStyle({
		'height': modalDims['ViewBox']['height'],
		'width': modalDims['ViewBox']['width'],
		'left': modalDims['ViewBox']['lefts'][i][j],
		'top': modalDims['ViewBox']['tops'][i][j]
	    });	

	    that.ViewBoxManager.updateDragDropHandles();
	}); 		
    }	



    //-------------------------	
    //	Close Button
    //-------------------------	
    if (this.closeButton_) {
	utils.style.setStyle(this.closeButton_, modalDims['closeButton_']);		
    }
    


    //-------------------------	
    // Row / Column menus
    //-------------------------	
    if (this.columnMenu_ && this.rowMenu_) {	
	var menus = [this.rowMenu_, this.columnMenu_];
	var menuNames = ['RowMenu_', 'ColumnMenu_'];
	goog.array.forEach(menus, function(menu, i){
	    utils.style.setStyle(menu, modalDims[menuNames[i]]);	    
	})	
    }



    //------------------
    // Highlight in use thumbnails
    //------------------    
    this.highlightInUseThumbnails();
	
}
