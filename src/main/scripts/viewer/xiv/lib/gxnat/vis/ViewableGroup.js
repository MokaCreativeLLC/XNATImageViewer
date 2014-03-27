/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog 
goog.require('goog.array');
goog.require('gxnat.vis.Renderable');

// gxnat


/**
 * @param {gxnat.vis.Viewable= | Array.<gxnat.vis.Viewable>=} opt_viewables   
 * @extends {gxnat.vis.Renderable}
 */
goog.provide('gxnat.vis.ViewableGroup');
gxnat.vis.ViewableGroup = function(opt_viewables) {
    goog.base(this);

    if (goog.isDefAndNotNull(opt_viewables)){
	if (!goog.isArray(opt_viewables)){
	    opt_viewables = [opt_viewables];
	}
    } else {
	opt_viewables = [];
    }


    /**
     * @type {!Array.<gxnat.vis.Viewable>}
     * @protected
     */
    this.Viewables = opt_viewables;
}
goog.inherits(gxnat.vis.ViewableGroup, gxnat.vis.Renderable);
goog.exportSymbol('gxnat.vis.ViewableGroup', gxnat.vis.ViewableGroup);




gxnat.vis.ViewableGroup.prototype.addViewable = function(Viewable) {
    return this.Viewables.push(Viewable);
}



gxnat.vis.ViewableGroup.prototype.getAllViewableFiles = function() {
    var files = [];

    goog.array.forEach(this.Viewables, function(Viewable){
	files = goog.array.concat(files, Viewable.getFiles());
    })

    return files;
}



gxnat.vis.ViewableGroup.prototype.getViewables = function() {
    return this.Viewables;
}


/** 
 * @inheritDoc
 */
gxnat.vis.ViewableGroup.prototype.dispose = function() {
    goog.base(this, 'dispose');
    goog.array.forEach(this.Viewables, function(Viewable){
	if (goog.isArray(Viewable)){
	    goog.array.forEach(Viewable, function(_v){
		_v.dispose();
	    })
	} else if (Viewable instanceof gxnat.vis.Viewable) {
	    Viewable.dispose();
	}
    })
}
