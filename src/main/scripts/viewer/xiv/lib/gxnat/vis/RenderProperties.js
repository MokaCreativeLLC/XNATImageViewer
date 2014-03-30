/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.Disposable');




/**
 * @dict
 * @param {!gxnat.slicer.Node}
 * @extends {goob.Disposable}
 */
goog.provide('gxnat.vis.RenderProperties');
gxnat.vis.RenderProperties = function(slicerNode){
    
    if (slicerNode instanceof gxnat.slicer.SceneViewNode){
	this['annotations'] = slicerNode.annotations;
	this['camera'] = slicerNode.camera;
	this['backgroundColor'] = slicerNode.backgroundColor;
	this['layout'] = slicerNode.layout;		
    }
}
goog.inherits(gxnat.vis.RenderProperties, goog.Disposable)
goog.exportSymbol('gxnat.vis.RenderProperties', gxnat.vis.RenderProperties);




/**
* @inheritDoc
*/
gxnat.vis.RenderProperties.prototype.dispose = function() {
    goog.base(this);

}
