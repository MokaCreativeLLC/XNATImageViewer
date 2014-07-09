/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('nrg.array');


// goog
goog.require('goog.array');

/**
 * Utility class that provides array operations not part of the native 
 * JS platform or goog.array library.
 * @constructor
 */
nrg.array = function () {};
goog.exportSymbol('nrg.array', nrg.array);




/**
 * Utility class that uses a natural comparision method (for strings
 * with numbers in them).
 * From: http://my.opera.com/GreyWyvern/blog/show.dml/1671288
 * Usage: 
 * // An alpha sorted sorted key set. 
 * alphaSortedKeys = ['a1','a100','a11']
 * var nautralSortedKeys = alphaSortedKeys.sort(nrg.array.naturalCompare);
 * // naturalSortedKeys output:
 * // ['a1', 'a11', 'a100']
 * @param {!string} a The first compare string.
 * @param {!string} b The second compare string.
 * @return {!number} The comparison length for sorting.
 * @public
 */
nrg.array.naturalCompare = function (a, b) {
    function chunkify(t) {
	var tz = /**@type {!Array.number}*/ []; 
	var x = /**@type {!number}*/ 0; 
	var y =/**@type {!number}*/ -1; 
	var n = /**@type {!number}*/ 0; 
	var /**@type {number}*/ i;
	var /**@type {number}*/ j;
	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
	    var m = /**@type {!number}*/ (i == 46 || (i >=48 && i <= 57));
	    if (m !== n) {
		tz[++y] = "";
		n = m;
	    }
	    tz[y] += j;
	}
	return tz;
    }
    var aa = /**@type {!Array.number}*/ chunkify(a);
    var bb = /**@type {!Array.number}*/ chunkify(b);
    for (x = 0; aa[x] && bb[x]; x++) {
	if (aa[x] !== bb[x]) {
	    var c = /**@type {!number}*/ Number(aa[x]), d = Number(bb[x]);
	    if (c == aa[x] && d == bb[x]) {
		return c - d;
	    } else return (aa[x] > bb[x]) ? 1 : -1;
	}
    }
  return aa.length - bb.length;
}


goog.exportSymbol('nrg.array.naturalCompare', nrg.array.naturalCompare);
