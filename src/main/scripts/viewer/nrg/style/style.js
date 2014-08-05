/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.style');

// goog
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.math.Coordinate');

// nrg
goog.require('nrg.convert');




/**
 * Style utility class for operations not provided by native JS library or 
 * goog.style.
 * @constructor
 */
nrg.style = function () {};
goog.exportSymbol('nrg.style', nrg.style);




/**
 * Full list of CSS properties.
 * @const
 * @type {Array.<string>}
 * @public
 */
nrg.style.cssProperties = [
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
'border-top-color', 'border-right-color', 'border-bottom-color', 
    'border-left-color',
'border-top-style', 'border-right-style', 'border-bottom-style', 
    'border-left-style',
'border-top-width', 'border-right-width', 'border-bottom-width', 
    'border-left-width',
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
 * Remove all classes from an element that contain 'containsStr' within it.
 * @param {!Element} elt The element to perform the operation on.
 * @pararm {!string} containsStr The evaluation string -- if the class 
 *    contains it, the class is removed.
 * @public
 */
nrg.style.removeClassesThatContain = function (elt, containsStr) {

    var classes = goog.dom.classes.get(elt);
    var removeClasses = [];
    var i = 0;
   
    //------------------
    // Loop throught the classes, track all that contain 'containsStr'.
    //------------------
    containsStr = containsStr.toLowerCase();
    for (i=0, len = classes.length; i < len; i++){
        if (classes[i].toLowerCase().indexOf(containsStr) > -1) {
            removeClasses.push(classes[i])
        }
    }
    
    //------------------
    // Remove all classes that met the criteria.
    //------------------
    for (i=0, len = removeClasses.length; i < len; i++){
	goog.dom.classes.remove(elt, removeClasses[i]); 
    }
}





/**
 * Returns the absolute position of the element provided in the argument.
 * @param {!Element} elt The element to derive the result from.
 * @return {Array.<number>} The absolute position of the element.
 * @public
 */
nrg.style.absolutePosition = function ( elt) {
    return elt.getBoundingClientRect();
}





/**
 * Gets the in-line dimensions of a given element.
 * @param {!Element} elt The element to derive the result from.
 * @param {!Array.<string>= | string=} property The property or properties
 *    to retrieve the inline results from.
 * @return {Object.<string, number> | Object.<string, string>}  The inline 
 *    results.
 * @public
 */
nrg.style.dims = function (elt, property) {

    //------------------
    // If we're looking for just one attribute we 
    // go right to the kill...
    //------------------
    if (property && typeof property === 'string') {
	var val = '';
	
	switch(property) {
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

	    val = /%emt/.test(elt.style[property]);
	    
	    if (!val) {
		return nrg.convert.toInt(elt.style[property]);
	    }
	    
	    var p = 
	    goog.style.getRelativePosition(elt, elt.parentNode);
	    var posObj = {
		'left': nrg.convert.toInt(elt.style.left) || p.x,
		'top': nrg.convert.toInt(elt.style.top) || p.y
	    };

	    return posObj[property];
	    //return nrg.convert.toInt(elt.style[property]) //||  
	    // $(elt).position()[property];
	    //return $(elt).position()[property];
	}



    //------------------
    // Otherwise, return an object with all style 
    // attributes.
    //------------------	
    } else {
	
	
	var retObj = /**{Object.<string, number> | Object.<string, string>} */
	{};

	var p = 
	(elt.parentNode) ? goog.style.getRelativePosition(elt, 
							  elt.parentNode) : 
	    goog.style.getRelativePosition(elt, document.body)

	var posObj ={
	    left: nrg.convert.toInt(elt.style.left) || (p.x),
	    top: nrg.convert.toInt(elt.style.top) || (p.y)
	};

		
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
 * Gets the stylesheet from the document.
 * @public
 */
nrg.style.getStyleSheet = function(unique_title){
  for(var i=0; i<document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if(sheet.title == unique_title) {
      return sheet;
    }
  }
}



/**
 * Gets the style parameters of an element where it's style is derived from 
 * a css stylesheet.  If opt_propertyKey is specified, returns only the value 
 * of that property.
 * @param {!Element} elt The element to derive the result from.
 * @param {string= | Array.<string>=} opt_propertyKey The property key.
 * @return {string | number | Object.<string, string> | Object.<string, number>}
 * @public
 */
nrg.style.getComputedStyle = function (elt, opt_propertyKey) {

    //------------------
    // If 'opt_propertyKey' is a string, not array...
    //--------------------
    if (opt_propertyKey && goog.isString(opt_propertyKey)){
	return window.getComputedStyle(elt, null).
	    getPropertyValue(opt_propertyKey); 

    //------------------
    // Otherwise, when 'opt_propertyKey' is an array.
    //------------------
    } else {
	if (opt_propertyKey === undefined) {
	    opt_propertyKey = nrg.style.cssProperties;
	}
	/**
	 * @type {Object.<string, string>|Object.<string, number>}
	 */
	var attrs = {};
	var styleSheet = window.getComputedStyle(elt, null);
	var i =  0;
	var len =  opt_propertyKey.length;
	for (i=0; i < len; i++) {
	    attrs[opt_propertyKey[i]] = 
		styleSheet.getPropertyValue(opt_propertyKey[i]);
	}
	//window.console.log(attrs);
	return nrg.style.parseIntNumericalProperties(attrs);
    }

}



/**
 * Conducts a parseInt on numerical style attributes. Converts the strings 
 * accordingly.
 * @param {Object.<string, string>} obj The properties object with string 
 *    numbers.
 * @return {Object.<string, number>} obj The properties object numbers.
 * @public
 */
nrg.style.parseIntNumericalProperties = function (obj) {
	
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

    var i =  0;
    var len =  0;
    for (key in obj) {
	for (i = 0, len = pxConvertArr.length; i < len; i++){
	    if (key === pxConvertArr[i]) {
		obj[key] = parseInt(obj[key], 10);
	    }
	}
    }	
    
    return obj
}




/**
 * Sets the style of a given element, in-line.
 * @param {!Element} elt The element to apply the style to.
 * @param {!Object.<string, string> | !Object.<string, number>} styleObj The 
 *    object whose properties contain the in-line style to apply to the 
 *    element.
 * @public
 */
nrg.style.setStyle = function (elt, styleObj) {

    if (!elt || !styleObj) { return; }
    if (!elt.style) { elt.style = {} }


    //------------------
    // First, call google's setStyle function.
    //------------------
    goog.style.setStyle(elt, styleObj);
    
    
    //------------------
    // For numerical properties (px)
    //------------------
    var arr = 
    ["top", "left", "height", "width", "fontSize", 
	       "borderWidth", "borderRadius"]
    goog.array.forEach(arr, function(dim) { 
	if (styleObj[dim]) {
	    // If a percentage, skip...
	    if (goog.string.endsWith(styleObj[dim], '%')) { 

	    // Otherwise, convert all other strings to numbers
	    } else {
		elt.style[dim] = nrg.convert.px(styleObj[dim]);
	    }
	}
    })
}



/**
 * @const
 */
nrg.style.IS_HOVERED = 'is_hovered_' + goog.string.createUniqueString()



/**
 * Applies a css class to an element if it is being hovered on. 
 * @param {!Element} elt The element to apply the css class to.
 * @param {!string} className The class name to be applied.
 * @param {Function=} opt_eventFindTuneMethod The custom method to run during 
 *    the occurence of the hover states.
 * @param {Object=} opt_eventFindTuneMethodBinder The binding object to apply 
 *    to the opt_eventFindTuneMethod argument.
 * @param {Function=} opt_onMouseover
 * @param {Object=} opt_onMouseout
 * @public
 */	
nrg.style.setHoverClass = function(elt, className, 
				   opt_eventFindTuneMethod, 
				   opt_eventFindTuneMethodBinder, 
				   opt_onMouseover, opt_onMouseout) {

    // Mouseover / mouseout
    var applyHover = function(){ 
	elt[nrg.style.IS_HOVERED] = true;
	goog.dom.classes.add(elt, className);
	if (goog.isDefAndNotNull(opt_onMouseover)){
	    opt_onMouseover();
	}
    }
    var removeHover = function() {
	elt[nrg.style.IS_HOVERED] = false;
	goog.dom.classes.remove(elt, className);
	if (goog.isDefAndNotNull(opt_onMouseout)){
	    opt_onMouseout();
	}
    }
    goog.events.listen(elt, goog.events.EventType.MOUSEENTER, applyHover);
    goog.events.listen(elt, goog.events.EventType.MOUSELEAVE, removeHover);


    if (opt_eventFindTuneMethod) {
	// Apply binder if needed
	opt_eventFindTuneMethod =  
	    (opt_eventFindTuneMethodBinder !== undefined) ?
	    opt_eventFindTuneMethod.bind(opt_eventFindTuneMethodBinder) : 
	    opt_eventFindTuneMethod;
	// Run custom method,
	opt_eventFindTuneMethod(applyHover, removeHover);	
    }  
}



/**
 * Compares the dimensional aspects of a given element, as per its
 * current CSS class, versus its to-be css class.  Returns numerical
 * defintiion of the current and to-be states.  This is generally used
 * for animation purposes.
 * @param {!Element} elt The clement to derive the start-end dims from.
 * @param {!string} toBeClass The to-be class to calculate the changes from.
 * @param {function=} opt_adjustcallback The adjust callback to apply to the
 *    method.
 * @param {Array.<string>=} opt_properties The properties to determine the 
 *    start end dims from.  Defaults to nrg.style.cssProperties if 
 *    undefined.
 * @return {Object.<string.<Object.<string, string|number>>>}
 * @public
 */
nrg.style.determineStartEndDimsCSS = function(elt, toBeClass, 
						opt_adjustcallback, 
						opt_properties) {
    
    //------------------    
    // Determine the end dimenions by creating a tempEndStateElt and 
    // applying the to-be CSS to it.
    //------------------
    var tempEndStateElt =  goog.dom.createDom("div", {
	'id': 'tempEndStateElt' + goog.string.getUniqueString()
    });
    elt.parentNode.appendChild(tempEndStateElt);
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
    var startDim = nrg.style.getComputedStyle(elt, opt_properties);
    var endDim = nrg.style.getComputedStyle(tempEndStateElt, opt_properties);



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
 * Gets the pixel position of an element relative to the provided ancestor, 
 * using recursion.
 * @param {!Element} element The element to derive the results from.
 * @param {!Element} ancestor The ancestor of element to derive the results
 *    from.
 * @return {!Object<string, number>} The ancestor-relatve position of the 
 *    element.
 * @public
 */
nrg.style.getPositionRelativeToAncestor = function(element, ancestor) {
    var currLeft =  0;
    var currTop =  0;
    if (element.offsetParent) {
	var parent =  element;
	while (parent !== ancestor){
	    currLeft += parent.offsetLeft;
	    currTop += parent.offsetTop;
	    parent = parent.offsetParent;
	}
	return {'left': currLeft, 'top': currTop};
    }
}




goog.exportSymbol('nrg.style.cssProperties', nrg.style.cssProperties);
goog.exportSymbol('nrg.style.removeClassesThatContain',
	nrg.style.removeClassesThatContain);
goog.exportSymbol('nrg.style.absolutePosition', nrg.style.absolutePosition);
goog.exportSymbol('nrg.style.dims', nrg.style.dims);
goog.exportSymbol('nrg.style.getStyleSheet', nrg.style.getStyleSheet);
goog.exportSymbol('nrg.style.getComputedStyle', nrg.style.getComputedStyle);
goog.exportSymbol('nrg.style.parseIntNumericalProperties',
	nrg.style.parseIntNumericalProperties);
goog.exportSymbol('nrg.style.setStyle', nrg.style.setStyle);
goog.exportSymbol('nrg.style.IS_HOVERED', nrg.style.IS_HOVERED);
goog.exportSymbol('nrg.style.setHoverClass', nrg.style.setHoverClass);
goog.exportSymbol('nrg.style.getPositionRelativeToAncestor',
	nrg.style.getPositionRelativeToAncestor);
