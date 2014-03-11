/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');

// utils
goog.require('moka.dom');

// xiv
goog.require('xiv.ui.Displayer');
goog.require('xiv.ui.XtkPlane');





/**
 * xiv.ui.XtkPlaneManager handles the four xiv.ui.XtkPlanes that exists
 * within a current XtkDisplayer.  Rather than manage the individual
 * ViewPlane within the XtkDisplayer, this class was created to handle
 * the nuances of managing several Xtk planes: 
 *
 * @constructor
 * @param {xiv.ui.Displayer.Xtk}
 */
goog.provide('xiv.ui.XtkPlaneManager');
xiv.ui.XtkPlaneManager = function(xtkDisplayer) {
  
    /** 
     * @type {xiv.ui.XtkPlane} 
     * @private 
     */
    this.XtkPlaneV_ =  new xiv.ui.XtkPlane('v');

    /** 
     * @type {xiv.ui.XtkPlane} 
     * @private 
     */
    this.XtkPlaneX_ = new xiv.ui.XtkPlane('x'); 

    /** 
     * @type {xiv.ui.XtkPlane} 
     * @private 
     */
    this.XtkPlaneY_ = new xiv.ui.XtkPlane('y');

    /** 
     * @type {xiv.ui.XtkPlane} 
     * @private 
     */
    this.XtkPlaneZ_ = new xiv.ui.XtkPlane('z');

    /** 
     * @type {Array.<xiv.ui.XtkPlane>}  
     * @private 
     */
    this.xtkPlanes_ =  [this.XtkPlaneV_, this.XtkPlaneX_, this.XtkPlaneY_, 
			this.XtkPlaneZ_];

    /** 
     * @type {Array.<xiv.ui.XtkPlane>}  
     * @private 
     */ 
    this.xtkPlanes2D_ = [this.XtkPlaneX_, this.XtkPlaneY_, this.XtkPlaneZ_];



    //--------------
    // Set the plane parentNodes
    //--------------
    goog.array.forEach(this.xtkPlanes_, function(xtkPlane){
	goog.dom.append(xtkDisplayer.getElement(), xtkPlane.getElement());
    })
    

    this.allRenderedCallbacks_ = [];
    this.cameraSettings_ = {};
}
goog.exportSymbol('xiv.ui.XtkPlaneManager', xiv.ui.XtkPlaneManager);




/**
 * @const 
 * @type {Array.string}
 */
xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES =  ['3D', 'Sagittal', 'Coronal', 'Transverse'];




/**
 * @const 
 * @type {Array.string}
 */
xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES_2D =  ['Sagittal', 'Coronal', 'Transverse'];




/**
 * @const 
 * @type {Array.string}
 */
xiv.ui.XtkPlaneManager.PLANE_IDS = ['v', 'x', 'y', 'z'];




/**
 * @const 
 * @type {Array.string}
 */
xiv.ui.XtkPlaneManager.PLANE_IDS_2D = ['x', 'y', 'z'];



/** 
 * Toggle only if there's no camera settings for 
 * the 3D Plane.
 *
 * @type {boolean}
 */
xiv.ui.XtkPlaneManager.prototype.applyGenericCameraSettings = true;




/**
 * @type {!Object.<string, Obj.<string, Array.<number>>>}
 * @private
 */
xiv.ui.XtkPlaneManager.prototype.cameraSettings_ = null




/**
 * @type {Object.<string, Array.<Array.<number>>>}
 * @private
 */
xiv.ui.XtkPlaneManager.prototype.backgroundColors_ = {}




/**
 * @type {?Array.function}
 * @private
 */
xiv.ui.XtkPlaneManager.prototype.allRenderedCallbacks_ = null;




/**
 * Converts the anatomical plane provided int he 'name' 
 * argument to the relevant xiv.ui.XtkPlane id (x, y, z, or v).
 *
 * @type {!string}
 * @return {string}
 * @public
 */
xiv.ui.XtkPlaneManager.prototype.anatomicalToId =  function (name){
    for (var i = 0, len = xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES.length; i < len; i++){
	if (xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES[i].toLowerCase() === name.toLowerCase()) return xiv.ui.XtkPlaneManager.PLANE_IDS[i];
    }
}




/**
 * Returns the xiv.ui.XtkPlane associated with the anatomical
 * title of the given view plane.
 *
 * @param {!string}
 * @return {xiv.ui.XtkPlane}
 */
xiv.ui.XtkPlaneManager.prototype.anatomicalToViewPlane = function(name) {
    for (var i = 0, len = xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES.length; i < len; i++){
	if (xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES[i].toLowerCase() === name.toLowerCase()) return this.xtkPlanes_[i];
    }
}




/**
 * @param {!Array.function|!function}
 * @private
 */
xiv.ui.XtkPlaneManager.prototype.onAllRendered = function(callbacks){
    this.allRenderedCallbacks = [];
    if (goog.isArray(callbacks)) {
	this.allRenderedCallbacks_ = this.allRenderedCallbacks_.concat(callbacks)
    } else if (typeof callbacks === 'function') {
	this.allRenderedCallbacks_ = this.allRenderedCallbacks_.concat([callbacks])
    };
};




/**
 * @param {!String} planeName The plane which to apply the camera settings to.
 * @param {!Object.<string, Array.<number>>} args The arguments to apply to the planeName.
 * @public
 */
xiv.ui.XtkPlaneManager.prototype.setCamera = function (planeName, args) {
    console.log('setCamera: ', planeName, args);
    this.cameraSettings_[this.anatomicalToId(planeName)] = args;
}




/**
 * @param {!String} planeName The plane which to apply the background color to.
 * @param {!Array.<Array.<number>>} args The background colors to apply.
 * @public
 */
xiv.ui.XtkPlaneManager.prototype.setBackgroundColor = function (planeName, args) {

    var that = this;
    this.backgroundColors_[this.anatomicalToId(planeName)] = args;

    this.loopAll(function(xtkPlane){

	
	//
	// Set the background color.
	//
	if (that.backgroundColors_[xtkPlane.id_]){

	    var bgColors = [];

	    goog.array.forEach(that.backgroundColors_[xtkPlane.id_], function(colorArr){
		bgColors.push( "rgb("  + 
			       Math.round(255 * colorArr[0]).toString() + "," + 
			       Math.round(255 * colorArr[1]).toString() + "," + 
			       Math.round(255 * colorArr[2]).toString() + ")");
	    });

	    if (that.backgroundColors_[xtkPlane.id_].length > 1){

		// 
		// The mrml puts the last number as the top of the gradient
		//
		var gradientStr = 'linear-gradient(' +  bgColors[1] + "," +  bgColors[0] + ')';
		xtkPlane.getElement().setAttribute('originalbackgroundcolor', gradientStr);
	    }

	} 
    })


    
}




/*
* @return {Object.<string, Array.<number>>}
* @public
*/
xiv.ui.XtkPlaneManager.prototype.getCameraSettings = function () {
    return this.cameraSettings_;
}





/**
 * Returns the xiv.ui.XtkPlane class associated with the 'elt'
 * argument.
 *
 * @param {!Element}
 * @return {xiv.ui.XtkPlane}
 */
xiv.ui.XtkPlaneManager.prototype.getXtkPlaneFromElement = function(elt) {
    
    var xtkvp = undefined;
    this.loopAll(function(xtkPlane){ if (elt === xtkPlane.getElement()) { xtkvp = xtkPlane; }});
    return xtkvp;
}




/*
* Returns the xiv.ui.XtkPlane Elements in an object,
* with the planes labeled accordingly. 
*
* @return {Object.<string, Element>}
*/
xiv.ui.XtkPlaneManager.prototype.getXtkPlaneElements = function() {
    var elts = {};
    this.loopAll(function(xtkPlane){ elts[xtkPlane.id_] = xtkPlane.getElement() });
    return elts;
}





/*
* Returns the xiv.ui.XtkPlane interactors in an object,
* with the planes labeled accordingly. 
*
* @return {Object.<string, Element>}
*/
xiv.ui.XtkPlaneManager.prototype.getXtkPlaneInteractors = function() {
    var sliderElts = {};
    this.loopAll(function(xtkPlane){ 
	if (xtkPlane.Slider_) { sliderElts[xtkPlane.id_] = xtkPlane.Slider_.getElement() }
    });
    return sliderElts;
}




/*
* Loops through 2D viewers.
*
* @type {function(function=)}
*/
xiv.ui.XtkPlaneManager.prototype.loop2D = function(callback) {
    goog.array.forEach(this.xtkPlanes2D_, function(xtkPlane){
	callback(xtkPlane, xtkPlane.getId());
    })    
}




/*
* Loops through all viewers.
*
* @type {function(function=)}
*/
xiv.ui.XtkPlaneManager.prototype.loopAll = function(callback) {
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
xiv.ui.XtkPlaneManager.prototype.destroyAllRenderers = function() {
    this.loopAll(function(xtkPlane){
	xtkPlane.Renderer_.destroy();
    })
}




/**
 * This method loads a set of 'renderables' (XObjects) within a given
 * plane's renderer object.  This method is called upon by the 'loadInRenderers'
 * function below.
 *
 * @type {function(XObject|Array.<XObject>, String|xiv.ui.XtkPlane, function)}
 */
xiv.ui.XtkPlaneManager.prototype.loadInRenderer = 
function(renderables, xtkPlane, callback) {

    renderables = goog.isArray(renderables) ? renderables : [renderables];
    xtkPlane = goog.isString(xtkPlane) ? 
	this.anatomicalToViewPlane(xtkPlane) : xtkPlane;



    //------------------
    // Need to reset the renderer if loading 
    // in 2D render (i.e. a an X.volume object)
    //------------------
    if (xtkPlane.id_ !== 'v' || xtkPlane.Renderer_ === undefined) 
    { xtkPlane.resetRenderer(); }

    

    //------------------
    // set OnShowtime callback.
    //------------------
    xtkPlane.setRendererOnShowtime(function() { 
	if (callback) { callback(renderables, xtkPlane); }
    }.bind(this))



    //------------------
    // Add the renderables to the renderer.
    //------------------
    goog.array.forEach(renderables, function(renderable){
	//console.log(renderable, renderable.isSlectedVolume);

	if (xtkPlane.id_ !== 'v'){

	    // Only render the selected volume in 2D renderers
	    if ((renderable.isSelectedVolume === undefined) || 
		(renderable.isSelectedVolume === true)){
		xtkPlane.addToRenderer(renderable);
	    }
	}
	else {

	    // Render everything for the 3D renderer
	    xtkPlane.addToRenderer(renderable);
	}
    })



    //------------------
    // Reset the slider.
    //------------------
    xtkPlane.resetSlider();



    //------------------
    // Reset the camera.
    //------------------
    if (this.cameraSettings_[xtkPlane.id_] !== undefined){

	window.console.log("SETTING CAMERA", 
			   this.cameraSettings_[xtkPlane.id_]);
	xtkPlane.Renderer_.camera.position = 
	    this.cameraSettings_[xtkPlane.id_]['position'];
	xtkPlane.Renderer_.camera.up =  
	    this.cameraSettings_[xtkPlane.id_]['up'];
	xtkPlane.Renderer_.camera.focus =  
	    this.cameraSettings_[xtkPlane.id_]['focus'];

    } else {
	if (xtkPlane.id_ === 'v' && this.applyGenericCameraSettings){
	    xtkPlane.Renderer_.camera.position =  [-200, 200, 200];
	    xtkPlane.Renderer_.camera.up =  [0, 0, 1];
	    xtkPlane.Renderer_.camera.focus =  [0, 0, 0];
	}
    }


    //------------------
    // Call the render method
    //------------------
    xtkPlane.render();
}


/**
 * Loads renderables into all of the renderers for all of the xiv.ui.XtkPlanes.  
 * The 'planeStrs' parameter is an array of strings
 * that gets the associated plane with the associates string.
 * The first plane in 'planeStrs' will be the onloadPlane if
 * the onloadPlane string is not specified.
 *
 * 
 * @param {Array.<X.Object>} renderables object X object to be displayed.
 * @param {Array<.String>} planeStrs The render planes where the renderables should be rendered.
 * @param {boolean=} opt_suspendCallbacks Suspends the 'onLoaded' callback.
 * @param {String=} opt_onloadPlane The optional plane to render first.
 */
xiv.ui.XtkPlaneManager.prototype.loadInRenderers = 
    function (renderables, planeStrs, opt_suspendCallbacks, opt_onloadPlane) {

    var renderCount = 0; 
    var xtkPlanes = [];
    var culledViewPlanes;
    var index = -1;
    var onloadPlane = '';



    //------------------
    // Map planeStrs to xtkPlanes, push to 'xtkPlanes' array.
    //------------------
    planeStrs = planeStrs ? planeStrs : xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES;
    // If planeStrs is a string...
    if (typeof planeStrs === 'string') {
	switch (planeStrs.toLowerCase()){
	case '2d':
	    planeStrs = xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES_2D;
	    break;
	default:
	    planeStrs = xiv.ui.XtkPlaneManager.ANATOMICAL_PLANES;
	    break;
	}
    }
    goog.array.forEach(planeStrs, function(planeStr) {
	xtkPlanes.push(this.anatomicalToViewPlane(planeStr))
    }.bind(this));
    


    //------------------
    // Reset 3D renderer if it's in the xtkPlane array.
    //
    // NOTE: 2D renderers will get reset in 'loadInRenderer'. The reason
    // for this is that 2D renderers need a reset every time a new 
    // volume is loaded in -- so this may be within a scene that's already loade
    // into the displayer and 3D plane, when the viewer toggles the 2D volume.
    //------------------
    goog.array.forEach(xtkPlanes, function(xtkPlane) { 
	if (xtkPlane === this.XtkPlaneV_) {
	    xtkPlane.resetRenderer()}
    });



    //------------------
    // Differentiate an onloadPlane from others.  Default to first
    // element in 'xtkPlanes' if none specified.  
    //
    // NOTE: This 'chained' approach was chosen because XTK did not
    // kick back any errors.
    //------------------
    onloadPlane = opt_onloadPlane ? 
	this.anatomicalToViewPlane(opt_onloadPlane) : xtkPlanes[0];
    //onloadPlane = this.anatomicalToViewPlane('Sagittal');
    index = xtkPlanes.indexOf(onloadPlane);
    culledViewPlanes = xtkPlanes;
    if (index > -1) { culledViewPlanes.splice(index, 1); }
    
    

    //------------------
    // Add object and render in onloadPlane first.
    //------------------
    console.log("ONLOAD PLANE", onloadPlane, xtkPlanes);
    //return;
    this.loadInRenderer(renderables, onloadPlane, function(){


	// When onloadPlane is finished rendering,
	// then loop through the rest.  (No errors thrown in Xtk this way.)
	goog.array.forEach(culledViewPlanes, function(xtkPlane){
	    this.loadInRenderer(renderables, xtkPlane, function(){
		renderCount++;
		if (renderCount === culledViewPlanes.length) {
		    window.console.log("All View Planes rendered...");
		    
		    if (opt_suspendCallbacks !== true){
			goog.array.forEach(
			    this.allRenderedCallbacks_, function(callback){
			    callback();
			}.bind(this))
		    }
		}
	    }.bind(this))
	}.bind(this))

	this.updateStyle();
    }.bind(this))
}




/**
 * Colors sliders for differentiation in 
 * viewSchemes that involve multiple panels.
 */
xiv.ui.XtkPlaneManager.prototype.colorSliders = function(){
    this.loopAll(function(xtkPlane){
	if (xtkPlane.Slider_){
	    goog.dom.classes.add(xtkPlane.Slider_.getTrack(), 
				 goog.getCssName(xiv.ui.XtkPlane.SLIDER_TRACK_CLASS, 
						 xtkPlane.getId()));
	}
    })
}



/**
 * One panel view schemes don't need color differentiation
 * so it defaults to the old color (which is gray)
 */
xiv.ui.XtkPlaneManager.prototype.uncolorSliders = function(){
    this.loopAll(function(xtkPlane){
	if (xtkPlane.Slider_){
	    goog.dom.classes.remove(xtkPlane.Slider_.getTrack(),
				    goog.getCssName(xiv.ui.XtkPlane.SLIDER_TRACK_CLASS, 
						    xtkPlane.getId()));
	}
    }) 
}




/**
* Generic resize and style change method.
*
* @type {function()}
*/
xiv.ui.XtkPlaneManager.prototype.updateStyle = function() {
    var that = this;
    this.loopAll(function(xtkPlane){
	xtkPlane.updateStyle();
    })
}






