/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');

// moka
goog.require('moka.string');
goog.require('gxnat');
goog.require('gxnat.Viewable');



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.Viewable}
 */
goog.provide('gxnat.Slicer');
gxnat.Slicer = function(experimentUrl, viewableJson, 
				      opt_initComplete) {
    this['category'] = 'Slicer Scenes';
    goog.base(this, experimentUrl, viewableJson, opt_initComplete);
    this['sessionInfo']['Format']['value'] = '.mrb';
}
goog.inherits(gxnat.Slicer, gxnat.Viewable);
goog.exportSymbol('gxnat.Slicer', gxnat.Slicer);



/**
 * @const
 * @type {!string}
 */
gxnat.Slicer['folderQuerySuffix'] = 'resources/Slicer/files';



/**
 * @const
 * @type {!string}
 */
gxnat.Slicer['fileQuerySuffix'] = '?listContents=true';



/**
 * @const
 * @type {!string}
 */
gxnat.Slicer['fileContentsKey'] = 'File Name';



/**
 * @const
 * @type {!Array.string}
 */
gxnat.Slicer.thumbnailExtensions = [
    'jpeg', 
    'jpg', 
    'png', 
    'gif'
];



/**
 * @inheritDoc
 */
gxnat.Viewable.prototype.makeFileUrl = function(xnatFileJson) {
    var fileName = /** @type {!string} */
    xnatFileJson[this['constructor']['fileContentsKey']];
    if (!goog.string.endsWith(fileName, '/')) {
	return this['queryUrl'] + '!' + fileName;
    }
  				    
}



/**
 * @inheritDoc
 */
gxnat.Slicer.prototype.getThumbnailImage = function(opt_callback){

    var ext = /** @type {!string} */ '';
    var i = /** @type {!number} */ 0;
    var j = /** @type {!number} */ 0;
    var len = /** @type {!number} */ 0;
    var len2 = /** @type {!number} */ 0;

    for (i=0, len = this['files'].length; i < len; i++) {
	ext = moka.string.getFileExtension(this['files'][i]);
	for (j=0, len2 = gxnat.Slicer.thumbnailExtensions.length; 
	     j < len2; j++) {
	    //window.console.log(ext, this['files'][i],
	    //	     gxnat.Slicer.thumbnailExtensions[j])
	    if (ext === gxnat.Slicer.thumbnailExtensions[j]){
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





