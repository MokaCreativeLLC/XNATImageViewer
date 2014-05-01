/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// nrg
goog.require('nrg.string');

// xiv
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.XyzvLayout');



/**
 * xiv.ui.layouts.Conventional
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.Conventional');
xiv.ui.layouts.Conventional = function() { 
    goog.base(this); 
}
goog.inherits(xiv.ui.layouts.Conventional, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.Conventional', xiv.ui.layouts.Conventional);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.Conventional.TITLE = 'Conventional';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Conventional.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Conventional.ID_PREFIX =  'xiv.ui.layouts.Conventional';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Conventional.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v',
    V_BOUNDARY: 'v-boundary'
}



/**
 * @type {!number} 
 * @const
 */
xiv.ui.layouts.Conventional.MIN_PLANE_WIDTH = 20;



/**
 * @type {!number} 
 * @const
 */
xiv.ui.layouts.Conventional.MIN_PLANE_HEIGHT = 20;



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_X = function(){
    goog.base(this, 'setupLayoutFrame_X');
    
    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('X', ['RIGHT', 'TOP_RIGHT']);
    
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
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Y = function(){
    goog.base(this, 'setupLayoutFrame_Y');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('Y', ['RIGHT', 'TOP_RIGHT']);
    
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
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Z = function(){
    goog.base(this, 'setupLayoutFrame_Z');

    // Do nothing for now
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_V = function(){
    goog.base(this, 'setupLayoutFrame_V');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('V', 'BOTTOM');
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['V'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE,
		       this.onLayoutFrameResize_V.bind(this));


    goog.events.listen(this.LayoutFrames['V'].getResizable(), 
		       nrg.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}


/**
 * @param {Function=};
 * @private
 */
xiv.ui.layouts.Conventional.prototype.onXYLayoutFrameResize_ = 
function(callback){
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
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_X = function(e){
    this.onXYLayoutFrameResize_(function(xSize, ySize, zSize, deltaX){
	var yWidth = Math.max(this.currSize.width - xSize.width - zSize.width, 
			      xiv.ui.layouts.Conventional.MIN_PLANE_WIDTH);
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
			   

	//
	// V LayoutFrame
	//
	goog.style.setSize(this.LayoutFrames['V'].getElement(), 
			   this.currSize.width, 
			   this.currSize.height - xSize.height);
	

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
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_Y = function(e){
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
			   

	//
	// V LayoutFrame
	//
	goog.style.setSize(this.LayoutFrames['V'].getElement(), 
			   this.currSize.width, 
			   this.currSize.height - ySize.height);
	

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
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_V = function(e){
    this.calcDims();
    var xyzTop = parseInt(this.LayoutFrames['V'].getElement().style.height);
    var xyzHeight = this.currSize.height - xyzTop;

    goog.object.forEach(this.LayoutFrames, function(plane){
	//
	// Skip V
	//
	if (plane === this.LayoutFrames['V']) {return};

	//
	// Adjust others
	//
	nrg.style.setStyle(plane.getElement(), {
	    'top': xyzTop,
	    'height': xyzHeight
	}) 
    }.bind(this))

    //
    // Update
    //
    this.updateStyle_X();
    this.updateStyle_Y();

    //
    // Required!
    //
    this.dispatchResize();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.Conventional.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');

    this.updateStyle_V();
    this.updateStyle_X();
    this.updateStyle_Y();
    this.updateStyle_Z();
}



/**
 * @param {!string} Either or the X or Y plane string.
 * @private
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_XY_ = function(plane) {
   
    var vHandle = this.LayoutFrames['V'].getResizable().
	getResizeDragger('BOTTOM');
    var boundaryElt = this.LayoutFrames[plane].getResizable().
	getBoundaryElement(); 
    var planePos = goog.style.getPosition(this.LayoutFrames[plane].
					  getElement());
    var planeSize = goog.style.getSize(this.LayoutFrames[plane].getElement());

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
			 this.currSize.height - vHandle.handlePos.y);

    window.console.log("HEIGHT", this.currSize.height , vHandle.handlePos.y);
    //
    // Top-right handle
    //
    goog.style.setPosition(
	this.LayoutFrames[plane].getResizable().getHandle('TOP_RIGHT'), 
	planePos.x + planeSize.width, 
	planePos.y);
    
    //
    // IMPORTANT!!
    //
    this.LayoutFrames[plane].getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_X = function() {
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
xiv.ui.layouts.Conventional.prototype.updateStyle_Y = function() {
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
* @private
*/
xiv.ui.layouts.Conventional.prototype.updateStyle_V = function() {
    //
    // Top handle
    //
    var topHandle = this.LayoutFrames['V'].getResizable().getHandle('BOTTOM')
    goog.style.setPosition(topHandle, 
        0,  goog.style.getSize(this.LayoutFrames['V'].getElement()).height);
    goog.style.setWidth(topHandle, this.currSize.width)


    //
    // Boundary
    //
    goog.style.setPosition(
	this.LayoutFrames['V'].getResizable().getBoundaryElement(), 
	this.currSize.width,
	this.minLayoutFrameHeight_);

    goog.style.setSize(
	this.LayoutFrames['V'].getResizable().getBoundaryElement(), 
	this.currSize.width - this.minLayoutFrameWidth_ * 3,
	this.currSize.height - this.minLayoutFrameHeight_ * 2);

    //
    // IMPORTANT!!
    //
    this.LayoutFrames['V'].getResizable().update();
}






