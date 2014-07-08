/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// gxnat
goog.require('gxnat.slicerNode.Node');
goog.require('gxnat.vis.VisNode');
goog.require('gxnat.vis.RenderProperties');




/**
 * A Renderable is a VisNode that has render properties associated with it.
 *
 * @extends {gxnat.vis.VisNode}
 */
goog.provide('gxnat.vis.Renderable');
gxnat.vis.Renderable = function(opt_displayProperties) {
    goog.base(this);
    
    /**
     * @private
     * @type {?gxnat.vis.RenderProperties}
     */
    this.RenderProperties_ = opt_displayProperties || null;
}
goog.inherits(gxnat.vis.Renderable, gxnat.vis.VisNode);
goog.exportSymbol('gxnat.vis.Renderable', gxnat.vis.Renderable);





/**
 * @param {!gxnat.vis.RenderProperties | !gxnat.slicerNode.Node} props
 */
gxnat.vis.Renderable.prototype.setRenderProperties = function(props) {
    this.RenderProperties_ = props instanceof gxnat.vis.RenderProperties ? 
	props : new gxnat.vis.RenderProperties(props);
}



/**
 * @return {?gxnat.vis.RenderProperties}
 */
gxnat.vis.Renderable.prototype.getRenderProperties = function() {
    return this.RenderProperties_;
}



/** 
 * @inheritDoc
 */
gxnat.vis.Renderable.prototype.dispose = function() {
    goog.base(this, 'dispose');

    if (this.RenderProperties_){
	this.RenderProperties_.dispose();
	delete this.RenderProperties_;
    }
}



goog.exportSymbol('gxnat.vis.Renderable.prototype.setRenderProperties',
	gxnat.vis.Renderable.prototype.setRenderProperties);
goog.exportSymbol('gxnat.vis.Renderable.prototype.getRenderProperties',
	gxnat.vis.Renderable.prototype.getRenderProperties);
goog.exportSymbol('gxnat.vis.Renderable.prototype.dispose',
	gxnat.vis.Renderable.prototype.dispose);
