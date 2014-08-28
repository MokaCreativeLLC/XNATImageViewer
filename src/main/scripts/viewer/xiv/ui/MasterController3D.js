/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.MasterController3D');

// goog
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.array');

// X
goog.require('X.object');

// xiv
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.CheckboxController');
goog.require('xiv.ui.SliderController');
goog.require('xiv.ui.TwoThumbSliderController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.MasterController3D = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.object>}
     * @protected
     */
    this.xObjs = [];
}
goog.inherits(xiv.ui.MasterController3D, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.MasterController3D', 
		  xiv.ui.MasterController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.MasterController3D.ID_PREFIX =  'xiv.ui.MasterController3D';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.MasterController3D.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @dict
 */
xiv.ui.MasterController3D.CONTROLLERS = {
    VISIBLE: 'Visible',
    OPACITY: 'Opacity',
};



/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.MasterController3D.prototype.add = function(xObj) {

    // Generic controls -- per object
    this.xObjs.push(xObj);
    this.add_opacity(xObj, xiv.ui.SliderController);


    // Generic master controls -- all objects
    if (this.xObjs.length == 1){
	goog.dom.append(document.body, this.getElement());
    }
}




/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.XtkController.prototype.add_displayAll = function(xObj) {
    // create
    var displayAll = this.createController(
	xiv.ui.CheckboxController, 'Display All', 
	this.onMasterDisplayAllChange_.bind(this));

    // set folder
    //displayAll.setFolders([xiv.ui.XtkController.getObjectCategory(xObj)])

    // store
    //window.console.log("***********", displayAll);
    this.masterControllers.push(displayAll);

    // set defaults
    displayAll.getComponent().setChecked(true);
} 


/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.XtkController.prototype.add_masterOpacity = function(xObj) {
    // create
    var masterOpacity = this.createController( 
	xiv.ui.SliderController, 'Master Opacity', 
	this.onMasterOpacityChange_.bind(this));
    
    // set folder
    //masterOpacity.setFolders([
    //xiv.ui.XtkController.getObjectCategory(xObj)]);

    // store
    //window.console.log("***********", masterOpacity);
    this.masterControllers.push(masterOpacity);

    // set defaults
    masterOpacity.getComponent().setValue(1);
}



/**
 * @private
 */
xiv.ui.MasterController3D.prototype.onMasterOpacityChange_ = 
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
xiv.ui.MasterController3D.prototype.onMasterDisplayAllChange_ = 
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
xiv.ui.MasterController3D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // XObjs
    goog.array.clear(this.xObjs);
    delete this.xObjs;

}



goog.exportSymbol('xiv.ui.MasterController3D.ID_PREFIX',
	xiv.ui.MasterController3D.ID_PREFIX);
goog.exportSymbol('xiv.ui.MasterController3D.CSS_SUFFIX',
	xiv.ui.MasterController3D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.MasterController3D.CONTROLLERS',
	xiv.ui.MasterController3D.CONTROLLERS);
goog.exportSymbol('xiv.ui.MasterController3D.prototype.add',
	xiv.ui.MasterController3D.prototype.add);
goog.exportSymbol('xiv.ui.MasterController3D.prototype.disposeInternal',
	xiv.ui.MasterController3D.prototype.disposeInternal);

