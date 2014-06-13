/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.ProgressBar');

// nrg




/**
 * xiv.ui.Histogram
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.Histogram');
xiv.ui.Histogram = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.Histogram, nrg.ui.Component);
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
 * @public
 */
xiv.ui.Histogram.CSS_SUFFIX = {
    CANVAS: 'canvas',
    LINECANVAS: 'linecanvas',
    MAX: 'max',
    MIN: 'min',

}



/**
 * @const
 * @private
 */
xiv.ui.Histogram.prototype.heightLimit_ = .95;



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
 * @type {X.volume}
 * @private
 */
xiv.ui.Histogram.prototype.volume_;



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
 * @type {Element}
 * @private
 */
xiv.ui.Histogram.prototype.maxDiv_;



/**
 * @type {Element}
 * @private
 */
xiv.ui.Histogram.prototype.minDiv_;



/**
 * @type {number}
 * @private
 */
xiv.ui.Histogram.prototype.startMin_;



/**
 * @type {number}
 * @private
 */
xiv.ui.Histogram.prototype.startMax_;



/**
 * @inheritDoc
 */
xiv.ui.Histogram.prototype.render = function(opt_parent){
    goog.base(this, 'render', opt_parent);

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
 
    this.draw();
}



/*
 * @public
 */
xiv.ui.Histogram.prototype.draw = function() {
    //
    // We can't do anything if there's no volume
    //
    if (!goog.isDefAndNotNull(this.volume_) ||
	!goog.isDefAndNotNull(this.volume_.images)) { return }

    //
    // params
    //
    var size = goog.style.getSize(this.canvas_);
    var canvasWidth = size.width;
    var canvasHeight = size.height;
    var i = 0, levels = [], len = this.volume_.max, totalPixels = 0;

    //
    // Creates bugs otherwise
    //
    this.canvas_.height = canvasHeight;
    this.canvas_.width = canvasWidth;
    this.lineCanvas_.height = canvasHeight;
    this.lineCanvas_.width = canvasWidth;


    //
    // Create an array to track the level counts
    //
    for(; i <= len; i++) { levels.push(0) };

    //
    // Increment the value counts and the total pixels
    //
    goog.array.forEach(this.volume_.image, function(sliceImg){
	goog.array.forEach(sliceImg, function(sliceData){
	    goog.array.forEach(sliceData, function(pixelData){
		levels[parseInt(pixelData)]++;
		totalPixels++;
	    })
	})
    })

    //
    // First pass: calculate the percentage to draw each bar
    //
    var pct, x;
    var maxPct = 0;
    var pcts = [];
    goog.array.forEach(levels, function(levelCount, i){
	pct = (levelCount / totalPixels);
	pcts.push(pct);
	maxPct = Math.max(maxPct, pct);
    })


    //
    // Second pass: If the percentages are too low, apply a multiplier
    //
    var multiplyer = this.heightLimit_ / maxPct;
    goog.array.forEach(pcts, function(pct, i){
	pct = pct * multiplyer * canvasHeight;
	x = Math.round((i / this.volume_.max) * canvasWidth);
	this.context_.fillRect(x, canvasHeight, 1, -Math.round(pct));
    }.bind(this))


    //
    // Update the max and min values
    //
    this.startMin_ = this.volume_.windowLow;
    this.startMax_ = this.volume_.windowHigh;
    this.updateMaxMin();

    //
    // Draw the line
    //
    this.drawLine();
}





/**
 * @public
 */
xiv.ui.Histogram.prototype.drawLine = function() {
    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.volume_)) { return };

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
	    this.volume_.windowLow / this.startMax_));
    } else {
	startX = Math.round(canvasWidth * (
	    this.volume_.windowLow / this.startMin_));
    }

    //
    // Calculate endX
    //
    var startX;
    if (this.startMax_ == 0) {
	endX = 0;
    } else {
	endX = Math.round(canvasWidth * (this.volume_.windowHigh / 
					 this.startMax_));
    }

    //
    // Draw the sloped line
    //
    this.lineContext_.strokeStyle = "black";
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
xiv.ui.Histogram.prototype.updateMaxMin = function(){
    //
    // Do nothing if no volume
    //
    if (!goog.isDefAndNotNull(this.volume_)) { return };
    this.minDiv_.innerHTML = this.volume_.windowLow;
    this.maxDiv_.innerHTML = this.volume_.windowHigh;
}




/**
 * @param {X.volume} vol
 * @public
 */
xiv.ui.Histogram.prototype.setVolume = function(vol) {
    this.volume_ = vol;
}




/**
 * @inheritDoc
 */
xiv.ui.Histogram.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.volume_;

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

    delete this.context_;
    delete this.lineContext_;
    delete this.startMin_;
    delete this.startMax_;
}




goog.exportSymbol('xiv.ui.Histogram.EventType', 
		  xiv.ui.Histogram.EventType);
goog.exportSymbol('xiv.ui.Histogram.ID_PREFIX', 
		  xiv.ui.Histogram.ID_PREFIX);
goog.exportSymbol('xiv.ui.Histogram.CSS_SUFFIX', 
		  xiv.ui.Histogram.CSS_SUFFIX);

goog.exportSymbol('xiv.ui.Histogram.prototype.setVolume', 
		  xiv.ui.Histogram.prototype.setVolume);
