/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.SliderBase');


// goog
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.math');

// nrg
goog.require('nrg.ui.Slider');
goog.require('nrg.ui.HoverInput');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.SliderBase = function(){
    goog.base(this);
    this.setLabel('Slider');
}
goog.inherits(xiv.ui.ctrl.SliderBase, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.SliderBase', xiv.ui.ctrl.SliderBase);




/**
 * @const
 * @public
 */
xiv.ui.ctrl.SliderBase.ID_PREFIX =  'xiv.ui.ctrl.SliderBase';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.SliderBase.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVER: 'slider-thumb-hover',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_HOVER: 'slider-track-hover',
    VALUEINPUT: 'valueinput',
    VALUEINPUT_DISPLAY: 'valueinput-display',
    VALUEINPUT_BOX: 'valueinput-box',
};


/**
 * @type {number}
 * @protected
 */
xiv.ui.ctrl.SliderBase.prototype.displayDecimals = 2;




/**
 * @type {?nrg.ui.HoverInput}
 * @protected
 */
xiv.ui.ctrl.SliderBase.prototype.valueInput = null;



/**
 * @type {goog.ui.component}
 * @protected
 */
xiv.ui.ctrl.SliderBase.prototype.slider = null;



/**
 * @param {!number} num
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.setDisplayDecimals = function(num){
    this.displayDecimals = num;
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderBase.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.createSlider();
    this.valueInput = this.createInputBox(this.onValueInput_.bind(this));
}


/**
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.createSlider = function() {
    this.slider = new nrg.ui.Slider();
    this.setComponent(this.slider);

    // Inits
    this.slider.setMinimum(0);
    this.slider.setMaximum(1);
    this.slider.setStep(.01);
    this.slider.setValue(1);

    // Classes
    goog.dom.classes.add(this.slider.getElement(), 
			 xiv.ui.ctrl.SliderBase.CSS.SLIDER);
    goog.dom.classes.add(this.slider.getThumb(), 
			 xiv.ui.ctrl.SliderBase.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.slider.getTrack(),
			 xiv.ui.ctrl.SliderBase.CSS.SLIDER_TRACK);

    // Hover classes
    this.slider.addThumbHoverClass(
	xiv.ui.ctrl.SliderBase.CSS.SLIDER_THUMB_HOVER);
    this.slider.addTrackHoverClass(
	xiv.ui.ctrl.SliderBase.CSS.SLIDER_TRACK_HOVER);

    // Events
    goog.events.listen(this.slider, 
		       nrg.ui.Slider.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
    
    
    this.slider.getElement().style.zIndex = 0;
}



/**
 * @param {!Function} inputCallback
 * @protected
 */
xiv.ui.ctrl.SliderBase.prototype.createInputBox = 
function(inputCallback) {

    var inputObj = new nrg.ui.HoverInput();
    

    // Classes
    inputObj.render(this.getElement());
    goog.dom.classes.add(inputObj.getElement(), 
			 xiv.ui.ctrl.SliderBase.CSS.VALUEINPUT);
    goog.dom.classes.add(inputObj.getDisplayElement(), 
			 xiv.ui.ctrl.SliderBase.CSS.VALUEINPUT_DISPLAY);
    goog.dom.classes.add(inputObj.getInputElement(), 
			 xiv.ui.ctrl.SliderBase.CSS.VALUEINPUT_BOX);
    
    // Events
    goog.events.listen(inputObj, 
		       nrg.ui.HoverInput.EventType.INPUT, 
		       inputCallback);
    return inputObj;
}




/**
 * Callback for when a value in inputted in the input box.
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.SliderBase.prototype.onValueInput_ = function(e){

    window.console.log("INPUT", e);

    var val = parseFloat(this.valueInput.getValue());
    val = goog.math.clamp(val, this.slider.getMinimum(),
			  this.slider.getMaximum());
    this.valueInput.setValue(val);
    //window.console.log("on value input", val);
    this.slider.setValue(val);
}



/**
 * @return {nrg.ui.HoverInput}
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.getValueInput = function(e){
    return this.valueInput;
}



/**
 * @param {!number} val
 * @param {boolean=} opt_setValueInput
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.setValue = function(val){
    this.slider.setValue(val);
    this.valueInput.setEnabled(false);
    this.valueInput.setValue(val);
    this.valueInput.setEnabled(true);
    
}


/**
 * @param {!number} max
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.setMaximum = function(max){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setMaximum(max);
    }
    this.slider.setMaximum(max);
    this.update();
}



/**
 * @param {!number} step
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.setStep = function(step){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setStep(step);
    }
    this.slider.setStep(step);
    this.update();
}



/**
 * @param {!number} min
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.setMinimum = function(min){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setMinimum(min);
    }
    this.slider.setMinimum(min);
    this.update();
}



/**
 * @return {!number}
 * @private
 */
xiv.ui.ctrl.SliderBase.prototype.getValue = function(){
    return this.slider.getValue();
}


/**
 * @return {!number}
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.getMaximum = function(){
    return this.slider.getMaximum();
}



/**
 * @return {!number} 
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.getStep = function(){
    return this.slider.getStep();
}



/**
 * @return {!number} 
 * @public
 */
xiv.ui.ctrl.SliderBase.prototype.getMinimum = function(){
    return this.slider.getMinimum();
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderBase.prototype.dispatchComponentEvent = function(){

    var val = this.slider.getValue().toFixed(this.displayDecimals);
    var previousValue = this.slider.getPreviousValue();

    if (goog.isDefAndNotNull(this.valueInput)) { 
	this.valueInput.setValue(val);
    }


    //window.console.log("SLIDER", val);
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	value: val,
	minimum: this.slider.getMinimum(),
	maximum: this.slider.getMaximum(),
	previous: previousValue
    })
}



/**
 * @param {?nrg.ui.HoverInput}
 * @protected
 */
xiv.ui.ctrl.SliderBase.prototype.syncInputToSlider = function(input) {
    if (!goog.isDefAndNotNull(input)){return}
    
    //
    // Sync the input box with the slider
    //
    if (this.slider.getStep() !== input.getStep()){
	input.setStep(this.slider.getStep());
    }
    if (this.slider.getMinimum() !== input.getMinimum()) {
	input.setMinimum(this.slider.getMinimum());
    }
    if (this.slider.getMaximum() !== input.getMaximum()) {
	input.setMaximum(this.slider.getMaximum());
    }
    if (this.slider.getValue() !== input.getValue()) {
	input.setValue(this.slider.getValue());
    }
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderBase.prototype.update = function() {
    //
    // Updates the component (to be safe)
    //
    var oldValue = this.slider.getValue();
    if (this.slider instanceof nrg.ui.Component){
	this.slider.updateStyle();
    }
    this.slider.setValue(0);
    this.slider.setValue(oldValue);
    this.syncInputToSlider(this.valueInput);
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderBase.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.displayDecimals;

    // ValueInput
    if (goog.isDefAndNotNull(this.slider)){
	this.slider.dispose();
	delete this.slider;
    }


    // ValueInput
    if (goog.isDefAndNotNull(this.valueInput)){
	this.valueInput.dispose();
	delete this.valueInput;
    }
}



goog.exportSymbol('xiv.ui.ctrl.SliderBase.ID_PREFIX',
	xiv.ui.ctrl.SliderBase.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.SliderBase.CSS_SUFFIX',
	xiv.ui.ctrl.SliderBase.CSS_SUFFIX);

//
// Protected 
//
goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.slider',
    xiv.ui.ctrl.SliderBase.prototype.slider);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.displayDecimals',
    xiv.ui.ctrl.SliderBase.prototype.displayDecimals);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.valueInput',
    xiv.ui.ctrl.SliderBase.prototype.valueInput);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.createSlider',
    xiv.ui.ctrl.SliderBase.prototype.createSlider);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.createInputBox',
    xiv.ui.ctrl.SliderBase.prototype.createInputBox);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.dispatchComponentEvent',
    xiv.ui.ctrl.SliderBase.prototype.dispatchComponentEvent);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.syncInputToSlider',
    xiv.ui.ctrl.SliderBase.prototype.syncInputToSlider);

//
// Public
//
goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.setDisplayDecimals',
    xiv.ui.ctrl.SliderBase.prototype.setDisplayDecimals);

goog.exportSymbol('xiv.ui.ctrl.SliderBase.prototype.render',
	xiv.ui.ctrl.SliderBase.prototype.render);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.getValueInput',
    xiv.ui.ctrl.SliderBase.prototype.getValueInput);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.setValue',
    xiv.ui.ctrl.SliderBase.prototype.setValue);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.setStep',
    xiv.ui.ctrl.SliderBase.prototype.setStep);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.setMaximum',
    xiv.ui.ctrl.SliderBase.prototype.setMaximum);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.setMinumum',
    xiv.ui.ctrl.SliderBase.prototype.setMinimum);


goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.getValue',
    xiv.ui.ctrl.SliderBase.prototype.getValue);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.getStep',
    xiv.ui.ctrl.SliderBase.prototype.getStep);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.getMaximum',
    xiv.ui.ctrl.SliderBase.prototype.getMaximum);

goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.getMinumum',
    xiv.ui.ctrl.SliderBase.prototype.getMinimum);


goog.exportSymbol(
    'xiv.ui.ctrl.SliderBase.prototype.update',
    xiv.ui.ctrl.SliderBase.prototype.update);


goog.exportSymbol('xiv.ui.ctrl.SliderBase.prototype.disposeInternal',
	xiv.ui.ctrl.SliderBase.prototype.disposeInternal);




