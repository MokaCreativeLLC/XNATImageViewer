/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// nrg
goog.require('nrg.ui.InfoOverlay');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.vis.XtkPlane');
xiv.vis.XtkPlane = function() {
    goog.base(this);

    /**
     * @type {!Array.<X.Object>}
     * @private
     */
    this.xObjs_ = [];
}
goog.inherits(xiv.vis.XtkPlane, goog.events.EventTarget);
goog.exportSymbol('xiv.vis.XtkPlane', xiv.vis.XtkPlane);



/**
 * @const
 * @type {!Array.<number>}
 */
xiv.vis.XtkPlane.DEFAULT_CAMERA_POSITION = [-300, 300, 300];



/**
 * @const
 * @type {!string}
 */
xiv.vis.XtkPlane.DEFAULT_BACKGROUND = 'black';


/**
 * @type {gxnat.slicer.cameraNode | X.Camera}
 * @private
 */
xiv.vis.XtkPlane.prototype.camera_;



/**
 * @type {?string}
 * @private
 */
xiv.vis.XtkPlane.prototype.background_;



/**
* @param {boolean}
*/
xiv.vis.XtkPlane.prototype.isOn_ = true;



/**
* @param {?nrg.ui.InfoOverlay}
*/
xiv.vis.XtkPlane.prototype.DisabledOverlay_;



/**
 * The TYPE of XTK renderer -- not to be confused with this.Renderer
 * which is the instance of the renderer.
 *
 * @type {obj}
 * @protected
 */
xiv.vis.XtkPlane.prototype.XRenderer = null;



/**
 * @type {?string}
 * @protected
 */
xiv.vis.XtkPlane.prototype.orientation = null;



/**
 * @type {?goog.Timer}
 * @private
 */
xiv.vis.XtkPlane.prototype.progressTimer_ = null;



/**
 * @type {?X.renderer2D | ?X.renderer3D}
 * @protected
 */  
xiv.vis.XtkPlane.prototype.Renderer = null;



/**
 * @type {?Element}
 * @protected
 */  
xiv.vis.XtkPlane.prototype.container = null;


/**
 * @private
 * @type {number}
 */
xiv.vis.XtkPlane.prototype.renderProgress_;




/**
 * @return {!string} The orientation.
 */
xiv.vis.XtkPlane.prototype.getRenderer = function(){
    return this.Renderer;
};



/**
 * @return {!string} The orientation.
 */
xiv.vis.XtkPlane.prototype.getOrientation = function(){
    return this.orientation;
};



/**
 * @private
 */
xiv.vis.XtkPlane.prototype.storeCamera_ = function(){
    this.camera_ = this.Renderer.camera;
}


/**
 * @private
 */
xiv.vis.XtkPlane.prototype.storeBackground_ = function(){
    this.background_ = this.container.style.background;
}


/**
 * @param {gxnat.slicer.cameraNode} opt_cameraNode
 * @public
 */
xiv.vis.XtkPlane.prototype.setCamera = function(opt_cameraNode){
    if (!goog.isDefAndNotNull(this.Renderer)) { return };

    if (goog.isDefAndNotNull(opt_cameraNode)){
	this.camera_ = opt_cameraNode;
	window.console.log('\n\n\n\n**********', opt_cameraNode);
	this.Renderer.camera.focus = opt_cameraNode.focus;
	this.Renderer.camera.position = opt_cameraNode.position;
	this.Renderer.camera.up = opt_cameraNode.up;

	//
	// IMPORTANT!
	//
	if (opt_cameraNode instanceof X.camera){
	    this.Renderer.camera.view = opt_cameraNode.view;
	}

	//
	// If no camera-like object, then set a default...
	//
    } else {
	this.Renderer.camera.position = 
	    this.constructor.DEFAULT_CAMERA_POSITION;
    }
}



/**
 * @param {gxnat.slicer.BackgroundColorNode | string} opt_bgColorNode
 * @public
 */
xiv.vis.XtkPlane.prototype.setBackground = function(opt_bgColorNode) { 
    //
    // Default
    //
    if (!goog.isDefAndNotNull(opt_bgColorNode)){
	this.container.style.background = xiv.vis.XtkPlane.DEFAULT_BACKGROUND;
	return;
    }
    
    //
    // String backgrounds
    //
    if (goog.isString(opt_bgColorNode)) { 
	this.container.style.background = opt_bgColorNode;
    }

    //
    // Custom
    //
    else if (goog.isDefAndNotNull(opt_bgColorNode.backgroundColor2)){
	this.container.style.background = 
	    "-webkit-linear-gradient(top, " + 
	    opt_bgColorNode.backgroundColor2 + ", " + 
	    opt_bgColorNode.backgroundColor +")";

    } else {
	this.container.style.background = 
	    opt_bgColorNode.backgroundColor;	
    }
    
}




/**
 * Searches the DOM and for XTK's render bar.  This was chosen over inheriting
 * the 'onProgress' method in the XtkRenderer classes because it created 
 * awkard timing issues for UX.
 * 
 * @protected
 */
xiv.vis.XtkPlane.prototype.checkRenderProgress_ = function() {
    this.progressTimer_ = goog.Timer.callOnce(function() {
	//
	// destroy the timer
	//
	this.progressTimer_ = null; 

	//
	// Return out if no renderer
	//
	if (!goog.isDefAndNotNull(this.Renderer)){
	    return;
	}

	//
	// get the progress-bar thumbnail from DOM
	//
	var progThumb = goog.dom.getElementByClass('progress-bar-thumb', 
						   this.Renderer.container);

	//
	// exit out if at 100% and send RENDER_END event.
	//
	if (!progThumb){
	    this.renderProgress_ = 1;
	    this.dispatchEvent({
		type: xiv.vis.RenderEngine.EventType.RENDER_END,
		value: this.renderProgress_
	    })
	    return;
	}

	//
	// set the render progress
	//
	this.renderProgress_ = parseInt(progThumb.style.width, 10) / 100;

	//
	// dispatch rednering event if not at 100%
	//
	this.dispatchEvent({
	    type: xiv.vis.RenderEngine.EventType.RENDERING,
	    value: this.renderProgress_
	})

	//
	// recurse
	//
	this.checkRenderProgress_();

	//
	// check again...
	//
    }.bind(this), 100); 
}




/**
 * @return {?XObject} The currently loaded xtk volume.
 */
xiv.vis.XtkPlane.prototype.getCurrentVolume = function(){
    return this.currVolume_;
};



/**
 * @return {Element} 
 * @public
 */
xiv.vis.XtkPlane.prototype.getContainer = function() {
    return this.container;
}



/**
 * @param {!Element} containerElt
 * @public
 */
xiv.vis.XtkPlane.prototype.setContainer = function(containerElt) {

    this.container = containerElt;

    if (!goog.isDefAndNotNull(this.Renderer)) { 
	this.init(containerElt);
    }

    //
    // Set the container
    //
    this.Renderer.container = containerElt;
}



/**
 * @param {Event}
 * @private
 */
xiv.vis.XtkPlane.prototype.onSliceNavigated_ = function(e) {
    this.dispatchEvent(e);
}



/**
 * @private
 */
xiv.vis.XtkPlane.prototype.destroyRenderer_ = function() {
    if (goog.isDefAndNotNull(this.Renderer)) { 
	this.Renderer.destroy();
	this.Renderer = null;
    } 
}
 



/**
 * @param {!Element} containerElt
 * @throws An error if the subclass construtor property 'XRenderer' is 
 *  undefined.
 * @public
 */
xiv.vis.XtkPlane.prototype.init = function(containerElt) {
    //
    // Destroy the existing renderer if it exists
    //
    this.destroyRenderer_(); 
 
    if (!goog.isDefAndNotNull(this.XRenderer)){
	throw new Error('XtkPlane subclass must have the' +
			' property "XRenderer" defined.')
    }
    this.Renderer =  new this.XRenderer();
    this.Renderer.orientation = this.orientation;
    this.setContainer(containerElt || this.container || document.body);
    this.Renderer.init();






    //
    // Slice Navigated Event
    //
    goog.events.listen(this.Renderer, 
		       xiv.vis.XtkEngine.EventType.SLICE_NAVIGATED, 
		       this.onSliceNavigated_.bind(this))
}



/**
 * @param {X.object} xObj
 * @public
 */
xiv.vis.XtkPlane.prototype.add = function(xObj) {

    if (!this.isOn_){
	window.console.log('Not adding xObj to Plane' + this.orientation);
	return;
    }

    if(xObj['isSelectedVolume'] == true) {
	console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
    }
    this.xObjs_.push(xObj);
    this.Renderer.add(xObj);
};



/**
 * @return {!boolean}
 * @public
 */
xiv.vis.XtkPlane.prototype.isOn = function() {
    return this.isOn_;
}


/**
 * @private
 */
xiv.vis.XtkPlane.prototype.createDisabledOverlay_ = function() {
    this.DisabledOverlay_ = new nrg.ui.InfoOverlay();
    var renderPlane = this.orientation;
    if (this.orientation == 'V'){
	renderPlane = '3D';
    }
    this.DisabledOverlay_.getElement().style.opacity = 0;
    this.DisabledOverlay_.getElement().style.zIndex = 100;
    this.DisabledOverlay_.addText(renderPlane + ' rendering disabled.');
    this.DisabledOverlay_.render(this.container);
}



/**
 * @param {!boolean} on
 * @public
 */
xiv.vis.XtkPlane.prototype.setOn = function(on) {

    //
    // Store the on value.
    //
    this.isOn_ = !(on === false);

    //
    // Re-initialize whether on or off.
    //
    if (!this.isOn_){

	if (!goog.isDefAndNotNull(this.DisabledOverlay_)) {
	    this.createDisabledOverlay_();
	} else {
	    this.DisabledOverlay_.getElement().style.visibility = 'visible';
	}
	nrg.fx.fadeIn(this.DisabledOverlay_.getElement(), 200, 
		      function(){
			  this.storeCamera_();
			  this.storeBackground_();
			  this.removeXObjectsFromRenderer();
		      }.bind(this));


    } else {
	this.restore();
	nrg.fx.fadeOut(this.DisabledOverlay_.getElement(), 200, function(){
	    this.DisabledOverlay_.getElement().style.visibility = 'hidden';
	}.bind(this));
    }
}


/**
 * @public
 */
xiv.vis.XtkPlane.prototype.restore = function() {
    //
    // Restore methods
    //
    this.restoreXObjectsToRenderer_();
    this.restoreCamera_();
    this.restoreBackground_();

    //
    // Render the object
    //
    this.render();
}


/**
 * @protected
 */
xiv.vis.XtkPlane.prototype.removeXObjectsFromRenderer = function() {
    goog.array.forEach(this.xObjs_, function(xObj){
	if (goog.isDefAndNotNull(xObj)){
	    this.Renderer.remove(xObj);
	}
    }.bind(this))
}



/**
 * @private
 */
xiv.vis.XtkPlane.prototype.restoreXObjectsToRenderer_ = function() {
    goog.array.forEach(this.xObjs_, function(xObj){
	this.Renderer.add(xObj);
    }.bind(this))
};



/**
 * @private
 */
xiv.vis.XtkPlane.prototype.restoreCamera_ = function() {
    window.console.log('restore camera!');
    if (goog.isDefAndNotNull(this.camera_)){
	this.setCamera(this.camera_);
    }    
}


/**
 * @private
 */
xiv.vis.XtkPlane.prototype.restoreBackground_ = function() {
    window.console.log('restore background!');
    window.console.log(this.background_);
    if (goog.isDefAndNotNull(this.background_)){
	this.setBackground(this.background_);
    }    
}



/**
 * @public
 */
xiv.vis.XtkPlane.prototype.render = function() {
    if (!this.isOn_) { 
	window.console.log('Plane' + this.orientation + ' is switched off.');
	return; 
    };

    this.Renderer.render();  
    this.checkRenderProgress_();
};



/**
 * @inheritDoc
 */
xiv.vis.XtkPlane.prototype.updateStyle = function() {
    if (goog.isDefAndNotNull(this.Renderer)){
	this.Renderer.onResize();  
    }
};



/**
* @inheritDoc
 */
xiv.vis.XtkPlane.prototype.dispose = function() {
    goog.base(this, 'dispose');

    //
    // Renderer
    //
    if (goog.isDefAndNotNull(this.Renderer)){
	this.Renderer.destroy();
	delete this.Renderer;
    }

    //
    // Overlay
    //
    if (goog.isDefAndNotNull(this.DisabledOverlay_)){
	this.DisabledOverlay_.disposeInternal();
	delete this.DisabledOverlay_;
    }


    //
    // Background
    //
    if (goog.isDefAndNotNull(this.background_)){
	delete this.background_;
    }
    
    //
    // Camera Node - (don't delete because it belongs to the thumbnail)
    //
    if (goog.isDefAndNotNull(this.camera_)){
	delete this.camera_;
    }

    //
    // progress timer
    //
    if (goog.isDefAndNotNull(this.progressTimer_)){
	window.console.log(this.progressTimer_);
	if (goog.isDefAndNotNull(this.progressTimer_.dispose)){
	    this.progressTimer_.stop();
	    this.progressTimer_.dispose();
	}
	delete this.progressTimer_;
    }


    // primitive types
    delete this.isOn_;
    delete this.XRenderer;
    delete this.container;
    delete this.orientation;
    delete this.xObjs_;
    delete this.currVolume_;
    delete this.renderProgress_;
};
