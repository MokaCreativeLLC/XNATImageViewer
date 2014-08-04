/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('gxnat.vis.RenderProperties');

// goog
goog.require('goog.object');
goog.require('goog.Disposable');

// gxnat
goog.require('gxnat.slicerNode.Node');
goog.require('gxnat.slicerNode.SceneView');
goog.require('gxnat.slicerNode.Volume');
goog.require('gxnat.slicerNode.Mesh');



/**
 * @struct
 * @param {!gxnat.slicerNode.Node}
 * @extends {goog.Disposable}
 * @constructor
 */
gxnat.vis.RenderProperties = function(slicerNode){
    goog.base(this);
    
    //window.console.log("\n\n\nRENDER PROPERTIES!", slicerNode);

    //
    // Scene Views
    //
    if (slicerNode instanceof gxnat.slicerNode.SceneView){
	this.annotations = slicerNode.annotations;
	this.camera = slicerNode.camera;
	this.backgroundColor = slicerNode.backgroundColor;
	this.layout = slicerNode.layout;		
    }



    //
    // Volumes
    //
    else if (slicerNode instanceof gxnat.slicerNode.Volume){
	//window.console.log("VOLUME DISPLAY", slicerNode);
	this.origin = slicerNode.origin || [0,0,0];
	this.upperThreshold = slicerNode.upperThreshold || 10000;
	this.lowerThreshold = slicerNode.lowerThreshold || -10000;
	this.volumeRendering = slicerNode.volumeRendering || false;
	this.isSelectedVolume = slicerNode.isSelectedVolume || false;
	this.sliceToRAS = slicerNode.sliceToRAS || null;

	//window.console.log("SLICER VOL", this, slicerNode);
	if (slicerNode.labelMap){
	    this.labelMapFile = slicerNode['labelMapFile'];
	    this.labelMapColorTableFile = slicerNode['colorTableFile'];
	    //window.console.log('colortable', this, slicerNode);
	}
    }


    //
    // Meshes
    //
    else if (slicerNode instanceof gxnat.slicerNode.Mesh){
	this.color = slicerNode.color || [.5,.5,.5];
	this.opacity = slicerNode.opacity || 1;
    }


    //
    // Annotations
    //
}
goog.inherits(gxnat.vis.RenderProperties, goog.Disposable)
goog.exportSymbol('gxnat.vis.RenderProperties', gxnat.vis.RenderProperties);




/**
* @inheritDoc
*/
gxnat.vis.RenderProperties.prototype.dispose = function() {
    goog.base(this, 'dispose');
    goog.object.clear(this);
}



goog.exportSymbol('gxnat.vis.RenderProperties.prototype.dispose',
	gxnat.vis.RenderProperties.prototype.dispose);
