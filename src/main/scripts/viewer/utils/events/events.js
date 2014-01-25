/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');

// utils
goog.require('utils.style');




/**
 * @param {!Object} obj The obj to add the event manager to.
 * @param {!eventTypes} eventTypes The eventTypes enums of the object.
 * @public
 */
utils.events.addEventManager = function(obj, eventTypes){

    if (!obj){
	throw 'Invalid obj argument for addEventManager: \'' + obj + '\'.';
    }

    if (!eventTypes){
	throw 'Invalid eventTypes argument for addEventManager: \'' + eventTypes + '\'.';
    }

    /**
     * @param {!utils.events.EventManager}
     * @protected
     */ 
    obj['EVENTS'] = new utils.events.EventManager(eventTypes);

}
goog.exportSymbol('utils.events.addEventManager', utils.events.addEventManager);


