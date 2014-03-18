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
xiv.ui.layouts.XyzvLayout.PLANES = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v',
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v',
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVERED: 'slider-thumb-hovered',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_X: 'slider-track-x',
    SLIDER_TRACK_Y: 'slider-track-y',
    SLIDER_TRACK_Z: 'slider-track-z',
}



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addPlanes_ = function(){
    var planeTitle = /**@type {!string}*/ '';
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 

	function(title, key){

	    window.console.log(xiv.ui.layouts.XyzvLayout.CSS);

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
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_X = function(){
    var slider = new moka.ui.GenericSlider('horizontal');

    goog.dom.append(this.Planes['X'].getElement(), 
		    slider.getElement());

    goog.dom.classes.addRemove(slider.getElement(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER]);

    goog.dom.classes.addRemove(slider.getThumb(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB]);

    goog.dom.classes.addRemove(slider.getTrack(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK ,
				xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK_X]);

    slider.setHoverClasses(xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB_HOVERED);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Y = function(){
    var slider = new moka.ui.GenericSlider('horizontal');

    goog.dom.append(this.Planes['Y'].getElement(), 
		    slider.getElement());

    goog.dom.classes.addRemove(slider.getElement(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER]);

    goog.dom.classes.addRemove(slider.getThumb(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB]);

    goog.dom.classes.addRemove(slider.getTrack(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK ,
				xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK_Y]);

    slider.setHoverClasses(xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB_HOVERED);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Z = function(){
    var slider = new moka.ui.GenericSlider('horizontal');

    goog.dom.append(this.Planes['Z'].getElement(), 
		    slider.getElement());

    goog.dom.classes.addRemove(slider.getElement(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER]);

    goog.dom.classes.addRemove(slider.getThumb(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB]);

    goog.dom.classes.addRemove(slider.getTrack(), null,
			       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK ,
				xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK_Z]);

    slider.setHoverClasses(xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB_HOVERED);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_V = function(){

};



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
