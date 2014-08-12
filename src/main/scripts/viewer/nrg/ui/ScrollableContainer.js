/**
 * @author kumar.sunil.p@gmail.com
 */
goog.provide('nrg.ui.ScrollableContainer');

// goog
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');
goog.require('goog.dom.classes');
goog.require('goog.style');

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
 * @expose
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

    //this.Slider.addThumbHoverClass(
    //nrg.ui.ScrollableContainer.CSS.SLIDER_THUMB_HOVERED);
   
    this.Slider.animateOnHover(
	nrg.ui.ScrollableContainer.CSS.SLIDER_THUMB_HOVERED);
}



/**
 * Refits the sliders track range to suit the height
 * of all of the contents, which is 'scrollArea_'.
 * This should be appled AFTER contents have been set.
 * @protected
 */
nrg.ui.ScrollableContainer.prototype.mapSliderToContents = function () {
    //window.console.log("MAP SLIDER TO CONTENTS!");

    var widgetHeight = goog.style.getSize(this.element_).height;
    var scrollAreaHeight = goog.style.getSize(this.scrollArea_).height
    var beforeRange = [this.Slider.getMinimum(), this.Slider.getMaximum()];
    var afterRange = [0, scrollAreaHeight - widgetHeight];
    var sliderThumb = this.Slider.getThumb()


    //window.console.log("MAP SLIDER TO CONTENTS!", widgetHeight, 
    //scrollAreaHeight);


    //------------------
    // If there's the scrollArea (contents) is greater
    // than the height of the container element, then we 
    // enable the slider and reposition the contents so it
    // can be slideable...
    //------------------
    if (widgetHeight < scrollAreaHeight) {

	//
	// Show the slider
	//
	this.Slider.getElement().style.opacity = 1;
 
	var newThumbHeight = Math.round(
	    widgetHeight * (widgetHeight / scrollAreaHeight));

	sliderThumb.style.height = newThumbHeight.toString() + 'px';


	//window.console.log("\n\nmapslider", widgetHeight, scrollAreaHeight);
	//window.console.log("Range", beforeRange, afterRange);
	//window.console.log("NEW HEIGHT", 
	//widgetHeight * (widgetHeight / scrollAreaHeight))

	// Enable the slider
	this.Slider.setEnabled(true);
	

	// Move the scroll area to the top (as the slider's thumbnail
	// is at the top).
	var sendVal = this.Slider.getMaximum() - this.Slider.getValue();
	var remap = nrg.convert.remap1D(sendVal, beforeRange, afterRange);
	var t = remap['remappedVal'];

	//nrg.style.setStyle( this.scrollArea_, {'top': -t});
	this.scrollArea_.style.top = (-t).toString() + 'px';
	//window.console.log(this.Slider.getThumb().style.top);
	

    //------------------
    // Otherwise we hide and disable the slider.
    //------------------	
    }
    else {
	//
	// Hide the slider
	//
	this.Slider.getElement().style.opacity = 0;
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
	this.Slider.dispose();
	delete this.Slider;
    }
    
    if (goog.isDefAndNotNull(this.scrollArea_)){
	goog.dom.removeNode(this.scrollArea_);
	delete this.scrollArea_;
    }
}




goog.exportSymbol('nrg.ui.ScrollableContainer.ID_PREFIX',
	nrg.ui.ScrollableContainer.ID_PREFIX);
goog.exportSymbol('nrg.ui.ScrollableContainer.CSS_SUFFIX',
	nrg.ui.ScrollableContainer.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ScrollableContainer.MAX_LABEL_LENGTH',
	nrg.ui.ScrollableContainer.MAX_LABEL_LENGTH);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.render',
	nrg.ui.ScrollableContainer.prototype.render);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.addContents',
	nrg.ui.ScrollableContainer.prototype.addContents);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.getElement',
	nrg.ui.ScrollableContainer.prototype.getElement);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.getSlider',
	nrg.ui.ScrollableContainer.prototype.getSlider);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.getScrollArea',
	nrg.ui.ScrollableContainer.prototype.getScrollArea);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.updateStyle',
	nrg.ui.ScrollableContainer.prototype.updateStyle);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.mapSliderToContents',
	nrg.ui.ScrollableContainer.prototype.mapSliderToContents);
goog.exportSymbol('nrg.ui.ScrollableContainer.prototype.disposeInternal',
	nrg.ui.ScrollableContainer.prototype.disposeInternal);








