/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.Slider');

// goog
goog.require('goog.ui.Slider');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.structs.Queue');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler.EventType');
goog.require('goog.ui.SliderBase.Orientation');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');

// nrg
goog.require('nrg.dom');
goog.require('nrg.string');
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
nrg.ui.Slider = function (opt_orientation) {	 
    goog.base(this);

    //
    // IMPORTANT!!! DO NOT ERASE!
    //
    // We do this because we're not inheriting from nrg.ui.component.
    // This is basically a hacked substitute for multiple inheritance.
    //
    /**
     * @public
     */
    this.constructor.CSS_CLASS_PREFIX = 
	this.constructor.ID_PREFIX.toLowerCase().replace(/\./g,'-');
    /**
     * @public
     */
    this.constructor.ELEMENT_CLASS = this.constructor.CSS_CLASS_PREFIX;
    nrg.ui.Component.prototype.createCssMap.bind(this)();


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
    CHANGE: goog.events.getUniqueId('change'),
    MOUSEWHEEL: goog.events.getUniqueId('mousewheel'),
};




/**
 * @type {!string} 
 * @const
 */
nrg.ui.Slider.ID_PREFIX =  'nrg.ui.Slider';



/**
 * @enum {string} 
 * @expose
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
nrg.ui.Slider.prototype.suspendChangeEvent_ = false;





/**
 * @return {!boolean}
 * @public
 */
nrg.ui.Slider.prototype.isSliding = function(){
    return this.isSliding_;
}




/**
 * @return {!boolean}
 * @public
 */
nrg.ui.Slider.prototype.animatesOnHover = function(){
    return this.animateOnHover_;
}






/**
 * @param {!boolean} bool
 * @public
 */
nrg.ui.Slider.prototype.suspendChangeEvent =  function (bool) {
    this.suspendChangeEvent_ = bool;
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
    /*
    window.console.log('\n\nbindToMouse', 
		       this.getElement(), 
		       element);
    */
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
    //window.console.log("KEY", e);
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
	goog.dom.classes.addRemove(
	    elt,
	    [nrg.string.makeCssName(className, 'horizontal'),
	     nrg.string.makeCssName(className, 'vertical')],
	    [className,
	     nrg.string.makeCssName(className, orientation),
	    ]);
    }

    addRemove(this.element_, this.constructor.ELEMENT_CLASS);
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
 * Initializes the change event to the custom 'SLIDE' event.
 */
nrg.ui.Slider.prototype.initEvents_ = function() {

    goog.events.listen(this, goog.ui.Component.EventType.CHANGE, 
		       this.onChange_.bind(this));


    // DragStart set... 
    goog.events.listen(this, goog.ui.SliderBase.EventType.DRAG_START, 
		       this.onThumbnailDragStart_.bind(this));

    // DragEnd set... 
    goog.events.listen(this, goog.ui.SliderBase.EventType.DRAG_END, 
		       this.onThumbnailDragEnd_.bind(this));
}



/**
 * @return {?goog.structs.Queue}
 * @private
 */
nrg.ui.Slider.prototype.valueQueue_= null;


/**
 * @return {number}
 * @public
 */
nrg.ui.Slider.prototype.getPreviousValue =  function () {
    if (goog.isDefAndNotNull(this.valueQueue_)) {
	var vals = this.valueQueue_.getValues();
	if (vals.length > 0){
	    return vals[0];
	}
    }
}



/**
 * Initializes the change event to the custom 'SLIDE' event.
 * @private
 */
nrg.ui.Slider.prototype.onChange_ =  function (e) {
    // stop propataion
    //window.console.log(e);
    e.stopPropagation();


    //
    // Store / add the values in the value queue
    //
    if (!goog.isDefAndNotNull(this.valueQueue_)){
	this.valueQueue_ = new goog.structs.Queue();
    }
    if (this.valueQueue_.getCount() < 2){
	this.valueQueue_.enqueue(this.getValue());
    }
    else {
	this.valueQueue_.enqueue(this.getValue());
	this.valueQueue_.dequeue();
	//window.console.log('Values', this.valueQueue_.getValues());
    }


    //
    // Only fire event if suspend == false
    //
    if (!this.suspendChangeEvent_){
	//
	// Otherwise, fire the vents
	//
	this.dispatchEvent({
	    type: nrg.ui.Slider.EventType.CHANGE,
	    value: this.getValue(),
	    minimum: this.getMinimum(),
	    maximum: this.getMaximum()
	});
    }

    //
    // always set this.suspendChangeEvent_ to false
    //
    this.suspendChangeEvent_ = false;
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
}



/** 
 * @inheritDoc 
 */
nrg.ui.Slider.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.suspendChangeEvent_;

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

    if (goog.isDefAndNotNull(this.valueQueue_)){
	goog.object.clear(this.valueQueue_);
	delete this.valueQueue_;
    }


    delete this.useDeltaToScroll_;
    delete this.deltaMultiplyer_;
    delete this.isSliding_;    
};



goog.exportSymbol('nrg.ui.Slider.EventType', nrg.ui.Slider.EventType);
goog.exportSymbol('nrg.ui.Slider.ID_PREFIX', nrg.ui.Slider.ID_PREFIX);
goog.exportSymbol('nrg.ui.Slider.CSS_SUFFIX', nrg.ui.Slider.CSS_SUFFIX);

goog.exportSymbol('nrg.ui.Slider.prototype.suspendChangeEvent',
	nrg.ui.Slider.prototype.suspendChangeEvent);
goog.exportSymbol('nrg.ui.Slider.prototype.render',
	nrg.ui.Slider.prototype.render);
goog.exportSymbol('nrg.ui.Slider.prototype.isSliding',
	nrg.ui.Slider.prototype.isSliding);
goog.exportSymbol('nrg.ui.Slider.prototype.getPreviousValue',
	nrg.ui.Slider.prototype.getPreviousValue);
goog.exportSymbol('nrg.ui.Slider.prototype.getElement',
	nrg.ui.Slider.prototype.getElement);
goog.exportSymbol('nrg.ui.Slider.prototype.getTrack',
	nrg.ui.Slider.prototype.getTrack);
goog.exportSymbol('nrg.ui.Slider.prototype.getThumb',
	nrg.ui.Slider.prototype.getThumb);
goog.exportSymbol('nrg.ui.Slider.prototype.bindToMouseWheel',
	nrg.ui.Slider.prototype.bindToMouseWheel);
goog.exportSymbol('nrg.ui.Slider.prototype.bindToArrowKeys',
	nrg.ui.Slider.prototype.bindToArrowKeys);
goog.exportSymbol('nrg.ui.Slider.prototype.updateStyle',
	nrg.ui.Slider.prototype.updateStyle);
goog.exportSymbol('nrg.ui.Slider.prototype.setOrientation',
	nrg.ui.Slider.prototype.setOrientation);
goog.exportSymbol('nrg.ui.Slider.prototype.setUseDeltaToScroll',
	nrg.ui.Slider.prototype.setUseDeltaToScroll);
goog.exportSymbol('nrg.ui.Slider.prototype.disposeInternal',
	nrg.ui.Slider.prototype.disposeInternal);
