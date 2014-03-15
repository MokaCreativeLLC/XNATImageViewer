/**
 * @author sunilk@mokacreativellc.com
 */

// goog
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.events');

// moka
goog.require('moka.fx');
goog.require('moka.dom');
goog.require('moka.convert');
goog.require('moka.style');
goog.require('moka.string');
goog.require('moka.ui.GenericSlider');
goog.require('moka.ui.Component');




/**
 * moka.ui.ScrollableContainer allows the user to input contents to create a 
 * scrollable div.  It's a compound object that uses goog.ui.AnimatedZippy or 
 * goog.ui.Zippy (for condensing contents and creating folders) and 
 * moka.ui.GenericSlider for scrolling through the contents.
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('moka.ui.ScrollableContainer');
moka.ui.ScrollableContainer = function (opt_args) {
    goog.base(this);
 

    /**
     * @type {!Element}
     * @private
     */
    this.scrollArea_ = goog.dom.createDom("div", {
	'id': 'ScrollArea_' + goog.string.createUniqueString(),
	'class' :  moka.ui.ScrollableContainer.CSS.SCROLLAREA
    });
    goog.dom.append(this.element_, this.scrollArea_);



    /**
     * @type {!moka.ui.GenericSlider}
     * @private
     */
    this.Slider_ = new moka.ui.GenericSlider();
    this.Slider_.setOrientation('vertical');
    goog.dom.append(this.element_, this.Slider_.getElement());


    //------------------
    // Set Slider UI and callbacks
    //------------------
    this.setSliderCallbacks_();
    this.setSliderStyles_();
    this.updateStyle();
    this.mapSliderToContents();
}
goog.inherits(moka.ui.ScrollableContainer, moka.ui.Component);
goog.exportSymbol('moka.ui.ScrollableContainer', moka.ui.ScrollableContainer);



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.ID_PREFIX = 'moka.ui.ScrollableContainer';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ScrollableContainer.CSS_SUFFIX = {
    SCROLLAREA : 'scrollarea', 
    SLIDER : 'slider', 
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_TRACK: 'slider-track',
    SLIDER_THUMB_HOVERED: 'slider-thumb-hovered',
    SLIDER_TRACK_HOVERED: 'slider-track-hovered',
}



/**
 * @const
 * @type {!number}
 */
moka.ui.ScrollableContainer.MAX_LABEL_LENGTH = 30;



/**
 * Allows user to add an element and the folders from which it belongs to.
 * @param {!Element} elt
 * @public
 */
moka.ui.ScrollableContainer.prototype.addContents = function(elt) {
    goog.dom.append(this.scrollArea_, elt);
    this.mapSliderToContents();
}



/**
 * Returns the primary element.
 * @return {!Element} The ScrollableContainer main element.
 * @public
 */
moka.ui.ScrollableContainer.prototype.getElement = function(){
    return this.element_;
}



/**
 * As stated.
 * @return {!moka.ui.GenericSlider} The Slider object.
 * @public
 */
moka.ui.ScrollableContainer.prototype.getSlider = function(){
    return this.Slider_;
}



/**
 * As stated.
 * @return {!Element} The Slider object.
 * @public
 */
moka.ui.ScrollableContainer.prototype.getScrollArea = function(){
    return this.scrollArea_;
}



/**
 * Generic updateStyle method. 
 * @param {Object=} opt_args The style object to apply.
 * @public
 */
moka.ui.ScrollableContainer.prototype.updateStyle = function (opt_args) {
    if (opt_args) { moka.style.setStyle(this.element_, opt_args) }
}



/**
 * Sets the default styles for the various components.
 * @private
 */
moka.ui.ScrollableContainer.prototype.setSliderStyles_ = function(){
    goog.dom.classes.add(this.Slider_.getElement(), 
			 moka.ui.ScrollableContainer.CSS.SLIDER);
    goog.dom.classes.add(this.Slider_.getThumb(), 
			 moka.ui.ScrollableContainer.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.Slider_.getTrack(), 
			 moka.ui.ScrollableContainer.CSS.SLIDER_TRACK);
    this.Slider_.setHoverClasses(
	moka.ui.ScrollableContainer.CSS.SLIDER_THUMB_HOVERED,
	moka.ui.ScrollableContainer.CSS.SLIDER_TRACK_HOVERED);
}



/**
 * Refits the sliders track range to suit the height
 * of all of the contents, which is 'scrollArea_'.
 * This should be appled AFTER contents have been set.
 * @protected
 */
moka.ui.ScrollableContainer.prototype.mapSliderToContents = function () {

    
    var widgetHeight = /**@type {!number}*/
    moka.style.dims(this.element_, 'height');

    var scrollAreaHeight = /**@type {!number}*/
    moka.convert.toInt(moka.style.getComputedStyle(
	this.scrollArea_, 'height'));

    var beforeRange = /**@type {!Array.number}*/
    [this.Slider_.getMinimum(), this.Slider_.getMaximum()];

    var afterRange = /**@type {!Array.number}*/
    [0, scrollAreaHeight - widgetHeight];

    var sliderThumb = /**@type {!Element}*/ this.Slider_.getThumb();

    //window.console.log("mapslider", widgetHeight, scrollAreaHeight);
    //------------------
    // If there's the scrollArea (contents) is greater
    // than the height of the container element, then we 
    // enable the slider and reposition the contents so it
    // can be slideable...
    //------------------
    if (widgetHeight < scrollAreaHeight) {

	// The slider thumbnail's height is a function of
	// how much scroll area is hidden.  Want to make sure the height
	// is proportional to the contents.
	moka.style.setStyle(sliderThumb, {
	    'opacity': 1,
	    'height': widgetHeight * (widgetHeight / scrollAreaHeight)
	});

	// Enable the slider
	this.Slider_.setEnabled(true);
	

	// Move the scroll area to the top (as the slider's thumbnail
	// is at the top).
	var sendVal = /**@type {!number}*/ this.Slider_.getMaximum() - 
	    this.Slider_.getValue();
	var remap = /**@type {!number}*/
	    moka.convert.remap1D(sendVal, beforeRange, afterRange);
	var t = /**@type {!number}*/ remap['remappedVal'];
	    moka.style.setStyle( this.scrollArea_, {'top': -t});	



    //------------------
    // Otherwise we hide and disable the slider.
    //------------------	
    }
    else {
	moka.style.setStyle(sliderThumb, { 'opacity': 0});
	this.Slider_.setEnabled(false);
	this.Slider_.setValue(100);
    }	
}




/**
 * Sets the slider callbacks.
 * @private
 */
moka.ui.ScrollableContainer.prototype.setSliderCallbacks_ = function() {
    goog.events.listen(this.Slider_, moka.ui.GenericSlider.EventType.SLIDE,
				   this.mapSliderToContents.bind(this));  
    this.Slider_.bindToMouseWheel(this.element_);
}

















