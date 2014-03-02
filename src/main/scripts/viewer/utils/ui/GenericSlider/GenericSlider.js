/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Slider');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');

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
 * @type {!string} 
 * @const
 */
utils.ui.GenericSlider.CSS_CLASS_PREFIX =  
goog.getCssName('utils-ui-genericslider');



/**
 * @type {!string} 
 * @const
 */
utils.ui.GenericSlider.TRACK_CLASS = 
goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'track');



/**
 * @type {!string} 
 * @const
 */
utils.ui.GenericSlider.TRACK_HOVERED_CLASS = 
goog.getCssName(utils.ui.GenericSlider.TRACK_CLASS, 'hovered');



/**
 * @type {!string} 
 * @const
 */
utils.ui.GenericSlider.THUMB_CLASS =  
goog.getCssName(utils.ui.GenericSlider.CSS_CLASS_PREFIX, 'thumb');




/**
 * @type {!string} 
 * @const
 */
utils.ui.GenericSlider.THUMB_HOVERED_CLASS =  
goog.getCssName(utils.ui.GenericSlider.THUMB_CLASS, 'hovered');



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
    window.console.log("update style");
    this['EVENTS'].setEventSuspended('SLIDE', true);
    var pos = /**@type {!number}*/ this.getValue();
    if (pos < this.getMaximum()) this.setValue(pos + 1);
    else this.setValue(pos - 1);
    this.setValue(pos);    
    this['EVENTS'].setEventSuspended('SLIDE', false);
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
utils.ui.GenericSlider.prototype.setOrientation = function(orient) {
    goog.base(this, 'setOrientation', orient);	  
    this.setCssClasses_(this.getOrientation().toLowerCase());
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
utils.ui.GenericSlider.prototype.setCssClasses_ = function(orientation) {

    function addRemove(elt, className){
	goog.dom.classes.addRemove(elt,
				   [goog.getCssName(className, 'horizontal'),
				    goog.getCssName(className, 'vertical')],
				   [goog.getCssName(className),
				    goog.getCssName(className, orientation),
				   ]);
    }

    addRemove(this.element_, utils.ui.GenericSlider.CSS_CLASS_PREFIX);
    addRemove(this.track_, utils.ui.GenericSlider.TRACK_CLASS);
    addRemove(this.thumb_, utils.ui.GenericSlider.THUMB_CLASS);  
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

    this.initHoverEvents_();
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
    //window.console.log("mousewheel scroll");
    this.setValue(Math.round(this.getValue() + event.deltaY / 3));
    this['EVENTS'].runEvent('MOUSEWHEEL');
    event.preventDefault();
}




/**
 * @type {Object}
 * @private
 */
utils.ui.GenericSlider.prototype.hoverables_;



/**
 * As stated.
 * @type {!boolean}
 * @private
 */
utils.ui.GenericSlider.prototype.isSliding_ = false;



/**
 * As stated.
 * @type {!string}
 * @private
 */
utils.ui.GenericSlider.prototype.lastHoverEvent_ = '';




/**
 * @param {string=} opt_thumbClass The thumb class to add.
 * @param {string=} opt_trackClass The track class to add.
 * @public
 */
utils.ui.GenericSlider.prototype.setHoverClasses = 
function(opt_thumbClass, opt_trackClass){
    var tempObj = {
	'thumb': opt_thumbClass,
	'track': opt_trackClass
    }
    // Add to hover classes.
    goog.object.forEach(tempObj, function(tempObjVal, key){
	if (tempObjVal && 
	    this.hoverables_[key]['classes'].indexOf(tempObj[key]) == -1){
	    this.hoverables_[key]['classes'].push(tempObj[key])
	}
    }.bind(this))
}



/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.initHoverEvents_ = function(){
    this.initHoverables_();
    this.setBasicHoverEvents_();
    this.setUniqueHoverEvents_();
    this.setDragHoverEvents_()
}




/**
 * Sets the basic mouseout and mouseover class adds and removes for the thumb
 * and the track.
 * @private
 */
utils.ui.GenericSlider.prototype.setBasicHoverEvents_ = function(){
    var elt = /**@type {!Element} */ undefined;

    goog.object.forEach(this.hoverables_, function(hoverable, key){
	elt = hoverable['element'];

	// Mouseover
	hoverable['MOUSEOVER'].push(
	    goog.events.listen(elt, goog.events.EventType.MOUSEOVER, 
		       this.getClassModifier_(key, goog.dom.classes.add)));

	// Mouseout
	hoverable['MOUSEOUT'].push(
	    goog.events.listen(elt, goog.events.EventType.MOUSEOUT, function(){
		//window.console.log("Mousehout!", this.isSliding_)
		if (!this.isSliding_) {
		    //window.console.log("HERE!");
		    this.getClassModifier_(key, goog.dom.classes.remove)();
		}
	    }.bind(this)));
    }.bind(this))
}



/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.setUniqueHoverEvents_ = function(){

    // Hover track when hovering thumb...
    this.hoverables_['thumb']['MOUSEOVER'].push(
	goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOVER,
	    function(){
		this.lastHoverEvent_ = 'MOUSEOVER';
		this.getClassModifier_('track', goog.dom.classes.add)();
	    }.bind(this)))

    // Unhover track when hovering thumb...
    this.hoverables_['thumb']['MOUSEOUT'].push(
    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOUT, 
        function(){
	    this.lastHoverEvent_ = 'MOUSEOUT';
	    // Except when sliding...
	    if (!this.isSliding_){
		this.getClassModifier_('track', goog.dom.classes.remove)();
	    }
        }.bind(this)))
}

    

/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.setDragHoverEvents_ = function(){
    // DragStart set...
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, 
		goog.ui.SliderBase.EventType.DRAG_START, 
		this.onThumbnailDragStart_.bind(this));

    // DragEnd set...
    utils.ui.GenericSlider.superClass_.addEventListener.call(this, 
    			goog.ui.SliderBase.EventType.DRAG_END, 
    this.onThumbnailDragEnd_.bind(this), this);
    
    // Drag set...
    this['EVENTS'].onEvent('SLIDE', function(){ 
	if (this.isSliding_){
	    goog.object.forEach(this.hoverables_, function(hoverable, key){
		// Apply the hover class
		this.getClassModifier_(key, goog.dom.classes.add)();
	    }.bind(this))
	}
    }.bind(this));
}



/**
 * As stated.
 * @private
 */
utils.ui.GenericSlider.prototype.initHoverables_ = function(){
    this.hoverables_ = {
	'thumb': {},
	'track' : {}
    }
    this.hoverables_['thumb']['element'] = this.thumb_;    
    this.hoverables_['track']['element'] = this.track_;
    this.hoverables_['thumb']['classes'] = 
	[utils.ui.GenericSlider.THUMB_HOVERED_CLASS];
    this.hoverables_['track']['classes'] = 
	[utils.ui.GenericSlider.TRACK_HOVERED_CLASS];

    goog.object.forEach(this.hoverables_, function(hoverable){
	hoverable['MOUSEOVER'] = [];
	hoverable['MOUSEOUT'] = [];
    }.bind(this))
}



/**
 * As stated.
 * @param {!string} The key referencing this.hoverables_.
 * @param {!function} The function to manipulate the classes with.
 * @return {!function} The function that runs the modification of an elements
 *    class names.
 * @private
 */
utils.ui.GenericSlider.prototype.getClassModifier_ = 
function(key, classManipFcn) {
    return function(){
	goog.array.forEach(this.hoverables_[key]['classes'], 
			   function(className){
	    classManipFcn(this.hoverables_[key]['element'], className)
	}.bind(this))
    }.bind(this)
}



/**
 * Event as described.
 * @param {!goog.events.EventType} e The event.
 * @private
 */
utils.ui.GenericSlider.prototype.onThumbnailDragStart_ = function (e) {
    this.isSliding_ = true;
}



/**
 * Event as described.
 * @param {!goog.events.EventType} e The event.
 * @private
 */
utils.ui.GenericSlider.prototype.onThumbnailDragEnd_ = function (e) {
    this.isSliding_ = false;
    if (this.lastHoverEvent_ === 'MOUSEOUT'){
	goog.object.forEach(this.hoverables_, function(hoverable, key){
	    this.getClassModifier_(key, goog.dom.classes.remove)();
	}.bind(this))
    }
}




