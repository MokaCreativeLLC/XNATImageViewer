/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.VolumeController');


// goog
goog.require('goog.object');

// X
goog.require('X.object');

// xiv
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.MasterController');
goog.require('xiv.ui.RadioButtonController');
goog.require('xiv.ui.MasterController2D');
goog.require('xiv.ui.CheckboxController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.MasterController2D}
 */
xiv.ui.VolumeController = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.VolumeController, xiv.ui.MasterController);
goog.exportSymbol('xiv.ui.VolumeController', 
		  xiv.ui.VolumeController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.VolumeController.ID_PREFIX =  'xiv.ui.VolumeController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.VolumeController.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.VolumeController.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    this.add_visibleRadio(xObj);

    this.add_labelMapToggle(xObj);
}







/**
 * @param {!X.object} xObj
 * @protected
 */
xiv.ui.VolumeController.prototype.add_visibleRadio = function(xObj) {

    // create
    var visible = this.createController(
	xiv.ui.RadioButtonController, 'Visible', 
	function(e){
	    //window.console.log(e);
	});

    // set folder
    xiv.ui.XtkController.setControllerFolders(xObj, visible);

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
xiv.ui.VolumeController.prototype.add_labelMapToggle = function(xObj) {

    // create
    var labelMapCheckBox = this.createController( 
	xiv.ui.CheckboxController, 'Show Label Map', 
	function(e){
	    //window.console.log(e);
	    //window.console.log('label map toggle:', xObj, xObj.labelmap);
	    xObj['labelmap']['visible'] = e.checked;
	});

    // set folder
    xiv.ui.XtkController.setControllerFolders(xObj, 
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
xiv.ui.VolumeController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    //window.console.log("need to implement dispose methods" + 
    //" for VolumeController");
}




goog.exportSymbol('xiv.ui.VolumeController.ID_PREFIX',
	xiv.ui.VolumeController.ID_PREFIX);
goog.exportSymbol('xiv.ui.VolumeController.CSS_SUFFIX',
	xiv.ui.VolumeController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.VolumeController.prototype.add',
	xiv.ui.VolumeController.prototype.add);
goog.exportSymbol('xiv.ui.VolumeController.prototype.add_visibleRadio',
	xiv.ui.VolumeController.prototype.add_visibleRadio);
goog.exportSymbol('xiv.ui.VolumeController.prototype.add_labelMapToggle',
	xiv.ui.VolumeController.prototype.add_labelMapToggle);
goog.exportSymbol('xiv.ui.VolumeController.prototype.disposeInternal',
	xiv.ui.VolumeController.prototype.disposeInternal);
