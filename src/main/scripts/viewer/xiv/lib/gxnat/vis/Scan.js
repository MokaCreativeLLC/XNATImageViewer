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
    //
    // superclass
    //
    goog.base(this, 'Scans', experimentUrl, viewableJson);

    
    //
    // Get the thumbnail image
    //
    this.getThumbnailImage();


    //
    // Call init complete
    //
    if (opt_initComplete){
	opt_initComplete(this);
    }
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
 * @type {!Array.<string>}
 */
gxnat.vis.Scan.acceptableFileTypes = [    
    'dcm',
    'dicom',
    'ima',
    'nii',
    'nii.gz',
    'nrrd',
    'mgh',
    'mgz',
]



/**
 * @param {!string} abbrev
 * @return {string}
 */
gxnat.vis.Scan.getOrientationFromAbbreviation = function(abbrev){
    switch (abbrev){
    case 'Sag':
	return 'Sagittal';
    case 'Cor':
	return 'Coronal';
    case 'Tra':
	return 'Transverse';
    }
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



/**
 * @type {!Object}
 * @private
 */
gxnat.vis.Scan.prototype.scanMetadata_;




/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.setViewableMetadata = function(){
    //
    // Call superclass
    //
    goog.base(this, 'setViewableMetadata');

    //
    // Orientation
    //
    if (goog.isDefAndNotNull(this.scanMetadata_['parameters/orientation'])){
	this.sessionInfo['Orientation'] = 
	    this.constructor.getOrientationFromAbbreviation(
		this.scanMetadata_['parameters/orientation']);

	//
	// Store the orientation as a property
	//
	this.orientation = this.sessionInfo['Orientation'];
    }
    
    //
    // Acq. Type
    //
    if (goog.isDefAndNotNull(this.scanMetadata_['parameters/acqType'])){
	this.sessionInfo['Acq. Type'] = this.scanMetadata_['parameters/acqType']
    }
}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.getFiles = function(callback){

    //http://localhost:8080/xnat/REST/projects/2/subjects/
    //localhost_S00004/experiments/localhost_E00017/scans/7?format=json

    //
    // Get the scan metadata first
    //
    gxnat.jsonGet(this.Path['originalUrl'], function(scanMetadata) {
	//
	// Store the metadata
	//
	this.scanMetadata_ = scanMetadata['items'][0]['data_fields'];
	//window.console.log("SCAN JSON", this.scanMetadata_);
	
	//
	// set the metadata
	//
	this.setViewableMetadata();

	//
	// Call superclass
	//
	gxnat.vis.Scan.superClass_.getFiles.call(this, callback);
    }.bind(this))

}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.fileFilter = function(fileName){    
    fileName = gxnat.vis.Scan.superClass_.fileFilter.call(this, fileName);
    //window.console.log("FILENAME", fileName);
    if (!goog.isDefAndNotNull(fileName)) { return };
    
    var i = 0;
    var len = gxnat.vis.Scan.acceptableFileTypes.length;
    for (; i<len; i++) {
	//window.console.log(fileName);
	if (goog.string.caseInsensitiveEndsWith(fileName, 
		'.' + gxnat.vis.Scan.acceptableFileTypes[i])) {
	    //window.console.log('Found usable scan file: ', fileName);
	    return fileName;
	} 
    }
    window.console.log('Found skippable scan file: ', fileName);
    return null;
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

    //if (!this.ViewableGroups || !this.ViewableGroups[0]) { return };

    //
    // Use the cached XNAT Thumbnail image - for performance.
    //

    // reference
    var refStr = "/xnat/REST/experiments/localhost_E00003/scans/1a" + 
	"/resources/SNAPSHOTS/files?file_content=THUMBNAIL&index=0"

    var thumbUrl = this.Path['prefix'] + '/experiments/' + 
	this.Path['experiments'] + '/scans/' + this.Path['scans'] + 
	"/resources/SNAPSHOTS/files?file_content=THUMBNAIL&index=0";

    this.setThumbnailUrl(thumbUrl);

    if (opt_callback){
	opt_callback(this);
    }
}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.dispose = function(){
    goog.base(this, 'dispose');

    if (goog.isDefAndNotNull(this.scanMetadata_)){
	goog.object.clear(this.scanMetadata_);
    }
    delete this.scanMetadata_;
}
