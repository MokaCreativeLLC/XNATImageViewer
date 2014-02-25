/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');
goog.require('goog.fx');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.events.EventManager');

// xiv
goog.require('xiv.Widget');
goog.require('xiv');
goog.require('xiv.ViewBoxTabs');




/**
 * xiv.ContentDivider is the divider object that
 * separates the xiv.ViewBoxTabs from the Holder objects.
 * When the user drags the Content Divider up and down,
 * the xiv.ViewBoxTabs and Holder objects resize themselves 
 * according.
 *
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.ContentDivider');
xiv.ContentDivider = function () {
    
    goog.base(this, 'xiv.ContentDivider', {
	'class': xiv.ContentDivider.ELEMENT_CLASS
    });
    


    /**
     * @expose
     * @type {!Element}
     */
    this.containment_ = goog.dom.createDom("div", {
	'id' : 'xiv.ContentDividerContainment_' + goog.string.createUniqueString(),
	'class': xiv.ContentDivider.CONTAINMENT_CLASS
    });
    
    

    /**
     * @private
     * @type {!Element}
     */
    this.icon_ = goog.dom.createDom("img", {
	'id' : 'xiv.ContentDividerIcon_' + goog.string.createUniqueString(),
	'src' : xiv.ICON_URL + 'Icons/Toggle-ContentDivider.png',
	'class':  xiv.ContentDivider.ICON_CLASS
    });		
    


    //
    // Event manager
    //
    utils.events.EventManager.addEventManager(this, 
					      xiv.ContentDivider.EventType);



    //
    // Appends
    //
    goog.dom.append(this.getElement(), this.icon_);



    //
    // Inits
    //
    this.setDefaultDragMethods_();
    this.updateStyle();
    
}
goog.inherits(xiv.ContentDivider, xiv.Widget);
goog.exportSymbol('xiv.ContentDivider', xiv.ContentDivider);




/**
 * Event types.
 * @enum {string}
 */
xiv.ContentDivider.EventType = {
  DRAGEND: goog.events.getUniqueId('dragend'),
  DRAGSTART: goog.events.getUniqueId('dragstart'),
  DRAG: goog.events.getUniqueId('drag'),
};




/**
 * @type {!boolean}
 * @private
 */
xiv.ContentDivider.prototype.dragging_ = false;





/**
 * @return {!Element}  The divider's containment element.
 * @public
 */
xiv.ContentDivider.prototype.getContainment = function() {
    return this.containment_;
}




/**
 * @return {!boolean} Whether the divider is in a 
 *    dragging state.
 * @public
 */
xiv.ContentDivider.prototype.isDragging = function() {
    return this.dragging_;
}




/**
 * For the xiv.ViewBoxTabs.  When the user moves or clicks
 * on the content divider, there's a maximum "top" it can go to,
 * which is defined by the containment_ element's top.
 *
 * @return {!number} The containment value (top, px) of the divider.
 * @public
 */
xiv.ContentDivider.prototype.getUpperLimit = function() {
    return utils.style.dims(this.containment_, 'top');
} 




/**
 * @return {!number} The position value (top, px) of the divider.
 * @public
 */
xiv.ContentDivider.prototype.getPosition = function() {
    return utils.style.dims(this.getElement(), 'top'); 
} 





/**
 * When the user moves or clicks
 * on the content divider, there's a minimum "bottom" it can go to,
 * which is defined by the containment_ element's top + height.
 *
 * @return {!number}
 * @piblic
 */
xiv.ContentDivider.prototype.getLowerLimit = function() {
    return utils.style.dims(this.containment_, 'top') + 
	utils.style.dims(this.containment_, 'height') - 
	utils.style.dims(this.getElement(), 'height');
} 




/**
* Defines the dragging behavior of the Content Divider
* at a high level.  
* @private
*/ 
xiv.ContentDivider.prototype.setDefaultDragMethods_ = function() {    


    //------------------
    // On Mousedown...
    //------------------
    goog.events.listen(this.getElement(), goog.events.EventType.MOUSEDOWN, function(e) {
	
	//
	// Stop propagation.
	//
	utils.dom.stopPropagation(e);
	

	//
	// Params.
	//
	var cDims = utils.style.dims(this.containment_);
	var d = new goog.fx.Dragger(this.getElement(), null, new goog.math.Rect(0, cDims.top, 0, cDims.height - xiv.CONTENT_DIVIDER_HEIGHT));
	this.dragging_ = true;	


	//
	// Clear params when done dragging.
	//
	d.addEventListener(goog.fx.Dragger.EventType.START, function(e) {
	    this.dragging_ = true;
	    goog.array.forEach(this.dragStartCallbacks_, function(callback) { callback(this.getElement(), e) });	
	}.bind(this));

	
	//
	// Run drag callbacks on drag.
	//
	d.addEventListener(goog.fx.Dragger.EventType.DRAG, function(e) {
	    utils.dom.stopPropagation(e);
	    goog.array.forEach(this.dragCallbacks_, function(callback) { callback(this.getElement(), e) });	
	}.bind(this));
	

	//
	// Clear params when done dragging.
	//
	d.addEventListener(goog.fx.Dragger.EventType.END, function(e) {
	    this.dragging_ = false;
	    d.dispose();
	    goog.array.forEach(this.dragEndCallbacks_, function(callback) { callback(this.getElement(), e)});	
	}.bind(this));


	//
	// Call goog.fx.Dragger.startDrag
	//
	d.startDrag(e);	
    }.bind(this));
}




/**
 * Programmatically allows the content divider to slide
 * to a new 'top' position.
 *
 * @param {!number} newTop
 * @param {boolean=} opt_animate
 */
xiv.ContentDivider.prototype.slideTo = function(newTop, opt_animate) {
    
    var dims = utils.style.dims(this.getElement());
    var slide = new goog.fx.dom.Slide(this.getElement(), [dims.left, dims.top], [0, newTop], xiv.ANIM_MED, goog.fx.easing.easeOut);



    //------------------
    // Callbacks dor the animation events (BEGIN, ANIMATE, END).
    //------------------
    goog.events.listen(slide, goog.fx.Animation.EventType.BEGIN, function() {
	goog.array.forEach(this.dragStartCallbacks_, function(callback) { callback(this.getElement()) }.bind(this));			
    }.bind(this));
    goog.events.listen(slide, goog.fx.Animation.EventType.ANIMATE, function() {
	goog.array.forEach(this.dragCallbacks_, function(callback) { callback(this.getElement()) }.bind(this));			
    }.bind(this));
    goog.events.listen(slide, goog.fx.Animation.EventType.END, function() {
	goog.array.forEach(this.dragEndCallbacks_, function(callback) { callback(this.getElement()) }.bind(this));			
    }.bind(this));



    //------------------
    // Play animation.
    //------------------
    slide.play();	
} 




/**
 * @inheritDoc
 */
xiv.ContentDivider.prototype.updateStyle = function (opt_args) {
    if (opt_args) { 
	this.setArgs(opt_args) 
	utils.style.setStyle(this.getElement(), this.currArgs().elementCSS);
    }
}





xiv.ContentDivider.CSS_CLASS_PREFIX =  /**@type {string} @const*/ goog.getCssName('xiv-contentdivider');
xiv.ContentDivider.ELEMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(xiv.ContentDivider.CSS_CLASS_PREFIX, '');
xiv.ContentDivider.CONTAINMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(xiv.ContentDivider.CSS_CLASS_PREFIX, 'containment');
xiv.ContentDivider.ICON_CLASS =  /**@type {string} @const*/  goog.getCssName(xiv.ContentDivider.CSS_CLASS_PREFIX, 'icon');
