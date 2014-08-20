/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 * 
 * CREDITS: Thank you to ImageJ for brightness contrast algorithms.
 */
goog.provide('xiv.ui.ctrl.LevelsController');

// goog
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.ui.SliderBase');

// X
goog.require('X.object');

// nrg
goog.require('nrg.ui.Slider');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.SliderController');
goog.require('xiv.ui.ctrl.Histogram');
goog.require('xiv.ui.ctrl.MasterController');
goog.require('xiv.ui.ctrl.ButtonController');
goog.require('xiv.ui.ctrl.CheckboxController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController}
 */
xiv.ui.ctrl.LevelsController = function() {
    goog.base(this);

}
goog.inherits(xiv.ui.ctrl.LevelsController, xiv.ui.ctrl.MasterController);
goog.exportSymbol('xiv.ui.ctrl.LevelsController', 
		  xiv.ui.ctrl.LevelsController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.LevelsController.ID_PREFIX =  'xiv.ui.ctrl.LevelsController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.LevelsController.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @private
 */
xiv.ui.ctrl.LevelsController.titles_ = {
    BRIGHTNESS: 'Brightness',
    CONTRAST: 'Contrast',
    LEVEL_MIN: 'Window Min.',
    LEVEL_MAX: 'Window Max.',
    HISTOGRAM: 'Histogram',
    SCALEHISTOGRAM: 'Scale Histogram'
};



/**
 * @type {!number}
 * @const
 */
xiv.ui.ctrl.LevelsController.LEVEL_MAX = 1000;



/**
 * @type {!number}
 * @const
 */
xiv.ui.ctrl.LevelsController.LEVEL_MIN = 0;



/**
 * @type {?xiv.ui.ctrl.XtkController} 
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.min_ = null;



/**
 * @type {?xiv.ui.ctrl.XtkController} 
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.max_ = null;


/**
 * @type {?xiv.ui.ctrl.XtkController} 
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.brightness_ = null;


/**
 * @type {?xiv.ui.ctrl.XtkController} 
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.contrast_ = null;


/**
 * @type {?xiv.ui.ctrl.Histogram}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.hist_ = null;


/**
 * @type {?xiv.ui.ctrl.XtkController}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.reset_ = null;



/**
 * @type {?xiv.ui.ctrl.CheckboxController}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.scaleCB_ = null;


/**
 * @type {?X.Object}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.xObj_ = null;



/**
 * @constructor
 * @param {!xiv.ui.ctrl.XtkController} min
 * @param {!xiv.ui.ctrl.XtkController} max
 * @param {!xiv.ui.ctrl.XtkController} brightness
 * @param {!xiv.ui.ctrl.XtkController} contrast
 * @param {!xiv.ui.ctrl.XtkController} hist
 * @param {!xiv.ui.ctrl.XtkController} scaleCB
 * @param {!xiv.ui.ctrl.XtkController} resest
 * @param {!X.object} xObj
 * @struct
 */
xiv.ui.ctrl.LevelsController.ControllerSet = 
function(min, max, brightness, contrast, hist, scaleCB, reset, xObj){
    this.min = min;
    this.max = max;
    this.brightness = brightness;
    this.contrast = contrast;
    this.histogram = hist;
    this.scaleCB = scaleCB;
    this.reset = reset;
    this.xObj = xObj;
    this.sliders = [
	this.min, 
	this.max, 
	this.brightness, 
	this.contrast
    ]
}




/**
 * @return {Object.<string, xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.getControllerSet = function() {
    return new xiv.ui.ctrl.LevelsController.ControllerSet(
	this.min_, this.max_, this.brightness_, this.contrast_, this.hist_, 
	this.scaleCB_, this.reset_, this.xObj_)
}




/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.add = function(xObj) {
    goog.base(this, 'add', xObj);

    this.xObj_ = xObj;

    //
    // Create the components
    //
    this.createHistogram_();
    this.createLevelMin_();
    this.createLevelMax_();
    this.createBrightness_();
    this.createContrast_();
    this.createScaleHistogramCheckbox_();
    this.createResetButton_();
}
 


/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createScaleHistogramCheckbox_ = 
function() {
    // create
    var scaleHistogramCheckBox = this.createController( 
	xiv.ui.ctrl.CheckboxController, 
	xiv.ui.ctrl.LevelsController.titles_.SCALEHISTOGRAM, 
	function(e){
	    this.hist_.scaleOnChange(e.checked);
	    this.updateHist_();
	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, 
						   scaleHistogramCheckBox);


    // set defaults
    this.hist_.scaleOnChange(true);
    scaleHistogramCheckBox.getComponent().setChecked(true);
    this.masterControllers.push(scaleHistogramCheckBox);
    this.scaleCB_ = scaleHistogramCheckBox;
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onResetButtonClicked_ =
function(){
    goog.array.forEach(
	[this.min_, this.max_],
	function(ctrl){
	    ctrl.getValueInput().value = ctrl.getDefaultValue();
	    ctrl.getComponent().setValue(ctrl.getDefaultValue());
	    ctrl.update();
	})
    
    // Update the checkbox
    this.scaleCB_.getComponent().setChecked(this.scaleCB_.getDefaultValue());
    this.hist_.scaleOnChange(this.scaleCB_.getDefaultValue());
    this.hist_.update();

}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createResetButton_ = function() {
    // create

    
    var resetButton = this.createController( 
	xiv.ui.ctrl.ButtonController, 
	null,
	this.onResetButtonClicked_.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, resetButton);

    this.masterControllers.push(resetButton);
    resetButton.setXObj(this.xObj_);

    this.reset_ = resetButton;
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createHistogram_ = function() {
    // create

    var histogram = this.createController( 
	xiv.ui.ctrl.Histogram, 
	null,//xiv.ui.ctrl.LevelsController.titles_.HISTOGRAM, 
	function(e){

	    //xObj['windowLow'] = e.value;

	}.bind(this));

 
    histogram.setXObj(this.xObj_);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, histogram);

    this.masterControllers.push(histogram);

    histogram.update();

    this.hist_ = histogram;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createLevelMin_ = function() {
    // create
    this.min_ = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.titles_.LEVEL_MIN, 
	this.onMinChange_.bind(this));

    this.min_.setXObj(this.xObj_);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, this.min_);


    // store
    //window.console.log("***********", controller);
    this.masterControllers.push(this.min_);

    // set defaults
    var slider = this.min_.getComponent();


    slider.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);


    slider.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    slider.setStep(1);
    this.min_.setValueDecimals(0);
    this.min_.setDefaultValue(this.xObj_['min']);
    this.min_.update();
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createLevelMax_ = function() {

    //
    // Create
    //
    var max = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.titles_.LEVEL_MAX,
	this.onMaxChange_.bind(this));
    max.setXObj(this.xObj_);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, max);

    // store
    this.masterControllers.push(max);

    var slider = max.getComponent();
    slider.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    slider.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setStep(1);
    max.setValueDecimals(0);
    max.setDefaultValue(this.xObj_['max']);
    max.update();

    this.max_ = max;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.rebase_ = function(){

    //window.console.log("REBASE MIN MAX", 
    //this.xObj_['min'], this.xObj_['max']);

    var maxSlider = this.max_.getComponent();
    var minSlider = this.min_.getComponent();

    var maxVal = maxSlider.getValue();
    var minVal = minSlider.getValue();


    maxSlider.setMaximum(this.xObj_['max']);
    maxSlider.setMinimum(this.xObj_['min']);
    maxSlider.setValue(minVal);

    minSlider.setMaximum(this.xObj_['max']);
    minSlider.setMinimum(this.xObj_['min']);
    minSlider.setValue(minVal);

    this.max_.update();
    this.min_.update();
    this.hist_.update();
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onMinChange_ = function(){
    if (!goog.isDefAndNotNull(this.max_) ||
	!goog.isDefAndNotNull(this.min_)) { return }
    
    var minSlider = this.min_.getComponent();
    if (minSlider.getMinimum() != this.xObj_['min']){
	this.rebase_();
    }
    this.xObj_['windowLow'] = minSlider.getValue();

    //
    // Now, update the controllers
    //
    this.updateControllers_(this.min_);
}



/**
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onMaxChange_ = function(e){
    if (!goog.isDefAndNotNull(this.max_) ||
	!goog.isDefAndNotNull(this.min_)) { return }
    
    var maxSlider = this.max_.getComponent();
    if (maxSlider.getMaximum() != this.xObj_['max'] &&
	this.xObj_['max'] != Infinity){
	this.rebase_();
    }
    this.xObj_['windowHigh'] = maxSlider.getValue();

    //
    // Now, update the controllers
    //
    this.updateControllers_(this.max_);
}



/**
 * @return {!xiv.ui.ctrl.SliderController}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateControllers_ = 
function(currController) {

    switch (currController){
	
	//
	// MAX or MIN is adjusted
	//
    case this.min_:
    case this.max_:
	var minSlider = this.min_.getComponent();
	var maxSlider = this.max_.getComponent();

	if (currController == this.max_ &&
	    maxSlider.getValue() <= minSlider.getValue()){
	    minSlider.setValue(maxSlider.getValue() - 1);
	}

	else if (currController == this.min_ &&
		 minSlider.getValue() >= maxSlider.getValue()){
	    maxSlider.setValue(minSlider.getValue() + 1);
	}
	this.updateBrightness_();
	this.updateContrast_();

	//
	// BRIGHTESS or CONTRAST is adjusted
	//
    case this.brightness_:
    case this.contrast_:
	this.updateMinMax_();
	break;
    }


    //
    // Always update the histogram
    //
    this.updateHist_();
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateMinMax_ = function(){
    var minSlider = this.min_.getComponent();
    var maxSlider = this.max_.getComponent();
    var _l = this.min_.getCurrentLevels();

    minSlider.suspendChangeEvent(true);
    maxSlider.suspendChangeEvent(true);
    
    minSlider.setValue(_l.low);
    maxSlider.setValue(_l.high);

    this.min_.getValueInput().value = minSlider.getValue();
    this.max_.getValueInput().value = maxSlider.getValue();

    maxSlider.suspendChangeEvent(false);
    minSlider.suspendChangeEvent(false);
}


/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateContrast_ =
function(){
    var cSlider = this.contrast_.getComponent();
    cSlider.suspendChangeEvent(true);
  
    var _l = this.min_.getCurrentLevels();
    var mid = cSlider.getMaximum()/2;
    var c = ((_l.max - _l.min)/(_l.high - _l.low)) * mid;
    if (c > mid) {
	c = cSlider.getMaximum() - 
	    ((_l.high - _l.low)/(_l.max - _l.min)) * mid;
    }
    var contrast = Math.round(c);
    cSlider.setValue(contrast);
    this.contrast_.getValueInput().value = contrast;

    cSlider.suspendChangeEvent(false);
}



/**
 * @param {boolean=} opt_suspendChangeEvent
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateBrightness_ =
function(){
    var bSlider = this.brightness_.getComponent();
    bSlider.suspendChangeEvent(true);
   

    var _l = this.min_.getCurrentLevels();
    var level = _l.low + (_l.high - _l.low)/2.0;
    var normalizedLevel = 1.0 - (level - _l.min)/(_l.max - _l.min);
    var brightness = Math.round(normalizedLevel * bSlider.getMaximum());


    bSlider.setValue(brightness);
    this.brightness_.getValueInput().value = brightness;

    bSlider.suspendChangeEvent(false);
}



/**
 * @param {Event} e
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onBrightnessChange_ = 
function(e) {

    if (!goog.isDefAndNotNull(this.brightness_)) {return}

    var _l = this.min_.getCurrentLevels();
    var bSlider = this.brightness_.getComponent();

    var center = 
	_l.min + (_l.max - _l.min) *
	((bSlider.getMaximum() - bSlider.getValue())/ bSlider.getMaximum());

    var width = _l.high - _l.low;

    var newLow, newHigh;
    newLow = Math.round(center - width/2);
    newHigh = Math.round(center + width/2);
    this.setNewHighAndLow_(newLow, newHigh);

    this.updateControllers_(this.brightness_);
}




/**
 * @param {Event} e
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onContrastChange_ = 
function(e) {

    if (!goog.isDefAndNotNull(this.contrast_)) {return}

    var _l = this.min_.getCurrentLevels();
    var cSlider = this.contrast_.getComponent();

    var slope;
    var center = _l.low + (_l.high-_l.low) / 2.0;
    var range = _l.max - _l.min;
    var mid = cSlider.getMaximum() / 2;

    if (cSlider.getValue() <= mid) {
	slope = cSlider.getValue() / mid;
    }
    else {
	slope = mid / (cSlider.getMaximum() - cSlider.getValue());
    }
    
    if (slope > 0.0) {
	var newLow, newHigh;
	newLow = Math.round(center - (0.5 * range)/slope);
	newHigh = Math.round(center + (0.5 * range)/slope);
	this.setNewHighAndLow_(newLow, newHigh);
    }

    this.updateControllers_(this.contrast_);
}


/**
 * @param {!number} newLow
 * @param {!number} newHigh
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.setNewHighAndLow_ = 
    function(newLow, newHigh) {
	if (newLow == newHigh){
	    newLow = newHigh - 1;
	}
	this.xObj_['windowLow'] = newLow;
	this.xObj_['windowHigh'] = newHigh;
    }




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createBrightness_ = 
function() {
    //
    // Create
    //
    var brightness = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.titles_.BRIGHTNESS,
	this.onBrightnessChange_.bind(this));
    brightness.setXObj(this.xObj_);



    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, brightness);

    // store
    this.masterControllers.push(brightness);

    var slider = brightness.getComponent();
    slider.setMaximum(100);
    slider.setMinimum(0);
    slider.setValue(0);
    slider.setStep(1);
    brightness.setValueDecimals(0);
    brightness.update();


    this.brightness_ = brightness;
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createContrast_ = 
function() {
    //
    // Create
    //
    var contrast = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.titles_.CONTRAST,
	this.onContrastChange_.bind(this));
    contrast.setXObj(this.xObj_);


    var slider = contrast.getComponent();



    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, contrast);

    // store
    this.masterControllers.push(contrast);


    slider.setMaximum(100);
    slider.setMinimum(0);
    slider.setValue(0);
    slider.setStep(1);
    contrast.setValueDecimals(0);
    contrast.update();


    this.contrast_ = contrast;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateHist_ = function(){
    //window.console.log('update histogram');

    if((this.xObjs[0].max > xiv.ui.ctrl.LevelsController.LEVEL_MAX) &&
       (this.max_.getComponent().getMaximum() != this.xObjs[0].max)){
	var max = this.xObjs[0].max;
	// Level max
	this.max_.getComponent().setMaximum(max);
	this.max_.getComponent().setValue(max);
	// Level min
	this.min_.getComponent().setMaximum(max);
    }


    this.hist_.update();
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.disposeInternal = function() {
    delete this.min_;
    delete this.max_;
    delete this.reset_;
    delete this.brightness_;
    delete this.contrast_;
    delete this.hist_;
    delete this.scaleCB_;
    delete this.xObj_;
    goog.base(this, 'disposeInternal');
}


goog.exportSymbol('xiv.ui.ctrl.LevelsController.ControllerSet',
	xiv.ui.ctrl.LevelsController.ControllerSet);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.ID_PREFIX',
	xiv.ui.ctrl.LevelsController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.CSS_SUFFIX',
	xiv.ui.ctrl.LevelsController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add',
	xiv.ui.ctrl.LevelsController.prototype.add);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.getControllerSet',
	xiv.ui.ctrl.LevelsController.prototype.getControllerSet);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.disposeInternal',
	xiv.ui.ctrl.LevelsController.prototype.disposeInternal);
