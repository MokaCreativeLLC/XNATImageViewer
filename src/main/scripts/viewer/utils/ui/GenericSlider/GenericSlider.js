/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Slider');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');

// utils
goog.require('utils.dom');
goog.require('utils.events.EventManager');




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
    goog.base(this);
	

    /**
     * @type {!Element}
     * @protected
     */
    this.element_ = goog.dom.createDom('div', {
	'id': 'utils.ui.GenericSlider_Widget' + goog.string.createUniqueString()
    });
    // Applies the 'Slider' properties to the element
    this.decorate(this.element_);


    /**
     * @type {!Element}
     * @private
     */
    this.track_ = goog.dom.createDom("div", {
	'id': 'utils.ui.GenericSlider_Track' + goog.string.createUniqueString()
    });
    this.element_.appendChild(this.track_);


    /**
     * @type {!Element}
     * @private
     */
    this.thumb_ = this.findThumbElement_();


    // Events
    utils.events.EventManager.addEventManager(this, 
					      utils.ui.GenericSlider.EventType);

    // Other init calls.
    this.initEvents_();
    this.setOrientation(this.getOrientation().toLowerCase());
}
goog.inherits(utils.ui.GenericSlider, goog.ui.Slider);	
goog.exportSymbol('utils.ui.GenericSlider', utils.ui.GenericSlider);	



/**
 * Event types.
 * @enum {string}
 */
utils.ui.GenericSlider.EventType = {
  SLIDE: goog.events.getUniqueId('slide'),
  MOUSEWHEEL: goog.events.getUniqueId('mousewheel'),
};



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.CSS_CLASS_PREFIX =  
goog.getCssName('utils-ui-genericslider');



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX =
utils.ui.GenericSlider.CSS_CLASS_PREFIX;



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.TRACK_CLASS_PREFIX = 
goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'track');



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.THUMB_CLASS_PREFIX =  
goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'thumb');



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.THUMB_HOVERED_BORDER_CLASS = 
goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-border');



/**
 * @type {string} 
 * @expose
 * @const
 */
utils.ui.GenericSlider.THUMB_HOVERED_COLOR_CLASS = 
goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX, 'hovered-color');



/**
 * @param {Array.<goog.events.MouseWheelHandler>}
 * @private
 */ 
utils.ui.GenericSlider.prototype.MouseWheelHandlers_;



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
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided element.
 * @param {!Element} element The element to listen for the mousewheel event 
 *    that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback that occurs as the
 *    mousewheel scrolls.
 * @public
 */
utils.ui.GenericSlider.prototype.bindToMouseWheel = 
function (element, opt_callback) {

    /**
     * @type {!goog.events.MouseWheelHandler} 
     */
    var mouseWheelHandler = new goog.events.MouseWheelHandler(element);
    mouseWheelHandler.addEventListener(
	goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
	this.onMouseWheelScroll_, false, this);

    if (!this.MouseWheelHandlers_ || (this.MouseWheelHandlers_.length === 0)) {
	this.MouseWheelHandlers_ = [];
    }

    if (opt_callback){
	this['EVENTS'].onEvent('MOUSEWHEEL', opt_callback);
    }

    this.MouseWheelHandlers_.push(mouseWheelHandler);
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- a simple fix for it.
 * @public
 */
utils.ui.GenericSlider.prototype.updateStyle = function () {
    this['EVENTS'].setEventSuspended('SLIDE', true);
    var pos = /**@type {!number}*/ this.getValue();
    if (pos < this.getMaximum()) this.setValue(pos + 1);
    else this.setValue(pos - 1);
    this.setValue(pos);    
    this['EVENTS'].setEventSuspended('SLIDE', false);
}



/**
 * Applies the 'className' to the slider thumb when a mouse
 * hovers over it.  This method was implemented to ensure
 * a better UX than a default event listening call.
 * @param {!string} className The class to apply to the thumb.
 * @public
 */	
utils.ui.GenericSlider.prototype.setThumbHoverClass = function(className) {
    this.hoverClass_ = className;

    goog.events.listen(this.thumb_, 
		       goog.events.EventType.MOUSEOVER, 
		       this.applyThumbnailHover_.bind(this));
    goog.events.listen(this.thumb_, 
		       goog.events.EventType.MOUSEOUT, 
		       this.removeThumbnailHover_.bind(this));

    // Remove hoverListeners when dragging the thumbnail...
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, 
			goog.ui.SliderBase.EventType.DRAG_START, 
			this.onThumbnailDragStart_.bind(this), this);

    // Reapply mouseout listener when done dragging.
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, 
			goog.ui.SliderBase.EventType.DRAG_END, 
			this.onThumbnailMouseOut_.bind(this), this);
}




/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 *
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
utils.ui.GenericSlider.prototype.setOrientation = function(orient) {
    goog.base(this, 'setOrientation', orient);	  

    var orientationLower = /**@type {!string}*/ 
    this.getOrientation().toLowerCase();

    goog.dom.classes.add(this.element_, 
	goog.getCssName(utils.ui.GenericSlider.ELEMENT_CLASS_PREFIX,  
					 orientationLower));
    goog.dom.classes.add(this.track_,   
	goog.getCssName(utils.ui.GenericSlider.TRACK_CLASS_PREFIX, 
					 orientationLower));
    goog.dom.classes.add(this.thumb_,   
	goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS_PREFIX,  
					 orientationLower));  
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 */
utils.ui.GenericSlider.prototype.initEvents_ = function() {
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, 
			goog.ui.Component.EventType.CHANGE, function (e) {
	utils.dom.stopPropagation(e);
	this['EVENTS'].runEvent('SLIDE');
    }.bind(this));	    
}



/**
 * Finds the thumbnail element associated with the parent class.
 * This exists because it's not overtly provided in the 
 * inheritance.
 * @return {!Element} The thumbnail element.
 */
utils.ui.GenericSlider.prototype.findThumbElement_ = function() {
    var children = /**@type {Array | NodeList}*/
    goog.dom.getChildren(this.element_);
    var i = /**@type{!number}*/ 0;
    var len = /**@type{!number}*/ children.length;
    for (i=0; i < len; i++) {
	if (children[i].className === 'goog-slider-thumb') {
	    return children[i];
	}		
    }
}



/**
 * Runs the callbacks and manages the mousewheel events when 
 * detected over the mousewheel elements contained within the
 * MouseWheelHandlers_ variable.
 * @param {Event} event
 * @private
 */
utils.ui.GenericSlider.prototype.onMouseWheelScroll_ = function (event) {
    this.setValue(Math.round(this.getValue() + event.deltaY / 3));
    this['EVENTS'].runEvent('MOUSEWHEEL');
    event.preventDefault();
}




/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.applyThumbnailHover_ = function() { 
    goog.dom.classes.add(this.thumb_, this.hoverClass_)
}



/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.removeThumbnailHover_ = function() { 
    goog.dom.classes.remove(this.thumb_, this.hoverClass_)
}



/**
 * Suspends mouseout listener when dragging, because we still want to maintain 
 * the hover style.
 * @param {!goog.events.EventType} 
 * @private
 */
utils.ui.GenericSlider.prototype.onThumbnailDragStart_ = function (e) {
    goog.events.unlisten(this.thumb_, goog.events.EventType.MOUSEOUT, 
			 this.removeThumbnailHover_);
    goog.dom.classes.add(this.thumb_, this.hoverClass_);
}



/**
 * Custom mouseout function for the thumbnail.
 * @param {!goog.events.EventType} 
 * @private
 */
utils.ui.GenericSlider.prototype.onThumbnailMouseOut_ = function (e) {    
    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOUT, 
		       this.removeThumbnailHover_);
    goog.dom.classes.remove(this.thumb_, this.hoverClass_);
}




