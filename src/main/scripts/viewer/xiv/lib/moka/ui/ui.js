/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Parent class of moka.ui objects.
 * @constructor
 */
goog.provide('moka.ui');
moka.ui = function () {};
goog.exportSymbol('moka.ui', moka.ui);



/**
 * @param {!goog.fx.Animation || !Array.<goog.fx.Animation>} The animation 
 *     or animations to destroy.
 * @public
 */
moka.ui.disposeAnimations = function(anims) {
    if (!goog.isDefAndNotNull(anims)) { return } ;

    anims = !goog.isArray(anims) ? [anims] : anims;
    goog.array.forEach(anims, function(anim){
	goog.events.removeAll(anim);
	anim.destroy();
	anim.disposeInternal();
    })
}



/**
 * @param {!goog.fx.AnimationQueue} The animation queue to dispose of.
 * @public
 */
moka.ui.disposeAnimationQueue = function(animQueue) {
    if (!goog.isDefAndNotNull(animQueue)) { return } ;

    goog.events.removeAll(animQueue);
    animQueue.destroy();
    animQueue.disposeInternal();
}



/**
 * Disposes of a map whose key-valye pairs are strings to Elements.
 *
 * @param {!Object} An object with properties described above.
 * @public
 */
moka.ui.disposeElementMap = function(obj) {
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
moka.ui.disposeComponentMap = function(obj) {
    goog.object.forEach(obj, function(node, key){
	goog.events.removeAll(node);
	node.disposeInternal();
	delete obj[key];
    })
    goog.object.clear(obj);
}
