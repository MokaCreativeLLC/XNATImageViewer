/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');



/**
 * @constructor
 */
goog.provide('utils.string');
utils.string = function () {};
goog.exportSymbol('utils.string', utils.string);



/**
 * Similar to python's 'os.path.basename' function.  Returns
 * the basename of a given uri. Ex:
 * utils.string.basename('/foo/data/foofile.txt')
 * >> 'foofile.txt'
 * @param {!string} uri The uri to derive from.
 * @return {string} 
 * @public
 */
utils.string.basename = function (uri) {
    if (uri != undefined) return uri.replace(/\\/g,'/').replace( /.*\//, '' );

}



/**
 * Similar to python's 'os.path.durnamename' function.  Returns
 * the durname of a given uri. Ex:
 * utils.string.basename('/foo/data/foofile.txt')
 * >> '/foo/data/'
 * @param {!string} uri The uri to derive from.
 * @return {string}
 * @public
 */
utils.string.dirname = function (uri) {
    if (uri != undefined) return uri.replace(/\\/g,'/').
	replace(/\/[^\/]*$/, '');;
}



/** 
 * Returns file extension of either a file list or a string.
 * @param {!string | !Array.string} file The filename or file list.
 * @return {string} Extension of file in all lowercase
 * @public
 */
utils.string.getFileExtension = function(file) {

    //------------------
    // Extract all letters following last period.
    //------------------
    file = (goog.typeOf(file) == 'array') ? file[0] : file;
    
    //------------------
    // Special cases.
    //------------------
    var ext = /**@type {!string}*/ file.slice(file.lastIndexOf(".") + 1);
    // .nii.gz files will be wrongly stripped to .gz, check and correct for it
    if (ext == "gz") {
	ext = "nii." + ext;
    }
    return ext.toLowerCase();
}



/** 
 * Check if two fileNames are equal to one another
 * via the 'utils.path.basename' method.
 * @param {!string} file1 Filename 1.
 * @param {!string} file2 Filename 2.
 * @return {boolean} Whether there's equality.
 * @public
 */
utils.string.fileNameMatch = function(file1, file2) {
    return utils.string.basename(file1) === utils.string.basename(file2);
}



/** 
 * Removes all non-alphanumeric characters from a given 
 * string and replaces them with ''.
 * @param {!string} str The string to perform the operation on.
 * @return {string}
 * @public
 */
utils.string.stripNonAlphanumeric = function(str) {
    return str.replace(/\W/g, '')
}



/** 
 * Strips the illegal characters from a string.
 * @param {!string} str The string to perofrm the operation on.
 * @return {string}
 * @public
 */
utils.string.stripIllegal = function(str) {
    return str.replace(/[|&;$%@"<>()+,]/g, '');
}
    


/** 
 * Returns only the letters within a string.
 * @param {!string} str The string to perform the operation on.
 * @return {string}
 * @public
 */
utils.string.getLettersOnly = function(str) {
    return utils.string.stripNonAlphanumeric(str).replace(/[0-9]/g, '');
}



/**
 * Replaces any illegal characters within a given string.
 * @param {!string} value The string to preform the operation on.
 * @param {string=} opt_replaceStr The string to replace the illegal chars with.
 * @return {string} The modified string.
 * @public 
 */
utils.string.replaceIllegal = function (value, opt_replaceStr) {
	
    if (typeof value !== 'string') {
	throw Error("Illegal value " + typeof value + 
		    " in argument of utils.string.replaceIllegal .")
    }
    
    if (opt_replaceStr === undefined) {
	opt_replaceStr = "";
    }
    
    //------------------
    // Replace 'slashes', commas
    //------------------
    var replaced = /**@type {!string}*/ value.replace(/\/./g, opt_replaceStr);
    replaced = replaced.replace(/[|&;$%@"<>()+,]/g, opt_replaceStr);    
    return replaced;
}




/**
 * Truncates a string to a length, the adds '...' to the end of it.
 * @param {!string} str The string to shorten.
 * @param {!number} opt_maxLen The max length of the string.  Defaults to 30.
 * @return {!string} The truncated string.
 * @public
 */
utils.string.truncateString = function(str, opt_maxLen){
    opt_maxLen = (opt_maxLen === undefined) ? 30 : opt_maxLen;
    return (str.length > opt_maxLen) ? 
	str.substring(0, opt_maxLen - 3) + '...' : str;
}
