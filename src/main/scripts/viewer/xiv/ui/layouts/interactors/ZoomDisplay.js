/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.interactors.ZoomDisplay');

// goog
goog.require('goog.cssom');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');

// xiv
goog.require('xiv.ui.layouts.interactors.InputController');

//-----------




/**
 * xiv.ui.layouts.interactors.ZoomDisplay
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.layouts.interactors.ZoomDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.ZoomDisplay, 
	      xiv.ui.layouts.interactors.InputController);
goog.exportSymbol('xiv.ui.layouts.interactors.ZoomDisplay', 
		  xiv.ui.layouts.interactors.ZoomDisplay);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX =  
    'xiv.ui.layouts.interactors.ZoomDisplay';



/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue = 
function(){
    //if (!goog.isDefAndNotNull(this.inputBox_)){return}
    this.displayElt_.innerHTML = 'Zoom level:&nbsp' + 
	this.inputBox_.value + '%';
}



goog.exportSymbol(
    'xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX',
    xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue',
    xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue);



