/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// gxnat
goog.require('gxnat.vis.RenderProperties');


/**
 * @constructor
 */
goog.provide('gxnat.vis');
gxnat.vis = {};
goog.exportSymbol('gxnat.vis', gxnat.vis);


/**
 * @param {gxnat.slicer.Node.Node}
 */
gxnat.vis.convertToRenderProperties = function(slicerNode){
    window.console.log("CONVERT TO RENDER PROPERTIES. NEED TO WORK ON THIS!");
    if (slicerNode instanceof gxnat.slicer.SceneViewNode){
	return new gxnat.vis.RenderProperties(slicerNode); 	
    }
}
