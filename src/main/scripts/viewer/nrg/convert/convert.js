/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.object');



/**
 * Utility class for conducting conversions.
 * @constructor
 */
goog.provide('nrg.convert');
nrg.convert = function () {};
goog.exportSymbol('nrg.convert', nrg.convert);




/**
 * Converts a float (between 0-1) to a string percentage.
 * @param {!number} value
 * @return {string}
 * @throws Error if value is not a string or between 0 and 1.
 * @public 
 */
nrg.convert.pct = function (value) {
    if (!goog.isNumber(value)){
	throw new TypeError('Number expected!', value);
    }
    if ((value > 1) || (value < 0)){
	throw new Error('Value must be between 0 and 1!')
    }
    return (value * 100).toString() + "%";
}




/**
 * Converts inputted args into 'px' strings.
 * @param {!Array.<number> | !number} args The arguments to convert.
 * @return {!string | !Array.string} The px results.
 * @public 
 */
nrg.convert.px = function (args) {
    if ((!goog.isArray(args)) && (!goog.isNumber(args))){
	throw new TypeError('Array or number expected!', args);
    }
    if (args instanceof Array) {
	return args.map(function (a) {return a.toString() + 'px'});
    }
    else{
	switch (typeof args) {
	case 'number':
	    return args.toString() + "px";
	}
    }
}




/**
 * Converts value 'startVal' from range 'prevRange' to 'newRange'.  If startVal
 * is less than the smallest value of prevRange, sets startVal to the 0 index 
 * of prevRange.  If its larger than the largest value of prevRange, sets 
 * startVal to the largest value in the array.
 * @param {!number} startVal The value to convert to the second range.
 * @param {!Array.number} prevRange An n-length array to be sorted, to 
 *    determine the previous range from.
 * @param {!Array.number} newRange An n-length array to be sorted to determine
 *    the new range from.
 * @return {Object.<string, number>} The converted number as part of an object
 *    along with the old naumber.
 * @public 
 */
nrg.convert.remap1D = function (startVal, prevRange, newRange) {

    function swapElts(darr) {
	var holder = /**@type {Array.number}*/ darr[0];
	darr[0] = darr[1];
	darr[1] = holder;
	return darr;
    }
    
    if ((prevRange[0] === prevRange[1]) || (newRange[0] === newRange[1])) {
	throw ("Remap: initial domain is equal!");
    }
    

    //------------------
    // Make sure the ranges are in order
    //------------------
    prevRange = prevRange.sort()
    newRange = newRange.sort()


    //------------------
    // LOWER LIMIT: If the startVal is less than the 
    // range in the 'prevRange' we return out
    // with the prevRange[0] as the new value.
    //------------------
    if (startVal <= prevRange[0]) {
	startVal = prevRange[0];
	return {
	    'remappedVal': newRange[0],
	    'oldValue': startVal
	}


    //------------------
    // UPPER LIMIT: If the startVal is greater than the 
    // range in the 'prevRange' we return out
    // with the prevRange[1] as the new value.
    //------------------
    } else if (startVal >= prevRange[1]) {
	startVal = prevRange[1];
	return {
	    'remappedVal': newRange[1],
	    'oldValue': startVal
	}
    }
    

    //------------------
    // Determine the newVal mathetmaically.
    //------------------
    var newVal = /**@type {number}*/ 
    Math.round((startVal/(prevRange[1]-prevRange[0])) * 
			    ((newRange[1]-newRange[0])));


    //------------------
    // Constrain newVal to the limits.
    //------------------
    if (newVal < newRange[0]) {
	newVal = newRange[0];
    }
    else if (newVal > newRange[1]) {
	newVal = newRange[1];
    }
    

    //------------------
    // Return.
    //------------------
    return {
	'remappedVal': newVal,
	'oldValue': startVal
    };
}



/**
 * Converts either a float or a string to an int.
 * @param {!number | !string} val
 * @return {number} The number to convert.
 * @public 
 */
nrg.convert.toInt = function (val) {
    if ((!goog.isString(val)) && (!goog.isNumber(val))){
	throw new TypeError('Number or string expected!', val);
    }
    return parseInt(val, 10);
}



/**
 * Converts a set of spaced strings to a float array.
 * @param {string} val The string to convert.
 * @return {!Array.number} An n-dimensional array of converted strings.
 * @public 
 */
nrg.convert.toFloatArray = function (val) {
    if ((!goog.isString(val))){
	throw new TypeError('String expected!', val);
    }
    var numArr = /**@type {!Array.number}*/ [];
    val = val.split(' ');
    goog.array.forEach(val, function(num, i) { 
	numArr[i] = parseFloat(num, 10)});
    return numArr;
}



/**
 * Returns an array of only values (not keys) of an object.
 * @param {!Object} val The object to convert.
 * @return {Array} The array of object property values.
 * @public 
 */
nrg.convert.objectToArray = function (val) {
    if ((!goog.isObject(val))){
	throw new TypeError('Object expected!', val);
    }
    var returnable = /**@type {!Array.Object}*/[];
    var key = /**@type {!string}*/ '';
    for (key in val){ 
	returnable = returnable.concat(val[key])
    }
    return returnable;
}



/**
 * Converts an rgb string to an array of floats.
 * @param {!string} val The string to convert.
 * @return {Array.<number>} An array of rgb floats.
 * @public 
 */
nrg.convert.rgbToArray = function (val) {
    if ((!goog.isString(val))){
	throw new TypeError('String expected!', val);
    }
    var arr = /**@type {Array.<string> | Array.<number>}*/val.match(/\d+/g);
    var i = /**@type {!number} */ 0;
    for (i = 0, len = arr.length; i < len; i++){
	arr[i] = parseInt(arr[i], 10);
    }
    return arr;
}


/**
 * Converts an array of numbers to an rgb string.
 * @param {Array.<number>} val Array of values to convert.
 * @param {number=} opt_multiplier The multiplier to apply to the rbg string. 
 *    Defaults to 0.
 * @return {!string} The rgb string.
 * @public 
 */
nrg.convert.arrayToRgb = function (val, opt_multiplier) {
    if ((!goog.isArray(val))){
	throw new TypeError('Array expected!', val);
    }
    var str = 'rgb('
    var opt_multiplier = 
    (opt_multiplier === undefined) ? 1 : opt_multiplier;

    goog.array.forEach(val, function(num){
	str += parseInt(num * opt_multiplier, 10).toString() + ','
    })
    str = str.substring(0, str.length -1) + ')';
    return str;
}



/**
 * @param {!Object} obj
 * @return {!Object}
 */ 
nrg.convert.filterNaN = function(obj) {
    var newObj = {}
    goog.object.forEach(obj, function(val, key){
	if (!isNaN(val)){
	    newObj[key] = val;
	} 
	else {
	    if (goog.isString(val)){
		newObj[key] = val;		
	    }
	}
    })
    return newObj;
}



/**
 * @param {!Object} obj
 * @return {!Object}
 */ 
nrg.convert.filterZeroLengthStrings = function(obj) {
    var newObj = {}
    goog.object.forEach(obj, function(val, key){
	if (goog.isString(val)){
	    if (val.length > 0){
		newObj[key] = val;
	    }
	} else {
	    newObj[key] = val;
	}
    })
    return newObj;
}




goog.exportSymbol('nrg.convert.pct', nrg.convert.pct);
goog.exportSymbol('nrg.convert.px', nrg.convert.px);
goog.exportSymbol('nrg.convert.remap1D', nrg.convert.remap1D);
goog.exportSymbol('nrg.convert.toInt', nrg.convert.toInt);
goog.exportSymbol('nrg.convert.toFloatArray', nrg.convert.toFloatArray);
goog.exportSymbol('nrg.convert.objectToArray', nrg.convert.objectToArray);
goog.exportSymbol('nrg.convert.rgbToArray', nrg.convert.rgbToArray);
goog.exportSymbol('nrg.convert.arrayToRgb', nrg.convert.arrayToRgb);
goog.exportSymbol('nrg.convert.filterNaN', nrg.convert.filterNaN);
goog.exportSymbol('nrg.convert.filterZeroLengthStrings',
	nrg.convert.filterZeroLengthStrings);
