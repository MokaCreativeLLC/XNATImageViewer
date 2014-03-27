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
goog.provide('gxnat.vis.VisNode');
gxnat.vis.VisNode = function(opt_files, opt_displayProperties) {
    goog.base(this);
}
goog.inherits(gxnat.vis.VisNode, goog.Disposable);
goog.exportSymbol('gxnat.vis.VisNode', gxnat.vis.VisNode);



/**
 * @type {!string'};
 * @protected
 */
gxnat.vis.VisNode.prototype.category_ = 'Generic';


gxnat.vis.VisNode.prototype.setCategory = function(cat) {
    this.category_ = cat;
}



gxnat.vis.VisNode.prototype.getCategory = function() {
    return this.category_;
}




/**
 * @type {!string}
 * @private
 */
gxnat.vis.VisNode.prototype.thumbnailUrl_ = '';




gxnat.vis.VisNode.prototype.setThumbnailUrl = function(url) {
    this.thumbnailUrl_ = url;
}



gxnat.vis.VisNode.prototype.getThumbnailUrl = function() {
    return this.thumbnailUrl_;
}



/**
 * @type {?string}
 * @private
 */
gxnat.vis.VisNode.prototype.title_ = null;




gxnat.vis.VisNode.prototype.setTitle = function(title) {
    this.title_ = title;
}



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
