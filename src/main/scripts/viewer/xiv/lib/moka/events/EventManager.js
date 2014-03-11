/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');



/**
 * This class exists as a *simple* means of managing 
 * events associated with a certain event type for a given object.
 * This class was created because native Closure event 
 * management was overly complex for certain tasks.
 * For managing a large set of complex events, Closure should be
 * used.
 *
 * @constructor
 * @param {!Object.<string, string>} eventTypes The enum of the event types for
 *    the object to follow.
 */
goog.provide('moka.events.EventManager');
moka.events.EventManager = function (eventTypes) {
    
    if (!eventTypes){
	throw 'Invalid eventTypes constructor argument: \'' + eventTypes + 
	    '\'.';
    }

    var key = /**@type {!string} */ '';

    /**
     * The event types provided by the event objects.
     * @type {!Object<string, string>}
     * @private
     */
    this.eventTypes_ = eventTypes
    

    /**
     * The basic event-tracking object.
     * @type {!Object.<string, Array.function>}
     * @private
     */
    this.events_ = {}
    for (key in this.eventTypes_){
	this.events_[key] = [];
    }


    /**
     * The tracking object for suspended events.
     * @type {!Object.<string, boolean>}
     * @private
     */
    this.suspendedEvents_ = {}
    for (key in this.eventTypes_){
	this.suspendedEvents_[key] = false;
    }
};
goog.exportSymbol('moka.events.EventManager', moka.events.EventManager);



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
moka.events.EventManager.addEventManager = function(obj, eventTypes){

    if (!obj){
	throw 'Invalid obj argument for addEventManager: \'' + obj + '\'.';
    }

    if (!eventTypes){
	throw 'Invalid eventTypes argument for addEventManager: \'' + 
	    eventTypes + '\'.';
    }

    /**
     * @type {!moka.events.EventManager}
     */ 
    obj['EVENTS'] = new moka.events.EventManager(eventTypes);

}
goog.exportSymbol('moka.events.EventManager.addEventManager', 
		  moka.events.EventManager.addEventManager);




/**
 * As stated.
 * @return {!Object<string, string>} The stored event types.
 * @public
 */
moka.events.EventManager.prototype.getEventTypes = function(){
    return this.eventTypes_
}




/**
 * Allows to user to associate a callback with a given event.
 * @param {!string} eventType The eventType to refer to.
 * @param {!function} callback The callback function to associate with the 
 *    event type.
 * @public
 */
moka.events.EventManager.prototype.onEvent = function(eventType, callback){
    if (!goog.isFunction(callback)){
        throw new TypeError('Function expected!');
    }
    this.checkEventType_(eventType);
    if (!goog.array.contains(this.events_[eventType], callback)){
	this.events_[eventType].push(callback);
    }
}




/**
 * Runs events based on the argument.
 * @param {!string} eventType The eventType to refer to.
 * @param {...} opt_args The variable amount of arguments.
 * @public
 */
moka.events.EventManager.prototype.runEvent = function(eventType){
    this.checkEventType_(eventType);
    if (!this.suspendedEvents_[eventType]){
	var i = /**@type {!number}*/ 0;
	var len = /**@type {!number}*/ this.events_[eventType].length;
	for (i=0; i<len; i++){
	    this.events_[eventType][i].apply(null, 
	      Array.prototype.splice.call(arguments, 1));
	}
    }
}



/**
 * Returns the event callbacks based on the argument.
 * @param {!string} eventType The eventType to refer to.
 * @retirn {Array.function} The event callbacks.
 * @public
 */
moka.events.EventManager.prototype.getEventCallbacks = function(eventType){
    this.checkEventType_(eventType);
    return this.events_[eventType];    
}



/**
 * As stated.
 * @param {!string} eventType The eventType to refer to.
 * @param {!function} callback The callback function to remove from the event.
 * @return {!boolean} Whether the callback removal was successful.
 * @public
 */
moka.events.EventManager.prototype.removeEventCallback = function(eventType, 
								   callback){
    this.checkEventType_(eventType);
    return goog.array.remove(this.events_[eventType], callback);
}




/**
 * Clears the callbacks associated with a given event.
 * @param {!string} eventType The eventType to refer to.
 * @public
 */
moka.events.EventManager.prototype.clearEvent = function(eventType){
    this.checkEventType_(eventType);
    this.events_[eventType] = [];
}




/**
 * Allows the user to suspend an event type.
 * @param {!string} eventType The eventType to refer to.
 * @param {!boolean} suspend Whether event should be suspended.
 * @public
 */
moka.events.EventManager.prototype.setEventSuspended = function(eventType, 
								 suspend){
    this.checkEventType_(eventType);
    this.suspendedEvents_[eventType] = suspend;
}




/**
 * Allows the user to suspend all events.
 * @param {!boolean} suspend Whether event should be suspended.
 * @public
 */
moka.events.EventManager.prototype.setAllEventsSuspended = function(suspend){
    var key = /**@type {!string} */ '';
    for (key in this.suspendedEvents_){
	this.suspendedEvents_[key] = suspend;
    }
}



/**
 * Checks if the eventType is a registered event type.
 * @param {!string} eventType The eventType to refer to.
 * @throw Error if the eventType is not registered.
 * @private 
 */
moka.events.EventManager.prototype.checkEventType_ = function(eventType){
    if (!(eventType in this.events_)){
	throw 'Invalid eventType: \'', eventType, 
	'\'. Valid events are: ', this.eventTypes_;
    }    
}


