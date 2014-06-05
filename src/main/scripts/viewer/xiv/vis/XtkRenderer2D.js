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

    this.hist_ = {};
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
 * @private
 * @type {boolean}
 */
xiv.vis.XtkRenderer2D.prototype.leftMouseDown_ = false;


/**
 * @param {!Event} e
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onLeftMouseDown_ = function(e) {
    //window.console.log('LEFT MOUSE DOWN', this.leftMouseDown_,
    //this.currVolWindowHigh_, this.currVolWindowLow_);

    if (!this.leftMouseDown_){
	this.currVolWindowHigh_ = this.getVolume().windowHigh;
	this.currVolWindowLow_ = this.getVolume().windowLow;
    }

    //window.console.log('LM', this.currVolWindowHigh_, this.currVolWindowLow_);
    this.leftMouseDown_ = true;
    this.getVolume().windowHigh = this.currVolWindowHigh_;
    this.getVolume().windowLow = this.currVolWindowLow_;
    //window.console.log(this.getVolume().scalars)

    //this.getVolume().modified()
    this.render();
    //this.update();

    //window.console.log('LM2', this.getVolume().windowHigh, 
    //this.getVolume().windowLow);

    this.dispatchEvent({
	type: xiv.vis.XtkEngine.EventType.LEFTMOUSE_DOWN,
	orientation: this.orientation
    })
}


/**
 * @param {!Event} e
 * @public
 */
xiv.vis.XtkRenderer2D.prototype.onLeftMouseUp_ = function(e) {
    //window.console.log('LEFT MOUSE UP', this.leftMouseDown_);
    this.leftMouseDown_ = false;
    this.getVolume().windowHigh = this.currVolWindowHigh_;
    this.getVolume().windowLow = this.currVolWindowLow_;
    this.render();
    this.dispatchEvent({
	type: xiv.vis.XtkEngine.EventType.LEFTMOUSE_UP,
	orientation: this.orientation
    })
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

	//window.console.log("TRANSFORM", this.getVolume().transform.matrix);
	//window.console.log("TRANSFORM", this.getVolume().reslicing);
	/**
	var i = 0;
	var xSlice, ySlize, zSlice;

	var currVol =  this._topLevelObjects[0];
	//window.console.log(currVol._indexX);
	for (; i < 3; i++){
	    switch(i){
	    case 0:
		xSlice = currVol._children[i]._children[currVol._indexX];
		break;
	    case 1:
		ySlice = currVol._children[i]._children[currVol._indexY];
		break;
	    case 2:
		zSlice = currVol._children[i]._children[currVol._indexZ];
		break;
	    }
	}

	//window.console.log(xSlice);
	//$("#text-histogram").val(hist.values);
	*/

	if (this.interactor._shiftDown) {
	    this.onShiftDown_(e);
	}
	else {
	    this.onShiftUp_(e);
	}

	if (this.interactor.rightButtonDown){
	    //
	    // Dispatch the zoom event on any zpp,
	    //
	    this.dispatchEvent({
		type: xiv.vis.XtkEngine.EventType.ZOOM,
		zoom: this.getZoom(),
		orientation: this._orientation
	    })
	    return;
	}

	if (this.interactor.leftButtonDown){
	    //window.console.log(this.interactor.leftButtonDown);
	    if (this.interactor.config.MOUSECLICKS_ENABLED){
		this.interactor.config.MOUSECLICKS_ENABLED = false;
		this.interactor.init();
	    }
	    //window.console.log(this.interactor.config);
	    //this.render();
	    this.onLeftMouseDown_(e);
	    
	    return;
	} else {
	    //this.interactor.config.MOUSECLICKS_ENABLED = true;
	    //this.interactor.init();
	    if (this.leftMouseDown_){

		
		//window.console.log("MOUSE UP");
		this.interactor.config.MOUSECLICKS_ENABLED = true;
		this.interactor.init();
		this.onLeftMouseUp_(e);
		window.console.log("GEN HIST");
		this.getHistogram();
	    }
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
    //
    // Disables unwanted scrolling
    //
    this.interactor.config.MOUSEWHEEL_ENABLED = false;

    //
    // Disables unwated brightness / contrast color correction
    //
    //this.interactor.config.MOUSECLICKS_ENABLED = false;
    this.interactor.init();

    //this.interactor.onMouseDown = function(left, middle, right){
    //}.bind(this)
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
	shiftDown: this.interactor._shiftDown
    })
    */
}



/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.render = function() {
    if (!this._canvas || !this._context) {
	this.init();

    } else {
	goog.base(this, 'render');
    }

    //window.console.log("RENDER!");
    //this.interactor.config.MOUSEWHEEL_ENABLED = false;
}



/**
 * @return {Element}
 */
xiv.vis.XtkRenderer2D.prototype.getCanvas = function() {
    return this._canvas;
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



/**
 * src: http://www.robodesign.ro/coding/svg-or-canvas/histogram.html
 */
xiv.vis.XtkRenderer2D.prototype.getHistogram = function(){

    window.console.log("GEN HIST");

    var histholder = goog.dom.createDom('div', {
	'id': "HistogramHolder_" + this.orientation
    })
    histholder.style.zIndex = 4000;
    histholder.style.width = this._canvas.width;
    histholder.style.height = this._canvas.height;  
    histholder.style.position = 'absolute';
    histholder.style.backgroundColor = 'white';

    //var histCanvas = document.getElementById('histogram'),
    var histCanvas = goog.dom.createDom('canvas', {
	'id': "Histogram_" + this.orientation
    })
    histCanvas.width = this._canvas.width;
    histCanvas.height = this._canvas.height;
    //histCanvas.style.zIndex = 100000;
    goog.dom.appendChild(histholder, histCanvas);
    goog.dom.appendChild(document.body, histholder);
    window.console.log(histCanvas, histholder);

    var histCtx = histCanvas.getContext('2d');
    //var histType = document.getElementById('histType'),
    var histType = {
	values: [
        "rgb",
        "red",
        "green",
        "blue",
        "hue",
        "sat",
        "val",
        "cmyk",
        "cyan",
        "magenta",
        "yellow",
        "kelvin"  
	],
	value: 'val'
    }

    //var accuracy = document.getElementById('accuracy'),
    var accuracy = 1;
    
    //var runtime = document.getElementById('runtime'),


    //var plotStyle = document.getElementById('plotStyle'),
    var plotStyle = {
	values: ['discreet', 'continuous'],
	value: 'discreet'
    }

    //var plotFill = document.getElementById('plotFill'),
    var plotFill = {
	checked: true,
    }

    //var plotColors = document.getElementById('plotColors'),
    var plotColors = {
	values: ['none', 'flat', 'gradient'],
	value: 'flat'
    }
    
    //var imgSelector = document.getElementById('imgSelector');


    
    var imgCanvas = this.getCanvas();
    var imgCtx = imgCanvas.getContext('2d');
    var imgData = imgCtx.getImageData(0, 0, this._canvas.width, 
				      this._canvas.height).data;

    //window.console.log(imgData, imgCanvas);

    var gradients = {
        'red':     histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'green':   histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'blue':    histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'hue':     histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'val':     histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'cyan':    histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'magenta': histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'yellow':  histCtx.createLinearGradient(0, 0, this._canvas.width, 0),
        'kelvin':  histCtx.createLinearGradient(0, 0, this._canvas.width, 0)
    }
    var colors = {
        'red':   ['#000', '#f00'],
        'green': ['#000', '#0f0'],
        'blue':  ['#000', '#00f'],
        'hue':   [
            '#f00',   // 0, Red,       0°
            '#ff0',   // 1, Yellow,   60°
            '#0f0',   // 2, Green,   120°
            '#0ff',   // 3, Cyan,    180°
            '#00f',   // 4, Blue,    240°
            '#f0f',   // 5, Magenta, 300°
            '#f00'],  // 6, Red,     360°
        'val':     ['#000', '#fff'],
        'kelvin':  ['#fff', '#000'],
        'cyan':    ['#000', '#0ff'],
        'yellow':  ['#000', '#ff0'],
        'magenta': ['#000', '#f0f']
    };
    var discreetWidth = Math.round(histCanvas.width / 255);
    //var imgData = null;

    var initHistogram = function () {
	// Plot defaults
	//accuracy.value = 1;
	//plotStyle.value = 'continuous';
	//plotColors.value = 'flat';
	//plotFill.checked = true;
	//histType.value = 'rgb';

	var grad, color, i, n;
	for (grad in gradients) {
	    color = colors[grad];
	    grad = gradients[grad];

	    for (i = 0, n = color.length; i < n; i++) {
		grad.addColorStop(i*1/(n-1), color[i]);
	    }
	}
    };



    var calcHist = function (type) {


	window.console.log("TYPE", type);

	var chans = [[]],
        maxCount = 0, val, subtypes = [type];

	if (type === 'rgb') {
	    chans = [[], [], []];
	    subtypes = ['red', 'green', 'blue'];
	} else if (type === 'cmyk') {
	    chans = [[], [], [], []];
	    subtypes = ['cyan', 'magenta', 'yellow', 'kelvin'];
	}

	var step = parseInt(accuracy);
	if (isNaN(step) || step < 1) {
	    step = 1;
	} else if (step > 50) {
	    step = 50;
	}
	accuracy = step;
	step *= 4;

	for (var i = 0, n = imgData.length; i < n; i+= step) {
	    if (type === 'rgb' || type === 'red' || type === 'green' 
		|| type === 'blue') {
		val = [imgData[i], imgData[i+1], imgData[i+2]];

	    } else if (type === 'cmyk' || type === 'cyan' 
		       || type === 'magenta' || 
		       type === 'yellow' || type === 'kelvin') {
		val = rgb2cmyk(imgData[i], imgData[i+1], imgData[i+2]);

	    } else if (type === 'hue' || type === 'sat' || type === 'val') {
		val = rgb2hsv(imgData[i], imgData[i+1], imgData[i+2]);

		/**
		if (imgData[i] > 0){
		    window.console.log(val);
		}
		*/
	    }

	    if (type === 'red' || type === 'hue' || type === 'cyan') {

		val = [val[0]];

	    } else if (type === 'green' || type === 'sat' 
		       || type === 'magenta') {
		val = [val[1]];
	    } else if (type === 'blue' || type === 'val' || type === 'yellow') {
		val = [val[2]];


	    } else if (type === 'kelvin') {
		val = [val[3]];
	    }

	    for (var y = 0, m = val.length; y < m; y++) {
		if (val[y] in chans[y]) {
		    chans[y][val[y]]++;
		} else {
		    chans[y][val[y]] = 1;
		}

		if (chans[y][val[y]] > maxCount) {
		    maxCount = chans[y][val[y]];
		}
	    }
	}

	if (maxCount === 0) {
	    return;
	}

	histCtx.clearRect(0, 0, histCanvas.width, histCanvas.height);

	if (plotFill.checked && chans.length > 1) {
	    histCtx.globalCompositeOperation = 'lighter';
	}

	for (var i = 0, n = chans.length; i < n; i++) {
	    drawHist(subtypes[i], chans[i], maxCount);
	}

	if (plotFill.checked && chans.length > 1) {
	    histCtx.globalCompositeOperation = 'source-over';
	}
    };

    var rgb2hsv = function (red, green, blue) {



	if (red > 0 || green > 0 || blue > 0){
	    window.console.log('\n\nRGB: ', red, ',', green,  ',', blue)
	}

	red /= 255;
	green /= 255;
	blue /= 255;

	var hue, sat, val,
        min   = Math.min(red, green, blue),
        max   = Math.max(red, green, blue),
        delta = max - min,
        val   = max;

	// This is gray (red==green==blue)
	if (delta === 0) {
	    hue = sat = 0;
	} else {
	    sat = delta / max;

	    if (max === red) {
		hue = (green -  blue) / delta;
	    } else if (max === green) {
		hue = (blue  -   red) / delta + 2;
	    } else if (max ===  blue) {
		hue = (red   - green) / delta + 4;
	    }

	    hue /= 6;
	    if (hue < 0) {
		hue += 1;
	    }
	}

	var _h = Math.round(hue*255)
	var _s = Math.round(sat*255)
        var _v = Math.round(val*255)

	if (_h > 255 || _s > 255 || _v > 255){
	    window.console.log('HSV: ', _h, ',', _s,  ',', _v)
	}
	return [_h, _s, _v];
    };

    // Note that this is only an approximation of the CMYK color space. for proper
    // CMYK color space conversion one needs to implement support for color
    // profiles.
    var rgb2cmyk = function (red, green, blue) {
	var cyan    = 1 - red/255;
        magenta = 1 - green/255;
        yellow  = 1 - blue/255;
        black = Math.min(cyan, magenta, yellow, 1);

	if (black === 1) {
	    cyan = magenta = yellow = 0;
	} else {
	    var w = 1 - black;
	    cyan    = (cyan    - black) / w;
	    magenta = (magenta - black) / w;
	    yellow  = (yellow  - black) / w;
	}

	
	var retVal =  [Math.round(cyan*255), Math.round(magenta*255), 
		Math.round(yellow*255), Math.round(black*255)];
	return retVal;
    };

    var drawHist = function (type, vals, maxCount) {
	var ctxStyle;

	if (plotFill.checked || plotStyle.value === 'discreet') {
	    ctxStyle = 'fillStyle';
	    histCtx.strokeStyle = '#000';
	} else {
	    ctxStyle = 'strokeStyle';
	}

	if (plotColors.value === 'flat') {
	    if (type === 'hue') {
		histCtx[ctxStyle] = gradients.hue;
	    } else if (type in colors && type !== 'val') {
		histCtx[ctxStyle] = colors[type][1];
	    } else {
		histCtx[ctxStyle] = '#000';
	    }

	} else if (plotColors.value === 'gradient') {
	    if (type in gradients) {
		histCtx[ctxStyle] = gradients[type];
	    } else {
		histCtx[ctxStyle] = '#000';
	    }
	} else if (plotColors.value === 'none') {
	    histCtx[ctxStyle] = '#000';
	}

	if (plotStyle.value === 'continuous') {
	    histCtx.beginPath();
	    histCtx.moveTo(0, histCanvas.height);
	}

	for (var x, y, i = 0; i <= 255; i++) {
	    if (!(i in vals)) {
		continue;
	    }

	    y = Math.round((vals[i]/maxCount)*histCanvas.height);
	    x = Math.round((i/255)*histCanvas.width);

	    if (plotStyle.value === 'continuous') {
		histCtx.lineTo(x, histCanvas.height - y);
	    } else if (plotStyle.value === 'discreet') {
		if (plotFill.checked) {
		    histCtx.fillRect(x, histCanvas.height - y, discreetWidth, y);
		} else {
		    histCtx.fillRect(x, histCanvas.height - y, discreetWidth, 2);
		}
	    }
	}

	if (plotStyle.value === 'continuous') {
	    histCtx.lineTo(x, histCanvas.height);
	    if (plotFill.checked) {
		histCtx.fill();
	    }
	    histCtx.stroke();
	    histCtx.closePath();
	}
    };

    var updateHist = function () {
	var timeStart = (new Date()).getTime();

	//runtime.innerHTML = 'Calculating histogram...';

	//calcHist(histType.value);
	calcHist('val');

	var timeEnd = (new Date()).getTime();
	//runtime.innerHTML = 'Plot runtime: ' + (timeEnd - timeStart) + ' ms.';
	window.console.log('Plot runtime: ' + (timeEnd - timeStart) + ' ms.');
    };

    /**
       var thumbClick = function (ev) {
       ev.preventDefault();

       if (this.className === 'thumb') {
       this.className = '';
       } else {
       this.className = 'thumb';
       }
       };
    */

    //img.addEventListener('load', imgLoaded, false);
    //img.addEventListener('click', thumbClick, false);
    //histCanvas.addEventListener('click', thumbClick, false);

    //histType.addEventListener('change', updateHist, false);
    //plotStyle.addEventListener('change', updateHist, false);
    //plotFill.addEventListener('change', updateHist, false);
    //plotColors.addEventListener('change', updateHist, false);
    //accuracy.addEventListener('change', updateHist, false);

    //imgSelector.addEventListener('change', function () {
    //	img.src = this.value;
    //}, false);


  //var imgLoaded = function () {
    //img.className = '';
    //imgCanvas.width = img.width;
    //imgCanvas.height = img.height;
    //imgCtx.drawImage(img, 0, 0);
    //imgData = imgCtx.getImageData(0, 0, img.width, img.height).data;
    //img.className = 'thumb';

    //updateHist();
  //};


    initHistogram();
    updateHist();
    //imgLoaded();

    // -->
}




/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer2D.prototype.destroy = function() {
    //window.console.log('\n\n\nDESTROY 2D ', this._orienation);
    goog.base(this, 'destroy');
}




goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.init',
	xiv.vis.XtkRenderer2D.prototype.init);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.render',
	xiv.vis.XtkRenderer2D.prototype.render);


goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.onResize',
	xiv.vis.XtkRenderer2D.prototype.onResize);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.onScroll',
	xiv.vis.XtkRenderer2D.prototype.onScroll);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.onProgress',
	xiv.vis.XtkRenderer2D.prototype.onProgress);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.onSliceNavigation',
	xiv.vis.XtkRenderer2D.prototype.onSliceNavigation);


goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getCanvas',
	xiv.vis.XtkRenderer2D.prototype.getCanvas);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getZoom',
	xiv.vis.XtkRenderer2D.prototype.getZoom);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getVerticalSliceX',
	xiv.vis.XtkRenderer2D.prototype.getVerticalSliceX);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getHorizontalSliceY',
	xiv.vis.XtkRenderer2D.prototype.getHorizontalSliceY);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getVolume',
	xiv.vis.XtkRenderer2D.prototype.getVolume);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getNumberSlices',
	xiv.vis.XtkRenderer2D.prototype.getNumberSlices);
goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.getHistogram',
	xiv.vis.XtkRenderer2D.prototype.getHistogram);

goog.exportSymbol('xiv.vis.XtkRenderer2D.prototype.destroy',
	xiv.vis.XtkRenderer2D.prototype.destroy);

