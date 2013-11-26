/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure indcludes
 */
goog.require('goog.ui.Slider');
goog.require('goog.ui.ProgressBar');
goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.dom'); 
goog.require('goog.style'); 
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');




/**
 * Class containing various utility methods.
 *
 * @constructor
 */
goog.provide('utils');
utils = function() {};
goog.exportSymbol('utils', utils);




/**
 * Class containing various global 
 * 
 * @constructor
 */
goog.provide("utils.globals");
utils.globals = function(){};
goog.exportSymbol('utils.globals', utils.globals);




utils.globals.prototype.fontSizeS = /** @const @type {number}*/ 10;
utils.globals.prototype.fontSizeM = /** @const @type {number}*/ 13;
utils.globals.prototype.fontSizeL = /** @const @type {number}*/ 16;
utils.globals.prototype.fontFamily = /** @const @type {string}*/ 'Helvetica, Helvetica neue, Arial, sans-serif';