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

// moka
goog.require('moka.dom');
goog.require('moka.ui.Component');



/**
 * GenericSlider is a class that inherits from goog.ui.Slider
 * but gives the user flexibility to to make style adjustments
 * and add various customizations.  It is the slider that is used
 * exclusively for XNAT image viewer efforts.
 *
 * @constructor
 * @extends {goog.ui.Slider}
 */
goog.provide('moka.ui.GenericSlider');
moka.ui.GenericSlider = function (opt_args) {	 
    goog.base(this);

    // We do this because we're not inheriting from moka.ui.component.
    // This is basically a hacked substitute for multiple inheritance.
    moka.ui.Component.validateIdPrefix(this);
    moka.ui.Component.createCssMap(this);

    /**
     * @type {!Element}
     * @protected
     */
    this.element_ = goog.dom.createDom('div', {
	'id': 'moka.ui.GenericSlider_Widget' + goog.string.createUniqueString()
    });
    // Applies the 'Slider' properties to the element
    this.decorate(this.element_);


    /**
     * @type {!Element}
     * @private
     */
    this.track_ = goog.dom.createDom("div", {
	'id': 'moka.ui.GenericSlider_Track' + goog.string.createUniqueString()
    });
    this.element_.appendChild(this.track_);


    /**
     * @type {!Element}
     * @private
     */
    this.thumb_ = this.findThumbElement_();


    // Other init calls.
    this.initEvents_();
    this.setOrientation(this.getOrientation().toLowerCase());
}
goog.inherits(moka.ui.GenericSlider, goog.ui.Slider);	
goog.exportSymbol('moka.ui.GenericSlider', moka.ui.GenericSlider);	



/**
 * Event types.
 * @enum {string}
 */
moka.ui.GenericSlider.EventType = {
  SLIDE: goog.events.getUniqueId('slide'),
  MOUSEWHEEL: goog.events.getUniqueId('mousewheel'),
};



/**
 * @type {!string} 
 * @const
 */
moka.ui.GenericSlider.ID_PREFIX =  'moka.ui.GenericSlider';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.GenericSlider.CSS_SUFFIX = {
    TRACK: 'track', 
    TRACK_HOVERED: 'track-hovered', 
    THUMB: 'thumb',
    THUMB_HOVERED: 'thumb-hovered'
}



/**
 * @param {Array.<goog.events.MouseWheelHandler>}
 * @private
 */ 
moka.ui.GenericSlider.prototype.MouseWheelHandlers_;



/**
 * @param {!boolean}
 * @private
 */
moka.ui.GenericSlider.prototype.updating_ = false;



/**
 * @return {!Element} The div that encapsulates the entire slider.
 * @public
 */
moka.ui.GenericSlider.prototype.getElement = function(){
    return this.element_;
}



/**
 * @return {!Element} The track element.
 * @public
 */
moka.ui.GenericSlider.prototype.getTrack = function(){
    return this.track_;
}



/**
 * @return {!Element} The thumb element.
 * @public
 */
moka.ui.GenericSlider.prototype.getThumb = function(){
    return this.thumb_;
}



/**
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided element.
 * @param {!Element} element The element to listen for the mousewheel event 
 *    that triggers the slider to move.
 * @public
 */
moka.ui.GenericSlider.prototype.bindToMouseWheel = 
function (element) {

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

    this.MouseWheelHandlers_.push(mouseWheelHandler);
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- a simple fix for it.
 * @public
 */
moka.ui.GenericSlider.prototype.updateStyle = function () {
    this.updating_ = true;
    var pos = /**@type {!number}*/ this.getValue();
    if (pos < this.getMaximum()) this.setValue(pos + 1);
    else this.setValue(pos - 1);
    this.setValue(pos);   
    this.updating_ = false;
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
moka.ui.GenericSlider.prototype.setOrientation = function(orient) {
    goog.base(this, 'setOrientation', orient);	  
    this.setCssClasses_(this.getOrientation().toLowerCase());
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
moka.ui.GenericSlider.prototype.setCssClasses_ = function(orientation) {

    function addRemove(elt, className){
	goog.dom.classes.addRemove(elt,
				   [goog.getCssName(className, 'horizontal'),
				    goog.getCssName(className, 'vertical')],
				   [goog.getCssName(className),
				    goog.getCssName(className, orientation),
				   ]);
    }

    addRemove(this.element_, moka.ui.GenericSlider.ELEMENT_CLASS);
    addRemove(this.track_, moka.ui.GenericSlider.CSS.TRACK);
    addRemove(this.thumb_, moka.ui.GenericSlider.CSS.THUMB);  
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 */
moka.ui.GenericSlider.prototype.initEvents_ = function() {
    moka.ui.GenericSlider.superClass_.addEventListener.call(this, 
			goog.ui.Component.EventType.CHANGE, function (e) {
	moka.dom.stopPropagation(e);
			    if (this.updating_) { return };
			    this.dispatchEvent({
				type: moka.ui.GenericSlider.EventType.SLIDE
			    });
    }.bind(this));

    this.initHoverEvents_();
}



/**
 * Finds the thumbnail element associated with the parent class.
 * This exists because it's not overtly provided in the 
 * inheritance.
 * @return {!Element} The thumbnail element.
 */
moka.ui.GenericSlider.prototype.findThumbElement_ = function() {
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
moka.ui.GenericSlider.prototype.onMouseWheelScroll_ = function (event) {
    //window.console.log("mousewheel scroll");
    this.setValue(Math.round(this.getValue() - event.deltaY / 3));
    this.dispatchEvent({
	type: moka.ui.GenericSlider.EventType.MOUSEWHEEL
    });
    event.preventDefault();
}




/**
 * @type {Object}
 * @private
 */
moka.ui.GenericSlider.prototype.hoverables_;



/**
 * As stated.
 * @type {!boolean}
 * @private
 */
moka.ui.GenericSlider.prototype.isSliding_ = false;



/**
 * As stated.
 * @type {!string}
 * @private
 */
moka.ui.GenericSlider.prototype.lastHoverEvent_ = '';




/**
 * @param {string=} opt_thumbClass The thumb class to add.
 * @param {string=} opt_trackClass The track class to add.
 * @public
 */
moka.ui.GenericSlider.prototype.setHoverClasses = 
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
moka.ui.GenericSlider.prototype.initHoverEvents_ = function(){
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
moka.ui.GenericSlider.prototype.setBasicHoverEvents_ = function(){
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
moka.ui.GenericSlider.prototype.setUniqueHoverEvents_ = function(){

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
moka.ui.GenericSlider.prototype.setDragHoverEvents_ = function(){
    // DragStart set...
    moka.ui.GenericSlider.superClass_.addEventListener.call(this, 
		goog.ui.SliderBase.EventType.DRAG_START, 
		this.onThumbnailDragStart_.bind(this));

    // DragEnd set...
    moka.ui.GenericSlider.superClass_.addEventListener.call(this, 
    			goog.ui.SliderBase.EventType.DRAG_END, 
    this.onThumbnailDragEnd_.bind(this), this);
    
    // Drag set...
    goog.events.listen(this, moka.ui.GenericSlider.EventType.SLIDE, 
    function(e){ 
	if (this.isSliding_ && !this.updating_){
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
moka.ui.GenericSlider.prototype.initHoverables_ = function(){
    this.hoverables_ = {
	'thumb': {},
	'track' : {}
    }
    this.hoverables_['thumb']['element'] = this.thumb_;    
    this.hoverables_['track']['element'] = this.track_;
    this.hoverables_['thumb']['classes'] = 
	[moka.ui.GenericSlider.CSS.THUMB_HOVERED];
    this.hoverables_['track']['classes'] = 
	[moka.ui.GenericSlider.CSS.TRACK_HOVERED];

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
moka.ui.GenericSlider.prototype.getClassModifier_ = 
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
moka.ui.GenericSlider.prototype.onThumbnailDragStart_ = function (e) {
    this.isSliding_ = true;
}



/**
 * Event as described.
 * @param {!goog.events.EventType} e The event.
 * @private
 */
moka.ui.GenericSlider.prototype.onThumbnailDragEnd_ = function (e) {
    this.isSliding_ = false;
    if (this.lastHoverEvent_ === 'MOUSEOUT'){
	goog.object.forEach(this.hoverables_, function(hoverable, key){
	    this.getClassModifier_(key, goog.dom.classes.remove)();
	}.bind(this))
    }
}



/** 
 * @inheritDoc 
 */
moka.ui.GenericSlider.prototype.disposeInternal = function() {
    moka.ui.GenericSlider.superClass_.disposeInternal.call(this);
    goog.dom.removeNode(this.thumb_);
    this.thumb_ = {};
    goog.dom.removeNode(this.track_);
    this.track_= {};
    this.MouseWheelHandlers_ = [];
    this.updating_ = null;
};
