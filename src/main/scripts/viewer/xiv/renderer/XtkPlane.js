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
    this.setContainer(containerElt);
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
	//this.progTimer_.dispose();
	this.progTimer_ = null; // destroy the timer

	//window.console.log("SHOWTIME!");
	visBars = goog.dom.getElementsByClass('progress-bar-thumb');
	if (!visBars || visBars.length == 0){
	    this.renderProgress_ = 100;
	    return;
	}
	//progBar = visBars[0];
	//progBarThumb = 
	  //  goog.dom.getElementsByClass('progress-bar-thumb')[0];
	
	this.renderProgress_ = parseInt(
	    goog.dom.getElementsByClass('progress-bar-thumb', 
			this.Renderer.container)[0].style.width, 10);
	
	window.console.log("RENDER PROGRESS", this.renderProgress_);

	/**
	progBarThumb.style.background = '#68C2DF';
	progBar.style.background = 'rgb(80,80,80)';
	progBar.style.width = '80%';
	progBar.style.height = '7px';
	progBar.style.left = '10%';
	progBar.style.border = '0px';
	progBar.style.padding = '0px';
	*/

	/**
	if (parseInt(progBarThumb.style.width) == 100){
	    if (!this.progClone){
		progBar.style.opacity = 0;
		this.progClone = progBar.cloneNode(true);
		this.progClone.style.opacity = 1;
		progBar.parentNode.appendChild(this.progClone);
		this.progClone.style.zIndex = 100000;
		moka.fx.fadeOutAndRemove(this.progClone, 1000)
	    }
	} else {
	    progBar.style.opacity = 1;
	}
	*/

	this.checkRenderProgress_();

    }.bind(this), 100); // check again in 100 ms
}



/**
 * @public
 */
xiv.renderer.XtkPlane.prototype.render = function() {
    this.Renderer.render();  
  //goog.dom.getElementsByClass('progress-bar-horizontal')[0].style.opacity = 0;
    this.checkRenderProgress_();
};




/**
d * @inheritDoc
 */
xiv.renderer.XtkPlane.prototype.dispose = function() {
    goog.base(this, 'dispose');

    goog.dispose(this.progTimer); 
    this.Renderer.destroy();

    delete this.XRenderer;
    delete this.container_;
    delete this.orientation;
    delete this.xObjs_;
    delete this.currVolume_;
    delete this.renderProgress_;
};
