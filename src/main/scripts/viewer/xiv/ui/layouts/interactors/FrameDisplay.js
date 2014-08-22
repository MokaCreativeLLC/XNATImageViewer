/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.interactors.FrameDisplay');

// goog
goog.require('goog.dom');

// xiv
goog.require('nrg.ui.HoverInput');

//-----------




/**
 * xiv.ui.layouts.interactors.FrameDisplay
 *
 * @constructor
 * @extends {nrg.ui.HoverInput}
 */
xiv.ui.layouts.interactors.FrameDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.FrameDisplay, nrg.ui.HoverInput);
goog.exportSymbol('xiv.ui.layouts.interactors.FrameDisplay', 
		  xiv.ui.layouts.interactors.FrameDisplay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.FrameDisplay.ID_PREFIX =  
    'xiv.ui.layouts.interactors.FrameDisplay';



/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.updateValue = 
function(){
    //if (!goog.isDefAndNotNull(this.inputBox)){return}
    this.displayElt.innerHTML = this.inputBox.value + 
	' / ' + this.inputBox.max;
    this.alignDisplayElement();
}





goog.exportSymbol('xiv.ui.layouts.interactors.FrameDisplay.ID_PREFIX',
	xiv.ui.layouts.interactors.FrameDisplay.ID_PREFIX);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.FrameDisplay.prototype.updateValue',
    xiv.ui.layouts.interactors.FrameDisplay.prototype.updateValue);
