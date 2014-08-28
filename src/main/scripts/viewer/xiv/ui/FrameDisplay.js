/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.FrameDisplay');

// goog
goog.require('goog.dom');

// xiv
goog.require('nrg.ui.HoverInput');

//-----------




/**
 * xiv.ui.FrameDisplay
 *
 * @constructor
 * @extends {nrg.ui.HoverInput}
 */
xiv.ui.FrameDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.FrameDisplay, nrg.ui.HoverInput);
goog.exportSymbol('xiv.ui.FrameDisplay', 
		  xiv.ui.FrameDisplay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.FrameDisplay.ID_PREFIX =  
    'xiv.ui.FrameDisplay';



/**
 * @inheritDoc
 */
xiv.ui.FrameDisplay.prototype.render = function(opt_parentElement){
    goog.base(this, 'render', opt_parentElement);
    goog.dom.classes.add(this.getDisplayElement(),
			 'xiv-ui-framedisplay-text');
    goog.dom.classes.add(this.getInputElement(),
			 'xiv-ui-framedisplay-text');
} 



/**
 * @inheritDoc
 */
xiv.ui.FrameDisplay.prototype.updateValue = 
function(){
    //if (!goog.isDefAndNotNull(this.inputBox)){return}
    this.displayElt.innerHTML = this.inputBox.value + 
	' / ' + this.inputBox.max;
    this.alignDisplayElement();
}





goog.exportSymbol('xiv.ui.FrameDisplay.ID_PREFIX',
	xiv.ui.FrameDisplay.ID_PREFIX);
goog.exportSymbol(
    'xiv.ui.FrameDisplay.prototype.updateValue',
    xiv.ui.FrameDisplay.prototype.updateValue);
goog.exportSymbol(
    'xiv.ui.FrameDisplay.prototype.render',
    xiv.ui.FrameDisplay.prototype.render);
