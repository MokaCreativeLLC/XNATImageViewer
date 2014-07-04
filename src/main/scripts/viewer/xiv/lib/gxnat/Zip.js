/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.Disposable');
goog.require('goog.object');
goog.require('JSZip');


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
goog.exportSymbol('gxnat.Zip.prototype.dispose', gxnat.Zip.prototype.dispose);
