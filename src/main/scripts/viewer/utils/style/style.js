/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure indcludes
 */
goog.require('goog.style');



/**
 * @constructor
 */
goog.provide('utils.style');
utils.style = function () {};
goog.exportSymbol('utils.style', utils.style);




/**
 * Full list of CSS properties.
 *
 * @const
 * @type {Array.<string>}
 */
utils.style.prototype.cssProperties = [
'azimuth',
'background-attachment',
'background-color',
'background-image',
'background-position',
'background-repeat',
'background',
'border-collapse',
'border-color',
'border-spacing',
'border-style',
'border-top', 'border-right', 'border-bottom', 'border-left',
'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
'border-width',
'border',
'bottom',
'caption-side',
'clear',
'clip',
'color',
'content',
'counter-increment',
'counter-reset',
'cue-after',
'cue-before',
'cue',
'cursor',
'direction',
'display',
'elevation',
'empty-cells',
'float',
'font-family',
'font-size',
'font-style',
'font-variant',
'font-weight',
'font',
'height',
'left',
'letter-spacing',
'line-height',
'list-style-image',
'list-style-position',
'list-style-type',
'list-style',
'margin-right', 'margin-left',
'margin-top', 'margin-bottom',
'margin',
'max-height',
'max-width',
'min-height',
'min-width',
'orphans',
'outline-color',
'outline-style',
'outline-width',
'outline',
'overflow',
'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
'padding',
'page-break-after',
'page-break-before',
'page-break-inside',
'pause-after',
'pause-before',
'pause',
'pitch-range',
'pitch',
'play-during',
'position',
'quotes',
'richness',
'right',
'speak-header',
'speak-numeral',
'speak-punctuation',
'speak',
'speech-rate',
'stress',
'table-layout',
'text-align',
'text-decoration',
'text-indent',
'text-transform',
'top',
'unicode-bidi',
'vertical-align',
'visibility',
'voice-family',
'volume',
'white-space',
'widows',
'width',
'word-spacing',
'z-index'
]




/**
 * Remove all classes from an element that 
 * contain 'containsStr' within it.
 *
 * @param {!Element, !string} elt The element to remove the class, 
 * containsStr The evaluation string -- if the class contains it, the class is removed.
 */
utils.style.removeClassesThatContain = function (elt, containsStr) {

    var classes = goog.dom.classes.get(elt);
    var removeClasses = [];

    

    //------------------
    // Loop throught the classes, track
    // all that contain 'containsStr'.
    //------------------
    containsStr = containsStr.toLowerCase();
    for (var i=0, len = classes.length; i < len; i++){
        if (classes[i].toLowerCase().indexOf(containsStr) > -1) {
            removeClasses.push(classes[i])
        }
    }
    


    //------------------
    // Remove all classes that met the criteria.
    //------------------
    for (var i=0, len = removeClasses.length; i < len; i++){
	goog.dom.classes.remove(elt, removeClasses[i]); 
    }
}





/**
 * Returns the absolute position of the element
 * provided in the argument.
 *
 * @param {!Element}
 * @return {Array.<number>}
 */
utils.style.absolutePosition = function ( elt) {
    return elt.getBoundingClientRect();
}




/**
 * Returns the offset dimensions of 
 * the provided element.
 *
 * @param {!Element} elt The element to calculate the offset dims on.
 * @return {Object.<string, number>} The offset dimensions.
 */
utils.style.offsetDims = function (elt) {
    
    var offsetDims = {'top': 0, 'left': 0};

    do {
	if ( !isNaN( elt.offsetTop ) )
	{
	    offsetDims['top'] += elt.offsetTop;
	}

	if ( !isNaN( elt.offsetLeft ) )
	{
	    offsetDims['left'] += elt.offsetLeft;
	}

    } while( elt = elt.offsetParent );


    return offsetDims
}




/**
 * Gets the in-line dimensions of a given element.
 *
 * @param {!Element, Array.<string>=|string=}
 * @return {Object.<string, number|string>}
 */
utils.style.dims = function (elt, arg1) {

    //------------------
    // If we're looking for just one attribute we 
    // go right to the kill...
    //------------------
    if (arg1 && typeof arg1 === 'string') {
	var val;
	
	switch(arg1) {
	case 'height':
	    return elt.clientHeight;// || $(elt).height();
	case 'width':
	    return elt.clientWidth;// || $(elt).width();
	case 'outerHeight':
	    return elt.offsetHeight;
	case 'outerWidth':
	    return elt.offsetWidth;
	case 'offsetTop':
	    return elt.offsetTop;
	case 'offsetLeft':
	    return elt.offsetLeft
	default:

	    val = /%emt/.test(elt.style[arg1]);
	    
	    if (!val) {
		return utils.convert.toInt(elt.style[arg1]);
	    }
	    
	    var p = goog.style.getRelativePosition(elt, elt.parentNode);
	    var posObj = {
		left: utils.convert.toInt(elt.style.left) || p.x,
		top: utils.convert.toInt(elt.style.top) || p.y
	    };

	    return posObj[arg1];
	    //return utils.convert.toInt(elt.style[arg1]) //||  $(elt).position()[arg1];
	    //return $(elt).position()[arg1];
	}



    //------------------
    // Otherwise, return an object with all style 
    // attributes.
    //------------------	
    } else {
	var retObj = {};
	var p = goog.style.getRelativePosition(elt, elt.parentNode);
	var posObj = {
	    left: utils.convert.toInt(elt.style.left) || p.x,
	    top: utils.convert.toInt(elt.style.top) || p.y
	};

	retObj = utils.dom.mergeArgs(retObj, posObj);		
	retObj['left'] = posObj.left;
	retObj['top'] = posObj.top;
	retObj['height'] = elt.clientHeight;
	retObj['width'] = elt.clientWidth;			
	retObj['outerHeight'] = elt.offsetWidth;
	retObj['outerWidth'] = elt.offsetHeight;
	retObj['offsetTop'] = elt.offsetTop;
	retObj['offsetLeft'] = elt.offsetLeft;	

	return retObj;
	
    }
}





/**
 * For getting the style parameters of an element where
 * it's style is derived from a stylesheet.
 *
 * @param {Element, string= | Array.<string=>}
 */
utils.style.getComputedStyle = function (elt, opt_key) {


    //------------------
    // If 'opt_key' is a string, not array...
    //--------------------
    if (opt_key && typeof opt_key === 'string'){
	return window.getComputedStyle(elt, null).getPropertyValue(opt_key) 




    //------------------
    // Otherwise, when 'opt_key' is an array.
    //------------------
    } else {
	if (opt_key === undefined) {
	    opt_key = utils.style.prototype.cssProperties;
	}
	var attrs = {};
	var styleSheet = window.getComputedStyle(elt, null);
	for (var i=0, len = opt_key.length; i < len; i++) {
	    attrs[opt_key[i]] = styleSheet.getPropertyValue(opt_key[i]);
	}
	return utils.style.parseIntNumericalProperties(attrs);
    }

}



/**
 * Conducts a parseInt on numerical style attributes.
 * Converts the strings accordingly.
 *
 * @param {Object.<string, string>}
 */
utils.style.parseIntNumericalProperties = function (obj) {
	
    var pxConvertArr = [
	'height', 
	'width', 
	'left', 
	'top', 
	'border-width',
	'borderWidth', 
	'borderRadius',  
	'border-radius',
	'fontSize',
	'fontSize',
	'margin',
	'margin-top',
	'marginTop',
	'marginLeft',
	'margin-left'
    ];

    for (key in obj) {
	for (var i = 0, len = pxConvertArr.length; i < len; i++){
	    if (key === pxConvertArr[i]) {
		obj[key] = utils.convert.toInt(obj[key]);
	    }
	}
    }	
    
    return obj
}




/**
 * Sets the style of a given element, in-line.
 *
 * @param {!Element, !Object.<string, string>}
 */
utils.style.setStyle = function (elt, cssObj) {

    if (!elt || !cssObj) { return; }
    if (!elt.style) { elt.style = {} }


    //------------------
    // First, call google's setStyle function.
    //------------------
    goog.style.setStyle(elt, cssObj);
    
    
    //------------------
    // For numerical properties (px)
    //------------------
    var arr = ["top", "left", "height", "width", "fontSize", "borderWidth", "borderRadius"]
    goog.array.forEach(arr, function(dim) { 
	if (cssObj[dim]) {

	    //
	    // If a percentage, skip...
	    //
	    if (goog.string.endsWith(cssObj[dim], '%')) { 
		elt.style[dim] = cssObj[dim];


	    //
	    // Otherwise, convert all other strings to numbers
	    //
	    } else {
		elt.style[dim] = utils.convert.px(cssObj[dim]);// : cssObj[dim];
	    }
	}
    })
}




/**
 * Applies a class to an element if it is being
 * hovered on. 
 *
 * @param {!Element} elt
 * @param {!String} className
 * @param {function=} opt_customMethod The custom 
 * @param {Object=} opt_customMethodBinder The binding object to apply to the opt_customMethod argument.
 */	
utils.style.setHoverClass = function(elt, className, opt_customMethod, opt_customMethodBinder) {

    // Mouseover / mouseout
    var applyHover = function(){ goog.dom.classes.add(elt, className);}
    var removeHover = function(){ goog.dom.classes.remove(elt, className);}
    goog.events.listen(elt, goog.events.EventType.MOUSEOVER, applyHover);
    goog.events.listen(elt, goog.events.EventType.MOUSEOUT, removeHover);


    if (opt_customMethod) {
	// Apply binder if needed
	opt_customMethod =  (opt_customMethodBinder !== undefined) ?
	    opt_customMethod.bind(opt_customMethodBinder) : opt_customMethod;
	// Run custom method,
	opt_customMethod(applyHover, removeHover);	
    }  
}



/**
 * Compares the dimensional aspects of a given element, as per its
 * current CSS class, versus its to-be css class.  Returns numerical
 * defintiion of the current and to-be states.  This is generally used
 * for animation purposes.
 *
 * @param {!Element, !string, Array.<string>=, Function=}
 * @return {Object.<string.<Object.<string, string|number>>>}
 */
utils.style.determineStartEndDimsCSS = function(elt, toBeClass, opt_adjustcallback, opt_properties) {
    
    //------------------    
    // Determine the end dimenions by creating a tempEndStateElt and 
    // applying the to-be CSS to it.
    //------------------
    var tempEndStateElt = utils.dom.makeElement("div", elt.parentNode, "tempEndStateElt");
    goog.dom.classes.set(tempEndStateElt, toBeClass);	

    

    //------------------
    // Apply any adjustment methods to the element
    //------------------
    if (opt_adjustcallback) {
	opt_adjustcallback(elt, tempEndStateElt);
    }



    //------------------
    // Get the computed styles.  We have to use this method
    // because we are working with stylesheets.
    //------------------
    var startDim = utils.style.getComputedStyle(elt, opt_properties);
    var endDim = utils.style.getComputedStyle(tempEndStateElt, opt_properties);



    //------------------
    // Delete the temporary element.
    //------------------
    elt.parentNode.removeChild(tempEndStateElt);
    delete tempEndStateElt;
    


    //------------------
    // Return object.
    //------------------
    return {'start': startDim, 'end': endDim};
}




/**
 * Gets the pixel position of an element relative to the provided
 * ancestor, using recursion.
 *
 * @param {!Element} element
 * @param {!Element} ancestor
 * @return {!Object<string, number>} The position of the element.
 */
utils.style.getPositionRelativeToAncestor = function(element, ancestor) {
    var currLeft = 0;
    var currTop = 0;

    if (element.offsetParent) {

	var parent = element;
	while (parent !== ancestor){
	    currLeft += parent.offsetLeft;
	    currTop += parent.offsetTop;
	    parent = parent.offsetParent;
	}
	//do {
	//} while (obj != obj.offsetParent);
	return {'left': currLeft, 'top': currTop};
    }
}
