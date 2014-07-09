/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ErrorOverlay');

// goog
goog.require('goog.dom');
goog.require('goog.dom.classes');

// nrg
goog.require('nrg.ui.Dialog');



/**
 * @constructor
 * @extends {nrg.ui.Dialog}
 */
nrg.ui.ErrorOverlay = function () {
    goog.base(this);   
    goog.dom.classes.add(this.overlay_, nrg.ui.ErrorOverlay.CSS.OVERLAY);
}
goog.inherits(nrg.ui.ErrorOverlay, nrg.ui.Dialog);
goog.exportSymbol('nrg.ui.ErrorOverlay', nrg.ui.ErrorOverlay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.ErrorOverlay.ID_PREFIX =  'nrg.ui.ErrorOverlay';



/**
 * @enum {string}
 * @expose
 */
nrg.ui.ErrorOverlay.CSS = {
    OVERLAY: 'nrg-ui-infooverlay-overlay',
    TEXT: 'nrg-ui-infooverlay-text'
};



/**
 * @inheritDoc
 */
nrg.ui.ErrorOverlay.prototype.addText = function(text) {
    goog.base(this, 'addText', text);

    var eltTexts = this.getTextElements();
    goog.dom.classes.add(eltTexts[eltTexts.length - 1], 
			nrg.ui.ErrorOverlay.CSS.TEXT)
}



/**
 * @inheritDoc
 */
nrg.ui.ErrorOverlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
}



goog.exportSymbol('nrg.ui.ErrorOverlay.ID_PREFIX',
	nrg.ui.ErrorOverlay.ID_PREFIX);
goog.exportSymbol('nrg.ui.ErrorOverlay.prototype.addText',
	nrg.ui.ErrorOverlay.prototype.addText);
goog.exportSymbol('nrg.ui.ErrorOverlay.prototype.disposeInternal',
	nrg.ui.ErrorOverlay.prototype.disposeInternal);
