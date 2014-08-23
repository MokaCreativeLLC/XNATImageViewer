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
goog.require('xiv.ui.ctrl.TwoThumbSliderController');
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


    /**
     * @type {Object}
     */
    this.c_ = {
	min : null, 
	max : null, 
	brightness : null,
	contrast : null, 
	histogram : null, 
	histogramRange : null, 
	reset : null,
	xObj : null,
	sliders : []	
    }

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
    LEVEL_MIN: 'Minimum',
    LEVEL_MAX: 'Maximum',
    HISTOGRAM: 'Histogram',
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
 * @type {?X.Object}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.xObj_ = null;





/**
 * @return {Object.<string, xiv.ui.ctrl.XtkController | Array.<xiv.ui.ctrl.XtkController>>}
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.getControllerSet = function() {
    return this.c_;
}



/**
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.toggleVisiblePixelRange = 
function() {
    var range = this.c_.histogram.getVisiblePixelRange();
    //window.console.log('\nrange:', range);
    this.c_.histogramRange.setValueAndExtent(range[0], range[1] - range[0]);
    //this.c_.histogramRange.setValue(range[0]);
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
    this.createHistogramRange_();
    this.createHistogram_();
    this.createLevelMin_();
    this.createLevelMax_();
    this.createBrightness_();
    this.createContrast_();
    this.createResetButton_();


    this.groupSliders_();
    this.adjustStyles_();
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.groupSliders_ = function() {
    this.c_.sliders.push(this.c_.min);
    this.c_.sliders.push(this.c_.max);
    this.c_.sliders.push(this.c_.brightness);
    this.c_.sliders.push(this.c_.contrast);
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.adjustStyles_ = function() {
 
    //
    // Adjust slider styles;
    //
    goog.array.forEach(
	this.c_.sliders,
	function(ctrl, i){

	    //window.console.log(ctrl.getLabel());

	    goog.dom.classes.add(
		ctrl.getLabel(),
		'xiv-ui-ctrl-levelscontroller-sliderlabel');

	    goog.dom.classes.add(
		ctrl.getElement(),
		'xiv-ui-ctrl-levelscontroller-slidercontroller');

	    goog.dom.classes.add(
		ctrl.getComponent().getElement(),
		'xiv-ui-ctrl-levelscontroller-slider');

	    goog.dom.classes.add(
		ctrl.getValueInput().getElement(),
		'xiv-ui-ctrl-levelscontroller-slidervalue');


	    ctrl.getComponent().updateStyle();
	    
	}.bind(this))


    goog.dom.classes.add(
	this.c_.histogramRange.getLabel(),
	'xiv-ui-ctrl-levelscontroller-twothumbsliderlabel');



    //
    // Adjust histogram range
    //
    goog.dom.classes.add(
	this.c_.histogramRange.getLabel(),
	'xiv-ui-ctrl-levelscontroller-sliderlabel');
    goog.dom.classes.add(
	this.c_.histogramRange.getElement(),
	'xiv-ui-ctrl-levelscontroller-twothumbslidercontroller');
    goog.dom.classes.add(
	this.c_.histogramRange.getComponent().getElement(),
	'xiv-ui-ctrl-levelscontroller-twothumbslider');
    goog.dom.classes.add(
	this.c_.histogramRange.getValueInput().getElement(),
	'xiv-ui-ctrl-levelscontroller-twothumbslidervalue');
    goog.dom.classes.add(
	this.c_.histogramRange.getExtentInput().getElement(),
	'xiv-ui-ctrl-levelscontroller-twothumbsliderextent');
}
 





/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onResetButtonClicked_ =
function(){
    goog.array.forEach(
	[this.c_.min, this.c_.max],
	function(ctrl){
	    ctrl.setValue(ctrl.getDefaultValue());
	    ctrl.update();
	})
    
    // Update the checkbox
    this.toggleVisiblePixelRange();
    this.c_.histogram.update();

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

    this.c_.reset = resetButton;
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

    this.c_.histogram = histogram;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onHistogramRangeChange_ = function(){  
    if (!goog.isDefAndNotNull(this.c_.histogram)) { return }
 
    /*
    window.console.log(
	'Slider', 
	'value:', this.c_.histogramRange.getValue(),
	'extent:', this.c_.histogramRange.getExtent(),
	'value + extent:', this.c_.histogramRange.getValue() + 
	    this.c_.histogramRange.getExtent());
    */

    this.c_.histogram.setViewMin(this.c_.histogramRange.getValue());

    this.c_.histogram.setViewMax(this.c_.histogramRange.getExtent() + 
				 this.c_.histogramRange.getValue());


    this.updateHist_();
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createHistogramRange_ = function() {
    //
    // create
    //
    var histRange = this.createController(
	xiv.ui.ctrl.TwoThumbSliderController, 
	'Histogram Range', 
	this.onHistogramRangeChange_.bind(this));

    //
    // Point the controller to the xObj (stored as a property);
    //
    histRange.setXObj(this.xObj_);
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, histRange);

    //
    // strore
    //
    this.masterControllers.push(histRange);
  

    var lowerRange = this.xObj_['min'];
    var upperRange = this.xObj_['max'] == Infinity ? 1000 : this.xObj_['max'];

    //window.console.log("\n\nHERE", lowerRange, upperRange);
    
    //
    // ADJUSTING THESE values fire's the 'CHANGE" event defined in
    // this.constructor.onSliderChange_
    //
    this.c_.histogramRange = histRange;
    this.rebaseHistogramRange_();
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.createLevelMin_ = function() {
    // create
    this.c_.min = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.titles_.LEVEL_MIN, 
	this.onMinChange_.bind(this));

    this.c_.min.setXObj(this.xObj_);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, this.c_.min);


    // store
    //window.console.log("***********", controller);
    this.masterControllers.push(this.c_.min);

    // set defaults
    this.c_.min.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    this.c_.min.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    this.c_.min.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    this.c_.min.setStep(1);
    this.c_.min.setDisplayDecimals(0);
    this.c_.min.setDefaultValue(this.xObj_['min']);
    this.c_.min.update();
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

    max.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    max.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    max.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    max.setStep(1);
    max.setDisplayDecimals(0);
    max.setDefaultValue(this.xObj_['max']);
    max.update();

    this.c_.max = max;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.rebase_ = function(){

    //window.console.log("REBASE MIN MAX", 
    //this.xObj_['min'], this.xObj_['max']);
    var _l = this.c_.min.getCurrentLevels();
    goog.array.forEach(
	[this.c_.max, this.c_.min],
	function(ctrl, i){
	    ctrl.setMaximum(_l.max);
	    ctrl.setMinimum(_l.min);
	    ctrl.setValue(i == 0 ? _l.max : _l.min);
	})

    this.rebaseHistogramRange_();
    this.c_.histogram.update();
}




/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.rebaseHistogramRange_ = function(){
    if (!goog.isDefAndNotNull(this.c_.min)) { return };
    var _l = this.c_.min.getCurrentLevels();

    this.c_.histogramRange.setMinimum(_l.min);
    this.c_.histogramRange.setMaximum(_l.max);
    this.c_.histogramRange.setValue(_l.min);
    this.c_.histogramRange.setStep(1);

    this.c_.histogramRange.setExtent(_l.max - _l.min);  
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onMinChange_ = function(){
    if (!goog.isDefAndNotNull(this.c_.max) ||
	!goog.isDefAndNotNull(this.c_.min)) { return }
  
    if (this.c_.min.getMinimum() != this.xObj_['min']){
	this.rebase_();
    }
    this.xObj_['windowLow'] = this.c_.min.getValue();

    //
    // Now, update the controllers
    //
    this.updateControllers_(this.c_.min);
}



/**
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onMaxChange_ = function(e){
    if (!goog.isDefAndNotNull(this.c_.max) ||
	!goog.isDefAndNotNull(this.c_.min)) { return }

    if (this.c_.max.getMaximum() != this.xObj_['max'] &&
	this.xObj_['max'] != Infinity){
	this.rebase_();
    }
    this.xObj_['windowHigh'] = this.c_.max.getValue();

    //
    // Now, update the controllers
    //
    this.updateControllers_(this.c_.max);
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
    case this.c_.min:
	if (this.c_.min.getValue() >= this.c_.max.getValue()){
	    this.c_.max.setValue(this.c_.min.getValue() + 1);
	}
    case this.c_.max:
	if (this.c_.max.getValue() <= this.c_.min.getValue()){
	    this.c_.min.setValue(this.c_.max.getValue() - 1);
	}
	this.updateBrightness_();
	this.updateContrast_();

	//
	// BRIGHTESS or CONTRAST is adjusted
	//
    case this.c_.brightness:
    case this.c_.contrast:
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
    var minSlider = this.c_.min.getComponent();
    var maxSlider = this.c_.max.getComponent();
    var _l = this.c_.min.getCurrentLevels();

    minSlider.suspendChangeEvent(true);
    maxSlider.suspendChangeEvent(true);
    
    this.c_.min.setValue(_l.low, true);
    this.c_.max.setValue(_l.high, true);


    maxSlider.suspendChangeEvent(false);
    minSlider.suspendChangeEvent(false);
}


/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateContrast_ =
function(){
    var cSlider = this.c_.contrast.getComponent();
    cSlider.suspendChangeEvent(true);
  
    var _l = this.c_.min.getCurrentLevels();
    var mid = this.c_.contrast.getMaximum()/2;
    var c = ((_l.max - _l.min)/(_l.high - _l.low)) * mid;
    if (c > mid) {
	c = this.c_.contrast.getMaximum() - 
	    ((_l.high - _l.low)/(_l.max - _l.min)) * mid;
    }
    var contrast = Math.round(c);
    this.c_.contrast.setValue(contrast);

    cSlider.suspendChangeEvent(false);
}



/**
 * @param {boolean=} opt_suspendChangeEvent
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateBrightness_ =
function(){
    var bSlider = this.c_.brightness.getComponent();
    bSlider.suspendChangeEvent(true);
   
    var _l = this.c_.min.getCurrentLevels();
    var level = _l.low + (_l.high - _l.low)/2.0;
    var normalizedLevel = 1.0 - (level - _l.min)/(_l.max - _l.min);
    var brightness = Math.round(normalizedLevel * bSlider.getMaximum());

    this.c_.brightness.setValue(brightness);

    bSlider.suspendChangeEvent(false);
}



/**
 * @param {Event} e
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onBrightnessChange_ = 
function(e) {

    if (!goog.isDefAndNotNull(this.c_.brightness)) {return}

    var _l = this.c_.min.getCurrentLevels();
    var bSlider = this.c_.brightness.getComponent();

    var center = 
	_l.min + (_l.max - _l.min) *
	((bSlider.getMaximum() - bSlider.getValue())/ bSlider.getMaximum());

    var width = _l.high - _l.low;

    var newLow, newHigh;
    newLow = Math.round(center - width/2);
    newHigh = Math.round(center + width/2);
    this.setNewHighAndLow_(newLow, newHigh);

    this.updateControllers_(this.c_.brightness);
}




/**
 * @param {Event} e
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.onContrastChange_ = 
function(e) {

    if (!goog.isDefAndNotNull(this.c_.contrast)) {return}

    var _l = this.c_.min.getCurrentLevels();
    var cSlider = this.c_.contrast.getComponent();

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

    this.updateControllers_(this.c_.contrast);
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

    brightness.setMaximum(100);
    brightness.setMinimum(0);
    brightness.setValue(0);
    brightness.setStep(1);
    brightness.setDisplayDecimals(0);
    brightness.update();


    this.c_.brightness = brightness;
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


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(this.xObj_, contrast);

    // store
    this.masterControllers.push(contrast);


    contrast.setMaximum(100);
    contrast.setMinimum(0);
    contrast.setValue(0);
    contrast.setStep(1);
    contrast.setDisplayDecimals(0);
    contrast.update();


    this.c_.contrast = contrast;
}



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateHist_ = function(){
    //window.console.log('update histogram');

    if((this.xObjs[0].max > xiv.ui.ctrl.LevelsController.LEVEL_MAX) &&
       (this.c_.max.getMaximum() != this.xObjs[0].max)){
	var max = this.xObjs[0].max;
	// Level max
	this.c_.max.setMaximum(max);
	this.c_.max.setValue(max);
	// Level min
	this.c_.min.setMaximum(max);
    }


    this.c_.histogram.update();
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.disposeInternal = function() {
    goog.object.clear(this.c_);
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
