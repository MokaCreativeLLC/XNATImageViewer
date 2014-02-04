/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.ui.Slider');

// xtk
goog.require('X.renderer2D');
goog.require('X.renderer3D');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.ui.GenericSlider');

// xiv
goog.require('xiv.Widget');




/**
 * xiv.XtkPlane is a class that represents the ViewPlane (X, Y, Z or V) responsible
 * for visualizing XObjects in 2D or 3D space.
 *
 * @constructor
 * @param {!string}
 * @extends {xiv.Widget}
 */
goog.provide('xiv.XtkPlane');
xiv.XtkPlane = function(id) {

    xiv.Widget.call(this, 'xiv.XtkPlane');
    goog.dom.classes.set(this.getElement(), xiv.XtkPlane.ELEMENT_CLASS);


    /**
     * @type {!string}
     * @private
     */
    this.id_ = id;



    /**
     * @type {?X.renderer2D | ?X.renderer3D}
     */  
    this.Renderer_ = null;




    /**
     * @type {?utils.ui.GenericSlider}
     * @private
     */  
    this.Slider_ = null;




    /**
     * @type {!string}
     * @private
     */
    this.indexPlane_ = (id === 'x') ? 'indexLR' : (id === 'y') ? 'indexPA' : 'indexIS';




    /**
     * @type {!number}
     * @private
     */
    this.indexNumber_ = (id === 'x') ? 0 : (id === 'y') ? 1 : 2;




    /**
     * @type {?Element}
     * @private
     */
    this.indexBox_ = null;



    /**
     * @private
     * @type {!Array.function}
     */
    this.onloadCallbacks_ = null;




    /**
     * @private
     * @type {?Object}
     */
    this.currVolume_ = null;



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
	this.Slider_ = new utils.ui.GenericSlider({'parent': this.getElement(), 'orientation' : 'horizontal'});
	goog.dom.classes.add(this.Slider_.getElement(), xiv.XtkPlane.SLIDER_CLASS);
	goog.dom.classes.add(this.Slider_.getThumb(), xiv.XtkPlane.SLIDER_THUMB_CLASS);
	goog.dom.classes.add(this.Slider_.getTrack(), xiv.XtkPlane.SLIDER_TRACK_CLASS);

	this.Slider_.setThumbHoverClass(xiv.XtkPlane.SLIDER_THUMB_HOVERED_CLASS);
	

	//
	// IndexBox
	//
	this.indexBox_ = goog.dom.createDom('div', {
	    'id': 'IndexBox_' + goog.string.createUniqueString(),
	    'class': xiv.XtkPlane.INDEXBOX_CLASS
	});


	goog.dom.append(this.getElement(), this.indexBox_);
    } 
    
    //this.resetRenderer();
    //this.resetSlider();
}
goog.inherits(xiv.XtkPlane, xiv.Widget);
goog.exportSymbol('xiv.XtkPlane', xiv.XtkPlane);




/**
 * This exists so that governing classes
 * know what axis this ViewPlane represents.
 *
 * @return {string}
 * @private
 */
xiv.XtkPlane.prototype.getId = function() {
    return this.id_;
}




/**
 * @param {!XObject} vol The xtk volume to set.
 */
xiv.XtkPlane.prototype.setCurrVolume = function(vol){
    this.currVolume_ = vol;
};




/**
 * @return {?XObject} The currently loaded xtk volume.
 */
xiv.XtkPlane.prototype.getCurrVolume = function(){
    return this.currVolume_;
};




/**
 * @param {function}
 */
xiv.XtkPlane.prototype.addOnloadCallback = function (callback) {
    this.onloadCallbacks_.push(callback);
}




/**
 * Clears the renderer of information so that it
 * can reload or take in new information.
 *
 * @type {function()}
 */
xiv.XtkPlane.prototype.resetRenderer = function () {
    if (this.Renderer_) { this.Renderer_.destroy(); }
    this.Renderer_ = (this.id_ === 'v') ? new X.renderer3D : new X.renderer2D();
    this.Renderer_.orientation = this.id_.toUpperCase();
    this.Renderer_.container = this.getElement();
    this.Renderer_.init();
}




/**
* @param {XObject}
*/
xiv.XtkPlane.prototype.addToRenderer = function(xObj) {
    //console.log("add to renderer", xObj);
    //return;
    //------------------
    // Only add selected volumes to 2D renderers.
    //------------------
    if(xObj.isSelectedVolume === true) {
	//console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
	this.Renderer_.add(xObj);

    

    //------------------
    // Add all else to the 3D renderer.
    //------------------
    } else if (this.id_ === 'v')  {
	 this.Renderer_.add(xObj);
    }
};




/**
 * Callback that occurs right when renderer
 * redners.
 *
 * @param {function}
 */
xiv.XtkPlane.prototype.setRendererOnShowtime = function(callback) {
    this.Renderer_.onShowtime = callback;
};




/**
 * @type {function}
 */
xiv.XtkPlane.prototype.render = function() {
    this.Renderer_.render();
};




/**
 * Clears the slider of its callback events
 * that occur when sliding.  It should be noted
 * that the renderer detects 'scrolling' as well, which
 * changes the visible slice, so this also has to be
 * synced the the slider.
 */
xiv.XtkPlane.prototype.resetSlider = function() {
    

    //------------------
    // Exit out if there's no slider for the xiv.XtkPlane
    // (this is for 'V' viewplanes).
    //------------------
    if (!this.Slider_) return;

    var that = this;
    var plane = this.indexPlane_;
    var num = this.indexNumber_;



    //------------------
    // Clear slider callbacks.
    //------------------
    this.Slider_['EVENTS'].clearEvent('SLIDE');



    //------------------
    // Add slider listener
    //
    // NOTE: this is different from the default
    // 2D renderer listener on the xiv.XtkPlane.  We basically
    // have to create two separate listers: one on the slider
    // and one on the Xtk plane.
    //------------------
    this.Slider_['EVENTS'].onEvent('SLIDE', function() { 
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
xiv.XtkPlane.prototype.resetSliderValues = function(opt_volume) {
	
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
xiv.XtkPlane.prototype.updateStyle = function (opt_args) {

    var that = this;
   


    //------------------
    // Update widget css to be right size/place within frame holder
    //------------------
    if (opt_args) {
        utils.style.setStyle(this.getElement(), opt_args);
    }



    //------------------ 
    // Update the renderer.
    //------------------
    if (this.Renderer_) { this.Renderer_.onResize_(); }
    


    //------------------
    // Update the Slider.
    //------------------
    if (this.Slider_) {
	if (this.getElement().parentNode && this.Slider_.getElement().parentNode !== this.getElement().parentNode) {
	    this.getElement().parentNode.appendChild(this.Slider_.getElement());
	}
	this.Slider_.updateStyle();
    }

}




xiv.XtkPlane.CSS_CLASS_PREFIX =  /**@type {string} @const*/ goog.getCssName('xiv-xtkplane');
xiv.XtkPlane.ELEMENT_CLASS =  /**@type {string} @const*/  goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, '');
xiv.XtkPlane.INDEXBOX_CLASS =  /**@type {string} @const*/ goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, 'indexbox');
xiv.XtkPlane.SLIDER_CLASS =  /**@type {string} @const*/ goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, 'slider-widget');
xiv.XtkPlane.SLIDER_THUMB_CLASS =  /**@type {string} @const*/ goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, 'slider-thumb');
xiv.XtkPlane.SLIDER_THUMB_HOVERED_CLASS =  /**@type {string} @const*/ goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, 'slider-thumb-hovered');
xiv.XtkPlane.SLIDER_TRACK_CLASS =  /**@type {string} @const*/ goog.getCssName(xiv.XtkPlane.CSS_CLASS_PREFIX, 'slider-track');
