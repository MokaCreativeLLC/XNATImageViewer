/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */


/**
 * Google closure includes
 */
goog.require('goog.ui.Slider');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events');


/**
 * utils includes
 */
goog.require('utils.dom');




/**
 * GenericSlider is a class that inherits from goog.ui.Slider
 * but gives the user flexibility to to make style adjustments
 * and add various customizations.  It is the slider that is used
 * exclusively for XNAT image viewer efforts.
 *
 * @constructor
 * @extends {goog.ui.Slider}
 */
goog.provide('utils.ui.GenericSlider');
utils.ui.GenericSlider = function (opt_args) {	 


    goog.ui.Slider.call(this);
	

    //------------------
    // Set orientation
    //------------------
    this.setOrientation('vertical');



    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.makeElement('div', document.body, "utils.ui.GenericSlider_Widget");
    this.decorate(this.element_); // Applies the 'Slider' properties to the element



    /**
     * @type {!Element}
     * @private
     */
    this.track_ = utils.dom.makeElement("div", this.element_, "utils.ui.GenericSlider_Track");
		


    /**
     * @private
     * @type {!boolean}
     */ 
    this.suspendOnSlide_ = false;




    /**
     * @return {Array.<function>}
     * @private
     */	
    this.onSlide_ = [];




    /**
     * @return {Array.<function>}
     * @private
     */	
    this.onMouseWheel_ = [];



    /**
     * @param {!Array.<goog.events.MouseWheelHandler>}
     * @private
     */ 
    this.MouseWheelHandlers_ = [];




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
    // Define the onSlide master function.
    //------------------
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, goog.ui.Component.EventType.CHANGE, function (e) {
	utils.dom.stopPropagation(e);
	goog.array.forEach(this.onSlide_, function(callback){ 
	    if (!this.suspendOnSlide_) { callback(e); } 
	}.bind(this))
    }.bind(this));	    




    //------------------
    // Set CSS
    //------------------
    var orientationLower = this.getOrientation().toLowerCase();
    goog.dom.classes.add(this.element_, goog.getCssName(utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX,  orientationLower));
    goog.dom.classes.add(this.track_,   goog.getCssName(utils.ui.GenericSlider.TRACK_CLASS_PREFIX, orientationLower));
    goog.dom.classes.add(this.thumb_,   goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX,  orientationLower));
}
goog.inherits(utils.ui.GenericSlider, goog.ui.Slider);	





utils.ui.GenericSlider.CSS_CLASS_PREFIX = /**@type {string} @expose @const*/ goog.getCssName('utils-ui-genericslider');
utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX = /**@type {string} @expose @const*/ utils.ui.GenericSlider.CSS_CLASS_PREFIX;
utils.ui.GenericSlider.TRACK_CLASS_PREFIX = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'track');
utils.ui.GenericSlider.THUMB_CLASS_PREFIX = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'thumb');
utils.ui.GenericSlider.THUMB_HOVERED_BORDER_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-border');
utils.ui.GenericSlider.THUMB_HOVERED_COLOR_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-color');




/**
 * @return {!Element} The div that encapsulates the entire slider.
 * @public
 */
utils.ui.GenericSlider.prototype.getElement = function(){
    return this.element_;
}



/**
 * @return {!Element} The track element.
 * @public
 */
utils.ui.GenericSlider.prototype.getTrack = function(){
    return this.track_;
}



/**
 * @return {!Element} The thumb element.
 * @public
 */
utils.ui.GenericSlider.prototype.getThumb = function(){
    return this.thumb_;
}




/**
 * Adds a 'callback' method to the slide event of the
 * slider.
 *
 * @param {!function} callback The callback function to add.
 * @public
 */	
utils.ui.GenericSlider.prototype.onSlide = function (callback) {
    this.onSlide_.push( function(event){ callback(this, event)})
}




/**
 * Adds a 'callback' method to the mousewheel event of the
 * slider.  It should be noted that 'bindToMouseWheel' needs
 * to be applied to an element before this function gets called.
 *
 * @param {!function} callback The callback function to add.
 * @public
 */	
utils.ui.GenericSlider.prototype.onMouseWheel = function (callback) {
    this.onMouseWheel_.push( function(event){ callback(this, event)})
}





/**
 * Gives the user the option to suspend the 'onSlide' callbacks
 * when the argument is 'true'.
 * 
 * @param {!boolean} suspend 'true' to suspend the onSlide, 'false' to allow them.
 * @public
 */ 
utils.ui.GenericSlider.prototype.suspendOnSlide = function(suspend){
    this.suspendOnSlide_ = suspend;
};




/**
 * Runs the callbacks and manages the mousewheel events when 
 * detected over the mousewheel elements contained within the
 * MouseWheelHandlers_ variable.
 * 
 * @param {Event} event
 * @private
 */
utils.ui.GenericSlider.prototype.onMouseWheelScroll_ = function (event) {
    this.setValue(Math.round(this.getValue() + event.deltaY / 3));
    goog.array.forEach(this.onMouseWheel_, function(callback){ 
	callback() 
    })
    event.preventDefault();
}




/**
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided element.
 *
 * @param {!Element} element The element to listen for the mousewheel event that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback that occurs as the mousewheel scrolls.
 * @public
 */
utils.ui.GenericSlider.prototype.bindToMouseWheel = function (element, opt_callback) {
    var mouseWheelHandler = new goog.events.MouseWheelHandler(element);
    mouseWheelHandler.addEventListener(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,  this.onMouseWheelScroll_, false, this);
    if ((this.MouseWheelHandlers_ === null) || (this.MouseWheelHandlers_.length === 0)) {
	this.MouseWheelHandlers_ = [];
    }
    if (opt_callback){
	this.onMouseWheel(opt_callback);
    }
    this.MouseWheelHandlers_.push(mouseWheelHandler);
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- a simple fix for it.
 * @public
 */
utils.ui.GenericSlider.prototype.updateStyle = function () {
    this.suspendOnSlide(true);
    var pos = this.getValue();
    if (pos < this.getMaximum()) this.setValue(pos + 1);
    else this.setValue(pos - 1);
    this.setValue(pos);    
    this.suspendOnSlide(false);
}




/**
 * Applies the 'className' to the slider thumb when a mouse
 * hovers over it.  This method was implemented to ensure
 * a better UX than a default event listening call.
 *
 * @param {!string} className The class to apply to the thumb.
 * @public
 */	
utils.ui.GenericSlider.prototype.setThumbHoverClass = function(className) {

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




goog.exportSymbol('utils.ui.GenericSlider', utils.ui.GenericSlider);
goog.exportSymbol('utils.ui.GenericSlider.prototype.getElement', utils.ui.GenericSlider.prototype.getElement);
goog.exportSymbol('utils.ui.GenericSlider.prototype.getTrack', utils.ui.GenericSlider.prototype.getTrack);
goog.exportSymbol('utils.ui.GenericSlider.prototype.getThumb', utils.ui.GenericSlider.prototype.getThumb);
goog.exportSymbol('utils.ui.GenericSlider.prototype.onSlide', utils.ui.GenericSlider.prototype.onSlide);
goog.exportSymbol('utils.ui.GenericSlider.prototype.onMouseWheel', utils.ui.GenericSlider.prototype.onMouseWheel);
goog.exportSymbol('utils.ui.GenericSlider.prototype.suspendOnSlide', utils.ui.GenericSlider.prototype.suspendOnSlide);
goog.exportSymbol('utils.ui.GenericSlider.prototype.bindToMouseWheel', utils.ui.GenericSlider.prototype.bindToMouseWheel);
goog.exportSymbol('utils.ui.GenericSlider.prototype.updateStyle', utils.ui.GenericSlider.prototype.updateStyle);
goog.exportSymbol('utils.ui.GenericSlider.prototype.setThumbHoverClass', utils.ui.GenericSlider.prototype.setThumbHoverClass);
