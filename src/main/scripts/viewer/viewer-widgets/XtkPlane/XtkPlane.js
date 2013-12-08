/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */

/**
 * viewer-widget includes
 */
goog.require('XnatViewerWidget');

/**
 * xtk-includes
 */
goog.require('X.renderer3D');
goog.require('X.renderer2D');




/**
 * XtkPlane is a class that represents the ViewPlane (X, Y, Z or V) responsible
 * for visualizing XObjects in 2D or 3D space.
 *
 * @constructor
 * @param {!string, XtkDisplayer, Object<string, Element|string|number>=}
 * @extends {XnatViewerWidget}
 */
goog.provide('XtkPlane');
XtkPlane = function(id, Holder, opt_args) {

    XnatViewerWidget.call(this, utils.dom.mergeArgs( opt_args, {'id' : 'XtkPlane'}));
    goog.dom.classes.set(this._element, XtkPlane.ELEMENT_CLASS);



    //------------------
    // XTK renderer tracking parameters.
    // x, y, z or v
    //------------------
    this.id_ = id; 
    this.indexPlane_ = (id === 'x') ? 'indexLR' : (id === 'y') ? 'indexPA' : 'indexIS';
    this.indexNumber_ = (id === 'x') ? 0 : (id === 'y') ? 1 : 2;



    //------------------
    // For the slider so that it can
    // update the slice as it moves.
    //------------------
    this.currVolume_ = undefined;



    //--------------------
    // Renderers
    //
    // NOTE: A 3d plane needs to be treated
    // a little differently (i.e. no slider
    // or frame index)
    //--------------------
    // 2D Planes
    if (id !== 'v') {   


	//
	// Slider
	//
	this.Slider_ = new utils.gui.GenericSlider({'parent': this._element.parentNode, 'orientation' : 'horizontal'});
	this.Slider_.addClassToThumb(XtkPlane.SLIDER_THUMB_CLASS);
	this.Slider_.addClassToWidget(XtkPlane.SLIDER_CLASS);
	this.Slider_.addClassToTrack(XtkPlane.SLIDER_TRACK_CLASS);
	this.Slider_.setHoverClass(XtkPlane.SLIDER_THUMB_HOVERED_CLASS);
	

	//
	// IndexBox
	//
	this.indexBox_ = utils.dom.makeElement('div', this._element, 'IndexBox');
	goog.dom.classes.set(this.indexBox_, XtkPlane.INDEXBOX_CLASS);
    } 
    
    //this.resetRenderer();
    //this.resetSlider();
}
goog.inherits(XtkPlane, XnatViewerWidget);
goog.exportSymbol('XtkPlane', XtkPlane);




XtkPlane.CSS_CLASS_PREFIX =  /**@type {string} @const*/ goog.getCssName('xiv-xtkplane');
XtkPlane.ELEMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, '');
XtkPlane.INDEXBOX_CLASS =  /**@type {string} @const*/ goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, 'indexbox');
XtkPlane.SLIDER_CLASS =  /**@type {string} @const*/ goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, 'slider-widget');
XtkPlane.SLIDER_THUMB_CLASS =  /**@type {string} @const*/ goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, 'slider-thumb');
XtkPlane.SLIDER_THUMB_HOVERED_CLASS =  /**@type {string} @const*/ goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, 'slider-thumb-hovered');
XtkPlane.SLIDER_TRACK_CLASS =  /**@type {string} @const*/ goog.getCssName(XtkPlane.CSS_CLASS_PREFIX, 'slider-track');




/**
 * @type {undefined|X.renderer2D|X.renderer3D}
 */  
XtkPlane.prototype.Renderer_ = undefined;




/**
 * @type {undefined|goog.ui.Slider}
 */  
XtkPlane.prototype.Slider_ = undefined;




/**
 * @type {string}
 * @private
 */
XtkPlane.prototype.indexPlane_ = '';




/**
 * @type {number}
 * @private
 */
XtkPlane.prototype.indexNumber_ = -1;




/**
 * @type {?Element}
 * @private
 */
XtkPlane.prototype.indexBox_ = null;




/**
 * @type {?string}
 * @private
 */
XtkPlane.prototype.id_ = null;   




/**
 * This exists so that governing classes
 * know what axis this ViewPlane represents.
 *
 * @return {string}
 * @private
 */
XtkPlane.prototype.getId = function() {
    return this.id_;
}




/**
 * @private
 * @type {Array.function}
 */
XtkPlane.prototype.onloadCallbacks_ = [];




/**
 * @private
 * @type {?Object}
 */
XtkPlane.prototype.currVolume_ = null;




/**
 * @param {XObject}
 */
XtkPlane.prototype.setCurrVolume = function(vol){
    this.currVolume_ = vol;
};




/**
 * @return {XObject}
 */
XtkPlane.prototype.getCurrVolume = function(){
    return this.currVolume_;
};




/**
 * @param {function}
 */
XtkPlane.prototype.addOnloadCallback = function (callback) {
    this.onloadCallbacks_.push(callback);
}




/**
 * Clears the renderer of information so that it
 * can reload or take in new information.
 *
 * @type {function()}
 */
XtkPlane.prototype.resetRenderer = function () {
    if (this.Renderer_) { this.Renderer_.destroy(); }
    this.Renderer_ = (this.id_ === 'v') ? new X.renderer3D : new X.renderer2D();
    this.Renderer_.orientation = this.id_.toUpperCase();
    this.Renderer_.container = this._element;
    this.Renderer_.init();
}




/**
* @param {XObject}
*/
XtkPlane.prototype.addToRenderer = function(xObj) {
    console.log("add to renderer", xObj);
    //return;
    //------------------
    // Only add selected volumes to 2D renderers.
    //------------------
    if(xObj.isSelectedVolume === true) {
	console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
	this.Renderer_.add(xObj);

    

    //------------------
    // Add all else to the 3D renderer.
    //------------------
    } else if (this.id_ === 'v')  {
	console.log("ASDF add");
	 this.Renderer_.add(xObj);
    }
};




/**
 * Callback that occurs right when renderer
 * redners.
 *
 * @param {function}
 */
XtkPlane.prototype.setRendererOnShowtime = function(callback) {
    this.Renderer_.onShowtime = callback;
};




/**
 * @type {function}
 */
XtkPlane.prototype.render = function() {
    this.Renderer_.render();
};




/**
 * Clears the slider of its callback events
 * that occur when sliding.  It should be noted
 * that the renderer detects 'scrolling' as well, which
 * changes the visible slice, so this also has to be
 * synced the the slider.
 */
XtkPlane.prototype.resetSlider = function() {
    

    //------------------
    // Exit out if there's no slider for the XtkPlane
    // (this is for 'V' viewplanes).
    //------------------
    if (!this.Slider_) return;

    var that = this;
    var plane = this.indexPlane_;
    var num = this.indexNumber_;



    //------------------
    // Clear slider callbacks.
    //------------------
    this.Slider_.clearSlideCallbacks();



    //------------------
    // Add slider listener
    //
    // NOTE: this is different from the default
    // 2D renderer listener on the XtkPlane.  We basically
    // have to create two separate listers: one on the slider
    // and one on the Xtk plane.
    //------------------
    this.Slider_.addSlideCallback(function() { 
	var currVol = that.getCurrVolume();
	var planeSlices = currVol['_slices' + that.id_.toUpperCase()]['_children'].length;
	if (!currVol) return;
	currVol.modified();
	currVol['index' + that.id_.toUpperCase()] = that.Slider_.getValue();
	that.indexBox_.innerHTML = currVol['_index' + that.id_.toUpperCase()] + ' / ' + planeSlices;
    });	



    //------------------
    // Add Renderer Scroll listener (allows slider to slide)
    //
    // NOTE: this moves the slider when we move the Xtk plane.
    //------------------
    this.Renderer_.onScroll = function(event) {  
	var currVol = that.getCurrVolume();
	var currSlice = currVol['_index' + that.id_.toUpperCase()];
	var planeSlices = currVol['_slices' + that.id_.toUpperCase()]['_children'].length;
	if (!currVol) return;
	that.Slider_.setValue(currSlice)
	that.indexBox_.innerHTML =  currSlice + ' / ' + planeSlices;
    }; 


    //------------------
    // reset slider
    //------------------
    this.resetSliderValues();
};




/**
 * Resets the numerical properties (slice length)
 * of the slider.
 *
 * @param {X.volume=}
 */
XtkPlane.prototype.resetSliderValues = function(opt_volume) {
	
    var that = this;
    var plane = this.indexPlane_;
    var num = this.indexNumber_;
    var currVol = opt_volume ? opt_volume : this.currVolume_;
    


    //------------------
    // V / 3D Plane won't have a slider.
    //------------------
    if (!this.Slider_ || !currVol) return;



    //------------------
    // Set properties accordingly.
    //------------------
    var currSlice = currVol['_index' + that.id_.toUpperCase()];
    currVol['_index' + that.id_.toUpperCase()] = Math.round(currSlice);
    //console.log(this.id_, plane, currVol[plane]);
    //console.log(currVol);
    var planeSlices = currVol['_slices' + that.id_.toUpperCase()]['_children'].length;
    this.Slider_.setMaximum(planeSlices);
    this.Slider_.setValue(Math.round(planeSlices/2));
    this.indexBox_.innerHTML = currSlice + ' / ' + planeSlices;  
};




/**
 * For window resizing and any other style changes.
 *
 * @param {Object=}
 */
XtkPlane.prototype.updateStyle = function (opt_args) {

    var that = this;
   


    //------------------
    // Update widget css to be right size/place within frame holder
    //------------------
    if (opt_args) {
        var eltDims = utils.dom.mergeArgs(utils.style.dims(this._element), opt_args);
        utils.style.setStyle(this._element, eltDims);
    }



    //------------------ 
    // Update the renderer.
    //------------------
    if (this.Renderer_) { this.Renderer_.onResize_(); }
    


    //------------------
    // Update the Slider.
    //------------------
    if (this.Slider_) {
	this.Slider_.updateStyle();
    }

}
