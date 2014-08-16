/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.LevelsController');

// goog
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.events');

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
xiv.ui.ctrl.LevelsController.prototype.levelMin_ = null;



/**
 * @type {?xiv.ui.ctrl.XtkController} 
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.levelMax_ = null;



/**
 * @type {xiv.ui.ctrl.Histogram}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.Histogram_ = null;



/**
 * @type {xiv.ui.ctrl.CheckboxController}
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.ScaleHistogramCheckbox_ = null;



/**
 * @private
 */
xiv.ui.ctrl.LevelsController.prototype.updateHistogram_ = function(){
    //window.console.log('update histogram');

    if((this.xObjs[0].max > xiv.ui.ctrl.LevelsController.LEVEL_MAX) &&
       (this.levelMax_.getComponent().getMaximum() != this.xObjs[0].max)){
	var max = this.xObjs[0].max;
	// Level max
	this.levelMax_.getComponent().setMaximum(max);
	this.levelMax_.getComponent().setValue(max);
	// Level min
	this.levelMin_.getComponent().setMaximum(max);
    }


    this.Histogram_.update();
}



/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.add = function(xObj) {
    goog.base(this, 'add', xObj);


    
    this.Histogram_ = this.add_histogram(xObj);


    this.levelMin_ = this.add_levelMin(xObj);
    this.levelMax_ = this.add_levelMax(xObj);
    var c3 = this.add_brightness(xObj, this.levelMin_, this.levelMax_);
    var c4 = this.add_contrast(xObj, this.levelMin_, this.levelMax_);
    this.ScaleHistogramCheckbox_ = this.add_scaleHistogramCheckbox(xObj);
    var c5 = this.add_reset(xObj, this.levelMin_, this.levelMax_, c3, c4);


    //
    // Update the histogram when the sliders move
    //
    goog.array.forEach(
	[this.levelMin_, this.levelMax_, c3, c4], 
	function(levelCtrl){
	    goog.events.listen(levelCtrl.getComponent(), 
			       nrg.ui.Slider.EventType.SLIDE,
			       function(e){
				   //window.console.log(e.target);
				   this.updateHistogram_();
			       }.bind(this))
	}.bind(this))


    //window.console.log('Auto-level images.');
}
 


/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_scaleHistogramCheckbox = 
function(xObj) {
    // create
    var scaleHistogramCheckBox = this.createController( 
	xiv.ui.ctrl.CheckboxController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.SCALEHISTOGRAM, 
	function(e){
	    this.Histogram_.scaleOnChange(e.checked);
	    this.updateHistogram_();
	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(
	xObj, 
	scaleHistogramCheckBox);


    // set defaults
    this.Histogram_.scaleOnChange(true);
    scaleHistogramCheckBox.getComponent().setChecked(true);
   
    this.masterControllers.push(scaleHistogramCheckBox);
 
    return scaleHistogramCheckBox;
}



/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_reset = function(xObj) {
    // create

    
    var ctrl = this.createController( 
	xiv.ui.ctrl.ButtonController, 
	null,
	function(e){
	    

	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);

    this.masterControllers.push(ctrl);
    ctrl.setXObj(xObj);

    return ctrl;
}




/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_histogram = function(xObj) {
    // create

    var ctrl = this.createController( 
	xiv.ui.ctrl.Histogram, 
	null,//xiv.ui.ctrl.LevelsController.CONTROLLERS.HISTOGRAM, 
	function(e){

	    //xObj['windowLow'] = e.value;

	}.bind(this));

 
    ctrl.setXObj(xObj);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);

    this.masterControllers.push(ctrl);

    ctrl.update();

    return ctrl;
}



/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_levelMin = function(xObj) {
    // create
    var ctrl = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.LEVEL_MIN, 
	function(e){
	    xObj['windowLow'] = e.value;
	}.bind(this));
    ctrl.setXObj(xObj);

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);


    // store
    //window.console.log("***********", controller);
    this.masterControllers.push(ctrl);

    // set defaults
    ctrl.getComponent().setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    ctrl.getComponent().setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);


    ctrl.getComponent().setValue(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();


    return ctrl;
}




/**
 * @param {!X.object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_levelMax = function(xObj) {

    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.LEVEL_MAX);
    ctrl.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){
	    xObj['windowHigh'] = e.value;
	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);

    // store
    this.masterControllers.push(ctrl);


    ctrl.getComponent().setMaximum(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    ctrl.getComponent().setMinimum(xiv.ui.ctrl.LevelsController.LEVEL_MIN);
    ctrl.getComponent().setValue(xiv.ui.ctrl.LevelsController.LEVEL_MAX);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();

    return ctrl;
}




/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} levelMin
 * @param {!xiv.ui.ctrl.XtkController} levelMax
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_brightness = 
function(xObj, levelMin, levelMax) {
    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.BRIGHTNESS);
    ctrl.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	    
	    var rate = (e.value - e.previous) / (e.maximum - e.minimum);
	    var currDifference = xObj['windowHigh'] - xObj['windowLow'];

	    xObj['windowLow']  = 
		Math.round(parseInt(xObj['windowLow']) - 
			   (currDifference * rate));
	    xObj['windowHigh'] = 
		Math.round(parseInt(xObj['windowHigh']) - 
			   (currDifference * rate));


	    levelMin.getComponent().setValue(xObj['windowLow']);
	    levelMax.getComponent().setValue(xObj['windowHigh']);


	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);

    // store
    this.masterControllers.push(ctrl);


    ctrl.getComponent().setMaximum(150);
    ctrl.getComponent().setMinimum(-150);
    ctrl.getComponent().setValue(0);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();


    return ctrl;
}




/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} levelMin
 * @param {!xiv.ui.ctrl.XtkController} levelMax
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.LevelsController.prototype.add_contrast = 
function(xObj, levelMin, levelMax) {
    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.LevelsController.CONTROLLERS.CONTRAST);
    ctrl.setXObj(xObj);

    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	 

	    var rate = 3 * (e.value - e.previous) / (e.maximum - e.minimum);
	    var currDifference = parseInt(xObj['windowHigh']) - 
		parseInt(xObj['windowLow']);
	    var newLow = parseInt(xObj['windowLow']) + (currDifference * rate);
	    var newHigh = parseInt(xObj['windowHigh']) - 
		(currDifference * rate);


	    xObj['windowLow'] = Math.round(newLow);
	    xObj['windowHigh'] = Math.round(newHigh);
	    
	    levelMin.getComponent().setValue(xObj['windowLow']);
	    levelMax.getComponent().setValue(xObj['windowHigh']);
	}.bind(this))


    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, ctrl);

    // store
    this.masterControllers.push(ctrl);


    ctrl.getComponent().setMaximum(150);
    ctrl.getComponent().setMinimum(-150);
    ctrl.getComponent().setValue(0);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();


    return ctrl;
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.LevelsController.prototype.disposeInternal = function() {
    delete this.levelMin_;
    delete this.levelMax_;
    delete this.Histogram_;
    delete this.ScaleHistogramCheckbox_;
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
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_histogram',
	xiv.ui.ctrl.LevelsController.prototype.add_histogram);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_reset',
	xiv.ui.ctrl.LevelsController.prototype.add_reset);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_levelMin',
	xiv.ui.ctrl.LevelsController.prototype.add_levelMin);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_levelMax',
	xiv.ui.ctrl.LevelsController.prototype.add_levelMax);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_brightness',
	xiv.ui.ctrl.LevelsController.prototype.add_brightness);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.add_contrast',
	xiv.ui.ctrl.LevelsController.prototype.add_contrast);
goog.exportSymbol('xiv.ui.ctrl.LevelsController.prototype.disposeInternal',
	xiv.ui.ctrl.LevelsController.prototype.disposeInternal);
