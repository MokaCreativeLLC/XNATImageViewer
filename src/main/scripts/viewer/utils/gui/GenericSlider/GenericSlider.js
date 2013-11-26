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
 * @param {Object=}
 * @constructor
 * @extends {goog.ui.Slider}
 */
goog.provide('utils.gui.GenericSlider');
utils.gui.GenericSlider = function (opt_args) {	 
    var that = this;
    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;
    var orientation = (opt_args && opt_args['orientation']) ? opt_args['orientation'] : 'horizontal';
    goog.ui.Slider.call(this);
	


    //------------------
    // Set orientation
    //------------------
    this.setOrientation(orientation);



    //------------------
    // Define the slider element.
    //------------------
    this._element = utils.dom.makeElement('div', parent, "utils.gui.GenericSlider_Widget");
    this.decorate(this._element); // Applies the 'Slider' properties to the element

    
	
    //------------------
    // Define the slider's track element.
    //------------------
    this.track_ = utils.dom.makeElement("div", this._element, "utils.gui.GenericSlider_Track");
		


    //------------------
    // Find the thumbnail because it's not overtly given.
    //------------------
    var children = goog.dom.getChildren(this._element)
    for (var i=0, len = children.length; i < len; i++) {
	if (children[i].className === 'goog-slider-thumb') {	
	    this.thumb_ = children[i];
	    break;
	}		
    }


    
    //------------------
    // Slide callbacks
    //------------------
    utils.gui.GenericSlider.superClass_.addEventListener.call(this, goog.ui.Component.EventType.CHANGE, function (e) {
	utils.dom.stopPropagation(e);
	goog.array.forEach(that.slideCallbacks_, function(callback){ 
	    if (!that.suspendSlideCallbacks_) { callback(e); } 
	})
    });	    



    //------------------
    // Set CSS
    //------------------
    var orientationLower = this.getOrientation().toLowerCase();
    goog.dom.classes.add(this._element, goog.getCssName(utils.gui.GenericSlider.ELEMENT_CLASS_PREFIX,  orientationLower));
    goog.dom.classes.add(this.track_,   goog.getCssName(utils.gui.GenericSlider.TRACK_CLASS_PREFIX, orientationLower));
    goog.dom.classes.add(this.thumb_,   goog.getCssName(utils.gui.GenericSlider.THUMB_CLASS_PREFIX,  orientationLower));
}
goog.inherits(utils.gui.GenericSlider, goog.ui.Slider);	
goog.exportSymbol('utils.gui.GenericSlider', utils.gui.GenericSlider);




utils.gui.GenericSlider.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('utils-gui-genericslider');
utils.gui.GenericSlider.ELEMENT_CLASS_PREFIX = /**@type {string} @const*/ utils.gui.GenericSlider.CSS_CLASS_PREFIX;
utils.gui.GenericSlider.TRACK_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(utils.gui.GenericSlider.CSS_CLASS_PREFIX, 'track');
utils.gui.GenericSlider.THUMB_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(utils.gui.GenericSlider.CSS_CLASS_PREFIX, 'thumb');
utils.gui.GenericSlider.THUMB_HOVERED_BORDER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.gui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-border');
utils.gui.GenericSlider.THUMB_HOVERED_COLOR_CLASS = /**@type {string} @const*/ goog.getCssName(utils.gui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-color');




/**
 * @type {?Element}
 * @private
 */
utils.gui.GenericSlider.prototype._element = null;




/**
 * @type {?Element}
 * @private
 */	
this.track_ = null;




/**
 * @type {?Element}
 * @private
 */	
utils.gui.GenericSlider.prototype.thumb_ = null;




/**
 * @expose
 * @return {Element}
 */	
utils.gui.GenericSlider.prototype.getTrack = function () {
    return this.track_;
}			





/**
 * @expose
 * @return {Element}
 */	
utils.gui.GenericSlider.prototype.getWidget = function () {
    return this._element;
}




/**
 * @expose
 * @return {Element}
 */	
utils.gui.GenericSlider.prototype.getThumb = function () {
    return this.thumb_;
}



/**
 * Adds a 'callback' method to the slide event of the
 * slider.
 *
 * @param {!function, Object=}
 */	
utils.gui.GenericSlider.prototype.addSlideCallback = function (callback, opt_args) {
    var that = this;
    this.slideCallbacks_.push( function(event){ callback(that, opt_args, event)})
}


/**
 * Clears the slide events of the slider.
 */	
utils.gui.GenericSlider.prototype.clearSlideCallbacks = function () {
    this.slideCallbacks_ = [];
}




/**
 * @return {Array.<function>}
 */	
utils.gui.GenericSlider.prototype.slideCallbacks_ = [];



/**
 * @private
 * @type {boolean}
 */ 
utils.gui.GenericSlider.prototype.suspendSlideCallbacks_ = false;




/**
 * @param {!boolean}
 */ 
utils.gui.GenericSlider.prototype.suspendSlideCallbacks = function(suspend){
    this.suspendSlideCallbacks_ = suspend;
};





/**
 * @expose
 * @param {!Element}
 */
utils.gui.GenericSlider.prototype.bindToMouseWheel = function (element) {

    var that = this;
    var mwh = new goog.events.MouseWheelHandler(element);
    
    mwh.addEventListener( 
	goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, function(e) { 
	    that.setValue(Math.round(that.getValue() + e.deltaY / 3));
	    e.preventDefault();		
	});		
}




/**
 * @expose
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.suspendCallbacks = function () {
    console.log("utils.gui.GenericSlider: suspendCallbacks: ");
}




/**
 * @expose
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.instateCallbacks = function () {
    //utils.gui.GenericSlider.superClass_.removeAllListeners.call(this, goog.ui.Component.EventType.CHANGE);
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.addClassToWidget = function (className) {
    goog.dom.classes.add(this._element, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.removeClassFromWidget = function (className) {
    goog.dom.classes.remove(this._element, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.addClassToThumb = function (className) {
     goog.dom.classes.add(this.thumb_, className)
}




/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.removeClassFromThumb = function (className) {
    goog.dom.classes.remove(this.thumb_, className)
}



/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.addClassToTrack = function (className) {
     goog.dom.classes.add(this.track_, className)
}



/**
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.removeClassFromTrack = function (className) {
    goog.dom.classes.remove(this.track_, className)
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- simple fix for it.
 *
 * @param {function} callback
 * @param {Object} args_
 */
utils.gui.GenericSlider.prototype.updateStyle = function () {
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
utils.gui.GenericSlider.prototype.setHoverClass = function(className) {
    var that = this;
    
    utils.style.setHoverClass(this.thumb_, className, function(applyHover, removeHover){
	//
	// Make a modificaiton when dragging the thumb...
	//
	utils.gui.GenericSlider.superClass_.addEventListener.call(that, goog.ui.SliderBase.EventType.DRAG_START, function (e) {
	    //
	    // Suspend mouseout listener when dragging,
	    // because we still want to maintain the hover
	    // style.
	    //
	    goog.events.unlisten(that.thumb_, goog.events.EventType.MOUSEOUT, removeHover);
	    goog.dom.classes.add(that.thumb_, className);
	});	  
	utils.gui.GenericSlider.superClass_.addEventListener.call(that, goog.ui.SliderBase.EventType.DRAG_END, function (e) {
	    //
	    // Reapply mouseout listener when done dragging.
	    //
	    goog.events.listen(that.thumb_, goog.events.EventType.MOUSEOUT, removeHover);
	    goog.dom.classes.remove(that.thumb_, className);
	});	
    })
}
