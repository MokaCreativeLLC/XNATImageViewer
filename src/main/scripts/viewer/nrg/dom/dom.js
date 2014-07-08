/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.string.path');

// nrg
goog.require('nrg.fx');
goog.require('nrg.string');




/**
 * 'nrg.dom' is a utility class that handles element and 
 * dom operations not provided by the JS platform or goog.dom.
 * @constructor
 */
goog.provide('nrg.dom');
nrg.dom = function () {};
goog.exportSymbol('nrg.dom', nrg.dom);




/**
 * Creates a set of buttons with a hovering behavior.  Assumes certain aspects
 * of the buttons:
 *     1) The ID prefix gets converted to a selector case to retrieve
 *        the image src, assuming that the opt_iconSrcFolder options is 
 *        provided.
 *     2) The extension of the images defaults to .png.
 *     3) The unhovered opacity of the button is .5 and the hovered opacity is
 *        1.
 * @param {!Array.string} idPrefixes The array of id prefixes.
 * @param {string=}  opt_iconSrcFolder Defaults to ''. 
 * @param {string=}  opt_iconExt Defaults to .png.
 * @return {!Object.<string, Element>}  An object where the keys are the ids
 *     of the button elements.
 * @public
 */
nrg.dom.createBasicHoverButtonSet = function(idPrefixes, opt_iconSrcFolder, 
					       opt_iconExt){
    
    if (!goog.isArray(idPrefixes)){
	throw new TypeError('Array expected!', idPrefixes);
    }
    if (opt_iconSrcFolder && !goog.isString(opt_iconSrcFolder)){
	throw new TypeError('String expected!', opt_iconSrcFolder);
    }
    if (opt_iconExt && !goog.isString(opt_iconExt)){
	throw new TypeError('String expected!', opt_iconExt);
    }

    var buttonSet = /**@type {Object.<string, Element>}*/{};
    var ext = /**@type {!string}*/ opt_iconExt ? opt_iconExt : 'png';
    var key = /**@type {!string}*/ '';
    var i = /**@type {!number}*/ 0;

    for (i=0, len = idPrefixes.length; i < len; i++){
	key = idPrefixes[i];
	buttonSet[key] = nrg.dom.createBasicHoverButton(key, {
	    'src': opt_iconSrcFolder ? 
		goog.string.path.join(opt_iconSrcFolder, 
		goog.string.toSelectorCase(key) + '.' + ext) : '',
	})
    }
    return buttonSet;
}




/**
 * Creates a child image into the div. 
 * @param {!Element} div The div image to apply the child to.  
 * @param {!string} src The image src.
 * @public
 */
nrg.dom.createDivChildImage = function(div, src){
    var imgElt = /**@type {!Element}*/ goog.dom.createDom('img', {
	'src': src
    })
    // Restyle image to fit in div
    imgElt.style.backgroundSize = 'contain';
    imgElt.style.maxWidth = '100%';
    imgElt.style.maxHeight = '100%';
    goog.dom.append(div, imgElt)
    imgElt.onclick = imgElt.parentNode.onclick;
}



/**
 * Creates a basic button.  
 * @param {!string} idPrefix The id prefix of the button.  
 * @param {Object.<string, string | number>=} opt_attrs The optional 
 *    attributes of the button.
 * @param {number=} opt_mouseOverOpacity Defaults to 1.
 * @param {number=} opt_mouseOutOpacity Defaults to 0.5.
 * return {!Element} The button element.
 * @public
 */
nrg.dom.createBasicHoverButton = function(idPrefix, 
					    opt_attrs, opt_mouseOverOpacity, 
					    opt_mouseOutOpacity){

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
    var attrs = /**@type {!Object}*/ opt_attrs ? opt_attrs : {};
    var buttonDiv = /**@type {!Element}*/ 
    nrg.dom.createUniqueDom('div', idPrefix, attrs);
    //
    // Make an 'img' element if there's a 'src' attrib.
    //
    if (opt_attrs && opt_attrs['src']){
	nrg.dom.createDivChildImage(buttonDiv, opt_attrs['src']);
    }
    //
    // Set the opacity values
    //
    opt_mouseOverOpacity = opt_mouseOverOpacity === undefined 
	? 1 : opt_mouseOverOpacity;
    opt_mouseOutOpacity = opt_mouseOutOpacity === undefined 
	? .5 : opt_mouseOutOpacity;

    nrg.fx.setBasicHoverStates(buttonDiv, 
				 opt_mouseOverOpacity, 
				 opt_mouseOutOpacity); 
    return buttonDiv
}




/**
 * Creates a dom element with a unique id to it.  Assumes / performs the 
 * the following:
 *    - Takes the idPrefix to create a custom id with the prefix and 
 *      goog.string.createUniqueString() added together.
 *    - If the attribute 'class' is not provided in opt_attrs, assumes that
 *      the css class assigned to the element is 
 *      goog.string.toSelectorCase(nrg.string.getLettersOnly(idPrefix))
 * @param {!string} type The element type.
 * @param {!string} idPrefix The idPrefix of the element.  Ids are created by 
 *     using the prefix and then adding a goog.string.createUniqueString().
 * @param {!Object.<string, string | number>} opt_attrs The optional attributes
 *     of the DOM element.
 * @return {!Element}
 * @public
 */
nrg.dom.createUniqueDom = function (type, idPrefix, opt_attrs) {

    if (!goog.isString(type)){
	throw new TypeError('String expected!', type);
    }
    if (!goog.isString(idPrefix)){
	throw new TypeError('String expected!', idPrefix);
    }
    if (opt_attrs && !goog.isObject(opt_attrs)){
	throw new TypeError('Object expected!');
    }

    var opt_attrs = /**@type {!Object}*/ 
    opt_attrs && goog.isObject(opt_attrs) ? opt_attrs : {}

    
    // id
    opt_attrs['id'] = opt_attrs['id'] ? opt_attrs['id'] : 
	idPrefix + '_' + goog.string.createUniqueString();

    // class
    opt_attrs['class'] = opt_attrs['class'] ? opt_attrs['class'] : 
	goog.string.toSelectorCase(idPrefix.replace(/\./g,'-').toLowerCase());
    return goog.dom.createDom(type, opt_attrs);
}





/**
 * Prevents the propagation of an event to its parent elements.
 * @param {!Event} e The event to stop the propagation of.
 * @public
 */
nrg.dom.stopPropagation = function (e) {
    if (!e) var e = /**@type {!Event}*/ window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) 
	e.stopPropagation();
}




/**
 * Used if you want to validate an object's properties against a template. In
 * this case, if the args object has properties not found in the templateArgs
 * object.
 * Determines if there's an argument match between 'templateArgs' and 'args'
 * with template being the priority.
 * @param {!Object} templateArgs The args to check against.
 * @param {!Object} args The args that require validation.
 * @throws Error if a property doesn't exist in args that exists in 
 *    templateArgs or if templateArgs does not contain a given property in 
 *    args.
 * @public
 */
nrg.dom.checkForExtraneousArgs = function (templateArgs, args, opt_callback) {
    var extraneousArgStr = /**@type {!string} @const*/ 
        'Invalid arguments detected in args:';
    for (var attr in args) { 
    	if (! (attr in templateArgs)) {
    	    throw (extraneousArgStr + ' \'' + attr + '\' ' ); 
    	}
    	else {
   	    if (args[attr].toString() === '[object Object]') {
   		nrg.dom.validateArgs(originString, templateArgs[attr], 
				       args[attr])
   	    } 		
    	}
    }
}




/**
 * Reads in a CSS provided by the 'cssClassName' argument returning an object 
 * with properties.
 * @param {!string} cssClassName The css class to read from.
 * @return {Object} The classes object.
 * @public 
 */ 
nrg.dom.readCSS = function(cssClassName) {
    var classes = /**@type {!number}*/ document.styleSheets[0].rules || 
	document.styleSheets[0].cssRules
    var x = /**@type {!number}*/ 0;
    for(x=0; x < classes.length; x++) {
        if(classes[x].selectorText == cssClassName) {
            (classes[x].cssText) ? alert(classes[x].cssText) : 
		alert(classes[x].style.cssText);
        }
    }
    return classes;
}




goog.exportSymbol('nrg.dom.createBasicHoverButtonSet',
	nrg.dom.createBasicHoverButtonSet);
goog.exportSymbol('nrg.dom.createDivChildImage', nrg.dom.createDivChildImage);
goog.exportSymbol('nrg.dom.createBasicHoverButton',
	nrg.dom.createBasicHoverButton);
goog.exportSymbol('nrg.dom.createUniqueDom', nrg.dom.createUniqueDom);
goog.exportSymbol('nrg.dom.stopPropagation', nrg.dom.stopPropagation);
goog.exportSymbol('nrg.dom.checkForExtraneousArgs',
	nrg.dom.checkForExtraneousArgs);
goog.exportSymbol('nrg.dom.readCSS',
	nrg.dom.readCSS);
