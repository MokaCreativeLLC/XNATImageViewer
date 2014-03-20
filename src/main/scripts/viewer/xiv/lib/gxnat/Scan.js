/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// moka
goog.require('moka.array');
goog.require('gxnat');
goog.require('gxnat.Path');
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
goog.provide('gxnat.Scan');
gxnat.Scan = function(experimentUrl, viewableJson, 
				    opt_initComplete) {
    this['category'] = 'Scans';
    goog.base(this, experimentUrl, viewableJson, opt_initComplete);
}
goog.inherits(gxnat.Scan, gxnat.Viewable);
goog.exportSymbol('gxnat.Scan', gxnat.Scan);



/**
 * @const
 * @type {!string}
 */
gxnat.Scan['folderQuerySuffix'] = 'scans';


/**
 * @const
 * @type {!string}
 */
gxnat.Scan['fileQuerySuffix'] = '/files';


/**
 * @const
 * @type {!string}
 */
gxnat.Scan['fileContentsKey'] = 'URI';



/**
 * @inheritDoc
 */
gxnat.Scan.prototype.makeFileUrl = function(xnatFileJson) {
    return gxnat.Path.graftUrl(this['experimentUrl'], 
	      xnatFileJson[gxnat.Scan['fileContentsKey']], 
			   'experiments');

}


/**
 * @inheritDoc
 */
gxnat.Scan.prototype.getThumbnailImage = function(opt_callback){
    //
    // Select the image in the middle of the list to 
    // serve as the thumbnail after sorting the fileURIs
    // using natural sort.
    //
    this['files'] = this['files'].sort(moka.array.naturalCompare);
    var imgInd = /** @type {!number} */
    Math.floor((this['files'].length) / 2);
    //window.console.log(this['files'], this['files'].length, imgInd);
    this['thumbnailUrl'] = this['files'][imgInd] + 
	gxnat.JPEG_CONVERT_SUFFIX;
    if (opt_callback){
	opt_callback(this);
    }
}




