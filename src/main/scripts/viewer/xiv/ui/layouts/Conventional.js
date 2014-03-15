/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.Plane');





/**
 * xiv.ui.layouts.Conventional
 *
 * @constructor
 * @extends {xiv.ui.layouts.Layout}
 */
goog.provide('xiv.ui.layouts.Conventional');
xiv.ui.layouts.Conventional = function() { 
    goog.base(this);

    this.addPlane(new xiv.ui.layouts.Plane('X'));
    this.addPlane(new xiv.ui.layouts.Plane('Y'));
    this.addPlane(new xiv.ui.layouts.Plane('Z'));
    this.addPlane(new xiv.ui.layouts.Plane('V'));
}
goog.inherits(xiv.ui.layouts.Conventional, xiv.ui.layouts.Layout);
goog.exportSymbol('xiv.ui.layouts.Conventional', xiv.ui.layouts.Conventional);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.Conventional.TITLE = 'Conventional';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Conventional.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Conventional.ID_PREFIX =  'xiv.ui.layouts.Conventional';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Conventional.CSS_SUFFIX = {}




