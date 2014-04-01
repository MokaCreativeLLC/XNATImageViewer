/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.Plane');




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

    this.addInteractors_();

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
    V: 'v'
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

    FRAMENUMBER: 'framenumber',
}



/**
 * @type {!number}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.resizeMargin = 0;



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addPlanes_ = function(){
    var planeTitle = /**@type {!string}*/ '';
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 
	function(title, key){
	    planeTitle = title.toUpperCase();
	    this.addPlane(new xiv.ui.Plane(planeTitle));
	    goog.dom.append(this.getElement(), 
			    this.Planes[planeTitle].getElement());
	    goog.dom.classes.add(this.Planes[planeTitle].getElement(), 
				 xiv.ui.layouts.XyzvLayout.CSS[key])
	}.bind(this))
}



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addInteractors_ = function() {
    this.addPlaneSliders_();
    this.addFrameDisplayers_();
    //this.addCrossHairs_();
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addPlaneSliders_ = function(){    
    this.loopXyz(function(Plane, key) {			
	    var slider = /**@type {!moka.ui.GenericSlider}*/
	    new moka.ui.GenericSlider('horizontal');

	    slider.getElement().id = key + "_PlaneSlider_" +
		goog.string.createUniqueString();


	    Plane[xiv.ui.layouts.Layout.INTERACTORS.SLIDER] = slider;


	    goog.dom.append(Plane.getElement(), slider.getElement());

	    goog.dom.classes.addRemove(slider.getElement(), null,
				       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER]);
	    
	    goog.dom.classes.addRemove(slider.getThumb(), null,
			[xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB]);

	    goog.dom.classes.addRemove(slider.getTrack(), null,
			[xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK ,
			 goog.getCssName(
			     xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK, 
			 key.toLowerCase())]);
			 
            slider.addThumbHoverClass(
	        xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB_HOVERED);

    }.bind(this));
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addFrameDisplayers_ = function(){
    this.loopXyz(function(Plane, key) {	
		
	var numberElt = /**@type {!Element}*/
	goog.dom.createDom('div', {});
	numberElt.style.color = 'rgba(255,255,255)';

	Plane[xiv.ui.layouts.Layout.INTERACTORS.DISPLAY] = numberElt;

	goog.dom.append(Plane.getElement(), numberElt);

	goog.events.listen(
	    Plane[xiv.ui.layouts.Layout.INTERACTORS.SLIDER],
 
	    moka.ui.GenericSlider.EventType.SLIDE, function(e){
		numberElt.innerHTML = e.value.toString() + '/' + 
		    e.maximum.toString();

	}.bind(this))

	goog.dom.classes.addRemove(numberElt, null,
			[xiv.ui.layouts.XyzvLayout.CSS.FRAMENUMBER]);

    }.bind(this));
};



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loopXyz = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 
	function(plane, key) {	
	    plane = plane.toUpperCase();
	    if (plane == 'V') { return };
	    callback(this.Planes[plane], plane);
	}.bind(this))
};



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loop = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 
	function(plane, key) {	
	    plane = plane.toUpperCase();
	    callback(this.Planes[plane], plane);
	}.bind(this))
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_X = function(){
 
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Y = function(){

};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupPlane_Z = function(){

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



/**
* @inheritDoc
*/
xiv.ui.layouts.XyzvLayout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    window.console.log("Need to implement disposeInternal for: " + 
		       this.constructor.ID_PREFIX);
    
    delete this.resizeMargin;
    
}




