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
goog.require('xiv.ui.ThumbnailGallery');
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
     * @type {?moka.ui.ZipTabs}
     * @private
     */	
    this.ProjectTab_ = null; 


    /**
     * @type {!Element}
     * @private
     */	
    this.ProjectTabBounds_ = null; 



    /**
     * @type {Object.<string, Element>}
     * @private
     */
    this.buttons_;


    /**
     * @type {xiv.ui.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_;


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


    //window.console.log("MODE", this.currMode_);
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
    PROJECTTAB : 'projecttab',
    PROJECTTAB_BOUNDS: 'projecttab-bounds',
    PROJECTTAB_DRAGGER : 'projecttab-dragger',
    PROJECTTAB_DRAGGER_HANDLE : 'projecttab-dragger-handle',
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
 * @type {!number} 
 * @const
 */
xiv.ui.Modal.ANIM_LEN = 500;



/**
 * Constant upon instantiation.  See:
 * https://groups.google.com/forum/#!msg/closure-library-discuss/
 *    CJQGRIhkS9U/YEc3-7j4QoQJ
 * 
 * @struct
 * @param {!string} name
 * @param {number=} opt_wRatio The optional width ratio (defaults to 1).
 * @param {number=} opt_hRatio The optional height ratio (defaults to 1).
 */
xiv.ui.Modal.Mode = function(name, opt_wRatio, opt_hRatio) {
    this.VIEWBOX_HORIZ_MARGIN = 25;
    this.VIEWBOX_VERT_MARGIN = 25;
    this.VIEWBOX_MIN_H =  320;
    this.VIEWBOX_MIN_W = 320;
    this.NAME = name;
    this.W_RATIO = opt_wRatio || 1;
    this.H_RATIO = opt_hRatio || 1;
}



/**
 * @struct
 */
xiv.ui.Modal.ModeTypes = {
    FULLSCREEN:  new xiv.ui.Modal.Mode('fullscreen'),
    POPUP: new xiv.ui.Modal.Mode('popup'),
    FULLSCREEN_POPUP: new xiv.ui.Modal.Mode('fullscreen-popup'),
    WINDOWED: new xiv.ui.Modal.Mode('windowed', .95, .95)
}



/**
 * @type {!xiv.ui.Modal.Mode}
 * @private
 */
xiv.ui.Modal.prototype.currMode_ = xiv.ui.Modal.ModeTypes.WINDOWED;



/**
 * @type {string}
 * @private
 */
xiv.ui.Modal.prototype.prevMode_;




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
 * Get the associated xiv.ui.ViewBoxHandler for this object.
 * @return {xiv.ui.ViewBoxHandler} The xiv.ui.ViewBoxHandler for this object.
 * @public
 */
xiv.ui.Modal.prototype.getViewBoxHandler =  function() {
  return this.ViewBoxHandler_;
}



/**
 * Get the associated xiv.ui.ThumbnailGallery for this object.
 * @return {xiv.ui.ThumbnailGallery} The xiv.ui.ThumbnailGallery for this object.
 * @public
 */
xiv.ui.Modal.prototype.getThumbnailGallery = function() {
  return this.ThumbnailGallery_;
}



/**
 * @return {moka.ui.ZipTabs} The projectTab
 * @public
 */
xiv.ui.Modal.prototype.getProjectTab = function() {
  return this.ProjectTab_;
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
 * @param {!string | !xiv.ui.Modal.Mode} mode The mode to test
 * @public
 */
xiv.ui.Modal.prototype.setMode = function(mode) {
    
    // first check if mode is a string
    if (goog.isString(mode)){
	for (var key in xiv.ui.Modal.ModeTypes) {

	    //window.console.log(key, xiv.ui.Modal.ModeTypes[key].NAME);
	    if (xiv.ui.Modal.ModeTypes[key].NAME == mode){
		mode = xiv.ui.Modal.ModeTypes[key];
		break;
	    }
	}
    }

    // If we still have string or it's not a valide mode, throw the error.
    if (goog.isString(mode) || 
	!goog.object.containsValue(xiv.ui.Modal.ModeTypes, mode)){
	window.console.log(xiv.ui.Modal.ModeTypes);
	throw new TypeError('Invalid xiv.ui.Modal mode: ' + mode);
    }

    this.currMode_ = mode;
    this.adjustStyleToMode_();
}



/**
 * As stated.
 * @return {!Object} The button object.
 * @public
 */
xiv.ui.Modal.prototype.getMode = function() {
  return this.currMode_;
}



/**
 * Highlights all thumbnails that are being viewed a xiv.ui.ViewBox.
 * @public
 */
xiv.ui.Modal.prototype.highlightInUseThumbnails = function () {
    this.ThumbnailGallery_.loop(function(Thumbnail){  
	// Unhighlight all thumbnails.
	Thumbnail.setActive(false);
	this.ViewBoxHandler_.loop(function(ViewBox){  
	    if (ViewBox.getViewableTrees().indexOf(Thumbnail.getViewable()) 
		> -1){
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

    this.computeZipTabsDims_();
    //window.console.log("THUMB", this.dims_);
    this.computeViewBoxDims_();
    this.computeViewBoxPositions_();
    this.computeModalPosition_();
    this.computeButtonPositions_();
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeModalDims_ = function() {
    var scalerH = this.currMode_.H_RATIO;
    var scalerW = this.currMode_.W_RATIO;
    this.dims_ = goog.isDefAndNotNull(this.dims_) ? this.dims_ : {};
    this.dims_.H = window.innerHeight * scalerH;
    this.dims_.W = window.innerWidth * scalerW;
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeZipTabsDims_ = function() {
    this.dims_.thumbgallery = {};

    this.dims_.thumbgallery.W = 
	goog.style.getSize(this.ProjectTab_.getElement()).width

    this.dims_.thumbgallery.H = this.dims_.H - 
	this.currMode_.VIEWBOX_VERT_MARGIN * 2;
    this.dims_.thumbgallery.Y = 
	this.currMode_.VIEWBOX_VERT_MARGIN;
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
	this.currMode_.VIEWBOX_HORIZ_MARGIN)) / 
	this.dims_.viewbox.ROWS;


    this.dims_.viewbox.W = 
    // The total width to work with
	(this.dims_.W - this.dims_.thumbgallery.W - 
	this.currMode_.VIEWBOX_HORIZ_MARGIN) / 
	this.dims_.viewbox.COLS - this.currMode_.VIEWBOX_HORIZ_MARGIN;

    //window.console.log('Viewboxwidth', this.dims_);
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
	this.currMode_.VIEWBOX_VERT_MARGIN;

    var l = /**@type {!number}*/ 0;
    this.ViewBoxHandler_.loop(function(ViewBox, i, j) { 
	
	l = this.dims_.viewbox.START + j * (
	    this.dims_.viewbox.W + 
		this.currMode_.VIEWBOX_VERT_MARGIN);

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
		 this.currMode_.VIEWBOX_HORIZ_MARGIN));

	this.dims_.viewbox.Y[i][j] +=  
	this.currMode_.VIEWBOX_HORIZ_MARGIN;	
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
    this.updateStyle_ProjectTab_();
    this.updateStyle_ViewBoxes_();
    this.updateStyle_buttons_();
    this.highlightInUseThumbnails();
    //window.console.log("WIDTH", this.ProjectTab_.getElement());
    //window.console.log("DIMS", this.dims_);
   // window.console.log("RESIZE5!", this.ProjectTab_.getElement().style.width);
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_ProjectTab_ = function(){
    if (this.ProjectTab_) {
	this.ProjectTab_.updateStyle();
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
    this.initProjectTab_();
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
xiv.ui.Modal.prototype.initProjectTab_ = function() {
    //
    // TabBounds
    //
    this.ProjectTabBounds_ = goog.dom.createDom('div');
    goog.dom.append(this.getElement(), this.ProjectTabBounds_);
    goog.dom.classes.add(this.ProjectTabBounds_, 
			 xiv.ui.Modal.CSS.PROJECTTAB_BOUNDS);

    //
    // ProjectTab
    //
    this.ProjectTab_ = new moka.ui.ZipTabs('RIGHT'); 
    goog.dom.append(this.getElement(), this.ProjectTab_.getElement());
    goog.dom.classes.add(this.ProjectTab_.getElement(), 
			 xiv.ui.Modal.CSS.PROJECTTAB);
    


    //
    // Thumbnail Gallery
    //
    this.ThumbnailGallery_ = new xiv.ui.ThumbnailGallery();
    this.ThumbnailGallery_.setHoverParent(this.getElement());
    goog.dom.append(this.ProjectTab_.getElement(), 
		    this.ThumbnailGallery_.getElement());
    this.setThumbnailGalleryEvents_();

    //
    // add thumbnail gallery to ProjectTab_
    //
    this.ProjectTab_.setTabPageContents('Project Browser', 
				        this.ThumbnailGallery_);

    //
    // Set the boundary of the tabs
    //
    this.ProjectTab_.setBoundaryElement(this.ProjectTabBounds_);
    

    //
    // Add dragger CSS
    //
    var dragHandle = this.ProjectTab_.getResizeHandles()[0];
    goog.dom.classes.add(dragHandle, xiv.ui.Modal.CSS.PROJECTTAB_DRAGGER);


    //
    // Add dragger handle
    //
    goog.dom.append(dragHandle, goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_DraggerHandle_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.Modal.CSS.PROJECTTAB_DRAGGER_HANDLE
    }));


    // Event listener
    goog.events.listen(this.ProjectTab_, moka.ui.Resizable.EventType.RESIZE,
		       this.updateStyle.bind(this));
 
}



/**
 * @private
 */
xiv.ui.Modal.prototype.initViewBoxHandler_ = function() {
    //window.console.log("INIT VIEW BOX HANDLER");
    this.ViewBoxHandler_ = new xiv.ui.ViewBoxHandler();
    this.ViewBoxHandler_.setViewBoxesParent(this.getElement());   
    this.setViewBoxHandlerEvents_();
}



/**
 * Events for when the fullscreen button is clicked.
 * @private
 */ 
xiv.ui.Modal.prototype.onFullScreenButtonClicked_ = function() {
    this.prevMode_ = this.currMode_;
    goog.dom.fullscreen.requestFullScreen(this.getElement()); 
    this.setMode(xiv.ui.Modal.ModeType.FULLSCREEN);
    this.buttons_.FULLSCREEN.style.visibility = 'hidden';
    this.buttons_.WINDOWED.style.visibility = 'visible';
}



/**
 * Events for when the 'windowed' button is clicked.
 * @private
 */ 
xiv.ui.Modal.prototype.onWindowedButtonClicked_ = function() {
    goog.dom.fullscreen.exitFullScreen(); 
    this.setMode(this.prevMode_);
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
    
    //window.console.log("ADJUST MODE", this.currMode_);

    if (this.currMode_ !== xiv.ui.Modal.ModeTypes.WINDOWED) {
	this.getElement().style.borderRadius = 0;
    } 

    if (this.currMode_ == xiv.ui.Modal.ModeTypes.POPUP) {
	this.buttons_.POPUP.style.visibilty = 'hidden';
	this.buttons_.FULLSCREEN.style.visibilty = 'visible';
    } 
    else if (this.currMode_ == xiv.ui.Modal.ModeTypes.FULLSCREEN_POPUP) {
	this.buttons_.POPUP.style.visibilty = 'hidden';
	this.buttons_.FULLSCREEN.style.visibilty = 'hidden';
    } 
    else if (this.currMode_ == xiv.ui.Modal.ModeTypes.FULLSCREEN) {
	this.buttons_.POPUP.style.visibilty = 'visible';
	this.buttons_.FULLSCREEN.style.visibilty = 'hidden';
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
xiv.ui.Modal.prototype.setThumbnailGalleryEvents_ = function(opt_listenMethod){

    opt_listenMethod = opt_listenMethod || goog.events.listen;

    opt_listenMethod(this.ThumbnailGallery_, 
		       xiv.ui.ThumbnailGallery.EventType.MOUSEOVER,
					 this.onThumbnailMouseover_.bind(this));

    opt_listenMethod(this.ThumbnailGallery_, 
		       xiv.ui.ThumbnailGallery.EventType.MOUSEOUT, 
					 this.onThumbnailMouseout_.bind(this));

    opt_listenMethod(this.ThumbnailGallery_, 
		       xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_CLICK, 
		       this.onThumbnailClicked_.bind(this));

    opt_listenMethod(this.ThumbnailGallery_, 
		       xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DRAG_OVER, 
		       this.onThumbnailDragOver_.bind(this));

    opt_listenMethod(this.ThumbnailGallery_, 
		       xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DRAG_OUT, 
		       this.onThumbnailDragOut_.bind(this));

    opt_listenMethod(this.ThumbnailGallery_, 
	xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DROPPED_INTO_TARGET, 
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
		    xiv.ui.ThumbnailGallery.ORIGINAL_BORDER_ATTR);	
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
	    xiv.ui.ThumbnailGallery.ORIGINAL_BORDER_ATTR);
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

    this.ThumbnailGallery_.clearThumbnailDropTargets();
    this.ThumbnailGallery_.addThumbnailDropTargets(
	this.ViewBoxHandler_.getViewBoxElements());
}



/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    window.console.log("TOTAL LISTENERS", goog.events.getTotalListenerCount());

    // dims
    goog.object.clear(this.dims_);
    delete this.dims_;

    // anims_
    moka.ui.disposeAnimations(this.anims_);
    delete this.anims_;

    // animQueue_
    moka.ui.disposeAnimationQueue(this.animQueue_);
    delete this.animQueue_;
    
    // buttons_
    moka.ui.disposeElementMap(this.buttons_);
    delete this.buttons_;

    // ViewBoxHandler_
    goog.events.removeAll(this.ViewBoxHandler_);
    this.ViewBoxHandler_.disposeInternal();
    delete this.ViewBoxHandler_;

    // Zip Tabs
    goog.events.removeAll(this.ProjectTab_);
    this.ProjectTab_.disposeInternal();
    delete this.ProjectTab_;

    // ThumbnailGallery_
    goog.events.removeAll(this.ThumbnailGallery_);
    this.ThumbnailGallery_.disposeInternal();
    delete this.ThumbnailGallery_;

    // others
    delete this.currMode_
    delete this.prevMode_;
}





