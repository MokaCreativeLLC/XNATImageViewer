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
* @param {!Array.string} idPrefixes The array of id prefixes.
* @param {string=}  opt_iconSrcFolder Defaults to ''. 
* @param {string=}  opt_iconExt Defaults to .png.
*/
utils.dom.createBasicHoverButtonSet = function(idPrefixes, opt_iconSrcFolder, opt_iconExt){
    
    if (!goog.isArray(idPrefixes)){
	throw new TypeError('Array expected!', idPrefixes);
    }

    if (opt_iconSrcFolder && !goog.isString(opt_iconSrcFolder)){
	throw new TypeError('String expected!', opt_iconSrcFolder);
    }

    if (opt_iconExt && !goog.isString(opt_iconExt)){
	throw new TypeError('String expected!', opt_iconExt);
    }


    /**
     * @dict
     */
    var buttonSet = {};


    /**
     * @type {!string}
     */
    var ext = opt_iconExt ? opt_iconExt : 'png';


    var key = '';
    for (var i=0, len = idPrefixes.length; i < len; i++){
	key = idPrefixes[i];
	buttonSet[key] = utils.dom.createBasicHoverButton(key, {
	    'src': opt_iconSrcFolder ? 
		goog.string.path.join(opt_iconSrcFolder, 
		goog.string.toSelectorCase(key) + '.' + ext) : '',
	})
    }


    return buttonSet;
}




/**
 * Creates a basic button.
 *
 * @param {!string} idPrefix 
 * @param {Object=} opt_attrs
 * @param {number=} opt_mouseOverOpacity Defaults to 1.
 * @param {number=} opt_mouseOutOpacity Defaults to 0.5.
 * return {!Element}
 * @private
 */
utils.dom.createBasicHoverButton = function(idPrefix, opt_attrs, opt_mouseOverOpacity, opt_mouseOutOpacity){

    if (!goog.isString(idPrefix)){
	throw new TypeError('String expected!');
    }
    if (opt_attrs && !goog.isObject(opt_attrs)){
	throw new TypeError('Object expected!');
    }
    if (goog.isDefAndNotNull(opt_mouseOverOpacity) 
	&& !goog.isNumber(opt_mouseOverOpacity)){
	throw new TypeError('Number expected!');
    }
    if (goog.isDefAndNotNull(opt_mouseOutOpacity) 
	&& !goog.isNumber(opt_mouseOutOpacity)){
	throw new TypeError('Number expected!');
    }


    var attrs = opt_attrs ? opt_attrs : {};
    var buttonDiv = utils.dom.createUniqueDom('div', idPrefix, attrs);

    //
    // Make an 'img' element if there's a 'src' attrib.
    //
    if (opt_attrs && opt_attrs['src']){
	var imgElt = goog.dom.createDom('img', {
	    'src': opt_attrs['src']
	})
	// Restyle image to fit in div
	imgElt.style.backgroundSize = 'contain';
	imgElt.style.maxWidth = '100%';
	imgElt.style.maxHeight = '100%';
	goog.dom.append(buttonDiv, imgElt)
	imgElt.onclick = imgElt.parentNode.onclick;
    }


    //
    // Set the opacity values
    //
    opt_mouseOverOpacity = opt_mouseOverOpacity === undefined 
	? 1 : opt_mouseOverOpacity;
    opt_mouseOutOpacity = opt_mouseOutOpacity === undefined 
	? .5 : opt_mouseOutOpacity;

    utils.fx.setBasicHoverStates(buttonDiv, 
				 opt_mouseOverOpacity, 
				 opt_mouseOutOpacity); 
   
    return buttonDiv
}





/**
 *
 * @param {!string} type
 * @param {!string} idPrefix
 * @param {!Object} opt_attrs
 * @return {!Elemehnt}
 */
utils.dom.createUniqueDom = function (type, idPrefix, opt_attrs) {

    if (!goog.isString(type)){
	throw new TypeError('String expected!', type);
    }
    if (!goog.isString(idPrefix)){
	throw new TypeError('String expected!', idPrefix);
    }
    if (opt_attrs && !goog.isObject(opt_attrs)){
	throw new TypeError('Object expected!');
    }
    
    /**
     * @dict
     */
    var opt_attrs = opt_attrs && goog.isObject(opt_attrs) ? opt_attrs : {}


    //
    // Allow only letters in the id prefix
    //
    var id = utils.string.getLettersOnly(idPrefix);

    opt_attrs['id'] = opt_attrs['id'] ? opt_attrs['id'] : 
	goog.string.toSelectorCase(id) 
	+ '_' + goog.string.createUniqueString();

    opt_attrs['class'] = opt_attrs['class'] ? opt_attrs['class'] : 
	goog.string.toSelectorCase(id);

    return goog.dom.createDom(type, opt_attrs);
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
