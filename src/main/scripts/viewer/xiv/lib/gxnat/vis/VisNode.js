/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.Disposable');


/**
 * @extends {goog.Disposable}
 */
goog.provide('gxnat.vis.VisNode');
gxnat.vis.VisNode = function(opt_files, opt_displayProperties) {
    goog.base(this);
}
goog.inherits(gxnat.vis.VisNode, goog.Disposable);
goog.exportSymbol('gxnat.vis.VisNode', gxnat.vis.VisNode);



/**
 * @type {!string}
 * @protected
 */
gxnat.vis.VisNode.prototype.category_ = 'Generic';




/**
 * Allows setting of the category. 
 *
 * @param {!string} cat The category to set.
 * @public
 */
gxnat.vis.VisNode.prototype.setCategory = function(cat) {
    this.category_ = cat;
}



/**
 * @return {!string}
 * @public
 */
gxnat.vis.VisNode.prototype.getCategory = function() {
    return this.category_;
}



/**
 * @type {!string}
 * @private
 */
gxnat.vis.VisNode.prototype.thumbnailUrl_ = '';



/**
 * Allows setting of the thumbnailUrl. 
 *
 * @param {!string} url The thumbnail url.
 * @public
 */
gxnat.vis.VisNode.prototype.setThumbnailUrl = function(url) {
    this.thumbnailUrl_ = url;
}



/**
 * @return {!string}
 * @public
 */
gxnat.vis.VisNode.prototype.getThumbnailUrl = function() {
    return this.thumbnailUrl_;
}



/**
 * @type {?string}
 * @private
 */
gxnat.vis.VisNode.prototype.title_ = null;



/**
 * Allows setting of the title. 
 *
 * @param {!string} title The title to set..
 * @public
 */
gxnat.vis.VisNode.prototype.setTitle = function(title) {
    this.title_ = title;
}



/**
 * @return {!string}
 * @public
 */
gxnat.vis.VisNode.prototype.getTitle = function() {
    return this.title_;
}



/** 
 * @inheritDoc
 */
gxnat.vis.VisNode.prototype.dispose = function() {
    goog.base(this, 'dispose');

    if (this.category_){
	delete this.category_;
    }
    
    if (this.thumbnailUrl_){
	delete this.thumbnailUrl_;
    }

    if (this.title_){
	delete this.title_;
    }
}


goog.exportSymbol('gxnat.vis.VisNode.prototype.setCategory',
	gxnat.vis.VisNode.prototype.setCategory);
goog.exportSymbol('gxnat.vis.VisNode.prototype.getCategory',
	gxnat.vis.VisNode.prototype.getCategory);
goog.exportSymbol('gxnat.vis.VisNode.prototype.setThumbnailUrl',
	gxnat.vis.VisNode.prototype.setThumbnailUrl);
goog.exportSymbol('gxnat.vis.VisNode.prototype.getThumbnailUrl',
	gxnat.vis.VisNode.prototype.getThumbnailUrl);
goog.exportSymbol('gxnat.vis.VisNode.prototype.setTitle',
	gxnat.vis.VisNode.prototype.setTitle);
goog.exportSymbol('gxnat.vis.VisNode.prototype.getTitle',
	gxnat.vis.VisNode.prototype.getTitle);
goog.exportSymbol('gxnat.vis.VisNode.prototype.dispose',
	gxnat.vis.VisNode.prototype.dispose);
