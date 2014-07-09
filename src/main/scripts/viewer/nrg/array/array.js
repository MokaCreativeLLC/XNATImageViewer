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
	var tz = []; 
	var x =  0; 
	var y = -1; 
	var n =  0; 
	var i, j;
	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
	    var m =  (i == 46 || (i >=48 && i <= 57));
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
	    var c =  Number(aa[x]), d = Number(bb[x]);
	    if (c == aa[x] && d == bb[x]) {
		return c - d;
	    } else return (aa[x] > bb[x]) ? 1 : -1;
	}
    }
  return aa.length - bb.length;
}


goog.exportSymbol('nrg.array.naturalCompare', nrg.array.naturalCompare);
