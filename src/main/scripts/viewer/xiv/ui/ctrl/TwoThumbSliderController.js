/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

//
goog.require('moka.style');

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


    /**
        this.menuMap_[slider.file]['xtkObj'].lowerThreshold = 
	    slider.getValue();
        this.menuMap_[slider.file]['xtkObj'].upperThreshold = 
	    slider.getValue() + slider.getExtent();
    */
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

    //------------------
    // Make the slider element.
    //------------------
    var elt = goog.dom.createDom('div', {
	'id' : 'ThresholdSlider_' + goog.string.createUniqueString(),
    });    


    //------------------
    // Make the track element.
    //------------------
    var track = goog.dom.createDom('div', {
	'id' : 'ThwoThumbSlider_track_'+ goog.string.createUniqueString(),
	'class' : xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_TRACK
    });    
    goog.dom.append(elt, track);



    /**
     * @type {!goog.ui.TwoThumbSlider}
     * @private
     */
    this.slider_ = new goog.ui.TwoThumbSlider;
    this.slider_.decorate(elt);



    //------------------
    // NOTE: this is here because google closure changes the 
    // CSS when we apply the decorate method to 'elt'.
    //------------------    
    goog.dom.classes.add(elt, 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER);



    //-------------------
    // We need to change the CSS of all of the slider's child
    // elements.
    //-------------------
    goog.dom.classes.add(this.slider_.getValueThumb(), 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB);
    moka.style.setHoverClass(this.slider_.getValueThumb(),  
		xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_HOVER);

    goog.dom.classes.add(this.slider_.getExtentThumb(), 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB);
    moka.style.setHoverClass(this.slider_.getExtentThumb(),  
		xiv.ui.ctrl.TwoThumbSliderController.CSS.SLIDER_THUMB_HOVER);



    this.setComponent(elt);



    this.slider_.setMinimum(-1000);
    this.slider_.setMaximum(1000);
    this.slider_.setValue(this.slider_.getMinimum());
    this.slider_.setExtent(2000);
    this.slider_.setStep(1);


    // Events
    goog.events.listen(this.slider_, goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))


    /**
    if (opt_args) {
	if (opt_args['maximum'])  {this.slider_.setMaximum(opt_args['maximum'])};
	if (opt_args['minimum'])  {this.slider_.setMaximum(opt_args['minimum'])};
	if (opt_args['step'])  {this.slider_.setStep(opt_args['step'])} ;
	if (opt_args['value'])  {this.slider_.setValue(opt_args['value'])};
	if (opt_args['extent'])  {this.slider_.setExtent(opt_args['extent'])};
    }
    


    return {'slider': slider, 'element': elt};
    */
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
    this.valueInput_.step = this.slider_.getStep();
    this.valueInput_.min = this.slider_.getMinimum();
    this.valueInput_.max = this.slider_.getMaximum();
    this.valueInput_.value = this.slider_.getValue();

    // Classes
    goog.dom.classes.add(this.valueInput_, 
		xiv.ui.ctrl.TwoThumbSliderController.CSS.VALUE_INPUT);
    goog.dom.append(this.getElement(), this.valueInput_);
    
    // Events
    goog.events.listen(this.valueInput_, goog.events.EventType.INPUT, 
		       this.onValueInput_.bind(this));
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
    this.extentInput_.step = this.slider_.getStep();
    this.extentInput_.min = this.slider_.getMinimum();
    this.extentInput_.max = this.slider_.getMaximum();
    this.extentInput_.value = this.slider_.getExtent() + 
	this.slider_.getValue();

    // Classes
    goog.dom.classes.add(this.extentInput_, 
			 xiv.ui.ctrl.TwoThumbSliderController.CSS.EXTENT_INPUT);
    goog.dom.append(this.getElement(), this.extentInput_);
    
    // Events
    goog.events.listen(this.extentInput_, goog.events.EventType.INPUT, 
		       this.onExtentInput_.bind(this));
}



/**
 * Callback for when a value in inputted in the value input box (left).
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.onValueInput_ = function(e){
    var val = parseInt(this.valueInput_.value);
    val = goog.math.clamp(val, this.slider_.getMinimum(),
			  this.slider_.getExtent());
    this.valueInput_.value = val;
    this.slider_.setValue(val);
}



/**
 * Callback for when a value in inputted in the extent input box (right).
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.onExtentInput_ = function(e){;
    var val = parseInt(this.extentInput_.value);
    val = goog.math.clamp(val, this.slider_.getValue(),
			  this.slider_.getMaximum());
    this.extentInput_.value = this.slider_.getValue() + val;
    this.slider_.setExtent(
	Math.abs(this.slider_.getValue()) + Math.abs(val));
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.TwoThumbSliderController.prototype.dispatchComponentEvent = 
function(){
    var val = this.slider_.getValue();
    var ext = this.slider_.getExtent();
    this.valueInput_.value = val;
    this.extentInput_.value = val + ext;
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	lower: val,
	upper: ext + val,
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
	this.slider_.disposeInternal();
	delete this.slider_;
    }

    // Value Input
    if (goog.isDefAndNotNull(this.valueInput_)){
	goog.events.removeAll(this.valueInput_);
	goog.dom.remove(this.valueInput_);
	delete this.valueInput_;
    }

    // Extent Input
    if (goog.isDefAndNotNull(this.extentInput_)){
	goog.events.removeAll(this.extentInput_);
	goog.dom.remove(this.extentInput_);
	delete this.extentInput_;
    }
}




