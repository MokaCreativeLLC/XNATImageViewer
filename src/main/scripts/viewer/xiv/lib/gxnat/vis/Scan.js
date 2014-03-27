/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// gxnat
goog.require('gxnat.Path');
goog.require('gxnat.vis.AjaxViewableTree');
goog.require('gxnat.vis.Viewable');
goog.require('gxnat.vis.ViewableGroup');



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.vis.AjaxViewableTree}
 */
goog.provide('gxnat.vis.Scan');
gxnat.vis.Scan = function(experimentUrl, viewableJson, opt_initComplete) {
    this.setCategory('Scans');
    goog.base(this, experimentUrl, viewableJson, opt_initComplete);


    /**
     * @type {Object}
     * @private
     */
    this.sessionInfo_ = goog.object.clone(gxnat.vis.Scan.sessionProperties);
}
goog.inherits(gxnat.vis.Scan, gxnat.vis.AjaxViewableTree);
goog.exportSymbol('gxnat.vis.Scan', gxnat.vis.Scan);



/**
 * @const
 */
gxnat.vis.Scan.sessionProperties = {
    "SessionID": {'label': "Session ID", 'value': ['EMPTY EXPT']},
    "Accession #": {'label':"Accession #", 'value': ['Empty Accession']},
    "Scanner" : {'label':"Scanner", 'value': ["SIEMENS Sonata"]},
    "Format" : {'label':"Format", 'value': ["DICOM"]},
    "Age" : {'label':"Age", 'value': ["--"]},
    "Gender": {'label':"Gender", 'value': ["--"]},
    "Handedness": {'label':"Handedness", 'value': ["--"]},
    "AcqDate" : {'label':"Acq.Date", 'value': ["09-14-2007"]},
    "Scan" : {'label':"Scan", 'value': ['Empty Scan']},
    "type" : {'label':"type", 'value': ["MPRAGE"]}
}



/**
 * @const
 * @type {!string}
 */
gxnat.vis.Scan.prototype.folderQuerySuffix = 'scans';



/**
 * @const
 * @type {!string}
 */
gxnat.vis.Scan.prototype.fileQuerySuffix = '/files';



/**
 * @type {!string}
 * @protected
 */
gxnat.vis.Scan.prototype.fileContentsKey = 'URI';




gxnat.vis.Scan.prototype.getSessionInfo = function() {
    return this.sessionInfo_;
}




/**
* @inheritDoc
*/
gxnat.vis.Scan.prototype.addFiles = function(fileName) {

    window.console.log("ADD FILES!");
    if (this.ViewableGroups.length == 0){
	this.ViewableGroups.push(new gxnat.vis.ViewableGroup());
    }
    if (this.ViewableGroups[0].getViewables().length == 0){
	this.ViewableGroups[0].addViewable(new gxnat.vis.Viewable());
    }
    this.ViewableGroups[0].getViewables()[0].addFiles(fileName);
}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.makeFileUrl = function(xnatFileJson) {
    return gxnat.Path.graftUrl(this.experimentUrl, 
	      xnatFileJson[this.fileContentsKey], 'experiments');

}


/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.getThumbnailImage = function(opt_callback){

    window.console.log(this);
    //
    // Select the image in the middle of the list to 
    // serve as the thumbnail after sorting the fileURIs
    // using natural sort.
    //
    var sortedFiles = this.ViewableGroups[0].getViewables()[0].getFiles().
	sort(moka.array.naturalCompare);
    var imgInd = /** @type {!number} */
    Math.floor((sortedFiles.length) / 2);
    //window.console.log(this['files'], this['files'].length, imgInd);
    this.setThumbnailUrl(sortedFiles[imgInd] + gxnat.JPEG_CONVERT_SUFFIX);
    if (opt_callback){
	opt_callback(this);
    }
}





