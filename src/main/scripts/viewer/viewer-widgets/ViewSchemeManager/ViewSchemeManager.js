/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.BgColorTransform');

/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.array');
goog.require('utils.string');
goog.require('utils.style');
goog.require('utils.fx');

/**
 * viewer-widget includes
 */
goog.require('ViewScheme');




/**
 * ViewSchemeManager is the class that handles the various ViewSchemes 
 * when viewing a dataset in the ViewBox.  A ViewScheme consists of one
 * or more ViewPlanes visible within the 'Displayer' component of a 
 * given ViewBox.  The ViewSchemeManager keeps track of the ViewSchemes
 * available for the user to choose from.  For instance, there's a ViewScheme
 * for every anatomical plane of a given scan, a 3D View Scheme, and 
 * there are also multi-dimensional ViewSchemes such as 'Four-up', which 
 * shows all three 2D anatomical planes and a 3D view.
 *
 * @constructor
 */
goog.provide('ViewSchemeManager');
ViewSchemeManager = function() {
    


    //------------------
    // Define the viewSchemes
    //------------------
    this.viewSchemes_['sagittal'] = (new ViewScheme('Sagittal'));
    this.viewSchemes_['coronal'] = (new ViewScheme('Coronal'));
    this.viewSchemes_['transverse'] = (new ViewScheme('Transverse'));
    this.viewSchemes_['3d'] = (new ViewScheme('3D'));
    this.viewSchemes_['fourup'] = (new ViewScheme('Four-Up'));
    this.viewSchemes_['conventional'] = (new ViewScheme('Conventional'));
    this.viewSchemes_['none'] = (new ViewScheme('none'));



    //------------------
    // Define the defaults
    //------------------
    this._defaultMultiView = this.viewSchemes_['fourup'];
    this._defaultSingleView = this.viewSchemes_['sagittal'];
    this.currViewScheme_ = this._defaultMultiView;



    //------------------
    // Define the callback arrays
    //------------------
    this.onMultipleViewPlanesVisibleCallbacks_ = [];
    this.onOneViewPlaneVisibleCallbacks_ = [];
    this.onViewSchemeSetCallbacks_ = [];
    this.onViewSchemeAnimateCallbacks_ = [];
    this.planeDoubleClickedCallback_ = [];
}
goog.exportSymbol('ViewSchemeManager', ViewSchemeManager);





/**
* @private
* @type {Object.<string, ViewScheme>
*/ 
ViewSchemeManager.prototype.viewSchemes_ = {};  




/**
* @private
* @type {boolean}
*/ 
ViewSchemeManager.prototype.animateViewSchemeChange_ = true;




/**
* @private
* @type {Array.<Element>}
*/ 
ViewSchemeManager.prototype.visiblePlanes_ = [];




/**
* @private
* @type {Array.<Element>}
*/ 
ViewSchemeManager.prototype.visibleInteractors_ = [];




/**
* @public
* @param {boolean}
*/ 
ViewSchemeManager.prototype.animateViewSchemeChange = function(bool){
    this.animateViewSchemeChange_ = bool;
};




/**
* @private
* @return {Object.<string, ViewScheme>}
*/ 
ViewSchemeManager.prototype.getViewSchemes = function(){
    return this.viewSchemes_;
};




/**
* @private
* @type {?ViewScheme}
*/ 
ViewSchemeManager.prototype.currViewScheme_ = null;




/**
* @type {function():string}
*/ 
ViewSchemeManager.prototype.getCurrViewScheme = function(){
    return this.currViewScheme_;
};




/**
 * @private
 * @type {?Element}
 */    
ViewSchemeManager.prototype.planeX_ = null;




/**
 * @private
 * @type {?Element}
 */   
ViewSchemeManager.prototype.planeY_ = null;




/**
 * @private
 * @type {?Element}
 */   
ViewSchemeManager.prototype.planeZ_ = null;




/**
 * @private
 * @type {?Element}
 */   
ViewSchemeManager.prototype.planeV_ = null;




/**
 * @private
 * @type {?Array}
 */   
ViewSchemeManager.prototype.planesAll_ = null;




/**
 * @private
 * @type {?Array}
 */   
ViewSchemeManager.prototype.planes2D_ = null;




/**
* @private
* @type {?Object}
*/ 
ViewSchemeManager.prototype.viewPlaneInteractors_ = null;




/**
* @private
* @type {?Array.function}
*/ 
ViewSchemeManager.prototype.onMultipleViewPlanesVisibleCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
ViewSchemeManager.prototype.onOneViewPlaneVisibleCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
ViewSchemeManager.prototype.onViewSchemeSetCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
ViewSchemeManager.prototype.onViewSchemeAnimateCallbacks_ = null;




/**
 * @private
 * @type {?Array.function}
 */ 
ViewSchemeManager.prototype.planeDoubleClickedCallback_ = null;




/**
 * Callback for when a plane is double-clicked.
 *
 * @param {function}
 */ 
ViewSchemeManager.prototype.onPlaneDoubleClicked = function(callback){
    this.planeDoubleClickedCallback_.push(callback)
};




/**
 * @private
 * @type {?ViewScheme}
 */ 
ViewSchemeManager.prototype._defaultMultiView = null;




/**
 * @public
 * @type {?ViewScheme}
 */ 
ViewSchemeManager.prototype._defaultSingleView = null;




/**
 * Assigns the ViewPlanes to the elements provided in the 
 * 'viewPlaneElts' argument.  The interactors (i.e. the sliders)
 * are provided in the 'opt_viewPlaneInteractors' argument.
 *
 * @param {!Object.<string, Element>, Object.<string, Element>=}
 */
ViewSchemeManager.prototype.setViewPlanes = function(viewPlaneElts, opt_viewPlaneInteractors) {

    //------------------
    // Establish the anatomical planes by 
    // mathematical axis (corresponds to XTK 
    // nomenclature).
    //------------------
    this.planeX_ = viewPlaneElts['x'];
    this.planeX_.setAttribute('anatomicalplane', 'sagittal');
    this.planeX_.setAttribute('plane', 'x');


    this.planeY_ = viewPlaneElts['y'];
    this.planeY_.setAttribute('anatomicalplane', 'coronal');
    this.planeY_.setAttribute('plane', 'y');

    this.planeZ_ = viewPlaneElts['z'];
    this.planeZ_.setAttribute('anatomicalplane', 'transverse');
    this.planeZ_.setAttribute('plane', 'z');

    

    //------------------
    // Establish the 3D ViewPlane.
    //------------------
    this.planeV_ = viewPlaneElts['v'];
    this.planeV_.setAttribute('anatomicalplane', '3d');
    this.planeV_.setAttribute('plane', 'v');



    //------------------
    // Establish the plane arrays.
    //------------------
    this.planesAll_ = [this.planeX_, this.planeY_, this.planeZ_, this.planeV_];
    this.planes2D_ = [this.planeX_, this.planeY_, this.planeZ_];



    //------------------
    // Establish the interactor elements for the ViewPlanes
    //------------------
    this.viewPlaneInteractors_ = opt_viewPlaneInteractors ? opt_viewPlaneInteractors : {};



    //------------------
    // Set the double-click callback when each
    // viewPlane is double-clicked.
    //------------------
    this.setPlanesDoubleClicked(); 
}




/**
 * Callback to be fired when multiple ViewPlanes are visible,
 *
 * @param {!function}
 */ 
ViewSchemeManager.prototype.onMultipleViewPlanesVisible = function(callback) {
    this.onMultipleViewPlanesVisibleCallbacks_.push(callback);   
}




/**
 * Callback to be fired when multiple ViewPlanes are visible,
 *
 * @param {!function}
 */ 
ViewSchemeManager.prototype.onOneViewPlaneVisible = function(callback) {
    this.onOneViewPlaneVisibleCallbacks_.push(callback);  
}



/**
 * Callback to be fired when a ViewScheme is changed.
 *
 * @param {!function}
 */ 
ViewSchemeManager.prototype.onViewSchemeChanged = function(callback) {
    this.onViewSchemeSetCallbacks_.push(callback);  
}




/**
 * Callback to be fired when ViewSchemes animate.
 *
 * @param {!function}
 */ 
ViewSchemeManager.prototype.onViewSchemeAnimate = function(callback) {
    this.onViewSchemeAnimateCallbacks_.push(callback);  
}




/*
* Loops through 2D viewers.
*
* @type {function(function)}
*/
ViewSchemeManager.prototype.loop2D = function(callback) {
    goog.array.forEach(this.planes2D_, function(viewPlane){
	callback(viewPlane, viewPlane.plane);
    })    
}




/*
* Loops through all viewers.
*
* @type {function(function)}
*/
ViewSchemeManager.prototype.loopAll = function(callback) {
    var that = this;
    if (this.planesAll_) {
	goog.array.forEach(this.planesAll_, function(viewPlane, i){
	    var plane = viewPlane.getAttribute('plane');
	    var interactor = that.viewPlaneInteractors_[plane];
	    callback(viewPlane, i, plane, interactor);
	})   
    }
}




/**
 * This method is the second in the chain when a ViewScheme
 * is changed.  It is called from the 'setViewScheme' function
 * either after the ViewScheme transition animation has completed
 * or the ViewScheme change is a zero-length animation. 
 * This method conducts the necessary class changes on the ViewPlane
 * Element and ViewPlane interactors, and also conducts
 * the necessary callback firing when a viewScheme is selected.
 *
 * @param {}
 */
ViewSchemeManager.prototype.implementViewScheme = function() {

    //------------------
    // Exit out if no planes are defined.
    //------------------
    if (!this.planesAll_) return;



    var that = this;
    var VIEW_SCHEME_PREFIX = ViewScheme.VIEWSCHEME_CLASS_PREFIX + '-';
    var INTERACTOR_PREFIX = ViewScheme.VIEWSCHEME_INTERACTOR_CLASS_PREFIX + '-';


    
    //------------------
    // Loop through planes to change their stylesheets.
    // The same thing applies for their interactors.
    //------------------
    that.loopAll(function(viewPlaneElement, i, plane, interactor){


	//
	// Clear any inline attributes with the ViewPlanes.  
	//
	viewPlaneElement.removeAttribute("style");

	//
	// Remove all 'VIEW_SCHEME_PREFIX' classes.
	//	
	utils.style.removeClassesThatContain(viewPlaneElement, VIEW_SCHEME_PREFIX);


	//
	// Clear any inline attributes with the interactors.  
	// Remove all 'INTERACTOR_PREFIX' classes.
	//
	interactor && interactor.removeAttribute("style");
	interactor && utils.style.removeClassesThatContain(interactor, INTERACTOR_PREFIX);
	


	//
	// If a single view plane is selected to be shown,
	// we want to add the default multi-view to the unselected planes
	// so that there's no awkard animating when the selected plane
	// is deselected back to the multi-view.
	//
	if ((that.visiblePlanes_.length === 1) && (that.visiblePlanes_[0] !== viewPlaneElement)) {

	    goog.dom.classes.add(viewPlaneElement, that._defaultMultiView.cssSheets[plane]);

	    interactor && goog.dom.classes.add(interactor, that._defaultMultiView.cssSheetsInteractor[plane]);
	    
	}

	
	//
	// Apply the to-be class to the ViewPlane element.
	//
	goog.dom.classes.add(viewPlaneElement, that.currViewScheme_.cssSheets[plane]);

	//
	// Apply the to-be class to the interactor.
	//
	interactor && goog.dom.classes.add(interactor, that.currViewScheme_.cssSheetsInteractor[plane]); 

	//
	// Run callbacks.
	//
	goog.array.forEach(that.onViewSchemeSetCallbacks_, function(callback){ callback() });
    })



    //
    // Run callbacks for when only one panel is visible. 
    // (basically for changing slider colors)
    //
    if (that.visiblePlanes_.length === 1){
	goog.array.forEach(that.onOneViewPlaneVisibleCallbacks_, function(callback){ callback(that.visiblePlanes_[0]); });

	
    //
    // Run callbacks when multiple panels are visible.
    //
    } else{
	goog.array.forEach(that.onMultipleViewPlanesVisibleCallbacks_, function(callback){ callback(that.visiblePlanes_) });
    }
    
}




/**
 * This method is the first of two methods that occur when
 * a the current ViewScheme is changed.  The second method is
 * 'implementViewScheme'.  In 'setViewScheme', the idea is that
 * if we are to animate the ViewScheme transitions, we need to 
 * conduct a series of calculations (Dim changes, visibilities, color
 * changes, etc.) before we are to animate these properties.  Once
 * these calculations occur, then se proceed to animate the transition
 * providing the calculated property changes to the animation.  Once the 
 * animation is fully complete, then we call on 'implementViewScheme.'
 * (It is also called when we have a 0-length animation time).
 *
 * @param {!ViewScheme, function}
 */ 
ViewSchemeManager.prototype.setViewScheme = function(viewScheme, callback) {

    var that = this;


    this.visiblePlanes_ = [];
    this.visibleInteractors_ = [];
    this.currViewScheme_ = (typeof viewScheme === 'string') ? this.viewSchemes_[ utils.string.stripNonAlphanumeric(viewScheme.toLowerCase())] : viewScheme;



    //------------------
    // Conduct preliminary loop to assess the to-be
    // visible planes.
    //------------------
    this.loopAll(function(viewPlaneElement, i, plane, interactor){
	var tempElt = utils.dom.makeElement("div", viewPlaneElement.parentNode, "tempEltForAnim");
	goog.dom.classes.set(tempElt, that.currViewScheme_.cssSheets[plane]);
	if (utils.style.getComputedStyle(tempElt, ['visibility'])['visibility'] === 'visible') {  
	    that.visiblePlanes_.push(viewPlaneElement); 
	    if (interactor) {
		that.visibleInteractors_.push(that.viewPlaneInteractors_[viewPlaneElement.getAttribute('plane')]); 
	    }
	}
	viewPlaneElement.parentNode.removeChild(tempElt);
	delete tempElt;
    })


    
    //------------------
    // Reset the default multi-view if another one is selected.
    //------------------
    if (that.visiblePlanes_.length > 1){
	this._defaultMultiView = this.currViewScheme_;
    }



    //------------------
    // If the view scheme change is to be animated....
    //------------------
    if (this.animateViewSchemeChange_) {

	var animatableElts = /**@type{Array.<Element>}*/ [];
	var startDims = /**@type{Array.<Object.<string, string|number>>}*/ [];
	var endDims = /**@type{Array.<Object.<string, string|number>>}*/ [];
	

	//
	// Get as-is and to-be dims for animation.
	//
	this.loopAll(function(viewPlaneElement, i, plane, interactor) {
	    

	    //
	    // Calculate the dim changes for the ViewPlane
	    //
	    var tempDims = utils.style.determineStartEndDimsCSS(viewPlaneElement, that.currViewScheme_.cssSheets[plane], function(asIsViewPlane, toBeViewPlane){


		//
		// Add the default CSS to the invisible
		// planes.
		//
		if (that.visiblePlanes_.length === 1 && that.visiblePlanes_[0] !== asIsViewPlane) {
		    goog.dom.classes.add(toBeViewPlane, that._defaultMultiView.cssSheets[plane]);


		//
		// Bring up the z-index of the visible plane so that it 
		// can animate coherently.
		//
		} else if (that.visiblePlanes_.length === 1 && that.visiblePlanes_[0] === asIsViewPlane) {
		    asIsViewPlane.style.zIndex = 10000;
		}
	    })
	    animatableElts.push(viewPlaneElement);
	    startDims.push(tempDims['start']);
	    endDims.push(tempDims['end']);


            //
	    // Calculate the dim changes for the ViewPlane's 
	    // interactor (i.e., the Slider).
            //
	    if (interactor) {
		var tempInteractorDims = utils.style.determineStartEndDimsCSS(interactor, that.currViewScheme_.cssSheetsInteractor[plane], function(asIsInteractor, toBeInteractor){

		    //
		    // Calculate Slider track color changes.
		    //
		    // NOTE: Need to think about how to approach this -- 
		    // it's too specific for the ViewSchemeManager.
		    //
		    var track = goog.dom.getElementByClass(XtkPlane.SLIDER_TRACK_CLASS, interactor);		    
		    var singleSlider = [80, 80, 80];
		    var multSlider = (plane === 'x') ? [255,255,0] : (plane === 'y') ? [0,255,0] : [255,0,0];
		    var currColor = utils.style.getComputedStyle(track, ['background-color'])['background-color'];
		    var toBeColor = (that.visiblePlanes_.length <= 1) ? singleSlider : multSlider;
		    animatableElts.push(track);
		    startDims.push({'background-color':currColor});
		    endDims.push({'background-color': toBeColor});
		    

		    //
		    // If the visible interactor is the current interactor,
                    // bring it to the front.
		    //
		    if (that.visibleInteractors_[0] === asIsInteractor) {
			asIsInteractor.style.zIndex = 20001;
		    

	            //
	            // Otherwise, apply the default styling...
		    //
		    } else {
			goog.dom.classes.add(toBeInteractor, that._defaultMultiView.cssSheetsInteractor[plane]);
		    }
		})
		animatableElts.push(interactor);
		startDims.push(tempInteractorDims['start']);
		endDims.push(tempInteractorDims['end']);
	    }
	})
	
	
	//
	// Run a parallel animation of the dim changes
	//
	utils.fx.parallelAnimate(animatableElts, 
				 startDims, endDims, 400, 
				 undefined,
				 function() { goog.array.forEach(that.onViewSchemeAnimateCallbacks_, function(callback){ callback() })}, 
				 function(){ that.implementViewScheme() });



    //------------------
    // If NOT animated, then simply implement 
    // the selected view scheme.
    //------------------
    } else {
	this.implementViewScheme();
    }
}





/**
 * Sets the double-click EVENT for the ViewPlanes
 *
 * @param {function}
 */
ViewSchemeManager.prototype.setPlanesDoubleClicked = function(callback){
    var that = this;
    var anatomicalPlane;
    var newViewScheme;



    //------------------
    // Loop through all of the planes...
    //------------------
    goog.array.forEach(this.planesAll_, function(planeElt){
	goog.events.listen(planeElt, goog.events.EventType.DBLCLICK, function(event) {

	    //
	    // Acquire the anatomical plane string from the clicked
	    // ViewPlane element.
	    //
	    anatomicalPlane = event.currentTarget.getAttribute('anatomicalplane');


	    //
	    // Acqure the ViewScheme from double-clicking on the clicked
	    // anatomical ViewScheme.
	    //
	    newViewScheme = that.viewSchemes_[anatomicalPlane];


	    //
	    // If you double click on the same view scheme, revert
	    // back to multi-view.
	    //
	    if (newViewScheme === that.currViewScheme_) { newViewScheme = that._defaultMultiView }


	    //
	    // Run any necessary callbacks after click (might pertain to coloring
	    // sliders, etc.).
	    //
	    goog.array.forEach(that.planeDoubleClickedCallback_, function(callback){ callback(newViewScheme.title) })
	    
	})
    })     
}