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
//goog.require('xiv.ui.Sagittal');
//goog.require('xiv.ui.Coronal');
//goog.require('xiv.ui.Transverse');




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

    /**
     * Layouts.
     * @dict
     * @const
     */
    this.constructor.LayoutTypes = {};
    this.constructor.LayoutTypes[xiv.ui.layouts.FourUp.TITLE] = 
	xiv.ui.layouts.FourUp;
    this.constructor.LayoutTypes[xiv.ui.layouts.Conventional.TITLE] = 
	xiv.ui.layouts.Conventional;


    /**
     * @private
     * @type {!Object.<string, xiv.ui.layouts.Layout>}
     */ 
    this.Layouts_ = {};


    /**
     * Stores the constructor classes of xiv.uiLayout.  
     * We have this because we don't want to create an instance of a Layout 
     * unless absolutely necessary -- (i.e. when the menu selection chooses 
     * a given layout).  In short, we create the layouts as they are selected,
     * not beforehand.
     *
     * @private
     * @type {!Object.<string, Object>}
     */ 
    this.LayoutObjects_ = {};


    /**
     * @private
     * @type {string}
     */ 
    this.currLayoutTitle_;


    /**
     * @private
     * @type {string}
     */ 
    this.prevLayoutTitle_;
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
    RESIZE: goog.events.getUniqueId('resize'),
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
 * @type {!number}
 * @const
 */
xiv.ui.layouts.LayoutHandler.ANIM_TIME = 800;



/**
* @public
* @param {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange = function(bool){
    this.animateLayoutChange_ = bool;
};



/**
* @return {xiv.ui.layouts.Layout}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayout = function(){
    return this.Layouts_[this.currLayoutTitle_];
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.Plane}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayoutPlane = 
function(planeTitle){
    return this.Layouts_[this.currLayoutTitle_].getPlaneByTitle(planeTitle);
};




/**
 * @param {!string} title The title to associate with the layout.
 * @param {!xiv.ui.layouts.Layout} layout
 */ 
xiv.ui.layouts.LayoutHandler.prototype.addLayout = function(title, layout) {
    if (goog.object.containsKey(this.LayoutObjects_)){
	throw new Error(title + ' is an already used layout title!');
    }
    if (!layout) { return };

    this.LayoutObjects_[title] = layout;
   
    window.console.log(layout,  xiv.ui.layouts.Layout.EventType.RESIZE);

}



/**
 * @param {!string} title
 * @param {boolean=} opt_animateSwich Whehter to animate the layout switch. 
 *     Defaults to true.
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayout = 
function(title, opt_animateSwitch) {
    // Asserts
    if (!goog.object.containsKey(this.LayoutObjects_, title)){
	throw new Error('Invalid layout: ' + title + '!');
    }

    // Create instance of layout object in Layouts_, if not stored.
    if (!goog.object.containsKey(this.Layouts_, title)) {
	this.Layouts_[title] = new this.LayoutObjects_[title];

	//
	// LISTEN to resize
	//
	goog.events.listen(this.Layouts_[title], 
			   xiv.ui.layouts.Layout.EventType.RESIZE, 
			   this.onLayoutResize_.bind(this))


	// Events
	this.setLayoutEvents_(this.Layouts_[title]);

	// Add to the main element.
	goog.dom.append(this.getElement(), 
			     this.Layouts_[title].getElement());
    }
    
    this.prevLayoutTitle_ = this.currLayoutTitle_;
    this.currLayoutTitle_ = title;
    this.switchLayout((opt_animateSwitch === false) ? 
			   0 : xiv.ui.layouts.LayoutHandler.ANIM_TIME);
}



/**
 * @type {Event}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutResize_ = function(e) {
    window.console.log("RESIZE", e, typeof e)
    window.console.log('grabbing resize event from layout in handler');
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.RESIZE
    })
    
}



/**
 * @param {number=}
 * @return {Object}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.getTransitionStyles_ = function(elt) {
    var size = /**@type {!goog.math.Size}*/ goog.style.getSize(elt);
    var pos = /**@type {!goog.math.Coordinate}*/  goog.style.getPosition(elt);
    return {	
	'left': pos.x,
	'top': pos.y,
	'width': size.width,
	'height': size.height,
	'opacity': parseInt(elt.style.opacity, 10),
	'background-color': elt.style.backgroundColor,
	'color': elt.style.color,
	'z-index': parseInt(elt.style.zIndex, 10)
    }
}



/**
 * @param {number=} opt_time The optional time to animate.  Defaults to
 *     xiv.ui.layouts.LayoutHandler.ANIM_TIME set value.
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.switchLayout = function(opt_time) {
    window.console.log("SWITCH LAYOUT", opt_time, this.prevLayoutTitle_);

    // Set opt_time
    opt_time = (goog.isNumber(opt_time) && (opt_time >= 0)) ? opt_time : 
	xiv.ui.layouts.LayoutHandler.ANIM_TIME;

    // Do nothing if we're the previous layout is the same as the current one.
    if (this.prevLayoutTitle_ == this.currLayoutTitle_){
	return;
    }

    // If no previous layout or opt_time is zero, simply cut to the chase.
    if (opt_time == 0 || !this.prevLayoutTitle_) { 
	this.showCurrentLayout();
	return;
    }

    this.runLayoutChangeAnim_(opt_time);
}


/**
 * @param {number=} duration The animation duration..  
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.runLayoutChangeAnim_ = 
function(duration) {

    var emptyStyleFilter = /**@type {!Function}*/ function(val, key) {
	return !isNaN(val) && val.length != 0;}

    var newPlanes = /**@type {!Object.<string, xiv.ui.layout.Plane>}*/
	this.Layouts_[this.currLayoutTitle_].getPlanes();

    var elts = /**@type {!Array.<Element>}*/ [];
    var asIsDims = /**@type {!Array.<Object.<string, number|string>>}*/ [];
    var toBeDims = /**@type {!Array.<Object.<string, number|string>>}*/ [];


    goog.object.forEach(this.Layouts_[this.prevLayoutTitle_].getPlanes(), 
	function(plane, key){

	    // Create transition elements, which are clones of the previous
	    // layout panels.
	    elts.push(plane.getElement().cloneNode(true));

	    // If the new layot has the same panels (idenfified by key)
	    // then we construct some animations.
	    if (goog.object.containsKey(newPlanes, key)) {

		// As-Is
		asIsDims.push(goog.object.filter(
		    xiv.ui.layouts.LayoutHandler.getTransitionStyles_(
			plane.getElement()), 
		    emptyStyleFilter));

		// To-Be
		toBeDims.push(goog.object.filter(
		    xiv.ui.layouts.LayoutHandler.getTransitionStyles_(
			newPlanes[key].getElement()), emptyStyleFilter));

	    // Otherwise we just fade the panels out...
	    } else {
		asIsDims.push({
		    'z-index' :  0
		});
		toBeDims.push({ 
		    'opacity' :  0
		});
	    }
	}.bind(this))

    // attach transition elements to handler
    goog.array.forEach(elts, function(elt){
	goog.dom.append(this.getElement().parentNode, elt);
    }.bind(this))

    // generate animation
    var anims = /**@type {!Array.<goog.fx.dom.Animation>}*/ [];
    goog.array.forEach(elts, function(elt, i){
	anims = goog.array.concat(anims, 
	  moka.fx.generateAnimations(elt, asIsDims[i], 
				     toBeDims[i], duration));
    })
    
    // run animation
    moka.fx.parallelAnimate(anims, 

	// BEGIN - hide all
	function(){
	    this.hideAllLayouts();
	}.bind(this),

	// ANIMATE - do nothing
	undefined,

	// END - dispose transition elements, show current
	function(){
	    goog.array.forEach(elts, function(elt){
		goog.dom.removeNode(elt);
		delete elt;
	    })
	    this.showCurrentLayout()
	}.bind(this))
}



/**
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.showCurrentLayout = function() {
    goog.object.forEach(this.Layouts_, function(layout, title){
	layout.getElement().style.visibility = 
	    (title == this.currLayoutTitle_) ? 'visible' : 'hidden';
	layout.updateStyle();
    }.bind(this))
}



/**
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.hideAllLayouts = function() {
    goog.object.forEach(this.Layouts_, function(layout, title){
	layout.getElement().style.visibility = 'hidden';
	layout.updateStyle();
    }.bind(this))
}




/**

 *
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayoutEvents_ = 
function(layout){
    goog.object.forEach(layout.getPlanes(), function(plane){
	goog.events.listen(plane.getElement(), goog.events.EventType.DBLCLICK, 
			   function(e){
			   window.console.log("PLANE CLICK!", e.currentTarget);
			   })

    })
};



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
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChanged_ = goog.nullFunction();



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




/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutHandler.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    moka.ui.disposeComponentMap(this.Layouts_);
    delete this.Layouts_;

    goog.object.clear(this.LayoutObjects_);
    delete this.LayoutObjects_;

    delete this.currLayoutTitle_;
    delete this.prevLayoutTitle_;
}
