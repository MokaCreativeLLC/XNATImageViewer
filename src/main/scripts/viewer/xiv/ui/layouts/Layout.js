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
goog.require('xiv.ui.layouts.Plane');




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
* @inheritDoc
*/
xiv.ui.layouts.Layout.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
}

