/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// moka
goog.require('moka.string');

// xiv
goog.require('xiv.ui.XyzvLayout');



/**
 * xiv.ui.FourUp
 *
 * @constructor
 * @extends {xiv.ui.XyzvLayout}
 */
goog.provide('xiv.ui.FourUp');
xiv.ui.FourUp = function() { 
    goog.base(this); 
}
goog.inherits(xiv.ui.FourUp, xiv.ui.XyzvLayout);
goog.exportSymbol('xiv.ui.FourUp', xiv.ui.FourUp);



/**
 * @type {!string}
 * @public
 */
xiv.ui.FourUp.TITLE = 'Four-Up';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.FourUp.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.FourUp.ID_PREFIX =  'xiv.ui.FourUp';



/**
 * @enum {string}
 * @public
 */
xiv.ui.FourUp.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v'
}



/**
 * @type {!number} 
 * @const
 */
xiv.ui.FourUp.MAX_PLANE_RESIZE_PCT = .9;



/**
 * @type {!number} 
 * @private
 */
xiv.ui.FourUp.prototype.bottomPlaneWidth_ = 0;



/**
 * @inheritDoc
 */
xiv.ui.FourUp.prototype.setupPlane_X = function(){
    goog.base(this, 'setupPlane_X');

    goog.dom.classes.add(this.Planes['X'].getElement(), 
			 xiv.ui.FourUp.CSS.X);

    this.Planes['X'].setResizeDirections(['TOP', 'RIGHT']);

    this.Planes['X'].getResizable().getDragElt('TOP').style.cursor =  
	'ns-resize';

    this.Planes['X'].getResizable().getDragElt('RIGHT').style.cursor =  
	'ew-resize';

    goog.events.listen(this.Planes['X'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_X.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.FourUp.prototype.setupPlane_Y = function(){
    goog.base(this, 'setupPlane_Y');

    goog.dom.classes.add(this.Planes['Y'].getElement(), 
			 xiv.ui.FourUp.CSS.Y);
}



/**
 * @inheritDoc
 */
xiv.ui.FourUp.prototype.setupPlane_Z = function(){
    goog.base(this, 'setupPlane_Z');

    goog.dom.classes.add(this.Planes['Z'].getElement(), 
			 xiv.ui.FourUp.CSS.Z);
}



/**
 * @inheritDoc
 */
xiv.ui.FourUp.prototype.setupPlane_V = function(){
    goog.base(this, 'setupPlane_V');

    goog.dom.classes.add(this.Planes['V'].getElement(), 
			 xiv.ui.FourUp.CSS.V);

    this.Planes['V'].setResizeDirections(['LEFT', 'BOTTOM', 'BOTTOM_LEFT']);

    this.Planes['V'].getResizable().getDragElt('LEFT').style.cursor =  
	'ew-resize';
    this.Planes['V'].getResizable().getDragElt('BOTTOM').style.cursor =  
	'ns-resize';
    this.Planes['V'].getResizable().getDragElt('BOTTOM_LEFT').style.cursor =  
	'move';

    this.Planes['V'].getElement().style.zIndex =  1000;

    goog.events.listen(this.Planes['V'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_V.bind(this));
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.FourUp.prototype.onPlaneResize_X = function(e){

    // Y Plane
    moka.style.setStyle(this.Planes['Y'].getElement(), {
	'width': this.currSize.width - e.size.width,
	'height': e.size.height,
	'left': e.size.width, 
	'top': e.pos.y
    });

    // Z Plane
    moka.style.setStyle(this.Planes['Z'].getElement(), {
	'height': this.currSize.height - e.size.height,
	'width': e.size.width, 
    });

    // V Plane
    moka.style.setStyle(this.Planes['V'].getElement(), {
	'left': e.size.width,
	'width': this.currSize.width - e.size.width,
	'height': this.currSize.height - e.size.height,
    });

    this.dispatchEvent({
	type: xiv.ui.Layout.EventType.RESIZE
    })
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.FourUp.prototype.onPlaneResize_V = function(e){
    // X Plane
    moka.style.setStyle(this.Planes['X'].getElement(), {
	'width': this.currSize.width - e.size.width,
	'height': this.currSize.height - e.size.height,
	'top':  e.size.height
    });

    // Y Plane
    moka.style.setStyle(this.Planes['Y'].getElement(), {
	'height': this.currSize.height - e.size.height,
	'width': e.size.width, 
	'left': e.pos.x,
	'top': e.size.height
    });

    // Z Plane
    moka.style.setStyle(this.Planes['Z'].getElement(), {
	'width': this.currSize.width - e.size.width,
	'height': e.size.height,
    });

    this.dispatchEvent({
	type: xiv.ui.Layout.EventType.RESIZE
    })
}




/**
 * @inheritDoc
 */
xiv.ui.FourUp.prototype.updateStyle_X = function() {
    this.Planes['X'].getResizable().setMinHeight(this.resizeMargin);
    this.Planes['X'].getResizable().setMinWidth(this.resizeMargin);
    this.Planes['X'].getResizable().setBounds(
	0, this.resizeMargin, // topLeft X, topLeft Y
	this.currSize.width - this.resizeMargin, // botRight X
	this.currSize.height);// botRightY
    //this.Planes['X'].getResizable().showBoundaryElt();
}



/**
* @private
*/
xiv.ui.FourUp.prototype.updateStyle_V = function() {
    this.Planes['V'].getResizable().setMinHeight(this.resizeMargin);
    this.Planes['V'].getResizable().setMinWidth(this.resizeMargin);
    this.Planes['V'].getResizable().setBounds(
	this.resizeMargin, 0, // topLeft X, topLeft Y
	this.currSize.width, // botRight X
	this.currSize.height - this.resizeMargin);// botRightY
    //this.Planes['V'].getResizable().showBoundaryElt();
}



/**
* @inheritDoc
*/
xiv.ui.FourUp.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    window.console.log("Need to implement disposeInternal for: " + 
		       this.constructor.ID_PREFIX);
}
