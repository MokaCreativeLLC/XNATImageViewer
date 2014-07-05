/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.style')

// xiv
goog.require('xiv.ui.layouts.XyzvLayout')

//-----------



/**
 * xiv.ui.layouts.SingleFrameLayout
 *
 * @constructor
 * @param {string= | Array.<string>=} opt_frames
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.SingleFrameLayout');
xiv.ui.layouts.SingleFrameLayout = function(opt_frames) { 
    goog.base(this, opt_frames); 
}
goog.inherits(xiv.ui.layouts.SingleFrameLayout, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.SingleFrameLayout', 
		  xiv.ui.layouts.SingleFrameLayout);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.SingleFrameLayout.TITLE = 'SingleFrameLayout';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.SingleFrameLayout.ID_PREFIX =  
    'xiv.ui.layouts.SingleFrameLayout';




/**
 * @private
 */
xiv.ui.layouts.SingleFrameLayout.prototype.scaleFrames_ = function(){
    if ((this.prevSize.width !== this.currSize.width) || 
	(this.prevSize.height !== this.currSize.height)) {
	//window.console.log("SCALE FRAMES!");
	var heightDiff = 1 - ((this.prevSize.height - this.currSize.height) / 
	    this.prevSize.height);
	var widthDiff = 1 - ((this.prevSize.width - this.currSize.width) / 
			     this.prevSize.width);
	var frameHeight = (this.prevSize.height * heightDiff);
	var frameWidth = (this.prevSize.width * widthDiff);
	
	//window.console.log(frameWidth, frameHeight);

	this.loop(function(frame, key){
	    if (!goog.isDefAndNotNull(frame)) { return }
	    goog.style.setSize(frame.getElement(), 
			       Math.max(frameWidth, 
					this.minLayoutFrameWidth_),
			       Math.max(frameHeight, 
					this.minLayoutFrameHeight_));	    
	}.bind(this))
    }
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.SingleFrameLayout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    this.scaleFrames_();
}



goog.exportSymbol('xiv.ui.layouts.SingleFrameLayout.TITLE',
	xiv.ui.layouts.SingleFrameLayout.TITLE);
goog.exportSymbol('xiv.ui.layouts.SingleFrameLayout.ID_PREFIX',
	xiv.ui.layouts.SingleFrameLayout.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.SingleFrameLayout.prototype.updateStyle',
	xiv.ui.layouts.SingleFrameLayout.prototype.updateStyle);









