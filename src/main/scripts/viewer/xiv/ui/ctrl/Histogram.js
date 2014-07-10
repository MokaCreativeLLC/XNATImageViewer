/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
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
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.windowHigh_ = null;



/**
 * @type {number}
 * @private
 */
xiv.ui.ctrl.Histogram.prototype.windowLow_ = null;



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
    window.console.log('tally1');
    //
    // We don't need to re-tally if it's already there (it takes way too 
    // long to run more than once, given the size of the data).
    //
    if (goog.isDefAndNotNull(this.levels_)) { return } 

    //
    // Increment the value counts and the total pixels
    //
    var xObj = this.getXObj(), i = 0, len = xObj['max'];


    //window.console.log('he', xObj['image'], xObj['image']);



    goog.array.forEach(xObj['image'], function(sliceImg){

	//window.console.log('sliceImg', sliceImg);

	goog.array.forEach(sliceImg, function(sliceData){

	    //window.console.log('sliceData', sliceData);

	    goog.array.forEach(sliceData, function(pixelData){

		//window.console.log('pixelData', pixelData);

		if (!goog.isDefAndNotNull(this.levels_)){
		    this.levels_ = [];
		    for(; i <= len; i++) { this.levels_.push(0) };
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
    if (!goog.isDefAndNotNull(this.percentages_)){
	this.percentages_ = [];
	this.maxPct_ = 0;
	goog.array.forEach(this.levels_, function(levelCount, i){
	    pct = (levelCount / this.totalPixels_);
	    this.percentages_.push(pct);
	    this.maxPct_ = Math.max(this.maxPct_, pct);
	}.bind(this))
    }
}




/**
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.draw = function() {
    window.console.log('c');
    //
    // We can't do anything if there's no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return }
    window.console.log('c1');
    //
    // params
    //
    var size = goog.style.getSize(this.canvas_);
    var canvasWidth = size.width;
    var canvasHeight = size.height;
    window.console.log('c2');

    //
    // Creates bugs otherwise
    //
    this.canvas_.height = canvasHeight;
    this.canvas_.width = canvasWidth;
    this.lineCanvas_.height = canvasHeight;
    this.lineCanvas_.width = canvasWidth;
    window.console.log('c3');
    //
    // Tally all of the levels
    // Exit if no levels were retrieved
    //
    this.tallyLevels_();
    if (!goog.isDefAndNotNull(this.levels_)){
	return;
    }

    window.console.log('c4');
    //var cutoffThreshold = .99
    var cutoffLevel = this.getXObj().windowHigh;
    var barWidth = Math.round(canvasWidth/cutoffLevel);
    barWidth = barWidth > 0 ? barWidth: 1;
    window.console.log('barWidth', barWidth);
    
    window.console.log('c5');
    //
    // If the percentages are too low, apply a multiplier
    //
    var multiplyer = this.heightLimit_ / this.maxPct_;
    var pct;
    var i =0, len = this.percentages_.length; 
    for (; i<len; i++){
	pct = this.percentages_[i] * multiplyer * canvasHeight;
	//x = Math.round((i / cutoffLevel) * canvasWidth);
	//barWidth * i
	this.context_.fillRect(	barWidth * i, canvasHeight, 
			       barWidth, -Math.round(pct));
    }

    window.console.log('c6');
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

    //
    // Start by clearing the canvas
    //
    this.lineCanvas_.width = canvasWidth;
    
    //
    // Calculate startX
    //
    var startX;
    if (this.startMin_ == 0 && this.startMax_ > 0) {
	startX = Math.round(canvasWidth * (
	    this.windowLow_ / this.startMax_));
    } else {
	startX = Math.round(canvasWidth * (
	    this.windowLow_ / this.startMin_));
    }

    //
    // Calculate endX
    //
    var endX;
    if (this.startMax_ == 0) {
	endX = 0;
    } else {
	endX = Math.round(canvasWidth * (this.windowHigh_ / 
					 this.startMax_));
    }
    /**
    window.console.log('start', startX, 
		       'end', endX, 
		       '\nstartMn', this.startMin_,
		       '\startMx', this.startMax_, 
		       '\ncanvasW', canvasWidth, 
		       'canvasH', canvasHeight, 
		       '\nwinL', this.windowLow_,
		       'winH', this.windowHigh_); 
    */

    //
    // Draw the sloped line
    //
    this.lineContext_.strokeStyle = "gray";
    this.lineContext_.moveTo(startX, canvasHeight);
    this.lineContext_.lineTo(endX, 0);
    this.lineContext_.lineWidth = .5;
    this.lineContext_.stroke();

    //
    // Draw the min line
    //
    var midLineX = startX + (endX - startX) / 2;
    this.lineContext_.moveTo(midLineX, canvasHeight);
    this.lineContext_.lineTo(midLineX, canvasHeight - 20);
    this.lineContext_.lineWidth = .5;
    this.lineContext_.stroke();
}



/**
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.update = function(){
    window.console.log('b');

    this.draw();
  
    window.console.log('b1');
    this.updateMaxMin();
    window.console.log('b2');
    this.drawLine();
    window.console.log('b3');
}



/**
 * @public
 */
xiv.ui.ctrl.Histogram.prototype.updateMaxMin = function(){
    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.getXObj())) { return };

    if (!goog.isDefAndNotNull(this.startMin_)){
	this.startMin_ = parseInt(this.getXObj().windowLow);
	this.startMax_ = parseInt(this.getXObj().windowHigh);
	this.startMin_ = isNaN(this.startMin_) ? null : this.startMin_;
	this.startMax_ = isNaN(this.startMax_) ? null : this.startMax_;
	this.windowLow_ = this.startMin_;
	this.windowHigh_ = this.startMax_;
    }
    
    /**
    window.console.log('\nupdate max min', 
		       this.getXObj().windowLow,
		       this.getXObj().windowHigh);
		       */


    this.windowLow_ = parseInt(this.getXObj().windowLow);
    this.windowHigh_ = parseInt(this.getXObj().windowHigh);


    this.minDiv_.innerHTML = this.windowLow_;
    this.maxDiv_.innerHTML = this.windowHigh_;

    /**
    window.console.log('UPDATE MAX MIN', 
		       this.startMax_, this.startMin_,
		       this.windowHigh_, this.windowLow_);
    */
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
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold',
	xiv.ui.ctrl.Histogram.prototype.getLevelByPixelThreshold);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.drawLine',
	xiv.ui.ctrl.Histogram.prototype.drawLine);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.update',
	xiv.ui.ctrl.Histogram.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.updateMaxMin',
	xiv.ui.ctrl.Histogram.prototype.updateMaxMin);
goog.exportSymbol('xiv.ui.ctrl.Histogram.prototype.disposeInternal',
	xiv.ui.ctrl.Histogram.prototype.disposeInternal);
