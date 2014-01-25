/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');

// utils
goog.require('utils.events');

// xiv
goog.require('xiv.Widget');


/**
 *
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.PathSelector');
xiv.PathSelector = function () {
    
    //
    // Other init functions
    //
    //utils.events.addEventManager(this, xiv.PathSelector.EventType);
}
goog.inherits(xiv.PathSelector, xiv.Widget);
goog.exportSymbol('xiv.PathSelector', xiv.PathSelector);



/**
 * Event types.
 * @enum {string}
 */
xiv.PathSelector.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  THUMBNAILCLICK: goog.events.getUniqueId('thumbnailclick'),
  THUMBNAILDROP: goog.events.getUniqueId('thumbnaildrop'),
};






