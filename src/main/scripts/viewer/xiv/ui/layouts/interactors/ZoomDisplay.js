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
goog.require('xiv.vis.XtkRenderer2D');

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
xiv.ui.layouts.interactors.ZoomDisplay.prototype.render = 
function(parentElement) {
    goog.base(this, 'render', parentElement);

    //
    // Match the zoom minimum
    //
    this.inputBox.min = xiv.vis.XtkRenderer2D.ZOOM_MINIMUM * 100;
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue = 
function(){
    //window.console.log(this.inputBox.min, this.inputBox.max);
    this.displayElt.innerHTML = 'Zoom level:&nbsp' + 
	this.inputBox.value + '%';
}



goog.exportSymbol(
    'xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX',
    xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue',
    xiv.ui.layouts.interactors.ZoomDisplay.prototype.updateValue);



