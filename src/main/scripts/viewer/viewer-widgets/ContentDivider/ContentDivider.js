/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */

/**
 * viewer-widget includes
 */
goog.require('XnatViewerWidget');
goog.require('XnatViewerGlobals');




/**
 * ContentDivider is the divider object that
 * separates the ViewBoxTabs from the Holder objects.
 * When the user drags the Content Divider up and down,
 * the ViewBoxTabs and Holder objects resize themselves 
 * according.
 *
 * @constructor
 * @param {Object=}
 * @extends {XnatViewerWidget}
 */
goog.provide('ContentDivider');
ContentDivider = function (opt_args) {
    var that = this;
    XnatViewerWidget.call(this, utils.dom.mergeArgs(opt_args, {'id' : 'ContentDivider'}));
    goog.dom.classes.set(this._element, ContentDivider.ELEMENT_CLASS);
    


    //------------------
    // Containment setup.
    //------------------
    this._containment = utils.dom.makeElement("div", this.args.parent,  'ContentDividerContainment');
    goog.dom.classes.set(this._containment,  ContentDivider.CONTAINMENT_CLASS);
    
    

    //------------------
    // Icon setup.
    //------------------
    this.icon_ = utils.dom.makeElement("img", this._element,  'ContentDividerIcon');	
    goog.dom.classes.set(this.icon_, ContentDivider.ICON_CLASS);	
    this.icon_.src = XnatViewerGlobals.ICON_URL + 'Icons/Toggle-ContentDivider.png'	 
	


    //------------------
    // Init methods
    //------------------
    this.setDefaultDragMethods();
    this.updateStyle();	

    

    //------------------
    // Clear callbacks.
    //------------------
    this.dragCallbacks_ = [];
    this.dragStartCallbacks_ = [];
    this.dragEndCallbacks_ = [];
}
goog.inherits(ContentDivider, XnatViewerWidget);
goog.exportSymbol('ContentDivider', ContentDivider);




ContentDivider.CSS_CLASS_PREFIX =  /**@type {string} @const*/ goog.getCssName('xiv-contentdivider');
ContentDivider.ELEMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(ContentDivider.CSS_CLASS_PREFIX, '');
ContentDivider.CONTAINMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(ContentDivider.CSS_CLASS_PREFIX, 'containment');
ContentDivider.ICON_CLASS =  /**@type {string} @const*/  goog.getCssName(ContentDivider.CSS_CLASS_PREFIX, 'icon');




/**
 * @expose
 * @type {?Element}
 */
ContentDivider.prototype._containment = null;




/**
 * @private
 * @type {?Element}
 */
ContentDivider.prototype.icon_ = null;




/**
 * @type {?Array.functions}
 * @private
 */
ContentDivider.prototype.dragCallbacks_ = null;




/**
 * @type {?Array.functions}
 * @private
 */
ContentDivider.prototype.dragStartCallbacks_ = null;




/**
 * @type {?Array.functions}
 * @private
 */
ContentDivider.prototype.dragEndCallbacks_ = null;




/**
 * @type {boolean}
 * @private
 */
ContentDivider.prototype.dragging_ = false;




/**
 * @type {boolean}
 * @private
 */
ContentDivider.prototype.isDragging = function() {
    return this.dragging_;
}




/**
 * @param {function}
 * @private
 */
ContentDivider.prototype.addDragCallback = function(callback) {
    this.dragCallbacks_.push(callback);	
}




/**
 * @param {function}
 * @private
 */
ContentDivider.prototype.addDragStartCallback = function(callback) {
    this.dragStartCallbacks_.push(callback);	
}




/**
 * @param {function}
 * @private
 */
ContentDivider.prototype.addDragEndCallback = function(callback) {
    this.dragEndCallbacks_.push(callback);	
}




/**
 * For the ViewBoxTabs.  When the user moves or clicks
 * on the content divider, there's a maximum "top" it can go to,
 * which is defined by the _containment element's top.
 *
 * @return {number}
 */
ContentDivider.prototype.getUpperLimit = function() {
    return utils.style.dims(this._containment, 'top');
} 



/**
 * @return {number}
 */
ContentDivider.prototype.getPosition = function() {
    return utils.style.dims(this._element, 'top'); 
} 





/**
 * For the ViewBoxTabs.  When the user moves or clicks
 * on the content divider, there's a minimum "bottom" it can go to,
 * which is defined by the _containment element's top + height.
 *
 * @return {number}
 */
ContentDivider.prototype.getLowerLimit = function() {
    return utils.style.dims(this._containment, 'top') + 
	utils.style.dims(this._containment, 'height') - 
	utils.style.dims(this._element, 'height');
} 




/**
* Defines the dragging behavior of the Content Divider
* at a high level.  Callbacks are specified by other classes.
*
* @type {function}
* @private
*/ 
ContentDivider.prototype.setDefaultDragMethods = function() {    
    var that = this;



    //------------------
    // On Mousedown...
    //------------------
    goog.events.listen(this._element, goog.events.EventType.MOUSEDOWN, function(e) {
	
	//
	// Stop propagation.
	//
	utils.dom.stopPropagation(e);
	

	//
	// Params.
	//
	var cDims = utils.style.dims(that._containment);
	var d = new goog.fx.Dragger(that._element, null, new goog.math.Rect(0, cDims.top, 0, cDims.height - XnatViewerGlobals.CONTENT_DIVIDER_HEIGHT));
	that.dragging_ = true;	


	//
	// Clear params when done dragging.
	//
	d.addEventListener(goog.fx.Dragger.EventType.START, function(e) {
	    that.dragging_ = true;
	    goog.array.forEach(that.dragStartCallbacks_, function(callback) { callback(that._element, e) });	
	});

	
	//
	// Run drag callbacks on drag.
	//
	d.addEventListener(goog.fx.Dragger.EventType.DRAG, function(e) {
	    utils.dom.stopPropagation(e);
	    goog.array.forEach(that.dragCallbacks_, function(callback) { callback(that._element, e) });	
	});
	

	//
	// Clear params when done dragging.
	//
	d.addEventListener(goog.fx.Dragger.EventType.END, function(e) {
	    that.dragging_ = false;
	    d.dispose();
	    goog.array.forEach(that.dragEndCallbacks_, function(callback) { callback(that._element, e)});	
	});


	//
	// Call goog.fx.Dragger.startDrag
	//
	d.startDrag(e);	
    });
}




/**
 * Programmatically allows the content divider to slide
 * to a new 'top' position.
 *
 * @param {!number, boolean=}
 */
ContentDivider.prototype.slideTo = function(newTop, animate) {
    var that = this;
    var dims = utils.style.dims(this._element);
    var slide = new goog.fx.dom.Slide(that._element, [dims.left, dims.top], [0, newTop], XnatViewerGlobals.ANIM_MED, goog.fx.easing.easeOut);



    //------------------
    // Callbacks dor the animation events (BEGIN, ANIMATE, END).
    //------------------
    goog.events.listen(slide, goog.fx.Animation.EventType.BEGIN, function() {
	goog.array.forEach(that.dragStartCallbacks_, function(callback) { callback(that._element) });			
    });
    goog.events.listen(slide, goog.fx.Animation.EventType.ANIMATE, function() {
	goog.array.forEach(that.dragCallbacks_, function(callback) { callback(that._element) });			
    });
    goog.events.listen(slide, goog.fx.Animation.EventType.END, function() {
	goog.array.forEach(that.dragEndCallbacks_, function(callback) { callback(that._element) });			
    });



    //------------------
    // Play animation.
    //------------------
    slide.play();	
} 




/**
 * Generic updateStyle function for window changes.
 *
 * @param {Object=}
 * @private
 */
ContentDivider.prototype.updateStyle = function (opt_args) {		
    if (opt_args) { 
	this.setArgs(opt_args) 
	utils.style.setStyle(that._element, this.currArgs()._elementCSS);
    }
}