/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.Disposable');
goog.require('goog.object');
goog.require('JSZip');

// gxnat
goog.require('gxnat');

/**
 * @constructor
 * @param {Array} arrayBuffer 
 * @extends {goog.Disposable}
 */
goog.provide('gxnat.Zip');
gxnat.Zip = function(arrayBuffer){
    /**
     * @type {JSZip}
     * @private
     */
    this.Zip_ = new JSZip(arrayBuffer);
}
goog.inherits(gxnat.Zip, goog.Disposable);
goog.exportSymbol('gxnat.Zip', gxnat.Zip);



/**
 * @param {!string} filesUrl
 * @param {!Function} onLoad
 * @param {Function=} opt_onProgress
 * @param {Function=} opt_onError
 *
 * @throws {Error} If filesUrl doesn't end in '/files'
 * @public
 */
gxnat.Zip.getFilesAsZip = 
function(filesUrl, onLoad, opt_onProgress, opt_onError){
    //
    // Check if filesURl ends in '/files'
    //
    if (!goog.string.caseInsensitiveEndsWith(filesUrl, '/files')){
	throw new Error("filesUrl must end in '/files'!");
    }
									      
    //
    // Append the zipSuffix
    //
    filesUrl += gxnat.ZIP_SUFFIX;
    
    //
    // Construct the xhr request
    //
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filesUrl);
    //xhr.timeout = 5000; 

    //
    // IMPORTANT: Set the type as an arraybuffer
    //
    xhr.responseType = "arraybuffer";

    //
    // onLoad
    //
    xhr.addEventListener('load', function(){
	var arraybuffer = xhr.response;
	//onLoad(new JSZip(arraybuffer));
	onLoad(new gxnat.Zip(arraybuffer));
    });

    //
    // Progress
    //
    if (goog.isDefAndNotNull(opt_onProgress)){
	xhr.addEventListener('progress', opt_onProgress);
    }

    //
    // Error
    //
    if (goog.isDefAndNotNull(opt_onError)){
	xhr.addEventListener('error', function(event) {
	    window.console.log("DOWNLOAD ERROR: ", event);
	    opt_onError(xhr, event);
	});
    }

    //
    // Get the zip!!
    //
    xhr.send();
}




/**
 * @return {Object.<string, ZipObject>}
 */
gxnat.Zip.prototype.getFiles = function(url) {
    return this.Zip_.files;
}




/**
 * @param {!Function} callback
 * @public
 */
gxnat.Zip.prototype.loopFiles = function(callback) {
    goog.object.forEach(this.getFiles(), function(file, fileKey){
	//window.console.log(file);
	callback(file.name, file.asArrayBuffer());
    }.bind(this))
}




/**
 * @inheritDoc
 */
gxnat.Zip.prototype.dispose = function(url) {
    goog.base(this, 'dispose');
    
    this.loopFiles(function(fileName){	       
	this.Zip_.remove(fileName);
    }.bind(this))

    goog.object.clear(this.Zip_);
    delete this.Zip_;
}



goog.exportSymbol('gxnat.Zip.prototype.getFiles',
	gxnat.Zip.prototype.getFiles);
goog.exportSymbol('gxnat.Zip.prototype.loopFiles',
	gxnat.Zip.prototype.loopFiles);
goog.exportSymbol('gxnat.Zip.getFilesAsZip', gxnat.Zip.getFilesAsZip);
goog.exportSymbol('gxnat.Zip.prototype.dispose', gxnat.Zip.prototype.dispose);
