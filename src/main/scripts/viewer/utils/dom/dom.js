/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.dom');

/**
 * utils includes
 */




/**
 * 'utils.com' is a utility class that handles element and 
 * dom operations.
 *
 * @constructor
 */
goog.provide('utils.dom');
utils.dom = function () {};
goog.exportSymbol('utils.dom', utils.dom);




/**
 * Adds both properites and methods to a given 
 * object that allow for simple callback managment:
 * add, remove and run.
 *
 * @param {!Object}
 */
utils.dom.addCallbackManager = function (obj) {
    
    //------------------
    // Set an object property called 'callbacks'
    //------------------
    obj.callbacks = {}
    


    //------------------
    // Define the 'add' method.
    //------------------
    obj.addCallback = function (key, callback) {
	if (!obj.callbacks[key]) {
	    obj.callbacks[key] = [];
	}
	if (obj.callbacks[key].indexOf(callback) === -1) {
	    obj.callbacks[key].push(callback);
	}
    }
    


    //------------------
    // Define the 'remove' method.
    //------------------
    obj.removeCallback = function (key, callback) {		
	var ind = obj.callbacks[key].indexOf(callback);
	if (ind > -1) {
	    obj.callbacks[key].splice(ind, 1);
	}
    }
    


    //------------------
    // Define the 'run' method.
    //------------------
    obj.runCallbacks = function (key) {
	for (var i = 0, len = obj.callbacks[key].length; i < len; i++) {			
	    obj.callbacks[key][i]();
	    
	}
    }

}




/**
 * Multi-browser debug output. 
 *
 * NOTE: the user should still specify the location
 * of the message in the 'msg' argument.
 *
 * @param {!string}
 */
utils.dom.debug = function (msg) {
    window.console && console.log(msg);
}




/**
 * Multi-browser acquisition of the x and y 
 * coordinates of the mouse.
 *
 * @param {event}
 */
utils.dom.getMouseXY = function (e) {
    if (navigator.appName === 'Microsoft Internet Explorer') {
      tempX = e.clientX + document.body.scrollLeft;
      tempY = e.clientY + document.body.scrollTop;
    }
    else {  

      // grab the x-y pos.s if browser is NS
      tempX = e.pageX;
      tempY = e.pageY;
    }  

    if (tempX < 0) {tempX = 0;}
    if (tempY < 0) {tempY = 0;}  

    return {'x':tempX, 'y':tempY};
}





/**
 * Creates a basic button.
 *
 * @param {Object.<string, string | number | function>=} opt_attrs
 * @param {number=} opt_mouseOverOpacity
 * @param {number=} opt_mouseOutOpacity
 * return {Element}
 * @private
 */
utils.dom.createBasicHoverButton = function(opt_attrs, opt_mouseOverOpacity, opt_mouseOutOpacity){

    var type = (opt_attrs && opt_attrs['src']) ? 'img' : 'div';
    var attrs = opt_attrs ? opt_attrs : {};
    var basicButton = goog.dom.createDom(type, attrs);

    opt_mouseOverOpacity = opt_mouseOverOpacity === undefined 
	? 1 : opt_mouseOverOpacity;
    opt_mouseOutOpacity = opt_mouseOutOpacity === undefined 
	? .5 : opt_mouseOutOpacity;

    utils.fx.setBasicHoverStates(basicButton, 
				 opt_mouseOverOpacity, 
				 opt_mouseOutOpacity); 
   
    return basicButton
}





/**
 * Merges two javaScript objects, giving obj2 the priority.
 *
 * @param {?Object, ?Object, number=}
 * return {Object}
 */
utils.dom.mergeArgs = function (obj1, obj2, opt_recursionDepth) {
    var recDepth = (opt_recursionDepth) ? opt_recursionDepth : 2; 
    var obj3 = {};



    //------------------
    // Add obj1's attributes to obj3
    //------------------
    for (var attr in obj1) { 
    	obj3[attr] = obj1[attr]; 
    }



    //------------------
    // Merge with object2, performing recursion
    // as needed.
    //------------------
    if (obj2) {
	for (var attr in obj2) { 
	    //utils.dom.debug(obj2[attr] + " " + obj2[attr].toString())
	    if (obj2[attr] && (obj2[attr].toString() === '[object Object]') && (attr in obj3)) {
	    	//utils.dom.debug("Found an existing object within an object when merging: " + attr + " " + obj2[attr])
	    	obj3[attr] = utils.dom.mergeArgs(obj3[attr], obj2[attr]);
	    }
	    else{
		obj3[attr] = obj2[attr];     		
	    }
	}   	
    }


    return obj3;
}





/**
 * Prevents the propagation of an event
 * to its parent elements.
 *
 * @param {Event}
 */
utils.dom.stopPropagation = function (e) {
	if (!e) var e = window.event;
		e.cancelBubble = true;
	if (e.stopPropagation) 
		e.stopPropagation();
}




/**
 * Generates a unique id string. 
 * From: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 *
 * @param {Event}
 */
utils.dom.uniqueId = function () {
	
    function __s4__() {
	return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
    };

    return __s4__() + __s4__() + '-' + __s4__() + '-' + __s4__() + '-' +
        __s4__() + '-' + __s4__() + __s4__() + __s4__();	
}




/**
 * Determines if there's an argument match between 'templateArgs' and 'args'
 * with template being the priority.  Applies a callback at the end
 * if needed.
 *
 * @param {!string, !Object.<string, Object>, !Object.<string, Object>, function=}
 */
utils.dom.validateArgs = function (originString, templateArgs, args, opt_callback) {
	
    //------------------
    // Check of the 'attr' key the templateArgs.
    //------------------
    var errorStr = "A " + originString + " has invalid arguments:";
    for (var attr in args) { 
    	if (! (attr in templateArgs)) {
    	    throw (errorStr + " '" + attr + "' "); 
    	}
    	else{
    	    
	    //
    	    // Recurse if the value is an object
	    //
   	    if (args[attr].toString() === '[object Object]') {
   		utils.dom.validateArgs(originString, templateArgs[attr], args[attr])
   	    } 		
    	}
    }

    if (opt_callback) { opt_callback() };
}




/**
 * Reads in a CSS provided by the 'className' argument
 * returning an object with its properties.
 *
 * @param {!string}
 * @return {Object}
 */ 
utils.dom.readCSS = function(className) {
    var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules
    for(var x=0; x < classes.length;  x++) {
        if(classes[x].selectorText == className) {
            (classes[x].cssText) ? alert(classes[x].cssText) : alert(classes[x].style.cssText);
        }
    }
    return classes;
}
