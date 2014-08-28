/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ZoomDisplay');

// goog
goog.require('goog.cssom');
goog.require('goog.dom');


// xiv
goog.require('nrg.ui.HoverInput');
goog.require('xiv.vis.XtkRenderer2D');

//-----------




/**
 * xiv.ui.ZoomDisplay
 *
 * @constructor
 * @extends {nrg.ui.HoverInput}
 */
xiv.ui.ZoomDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.ZoomDisplay, nrg.ui.HoverInput);
goog.exportSymbol('xiv.ui.ZoomDisplay', 
		  xiv.ui.ZoomDisplay);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ZoomDisplay.ID_PREFIX =  
    'xiv.ui.ZoomDisplay';


/**
 * @inheritDoc
 */
xiv.ui.ZoomDisplay.prototype.render = 
function(parentElement) {
    goog.base(this, 'render', parentElement);

    //
    // Match the zoom minimum
    //
    this.inputBox.min = xiv.vis.XtkRenderer2D.ZOOM_MINIMUM * 100;
    goog.dom.classes.add(this.getDisplayElement(),
			 'xiv-ui-framedisplay-text');
    goog.dom.classes.add(this.getInputElement(),
			 'xiv-ui-framedisplay-text');
}



/**
 * @inheritDoc
 */
xiv.ui.ZoomDisplay.prototype.updateValue = 
function(){
    //window.console.log(this.inputBox.min, this.inputBox.max);
    this.displayElt.innerHTML = 'Zoom:&nbsp' + 
	this.inputBox.value + '%';
    this.alignDisplayElement();
}



goog.exportSymbol(
    'xiv.ui.ZoomDisplay.ID_PREFIX',
    xiv.ui.ZoomDisplay.ID_PREFIX);
goog.exportSymbol(
    'xiv.ui.ZoomDisplay.prototype.updateValue',
    xiv.ui.ZoomDisplay.prototype.updateValue);
goog.exportSymbol(
    'xiv.ui.ZoomDisplay.prototype.render',
    xiv.ui.ZoomDisplay.prototype.render);


