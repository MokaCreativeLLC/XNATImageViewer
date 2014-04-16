/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');
goog.require('moka.ui.Component');

// xiv
goog.require('xiv.ui.Plane');




/**
 * xiv.ui.layouts.Layout
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.layouts.Layout');
xiv.ui.layouts.Layout = function() {
    if (!this.constructor.TITLE){
	window.console.log('\n\n\n\n' + 
			   'This is the class attempting to inherit from it:');
	window.console.log(this);
	throw new Error('Sublcasses of xiv.ui.layous.Layout must have ' + 
			' the TITLE defined as a constructor property!');

    }
    goog.base(this);


    /**
     * @type {Object.<string, xiv.ui.layout.Plane>}
     * @protected
     */
    this.Planes = {};
}
goog.inherits(xiv.ui.layouts.Layout, moka.ui.Component);
goog.exportSymbol('xiv.ui.layouts.Layout', xiv.ui.layouts.Layout);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Layout.EventType = {
    RESIZE: goog.events.getUniqueId('resize')
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Layout.INTERACTORS = {
    SLIDER: goog.string.createUniqueString(),
    DISPLAY: goog.string.createUniqueString()
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Layout.ID_PREFIX =  'xiv.ui.layouts.Layout';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Layout.CSS_SUFFIX = {}



/**
 * @type {!number}
 * @private
 */
xiv.ui.layouts.Layout.prototype.minPlaneWidth_ = 20;



/**
 * @type {!number}
 * @private
 */
xiv.ui.layouts.Layout.prototype.minPlaneHeight_ = 20;



/**
 * @param {!number} h
 * @private
 */
xiv.ui.layouts.Layout.prototype.setMinPlaneHeight = function(h){
    this.minPlaneHeight_ = h;
}



/**
 * @param {!number} w
 * @private
 */
xiv.ui.layouts.Layout.prototype.setMinPlaneWidth = function(w){
    this.minPlaneWidth_ = w;
}


/**
 * @return {Object.<string, xiv.ui.layout.Plane>}
 */
xiv.ui.layouts.Layout.prototype.getPlanes = function(){
    return this.Planes;
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.Plane}
 */
xiv.ui.layouts.Layout.prototype.getPlaneByTitle = function(title){
    return this.Planes[title];
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.Plane}
 */
xiv.ui.layouts.Layout.prototype.getPlaneInteractors = function(title) {
    
    window.console.log(title, this.Planes[title]);
    var objs = /**@type{!Object}*/ {};

    goog.object.forEach(xiv.ui.layouts.Layout.INTERACTORS, function(inter){
	objs[inter]  =  this.Planes[title][inter]
    }.bind(this))

    window.console.log("INTERACTORS!", objs);
    return objs;
};



/**
 * @return {!string}
 */
xiv.ui.layouts.Layout.prototype.getTitle = function(){
    return this.constructor.TITLE;
}



/**
 * @param {!xiv.ui.layout.Plane} plane
 */
xiv.ui.layouts.Layout.prototype.addPlane = function(plane){
    this.Planes = this.Planes ? this.Planes : {};
    this.Planes[plane.getTitle()] = plane;
    //window.console.log("PLANES", plane, this.Planes);
}


/**
* @protected
*/
xiv.ui.layouts.Layout.prototype.dispatchResize = function(){
    this.dispatchEvent({
	type: xiv.ui.layouts.Layout.EventType.RESIZE
    })
}



/**
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    this.dispatchResize();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    delete this.minPlaneHeight_;
    delete this.minPlaneWidth_;

    moka.ui.disposeComponentMap(this.Planes_);
    delete this.Planes_;
}
