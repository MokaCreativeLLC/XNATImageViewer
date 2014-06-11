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

// nrg
goog.require('nrg.dom');
goog.require('nrg.ui.Component');



/**
 * Slider is a class that inherits from goog.ui.Slider
 * but gives the user flexibility to to make style adjustments
 * and add various customizations.  It is the slider that is used
 * exclusively for XNAT image viewer efforts.
 *
 * @constructor
 * @param {string=} opt_orientation The optional orientation: 'vertical' or
 *    'horizontal'.  Default is 'horizontal'.
 * @extends {goog.ui.Slider}
 */
goog.provide('nrg.ui.Slider');
nrg.ui.Slider = function (opt_orientation) {	 
    goog.base(this);

    //
    // IMPORTANT!!! DO NOT ERASE!
    //
    // We do this because we're not inheriting from nrg.ui.component.
    // This is basically a hacked substitute for multiple inheritance.
    //
    nrg.ui.Component.validateIdPrefix(this);
    nrg.ui.Component.createCssMap(this);


    //
    // Set the orientation if needed
    //
    if (goog.isDefAndNotNull(opt_orientation)){
	this.setOrientation(opt_orientation);
    }
}
goog.inherits(nrg.ui.Slider, goog.ui.Slider);	
goog.exportSymbol('nrg.ui.Slider', nrg.ui.Slider);	




/**
 * Event types.
 * @enum {string}
 */
nrg.ui.Slider.EventType = {
  SLIDE: goog.events.getUniqueId('slide'),
  MOUSEWHEEL: goog.events.getUniqueId('mousewheel'),
};




/**
 * @type {!string} 
 * @const
 */
nrg.ui.Slider.ID_PREFIX =  'nrg.ui.Slider';



/**
 * @enum {string} 
 * @const
 */ 
nrg.ui.Slider.CSS_SUFFIX = {
    TRACK: 'track', 
    TRACK_HOVERED: 'track-hovered', 
    THUMB: 'thumb',
    THUMB_HOVERED: 'thumb-hovered'
}




/**
 * @param {Object.<string, goog.events.MouseWheelHandler>}
 * @private
 */ 
nrg.ui.Slider.prototype.MouseWheelHandlers_;



/**
 * @param {Object.<string, goog.events.KeyHandler>}
 * @private
 */ 
nrg.ui.Slider.prototype.KeyHandlers_;



/**
 * @param {!boolean}
 * @private
 */
nrg.ui.Slider.prototype.isSliding_ = false;



/**
 * @param {Array.<string>}
 * @private
 */
nrg.ui.Slider.prototype.thumbHoverClasses_;



/**
 * @param {Array.<string>}
 * @private
 */
nrg.ui.Slider.prototype.trackHoverClasses_;



/**
 * @type {Element}
 * @protected
 */
nrg.ui.Slider.prototype.element_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Slider.prototype.track_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Slider.prototype.thumb_; 


/**
 * @type {!boolean}
 * @private
 */
nrg.ui.Slider.prototype.suspendSlideEvent_ = false;



/**
 * @param {!boolean} bool
 * @public
 */
nrg.ui.Slider.prototype.suspendSlideEvent =  function (bool) {
    this.suspendSlideEvent_ = bool;
}


/**
 * @param {!boolean} bool
 * @public
 */
nrg.ui.Slider.prototype.suspendChangeEvent =  function (bool) {
    this.suspendSlideEvent_ = bool;
}



/**
 * @inheritDoc
 */
nrg.ui.Slider.prototype.render = function(opt_parentElement) {

    this.element_ = goog.dom.createDom('div', {
	'id': nrg.ui.Slider.ID_PREFIX + 
	    '_Widget_' + goog.string.createUniqueString()
    });

    //
    // Call parent decorate
    //
    this.decorate(this.element_);

    //
    // Attach to parent
    //
    opt_parentElement = goog.isDefAndNotNull(opt_parentElement) ?
	opt_parentElement : document.body;
    goog.dom.appendChild(opt_parentElement, this.element_);
    

    //
    // track
    //
    this.track_ = goog.dom.createDom("div", {
	'id': nrg.ui.Slider.ID_PREFIX + 
	    '_Track_' + goog.string.createUniqueString()
    });
    this.element_.appendChild(this.track_);

    //
    // thumb
    // 
    this.thumb_ = 
	goog.dom.getElementByClass('goog-slider-thumb', this.element_);

    // Other init calls.
    this.initEvents_();
    this.setOrientation(this.getOrientation().toLowerCase());
}




/**
 * @return {!Element} The div that encapsulates the entire slider.
 * @public
 */
nrg.ui.Slider.prototype.getElement = function(){
    return this.element_;
}



/**
 * @return {!Element} The track element.
 * @public
 */
nrg.ui.Slider.prototype.getTrack = function(){
    return this.track_;
}



/**
 * @return {!Element} The thumb element.
 * @public
 */
nrg.ui.Slider.prototype.getThumb = function(){
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
nrg.ui.Slider.prototype.bindToMouseWheel = function (element) {
    if (!goog.isDefAndNotNull(this.MouseWheelHandlers_)) {
	this.MouseWheelHandlers_ = {};
    }

    if (!goog.isDefAndNotNull(this.MouseWheelHandlers_[element.id])) {
	//window.console.log("BINDING", element.id);
	var mouseWheelHandler = new goog.events.MouseWheelHandler(element);
	mouseWheelHandler.addEventListener(
	    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
	    this.onMouseWheelScroll_, false, this);
	this.MouseWheelHandlers_[element.id] = mouseWheelHandler;
    }
}



/**
 * Binds the keyboard events appropriated for the slider through
 * the provided element.
 *
 * @param {!Element} element The element to listen for the mousewheel event 
 *    that triggers the slider to move.
 * @public
 */
nrg.ui.Slider.prototype.bindToArrowKeys = function (element) {
    if (!goog.isDefAndNotNull(this.KeyHandlers_)) {
	this.KeyHandlers_ = {};
    }

    if (!goog.isDefAndNotNull(this.KeyHandlers_[element.id])) {
	var keyHandler = new goog.events.KeyHandler(element);
	goog.events.listen(keyHandler, goog.events.KeyHandler.EventType.KEY,
	    this.onKey_.bind(this));
	this.KeyHandlers_[element.id] = keyHandler;
    }
}



/**
 * @param {!Event}
 * @private
 */
nrg.ui.Slider.prototype.onKey_ = function (e) {
    window.console.log("KEY", e);
}




/**
 * Update so slider thumb is at correct position -- likely
 * a bug in the native goog.ui.Slider code -- a simple fix for it.
 *
 * @public
 */
nrg.ui.Slider.prototype.updateStyle = function () {
    var val = this.getValue();
    var proposedCoord = this.getThumbCoordinateForValue(val);

    if (this.getOrientation().toLowerCase() == 'horizontal'){
	this.thumb_.style.left = proposedCoord.x.toString() + 'px';
    }

    else if (this.getOrientation().toLowerCase() == 'vertical'){
	this.thumb_.style.left = proposedCoord.y.toString() + 'px';
    }    
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
nrg.ui.Slider.prototype.setOrientation = function(orient) {
    goog.base(this, 'setOrientation', orient);
    if (this.isInDocument()){
	this.setCssClasses_(this.getOrientation().toLowerCase());
    }
}



/**
 * Changes the orientation and applies the CSS properties associated with
 * the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
nrg.ui.Slider.prototype.setCssClasses_ = function(orientation) {

    function addRemove(elt, className){
	goog.dom.classes.addRemove(elt,
				   [goog.getCssName(className, 'horizontal'),
				    goog.getCssName(className, 'vertical')],
				   [goog.getCssName(className),
				    goog.getCssName(className, orientation),
				   ]);
    }

    addRemove(this.element_, nrg.ui.Slider.CSS.ELEMENT);
    addRemove(this.track_, nrg.ui.Slider.CSS.TRACK);
    addRemove(this.thumb_, nrg.ui.Slider.CSS.THUMB);  
}


/**
 * @private 
 * @type {!boolean}
 */
nrg.ui.Slider.prototype.useDeltaToScroll_ = false;


/**
 * @private 
 * @type {!number}
 */
nrg.ui.Slider.prototype.deltaMultiplyer_ = 1;



/**
 * @param {!boolean} bool
 * @param {!number} opt_mult
 */
nrg.ui.Slider.prototype.setUseDeltaToScroll = function(bool, opt_mult){
    this.useDeltaToScroll_ = bool;
    if (goog.isNumber(opt_mult)){
	this.deltaMultiplyer_ = opt_mult;
    }
};



/**
 * Runs the callbacks and manages the mousewheel events when 
 * detected over the mousewheel elements contained within the
 * MouseWheelHandlers_ variable.
 * @param {Event} event
 * @private
 */
nrg.ui.Slider.prototype.onMouseWheelScroll_ = function (event) {
    //window.console.log("mousewheel scroll", this.getOrientation(), 
    //event.deltaX, event.deltaY);

    //
    // Give priority to largest delta
    //
    var largestDelta = (Math.abs(event.deltaY) < Math.abs(event.deltaX)) ? 
	event.deltaX : event.deltaY;

    if (this.useDeltaToScroll_){
	this.setValue(Math.round(this.getValue() - largestDelta * 
				 this.deltaMultiplyer_));
    } 
    else {
	this.setValue(Math.round(this.getValue() - 
			     ((largestDelta < 0) ? -1 : 1)));
    }
    this.dispatchEvent({
	type: nrg.ui.Slider.EventType.MOUSEWHEEL
    });
    event.preventDefault();
}



/**
 * @param {string=} opt_thumbClass The thumb class to add.
 * @public
 */
nrg.ui.Slider.prototype.addThumbHoverClass = function(thumbClass) {
    this.thumbHoverClasses_ = 
	this.thumbHoverClasses_ ? this.thumbHoverClasses_ : [];
    this.thumbHoverClasses_.push(thumbClass);
    this.removeThumbHoverClasses_();
}



/**
 * @param {string=} opt_trackClass The track class to add.
 * @public
 */
nrg.ui.Slider.prototype.addTrackHoverClass = function(trackClass) {
    this.trackHoverClasses_ = 
	this.trackHoverClasses_ ? this.trackHoverClasses_ : [];
    this.trackHoverClasses_.push(trackClass);
    this.removeTrackHoverClasses_();
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 */
nrg.ui.Slider.prototype.initEvents_ = function() {

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
nrg.ui.Slider.prototype.onChange_ =  function (e) {
    // stop propataion
    e.stopPropagation();

    //
    // Add the hover classes
    //
    if (this.isSliding_) {
	this.addThumbHoverClasses_();
	this.addTrackHoverClasses_();
    }

    //
    // Only fire event if suspend == false
    //
    if (!this.suspendSlideEvent_){
	//
	// Otherwise, fire the vents
	//
	this.dispatchEvent({
	    type: nrg.ui.Slider.EventType.SLIDE,
	    value: this.getValue(),
	    minimum: this.getMinimum(),
	    maximum: this.getMaximum()
	});
    }

    //
    // always set this.suspendSlideEvent_ to false
    //
    this.suspendSlideEvent_ = false;

}




/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.addThumbHoverClasses_ =  function(e){
    goog.dom.classes.add(this.thumb_, 
			 nrg.ui.Slider.CSS.THUMB_HOVERED);

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
nrg.ui.Slider.prototype.addTrackHoverClasses_ =  function(e){
    goog.dom.classes.add(this.track_, 
			 nrg.ui.Slider.CSS.TRACK_HOVERED);
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
nrg.ui.Slider.prototype.removeThumbHoverClasses_ =  function(e){
    goog.dom.classes.remove(this.thumb_, 
			 nrg.ui.Slider.CSS.THUMB_HOVERED);
    if (!goog.isDefAndNotNull(this.thumbHoverClasses_)) { return };
    goog.array.forEach(this.thumbHoverClasses_, function(className){
	goog.dom.classes.remove(this.thumb_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.removeTrackHoverClasses_ =  function(e){
    goog.dom.classes.remove(this.track_, 
			 nrg.ui.Slider.CSS.TRACK_HOVERED);
    if (!goog.isDefAndNotNull(this.trackHoverClasses_)) { return };
    goog.array.forEach(this.trackHoverClasses_, function(className){
	goog.dom.classes.remove(this.track_, className); 
    }.bind(this))
}



/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.onThumbMouseOver_ =  function(e){
    //window.console.log("THUMB MOUSE OVER!!");
    e.stopPropagation();
    this.addThumbHoverClasses_();
    this.addTrackHoverClasses_();
}



/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.onTrackMouseOver_ =  function(e){
    this.addTrackHoverClasses_();
}



/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.onThumbMouseOut_ =  function(e){
    if (!this.isSliding_) {
	this.removeThumbHoverClasses_();
	this.removeTrackHoverClasses_(); 
    }
}



/**
 * @param {Event}
 * @private
 */
nrg.ui.Slider.prototype.onTrackMouseOut_ =  function(e){
    if (!this.isSliding_) {
	this.removeTrackHoverClasses_();
    }
}




/**
 * Event as described.
 * @param {!goog.events.EventType} e The event.
 * @private
 */
nrg.ui.Slider.prototype.onThumbnailDragStart_ = function (e) {
    this.isSliding_ = true;
}



/**
 * Event as described.
 * @param {!goog.events.EventType} e The event.
 * @private
 */
nrg.ui.Slider.prototype.onThumbnailDragEnd_ = function (e) {
    this.isSliding_ = false;
    this.removeThumbHoverClasses_();
    this.removeTrackHoverClasses_();  
}



/** 
 * @inheritDoc 
 */
nrg.ui.Slider.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.suspendSlideEvent_;

    if (goog.isDefAndNotNull(this.element_)){
	goog.events.removeAll(this);
	goog.dom.removeNode(this.element_);
	delete this.element_;
    }

    if (goog.isDefAndNotNull(this.thumb_)){
	goog.events.removeAll(this.thumb_);
	goog.dom.removeNode(this.thumb_);
	delete this.thumb_;
    }

    if (goog.isDefAndNotNull(this.track_)){
	goog.events.removeAll(this.track_);
	goog.dom.removeNode(this.track_);
	delete this.track_;
    }

    if (goog.isDefAndNotNull(this.KeyHandlers_)){
	goog.object.forEach(this.KeyHandlers_, function(handler){
	    goog.events.removeAll(handler);
	    handler.dispose();
	})
	goog.object.clear(this.KeyHandlers_);
	delete this.KeyHandlers_;
    }


    if (goog.isDefAndNotNull(this.MouseWheelHandlers_)){
	goog.object.forEach(this.MouseWheelHandlers_, function(handler){
	    goog.events.removeAll(handler);
	    handler.dispose();
	})
	goog.object.clear(this.MouseWheelHandlers_);
	delete this.MouseWheelHandlers_;
    }

    if (goog.isDefAndNotNull(this.thumbHoverClasses_)){
	goog.array.clear(this.thumbHoverClasses_);
	delete this.thumbHoverClasses_;
    }

    if (goog.isDefAndNotNull(this.trackHoverClasses_)){
	goog.array.clear(this.trackHoverClasses_);
	delete this.trackHoverClasses_;
    }

    delete this.useDeltaToScroll_;
    delete this.deltaMultiplyer_;
    delete this.isSliding_;
};
