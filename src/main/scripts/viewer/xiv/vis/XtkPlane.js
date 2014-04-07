/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */



/**
 * @constructor
 * 
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.vis.XtkPlane');
xiv.vis.XtkPlane = function() {
    goog.base(this);


    /**
     * The TYPE of XTK renderer -- not to be confused with this.Renderer
     * which is the instance of the renderer.
     *
     * @type {obj}
     * @protected
     */
    this.XRenderer = null;



    /**
     * @type {?string}
     * @protected
     */
    this.orientation = null;



    /**
     * @type {?goog.Timer}
     * @private
     */
    this.progressTimer_ = null;



    /**
     * @type {?X.renderer2D | ?X.renderer3D}
     * @protected
     */  
    this.Renderer = null;



    /**
     * @type {?Element}
     * @protected
     */  
    this.container_ = null;



    /**
     * @type {!Array.string}
     * @private
     */
    this.xObjs_ = [];


    /**
     * @private
     * @type {number}
     */
    this.renderProgress_;
}
goog.inherits(xiv.vis.XtkPlane, goog.events.EventTarget);
goog.exportSymbol('xiv.vis.XtkPlane', xiv.vis.XtkPlane);



/**
* @param {boolean}
*/
xiv.vis.XtkPlane.prototype.isOn_ = true;



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
 * Searches the DOM and for XTK's render bar.  This was chosen over inheriting
 * the 'onProgress' method in the XtkRenderer classes because it created 
 * awkard timing issues for UX.
 * 
 * @protected
 */
xiv.vis.XtkPlane.prototype.checkRenderProgress_ = function() {
    this.progressTimer_ = goog.Timer.callOnce(function() {
	// destroy the timer
	this.progressTimer_ = null; 

	// get the progress-bar thumbnail from DOM
	var progThumb = goog.dom.getElementByClass('progress-bar-thumb', 
						   this.Renderer.container);

	// exit out if at 100% and send RENDER_END event.
	if (!progThumb){
	    this.renderProgress_ = 1;
	    this.dispatchEvent({
		type: xiv.vis.RenderEngine.EventType.RENDER_END,
		value: this.renderProgress_
	    })
	    return;
	}

	// set the render progress
	this.renderProgress_ = parseInt(progThumb.style.width, 10) / 100;

	// dispatch rednering event if not at 100%
	this.dispatchEvent({
	    type: xiv.vis.RenderEngine.EventType.RENDERING,
	    value: this.renderProgress_
	})

	// recurse
	this.checkRenderProgress_();

	// check again in 200 ms
    }.bind(this), 200); 
}




/**
 * @return {?XObject} The currently loaded xtk volume.
 */
xiv.vis.XtkPlane.prototype.getCurrentVolume = function(){
    return this.currVolume_;
};



/**
 * @param {!Element} containerElt
 * @public
 */
xiv.vis.XtkPlane.prototype.setContainer = function(containerElt) {
    if (!this.Renderer) { return }
    this.container_ = containerElt;
    this.Renderer.container = containerElt;
}




/**
 * @param {!Element} containerElt
 * @throws An error if the subclass construtor property 'XRenderer' is 
 *  undefined.
 * @public
 */
xiv.vis.XtkPlane.prototype.init = function(containerElt) {
    if (this.Renderer) { this.Renderer.destroy() } ;
    //this.Renderer = (this.id_ !== 'v') ? new X.renderer2D : new X.renderer3D(

    window.console.log(this.orientation, this);
    if (!goog.isDefAndNotNull(this.XRenderer)){
	throw new Error('XtkPlane subclass must have the' +
			' property "XRenderer" defined.')
    }
    this.Renderer =  new this.XRenderer();
    this.Renderer.orientation = this.orientation;
    this.setContainer(containerElt || this.container_ || document.body);
    this.Renderer.init();
}



/**
* @param {X.object} xObj
*/
xiv.vis.XtkPlane.prototype.add = function(xObj) {

    if (!this.isOn_){
	window.console.log('Not adding xObj to Plane' + this.orientation);
	return;
    }

    window.console.log("NEED TO IMPLEMENT VOLUME HANDLING FOR 2D PLANES");
    if(xObj.isSelectedVolume === true) {
	//console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
    }
    this.xObjs_.push(xObj);
    this.Renderer.add(xObj);
};



/**
 * @retrurn {!boolean}
 * @public
 */
xiv.vis.XtkPlane.prototype.isOn = function(on) {
    return this.isOn_;
}



/**
* @param {!boolean} on
 * @public
 */
xiv.vis.XtkPlane.prototype.setOn = function(on) {
    this.isOn_ = !(on === false);
}



/**
 * @public
 */
xiv.vis.XtkPlane.prototype.render = function() {
    if (!this.isOn_) { 
	window.console.log('Plane' + this.orientation + ' is switched off.');
	return 
    };

    this.Renderer.render();  
    this.checkRenderProgress_();
};



/**
 * @public
 */
xiv.vis.XtkPlane.prototype.updateStyle = function() {
    this.Renderer.onResize();  
};



/**
* @inheritDoc
 */
xiv.vis.XtkPlane.prototype.dispose = function() {
    goog.base(this, 'dispose');

    goog.dispose(this.progressTimer); 
    this.Renderer.destroy();

    // prototype
    delete this.isOn_;

    delete this.XRenderer;
    delete this.container_;
    delete this.orientation;
    delete this.xObjs_;
    delete this.currVolume_;
    delete this.renderProgress_;

    // progress timer
    this.progressTimer_.dispose();
    delete this.progressTimer_;
};
