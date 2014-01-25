/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure indcludes
 */
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
 *
 * @param {!string}
 * @return {string}
 */
utils.string.basename = function (uri) {
    if (uri != undefined) return uri.replace(/\\/g,'/').replace( /.*\//, '' );

}




/**
 * Similar to python's 'os.path.durnamename' function.  Returns
 * the durname of a given uri. Ex:
 * utils.string.basename('/foo/data/foofile.txt')
 * >> '/foo/data/'
 *
 * @param {!string}
 * @return {string}
 */
utils.string.dirname = function (uri) {
    if (uri != undefined) return uri.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}




/** 
 * Returns file extension of either a file list 
 * or a string.
 *
 * @return {string} Extension of file in all lowercase
 */
utils.string.getFileExtension = function(file) {

    //------------------
    // Extract all letters following last period.
    //------------------
    file = (goog.typeOf(file) == 'array') ? file[0] : file;
    


    //------------------
    // Special cases.
    //------------------
    var ext = file.slice(file.lastIndexOf(".") + 1);
    // .nii.gz files will be wrongly stripped to .gz, check and correct for it
    if (ext == "gz") {
	ext = "nii." + ext;
    }
    return ext.toLowerCase();
}




/** 
 * Check if two fileNames are equal to one another
 * via the 'utils.path.basename' method.
 *
 * @param {!string, !string}
 * @return {boolean}
 */
utils.string.fileNameMatch = function(file1, file2) {
    return utils.string.basename(file1) === utils.string.basename(file2);
}




/** 
 * Removes all non-alphanumeric characters from a given 
 * string and replaces them with ''.
 *
 * @paratm {!string} str
 * @return {string}
 */
utils.string.stripNonAlphanumeric = function(str) {
    return str.replace(/\W/g, '')
}



/** .
 *
 * @param {!string} str
 * @return {string}
 */
utils.string.stripIllegal = function(str) {
    return str.replace(/[|&;$%@"<>()+,]/g, '');
}
    


/** .
 *
 * @param {!string} str
 * @return {string}
 */
utils.string.getLettersOnly = function(str) {
    return utils.string.stripNonAlphanumeric(str).replace(/[0-9]/g, '');
}
