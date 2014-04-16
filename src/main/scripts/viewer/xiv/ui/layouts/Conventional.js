/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// moka
goog.require('moka.string');

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
xiv.ui.layouts.Conventional.prototype.setupPlane_X = function(){
    goog.base(this, 'setupPlane_X');
    
    //
    // Set the plane resizable
    //
    this.setPlaneResizable('X', ['RIGHT', 'TOP_RIGHT']);
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.Planes['X'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_X.bind(this));

    goog.events.listen(this.Planes['X'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_Y = function(){
    goog.base(this, 'setupPlane_Y');

    //
    // Set the plane resizable
    //
    this.setPlaneResizable('Y', ['RIGHT', 'TOP_RIGHT']);
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.Planes['Y'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_Y.bind(this));

    goog.events.listen(this.Planes['Y'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_Z = function(){
    goog.base(this, 'setupPlane_Z');

    // Do nothing for now
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_V = function(){
    goog.base(this, 'setupPlane_V');

    //
    // Set the plane resizable
    //
    this.setPlaneResizable('V', 'BOTTOM');
    
    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.Planes['V'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_V.bind(this));


    goog.events.listen(this.Planes['V'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE_END,
		       this.updateStyle.bind(this));
}


/**
 * @param {Function=};
 * @private
 */
xiv.ui.layouts.Conventional.prototype.onXYPlaneResize_ = function(callback){
    this.calcDims();

    var xSize = goog.style.getSize(this.Planes['X'].getElement());
    var ySize = goog.style.getSize(this.Planes['Y'].getElement());
    var zSize = goog.style.getSize(this.Planes['Z'].getElement());

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
xiv.ui.layouts.Conventional.prototype.onPlaneResize_X = function(e){
    this.onXYPlaneResize_(function(xSize, ySize, zSize, deltaX){
	var yWidth = Math.max(this.currSize.width - xSize.width - zSize.width, 
			      xiv.ui.layouts.Conventional.MIN_PLANE_WIDTH);
	var xTop = this.currSize.height - xSize.height

	//
	// Y Plane
	//
	goog.style.setPosition(this.Planes['Y'].getElement(), 
			       xSize.width, xTop);
	goog.style.setSize(this.Planes['Y'].getElement(), 
			   yWidth, xSize.height);

	//
	// Z Plane
	//
	goog.style.setPosition(this.Planes['Z'].getElement(), 
			       xSize.width + yWidth, xTop);
	goog.style.setSize(this.Planes['Z'].getElement(), 
			   zSize.width, xSize.height);
			   

	//
	// V Plane
	//
	goog.style.setSize(this.Planes['V'].getElement(), 
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
xiv.ui.layouts.Conventional.prototype.onPlaneResize_Y = function(e){
    this.onXYPlaneResize_(function(xSize, ySize, zSize, deltaX){
	var yTop = this.currSize.height - ySize.height

	//
	// X Plane
	//
	goog.style.setPosition(this.Planes['X'].getElement(), 
			       0, yTop);
	goog.style.setSize(this.Planes['X'].getElement(), 
			   xSize.width, ySize.height);

	//
	// Z Plane
	//
	goog.style.setPosition(this.Planes['Z'].getElement(), 
			       xSize.width + ySize.width, yTop);
	goog.style.setSize(this.Planes['Z'].getElement(), 
			   this.currSize.width - xSize.width - ySize.width, 
			   ySize.height);
			   

	//
	// V Plane
	//
	goog.style.setSize(this.Planes['V'].getElement(), 
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
xiv.ui.layouts.Conventional.prototype.onPlaneResize_V = function(e){
    this.calcDims();
    var xyzTop = parseInt(this.Planes['V'].getElement().style.height);
    var xyzHeight = this.currSize.height - xyzTop;

    goog.object.forEach(this.Planes, function(plane){
	//
	// Skip V
	//
	if (plane === this.Planes['V']) {return};

	//
	// Adjust others
	//
	moka.style.setStyle(plane.getElement(), {
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
   
    var vHandle = this.Planes['V'].getResizable().getResizeDragger('BOTTOM');
    var boundaryElt = this.Planes[plane].getResizable().getBoundaryElement(); 
    var planePos = goog.style.getPosition(this.Planes[plane].getElement());
    var planeSize = goog.style.getSize(this.Planes[plane].getElement());

    //
    // Boundary
    //
    goog.style.setPosition(boundaryElt, 
			   parseInt(boundaryElt.style.left), 
			   this.minPlaneHeight_);
    goog.style.setSize(boundaryElt, 
		       this.currSize.width - this.minPlaneWidth_ * 3,
		       this.currSize.height - this.minPlaneHeight_ * 2);


    //
    // Right Handle
    //
    var rightHandle = this.Planes[plane].getResizable().getHandle('RIGHT')
    goog.style.setPosition(rightHandle, planePos.x + planeSize.width, 
			   planePos.y);
    goog.style.setHeight(rightHandle, 
			 this.currSize.height - vHandle.handlePos.y);

    window.console.log("HEIGHT", this.currSize.height , vHandle.handlePos.y);
    //
    // Top-right handle
    //
    goog.style.setPosition(
	this.Planes[plane].getResizable().getHandle('TOP_RIGHT'), 
	planePos.x + planeSize.width, 
	planePos.y);
    
    //
    // IMPORTANT!!
    //
    this.Planes[plane].getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_X = function() {
    //
    // Set the left of the boundary
    //
    moka.style.setStyle(
	this.Planes['X'].getResizable().getBoundaryElement(), {
	    'left': this.minPlaneWidth_
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
    moka.style.setStyle(
	this.Planes['Y'].getResizable().getBoundaryElement(), {
	    'left': this.minPlaneWidth_ * 2
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
    var topHandle = this.Planes['V'].getResizable().getHandle('BOTTOM')
    goog.style.setPosition(topHandle, 
        0,  goog.style.getSize(this.Planes['V'].getElement()).height);
    goog.style.setWidth(topHandle, this.currSize.width)


    //
    // Boundary
    //
    goog.style.setPosition(
	this.Planes['V'].getResizable().getBoundaryElement(), 
	this.currSize.width,
	this.minPlaneHeight_);

    goog.style.setSize(
	this.Planes['V'].getResizable().getBoundaryElement(), 
	this.currSize.width - this.minPlaneWidth_ * 3,
	this.currSize.height - this.minPlaneHeight_ * 2);

    //
    // IMPORTANT!!
    //
    this.Planes['V'].getResizable().update();
}








