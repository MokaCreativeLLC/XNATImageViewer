/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('gxnat.vis.Slicer');

// goog
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.string.path');

// nrg
goog.require('nrg.string');

// gxnat
goog.require('gxnat');
goog.require('gxnat.slicerNode.SceneView');
goog.require('gxnat.slicerNode.Mrml');
goog.require('gxnat.slicerNode.Volume');
goog.require('gxnat.slicerNode.Displayable');
goog.require('gxnat.slicerUtils');
goog.require('gxnat.vis.AjaxViewableTree');
goog.require('gxnat.vis.ViewableGroup');
goog.require('gxnat.vis.Scan');
goog.require('gxnat.vis.Viewable');

//-----------



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 *
 * @param {Object=} opt_viewableJson The json associated with the viewable.
 * @param {string=} opt_experimentUrl The experiment-level url of the viewable.
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.vis.AjaxViewableTree}
 */
gxnat.vis.Slicer = 
function(opt_viewableJson, opt_experimentUrl, opt_initComplete) {

    /**
     * @type {!Array.<string>}
     * @private
     */
    this.mrbFiles_ = [];

    //
    // Call parent init to get the base properties
    //
    goog.base(this, 'Slicer Scenes', opt_viewableJson, opt_experimentUrl);


    if (opt_initComplete){
	opt_initComplete(this);
    }
}
goog.inherits(gxnat.vis.Slicer, gxnat.vis.AjaxViewableTree);
goog.exportSymbol('gxnat.vis.Slicer', gxnat.vis.Slicer);



/**
 * @const
 * @type {!Array.string}
 */
gxnat.vis.Slicer.thumbnailExtensions = [
    'jpeg', 
    'jpg', 
    'png', 
    'gif'
];



/**
 * @type {!string}
 */
gxnat.vis.Slicer.prototype.folderQuerySuffix = 'resources/Slicer/files';



/**
 * @const
 * @type {!string}
 */
gxnat.vis.Slicer.prototype.fileQuerySuffix = '?listContents=true';



/**
 * @type {!string}
 * @protected
 */
gxnat.vis.Slicer.prototype.fileContentsKey = 'File Name';



/**
 * @inheritDoc
 */
gxnat.vis.Slicer.prototype.getFileList = function(callback){

    //
    // Run callback if we already have the files
    //
    if (this.filesGotten){
	this.getMrmlNodes_(callback);
	return;
    }


    gxnat.vis.Scan.superClass_.getFileList.call(this, function(){
	//
	// Then get the thumbnail image
	//
	this.getThumbnailImage(function(){

	    //
	    // set the metadata
	    //
	    this.setViewableMetadata();


	    //
	    // Then get the mrml nodes
	    //
	    this.getMrmlNodes_(callback);
	}.bind(this));

    }.bind(this));
}




/**
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @private
 */
gxnat.vis.Slicer.prototype.getMrmlNodes_ = function(opt_initComplete){
    //
    // Then get mrml nodes
    //
    gxnat.slicerUtils.getMrmlNodes(this.mrbFiles_, this.queryUrl, 
	function(mrmlNodes) {
	    //
	    // Then we get the sceneViewNodes within the mrml nodes.
	    //
	    gxnat.slicerUtils.getSceneViewNodes(mrmlNodes, 
		function(sceneViewNodes){
		    //
		    // Then convert SceneView nodes to viewableGroups
		    //
		    this.convertToViewableGroups(sceneViewNodes, 
						 mrmlNodes,
						 opt_initComplete);
		}.bind(this))	
	}.bind(this))

}



/**
 * @param {!Array.<gxnat.slicerNode.SceneView>} sceneViewNodes
 * @param {!Array.<gxnat.slicerNode.Mrml>} mrmlNodes
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 */
gxnat.vis.Slicer.prototype.convertToViewableGroups = 
function(sceneViewNodes, mrmlNodes, opt_initComplete) {

    this.mrml = mrmlNodes;
    this.sceneViews = sceneViewNodes;

    var viewTypes;
    var ViewablesPerGroup;
    var fileName;
    var ViewableGroup;

    //
    // Cycle through the sceneView nodes.
    //
    goog.array.forEach(this.sceneViews, function(sceneView) {
	viewTypes = [sceneView.volumes || [],  sceneView.meshes  || [], 
		     sceneView.fibers  || []];
	ViewablesPerGroup = [];

	// Cycle through the meshes, volumes and vibers in the sceneView
	goog.array.forEach(viewTypes, function(viewType){
	    goog.array.forEach(viewType, function(displayable){
		//window.console.log('\n\n');
		// Clean the file URLS so we can query them correctly.
		fileName = gxnat.slicerUtils.matchFileToSet(
		    goog.string.path.basename(displayable.file), 
		    this.mrbFiles_);
		//window.console.log(displayable.file, this.mrbFiles_,fileName);
		// Make some specialized adjustments for volumes
		if (displayable.properties instanceof 
		    gxnat.slicerNode.Volume) {
		    this.adjustVolumeDisplayProperties_(displayable);
		}

		// Store each viewable 
		ViewablesPerGroup.push(new gxnat.vis.Viewable(
		    fileName, displayable.properties))

		//window.console.log("FILENAME", displayable.file);
		//window.console.log("FILENAME2", displayable, fileName);
	    }.bind(this))
	}.bind(this))

	
	// Create the ViewableGroup
	ViewableGroup = new gxnat.vis.ViewableGroup(ViewablesPerGroup);

	// Set the thumbnail url of the ViewableGroup
	/**
	window.console.log(sceneView.element);
	window.console.log(gxnat.slicerUtils.
			   getThumbnail(sceneView.element, 
					this.mrml[0].document));
	window.console.log(this.mrbFiles_);
	window.console.log("MATCHED", 	    gxnat.slicerUtils.matchFileToSet(
		gxnat.slicerUtils.getThumbnail(sceneView.element, 
			this.mrml[0].document), this.mrbFiles_))
	*/

	ViewableGroup.setThumbnailUrl(
	    gxnat.slicerUtils.matchFileToSet(
		gxnat.slicerUtils.getThumbnail(sceneView.element, 
			this.mrml[0].document), this.mrbFiles_)
	);

	// Set the other properties and store
	ViewableGroup.setTitle(sceneView.element.getAttribute('name'));
	ViewableGroup.setRenderProperties(sceneView);
	this.ViewableGroups.push(ViewableGroup);

    }.bind(this))


    //
    // Init complete function.
    //
    if (opt_initComplete){
	opt_initComplete(this);
    }
}




/**
 * @param {!gxnat.slicerNode.Displayable} displayable
 */
gxnat.vis.Slicer.prototype.adjustVolumeDisplayProperties_ = 
function(displayable){
    //
    // We have to make some URL adjustments to label map files
    //
    if ( displayable.properties.labelMap) {

	// The label map file
	displayable.properties['labelMapFile'] = 
	    gxnat.slicerUtils.matchFileToSet(
		displayable.properties.labelMap.file, 
		this.mrbFiles_);

	//
	// If the color table file is defined...
	//
	if (goog.isDefAndNotNull(
	    displayable.properties.labelMap.colorTableFile)){

	    //
	    // First check if the color table matches a local instance
	    // within the mrb itself...
	    //
	    var mrbColorTable = gxnat.slicerUtils.matchFileToSet(
		displayable.properties.labelMap.colorTableFile, 
		this.mrbFiles_);
	    
	    //
	    // If the color table is not found in the MRB, use the stored one
	    // in the displayable
	    //
	    if (!goog.isDefAndNotNull(mrbColorTable)) {
		displayable.properties['colorTableFile'] =
		    displayable.properties.labelMap.colorTableFile;
	    } 
	}
	//window.console.log(displayable);
    }
}




/**
 * @inheritDoc
 */
gxnat.vis.Slicer.prototype.getThumbnailImage = function(opt_callback){

    var ext = '';
    var i =  0;
    var len = this.mrbFiles_.length;
    var thumbFound = false;

    this['thumbnailFiles'] = [];

    //
    // Get all files that match the image extension.
    //
    for (; i < len; i++) {
	ext = nrg.string.getFileExtension(this.mrbFiles_[i]);
	if (gxnat.vis.Slicer.thumbnailExtensions.indexOf(ext) != -1) {
	    this['thumbnailFiles'].push(this.mrbFiles_[i]);
	}
	if (thumbFound) { break };
    }
    //window.console.log('Thumbnail files', this['thumbnailFiles']);

    //
    // Clean the file urls.
    //
    // IMPORTANT!!!       DO NOT ERASE!!!
    //
    // Slicer will try to URL-encode filenames when packaged as an
    // .mrb. This creates issues when servers try to url encode the 
    // string, which is already encoded once.  So, we have to replace them.
    //
    goog.array.forEach(this['thumbnailFiles'], function(fileName, i){
	if (fileName.indexOf('%20') != -1){
	    this['thumbnailFiles'][i] = fileName.replace(/%20/g, '%2520');
	}
    }.bind(this))


    //
    // Determine which image file should serve as the thumbnail.
    // Rule out those that are in a 'Data' sub-directory.
    //
    len = this['thumbnailFiles'].length;
    for (i=0; i < len; i++) {
	if (nrg.string.basename(nrg.string.dirname(
	    this['thumbnailFiles'][i])) != 'Data'){
	    this.setThumbnailUrl(this['thumbnailFiles'][i]);
	    break;
	}
    }
    //window.console.log('Thumbnail files2', this['thumbnailFiles']);

    //
    // Run callback
    //
    if (opt_callback){
	opt_callback(this);
    }
}



/**
 * @inheritDoc
 */
gxnat.vis.Slicer.prototype.addFiles = function(fileNames) {
    if (!goog.isArray(fileNames)) { fileNames = [fileNames] };
    goog.array.forEach(fileNames, function(fileName){
	this.mrbFiles_.push(fileName);
    }.bind(this))
}




goog.exportSymbol('gxnat.vis.Slicer.thumbnailExtensions',
	gxnat.vis.Slicer.thumbnailExtensions);
goog.exportSymbol('gxnat.vis.Slicer.prototype.folderQuerySuffix',
	gxnat.vis.Slicer.prototype.folderQuerySuffix);
goog.exportSymbol('gxnat.vis.Slicer.prototype.fileQuerySuffix',
	gxnat.vis.Slicer.prototype.fileQuerySuffix);
goog.exportSymbol('gxnat.vis.Slicer.prototype.fileContentsKey',
	gxnat.vis.Slicer.prototype.fileContentsKey);
goog.exportSymbol('gxnat.vis.Slicer.prototype.getFileList',
	gxnat.vis.Slicer.prototype.getFileList);
goog.exportSymbol('gxnat.vis.Slicer.prototype.convertToViewableGroups',
	gxnat.vis.Slicer.prototype.convertToViewableGroups);
goog.exportSymbol('gxnat.vis.Slicer.prototype.getThumbnailImage',
	gxnat.vis.Slicer.prototype.getThumbnailImage);
goog.exportSymbol('gxnat.vis.Slicer.prototype.addFiles',
	gxnat.vis.Slicer.prototype.addFiles);
