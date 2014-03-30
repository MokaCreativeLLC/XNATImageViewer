/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');

// moka
goog.require('moka.string');
goog.require('gxnat');
goog.require('gxnat.slicer');
goog.require('gxnat.vis.AjaxViewableTree');
goog.require('gxnat.vis.ViewableGroup');



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.vis.AjaxViewableTree}
 */
goog.provide('gxnat.vis.Slicer');
gxnat.vis.Slicer = function(experimentUrl, viewableJson, 
				      opt_initComplete) {

    this.setCategory('Slicer Scenes');


    /**
     * @type {!Array.<string>}
     * @private
     */
    this.mrbFiles_ = [];

    
    //
    // Call parent init to get the base properties
    //
    goog.base(this, experimentUrl, viewableJson, function() {

	//
	// Then get mrml nodes
	//
	gxnat.slicer.getMrmlNodes(this.mrbFiles_, this.queryUrl, 
        function(mrmlNodes) {

	    //
	    // Then we get the sceneViewNodes within the mrml nodes.
	    //
	    gxnat.slicer.getSceneViewNodes(mrmlNodes, 
		function(sceneViewNodes){
		    window.console.log("\n\n*****SCENE VIEW NODES", 
				       sceneViewNodes);

		    //
		    // Then convert SceneView nodes to viewable groups
		    //
		    this.convertToViewableGroups(sceneViewNodes, 
						 mrmlNodes,
						 opt_initComplete);
		}.bind(this))	
	}.bind(this))
    }.bind(this))
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
 * @param {!Array.<gxnat.slicer.SceneViewNode>} sceneViewNodes
 * @param {!Array.<gxnat.slicer.MrmlNode>} mrmlNodes
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 */
gxnat.vis.Slicer.prototype.convertToViewableGroups = 
function(sceneViewNodes, mrmlNodes, opt_initComplete) {

    this.mrml = mrmlNodes;
    this.sceneViews = sceneViewNodes;

    goog.array.forEach(this.sceneViews, function(sceneView){

	var ViewablesPerSceneView = [];
	var ViewableGroupProperties = {};
	var ViewableGroupFiles = [];
	var viewTypes = [sceneView.volumes || [], 
			 sceneView.meshes  || [], 
			 sceneView.fibers  || []];

	var fileName = '';

	goog.array.forEach(viewTypes, function(viewType){
	    goog.array.forEach(viewType, function(displayable){
		
		//
		// Clean the file URLS so we can query them.
		//
		//window.console.log("FILENAME", displayable.file, 
		//		   this.mrbFiles_);
		fileName = gxnat.slicer.matchFileToSet(
		    goog.string.path.basename(displayable.file), 
		    this.mrbFiles_)
		

		//window.console.log("FILENAME2", displayable.file, 
		//		   fileName);

		//
		// Merge the properties into one set.
		//
		ViewableGroupProperties = 
		    goog.object.clone(displayable.
				      properties.general[0]);
		goog.object.extend(ViewableGroupProperties,
				   goog.object.clone(
				       displayable.properties.specific))

		//
		// For label maps...
		//
		if (ViewableGroupProperties.labelMap){
		    
		    ViewableGroupProperties.labelMap.file = 
			gxnat.slicer.matchFileToSet(
			    ViewableGroupProperties.labelMap.file, 
			    this.mrbFiles_)


		    ViewableGroupProperties['colorTableFile'] =
			gxnat.slicer.matchFileToSet(
			    ViewableGroupProperties.labelMap.colorTableFile, 
			    this.mrbFiles_)
		    
		}


		//ViewableGroupFiles.push(fileName);
		ViewablesPerSceneView.push(new gxnat.vis.Viewable(
		    fileName, ViewableGroupProperties))

	    }.bind(this))
	}.bind(this))

	
	var viewGroup = new gxnat.vis.ViewableGroup(
	    ViewablesPerSceneView);

	window.console.log("MATCH THIS!", 
			   gxnat.slicer.getThumbnail(sceneView.element, 
						     this.mrml[0].document),
			   this.mrbFiles_,
			   gxnat.slicer.matchFileToSet(
			       gxnat.slicer.getThumbnail(sceneView.element, 
							 this.mrml[0].document), 
			       this.mrbFiles_)
			  );
	//
	// Set the thumbnail url of the sceneView
	//
	viewGroup.setThumbnailUrl(
	    gxnat.slicer.matchFileToSet(
		gxnat.slicer.getThumbnail(sceneView.element, 
					  this.mrml[0].document), 
		this.mrbFiles_)
	);


	//
	// Set the title of the sceneView
	//
	viewGroup.setTitle(sceneView.element.getAttribute('name'));
	viewGroup.setRenderProperties(
	    gxnat.vis.convertToRenderProperties(sceneView));
	
	this.ViewableGroups.push(viewGroup);

    }.bind(this))


    //
    // Convert the scene View nodes to Viewables
    //
    window.console.log('\n\n\n\nSLICER VIEWABLE', this);

    //
    // Init complete function.
    //
    if (opt_initComplete){
	opt_initComplete(this);
    }

}






/**
 * @inheritDoc
 */
gxnat.vis.Slicer.prototype.getThumbnailImage = function(opt_callback){

    var ext = /** @type {!string} */ '';
    var i = /** @type {!number} */ 0;
    var len = /** @type {!number} */ this.mrbFiles_.length;
    var thumbFound = /** @type {!boolean} */ false;

    this['thumbnailFiles'] = [];

    //
    // Get all files that match the image extension.
    //
    for (; i < len; i++) {
	ext = moka.string.getFileExtension(this.mrbFiles_[i]);
	if (gxnat.vis.Slicer.thumbnailExtensions.indexOf(ext) != -1) {
	    this['thumbnailFiles'].push(this.mrbFiles_[i]);
	}
	if (thumbFound) { break };
    }


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
	if (moka.string.basename(moka.string.dirname(
	    this['thumbnailFiles'][i])) != 'Data'){
	    this.setThumbnailUrl(this['thumbnailFiles'][i]);
	    break;
	}
    }
    

    //
    // Run callback
    //
    if (opt_callback){
	opt_callback(this);
    }
}








gxnat.vis.Slicer.prototype.addFiles = function(fileName) {
    this.mrbFiles_.push(fileName)
}
