/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.ui.TabPane');

/**
 * utils includes
 */
goog.require('utils.gui.ScrollableContainer');

/**
 * viewer-widget includes
 */
goog.require('XnatViewerWidget');
goog.require('XnatViewerGlobals');



/**
 * ViewBoxTabs are the tabs that occur at the bottom
 * of the ViewBox.  They are only visible when a viewable is in the ViewBox.
*  These tabs are multi-purpose and could be used for information, object togling, 
 * image adjusting, etc.
 * 
 * @constructor
 * @param {Object=, Object=}
 * @extends {XnatViewerWidget}
 */
goog.provide('ViewBoxTabs');
ViewBoxTabs = function (opt_args, opt_tabObj) {


    var that = this;
    XnatViewerWidget.call(this, utils.dom.mergeArgs(opt_args, {'id': 'Tabs'}));
    utils.dom.addCallbackManager(this);


    this.googTabPane_ = new goog.ui.TabPane(this._element);
    this.activateCallbacks_ = [];
    this.deactivateCallbacks_ = [];
}
goog.inherits(ViewBoxTabs, XnatViewerWidget);
goog.exportSymbol('ViewBoxTabs', ViewBoxTabs)




ViewBoxTabs.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewboxtabs');
ViewBoxTabs.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.CSS_CLASS_PREFIX, '');
ViewBoxTabs.TAB_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.CSS_CLASS_PREFIX, 'tab');
ViewBoxTabs.ACTIVE_TAB_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.TAB_CLASS, 'active');
ViewBoxTabs.HOVERED_TAB_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.TAB_CLASS, 'hovered');
ViewBoxTabs.TABPAGE_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.CSS_CLASS_PREFIX, 'tabpage');
ViewBoxTabs.SCROLLGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.TABPAGE_CLASS, 'scrollgallery');
ViewBoxTabs.ACTIVE_TABPAGE_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.TABPAGE_CLASS, 'active');
ViewBoxTabs.TABICON_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.CSS_CLASS_PREFIX, 'tabicon');
ViewBoxTabs.MOUSEOVER_TABICON_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBoxTabs.TABICON_CLASS, 'mouseover');




/**
 * @type {?goog.ui.TabPane}
 * @private
 */
ViewBoxTabs.prototype.googTabPane_ = null;




/**
 * @type {number}
 * @private
 */
ViewBoxTabs.prototype.lastActiveTab_ = 0;



	
/**
 * @type {number}
 * @private
 */
ViewBoxTabs.prototype.tabCount_ = 0;




/**
 * @type {?Array.function}
 * @private
 */
ViewBoxTabs.prototype.activateCallbacks_ = null;



    
/**
 * @type {?Array.function}
 * @private
 */
ViewBoxTabs.prototype.deactivateCallbacks_ = null;




/**
 * @type {number}
 */
ViewBoxTabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}




/**
 * @param {Object}
 */
ViewBoxTabs.prototype.setActivateCallbacks = function(callback) {
    this.activateCallbacks_.push(callback);		
}




/**
 * @param {Object}
 */
ViewBoxTabs.prototype.setDeactivateCallbacks = function(callback) {
    this.deactivateCallbacks_.push(callback);		
}




/**
 * Adds multiple tabs by calling on the internal
 * 'addTab' function.
 *
 * @param {Array.<string>}
 */
ViewBoxTabs.prototype.addTabs = function(tabTitles) {
    var that = this;
    goog.array.forEach(tabTitles, function(tabTitle){
	that.addTab(tabTitle);
    })
}




/**
 * Clears a tab of it contents and removes it.  Clears
 * all of no tabtitle provided in the argument.
 *
 * @param {string=}
 */
ViewBoxTabs.prototype.reset = function(opt_tabtitle) {


    //------------------
    // Remove all if no title specified.
    //------------------
    if (!opt_tabtitle){
	
	//
	// Remove from google object.
	//
	while (this.tabCount_ > 0) {
	    this.googTabPane_.removePage(this.tabCount_ - 1)
	    this.tabCount_--;
	}

	//
	// Remove tab from dom.
	//
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, this._element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})
	// Remove tab page from dom.
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABPAGE_CLASS, this._element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})

	//
	// Remove tab icon from dom.
	//
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABICON_CLASS, this._element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})
    }
}





/**
 * @private
 * @const
 * @type {Object.<string, string>}
 */
ViewBoxTabs.prototype.iconSrc_ = {
    'Info': XnatViewerGlobals.ICON_URL + 'Icons/InfoIcon.png',
    '3D Menu' : XnatViewerGlobals.ICON_URL + 'Icons/3DMenu.png',
    '2D Menu' : XnatViewerGlobals.ICON_URL + 'Icons/2DMenu.png'
}




/**
 * Adds a tab.  Utilises the tabObject_ object to create
 * tabs, their icons and pages.
 *
 * @type {function(Object)}
 */
ViewBoxTabs.prototype.addTab = function(tabTitle) {

    //------------------
    //  Tab		
    //------------------
    var tab = utils.dom.makeElement('div', this._element, 'Tab');
    goog.dom.classes.set(tab, ViewBoxTabs.TAB_CLASS);
    tab.title = tabTitle;

    

    //------------------
    //  Tab icon	
    //------------------	
    var tabIcon = utils.dom.makeElement('img', tab, 'TabIcon');
    goog.dom.classes.add(tabIcon, ViewBoxTabs.TABICON_CLASS);
    var iconSrc = this.iconSrc_[goog.string.removeAll(tabTitle)]
    tabIcon.src = iconSrc ? iconSrc : undefined;
    if (tabIcon.src.toString().indexOf('undefined') > -1 ){ tabIcon.innerHTML = tabTitle}


    
    //------------------
    //  Tab page
    //------------------	
    var tabPage = utils.dom.makeElement('div', this._element.parentNode, ViewBoxTabs.TABPAGE_CLASS);
    goog.dom.classes.set(tabPage, ViewBoxTabs.TABPAGE_CLASS);
    utils.style.setStyle(tabPage, utils.style.dims(this._element, 'width'))
    tabPage.label = tabTitle;
    this.googTabPane_.addPage(new goog.ui.TabPane.TabPage(tabPage));	



    //------------------
    // UI / UX event definition.
    //------------------
    this.updateStyle();
    this.clearEventListeners();
    this.setDefaultClickEvents();
    this.setDefaultHoverEvents();
    this.setActive(-1);

    this.tabCount_++;
}




/**
 * Search for a tab based on the the argument provided
 * returns either the tab element or unefined.
 *
 * @param {string | number} value: Tab name to search for or the tab position.
 * @return {Element | undefined}
 */
ViewBoxTabs.prototype.getTabPage = function (value) {
    var that = this;
    var retVal = undefined;
    

    //------------------
    // First check if the argument is a string. 
    // Then,look for tab labels.
    //------------------
    if (typeof value === 'string') {
	value = value.toLowerCase();
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABPAGE_CLASS, that._element), function(tabPage, i) { 			
	    if (tabPage.label.toLowerCase().indexOf(value) > -1 && !retVal) { retVal = tabPage; }
	})

 
    //------------------
    // Otherwise retreive that tab number.
    //------------------
    } else if (typeof value === 'number') {
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABPAGE_CLASS, that._element), function(tabPage, i) { 			
	    if (i === value) { retVal = tabPage;}
	})			
    }

    
    return retVal;
}







/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is activated, or clicked.
 *
 * @param {number} The tab number to activate.
 */
ViewBoxTabs.prototype.setActive = function (activeTabNum) {	
    var that = this;
    var tabFadeIn = 500;



    //------------------
    // Make sure the goog.TabPane select method is called.
    //------------------
    this.googTabPane_.setSelectedIndex(activeTabNum);



    //------------------
    // Cycle through each tab, hightlighting the tab 
    // associated with activeTabNum, not hightlting the others.
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, that._element), function(tab, i) { 
	if (i === activeTabNum) {
	    tab.setAttribute('isActive', true);
	    goog.dom.classes.add(tab, ViewBoxTabs.ACTIVE_TAB_CLASS);
	   // utils.fx.fadeInFromZero(tab, tabFadeIn);
	}
	else {

	    //
	    // Determine if current tab is the one to setActive or not
	    //
	    tab.setAttribute('isActive', false);
	    goog.dom.classes.remove(tab, ViewBoxTabs.ACTIVE_TAB_CLASS);
	    goog.dom.classes.set(tab, ViewBoxTabs.TAB_CLASS);
	}
    })



    //------------------
    // If there's an active tab, make the tab page border more prominent.
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABPAGE_CLASS, that._element), function(tabPage) {
	if (activeTabNum > -1){
	    goog.dom.classes.add(tabPage, ViewBoxTabs.ACTIVE_TABPAGE_CLASS);
	    //utils.fx.fadeInFromZero(tabPage, tabFadeIn);
	} else {
	    goog.dom.classes.set(tabPage, ViewBoxTabs.TABPAGE_CLASS);
	}	
    })
}




/**
 * Clears all event listening callbacks for tabs.
 *
 * @private
 */
ViewBoxTabs.prototype.clearEventListeners = function(){
    var that = this;
    goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, that._element), function(tab, i) { 
	goog.events.removeAll(tab);
    })
}



/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 *
 * @private
 */
ViewBoxTabs.prototype.setDefaultClickEvents = function() {
    var that = this;



    //------------------
    // Cycle through each tab...
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, this._element), function(tab, i) { 

	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {

	    //
	    // When a tab is clicked and it moves up
	    // in the viewer (activation)
	    //
	    if (tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false') {
		that.setActive(i);
		that.lastActiveTab_ = i;
		goog.array.forEach(that.activateCallbacks_, function(callback){ callback();})


	    //
	    // When a tab is clicked and it moves to
	    // the bottom of the viewer (deactivation)
	    //
	    } else {
		//
		// Run deactiveate callbacks.
		//
		goog.array.forEach(that.deactivateCallbacks_, function(callback){ callback();})
		//
		// Deactivate all tabs.
		//
		that.setActive(-1);		
	    }
	})
    })	
}




/**
 * Sets the default hover events, such as highlighting, when
 * the mouse hover's over the tab.
 *
 * @private
 */
ViewBoxTabs.prototype.setDefaultHoverEvents = function() {
    var that = this;



    //------------------
    // Cycle through each tab...
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, that._element), function(tab, i) { 

	//
	// Set tab hover
	//	
	goog.events.listen(tab, goog.events.EventType.MOUSEOVER, function(event) { 
	    
	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.add(tab, ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // Set TabIcon style change (opacity) -- applies whether active or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(that.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.add(icon, ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    })
	})


	//
	// Tab mouseout
	//
	goog.events.listen(tab, goog.events.EventType.MOUSEOUT, function(event) { 

	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.remove(tab, ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // TabIcon style change (opacity) -- applies whether active or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(that.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.remove(icon, ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    })
	})

    })	
}





/**
 * Standard updateStyle function for ViewBoxTabs.
 *
 * @param {Object=}
 */
ViewBoxTabs.prototype.updateStyle = function (opt_args) {

    //------------------
    //  Google closure reclaims the element, so we need to reassert
    //  the class.
    //------------------
    goog.dom.classes.add(this._element, ViewBoxTabs.ELEMENT_CLASS);

    var that = this;
    if (opt_args) { utils.style.setStyle(this._element, opt_args); }


    //------------------
    // For calculating the tabPageHeight.  
    // Don't proceed if there are no tabs.
    //------------------
    if (goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, this._element).length > 0) {


	//
	// Set tabPage height.
	//
	var viewBoxHeight = utils.style.dims(that._element.parentNode, 'outerHeight');
	var tabHeight = utils.style.dims(goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS)[0] , 'outerHeight')
	var tabPageHeight =  (viewBoxHeight - utils.style.dims(that._element, 'top') - tabHeight - 3) || 0;
	goog.array.forEach(goog.dom.getElementsByClass(ViewBoxTabs.TABPAGE_CLASS, that._element), function(elt, i) {			
	    utils.style.setStyle(elt, {
		'height': tabPageHeight,
		'width': utils.style.dims(that._element.parentNode, 'width') - 2 // acommodates for border
	    });
	})


	//
	// Calculate Tab Width based on number of tabs.
	//
	var tabs = goog.dom.getElementsByClass(ViewBoxTabs.TAB_CLASS, this._element);
	var parentWidth = utils.convert.toInt(utils.style.getComputedStyle(that._element, 'width')); 
	var tabWidth = (parentWidth / tabs.length) - 2; // for borders
	goog.array.forEach(tabs, function(tab, i){
	    utils.style.setStyle(tab, {
		'width': tabWidth,
		'left': (i * (100 / tabs.length)).toString() + "%"
	    })
	})
    }
}



/**
 * Adds either an object or an element to the contents
 * of a tab page.  The contents is always a utils.gui.ScrollableContainer, which
 * can accept either Objects of Elements as part of its input method.
 *
 * @param {!string, !Object|!Element} 
 */
ViewBoxTabs.prototype.setTabContents = function (tabName, contents) {

    //------------------
    // Get the tab page based on the 'tabName' argument.
    //------------------
    var tabPage = this.getTabPage(tabName);

    /**
     * @type {?utils.gui.ScrollableContainer}
     */
    var scrollableContainer = undefined;



    //------------------
    // Add the tab page if it's not there.
    //------------------
    if (tabPage === undefined){
	this.addTab(tabName);
	tabPage = this.getTabPage(tabName);
    }



    //------------------
    // Make a scrollable container.
    //------------------
    scrollableContainer = new utils.gui.ScrollableContainer({ 'parent': tabPage });



    //------------------
    // Set the scrollable container class.
    //------------------
    goog.dom.classes.add(scrollableContainer._element, ViewBoxTabs.SCROLLGALLERY_CLASS);



    //------------------
    // Add contents to the scrollable container.
    //------------------
    scrollableContainer.addContents(contents);
}