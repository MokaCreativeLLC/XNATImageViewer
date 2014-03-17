/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.Plane');





/**
 * xiv.ui.layouts.XyzvLayout
 *
 * @constructor
 * @extends {xiv.ui.layouts.Layout}
 */
goog.provide('xiv.ui.layouts.XyzvLayout');
xiv.ui.layouts.XyzvLayout = function() { 
    goog.base(this);

    this.addPlanes_();

    this.setupPlane_X();
    this.setupPlane_Y();
    this.setupPlane_Z();
    this.setupPlane_V();

    this.updateStyle();
}
goog.inherits(xiv.ui.layouts.XyzvLayout, xiv.ui.layouts.Layout);
goog.exportSymbol('xiv.ui.layouts.XyzvLayout', xiv.ui.layouts.XyzvLayout);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.TITLE = 'XyzvLayout';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.XyzvLayout.ID_PREFIX =  'xiv.ui.layouts.XyzvLayout';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v'
}



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addPlanes_ = function(){
    var planeTitle = /**@type {!string}*/ '';
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.CSS_SUFFIX, 
	function(title, key){
	    planeTitle = title.toUpperCase();
	    this.addPlane(new xiv.ui.layouts.Plane(planeTitle));
	    goog.dom.append(this.getElement(), 
			    this.Planes[planeTitle].getElement());
	    goog.dom.classes.add(this.Planes[planeTitle].getElement(), 
				 xiv.ui.layouts.XyzvLayout.CSS[key])
	}.bind(this))
}



/**
 * @type {!number}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.resizeMargin = 0;



/**
 * Sets up the relevant plane.  Must be implemented by subclass.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_X = goog.nullFunction;



/**
 * Sets up the relevant plane.  Must be implemented by subclass.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Y = goog.nullFunction;



/**
 * Sets up the relevant plane.  Must be implemented by subclass.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Z = goog.nullFunction;



/**
 * Sets up the relevant plane.  Must be implemented by subclass.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_V = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onPlaneResize_X = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onPlaneResize_Y = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onPlaneResize_Z = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onPlaneResize_V = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.Layout.prototype.updateStyle_X = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.Layout.prototype.updateStyle_Z = goog.nullFunction;


/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.Layout.prototype.updateStyle_Y = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.Layout.prototype.updateStyle_V = goog.nullFunction;



/**
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');

    this.resizeMargin = this.currSize.height * 
	    (1-xiv.ui.layouts.Conventional.MAX_PLANE_RESIZE_PCT);

    this.updateStyle_X();
    this.updateStyle_Y();
    this.updateStyle_Z();
    this.updateStyle_V();
}
