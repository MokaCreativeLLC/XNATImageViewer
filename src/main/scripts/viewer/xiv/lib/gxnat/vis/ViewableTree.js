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
 * @param {!Object} projMeta
 * @param {!Object} subjMeta
 * @param {!Object} exptMeta
 * @struct
 */
gxnat.vis.ViewableTree.metadataCollection = 
function(projMeta, subjMeta, exptMeta){
    this.project = projMeta;
    this.subject = subjMeta;
    this.experiment = exptMeta;
};
goog.exportSymbol('gxnat.vis.ViewableTree.metadataCollection', 
		  gxnat.vis.ViewableTree.metadataCollection);


/**
 * @type {?Object}
 * @protected
 */
gxnat.vis.ViewableTree.prototype.projectMetadata = null;



/**
 * @type {?Object}
 * @protected
 */
gxnat.vis.ViewableTree.prototype.subjectMetadata = null;



/**
 * @type {?Object}
 * @protected
 */
gxnat.vis.ViewableTree.prototype.experimentMetadata = null;


/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setProjectMetadata = function(meta) {
    this.projectMetadata = meta;
}



/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setSubjectMetadata = function(meta) {
    var metadata1 =  meta['children'][0]['items'][0]['data_fields'];
    var metadata2 =  meta['children'][1]['items'][0]['data_fields'];
    goog.object.extend(metadata1, metadata2);
    this.subjectMetadata = metadata1;
}



/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setExperimentMetadata = function(meta) {
    this.experimentMetadata = meta;
}



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

    // metadata
    if (goog.isDefAndNotNull(this.projectMetadata)){
	goog.object.clear(this.projectMetadata);
	delete this.projectMetdata;
    }
    if (goog.isDefAndNotNull(this.subjectMetadata)){
	goog.object.clear(this.subjectMetadata);
	delete this.subjectMetdata;
    }
    if (goog.isDefAndNotNull(this.experimentMetadata)){
	goog.object.clear(this.experimentMetadata);
	delete this.experimentMetdata;
    }

    // ViewableGroups
    if (goog.isDefAndNotNull(this.ViewableGroups)){
	goog.array.forEach(this.ViewableGroups, function(ViewableGroup){
	    ViewableGroup.dispose();
	})
	delete this.ViewableGroups;
    }


    // Thumbnail Files
    if (goog.isDefAndNotNull(this.thumbnailFiles_)){
	goog.array.clear(this.thumbnailFiles_);
    }
    delete this.thumbnailFiles_;
}
