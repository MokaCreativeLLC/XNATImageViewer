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

    this.canvas_ = goog.dom.createDom('canvas', {
	'id': this.constructor.ID_PREFIX + '_Canvas_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.CANVAS
    })
    goog.dom.appendChild(this.getElement(), this.canvas_);
    this.context_ = this.canvas_.getContext("2d");
    this.context_.fillStyle = this.contextFillStyle_;


    this.lineCanvas_ = goog.dom.createDom('canvas', {
	'id': this.constructor.ID_PREFIX + '_LineCanvas_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.LINECANVAS
    })
    goog.dom.appendChild(this.getElement(), this.lineCanvas_);
    this.lineContext_ = this.lineCanvas_.getContext("2d");
    //this.lineContext_.fillStyle = this.lineContextFillStyle_;

    this.maxDiv_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Max_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MAX
    }, '1000')
    goog.dom.appendChild(this.getElement(), this.maxDiv_);


    this.minDiv_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Min_' + 
	    goog.string.createUniqueString(),
	'class': this.constructor.CSS.MIN
    }, '-1000')
    goog.dom.appendChild(this.getElement(), this.minDiv_);
 
    //window.console.log(this.getElement());
    //this.draw();
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

    this.drawWithHorizScaling_(canvasWidth, canvasHeight);
}



/**
 * @return {!Array.<number>}
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.getVisiblePixelRange = function(){

    var pctQueue = new goog.structs.Queue();
    var samplePct = .1
    var sampleSize = Math.round(this.percentages_.length * samplePct);
    var values;
    var i = 0;
    var len = this.percentages_.length;
    var j = 0;
    
    var newPcts = goog.array.slice(this.percentages_, 0, sampleSize);
    
    var indices = new Array(sampleSize);

    goog.array.forEach(indices, function(val, i){
	indices[i] = i;
    })

    var min = this.percentages_[0];
    var minIndex = 0;

    for (var i = 1; i < sampleSize; i++) {
	if (this.percentages_[i] < min) {
            minIndex = i;
            min = this.percentages_[i];
	}
    }

   return [minIndex, maxIndex];

}

 


/**
 * @param {!number} canvasWidth
 * @param {!number} canvasHeight
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.drawWithHorizScaling_ = 
function(canvasWidth, canvasHeight) {
  

    var _l = this.getCurrentLevels();  
  
    //
    // Determine the new max -- have to loop through all percentages
    //
    var i = this.viewMin_;
    var cutoffInd = this.viewMax_;

    window.console.log(this.viewMin_, this.viewMax_);
    var newMax = 0;
    for (; i < cutoffInd + 1; i++){
	if (this.percentages_[i] > newMax) {
	    newMax = this.percentages_[i];
	}
    }

    //
    // Construct the new percentages
    //
    var newPcts = [];
    var j = this.viewMin_;
    for(; j < (cutoffInd + 1); j++){
	newPcts.push(this.percentages_[j]/newMax);
    }

    //
    // Bar width of the histogram
    //
    var barWidth = Math.round(canvasWidth/this.viewMax_);
    barWidth = barWidth > 0 ? barWidth: 1;   

    //
    // Draw each histogram vertical bar
    //
    var height = 0;
    var slope = 0, canvX = 0;
    for (i=0; i < this.viewMax_ + 1; i++){

	height = Math.round(canvasHeight * newPcts[i]);
	slope = canvasWidth / this.viewMax_;
	canvX = Math.round(slope * i);
 
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
    

    
    this.drawLine_(canvasWidth, canvasHeight, canvasWidth / 
		   (this.viewMax_ - this.viewMin_));
}




/**
 * @param {!number] canvasWidth
 * @param {!number] canvasHeight
 * @param {!number] scaleX
 */
xiv.ui.ctrl.Histogram.prototype.drawLine_ = 
function(canvasWidth, canvasHeight, scaleX) {
    var _l = this.getCurrentLevels(); 
    var canvX1 = _l.low * scaleX;
    var canvX2 = _l.high * scaleX;
    var canvY1 = 0
    var canvY2 = canvasHeight;

    this.minDiv_.style.width = 'auto';
    this.maxDiv_.style.width = 'auto';

    var minX = -1

    var minDivWidth = goog.style.getSize(this.minDiv_).width;
    var maxDivWidth = goog.style.getSize(this.maxDiv_).width;

    window.console.log(minDivWidth, maxDivWidth);

    if (canvX1 >= minX) {
	this.minDiv_.style.left = canvX1.toString() + 'px';
    }
    else {
	this.minDiv_.style.left = minX.toString() + 'px';
    }

    var maxLim =  canvasWidth + 30 - maxDivWidth;
    if (canvX2 <= maxLim){
	this.maxDiv_.style.left = canvX2.toString() + 'px';
    } else {
	this.maxDiv_.style.left = (maxLim).toString() + 'px';
    }

    //
    // y = mx + b...so
    //

    //
    // Slope: (y2 - y1) / (x2 - x1)
    //
    var slope = canvasHeight / (canvX2 - canvX1);

    //
    // b = y - mx, at canvX1, y = 0
    //
    var b = -slope * canvX1;

    
    var limX1 = 0;
    var limX2 = canvasWidth;
    var limY1 = slope * limX1 + b;
    var limY2 = slope * limX2 + b;

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
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.update',
	xiv.ui.ctrl.Histogram.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.updateMaxMin',
	xiv.ui.ctrl.Histogram.prototype.updateMaxMin);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.disposeInternal',
	xiv.ui.ctrl.Histogram.prototype.disposeInternal);
