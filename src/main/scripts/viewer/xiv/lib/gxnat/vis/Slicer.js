/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');

// moka
goog.require('moka.string');
goog.require('gxnat');
goog.require('gxnat.slicer');
goog.require('gxnat.vis.AjaxViewable');
goog.require('gxnat.vis.Viewable');



/**
 * Subclass of the 'Viewable' class pertaining to Slicer .mrb files.
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {Function=} opt_initComplete The callback when the init process is 
 *     complete.
 * @constructor
 * @extends {gxnat.vis.AjaxViewable}
 */
goog.provide('gxnat.vis.Slicer');
gxnat.vis.Slicer = function(experimentUrl, viewableJson, 
				      opt_initComplete) {

    this.setCategory('Slicer Scenes');


    //
    // Call parent for generating the base properties
    //
    goog.base(this, experimentUrl, viewableJson, function() { 
	//
	// Then get the scene view nodes
	//
	gxnat.slicer.getSceneProperties(this['files'], this.queryUrl,
	function(sceneViewNodes, mrmlNodes){

	    this['subViewables'] = [];
	    this.mrml = mrmlNodes;
	    this.sceneViews = sceneViewNodes;

	    goog.array.forEach(this.sceneViews, function(sceneView){

		var subViewables = [];
		var subViewableProperties = {};
		var subViewableFiles = [];

		var viewTypes = [sceneView.volumes || [], 
				 sceneView.meshes  || [], 
				 sceneView.fibers  || []];

		goog.array.forEach(viewTypes, function(viewType){
		    //
		    // First we have to clean up all of the file URLs.
		    //
		    goog.array.forEach(viewType, function(displayable){
			
			//
			// Clean the file URLS so we can query them.
			//
			var fileName = 
			    gxnat.slicer.getFileUrlRelativeToMrbUrl(
				displayable.file, this.queryUrl);
			
			//
			// Merge the properties into one set.
			//
			subViewableProperties = 
			    goog.object.clone(displayable.
					      properties.general[0]);
			goog.object.extend(subViewableProperties,
					   goog.object.clone(
					       displayable.properties.specific))

			//
			// For label maps...
			//
			if (subViewableProperties.labelMap){
			    
			    subViewableProperties.labelMap.file = 
			    gxnat.slicer.getFileUrlRelativeToMrbUrl(
				subViewableProperties.labelMap.file, 
				this.queryUrl);


			    subViewableProperties.colorTableFile
				= 
			    gxnat.slicer.getFileUrlRelativeToMrbUrl(
				subViewableProperties.labelMap.
				    colorTableFile, this.queryUrl);
			}


			//subViewableFiles.push(fileName);
			subViewables.push(new gxnat.vis.Viewable(
			    fileName, subViewableProperties))

		    }.bind(this))
		    this['subViewables'].push(subViewables);
		    //subViewables.push(new gxnat.vis.Viewable(
		    //subViewableFiles, subViewableProperties))
		    
		}.bind(this))
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
	}.bind(this))
    }.bind(this))
}
goog.inherits(gxnat.vis.Slicer, gxnat.vis.AjaxViewable);
goog.exportSymbol('gxnat.vis.Slicer', gxnat.vis.Slicer);



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
 * @inheritDoc
 */
gxnat.vis.Slicer.prototype.getThumbnailImage = function(opt_callback){

    var ext = /** @type {!string} */ '';
    var i = /** @type {!number} */ 0;
    var len = /** @type {!number} */ this['files'].length;
    var thumbFound = /** @type {!boolean} */ false;

    this['thumbnailFiles'] = [];

    //
    // Get all files that match the image extension.
    //
    for (; i < len; i++) {
	ext = moka.string.getFileExtension(this['files'][i]);
	if (gxnat.vis.Slicer.thumbnailExtensions.indexOf(ext) != -1) {
	    this['thumbnailFiles'].push(this['files'][i]);
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





