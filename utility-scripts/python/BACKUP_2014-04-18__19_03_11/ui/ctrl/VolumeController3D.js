/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.MasterController3D');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController3D}
 */
goog.provide('xiv.ui.ctrl.VolumeController3D');
xiv.ui.ctrl.VolumeController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.VolumeController3D, xiv.ui.ctrl.MasterController3D);
goog.exportSymbol('xiv.ui.ctrl.VolumeController3D', 
		  xiv.ui.ctrl.VolumeController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.VolumeController3D.ID_PREFIX =  'xiv.ui.ctrl.VolumeController3D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.VolumeController3D.CSS_SUFFIX = {};



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.VolumeController3D.prototype.add_volumeRendering = function(xObj) {

    // create
    var volumeRenderingCheckBox = this.createController( 
	xiv.ui.ctrl.CheckboxController, 'Volume Rendering!', 
	function(e){
	    xObj.volumeRendering = e.checked;
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, 
						   volumeRenderingCheckBox);

    // store
    this.subControllers.push(volumeRenderingCheckBox);

    // set defaults
    volumeRenderingCheckBox.getComponent().setChecked(false);
}



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.VolumeController3D.prototype.add_threshold = function(xObj) {

    // create
    var threshold = this.createController(
	xiv.ui.ctrl.TwoThumbSliderController, 'Threshold!', 
	function(e){
	    xObj.lowerThreshold = parseFloat(e.lower);
	    xObj.upperThreshold = parseFloat(e.upper);
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, threshold);

    // strore
    this.subControllers.push(threshold);

    // set defaults
    window.console.log(xObj, xObj.lowerThreshold, xObj.upperThreshold);
    threshold.getComponent().setMinimum(xObj.lowerThreshold);
    threshold.getComponent().setMaximum(xObj.upperThreshold);
    threshold.getComponent().setValue(xObj.lowerThreshold);
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.VolumeController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    this.add_volumeRendering(xObj);
    this.add_threshold(xObj);
}


