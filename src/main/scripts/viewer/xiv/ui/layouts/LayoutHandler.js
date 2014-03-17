/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.BgColorTransform');

// utils
goog.require('moka.dom');
goog.require('moka.array');
goog.require('moka.string');
goog.require('moka.style');
goog.require('moka.fx');
goog.require('moka.ui.Component');

// xiv
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.Conventional');
goog.require('xiv.ui.layouts.FourUp');




/**
 * xiv.ui.layouts.LayoutHandler is the class that handles the various 
 * xiv.ui.layout.Layout when viewing a dataset in the xiv.ui.ViewBox.  
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.layouts.LayoutHandler');
xiv.ui.layouts.LayoutHandler = function() {
    goog.base(this);

    this.addLayout(new xiv.ui.layouts.FourUp());
    //this.addLayout(new xiv.ui.layouts.Conventional());

}
goog.inherits(xiv.ui.layouts.LayoutHandler, moka.ui.Component);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler', xiv.ui.layouts.LayoutHandler);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutHandler.EventType = {
    LAYOUT_CHANGED: goog.events.getUniqueId('layout_changed'),
    LAYOUT_CHANGING: goog.events.getUniqueId('layout_changing'),
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.LayoutHandler.ID_PREFIX =  'xiv.ui.layouts.LayoutHandler';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutHandler.CSS_SUFFIX = {}



/**
* @private
* @type {Object.<string, xiv.ui.layouts.Layout>}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.Layouts_;  



/**
* @private
* @type {xiv.ui.layout.Layout}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.currLayout_;



/**
* @private
* @type {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange_ = true;




/**
* @public
* @param {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange = function(bool){
    this.animateLayoutChange_ = bool;
};




/**
* @public
* @return {Object.<string, xiv.ui.layouts.Layout>}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.getLayouts = function(){
    return this.Layouts_;
};




/**
* @type {xiv.ui.layouts.Layout}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayout = function(){
    return this.currLayout_;
};




/**
 * @param {!xiv.ui.layouts.Layout} layout
 */ 
xiv.ui.layouts.LayoutHandler.prototype.addLayout = function(layout) {
    this.Layouts_ = this.Layouts_ ? this.Layouts_ : {}
    this.Layouts_[layout.getTitle()] = layout;
    window.console.log("ADD LAYOUT", this.Layouts_);

    goog.dom.append(this.getElement(), layout.getElement())
}



/**
 * @param {!string} layoutTitle
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayout = function(layoutTitle) {

}




/**
 * Callback for when a plane is double-clicked.
 *
 * @param {function}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onPlaneDoubleClicked = 
function(callback){
    this.planeDoubleClickedCallback_.push(callback)
};



/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChanged_ = 
function() {

}



/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChanging_ = 
function() {

}



/**
 * Sets the double-click EVENT for the ViewPlanes
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.setPlanesDoubleClicked_ = 
function(callback){
 
}




/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutHandler.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    goog.object.forEach(this.Layouts_, function(layout){
	layout.updateStyle();
    })
}
