/**
 * @author sunilk@mokacreativellc.com
 */

// goog
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.events');

// nrg
goog.require('nrg.fx');
goog.require('nrg.dom');
goog.require('nrg.convert');
goog.require('nrg.style');
goog.require('nrg.string');
goog.require('nrg.ui.Slider');
goog.require('nrg.ui.Component');




/**
 * nrg.ui.ScrollableContainer allows the user to input contents to create a 
 * scrollable div.  It's a compound object that uses goog.ui.AnimatedZippy or 
 * goog.ui.Zippy (for condensing contents and creating folders) and 
 * nrg.ui.Slider for scrolling through the contents.
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('nrg.ui.ScrollableContainer');
nrg.ui.ScrollableContainer = function (opt_args) {
    goog.base(this);
}
goog.inherits(nrg.ui.ScrollableContainer, nrg.ui.Component);
goog.exportSymbol('nrg.ui.ScrollableContainer', nrg.ui.ScrollableContainer);



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
nrg.ui.ScrollableContainer.ID_PREFIX = 'nrg.ui.ScrollableContainer';



/**
 * @enum {string} 
 * @const
 */ 
nrg.ui.ScrollableContainer.CSS_SUFFIX = {
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
nrg.ui.ScrollableContainer.MAX_LABEL_LENGTH = 30;



/**
 * @type {Element}
 * @private
 */
nrg.ui.ScrollableContainer.prototype.scrollArea_;



/**
 * @type {nrg.ui.Slider}
 * @protected
 */
nrg.ui.ScrollableContainer.prototype.Slider;



/**
 * @private
 */
nrg.ui.ScrollableContainer.prototype.createScrollArea_ = function() {
    this.scrollArea_ = goog.dom.createDom("div", {
	'id': this.constructor.ID_PREFIX + 
	    '_ScrollArea_' + goog.string.createUniqueString(),
	'class' :  nrg.ui.ScrollableContainer.CSS.SCROLLAREA
    });
    goog.dom.appendChild(this.getElement(), this.scrollArea_);
}



/**
 * @inheritDoc
 */
nrg.ui.ScrollableContainer.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
 

    if (!goog.isDefAndNotNull(this.scrollArea_)){
	this.createScrollArea_();
    }


    //
    // Create Slider
    //
    this.Slider = new nrg.ui.Slider('vertical');
    this.Slider.render(this.getElement());

    //
    // Set Slider UI and callbacks
    //
    this.setSliderEvents_();
    this.setSliderStyles_();
    this.updateStyle();
    this.mapSliderToContents();
}




/**
 * Allows user to add an element and the folders from which it belongs to.
 * @param {!Element} elt
 * @public
 */
nrg.ui.ScrollableContainer.prototype.addContents = function(elt) {
    if (!this.isInDocument()){
	this.render();
    }
    goog.dom.append(this.scrollArea_, elt);
    this.mapSliderToContents();
}



/**
 * Returns the primary element.
 * @return {!Element} The ScrollableContainer main element.
 * @public
 */
nrg.ui.ScrollableContainer.prototype.getElement = function(){
    return this.element_;
}



/**
 * As stated.
 * @return {!nrg.ui.Slider} The Slider object.
 * @public
 */
nrg.ui.ScrollableContainer.prototype.getSlider = function(){
    return this.Slider;
}



/**
 * As stated.
 * @return {!Element} The Slider object.
 * @public
 */
nrg.ui.ScrollableContainer.prototype.getScrollArea = function(){
    return this.scrollArea_;
}



/**
 * Generic updateStyle method. 
 * @param {Object=} opt_args The style object to apply.
 * @public
 */
nrg.ui.ScrollableContainer.prototype.updateStyle = function (opt_args) {
    if (opt_args) { nrg.style.setStyle(this.element_, opt_args) }
}



/**
 * Sets the default styles for the various components.
 * @private
 */
nrg.ui.ScrollableContainer.prototype.setSliderStyles_ = function(){
    goog.dom.classes.add(this.Slider.getElement(), 
			 nrg.ui.ScrollableContainer.CSS.SLIDER);
    goog.dom.classes.add(this.Slider.getThumb(), 
			 nrg.ui.ScrollableContainer.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.Slider.getTrack(), 
			 nrg.ui.ScrollableContainer.CSS.SLIDER_TRACK);

    this.Slider.addThumbHoverClass(
	nrg.ui.ScrollableContainer.CSS.SLIDER_THUMB_HOVERED)

    this.Slider.addTrackHoverClass(
	nrg.ui.ScrollableContainer.CSS.SLIDER_TRACK_HOVERED);
}



/**
 * Refits the sliders track range to suit the height
 * of all of the contents, which is 'scrollArea_'.
 * This should be appled AFTER contents have been set.
 * @protected
 */
nrg.ui.ScrollableContainer.prototype.mapSliderToContents = function () {
    
    var widgetHeight = /**@type {!number}*/ 
    goog.style.getSize(this.element_).height;

    var scrollAreaHeight = /**@type {!number}*/
    goog.style.getSize(this.scrollArea_).height
	
    var beforeRange = /**@type {!Array.number}*/
    [this.Slider.getMinimum(), this.Slider.getMaximum()];

    var afterRange = /**@type {!Array.number}*/
    [0, scrollAreaHeight - widgetHeight];

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
	nrg.style.setStyle(this.Slider.getThumb(), {
	    'opacity': 1,
	    'height': widgetHeight * (widgetHeight / scrollAreaHeight)
	});

	//window.console.log("\n\nmapslider", widgetHeight, scrollAreaHeight);
	//window.console.log("Range", beforeRange, afterRange);
	//window.console.log("NEW HEIGHT", 
	//widgetHeight * (widgetHeight / scrollAreaHeight))

	// Enable the slider
	this.Slider.setEnabled(true);
	

	// Move the scroll area to the top (as the slider's thumbnail
	// is at the top).
	var sendVal = /**@type {!number}*/ this.Slider.getMaximum() - 
	    this.Slider.getValue();
	var remap = /**@type {!number}*/
	    nrg.convert.remap1D(sendVal, beforeRange, afterRange);
	var t = /**@type {!number}*/ remap['remappedVal'];

	nrg.style.setStyle( this.scrollArea_, {'top': -t});	



    //------------------
    // Otherwise we hide and disable the slider.
    //------------------	
    }
    else {
	this.Slider.getThumb().style.opacity = 0;
	this.Slider.setEnabled(false);
	this.Slider.setValue(100);
    }	
}




/**
 * Sets the slider callbacks.
 * @private
 */
nrg.ui.ScrollableContainer.prototype.setSliderEvents_ = function() {
    goog.events.listen(this.Slider, nrg.ui.Slider.EventType.SLIDE,
				   this.mapSliderToContents.bind(this));  
    this.Slider.bindToMouseWheel(this.getElement());
}




/**
 * @inheritDoc
 */
nrg.ui.ScrollableContainer.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    if (goog.isDefAndNotNull(this.Slider)){
	goog.events.removeAll(this.Slider);
	this.Slider.disposeInternal();
	delete this.Slider;
    }
    
    if (goog.isDefAndNotNull(this.scrollArea_)){
	goog.dom.removeNode(this.scrollArea_);
	delete this.scrollArea_;
    }
}
















