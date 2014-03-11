/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.BgColorTransform');

// utils
goog.require('moka.dom');
goog.require('moka.array');
goog.require('moka.string');
goog.require('moka.style');
goog.require('moka.fx');

// xiv
goog.require('xiv.ui.ViewLayout');




/**
 * xiv.ui.ViewLayoutManager is the class that handles the various xiv.ui.ViewLayouts 
 * when viewing a dataset in the xiv.ui.ViewBox.  A xiv.ui.ViewLayout consists of one
 * or more ViewPlanes visible within the 'xiv.ui.Displayer' component of a 
 * given xiv.ui.ViewBox.  The xiv.ui.ViewLayoutManager keeps track of the xiv.ui.ViewLayouts
 * available for the user to choose from.  For instance, there's a xiv.ui.ViewLayout
 * for every anatomical plane of a given scan, a 3D View Layout, and 
 * there are also multi-dimensional xiv.ui.ViewLayouts such as 'Four-up', which 
 * shows all three 2D anatomical planes and a 3D view.
 *
 * @constructor
 */
goog.provide('xiv.ui.ViewLayoutManager');
xiv.ui.ViewLayoutManager = function() {
    


    //------------------
    // Define the viewLayouts
    //------------------
    this.viewLayouts_ = {};
    this.viewLayouts_['sagittal'] = (new xiv.ui.ViewLayout('Sagittal'));
    this.viewLayouts_['coronal'] = (new xiv.ui.ViewLayout('Coronal'));
    this.viewLayouts_['transverse'] = (new xiv.ui.ViewLayout('Transverse'));
    this.viewLayouts_['3d'] = (new xiv.ui.ViewLayout('3D'));
    this.viewLayouts_['fourup'] = (new xiv.ui.ViewLayout('FourUp'));
    this.viewLayouts_['conventional'] = (new xiv.ui.ViewLayout('Conventional'));
    this.viewLayouts_['none'] = (new xiv.ui.ViewLayout('none'));



    //------------------
    // Define the defaults
    //------------------
    this._defaultMultiView = this.viewLayouts_['fourup'];
    this._defaultSingleView = this.viewLayouts_['sagittal'];
    this.currViewLayout_ = this._defaultMultiView;



    //------------------
    // Define the callback arrays
    //------------------
    this.onMultipleViewPlanesVisibleCallbacks_ = [];
    this.onOneViewPlaneVisibleCallbacks_ = [];
    this.onViewLayoutSetCallbacks_ = [];
    this.onViewLayoutAnimateCallbacks_ = [];
    this.planeDoubleClickedCallback_ = [];
}
goog.exportSymbol('xiv.ui.ViewLayoutManager', xiv.ui.ViewLayoutManager);





/**
* @private
* @type {!Object.<string, xiv.ui.ViewLayout>
*/ 
xiv.ui.ViewLayoutManager.prototype.viewLayouts_ = null;  




/**
* @private
* @type {boolean}
*/ 
xiv.ui.ViewLayoutManager.prototype.animateViewLayoutChange_ = true;




/**
* @private
* @type {!Array.<Element>}
*/ 
xiv.ui.ViewLayoutManager.prototype.visiblePlanes_ = null;




/**
* @private
* @type {!Array.<Element>}
*/ 
xiv.ui.ViewLayoutManager.prototype.visibleInteractors_ = null;




/**
* @public
* @param {boolean}
*/ 
xiv.ui.ViewLayoutManager.prototype.animateViewLayoutChange = function(bool){
    this.animateViewLayoutChange_ = bool;
};




/**
* @private
* @return {Object.<string, xiv.ui.ViewLayout>}
*/ 
xiv.ui.ViewLayoutManager.prototype.getViewLayouts = function(){
    return this.viewLayouts_;
};




/**
* @private
* @type {?xiv.ui.ViewLayout}
*/ 
xiv.ui.ViewLayoutManager.prototype.currViewLayout_ = null;




/**
* @type {function():string}
*/ 
xiv.ui.ViewLayoutManager.prototype.getCurrViewLayout = function(){
    return this.currViewLayout_;
};




/**
 * @private
 * @type {?Element}
 */    
xiv.ui.ViewLayoutManager.prototype.planeX_ = null;




/**
 * @private
 * @type {?Element}
 */   
xiv.ui.ViewLayoutManager.prototype.planeY_ = null;




/**
 * @private
 * @type {?Element}
 */   
xiv.ui.ViewLayoutManager.prototype.planeZ_ = null;




/**
 * @private
 * @type {?Element}
 */   
xiv.ui.ViewLayoutManager.prototype.planeV_ = null;




/**
 * @private
 * @type {?Array}
 */   
xiv.ui.ViewLayoutManager.prototype.planesAll_ = null;




/**
 * @private
 * @type {?Array}
 */   
xiv.ui.ViewLayoutManager.prototype.planes2D_ = null;




/**
* @private
* @type {?Object}
*/ 
xiv.ui.ViewLayoutManager.prototype.viewPlaneInteractors_ = null;




/**
* @private
* @type {?Array.function}
*/ 
xiv.ui.ViewLayoutManager.prototype.onMultipleViewPlanesVisibleCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
xiv.ui.ViewLayoutManager.prototype.onOneViewPlaneVisibleCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
xiv.ui.ViewLayoutManager.prototype.onViewLayoutSetCallbacks_ = null;




/**
* @private
* @type {?Array.function}
*/ 
xiv.ui.ViewLayoutManager.prototype.onViewLayoutAnimateCallbacks_ = null;




/**
 * @private
 * @type {?Array.function}
 */ 
xiv.ui.ViewLayoutManager.prototype.planeDoubleClickedCallback_ = null;




/**
 * Callback for when a plane is double-clicked.
 *
 * @param {function}
 */ 
xiv.ui.ViewLayoutManager.prototype.onPlaneDoubleClicked = function(callback){
    this.planeDoubleClickedCallback_.push(callback)
};




/**
 * @private
 * @type {?xiv.ui.ViewLayout}
 */ 
xiv.ui.ViewLayoutManager.prototype._defaultMultiView = null;




/**
 * @public
 * @type {?xiv.ui.ViewLayout}
 */ 
xiv.ui.ViewLayoutManager.prototype._defaultSingleView = null;




/**
 * Assigns the ViewPlanes to the elements provided in the 
 * 'viewPlaneElts' argument.  The interactors (i.e. the sliders)
 * are provided in the 'opt_viewPlaneInteractors' argument.
 *
 * @param {!Object.<string, Element>, Object.<string, Element>=}
 */
xiv.ui.ViewLayoutManager.prototype.setViewPlanes = function(viewPlaneElts, opt_viewPlaneInteractors) {

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
xiv.ui.ViewLayoutManager.prototype.onMultipleViewPlanesVisible = function(callback) {
    this.onMultipleViewPlanesVisibleCallbacks_.push(callback);   
}




/**
 * Callback to be fired when multiple ViewPlanes are visible,
 *
 * @param {!function}
 */ 
xiv.ui.ViewLayoutManager.prototype.onOneViewPlaneVisible = function(callback) {
    this.onOneViewPlaneVisibleCallbacks_.push(callback);  
}



/**
 * Callback to be fired when a xiv.ui.ViewLayout is changed.
 *
 * @param {!function}
 */ 
xiv.ui.ViewLayoutManager.prototype.onViewLayoutChanged = function(callback) {
    this.onViewLayoutSetCallbacks_.push(callback);  
}




/**
 * Callback to be fired when xiv.ui.ViewLayouts animate.
 *
 * @param {!function}
 */ 
xiv.ui.ViewLayoutManager.prototype.onViewLayoutAnimate = function(callback) {
    this.onViewLayoutAnimateCallbacks_.push(callback);  
}




/*
* Loops through 2D viewers.
*
* @type {function(function)}
*/
xiv.ui.ViewLayoutManager.prototype.loop2D = function(callback) {
    goog.array.forEach(this.planes2D_, function(viewPlane){
	callback(viewPlane, viewPlane.plane);
    })    
}




/*
* Loops through all viewers.
*
* @type {function(function)}
*/
xiv.ui.ViewLayoutManager.prototype.loopAll = function(callback) {
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
 * This method is the second in the chain when a xiv.ui.ViewLayout
 * is changed.  It is called from the 'setxiv.ui.ViewLayout' function
 * either after the xiv.ui.ViewLayout transition animation has completed
 * or the xiv.ui.ViewLayout change is a zero-length animation. 
 * This method conducts the necessary class changes on the ViewPlane
 * Element and ViewPlane interactors, and also conducts
 * the necessary callback firing when a viewLayout is selected.
 *
 * @param {}
 */
xiv.ui.ViewLayoutManager.prototype.implementViewLayout = function() {

    //------------------
    // Exit out if no planes are defined.
    //------------------
    if (!this.planesAll_) return;



    var that = this;
    var VIEW_SCHEME_PREFIX = xiv.ui.ViewLayout.VIEWSCHEME_CLASS_PREFIX + '-';
    var INTERACTOR_PREFIX = xiv.ui.ViewLayout.VIEWSCHEME_INTERACTOR_CLASS_PREFIX + '-';


    
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
	moka.style.removeClassesThatContain(viewPlaneElement, VIEW_SCHEME_PREFIX);


	//
	// Clear any inline attributes with the interactors.  
	// Remove all 'INTERACTOR_PREFIX' classes.
	//
	interactor && interactor.removeAttribute("style");
	interactor && moka.style.removeClassesThatContain(interactor, INTERACTOR_PREFIX);
	

	//console.log(that.visiblePlanes_);
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
	goog.dom.classes.add(viewPlaneElement, that.currViewLayout_.cssSheets[plane]);

	//
	// Apply the to-be class to the interactor.
	//
	interactor && goog.dom.classes.add(interactor, that.currViewLayout_.cssSheetsInteractor[plane]); 

	//
	// Run callbacks.
	//
	goog.array.forEach(that.onViewLayoutSetCallbacks_, function(callback){ callback() });
    })


    
    //
    // Run callbacks for when only one panel is visible. 
    // (basically for changing slider colors)
    //
    if (that.visiblePlanes_.length === 1){
	goog.array.forEach(that.onOneViewPlaneVisibleCallbacks_, function(callback){ 
	    callback(that.visiblePlanes_[0]); 
	    that.applyBackground_();
	});

	
    //
    // Run callbacks when multiple panels are visible.
    //
    } else{
	goog.array.forEach(that.onMultipleViewPlanesVisibleCallbacks_, function(callback){ 
	    callback(that.visiblePlanes_);
	    that.applyBackground_();
	});
    }
    

    
}




/**
 * This method is the first of two methods that occur when
 * a the current xiv.ui.ViewLayout is changed.  The second method is
 * 'implementxiv.ui.ViewLayout'.  In 'setxiv.ui.ViewLayout', the idea is that
 * if we are to animate the xiv.ui.ViewLayout transitions, we need to 
 * conduct a series of calculations (Dim changes, visibilities, color
 * changes, etc.) before we are to animate these properties.  Once
 * these calculations occur, then se proceed to animate the transition
 * providing the calculated property changes to the animation.  Once the 
 * animation is fully complete, then we call on 'implementxiv.ui.ViewLayout.'
 * (It is also called when we have a 0-length animation time).
 *
 * @param {!string} viewLayout
 * @param {function} callback
 */ 
xiv.ui.ViewLayoutManager.prototype.setViewLayout = function(viewLayout, callback) {

    this.visiblePlanes_ = [];
    this.visibleInteractors_ = [];
    this.currViewLayout_ = (typeof viewLayout === 'string') ? this.viewLayouts_[ moka.string.stripNonAlphanumeric(viewLayout.toLowerCase())] : viewLayout;



    //------------------
    // Conduct preliminary loop to assess the to-be
    // visible planes.
    //------------------
    this.loopAll(function(viewPlaneElement, i, plane, interactor){    


	var tempElt = goog.dom.createDom("div", {
	    'id':'tempEltForAnim', 
	    'class': this.currViewLayout_.cssSheets[plane]
	});
	goog.dom.append(viewPlaneElement.parentNode, tempElt);


	if (moka.style.getComputedStyle(tempElt, ['visibility'])['visibility'] === 'visible') {  
	    this.visiblePlanes_.push(viewPlaneElement); 
	    if (interactor) {
		this.visibleInteractors_.push(this.viewPlaneInteractors_[viewPlaneElement.getAttribute('plane')]); 
	    }
	}
	viewPlaneElement.parentNode.removeChild(tempElt);
	delete tempElt;
    }.bind(this))


    
    //------------------
    // Reset the default multi-view if another one is selected.
    //------------------
    if (this.visiblePlanes_.length > 1){
	this._defaultMultiView = this.currViewLayout_;
    }



    //------------------
    // If the view scheme change is to be animated....
    //------------------
    if (this.animateViewLayoutChange_) {

	this.animatableElts = [];
	this.startDims = [];
	this.endDims = [];
	

	//
	// Get as-is and to-be dims for animation.
	//
	this.loopAll(function(viewPlaneElement, i, plane, interactor) {
	    

	    //
	    // Calculate the dim changes for the ViewPlane
	    //
	    var tempDims = moka.style.determineStartEndDimsCSS(viewPlaneElement, this.currViewLayout_.cssSheets[plane], function(asIsViewPlane, toBeViewPlane){


		//
		// Add the default CSS to the invisible
		// planes.
		//
		if (this.visiblePlanes_.length === 1 && 
		    this.visiblePlanes_[0] !== asIsViewPlane) {
		    goog.dom.classes.add(toBeViewPlane, this._defaultMultiView.cssSheets[plane]);


		//
		// Bring up the z-index of the visible plane so that it 
		// can animate coherently.
		//
		} else if (this.visiblePlanes_.length === 1 && 
			   this.visiblePlanes_[0] === asIsViewPlane) {
		    asIsViewPlane.style.zIndex = 10000;
		}
	    }.bind(this))



	    this.animatableElts.push(viewPlaneElement);
	    this.startDims.push(tempDims['start']);
	    this.endDims.push(tempDims['end']);


            //
	    // Calculate the dim changes for the ViewPlane's 
	    // interactor (i.e., the Slider).
            //
	    if (interactor) {
		var tempInteractorDims = moka.style.determineStartEndDimsCSS(interactor, this.currViewLayout_.cssSheetsInteractor[plane], function(asIsInteractor, toBeInteractor){

		    //
		    // Calculate Slider track color changes.
		    //
		    // NOTE: Need to think about how to approach this -- 
		    // it's too specific for the xiv.ui.ViewLayoutManager.
		    //
		    var track = goog.dom.getElementByClass(xiv.XtkPlane.SLIDER_TRACK_CLASS, interactor);		    
		    var singleSlider = [80, 80, 80];
		    var multSlider = (plane === 'x') ? [255,0,0] : (plane === 'y') ? [0,255,0] : [0,0,255];
		    //this.animatableElts.push(track);

		    

		    //
		    // If the visible interactor is the current interactor,
                    // bring it to the front.
		    //
		    if (this.visibleInteractors_[0] === asIsInteractor) {
			asIsInteractor.style.zIndex = 20001;
		    

	            //
	            // Otherwise, apply the default styling...
		    //
		    } else {
			goog.dom.classes.add(toBeInteractor, this._defaultMultiView.cssSheetsInteractor[plane]);
		    }
		}.bind(this))

		this.animatableElts.push(interactor);
		this.startDims.push(tempInteractorDims['start']);
		this.endDims.push(tempInteractorDims['end']);
	    }
	}.bind(this))
	


	//
	// Run a parallel animation of the dim changes
	//
	moka.fx.parallelAnimate(this.animatableElts, this.startDims, this.endDims, 400, undefined,
				 function() { 
				     goog.array.forEach(this.onViewLayoutAnimateCallbacks_, function(callback){ 
					 callback(); 
				     });
				 }.bind(this), 
				 function(){ 
				     this.implementViewLayout();
				     
				 }.bind(this));



    //------------------
    // If NOT animated, then simply implement 
    // the selected view scheme.
    //------------------
    } else {
	this.implementViewLayout();
    }
}



/**
 * @type {!Array.<string>}
 * @private
 */
xiv.ui.ViewLayoutManager.prototype.backgroundColor3d_ = ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'];


/**
 * @param {!Array.<stringr>} colors
 */
xiv.ui.ViewLayoutManager.prototype.set3DBackgroundColor = function(colors){
    this.backgroundColor3d_ = colors;
}



/**
 * 
 */
xiv.ui.ViewLayoutManager.prototype.applyBackground_ = function(){
    this.planeV_.style.background = 'linear-gradient(' + this.backgroundColor3d_[1] + ',' + this.backgroundColor3d_[0] + ')';
}




/**
 * Sets the double-click EVENT for the ViewPlanes
 *
 * @param {function}
 */
xiv.ui.ViewLayoutManager.prototype.setPlanesDoubleClicked = function(callback){
    
    var anatomicalPlane;
    var newViewLayout;
    var planeDoubleClick;

    //------------------
    // Loop through all of the planes...
    //------------------
    goog.array.forEach(this.planesAll_, function(planeElt){

	planeDoubleClick = function(event) {
	    anatomicalPlane = event.currentTarget.getAttribute('anatomicalplane');
	    newViewLayout = this.viewLayouts_[anatomicalPlane];

	    // If you double click on the same view scheme, revert
	    // back to multi-view.
	    if (newViewLayout === this.currViewLayout_) { 
		newViewLayout = this._defaultMultiView }

	    // Run any necessary callbacks after click (might pertain to coloring
	    // sliders, etc.).
	    goog.array.forEach(this.planeDoubleClickedCallback_, 
	function(callback){ callback(newViewLayout.title) })
	    
	}.bind(this)
	goog.events.removeAll(planeElt);
	goog.events.listen(planeElt, goog.events.EventType.DBLCLICK, 
			   planeDoubleClick)
    }.bind(this))     
}
