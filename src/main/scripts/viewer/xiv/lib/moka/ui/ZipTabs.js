/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');

// moka
goog.require('moka.ui.Tabs');
goog.require('moka.ui.Resizable');



/**
 * ZipTabs are tabs that slide themselves in and out of a given container.
 * At minimized position, they only show the tabs and not the tab pages.
 * At maximized position, it shows both.
 * TODO: Implement the other orientatations (LEFT, RIGHT, TOP)
 *
 * @constructor
 * @param {string=} opt_orientation
 * @extends {moka.ui.Tabs}
 */
goog.provide('moka.ui.ZipTabs');
moka.ui.ZipTabs = function (opt_orientation) {
    goog.base(this);

    this.checkOrientation_(opt_orientation ||
			   moka.ui.ZipTabs.DEFAULT_ORIENTATION);
    this.setClassesByOrientation_();

    /**
     * @type {!moka.ui.Resizable}
     * @private
     */
    this.Resizable_ = new moka.ui.Resizable(this.getElement(), 
			     moka.ui.ZipTabs.RESIZE_DIR[this.orientation_]);    
    this.setDefaultResizeEvents_();

    // required!
    this.updateStyle();
}
goog.inherits(moka.ui.ZipTabs, moka.ui.Tabs);
goog.exportSymbol('moka.ui.ZipTabs', moka.ui.ZipTabs)



/**
 * @type {Array.string}
 * @const
 */
moka.ui.ZipTabs.ORIENTATIONS = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.DEFAULT_ORIENTATION = moka.ui.ZipTabs.ORIENTATIONS[1];



/**
 * @type {Array.string}
 * @const
 */
moka.ui.ZipTabs.RESIZE_DIR = {
    'TOP': 'BOTTOM', 
    'BOTTOM': 'TOP', 
    'LEFT': 'RIGHT', 
    'RIGHT': 'LEFT',
};



/**
 * @type {!number}
 * @const
 */
moka.ui.ZipTabs.BOUND_THRESHOLD = 4;



/**
 * Event types.
 * @enum {string}
 * @public
 */
moka.ui.ZipTabs.EventType = {
  CLICKED: goog.events.getUniqueId('viewboxtab_clicked'),
}



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.ID_PREFIX =  'moka.ui.ZipTabs';



/**
 * @param {string}
 * @private
 */
moka.ui.ZipTabs.prototype.orientation_;



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.checkOrientation_ = function(orient){
    if (!goog.isString(orient)){
	throw new TypeError('String required!')
    }
    orient = orient.toUpperCase();
    if (moka.ui.ZipTabs.ORIENTATIONS.indexOf(orient) == -1){
	throw new Error('Invalid orienation!');
    }
    this.orientation_ = orient;
}



/**
 * @return {!moka.ui.Resizable} The resizable object.
 * @public
 */
moka.ui.ZipTabs.prototype.getResizable = function(){
    return this.Resizable_;
}



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.setDefaultResizeEvents_ = function(){

   goog.events.listen(this.getResizable(), moka.ui.Resizable.EventType.RESIZE,
	function(e) {

	    var size = /**@type {!goog.math.Size}*/ 
	    goog.style.getSize(this.getElement());
	    var pos = /**@type {!goog.math.Coordinate}*/ 
	    goog.style.getPosition(this.getElement());


	    switch (this.orientation_) {
	    case 'BOTTOM':
		if (Math.abs(this.getTabHeight() - size.height) <= 
		    moka.ui.ZipTabs.BOUND_THRESHOLD){
		    window.console.log("NEAR BOUNDS!");
		    this.deactivateAll();
		} else {
		    window.console.log("NOT! NEAR BOUNDS!");
		    this.setActive(this.getLastActiveTab());
		}
		break;

	    case 'TOP': // to do
		break;
	    case 'LEFT': // to do
		break;
	    case 'RIGHT': // to do
		break;
	    }
	}.bind(this));
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @param {!number} clickInd The clicked tab index.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_ = function(event) {

    var size = /**@type {!goog.math.Size}*/ 
    goog.style.getSize(this.getElement());
    var pos = /**@type {!goog.math.Coordinate}*/ 
    goog.style.getPosition(this.getElement());

    switch (this.orientation_) {
    case 'BOTTOM':
	this.onTabClicked_bottom_(size, pos);
	break;

    case 'TOP':
	// to do
	break;

    case 'LEFT':
	// to do
	break;

    case 'RIGHT':
	// to do
	break;
    }
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_bottom_ = function(size, pos) {
    if (Math.abs(size.height - this.getTabHeight()) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD) {
	this.Resizable_.slideDragger('TOP', new goog.math.Coordinate(0, 
					this.Resizable_.getTopLimit()));
    }
    else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	this.Resizable_.slideDragger('TOP', new goog.math.Coordinate(0, 
		this.Resizable_.getBottomLimit() - this.getTabHeight()),
				      this.deactivateAll.bind(this));
    }
}




moka.ui.ZipTabs.prototype.setClassesByOrientation_ = function() {
    goog.dom.classes.add(this.getElement(), moka.ui.ZipTabs.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
		goog.getCssName(moka.ui.ZipTabs.CSS_CLASS_PREFIX, 
			       this.orientation_.toLowerCase()));


    // In-line calculations
    switch (this.orientation_) {

    case 'BOTTOM':
	moka.style.setStyle(this.getElement(), {
	    'height': this.getTabHeight()
	})
	this.getElement().style.top = 'calc(100% - ' + this.getTabHeight() +
	    'px)';
	break;
    case 'TOP':
	// to do

    case 'LEFT':
	// to do

    case 'RIGHT':
	// to do
    }
}



/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    
    switch (this.orientation_) {
    case 'TOP':
    case 'BOTTOM':
	//moka.style.setStyle(this.getElement(), {'width': '100%'});
	this.getResizable().setMinHeight(this.getTabHeight());
	break;

    case 'LEFT':
    case 'RIGHT':
	// TO DO:
	//this.getElement().style.height = '100%';
	//this.getResizable().setMinHeight(this.getTabWidth());
	break;
    }    
}



/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.addTab = function(tabTitle) {
    // Parent class
    goog.base(this, 'addTab', tabTitle);

    // More click listeners
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {
	    this.onTabClicked_(event);
	}.bind(this))
    }.bind(this))

    // Deactivate
    this.deactivateAll();
}
