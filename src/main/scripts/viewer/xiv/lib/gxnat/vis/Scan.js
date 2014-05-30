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
 * @param {Object=} opt_viewableJson The json associated with the viewable.
 * @param {string=} opt_experimentUrl The experiment-level url of the viewable.
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.vis.AjaxViewableTree}
 */
goog.provide('gxnat.vis.Scan');
gxnat.vis.Scan = 
function(opt_viewableJson, opt_experimentUrl, opt_initComplete) {
    //
    // superclass
    //
    goog.base(this, 'Scans', opt_viewableJson, opt_experimentUrl);

    //
    // Set the init frames to 0
    //
    this.sessionInfo['Total Frames'] = 0;

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
gxnat.vis.Scan.prototype.getFileList = function(callback){
    //
    // Run callback if we already have the files
    //
    if (this.filesGotten){
	callback();
	return;
    }

    //
    // A sample query looks like this:
    //http://localhost:8080/xnat/REST/projects/2/subjects/
    //localhost_S00004/experiments/localhost_E00017/scans/7?format=json
    //

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
	gxnat.vis.Scan.superClass_.getFileList.call(this, function(){
	    this.getThumbnailImage();
	    callback();
	}.bind(this));
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
gxnat.vis.Scan.prototype.addFiles = function(fileNames) {

    //window.console.log("ADD FILES!");
    if (this.ViewableGroups.length == 0){
	var scanGroup = new gxnat.vis.ViewableGroup();
	scanGroup.setTitle('scan');
	this.ViewableGroups.push(scanGroup);
    }
    if (this.ViewableGroups[0].getViewables().length == 0){
	this.ViewableGroups[0].addViewable(new gxnat.vis.Viewable());
    }
    this.ViewableGroups[0].getViewables()[0].addFiles(fileNames, 
						      this.fileFilter);

    this.sessionInfo['Total Frames'] = 
	this.ViewableGroups[0].getViewables()[0].getFiles().length;

}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.makeFileUrl = function(xnatFileJson) {
    return gxnat.Path.graftUrl(this.experimentUrl, 
	      xnatFileJson[this.fileContentsKey], 'experiments');

}


/**
* source: https://github.com/overset/javascript-natural-sort/blob/master/naturalSort.js
*/
gxnat.vis.Scan.naturalSort = function(a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return gxnat.vis.Scan.naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}



/**
 * @inheritDoc
 */
gxnat.vis.Scan.prototype.getThumbnailImage = function(opt_callback){
    //window.console.log('GET THUMBNAIL IMAGE');
    var useMontage = false;

    if (!useMontage) {
    
	//window.console.log('NOT USING MONTAGE');
	//window.console.log(this, this.ViewableGroups[0]);

	if (!this.ViewableGroups || !this.ViewableGroups[0]) { return };

	//
	// Select the image in the middle of the list to 
	// serve as the thumbnail after sorting the fileURIs
	// using natural sort.
	//
	var sortedFiles = this.ViewableGroups[0].getViewables()[0].getFiles().
	    sort(gxnat.vis.Scan.naturalSort);
	var imgInd = Math.floor((sortedFiles.length) / 2);
	
	//window.console.log("UNSORTED", 
	//		   this.ViewableGroups[0].getViewables()[0].getFiles())
	//window.console.log("SORTED", sortedFiles);

	this.setThumbnailUrl(sortedFiles[imgInd] + gxnat.JPEG_CONVERT_SUFFIX);

	//window.console.log("THUMB URL", this.getThumbnailUrl());


	if (goog.isDefAndNotNull(opt_callback)){
	    opt_callback(this);
	}
	return;
    }

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

    if (goog.isDefAndNotNull(opt_callback)){
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
