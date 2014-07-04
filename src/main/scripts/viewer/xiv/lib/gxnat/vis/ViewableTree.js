/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.object');

// gxnat
goog.require('gxnat.vis.VisNode');
goog.require('gxnat.vis.ViewableGroup');

//-----------



/**
 * @extends {gxnat.vis.VisNode}
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
 * @type {?string}
 * @protected
 */
gxnat.vis.ViewableTree.prototype.orientation = null;


/**
 * @return {?string}
 */
gxnat.vis.ViewableTree.prototype.getOrientation = function(){
    return this.orientation;
}



/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setProjectMetadata = function(meta) {
    //window.console.log("PROJECT METADATA", meta);
    this.projectMetadata = meta;
}



/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setSubjectMetadata = function(meta) {
    //window.console.log("SUBJECT METADATA", meta);
    this.subjectMetadata = meta;
}



/**
 * @return {!Object} meta
 * @public
 */
gxnat.vis.ViewableTree.prototype.setExperimentMetadata = function(meta) {
    //window.console.log("EXPT METADATA", meta);
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


    delete this.orientation;
}



goog.exportSymbol('gxnat.vis.ViewableTree.metadataCollection',
	gxnat.vis.ViewableTree.metadataCollection);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.projectMetadata',
	gxnat.vis.ViewableTree.prototype.projectMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.subjectMetadata',
	gxnat.vis.ViewableTree.prototype.subjectMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.experimentMetadata',
	gxnat.vis.ViewableTree.prototype.experimentMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.orientation',
	gxnat.vis.ViewableTree.prototype.orientation);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.getOrientation',
	gxnat.vis.ViewableTree.prototype.getOrientation);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.setProjectMetadata',
	gxnat.vis.ViewableTree.prototype.setProjectMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.setSubjectMetadata',
	gxnat.vis.ViewableTree.prototype.setSubjectMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.setExperimentMetadata',
	gxnat.vis.ViewableTree.prototype.setExperimentMetadata);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.getViewableGroups',
	gxnat.vis.ViewableTree.prototype.getViewableGroups);
goog.exportSymbol('gxnat.vis.ViewableTree.prototype.dispose',
	gxnat.vis.ViewableTree.prototype.dispose);
