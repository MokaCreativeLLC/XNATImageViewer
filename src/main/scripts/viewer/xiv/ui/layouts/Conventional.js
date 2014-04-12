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
xiv.ui.layouts.Conventional.EventType = {
}



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
    V: 'v'
}



/**
 * @type {!number} 
 * @const
 */
xiv.ui.layouts.Conventional.MAX_PLANE_RESIZE_PCT = .9;



/**
 * @type {!number} 
 * @private
 */
xiv.ui.layouts.Conventional.prototype.bottomPlaneWidth_ = 0;



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_X = function(){
    goog.base(this, 'setupPlane_X');
    
    goog.dom.classes.add(this.Planes['X'].getElement(), 
			 xiv.ui.layouts.Conventional.CSS.X);

    window.console.log("NEED TO SET RESIZE FOR CONVEIONAL X!");
    return;
    //this.Planes['X'].setResizeDirections(['RIGHT', 'TOP_RIGHT']);


    goog.events.listen(this.Planes['X'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_X.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_Y = function(){
    goog.base(this, 'setupPlane_Y');

    goog.dom.classes.add(this.Planes['Y'].getElement(), 
			 xiv.ui.layouts.Conventional.CSS.Y);

    window.console.log("NEED TO SET RESIZE FOR CONVEIONAL Y!");
    return;

    this.Planes['Y'].setResizeDirections(['RIGHT', 'TOP_RIGHT']);

    this.Planes['Y'].getResizable().getDragElt('RIGHT').style.cursor =  
	'ew-resize';

    this.Planes['Y'].getResizable().getDragElt('TOP_RIGHT').style.cursor =  
	'move';

    goog.events.listen(this.Planes['Y'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_Y.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_Z = function(){
    goog.base(this, 'setupPlane_Z');
    goog.dom.classes.add(this.Planes['Z'].getElement(), 
			 xiv.ui.layouts.Conventional.CSS.Z);
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupPlane_V = function(){
    goog.base(this, 'setupPlane_V');
    goog.dom.classes.add(this.Planes['V'].getElement(), 
			 xiv.ui.layouts.Conventional.CSS.V);

    window.console.log("NEED TO SET RESIZE FOR CONVEIONAL V!");
    return;

    this.Planes['V'].setResizeDirections(['BOTTOM']);

    this.Planes['V'].getResizable().getDragElt('BOTTOM').style.cursor =  
	'ns-resize';

    // This plane's dragger handle should get priority.
    this.Planes['V'].getResizable().getDragElt('BOTTOM').style.zIndex =  
	'100';

    goog.events.listen(this.Planes['V'].getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
		       this.onPlaneResize_V.bind(this));
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onPlaneResize_X = function(e){

    this.bottomPlaneWidth_ = (this.currSize.width - e.size.width) / 2;

    // Y Plane
    moka.style.setStyle(this.Planes['Y'].getElement(), {
	'height': e.size.height,
	'left': e.size.width, 
	'top': e.pos.y
    });

    // Z Plane
    moka.style.setStyle(this.Planes['Z'].getElement(), {
	'width': this.bottomPlaneWidth_, 
	'height': e.size.height,
	'left': this.currSize.width - this.bottomPlaneWidth_, 
	'top': e.pos.y
    });

    // V Plane
    moka.style.setStyle(this.Planes['V'].getElement(), {
	'height': this.currSize.height - e.size.height,
    });

}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onPlaneResize_Y = function(e){

    this.bottomPlaneWidth_ = (this.currSize.width - e.size.width) / 2;

    // X Plane
    moka.style.setStyle(this.Planes['X'].getElement(), {
	'height': e.size.height,
	'left': 0, 
	'top': e.pos.y
    });

    // Z Plane
    moka.style.setStyle(this.Planes['Z'].getElement(), {
	'width': this.bottomPlaneWidth_, 
	'height': e.size.height,
	'left': e.pos.x + e.size.width, 
	'top': e.pos.y
    });

    // V Plane
    moka.style.setStyle(this.Planes['V'].getElement(), {
	'height': this.currSize.height - e.size.height,
    });

}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onPlaneResize_V = function(e){
    //window.console.log(this.Planes['V'].getResizable().getMinHeight());
    goog.object.forEach(this.Planes, function(plane){
	if (plane === this.Planes['V']) {return};
	moka.style.setStyle(plane.getElement(), {
	    'height': this.currSize.height - e.size.height,
	    'top': e.size.height
	})
    }.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_X = function() {
    return;
    this.Planes['X'].getResizable().setMinHeight(this.resizeMargin);
    this.Planes['X'].getResizable().setMinWidth(this.resizeMargin);
    this.Planes['X'].getResizable().setBounds(
	0, this.resizeMargin, // topLeft X, topLeft Y
	this.currSize.width - this.resizeMargin*2, // botRight X
	this.currSize.height);// botRightY
    //this.Planes['X'].getResizable().showBoundaryElt();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_Y = function() {
    return;
    window.console.log(this.Planes);
    this.Planes['Y'].getResizable().setMinHeight(this.resizeMargin);
    this.Planes['Y'].getResizable().setMinWidth(this.resizeMargin);
    this.Planes['Y'].getResizable().setBounds(
	this.resizeMargin, this.resizeMargin, // topLeft X, topLeft Y
	this.currSize.width - this.resizeMargin, // botRight X
	this.currSize.height);// botRightY

    //this.Planes['Y'].getResizable().showBoundaryElt();
}



/**
* @private
*/
xiv.ui.layouts.Conventional.prototype.updateStyle_V = function() {
    return;
    this.Planes['V'].getResizable().setMinHeight(
	this.currSize.height * 
	    (1-xiv.ui.layouts.Conventional.MAX_PLANE_RESIZE_PCT));

    this.Planes['V'].getResizable().setBounds(
	0, 0, // topLeft X, topLeft Y
	this.currSize.width, // botRight X
	this.currSize.height * 
	    xiv.ui.layouts.Conventional.MAX_PLANE_RESIZE_PCT);// botRightY

    //this.Planes['V'].getResizable().showBoundaryElt();
}




