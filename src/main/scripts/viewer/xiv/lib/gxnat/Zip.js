/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.Disposable');
//goog.require('JSZip');


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
 * @return {Object.<string, JSZip.file>}
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


