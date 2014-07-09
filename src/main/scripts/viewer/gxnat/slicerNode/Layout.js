goog.provide('gxnat.slicerNode.Layout');


goog.require('gxnat.slicerNode.Node');

/**
 * @struct
 * @param {!number} layoutNum
 * @extends {gxnat.slicerNode.Node}
 * @constructor
 */
gxnat.slicerNode.Layout = function(layoutNum){
    goog.base(this);

    var layoutName = 'Conventional';
    switch(layoutNum){
    case '0': 
	layoutName = 'Four-Up';
	break;
    case '2': 
	layoutName = 'Conventional';
	break;
    }
    this.layoutName = layoutName
}
goog.inherits(gxnat.slicerNode.Layout, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.Layout', gxnat.slicerNode.Layout);
