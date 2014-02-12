/**
 * @preserve Copyright 2014 Washington University
 *
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string.path');
goog.require('goog.dom.fullscreen');
goog.require('goog.window');

// utils
goog.require('utils.xnat');
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.convert');
goog.require('utils.fx');

// xiv
goog.require('xiv.Widget');
goog.require('xiv.ThumbnailManager');
goog.require('xiv.ViewBoxManager');




/**
 * xiv.Modal is the central class where all of the xiv.Widgets
 * meet.
 *
 * @constructor
 * @param {string=} opt_iconUrl The url for the icons.  Defaults to ''.
 * @extends {xiv.Widget}
 */

goog.provide('xiv.Modal');
xiv.Modal = function (opt_iconUrl) {
    goog.base(this, xiv.Modal.ID_PREFIX);   
    this.setIconUrl_(opt_iconUrl);
    this.createComponents_();
    //this.updateStyle();
    this.adjustStyleToMode_();
}
goog.inherits(xiv.Modal, xiv.Widget);
goog.exportSymbol('xiv.Modal', xiv.Modal);

    
/**
 * @type {string}
 * @private
 */  
xiv.Modal.prototype.iconUrl_;


/**
 * @type {Element}
 * @private
 */	
xiv.Modal.prototype.background_;


/**
 * @type {Object.<string, element>}
 * @private
 */
xiv.Modal.prototype.buttons_;


/**
 * @type {xiv.ThumbnailManager}
 * @private
 */
xiv.Modal.prototype.ThumbnailManager_;


/**
 * @type {xiv.ViewBoxManager}
 * @private
 */
xiv.Modal.prototype.ViewBoxManager_;


/**
 * @const
 * @type {!string}
 * @private
 */
xiv.Modal.prototype.mode_ = 'windowed';


/**
 * @cost
 * @type {?string}
 * @private
 */
xiv.Modal.prototype.previousMode_ = null;



/**
 * @type {!string}
 * @private
 */	
xiv.Modal.prototype.iconUrl_ = '';



/**
 * @const
 * @private
 */
xiv.Modal.hideableButtonKeys_ = ['popup', 'close'];


/**
 * @private
 */
xiv.Modal.prototype.setIconUrl_ = function(opt_iconUrl) {
    if (opt_iconUrl && goog.isString(opt_iconUrl)){
	this.iconUrl_ = goog.string.path.join(opt_iconUrl, 
			xiv.Modal.ID_PREFIX.replace('.','/'));
    }
}



/**
 * @private
 */
xiv.Modal.prototype.createComponents_ = function() {
    this.createBackground_();
    this.createButtons_();
    this.createThumbnailManager_();
    //this.createViewBoxManager_();
    //this.updateStyle();
}



/**
 * @private
 */
xiv.Modal.prototype.createBackground_ = function(opt_iconUrl) {
    this.background_ = utils.dom.createUniqueDom('div', 
				'xiv.Modal.Background');
    goog.dom.append(this.getElement(), this.background_);
}




/**
 * @private
 */
xiv.Modal.prototype.createButtons_ = function() {
    this.buttons_ = xiv.Modal.generateButtons_(this.iconUrl_);
    for (var key in this.buttons_){
	goog.dom.append(this.getElement(), this.buttons_[key]);
    }
    this.setFullScreenButtonCallbacks_();
}




/**
 * @private
 */
xiv.Modal.prototype.createThumbnailManager_ = function() {
    this.ThumbnailManager_ = new xiv.ThumbnailManager();
    this.ThumbnailManager_.setHoverParent(this.getElement());
    goog.dom.append(this.getElement(), 
		    this.ThumbnailManager_.getThumbnailGallery().getElement());

    this.setThumbnailManagerCallbacks_();
}



/**
 * @private
 */
xiv.Modal.prototype.createViewBoxManager_ = function() {
    this.ViewBoxManager_ = new xiv.ViewBoxManager();
    this.ViewBoxManager_.setViewBoxesParent(this.getElement());   
    this.setViewBoxManagerCallbacks_();
    this.ViewBoxManager_.insertColumn(false);
}



/**
 * @private
 */ 
xiv.Modal.prototype.onFullScreenButtonClicked_ = function() {
    this.previousMode_ = this.mode_;
    goog.dom.fullscreen.requestFullScreen(this.getElement()); 
    this.setMode('fullScreen');
    this.buttons_['fullScreen'].style.visibility = 'hidden';
    this.buttons_['windowed'].style.visibility = 'visible';
}



/**
 * @private
 */ 
xiv.Modal.prototype.onWindowedButtonClicked_ = function() {
	goog.dom.fullscreen.exitFullScreen(); 
	this.setMode(this.previousMode_);
	this.buttons_['fullScreen'].style.visibility = 'visible';
	this.buttons_['windowed'].style.visibility = 'hidden';
}



/**
 * @private
 */   
xiv.Modal.prototype.setFullScreenButtonCallbacks_ = function(){
    this.buttons_['windowed'].style.visibility = 'hidden';
    this.buttons_['fullScreen'].onclick = 
	this.onFullScreenButtonClicked_.bind(this)
    this.buttons_['windowed'].onclick = 
	this.onWindowedButtonClicked_.bind(this);
}




/**
 * @private
 */
xiv.Modal.prototype.adjustStyleToMode_ = function(){


    window.console.log("ADJUST MODE", this.mode_);

    if (this.mode_ === 'popup' || this.mode_ === 'fullScreen'){
	goog.dom.classes.add(this.background_, 
			     xiv.Modal.BLACK_BG_CLASS); 
	goog.array.forEach(xiv.Modal.hideableButtonKeys_, function(key){
	    this.buttons_[key].style.visibility = 'hidden';
	}.bind(this))

    } else {
	goog.dom.classes.remove(this.background_, 
				xiv.Modal.BLACK_BG_CLASS);
	goog.array.forEach(xiv.Modal.hideableButtonKeys_, function(key){
	    this.buttons_[key].style.visibility = 'visible';
	}.bind(this))
    }
}



/**
 * @private
 */
xiv.Modal.generateButtons_ = function(iconUrl){

    if (!goog.isString(iconUrl)){
	throw new TypeError('String expected!');
    }

    var keyMap =/**@dict*/{};
    var buttonsWithOriginalKeys =/**@dict*/{};
    var updatedKeys =/**@type {!Array.string}*/[];
    var updatedKey = /**@type {!string}*/'';
    var key = /**@type {!string}*/'';
    var modKey = /**@type {!string}*/'';


    for (key in xiv.Modal.buttonTypes){
	updatedKey = utils.string.getLettersOnly(xiv.Modal.ID_PREFIX) 
			 + goog.string.toTitleCase(key) + 'Button';
	updatedKeys.push(updatedKey);
	keyMap[key] = updatedKey;
    }


    var buttons = utils.dom.createBasicHoverButtonSet(updatedKeys, iconUrl);
    for (key in keyMap){
	buttonsWithOriginalKeys[key] = buttons[keyMap[key]];
    }
    return buttonsWithOriginalKeys
}











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
 * @return {!Object} The button object.
 * @public
 */
xiv.Modal.prototype.getButtons = function() {
  return this.buttons_;
}


/**
 * public
 * @const
 */
xiv.Modal.MODES = [
    'fullScreen',
    'popup',
    'windowed'
]



/**
 * @param {!string} The iconUrl to set.
 * @public
 */
xiv.Modal.prototype.setIconUrl = function(iconUrl) {
    this.iconUrl_ = iconUrl;
}



/**
 * @return {!string} The iconUrl to set.
 * @public
 */
xiv.Modal.prototype.getIconUrl = function(iconUrl) {
    return this.iconUrl_;
}




/**
 * @param {!string} The mode to test
 * @public
 */
xiv.Modal.prototype.setMode = function(mode) {
    if (!mode || xiv.Modal.MODES.indexOf(mode) === -1){
	throw TypeError('Invalid xiv.Modal mode: ' + mode);
    }
    this.mode_ = mode;
    this.adjustStyleToMode_();
}


/**
 * @return {!Object} The button object.
 * @public
 */
xiv.Modal.prototype.getMode = function() {
  return this.mode_;
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
     this.ThumbnailManager_['EVENTS'].onEvent('MOUSEOVER', function(Thumbnail){
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail){
		ViewBox.getElement().style.borderColor = 'white';
	    }
	})	
    }.bind(this))

    this.ThumbnailManager_['EVENTS'].onEvent('MOUSEOUT', function(Thumbnail){;
	this.ViewBoxManager_.loop(function(ViewBox){
	    if (ViewBox.Thumbnail === Thumbnail && ViewBox.loadState !== 
		'loading'){
		ViewBox.getElement().style.borderColor = 
		    ViewBox.getElement().getAttribute('originalbordercolor');	
	    }
	})
    }.bind(this))


    //------------------
    // Load the thumbnail when clicking or dropping.
    //------------------
    this.ThumbnailManager_['EVENTS'].onEvent('THUMBNAILDROP', 
			function(viewBoxElement, thumbnailElement) {
	var _ViewBox = this.ViewBoxManager_.getViewBoxByElement(viewBoxElement);
	var _Thumb = 
	this.ThumbnailManager_.getThumbnailByElement(thumbnailElement);
	_ViewBox.loadThumbnail(_Thumb);
    }.bind(this)); 

    this.ThumbnailManager_['EVENTS'].onEvent('THUMBNAILCLICK', 
					     function(_Thumb) {
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
	ViewBox.getElement().style.borderColor = 'white';
	this.highlightInUseThumbnails();
    }.bind(this)

    this.ViewBoxManager_.onThumbnailLoaded = function(ViewBox){
	ViewBox.getElement().style.borderColor = 
	    ViewBox.getElement().getAttribute('originalbordercolor');
	this.highlightInUseThumbnails();
    }.bind(this)


    this.ViewBoxManager_.onViewBoxesChanged(
	function(newViewBoxSet, opt_animate) {
	    
	    if (opt_animate) {
		// Fade out the new viewboxes.
		if (newViewBoxSet) {
		    goog.array.forEach(newViewBoxSet, function(newViewBox) {
			utils.style.setStyle(newViewBox.getElement(), 
					     {'opacity': 0})
		    })
		}
		// Animate the modal
		this.animateModal();	
	    } else {
		this.updateStyle();
	    }	
	    
	    this.ThumbnailManager_.addDragDropTargets(
		this.ViewBoxManager_.getViewBoxElements());
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
	return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], 
				     [a, b], duration, goog.fx.easing.easeOut);
    }
    
    function resize(el, a, b, duration) {			
	return new goog.fx.dom.Resize(el, [el.offsetWidth, el.offsetHeight], 
				      [a, b], duration, goog.fx.easing.easeOut);
    } 
    

    
    //------------------
    // Set and add the xiv.Modal's animation methods
    // to the animation queue.
    //------------------
    var modalResize = resize(this.modal_, modalDims.width, modalDims.height, 
			     xiv.Modal.ANIM_LEN)
    animQueue.add(modalResize);
    animQueue.add(slide(this.modal_, modalDims.left, modalDims.top, 
			xiv.Modal.ANIM_LEN));



    //------------------
    // Set and add the xiv.ViewBox's animation methods
    // to the animation queue.
    //------------------
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	animQueue.add(slide(ViewBox.getElement(), 
			    modalDims.ViewBox.lefts[i][j], 
			    modalDims.ViewBox.tops[i][j], xiv.Modal.ANIM_LEN));	
	animQueue.add(resize(ViewBox.getElement(), modalDims.ViewBox.width, 
			     modalDims.ViewBox.height, xiv.Modal.ANIM_LEN));	
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
	    if (ViewBox.getElement().style.opacity == 0) {
		utils.fx.fadeIn(ViewBox.getElement(), xiv.Modal.ANIM_LEN/2);
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
 * Calculates the xiv.Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 *
 * @private
 */
xiv.Modal.prototype.calculateModalDims_ = function () {
    
  
    var ScrollableContainerLeft = 0;
    var maxModalWidth = Math.round(window.innerWidth * 
				   xiv.Modal.MAX_MODAL_HEIGHT_PERCENTAGE);
    
    
    
    //**************************************************************
    //
    // Generate a prelimiary width...
    //
    //**************************************************************
    
    //------------------
    //	Get the prescribed height of the modal	
    //------------------
    var modalHeight = xiv.Modal.MAX_MODAL_HEIGHT_PERCENTAGE * 
	window.innerHeight;

    

    //------------------
    //	Get the number of scan viewers
    //------------------
    var viewers = this.ViewBoxManager_.getViewBoxes();
    var ViewBoxColumns = this.ViewBoxManager_.totalColumns();
    var ViewBoxRows = this.ViewBoxManager_.totalRows();
    
    

    //------------------
    // Determine the minimum modal width
    //------------------
    var minModalWidth = utils.style.dims(
	this.ThumbnailManager_.getThumbnailGallery().getElement(), 'width') + 
	xiv.Modal.MIN_VIEWBOX_WIDTH * ViewBoxColumns + 
	xiv.Modal.VIEWBOX_VERTICAL_MARGIN * ViewBoxColumns + 
	xiv.Modal.EXPAND_BUTTON_WIDTH;
    


    //------------------
    // Determine the the modal width based on prescribed proportions
    //------------------
    var ViewBoxHeight = ( modalHeight - ((ViewBoxRows + 1) * 
			xiv.Modal.EXPAND_BUTTON_WIDTH)) / ViewBoxRows;
    var ViewBoxWidth = xiv.Modal.VIEWBOX_DIM_RATIO * ViewBoxHeight;
    


    //------------------
    // Determine the modal width
    //------------------
    var modalWidth = utils.style.dims(
	this.ThumbnailManager_.getThumbnailGallery().getElement(), 'width') + 
	ViewBoxWidth  * ViewBoxColumns + 
	xiv.Modal.VIEWBOX_VERTICAL_MARGIN * ViewBoxColumns + 
	xiv.Modal.EXPAND_BUTTON_WIDTH;




    //**************************************************************
    // After preliminary width is generated...
    //**************************************************************

    //-------------------------
    // If the modal is too wide, scale it down
    //-------------------------
    if (modalWidth > maxModalWidth) {	
	var thumbGalleryWidth = utils.convert.toInt(
	    (utils.style.getComputedStyle(
		this.ThumbnailManager_.getThumbnailGallery().getElement(), 
		'width')));
	ViewBoxWidth = (maxModalWidth - thumbGalleryWidth - 
			xiv.Modal.EXPAND_BUTTON_WIDTH)/ViewBoxColumns - 
	    xiv.Modal.VIEWBOX_VERTICAL_MARGIN ;
	ViewBoxHeight = ViewBoxWidth / xiv.Modal.VIEWBOX_DIM_RATIO;
	modalWidth = maxModalWidth;
	//utils.dom.debug( ViewBoxHeight , ViewBoxRows , 
	//(xiv.Modal.VIEWBOX_VERTICAL_MARGIN), ViewBoxRows  - 1 , 
	//xiv.Modal.EXPAND_BUTTON_WIDTH);
	modalHeight = (ViewBoxHeight * ViewBoxRows) + 
	    (xiv.Modal.VIEWBOX_VERTICAL_MARGIN  * (ViewBoxRows  - 1)) + 
	    xiv.Modal.EXPAND_BUTTON_WIDTH * 2;

    }
    //utils.dom.debug("modalHeight: ", modalHeight);



    //-------------------------
    // Calculate master left and top of the modal window.
    //-------------------------
    var _l = (window.innerWidth - modalWidth) /2 ;
    var _t = (window.innerHeight - modalHeight)/2;
    


    //-------------------------
    // ScrollableContainer dims (holds the xiv.Modal.Thumbnails)
    //-------------------------	
    var ScrollableContainerCSS = {
	'height': Math.round(modalHeight) - xiv.Modal.EXPAND_BUTTON_WIDTH * 2,
	'top': xiv.Modal.EXPAND_BUTTON_WIDTH
    }


    //-------------------------
    // ScrollableContainer dims (holds the xiv.Modal.Thumbnails)
    //-------------------------	
    var thumbnailGalleryCSS = {
	'height': Math.round(modalHeight) - xiv.Modal.EXPAND_BUTTON_WIDTH * 2,
	'top': xiv.Modal.EXPAND_BUTTON_WIDTH + 30
    }
    
    

    //-------------------------
    // Define the xiv.ViewBox dims
    //-------------------------	
    var ViewBoxLefts = [];
    var ViewBoxTops = [];
    var ScrollableContainerDims = utils.style.dims(
        this.ThumbnailManager_.getThumbnailGallery().getElement());
    var viewerStart = ScrollableContainerDims.width + 
	ScrollableContainerDims['left'] + xiv.Modal.VIEWBOX_VERTICAL_MARGIN;

    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	
	l = viewerStart + j * (ViewBoxWidth + 
			       xiv.Modal.VIEWBOX_VERTICAL_MARGIN);
	if (j==0 || !ViewBoxLefts[i]) {
	    ViewBoxLefts.push([])
	}
	
	ViewBoxLefts[i][j] = l;
	if (j==0 || !ViewBoxTops[i]) {
	    ViewBoxTops.push([]);
	}
	
	ViewBoxTops[i][j] = (-1 + i * (ViewBoxHeight + 
				       xiv.Modal.VIEWBOX_HORIZONTAL_MARGIN));
	
	//if (i==0)
	ViewBoxTops[i][j] +=  xiv.Modal.EXPAND_BUTTON_WIDTH;
	
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
	    
	    'left': Math.round(modalWidth) - xiv.Modal.EXPAND_BUTTON_WIDTH,
	    'top': ViewBoxTops[0][0] + 
		Math.round(modalHeight)/2 - xiv.Modal.EXPAND_BUTTON_WIDTH - 20,
	    'width': xiv.Modal.EXPAND_BUTTON_WIDTH - 1,
	    'height': 40
	    
	},
	'RowMenu_': {
	    
	    'left': ViewBoxLefts[0][0] + 
		(Math.round(modalWidth) - ViewBoxLefts[0][0] - 
		 xiv.Modal.EXPAND_BUTTON_WIDTH)/2 - 17,
	    'top': Math.round(modalHeight) - xiv.Modal.EXPAND_BUTTON_WIDTH,
	    'width': 40,
	    'height': xiv.Modal.EXPAND_BUTTON_WIDTH - 1
	    
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
    if (this.ThumbnailManager_.getThumbnailGallery()) { 
	window.console.log("GALLERY DIMS", modalDims['ThumbnailGallery_']);
	utils.style.setStyle(this.ThumbnailManager_.getThumbnailGallery().
			     getElement(), modalDims['ThumbnailGallery_']);
    }
    


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



/**
 * @const
 * @dict
 */
xiv.Modal.buttonTypes = {
    'close': 'Close XNAT Image Viewer.',
    'fullScreen': 'Enter full-screen mode.',
    'popup': 'Popup to new window.',
    'windowed': 'Exit full-screen mode.',
    'removeRow': 'Remove ViewBox row',
    'removeColumn': 'Remove ViewBox column',
    'insertColumn': 'Insert ViewBox column',
    'insertRow' : 'Insert ViewBox row',
    //'addXnatFolders' : 'Add more XNAT folders.'
}


xiv.Modal.ID_PREFIX = /**@type {string} @const*/ 'xiv.Modal';
xiv.Modal.CSS_CLASS_PREFIX = /**@type {string} @const*/ 
goog.string.toSelectorCase(utils.string.getLettersOnly(xiv.Modal.ID_PREFIX));

xiv.Modal.ANIM_LEN = /**@const*/ 500;
xiv.Modal.MAX_MODAL_WIDTH_PERCENTAGE = /**@const*/ .90;
xiv.Modal.MAX_MODAL_HEIGHT_PERCENTAGE = /**@const*/ .95;
xiv.Modal.VIEWBOX_DIM_RATIO = /**@const*/.85
xiv.Modal.MIN_VIEWBOX_HEIGHT = /**@const*/ 320;
xiv.Modal.MIN_VIEWBOX_WIDTH = /**@const*/ xiv.MIN_VIEWBOX_HEIGHT * 
    xiv.VIEWBOX_DIM_RATIO;
xiv.Modal.VIEWER_VERTICAL_MARGIN =/**@const*/20;
xiv.Modal.VIEWER_HORIZONTAL_MARGIN =/**@const*/20;
xiv.Modal.EXPAND_BUTTON_WIDTH =/**@const*/30;

xiv.Modal.BLACK_BG_CLASS = /**@const*/ 
goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 
		'background-black');



xiv.Modal.COLUMNMENU_CLASS = /**@type {string} @const*/goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'columnmenu');
xiv.Modal.ROWMENU_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'rowmenu');
xiv.Modal.COLUMNMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.COLUMNMENU_CLASS, 'button');
xiv.Modal.ROWMENU_BUTTON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Modal.ROWMENU_CLASS, 'button');


