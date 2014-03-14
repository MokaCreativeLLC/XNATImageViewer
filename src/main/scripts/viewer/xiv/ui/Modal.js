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
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.convert');
goog.require('moka.fx');

// xiv
goog.require('xiv.ui.ThumbnailManager');
goog.require('xiv.ui.ViewBoxManager');




/**
 * xiv.ui.Modal is the central class where all of the moka.ui.Components meet.
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.Modal');
xiv.ui.Modal = function () {
    goog.base(this);   
    this.createSubComponents();
    this.adjustStyleToMode_();
    if(this.getViewBoxManager()){
	this.getViewBoxManager().insertColumn(false);
    }
}
goog.inherits(xiv.ui.Modal, moka.ui.Component);
goog.exportSymbol('xiv.ui.Modal', xiv.ui.Modal);



/**
 * public
 * @const
 */
xiv.ui.Modal.MODES = [
    'fullScreen',
    'popup',
    'windowed'
]



/**
 * @type {!number} 
 * @const
 */
xiv.ui.Modal.ANIM_LEN = 500;



/**
 * @type {!number} 
 * @const
 */
xiv.ui.Modal.MAX_MODAL_W_PCT =  .90;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.MAX_MODAL_H_PCT =  .90;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.VIEWBOX_DIM_RATIO = .85;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.MIN_VIEWBOX_H =  320;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.MIN_VIEWBOX_W =  xiv.ui.Modal.MIN_VIEWBOX_H * 
    xiv.ui.Modal.VIEWBOX_DIM_RATIO;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.VIEWBOX_VERT_MGN = 20;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.VIEWBOX_HORIZ_MGN = 20;



/**
 * @type {number} 
 * @const
 */
xiv.ui.Modal.EXPANDBUTTON_W = 30;



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Modal.ID_PREFIX =  'xiv.ui.Modal';



/**
 * @type {!string} 
 * @const
 */
xiv.ui.Modal.CSS_CLASS_PREFIX =
    goog.string.toSelectorCase(xiv.ui.Modal.ID_PREFIX.toLowerCase().
			       replace(/\./g,'-'));



/**
 * @type {!string} 
 * @const
 */
xiv.ui.Modal.BLACK_BG_CLASS =  
goog.getCssName(xiv.ui.Modal.CSS_CLASS_PREFIX, 'background-black');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.Modal.COLUMNMENU_CLASS = 
goog.getCssName(xiv.ui.Modal.CSS_CLASS_PREFIX, 'columnmenu');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.Modal.ROWMENU_CLASS =  
goog.getCssName(xiv.ui.Modal.CSS_CLASS_PREFIX, 'rowmenu');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.Modal.COLUMNMENU_BUTTON_CLASS =  
goog.getCssName(xiv.ui.Modal.COLUMNMENU_CLASS, 'button');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.Modal.ROWMENU_BUTTON_CLASS =  
goog.getCssName(xiv.ui.Modal.ROWMENU_CLASS, 'button');



/**
 * @type {Element}
 * @private
 */	
xiv.ui.Modal.prototype.background_;



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.Modal.prototype.buttons_;



/**
 * @type {xiv.ui.ThumbnailManager}
 * @private
 */
xiv.ui.Modal.prototype.ThumbnailManager_;



/**
 * @type {xiv.ui.ViewBoxManager}
 * @private
 */
xiv.ui.Modal.prototype.ViewBoxManager_;



/**
 * @const
 * @type {!string}
 * @private
 */
xiv.ui.Modal.prototype.mode_ = 'windowed';



/**
 * @cost
 * @type {string}
 * @private
 */
xiv.ui.Modal.prototype.previousMode_;



/**
 * @const
 * @type {!Array.string}
 * @private
 */
xiv.ui.Modal.hideableButtonKeys_ = ['popup', 'close'];



/**
 * @const
 * @dict
 */
xiv.ui.Modal.buttonTypes = {
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
 * Get the associated xiv.ui.ViewBoxManager for this object.
 * @return {xiv.ui.ViewBoxManager} The xiv.ui.ViewBoxManager for this object.
 * @public
 */
xiv.ui.Modal.prototype.getViewBoxManager =  function() {
  return this.ViewBoxManager_;
}



/**
 * Get the associated xiv.ui.ThumbnailManager for this object.
 * @return {xiv.ui.ThumbnailManager} The xiv.ui.ThumbnailManager for this object.
 * @public
 */
xiv.ui.Modal.prototype.getThumbnailManager = function() {
  return this.ThumbnailManager_;
}



/**
 * As stated.
 * @return {!Object} The button object.
 * @public
 */
xiv.ui.Modal.prototype.getButtons = function() {
  return this.buttons_;
}


/**
 * As stated.
 * @param {!string} mode The mode to test
 * @public
 */
xiv.ui.Modal.prototype.setMode = function(mode) {
    if (!mode || xiv.ui.Modal.MODES.indexOf(mode) === -1){
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
    //window.console.log("HIGHTLIGHT IN USE THUMBNAILS!");
 
    // Unhighlight all thumbnails.
    this.ThumbnailManager_.loop(function(Thumbnail){  
	Thumbnail.setActive(false);
    })

    // Highight only in use thumbnails by looping through the xiv.ui.ViewBoxes.
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
xiv.ui.Modal.prototype.animateModal  = function (opt_callback) {

    this.calculateInlineModalDims_();

    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/ 
    new goog.fx.AnimationParallelQueue();
    
    // Set-up
    this.addModalAnims_(this._dims, animQueue);
    this.addViewBoxAnims_(this._dims, animQueue);
    this.highlightInUseThumbnails();
	

    goog.events.listen(animQueue, 'end', function(){
	this.onModalAnimationEnd_();
	if (opt_callback) { opt_callback() };
    }.bind(this))

    // Play
    animQueue.play();
    this.fadeInHiddenViewers_();
}



/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.updateIconSrcFolder = function() {
    goog.object.forEach(this.buttons_, function(button, key){
	goog.dom.removeChildren(button)
	moka.dom.createDivChildImage(button, 
			goog.string.path.join(this.iconUrl, 
				goog.string.toSelectorCase(key) + '.png'));
    }.bind(this))
    if (this.ViewBoxManager_){
	this.ViewBoxManager_.setIconBaseUrl(this.iconBaseUrl);
    }
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationAnimate_ = function() {
    this.ViewBoxManager_.loop( function(ViewBox) { 
	ViewBox.updateStyle();
    })
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.onModalAnimationEnd_ = function() {
    // Update style.
    this.updateStyle();
    this.fadeInHiddenViewers_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.fadeInHiddenViewers_ = function() {
    // Fade in new viewers.
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	//window.console.log(ViewBox.getElement().style.opacity);
	if (ViewBox.getElement().style.opacity == 0) {
	    moka.fx.fadeIn(ViewBox.getElement(), xiv.ui.Modal.ANIM_LEN);
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
xiv.ui.Modal.prototype.addModalAnims_ = function (modalDims, animQueue) {

    var modalResize = /**@type {!goog.fx.dom.Resize}*/ new goog.fx.dom.Resize(
	this.getElement(), [this.getElement().offsetWidth, 
			    this.getElement().offsetHeight], 
	[modalDims['width'], modalDims['height']], xiv.ui.Modal.ANIM_LEN, 
	goog.fx.easing.easeOut);
    animQueue.add(modalResize);


    // Events
    goog.events.listen(modalResize, 'animate', 
		       this.onModalAnimationAnimate_.bind(this))


    animQueue.add(new goog.fx.dom.Slide(
	this.getElement(), [this.getElement().offsetLeft, 
			    this.getElement().offsetTop], 
	[modalDims['left'], modalDims['top']], 
	xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));
}




/**
 * As stated.
 * @param {!Object} modalDims The modal dims to derive the animations from.
 * @param {!goog.fx.AnimationParallelQueue} animQueue The animation queue to 
 *     add the animations to.
 * @private
 */
xiv.ui.Modal.prototype.addViewBoxAnims_ = function (modalDims, animQueue) {

    var elt = /** @type {Element} */ null; 
    this.ViewBoxManager_.loop( function(ViewBox, i, j) { 

	elt = ViewBox.getElement();
	animQueue.add(new goog.fx.dom.Resize(
	    elt, [elt.offsetWidth, elt.offsetHeight], 
	    [modalDims['ViewBox']['width'], modalDims['ViewBox']['height']], 
	    xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));

	animQueue.add(new goog.fx.dom.Slide(
	    elt, [elt.offsetLeft, elt.offsetTop], 
	    [modalDims['ViewBox']['left'][i][j], 
	     modalDims['ViewBox']['top'][i][j]], 
	    xiv.ui.Modal.ANIM_LEN, goog.fx.easing.easeOut));	
    })
}




/**
 * Calculates the xiv.ui.Modal's dimensions based on pixel values.
 * Translates the dimenions to the other widget dimenions.  This is primarily
 * for resize purposes or row / column insertion and removal.
 * @private
 */
xiv.ui.Modal.prototype.calculateInlineModalDims_ = function () {
    this._dims = /**@dict*/ {};
    this.setStartingDimensionParams_();
    this.deriveViewBoxDims_();
    this.derivePelimModalDims_();
    this.deriveAllFinalDims_();
    this.deriveViewBoxPositions_();
    this.deriveModalPosition_();
    this.deriveButtonPositions_();
}



/**
 * @private
 */ 
xiv.ui.Modal.prototype.setStartingDimensionParams_ = function() {

    this._dims['height'] = xiv.ui.Modal.MAX_MODAL_H_PCT * window.innerHeight;

    this._dims['max'] = {};
    this._dims['max']['width'] = Math.round(window.innerWidth * 
					 xiv.ui.Modal.MAX_MODAL_H_PCT);
    this._dims['ViewBox'] = {};	
    this._dims['ViewBox']['cols'] = this.ViewBoxManager_.columnCount();
    this._dims['ViewBox']['rows'] = this.ViewBoxManager_.rowCount();

    this._dims['ThumbnailGallery'] = {};
    this._dims['ThumbnailGallery']['width'] = 
	parseInt(moka.style.getComputedStyle(
	this.ThumbnailManager_.getThumbnailGallery().getElement(), 'width'),
	10);

    window.console.log('THUMB', this._dims['ThumbnailGallery']['width'],
		      goog.style.getSize(this.ThumbnailManager_.getThumbnailGallery().getElement()));
    //window.console.log("WIDTH", this._dims['ThumbnailGallery']['width']);
    //window.console.log('PRELIM CALC',
	//this.ThumbnailManager_.getThumbnailGallery().getElement(),
	//this._dims['ViewBox'],
	//this._dims['ThumbnailGallery']['width'])
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.deriveViewBoxDims_ = function() {
    // Determine the the modal width based on prescribed proportions
    this._dims['ViewBox']['height'] = 
	(this._dims['height'] - ((this._dims['ViewBox']['rows'] + 1) * 
		  xiv.ui.Modal.EXPANDBUTTON_W)) / this._dims['ViewBox']['rows'];
    this._dims['ViewBox']['width'] = xiv.ui.Modal.VIEWBOX_DIM_RATIO * 
	this._dims['ViewBox']['height'];
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.derivePelimModalDims_ = function() {
    this._dims['width'] = this._dims['ThumbnailGallery']['width']; 
    window.console.log(this._dims['width']);

    this._dims['width'] += this._dims['ViewBox']['width']  * 
	this._dims['ViewBox']['cols']; 

    window.console.log(this._dims['width']);

    this._dims['width'] += xiv.ui.Modal.VIEWBOX_VERT_MGN * 
	this._dims['ViewBox']['cols'] + xiv.ui.Modal.EXPANDBUTTON_W;

    window.console.log(this._dims['width']);
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.deriveAllFinalDims_ = function (modalDims) {

    // If the modal is too wide, scale it down
    if (this._dims['width'] > this._dims['max']['width']) {
	
	this._dims['ViewBox']['width'] = (
	    this._dims['max']['width'] - 
		this._dims['ThumbnailGallery']['width'] - 
		xiv.ui.Modal.EXPANDBUTTON_W) / this._dims['ViewBox']['cols']; 

	this._dims['ViewBox']['width'] -= xiv.ui.Modal.VIEWBOX_VERT_MGN;


	this._dims['ViewBox']['height'] = 
	    this._dims['ViewBox']['width'] / xiv.ui.Modal.VIEWBOX_DIM_RATIO;

	this._dims['width'] = this._dims['max']['width'];


	this._dims['height'] = this._dims['ViewBox']['height'] * 
				    this._dims['ViewBox']['rows'];
        this._dims['height'] += xiv.ui.Modal.VIEWBOX_VERT_MGN  * 
				     (this._dims['ViewBox']['rows'] - 1); 
	this._dims['height'] += xiv.ui.Modal.EXPANDBUTTON_W * 2;

    }
    //moka.dom.debug("height: ", height);
    this._dims['ThumbnailGallery']['height'] = this._dims['height'] - 60;
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.deriveModalPosition_ = function () {
    this._dims['left'] = (window.innerWidth - this._dims['width'])/2 ;
    this._dims['top'] = (window.innerHeight - this._dims['height'])/2;
}
    

/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.deriveButtonPositions_ = function () {
    var tWidth = /**@type {!number}*/
    this._dims['ViewBox']['left'][0][0] + 
    (this._dims['ViewBox']['left'][0][this._dims['ViewBox']['cols']-1] + 
	this._dims['ViewBox']['width'] - 
    this._dims['ViewBox']['left'][0][0])/2 
    - 4;

    this._dims['buttons'] = {
	'insertRow' : {},
	'removeRow' : {}
    };
    this._dims['buttons']['insertRow']['left'] = tWidth -2;
    this._dims['buttons']['removeRow']['left'] = tWidth + 2;
}



/**
 * As stated.
 * @private
 */ 
xiv.ui.Modal.prototype.deriveViewBoxPositions_ = function () {
  
    this._dims['ViewBox']['left'] = [];
    this._dims['ViewBox']['top'] = [];


    this._dims['ViewBox']['start'] = this._dims['ThumbnailGallery']['width'] + 
	xiv.ui.Modal.VIEWBOX_VERT_MGN;

    var l = /**@type {!number}*/ 0;
    this.ViewBoxManager_.loop(function(ViewBox, i, j) { 
	
	l = this._dims['ViewBox']['start'] + j * (
	    this._dims['ViewBox']['width'] + xiv.ui.Modal.VIEWBOX_VERT_MGN);

	//window.console.log("LEFT", l);
	//window.console.log(this._dims['ViewBox']['start'] , j , 
	//this._dims['ViewBox']['width'] , xiv.ui.Modal.VIEWBOX_VERT_MGN);

	if (j==0 || !this._dims['ViewBox']['left'][i]) {
	    this._dims['ViewBox']['left'].push([])
	}
	
	this._dims['ViewBox']['left'][i][j] = l;
	if (j==0 || !this._dims['ViewBox']['top'][i]) {
	    this._dims['ViewBox']['top'].push([]);
	}
	
	this._dims['ViewBox']['top'][i][j] = (-1 + i * 
					   (this._dims['ViewBox']['height'] + 
				       xiv.ui.Modal.VIEWBOX_HORIZ_MGN));

	this._dims['ViewBox']['top'][i][j] +=  xiv.ui.Modal.EXPANDBUTTON_W;	
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
    this.calculateInlineModalDims_();
    //window.console.log("DIMS", this._dims);
    moka.style.setStyle(this.getElement(), this._dims);
    this.updateStyle_ThumbnailGallery_();
    this.updateStyle_ViewBoxes_();
    window.console.log("DIMS", this._dims);
    this.updateStyle_buttons_();
    this.highlightInUseThumbnails();
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_ThumbnailGallery_ = function(){
    // xiv.ui.ViewBoxes	
    if (this.ThumbnailManager_) {
	moka.style.setStyle(
	    this.ThumbnailManager_.getThumbnailGallery().getElement(), {
	    'height': this._dims['ViewBox']['height']
	})	
    }
}



/**
 * Updates the ViewBoxes's style.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_ViewBoxes_ = function(){
    // xiv.ui.ViewBoxes	
    if (this.ViewBoxManager_) {
	this.ViewBoxManager_.loop( function(ViewBox, i, j) { 
	    moka.style.setStyle(ViewBox.getElement(), {
		'height': this._dims['ViewBox']['height'],
		'width': this._dims['ViewBox']['width'],
		'left': this._dims['ViewBox']['left'][i][j],
		'top': this._dims['ViewBox']['top'][i][j]
	    })	
	    this.ViewBoxManager_.updateDragDropHandles();
	    ViewBox.updateStyle();
	}.bind(this)); 		
    }	
}


/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.updateStyle_buttons_ = function(){
    moka.style.setStyle(this.buttons_['insertRow'], {
	'left': this._dims['buttons']['insertRow']['left']
    })
    moka.style.setStyle(this.buttons_['removeRow'], { 
	'left': this._dims['buttons']['removeRow']['left']
    })
}


/**
 * @inheritDoc
 */
xiv.ui.Modal.prototype.createSubComponents = function() {
    this.createBackground_();
    this.createButtons_();
    this.createThumbnailManager_();
    this.createViewBoxManager_();
}



/**
 * Creates the background of the modal.
 * @private
 */
xiv.ui.Modal.prototype.createBackground_ = function() {
    this.background_ = /**@type {!Element}*/
    moka.dom.createUniqueDom('div', 
			      this.constructor.ID_PREFIX + '.Background');

    window.console.log("ELEMENT", this.getElement());
    goog.dom.append(this.getElement(), this.background_);
}



/**
 * Creates the modal's buttons.
 * @private
 */
xiv.ui.Modal.prototype.createButtons_ = function() {
    this.buttons_ = xiv.ui.Modal.generateButtons_(this.iconUrl);
    goog.object.forEach(this.buttons_, function(button, key){
	goog.dom.append(this.getElement(), button);
    }.bind(this))
    this.setFullScreenButtonCallbacks_();
    this.setRowColumnInsertRemoveCallbacks_();
}




/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.createThumbnailManager_ = function() {
    this.ThumbnailManager_ = new xiv.ui.ThumbnailManager();
    this.ThumbnailManager_.setHoverParent(this.getElement());
    goog.dom.append(this.getElement(), 
		    this.ThumbnailManager_.getThumbnailGallery().getElement());

    this.setThumbnailManagerCallbacks_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.createViewBoxManager_ = function() {
    this.ViewBoxManager_ = new xiv.ui.ViewBoxManager();
    this.ViewBoxManager_.setViewBoxesParent(this.getElement());   
    this.setViewBoxManagerCallbacks_();
}



/**
 * Events for when the fullscreen button is clicked.
 * @private
 */ 
xiv.ui.Modal.prototype.onFullScreenButtonClicked_ = function() {
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
xiv.ui.Modal.prototype.onWindowedButtonClicked_ = function() {
    goog.dom.fullscreen.exitFullScreen(); 
    this.setMode(this.previousMode_);
    this.buttons_['fullScreen'].style.visibility = 'visible';
    this.buttons_['windowed'].style.visibility = 'hidden';
}



/**
 * As stated.
 * @private
 */   
xiv.ui.Modal.prototype.setFullScreenButtonCallbacks_ = function(){
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
xiv.ui.Modal.prototype.setRowColumnInsertRemoveCallbacks_ = function(){
    goog.events.listen(this.buttons_['insertRow'], 
		       goog.events.EventType.CLICK, function (event) {
	this.ViewBoxManager_.insertRow()
    }.bind(this))

    goog.events.listen(this.buttons_['removeRow'], 
		       goog.events.EventType.CLICK, function (event) {
	this.ViewBoxManager_.removeRow()
    }.bind(this))

    goog.events.listen(this.buttons_['insertColumn'], 
		       goog.events.EventType.CLICK, function (event) {
	this.ViewBoxManager_.insertColumn()
    }.bind(this))

    goog.events.listen(this.buttons_['removeColumn'], 
		       goog.events.EventType.CLICK, function (event) {
	this.ViewBoxManager_.removeColumn()
    }.bind(this))
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.adjustStyleToMode_ = function(){

    //window.console.log("ADJUST MODE", this.mode_);

    if (this.mode_ === 'popup' || this.mode_ === 'fullScreen'){
	goog.dom.classes.add(this.background_, 
			     xiv.ui.Modal.BLACK_BG_CLASS); 
	goog.array.forEach(xiv.ui.Modal.hideableButtonKeys_, function(key){
	    this.buttons_[key].style.visibility = 'hidden';
	}.bind(this))

    } else {
	goog.dom.classes.remove(this.background_, 
				xiv.ui.Modal.BLACK_BG_CLASS);
	goog.array.forEach(xiv.ui.Modal.hideableButtonKeys_, function(key){
	    this.buttons_[key].style.visibility = 'visible';
	}.bind(this))
    }
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.generateButtons_ = function(iconUrl){
    if (!goog.isString(iconUrl)){
	throw new TypeError('String expected!');
    }

    // Generate new button IDs
    var buttonIds =/**@type {!Object}*/{};
    goog.object.forEach(xiv.ui.Modal.buttonTypes, function(buttonType, key){
	buttonIds[key] = xiv.ui.Modal.ID_PREFIX + '.' + 
			 goog.string.toTitleCase(key) + 'Button';
    }.bind(this))


    // Make buttons
    var buttons = /**@type {!Object.<string, Element>}*/
    moka.dom.createBasicHoverButtonSet(goog.object.getValues(buttonIds), 
					iconUrl);

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
 * Sets callbacks for the following events: MOUSEOVER, MOUSEOUT, 
 * THUMBNAILDROP, THUMBNAILCLICK
 * @private
 */
xiv.ui.Modal.prototype.setThumbnailManagerCallbacks_ = function(){
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
 * @param {xiv.ui.Thumbnail} Thumbnail The xiv.ui.Thumbnail that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailMouseover_ = function(Thumbnail) {
    this.ViewBoxManager_.loop(function(ViewBox){
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
    this.ViewBoxManager_.loop(function(ViewBox){
	if (ViewBox.getThumbnail() === Thumbnail && 
	    ViewBox.getLoadState() !== 'loading'){
	    ViewBox.getElement().style.borderColor = 
		ViewBox.getElement().getAttribute(
		    xiv.ui.ThumbnailManager.ORIGINAL_BORDER_ATTR);	
	}
    })
}



/**
 * Callback function for the CLICKED event on the hovered thumbnail.
 * @param {xiv.ui.Thumbnail} Thumbnail The xiv.ui.Thumbnail that fired the event.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailClicked_ = function(Thumbnail){
    this.ViewBoxManager_.getFirstEmpty().loadThumbnail(Thumbnail);
}



/**
 * Callback function for the Dropped event on the hovered thumbnail.
 * @param {!Element} viewBoxElement The view box element.
 * @param {!Element} thumbnailElement The thumbnail element that was dropped.
 * @private
 */
xiv.ui.Modal.prototype.onThumbnailDropped_ = 
function(viewBoxElement, thumbnailElement) {
    var _ViewBox = /**@type {!xiv.ui.ViewBox}*/
    this.ViewBoxManager_.getViewBoxByElement(viewBoxElement);
    var _Thumb = /**@type {!xiv.ui.Thumbnail}*/
	this.ThumbnailManager_.getThumbnailByElement(thumbnailElement);
    _ViewBox.loadThumbnail(_Thumb);
}



/**
 * As stated.
 * @private
 */
xiv.ui.Modal.prototype.setViewBoxManagerCallbacks_ = function(){

    this.ViewBoxManager_['EVENTS'].onEvent('THUMBNAIL_PRELOAD', 
					 this.onThumbnailPreload_.bind(this))
    this.ViewBoxManager_['EVENTS'].onEvent('THUMBNAIL_LOADED', 
					 this.onThumbnailLoaded_.bind(this))
    this.ViewBoxManager_['EVENTS'].onEvent('VIEWBOXES_CHANGED', 
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
	    xiv.ui.ThumbnailManager.ORIGINAL_BORDER_ATTR);
    this.highlightInUseThumbnails();
}



/**
 * Callback function for the LOADED event on the hovered ViewBox.
 * @param {Array.<xiv.ui.ViewBox>} newViewBoxSet The ViewBoxes that have been
 *     changed.
 * @param {boolean=} opt_animage Whether to animate the change (defaults to 
 *     true).
 * @private
 */
xiv.ui.Modal.prototype.onViewBoxesChanged_ = 
function(newViewBoxSet, opt_animate) {
    if (opt_animate) {
	// Fade out the new viewboxes.
	if (newViewBoxSet) {
	    goog.array.forEach(newViewBoxSet, function(newViewBox) {
		moka.style.setStyle(newViewBox.getElement(), 
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









