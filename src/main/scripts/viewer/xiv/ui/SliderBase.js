/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.SliderBase');


// goog
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.math');

// nrg
goog.require('nrg.ui.Slider');
goog.require('nrg.ui.HoverInput');

// xiv
goog.require('xiv.ui.XtkController');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.SliderBase = function(){
    goog.base(this);
    this.setLabel('Slider');
}
goog.inherits(xiv.ui.SliderBase, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.SliderBase', xiv.ui.SliderBase);




/**
 * @const
 * @public
 */
xiv.ui.SliderBase.ID_PREFIX =  'xiv.ui.SliderBase';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.SliderBase.CSS_SUFFIX = {
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
xiv.ui.SliderBase.prototype.displayDecimals = 0;




/**
 * @type {?nrg.ui.HoverInput}
 * @protected
 */
xiv.ui.SliderBase.prototype.valueInput = null;



/**
 * @type {goog.ui.component}
 * @protected
 */
xiv.ui.SliderBase.prototype.slider = null;



/**
 * @param {!number} num
 * @public
 */
xiv.ui.SliderBase.prototype.setDisplayDecimals = function(num){
    this.displayDecimals = num;
}



/**
 * @param {!string}
 * @public
 */
xiv.ui.SliderBase.prototype.setDisplaySuffix = function(suffix) {
    this.valueInput.setDisplaySuffix(suffix);
}



/**
 * @inheritDoc
 */
xiv.ui.SliderBase.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.createSlider();
    this.valueInput = this.createInputBox(this.onValueInput_.bind(this));
}


/**
 * @public
 */
xiv.ui.SliderBase.prototype.createSlider = function() {
    this.slider = new nrg.ui.Slider();
    this.setComponent(this.slider);

    // Inits
    this.slider.setStep(1);
    this.slider.setMinimum(0);
    this.slider.setMaximum(100);
    this.slider.setValue(100);

    // Classes
    goog.dom.classes.add(this.slider.getElement(), 
			 xiv.ui.SliderBase.CSS.SLIDER);
    goog.dom.classes.add(this.slider.getThumb(), 
			 xiv.ui.SliderBase.CSS.SLIDER_THUMB);
    goog.dom.classes.add(this.slider.getTrack(),
			 xiv.ui.SliderBase.CSS.SLIDER_TRACK);


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
xiv.ui.SliderBase.prototype.createInputBox = 
function(inputCallback) {

    var inputObj = new nrg.ui.HoverInput();
    

    // Classes
    inputObj.render(this.getElement());
    goog.dom.classes.add(inputObj.getElement(), 
			 xiv.ui.SliderBase.CSS.VALUEINPUT);
    goog.dom.classes.add(inputObj.getDisplayElement(), 
			 xiv.ui.SliderBase.CSS.VALUEINPUT_DISPLAY);
    goog.dom.classes.add(inputObj.getInputElement(), 
			 xiv.ui.SliderBase.CSS.VALUEINPUT_BOX);
    
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
xiv.ui.SliderBase.prototype.onValueInput_ = function(e){

    window.console.log("INPUT", e);

    window.console.log(this.valueInput.getStep());
    window.console.log(this.valueInput.getMaximum());
    window.console.log(this.valueInput.getMinimum());
    window.console.log(this.valueInput.getValue());
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
xiv.ui.SliderBase.prototype.getValueInput = function(e){
    return this.valueInput;
}



/**
 * @param {!number} val
 * @param {boolean=} opt_setValueInput
 * @public
 */
xiv.ui.SliderBase.prototype.setValue = function(val){
    this.slider.setValue(val);
    this.valueInput.setEnabled(false);
    this.valueInput.setValue(val);
    this.valueInput.setEnabled(true);
    
}


/**
 * @param {!number} max
 * @public
 */
xiv.ui.SliderBase.prototype.setMaximum = function(max){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setMaximum(max);
    }
    this.slider.setMaximum(max);
    this.refresh();
}



/**
 * @param {!number} step
 * @public
 */
xiv.ui.SliderBase.prototype.setStep = function(step){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setStep(step);
    }
    this.slider.setStep(step);
    this.refresh();
}



/**
 * @param {!number} min
 * @public
 */
xiv.ui.SliderBase.prototype.setMinimum = function(min){
    if (goog.isDefAndNotNull(this.valueInput)) {
	this.valueInput.setMinimum(min);
    }
    this.slider.setMinimum(min);
    this.refresh();
}



/**
 * @return {!number}
 * @private
 */
xiv.ui.SliderBase.prototype.getValue = function(){
    return this.slider.getValue();
}


/**
 * @return {!number}
 * @public
 */
xiv.ui.SliderBase.prototype.getMaximum = function(){
    return this.slider.getMaximum();
}



/**
 * @return {!number} 
 * @public
 */
xiv.ui.SliderBase.prototype.getStep = function(){
    return this.slider.getStep();
}



/**
 * @return {!number} 
 * @public
 */
xiv.ui.SliderBase.prototype.getMinimum = function(){
    return this.slider.getMinimum();
}




/**
 * @inheritDoc
 */
xiv.ui.SliderBase.prototype.dispatchComponentEvent = function(){

    var val = this.slider.getValue().toFixed(this.displayDecimals);
    var previousValue = this.slider.getPreviousValue();

    if (goog.isDefAndNotNull(this.valueInput)) { 
	this.valueInput.setValue(val);
    }


    //window.console.log("SLIDER", val);
    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
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
xiv.ui.SliderBase.prototype.syncInputToSlider = function(input) {
    if (!goog.isDefAndNotNull(input)){return}
    
    //
    // Sync the input box with the slider
    //
    if (this.slider.getStep() != input.getStep()){
	input.setStep(this.slider.getStep());
    }
    if (this.slider.getMinimum() != input.getMinimum()) {
	input.setMinimum(this.slider.getMinimum());
    }
    if (this.slider.getMaximum() != input.getMaximum()) {
	input.setMaximum(this.slider.getMaximum());
    }
    if (this.slider.getValue() != input.getValue()) {
	input.setValue(this.slider.getValue());
    }
}



/**
 * @inheritDoc
 */
xiv.ui.SliderBase.prototype.refresh = function() {
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
xiv.ui.SliderBase.prototype.disposeInternal = function() {
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



goog.exportSymbol('xiv.ui.SliderBase.ID_PREFIX',
	xiv.ui.SliderBase.ID_PREFIX);
goog.exportSymbol('xiv.ui.SliderBase.CSS_SUFFIX',
	xiv.ui.SliderBase.CSS_SUFFIX);

//
// Protected 
//
goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.slider',
    xiv.ui.SliderBase.prototype.slider);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.displayDecimals',
    xiv.ui.SliderBase.prototype.displayDecimals);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.valueInput',
    xiv.ui.SliderBase.prototype.valueInput);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.createSlider',
    xiv.ui.SliderBase.prototype.createSlider);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.createInputBox',
    xiv.ui.SliderBase.prototype.createInputBox);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.dispatchComponentEvent',
    xiv.ui.SliderBase.prototype.dispatchComponentEvent);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.syncInputToSlider',
    xiv.ui.SliderBase.prototype.syncInputToSlider);

//
// Public
//
goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setDisplayDecimals',
    xiv.ui.SliderBase.prototype.setDisplayDecimals);

goog.exportSymbol('xiv.ui.SliderBase.prototype.render',
	xiv.ui.SliderBase.prototype.render);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.getValueInput',
    xiv.ui.SliderBase.prototype.getValueInput);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setValue',
    xiv.ui.SliderBase.prototype.setValue);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setStep',
    xiv.ui.SliderBase.prototype.setStep);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setMaximum',
    xiv.ui.SliderBase.prototype.setMaximum);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setMinumum',
    xiv.ui.SliderBase.prototype.setMinimum);


goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.getValue',
    xiv.ui.SliderBase.prototype.getValue);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.getStep',
    xiv.ui.SliderBase.prototype.getStep);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.getMaximum',
    xiv.ui.SliderBase.prototype.getMaximum);

goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.getMinumum',
    xiv.ui.SliderBase.prototype.getMinimum);


goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.refresh',
    xiv.ui.SliderBase.prototype.refresh);


goog.exportSymbol(
    'xiv.ui.SliderBase.prototype.setDisplaySuffix',
    xiv.ui.SliderBase.prototype.setDisplaySuffix);


goog.exportSymbol('xiv.ui.SliderBase.prototype.disposeInternal',
	xiv.ui.SliderBase.prototype.disposeInternal);




