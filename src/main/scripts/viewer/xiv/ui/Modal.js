/**
 * @preserve Copyright 2014 Washington Universityf
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
goog.require('nrg.ui.Component');
goog.require('nrg.ui.Resizable');
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.convert');
goog.require('nrg.fx');

// xiv
goog.require('xiv.ui.ThumbnailGallery');
goog.require('xiv.ui.ViewBoxHandler');




/**
 * xiv.ui.Modal is the central class where various nrg.ui.Components meet.
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.Modal');
xiv.ui.Modal = function () {
    goog.base(this);   
}
goog.inherits(xiv.ui.Modal, nrg.ui.Component);
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
 * @expose
 */
xiv.ui.Modal.States = {
    FULLSCREEN: 'fullscreen',
    POPUP: 'popup',
    FULLSCREEN_POPUP: 'fullscreen-popup',
    WINDOWED: 'windowed',
    DEMO: 'demo',
    DEMO_FULLSCREEN: 'demp-fullscreen',
}



/**
 * @enum {string}
 */
xiv.ui.Modal.ButtonTypes = {
    CLOSE : 'Close XNAT Image Viewer.',
    FULLSCREEN: 'Enter full-screen mode.',
    POPUP: 'Popup to new window.',
    WINDOWED: 'Exit full-screen mode.',
    //REMOVEROW: 'Remove ViewBox row',
    INSERTROW : 'Insert ViewBox row',
    //REMOVECOLUMN: 'Remove ViewBox column',
    INSERTCOLUMN: 'Insert ViewBox column',
}


/**
 * As stated.
 * @param {!string} iconUrl
 * @private
 */
xiv.ui.Modal.createButtons_ = function(iconUrl){
    //
    // Generate new button IDs
    //
    var buttonIds = {};
    goog.object.forEach(xiv.ui.Modal.ButtonTypes, function(buttonType, key){
	buttonIds[key] = xiv.ui.Modal.ID_PREFIX + '.' + 
			 goog.string.toTitleCase(key) + 'Button';
    })

    //
    // Make buttons
    //
    var buttons = 
    nrg.dom.createBasicHoverButtonSet(goog.object.getValues(buttonIds));

    //
    // Make object that maps old keys to buttons.
    //
    var buttonsWithOriginalKeys = {};
    goog.object.forEach(buttonIds, function(newKey, oldKey){
	buttonsWithOriginalKeys[oldKey] = buttons[newKey];
	goog.dom.classes.set(buttons[newKey], 
	    goog.getCssName(xiv.ui.Modal.CSS_CLASS_PREFIX, 
			oldKey.toLowerCase() + '-' + 'button'));
    })
    return buttonsWithOriginalKeys
}



/**
 * @const
 * @private
 */
xiv.ui.Modal.prototype.horizMargin_ = 29;



/**
 * @const
 * @private
 */
xiv.ui.Modal.prototype.verticalMargin_ = 29;



/**
 * @const
 * @private
 */
xiv.ui.Modal.prototype.minHeight_ = 320;



/**
 * @const
 * @private
 */
xiv.ui.Modal.prototype.minWidth_ = 320;



/**
 * @type {!number} 
 * @const
 */
xiv.ui.Modal.prototype.animLen_ = 500;



/**
 * @type {!string}
 * @private
 */
xiv.ui.Modal.prototype.currState_ = xiv.ui.Modal.States.DEMO;



/**
 * @type {string}
 * @private
 */
xiv.ui.Modal.prototype.prevState_;



/**
 * @type {nrg.ui.ZipTabs}
 * @private
 */	
xiv.ui.Modal.prototype.ProjectTab_; 



/**
 * @type {Element}
 * @private
 */	
xiv.ui.Modal.prototype.ProjectTabBounds_; 



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.Modal.prototype.buttons_;



/**
 * @type {xiv.ui.ThumbnailGallery}
 * @private
 */
xiv.ui.Modal.prototype.ThumbnailGallery_;



/**
 * @type {xiv.ui.ViewBoxHandler}
 * @private
 */
xiv.ui.Modal.prototype.ViewBoxHandler_;



/**
 * @type {goog.fx.AnimationParallelQueue}
 */
xiv.ui.Modal.prototype.animQueue_;



/**
 * @type {Array.<goog.fx.dom.PredefinedEffect>}
 */
xiv.ui.Modal.prototype.anims_;



/**
 * @type {Object}
 */
xiv.ui.Modal.prototype.dims_;



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
 * @return {xiv.ui.ThumbnailGallery} The xiv.ui.ThumbnailGallery for this 
 *    object.
 * @public
 */
xiv.ui.Modal.prototype.getThumbnailGallery = function() {
  return this.ThumbnailGallery_;
}



/**
 * @return {nrg.ui.ZipTabs} The projectTab
 * @public
 */
xiv.ui.Modal.prototype.getProjectTab = function() {
  return this.ProjectTab_;
}


/**
 * @return {!Element} The described element.
 * @public
 */
xiv.ui.Modal.prototype.getPopupButton = function() {
  return this.buttons_.POPUP;
}


/**
 * @return {!Element} The described element.
 * @public
 */
xiv.ui.Modal.prototype.getCloseButton = function() {
  return this.buttons_.CLOSE;
}


/**
 * @return {!Element} The described element.
 * @public
 */
xiv.ui.Modal.prototype.getFullScreenButton = function() {
  return this.buttons_.FULLSCREEN;
}



/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.initSubComponents();
    this.ViewBoxHandler_.insertColumn(false);
    this.setState(this.currState_);
}




/**
 * @param {!string} state The state to set.
 * @public
 */
xiv.ui.Modal.prototype.setState = function(state) {
    if (goog.isDefAndNotNull(this.currState_)){
	this.prevState_ = this.currState_;
    }
    this.currState_ = state;
    this.adaptToState_();
}



/**
 * @return {!string} The state.
 * @public
 */
xiv.ui.Modal.prototype.getState = function() {
  return this.currState_;
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
 *
 * @param {function=} opt_callback The callback for AFTER the modal is animated.
 * @public
 */
xiv.ui.Modal.prototype.animateModal  = function () {
    //
    // Get the dims.
    //
    this.computeDims_();
    //window.console.log(this.dims_);

    //
    // Setup.
    //
    this.anims_ = goog.isDefAndNotNull(this.anims_) ? this.anims_ : [];
    this.animQueue_ = goog.isDefAndNotNull(this.animQueue_) ? 
	this.animQueue_ : new goog.fx.AnimationParallelQueue();

    //
    // Create anims
    //
    this.createViewBoxSlideAnimations_();
    this.createViewBoxResizeAnimations_();

    //
    // Events.
    //
    goog.events.listen(this.animQueue_, 'end', 
	this.onModalAnimationEnd_.bind(this));

    goog.array.forEach(this.anims_, function(anim){
	this.animQueue_.add(anim);
    }.bind(this))

    //
    // Play.
    //
    this.animQueue_.play();
    this.highlightInUseThumbnails();
}



/**
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationAnimate_ = function() {
    this.ViewBoxHandler_.loop( function(ViewBox) { 
	ViewBox.updateStyle();
    })
}



/**
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationEnd_ = function() {

    //
    // Destroy anims
    //
    goog.array.forEach(this.anims_, function(anim){
	this.animQueue_.remove(anim);
	goog.events.removeAll(anim);
	anim.destroy();
	anim.disposeInternal();
    }.bind(this))

    //
    // Clear anims array
    //
    goog.array.clear(this.anims_);

    //
    // Update
    //
    this.updateStyle();
    this.fadeInHiddenViewers_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.fadeInHiddenViewers_ = function() {
    //
    // Fade in new viewers.
    //
    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	//window.console.log(ViewBox.getElement().style.opacity);
	if (ViewBox.getElement().style.opacity == 0) {
	    nrg.fx.fadeIn(ViewBox.getElement(), 
			  nrg.ui.Component.animationLengths.MEDIUM);
	}
    })
}



/**
 * @private
 */
xiv.ui.Modal.prototype.createViewBoxSlideAnimations_ = function () {
    var elt = null; 
    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	window.console.log(i, j, ViewBox.getElement());
	elt = ViewBox.getElement();
	this.anims_.push(new goog.fx.dom.Slide(
	    elt, [elt.offsetLeft, elt.offsetTop], 
	    [this.dims_.viewbox.X[i][j], this.dims_.viewbox.Y[i][j]], 
	    nrg.ui.Component.animationLengths.MEDIUM, goog.fx.easing.easeOut));	
    }.bind(this))
}



/**
 * @private
 */
xiv.ui.Modal.prototype.createViewBoxResizeAnimations_ = function () {
    var elt = null; 
    this.ViewBoxHandler_.loop( function(ViewBox, i, j) { 
	elt = ViewBox.getElement();
	this.anims_.push(new goog.fx.dom.Resize(
	    elt, [elt.offsetWidth, elt.offsetHeight], 
	    [this.dims_.viewbox.W, this.dims_.viewbox.H], 
	    nrg.ui.Component.animationLengths.MEDIUM, goog.fx.easing.easeOut));	
    }.bind(this))
}




/**
 * Calculates the xiv.ui.Modal's dimensions based on pixel values.
 *
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 * @private
 */
xiv.ui.Modal.prototype.computeDims_ = function () {
    this.dims_ = goog.isDefAndNotNull(this.dims_) ? this.dims_ : {};
    this.calcDims();
    this.computeZipTabsDims_();
    this.computeViewBoxDims_();
    this.computeViewBoxPositions_();
    this.computeButtonPositions_();
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeZipTabsDims_ = function() {
    this.dims_.thumbgallery = {};

    this.dims_.thumbgallery.W = 
	goog.style.getSize(this.ProjectTab_.getElement()).width

    this.dims_.thumbgallery.H = this.currSize.height - 
	this.verticalMargin_ * 2;
    this.dims_.thumbgallery.Y = 
	this.verticalMargin_;
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeViewBoxDims_ = function() {
    this.dims_.viewbox = {};	
    this.dims_.viewbox.COLS = this.ViewBoxHandler_.columnCount();
    this.dims_.viewbox.ROWS = this.ViewBoxHandler_.rowCount();

    this.dims_.viewbox.H = 
	(this.currSize.height - ((this.dims_.viewbox.ROWS + 1) * 
	this.horizMargin_)) / 
	this.dims_.viewbox.ROWS;


    this.dims_.viewbox.W = 
    // The total width to work with
	(this.currSize.width - this.dims_.thumbgallery.W - 
	this.horizMargin_) / 
	this.dims_.viewbox.COLS - this.horizMargin_;

    //window.console.log('Viewboxwidth', this.dims_);
}

    

/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeButtonPositions_ = function () {
    var tWidth = this.dims_.viewbox.X[0][0] + 
    (this.dims_.viewbox.X[0][this.dims_.viewbox.COLS-1] + 
	this.dims_.viewbox.W - 
    this.dims_.viewbox.X[0][0])/2 
    - 4;

    this.dims_.BUTTONS = {
	INSERTROW : {},
	//REMOVEROW : {}
    };
    this.dims_.BUTTONS.INSERTROW.X = tWidth -2;
    //this.dims_.BUTTONS.REMOVEROW.X = tWidth + 2;
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.computeViewBoxPositions_ = function () {
    this.dims_.viewbox.X = [];
    this.dims_.viewbox.Y = [];
    this.dims_.viewbox.START = this.dims_.thumbgallery.W + this.verticalMargin_;

    var l = 0;
    this.ViewBoxHandler_.loop(function(ViewBox, i, j) { 
	
	l = this.dims_.viewbox.START + j * (
	    this.dims_.viewbox.W + this.verticalMargin_);

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
	
	this.dims_.viewbox.Y[i][j] = (-1 + i * (this.dims_.viewbox.H + 
		 this.horizMargin_));

	this.dims_.viewbox.Y[i][j] += this.horizMargin_;	
    }.bind(this))
}



/**
 * Method for updating the style of the '_modal' element
 * due to window resizing, or any event that requires the 
 * xiv.ui.Modal element change its dimensions.
 *
 * @public
 */
xiv.ui.Modal.prototype.updateStyle = function () {

    this.computeDims_();
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
	    nrg.style.setStyle(ViewBox.getElement(), {
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
    nrg.style.setStyle(this.buttons_.INSERTROW, {
	'left': this.dims_.BUTTONS.INSERTROW.X
    })
    //nrg.style.setStyle(this.buttons_.REMOVEROW, { 
    //'left': this.dims_.BUTTONS.REMOVEROW.X
    //})
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
 *
 * @private
 */
xiv.ui.Modal.prototype.initBackground_ = function() {
    var bg = goog.dom.createDom('div');
    bg.id = this.constructor.ID_PREFIX + '_Background_' + 
	goog.string.createUniqueString();
    goog.dom.classes.set(bg, xiv.ui.Modal.CSS.BACKGROUND);
    goog.dom.appendChild(this.getElement(), bg);
}



/**
 * Creates the modal's buttons.
 *
 * @private
 */
xiv.ui.Modal.prototype.initButtons_ = function() {
    this.buttons_ = xiv.ui.Modal.createButtons_();
    goog.object.forEach(this.buttons_, function(button, key){
	goog.dom.append(this.getElement(), button);
    }.bind(this))
 
    this.setRowColumnInsertRemoveEvents_();

    this.buttons_.CLOSE.innerHTML = '<img src=' +
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/close.png' + 
	' width="100%">';

    this.buttons_.FULLSCREEN.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/fullscreen.png' + 
	' width="100%">';

    this.buttons_.WINDOWED.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/windowed.png' + 
	' width="100%">';

    this.buttons_.POPUP.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/popup.png' + 
	 ' width="100%">';


    this.buttons_.INSERTROW.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/insertrow.png' + 
	' width="100%">';

    this.buttons_.INSERTCOLUMN.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/insertcolumn.png' + 
	' width="100%">';

    /**
    this.buttons_.REMOVEROW.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/removerow.png' + 
	' width="100%">';

    this.buttons_.REMOVECOLUMN.innerHTML = '<img src=' + 
	this.imagePrefix + '/images/viewer/xiv/ui/Modal/removecolumn.png' + 
	' width="100%">';
    */
	
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
    this.ProjectTab_ = new nrg.ui.ZipTabs('RIGHT'); 
    this.ProjectTab_.render(this.getElement());
    //goog.dom.append(this.getElement(), this.ProjectTab_.getElement());

    goog.dom.classes.add(this.ProjectTab_.getElement(), 
			 xiv.ui.Modal.CSS.PROJECTTAB);
    


    //
    // Thumbnail Gallery
    //
    this.ThumbnailGallery_ = new xiv.ui.ThumbnailGallery();
    this.ThumbnailGallery_.sortThumbnailsOnInsert(true);
    this.ThumbnailGallery_.setHoverParent(this.getElement());
    this.ThumbnailGallery_.render(this.ProjectTab_.getElement())
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
    var dragHandle = this.ProjectTab_.getResizable().getHandle('RIGHT');
    goog.dom.classes.add(dragHandle, xiv.ui.Modal.CSS.PROJECTTAB_DRAGGER);
    this.ProjectTab_.getResizable().getResizeDragger('RIGHT').setOffsetX(5);

    //
    // Add dragger handle
    //
    goog.dom.append(dragHandle, goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_DraggerHandle_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.Modal.CSS.PROJECTTAB_DRAGGER_HANDLE
    }));


    // Event listener
    goog.events.listen(this.ProjectTab_, nrg.ui.Resizable.EventType.RESIZE,
		       this.updateStyle.bind(this));
    goog.events.listen(this.ProjectTab_, nrg.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
 
}



/**
 * @private
 */
xiv.ui.Modal.prototype.onViewBoxError_ = function(){
    var draggers = 
	goog.dom.getElementsByClass(
	    'xiv-ui-thumbnailgallery-thumbnail-dragging');

    goog.array.forEach(draggers, function(dragger){
	goog.dom.removeNode(dragger);
	dragger = null;
    })
    
    //this.ThumbnailGallery_.initDragDrop_();
    //this.onViewBoxesChanged_();
    this.highlightInUseThumbnails();

    //this.ThumbnailGallery_.thumbnailTargetGroup_.endDrag();
    this.ThumbnailGallery_.thumbnailDragDropGroup_.endDrag({
	dragCancelled : true
    });

}


/**
 * @private
 */
xiv.ui.Modal.prototype.initViewBoxHandler_ = function() {
    //window.console.log("INIT VIEW BOX HANDLER");
    this.ViewBoxHandler_ = new xiv.ui.ViewBoxHandler();
    this.ViewBoxHandler_.setViewBoxesParent(this.getElement());   
    this.setViewBoxHandlerEvents_();

    goog.events.listen(this.ViewBoxHandler_, 
		       xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_LOADERROR,
		       this.onViewBoxError_.bind(this))
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.onCloseButtonClicked_ = function() {
    if (this.currState_ === xiv.ui.Modal.States.FULLSCREEN){
	goog.dom.fullscreen.exitFullScreen();
    }
}



/**
 * Events for when the fullscreen button is clicked.
 *
 * @private
 */ 
xiv.ui.Modal.prototype.onFullScreenButtonClicked_ = function() {
    goog.dom.fullscreen.requestFullScreen(this.getElement().parentNode); 
    if (this.currState_ === xiv.ui.Modal.States.POPUP){
	this.setState(xiv.ui.Modal.States.FULLSCREEN_POPUP);
    }
    else {
	this.setState(xiv.ui.Modal.States.FULLSCREEN);
    }
}



/**
 * Events for when the 'windowed' button is clicked.
 *
 * @private
 */ 
xiv.ui.Modal.prototype.onWindowedButtonClicked_ = function() {
    goog.dom.fullscreen.exitFullScreen(); 
    this.setState(this.prevState_);
}


/**
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
    opt_listenMethod(this.buttons_.INSERTCOLUMN, goog.events.EventType.CLICK, 
	this.ViewBoxHandler_.insertColumn.bind(this.ViewBoxHandler_));


    /**
    opt_listenMethod(this.buttons_.REMOVEROW, goog.events.EventType.CLICK,
	this.ViewBoxHandler_.removeRow.bind(this.ViewBoxHandler_));
    opt_listenMethod(this.buttons_.REMOVECOLUMN, goog.events.EventType.CLICK, 
	this.ViewBoxHandler_.removeColumn.bind(this.ViewBoxHandler_));
    */

    opt_listenMethod(this.buttons_.CLOSE, goog.events.EventType.CLICK, 
	this.onCloseButtonClicked_.bind(this));
}



/**.
 * @private
 */
xiv.ui.Modal.prototype.adaptToState_ = function(){
    //
    // Remove previous state's CSS
    //
    if (goog.isDefAndNotNull(this.prevState_)){
    goog.dom.classes.remove(this.getElement(), 
			    goog.getCssName(this.constructor.CSS.ELEMENT, 
					    this.prevState_))
    }

    //
    // Add new state's CSS
    //
    goog.dom.classes.add(this.getElement(), 
			 goog.getCssName(this.constructor.CSS.ELEMENT, 
					 this.currState_))

    if (this.currState_ == xiv.ui.Modal.States.DEMO) {
	this.buttons_.FULLSCREEN.style.visibility = 'visible';
	this.buttons_.WINDOWED.style.visibility = 'hidden';
    } 
    else if (this.currState_ == xiv.ui.Modal.States.WINDOWED) {
	this.buttons_.FULLSCREEN.style.visibility = 'visible';
	this.buttons_.WINDOWED.style.visibility = 'hidden';
    } 

    else if (this.currState_ == xiv.ui.Modal.States.POPUP) {
	this.buttons_.POPUP.style.visibility = 'hidden';
	this.buttons_.CLOSE.style.visibility = 'hidden';
	this.buttons_.FULLSCREEN.style.visibility = 'visible';
	this.buttons_.WINDOWED.style.visibility = 'hidden';
    } 

    else if (this.currState_ == xiv.ui.Modal.States.FULLSCREEN_POPUP) {
	this.buttons_.POPUP.style.visibility = 'hidden';
	this.buttons_.FULLSCREEN.style.visibility = 'hidden';
	this.buttons_.WINDOWED.style.visibility = 'visible';
    } 

    else if (this.currState_ == xiv.ui.Modal.States.FULLSCREEN) {
	this.buttons_.POPUP.style.visibility = 'visible';
	this.buttons_.FULLSCREEN.style.visibility = 'hidden';
	this.buttons_.WINDOWED.style.visibility = 'visible';
    }

    this.updateStyle();
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
 *
 * @param {Event} e The event object. 
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailClicked_ = function(e){
    this.ViewBoxHandler_.getFirstEmpty().load(e.Thumbnail.getViewable());
}



/**
 * Callback function for the Dropped event on the thumbnail.
 *
 * @param {Event} e The event object.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailDroppedIntoViewBox_ = function(e) {
    var ViewBox =  
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
 * @param {Event=} e The event.
 * @private
 */
xiv.ui.Modal.prototype.onViewBoxesChanged_ = function(e) {
    if (goog.isDefAndNotNull(e) && goog.isDefAndNotNull(e.animate)) {
	// Fade out the new viewboxes.
	if (e.newSet) {
	    goog.array.forEach(e.newSet, function(newViewBox) {
		nrg.style.setStyle(newViewBox.getElement(), {'opacity': 0})
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

    // dims
    goog.object.clear(this.dims_);
    delete this.dims_;

    // anims_
    nrg.ui.disposeAnimations(this.anims_);
    delete this.anims_;

    // animQueue_
    nrg.ui.disposeAnimationQueue(this.animQueue_);
    delete this.animQueue_;
    
    // buttons_
    nrg.ui.disposeElementMap(this.buttons_);
    delete this.buttons_;

    // ViewBoxHandler_
    if (goog.isDefAndNotNull(this.ViewBoxHandler_)){
	goog.events.removeAll(this.ViewBoxHandler_);
	this.ViewBoxHandler_.disposeInternal();
	delete this.ViewBoxHandler_;
    }

    // Zip Tabs
    goog.events.removeAll(this.ProjectTab_);
    this.ProjectTab_.disposeInternal();
    delete this.ProjectTab_;

    // ThumbnailGallery_
    goog.events.removeAll(this.ThumbnailGallery_);
    this.ThumbnailGallery_.disposeInternal();
    delete this.ThumbnailGallery_;

    // others
    delete this.currState_
    delete this.prevState_;
}


goog.exportSymbol('xiv.ui.Modal.States', xiv.ui.Modal.States);
goog.exportSymbol('xiv.ui.Modal.ID_PREFIX', xiv.ui.Modal.ID_PREFIX);
goog.exportSymbol('xiv.ui.Modal.CSS_SUFFIX', xiv.ui.Modal.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.Modal.ButtonTypes', xiv.ui.Modal.ButtonTypes);

goog.exportSymbol('xiv.ui.Modal.prototype.getViewBoxHandler', 
		  xiv.ui.Modal.prototype.getViewBoxHandler);
goog.exportSymbol('xiv.ui.Modal.prototype.getThumbnailGallery', 
		  xiv.ui.Modal.prototype.getThumbnailGallery);
goog.exportSymbol('xiv.ui.Modal.prototype.getProjectTab', 
		  xiv.ui.Modal.prototype.getProjectTab);
goog.exportSymbol('xiv.ui.Modal.prototype.getPopupButton', 
		  xiv.ui.Modal.prototype.getPopupButton);
goog.exportSymbol('xiv.ui.Modal.prototype.getCloseButton', 
		  xiv.ui.Modal.prototype.getCloseButton);
goog.exportSymbol('xiv.ui.Modal.prototype.getFullScreenButton', 
		  xiv.ui.Modal.prototype.getFullScreenButton);
goog.exportSymbol('xiv.ui.Modal.prototype.render', 
		  xiv.ui.Modal.prototype.render);
goog.exportSymbol('xiv.ui.Modal.prototype.setState', 
		  xiv.ui.Modal.prototype.setState);
goog.exportSymbol('xiv.ui.Modal.prototype.getState', 
		  xiv.ui.Modal.prototype.getState);
goog.exportSymbol('xiv.ui.Modal.prototype.highlightInUseThumbnails', 
		  xiv.ui.Modal.prototype.highlightInUseThumbnails);
goog.exportSymbol('xiv.ui.Modal.prototype.animateModal', 
		  xiv.ui.Modal.prototype.animateModal);
goog.exportSymbol('xiv.ui.Modal.prototype.updateStyle', 
		  xiv.ui.Modal.prototype.updateStyle);
goog.exportSymbol('xiv.ui.Modal.prototype.initSubComponents', 
		  xiv.ui.Modal.prototype.initSubComponents);
goog.exportSymbol('xiv.ui.Modal.prototype.disposeInternal', 
		  xiv.ui.Modal.prototype.disposeInternal);
