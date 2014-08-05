/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */
goog.provide('xiv.vis.XtkPlane2D');


// xiv
goog.require('xiv.vis.XtkRenderer2D');
goog.require('xiv.vis.XtkPlane');

//-----------


/**
 * @constructor
 * @param {!string} orientation The plane orientation.
 * @extends {xiv.vis.XtkPlane}
 */
xiv.vis.XtkPlane2D = function (orientation) {
    goog.base(this);

    //
    // Set the orientation
    //
    this.orientation = orientation;

    //
    // Set the renderer
    //
    this.XRenderer = xiv.vis.XtkRenderer2D;

    /**
     * @private
     * @type {?Object}
     */
    this.currVolume_ = null;
}
goog.inherits(xiv.vis.XtkPlane2D, xiv.vis.XtkPlane);
goog.exportSymbol('xiv.vis.XtkPlane2D', xiv.vis.XtkPlane2D);




/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX = 
function(sliceNum) {
    return this.Renderer.getSliceRelativeToContainerX(sliceNo);
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY = 
function(sliceNum) {
    return this.Renderer.getSliceRelativeToContainerY(sliceNo);
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getVolume = function() {
    return goog.isDefAndNotNull(this.Renderer) ? this.Renderer.getVolume() : 
	null;
}



/**
 * @inheritDoc
 */
xiv.vis.XtkPlane2D.prototype.setContainer = function(containerElt) {
    //window.console.log("SETTING CONTAINER");
    goog.base(this, 'setContainer', containerElt);
    //this.Renderer.onContainerChanged();
}



/**
 * @inheritDoc
 */
xiv.vis.XtkPlane2D.prototype.dispose = function() {
    goog.base(this, 'dispose');
    delete this.currVolume_;
    delete this.keyDown_;
    delete this.keyUp_;
}



goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX',
	xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY',
	xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getVolume',
	xiv.vis.XtkPlane2D.prototype.getVolume);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.setContainer',
	xiv.vis.XtkPlane2D.prototype.setContainer);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.dispose',
	xiv.vis.XtkPlane2D.prototype.dispose);
