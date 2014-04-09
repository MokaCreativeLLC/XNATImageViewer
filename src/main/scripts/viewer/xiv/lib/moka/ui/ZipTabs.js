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
    this.setDefaultResizeEvents_();


    // required!
    this.updateStyle();
}
goog.inherits(moka.ui.ZipTabs, moka.ui.Tabs);
goog.exportSymbol('moka.ui.ZipTabs', moka.ui.ZipTabs)




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
	    
	    this.calcDims();

	    switch (this.orientation) {
	    case 'BOTTOM':
		if (Math.abs(this.getTabHeight() - this.currSize.height) <= 
		    moka.ui.ZipTabs.BOUND_THRESHOLD){
		    this.deactivateAll();
		} else {
		    this.setActive(this.getLastActiveTab());
		}
		break;
	    case 'TOP': // to do
		break;
	    case 'LEFT': // to do
		break;
	    case 'RIGHT': // to do
		if (Math.abs(this.getTabWidth() - this.currSize.width) <= 
		    moka.ui.ZipTabs.BOUND_THRESHOLD){
		    this.deactivateAll();
		} else {
		    this.setActive(this.getLastActiveTab());
		}
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
    this.calcDims();
    switch (this.orientation) {
    case 'BOTTOM':
	this.onTabClicked_bottom_();
	break;

    case 'TOP':
	// to do
	break;

    case 'LEFT':
	// to do
	break;

    case 'RIGHT':
	this.onTabClicked_right_();
	break;
    }
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_bottom_ = function() {
    if (Math.abs(this.currSize.height - this.getTabHeight()) <= 
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




/**
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_right_ = function() {
    if (Math.abs(this.currSize.width - this.getTabWidth()) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD) {
	this.Resizable_.slideDragger('RIGHT', new goog.math.Coordinate(0, 
					this.Resizable_.getRightLimit()));
    }
    else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	this.Resizable_.slideDragger('RIGHT', new goog.math.Coordinate(0, 
		this.Resizable_.getLeftLimit()), this.deactivateAll.bind(this))
    }
}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    
    switch (this.orientation) {
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
}
