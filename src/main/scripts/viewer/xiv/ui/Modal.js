/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.dom.fullscreen');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.string.path');
goog.require('goog.fx');
goog.require('goog.fx.easing');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.Resize');
goog.require('goog.events');

// utils
goog.require('moka.ui.Component');
goog.require('moka.ui.Resizable');
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.convert');
goog.require('moka.fx');

// xiv
goog.require('xiv.ui.ThumbnailHandler');
goog.require('xiv.ui.ViewBoxHandler');




/**
 * xiv.ui.Modal is the central class where various moka.ui.Components meet.
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.Modal');
xiv.ui.Modal = function () {
    goog.base(this);   


    /**
     * @type {Object}
     * @private
     */
    this.buttons_;


    /**
     * @type {xiv.ui.ThumbnailHandler}
     * @private
     */
    this.ThumbnailHandler_;


    /**
     * @type {xiv.ui.ViewBoxHandler}
     * @private
     */
    this.ViewBoxHandler_;


    /**
     * @type {goog.fx.AnimationParallelQueue}
     */
    this.animQueue_;


    /**
     * @type {Array.<goog.fx.dom.PredefinedEffect>}
     */
    this.anims_;


    /**
     * @dict
     */
    this.dims_;


    this.initSubComponents();
    this.adjustStyleToMode_();
    if(this.ViewBoxHandler_){
	this.ViewBoxHandler_.insertColumn(false);
    }
}
goog.inherits(xiv.ui.Modal, moka.ui.Component);
goog.exportSymbol('xiv.ui.Modal', xiv.ui.Modal);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Modal.ID_PREFIX =  'xiv.ui.Modal';


/**
 * @enum {string}
 */
xiv.ui.Modal.CSS_SUFFIX = {
    BACKGROUND: 'background',
    COLUMNMENU : 'columnmenu',
    ROWMENU : 'rowmenu',
    COLUMNMENU_BUTTON : 'button',
    ROWMENU_BUTTON : 'button',
}


/**
 * @enum {string}
 */
xiv.ui.Modal.buttonTypes = {
    CLOSE : 'Close XNAT Image Viewer.',
    FULLSCREEN: 'Enter full-screen mode.',
    POPUP: 'Popup to new window.',
    WINDOWED: 'Exit full-screen mode.',
    REMOVEROW: 'Remove ViewBox row',
    INSERTROW : 'Insert ViewBox row',
    REMOVECOLUMN: 'Remove ViewBox column',
    INSERTCOLUMN: 'Insert ViewBox column',
}



/**
 * @enum {string}
 * @const
 */
xiv.ui.Modal.modes = {
    FULLSCREEN: 'fullScreen',
    POPUP: 'popup',
    WINDOWED: 'windowed'
}



/**
 * @enum {number}
 * @const
 */
xiv.ui.Modal.inlineDims = {
    STARTING_W_PCT : .95,
    STARTING_H_PCT : .95,
    VIEWBOX_HORIZ_MARGIN: 25,
    VIEWBOX_VERT_MARGIN: 25,
    VIEWBOX_MIN_H:  320,
    VIEWBOX_MIN_W:  320,
}


/**
 * @type {!number} 
 * @const
 */
xiv.ui.Modal.ANIM_LEN = 500;



/**
 * As stated.
 * @param {!string} iconUrl
 * @private
 */
xiv.ui.Modal.createButtons_ = function(iconUrl){

    // Generate new button IDs
    var buttonIds =/**@type {!Object}*/{};
    goog.object.forEach(xiv.ui.Modal.buttonTypes, function(buttonType, key){
	buttonIds[key] = xiv.ui.Modal.ID_PREFIX + '.' + 
			 goog.string.toTitleCase(key) + 'Button';
    })

    // Make buttons
    var buttons = /**@type {!Object.<string, Element>}*/
    moka.dom.createBasicHoverButtonSet(goog.object.getValues(buttonIds));

    // Make object that maps old keys to buttons.
    var buttonsWithOriginalKeys =/**@dict*/{};
    goog.object.forEach(buttonIds, function(newKey, oldKey){
	buttonsWithOriginalKeys[oldKey] = buttons[newKey];
	goog.dom.classes.set(buttons[newKey], 
	    goog.getCssName(xiv.ui.Modal.CSS_CLASS_PREFIX, 
			oldKey.toLowerCase() + '-' + 'button'));
    })
    return buttonsWithOriginalKeys
}



/**
 * @type {!string}
 * @private
 */
xiv.ui.Modal.prototype.mode_ = xiv.ui.Modal.modes.WINDOWED;



/**
 * @type {string}
 * @private
 */
xiv.ui.Modal.prototype.previousMode_;



/**
 * Get the associated xiv.ui.ViewBoxHandler for this object.
 * @return {xiv.ui.ViewBoxHandler} The xiv.ui.ViewBoxHandler for this object.
 * @public
 */
xiv.ui.Modal.prototype.getViewBoxHandler =  function() {
  return this.ViewBoxHandler_;
}



/**
 * Get the associated xiv.ui.ThumbnailHandler for this object.
 * @return {xiv.ui.ThumbnailHandler} The xiv.ui.ThumbnailHandler for this object.
 * @public
 */
xiv.ui.Modal.prototype.getThumbnailHandler = function() {
  return this.ThumbnailHandler_;
}



/**
 * As stated.
 * @return {!Element} The described element.
 * @public
 */
xiv.ui.Modal.prototype.getPopupButton = function() {
  return this.buttons_.POPUP;
}


/**
 * As stated.
 * @return {!Element} The described element.
 * @public
 */
xiv.ui.Modal.prototype.getCloseButton = function() {
  return this.buttons_.CLOSE;
}



/**
 * As stated.
 * @param {!string} mode The mode to test
 * @public
 */
xiv.ui.Modal.prototype.setMode = function(mode) {
    if (!mode || !goog.object.containsValue(xiv.ui.Modal.modes, mode)){
	throw TypeError('Invalid xiv.ui.Modal mode: ' + mode);
    }
    this.mode_ = mode;
    this.adjustStyleToMode_();
}


/**
 * As stated.
 * @return {!Object} The button object.
 * @public
 */
xiv.ui.Modal.prototype.getMode = function() {
  return this.mode_;
}



/**
 * Highlights all thumbnails that are being viewed a xiv.ui.ViewBox.
 * @public
 */
xiv.ui.Modal.prototype.highlightInUseThumbnails = function () {
    this.ThumbnailHandler_.loop(function(Thumbnail){  
	// Unhighlight all thumbnails.
	Thumbnail.setActive(false);
	this.ViewBoxHandler_.loop(function(ViewBox){  
	    if (ViewBox.getViewables().indexOf(Thumbnail.getViewable()) > -1){
		Thumbnail.setActive(true);
	    }
	})
    }.bind(this))
}



/**
 * Used when a row or column is inserted.  The modal animates itself
 * on its resize.
 * @param {function=} opt_callback The callback for AFTER the modal is animated.
 * @public
 */
xiv.ui.Modal.prototype.animateModal  = function () {
    // Get the dims.
    this.computeDims_();
    window.console.log(this.dims_);

    // Setup.
    this.anims_ = goog.isDefAndNotNull(this.anims_) ? this.anims_ : [];
    this.animQueue_ = goog.isDefAndNotNull(this.animQueue_) ? 
	this.animQueue_ : new goog.fx.AnimationParallelQueue();

    // Create anims
    this.createModalSlideAnimation_();
    this.createModalResizeAnimation_();
    this.createViewBoxSlideAnimations_();
    this.createViewBoxResizeAnimations_();

	
    // Events.
    goog.events.listen(this.animQueue_, 'end', 
	this.onModalAnimationEnd_.bind(this));

    goog.array.forEach(this.anims_, function(anim){
	this.animQueue_.add(anim);
    }.bind(this))

    // Play.
    this.animQueue_.play();
    this.highlightInUseThumbnails();
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationAnimate_ = function() {
    this.ViewBoxHandler_.loop( function(ViewBox) { 
	ViewBox.updateStyle();
    })
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationEnd_ = function() {

    // Destroy anims
    goog.array.forEach(this.anims_, function(anim){
	this.animQueue_.remove(anim);
	goog.events.removeAll(anim);
	anim.destroy();
	anim.disposeInternal();
    }.bind(this))

    // Clear anims array
    goog.array.clear(this.anims_);

    // Update
    this.updateStyle();
    this.fadeInHiddenViewers_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.fadeInHiddenViewers_ = function() {
    // Fade in new viewers.
    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	//window.console.log(ViewBox.getElement().style.opacity);
	if (ViewBox.getElement().style.opacity == 0) {
	    moka.fx.fadeIn(ViewBox.getElement(), xiv.ui.Modal.ANIM_LEN);
	}
    })
}




/**
 * @private
 */
xiv.ui.Modal.prototype.createModalResizeAnimation_ = function () {
    var modalResize = /**@type {!goog.fx.dom.Resize}*/ new goog.fx.dom.Resize(
	this.getElement(), [this.getElement().offsetWidth, 
			    this.getElement().offsetHeight], 
	[this.dims_.W, this.dims_.H], xiv.ui.Modal.ANIM_LEN, 
	goog.fx.easing.easeOut);
    this.anims_.push(modalResize);

    // Events
    // NOTE: This listener gets removed in this.onModalAnimationEnd_
    goog.events.listen(modalResize, 'animate', 
		       this.onModalAnimationAnimate_.bind(this))
}



/**
 * @private
 */
xiv.ui.Modal.prototype.createModalSlideAnimation_ = function () {
    this.anims_.push(new goog.fx.dom.Slide(
	this.getElement(), [this.getElement().offsetLeft, 
			    this.getElement().offsetTop], 
	[this.dims_.X, this.dims_.Y], 
	xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.createViewBoxSlideAnimations_ = function () {
    var elt = /** @type {Element} */ null; 

    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	elt = ViewBox.getElement();
	this.anims_.push(new goog.fx.dom.Slide(
	    elt, [elt.offsetLeft, elt.offsetTop], 
	    [this.dims_.viewbox.X[i][j], this.dims_.viewbox.Y[i][j]], 
	    xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));	
    }.bind(this))
}



/**
 * @private
 */
xiv.ui.Modal.prototype.createViewBoxResizeAnimations_ = function () {
    var elt = /** @type {Element} */ null; 

    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	elt = ViewBox.getElement();
	this.anims_.push(new goog.fx.dom.Resize(
	    elt, [elt.offsetWidth, elt.offsetHeight], 
	    [this.dims_.viewbox.W, this.dims_.viewbox.H], 
	    xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));	
    }.bind(this))
}




/**
 * Calculates the xiv.ui.Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 * @private
 */
xiv.ui.Modal.prototype.computeDims_ = function () {
    this.dims_ = goog.isDefAndNotNull(this.dims_) ? this.dims_ : {};
    this.computeModalDims_();

    this.computeThumbnailGalleryDims_();
    window.console.log("THUMB", this.dims_);
    this.computeViewBoxDims_();
    this.computeViewBoxPositions_();
    this.computeModalPosition_();
    this.computeButtonPositions_();
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeModalDims_ = function() {
    var scalerH = (this.mode_ == xiv.ui.Modal.modes.WINDOWED) ? 
	xiv.ui.Modal.inlineDims.STARTING_H_PCT : 1;
    var scalerW = (this.mode_ == xiv.ui.Modal.modes.WINDOWED) ? 
	xiv.ui.Modal.inlineDims.STARTING_W_PCT : 1;
    this.dims_ = goog.isDefAndNotNull(this.dims_) ? this.dims_ : {};
    this.dims_.H = window.innerHeight * scalerH;
    this.dims_.W = window.innerWidth * scalerW;
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeThumbnailGalleryDims_ = function() {
    this.dims_.thumbgallery = {};

    this.dims_.thumbgallery.W = 
	goog.style.getSize(this.ThumbnailHandler_.getThumbnailGallery().
			   getElement()).width


    this.dims_.thumbgallery.H = this.dims_.H - 
	xiv.ui.Modal.inlineDims.VIEWBOX_VERT_MARGIN * 2;
    this.dims_.thumbgallery.Y = 
	xiv.ui.Modal.inlineDims.VIEWBOX_VERT_MARGIN;
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.computeViewBoxDims_ = function() {
    this.dims_.viewbox = {};	
    this.dims_.viewbox.COLS = this.ViewBoxHandler_.columnCount();
    this.dims_.viewbox.ROWS = this.ViewBoxHandler_.rowCount();

    this.dims_.viewbox.H = 
	(this.dims_.H - ((this.dims_.viewbox.ROWS + 1) * 
	xiv.ui.Modal.inlineDims.VIEWBOX_HORIZ_MARGIN)) / 
	this.dims_.viewbox.ROWS;


    this.dims_.viewbox.W = 
    // The total width to work with
	(this.dims_.W - this.dims_.thumbgallery.W - 
	xiv.ui.Modal.inlineDims.VIEWBOX_HORIZ_MARGIN) / 
	this.dims_.viewbox.COLS - xiv.ui.Modal.inlineDims.VIEWBOX_HORIZ_MARGIN;

    window.console.log('Viewboxwidth', this.dims_);
}





/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.computeModalPosition_ = function () {
    this.dims_.X = (window.innerWidth - this.dims_.W)/2 ;
    this.dims_.Y = (window.innerHeight - this.dims_.H)/2;
}
    

/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.computeButtonPositions_ = function () {
    var tWidth = /**@type {!number}*/
    this.dims_.viewbox.X[0][0] + 
    (this.dims_.viewbox.X[0][this.dims_.viewbox.COLS-1] + 
	this.dims_.viewbox.W - 
    this.dims_.viewbox.X[0][0])/2 
    - 4;

    this.dims_.BUTTONS = {
	INSERTROW : {},
	REMOVEROW : {}
    };
    this.dims_.BUTTONS.INSERTROW.X = tWidth -2;
    this.dims_.BUTTONS.REMOVEROW.X = tWidth + 2;
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.computeViewBoxPositions_ = function () {
  
    this.dims_.viewbox.X = [];
    this.dims_.viewbox.Y = [];


    this.dims_.viewbox.START = this.dims_.thumbgallery.W + 
	xiv.ui.Modal.inlineDims.VIEWBOX_VERT_MARGIN;

    var l = /**@type {!number}*/ 0;
    this.ViewBoxHandler_.loop(function(ViewBox, i, j) { 
	
	l = this.dims_.viewbox.START + j * (
	    this.dims_.viewbox.W + 
		xiv.ui.Modal.inlineDims.VIEWBOX_VERT_MARGIN);

	//window.console.log("L", l);
	//window.console.log(this.dims_.viewbox.START , j , 
	//this.dims_.viewbox.W , xiv.ui.Modal..inlineDims.VERT_MGN);

	if (j==0 || !this.dims_.viewbox.X[i]) {
	    this.dims_.viewbox.X.push([])
	}
	
	this.dims_.viewbox.X[i][j] = l;
	if (j==0 || !this.dims_.viewbox.Y[i]) {
	    this.dims_.viewbox.Y.push([]);
	}
	
	this.dims_.viewbox.Y[i][j] = (-1 + i * 
		(this.dims_.viewbox.H + 
		 xiv.ui.Modal.inlineDims.VIEWBOX_HORIZ_MARGIN));

	this.dims_.viewbox.Y[i][j] +=  
	xiv.ui.Modal.inlineDims.VIEWBOX_HORIZ_MARGIN;	
    }.bind(this))
}



/**
 * Method for updating the style of the '_modal' element
 * due to window resizing, or any event that requires the 
 * xiv.ui.Modal element change its dimensions.
 * @param {Object.<string, string | number>=}
 * @public
 */
xiv.ui.Modal.prototype.updateStyle = function () {	
    this.computeDims_();

    moka.style.setStyle(this.getElement(), {
	'height' : this.dims_.H,
	'width': this.dims_.W,
	'left': this.dims_.X,
	'top': this.dims_.Y,
    });
    this.updateStyle_ThumbnailGallery_();
    this.updateStyle_ViewBoxes_();
    //window.console.log("DIMS", this.dims_);
    this.updateStyle_buttons_();
    this.highlightInUseThumbnails();
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_ThumbnailGallery_ = function(){
    // xiv.ui.ViewBoxes	
    if (this.ThumbnailHandler_) {
	moka.style.setStyle(
	    this.ThumbnailHandler_.getThumbnailGallery().getElement(), {
		'height': this.dims_.thumbgallery.H,
		'top': this.dims_.thumbgallery.Y
	})	
    }
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_ViewBoxes_ = function(){
    // xiv.ui.ViewBoxes	
    if (this.ViewBoxHandler_) {
	this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	    moka.style.setStyle(ViewBox.getElement(), {
		'height': this.dims_.viewbox.H,
		'width': this.dims_.viewbox.W ,
		'left': this.dims_.viewbox.X[i][j],
		'top': this.dims_.viewbox.Y[i][j]
	    })	
	    ViewBox.updateStyle();
	}.bind(this)); 		
    }	
}


/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_buttons_ = function(){
    moka.style.setStyle(this.buttons_INSERTROW, {
	'left': this.dims_.BUTTONS.INSERTROW.X
    })
    moka.style.setStyle(this.buttons_.REMOVEROW, { 
	'left': this.dims_.BUTTONS.REMOVEROW.X
    })
}


/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.initSubComponents = function() {
    this.initBackground_();
    this.initThumbnailHandler_();
    this.initViewBoxHandler_();
    this.initButtons_();
}



/**
 * Creates the background of the modal.
 * @private
 */
xiv.ui.Modal.prototype.initBackground_ = function() {
    var bg = goog.dom.createDom('div');
    bg.id = this.constructor.ID_PREFIX + '_Background_' + 
	goog.string.createUniqueString();
    goog.dom.classes.set(bg, xiv.ui.Modal.CSS.BACKGROUND);
    goog.dom.append(this.getElement(), bg);
}



/**
 * Creates the modal's buttons.
 * @private
 */
xiv.ui.Modal.prototype.initButtons_ = function() {
    this.buttons_ = xiv.ui.Modal.createButtons_();
    goog.object.forEach(this.buttons_, function(button, key){
	goog.dom.append(this.getElement(), button);
    }.bind(this))
    this.setFullScreenButtonEvents_();
    this.setRowColumnInsertRemoveEvents_();
}



/**
 * @private
 */
xiv.ui.Modal.prototype.initThumbnailHandler_ = function() {
    this.ThumbnailHandler_ = new xiv.ui.ThumbnailHandler();
    this.ThumbnailHandler_.setHoverParent(this.getElement());
    goog.dom.append(this.getElement(), 
		    this.ThumbnailHandler_.getThumbnailGallery().getElement());

    this.setThumbnailHandlerEvents_();
}



/**
 * @private
 */
xiv.ui.Modal.prototype.initViewBoxHandler_ = function() {
    window.console.log("INIT VIEW BOX HANDLER");
    this.ViewBoxHandler_ = new xiv.ui.ViewBoxHandler();
    this.ViewBoxHandler_.setViewBoxesParent(this.getElement());   
    this.setViewBoxHandlerEvents_();
}



/**
 * Events for when the fullscreen button is clicked.
 * @private
 */ 
xiv.ui.Modal.prototype.onFullScreenButtonClicked_ = function() {
    this.previousMode_ = this.mode_;
    goog.dom.fullscreen.requestFullScreen(this.getElement()); 
    this.setMode(xiv.ui.Modal.modes.FULLSCREEN);
    this.buttons_.FULLSCREEN.style.visibility = 'hidden';
    this.buttons_.WINDOWED.style.visibility = 'visible';
}



/**
 * Events for when the 'windowed' button is clicked.
 * @private
 */ 
xiv.ui.Modal.prototype.onWindowedButtonClicked_ = function() {
    goog.dom.fullscreen.exitFullScreen(); 
    this.setMode(this.previousMode_);
    this.buttons_.FULLSCREEN.style.visibility = 'visible';
    this.buttons_.WINDOWED.style.visibility = 'hidden';
}



/**
 * As stated.
 * @private
 */   
xiv.ui.Modal.prototype.setFullScreenButtonEvents_ = function(){
    this.buttons_.WINDOWED.style.visibility = 'hidden';
}



/**
 * As stated.
 *
 * @param {Function=} opt_listenMethod (i.e. goog.events.listen or 
 *     goog.events.unlisten.  Defaults to goog.events.listen.
 * @private
 */   
xiv.ui.Modal.prototype.setRowColumnInsertRemoveEvents_ = 
function(opt_listenMethod){
    opt_listenMethod = opt_listenMethod || goog.events.listen;

    opt_listenMethod(this.buttons_.FULLSCREEN, goog.events.EventType.CLICK, 
		     this.onFullScreenButtonClicked_.bind(this));

    opt_listenMethod(this.buttons_.WINDOWED, goog.events.EventType.CLICK,
		     this.onWindowedButtonClicked_.bind(this));

    opt_listenMethod(this.buttons_.INSERTROW, goog.events.EventType.CLICK, 
	this.ViewBoxHandler_.insertRow.bind(this.ViewBoxHandler_));

    opt_listenMethod(this.buttons_.REMOVEROW, goog.events.EventType.CLICK,
	this.ViewBoxHandler_.removeRow.bind(this.ViewBoxHandler_));

    opt_listenMethod(this.buttons_.INSERTCOLUMN, goog.events.EventType.CLICK, 
	this.ViewBoxHandler_.insertColumn.bind(this.ViewBoxHandler_));

    opt_listenMethod(this.buttons_.REMOVECOLUMN, goog.events.EventType.CLICK, 
	this.ViewBoxHandler_.removeColumn.bind(this.ViewBoxHandler_));
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.adjustStyleToMode_ = function(){

    //window.console.log("ADJUST MODE", this.mode_);

    if (this.mode_ == xiv.ui.Modal.modes.POPUP || 
	this.mode_ == xiv.ui.Modal.modes.FULLSCREEN){

	window.console.log("ADJUST STYLE TO MODE");
	moka.style.setStyle(this.getElement(), {
	    'height': '100%',
	    'width': '100%',
	    'border-radius': 0
	})
	this.updateStyle();
    } else {
	//goog.dom.classes.remove(this.background_, xiv.ui.Modal.CSS.BLACK_BG);
    }
}




/**
 * Sets callbacks for the following events: MOUSEOVER, MOUSEOUT, 
 * THUMBNAILDROP, THUMBNAILCLICK
 *
 * @param {Function=} opt_listenMethod (i.e. goog.events.listen or 
 *     goog.events.unlisten.  Defaults to goog.events.listen.
 * @private
 */
xiv.ui.Modal.prototype.setThumbnailHandlerEvents_ = function(opt_listenMethod){

    opt_listenMethod = opt_listenMethod || goog.events.listen;

    opt_listenMethod(this.ThumbnailHandler_, 
		       xiv.ui.ThumbnailHandler.EventType.MOUSEOVER,
					 this.onThumbnailMouseover_.bind(this));

    opt_listenMethod(this.ThumbnailHandler_, 
		       xiv.ui.ThumbnailHandler.EventType.MOUSEOUT, 
					 this.onThumbnailMouseout_.bind(this));

    opt_listenMethod(this.ThumbnailHandler_, 
		       xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_CLICK, 
		       this.onThumbnailClicked_.bind(this));

    opt_listenMethod(this.ThumbnailHandler_, 
		       xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DRAG_OVER, 
		       this.onThumbnailDragOver_.bind(this));

    opt_listenMethod(this.ThumbnailHandler_, 
		       xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DRAG_OUT, 
		       this.onThumbnailDragOut_.bind(this));

    opt_listenMethod(this.ThumbnailHandler_, 
	xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DROPPED_INTO_TARGET, 
		       this.onThumbnailDroppedIntoViewBox_.bind(this));
}



/**
 * Callback function for the MOUSEOVER event on the hovered thumbnail.
 * @param {xiv.ui.Thumbnail} Thumbnail The xiv.ui.Thumbnail that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailMouseover_ = function(Thumbnail) {
    this.ViewBoxHandler_.loop(function(ViewBox){
	if (ViewBox.getThumbnail() === Thumbnail){
	    ViewBox.getElement().style.borderColor = 'white';
	}
    })	
}



/**
 * Callback function for the MOUSEOUT event on the hovered thumbnail.
 * @param {xiv.ui.Thumbnail} Thumbnail The xiv.ui.Thumbnail that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailMouseout_ = function(Thumbnail){
    this.ViewBoxHandler_.loop(function(ViewBox){
	if (ViewBox.getThumbnail() === Thumbnail && 
	    ViewBox.getLoadState() !== 'loading'){
	    ViewBox.getElement().style.borderColor = 
		ViewBox.getElement().getAttribute(
		    xiv.ui.ThumbnailHandler.ORIGINAL_BORDER_ATTR);	
	}
    })
}



/**
 * @param {Event} e The event object. 
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailDragOut_ = function(e){
    this.ViewBoxHandler_.getViewBoxByElement(
	e.thumbnailTargetElement).unhighlight();
}


/**
 * @param {Event} e The event object. 
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailDragOver_ = function(e){
    this.ViewBoxHandler_.getViewBoxByElement(
	e.thumbnailTargetElement).highlight();
}



/**
 * Callback function for the CLICKED event on the hovered thumbnail.
 * @param {Event} e The event object. 
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailClicked_ = function(e){
    this.ViewBoxHandler_.getFirstEmpty().loadThumbnail(e.thumbnail);
}



/**
 * Callback function for the Dropped event on the thumbnail.
 *
 * @param {Event} e The event object.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailDroppedIntoViewBox_ = function(e) {
    var ViewBox = /**@type {!xiv.ui.ViewBox}*/ 
    this.ViewBoxHandler_.getViewBoxByElement(e.targetElement);
    ViewBox.load(e.Thumbnail.getViewable());
    ViewBox.unhighlight();
}



/**
 * As stated.
 * @param {Function=} opt_listenMethod (i.e. goog.events.listen or 
 *     goog.events.unlisten.  Defaults to goog.events.listen.
 * @private
 */
xiv.ui.Modal.prototype.setViewBoxHandlerEvents_ = function(opt_listenMethod){

    opt_listenMethod = opt_listenMethod || goog.events.listen;

    // preload
    opt_listenMethod(this.ViewBoxHandler_,
		     xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_PRELOAD,
					 this.onThumbnailPreload_.bind(this));
    // loaded
    opt_listenMethod(this.ViewBoxHandler_,
		     xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_LOADED,
					 this.onThumbnailLoaded_.bind(this))
    // changed
    opt_listenMethod(this.ViewBoxHandler_,
		     xiv.ui.ViewBoxHandler.EventType.VIEWBOXES_CHANGED,
					 this.onViewBoxesChanged_.bind(this))
}



/**
 * Callback function for the PRELOAD event on the hovered ViewBox.
 * @param {xiv.ui.ViewBox} ViewBox The xiv.ui.ViewBox that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailPreload_ = function(ViewBox){ 
    ViewBox.getElement().style.borderColor = 'white';
    this.highlightInUseThumbnails();
}



/**
 * Callback function for the LOADED event on the hovered ViewBox.
 * @param {xiv.ui.ViewBox} ViewBox The xiv.ui.ViewBox that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailLoaded_ = function(ViewBox){
    ViewBox.getElement().style.borderColor = 
	ViewBox.getElement().getAttribute(
	    xiv.ui.ThumbnailHandler.ORIGINAL_BORDER_ATTR);
    this.highlightInUseThumbnails();
}



/**
 * Callback function for the LOADED event on the hovered ViewBox.
 * @param {Event} e The event.
 * @private
 */
xiv.ui.Modal.prototype.onViewBoxesChanged_ = function(e) {
    if (e.animate) {
	// Fade out the new viewboxes.
	if (e.newSet) {
	    goog.array.forEach(e.newSet, function(newViewBox) {
		moka.style.setStyle(newViewBox.getElement(), {'opacity': 0})
	    })
	}
	// Animate the modal
	this.animateModal();	
    } else {
	this.updateStyle();
    }	

    this.ThumbnailHandler_.clearThumbnailDropTargets();
    this.ThumbnailHandler_.addThumbnailDropTargets(
	this.ViewBoxHandler_.getViewBoxElements());
}



/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    window.console.log("TOTAL LISTENERS", goog.events.getTotalListenerCount());

    // Events
    goog.events.removeAll(this.animQueue_);
    goog.events.removeAll(this.ViewBoxHandler_);
    goog.events.removeAll(this.ThumbnailHandler_);

    // dims
    goog.object.clear(this.dims_);
    delete this.dims_;

    // anims_
    if (goog.isDefAndNotNull(this.anims_)) {
	goog.array.forEach(this.anims_, function(){
	    this.animQueue_.remove(anim);
	    goog.events.removeAll(anim);
	    anim.destroy();
	    anim.disposeInternal();
	}.bind(this))
    }
    delete this.anims_;

    // animQueue_
    if (goog.isDefAndNotNull(this.animQueue_)) {
	this.animQueue_.destroy();
	this.animQueue_.disposeInternal();
	delete this.animQueue_;
    }

    // buttons_
    goog.object.forEach(this.buttons_, function(button, key){
	goog.events.removeAll(button);
	goog.dom.removeNode(button);
	delete this.buttons_[key];
    }.bind(this))
    delete this.buttons_;

    // ViewBoxHandler_
    this.ViewBoxHandler_.disposeInternal();
    delete this.ViewBoxHandler_;

    // ThumbnailHandler_
    this.ThumbnailHandler_.disposeInternal();
    delete this.ThumbnailHandler_;

    // prototype stuff
    this.mode_ = null;
    this.previousMode_ = null;
}





