/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.ui.Slider');

// xtk
goog.require('X.renderer2D');
goog.require('X.renderer3D');

// utils
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.ui.GenericSlider');

// xiv
goog.require('moka.ui.Component');




/**
 * xiv.ui.XtkPlane is a class that represents the ViewPlane (X, Y, Z or V) 
 * responsible for visualizing XObjects in 2D or 3D space.
 * @constructor
 * @param {!string}
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.XtkPlane');
xiv.ui.XtkPlane = function(id) {
    goog.base(this);



    /**
     * @type {?X.renderer2D | ?X.renderer3D}
     */  
    this.Renderer_ = null;



    /**
     * @type {!string}
     * @private
     */
    this.indexPlane_ = 
	(id === 'x') ? 'indexLR' : (id === 'y') ? 'indexPA' : 'indexIS';


    /**
     * @type {!number}
     * @private
     */
    this.indexNumber_ = (id === 'x') ? 0 : (id === 'y') ? 1 : 2;






    /**
     * @type {?Element}
     * @private
     */
    this.indexBox_ = null;





    
    this.resetRenderer();

}
goog.inherits(xiv.ui.XtkPlane, moka.ui.Component);
goog.exportSymbol('xiv.ui.XtkPlane', xiv.ui.XtkPlane);



/**
 * This exists so that governing classes
 * know what axis this ViewPlane represents.
 *
 * @return {string}
 * @private
 */
xiv.ui.XtkPlane.prototype.getId = function() {
    return this.id_;
}




/**
 * @param {!XObject} vol The xtk volume to set.
 */
xiv.ui.XtkPlane.prototype.setCurrVolume = function(vol){
    this.currVolume_ = vol;
};




/**
 * Clears the renderer of information so that it
 * can reload or take in new information.
 *
 * @type {function()}
 */
xiv.ui.XtkPlane.prototype.resetRenderer = function () {
    if (this.Renderer_) { this.Renderer_.destroy(); }
    this.Renderer_ = (this.id_ !== 'v') ? new X.renderer2D : new X.renderer3D();
    this.Renderer_.orientation = this.id_.toUpperCase();
    this.Renderer_.container = this.getElement();
    this.Renderer_.init();
}




/**
* @param {XObject}
*/
xiv.ui.XtkPlane.prototype.addToRenderer = function(xObj) {
    //console.log("add to renderer", xObj);
    //return;
    //------------------
    // Only add selected volumes to 2D renderers.
    //------------------
    if(xObj.isSelectedVolume === true) {
	//console.log("add selected vol", xObj);
	this.currVolume_ = xObj;
	this.Renderer_.add(xObj);

    

    //------------------
    // Add all else to the 3D renderer.
    //------------------
    } else if (this.id_ === 'v')  {
	 this.Renderer_.add(xObj);

    }


    this.xObjs_.push(xObj);


      goog.events.listen(xObj, X.event.events.COMPUTING_END, 
			 function(){
			     alert("END!");
			 });
};




/**
 * Callback that occurs right when renderer
 * redners.
 *
 * @param {function}
 */
xiv.ui.XtkPlane.prototype.setRendererOnShowtime = function(callback) {
    if (!this.Renderer_) { return };
    this.Renderer_.onShowtime = callback;
};



xiv.ui.XtkPlane.prototype.modifyProgBar = function() {


    // let's check again in a short time
    this._readyCheckTimer = goog.Timer.callOnce(function() {

	this._readyCheckTimer = null; // destroy the timer

	//window.console.log("SHOWTIME!");
	this.bars = goog.dom.getElementsByClass('progress-bar-horizontal');
	if (!this.bars || this.bars.length == 0){
	    this.bars = null;
	    this.progBar = null;
	    this.progBarThumb = null;

	    delete this.bars;
	    delete this.progBar;
	    delete this.progBarThumb;
	    return;
	}
	

	this.progBar = this.bars[0];
	this.progBarThumb = 
	    goog.dom.getElementsByClass('progress-bar-thumb')[0];

	this.progBarThumb.style.background = '#68C2DF';
	this.progBar.style.background = 'rgb(80,80,80)';
	this.progBar.style.width = '80%';
	this.progBar.style.height = '7px';
	this.progBar.style.left = '10%';
	this.progBar.style.border = '0px';
	this.progBar.style.padding = '0px';

	if (parseInt(this.progBarThumb.style.width) == 100){
	    if (!this.progClone){
		this.progBar.style.opacity = 0;
		this.progClone = this.progBar.cloneNode(true);
		this.progClone.style.opacity = 1;
		this.progBar.parentNode.appendChild(this.progClone);
		this.progClone.style.zIndex = 100000;
		moka.fx.fadeOutAndRemove(this.progClone, 1000)
	    }
	} else {
	    this.progBar.style.opacity = 1;
	}

	this.modifyProgBar();

    }.bind(this), 100); // check again in 500 ms
}


/**
 * @type {function}
 */
xiv.ui.XtkPlane.prototype.render = function() {

    this.Renderer_.render();  
    goog.dom.getElementsByClass('progress-bar-horizontal')[0].style.opacity = 0;
    this.modifyProgBar();
};







