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
utils.xnat.Viewable.Slicer = function(experimentUrl, viewableJson, 
				      opt_initComplete) {
    this['category'] = 'Slicer Scenes';
    goog.base(this, experimentUrl, viewableJson, opt_initComplete);
    this['sessionInfo']['Format']['value'] = '.mrb';
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
 * @type {!Array.string}
 */
utils.xnat.Viewable.Slicer.thumbnailExtensions = [
    'jpeg', 
    'jpg', 
    'png', 
    'gif'
];



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



utils.xnat.Viewable.Slicer.prototype.getThumbnailImage = function(opt_callback){

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
    if (opt_callback){
	opt_callback(this);
    }
}





