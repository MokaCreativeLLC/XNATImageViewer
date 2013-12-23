/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */


/**
 * @constructor
 */
goog.provide('utils.convert');
utils.convert = function () {};
goog.exportSymbol('utils.convert', utils.convert);




/**
 * Converts inputted args into '%' strings.
 *
 * NOTE: 'value' should be 0-1.
 *
 * @param {!number}
 * @return {string}
 */
utils.convert.pct = function (value) {
    return (value * 100).toString() + "%";
}




/**
 * Converts inputted args into 'px' strings.
 *
 * @param {Array | number}
 * @return {string | Array.string}
 */
utils.convert.px = function (args) {
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
 * Remaps value 'startVal' from range 'prevRange' to 'newRange'.
 *
 * @param {!number, !Array.number, !Array.number}
 * @return {number}
 */
utils.convert.remap1D = function (startVal, prevRange, newRange) {


    //utils.dom.debug("N: " + n)
    //utils.dom.debug("prevRange: " + prevRange)
    //utils.dom.debug("newRange: " + newRange)
    


    //------------------
    // Define 'swapElts' method
    //------------------
    function swapElts(darr) {
	var holder = darr[0];
	darr[0] = darr[1];
	darr[1] = holder;
	return darr;
    }
    


    //------------------
    // Throw error if there are range equalities.
    //------------------
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
	var returner = {
	    newVal: newRange[0],
	    adjOld: startVal
	};
	return returner;



    //------------------
    // UPPER LIMIT: If the startVal is greater than the 
    // range in the 'prevRange' we return out
    // with the prevRange[1] as the new value.
    //------------------
    } else if (startVal >= prevRange[1]) {
	startVal = prevRange[1];
	var returner = {
	    newVal: newRange[1],
	    adjOld: startVal
	};
	return returner;
    }
    


    //------------------
    // Determine the newVal mathetmaically.
    //------------------
    var newVal = Math.round((startVal/(prevRange[1]-prevRange[0])) * ((newRange[1]-newRange[0])));



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
    //utils.dom.debug("newVAl: " + newVal);    
    //utils.dom.debug("*****************")
    return {
	newVal: newVal,
	adjOld: startVal
    };
}




/**
 * Replaces any illegal characters within a given string.
 *
 * @param {!string, string=}
 * @return {string}
 */
utils.convert.replaceIllegalChars = function (value, opt_replaceStr) {
	
    if (typeof value !== 'string') {
	throw Error("Illegal value " + typeof value + " in argument of utils.convert.replaceIllegalChars.")
    }
    
    if (opt_replaceStr === undefined) {
	opt_replaceStr = "";
    }
    

    //------------------
    // Replace 'slashes', commas
    //------------------
    var replaced = value.replace(/\/./g, opt_replaceStr);
    replaced = replaced.replace(/[|&;$%@"<>()+,]/g, opt_replaceStr);
    
    return replaced;
	
}




/**
 * @param {!number | !string}
 * @return {number}
 */
utils.convert.toInt = function (val) {
	return parseInt(val, 10);
}



/**
* @param {string}
* @return {Array.number}
*/
utils.convert.toFloatArray = function (str) {

    if (!str) {
	return;
    }
    var numArr = [];
    str = str.split(' ');
    goog.array.forEach(str, function(num, i) { numArr[i] = parseFloat(num, 10)});
    return numArr;
}



/**
* @param {!Object}
* @return {Array{
*/
utils.convert.objectToArray = function (obj) {
    var returnable = [];
    for (var key in obj){ 
	returnable = returnable.concat(obj[key])
    }
    return returnable;
}



/**
* @param {!string}
* @return {Array.<number>}
*/
utils.convert.rgbToArray = function (rgbStr) {
    var arr = rgbStr.match(/\d+/g);
    for (var i = 0, len = arr.length; i < len; i++){
	arr[i] = parseInt(arr[i], 10);
    }

    return arr;
}


/**
* @param {Array.<number>} numArr
* @param {number=} opt_multiplier
* @return {!string}
*/
utils.convert.arrayToRgb = function (numArr, opt_multiplier) {
    var str = 'rgb('
    var opt_multiplier = (opt_multiplier === undefined) ? 1 : opt_multiplier;
    goog.array.forEach(numArr, function(num){
	str += parseInt(num * opt_multiplier, 10).toString() + ','
    })
    str = str.substring(0, str.length -1) + ')';
    return str;
}
