/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('goog.array');
goog.require('goog.Disposable');

// gxnat


/**
 * @extends {goog.Disposable}
 */
goog.provide('gxnat.vis.ViewableSet');
gxnat.vis.ViewableSet = function(opt_files, opt_displayProperties) {
    goog.base(this);


    /**
     * @type {!Array.<string>}
     * @protected
     */
    this.thumbnailFiles = [];


    /**
     * @type {!string}
     * @private
     */
    this.thumbnailUrl_ = '';


    /**
     * @type {!Array.<gxnat.vis.Viewable>}
     * @protected
     */
    this.Viewables = [];



    /**
     * @type {!Array.<gxnat.vis.Viewable>}
     * @protected
     */
    this.SubViewables = [];
}
goog.inherits(gxnat.vis.ViewableSet, goog.Disposable);
goog.exportSymbol('gxnat.vis.ViewableSet', gxnat.vis.ViewableSet);



/**
 * @type {!string'};
 * @protected
 */
gxnat.vis.ViewableSet.prototype.category_ = 'Generic';



gxnat.vis.ViewableSet.prototype.addFiles = function(fileName) {
    if (!this.files){
	this.files = [];
    }

    this.files.push(fileName)
}



gxnat.vis.ViewableSet.prototype.setCategory = function(cat) {
    this.category_ = cat;
}



gxnat.vis.ViewableSet.prototype.getCategory = function() {
    return this.category_;
}



gxnat.vis.ViewableSet.prototype.setThumbnailUrl = function(url) {
    this.thumbnailUrl_ = url;
}



gxnat.vis.ViewableSet.prototype.getThumbnailUrl = function() {
    return this.thumbnailUrl_;
}



gxnat.vis.ViewableSet.prototype.getViewables = function() {
    return this.Viewables;
}



gxnat.vis.ViewableSet.prototype.addSubViewable = function(subViewable) {
    if (this.SubViewables.indexOf(subViewable) == -1){
	this.SubViewables.push(subViewable);
    }
}


gxnat.vis.ViewableSet.prototype.getSubViewables = function() {
    return this.SubViewables;
}


/** 
 * @inheritDoc
 */
gxnat.vis.ViewableSet.prototype.dispose = function() {
    goog.base(this, 'dispose');
    goog.array.forEach(this.Viewables_, function(Viewable){
	Viewable.dispose();
    })
}
