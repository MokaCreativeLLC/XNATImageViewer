/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// utils
goog.require('utils.array');
goog.require('utils.xnat');
goog.require('utils.xnat.Path');
goog.require('utils.xnat.Viewable');



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {utils.xnat.Viewable}
 */
goog.provide('utils.xnat.Viewable.Scan');
utils.xnat.Viewable.Scan = function(experimentUrl, viewableJson, 
				    opt_initComplete) {
    this['category'] = 'Scans';
    goog.base(this, experimentUrl, viewableJson, opt_initComplete);
}
goog.inherits(utils.xnat.Viewable.Scan, utils.xnat.Viewable);
goog.exportSymbol('utils.xnat.Viewable.Scan', utils.xnat.Viewable.Scan);



/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Scan['folderQuerySuffix'] = 'scans';


/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Scan['fileQuerySuffix'] = '/files';


/**
 * @const
 * @type {!string}
 */
utils.xnat.Viewable.Scan['fileContentsKey'] = 'URI';



/**
 * @inheritDoc
 */
utils.xnat.Viewable.Scan.prototype.makeFileUrl = function(xnatFileJson) {
    return utils.xnat.Path.graftUrl(this['experimentUrl'], 
	      xnatFileJson[utils.xnat.Viewable.Scan['fileContentsKey']], 
			   'experiments');

}


/**
 * @inheritDoc
 */
utils.xnat.Viewable.Scan.prototype.getThumbnailImage = function(opt_callback){
    //
    // Select the image in the middle of the list to 
    // serve as the thumbnail after sorting the fileURIs
    // using natural sort.
    //
    this['files'] = this['files'].sort(utils.array.naturalCompare);
    var imgInd = /** @type {!number} */
    Math.floor((this['files'].length) / 2);
    window.console.log(this['files'], this['files'].length, imgInd);
    this['thumbnailUrl'] = this['files'][imgInd] + 
	utils.xnat.JPEG_CONVERT_SUFFIX;
    if (opt_callback){
	opt_callback(this);
    }
}





