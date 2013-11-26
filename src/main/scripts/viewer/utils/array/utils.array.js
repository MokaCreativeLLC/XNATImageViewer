/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.array');




/**
 * Utility class that provides array operations
 * not part of the native JS platform.
 *
 * @constructor
 */
goog.provide('utils.array');
utils.array = function () {};
goog.exportSymbol('utils.array', utils.array);




/**
 * Utility class that uses a natural comparision method (for strings
 * with numbers in them).
 *
 * From: http://stackoverflow.com/questions/15478954/javascript-sort-array-elements-string-with-numbers
 *
 * @param {!string, !string}
 */
utils.array.naturalCompare = function (a, b) {

    var x = [], y = [];
    var stringCompare = function (a, b) {
	return a > b ? 1 : a < b ? -1 : 0;
    }

    a.replace(/(\d+)|(\D+)/g, function($0, $1, $2) { x.push([$1 || 0, $2]) })
    b.replace(/(\d+)|(\D+)/g, function($0, $1, $2) { y.push([$1 || 0, $2]) })

    while(x || y) {
	var xx = x.shift();
	var yy = y.shift();
	var nn = (xx[0] - yy[0]) || stringCompare(xx[1], yy[1]);
	if(nn) return nn;
    }
    return 0;
}






