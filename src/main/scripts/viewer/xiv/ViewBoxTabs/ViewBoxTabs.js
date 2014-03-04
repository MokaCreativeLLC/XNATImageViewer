/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.TabPane');
goog.require('goog.ui.TabPane.TabPage');
goog.require('goog.dom');

// utils
goog.require('utils.convert');
goog.require('utils.ui.ScrollableContainer');
goog.require('utils.style');
goog.require('utils.events.EventManager');

// xiv
goog.require('xiv.Widget');



/**
 * xiv.ViewBoxTabs are the tabs that occur at the bottom
 * of the xiv.ViewBox.  They are only visible when a viewable is in the 
 * xiv.ViewBox. These tabs are multi-purpose and could be used for 
 * information, object togling, image adjusting, etc.
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.ViewBoxTabs');
xiv.ViewBoxTabs = function () {
    goog.base(this, 'Tabs');

    /**
     * @type {!goog.ui.TabPane}
     * @private
     */
    this.googTabPane_ = new goog.ui.TabPane(this.getElement());

    // events
    utils.events.EventManager.addEventManager(this, xiv.ViewBoxTabs.EventType);

}
goog.inherits(xiv.ViewBoxTabs, xiv.Widget);
goog.exportSymbol('xiv.ViewBoxTabs', xiv.ViewBoxTabs)



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ViewBoxTabs.EventType = {
  ACTIVATED: goog.events.getUniqueId('viewboxtab_activated'),
  DEACTIVATED: goog.events.getUniqueId('viewboxtab_deactivated'),
}


/**
 * @private
 * @const
 * @dict
 */
xiv.ViewBoxTabs.iconSrc_ = {
    'Info':  'Icons/InfoIcon.png',
    '3D Menu' : 'Icons/3DMenu.png',
    '2D Menu' : 'Icons/2DMenu.png',
    'Slicer Views': 'Icons/SlicerViews.png',
}


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.CSS_CLASS_PREFIX =
    goog.getCssName('xiv-viewboxtabs');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.ELEMENT_CLASS =
    goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, '');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.TAB_CLASS =
    goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tab');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.ACTIVE_TAB_CLASS =  
    goog.getCssName(xiv.ViewBoxTabs.TAB_CLASS, 'active');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.HOVERED_TAB_CLASS =  
    goog.getCssName(xiv.ViewBoxTabs.TAB_CLASS, 'hovered');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.TABPAGE_CLASS = 
    goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabpage');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.SCROLLGALLERY_CLASS = 
    goog.getCssName(xiv.ViewBoxTabs.TABPAGE_CLASS, 'scrollgallery');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.ACTIVE_TABPAGE_CLASS =
    goog.getCssName(xiv.ViewBoxTabs.TABPAGE_CLASS, 'active');


/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.TABICON_CLASS = 
    goog.getCssName(xiv.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabicon');

/**
 * @type {string} 
 * @const
 */
xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS = 
    goog.getCssName(xiv.ViewBoxTabs.TABICON_CLASS, 'mouseover');


/**
 * @type {!string}
 * @private
 */
xiv.ViewBoxTabs.prototype.iconRoot_ = '';


/**
 * @type {!number}
 * @private
 */
xiv.ViewBoxTabs.prototype.lastActiveTab_ = 0;


/**
 * @type {Object}
 * @private
 */
xiv.ViewBoxTabs.prototype.Tabs_;



/**
 * As stated.
 * @type {number}
 * @public
 */
xiv.ViewBoxTabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}


/**
 * Adds multiple tabs by calling on the internal 'addTab' function.
 * @param {Array.<string>} tabTitles The titles of the tabs to add.
 * @public
 */
xiv.ViewBoxTabs.prototype.addTabs = function(tabTitles) {
    goog.array.forEach(tabTitles, function(tabTitle){
	this.addTab(tabTitle);
    }.bind(this))
}


/**
 * Clears all of the tabs.
 * @public
 */
xiv.ViewBoxTabs.prototype.reset = function() {	
    var count = /**@type {!number}*/ goog.object.getCount(this.Tabs_);
    while (count > 0) {
	this.googTabPane_.removePage(count - 1)
	count--;
    }
    
    goog.object.forEach(this.Tabs_, function(tabObj, key){	
	goog.object.forEach(tabObj, function(tabObj2, key2){
	    delete tabObj2;
	}.bind(this))
    }.bind(this))
    this.Tabs_ = {};
}
   

/**
 * As stated..
 * @param {!string} tabTitle The title of the tab to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ViewBoxTabs.prototype.createTabElt_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id': 'Tab_' + goog.string.createUniqueString(),
	'class' : xiv.ViewBoxTabs.TAB_CLASS,
	'title': tabTitle
    });
}


/**
 * As stated..
 * @param {!string} tabTitle The title of the tab icon to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ViewBoxTabs.prototype.createTabIcon_ = function(tabTitle) {
    return goog.dom.createDom('img', {
	'id' : 'TabIcon_' + goog.string.createUniqueString(),
	'class' : xiv.ViewBoxTabs.TABICON_CLASS,
	'src': this.iconUrl_ + 
	    xiv.ViewBoxTabs.iconSrc_[goog.string.removeAll(tabTitle)]
    });
}


/**
 * As stated..
 * @param {!string} tabTitle The title of the tab page to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ViewBoxTabs.prototype.createTabPage_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id' : 'TabPage_' + goog.string.createUniqueString(),
	'class': xiv.ViewBoxTabs.TABPAGE_CLASS,
	'label': tabTitle
    });
}


/**
 * As stated.
 * @param {!string} tabTitle The tab title.
 * @param {!Element} tab The tab element.
 * @param {!Element} tabIcon The tab element icon.
 * @param {!Element} content The tabPage content element.
 * @param {!goog.ui.TabPane.TabPage} googTab The google TabPage.
 * @private
 */
xiv.ViewBoxTabs.prototype.storeTab_ = 
function(tabTitle, tab, tabIcon, content, googTab){
    this.Tabs_ = (this.Tabs_) ? this.Tabs_ : {};
    this.Tabs_[tabTitle] = {
	'TabPage': googTab,
	'content': content,
	'tab': tab,
	'icon': tabIcon
    }
}


/**
 * As stated.
 * @return {!Array.Element} The elements..
 * @private
 */
xiv.ViewBoxTabs.prototype.getTabElements = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	elts.push(tabObj['tab']);
    });
    return elts;
}


/**
 * As stated.
 * @return {!Array.Element} The elements..
 * @private
 */
xiv.ViewBoxTabs.prototype.getTabContents = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	elts.push(tabObj['content']);
    });
    return elts;
}



/**
 * Adds a tab.  Utilises the tabObject_ object to create
 * tabs, their icons and pages.
 * @param {!string} tabTitle The title of the tab to add.
 * @public
 */
xiv.ViewBoxTabs.prototype.addTab = function(tabTitle) {
   
    // Check exists, error out.
    if (this.Tabs_[tabTile]) {
	throw new Error(tabTitle ' is an already existing tab!');
    }

    // create Tab
    var tab = /**@type {!Element}*/ this.createTabElt_(tabTitle);
    goog.dom.append(this.getElement(), tab);

    //  create Tab icon		
    var tabIcon = /**@type {!Element}*/ this.createTabIcon_(tabTitle);
    goog.dom.append(tab, tabIcon);
    if (tabIcon.src.toString().indexOf('undefined') > -1 ){ 
	tabIcon.innerHTML = tabTitle}

    //  create Tab page	
    var content = /**@type {!Element}*/ this.createTabPage_(tabTitle);
    utils.style.setStyle(content, utils.style.dims(this.getElement(), 'width'))
    goog.dom.append(this.getElement().parentNode, content);

    // create Create goog TabPage object
    var googTab = /**@type {!goog.ui.TabPane.TabPage}*/ 
    new goog.ui.TabPane.TabPage(content, tabTitle)

    // Add to tabPane
    this.googTabPane_.addPage(googTab);

    // store
    this.storeTab_(tabTitle, tab, tabIcon, content, googTab);

    // style
    this.updateStyle();

    // set events
    this.clearEventListeners_();
    this.setDefaultClickEvents();
    this.setDefaultHoverEvents();
    this.setActive(-1);
}



/**
 * Cycle through each tab, hightlighting the tab 
 * associated with activeTabNum, not hightlting the others.
 * @param {number} activeTabNum The reference active tab number.
 * @private
 */
xiv.ViewBoxTabs.prototype.activateTabElt_ = function (activeTabNum) {
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	if (i === activeTabNum) {
	    tab.setAttribute('isActive', true);
	    goog.dom.classes.add(tab, xiv.ViewBoxTabs.ACTIVE_TAB_CLASS);
	}
	else {
	    // Determine if current tab is the one to setActive or not
	    tab.setAttribute('isActive', false);
	    goog.dom.classes.remove(tab, xiv.ViewBoxTabs.ACTIVE_TAB_CLASS);
	    goog.dom.classes.set(tab, xiv.ViewBoxTabs.TAB_CLASS);
	}
    })	
}


/**
 * If there's an active tab, make the tab page border more prominent.
 * @param {number} activeTabNum The reference active tab number.
 * @private
 */
xiv.ViewBoxTabs.prototype.activateTabPage_ = function (activeTabNum) {
    goog.array.forEach(this.getTabContents(), function(tabPage, i) {
	if (activeTabNum === i){
	    goog.dom.classes.add(tabPage, xiv.ViewBoxTabs.ACTIVE_TABPAGE_CLASS);
	    //utils.fx.fadeInFromZero(tabPage, tabFadeIn);
	} else {
	    goog.dom.classes.set(tabPage, xiv.ViewBoxTabs.TABPAGE_CLASS);
	}	
    })	
}



/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is activated or clicked.
 * @param {number} activeTabNum The reference active tab number.
 * @public
 */
xiv.ViewBoxTabs.prototype.setActive = function (activeTabNum) {	
    // Call goog.ui.TabPane select method.
    this.googTabPane_.setSelectedIndex(activeTabNum);
    this.activateTabElt_(activeTabNum);
    this.activateTabPage_(activeTabNum);
}


/**
 * Clears all event listening callbacks for tabs.
 * @private
 */
xiv.ViewBoxTabs.prototype.clearEventListeners_ = function(){
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, 
				this.getElement()), function(tab, i) { 
	goog.events.removeAll(tab);
    })
}


/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 * @private
 */
xiv.ViewBoxTabs.prototype.setDefaultClickEvents = function() {

    // Cycle through each tab...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {
	    
	    // When a tab is clicked and it moves up
	    // in the viewer (activation)
	    if (tab.getAttribute('isActive') === false || 
		tab.getAttribute('isActive') === 'false') {
		this.setActive(i);
		this.lastActiveTab_ = i;
		this['EVENTS'].runEvent('ACTIVATED', this)


	    //
	    // When a tab is clicked and it moves to
	    // the bottom of the viewer (deactivation)
	    //
	    } else {
		//
		// Run deactiveate callbacks.
		//
		this['EVENTS'].runEvent('DEACTIVATED', this)
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
    goog.array.forEach(goog.dom.getElementsByClass(
	xiv.ViewBoxTabs.TAB_CLASS, this.getElement()), function(tab, i) { 

	//
	// Set tab hover
	//	
	goog.events.listen(tab, goog.events.EventType.MOUSEOVER, 
			   function(event) { 
	    
	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || 
		 tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.add(tab, xiv.ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // Set TabIcon style change (opacity) -- applies whether active 
	    // or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(
		this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.add(icon, 
				     xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
	}.bind(this))


	//
	// Tab mouseout
	//
	goog.events.listen(tab, goog.events.EventType.MOUSEOUT, function(event) { 

	    //
	    // Only change style of inactive tabs
	    //
	    if ((tab.getAttribute('isActive') === false || 
		 tab.getAttribute('isActive') === 'false')) {
		goog.dom.classes.remove(tab, xiv.ViewBoxTabs.HOVERED_TAB_CLASS);
	    }

	    //
	    // TabIcon style change (opacity) -- applies whether active or inactive
	    //
	    goog.array.forEach(goog.dom.getElementsByClass(
		this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.remove(icon, 
			xiv.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
	}.bind(this))

    }.bind(this))	
}





/**
 * @inheritDoc
 */
xiv.ViewBoxTabs.prototype.updateStyle = function (opt_args) {

    //------------------
    //  Google closure reclaims the element, so we need to reassert
    //  the class.
    //------------------
    goog.dom.classes.add(this.getElement(), xiv.ViewBoxTabs.ELEMENT_CLASS);

    
    if (opt_args) { utils.style.setStyle(this.getElement(), opt_args); }


    //------------------
    // For calculating the tabPageHeight.  
    // Don't proceed if there are no tabs.
    //------------------
    if (goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, 
				    this.getElement()).length > 0) {


	//
	// Set tabPage height.
	//
	var viewBoxHeight = utils.style.dims(this.getElement().parentNode, 'outerHeight');
	var tabHeight = utils.style.dims(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS)[0] , 'outerHeight')
	var tabPageHeight =  (viewBoxHeight - utils.style.dims(this.getElement(), 'top') - tabHeight - 3) || 0;
	goog.array.forEach(goog.dom.getElementsByClass(xiv.ViewBoxTabs.TABPAGE_CLASS, this.getElement()), function(elt, i) {	
	    utils.style.setStyle(elt, {
		'height': tabPageHeight,
		'width': utils.style.dims(this.getElement().parentNode, 'width') - 2 // acommodates for border
	    });
	}.bind(this))


	//
	// Calculate Tab Width based on number of tabs.
	//
	var tabs = goog.dom.getElementsByClass(xiv.ViewBoxTabs.TAB_CLASS, this.getElement());
	var parentWidth = utils.convert.toInt(utils.style.getComputedStyle(this.getElement(), 'width')); 
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
 * @param {!string} tabName The name of the tab.
 * @param {!Object|!Element|!utils.ui.ScrollableContainer} contents The 
 *    contents.
 */
xiv.ViewBoxTabs.prototype.setTabContents = function (tabName, contents) {
    // Add the tab page if it's not there.
    if (!this.Tabs_[tabName]){ this.addTab(tabName); }
    var tabPage = /**@type {!Element}*/ this.Tabs_[tabName]['content'];
    var scrollableContainer = /**@type {utils.ui.ScrollableContainer}*/ null;

    // Make or use existing scrollable container...
    if (contents instanceof utils.ui.ScrollableContainer) {
	//console.log("ITS A SCROLLABLE CONTAINER");
	scrollableContainer = contents;
	tabPage.appendChild(scrollableContainer.getElement());
    }
    else {
	scrollableContainer = new utils.ui.ScrollableContainer()
	tabPage.appendChild(scrollableContainer.getElement());
	scrollableContainer.addContents(contents);
	scrollableContainer.setZippysExpanded(false);
	//window.console.log("CONTENTS", contents);
	//window.console.log(scrollableContainer.getContentsDict());
    }

    // Set the scrollable container class.
    goog.dom.classes.add(scrollableContainer.getElement(), 
			 xiv.ViewBoxTabs.SCROLLGALLERY_CLASS);
}




