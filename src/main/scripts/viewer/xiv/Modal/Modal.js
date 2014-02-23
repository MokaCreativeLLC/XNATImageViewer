/**
 * @preserve Copyright 2014 Washington University
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.dom.fullscreen');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.fx');
goog.require('goog.fx.easing');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.Resize');
goog.require('goog.events');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.convert');
goog.require('utils.fx');

// xiv
goog.require('xiv.Widget');
goog.require('xiv.ThumbnailManager');
goog.require('xiv.ViewBoxManager');




/**
 * xiv.Modal is the central class where all of the xiv.Widgets meet.
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
 * @type {!number} 
 * @const
 */
xiv.Modal.ANIM_LEN = 500;



/**
 * @type {!number} 
 * @const
 */
xiv.Modal.MAX_MODAL_W_PCT =  .90;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.MAX_MODAL_H_PCT =  .95;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.VIEWBOX_DIM_RATIO = .85;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.MIN_VIEWBOX_H =  320;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.MIN_VIEWBOX_W =  xiv.MIN_VIEWBOX_H * xiv.VIEWBOX_DIM_RATIO;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.VIEWER_VERT_MGN = 20;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.VIEWER_HORIZ_MGN = 20;



/**
 * @type {number} 
 * @const
 */
xiv.Modal.EXPANDBUTTON_W = 30;



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.ID_PREFIX =  'xiv.Modal';



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(utils.string.getLettersOnly(xiv.Modal.ID_PREFIX));



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.BLACK_BG_CLASS =  
goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'background-black');



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.COLUMNMENU_CLASS = 
goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'columnmenu');



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.ROWMENU_CLASS =  
goog.getCssName(xiv.Modal.CSS_CLASS_PREFIX, 'rowmenu');



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.COLUMNMENU_BUTTON_CLASS =  
goog.getCssName(xiv.Modal.COLUMNMENU_CLASS, 'button');



/**
 * @type {!string} 
 * @const
*/
xiv.Modal.ROWMENU_BUTTON_CLASS =  
goog.getCssName(xiv.Modal.ROWMENU_CLASS, 'button');


    
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
 * @type {Object.<string, Element>}
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
 * @type {string}
 * @private
 */
xiv.Modal.prototype.previousMode_;



/**
 * @type {string}
 * @private
 */	
xiv.Modal.prototype.iconUrl_;



/**
 * @const
 * @type {!Array.string}
 * @private
 */
xiv.Modal.hideableButtonKeys_ = ['popup', 'close'];



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



/**
 * Get the associated modal for this object.
 * @return {Element} The modal element of the Modal.js object.
 * @public
 */
xiv.Modal.prototype.getModalElement = function() {
  return this.modal_;
};


 
/**
 * Get the associated xiv.ViewBoxManager for this object.
 * @return {xiv.ViewBoxManager} The xiv.ViewBoxManager for this object.
 * @public
 */
xiv.Modal.prototype.getViewBoxManager =  function() {
  return this.ViewBoxManager_;
}



/**
 * Get the associated xiv.ThumbnailManager for this object.
 * @return {xiv.ThumbnailManager} The xiv.ThumbnailManager for this object.
 * @public
 */
xiv.Modal.prototype.getThumbnailManager = function() {
  return this.ThumbnailManager_;
}



/**
 * As stated.
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
 * As stated.
 * @param {!string} The iconUrl to set.
 * @public
 */
xiv.Modal.prototype.setIconUrl = function(iconUrl) {
    this.iconUrl_ = iconUrl;
}



/**
 * As stated.
 * @return {!string} The iconUrl to set.
 * @public
 */
xiv.Modal.prototype.getIconUrl = function(iconUrl) {
    return this.iconUrl_;
}




/**
 * As stated.
 * @param {!string} mode The mode to test
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
 * As stated.
 * @return {!Object} The button object.
 * @public
 */
xiv.Modal.prototype.getMode = function() {
  return this.mode_;
}



/**
 * Highlights all thumbnails that are being viewed a xiv.ViewBox.
 * @public
 */
xiv.Modal.prototype.highlightInUseThumbnails = function () {
    window.console.log("HIGHTLIGHT IN USE THUMBNAILS!");
 
    // Unhighlight all thumbnails.
    this.ThumbnailManager_.loop(function(Thumbnail){  
	Thumbnail.setActive(false);
    })

    // Highight only in use thumbnails by looping through the xiv.ViewBoxes.
    this.ViewBoxManager_.loop(function(ViewBox){  
	ViewBox.Thumbnail && ViewBox.Thumbnail.setActive(true);
    })
}



/**
 * Used when a row or column is inserted.  The modal animates itself
 * on its resize.
 * @param {function=} opt_callback The callback for AFTER the modal is animated.
 * @public
 */
xiv.Modal.prototype.animateModal  = function (opt_callback) {

    var modalDims = /**@type {!Object}*/ this.getCalculatedModalDims_();
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/ 
    new goog.fx.AnimationParallelQueue();
    
    // Set-up
    this.addModalAnims_(modalDims);
    this.addViewBoxAnims_(modalDims);
    this.highlightInUseThumbnails();
	
    // Events
    goog.events.listen(modalResize, 'animate', 
		       this.onModalAnimationAnimate_.bind(this))
    goog.events.listen(animQueue, 'end', function(){
	this.onModalAnimationEnd_.bind(this)
	if (opt_callback) { opt_callback() };
    })

    // Play
    animQueue.play();
}



/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.onModalAnimationAnimate_ = function() {
    this.ViewBoxManager_.loop( function(ViewBox) { 
	ViewBox.updateStyle();
    })
}



/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.onModalAnimationEnd_ = function() {
    
    // Update style.
    this.updateStyle();

    // Fade in new viewers.
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	if (ViewBox.getElement().style.opacity == 0) {
	    utils.fx.fadeIn(ViewBox.getElement(), xiv.Modal.ANIM_LEN);
	}
    })
}




/**
 * As stated.
 * @param {!Object} modalDims The modal dims to derive the animations from.
 * @param {!goog.fx.AnimationParallelQueue} animQueue The animation queue to 
 *     add the animations to.
 * @private
 */
xiv.Modal.prototype.addModalAnims_ = function (modalDims, animQueue) {
    animQueue.add(new goog.fx.dom.Resize(
	this.modal_, [this.modal_.offsetWidth, this.modal_.offsetHeight], 
	[modalDims.width, modalDims.height], xiv.Modal.ANIM_LEN, 
	goog.fx.easing.easeOut));

    animQueue.add(new goog.fx.dom.Slide(
	this.modal_, [this.modal_.offsetLeft, this.modal_.offsetTop], 
	[modalDims.left, modalDims.top], 
	xiv.Modal.ANIM_LEN, goog.fx.easing.easeOut));
}




/**
 * As stated.
 * @param {!Object} modalDims The modal dims to derive the animations from.
 * @param {!goog.fx.AnimationParallelQueue} animQueue The animation queue to 
 *     add the animations to.
 * @private
 */
xiv.Modal.prototype.addViewBoxAnims_ = function (modalDims, animQueue) {

    var elt = /** @type {Element} */ null; 
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 

	elt = ViewBox.getElement();
	animQueue.add(new goog.fx.dom.Resize(
	    elt, [elt.offsetWidth, elt.offsetHeight], 
	    [modalDims.ViewBox.width, modalDims.ViewBox.height], 
	    xiv.Modal.ANIM_LEN, goog.fx.easing.easeOut));

	animQueue.add(new goog.fx.dom.Slide(
	    elt, [elt.offsetLeft, elt.offsetTop], 
	    [modalDims.ViewBox.lefts[i][j], modalDims.ViewBox.tops[i][j]], 
	    xiv.Modal.ANIM_LEN, goog.fx.easing.easeOut));	
    })
}




/**
 * Calculates the xiv.Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 * @private
 */
xiv.Modal.prototype.calculateInlineModalDims_ = function () {
    this._dims = /**@dict*/ {};
    this.deriveStartingParams_();
    this.deriveMinModalWidth_();
    this.deriveViewBoxHeightsAndWidths_();
    this.derivePeliminaryHeightAndWidth_();
    this.deriveFinalHeightsAndWidths_();
    this.derivePositions_();
    this.getViewBoxHeightsAndWidths_();   
}



/**
 * @private
 */ 
xiv.Modal.prototype.deriveStartingParams_ = function() {
    this._dims['max'] = {};
    this._dims['min'] = {};
    this._dims['ViewBox'] = {};
    this._dims['prelims'] = {};
    this._dims['ThumbnailGallery'] = {};

    this._dims['height'] = xiv.Modal.MAX_MODAL_H_PCT * window.innerHeight;
    this._dims['max']['width'] = Math.round(window.innerWidth * 
					 xiv.Modal.MAX_MODAL_H_PCT);	
    this._dims['ViewBox']['cols'] = this.ViewBoxManager_.totalColumns();
    this._dims['ViewBox']['rows'] = this.ViewBoxManager_.totalRows();
    this._dims['ThumbnailGallery']['width'] = utils.style.dims(
	this.ThumbnailManager_.getThumbnailGallery().getElement(), 'width')
}



/**
 * @private
 */ 
xiv.Modal.prototype.deriveMinModalWidth_ = function() {
    // Determine the minimum modal width
    this._dims['min']['width'] =  this._dims['ThumbnailGallery']['width']; 
    this._dims['min']['width'] += xiv.Modal.MIN_VIEWBOX_W * 
	this._dims['ViewBox']['cols']; 
    this._dims['min']['width'] += xiv.Modal.VIEWBOX_VERT_MGN * 
	this._dims['ViewBox']['cols']; 
    this._dims['min']['width'] += xiv.Modal.EXPANDBUTTON_W;
}



/**
 * @private
 */ 
xiv.Modal.prototype.derivePeliminaryHeightAndWidth_ = function() {
    this._dims['prelims']['width'] = this._dims['ThumbnailGallery']['width']; 
    this._dims['prelims']['width'] += this._dims['ViewBox']['width']  * 
	this._dims['ViewBox']['cols']; 
    this._dims['prelims']['width'] += xiv.Modal.VIEWBOX_VERT_MGN * 
	ViewBoxColumns + xiv.Modal.EXPANDBUTTON_W;

    this._dims['width'] = this._dims['prelims']['width'];
}



/**
 * @private
 */ 
xiv.Modal.prototype.deriveViewBoxHeightsAndWidths_ = function() {
    // Determine the the modal width based on prescribed proportions
    this._dims['ViewBox']['height'] = (this._dims['height'] - 
				  ((this._dims['ViewBox']['rows'] + 1) * 
		    xiv.Modal.EXPANDBUTTON_W)) / this._dims['ViewBox']['rows'];
    this._dims['ViewBox']['width'] = xiv.Modal.VIEWBOX_DIM_RATIO * 
	this._dims['ViewBox']['height'];
}



/**
 * @private
 */ 
xiv.Modal.prototype.deriveFinalHeightsAndWidths_ = function (modalDims) {

    // If the modal is too wide, scale it down
    if (this._dims['width'] > this._dims['max']['width']) {
	
	this._dims['ViewBox']['width'] = (
	    this._dims['max']['width'] - 
		this._dims['ThumbnailGallery']['width'] - 
		xiv.Modal.EXPANDBUTTON_W) / this._dims['ViewBox']['cols']; 

	this._dims['ViewBox']['width'] -= xiv.Modal.VIEWBOX_VERT_MGN;
	this._dims['ViewBox']['height'] = 
	    this._dims['ViewBox']['width'] / xiv.Modal.VIEWBOX_DIM_RATIO;

	this._dims['width'] = this._dims['max']['width'];
	this._dims['height'] = this._dims['ViewBox']['height'] * 
				    this._dims['ViewBox']['rows'];
        this._dims['height'] += xiv.Modal.VIEWBOX_VERT_MGN  * 
				     this._dims['ViewBox']['rows'] - 1); 
	this._dims['height'] += xiv.Modal.EXPANDBUTTON_W * 2;

    }
    //utils.dom.debug("height: ", height);
    this._dims['ThumbnailGallery']['height'] = this._dims['height'] - 40;
}



/**
 * @private
 */ 
xiv.Modal.prototype.derivePositions_ = function () {
    this._dims['left'] = (window.innerWidth - this._dims['width'])/2 ;
    this._dims['top'] = (window.innerHeight - this._dims['height'])/2;
}
    


/**
 * @private
 */ 
xiv.Modal.prototype.getViewBoxPositions_ = function () {
    this._dims['ViewBox'] = {};    
    this._dims['ViewBox']['left'] = [];
    this._dims['ViewBox']['top'] = [];


    this._dims['ViewBox']['start'] = this._dims['ThumbnailGallery']['width'] + 
	xiv.Modal.VIEWBOX_VERT_MGN;

    var l = /**@type {!number}*/ 0;
    this.ViewBoxManager_.loop(function(ViewBox, i, j) { 
	
	l = this._dims['ViewBox']['start'] + j * (
	    this._dims['ViewBox']['width'] + xiv.Modal.VIEWBOX_VERT_MGN);
	if (j==0 || !this._dims['ViewBox']['left'][i]) {
	    this._dims['ViewBox']['left'].push([])
	}
	
	this._dims['ViewBox']['left'][i][j] = l;
	if (j==0 || !this._dims['ViewBox']['top'][i]) {
	    this._dims['ViewBox']['top'].push([]);
	}
	
	this._dims['ViewBox']['top'][i][j] = (-1 + i * 
					   (this._dims['ViewBox']['height'] + 
				       xiv.Modal.VIEWBOX_HORIZ_MGN));

	this._dims['ViewBox']['top'][i][j] +=  xiv.Modal.EXPANDBUTTON_W;	
    }.bind(this))
}



/**
 * Method for updating the style of the '_modal' element
 * due to window resizing, or any event that requires the 
 * xiv.Modal element change its dimensions.
 * @param {Object.<string, string | number>=}
 * @public
 */
xiv.Modal.prototype.updateStyle = function () {	
    this.calculateInlineModalDims_();
    utils.style.setStyle(this.modal_, this._dims);
    this.updateStyle_ThumbnailGallery_();
    this.updateStyle_ViewBoxes_();
    this.highlightInUseThumbnails();
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.Modal.prototype.updateStyle_ThumbnailGallery_ = function(){
    // xiv.ViewBoxes	
    if (this.ThumbnailGallery_) {
	utils.style.setStyle(
	    this.ThumbnailManager_.getThumbnailGallery().getElement(), {
	    'height': this._dims['ThumbnailGallery']['height']
	})	
    }
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.Modal.prototype.updateStyle_ViewBoxes_ = function(){
    // xiv.ViewBoxes	
    if (this.ViewBoxManager_) {
	this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	    utils.style.setStyle(ViewBox.getElement(), {
		'height': this._dims['ViewBox']['height'],
		'width': this._dims['ViewBox']['width'],
		'left': this._dims['ViewBox']['left'][i][j],
		'top': this._dims['ViewBox']['top'][i][j]
	    })	
	    this.ViewBoxManager_.updateDragDropHandles();
	}.bind(this)); 		
    }	
}



/**
 * Sets the icon url to derive the images from.
 * @param {!string} opt_iconUrl The url to derive the icon images from.
 * @private
 */
xiv.Modal.prototype.setIconUrl_ = function(opt_iconUrl) {
    if (opt_iconUrl && goog.isString(opt_iconUrl)){
	this.iconUrl_ = goog.string.path.join(opt_iconUrl, 
			xiv.Modal.ID_PREFIX.replace('.','/'));
    }
}



/**
 * Creates The compenents of the modal.
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
 * Creates the background of the modal.
 * @private
 */
xiv.Modal.prototype.createBackground_ = function() {
    this.background_ = utils.dom.createUniqueDom('div', 'xiv.Modal.Background');
    goog.dom.append(this.getElement(), this.background_);
}



/**
 * Creates the modal's buttons.
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
 * As stated.
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
 * As stated.
 * @private
 */
xiv.Modal.prototype.createViewBoxManager_ = function() {
    this.ViewBoxManager_ = new xiv.ViewBoxManager();
    this.ViewBoxManager_.setViewBoxesParent(this.getElement());   
    this.setViewBoxManagerCallbacks_();
    this.ViewBoxManager_.insertColumn(false);
}



/**
 * Events for when the fullscreen button is clicked.
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
 * Events for when the 'windowed' button is clicked.
 * @private
 */ 
xiv.Modal.prototype.onWindowedButtonClicked_ = function() {
    goog.dom.fullscreen.exitFullScreen(); 
    this.setMode(this.previousMode_);
    this.buttons_['fullScreen'].style.visibility = 'visible';
    this.buttons_['windowed'].style.visibility = 'hidden';
}



/**
 * As stated.
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
 * As stated.
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
 * As stated.
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
    var buttons = /**@type {!Object.<string, Element>}*/
    utils.dom.createBasicHoverButtonSet(updatedKeys, iconUrl);
    for (key in keyMap){
	buttonsWithOriginalKeys[key] = buttons[keyMap[key]];
    }
    return buttonsWithOriginalKeys
}



/**
 * Sets callbacks for the following events: MOUSEOVER, MOUSEOUT, 
 * THUMBNAILDROP, THUMBNAILCLICK
 * @private
 */
xiv.Modal.prototype.setThumbnailManagerCallbacks_ = function(){
    this.ThumbnailManager_['EVENTS'].onEvent('MOUSEOVER', 
					 this.onThumbnailMouseover_.bind(this));
    this.ThumbnailManager_['EVENTS'].onEvent('MOUSEOUT',  
					 this.onThumbnailMouseout_.bind(this));
    this.ThumbnailManager_['EVENTS'].onEvent('THUMBNAILDROP', 
			this.onThumbnailDropped_.bind(this)); 
    this.ThumbnailManager_['EVENTS'].onEvent('THUMBNAILCLICK', 
			this.onThumbnailClicked_.bind(this));
}



/**
 * Callback function for the MOUSEOVER event on the hovered thumbnail.
 * @param {xiv.Thumbnail} Thumbnail The xiv.Thumbnail that fired the event.
 * @private
 */
xiv.Modal.prototype.onThumbnailMouseover_ = function(Thumbnail) {
    this.ViewBoxManager_.loop(function(ViewBox){
	if (ViewBox.getThumbnail() === Thumbnail){
	    ViewBox.getElement().style.borderColor = 'white';
	}
    })	
}



/**
 * Callback function for the MOUSEOUT event on the hovered thumbnail.
 * @param {xiv.Thumbnail} Thumbnail The xiv.Thumbnail that fired the event.
 * @private
 */
xiv.Modal.prototype.onThumbnailMouseout_ = function(Thumbnail){
    this.ViewBoxManager_.loop(function(ViewBox){
	if (ViewBox.getThumbnail() === Thumbnail && 
	    ViewBox.getLoadState() !== 'loading'){
	    ViewBox.getElement().style.borderColor = 
		ViewBox.getElement().getAttribute(
		    xiv.ThumbnailManager.ORIGINAL_BORDER_ATTR);	
	}
    })
}



/**
 * Callback function for the CLICKED event on the hovered thumbnail.
 * @param {xiv.Thumbnail} Thumbnail The xiv.Thumbnail that fired the event.
 * @private
 */
xiv.Modal.prototype.onThumbnailClicked_ = function(Thumbnail){
    this.ViewBoxManager_.getFirstEmpty().loadThumbnail(Thumbnail);
}



/**
 * Callback function for the Dropped event on the hovered thumbnail.
 * @param {!Element} viewBoxElement The view box element.
 * @param {!Element} thumbnailElement The thumbnail element that was dropped.
 * @private
 */
xiv.Modal.prototype.onThumbnailDropped_ = 
function(viewBoxElement, thumbnailElement) {
    var _ViewBox = /**@type {!xiv.ViewBox}*/
    this.ViewBoxManager_.getViewBoxByElement(viewBoxElement);
    var _Thumb = /**@type {!xiv.Thumbnail}*/
	this.ThumbnailManager_.getThumbnailByElement(thumbnailElement);
    _ViewBox.loadThumbnail(_Thumb);
}



/**
 * As stated.
 * @private
 */
xiv.Modal.prototype.setViewBoxManagerCallbacks_ = function(){

    this.ViewBoxManager_['EVENTS'].onEvent('THUMBNAIL_PRELOAD', 
					 this.onThumbnailPreload_.bind(this))
    this.ViewBoxManager_['EVENTS'].onEvent('THUMBNAIL_LOADED', 
					 this.onThumbnailLoaded_.bind(this))
    this.ViewBoxManager_['EVENTS'].onEvent('VIEWBOXES_CHANGED', 
					 this.onViewBoxesChanged_.bind(this))
}



/**
 * Callback function for the PRELOAD event on the hovered ViewBox.
 * @param {xiv.ViewBox} ViewBox The xiv.ViewBox that fired the event.
 * @private
 */
xiv.Modal.prototype.onThumbnailPreload_ = function(ViewBox){ 
    ViewBox.getElement().style.borderColor = 'white';
    this.highlightInUseThumbnails();
}



/**
 * Callback function for the LOADED event on the hovered ViewBox.
 * @param {xiv.ViewBox} ViewBox The xiv.ViewBox that fired the event.
 * @private
 */
xiv.Modal.prototype.onThumbnailLoaded_ = function(ViewBox){
    ViewBox.getElement().style.borderColor = 
	ViewBox.getElement().getAttribute(
	    xiv.ThumbnailManager.ORIGINAL_BORDER_ATTR);
    this.highlightInUseThumbnails();
}



/**
 * Callback function for the LOADED event on the hovered ViewBox.
 * @param {Array.<xiv.ViewBox>} newViewBoxSet The ViewBoxes that have been
 *     changed.
 * @param {boolean=} opt_animage Whether to animate the change (defaults to 
 *     true).
 * @private
 */
xiv.Modal.prototype.onViewBoxesChanged_ = function(newViewBoxSet, opt_animate) {
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
}









