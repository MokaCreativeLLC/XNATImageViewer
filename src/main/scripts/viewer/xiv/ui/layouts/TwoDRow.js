/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.TwoDRow');

// goog
goog.require('goog.style')
goog.require('goog.events')
goog.require('goog.array')
goog.require('goog.string')


// nrg
goog.require('nrg.ui.Resizable')
goog.require('nrg.string')
goog.require('nrg.style')

// xiv
goog.require('xiv.ui.layouts.Layout')
goog.require('xiv.ui.layouts.XyzvLayout')

//-----------



/**
 * xiv.ui.layouts.TwoDRow
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
xiv.ui.layouts.TwoDRow = function() { 
    goog.base(this, ['X', 'Y', 'Z']); 
}
goog.inherits(xiv.ui.layouts.TwoDRow, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.TwoDRow', xiv.ui.layouts.TwoDRow);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.TwoDRow.TITLE = 'TwoDRow';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.TwoDRow.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.TwoDRow.ID_PREFIX =  'xiv.ui.layouts.TwoDRow';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.layouts.TwoDRow.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
}




/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_X = function(){
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
xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Y = function(){
    goog.base(this, 'setupLayoutFrame_Y');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('Y', ['RIGHT']);
    
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
 * @inheritDoc
 */
xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Z = function(){
    goog.base(this, 'setupLayoutFrame_Z');

    // Do nothing for now
}


/**
 * @param {Function=};
 * @private
 */
xiv.ui.layouts.TwoDRow.prototype.onXYLayoutFrameResize_ = function(callback){
    this.calcDims();

    var xSize = goog.style.getSize(this.LayoutFrames['X'].getElement());
    var ySize = goog.style.getSize(this.LayoutFrames['Y'].getElement());
    var zSize = goog.style.getSize(this.LayoutFrames['Z'].getElement());

    //
    // Determine delta by tallying all the sizes
    //
    var deltaX = xSize.width + ySize.width + zSize.width - this.currSize.width;
    
    callback(xSize, ySize, zSize, deltaX)
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_X = function(e){
    this.onXYLayoutFrameResize_(function(xSize, ySize, zSize, deltaX){
	var yWidth = Math.max(this.currSize.width - xSize.width - zSize.width, 
			      this.minLayoutFrameWidth_);
	var xTop = this.currSize.height - xSize.height

	//
	// Y LayoutFrame
	//
	goog.style.setPosition(this.LayoutFrames['Y'].getElement(), 
			       xSize.width, xTop);
	goog.style.setSize(this.LayoutFrames['Y'].getElement(), 
			   yWidth, xSize.height);

	//
	// Z LayoutFrame
	//
	goog.style.setPosition(this.LayoutFrames['Z'].getElement(), 
			       xSize.width + yWidth, xTop);
	goog.style.setSize(this.LayoutFrames['Z'].getElement(), 
			   zSize.width, xSize.height);
	

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
xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_Y = function(e){
    this.onXYLayoutFrameResize_(function(xSize, ySize, zSize, deltaX){
	var yTop = this.currSize.height - ySize.height

	//
	// X LayoutFrame
	//
	goog.style.setPosition(this.LayoutFrames['X'].getElement(), 
			       0, yTop);
	goog.style.setSize(this.LayoutFrames['X'].getElement(), 
			   xSize.width, ySize.height);

	//
	// Z LayoutFrame
	//
	goog.style.setPosition(this.LayoutFrames['Z'].getElement(), 
			       xSize.width + ySize.width, yTop);
	goog.style.setSize(this.LayoutFrames['Z'].getElement(), 
			   this.currSize.width - xSize.width - ySize.width, 
			   ySize.height);

    }.bind(this))

    //
    // Dispatch
    //
    this.dispatchResize();
}




/**
* @inheritDoc
*/
xiv.ui.layouts.TwoDRow.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');

    this.updateXyzWidths_();
    this.updateXyzHeights_();
    this.updateStyle_X();
    this.updateStyle_Y();
    this.updateStyle_Z();
}



/**
 * @private
 */
xiv.ui.layouts.TwoDRow.prototype.updateXyzHeights_ = function() {
    var currHeight = this.currSize.height.toString() + 'px';
    this.loopXyz(function(frame, key){
	frame.getElement().style.height = currHeight;
    })
}



/**
 * @private
 */
xiv.ui.layouts.TwoDRow.prototype.updateXyzWidths_ = function() {
    var frameSize;
    var widthDiff = 1 - ((this.prevSize.width - this.currSize.width) / 
			 this.prevSize.width);

    if (this.prevSize.width !== this.currSize.width) {
	this.loopXyz(function(frame, key){
	    frameSize = goog.style.getSize(frame.getElement());
	    newWidth =
	    frame.getElement().style.width =  
		Math.max(frameSize.width * widthDiff, 
			 this.minLayoutFrameWidth_).toString() + 'px';
	}.bind(this))
    }
}



/**
 * @param {!string} Either or the X or Y plane string.
 * @private
 */
xiv.ui.layouts.TwoDRow.prototype.updateStyle_XY_ = function(plane) {

    var boundaryElt = this.LayoutFrames[plane].getResizable().
	getBoundaryElement(); 
    var planePos = goog.style.getPosition(this.LayoutFrames[plane].
					  getElement());
    var planeSize = goog.style.getSize(this.LayoutFrames[plane].
				       getElement());

    //
    // Boundary
    //
    goog.style.setPosition(boundaryElt, 
			   parseInt(boundaryElt.style.left), 
			   this.minLayoutFrameHeight_);
    goog.style.setSize(boundaryElt, 
		       this.currSize.width - this.minLayoutFrameWidth_ * 3,
		       this.currSize.height - this.minLayoutFrameHeight_ * 2);


    //
    // Right Handle
    //
    var rightHandle = this.LayoutFrames[plane].getResizable().getHandle('RIGHT')
    goog.style.setPosition(rightHandle, planePos.x + planeSize.width, 
			   planePos.y);
    goog.style.setHeight(rightHandle, 
			 this.currSize.height);

    
    //
    // IMPORTANT!!
    //
    this.LayoutFrames[plane].getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDRow.prototype.updateStyle_X = function() {
    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
	this.LayoutFrames['X'].getResizable().getBoundaryElement(), {
	    'left': this.minLayoutFrameWidth_
	})

    //
    // Call common
    //
    this.updateStyle_XY_('X');
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDRow.prototype.updateStyle_Y = function() {
    //
    // Set the left of the frame
    //
    this.LayoutFrames['Y'].getElement().style.left = 
	this.LayoutFrames['X'].getElement().style.width


    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
	this.LayoutFrames['Y'].getResizable().getBoundaryElement(), {
	    'left': this.minLayoutFrameWidth_ * 2
	})

    //
    // Call common
    //
    this.updateStyle_XY_('Y');
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.TwoDRow.prototype.updateStyle_Z = function() {
    this.LayoutFrames['Z'].getElement().style.left = 
	(parseInt(this.LayoutFrames['X'].getElement().style.width) + 
	 parseInt(this.LayoutFrames['Y'].getElement().style.width)).toString() +
	'px';
}



goog.exportSymbol('xiv.ui.layouts.TwoDRow.TITLE',
	xiv.ui.layouts.TwoDRow.TITLE);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.EventType',
	xiv.ui.layouts.TwoDRow.EventType);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.ID_PREFIX',
	xiv.ui.layouts.TwoDRow.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.CSS_SUFFIX',
	xiv.ui.layouts.TwoDRow.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_X',
	xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_X);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Y',
	xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Y);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Z',
	xiv.ui.layouts.TwoDRow.prototype.setupLayoutFrame_Z);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_X',
	xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_X);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_Y',
	xiv.ui.layouts.TwoDRow.prototype.onLayoutFrameResize_Y);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.updateStyle',
	xiv.ui.layouts.TwoDRow.prototype.updateStyle);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.updateStyle_X',
	xiv.ui.layouts.TwoDRow.prototype.updateStyle_X);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.updateStyle_Y',
	xiv.ui.layouts.TwoDRow.prototype.updateStyle_Y);
goog.exportSymbol('xiv.ui.layouts.TwoDRow.prototype.updateStyle_Z',
	xiv.ui.layouts.TwoDRow.prototype.updateStyle_Z);


