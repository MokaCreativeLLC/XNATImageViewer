/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.Histogram');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.style');
goog.require('goog.structs.Queue');

// xiv
goog.require('xiv.ui.XtkController');

//-----------




/**
 * xiv.ui.Histogram
 *
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.Histogram = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.Histogram, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.Histogram', xiv.ui.Histogram);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.Histogram.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Histogram.ID_PREFIX =  'xiv.ui.Histogram';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.Histogram.CSS_SUFFIX = {
    CANVAS: 'canvas',
    LINECANVAS: 'linecanvas',
    MAX: 'max',
    MIN: 'min',
    CLIPMAX: 'clipmax',
    CLIPMIN: 'clipmin',

}



/**
 * @expose
 * @type {!number}
 * @const
 */
xiv.ui.Histogram.LEVEL_CUTOFF = .999;



/**
 * @const
 * @private
 */
xiv.ui.Histogram.prototype.heightLimit_ = .95;



/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.Histogram.prototype.levels_ = null;




/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.Histogram.prototype.percentages_ = null;



/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.Histogram.prototype.totals_ = null;



/**
 * @type {number}
 * @private
 */
xiv.ui.Histogram.prototype.totalPixels_ = null;




/**
 * @type {number}
 * @private
 */
xiv.ui.Histogram.prototype.maxPct_ = null;



/**
 * @const
 * @private
 */
xiv.ui.Histogram.prototype.contextFillStyle_ = 'rgb(40,40,40)';



/**
 * @const
 * @private
 */
xiv.ui.Histogram.prototype.lineContextFillStyle_ = 'rgb(0,0,0)';




/**
 * @type {Element}
 * @private
 */
xiv.ui.Histogram.prototype.canvas_;



/**
 * @type {Object}
 * @private
 */
xiv.ui.Histogram.prototype.context_;



/**
 * @type {Element}
 * @private
 */
xiv.ui.Histogram.prototype.lineCanvas_;



/**
 * @type {Object}
 * @private
 */
xiv.ui.Histogram.prototype.lineContext_;


/**
 * @type {Array.<?Element>}
 * @private
 */
xiv.ui.Histogram.prototype.minMaxDivs_ = [null, null];;



/**
 * @type {Array.<?Element>}
 * @private
 */
xiv.ui.Histogram.prototype.clipDivs_ = [null, null];





/**
 * @private
 * @type {!string}
 * @const
 */
xiv.ui.Histogram.prototype.histogramBarColor_ = "rgb(90,90,90)";




/**
 * @private
 * @type {!Array.<number>}
 */
xiv.ui.Histogram.prototype.zoomRange_ = [0,1000];


/**
 * @type {!Array.<number>}
 * @private
 */
xiv.ui.Histogram.prototype.clipRange_ = [0, 1000];



/**
 * @param {!boolean}
 * @private
 */
xiv.ui.Histogram.prototype.clipToZoom_ = false;




/**
 * @public
 * @type {!number} min
 * @type {!number} max
 */
xiv.ui.Histogram.prototype.setZoomRange = function(min, max){
    this.zoomRange_[0] = min;
    this.zoomRange_[1] = max;
};


/**
 * @public
 * @type {number=} opt_min
 * @type {number=} opt_max
 */
xiv.ui.Histogram.prototype.setClipRange = function(opt_min, opt_max){
    //window.console.log("set View Max", max);
   
    if (this.clipToZoom_){
	this.clipRange_[0] = opt_min; 
	this.clipRange_[1] = opt_max;
    } else {
	var _l = this.getCurrentLevels(); 
	this.clipRange_[0] = _l.min; 
	this.clipRange_[1] = _l.max;	
    }
};



/**
 * @public
 * @type {!number} min
 * @type {!number} max
 */
xiv.ui.Histogram.prototype.setZoomAndClipRange = function(min, max){
    this.setZoomRange(min, max);
    this.setClipRange(min, max);
};


/**
 * @inheritDoc
 */
xiv.ui.Histogram.prototype.render = function(opt_parent){
    //window.console.log("HIST RENDER");
    goog.base(this, 'render', opt_parent);

    //window.console.log(this.getElement().parentNode);

    this.setComponent(this);

    //
    // Canvas
    //
    this.canvas_ = goog.dom.createDom('canvas', {
	'id': this.constructor.ID_PREFIX + '_Canvas_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.CANVAS
    })
    goog.dom.appendChild(this.getElement(), this.canvas_);
    this.context_ = this.canvas_.getContext("2d");
    this.context_.fillStyle = this.contextFillStyle_;


    //
    // Line canvas
    //
    this.lineCanvas_ = goog.dom.createDom('canvas', {
	'id': this.constructor.ID_PREFIX + '_LineCanvas_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.LINECANVAS
    })
    goog.dom.appendChild(this.getElement(), this.lineCanvas_);
    this.lineContext_ = this.lineCanvas_.getContext("2d");
    //this.lineContext_.fillStyle = this.lineContextFillStyle_;

    //
    // Min Div
    //
    this.minMaxDivs_[0] = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Min_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MIN
    }, '-1000')
    goog.dom.appendChild(this.getElement(), this.minMaxDivs_[0]);
 
    //
    // Max Div
    //
    this.minMaxDivs_[1] = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Max_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MAX
    }, '1000')
    goog.dom.appendChild(this.getElement(), this.minMaxDivs_[1]);


    //
    // Min Div
    //
    this.clipDivs_[0] = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Min_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.CLIPMIN
    }, '-1000')
    goog.dom.appendChild(this.getElement(), this.clipDivs_[0]);
 
    //
    // Max Div
    //
    this.clipDivs_[1] = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Max_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.CLIPMAX
    }, '1000')
    goog.dom.appendChild(this.getElement(), this.clipDivs_[1]);

}


/**
 * @return {X.volume}
 * @public
 */
xiv.ui.Histogram.prototype.getXObj = function() {
    return goog.base(this, 'getXObj');
}




/**
 * @param {!boolean} val
 * @public
 */
xiv.ui.Histogram.prototype.clipToZoom = function(val) {
    this.clipToZoom_ = val;
    if (val == false){
	this.setClipRange(null, null);
    }
}



/**
 * @private
 */
xiv.ui.Histogram.prototype.tallyLevels_ = function() {

    //
    // We don't need to re-tally if it's already there (it takes way too 
    // long to run more than once, given the size of the data).
    //
    if (goog.isDefAndNotNull(this.levels_)) { return } 

    //
    // Increment the value counts and the total pixels
    //
    var xObj = this.getXObj(), len = xObj['max'];


    //window.console.log('he', xObj['image'], xObj['image']);



    goog.array.forEach(xObj['image'], function(sliceImg){

	//window.console.log('sliceImg', sliceImg);

	goog.array.forEach(sliceImg, function(sliceData){

	    //window.console.log('sliceData', sliceData);

	    goog.array.forEach(sliceData, function(pixelData){

		//window.console.log('pixelData', pixelData);

		if (this.levels_ == null){
		    this.levels_ = [];
		    var i = 0;
		    for(i=0; i <= len; i++) { this.levels_.push(0) };
		}

		this.levels_[parseInt(pixelData)]++;
		this.totalPixels_++;
	    }.bind(this))
	}.bind(this))
    }.bind(this))

    if (!goog.isDefAndNotNull(this.levels_)){
	return;
    }

    //
    // Tally and store the percentage to draw each bar
    //
    var pct;
    var total = 0;
    this.totals_ = goog.array.repeat(0, this.levels_.length);

    if (!goog.isDefAndNotNull(this.percentages_)){
	this.percentages_ = [];
	this.maxPct_ = 0;
	goog.array.forEach(this.levels_, function(levelCount, i){
	    pct = (levelCount / this.totalPixels_);
	    this.percentages_.push(pct);
	    total += pct;
	    this.totals_[i] = total; 
	    this.maxPct_ = Math.max(this.maxPct_, pct);
	}.bind(this))
    }
}




/**
 * @public
 */
xiv.ui.Histogram.prototype.draw = function() {
    //
    // We can't do anything if there's no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return }

    //
    // params
    //
    var size = goog.style.getSize(this.canvas_);
    var canvasWidth = size.width;
    var canvasHeight = size.height;
 
    //
    // We can't do anthing if the canvas is not rendered,
    // which means that its width and height are 0.
    //
    if (canvasWidth == 0 || canvasHeight == 0) { return }

    //
    // Set the canvas dims.  If we don't do it, it creates bugs.
    //
    this.canvas_.height = canvasHeight;
    this.canvas_.width = canvasWidth;
    this.lineCanvas_.height = canvasHeight;
    this.lineCanvas_.width = canvasWidth;

    //
    // Tally all of the levels. Exit of no levels_ property.
    //
    this.tallyLevels_();
    if (!goog.isDefAndNotNull(this.levels_)){
	return;
    }
    
    //window.console.log("Draw", this.zoomRange_[0], this.zoomRange_[1]);


    this.draw_(canvasWidth, canvasHeight);
    
}



/**
 * @return {!Array.<number>}
 * @public
 */
xiv.ui.Histogram.prototype.getVisiblePixelRange = function(){

    var minSamplePct = .1
    var minSampleInd = Math.round(this.percentages_.length * minSamplePct);
    var maxSampleInd = Math.round(this.percentages_.length * (1-minSamplePct));
    var values;
    var i;

    //
    // First, find the largest value of the first 10%
    //
    var largest = this.percentages_[0];
    var largestIndex = 0;
    for (i = 1; i < minSampleInd; i++) {
	if (this.percentages_[i] > largestIndex) {
            largestIndex = i;
            largest = this.percentages_[i];
	}
    }
    //window.console.log("LARGEST", largestIndex, largest);

    //
    // Then find the smallest point beginning with largest
    //
    var min = this.percentages_[largestIndex];
    var minIndex = largestIndex;
    for (i = largestIndex + 1; i < minSampleInd; i++) {
	if (this.percentages_[i] < min) {
            minIndex = i;
            min = this.percentages_[i];
	}
    }
    //window.console.log("min", minIndex, min);


    var max = this.percentages_[minSampleInd];
    var maxIndex = 0;
    for (i = minSampleInd + 1; i < maxSampleInd; i++) {
	if (this.percentages_[i] < max) {
            maxIndex = i;
            max = this.percentages_[i];
	}
    }

    return [minIndex, maxIndex];

}

 


/**
 * @param {!number} canvasWidth
 * @param {!number} canvasHeight
 * @private
 */
xiv.ui.Histogram.prototype.draw_ = function(canvasWidth, canvasHeight) {
  
    //window.console.log('canvasWidth: ', canvasWidth, 
    //'canvasHeight:', canvasHeight);
  
    //
    // Determine the new max -- have to loop through all percentages
    //

    //window.console.log('viewMin', this.zoomRange_[0], 
    //'viewMax', this.zoomRange_[1]);

    var relativeMax = 0;
    var i = this.zoomRange_[0];
    for (; i < this.zoomRange_[1] + 1; i++){
	if (this.percentages_[i] > relativeMax) {
	    relativeMax = this.percentages_[i];
	}
    }

    //
    // Construct the new percentages
    //
    var newPcts = [];
    i = this.clipRange_[0];
    for (; i < this.clipRange_[1] + 1; i++){
	newPcts.push(this.percentages_[i]/relativeMax);
    }

    //window.console.log("newPcts length", newPcts.length);

    //
    // canvasWidth = this.zoomRange_[1] * slope + b
    // 0 = this.zoomRange_[0] * slope + b
    //
    var slope = (canvasWidth - 0) / (this.clipRange_[1] - this.clipRange_[0]);
    //window.console.log('slope:', slope);
    var barWidth = (slope < 1) ? 1 : Math.round(slope);  

    //
    // Draw each histogram vertical bar
    //
    var height = 0;
    var canvX = 0;
    var len = newPcts.length;
    for (i=0; i < len; i++){
	height = Math.round(canvasHeight * newPcts[i]);
	canvX = Math.round(i * slope);
	
	//window.console.log(i, 'pct', newPcts[i], 'h', height, 'x', canvX);

	if (!isNaN(height) && goog.isDefAndNotNull(height)){	
	    this.context_.fillStyle = this.histogramBarColor_;
	    this.context_.fillRect(	
		barWidth * canvX, // X start
		canvasHeight, // Y start		       
		barWidth, // width
		    -height); // height
	}
    }
}




/**
 * @param {!number} The pixel cutoff threshold (between 0 and 1).
 * @return {number} The amount of level where the threshold first starts.
 * @public
 */
xiv.ui.Histogram.prototype.getLevelByPixelThreshold = function(thresh) {
    //
    // For auto-level calcuations
    //
    if (!goog.isDefAndNotNull(this.levels_)){ return }
    var t = 0, i = 0, len = this.levels_.length;
    for (; i < len; i++){
	t += this.levels_[i];
	if ((t / this.totalPixels_) >= thresh){
	    return i;
	}
    }
}



/**
 * @public
 */
xiv.ui.Histogram.prototype.drawLine = function() {

    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return };

    var size = goog.style.getSize(this.lineCanvas_);
    var canvasWidth = size.width;
    var canvasHeight = size.height;
    var _l = this.getCurrentLevels(); 

    //
    // Start by clearing the canvas
    //
    this.lineCanvas_.width = canvasWidth;
    

    
    this.drawLine_(canvasWidth, canvasHeight);
}



/**
 * @param {!number} minX
 * @param {!number} maxX
 * @private
 */
xiv.ui.Histogram.prototype.positionMinMaxDivs_ = function(minX, maxX){
    this.minMaxDivs_[0].style.width = 'auto';
    this.minMaxDivs_[1].style.width = 'auto';

    var eltDims = new nrg.style.dims(this.getElement()); 
    var leftLimit = eltDims.left;
    var rightLimit =  eltDims.right;

    this.minMaxDivs_[0].style.left = minX.toString() + 'px';
    var minDims = 
	nrg.style.constrainHorizontally(
	    this.minMaxDivs_[0], 
	    leftLimit, rightLimit);

    this.minMaxDivs_[1].style.left = maxX.toString() + 'px';
    var maxDims = 
	nrg.style.constrainHorizontally(
	    this.minMaxDivs_[1], 
	    leftLimit, rightLimit);
    
    //window.console.log(minDims, maxDims);

    //
    // Check for overlaps
    //
    if ((minDims.right + 5)> maxDims.left){
	//
	// Put all of the content in min div
	//
	this.minMaxDivs_[0].innerHTML += ', ' + this.minMaxDivs_[1].innerHTML;
	this.minMaxDivs_[1].innerHTML = '';

	//
	// Constrain the minDiv
	//
	nrg.style.constrainHorizontally(this.minMaxDivs_[0], 
					leftLimit, rightLimit);
    }
}



/**
 * @param {!number} minX
 * @param {!number} maxX
 * @private
 */
xiv.ui.Histogram.prototype.positionClipDivs_ = function(){    
    var canvDims = new nrg.style.dims(this.canvas_);
    this.clipDivs_[0].style.left = canvDims.left.toString() + 'px';
    this.clipDivs_[1].style.left = 
	(canvDims.right -
	goog.style.getSize(this.clipDivs_[1]).width).toString() + 'px';

} 



/**
 * @param {!number} minX
 * @param {!number} maxX
 * @private
 */
xiv.ui.Histogram.prototype.positionNumberDivs_ = function(minX, maxX){
    this.positionMinMaxDivs_(minX, maxX);
    this.positionClipDivs_();

} 



/**
 * @param {!number] canvasWidth
 * @param {!number] canvasHeight
 * @private
 */
xiv.ui.Histogram.prototype.drawLine_ = 
function(canvasWidth, canvasHeight) {
    var _l = this.getCurrentLevels(); 

    var xSlope = (canvasWidth - 0) / (this.clipRange_[1] - this.clipRange_[0]);
    // 0 = this.clipRange_[0] * xSlope  + b    
    var b = -1 * this.clipRange_[0] * xSlope
    var canvX1 = _l.low * xSlope + b;
    var canvX2 = _l.high * xSlope + b;
    var limX1 = this.clipRange_[0] * xSlope + b;
    var limX2 = this.clipRange_[1] * xSlope + b;
    


    var ySlope = (canvasHeight - 0) / (canvX2 - canvX1);
    // 0 = canvX1 * ySlope  + b
    b = -1 * canvX1 * ySlope
    var limY1 = limX1 * ySlope + b;
    var limY2 = limX2 * ySlope + b;


    // 
    // Position the min / max displays
    //
    this.positionNumberDivs_(canvX1, canvX2);


    //
    // Draw the sloped line
    //
    this.lineContext_.beginPath();
    this.lineContext_.strokeStyle = "black";
    
    //
    // 1st point
    //
    this.lineContext_.moveTo(limX1, canvasHeight - limY1);

    //
    // 2nd point
    //
    this.lineContext_.lineTo(limX2, canvasHeight - limY2);


    this.lineContext_.lineWidth = .5;
    this.lineContext_.stroke();

    //
    // Draw the max line
    //
    var endLine = canvX2;

    if (endLine > 0 && endLine < canvasWidth){
	this.lineContext_.moveTo(endLine, canvasHeight);
	this.lineContext_.lineTo(endLine, canvasHeight - 15);
	this.lineContext_.lineWidth = .5;
	this.lineContext_.stroke();
    }
}



/**
 * @public
 */
xiv.ui.Histogram.prototype.refresh = function(){
    
    //window.console.log("UPDATE!");
    //this.getXObj()['windowHigh'] = 
    this.refreshNumberDisplays_();
    this.draw();
    this.drawLine();
}



/**
 * @private
 */
xiv.ui.Histogram.prototype.refreshNumberDisplays_ = function(){
    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return };

    var _l = this.getCurrentLevels();    
    this.minMaxDivs_[0].innerHTML = 'Min: ' + _l.low;
    this.minMaxDivs_[1].innerHTML = 'Max: ' + _l.high;  

    this.clipDivs_[0].innerHTML = this.clipRange_[0];
    this.clipDivs_[1].innerHTML = this.clipRange_[1];    
}




/**
 * @inheritDoc
 */
xiv.ui.Histogram.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

  
    this.minMaxDivs_ = [null, null];
    delete this.minMaxDivs_;
    this.clipDivs_ = [null, null];
    delete this.clipDivs_;
 


    if (goog.isDefAndNotNull(this.canvas_)){
	goog.dom.removeNode(this.canvas_);
	delete this.canvas_;
    }


    if (goog.isDefAndNotNull(this.lineCanvas_)){
	goog.dom.removeNode(this.lineCanvas_);
	delete this.lineCanvas_;
    }

    if (goog.isDefAndNotNull(this.levels_)){
	goog.array.clear(this.levels_);
	delete this.levels_;
    }

    if (goog.isDefAndNotNull(this.percentages_)){
	goog.array.clear(this.percentages_);
	delete this.percentages_;
    }

    if (goog.isDefAndNotNull(this.totals_)){
	goog.array.clear(this.totals_);
	delete this.totals_;
    }
    

    delete this.totalPixels_;
    delete this.maxPct_;
    delete this.context_;
    delete this.lineContext_;

    goog.array.clear(this.zoomRange_);
    delete this.zoomRange_;

    goog.array.clear(this.clipRange_);
    delete this.clipRange_;

    delete this.clipToZoom_;
}




goog.exportSymbol('xiv.ui.Histogram.EventType',
	xiv.ui.Histogram.EventType);
goog.exportSymbol('xiv.ui.Histogram.ID_PREFIX',
	xiv.ui.Histogram.ID_PREFIX);
goog.exportSymbol('xiv.ui.Histogram.CSS_SUFFIX',
	xiv.ui.Histogram.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.Histogram.LEVEL_CUTOFF',
	xiv.ui.Histogram.LEVEL_CUTOFF);
goog.exportSymbol('xiv.ui.Histogram.prototype.render',
	xiv.ui.Histogram.prototype.render);
goog.exportSymbol('xiv.ui.Histogram.prototype.draw',
	xiv.ui.Histogram.prototype.draw);
goog.exportSymbol('xiv.ui.Histogram.prototype.drawLine',
	xiv.ui.Histogram.prototype.drawLine);
goog.exportSymbol('xiv.ui.Histogram.prototype.clipToZoom',
	xiv.ui.Histogram.prototype.clipToZoom);
goog.exportSymbol('xiv.ui.Histogram.prototype.setZoomRange',
	xiv.ui.Histogram.prototype.setZoomRange);
goog.exportSymbol('xiv.ui.Histogram.prototype.setClipRange',
	xiv.ui.Histogram.prototype.setClipRange);
goog.exportSymbol('xiv.ui.Histogram.prototype.setZoomAndClipRange',
	xiv.ui.Histogram.prototype.setZoomAndClipRange);
goog.exportSymbol('xiv.ui.Histogram.prototype.getLevelByPixelThreshold',
	xiv.ui.Histogram.prototype.getLevelByPixelThreshold);
goog.exportSymbol('xiv.ui.Histogram.prototype.getVisiblePixelRange',
	xiv.ui.Histogram.prototype.getVisiblePixelRange);
goog.exportSymbol('xiv.ui.Histogram.prototype.refresh',
	xiv.ui.Histogram.prototype.refresh);
goog.exportSymbol('xiv.ui.Histogram.prototype.disposeInternal',
	xiv.ui.Histogram.prototype.disposeInternal);
