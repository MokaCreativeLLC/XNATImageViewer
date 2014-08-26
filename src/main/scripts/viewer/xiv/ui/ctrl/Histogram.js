/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.Histogram');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.style');
goog.require('goog.structs.Queue');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------




/**
 * xiv.ui.ctrl.Histogram
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.Histogram = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.Histogram, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.Histogram', xiv.ui.ctrl.Histogram);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.Histogram.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.Histogram.ID_PREFIX =  'xiv.ui.ctrl.Histogram';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.Histogram.CSS_SUFFIX = {
    CANVAS: 'canvas',
    LINECANVAS: 'linecanvas',
    MAX: 'max',
    MIN: 'min',

}



/**
 * @expose
 * @type {!number}
 * @const
 */
xiv.ui.ctrl.Histogram.LEVEL_CUTOFF = .999;



/**
 * @const
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.heightLimit_ = .95;



/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.levels_ = null;




/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.percentages_ = null;



/**
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.totals_ = null;



/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.totalPixels_ = null;




/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.maxPct_ = null;



/**
 * @const
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.contextFillStyle_ = 'rgb(40,40,40)';



/**
 * @const
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.lineContextFillStyle_ = 'rgb(0,0,0)';




/**
 * @type {Element}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.canvas_;



/**
 * @type {Object}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.context_;



/**
 * @type {Element}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.lineCanvas_;



/**
 * @type {Object}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.lineContext_;



/**
 * @type {Element}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.maxDiv_;



/**
 * @type {Element}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.minDiv_;



/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.startMin_;



/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.startMax_;



/**
 * @private
 * @type {!string}
 * @const
 */
xiv.ui.ctrl.Histogram.prototype.histogramBarColor_ = "rgb(90,90,90)";




/**
 * @private
 * @type {!number}
 */
xiv.ui.ctrl.Histogram.prototype.viewMin_ = 0;


/**
 * @private
 * @type {!number}
 */
xiv.ui.ctrl.Histogram.prototype.viewMax_ = 0;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ctrl.Histogram.prototype.noiseFilterOn_ = false;



/**
 * @public
 * @type {!boolean} on
 */
xiv.ui.ctrl.Histogram.prototype.noiseFilterOn = function(on){
    this.noiseFilterOn_ = on;
}


/**
 * @public
 * @type {!number}
 */
xiv.ui.ctrl.Histogram.prototype.setViewMin = function(min){
    this.viewMin_ = min;
};


/**
 * @public
 * @type {!number}
 */
xiv.ui.ctrl.Histogram.prototype.setViewMax = function(max){
    //window.console.log("set View Max", max);
    this.viewMax_ = max;
};




/**
 * @inheritDoc
 */
xiv.ui.ctrl.Histogram.prototype.render = function(opt_parent){
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
    this.minDiv_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Min_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MIN
    }, '-1000')
    goog.dom.appendChild(this.getElement(), this.minDiv_);
 
    //
    // Max Div
    //
    this.maxDiv_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Max_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MAX
    }, '1000')
    goog.dom.appendChild(this.getElement(), this.maxDiv_);

}


/**
 * @return {X.volume}
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.getXObj = function() {
    return goog.base(this, 'getXObj');
}




/**
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.tallyLevels_ = function() {

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
xiv.ui.ctrl.Histogram.prototype.draw = function() {
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

    this.draw_(canvasWidth, canvasHeight);
}



/**
 * @return {!Array.<number>}
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.getVisiblePixelRange = function(){

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
xiv.ui.ctrl.Histogram.prototype.draw_ = 
function(canvasWidth, canvasHeight) {
  
    //window.console.log('canvasWidth: ', canvasWidth, 
    //'canvasHeight:', canvasHeight);
  
    //
    // Determine the new max -- have to loop through all percentages
    //

    //window.console.log('viewMin', this.viewMin_, 
    //'viewMax', this.viewMax_);

    var newMax = 0;
    var i = this.viewMin_;
    for (; i < this.viewMax_ + 1; i++){
	if (this.percentages_[i] > newMax) {
	    newMax = this.percentages_[i];
	}
    }

    //
    // Construct the new percentages
    //
    var newPcts = [];
    i = this.viewMin_;
    for (; i < this.viewMax_ + 1; i++){
	newPcts.push(this.percentages_[i]/newMax);
    }

    //window.console.log("newPcts length", newPcts.length);

    //
    // canvasWidth = this.viewMax_ * slope + b
    // 0 = this.viewMin_ * slope + b
    //
    var slope = (canvasWidth - 0) / (this.viewMax_ - this.viewMin_);
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
xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold = function(thresh) {
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
xiv.ui.ctrl.Histogram.prototype.drawLine = function() {

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
xiv.ui.ctrl.Histogram.prototype.positionMinMaxDivs_ = function(minX, maxX){
    this.minDiv_.style.width = 'auto';
    this.maxDiv_.style.width = 'auto';

    var eltDims = new nrg.style.dims(this.getElement()); 
    var leftLimit = eltDims.left;
    var rightLimit =  eltDims.right;

    this.minDiv_.style.left = minX.toString() + 'px';
    var minDims = 
	nrg.style.constrainHorizontally(this.minDiv_, leftLimit, rightLimit);

    this.maxDiv_.style.left = maxX.toString() + 'px';
    var maxDims = 
	nrg.style.constrainHorizontally(this.maxDiv_, leftLimit, rightLimit);
    
    //window.console.log(minDims, maxDims);

    //
    // Check for overlaps
    //
    if ((minDims.right + 5)> maxDims.left){
	//
	// Put all of the content in min div
	//
	this.minDiv_.innerHTML += ', ' + this.maxDiv_.innerHTML;
	this.maxDiv_.innerHTML = '';

	//
	// Constrain the minDiv
	//
	nrg.style.constrainHorizontally(this.minDiv_, 
					leftLimit, rightLimit);
    }

} 



/**
 * @param {!number] canvasWidth
 * @param {!number] canvasHeight
 * @param {!number] scaleX
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.drawLine_ = 
function(canvasWidth, canvasHeight, scaleX) {
    var _l = this.getCurrentLevels(); 

    var xSlope = (canvasWidth - 0) / (this.viewMax_ - this.viewMin_);
    // 0 = this.viewMin_ * xSlope  + b    
    var b = -1 * this.viewMin_ * xSlope
    var canvX1 = _l.low * xSlope + b;
    var canvX2 = _l.high * xSlope + b;
    var limX1 = this.viewMin_ * xSlope + b;
    var limX2 = this.viewMax_ * xSlope + b;
    


    var ySlope = (canvasHeight - 0) / (canvX2 - canvX1);
    // 0 = canvX1 * ySlope  + b
    b = -1 * canvX1 * ySlope
    var limY1 = limX1 * ySlope + b;
    var limY2 = limX2 * ySlope + b;


    // 
    // Position the min / max displays
    //
    this.positionMinMaxDivs_(canvX1, canvX2);


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
xiv.ui.ctrl.Histogram.prototype.update = function(){
    
    //window.console.log("UPDATE!");
    //this.getXObj()['windowHigh'] = 
    this.updateMaxMin_();
    this.draw();
    this.drawLine();
}



/**
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.updateMaxMin_ = function(){
    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return };

    var _l = this.getCurrentLevels();    
    this.minDiv_.innerHTML = 'Min: ' + _l.low;
    this.maxDiv_.innerHTML = 'Max: ' + _l.high;    
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.Histogram.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    if (goog.isDefAndNotNull(this.maxDiv_)){
	goog.dom.removeNode(this.maxDiv_);
	delete this.maxDiv_;
    }

    if (goog.isDefAndNotNull(this.minDiv_)){
	goog.dom.removeNode(this.minDiv_);
	delete this.minDiv_;
    }


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
    delete this.startMin_;
    delete this.startMax_;
    delete this.noiseFilterOn_;
}




goog.exportSymbol('xiv.ui.ctrl.Histogram.EventType',
	xiv.ui.ctrl.Histogram.EventType);
goog.exportSymbol('xiv.ui.ctrl.Histogram.ID_PREFIX',
	xiv.ui.ctrl.Histogram.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.Histogram.CSS_SUFFIX',
	xiv.ui.ctrl.Histogram.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.Histogram.LEVEL_CUTOFF',
	xiv.ui.ctrl.Histogram.LEVEL_CUTOFF);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.render',
	xiv.ui.ctrl.Histogram.prototype.render);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.draw',
	xiv.ui.ctrl.Histogram.prototype.draw);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.drawLine',
	xiv.ui.ctrl.Histogram.prototype.drawLine);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.setViewMin',
	xiv.ui.ctrl.Histogram.prototype.setViewMin);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.setViewMax',
	xiv.ui.ctrl.Histogram.prototype.setViewMax);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold',
	xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.getVisiblePixelRange',
	xiv.ui.ctrl.Histogram.prototype.getVisiblePixelRange);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.noiseFilterOn',
	xiv.ui.ctrl.Histogram.prototype.noiseFilterOn);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.update',
	xiv.ui.ctrl.Histogram.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.updateMaxMin',
	xiv.ui.ctrl.Histogram.prototype.updateMaxMin);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.disposeInternal',
	xiv.ui.ctrl.Histogram.prototype.disposeInternal);
