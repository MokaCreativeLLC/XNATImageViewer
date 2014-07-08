/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.string');

// nrg
goog.require('nrg.string');
goog.require('nrg.ui.Component');
goog.require('nrg.ui');

// xiv
goog.require('xiv.ui.layouts.LayoutFrame');

//-----------




/**
 * xiv.ui.layouts.Layout
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.Layout');
xiv.ui.layouts.Layout = function() {
    if (!this.constructor.TITLE){
	window.console.log('\n\n\n\n' + 
			   'This is the class attempting to inherit from it:');
	window.console.log(this);
	throw new Error('Sublcasses of xiv.ui.layouts.Layout must have ' + 
			' the TITLE defined as a constructor property!');

    }
    goog.base(this);


    /**
     * @type {Object.<string, xiv.ui.layout.LayoutFrames>}
     * @protected
     */
    this.LayoutFrames = {};
}
goog.inherits(xiv.ui.layouts.Layout, nrg.ui.Component);
goog.exportSymbol('xiv.ui.layouts.Layout', xiv.ui.layouts.Layout);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Layout.EventType = {
    RESIZE: goog.events.getUniqueId('resize')
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Layout.INTERACTORS = {
    SLIDER: 'Slider_' +goog.string.createUniqueString(),
    FRAME_DISPLAY: 'FrameDisplay_' + goog.string.createUniqueString(),
    ZOOM_DISPLAY: 'ZoomDisplay_' + goog.string.createUniqueString(),
    CROSSHAIRS: 'Crosshairs_' + goog.string.createUniqueString() 
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Layout.ID_PREFIX =  'xiv.ui.layouts.Layout';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.layouts.Layout.CSS_SUFFIX = {}



/**
 * @type {!number}
 * @private
 */
xiv.ui.layouts.Layout.prototype.minLayoutFrameWidth_ = 20;



/**
 * @type {!number}
 * @private
 */
xiv.ui.layouts.Layout.prototype.minLayoutFrameHeight_ = 20;



/**
 * @param {!number} h
 * @private
 */
xiv.ui.layouts.Layout.prototype.setMinLayoutFrameHeight = function(h){
    this.minLayoutFrameHeight_ = h;
}



/**
 * @param {!number} w
 * @private
 */
xiv.ui.layouts.Layout.prototype.setMinLayoutFrameWidth = function(w){
    this.minLayoutFrameWidth_ = w;
}


/**
 * @return {Object.<string, xiv.ui.layout.LayoutFrame>}
 */
xiv.ui.layouts.Layout.prototype.getLayoutFrames = function(){
    return this.LayoutFrames;
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.LayoutFrame}
 */
xiv.ui.layouts.Layout.prototype.getLayoutFrameByTitle = function(title){
    return this.LayoutFrames[title];
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.LayoutFrame}
 */
xiv.ui.layouts.Layout.prototype.getLayoutFrameInteractors = function(title) {
    
    window.console.log(title, this.LayoutFrames[title]);
    var objs = {};

    goog.object.forEach(xiv.ui.layouts.Layout.INTERACTORS, function(inter){
	objs[inter]  =  this.LayoutFrames[title][inter]
    }.bind(this))

    window.console.log("INTERACTORS!", objs);
    return objs;
};



/**
 * @return {!string}
 */
xiv.ui.layouts.Layout.prototype.getTitle = function(){
    return this.constructor.TITLE;
}



/**
 * @param {!xiv.ui.layout.LayoutFrame} frame
 */
xiv.ui.layouts.Layout.prototype.addLayoutFrame = function(frame){
    this.LayoutFrames = this.LayoutFrames ? this.LayoutFrames : {};
    this.LayoutFrames[frame.getTitle()] = frame;
    //window.console.log("FRAMES", frame, this.LayoutFrames);
}


/**
* @protected
*/
xiv.ui.layouts.Layout.prototype.dispatchResize = function(){
    this.dispatchEvent({
	type: xiv.ui.layouts.Layout.EventType.RESIZE
    })
}



/**
 * @public
 */
xiv.ui.layouts.Layout.prototype.removeAllInteractors = function() {
    goog.object.forEach(this.getInteractors(), 
	function(interactorSet, planeOr){
	    
	    if (goog.isDefAndNotNull(interactorSet.SLIDER)){
		interactorSet.SLIDER.dispose();
		delete interactorSet.SLIDER;
	    }

	    if (goog.isDefAndNotNull(interactorSet.CROSSHAIRS)){
		interactorSet.CROSSHAIRS.dispose();
		delete interactorSet.CROSSHAIRS;
	    }

	    if (goog.isDefAndNotNull(interactorSet.FRAME_DISPLAY)){
		interactorSet.FRAME_DISPLAY.dispose();
		delete interactorSet.FRAME_DISPLAY;
	    }

	    if (goog.isDefAndNotNull(interactorSet.ZOOM_DISPLAY)){
		interactorSet.ZOOM_DISPLAY.dispose();
		delete interactorSet.ZOOM_DISPLAY;
	    }
	})
};



/**
 * @public
 */
xiv.ui.layouts.Layout.prototype.updateInteractors = function() {
    goog.object.forEach(this.getInteractors(), 
	function(interactorSet, planeOr){
	    if (goog.isDefAndNotNull(interactorSet.SLIDER)){
		interactorSet.SLIDER.updateStyle();
		interactorSet.SLIDER.setValue(interactorSet.SLIDER.getValue());
	    }

	    if (goog.isDefAndNotNull(interactorSet.CROSSHAIRS)){
		interactorSet.CROSSHAIRS.updateStyle();
	    }

	    if (goog.isDefAndNotNull(interactorSet.FRAME_DISPLAY)){
		interactorSet.FRAME_DISPLAY.updateStyle();
	    }

	    if (goog.isDefAndNotNull(interactorSet.ZOOM_DISPLAY)){
		interactorSet.ZOOM_DISPLAY.updateStyle();
	    }
	})
}



/**
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    this.dispatchResize();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    delete this.minLayoutFrameHeight_;
    delete this.minLayoutFrameWidth_;

    nrg.ui.disposeComponentMap(this.LayoutFrames_);
    delete this.LayoutFrames_;
}




goog.exportSymbol('xiv.ui.layouts.Layout.EventType',
	xiv.ui.layouts.Layout.EventType);
goog.exportSymbol('xiv.ui.layouts.Layout.INTERACTORS',
	xiv.ui.layouts.Layout.INTERACTORS);
goog.exportSymbol('xiv.ui.layouts.Layout.ID_PREFIX',
	xiv.ui.layouts.Layout.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.Layout.CSS_SUFFIX',
	xiv.ui.layouts.Layout.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.setMinLayoutFrameHeight',
	xiv.ui.layouts.Layout.prototype.setMinLayoutFrameHeight);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.setMinLayoutFrameWidth',
	xiv.ui.layouts.Layout.prototype.setMinLayoutFrameWidth);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.getLayoutFrames',
	xiv.ui.layouts.Layout.prototype.getLayoutFrames);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.getLayoutFrameByTitle',
	xiv.ui.layouts.Layout.prototype.getLayoutFrameByTitle);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.getLayoutFrameInteractors',
	xiv.ui.layouts.Layout.prototype.getLayoutFrameInteractors);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.getTitle',
	xiv.ui.layouts.Layout.prototype.getTitle);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.addLayoutFrame',
	xiv.ui.layouts.Layout.prototype.addLayoutFrame);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.dispatchResize',
	xiv.ui.layouts.Layout.prototype.dispatchResize);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.removeAllInteractors',
	xiv.ui.layouts.Layout.prototype.removeAllInteractors);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.updateInteractors',
	xiv.ui.layouts.Layout.prototype.updateInteractors);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.updateStyle',
	xiv.ui.layouts.Layout.prototype.updateStyle);
goog.exportSymbol('xiv.ui.layouts.Layout.prototype.disposeInternal',
	xiv.ui.layouts.Layout.prototype.disposeInternal);
