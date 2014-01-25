/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.TabPane');
goog.require('goog.dom');

// utils
goog.require('utils.convert');
goog.require('utils.ui.ScrollableContainer');
goog.require('utils.dom');
goog.require('utils.fx');
goog.require('utils.style');

// xiv
goog.require('xiv.ViewBox');
goog.require('xiv.Widget');
goog.require('xiv');





/**
 * xiv.ViewBoxTabs are the tabs that occur at the bottom
 * of the xiv.ViewBox.  They are only visible when a viewable is in the xiv.ViewBox.
*  These tabs are multi-purpose and could be used for information, object togling, 
 * image adjusting, etc.
 * 
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.ViewBoxTabs');
xiv.ViewBoxTabs = function () {
    xiv.Widget.call(this, 'Tabs');

    /**
     * @type {!goog.ui.TabPane}
     * @private
     */
    this.googTabPane_ = new goog.ui.TabPane(this.element);
    this.activateCallbacks_ = [];
    this.deactivateCallbacks_ = [];
}
goog.inherits(xiv.ViewBoxTabs, xiv.Widget);
goog.exportSymbol('xiv.ViewBoxTabs', xiv.ViewBoxTabs)




/**
 * @type {number}
 * @private
 */
xiv.ViewBoxTabs.prototype.lastActiveTab_ = 0;



	
/**
 * @type {number}
 * @private
 */
xiv.ViewBoxTabs.prototype.tabCount_ = 0;




/**
 * @type {?Array.function}
 * @private
 */
xiv.ViewBoxTabs.prototype.activateCallbacks_ = null;



    
/**
 * @type {?Array.function}
 * @private
 */
xiv.ViewBoxTabs.prototype.deactivateCallbacks_ = null;



/**
 * @private
 * @const
 * @enum {string}
 */
xiv.ViewBoxTabs.iconSrc_ = {
    'Info':  'Icons/InfoIcon.png',
    '3D Menu' : 'Icons/3DMenu.png',
    '2D Menu' : 'Icons/2DMenu.png',
    'Slicer Views': 'Icons/SlicerViews.png',
}




/**
 * @type {number}
 */
xiv.ViewBoxTabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}




/**
 * @param {Object}
 */
xiv.ViewBoxTabs.prototype.setActivateCallbacks = function(callback) {
    this.activateCallbacks_.push(callback);		
}




/**
 * @param {Object}
 */
xiv.ViewBoxTabs.prototype.setDeactivateCallbacks = function(callback) {
    this.deactivateCallbacks_.push(callback);		
}




/**
 * Adds multiple tabs by calling on the internal
 * 'addTab' function.
 *
 * @param {Array.<string>}
 */
xiv.ViewBoxTabs.prototype.addTabs = function(tabTitles) {
    goog.array.forEach(tabTitles, function(tabTitle){
	this.addTab(tabTitle);
    }.bind(this))
}




/**
 * Clears a tab of it contents and removes it.  Clears
 * all of no tabtitle provided in the argument.
 *
 * @param {string=} opt_tabtitle
 * @public
 */
xiv.ViewBoxTabs.prototype.reset = function(opt_tabtitle) {

    console.log("RESET");
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
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})
	// Remove tab page from dom.
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})

	//
	// Remove tab icon from dom.
	//
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABICON_CLASS, this.element), function(tab, i) { 
	    goog.dom.removeNode(tab);
	    delete tab;
	})
    }
}





/**
 * Adds a tab.  Utilises the tabObject_ object to create
 * tabs, their icons and pages.
 *
 * @type {function(Object)}
 */
xiv.ViewBoxTabs.prototype.addTab = function(tabTitle) {

    //------------------
    //  Tab		
    //------------------
    var tab = goog.dom.createDom('div', {
	'id': 'Tab_' + goog.string.createUniqueString(),
	'class' : xiv.ViewBoxTabs.TAB_CLASS,
	'title': tabTitle
    });

    

    //------------------
    //  Tab icon	
    //------------------	
    var tabIcon = goog.dom.createDom('img', {
	'id' : 'TabIcon_' + goog.string.createUniqueString(),
	'class' : xiv.ViewBoxTabs.TABICON_CLASS,
	'src': xiv.ICON_URL + xiv.ViewBoxTabs.iconSrc_[goog.string.removeAll(tabTitle)]
    });
    if (tabIcon.src.toString().indexOf('undefined') > -1 ){ tabIcon.innerHTML = tabTitle}


    
    //------------------
    //  Tab page
    //------------------	
    var tabPage = goog.dom.createDom('div', {
	'id' : 'TabPage_' + goog.string.createUniqueString(),
	'class': xiv.ViewBoxTabs.TABPAGE_CLASS,
	'label': tabTitle
    });
    utils.style.setStyle(tabPage, utils.style.dims(this.element, 'width'))
    


    //
    // Appends
    //
    goog.append(this.element, tab);
    goog.append(tab, tabIcon);
    goog.append(this.element.parentNode, tabPage);



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
xiv.ViewBoxTabs.prototype.getTabPage = function (value) {
    
    var retVal = undefined;
    

    //------------------
    // First check if the argument is a string. 
    // Then,look for tab labels.
    //------------------
    if (typeof value === 'string') {
	value = value.toLowerCase();
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.element), function(tabPage, i) { 			
	    if (tabPage.label.toLowerCase().indexOf(value) > -1 && !retVal) { retVal = tabPage; }
	})

 
    //------------------
    // Otherwise retreive that tab number.
    //------------------
    } else if (typeof value === 'number') {
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.element), function(tabPage, i) { 			
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
xiv.ViewBoxTabs.prototype.setActive = function (activeTabNum) {	
    
    var tabFadeIn = 500;



    //------------------
    // Make sure the goog.ui.TabPane select method is called.
    //------------------
    this.googTabPane_.setSelectedIndex(activeTabNum);



    //------------------
    // Cycle through each tab, hightlighting the tab 
    // associated with activeTabNum, not hightlting the others.
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element), function(tab, i) { 
	if (i === activeTabNum) {
	    tab.setAttribute('isActive', true);
	    goog.dom.classes.add(tab, xiv.ViewBoxTabs.ACTIVE_TAB_CLASS);
	   // utils.fx.fadeInFromZero(tab, tabFadeIn);
	}
	else {

	    //
	    // Determine if current tab is the one to setActive or not
	    //
	    tab.setAttribute('isActive', false);
	    goog.dom.classes.remove(tab, xiv.ViewBoxTabs.ACTIVE_TAB_CLASS);
	    goog.dom.classes.set(tab, xiv.ViewBoxTabs.TAB_CLASS);
	}
    })



    //------------------
    // If there's an active tab, make the tab page border more prominent.
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.element), function(tabPage) {
	if (activeTabNum > -1){
	    goog.dom.classes.add(tabPage, xiv.ViewBoxTabs.ACTIVE_TABPAGE_CLASS);
	    //utils.fx.fadeInFromZero(tabPage, tabFadeIn);
	} else {
	    goog.dom.classes.set(tabPage, xiv.ViewBoxTabs.TABPAGE_CLASS);
	}	
    })
}




/**
 * Clears all event listening callbacks for tabs.
 *
 * @private
 */
xiv.ViewBoxTabs.prototype.clearEventListeners = function(){
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element), function(tab, i) { 
	goog.events.removeAll(tab);
    })
}



/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 *
 * @private
 */
xiv.ViewBoxTabs.prototype.setDefaultClickEvents = function() {
    

    //------------------
    // Cycle through each tab...
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element), function(tab, i) { 

	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {

	    //
	    // When a tab is clicked and it moves up
	    // in the viewer (activation)
	    //
	    if (tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false') {
		this.setActive(i);
		this.lastActiveTab_ = i;
		goog.array.forEach(this.activateCallbacks_, function(callback){ callback();})


	    //
	    // When a tab is clicked and it moves to
	    // the bottom of the viewer (deactivation)
	    //
	    } else {
		//
		// Run deactiveate callbacks.
		//
		goog.array.forEach(this.deactivateCallbacks_, function(callback){ callback();})
		//
		// Deactivate all tabs.
		//
		window.console.log("SET ACTIVE HERE");
		this.setActive(-1);		
	    }
	}.bind(this))
    }.bind(this))	
}




/**
 * Sets the default hover events, such as highlighting, when
 * the mouse hover's over the tab.
 *
 * @private
 */
xiv.ViewBoxTabs.prototype.setDefaultHoverEvents = function() {
    
    //------------------
    // Cycle through each tab...
    //------------------
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element), function(tab, i) { 

	//
	// Set tab hover
	//	
	goog.events.listen(tab, goog.events.EventType.MOUSEOVER, function(event) { 
	    
	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.add(tab, xiv.ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // Set TabIcon style change (opacity) -- applies whether active or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.add(icon, xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
	}.bind(this))


	//
	// Tab mouseout
	//
	goog.events.listen(tab, goog.events.EventType.MOUSEOUT, function(event) { 

	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.remove(tab, xiv.ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // TabIcon style change (opacity) -- applies whether active or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.remove(icon, xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
	}.bind(this))

    }.bind(this))	
}





/**
 * Standard updateStyle function for xiv.ViewBoxTabs.
 *
 * @param {Object=}
 */
xiv.ViewBoxTabs.prototype.updateStyle = function (opt_args) {

    //------------------
    //  Google closure reclaims the element, so we need to reassert
    //  the class.
    //------------------
    goog.dom.classes.add(this.element, xiv.ViewBoxTabs.ELEMENT_CLASS);

    
    if (opt_args) { utils.style.setStyle(this.element, opt_args); }


    //------------------
    // For calculating the tabPageHeight.  
    // Don't proceed if there are no tabs.
    //------------------
    if (goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element).length > 0) {


	//
	// Set tabPage height.
	//
	var viewBoxHeight = utils.style.dims(this.element.parentNode, 'outerHeight');
	var tabHeight = utils.style.dims(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS)[0] , 'outerHeight')
	var tabPageHeight =  (viewBoxHeight - utils.style.dims(this.element, 'top') - tabHeight - 3) || 0;
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.element), function(elt, i) {	
	    utils.style.setStyle(elt, {
		'height': tabPageHeight,
		'width': utils.style.dims(this.element.parentNode, 'width') - 2 // acommodates for border
	    });
	}.bind(this))


	//
	// Calculate Tab Width based on number of tabs.
	//
	var tabs = goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.element);
	var parentWidth = utils.convert.toInt(utils.style.getComputedStyle(this.element, 'width')); 
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
 * of a tab page.  The contents is always a utils.ui.ScrollableContainer, which
 * can accept either Objects of Elements as part of its input method.
 *
 * @param {!string} tabName The name of the tab.
 * @param {!Object|!Element|!utils.ui.ScrollableContainer} contents The contents.
 */
xiv.ViewBoxTabs.prototype.setTabContents = function (tabName, contents) {
  
    var tabPage = this.getTabPage(tabName);
    var scrollableContainer = undefined;



    //------------------
    // Add the tab page if it's not there.
    //------------------
    if (tabPage === undefined){
	this.addTab(tabName);
	tabPage = this.getTabPage(tabName);
    }

    

    //------------------
    // Make or use existing scrollable container...
    //------------------
    if (contents instanceof utils.ui.ScrollableContainer) {
	//console.log("ITS A SCROLLABLE CONTAINER");
	scrollableContainer = contents;
	tabPage.appendChild(scrollableContainer.getElement());
    }
    else {
	scrollableContainer = new utils.ui.ScrollableContainer()
	tabPage.appendChild(scrollableContainer.getElement());
	window.console.log("CONTENTS", contents);
	scrollableContainer.addContents(contents);
	//window.console.log(scrollableContainer.getContentsDict());
	scrollableContainer.setZippysExpanded(false);
    }



    //------------------
    // Set the scrollable container class.
    //------------------
    goog.dom.classes.add(scrollableContainer.getElement(), xiv.ViewBoxTabs.SCROLLGALLERY_CLASS);
}




xiv.ViewBoxTabs.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewboxtabs');
xiv.ViewBoxTabs.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, '');
xiv.ViewBoxTabs.TAB_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tab');
xiv.ViewBoxTabs.ACTIVE_TAB_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.TAB_CLASS, 'active');
xiv.ViewBoxTabs.HOVERED_TAB_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.TAB_CLASS, 'hovered');
xiv.ViewBoxTabs.TABPAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabpage');
xiv.ViewBoxTabs.SCROLLGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.TABPAGE_CLASS, 'scrollgallery');
xiv.ViewBoxTabs.ACTIVE_TABPAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.TABPAGE_CLASS, 'active');
xiv.ViewBoxTabs.TABICON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabicon');
xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBoxTabs.TABICON_CLASS, 'mouseover');
