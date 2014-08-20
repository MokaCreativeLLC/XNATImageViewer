/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.Histogram');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.style');

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
 * @type {!bool}
 */
xiv.ui.ctrl.Histogram.prototype.scaleOnChange_ = true;



/**
 * @param {!boolean} bool
 */
xiv.ui.ctrl.Histogram.prototype.scaleOnChange = function(bool){
    this.scaleOnChange_ = bool;
}



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

    if (this.scaleOnChange_){
	this.drawWithHorizScaling_(canvasWidth, canvasHeight);
	return;
    }
    this.draw_(canvasWidth, canvasHeight);
}



/**
 * @param {!number} canvasWidth
 * @param {!number} canvasHeight
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.drawWithHorizScaling_ = 
function(canvasWidth, canvasHeight) {
  
    var startInd = 0
    var _l = this.getCurrentLevels();  
  
    //
    // Determine the new max -- have to loop through all percentages
    //
    var i = startInd;
    var cutoffInd = _l.high;
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
    var j = startInd;
    for(; j < (cutoffInd + 1); j++){
	newPcts.push(this.percentages_[j]/newMax);
    }

    //
    // Bar width of the histogram
    //
    var barWidth = Math.round(canvasWidth/_l.high);
    barWidth = barWidth > 0 ? barWidth: 1;   

    //
    // Draw each histogram vertical bar
    //
    var height = 0;
    var slope = 0, canvX = 0;
    for (i=0; i < _l.high + 1; i++){

	height = Math.round(canvasHeight * newPcts[i]);
	slope = canvasWidth / _l.high;
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
 * @param {!number} canvasWidth
 * @param {!number} canvasHeight
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.draw_ = function(canvasWidth, canvasHeight) {

    //
    // Construct the histogram.
    //
    var barWidth = Math.round(canvasWidth/this.percentages_.length);
    barWidth = barWidth > 0 ? barWidth: 1;   
    var pctInd = 0;
    var indPct = 0;
    var height = 0;
    var _l = this.getCurrentLevels();  

    //
    // Draw each histogram vertical bar
    //
    for (i=0; i < canvasWidth; i++){

	indPct = i/canvasWidth;
	pctInd = Math.round(this.percentages_.length * indPct) -1;
	pctInd = (pctInd < 0) ? 0 : pctInd;
	height = Math.round(canvasHeight * this.percentages_[pctInd]);

	this.context_.fillStyle = this.histogramBarColor_;
	this.context_.fillRect(	
	    barWidth * i, // X start
	    canvasHeight, // Y start		       
	    barWidth, // width
	    -height); // height
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
    

    if (this.scaleOnChange_){
	this.drawLine_(canvasWidth, canvasHeight, canvasWidth / _l.high);
	return;
    }
    this.drawLine_(canvasWidth, canvasHeight, canvasWidth / _l.max);
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
    this.minDiv_.innerHTML = _l.low >= 0 ? _l.low : 0;
    this.maxDiv_.innerHTML = _l.high;    
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
    delete this.scaleOnChange_;
}




goog.exportSymbol('xiv.ui.ctrl.Histogram.EventType',
	xiv.ui.ctrl.Histogram.EventType);
goog.exportSymbol('xiv.ui.ctrl.Histogram.ID_PREFIX',
	xiv.ui.ctrl.Histogram.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.Histogram.CSS_SUFFIX',
	xiv.ui.ctrl.Histogram.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.Histogram.LEVEL_CUTOFF',
	xiv.ui.ctrl.Histogram.LEVEL_CUTOFF);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.scaleOnChange',
	xiv.ui.ctrl.Histogram.prototype.scaleOnChange);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.render',
	xiv.ui.ctrl.Histogram.prototype.render);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.draw',
	xiv.ui.ctrl.Histogram.prototype.draw);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.drawLine',
	xiv.ui.ctrl.Histogram.prototype.drawLine);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold',
	xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.update',
	xiv.ui.ctrl.Histogram.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.updateMaxMin',
	xiv.ui.ctrl.Histogram.prototype.updateMaxMin);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.disposeInternal',
	xiv.ui.ctrl.Histogram.prototype.disposeInternal);
