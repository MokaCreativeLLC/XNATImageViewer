/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * viewer-widget includes
 */
goog.require('XtkPlane');




/**
 * XtkPlaneManager handles the four XtkPlanes that exists
 * within a current XtkDisplayer.  Rather than manage the individual
 * ViewPlane within the XtkDisplayer, this class was created to handle
 * the nuances of managing several Xtk planes: 
 *
 * @constructor
 @ @param {XtkDisplayer}
 */
goog.provide('XtkPlaneManager');
XtkPlaneManager = function(xtkDisplayer) {
  
    
    this.XtkPlaneV_ = /** @type {XtkPlane} @private */ new XtkPlane('v', xtkDisplayer, { 'parent': xtkDisplayer._element });
    this.XtkPlaneX_ = /** @type {XtkPlane} @private */ new XtkPlane('x', xtkDisplayer, { 'parent': xtkDisplayer._element }); 
    this.XtkPlaneY_ = /** @type {XtkPlane} @private */ new XtkPlane('y', xtkDisplayer, { 'parent': xtkDisplayer._element });
    this.XtkPlaneZ_ = /** @type {XtkPlane} @private */ new XtkPlane('z', xtkDisplayer, { 'parent': xtkDisplayer._element });
    this.xtkPlanes_ = /** @type {Array.XtkPlane}  @private */ [this.XtkPlaneV_, this.XtkPlaneX_, this.XtkPlaneY_, this.XtkPlaneZ_];
    this.xtkPlanes2D_ = /** @type {Array.XtkPlane}  @private */ [this.XtkPlaneX_, this.XtkPlaneY_, this.XtkPlaneZ_];

    this.allRenderedCallbacks_ = [];

}
goog.exportSymbol('XtkPlaneManager', XtkPlaneManager);




/**
 * @const 
 * @type {Array.string}
 */
XtkPlaneManager.ANATOMICAL_PLANES =  ['3D', 'Sagittal', 'Coronal', 'Transverse'];




/**
 * @const 
 * @type {Array.string}
 */
XtkPlaneManager.ANATOMICAL_PLANES_2D =  ['Sagittal', 'Coronal', 'Transverse'];




/**
 * @const 
 * @type {Array.string}
 */
XtkPlaneManager.PLANE_IDS = ['v', 'x', 'y', 'z'];




/**
 * @const 
 * @type {Array.string}
 */
XtkPlaneManager.PLANE_IDS_2D = ['x', 'y', 'z'];



/** 
 * Toggle only if there's no camera settings for 
 * the 3D Plane.
 *
 * @type {boolean}
 */
XtkPlaneManager.prototype.applyGenericCameraSettings = true;




/**
 * @type {Object.<string, Array.<number>>}
 * @private
 */
XtkPlaneManager.prototype.cameraSettings_ = {}




/**
 * @type {?Array.function}
 * @private
 */
XtkPlaneManager.prototype.allRenderedCallbacks_ = null;




/**
 * Converts the anatomical plane provided int he 'name' 
 * argument to the relevant XtkPlane id (x, y, z, or v).
 *
 * @type {!string}
 * @return {string}
 * @public
 */
XtkPlaneManager.prototype.anatomicalToId =  function (name){
    for (var i = 0, len = XtkPlaneManager.ANATOMICAL_PLANES.length; i < len; i++){
	if (XtkPlaneManager.ANATOMICAL_PLANES[i].toLowerCase() === name.toLowerCase()) return XtkPlaneManager.PLANE_IDS[i];
    }
}




/**
 * Returns the XtkPlane associated with the anatomical
 * title of the given view plane.
 *
 * @param {!string}
 * @return {XtkPlane}
 */
XtkPlaneManager.prototype.anatomicalToViewPlane = function(name) {
    for (var i = 0, len = XtkPlaneManager.ANATOMICAL_PLANES.length; i < len; i++){
	if (XtkPlaneManager.ANATOMICAL_PLANES[i].toLowerCase() === name.toLowerCase()) return this.xtkPlanes_[i];
    }
}




/**
 * @param {!Array.function|!function}
 * @private
 */
XtkPlaneManager.prototype.onAllRendered = function(callbacks){
    this.allRenderedCallbacks = [];
    if (goog.isArray(callbacks)) {
	this.allRenderedCallbacks_ = this.allRenderedCallbacks_.concat(callbacks)
    } else if (typeof callbacks === 'function') {
	this.allRenderedCallbacks_ = this.allRenderedCallbacks_.concat([callbacks])
    };
};




/**
 * @type {!String, !Object.<string, Array.<number>>}
 * @public
 */
XtkPlaneManager.prototype.setCameraSettings = function (planeName, args) {
    this.cameraSettings_[this.anatomicalToId(planeName)] = {'position' : args['position'], 'up' : args['up']};
}




/*
* @return {Object.<string, Array.<number>>}
* @public
*/
XtkPlaneManager.prototype.getCameraSettings = function () {
    return this.cameraSettings_;
}




/**
 * Returns the XtkPlane class associated with the 'elt'
 * argument.
 *
 * @param {!Element}
 * @return {XtkPlane}
 */
XtkPlaneManager.prototype.getXtkPlaneFromElement = function(elt) {
    
    var xtkvp = undefined;
    this.loopAll(function(xtkPlane){ if (elt === xtkPlane._element) { xtkvp = xtkPlane; }});
    return xtkvp;
}




/*
* Returns the XtkPlane Elements in an object,
* with the planes labeled accordingly. 
*
* @return {Object.<string, Element>}
*/
XtkPlaneManager.prototype.getXtkPlaneElements = function() {
    var elts = {};
    this.loopAll(function(xtkPlane){ elts[xtkPlane.id_] = xtkPlane._element });
    return elts;
}





/*
* Returns the XtkPlane interactors in an object,
* with the planes labeled accordingly. 
*
* @return {Object.<string, Element>}
*/
XtkPlaneManager.prototype.getXtkPlaneInteractors = function() {
    var sliderElts = {};
    this.loopAll(function(xtkPlane){ 
	if (xtkPlane.Slider_) { sliderElts[xtkPlane.id_] = xtkPlane.Slider_._element }
    });
    return sliderElts;
}




/*
* Loops through 2D viewers.
*
* @type {function(function=)}
*/
XtkPlaneManager.prototype.loop2D = function(callback) {
    goog.array.forEach(this.xtkPlanes2D_, function(xtkPlane){
	callback(xtkPlane, xtkPlane.getId());
    })    
}




/*
* Loops through all viewers.
*
* @type {function(function=)}
*/
XtkPlaneManager.prototype.loopAll = function(callback) {
    goog.array.forEach(this.xtkPlanes_, function(xtkPlane){
	callback(xtkPlane, xtkPlane.getId());
    })   
}




/**
 * Destroys all 4 renderers. Called when a 2D file is dropped into a viewport
 * currently displaying 3D images.
 *
 * @type {function()}
 */
XtkPlaneManager.prototype.destroyAllRenderers = function() {
    this.loopAll(function(xtkPlane){
	xtkPlane.Renderer_.destroy();
    })
}




/**
 * This method loads a set of 'renderables' (XObjects) within a given
 * plane's renderer object.  This method is called upon by the 'loadInRenderers'
 * function below.
 *
 * @type {function(XObject|Array.<XObject>, String|XtkPlane, function)}
 */
XtkPlaneManager.prototype.loadInRenderer = function(renderables, xtkPlane, callback) {

    var that = this;
    renderables = goog.isArray(renderables) ? renderables : [renderables];
    xtkPlane = (typeof xtkPlane === 'string') ? this.anatomicalToViewPlane(xtkPlane) : xtkPlane;



    //------------------
    // Need to reset the renderer if loading 
    // in 2D render (i.e. a an X.volume object)
    //------------------
    if (xtkPlane.id_ !== 'v' || xtkPlane.Renderer_ === undefined) { xtkPlane.resetRenderer(); }

    

    //------------------
    // set OnShowtime callback.
    //------------------
    xtkPlane.setRendererOnShowtime(function() { 
	if (callback) { callback(renderables, xtkPlane); }
    })



    //------------------
    // Add the renderables to the renderer.
    //------------------
    goog.array.forEach(renderables, function(renderable){
	xtkPlane.addToRenderer(renderable);
    })



    //------------------
    // Reset the slider.
    //------------------
    xtkPlane.resetSlider();



    //------------------
    // Reset the camera.
    //------------------
    if (this.cameraSettings_[xtkPlane.id_]){
	xtkPlane.Renderer_.camera.position =  this.cameraSettings_[xtkPlane.id_]['position'];
	xtkPlane.Renderer_.camera.up =  this.cameraSettings_[xtkPlane.id_]['up'];
    } else {
	if (xtkPlane.id_ === 'v' && this.applyGenericCameraSettings){
	    xtkPlane.Renderer_.camera.position =  [-200, 200, 200];
	    xtkPlane.Renderer_.camera.up =  [0, 0, 1];
	}
    }



    //------------------
    // Call the render method
    //------------------
    xtkPlane.render();
}


/**
 * Loads renderables into all of the renderers for all of the XtkPlanes.  
 * The 'planeStrs' parameter is an array of strings
 * that gets the associated plane with the associates string.
 * The first plane in 'planeStrs' will be the onloadPlane if
 * the onloadPlane string is not specified.
 *
 * 
 * @param {Array.<X.Object>} renderables object X object to be displayed.
 * @param {Array<.String>} planeStrs The render planes where the renderables should be rendered.
 * @param {String=} opt_onloadPlane The optional plane to render first.
 */
XtkPlaneManager.prototype.loadInRenderers = function (renderables, planeStrs, opt_onloadPlane) {

    //utils.dom.debug("loadInRenderers", renderables);
    var that = this;
    var renderCount = 0; 
    var xtkPlanes = [];
    var culledViewPlanes;
    var index = -1;
    var onloadPlane = '';



    //------------------
    // Map planeStrs to xtkPlanes, push to 'xtkPlanes' array.
    //------------------
    planeStrs = planeStrs ? planeStrs : XtkPlaneManager.ANATOMICAL_PLANES;
    // If planeStrs is a string...
    if (typeof planeStrs === 'string') {
	switch (planeStrs.toLowerCase()){
	case '2d':
	    planeStrs = XtkPlaneManager.ANATOMICAL_PLANES_2D;
	    break;
	default:
	    planeStrs = XtkPlaneManager.ANATOMICAL_PLANES;
	    break;
	}
    }
    goog.array.forEach(planeStrs, function(planeStr) {xtkPlanes.push(that.anatomicalToViewPlane(planeStr))});
    


    //------------------
    // Reset 3D renderer if it's in the xtkPlane array.
    //
    // NOTE: 2D renderers will get reset in 'loadInRenderer'. The reason
    // for this is that 2D renderers need a reset every time a new 
    // volume is loaded in -- so this may be within a scene that's already loaded 
    // into the displayer and 3D plane, when the viewer toggles the 2D volume.
    //------------------
    goog.array.forEach(xtkPlanes, function(xtkPlane) { if (xtkPlane === that.XtkPlaneV_) {xtkPlane.resetRenderer()}});



    //------------------
    // Differentiate an onloadPlane from others.  Default to first
    // element in 'xtkPlanes' if none specified.  
    //
    // NOTE: This 'chained' approach was chosen because XTK did not
    // kick back any errors.
    //------------------
    onloadPlane = opt_onloadPlane ? that.anatomicalToViewPlane(opt_onloadPlane) : xtkPlanes[0];
    index = xtkPlanes.indexOf(onloadPlane);
    culledViewPlanes = xtkPlanes;
    if (index > -1) { culledViewPlanes.splice(index, 1); }
    
    

    //------------------
    // Add object and render in onloadPlane first.
    //------------------

    that.loadInRenderer(renderables, onloadPlane, function(){


	//
	// When onloadPlane is finished rendering,
	// then loop through the rest.  (No errors thrown in Xtk this way.)
	//
	goog.array.forEach(culledViewPlanes, function(xtkPlane){
	    that.loadInRenderer(renderables, xtkPlane, function(){
		renderCount++;
		if (renderCount === culledViewPlanes.length) {
		    utils.dom.debug("All View Planes rendered...", that.allRenderedCallbacks_);
		    goog.array.forEach(that.allRenderedCallbacks_, function(callback){
			callback();
		    })
		}
	    })
	})
	that.updateStyle();
    })
}




/**
 * Colors sliders for differentiation in 
 * viewSchemes that involve multiple panels.
 */
XtkPlaneManager.prototype.colorSliders = function(){
    this.loopAll(function(xtkPlane){
	if (xtkPlane.Slider_){
	    xtkPlane.Slider_.addClassToTrack(goog.getCssName(XtkPlane.SLIDER_TRACK_CLASS, xtkPlane.getId()));
	}
    })
}



/**
 * One panel view schemes don't need color differentiation
 * so it defaults to the old color (which is gray)
 */
XtkPlaneManager.prototype.uncolorSliders = function(){
    this.loopAll(function(xtkPlane){
	if (xtkPlane.Slider_){
	    xtkPlane.Slider_.removeClassFromTrack(goog.getCssName(XtkPlane.SLIDER_TRACK_CLASS, xtkPlane.getId()));
	}
    }) 
}




/**
* Generic resize and style change method.
*
* @type {function()}
*/
XtkPlaneManager.prototype.updateStyle = function() {
    this.loopAll(function(xtkPlane){
	xtkPlane.updateStyle();
    })
}






