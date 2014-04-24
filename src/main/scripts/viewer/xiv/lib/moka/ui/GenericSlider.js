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
	'id': moka.ui.GenericSlider.ID_PREFIX + 
	    '_Widget_' + goog.string.createUniqueString()
    });
    // Applies the 'Slider' properties to the element
    this.decorate(this.element_);


    /**
     * @type {!Element}
     * @private
     */
    this.track_ = goog.dom.createDom("div", {
	'id': moka.ui.GenericSlider.ID_PREFIX + 
	    '_Track_' + goog.string.createUniqueString()
    });
    this.element_.appendChild(this.track_);


    /**
     * @type {!Element}
     * @private
     */
    this.thumb_ = 
	goog.dom.getElementByClass('goog-slider-thumb', this.element_);

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
moka.ui.GenericSlider.prototype.isSliding_ = false;



/**
 * @param {Array.<string>}
 * @private
 */
moka.ui.GenericSlider.prototype.thumbHoverClasses_;



/**
 * @param {Array.<string>}
 * @private
 */
moka.ui.GenericSlider.prototype.trackHoverClasses_;




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
 *
 * @param {!Element} element The element to listen for the mousewheel event 
 *    that triggers the slider to move.
 * @public
 */
moka.ui.GenericSlider.prototype.bindToMouseWheel = function (element) {

    /**
     * @type {!goog.events.MouseWheelHandler} 
     */
    var mouseWheelHandler = new goog.events.MouseWheelHandler(element);
    mouseWheelHandler.addEventListener(
	goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
	this.onMouseWheelScroll_, false, this);

    if (!this.MouseWheelHandlers_ || (this.MouseWheelHandlers_.length == 0)) {
	this.MouseWheelHandlers_ = [];
    }
    this.MouseWheelHandlers_.push(mouseWheelHandler);
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- a simple fix for it.
 *
 * @public
 */
moka.ui.GenericSlider.prototype.updateStyle = function () {
    var pos = this.getValue();

    this.setValue(Math.max(this.getMinimum(), 
			   Math.min(pos + 1, this.getMaximum())))
    this.setValue(pos);   
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

    addRemove(this.element_, moka.ui.GenericSlider.CSS.ELEMENT);
    addRemove(this.track_, moka.ui.GenericSlider.CSS.TRACK);
    addRemove(this.thumb_, moka.ui.GenericSlider.CSS.THUMB);  
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
 * @param {string=} opt_thumbClass The thumb class to add.
 * @public
 */
moka.ui.GenericSlider.prototype.addThumbHoverClass = function(thumbClass) {
    this.thumbHoverClasses_ = 
	this.thumbHoverClasses_ ? this.thumbHoverClasses_ : [];
    this.thumbHoverClasses_.push(thumbClass);
    this.removeThumbHoverClasses_();
}



/**
 * @param {string=} opt_trackClass The track class to add.
 * @public
 */
moka.ui.GenericSlider.prototype.addTrackHoverClass = function(trackClass) {
    this.trackHoverClasses_ = 
	this.trackHoverClasses_ ? this.trackHoverClasses_ : [];
    this.trackHoverClasses_.push(trackClass);
    this.removeTrackHoverClasses_();
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 */
moka.ui.GenericSlider.prototype.initEvents_ = function() {

    goog.events.listen(this, goog.ui.Component.EventType.CHANGE, 
		       this.onChange_.bind(this));

    // MouseOver - thumb 
    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOVER, 
		       this.onThumbMouseOver_.bind(this));

    // MouseOut - thumb 
    goog.events.listen(this.thumb_, goog.events.EventType.MOUSEOUT, 
		       this.onThumbMouseOut_.bind(this));

    // MouseOver - track
    goog.events.listen(this.track_, goog.events.EventType.MOUSEOVER, 
		       this.onTrackMouseOver_.bind(this));

    // MouseOut - track 
    goog.events.listen(this.track_, goog.events.EventType.MOUSEOUT, 
		       this.onTrackMouseOut_.bind(this));

    // DragStart set... 
    goog.events.listen(this, goog.ui.SliderBase.EventType.DRAG_START, 
		       this.onThumbnailDragStart_.bind(this));

    // DragEnd set... 
    goog.events.listen(this, goog.ui.SliderBase.EventType.DRAG_END, 
		       this.onThumbnailDragEnd_.bind(this));
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 */
moka.ui.GenericSlider.prototype.onChange_ =  function (e) {
    moka.dom.stopPropagation(e);

    
    if (this.isSliding_) {
	this.addThumbHoverClasses_();
	this.addTrackHoverClasses_();
    }

    this.dispatchEvent({
	type: moka.ui.GenericSlider.EventType.SLIDE,
	value: this.getValue(),
	minimum: this.getMinimum(),
	maximum: this.getMaximum()
    });
}




/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.addThumbHoverClasses_ =  function(e){
    goog.dom.classes.add(this.thumb_, 
			 moka.ui.GenericSlider.CSS.THUMB_HOVERED);

    if (!goog.isDefAndNotNull(this.thumbHoverClasses_)){
	return;
    }
    goog.array.forEach(this.thumbHoverClasses_, function(className){
	goog.dom.classes.add(this.thumb_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.addTrackHoverClasses_ =  function(e){
    goog.dom.classes.add(this.track_, 
			 moka.ui.GenericSlider.CSS.TRACK_HOVERED);
    if (!goog.isDefAndNotNull(this.trackHoverClasses_)){
	return;
    }
    goog.array.forEach(this.trackHoverClasses_, function(className){
	goog.dom.classes.add(this.track_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.removeThumbHoverClasses_ =  function(e){
    goog.dom.classes.remove(this.thumb_, 
			 moka.ui.GenericSlider.CSS.THUMB_HOVERED);
    if (!goog.isDefAndNotNull(this.thumbHoverClasses_)) { return };
    goog.array.forEach(this.thumbHoverClasses_, function(className){
	goog.dom.classes.remove(this.thumb_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.removeTrackHoverClasses_ =  function(e){
    goog.dom.classes.remove(this.track_, 
			 moka.ui.GenericSlider.CSS.TRACK_HOVERED);
    if (!goog.isDefAndNotNull(this.trackHoverClasses_)) { return };
    goog.array.forEach(this.trackHoverClasses_, function(className){
	goog.dom.classes.remove(this.track_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.onThumbMouseOver_ =  function(e){
    window.console.log("THUMB MOUSE OVER!!");
    this.addThumbHoverClasses_();
    this.addTrackHoverClasses_();
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.onTrackMouseOver_ =  function(e){
    this.addTrackHoverClasses_();
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.onThumbMouseOut_ =  function(e){
    if (!this.isSliding_) {
	this.removeThumbHoverClasses_();
	this.removeTrackHoverClasses_(); 
    }
}



/**
 * @param {Event}
 * @private
 */
moka.ui.GenericSlider.prototype.onTrackMouseOut_ =  function(e){
    if (!this.isSliding_) {
	this.removeTrackHoverClasses_();
    }
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
    this.removeThumbHoverClasses_();
    this.removeTrackHoverClasses_();  
}



/** 
 * @inheritDoc 
 */
moka.ui.GenericSlider.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    goog.events.removeAll(this);
    goog.dom.removeNode(this.element_);
    delete this.element_;

    goog.events.removeAll(this.thumb_);
    goog.dom.removeNode(this.thumb_);
    delete this.thumb_;

    goog.events.removeAll(this.track_);
    goog.dom.removeNode(this.track_);
    delete this.track_;

    goog.array.forEach(this.MouseWheelHandlers_, function(handler){
	goog.events.removeAll(handler);
	handler.dispose();
    })
    goog.array.clear(this.MouseWheelHandlers_);
    delete this.MouseWheelHandlers_;

    delete this.thumbHoverClasses_;
    delete this.trackHoverClasses_;
    delete this.isSliding_;
};
