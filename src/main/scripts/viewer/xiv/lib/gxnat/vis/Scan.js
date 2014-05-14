/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// gxnat
goog.require('gxnat.Path');
goog.require('gxnat.vis.AjaxViewableTree');
goog.require('gxnat.vis.Viewable');
goog.require('gxnat.vis.ViewableGroup');



/**
 * Subclass of the 'AjaxViewableTree' class pertaining to Slicer .mrb files.
 * 
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
    //window.console.log("VIEWABLE JSON", viewableJson);
    //window.console.log("VIEWABLE", this);
}
goog.inherits(gxnat.vis.Scan, gxnat.vis.AjaxViewableTree);
goog.exportSymbol('gxnat.vis.Scan', gxnat.vis.Scan);



/**
 * @const
 */
/**
gxnat.vis.Scan.sessionProperties = {
    "SessionID": {'label': "Session ID", 'value': ['--']},
    "Accession #": {'label':"Accession #", 'value': ['--']},
    "Scanner" : {'label':"Scanner", 'value': ["--"]},
    "Format" : {'label':"Format", 'value': ["--"]},
    "Age" : {'label':"Age", 'value': ["--"]},
    "Gender": {'label':"Gender", 'value': ["--"]},
    "Handedness": {'label':"Handedness", 'value': ["--"]},
    "AcqDate" : {'label':"Acq.Date", 'value': ["--"]},
    "Scan" : {'label':"Scan", 'value': ['--']},
    "Type" : {'label':"type", 'value': ["--"]},
    "Quality" : {'label':"type", 'value': ["--"]},
}
*/


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




/**
 * @const
 * @type {!Array.<string>}
 */
gxnat.vis.Scan.filterableFileTypes = [    
    '.jpg',
    '.jpeg',
    '.gif',
    '.tif',
    '.png',
    '.txt'
]


/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.fileFilter = function(fileName){    
    fileName = gxnat.vis.Scan.superClass_.fileFilter.call(this, fileName);

    if (!goog.isDefAndNotNull(fileName)) { return };
    
    var i = 0;
    var len = gxnat.vis.Scan.filterableFileTypes.length;
    for (; i<len; i++) {
	if (goog.string.caseInsensitiveEndsWith(fileName, 
		gxnat.vis.Scan.filterableFileTypes[i])) {
	    //window.console.log('Found skippable scan file: ', fileName);
	    return null;
	} 
    }
    return fileName;
}


/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.addFiles = function(fileName) {

    //window.console.log("ADD FILES!");
    if (this.ViewableGroups.length == 0){
	var scanGroup = new gxnat.vis.ViewableGroup();
	scanGroup.setTitle('scan');
	this.ViewableGroups.push(scanGroup);
    }
    if (this.ViewableGroups[0].getViewables().length == 0){
	this.ViewableGroups[0].addViewable(new gxnat.vis.Viewable());
    }
    this.ViewableGroups[0].getViewables()[0].addFiles(fileName, 
						      this.fileFilter);
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

    //window.console.log(this, this.ViewableGroups[0]);

    if (!this.ViewableGroups || !this.ViewableGroups[0]) { return };
    //
    // Select the image in the middle of the list to 
    // serve as the thumbnail after sorting the fileURIs
    // using natural sort.
    //
    var sortedFiles = this.ViewableGroups[0].getViewables()[0].getFiles().
	sort(nrg.array.naturalCompare);
    var imgInd = Math.floor((sortedFiles.length) / 2);
    //window.console.log(this['files'], this['files'].length, imgInd);
    this.setThumbnailUrl(sortedFiles[imgInd] + gxnat.JPEG_CONVERT_SUFFIX);
    if (opt_callback){
	opt_callback(this);
    }
}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.dispose = function(){
    goog.base(this, 'dispose');

}
