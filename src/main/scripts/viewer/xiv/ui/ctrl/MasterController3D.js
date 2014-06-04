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
goog.require('xiv.ui.ctrl.ColorPaletteController');



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
     * @private
     */
    this.xObjs_ = [];
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
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController3D.prototype.add = function(xObj) {

    // Generic controls -- per object
    this.xObjs_.push(xObj);
    this.add_visible(xObj);
    this.add_opacity(xObj);
    this.add_windowHigh(xObj);
    this.add_windowLow(xObj);

    // Generic master controls -- all objects
    if (this.xObjs_.length == 1){
	goog.dom.append(document.body, this.getElement());

	this.add_displayAll(xObj);
	this.add_masterOpacity(xObj);
    }
}



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_windowLow = function(xObj) {
    // create
    var windowLow = this.createController( 
	xiv.ui.ctrl.SliderController, 'Window Low', 
	function(e){
	    xObj.windowLow = e.value;
	});
    
    // set folder
    windowLow.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

    // store
    //window.console.log("***********", windowLow);
    this.masterControllers.push(windowLow);

    // set defaults
    windowLow.getComponent().setMaximum(5000);
    windowLow.getComponent().setValue(xObj.windowLow);
}



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.MasterController3D.prototype.add_windowHigh = function(xObj) {
    // create
    var windowHigh = this.createController( 
	xiv.ui.ctrl.SliderController, 'Window High', 
	function(e){
	    xObj.windowHigh = e.value;
	});
    
    // set folder
    windowHigh.setFolders([
	xiv.ui.ctrl.XtkController.getObjectCategory(xObj)]);

    // store
    //window.console.log("***********", windowHigh);
    this.masterControllers.push(windowHigh);

    // set defaults
    windowHigh.getComponent().setMaximum(5000);
    windowHigh.getComponent().setValue(xObj.windowHigh);
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


    // XObjs
    goog.array.clear(this.xObjs_);
    delete this.xObjs_;

}



