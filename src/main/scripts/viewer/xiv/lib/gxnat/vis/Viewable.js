/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('gxnat.vis.Renderable');



/**
 * @extends {goog.Disposable}
 */
goog.provide('gxnat.vis.Viewable');
gxnat.vis.Viewable = function(opt_files, opt_renderProperties) {
    goog.base(this);

    /**
     * @type {!Array.<string>}
     * @private
     */
    this.files_ = opt_files || [];

}
goog.inherits(gxnat.vis.Viewable, gxnat.vis.Renderable);
goog.exportSymbol('gxnat.vis.Viewable', gxnat.vis.Viewable);



/**
 * @return {!Array.<string>}
 */
gxnat.vis.Viewable.prototype.getFiles = function() {
    return this.files_;
}



gxnat.vis.Viewable.prototype.addFiles = function(fileName) {
    if (!this.files_){
	this.files_ = [];
    }
    this.files_.push(fileName)
}



/** 
 * @inheritDoc
 */
gxnat.vis.Viewable.prototype.dispose = function() {
    goog.base(this, 'dispose');
    if (this.files_){
	goog.array.clear(this.files_);
	delete this.files_;
    }
}
