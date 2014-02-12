/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog


// utils
goog.require('utils.xnat');
goog.require('utils.xnat.Viewable');



/**
 * @constructor
 * @extends {utils.xnat.Viewable}
 */
goog.provide('utils.xnat.Viewable.Slicer');
utils.xnat.Viewable.Slicer = function(experimentUrl, viewableJson) {
    this['category'] = 'Slicer';
    goog.base(this, experimentUrl, viewableJson);
}
goog.inherits(utils.xnat.Viewable.Slicer, utils.xnat.Viewable);
goog.exportSymbol('utils.xnat.Viewable.Slicer', utils.xnat.Viewable.Slicer);



/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Slicer['folderQuerySuffix'] = 'resources/Slicer/files';



/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Slicer['fileQuerySuffix'] = '?listContents=true';



/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Slicer['fileContentsKey'] = 'File Name';



/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.prototype.makeFileUrl = function(xnatFileObj) {
    var fileName = xnatFileObj[this['constructor']['fileContentsKey']];
    if (!goog.string.endsWith(fileName, '/')) {
	return this['queryUrl'] + '!' + fileName;
    }
  				    
}






/**
 * Function for sorting the slicer objects.
 *
 * @param {!Object.<String, String | Object.<String, String | Object>} a 
 *    First scan object to compare. 
 * @param {!Object.<String, String | Object.<String, String | Object>} b 
 *    Second scan object to compare.
 * @public 
 */
utils.xnat.Viewable.Slicer.sortCompare = function(a,b) {
    if (a['Name'][0].toLowerCase() < b['Name'][0].toLowerCase())
	return -1;
    if (a['Name'][0].toLowerCase() > b['Name'][0].toLowerCase())
	return 1;
    return 0;
}



/**
 * @const
 */
utils.xnat.Viewable.Slicer.thumbnailExtensions = [
    'jpeg', 
    'jpg', 
    'png', 
    'gif'
];


utils.xnat.Viewable.Slicer.prototype.getThumbnailImage = function(){

    var ext = /** @type {!string} */ '';
    var i = /** @type {!number} */ 0;
    var j = /** @type {!number} */ 0;
    var len = /** @type {!number} */ 0;
    var len2 = /** @type {!number} */ 0;

    for (i=0, len = this['files'].length; i < len; i++) {
	ext = utils.string.getFileExtension(this['files'][i]);
	for (j=0, len2 = utils.xnat.Viewable.Slicer.thumbnailExtensions.length; 
	     j < len2; j++) {
	    //window.console.log(ext, this['files'][i],
	    //	     utils.xnat.Viewable.Slicer.thumbnailExtensions[j])
	    if (ext === utils.xnat.Viewable.Slicer.thumbnailExtensions[j]){
		//window.console.log("FOUND!", this)
		this['thumbnailUrl'] = this['files'][i]; 
		return;
	    }		   
	}
  }
}





