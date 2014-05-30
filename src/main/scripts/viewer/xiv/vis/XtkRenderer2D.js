/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.vis.XtkEngine');


// xtk
goog.require('X.renderer2D');


/**
 * Exists for the purpose of making the protected members of 
 * X.renderer public.
 *
 * @constructor
 * @extends {X.renderer2D}
 */
goog.provide('xiv.vis.XtkRenderer2D');
xiv.vis.XtkRenderer2D = function () {
    goog.base(this);
}
goog.inherits(xiv.vis.XtkRenderer2D, X.renderer2D);
goog.exportSymbol('xiv.vis.XtkRenderer2D', xiv.vis.XtkRenderer2D);



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getDimsForCalc_ = function() {

    this.originalWidth_ = this._sliceWidthSpacing * this._sliceWidth;
    this.originalHeight_ = this._sliceHeightSpacing * this._sliceHeight;
    this.originalWHRatio_ = originalWidth / originalHeight;
    this.canvasWHRatio_ = this._sliceWidth / this._sliceHeight;
}



/**
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onResize = function() {
    this.onResize_();
}




/**
 * @return {X.volume}
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getVolume = function() {
    return this._topLevelObjects[0];
}



/**
 * @return {number}
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getNumberSlices = function() {
    return this._slices.length;
}



/**
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onScroll = function() {
    //window.console.log(this.interactor.config.MOUSEWHEEL_ENABLED);
    this.onSliceNavigation();
    //window.console.log(this._topLevelObjects[0]);
}


/**
 * @private
 * @type {boolean}
 */
xiv.vis.XtkRenderer2D.prototype.shiftDown_ = false;


/**
 * @param {!Event} e
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onShiftDown_ = function(e) {
    if (!this.shiftDown_) {
	this.shiftDown_ = true;
	this.dispatchEvent({
	    type: xiv.vis.XtkEngine.EventType.SHIFT_DOWN,
	    orientation: this.orientation
	})
    }
}


/**
 * @param {!Event} e
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onShiftUp_ = function(e) {
    if (this.shiftDown_) {
	this.shiftDown_ = false;
	this.dispatchEvent({
	    type: xiv.vis.XtkEngine.EventType.SHIFT_UP,
	    orientation: this.orientation
	})
    }
}


/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.onProgress = function(e) {
    //window.console.log('2D', e._value);
    goog.base(this, 'onProgress', e);
    this.dispatchEvent({
	type: xiv.vis.RenderEngine.EventType.RENDERING,
	value: e._value
    })
};



/**
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.init = function() {


    this.config['PROGRESSBAR_ENABLED'] = false;

    goog.base(this, 'init');

    this.interactor.onMouseMove = function(e){
	if (this._interactor._shiftDown) {
	    this.onShiftDown_(e);
	}
	else {
	    this.onShiftUp_(e);
	}

	if (this._interactor.rightButtonDown){
	    //
	    // Dispatch the zoom event on any zpp,
	    //
	    this.dispatchEvent({
		type: xiv.vis.XtkEngine.EventType.ZOOM,
		zoom: this.getZoom(),
		orientation: this._orientation
	    })
	}
    }.bind(this)


    //
    // IMPORTANT!!
    //
    this.disableMousewheel_();
}



/**
 * @private
 */
xiv.vis.XtkRenderer2D.prototype.disableMousewheel_ = function() {
    this.interactor.config.MOUSEWHEEL_ENABLED = false;
    this.interactor.init();
}


/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.onSliceNavigation = function() {
    //window.console.log("SLICE NAV!");

    //
    // DO nothing as we're disabling the mousewheel
    //

    /**
    this.dispatchEvent({
	type: xiv.vis.XtkEngine.EventType.SLICE_NAVIGATED,
	volume: this._topLevelObjects[0],
	changeValue: this._topLevelObjects[0]
	    ['index' + this._orientation],
	changeOrientation: this._orientation,
	shiftDown: this._interactor._shiftDown
    })
    */
}



/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.render = function() {
    if (!this._canvas || !this._context) {
	this.init();
	return;
    } else {
	goog.base(this, 'render');
    }

    //this.interactor.config.MOUSEWHEEL_ENABLED = false;
}



/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.destroy = function() {
    //window.console.log('\n\n\nDESTROY 2D ', this._orienation);
    goog.base(this, 'destroy');
}



/**
 * Get's the zoom percentage.
 * 
 * @return {!number}
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getZoom = function(){
    //window.console.log('ZOOM', this._camera._view[14]);
    return this._camera._view[14];
}


/**
 * Returns the X coordinate of the container where the veritcal slice 
 * belongs.
 *
 * Derived from  ' X.renderer2D.prototype.xy2ijk '.
 *
 * @param {!number} sliceNumber The slice number
 * @param {!string} sliceType Either 'vertical' or 'horizontal'.
 * @param {boolean=} Whether to reverse the orientation.
 * @return {?Array} An array of [i,j,k] coordinates or null if out of frame.
 * @private
 */
xiv.vis.XtkRenderer2D.prototype.getSliceScreenPos_ = 
function(sliceNumber, sliceType, opt_reverse) {

    var _volume = this._topLevelObjects[0];
    var _view = this._camera._view;
    var _currentSlice = null;
    var _sliceWidth = this._sliceWidth;
    var _sliceHeight = this._sliceHeight;
    var _sliceWSpacing = null;
    var _sliceHSpacing = null;

    // get current slice
    // which color?
    if (this._orientation == "Y") {
	_currentSlice = this._slices[parseInt(_volume['indexY'], 10)];
	_sliceWSpacing = _currentSlice._widthSpacing;
	_sliceHSpacing = _currentSlice._heightSpacing;
	this._orientationColors[0] = 'red';
	this._orientationColors[1] = 'blue';

    } else if (this._orientation == "Z") {
	_currentSlice = this._slices[parseInt(_volume['indexZ'], 10)];
	_sliceWSpacing = _currentSlice._widthSpacing;
	_sliceHSpacing = _currentSlice._heightSpacing;
	this._orientationColors[0] = 'red';
	this._orientationColors[1] = 'green';

    } else {
	_currentSlice = this._slices[parseInt(_volume['indexX'], 10)];
	_sliceWSpacing = _currentSlice._heightSpacing;
	_sliceHSpacing = _currentSlice._widthSpacing;
	this._orientationColors[0] = 'green';
	this._orientationColors[1] = 'blue';

	var _buf = _sliceWidth;
	_sliceWidth = _sliceHeight;
	_sliceHeight = _buf;
    }

    // padding offsets
    var _x = 1 * _view[12];
    var _y = -1 * _view[13]; // we need to flip y here

    // .. and zoom
    var _normalizedScale = Math.max(_view[14], 0.6);
    var _center = [this._width / 2, this._height / 2];

    // the slice dimensions in canvas coordinates
    var _sliceWidthScaled = _sliceWidth * _sliceWSpacing *
	_normalizedScale;
    var _sliceHeightScaled = _sliceHeight * _sliceHSpacing *
	_normalizedScale;

    // the image borders on the left and top in canvas coordinates
    var _image_left2xy = _center[0] - (_sliceWidthScaled / 2);
    var _image_top2xy = _center[1] - (_sliceHeightScaled / 2);

    // incorporate the padding offsets (but they have to be scaled)
    _image_left2xy += _x * _normalizedScale;
    _image_top2xy += _y * _normalizedScale;

    
    //------------------
    // Begin XIV
    //------------------
    var _imageRight = _image_left2xy + _sliceWidthScaled;
    var _imageBottom = _image_top2xy + _sliceHeightScaled;



    if (sliceType === 'vertical'){
	// Crop min, max
	sliceNumber = Math.max(0, sliceNumber);
	sliceNumber = Math.min(sliceNumber, _sliceWidth);

	if (opt_reverse){
	    return _image_left2xy + 
		((this._sliceWidth - sliceNumber) / _sliceWidth) * 
		_sliceWidthScaled; 	
	} else {
	    return _image_left2xy + (sliceNumber / _sliceWidth) * 
		_sliceWidthScaled;
	}
    }
    else {
	// Crop min, max
	sliceNumber = Math.max(0, sliceNumber);
	sliceNumber = Math.min(sliceNumber, _sliceHeight);


	if (opt_reverse){
	    return _image_top2xy + 
		((this._sliceHeight - sliceNumber) / _sliceHeight) * 
		_sliceHeightScaled;	
	} else {
	    return _image_top2xy + (sliceNumber / _sliceHeight) * 
		_sliceHeightScaled;
	}
    }
}




/**
 * Returns the Y coordinate of the container where the veritcal slice 
 * belongs.
 *
 * Derived from  ' X.renderer2D.prototype.xy2ijk '.
 *
 * @param {!number} the verticalSlice
 * @param {boolean=} Whether to reverse the orientation.
 * @return {?Array} An array of [i,j,k] coordinates or null if out of frame.
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getVerticalSliceX = 
function(sliceNumber, opt_reverse) {
    return this.getSliceScreenPos_(sliceNumber, 'vertical', opt_reverse);
}



/**
 * Returns the Y coordinate of the container where the veritcal slice 
 * belongs.
 *
 * Derived from  ' X.renderer2D.prototype.xy2ijk '.
 *
 * @param {!number} the verticalSlice
 * @param {boolean=} Whether to reverse the orientation.
 * @return {?Array} An array of [i,j,k] coordinates or null if out of frame.
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.getHorizontalSliceY = 
function(sliceNumber, opt_reverse) {
    return this.getSliceScreenPos_(sliceNumber, 'horizontal', opt_reverse);
}
