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
 * @param {string=} opt_expandDirection
 * @extends {moka.ui.Tabs}
 */
goog.provide('moka.ui.ZipTabs');
moka.ui.ZipTabs = function (opt_expandDirection) {
    goog.base(this);

    window.console.log("\n\nTODO: This will need another iteration with " + 
		       "moka.ui.Tabs, especially related to orientation");

    this.checkExpandDirection_(opt_expandDirection ||
			   moka.ui.ZipTabs.DEFAULT_EXPAND_DIRECTION);
    this.setClassesByExpandDirection_();

    /**
     * @type {!moka.ui.Resizable}
     * @private
     */
    this.Resizable_ = new moka.ui.Resizable(this.getElement(), 
			    this.expandDirection_);    
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
moka.ui.ZipTabs.EXPAND_DIRECTIONS = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.DEFAULT_EXPAND_DIRECTION = moka.ui.ZipTabs.EXPAND_DIRECTIONS[0];



/**
 * @type {Array.string}
 * @const
 */
moka.ui.ZipTabs.RESIZE_DIR = {
    'TOP': 'TOP', 
    'BOTTOM': 'BOTTOM', 
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
moka.ui.ZipTabs.prototype.expandDirection_;



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.checkExpandDirection_ = function(orient){
    if (!goog.isString(orient)){
	throw new TypeError('String required!')
    }
    orient = orient.toUpperCase();
    if (moka.ui.ZipTabs.EXPAND_DIRECTIONS.indexOf(orient) == -1){
	throw new Error('Invalid orienation!');
    }
    this.expandDirection_ = orient;
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

   goog.events.listen(this.Resizable_, moka.ui.Resizable.EventType.RESIZE,
	function(e) {

	    var size = /**@type {!goog.math.Size}*/ 
	    goog.style.getSize(this.getElement());
	    var pos = /**@type {!goog.math.Coordinate}*/ 
	    goog.style.getPosition(this.getElement());


	    switch (this.expandDirection_) {
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

    switch (this.expandDirection_) {
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




moka.ui.ZipTabs.prototype.setClassesByExpandDirection_ = function() {
    goog.dom.classes.add(this.getElement(), moka.ui.ZipTabs.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
		goog.getCssName(moka.ui.ZipTabs.CSS_CLASS_PREFIX, 
			       this.expandDirection_.toLowerCase()));




    // In-line calculations
    switch (this.expandDirection_) {

    case 'BOTTOM':

    case 'TOP':
	moka.style.setStyle(this.getElement(), {
	    'height': this.getTabHeight()
	})
	this.getElement().style.top = 'calc(100% - ' + this.getTabHeight() +
	    'px)';
	break;
	break;

    case 'LEFT':
	break;

    case 'RIGHT':
	moka.style.setStyle(this.getElement(), {
	    'width': this.getTabWidth()
	})
	this.getElement().style.left = '0px';	// to do
    }
}



/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    

    // Necessary because google takes it over...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.dom.classes.add(tab, goog.getCssName(
	    moka.ui.ZipTabs.CSS_CLASS_PREFIX, 
				this.expandDirection_.toLowerCase()));
    }.bind(this))

    goog.array.forEach(this.getTabIcons(), function(tab, i) { 
	goog.dom.classes.add(tab, goog.getCssName(
	    moka.ui.ZipTabs.CSS_CLASS_PREFIX, 
				this.expandDirection_.toLowerCase() + '-icon'));
    }.bind(this))





    switch (this.expandDirection_) {
    case 'TOP':
    case 'BOTTOM':
	//moka.style.setStyle(this.getElement(), {'width': '100%'});
	this.getResizable().setMinHeight(this.getTabHeight());
	break;

    case 'LEFT':
    case 'RIGHT':
	this.updateStyle_left_();	
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
    this.updateStyle();
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.updateStyle_left_ = function() {
    var tabLeft = 'calc(100% - ' + this.getTabWidth() + 'px)';
    this.getResizable().setMinWidth(this.getTabWidth());

    goog.array.forEach(this.getTabPages(), function(page, i) { 
	page.style.left = '0%';
	page.style.height = '100%';
	page.style.top = '0px';
	page.style.width = tabLeft;
    }.bind(this))

    var tabH = 100/this.getTabCount();
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	moka.style.setStyle(tab, {
	    'width': this.getTabWidth(),
	    'top': (tabH * i).toString() + '%',
	    'height': tabH.toString() + '%'
	})
	tab.style.left = tabLeft;
    }.bind(this))

    goog.array.forEach(
	goog.dom.getElementsByClass(moka.ui.Tabs.CSS.TABICON, 
				    this.getElement()), function(icon, i) { 
					//icon.style.height = '100%';
					//icon.style.width = '100%';
				    }.bind(this))

}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    goog.events.removeAll(this.Resizable_);
    this.Resizable_.disposeInternal(); 

    delete this.Resizable_;
    delete this.expandDirection_;
}
