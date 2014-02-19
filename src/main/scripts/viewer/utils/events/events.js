/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// utils
goog.require('utils.events.EventManager');




/**
 * Very basic event management class when simple event management is needed
 * in contrast with goog.events.
 * @constructor
 */
goog.provide('utils.events');
utils.events = function(){}
goog.exportSymbol('utils.events', utils.events);




/**
 * Adds an event manager to the given object by adding the string property
 * 'EVENTS' to the object.  Since Google closure does not intervene with string
 * properties, this *should* be a conflict-free property, but it needs further
 * verification.
 * @param {!Object} obj The obj to add the event manager to.
 * @param {!eventTypes} eventTypes The eventTypes enums of the object that 
 *     should be defined PER object.
 * @raise Error if no eventType enum is defined.
 * @public
 */
utils.events.addEventManager = function(obj, eventTypes){

    if (!obj){
	throw 'Invalid obj argument for addEventManager: \'' + obj + '\'.';
    }

    if (!eventTypes){
	throw 'Invalid eventTypes argument for addEventManager: \'' + 
	    eventTypes + '\'.';
    }

    /**
     * @type {!utils.events.EventManager}
     */ 
    obj['EVENTS'] = new utils.events.EventManager(eventTypes);

}
goog.exportSymbol('utils.events.addEventManager', utils.events.addEventManager);


