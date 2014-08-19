/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.SliderController');


// goog
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.math');

// nrg
goog.require('nrg.ui.Slider');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.SliderController = function(){
    goog.base(this);
    this.setLabel('Master Opacity');
}
goog.inherits(xiv.ui.ctrl.SliderController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.SliderController', xiv.ui.ctrl.SliderController);




/**
 * @const
 * @public
 */
xiv.ui.ctrl.SliderController.ID_PREFIX =  'xiv.ui.ctrl.SliderController';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.SliderController.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVER: 'slider-thumb-hover',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_HOVER: 'slider-track-hover',
    VALUE_INPUT: 'value-input',
};


/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.valueDecimals_ = 2;


/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.sliderValueBeforeValueInput_;


/**
 * @param {!number} num
 * @public
 */
xiv.ui.ctrl.SliderController.prototype.setValueDecimals = function(num){
    this.valueDecimals_ = num;
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.createSlider_();
    this.createValueInput_();
}


/**
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.createSlider_ = function() {
    var slider = new nrg.ui.Slider();
    this.setComponent(slider);

    // Inits
    slider.setMinimum(0);
    slider.setMaximum(1);
    slider.setStep(.01);
    slider.setValue(1);

    // Classes
    goog.dom.classes.add(slider.getElement(), 
			 xiv.ui.ctrl.SliderController.CSS.SLIDER);
    goog.dom.classes.add(slider.getThumb(), 
			 xiv.ui.ctrl.SliderController.CSS.SLIDER_THUMB);
    goog.dom.classes.add(slider.getTrack(),
			 xiv.ui.ctrl.SliderController.CSS.SLIDER_TRACK);

    // Hover classes
    slider.addThumbHoverClass(
	xiv.ui.ctrl.SliderController.CSS.SLIDER_THUMB_HOVER);
    slider.addTrackHoverClass(
	xiv.ui.ctrl.SliderController.CSS.SLIDER_TRACK_HOVER);

    // Events
    goog.events.listen(this.getComponent(), 
		       nrg.ui.Slider.EventType.SLIDE, 
    		       this.dispatchComponentEvent.bind(this))
    
    
    slider.getElement().style.zIndex = 0;
}



/**
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.createValueInput_ = function() {
    var slider = this.getComponent();

    /**
     * @type {!Element}
     * @private
     */
    this.valueInput_ = goog.dom.createDom('input');
    this.valueInput_.type = 'number';


    // Classes
    goog.dom.classes.add(this.valueInput_, 
			 xiv.ui.ctrl.SliderController.CSS.VALUE_INPUT);
    goog.dom.append(this.getElement(), this.valueInput_);
    
    // Events
    goog.events.listen(this.valueInput_, goog.events.EventType.INPUT, 
		       this.onValueInput_.bind(this));

    this.update();
}




/**
 * Callback for when a value in inputted in the input box.
 * 
 * @return {number}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.getSliderValueBeforeValueInput 
= function(){
    return this.sliderValueBeforeValueInput_;
}



/**
 * Callback for when a value in inputted in the input box.
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.onValueInput_ = function(e){

    window.console.log("INPUT");
    var slider = this.getComponent();
    var val = parseFloat(this.valueInput_.value);
    val = goog.math.clamp(val, slider.getMinimum(),
			  slider.getMaximum());
    this.valueInput_.value = val;
    //window.console.log("on value input", val);
    
    this.sliderValueBeforeValueInput_ = slider.getValue();
    slider.setValue(val);
}



/**
 * @return {Element}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.getValueInput = function(e){
    return this.valueInput_;
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.dispatchComponentEvent = function(){

    var component = this.getComponent();
    var val = component.getValue().toFixed(this.valueDecimals_);
    var previousValue = parseInt(this.valueInput_.value);
    this.valueInput_.value = val;

    //window.console.log("SLIDER", val);
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	value: val,
	minimum: component.getMinimum(),
	maximum: component.getMaximum(),
	previous: previousValue
    })
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.update = function() {
    //
    // Updates the component (to be safe)
    //
    var component = this.getComponent();
    var oldValue = component.getValue();
    component.updateStyle();
    component.setValue(0);
    component.setValue(oldValue);

    //
    // Sync the input box with the slider
    //
    if (component.getStep() !== this.valueInput_.step){
	this.valueInput_.step = component.getStep();
    }
    if (component.getMinimum() !== this.valueInput_.min) {
	this.valueInput_.min = component.getMinimum();
    }
    if (component.getMaximum() !== this.valueInput_.max) {
	this.valueInput_.max = component.getMaximum();
    }
    if (component.getValue() !== this.valueInput_.value) {
	this.valueInput_.value = oldValue;
    }

    /*
    window.console.log("\n   SLIDER:", 
		       "\nstep: ", component.getStep(),
		       "\nmin: ", component.getMinimum(),
		       "\nmax: ", component.getMaximum(),
		       "\nvalue: ", component.getValue());


    window.console.log("   VALUE:", 
		       "\nstep: ", this.valueInput_.step,
		       "\nmin: ", this.valueInput_.min,
		       "\nmax: ", this.valueInput_.max,
		       "\nvalue: ", this.valueInput_.value);
		       */
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.valueDecimals_;
    delete this.sliderValueBeforeValueInput_;

    // ValueInput
    if (goog.isDefAndNotNull(this.valueInput_)){
	goog.events.removeAll(this.valueInput_);
	goog.dom.removeNode(this.valueInput_);
	delete this.valueInput_;
    }
}



goog.exportSymbol('xiv.ui.ctrl.SliderController.ID_PREFIX',
	xiv.ui.ctrl.SliderController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.SliderController.CSS_SUFFIX',
	xiv.ui.ctrl.SliderController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.SliderController.prototype.setValueDecimals',
	xiv.ui.ctrl.SliderController.prototype.setValueDecimals);
goog.exportSymbol('xiv.ui.ctrl.SliderController.prototype.render',
	xiv.ui.ctrl.SliderController.prototype.render);
goog.exportSymbol('xiv.ui.ctrl.SliderController.prototype.getValueInput',
	xiv.ui.ctrl.SliderController.prototype.getValueInput);
goog.exportSymbol(
    'xiv.ui.ctrl.SliderController.prototype.dispatchComponentEvent',
    xiv.ui.ctrl.SliderController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.ctrl.SliderController.prototype.getSliderValueBeforeValueInput',
    xiv.ui.ctrl.SliderController.prototype.getSliderValueBeforeValueInput);
goog.exportSymbol('xiv.ui.ctrl.SliderController.prototype.update',
	xiv.ui.ctrl.SliderController.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.SliderController.prototype.disposeInternal',
	xiv.ui.ctrl.SliderController.prototype.disposeInternal);




