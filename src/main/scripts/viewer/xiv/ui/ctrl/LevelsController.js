/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
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
 * @dict
 */
xiv.ui.ctrl.LevelsController.CONTROLLERS = {
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
 * @type {xiv.ui.ctrl.CheckboxController}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.scaleCB_ = null;



/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.add = function(xObj) {
    goog.base(this, 'add', xObj);

    //
    // Create the components
    //
    this.createHistogram(xObj);
    this.createLevelMin(xObj);
    this.createLevelMax(xObj);
    this.createBrightness(xObj);
    this.createBontrast(xObj);
    this.createscaleHistogramCheckbox(xObj);
    this.createResetButton(xObj);


    //
    // Update the histogram when the sliders move
    //
    goog.array.forEach(
	[this.min_, this.max_, this.brightness_, this.contrast_], 
	function(levelCtrl){
	    goog.events.listen(levelCtrl.getComponent(), 
			       nrg.ui.Slider.EventType.SLIDE,
			       function(e){
				   //window.console.log(e.target);
				   this.updateHist_();
			       }.bind(this))
	}.bind(this))


    //window.console.log('Auto-level images.');
}
 


/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createscaleHistogramCheckbox = 
function(xObj) {
    // create
    var scaleHistogramCheckBox = this.createController( 
	xiv.ui.ctrl.CheckboxController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.SCALEHISTOGRAM, 
	function(e){
	    this.hist_.scaleOnChange(e.checked);
	    this.updateHist_();
	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, 
						   scaleHistogramCheckBox);


    // set defaults
    this.hist_.scaleOnChange(true);
    scaleHistogramCheckBox.getComponent().setChecked(true);
   
    this.masterControllers.push(scaleHistogramCheckBox);
 
    return scaleHistogramCheckBox;
}



/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createReset = function(xObj) {
    // create

    
    var resetButton = this.createController( 
	xiv.ui.ctrl.ButtonController, 
	null,
	function(e){
	    

	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, resetButton);

    this.masterControllers.push(resetButton);
    resetButton.setXObj(xObj);

    this.reset_ = resetButton;
}




/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createHistogram = function(xObj) {
    // create

    var histogram = this.createController( 
	xiv.ui.ctrl.Histogram, 
	null,//xiv.ui.ctrl.LevelsController.CONTROLLERS.HISTOGRAM, 
	function(e){

	    //xObj['windowLow'] = e.value;

	}.bind(this));

 
    histogram.setXObj(xObj);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, histogram);

    this.masterControllers.push(histogram);

    histogram.update();

    this.hist_ = histogram;
}



/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createLevelMin = function(xObj) {
    // create
    var min = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.LEVEL_MIN, 
	function(e){
	    xObj['windowLow'] = e.value;
	}.bind(this));
    min.setXObj(xObj);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, min);


    // store
    //window.console.log("***********", controller);
    this.masterControllers.push(min);

    // set defaults
    var slider = min.getComponent();

    slider.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);


    slider.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    slider.setStep(1);
    min.setValueDecimals(0);
    min.update();


    this.min_ = min;
}




/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createLevelMax = function(xObj) {

    //
    // Create
    //
    var max = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.LEVEL_MAX);
    max.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(max, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){
	    xObj['windowHigh'] = e.value;
	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, max);

    // store
    this.masterControllers.push(max);

    var slider = max.getComponent();
    slider.setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    slider.setValue(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    slider.setStep(1);
    max.setValueDecimals(0);
    max.update();

    this.max_ = max;
}




/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} min
 * @param {!xiv.ui.ctrl.XtkController} max
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createBrightness = 
function(xObj) {
    //
    // Create
    //
    var brightness = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.BRIGHTNESS);
    brightness.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(brightness, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	    
	    var rate = (e.value - e.previous) / (e.maximum - e.minimum);
	    var currDifference = 
		parseInt(xObj['windowHigh']) - parseInt(xObj['windowLow']);

	    xObj['windowLow']  = 
		Math.round(parseInt(xObj['windowLow']) - 
			   (currDifference * rate));
	    xObj['windowHigh'] = 
		Math.round(parseInt(xObj['windowHigh']) - 
			   (currDifference * rate));


	    this.min_.getComponent().setValue(xObj['windowLow']);
	    this.max_.getComponent().setValue(xObj['windowHigh']);


	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, brightness);

    // store
    this.masterControllers.push(brightness);

    var slider = brightness.getSlider();
    slider.setMaximum(100);
    slider.setMinimum(-100);
    slider.setValue(0);
    slider.setStep(1);
    brightness.setValueDecimals(0);
    brightness.update();


    this.brightness_ = brightness;
}




/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} min
 * @param {!xiv.ui.ctrl.XtkController} max
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.createContrast = 
function(xObj, min, max) {
    //
    // Create
    //
    var contrast = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.CONTRAST);
    contrast.setXObj(xObj);


    var slider = contrast.getComponent();

    
    var high, low;
    goog.events.listen(
	slider, 
	goog.ui.SliderBase.EventType.DRAG_START, function(){
	    high = parseInt(xObj['windowHigh']);
	    low = parseInt(xObj['windowLow']); 
	})



    //
    // Listen for changes
    //
    goog.events.listen(contrast, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	 

	    var newHigh, newLow;
	    if (e.value < 0){
		var maxMult = 3;
		var maxExt = high * maxMult;

		var lowSlope = 
		    (low + maxExt)/(0 - slider.getMinimum());
		newLow = lowSlope * e.value + low;

		var highSlope = 
		    (high - maxExt)/(0 - slider.getMinimum());
		newHigh = highSlope * e.value + high;

	    }
	    else if (e.value == 0){
		newHigh = high;
		newLow = low;
	    }
	    else {

		var maxMult = .5;
		var maxExt = high * maxMult;

		var lowSlope = 
		    ((maxExt - 1) - low)/(slider.getMaximum() - 0);
		newLow = lowSlope * e.value + low;

		var highSlope = 
		    (maxExt - high)/(slider.getMaximum() - 0);
		newHigh = highSlope * e.value + high;	
	
	    }

	    xObj['windowHigh'] = newHigh;
	    xObj['windowLow'] = newLow;


	    this.hist_.update();

	    var minSlider = this.min_.getComponent();
	    minSlider.suspendSlideEvent(true);
	    if(xObj['windowLow'] < minSlider.getMinimum()){
		minSlider.setValue(minSlider.getMinimum());
	    } else {
		minSlider.setValue(xObj['windowLow']);
	    }
	    this.min_.getValueInput().value = minSlider.getValue();
	    minSlider.suspendSlideEvent(false);



	    var maxSlider = this.max_.getComponent();
	    maxSlider.suspendSlideEvent(true);
	    if(xObj['windowHigh'] > maxSlider.getMaximum()){
		maxSlider.setValue(maxSlider.getMaximum());
	    } else {
		maxSlider.setValue(xObj['windowHigh']);
	    }
	    this.max_.getValueInput().value = maxSlider.getValue();
	    maxSlider.suspendSlideEvent(false);
	    
	    xObj['windowHigh'] = newHigh;
	    xObj['windowLow'] = newLow;


	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, contrast);

    // store
    this.masterControllers.push(contrast);


    slider.setMaximum(100);
    slider.setMinimum(-100);
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
    goog.base(this, 'disposeInternal');
}



goog.exportSymbol('xiv.ui.ctrl.LevelsController.ID_PREFIX',
	xiv.ui.ctrl.LevelsController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.CSS_SUFFIX',
	xiv.ui.ctrl.LevelsController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.CONTROLLERS',
	xiv.ui.ctrl.LevelsController.CONTROLLERS);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.LEVEL_MAX',
	xiv.ui.ctrl.LevelsController.LEVEL_MAX);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.LEVEL_MIN',
	xiv.ui.ctrl.LevelsController.LEVEL_MIN);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add',
	xiv.ui.ctrl.LevelsController.prototype.add);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createHistogram',
	xiv.ui.ctrl.LevelsController.prototype.createHistogram);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createReset',
	xiv.ui.ctrl.LevelsController.prototype.createReset);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createLevelMin',
	xiv.ui.ctrl.LevelsController.prototype.createLevelMin);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createLevelMax',
	xiv.ui.ctrl.LevelsController.prototype.createLevelMax);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createBrightness',
	xiv.ui.ctrl.LevelsController.prototype.createBrightness);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.createContrast',
	xiv.ui.ctrl.LevelsController.prototype.createContrast);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.disposeInternal',
	xiv.ui.ctrl.LevelsController.prototype.disposeInternal);
