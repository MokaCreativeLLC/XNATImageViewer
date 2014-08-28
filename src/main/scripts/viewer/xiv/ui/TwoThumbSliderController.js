/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.TwoThumbSliderController');


// goog
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.RangeModel');

// nrg
goog.require('nrg.style');
goog.require('nrg.ui.HoverInput');

// xiv
goog.require('xiv.ui.SliderBase');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.SliderBase}
 */
xiv.ui.TwoThumbSliderController = function(){
    goog.base(this);
    this.setLabel('TwoThumb');
}
goog.inherits(xiv.ui.TwoThumbSliderController, xiv.ui.SliderBase);
goog.exportSymbol('xiv.ui.TwoThumbSliderController', 
		  xiv.ui.TwoThumbSliderController);




/**
 * @const
 * @public
 */
xiv.ui.TwoThumbSliderController.ID_PREFIX =  
'xiv.ui.TwoThumbSliderController';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.TwoThumbSliderController.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_TRACK: 'slider-track',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_EXTENT: 'slider-thumb-extent',
    EXTENT_INPUT: 'extent-input',
};




/**
 * @type {?nrg.ui.HoverInput}
 * @protected
 */
xiv.ui.TwoThumbSliderController.prototype.extentInput = null;



/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.render = 
function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.valueInput.setDisplayAlignment('left');
    this.extentInput = this.createInputBox(this.onExtentInput_.bind(this));
}




/**
 * @return {nrg.ui.HoverInput}
 * @public
 */
xiv.ui.TwoThumbSliderController.prototype.getExtentInput = function() {
    return this.extentInput;
}



/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.createSlider = function() {


    /**
     * @type {!goog.ui.TwoThumbSlider}
     * @private
     */
    this.slider = new goog.ui.TwoThumbSlider;
    this.slider.createDom();

    //
    // The slider container
    //
    var elt = this.slider.getElement();
    elt.setAttribute('id', 
		     'ThresholdSlider_' + goog.string.createUniqueString());
    goog.dom.classes.add(elt, 
			 xiv.ui.SliderBase.CSS.SLIDER);
    goog.dom.classes.add(elt, 
			 xiv.ui.TwoThumbSliderController.CSS.SLIDER);
    
    //
    // The slider track.
    //
    var track = goog.dom.createDom('div', {
	'id' : 'ThwoThumbSlider_track_'+ goog.string.createUniqueString(),
	'class' : xiv.ui.SliderBase.CSS.SLIDER_TRACK
    });    
    goog.dom.appendChild(elt, track);
    goog.dom.classes.add(track, 
			 xiv.ui.TwoThumbSliderController.CSS.SLIDER_TRACK);


    //
    // Set the component
    //
    this.setComponent(this.slider);

    //
    // Set the slider classes
    //
    this.setSliderClasses_();

    //
    // Set the slider events
    //
    goog.events.listen(this.slider, 
		       goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}


/**
 * @private
 */
xiv.ui.TwoThumbSliderController.prototype.setSliderClasses_ = function() {

    //
    // Value Thumb
    //
    goog.dom.classes.add(this.slider.getValueThumb(), 
	xiv.ui.SliderBase.CSS.SLIDER_THUMB);


    goog.dom.classes.add(this.slider.getValueThumb(), 
		xiv.ui.TwoThumbSliderController.CSS.SLIDER_THUMB);

    goog.dom.classes.add(this.slider.getValueThumb(), 
		xiv.ui.TwoThumbSliderController.CSS.SLIDER_THUMB_VALUE);

    nrg.style.setHoverClass(this.slider.getValueThumb(),  
		xiv.ui.SliderBase.CSS.SLIDER_THUMB_HOVER);


    //
    // Extent Thumb
    //
    goog.dom.classes.add(this.slider.getExtentThumb(), 
	xiv.ui.SliderBase.CSS.SLIDER_THUMB);

    goog.dom.classes.add(this.slider.getExtentThumb(), 
		xiv.ui.TwoThumbSliderController.CSS.SLIDER_THUMB);

    goog.dom.classes.add(this.slider.getExtentThumb(), 
	xiv.ui.TwoThumbSliderController.CSS.SLIDER_THUMB_EXTENT);

    nrg.style.setHoverClass(this.slider.getExtentThumb(),  
		xiv.ui.SliderBase.CSS.SLIDER_THUMB_HOVER);
}



/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.refresh = function() {
    goog.base(this, 'refresh');
    if (goog.isDefAndNotNull(this.extentInput)){
	this.syncInputToSlider(this.extentInput);
    }
    this.refreshSliderThumbPositions_();
}




/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.syncInputToSlider = 
function(input) {
    goog.base(this, 'syncInputToSlider', input);
    if (goog.isDefAndNotNull(this.extentInput) && 
	(input == this.extentInput)){
	    this.extentInput.setValue(this.slider.getExtent() + 
				      this.slider.getValue());
	
    }
}




/**
 * @param {!number} val
 * @param {!number} ext
 * @public
 */
xiv.ui.TwoThumbSliderController.prototype.setValueAndExtent = 
function(val, ext){
    this.slider.setValueAndExtent(val, ext);
}



/**
 * @param {!number} ext
 * @public
 */
xiv.ui.TwoThumbSliderController.prototype.setExtent = function(ext){
    this.slider.setExtent(ext);
}



/**
 * @return {!number}
 * @public
 */
xiv.ui.TwoThumbSliderController.prototype.getExtent = function(){
    //window.console.log('Get extent', this.slider.getExtent());
    return this.slider.getExtent();
}



/**
 * @private
 */
xiv.ui.TwoThumbSliderController.prototype.refreshSliderThumbPositions_ = 
function() {


    var xObj = this.getXObj();
    var _imageMin = parseInt(xObj['min']);
    var _imageMax = parseInt(xObj['max']);

    if (!goog.isDefAndNotNull(xObj)) { return };

    if (_imageMin != this.slider.getMinimum() || 
	_imageMax != this.slider.getMaximum()){
	this.slider.setMinimum(_imageMin);
	this.slider.setMaximum(_imageMax);
	this.slider.setValueAndExtent(_imageMax - _imageMin);
	this.slider.setValue(_imageMin);
	this.slider.setStep(1);

    }
		      
    //
    // IMPORTANT!!!  This exists because the slider's render function doesn't
    // change the position of the thumbs!!
    //
    var thumbWidth = goog.style.getSize(this.slider.getValueThumb()).width;
    var sliderRange = this.slider.getMaximum() - this.slider.getMinimum();
    var currWidth = goog.style.getSize(
	this.slider.getElement()).width - thumbWidth;
    var valueThumbLeft = currWidth *
	((this.slider.getValue() - this.slider.getMinimum()) / sliderRange);
    var extentThumbLeft = currWidth * (this.slider.getExtent() / sliderRange);
    
    //window.console.log(valueThumbLeft, extentThumbLeft)
    //
    // IMPORTANT!!!!!!!
    //
    this.slider.getValueThumb().style.left = 
	(valueThumbLeft).toString() + 'px';
    this.slider.getExtentThumb().style.left = 
	(extentThumbLeft).toString() + 'px';
}




/**
 * Callback for when a value in inputted in the extent input box (right).
 * 
 * @param {Event}
 * @private
 */
xiv.ui.TwoThumbSliderController.prototype.onExtentInput_ = function(e){

    //window.console.log(this.extentInput);

    var val = parseInt(this.extentInput.getValue());
    //
    // IMPORTANT!!!!! DO NOT ERASE!!
    //
    // Extent is an absolute.  Even if you're range is from -50 to 50,
    // if you want to set the extent thumb to be to the right, it has to be 100!
    //
    // IMPORTANT!!!
    //
    this.slider.setExtent(val - this.slider.getValue());
}



/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.dispatchComponentEvent = 
function(){
    var val = this.slider.getValue();
    var ext = this.slider.getExtent() + val;

    this.valueInput.setValue(val);
    this.extentInput.setValue(ext);

    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
	lower: val,
	upper: ext,
    })
}



/**
 * @inheritDoc
 */
xiv.ui.TwoThumbSliderController.prototype.disposeInternal = function() {

    // Slider
    if (goog.isDefAndNotNull(this.slider)){
	goog.events.removeAll(this.slider);
	
	//
	// IMPORTANT!!! This is a hack around a google closure bug
	// when disposing of a twoThumbSlider.
	//
	if (!goog.isDefAndNotNull(this.slider.rangeModel)){
	    this.slider.rangeModel = new goog.ui.RangeModel;
	}
	this.slider.dispose();
	delete this.slider;
    }

    goog.base(this, 'disposeInternal');

    // Extent Input
    if (goog.isDefAndNotNull(this.extentInput)){
	this.extentInput.dispose();
	delete this.extentInput;
    }
}




goog.exportSymbol('xiv.ui.TwoThumbSliderController.ID_PREFIX',
	xiv.ui.TwoThumbSliderController.ID_PREFIX);
goog.exportSymbol('xiv.ui.TwoThumbSliderController.CSS_SUFFIX',
	xiv.ui.TwoThumbSliderController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.TwoThumbSliderController.prototype.refresh',
	xiv.ui.TwoThumbSliderController.prototype.refresh);


//
// Protected
//
goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.extentInput',
    xiv.ui.TwoThumbSliderController.prototype.extentInput);




//
// Public
//
goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.getExtentInput',
    xiv.ui.TwoThumbSliderController.prototype.getExtentInput);
goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.setValueAndExtent',
    xiv.ui.TwoThumbSliderController.prototype.setValueAndExtent);

goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.setExtent',
    xiv.ui.TwoThumbSliderController.prototype.setExtent);

goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.getExtent',
    xiv.ui.TwoThumbSliderController.prototype.getExtent);


goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.dispatchComponentEvent',
    xiv.ui.TwoThumbSliderController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.TwoThumbSliderController.prototype.disposeInternal',
    xiv.ui.TwoThumbSliderController.prototype.disposeInternal);
