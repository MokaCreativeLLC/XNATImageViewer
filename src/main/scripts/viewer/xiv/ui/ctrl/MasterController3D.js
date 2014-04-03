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
     * @type {!Array.<xiv.ui.ctrl.XtkController>}
     * @protected
     */
    this.masterControllers = [];


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


    // Generic master controls -- all objects
    if (this.xObjs_.length == 1){
	goog.dom.append(document.body, this.getElement());

	this.add_displayAll();
	this.add_masterOpacity();

	/**
	var colorPalette = new xiv.ui.ctrl.ColorPaletteController();
	this.subControllers.push(twoThumb);
	goog.dom.append(this.getElement(), colorPalette.getElement());
	*/

	this.getElement().style.position = 'absolute';
	this.getElement().style.left = '10%';
	this.getElement().style.top = '30%';
	this.getElement().style.height = '200px';
	this.getElement().style.width = '400px';
	this.getElement().style.backgroundColor = 'rgba(20,200,20,1)';
	this.getElement().style.opacity = 1;
	this.getElement().style.zIndex = 4000;
	window.console.log('sub', this.getElement());

	//this.addMasterControls_();
    }
}



/**
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_displayAll = function() {
    // create
    var displayAll = this.createController(
	xiv.ui.ctrl.CheckboxController, 'Display All', 
	this.onMasterDisplayAllChange_.bind(this));

    // store
    this.masterControllers.push(displayAll);

    // set defaults
    displayAll.getComponent().setChecked(true);
} 


/**
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_masterOpacity = function() {
    // create
    var masterOpacity = this.createController( 
	xiv.ui.ctrl.SliderController, 'Master Opacity12', 
	this.onMasterOpacityChange_.bind(this));

    // store
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
	    subC.getComponent().setChecked(e.checked);
	}
    })
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.MasterController3D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Master controllers.
    goog.object.forEach(this.masterControllers, function(controller){
	goog.events.removeAll(controller);
	controller.disposeInternal();
	controller = null;
    })
    goog.array.clear(this.masterControllers);
    delete this.masterControllers;

    // XObjs
    goog.array.clear(this.xObjs_);
    delete this.xObjs_;

}



