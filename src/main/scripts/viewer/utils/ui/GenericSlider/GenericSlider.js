/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure indcludes
 */
goog.require('goog.ui.Slider');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.events');

/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.array');




/**
 * GenericSlider is a class that inherits from goog.ui.Slider
 * but gives the user flexibility to to make style adjustments
 * and add various customizations.  It is the slider that is used
 * exclusively for Xnat image viewer efforts.
 *
 * @param {Object=} opt_args
 * @constructor
 * @extends {goog.ui.Slider}
 */
goog.provide('utils.ui.GenericSlider');
utils.ui.GenericSlider = function (opt_args) {	 
    var that = this;
    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;
    var orientation = (opt_args && opt_args['orientation']) ? opt_args['orientation'] : 'horizontal';
    goog.ui.Slider.call(this);
	


    //------------------
    // Set orientation
    //------------------
    this.setOrientation(orientation);



    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.makeElement('div', parent, "utils.ui.GenericSlider_Widget");
    this.decorate(this.element_); // Applies the 'Slider' properties to the element


    /**
     * @type {!Element}
     * @private
     */
    this.track_ = utils.dom.makeElement("div", this.element_, "utils.ui.GenericSlider_Track");
		


    //------------------
    // Find the thumbnail because it's not overtly given.
    //------------------
    var children = goog.dom.getChildren(this.element_)
    for (var i=0, len = children.length; i < len; i++) {
	if (children[i].className === 'goog-slider-thumb') {

	    /**
	     * @type {!Element}
	     * @private
	     */
	    this.thumb_ = children[i];
	    break;
	}		
    }


    
    //------------------
    // Slide callbacks
    //------------------
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, goog.ui.Component.EventType.CHANGE, function (e) {
	utils.dom.stopPropagation(e);
	if (this.slideCallbacks_ !== null){
	    goog.array.forEach(this.slideCallbacks_, function(callback){ 
		if (!this.suspendSlideCallbacks_) { callback(e); } 
	    }, this)
	}
    }, this);	    



    //------------------
    // Set CSS
    //------------------
    var orientationLower = this.getOrientation().toLowerCase();
    goog.dom.classes.add(this.element_, goog.getCssName(utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX,  orientationLower));
    goog.dom.classes.add(this.track_,   goog.getCssName(utils.ui.GenericSlider.TRACK_CLASS_PREFIX, orientationLower));
    goog.dom.classes.add(this.thumb_,   goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX,  orientationLower));
}
goog.inherits(utils.ui.GenericSlider, goog.ui.Slider);	
goog.exportSymbol('utils.ui.GenericSlider', utils.ui.GenericSlider);




utils.ui.GenericSlider.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('utils-ui-genericslider');
utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX = /**@type {string} @const*/ utils.ui.GenericSlider.CSS_CLASS_PREFIX;
utils.ui.GenericSlider.TRACK_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'track');
utils.ui.GenericSlider.THUMB_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'thumb');
utils.ui.GenericSlider.THUMB_HOVERED_BORDER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-border');
utils.ui.GenericSlider.THUMB_HOVERED_COLOR_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-color');




/**
 * @return {Element}
 * @public
 */
utils.ui.GenericSlider.prototype.__defineGetter__('element', function(){
    return this.element_;
})



/**
 * @return {Element}
 * @public
 */
utils.ui.GenericSlider.prototype.__defineGetter__('track', function(){
    return this.track_;
})



/**
 * @return {Element}
 * @public
 */
utils.ui.GenericSlider.prototype.__defineGetter__('thumb', function(){
    return this.thumb_;
})





/**
 * Adds a 'callback' method to the slide event of the
 * slider.
 *
 * @param {!function, Object=}
 */	
utils.ui.GenericSlider.prototype.addSlideCallback = function (callback, opt_args) {
    if (this.slideCallbacks_ === null) {
	this.clearSlideCallbacks();
    }
    this.slideCallbacks_.push( function(event){ callback(this, opt_args, event)})
}


/**
 * Clears the slide events of the slider.
 */	
utils.ui.GenericSlider.prototype.clearSlideCallbacks = function () {
    this.slideCallbacks_ = [];
}




/**
 * @return {!Array.<function>}
 */	
utils.ui.GenericSlider.prototype.slideCallbacks_ = null;




/**
 * @return {!Array.<function>}
 */	
utils.ui.GenericSlider.prototype.mouseWheelCallbacks_ = null;


/**
 * Adds a 'callback' method to the slide event of the
 * slider.
 *
 * @param {!function, Object=}
 */	
utils.ui.GenericSlider.prototype.addMousewheelCallback = function (callback) {
    if (this.mouseWheelCallbacks_ === null) {
	this.clearMousewheelCallbacks();
    }
    this.mouseWheelCallbacks_.push( function(event){ callback(this, event)})
}


/**
 * Clears the slide events of the slider.
 */	
utils.ui.GenericSlider.prototype.clearMousewheelCallbacks = function () {
    this.mouseWheelCallbacks_ = [];
}




/**
 * @private
 * @type {boolean}
 */ 
utils.ui.GenericSlider.prototype.suspendSlideCallbacks_ = false;




/**
 * @param {!boolean}
 */ 
utils.ui.GenericSlider.prototype.suspendSlideCallbacks = function(suspend){
    this.suspendSlideCallbacks_ = suspend;
};




/**
 * @param {Array.<goog.events.MouseWheelHandler>}
 */ 
utils.ui.GenericSlider.prototype._MouseWheelHandlers = null;



/**
 * @expose
 * @private
 */
utils.ui.GenericSlider.prototype.onMouseWheelScroll_ = function (event) {
    this.setValue(Math.round(this.getValue() + event.deltaY / 3));
    goog.array.forEach(this.mouseWheelCallbacks_, function(callback){ 
	callback() 
    })
    event.preventDefault();
}




/**
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided elements.
 *
 * @expose
 * @param {!Element} element The element to listen for the mousewheel event that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback that occurs as the mousewheel scrolls.
 */
utils.ui.GenericSlider.prototype.bindToMouseWheel = function (element, opt_callback) {
    var mouseWheelHandler = new goog.events.MouseWheelHandler(element);
    mouseWheelHandler.addEventListener(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,  this.onMouseWheelScroll_, false, this);
    if ((this._MouseWheelHandlers === null) || (this._MouseWheelHandlers.length === 0)) {
	this._MouseWheelHandlers = [];
    }
    if (opt_callback){
	this.addMousewheelCallback(opt_callback);
    }
    this._MouseWheelHandlers.push(mouseWheelHandler);
}




/**
 * @expose
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.suspendCallbacks = function () {
    console.log("utils.ui.GenericSlider: suspendCallbacks: ");
}




/**
 * @expose
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.instateCallbacks = function () {
    //utils.ui.GenericSlider.superClass_.removeAllListeners.call(this, goog.ui.Component.EventType.CHANGE);
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.addClassToWidget = function (className) {
    goog.dom.classes.add(this.element_, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.removeClassFromWidget = function (className) {
    goog.dom.classes.remove(this.element_, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.addClassToThumb = function (className) {
     goog.dom.classes.add(this.thumb_, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.removeClassFromThumb = function (className) {
    goog.dom.classes.remove(this.thumb_, className)
}



/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.addClassToTrack = function (className) {
     goog.dom.classes.add(this.track_, className)
}



/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.removeClassFromTrack = function (className) {
    goog.dom.classes.remove(this.track_, className)
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- simple fix for it.
 *
 * @param {function} callback
 * @param {Object} args_
 */
utils.ui.GenericSlider.prototype.updateStyle = function () {
    this.suspendSlideCallbacks(true);
    var pos = this.getValue();
    if (pos < this.getMaximum()) this.setValue(pos + 1);
    else this.setValue(pos - 1);
    this.setValue(pos);    
    this.suspendSlideCallbacks(false);
}




/**
 * Applies the 'className' to the slider thumb when a mouse
 * hovers over it.
 *
 * @param {!string} className
 * @public
 */	
utils.ui.GenericSlider.prototype.setHoverClass = function(className) {

    this.hoverClass_ = className;

    var applyHover = function(){ goog.dom.classes.add(this.thumb_, this.hoverClass_)}.bind(this);
    var removeHover = function(){ goog.dom.classes.remove(this.thumb_, this.hoverClass_)}.bind(this);


    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOVER, applyHover);
    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOUT, removeHover);


    
    // Remove hoverListeners when dragging the thumbnail...
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, goog.ui.SliderBase.EventType.DRAG_START, function (e) {
	// Suspend mouseout listener when dragging,
	// because we still want to maintain the hover
	// style.
	goog.events.unlisten(this.thumb_, goog.events.EventType.MOUSEOUT, removeHover);
	goog.dom.classes.add(this.thumb_, this.hoverClass_);
    }, this);


    
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, goog.ui.SliderBase.EventType.DRAG_END, function (e) {
	// Reapply mouseout listener when done dragging.
	goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOUT, removeHover);
	goog.dom.classes.remove(this.thumb_, this.hoverClass_);
    }, this);
    

}
