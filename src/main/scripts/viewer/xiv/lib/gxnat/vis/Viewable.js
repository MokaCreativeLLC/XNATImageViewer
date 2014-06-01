/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('gxnat.vis.Renderable');



/**
 * A Viewable is basically a list of files with optional render properties,
 * since it is a sub-class of Renderable.
 * 
 * @param {string= | Array.string=} opt_files
 * @param {gxnat.slicer.Node=} opt_renderProperties A subclass of 
 *    gxnat.slicer.Node that will be converted to render properties.
 * @extends {gxnat.vis.Renderable}
 */
goog.provide('gxnat.vis.Viewable');
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



goog.exportSymbol('gxnat.vis.Viewable.prototype.getFiles',
	gxnat.vis.Viewable.prototype.getFiles);
goog.exportSymbol('gxnat.vis.Viewable.prototype.removeFile',
	gxnat.vis.Viewable.prototype.removeFile);
goog.exportSymbol('gxnat.vis.Viewable.prototype.addFiles',
	gxnat.vis.Viewable.prototype.addFiles);
goog.exportSymbol('gxnat.vis.Viewable.prototype.dispose',
	gxnat.vis.Viewable.prototype.dispose);
