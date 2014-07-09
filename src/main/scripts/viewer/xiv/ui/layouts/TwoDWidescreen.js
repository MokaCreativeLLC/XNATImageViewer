/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.TwoDWidescreen');

// goog
goog.require('goog.style')
goog.require('goog.events')
goog.require('goog.array')
goog.require('goog.string')

// nrg
goog.require('nrg.string')
goog.require('nrg.style')
goog.require('nrg.ui.Resizable')

// xiv
goog.require('xiv.ui.layouts.Layout')
goog.require('xiv.ui.layouts.XyzvLayout')

//-----------



/**
 * xiv.ui.layouts.TwoDWidescreen
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
xiv.ui.layouts.TwoDWidescreen = function() { 
    goog.base(this, ['X', 'Y', 'Z']); 
}
goog.inherits(xiv.ui.layouts.TwoDWidescreen, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen', 
		  xiv.ui.layouts.TwoDWidescreen);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.TwoDWidescreen.TITLE = 'TwoDWidescreen';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.TwoDWidescreen.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.TwoDWidescreen.ID_PREFIX =  'xiv.ui.layouts.TwoDWidescreen';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.layouts.TwoDWidescreen.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
}




/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_X = function(){
    goog.base(this, 'setupLayoutFrame_X');
    
    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('X', ['RIGHT']);
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['X'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE,
		       this.onLayoutFrameResize_X.bind(this));

    goog.events.listen(this.LayoutFrames['X'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_Y = function(){
    goog.base(this, 'setupLayoutFrame_Y');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('Y', ['BOTTOM']);
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['Y'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE,
		       this.onLayoutFrameResize_Y.bind(this));

    goog.events.listen(this.LayoutFrames['Y'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}


/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_X = function(e){
    this.onXYLayoutFrameResize_(function(xSize, ySize, zSize, deltaX){
	var yzLeft = xSize.width;
	var yzWidth = Math.max(this.currSize.width - xSize.width, 
			       this.minLayoutFrameWidth_);
	var yzFrames = ['Y', 'Z'];
	goog.array.forEach(yzFrames, function(fr){
	    this.LayoutFrames[fr].getElement().style.left = yzLeft + 'px';
	    this.LayoutFrames[fr].getElement().style.width = yzWidth + 'px';
	}.bind(this))

    }.bind(this))

    //
    // Dispatch
    //
    this.dispatchResize();
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_Y = function(e){
    this.onXYLayoutFrameResize_(function(xSize, ySize, zSize, deltaX){
	window.console.log("Y SIZE", ySize.height);
	var zTop = ySize.height;
	var zHeight = this.currSize.height  - zTop;
	this.LayoutFrames['Z'].getElement().style.top = zTop + 'px';
	this.LayoutFrames['Z'].getElement().style.height = zHeight + 'px';
    }.bind(this))

    //
    // Dispatch
    //
    this.dispatchResize();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    this.scaleFrames_();
    this.updateStyle_X();
    this.updateStyle_Y();
    this.updateStyle_Z();
}



/**
 * @private
 */
xiv.ui.layouts.TwoDWidescreen.prototype.scaleFrames_ = function(){
    if ((this.prevSize.width !== this.currSize.width) || 
	(this.prevSize.height !== this.currSize.height)) {

	var heightDiff = 1 - ((this.prevSize.height - this.currSize.height) / 
			      this.prevSize.height);
	var widthDiff = 1 - ((this.prevSize.width - this.currSize.width) / 
			     this.prevSize.width);

	this.loopXyz(function(frame, key){
	    frameSize = goog.style.getSize(frame.getElement());

	    frame.getElement().style.width =  
		Math.max(frameSize.width * widthDiff, 
			 this.minLayoutFrameWidth_).toString() + 'px';

	    frame.getElement().style.height =  
		Math.max(frameSize.height * heightDiff, 
			 this.minLayoutFrameHeight_).toString() + 'px';

	}.bind(this))
    }
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_X = function() {

    var currFrame = this.LayoutFrames['X'];
    currFrame.getElement().style.height  = 
	this.currSize.height.toString() + 'px';

    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
	currFrame.getResizable().getBoundaryElement(), {
	    'left': this.minLayoutFrameWidth_,
	    'width': this.currSize.width -  this.minLayoutFrameWidth_ * 2,
	})



    //
    // Right Handle
    //
    var rightHandle = currFrame.getResizable().getHandle('RIGHT');
    rightHandle.style.left = currFrame.getElement().style.width;
    goog.style.setHeight(rightHandle, this.currSize.height);



    //
    // IMPORTANT!!
    //
    currFrame.getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Y = function() {
    var currFrame = this.LayoutFrames['Y'];
    currFrame.getElement().style.left = 
	this.LayoutFrames['X'].getElement().style.width;

    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
	currFrame.getResizable().getBoundaryElement(), {
	    'top': this.minLayoutFrameHeight_,
	    'height': this.currSize.height -  this.minLayoutFrameHeight_ * 2,
	})



    //
    // Right Handle
    //
    var bottomHandle = currFrame.getResizable().getHandle('BOTTOM');
    bottomHandle.style.top = currFrame.getElement().style.height;
    goog.style.setWidth(bottomHandle, 
			parseInt(currFrame.getElement().style.width));



    //
    // IMPORTANT!!
    //
    currFrame.getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Z = function() {
    var currFrame = this.LayoutFrames['Z'];

    currFrame.getElement().style.left = 
	this.LayoutFrames['X'].getElement().style.width;


    currFrame.getElement().style.top = 
	this.LayoutFrames['Y'].getElement().style.height;

    currFrame.getElement().style.height = 
	(this.currSize.height - 
	 parseInt(this.LayoutFrames['Y'].getElement().style.height)) +
	+ 'px';
}


goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.TITLE',
	xiv.ui.layouts.TwoDWidescreen.TITLE);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.EventType',
	xiv.ui.layouts.TwoDWidescreen.EventType);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.ID_PREFIX',
	xiv.ui.layouts.TwoDWidescreen.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.CSS_SUFFIX',
	xiv.ui.layouts.TwoDWidescreen.CSS_SUFFIX);
goog.exportSymbol(
    'xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_X',
    xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_X);
goog.exportSymbol(
    'xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_Y',
    xiv.ui.layouts.TwoDWidescreen.prototype.setupLayoutFrame_Y);
goog.exportSymbol(
    'xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_X',
    xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_X);
goog.exportSymbol(
    'xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_Y',
    xiv.ui.layouts.TwoDWidescreen.prototype.onLayoutFrameResize_Y);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle',
	xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_X',
	xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_X);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Y',
	xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Y);
goog.exportSymbol('xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Z',
	xiv.ui.layouts.TwoDWidescreen.prototype.updateStyle_Z);
