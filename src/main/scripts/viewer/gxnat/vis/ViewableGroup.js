/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');

// gxnat
goog.require('gxnat.vis.Renderable');
goog.require('gxnat.vis.Viewable');

//-----------



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



/**
 * @param {!gxnat.vis.Viewable} Viewable
 * @public
 */
gxnat.vis.ViewableGroup.prototype.addViewable = function(Viewable) {
    return this.Viewables.push(Viewable);
}



/**
 * @return {!Array.<string>}
 * @public
 */
gxnat.vis.ViewableGroup.prototype.getAllViewableFiles = function() {
    var files = [];
    goog.array.forEach(this.Viewables, function(Viewable){
	files = goog.array.concat(files, Viewable.getFiles());
    })
    return files;
}



/**
 * @return {!Array.<gxnat.vis.Viewable>} 
 * @public
 */
gxnat.vis.ViewableGroup.prototype.getViewables = function() {
    return this.Viewables;
}



/** 
 * @inheritDoc
 */
gxnat.vis.ViewableGroup.prototype.dispose = function() {
    goog.base(this, 'dispose');
    // Viewables
    goog.array.forEach(this.Viewables, function(Viewable){
	if (goog.isArray(Viewable)){
	    goog.array.forEach(Viewable, function(_v){
		_v.dispose();
	    })
	} else if (Viewable instanceof gxnat.vis.Viewable) {
	    Viewable.dispose();
	}
    })
    delete this.Viewables;
}




goog.exportSymbol('gxnat.vis.ViewableGroup.prototype.addViewable',
	gxnat.vis.ViewableGroup.prototype.addViewable);
goog.exportSymbol('gxnat.vis.ViewableGroup.prototype.getAllViewableFiles',
	gxnat.vis.ViewableGroup.prototype.getAllViewableFiles);
goog.exportSymbol('gxnat.vis.ViewableGroup.prototype.getViewables',
	gxnat.vis.ViewableGroup.prototype.getViewables);
goog.exportSymbol('gxnat.vis.ViewableGroup.prototype.dispose',
	gxnat.vis.ViewableGroup.prototype.dispose);
