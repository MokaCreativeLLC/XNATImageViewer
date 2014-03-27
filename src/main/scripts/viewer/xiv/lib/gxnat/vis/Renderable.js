/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */


// gxnat
goog.require('gxnat.vis.VisNode');


/**
 * @extends {gxnat.vis.VisNode}
 */
goog.provide('gxnat.vis.Renderable');
gxnat.vis.Renderable = function(opt_files, opt_displayProperties) {
    goog.base(this);
    
    /**
     * @private
     * @type {?gxnat.vis.RenderProperties}
     */
    this.renderProperties_ = null;
}
goog.inherits(gxnat.vis.Renderable, gxnat.vis.VisNode);
goog.exportSymbol('gxnat.vis.Renderable', gxnat.vis.Renderable);




gxnat.vis.VisNode.prototype.setRenderProperties = function(props) {
    this.renderProperties_ = props;
}




gxnat.vis.VisNode.prototype.getRenderProperties = function() {
    return this.renderProperties_;
}





/** 
 * @inheritDoc
 */
gxnat.vis.Renderable.prototype.dispose = function() {
    goog.base(this, 'dispose');

    if (this.renderProperties_){
	this.renderProperties_.dispose();
	delete this.renderProperties_;
    }
}
