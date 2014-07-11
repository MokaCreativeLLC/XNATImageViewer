/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ErrorDialog');

// goog
goog.require('goog.dom');
goog.require('goog.dom.classes');

// nrg
goog.require('nrg.ui.Dialog');



/**
 * @constructor
 * @extends {nrg.ui.Dialog}
 */
nrg.ui.ErrorDialog = function () {
    goog.base(this);   
}
goog.inherits(nrg.ui.ErrorDialog, nrg.ui.Dialog);
goog.exportSymbol('nrg.ui.ErrorDialog', nrg.ui.ErrorDialog);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.ErrorDialog.ID_PREFIX =  'nrg.ui.ErrorDialog';



/**
 * @enum {string}
 * @expose
 */
nrg.ui.ErrorDialog.CSS = {
    OVERLAY: 'nrg-ui-errordialog',
    IMAGE: 'nrg-ui-errordialog-image',
    TEXT: 'nrg-ui-errordialog-text'
};




/**
 * @type {?Element}
 * @private
 */
nrg.ui.ErrorDialog.prototype.errorImage_ = null;




/**
 * @inheritDoc
 */
nrg.ui.ErrorDialog.prototype.addText = function(text) {
    goog.base(this, 'addText', text);

    var eltTexts = this.getTextElements();
    goog.dom.classes.add(eltTexts[eltTexts.length - 1], 
			nrg.ui.ErrorDialog.CSS.TEXT)
}



/**
 * @inheritDoc
 */
nrg.ui.ErrorDialog.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    goog.dom.classes.add(this.getElement(), nrg.ui.ErrorDialog.CSS.OVERLAY);

    if (!goog.isDefAndNotNull(this.errorImage_)){
	this.errorImage_ = this.addImage(
	    serverRoot + 
		'/images/viewer/xiv/ui/Overlay/sadbrain-white.png');
	    goog.dom.classes.add(this.errorImage_, 
				 nrg.ui.ErrorDialog.CSS.IMAGE);
	this.center();
    }
}



/**
 * @inheritDoc
 */
nrg.ui.ErrorDialog.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    if (goog.isDefAndNotNull(this.errorImage_.parentNode)){
	goog.dom.removeNode(this.errorImage_);
    }
    delete this.errorImage_;
}



goog.exportSymbol('nrg.ui.ErrorDialog.ID_PREFIX',
	nrg.ui.ErrorDialog.ID_PREFIX);
goog.exportSymbol('nrg.ui.ErrorDialog.CSS',
	nrg.ui.ErrorDialog.CSS);
goog.exportSymbol('nrg.ui.ErrorDialog.prototype.addText',
	nrg.ui.ErrorDialog.prototype.addText);
goog.exportSymbol('nrg.ui.ErrorDialog.prototype.disposeInternal',
	nrg.ui.ErrorDialog.prototype.disposeInternal);
