/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

//
goog.require('nrg.style');

// xiv
goog.require('xiv.ui.ctrl.XtkController');



/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.TwoThumbSliderController = function(){
    goog.base(this);
    this.setLabel('TwoThumb');
    this.createSlider_();
    this.createValueInput_();
    this.createExtentInput_();
}
goog.inherits(xiv.ui.ctrl.TwoThumbSliderController, 
	      xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.TwoThumbSliderController', 
		  xiv.ui.ctrl.TwoThumbSliderController);




/**
 * @const
 * @public
 */
xiv.ui.ctrl.TwoThumbSliderController.ID_PREFIX =  
'xiv.ui.ctrl.TwoThumbSliderController';




/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.TwoThumbSliderController.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_EXTENT: 'slider-thumb-extent',
    SLIDER_THUMB_VALUE: 'slider-thumb-value',
    SLIDER_THUMB_HOVER: 'slider-thumb-hover',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_HOVER: 'slider-track-hover',
    VALUE_INPUT: 'value-input',
    EXTENT_INPUT: 'extent-input',
};




/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.createSlider_ = function() {


    /**
     * @type {!goog.ui.TwoThumbSlider}
     * @private
     */
    this.slider_ = new goog.ui.TwoThumbSlider;
    this.slider_.createDom();

    //
    // The slider container
    //
    var elt = this.slider_.getElement();
    elt.setAttribute('id', 
		     'ThresholdSlider_' + goog.string.createUniqueString());
    goog.dom.classes.add(elt, 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER);
    
    //
    // The slider track.
    //
    var track = goog.dom.createDom('div', {
	'id' : 'ThwoThumbSlider_track_'+ goog.string.createUniqueString(),
	'class' : xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_TRACK
    });    
    goog.dom.appendChild(elt, track);


    //
    // Set the component
    //
    this.setComponent(this.slider_);

    //
    // Set the slider classes
    //
    this.setSliderClasses_();

    //
    // Set the slider events
    //
    goog.events.listen(this.slider_, goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}


/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.setSliderClasses_ = function() {


    //-------------------
    // We need to change the CSS of all of the slider's child
    // elements.
    //-------------------
    goog.dom.classes.add(this.slider_.getValueThumb(), 
	xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.slider_.getValueThumb(), 
		xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_VALUE);


    nrg.style.setHoverClass(this.slider_.getValueThumb(),  
		xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_HOVER);


    goog.dom.classes.add(this.slider_.getExtentThumb(), 
	xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.slider_.getExtentThumb(), 
	xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_EXTENT);


    nrg.style.setHoverClass(this.slider_.getExtentThumb(),  
		xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_HOVER);
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.update = function() {
    this.updateSliderThumbPositions_();
    this.updateValueInputParameters_();
    this.updateExtentInputParameters_();
}



/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.updateSliderThumbPositions_ = 
function() {
    //
    // IMPORTANT!!!  This exists because the slider's render function doesn't
    // change the position of the thumbs!!
    //
    var thumbWidth = goog.style.getSize(this.slider_.getValueThumb()).width;
    var sliderRange = this.slider_.getMaximum() - this.slider_.getMinimum();
    var currWidth = goog.style.getSize(
	this.slider_.getElement()).width - thumbWidth;
    var valueThumbLeft = currWidth *
	((this.slider_.getValue() - this.slider_.getMinimum()) / sliderRange);
    var extentThumbLeft = currWidth * (this.slider_.getExtent() / sliderRange);

    //
    // IMPORTANT!!!!!!!
    //
    this.slider_.getValueThumb().style.left = 
	(valueThumbLeft).toString() + 'px';
    this.slider_.getExtentThumb().style.left = 
	(extentThumbLeft).toString() + 'px';
}



/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.updateValueInputParameters_ = 
function() {
    this.valueInput_.step = 1;
    this.valueInput_.min = this.slider_.getMinimum();
    this.valueInput_.max = this.slider_.getMaximum();
    this.valueInput_.value = this.slider_.getValue();
}



/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.updateExtentInputParameters_ = 
function() {
    this.extentInput_.step = 1;
    this.extentInput_.min = this.slider_.getMinimum();
    this.extentInput_.max = this.slider_.getMaximum();
    this.extentInput_.value = this.slider_.getExtent() + 
	this.slider_.getValue();
}



/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.createValueInput_ = function() {
    /**
     * @type {!Element}
     * @private
     */
    this.valueInput_ = goog.dom.createDom('input');
    this.valueInput_.type = 'number';
    
    //
    // Classes
    //
    goog.dom.classes.add(this.valueInput_, 
		xiv.ui.ctrl.TwoThumbSliderController.CSS.VALUE_INPUT);

    //
    // Add element to controller
    //
    goog.dom.append(this.getElement(), this.valueInput_);
    
    //
    // Events
    //
    goog.events.listen(this.valueInput_, goog.events.EventType.INPUT, 
		       this.onValueInput_.bind(this));

    //
    // update
    //
    this.updateValueInputParameters_();
}



/**
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.createExtentInput_ = function() {
    /**
     * @type {!Element}
     * @private
     */
    this.extentInput_ = goog.dom.createDom('input');
    this.extentInput_.type = 'number';

    //
    // Classes
    //
    goog.dom.classes.add(this.extentInput_, 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.EXTENT_INPUT);

    //
    // Add element to controller
    //
    goog.dom.append(this.getElement(), this.extentInput_);
    
    //
    // Events
    //
    goog.events.listen(this.extentInput_, goog.events.EventType.INPUT, 
		       this.onExtentInput_.bind(this));

    //
    // Update
    //
    this.updateExtentInputParameters_();
}



/**
 * Callback for when a value in inputted in the value input box (left).
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.onValueInput_ = function(e){
    window.console.log(e, this.valueInput_);
    var val = parseInt(this.valueInput_.value);
    this.slider_.setValue(val);
}



/**
 * Callback for when a value in inputted in the extent input box (right).
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.onExtentInput_ = function(e){

    //window.console.log(this.extentInput_);

    var val = parseInt(this.extentInput_.value);
    //
    // IMPORTANT!!!!! DO NOT ERASE!!
    //
    // Extent is an absolute.  Even if you're range is from -50 to 50,
    // if you want to set the extent thumb to be to the right, it has to be 100!
    //
    // IMPORTANT!!!
    //
    this.slider_.setExtent(val - this.slider_.getValue());
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.dispatchComponentEvent = 
function(){
    var val = this.slider_.getValue();
    var ext = this.slider_.getExtent() + val;

    this.valueInput_.value = val;
    this.extentInput_.value = ext;

    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	lower: val,
	upper: ext,
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');


    // Slider
    if (goog.isDefAndNotNull(this.slider_)){
	goog.events.removeAll(this.slider_);
	
	//
	// IMPORTANT!!! This is a hack around a google closure bug
	// when disposing of a twoThumbSlider.
	//
	if (!goog.isDefAndNotNull(this.slider_.rangeModel)){
	    this.slider_.rangeModel = new goog.ui.RangeModel;
	}
	this.slider_.dispose();
	delete this.slider_;
    }

    // Value Input
    if (goog.isDefAndNotNull(this.valueInput_)){
	goog.events.removeAll(this.valueInput_);
	goog.dom.removeNode(this.valueInput_);
	delete this.valueInput_;
    }

    // Extent Input
    if (goog.isDefAndNotNull(this.extentInput_)){
	goog.events.removeAll(this.extentInput_);
	goog.dom.removeNode(this.extentInput_);
	delete this.extentInput_;
    }
}




