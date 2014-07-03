/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events.EventTarget');
goog.require('goog.events');

//-----------


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.vis.RenderEngine');
xiv.vis.RenderEngine = function () {
     goog.base(this);
}
goog.inherits(xiv.vis.RenderEngine, goog.events.EventTarget);
goog.exportSymbol('xiv.vis.RenderEngine', xiv.vis.RenderEngine);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.vis.RenderEngine.prototype.ID_PREFIX =  'xiv.vis.RenderEngine';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.vis.RenderEngine.EventType = {
    RENDER_START: goog.events.getUniqueId('render-start'),
    RENDERING: goog.events.getUniqueId('rendering'),
    RENDER_END: goog.events.getUniqueId('render-end'),
}




goog.exportSymbol('xiv.vis.RenderEngine.EventType',
	xiv.vis.RenderEngine.EventType);
goog.exportSymbol('xiv.vis.RenderEngine.prototype.ID_PREFIX',
	xiv.vis.RenderEngine.prototype.ID_PREFIX);
