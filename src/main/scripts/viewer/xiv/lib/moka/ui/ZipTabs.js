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
    goog.dom.classes.add(this.getElement(), 
	    goog.getCssName(moka.ui.ZipTabs.ELEMENT_CLASS, 
			    this.orientation.toLowerCase()));

    /**
     * @type {!moka.ui.Resizable}
     * @private
     */
    this.Resizable_ = new moka.ui.Resizable(this.getElement(), 
					    this.orientation); 
    
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
 * @public
 */
moka.ui.ZipTabs.prototype.setBoundaryElement = function(elt) {
    this.Resizable_.setBoundaryElement(elt);
    this.updateStyle();
}



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

	    //
	    // IMPORTANT!!!
	    //
	    this.calcDims();

	    //
	    // Do nothing if there's no tabSize
	    //
	    if (!goog.isDefAndNotNull(this.tabSize)) { return };

	    //
	    // Resize by orientation
	    //
	    switch (this.orientation) {
	    case 'BOTTOM':
	    case 'TOP': 
		this.onResizeVert_();
		break;
	    case 'LEFT': 
	    case 'RIGHT':
		this.onResizeHoriz_();
		break;
	    }

	    //
	    // Dispatch event
	    //
	    this.dispatchEvent({
		type: moka.ui.Resizable.EventType.RESIZE,
		size: e.size,
		pos: e.pos
	    });
	}.bind(this));
}



/**
 * @private
 */
moka.ui.ZipTabs.prototype.onResizeVert_ = function() {
    if (Math.abs(this.tabSize.height - this.currSize.height) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_VERT){
	this.deactivateAll();
    } else {
	this.setActive(this.getLastActiveTab());
    }
}




/**
 * @private
 */
moka.ui.ZipTabs.prototype.onResizeHoriz_ = function() {
    if (Math.abs(this.tabSize.width - this.currSize.width) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ){
	this.deactivateAll();
    } 
    else {
	this.setActive(this.getLastActiveTab());
    }
}



/**
 * @param {!Event} event The click event.
 * @param {number=} opt_dur The optional duration of the slide animation.
 * @public
 */
moka.ui.ZipTabs.prototype.setExpanded = function(expanded, opt_index, opt_dur) {
    this.updateStyle();
    if (expanded) {
	this.setActive(opt_index || 0);
	window.console.log("\n\n\n\nSET EXPANDED!!!!", this.getElement())
	this.Resizable_.slideToLimits(this.orientation, 'MAX', null, opt_dur);
    } else {
	this.deactivateAll();
	this.Resizable_.slideToLimits(this.orientation, 'MIN', null, opt_dur);
    }
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @param {!Event} event The click event.
 * @param {number=} opt_dur The optional duration of the slide animation.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_ = function(event, opt_dur) {
    // 
    // Do nothing if there are no tabs
    //
    if (!goog.isDefAndNotNull(this.tabSize)) { return };

    this.updateStyle();
    this.calcDims();
    switch (this.orientation) {
    case 'BOTTOM':
	this.onTabClickedBottom_(event, opt_dur);
	break;

    case 'TOP':
	this.onTabClickedTop_(event, opt_dur);
	break;

    case 'LEFT':
	// to do
	break;

    case 'RIGHT':
	this.onTabClickedRight_(event, opt_dur);
	break;
    }
}



/**
 * @param {!Event} event The click event.
 * @param {number=} opt_dur The optional duration of the slide animation.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClickedTop_ = function(event, opt_dur) {
    window.console.log(this.currSize.height , this.tabSize.height,  
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ);
    if (Math.abs(this.currSize.height - this.tabSize.height) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ) {
	window.console.log("SLIDE MAX");
	this.setActive(this.lastActiveTab_);
	this.Resizable_.slideToLimits('TOP', 'MAX', opt_dur);

    } else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	window.console.log("SLIDE MIN");
	this.Resizable_.slideToLimits('TOP', 'MIN', opt_dur);
    }
}



/**
 * @param {!Event} event The click event.
 * @param {number=} opt_dur The optional duration of the slide animation.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClickedBottom_ = function(event, opt_dur) {
    if (Math.abs(this.currSize.height - this.tabSize.height) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ) {
	this.setActive(this.lastActiveTab_);
	this.Resizable_.slideToLimits('BOTTOM', 'MAX', opt_dur);

    } else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	this.Resizable_.slideToLimits('BOTTOM', 'MIN', opt_dur);
    }
}




/**
 * @param {!Event} event The click event.
 * @param {number=} opt_dur The optional duration of the slide animation.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClickedRight_ = function(event, opt_dur) {

    if (!goog.isDefAndNotNull(this.tabSize)) { return };

    if (Math.abs(this.currSize.width - this.tabSize.width) <= 
	moka.ui.ZipTabs.BOUND_THRESHOLD_HORIZ) {
	this.setActive(this.lastActiveTab_);
	this.Resizable_.slideToLimits('RIGHT', 'MAX', opt_dur);

    } else if (this.getLastActiveTab() == this.getPreviousActiveTab()) {
	this.Resizable_.slideToLimits('RIGHT', 'MIN', opt_dur);
    }
}




/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    window.console.log('ZIPTAB UPDATE STYLE', this.orientation);
    //
    // Call superclass
    //
    goog.base(this, 'updateStyle');

    //
    // Update the resizable
    //
    this.Resizable_.update();

    //
    // orientation-specific updates
    //
    switch (this.orientation) {
    case 'TOP':
    case 'BOTTOM':

	window.console.log("\n\n\n\n\n\n\n UPDATE MIN", this.tabSize);
	if (goog.isDefAndNotNull(this.tabSize)){
	    this.Resizable_.setMinHeight(this.tabSize.height);
	}
	break;

    case 'LEFT':
    case 'RIGHT':
	if (goog.isDefAndNotNull(this.tabSize)){
	    this.Resizable_.setMinWidth(this.tabSize.width);
	}	
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

    goog.events.removeAll(this.Resizable_);
    this.Resizable_.disposeInternal(); 
    delete this.Resizable_;
}
