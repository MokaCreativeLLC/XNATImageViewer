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
 * xiv.ui.Layout
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.Layout');
xiv.ui.Layout = function() {
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
goog.inherits(xiv.ui.Layout, moka.ui.Component);
goog.exportSymbol('xiv.ui.Layout', xiv.ui.Layout);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.Layout.EventType = {
    RESIZE: goog.events.getUniqueId('resize')
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.Layout.INTERACTORS = {
    SLIDER: goog.string.createUniqueString(),
    DISPLAY: goog.string.createUniqueString()
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Layout.ID_PREFIX =  'xiv.ui.Layout';



/**
 * @enum {string}
 * @public
 */
xiv.ui.Layout.CSS_SUFFIX = {}



/**
 * @return {Object.<string, xiv.ui.layout.Plane>}
 */
xiv.ui.Layout.prototype.getPlanes = function(){
    return this.Planes;
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.Plane}
 */
xiv.ui.Layout.prototype.getPlaneByTitle = function(title){
    return this.Planes[title];
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layout.Plane}
 */
xiv.ui.Layout.prototype.getPlaneInteractors = function(title) {
    
    window.console.log(title, this.Planes[title]);
    var objs = /**@type{!Object}*/ {};

    goog.object.forEach(xiv.ui.Layout.INTERACTORS, function(inter){
	objs[inter]  =  this.Planes[title][inter]
    }.bind(this))

    window.console.log("INTERACTORS!", objs);
    return objs;
};



/**
 * @return {!string}
 */
xiv.ui.Layout.prototype.getTitle = function(){
    return this.constructor.TITLE;
}



/**
 * @param {!xiv.ui.layout.Plane} plane
 */
xiv.ui.Layout.prototype.addPlane = function(plane){
    this.Planes = this.Planes ? this.Planes : {};
    this.Planes[plane.getTitle()] = plane;
    //window.console.log("PLANES", plane, this.Planes);
}



/**
* @inheritDoc
*/
xiv.ui.Layout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');

    this.dispatchEvent({
	type: goog.events.EventType.RESIZE
    })
}



/**
* @inheritDoc
*/
xiv.ui.Layout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    window.console.log("Need to implement disposeInternal for: " + 
		       this.constructor.ID_PREFIX);
}
