/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.CheckboxController');
goog.require('xiv.ui.ctrl.SliderController');
goog.require('xiv.ui.ctrl.TwoThumbSliderController');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.MasterController3D');
xiv.ui.ctrl.MasterController3D = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.Object>}
     * @protected
     */
    this.xObjs = [];
}
goog.inherits(xiv.ui.ctrl.MasterController3D, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.MasterController3D', 
		  xiv.ui.ctrl.MasterController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.MasterController3D.ID_PREFIX =  'xiv.ui.ctrl.MasterController3D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterController3D.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @dict
 */
xiv.ui.ctrl.MasterController3D.CONTROLLERS = {
    BRIGHTNESS: 'Brightness',
    CONTRAST: 'Contrast',
    LEVEL_MIN: 'Level Min.',
    LEVEL_MAX: 'Level Max.',
    VISIBLE: 'Visible',
    OPACITY: 'Opacity',
};



/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController3D.prototype.add = function(xObj) {

    this.initMin_ = 0;
    this.initMax_ = 1000;


    // Generic controls -- per object
    this.xObjs.push(xObj);
    this.add_visible(xObj);
    this.add_opacity(xObj);


    /**
     * @type {xiv.ui.ctrl.XtkController}
     * @private
     */
    this.levelMin_ = this.add_levelMin(xObj);


    /**
     * @type {xiv.ui.ctrl.XtkController}
     * @private
     */
    this.levelMax_ = this.add_levelMax(xObj);


    /**
     * @type {xiv.ui.ctrl.XtkController}
     * @private
     */
    this.brightness_ = this.add_brightness(xObj);


    /**
     * @type {xiv.ui.ctrl.XtkController}
     * @private
     */
    this.contrast_ = this.add_contrast(xObj);


    // Generic master controls -- all objects
    if (this.xObjs.length == 1){
	goog.dom.append(document.body, this.getElement());

	this.add_displayAll(xObj);
	this.add_masterOpacity(xObj);
    }
}






/**
 * @param {!X.Object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_levelMin = function(xObj) {
    // create
    var ctrl = this.createController( 
	xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MIN, 
	function(e){
	    xObj.windowLow = e.value;
	}.bind(this));
    ctrl.setXObj(xObj);

    // set folder
    ctrl.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

    // store
    //window.console.log("***********", controller);
    this.masterControllers.push(ctrl);

    // set defaults
    ctrl.getComponent().setMaximum(1000);
    ctrl.getComponent().setMinimum(0);


    ctrl.getComponent().setValue(0);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();


    return ctrl;
}




/**
 * @param {!X.Object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_levelMax = function(xObj) {

    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MAX);
    ctrl.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){
	    xObj.windowHigh = e.value;
	}.bind(this))


    // set folder
    ctrl.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

    // store
    this.masterControllers.push(ctrl);


    ctrl.getComponent().setMaximum(1000);
    ctrl.getComponent().setMinimum(0);
    ctrl.getComponent().setValue(1000);
    ctrl.getComponent().setStep(1);
    ctrl.setValueDecimals(0);
    ctrl.update();

    return ctrl;
}




/**
 * @param {!X.Object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_brightness = function(xObj) {
    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.BRIGHTNESS);
    ctrl.setXObj(xObj);
    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	    
	    var rate = (e.value - e.previous) / (e.maximum - e.minimum);
	    var currDifference = xObj.windowHigh - xObj.windowLow;

	    xObj.windowLow  = 
		Math.round(parseInt(xObj.windowLow) - (currDifference * rate));
	    xObj.windowHigh = 
		Math.round(parseInt(xObj.windowHigh) - (currDifference * rate));


	    this.levelMin_.getComponent().setValue(xObj.windowLow);
	    this.levelMax_.getComponent().setValue(xObj.windowHigh);


	}.bind(this))


    // set folder
    ctrl.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

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
 * @param {!X.Object} xObj
 * @return {xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_contrast = function(xObj) {
    //
    // Create
    //
    var ctrl = this.createController( xiv.ui.ctrl.SliderController, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.CONTRAST);
    ctrl.setXObj(xObj);

    //
    // Listen for changes
    //
    goog.events.listen(ctrl, 
	xiv.ui.ctrl.XtkController.EventType.CHANGE, 
	function(e){	 
	    var rate = (e.value - e.previous) / (e.maximum - e.minimum);
	    var currDifference = parseInt(xObj.windowHigh) - 
		parseInt(xObj.windowLow);
	    var newLow = parseInt(xObj.windowLow) + (currDifference * rate);
	    var newHigh = parseInt(xObj.windowHigh) - (currDifference * rate);
	    xObj.windowLow = Math.round(newLow);
	    xObj.windowHigh = Math.round(newHigh);
	    
	    this.levelMin_.getComponent().setValue(xObj.windowLow);
	    this.levelMax_.getComponent().setValue(xObj.windowHigh);

	}.bind(this))


    // set folder
    ctrl.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

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
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_displayAll = function(xObj) {
    // create
    var displayAll = this.createController(
	xiv.ui.ctrl.CheckboxController, 'Display All', 
	this.onMasterDisplayAllChange_.bind(this));

    // set folder
    displayAll.setFolders([xiv.ui.ctrl.XtkController.getObjectCategory(xObj)])

    // store
    //window.console.log("***********", displayAll);
    this.masterControllers.push(displayAll);

    // set defaults
    displayAll.getComponent().setChecked(true);
} 


/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_masterOpacity = function(xObj) {
    // create
    var masterOpacity = this.createController( 
	xiv.ui.ctrl.SliderController, 'Master Opacity', 
	this.onMasterOpacityChange_.bind(this));
    
    // set folder
    masterOpacity.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

    // store
    //window.console.log("***********", masterOpacity);
    this.masterControllers.push(masterOpacity);

    // set defaults
    masterOpacity.getComponent().setValue(1);
}



/**
 * @private
 */
xiv.ui.ctrl.MasterController3D.prototype.onMasterOpacityChange_ = 
function(e) {
    goog.array.forEach(this.subControllers, function(subC){
	if (subC.getLabel().innerHTML == 'Opacity') {
	    subC.getComponent().setValue(parseFloat(e.value));
	}
    })		   
}




/**
 * @private
 */
xiv.ui.ctrl.MasterController3D.prototype.onMasterDisplayAllChange_ = 
function(e) {
    goog.array.forEach(this.subControllers, function(subC){
	if (subC.getLabel().innerHTML == 'Visible') {
	    subC.setChecked(e.checked);
	}
    })
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.MasterController3D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.levelMax_;
    delete this.levelMin_;
    delete this.brightness_;
    delete this.contrast_;


    // XObjs
    goog.array.clear(this.xObjs);
    delete this.xObjs;

}



