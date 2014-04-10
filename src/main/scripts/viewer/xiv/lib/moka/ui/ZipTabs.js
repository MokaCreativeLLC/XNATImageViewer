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
    goog.base(this, opt_orientation);


    /**
     * @type {!moka.ui.Resizable}
     * @private
     */
    this.Resizable_ = new moka.ui.Resizable(this.getElement(), 
					    this.orientation); 
    this.Resizable_.setMinWidth(this.getTabWidth())
    this.setResizeEvents_();
}
goog.inherits(moka.ui.ZipTabs, moka.ui.Tabs);
goog.exportSymbol('moka.ui.ZipTabs', moka.ui.ZipTabs)



/**
 * @type {!number}
 * @const
 */
moka.ui.ZipTabs.BOUND_THRESHOLD_VERT = 4;



/**
 * @type {!number}
 * @const
 */
moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ = 4;



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
 * @return {!moka.ui.Resizable} The resizable object.
 * @public
 */
moka.ui.ZipTabs.prototype.getResizeHandles = function(){
    return this.Resizable_.getHandles();
}



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.setResizeEvents_ = function(){
   goog.events.listen(this.Resizable_, moka.ui.Resizable.EventType.RESIZE,
	function(e) {
	    //window.console.log("RESIZE!", this.getElement().style.width);

	    switch (this.orientation) {

	    case 'BOTTOM':
		this.onResizeTop_();
		break;

	    case 'TOP': // to do
		break;

	    case 'LEFT': // to do
		break;

	    case 'RIGHT': // to do
		this.onResizeRight_();
		break;
	    }

	    this.dispatchEvent({
		type: moka.ui.Resizable.EventType.RESIZE,
		size: e.size,
		pos: e.pos
	    });

	    window.console.log("Event dispatched from ZipTabs!", 
			       this.getElement().style.width);
	}.bind(this));
}



/**
 * @public
 */
moka.ui.ZipTabs.prototype.setBoundaryElement = function(elt) {
    this.Resizable_.setBoundaryElement(elt);
    this.updateStyle();
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.onResizeTop_ = function() {
    if (Math.abs(this.getTabHeight() - this.currSize.height) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_VERT){
	this.deactivateAll();
    } else {
	this.setActive(this.getLastActiveTab());
    }
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.onResizeRight_ = function() {

    //this.updateStyleRight_();
    this.calcDims();

    if (Math.abs(this.getTabWidth() - this.currSize.width) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ){
	this.deactivateAll();
    } else {
	this.setActive(this.getLastActiveTab());
    }
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @param {!Event} event The click event.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_ = function(event) {
    window.console.log(this.getElement().style.width);
    this.calcDims();
    switch (this.orientation) {
    case 'BOTTOM':
	this.onTabClickedBottom_(event);
	break;

    case 'TOP':
	// to do
	break;

    case 'LEFT':
	// to do
	break;

    case 'RIGHT':
	this.onTabClickedRight_(event);
	break;
    }
}



/**
 * @param {!Event} event The click event.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClickedBottom_ = function(event) {
    if (Math.abs(this.currSize.height - this.getTabHeight()) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_VERT) {

	this.Resizable_.slideDragger('TOP', new goog.math.Coordinate(
	    this.currPos.x, this.Resizable_.getTopLimit()));
    }
    else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {

	this.Resizable_.slideDragger('TOP', new goog.math.Coordinate(
	    this.currPos.x, 
		this.Resizable_.getBottomLimit() - this.getTabHeight()),
				      this.deactivateAll.bind(this));
    }
}




/**
 * @param {!Event} event The click event.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClickedRight_ = function(event) {

    this.updateStyle();
    window.console.log('TAB RIGHT', this.getElement().style.width);
    if (Math.abs(this.currSize.width - this.getTabWidth()) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ) {
	this.setActive(this.lastActiveTab_);
	this.Resizable_.slideDraggerToBounds('RIGHT', 'RIGHT');

    } else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	window.console.log("SLIDE BACK!");
	this.Resizable_.slideDraggerToBounds('RIGHT', 'LEFT');
    }
}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    window.console.log('UPDATE STYLE', this.getElement().style.width);
    
    goog.base(this, 'updateStyle');
    this.Resizable_.update();

    return;
    switch (this.orientation) {
    case 'TOP':
    case 'BOTTOM':
	//moka.style.setStyle(this.getElement(), {'width': '100%'});
	this.Resizable_.setMinHeight(this.getTabHeight());
	break;

    case 'LEFT':
    case 'RIGHT':
	this.updateStyleRight_();	
	break;
    }    
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.setResizable_ = function(tabTitle) {
    window.console.log('set resizable');
    // required!
    this.updateStyle();
}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.addTab = function(tabTitle) {
    // Parent class
    goog.base(this, 'addTab', tabTitle);


    // Set resizable only after the tab has been added.
    if (this.getTabElements().length == 1) {
	this.setResizable_();
    }

    // More click listeners
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.CLICK, function(event) {
	    window.console.log(this.getElement().style.width);
	    this.onTabClicked_(event);
	}.bind(this))
    }.bind(this))

    // Deactivate
    this.deactivateAll();
    this.updateStyle();
}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    goog.dom.remove(this.boundaryElt_);
    delete this.boundaryElt_;

    goog.events.removeAll(this.Resizable_);
    this.Resizable_.disposeInternal(); 
    delete this.Resizable_;
}
