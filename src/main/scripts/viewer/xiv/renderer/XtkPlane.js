/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */



/**
 * @constructor
 * 
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.renderer.XtkPlane');
xiv.renderer.XtkPlane = function() {
    goog.base(this);


    /**
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
    this.progTimer_ = null;



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


    window.console.log("\n\n\n\nTHIS IS ON", this.isOn_);
}
goog.inherits(xiv.renderer.XtkPlane, goog.events.EventTarget);
goog.exportSymbol('xiv.renderer.XtkPlane', xiv.renderer.XtkPlane);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.renderer.XtkPlane.EventType = {
  RENDER_START: goog.events.getUniqueId('render-start'),
  RENDERING: goog.events.getUniqueId('rendering'),
  RENDER_END: goog.events.getUniqueId('render-end'),
}


/**
* @param {boolean}
*/
xiv.renderer.XtkPlane.prototype.isOn_ = true;


/**
 * @return {!string} The orientation.
 */
xiv.renderer.XtkPlane.prototype.getRenderer = function(){
    return this.Renderer;
};



/**
 * @return {!string} The orientation.
 */
xiv.renderer.XtkPlane.prototype.getOrientation = function(){
    return this.orientation;
};



/**
 * @return {?XObject} The currently loaded xtk volume.
 */
xiv.renderer.XtkPlane.prototype.getCurrentVolume = function(){
    return this.currVolume_;
};



/**
 * @param {!Element} containerElt
 * @public
 */
xiv.renderer.XtkPlane.prototype.setContainer = function(containerElt) {
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
xiv.renderer.XtkPlane.prototype.init = function(containerElt) {
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
xiv.renderer.XtkPlane.prototype.add = function(xObj) {

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
xiv.renderer.XtkPlane.prototype.isOn = function(on) {
    return this.isOn_;
}



/**
* @param {!boolean} on
 * @public
 */
xiv.renderer.XtkPlane.prototype.setOn = function(on) {
    this.isOn_ = !(on === false);
}



/**
 * @public
 */
xiv.renderer.XtkPlane.prototype.getRenderProgress = function() {
    return this.renderProgress_;
}



/**
 * @protected
 */
xiv.renderer.XtkPlane.prototype.checkRenderProgress_ = function() {


    this.progTimer_ = goog.Timer.callOnce(function() {

	this.progTimer_ = null; // destroy the timer
	var progThumb = goog.dom.getElementByClass('progress-bar-thumb', 
						   this.Renderer.container);

	if (!progThumb){
	    window.console.log("END HERE!");
	    this.renderProgress_ = 100;
	    this.dispatchEvent({
		type: xiv.renderer.XtkPlane.EventType.RENDER_END,
		percentComplete: this.renderProgress_
	    })
	    return;
	}

	this.renderProgress_ = parseInt(progThumb.style.width, 10);

	this.dispatchEvent({
	    type: xiv.renderer.XtkPlane.EventType.RENDERING,
	    percentComplete: this.renderProgress_
	})

	this.checkRenderProgress_();

    }.bind(this), 200); // check again in 100 ms
}



/**
 * @public
 */
xiv.renderer.XtkPlane.prototype.render = function() {
    this.Renderer.render();  
  //goog.dom.getElementsByClass('progress-bar-horizontal')[0].style.opacity = 0;
    //this.checkRenderProgress_();
};



/**
 * @public
 */
xiv.renderer.XtkPlane.prototype.updateStyle = function() {
    this.Renderer.onResize();  
};



/**
* @inheritDoc
 */
xiv.renderer.XtkPlane.prototype.dispose = function() {
    goog.base(this, 'dispose');

    goog.dispose(this.progTimer); 
    this.Renderer.destroy();

    // prototype
    delete this.isOn_;

    delete this.XRenderer;
    delete this.container_;
    delete this.orientation;
    delete this.xObjs_;
    delete this.currVolume_;
    delete this.renderProgress_;
};
