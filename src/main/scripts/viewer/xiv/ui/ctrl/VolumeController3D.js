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
 * @const
 */
xiv.ui.ctrl.VolumeController3D.DEFAULT_THRESHOLD = 1000;



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
	xiv.ui.ctrl.CheckboxController, 'Volume Rendering', 
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
 * @param {!Event}
 * @protected
 */
xiv.ui.ctrl.VolumeController3D.onSliderChange_ = function(e) {
    e.target[xiv.ui.ctrl.VolumeController3D.VOLUME_ID].lowerThreshold 
	= parseFloat(e.lower);
    e.target[xiv.ui.ctrl.VolumeController3D.VOLUME_ID].upperThreshold 
	= parseFloat(e.upper);
}



/**
 * @const
 */
xiv.ui.ctrl.VolumeController3D.VOLUME_ID = goog.string.createUniqueString();



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.VolumeController3D.prototype.add_threshold = function(xObj) {
    //
    // create controller
    //
    var threshold = this.createController(
	xiv.ui.ctrl.TwoThumbSliderController, 'Threshold', 
	this.constructor.onSliderChange_);

    //
    // Point the controller to the xObj (stored as a property);
    //
    threshold[xiv.ui.ctrl.VolumeController3D.VOLUME_ID] = xObj;

    //
    // set folder
    //
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, threshold);

    //
    // strore
    //
    this.subControllers.push(threshold);

    //
    // NOTE: we create vars instead of referring to the xObj properties
    // because the slider 'CHANGE' event changes xObj's threshold properties.
    //
    var lowerThresh = xObj.lowerThreshold;
    var upperThresh = xObj.upperThreshold;

    //
    //  Change any Infinity values...
    //
    if (lowerThresh == -Infinity){
	lowerThresh = -1 *
	    xiv.ui.ctrl.VolumeController3D.DEFAULT_THRESHOLD;
	xObj.lowerThreshold = lowerThresh;
    }

    if (xObj.upperThreshold == Infinity){
	upperThresh = xiv.ui.ctrl.VolumeController3D.DEFAULT_THRESHOLD;
	xObj.upperThreshold = upperThresh;
    }
  
    //
    // ADJUSTING THESE values fire's the 'CHANGE" event defined in
    // this.constructor.onSliderChange_
    //
    var thresholdSlider = threshold.getComponent();
    thresholdSlider.setMinimum(lowerThresh);
    thresholdSlider.setMaximum(upperThresh);
    thresholdSlider.setValueAndExtent(upperThresh - lowerThresh);
    thresholdSlider.setValue(lowerThresh);
    thresholdSlider.setStep(10);

    //
    // IMPORTANT!!!!! DO NOT ERASE!!
    //
    // Extent is an absolute.  Even if you're range is from -50 to 50,
    // if you want to set the extent thumb to the right, it has to be 100!
    //
    // IMPORTANT!!!
    //
    thresholdSlider.setExtent(upperThresh - lowerThresh);

    //
    // So we basically have to set these values back again...
    //
    xObj.upperThreshold = upperThresh;
    xObj.lowerThreshold = lowerThresh;
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



/**
 * @inheritDoc
 */
xiv.ui.ctrl.VolumeController3D.prototype.updateStyle = function(xObj) {
    // Call superclass add
    goog.base(this, 'updateStyle');

}


