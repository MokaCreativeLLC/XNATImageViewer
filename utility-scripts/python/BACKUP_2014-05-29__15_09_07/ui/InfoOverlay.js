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
goog.provide('nrg.ui.InfoOverlay');
nrg.ui.InfoOverlay = function () {
    goog.base(this);   
}
goog.inherits(nrg.ui.InfoOverlay, nrg.ui.Overlay);
goog.exportSymbol('nrg.ui.InfoOverlay', nrg.ui.InfoOverlay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.InfoOverlay.ID_PREFIX =  'nrg.ui.InfoOverlay';



/**
 * @enum {string}
 */
nrg.ui.InfoOverlay.CSS_SUFFIX = {
    TEXT: 'text'
};



/**
 * @param {string=} opt_text The text for this
 * @return {Element} The image object.
 * @public
 */
nrg.ui.InfoOverlay.prototype.addText = function(opt_text) {
    goog.base(this, 'addText', opt_text);

    goog.dom.classes.add(this.texts_[this.texts_.length-1],
			 nrg.ui.InfoOverlay.CSS.TEXT);

    return this.texts_[this.texts_.length-1];
}



/**
 * @inheritDoc
 */
nrg.ui.InfoOverlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

}
