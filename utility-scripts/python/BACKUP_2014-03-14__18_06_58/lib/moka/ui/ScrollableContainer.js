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




/**
 * moka.ui.ScrollableContainer allows the user to input contents to create a 
 * scrollable div.  It's a compound object that uses goog.ui.AnimatedZippy or 
 * goog.ui.Zippy (for condensing contents and creating folders) and 
 * moka.ui.GenericSlider for scrolling through the contents.
 * @constructor
 */
goog.provide('moka.ui.ScrollableContainer');
moka.ui.ScrollableContainer = function (opt_args) {


    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.createDom('div', {
	'id': 'ScrollableContainer_' + goog.string.createUniqueString(),
	'class': moka.ui.ScrollableContainer.ELEMENT_CLASS
    });



    /**
     * @type {!Element}
     * @private
     */
    this.scrollArea_ = goog.dom.createDom("div", {
	'id': 'ScrollArea_' + goog.string.createUniqueString(),
	'class' :  moka.ui.ScrollableContainer.SCROLL_AREA_CLASS
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
goog.exportSymbol('moka.ui.ScrollableContainer', moka.ui.ScrollableContainer);



/**
 * @const
 * @type {!number}
 */
moka.ui.ScrollableContainer.MAX_LABEL_LENGTH = 30;



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.ID_PREFIX = 'moka.ui.ScrollableContainer';



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.CSS_CLASS_PREFIX = 
    goog.getCssName(
      moka.ui.ScrollableContainer.ID_PREFIX.replace(/\./g,'-').toLowerCase());



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.ELEMENT_CLASS =  
    goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, '');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SCROLL_AREA_CLASS =  
    goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		    'scrollarea');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS =  
goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-widget');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SLIDER_THUMB_CLASS =  
goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-thumb');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS =  
goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'slider-thumb-hovered');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SLIDER_TRACK_HOVERED_CLASS =  
goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'slider-track-hovered');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ScrollableContainer.SLIDER_TRACK_CLASS =  
goog.getCssName(moka.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'slider-track');



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
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided elements.
 * @param {!Element} element The element to listen for the mousewheel event 
 *     that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback to fire as the 
 *     mousewheel scrolls.
 * @public
 */
moka.ui.ScrollableContainer.prototype.bindToMouseWheel = function(element, 
								opt_callback) {
    this.Slider_.bindToMouseWheel(element, opt_callback);
}




/**
 * Sets the default styles for the various components.
 * @private
 */
moka.ui.ScrollableContainer.prototype.setSliderStyles_ = function(){
    goog.dom.classes.add(this.Slider_.getElement(), 
			 moka.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS);
    goog.dom.classes.add(this.Slider_.getThumb(), 
			 moka.ui.ScrollableContainer.SLIDER_THUMB_CLASS);
    goog.dom.classes.add(this.Slider_.getTrack(), 
			 moka.ui.ScrollableContainer.SLIDER_TRACK_CLASS);
    this.Slider_.setHoverClasses(
	moka.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS,
	moka.ui.ScrollableContainer.SLIDER_TRACK_HOVERED_CLASS);
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
	var sendVal = /**@type {!number}*/
	    Math.abs(this.Slider_.getValue() - 100);
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
    this.Slider_['EVENTS'].onEvent('SLIDE', 
				   this.mapSliderToContents.bind(this));  
    this.Slider_.bindToMouseWheel(this.element_);
}

















