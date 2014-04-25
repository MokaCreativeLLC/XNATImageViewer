/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Overlay');



/**
 * @constructor
 * @extends {nrg.ui.Overlay}
 */
goog.provide('nrg.ui.ErrorOverlay');
nrg.ui.ErrorOverlay = function () {
    goog.base(this);   
}
goog.inherits(nrg.ui.ErrorOverlay, nrg.ui.Overlay);
goog.exportSymbol('nrg.ui.ErrorOverlay', nrg.ui.ErrorOverlay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.ErrorOverlay.ID_PREFIX =  'nrg.ui.ErrorOverlay';



/**
 * @enum {string}
 */
nrg.ui.ErrorOverlay.CSS_SUFFIX = {
    NO_WEBGL_IMAGE: 'no-webgl-image'
};



/**
 * @inheritDoc
 */
nrg.ui.ErrorOverlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

}
