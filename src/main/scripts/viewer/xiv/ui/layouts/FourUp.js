/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// moka
goog.require('moka.string');

// xiv
goog.require('xiv.ui.layouts.XyzvLayout');



/**
 * xiv.ui.layouts.FourUp
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.FourUp');
xiv.ui.layouts.FourUp = function() { 
    goog.base(this); 
}
goog.inherits(xiv.ui.layouts.FourUp, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.FourUp', xiv.ui.layouts.FourUp);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.FourUp.TITLE = 'Four-Up';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.FourUp.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.FourUp.ID_PREFIX =  'xiv.ui.layouts.FourUp';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.FourUp.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v'
}



/**
 * @type {!number} 
 * @const
 */
xiv.ui.layouts.FourUp.MIN_PLANE_WIDTH = 20;



/**
 * @type {!number} 
 * @const
 */
xiv.ui.layouts.FourUp.MIN_PLANE_HEIGHT = 20;



/**
 * @inheritDoc
 */
xiv.ui.layouts.FourUp.prototype.setupPlane_X = function(){
    goog.base(this, 'setupPlane_X');

    //
    // Set the plane resizable
    //
    this.setPlaneResizable('X', ['RIGHT', 'TOP', 'TOP_RIGHT']);

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
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.FourUp.prototype.onPlaneResize_X = function(e){

    var planePos = goog.style.getPosition(this.Planes['X'].getElement());
    var planeSize = goog.style.getSize(this.Planes['X'].getElement());


    //
    // Y PLANE
    //
    goog.style.setPosition(
	this.Planes['Y'].getElement(), 
	planeSize.width,
	planePos.y);
    goog.style.setSize(
	this.Planes['Y'].getElement(), 
	this.currSize.width - planeSize.width,
	planeSize.height);


    //
    // Z PLANE
    //
    goog.style.setPosition(
	this.Planes['Z'].getElement(), 0, 0);
    goog.style.setSize(
	this.Planes['Z'].getElement(), planeSize.width, planePos.y);



    //
    // V PLANE
    //
    goog.style.setPosition( this.Planes['V'].getElement(), 
			    planeSize.width, 0);
    goog.style.setSize(this.Planes['V'].getElement(), 
	this.currSize.width - planeSize.width, planePos.y);


    //
    // CHEAT Make the X RIGHT handle 100% of the height
    //
    var xRightHandle = 
	this.Planes['X'].getResizable().getResizeDragger('RIGHT').getHandle();
    xRightHandle.style.top = '0px';
    xRightHandle.style.height = (this.currSize.height).toString() + 'px';


    //
    // Required!
    //
    this.dispatchResize();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.FourUp.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    this.updateStyle_X();
}


/**
 * @inheritDoc
 */
xiv.ui.layouts.FourUp.prototype.updateStyle_X = function() {
    //
    // Boundary
    //
    goog.style.setPosition(
	this.Planes['X'].getResizable().getBoundaryElement(), 
	this.minPlaneWidth_, this.minPlaneHeight_);

    goog.style.setSize(
	this.Planes['X'].getResizable().getBoundaryElement(), 
	this.currSize.width - this.minPlaneWidth_ * 2,
	this.currSize.height - this.minPlaneHeight_ * 2);

    //
    // Make the X TOP handle 100% of the width
    //
    var xTopHandle = 
	this.Planes['X'].getResizable().getResizeDragger('TOP').getHandle();
    xTopHandle.style.left = '0px';
    xTopHandle.style.width = (this.currSize.width).toString() + 'px';


    //
    // IMPORTANT!!!
    //
    this.Planes['X'].getResizable().update();


    //
    // CHEAT Make the X RIGHT handle 100% of the height
    //
    var xRightHandle = 
	this.Planes['X'].getResizable().getResizeDragger('RIGHT').getHandle();
    xRightHandle.style.top = '0px';
    xRightHandle.style.height = (this.currSize.height).toString() + 'px';
}



/**
* @inheritDoc
*/
xiv.ui.layouts.FourUp.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    
}
