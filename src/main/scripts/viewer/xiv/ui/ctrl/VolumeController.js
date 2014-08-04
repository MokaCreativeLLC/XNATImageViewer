/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.VolumeController');


// goog
goog.require('goog.object');

// X
goog.require('X.object');

// xiv
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.MasterController');
goog.require('xiv.ui.ctrl.RadioButtonController');
goog.require('xiv.ui.ctrl.MasterController2D');
goog.require('xiv.ui.ctrl.CheckboxController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController2D}
 */
xiv.ui.ctrl.VolumeController = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.VolumeController, xiv.ui.ctrl.MasterController);
goog.exportSymbol('xiv.ui.ctrl.VolumeController', 
		  xiv.ui.ctrl.VolumeController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.VolumeController.ID_PREFIX =  'xiv.ui.ctrl.VolumeController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.VolumeController.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.ctrl.VolumeController.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    this.add_visibleRadio(xObj);

    this.add_labelMapToggle(xObj);
}







/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.ctrl.VolumeController.prototype.add_visibleRadio = function(xObj) {

    // create
    var visible = this.createController(
	xiv.ui.ctrl.RadioButtonController, 'Visible', 
	function(e){
	    //window.console.log(e);
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, visible);

    // strore
    this.subControllers.push(visible);
    visible.setXObj(xObj);

    // set defaults
    visible.getComponent().checked = xObj[xiv.vis.RenderEngine.SELECTED_VOL_KEY] 
	|| false;
}



/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.ctrl.VolumeController.prototype.add_labelMapToggle = function(xObj) {

    // create
    var labelMapCheckBox = this.createController( 
	xiv.ui.ctrl.CheckboxController, 'Show Label Map', 
	function(e){
	    //window.console.log(e);
	    //window.console.log('label map toggle:', xObj, xObj.labelmap);
	    xObj.labelmap.visible = e.checked;
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, 
						   labelMapCheckBox);

    // store
    this.subControllers.push(labelMapCheckBox);
    labelMapCheckBox.setXObj(xObj);

    // set defaults
    labelMapCheckBox.getComponent().setChecked(false);
}




/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.VolumeController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    //window.console.log("need to implement dispose methods" + 
    //" for VolumeController");
}




goog.exportSymbol('xiv.ui.ctrl.VolumeController.ID_PREFIX',
	xiv.ui.ctrl.VolumeController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.VolumeController.CSS_SUFFIX',
	xiv.ui.ctrl.VolumeController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.VolumeController.prototype.add',
	xiv.ui.ctrl.VolumeController.prototype.add);
goog.exportSymbol('xiv.ui.ctrl.VolumeController.prototype.add_visibleRadio',
	xiv.ui.ctrl.VolumeController.prototype.add_visibleRadio);
goog.exportSymbol('xiv.ui.ctrl.VolumeController.prototype.add_labelMapToggle',
	xiv.ui.ctrl.VolumeController.prototype.add_labelMapToggle);
goog.exportSymbol('xiv.ui.ctrl.VolumeController.prototype.disposeInternal',
	xiv.ui.ctrl.VolumeController.prototype.disposeInternal);
