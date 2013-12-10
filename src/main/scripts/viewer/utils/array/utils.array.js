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
 * From: http://my.opera.com/GreyWyvern/blog/show.dml/1671288
 *
 * @param {!String} a The first compare string.
 * @param {!String} b The second compare string.
 */
utils.array.naturalCompare = function (a, b) {

    function chunkify(t) {
	var tz = [], x = 0, y = -1, n = 0, i, j;

	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
	    var m = (i == 46 || (i >=48 && i <= 57));
	    if (m !== n) {
		tz[++y] = "";
		n = m;
	    }
	    tz[y] += j;
	}
	return tz;
    }

    var aa = chunkify(a);
    var bb = chunkify(b);

    for (x = 0; aa[x] && bb[x]; x++) {
	if (aa[x] !== bb[x]) {
	    var c = Number(aa[x]), d = Number(bb[x]);
	    if (c == aa[x] && d == bb[x]) {
		return c - d;
	    } else return (aa[x] > bb[x]) ? 1 : -1;
	}
    }
  return aa.length - bb.length;
}






