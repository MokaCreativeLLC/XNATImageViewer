/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events.EventTarget');




/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.renderer.Engine');
xiv.renderer.Engine = function () {
     goog.base(this);
}
goog.inherits(xiv.renderer.Engine, goog.events.EventTarget);
goog.exportSymbol('xiv.renderer.Engine', xiv.renderer.Engine);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.renderer.Engine.prototype.ID_PREFIX =  'xiv.renderer.Engine';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.renderer.Engine.EventType = {
    RENDER_START: 'render-start',
    RENDERING: 'rendering',
    RENDER_END: 'render-end',
}

