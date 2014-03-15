/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');
goog.require('moka.ui.Component');




/**
 * xiv.ui.layouts.Plane
 *
 * @constructor
 * @param {!string} title The title of the plane.
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.layouts.Plane');
xiv.ui.layouts.Plane = function(title) {
    goog.base(this);
    
    /**
     * @type {!string}
     * @private
     */
    this.title_ = title;
}
goog.inherits(xiv.ui.layouts.Plane, moka.ui.Component);
goog.exportSymbol('xiv.ui.layouts.Plane', xiv.ui.layouts.Plane);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Plane.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Plane.ID_PREFIX =  'xiv.ui.layouts.Plane';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Plane.CSS_SUFFIX = {}



/**
 * @return {!string}
 */
xiv.ui.layouts.Plane.prototype.getTitle = function(){
    return this.title_
}
