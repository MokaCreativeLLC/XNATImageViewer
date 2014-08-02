/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('gxnat.vis.Viewable');

// goog
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.string');

// gxnat
goog.require('gxnat.slicerNode.Node');
goog.require('gxnat.vis.Renderable');
goog.require('gxnat.Zip');
//-----------



/**
 * A Viewable is basically a list of files with optional render properties,
 * since it is a sub-class of Renderable.
 * 
 * @param {string= | Array.string=} opt_files
 * @param {gxnat.slicerNode.Node=} opt_renderProperties A subclass of 
 *    gxnat.slicerNode.Node that will be converted to render properties.
 * @extends {gxnat.vis.Renderable}
 * @constructor
 */
gxnat.vis.Viewable = function(opt_files, opt_renderProperties) {
    goog.base(this, opt_renderProperties);

    /**
     * @type {!Array.<string>}
     * @private
     */
    this.files_ = opt_files || [];


    if (goog.isDefAndNotNull(opt_renderProperties)){
	this.setRenderProperties(opt_renderProperties);
    }
}
goog.inherits(gxnat.vis.Viewable, gxnat.vis.Renderable);
goog.exportSymbol('gxnat.vis.Viewable', gxnat.vis.Viewable);



/**
 * @retirm {?Object.<string, data>}
 * @public
 */
gxnat.vis.Viewable.prototype.fileData_ = null;




/**
 * @retirm {!Object.<string, data>}
 * @public
 */
gxnat.vis.Viewable.prototype.getFileData = function() {
    return this.fileData_;
}



/**
 * @param {!Object.<string, data>}
 * @public
 */
gxnat.vis.Viewable.prototype.setFileData = function(fileData) {
    return this.fileData_ = fileData;
}



/**
 * @param {!gxnat.Zip} gxnatZip
 * @param {?Function} opt_callback
 * @public
 */
gxnat.vis.Viewable.prototype.setFileDataFromZip = 
function(gxnatZip, opt_callback) {
    //
    // Clear the fileData_ property
    //
    if (goog.isDefAndNotNull(this.fileData_)){
	goog.object.clear(this.fileData_);
    }
    this.fileData_ = {};

    //
    // Set the fileData_ keys to be that of the file names
    //
    var allFiles = this.getFiles();
    goog.array.forEach(allFiles, function(fileName){
	this.fileData_[fileName] = null;
    }.bind(this))

    //
    // Match the fileData to the stored files, popuplating the fileData_
    // object as needed.
    //
    var i, len, currFile, fragment, fileNameOnly, splitPath;
    
    gxnatZip.loopFiles(function(fileName, fileDataArrayBuffer){
	i = 0;
	len = allFiles.length;
	//window.console.log("FILE NAME", fileName);
	for (; i<len; i++){
	    splitPath = fileName.split('/');
	    fileNameOnly = splitPath[splitPath.length -1];
	    //window.console.log('\n\n', splitPath);
	    if(fileNameOnly[0] == '.') { continue }
	    currFile = allFiles[i];
	    fragment = '/files/' + fileName.split('/files/')[1];


	    //window.console.log('File name only: ', fileNameOnly);
	    //window.console.log('Fragment:', fragment);
	    //window.console.log('currFile:', currFile);
	    
	    //
	    // 1st Pass: An XNAT-origin scan
	    //
	    /*
	    if (goog.string.caseInsensitiveEndsWith(currFile, fragment)){
		this.fileData_[currFile] = fileDataArrayBuffer;
		break;
	    } 
	    */

	    //
	    // 2nd Pass: A non-XNAT-origin scan
	    //
	    if (
		goog.string.caseInsensitiveEndsWith(currFile, fileNameOnly)){

		//window.console.log('\nFile name only2: ', fileNameOnly);
		//window.console.log('Buffer: ', fileDataArrayBuffer);
		//window.console.log('currFile:', currFile);
		this.fileData_[currFile] = fileDataArrayBuffer;
		break;
	    }
	}
    }.bind(this), opt_callback)

    gxnatZip.dispose();
}


/**
 * @return {!Array.<string>}
 * @public
 */
gxnat.vis.Viewable.prototype.getFiles = function() {
    return this.files_;
}


/**
 * @param {!string} fileName
 * @public
 */
gxnat.vis.Viewable.prototype.removeFile = function(fileName) {
    window.conosle.log("REMOVING FILE", fileName);
    goog.array.remove(this.files_, fileName);
}


/**
 * @param {!string | !Array.<string>} fileNames
 * @param {Function=} fileFilter
 * @public
 */
gxnat.vis.Viewable.prototype.addFiles = function(fileNames, opt_fileFilter) {
    if (!goog.isDefAndNotNull(this.files_)) { this.files_ = [] }

    if (!goog.isArray(fileNames)) { fileNames = [fileNames] }

    goog.array.forEach(fileNames, function(fileName){
	if (goog.isDefAndNotNull(opt_fileFilter)){
	    var filteredFileName = opt_fileFilter(fileName);
	    if (!goog.isDefAndNotNull(filteredFileName)){
		//window.console.log("Filtering", fileName);
		return; 
	    } 
	}
	this.files_.push(fileName);
    }.bind(this))
}



/** 
 * @inheritDoc
 */
gxnat.vis.Viewable.prototype.dispose = function() {
    goog.base(this, 'dispose');

    // Files
    if (this.files_){
	goog.array.clear(this.files_);
	delete this.files_;
    }
}



goog.exportSymbol('gxnat.vis.Viewable.prototype.getFileData',
	gxnat.vis.Viewable.prototype.getFileData);
goog.exportSymbol('gxnat.vis.Viewable.prototype.setFileData',
	gxnat.vis.Viewable.prototype.setFileData);
goog.exportSymbol('gxnat.vis.Viewable.prototype.setFileDataFromZip',
	gxnat.vis.Viewable.prototype.setFileDataFromZip);
goog.exportSymbol('gxnat.vis.Viewable.prototype.getFiles',
	gxnat.vis.Viewable.prototype.getFiles);
goog.exportSymbol('gxnat.vis.Viewable.prototype.removeFile',
	gxnat.vis.Viewable.prototype.removeFile);
goog.exportSymbol('gxnat.vis.Viewable.prototype.addFiles',
	gxnat.vis.Viewable.prototype.addFiles);
goog.exportSymbol('gxnat.vis.Viewable.prototype.dispose',
	gxnat.vis.Viewable.prototype.dispose);
