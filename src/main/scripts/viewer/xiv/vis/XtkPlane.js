/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */


// goog
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.dom.classes');

// X
goog.require('X.object');
goog.require('X.camera');
goog.require('X.renderer2D');

// nrg
goog.require('nrg.fx');

// gxnat
goog.require('gxnat.slicerNode.BackgroundColor');

// xiv
goog.require('xiv.vis.RenderEngine');




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
 * Event types.
 * @enum {string}
 * @public
 */
xiv.vis.XtkPlane.EventType = {
    SLICE_NAVIGATED: goog.events.getUniqueId('slice-navigated')
}


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
 * @type {gxnat.slicerNode.cameraNode | X.Camera}
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
xiv.vis.XtkPlane.prototype.isEnabled_ = true;



/**
* @param {Element}
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
 * @param {gxnat.slicerNode.cameraNode} opt_cameraNode
 * @public
 */
xiv.vis.XtkPlane.prototype.setCamera = function(opt_cameraNode){
    if (!goog.isDefAndNotNull(this.Renderer)) { return };

    if (goog.isDefAndNotNull(opt_cameraNode)){
	this.camera_ = opt_cameraNode;

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
 * @param {gxnat.slicerNode.BackgroundColor | string} opt_bgColorNode
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

    //window.console.log("SET CONTAINER BASE", this.container);
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
	goog.events.removeAll(this.Renderer);
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
    //window.console.log("DESTROU REDNERER");
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
    // RENDERING EVENT
    //
    goog.events.listen(this.Renderer, xiv.vis.RenderEngine.EventType.RENDERING, 
	function(e){
	    this.dispatchEvent({
		type: xiv.vis.RenderEngine.EventType.RENDERING,
		value: e.value
	    })
	}.bind(this));




    //
    // Slice Navigated Event
    //
    goog.events.listen(this.Renderer, 
		       xiv.vis.XtkPlane.EventType.SLICE_NAVIGATED, 
		       this.onSliceNavigated_.bind(this))
}



/**
 * @param {X.object} xObj
 * @public
 */
xiv.vis.XtkPlane.prototype.add = function(xObj) {

    if (!this.isEnabled_){
	//window.console.log('Not adding xObj to Plane' + this.orientation);
	return;
    }

    if(xObj['isSelectedVolume'] == true) {
	//console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
    }
    this.xObjs_.push(xObj);
    this.Renderer.add(xObj);
};



/**
 * @return {!boolean}
 * @public
 */
xiv.vis.XtkPlane.prototype.isEnabled = function() {
    return this.isEnabled_;
}


/**
 * @private
 */
xiv.vis.XtkPlane.prototype.disposeDisabledOverlay_ = function() {
    //
    // Overlay
    //
    if (goog.isDefAndNotNull(this.DisabledOverlay_)){
	goog.dom.removeNode(this.DisabledOverlay_);
	delete this.DisabledOverlay_;
    }
}





/**
 * @private
 */
xiv.vis.XtkPlane.prototype.createDisabledOverlay_ = function() {
    //
    // Create the overlay
    //
    this.DisabledOverlay_ = goog.dom.createDom('div', {
	'id': 'DisabledOverlay_' + goog.string.createUniqueString(),
    });
    goog.dom.classes.set(this.DisabledOverlay_, 
			 'xiv-vis-xtkplane-disabledoverlay');

    //
    // We create a child element so that we can vertically center it.
    //
    var renderPlane = this.orientation;
    if (this.orientation == 'V'){ renderPlane = '3D';}
    var innerDisplay = goog.dom.createDom('div', {
	'id': 'DisabledOverlay_' + goog.string.createUniqueString(),
    });
    innerDisplay.style.display = 'table-cell';
    innerDisplay.style.verticalAlign = 'middle';
    innerDisplay.innerHTML = renderPlane + ' render plane disabled.';
    goog.dom.appendChild(this.DisabledOverlay_, innerDisplay); 
    
    goog.dom.appendChild(this.container, this.DisabledOverlay_);
}



/**
 * @param {!boolean} on
 * @public
 */
xiv.vis.XtkPlane.prototype.setEnabled = function(on) {
    //
    // Store the on value.
    //
    this.isEnabled_ = !(on === false);

    //
    // Re-initialize whether on or off.
    //
    if (!this.isEnabled_){

	//
	// Apply the disabled overlay if needed
	//
	if (!goog.isDefAndNotNull(this.DisabledOverlay_)) {
	    this.createDisabledOverlay_();
	} 

	this.DisabledOverlay_.style.visibility = 'visible';


	//
	// Fade in the overlay
	//
	nrg.fx.fadeIn(this.DisabledOverlay_, 200, 
		      function(){
			  //this.storeCamera_();
			  //this.storeBackground_();
			  //this.removeXObjectsFromRenderer();
		      }.bind(this));


    } else {

	//
	// Otherwise, restore...
	//
	//this.restore();

	//
	// ...and fade out and destroy display
	//
	nrg.fx.fadeOut(this.DisabledOverlay_, 200, function(){
	    this.DisabledOverlay_.style.visibility = 'hidden';
	    this.disposeDisabledOverlay_();
	}.bind(this));
    }
}


/**
 * @public
 */
xiv.vis.XtkPlane.prototype.restore = function() {
    window.console.log('\n\nrestore');
    //
    // Restore methods
    //
    //this.Renderer.dispose();
    //this.Renderer.init();
    //this.restoreXObjectsToRenderer_();
    //this.restoreCamera_();
    //this.restoreBackground_();

    //
    // Render the object
    //
    //this.Renderer.container = this.container;
    this.init();
    this.restoreXObjectsToRenderer_();
    this.restoreCamera_();
    this.restoreBackground_();
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
	window.console.log('adding', xObj);
	this.Renderer.add(xObj);
    }.bind(this))
};



/**
 * @private
 */
xiv.vis.XtkPlane.prototype.restoreCamera_ = function() {
    //window.console.log('restore camera!');
    if (goog.isDefAndNotNull(this.camera_)){
	this.setCamera(this.camera_);
    }    
}


/**
 * @private
 */
xiv.vis.XtkPlane.prototype.restoreBackground_ = function() {
    //window.console.log('restore background!');
    //window.console.log(this.background_);
    if (goog.isDefAndNotNull(this.background_)){
	this.setBackground(this.background_);
    }    
}



/**
 * @public
 */
xiv.vis.XtkPlane.prototype.render = function() {
    if (!this.isEnabled_) { 
	window.console.log('Plane' + this.orientation + ' is switched off.');
	return; 
    };
    //window.console.log('Rendering');
    this.Renderer.render();  
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


    this.disposeDisabledOverlay_();


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
	//window.console.log(this.progressTimer_);
	if (goog.isDefAndNotNull(this.progressTimer_.dispose)){
	    this.progressTimer_.stop();
	    this.progressTimer_.dispose();
	}
	delete this.progressTimer_;
    }


    // primitive types
    delete this.isEnabled_;
    delete this.XRenderer;
    delete this.container;
    delete this.orientation;
    delete this.xObjs_;
    delete this.currVolume_;
    delete this.renderProgress_;
};


goog.exportSymbol('xiv.vis.XtkPlane.DEFAULT_CAMERA_POSITION',
	xiv.vis.XtkPlane.DEFAULT_CAMERA_POSITION);
goog.exportSymbol('xiv.vis.XtkPlane.DEFAULT_BACKGROUND',
	xiv.vis.XtkPlane.DEFAULT_BACKGROUND);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.XRenderer',
	xiv.vis.XtkPlane.prototype.XRenderer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.orientation',
	xiv.vis.XtkPlane.prototype.orientation);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.Renderer',
	xiv.vis.XtkPlane.prototype.Renderer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.container',
	xiv.vis.XtkPlane.prototype.container);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.getRenderer',
	xiv.vis.XtkPlane.prototype.getRenderer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.getOrientation',
	xiv.vis.XtkPlane.prototype.getOrientation);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.setCamera',
	xiv.vis.XtkPlane.prototype.setCamera);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.setBackground',
	xiv.vis.XtkPlane.prototype.setBackground);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.getCurrentVolume',
	xiv.vis.XtkPlane.prototype.getCurrentVolume);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.getContainer',
	xiv.vis.XtkPlane.prototype.getContainer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.setContainer',
	xiv.vis.XtkPlane.prototype.setContainer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.init',
	xiv.vis.XtkPlane.prototype.init);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.add',
	xiv.vis.XtkPlane.prototype.add);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.isEnabled',
	xiv.vis.XtkPlane.prototype.isEnabled);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.setEnabled',
	xiv.vis.XtkPlane.prototype.setEnabled);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.restore',
	xiv.vis.XtkPlane.prototype.restore);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.removeXObjectsFromRenderer',
	xiv.vis.XtkPlane.prototype.removeXObjectsFromRenderer);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.render',
	xiv.vis.XtkPlane.prototype.render);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.updateStyle',
	xiv.vis.XtkPlane.prototype.updateStyle);
goog.exportSymbol('xiv.vis.XtkPlane.prototype.dispose',
	xiv.vis.XtkPlane.prototype.dispose);
