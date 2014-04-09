/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.ui.TabPane');
goog.require('goog.ui.TabPane.TabPage');

// moka
goog.require('moka.style');
goog.require('moka.ui.Component');
goog.require('moka.ui.ScrollableContainer');




/**
 * moka.ui.Tabs are the tabs that occur at the bottom
 * of the xiv.ui.ViewBox.  They are only visible when a viewable is in the 
 * xiv.ui.ViewBox. These tabs are multi-purpose and could be used for 
 * information, object togling, image adjusting, etc.
 * @constructor
 * @param {string=} opt_tabOrientation
 * @extends {moka.ui.Component}
 */
goog.provide('moka.ui.Tabs');
moka.ui.Tabs = function (opt_tabOrientation) {
    goog.base(this);

    /**
     * @type {!goog.ui.TabPane}
     * @private
     */
    this.googTabPane_ = new goog.ui.TabPane(this.getElement());


    /**
     * @type {!Array.<moka.ui.Tabs.TabItemCollection>}
     * @private
     */
    this.Tabs_ = [];


    this.checkOrientation_(opt_tabOrientation ||
			   moka.ui.Tabs.DEFAULT_ORIENTATION);
    this.setClassesByOrientation_();
}
goog.inherits(moka.ui.Tabs, moka.ui.Component);
goog.exportSymbol('moka.ui.Tabs', moka.ui.Tabs)



/**
 * @type {Array.string}
 * @const
 */
moka.ui.Tabs.ORIENTATIONS = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];



/**
 * @type {!string} 
 * @const
 */
moka.ui.Tabs.DEFAULT_ORIENTATION = moka.ui.Tabs.ORIENTATIONS[0];



/**
 * @type {!string} 
 * @const
 */
moka.ui.Tabs.ID_PREFIX =  'moka.ui.Tabs';




/**
 * @enum {string} 
 * @const
 */ 
moka.ui.Tabs.CSS_SUFFIX = {
    TAB: 'tab',
    TAB_ACTIVE: 'tab-active',
    TAB_HOVERED: 'tab-hovered',
    TABPAGE: 'tabpage',
    TABPAGE_ACTIVE: 'tabpage-active',
    TABICON: 'tabicon',
    TABICON_MOUSEOVER: 'tabicon-mouseover',
    SCROLLGALLERY: 'scrollgallery'
}




/**
 * @param {!string} tabTitle The tab title.
 * @param {!Element} tab The tab element.
 * @param {!Element} tabIcon The tab element icon.
 * @param {!Element} content The tabPage content element.
 * @param {!goog.ui.TabPane.TabPage} googTab The google TabPage.
 * @constructor
 * @struct
 */
moka.ui.Tabs.TabItemCollection = 
function(title, tab, tabIcon, content, googTab){
    this.TITLE = title;
    this.TAB = tab;
    this.ICON = tabIcon;
    this.CONTENT = content;
    this.OBJ = googTab;
}




/**
 * As sated.
 * @private
 */
moka.ui.Tabs.prototype.checkOrientation_ = function(orient){
    if (!goog.isString(orient)){
	throw new TypeError('String required!')
    }
    orient = orient.toUpperCase();
    if (moka.ui.Tabs.ORIENTATIONS.indexOf(orient) == -1){
	throw new Error('Invalid orienation!');
    }
    this.orientation = orient;
}



/**
 * @private
 */
moka.ui.Tabs.prototype.setClassesByOrientation_ = function() {
    goog.dom.classes.add(this.getElement(), moka.ui.Tabs.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
		goog.getCssName(moka.ui.Tabs.CSS_CLASS_PREFIX, 
			       this.orientation.toLowerCase()));

    // In-line calculations
    switch (this.orientation) {

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
	this.getElement().style.left = '0px';
    }
}




/**
 * @param {string}
 * @protected
 */
moka.ui.Tabs.prototype.orientation_;



/**
 * @type {!number}
 * @private
 */
moka.ui.Tabs.prototype.lastActiveTab_ = 0;



/**
 * @type {!number}
 * @private
 */
moka.ui.Tabs.prototype.prevActiveTab_ = 0;



/**
 * @type {!number}
 * @private
 */
moka.ui.Tabs.prototype.tabHeight_ = 15;



/**
 * @type {!number}
 * @private
 */
moka.ui.Tabs.prototype.tabWidth_ = 15;



/**
 * As stated.
 * @param {!number} h
 * @public
 */
moka.ui.Tabs.prototype.setTabHeight = function(h){
    this.tabHeight_ = (goog.isNumber(h) && (h > -1)) ? h : this.tabHeight_;
    this.updateStyle();
}


/**
 * @return {!number}
 * @public
 */
moka.ui.Tabs.prototype.getTabHeight = function(){
    return this.tabHeight_;
}



/**
 * As stated.
 * @param {!number} h
 * @public
 */
moka.ui.Tabs.prototype.setTabWidth = function(w){
    this.tabWidth_ = (goog.isNumber(w) && (w > -1)) ? w : this.tabWidth_;
    this.updateStyle();
}



/**
 * @return {!number}
 * @public
 */
moka.ui.Tabs.prototype.getTabWidth = function(){
    return this.tabWidth_;
}


/**
 * @return {!number} The index of the last active tab.
 * @public
 */
moka.ui.Tabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}



/**
 * @return {!number} The index of the previous active tab (before last active).
 * @public
 */
moka.ui.Tabs.prototype.getPreviousActiveTab = function(){
    return this.prevActiveTab_;
}



/**
 * Adds multiple tabs by calling on the internal 'addTab' function.
 * @param {!Array.string} tabTitles The titles of the tabs to add.
 * @public
 */
moka.ui.Tabs.prototype.addTabs = function(tabTitles) {
    goog.array.forEach(tabTitles, function(tabTitle){
	this.addTab(tabTitle);
    }.bind(this))
}



/**
 * Clears all of the tabs.
 *
 * @public
 */
moka.ui.Tabs.prototype.reset = function() {	
    var count = /**@type {!number}*/ this.Tabs_.length;
    while (count > 0) {
	this.googTabPane_.removePage(count - 1)
	count--;
    }
    this.disposeTabs();
}
   


/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is activated or clicked.
 *
 * @param {!number} activeTabNum The reference active tab number.
 * @public
 */
moka.ui.Tabs.prototype.setActive = function (activeTabNum) {	
    // Call goog.ui.TabPane select method.
    this.prevActiveTab_ = this.lastActiveTab_;
    this.lastActiveTab_ = activeTabNum;
    this.googTabPane_.setSelectedIndex(activeTabNum);
    this.setActiveTabElt_(activeTabNum);
    this.setActiveTabPage_(activeTabNum);
}




/**
 * As stated.
 *
 * @return {!Array.Element} The tab elements.
 * @public
 */
moka.ui.Tabs.prototype.getTabElements = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.TAB);
    });
    return elts;
}



/**
 * @return {!Array.Element} The page elements.
 * @public
 */
moka.ui.Tabs.prototype.getTabPages = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.CONTENT);
    });
    return elts;
}



/**
 * @return {!Array.Element} The icon elements.
 * @public
 */
moka.ui.Tabs.prototype.getTabIcons = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.ICON);
    });
    return elts;
}



/**
 * @param {!string} tabTitle
 * @return {!boolean} Whether or not the tab exists.
 * @public
 */
moka.ui.Tabs.prototype.tabExists = function(tabTitle) {
    if (!goog.isDefAndNotNull(this.Tabs_)){ return false };
    var i = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ this.Tabs_.length;
    for(; i < len; i++) {
	if (this.Tabs_[i].TITLE == tabTitle) { return true };
    }
    return false;
}


/**
 * @param {!string} tabTitle
 * @return {moka.ui.TabItemCollection}
 * @public
 */
moka.ui.Tabs.prototype.getTabItemCollection = function(tabTitle) {
    if (!goog.isDefAndNotNull(this.Tabs_)){ return false };
    var i = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ this.Tabs_.length;
    for(; i < len; i++) {
	if (this.Tabs_[i].TITLE == tabTitle) { return this.Tabs_[i] };
    }
}



/**
 * Adds a tab.  Utilises the tabObject_ object to create
 * tabs, their icons and pages.
 *
 * @param {!string} tabTitle The title of the tab to add.
 * @throws {Error} If tab with tabTitle already exists.
 * @public
 */
moka.ui.Tabs.prototype.addTab = function(tabTitle) {

    this.Tabs_ = goog.isDefAndNotNull(this.Tabs_) ? this.Tabs_ : [];

    // Check exists, error out.    
    if (this.tabExists(tabTitle)) {
	throw new Error(tabTitle + ' is an already existing tab!');
    }
    

    // create Tab
    var tab = /**@type {!Element}*/ this.createTabElt_(tabTitle);
    goog.dom.append(this.getElement(), tab);

    //  create Tab icon		
    var tabIcon = /**@type {!Element}*/ this.createTabIcon_(tabTitle);
    goog.dom.append(tab, tabIcon);


    //  create Tab page	
    var content = /**@type {!Element}*/ this.createTabPage_(tabTitle);
    moka.style.setStyle(content, moka.style.dims(this.getElement(), 'width'))
    goog.dom.append(this.getElement().parentNode, content);

    // create Create goog TabPage object
    var googTab = /**@type {!goog.ui.TabPane.TabPage}*/ 
    new goog.ui.TabPane.TabPage(content, tabTitle)


    // Add to tabPane
    this.googTabPane_.addPage(googTab);

    // store
    this.Tabs_.push(
	new moka.ui.Tabs.TabItemCollection(tabTitle, tab, tabIcon, 
					   content, googTab));

    // set events
    this.clearEventListeners_();
    this.setClickEvents_();
    this.setHoverEvents_();
    this.deactivateAll();
    this.setActive(0);

    // style
    this.updateStyle();
}



/**
 * Adds either an object or an element to the contents
 * of a tab page.  The contents is always a moka.ui.ScrollableContainer, which
 * can accept either Objects of Elements as part of its input method.
 *
 * @param {!string} tabTitle The name of the tab.
 * @param {!Object|!Element|!moka.ui.ScrollableContainer} contents The 
 *    contents.
 * @public
 */
moka.ui.Tabs.prototype.setTabPageContents = function (tabTitle, contents) {
    // Add the tab page if it's not there.
    if (!this.tabExists(tabTitle)) { this.addTab(tabTitle)};


    var currTab = /** @type {moka.ui.Tabs.TabItemCollection}*/ 
    this.getTabItemCollection(tabTitle);

    var scrollableContainer = /**@type {moka.ui.ScrollableContainer}*/ null;

    // Make or use existing scrollable container...
    if (contents instanceof moka.ui.ScrollableContainer) {
	scrollableContainer = contents;
	currTab.CONTENT.appendChild(
	    scrollableContainer.getElement());
    }
    else {
	scrollableContainer = new moka.ui.ScrollableContainer()
	currTab.CONTENT.appendChild(
	    scrollableContainer.getElement());
	scrollableContainer.addContents(contents);
	//window.console.log("CONTENTS", contents);
	//window.console.log(scrollableContainer.getPageDict());
    }

    // Set the scrollable container class.
    goog.dom.classes.add(scrollableContainer.getElement(), 
			 moka.ui.Tabs.CSS.SCROLLGALLERY);

    this.updateStyle();
}



/**
 * @param {!string} tabTitle The title of the tab to add.
 * @return {!Element} The created element.
 * @private
 */
moka.ui.Tabs.prototype.createTabElt_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id': 'Tab_' + goog.string.createUniqueString(),
	'class' : moka.ui.Tabs.CSS.TAB,
	'title': tabTitle,
    });
}


/**
 * @param {!string} tabTitle The title of the tab to set the image for.
 * @return {!string} The src of the image.
 * @private
 */
moka.ui.Tabs.prototype.setTabIconImage_ = function(tabTitle, src) {
    //window.console.log("ICON", this.iconUrl);
    var currTab = /** @type {moka.ui.Tabs.TabItemCollection}*/ 
    this.getTabItemCollection(tabTitle);
    goog.dom.removeChildren(currTab.ICON);
    goog.dom.append(currTab.ICON, goog.dom.createDom('img', {
	'src' : src
    }))
}



/**
 * @param {!string} tabTitle The title of the tab icon to add.
 * @return {!Element} The created element.
 * @private
 */
moka.ui.Tabs.prototype.createTabIcon_ = function(tabTitle) {
    //window.console.log("ICON", this.iconUrl);

    var icon = /**@type {!Element}*/ goog.dom.createDom('div', {
	'id' : 'TabIcon_' + goog.string.createUniqueString(),
	'class' : moka.ui.Tabs.CSS.TABICON,
    });

    goog.dom.append(icon, goog.dom.createDom('div', {
	'class' : moka.ui.Tabs.CSS.TABICON
    }, tabTitle))

    
    return icon;
}





/**
 * @param {!string} tabTitle The title of the tab page to add.
 * @return {!Element} The created element.
 * @private
 */
moka.ui.Tabs.prototype.createTabPage_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id' : 'TabPage_' + goog.string.createUniqueString(),
	'class': moka.ui.Tabs.CSS.TABPAGE,
	'label': tabTitle
    });
}






/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is deactivated.
 *
 * @param {!number} ind The tab index to deactivate.
 * @public
 */
moka.ui.Tabs.prototype.deactivate = function (ind) { 
    goog.array.forEach(this.getTabElements(), function(tabElt, i){
	if (i === ind) {
	    this.deactivateTabElt_(tabElt);
	}
    }.bind(this))

    goog.array.forEach(this.getTabPages(), function(tabCont, i){
	if (i === ind) {
	    this.deactivateTabPage_(tabCont);
	}
    }.bind(this))
}



/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when all tabs are deactivated.
 *
 * @public
 */
moka.ui.Tabs.prototype.deactivateAll = function () { 

    goog.array.forEach(this.getTabElements(), function(tabElt, i){
	this.deactivateTabElt_(tabElt);
    }.bind(this))

    goog.array.forEach(this.getTabPages(), function(tabCont, i){
	this.deactivateTabPage_(tabCont);
    }.bind(this))
}



/**
 * @return {!number}
 */
moka.ui.Tabs.prototype.getTabCount = function() {
    window.console.log('\n\n\n\n', this.Tabs_);
    return this.Tabs_.length;
}



/**
 * @inheritDoc
 */
moka.ui.Tabs.prototype.updateStyle = function () {





    if (!this.getElement().parentNode) { return };
    
    // Need to do this -- google takes it over.
    goog.dom.classes.add(this.getElement(), moka.ui.Tabs.ELEMENT_CLASS);


    // Necessary because google takes it over...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.dom.classes.add(tab, goog.getCssName(
	    moka.ui.Tabs.CSS_CLASS_PREFIX, 
				this.orientation.toLowerCase()));
    }.bind(this))

    goog.array.forEach(this.getTabIcons(), function(tab, i) { 
	goog.dom.classes.add(tab, goog.getCssName(
	    moka.ui.Tabs.CSS_CLASS_PREFIX, 
				this.orientation.toLowerCase() + '-icon'));
    }.bind(this))




    var i = /**@type {!number}*/ 0;
    var tCount = /**@type {!number}*/ this.getTabCount();
    var wPct = /**@type {!number}*/ 100/tCount; 
    var pHght = /**@type {!number}*/ 
	    parseInt(this.getElement().parentNode.style.height, 10);
    var borderMgn = /**@type {!number}*/ 0;
    
    goog.array.forEach(this.Tabs_, function(tObj){


	if (this.orientation === 'RIGHT' || this.orientation === 'LEFT') {
	    // Resize tab wPcts
	    moka.style.setStyle(tObj.TAB, {
		'height' : (100/tCount).toString() + '%',
		'left': (wPct * i).toString() + '%',
	    })
	} else {
	    // Resize tab wPcts
	    moka.style.setStyle(tObj.TAB, {
		'width': (wPct).toString() + '%',
		'left': (wPct * i).toString() + '%',
	    })


	}

	// Exit out if no parent node.
	if (!this.getElement().parentNode){ return };

	borderMgn = parseInt(moka.style.getComputedStyle(tObj.TAB, 
						'border-bottom-width'));
	borderMgn = (!borderMgn || isNaN(borderMgn) || 
		     !goog.isNumber(borderMgn)) ? 0 : borderMgn; 

	tObj.CONTENT.style.top = 
	    (this.tabHeight_ - borderMgn).toString() + 'px';
	tObj.CONTENT.style.height = 'calc(100% - ' + 
	    this.tabHeight_.toString() + 'px)',

	i++;
    }.bind(this))
}



/**
 * @private
 */
moka.ui.Tabs.prototype.deactivateTabElt_ = function (tabElt) {
    // remove active classes
    goog.dom.classes.remove(tabElt, moka.ui.Tabs.CSS.TAB_ACTIVE);


    // remove orientation classes
    goog.dom.classes.remove(tabElt, goog.getCssName(
	moka.ui.Tabs.CSS.TAB_ACTIVE, 
	this.orientation.toLowerCase()));

    // set default classes
    goog.dom.classes.set(tabElt, moka.ui.Tabs.CSS.TAB);
}



/**
 * @private
 */
moka.ui.Tabs.prototype.deactivateTabPage_ = function (tabCont) {
    goog.dom.classes.set(tabCont, moka.ui.Tabs.CSS.TABPAGE);
}



/**
 * Cycle through each tab, hightlighting the tab 
 * associated with ind, not hightlting the others.
 * @param {number} ind The reference active tab number.
 * @private
 */
moka.ui.Tabs.prototype.setActiveTabElt_ = function (ind) {
    //window.console.log("ACTIVATE TAB ELT", ind);
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	if (i === ind) {
	    tab.setAttribute('isActive', true);

	    // Active classes
	    goog.dom.classes.add(tab, moka.ui.Tabs.CSS.TAB_ACTIVE);

	    // Orientation classes
	    goog.dom.classes.add(tab, goog.getCssName(
		moka.ui.Tabs.CSS.TAB_ACTIVE, 
		this.orientation.toLowerCase()));
	}
    }.bind(this))	
}



/**
 * If there's an active tab, make the tab page border more prominent.
 *
 * @param {number} ind The reference active tab number.
 * @private
 */
moka.ui.Tabs.prototype.setActiveTabPage_ = function (ind) {
    goog.array.forEach(this.getTabPages(), function(tabPage, i) {
	if (ind === i){
	    goog.dom.classes.add(tabPage, moka.ui.Tabs.CSS.TABPAGE_ACTIVE);
	}	
    })	
}


/**
 * Clears all event listening callbacks for tabs.
 *
 * @private
 */
moka.ui.Tabs.prototype.clearEventListeners_ = function(){
    goog.array.forEach(goog.dom.getElementsByClass(moka.ui.Tabs.CSS.TAB, 
				this.getElement()), function(tab, i) { 
	goog.events.removeAll(tab);
    })
}



/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 *
 * @private
 */
moka.ui.Tabs.prototype.setClickEvents_ = function() {
    // Cycle through each tab...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {
	    window.console.log("CLICK", i);
	    this.deactivateAll();
	    this.setActive(i);
	}.bind(this))
    }.bind(this))	
}



/**
 * Sets the default hover events, such as highlighting, when
 * the mouse hover's over the tab.
 *
 * @private
 */
moka.ui.Tabs.prototype.setHoverEvents_ = function() {
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	this.setTabMouseOver_(tab, i);
	this.setTabMouseOut_(tab, i);
    }.bind(this))	
}



/**
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} i The index of the tab.
 * @private
 */
moka.ui.Tabs.prototype.setTabMouseOver_ = function(tab, i) {
    goog.events.listen(tab, goog.events.EventType.MOUSEOVER, function() { 
	goog.dom.classes.add(tab, moka.ui.Tabs.CSS.TAB_HOVERED);

	goog.dom.classes.add(tab, goog.getCssName(
	    moka.ui.Tabs.CSS.TAB_HOVERED, 
	    this.orientation.toLowerCase()));
	
	// Set TabIcon style change (opacity) -- applies whether active 
	// or inactive
	goog.array.forEach(goog.dom.getElementsByClass(
	    this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.add(icon, 
			moka.ui.Tabs.CSS.TABICON_MOUSEOVER);
	    }.bind(this))
    }.bind(this))
}



/**
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} i The index of the tab.
 * @private
 */
moka.ui.Tabs.prototype.setTabMouseOut_ = function(tab, i) {
    goog.events.listen(tab, goog.events.EventType.MOUSEOUT, function(e) { 
	goog.dom.classes.remove(tab, moka.ui.Tabs.CSS.TAB_HOVERED);
	goog.dom.classes.remove(tab, goog.getCssName(
	    moka.ui.Tabs.CSS.TAB_HOVERED, 
	    this.orientation.toLowerCase()));


	// TabIcon style change (opacity) -- applies whether active or inactive
	goog.array.forEach(goog.dom.getElementsByClass(
	    moka.ui.Tabs.CSS.TABICON, tab), function(icon){
		goog.dom.classes.remove(icon, 
				    moka.ui.Tabs.CSS.TABICON_MOUSEOVER);
	    }.bind(this))
    }.bind(this))
}



/**
 * @private
 */
moka.ui.Tabs.prototype.disposeTabs_ = function() {
    goog.array.forEach(this.Tabs_, function(collection){
	goog.object.forEach(collection, function(tabItem, key2){
	    if (tabItem instanceof goog.ui.TabPane.TabPage) {
		goog.events.removeAll(tabItem);
		delete tabItem;
	    } else if (tabItem instanceof moka.ui.ScrollableContainer) {
		goog.events.removeAll(tabItem);
		tabItem.disposeInternal();	
	    } else {
		goog.events.removeAll(tabItem);
		goog.dom.removeNode(tabItem);
	    }
	    delete collection[key2];
	})
	goog.object.clear(collection);
	delete collection;
    })
    goog.array.clear(this.Tabs_);
}



/**
 * @inheritDoc
 */
moka.ui.Tabs.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Element events
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.removeAll(tab);
    }.bind(this))

    // The Tabs_ object
    this.disposeTabs_();
    delete this.Tabs_;

    // tabPane
    goog.events.removeAll(this.googTabPane_);
    this.googTabPane_.disposeInternal();
    delete this.googTabPane_;

    // others
    delete this.lastActiveTab_;
    delete this.prevActiveTab_;
    delete this.tabHeight_;
    delete this.orientation;
}


