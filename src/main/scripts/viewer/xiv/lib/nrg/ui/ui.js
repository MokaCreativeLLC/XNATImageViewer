/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Parent class of nrg.ui objects.
 * @constructor
 */
goog.provide('nrg.ui');
nrg.ui = function () {};
goog.exportSymbol('nrg.ui', nrg.ui);



/**
 * @param {!goog.fx.Animation || !Array.<goog.fx.Animation>} The animation 
 *     or animations to destroy.
 * @public
 */
nrg.ui.disposeAnimations = function(anims) {
    if (!goog.isDefAndNotNull(anims)) { return } ;

    anims = !goog.isArray(anims) ? [anims] : anims;
    goog.array.forEach(anims, function(anim){
	goog.events.removeAll(anim);
	anim.dispose();
    })
    goog.array.clear(anims);
}



/**
 * @param {!goog.fx.AnimationQueue} The animation queue to dispose of.
 * @public
 */
nrg.ui.disposeAnimationQueue = function(animQueue) {
    if (!goog.isDefAndNotNull(animQueue)) { return } ;
    goog.events.removeAll(animQueue);
    animQueue.dispose();
}



/**
 * Disposes of a map whose key-valye pairs are strings to Elements.
 *
 * @param {!Object} An object with properties described above.
 * @public
 */
nrg.ui.disposeElementMap = function(obj) {
    goog.object.forEach(obj, function(node, key){
	goog.events.removeAll(node);
	goog.dom.removeNode(node);
	delete obj[key];
    })
    goog.object.clear(obj);
}



/**
 * Disposes of a map whose key-valye pairs are strings to goog.ui.Components.
 *
 * @param {!Object} An object with string-defined properties whose values 
 *    inherit from goog.ui.Component.
 * @public
 */
nrg.ui.disposeComponentMap = function(obj) {
    goog.object.forEach(obj, function(node, key){
	goog.events.removeAll(node);
	node.dispose();
	delete obj[key];
    })
    goog.object.clear(obj);
}
