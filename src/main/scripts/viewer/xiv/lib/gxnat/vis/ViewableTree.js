/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');

// gxnat
goog.require('gxnat.vis.VisNode');



/**
 * @extends {goog.VisNode}
 */
goog.provide('gxnat.vis.ViewableTree');
gxnat.vis.ViewableTree = function(opt_files, opt_displayProperties) {
    goog.base(this);


    /**
     * @type {!Array.<string>}
     * @protected
     */
    this.thumbnailFiles = [];


    /**
     * @type {!Array.<gxnat.vis.ViewableGroup>}
     * @protected
     */
    this.ViewableGroups = [];
}
goog.inherits(gxnat.vis.ViewableTree, gxnat.vis.VisNode);
goog.exportSymbol('gxnat.vis.ViewableTree', gxnat.vis.ViewableTree);



/**
 * @return {!Array.<gxnat.vis.ViewableGroup>}
 * @public
 */
gxnat.vis.ViewableTree.prototype.getViewableGroups = function() {
    return this.ViewableGroups;
}



/** 
 * @inheritDoc
 */
gxnat.vis.ViewableTree.prototype.dispose = function() {
    goog.base(this, 'dispose');

    // ViewableGroups
    goog.array.forEach(this.ViewableGroups, function(ViewableGroup){
	ViewableGroup.dispose();
    })
    delete this.ViewableGroups;


    // Thumbnail Files
    if (goog.isDefAndNotNull(this.thumbnailFiles_)){
	goog.array.clear(this.thumbnailFiles_);
    }
    delete this.thumbnailFiles_;
}
