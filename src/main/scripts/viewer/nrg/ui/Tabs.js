/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.Tabs');

// goog
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.TabPane');
goog.require('goog.ui.TabPane.TabPage');
goog.require('goog.math.Size');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.style');

// nrg
goog.require('nrg.style');
goog.require('nrg.string');
goog.require('nrg.ui.Component');
goog.require('nrg.ui.ScrollableContainer');



/**
 * @constructor
 * @param {string=} opt_tabOrientation
 * @extends {nrg.ui.Component}
 */
nrg.ui.Tabs = function (opt_tabOrientation) {
    goog.base(this);
    //
    // Check the orientation
    //
    if (goog.isDefAndNotNull(opt_tabOrientation)) {
	this.checkOrientation_(opt_tabOrientation)
    }

    //
    // Set the orientation
    //
    this.orientation = opt_tabOrientation || nrg.ui.Tabs.DEFAULT_ORIENTATION;
}
goog.inherits(nrg.ui.Tabs, nrg.ui.Component);
goog.exportSymbol('nrg.ui.Tabs', nrg.ui.Tabs)



/**
 * @type {Array.string}
 * @const
 */
nrg.ui.Tabs.ORIENTATIONS = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];



/**
 * @type {!string} 
 * @const
 */
nrg.ui.Tabs.DEFAULT_ORIENTATION = nrg.ui.Tabs.ORIENTATIONS[0];



/**
 * @type {!string} 
 * @const
 */
nrg.ui.Tabs.ID_PREFIX =  'nrg.ui.Tabs';



/**
 * @enum {string} 
 * @expose
 */ 
nrg.ui.Tabs.CSS_SUFFIX = {
    TAB: 'tab',
    TAB_ACTIVE: 'tab-active',
    PAGE: 'page',
    PAGE_CONTENT: 'page-content',
    PAGE_ACTIVE: 'page-active',
    ICON: 'icon',
    ICON_ACTIVE: 'icon-active',
    ICON_CONTENT: 'icon-content',
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
nrg.ui.Tabs.TabItemCollection = 
function(title, tab, tabIcon, content, googTab){
    this.ACTIVE = false;
    this.TITLE = title;
    this.TAB = tab;
    this.ICON = tabIcon;
    this.PAGE = content;
    this.OBJ = googTab;
}



/**
 * @param {string}
 * @protected
 */
nrg.ui.Tabs.prototype.orientation_;



/**
 * @type {!number}
 * @private
 */
nrg.ui.Tabs.prototype.lastActiveTab_ = 0;



/**
 * @type {!number}
 * @private
 */
nrg.ui.Tabs.prototype.prevActiveTab_ = 0;



/**
 * @type {!goog.math.Size}
 * @protected
 */
nrg.ui.Tabs.prototype.tabSize = null;



/**
 * @type {goog.ui.TabPane}
 * @private
 */
nrg.ui.Tabs.prototype.googTabPane_;



/**
 * @type {Array.<nrg.ui.Tabs.TabItemCollection>}
 * @private
 */
nrg.ui.Tabs.prototype.Tabs_;



/**
 * @inheritDoc
 */
nrg.ui.Tabs.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.googTabPane_ = new goog.ui.TabPane(this.getElement());
    this.Tabs_ = [];
    goog.dom.classes.add(this.getElement(), nrg.ui.Tabs.ELEMENT_CLASS);
}



/**
 * @param {!string} tabTitle The title of the tab to add.
 * @return {!Element} The created element.
 * @private
 */
nrg.ui.Tabs.prototype.createTabElt_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id': 'Tab_' + goog.string.createUniqueString(),
	'class' : nrg.ui.Tabs.CSS.TAB,
	'title': tabTitle,
    });
}



/**
 * @param {!string} tabTitle The title of the tab icon to add.
 * @return {!Element} The created element.
 * @private
 */
nrg.ui.Tabs.prototype.createTabIcon_ = function(tabTitle) {
    //window.console.log("ICON", this.iconUrl);

    var icon =  goog.dom.createDom('div', {
	'id' : 'TabIcon_' + goog.string.createUniqueString(),
	'class' : nrg.ui.Tabs.CSS.ICON,
    });

    var iconContent = goog.dom.createDom('div', {
	'class' : nrg.ui.Tabs.CSS.ICON_CONTENT,
    }, tabTitle);

    goog.dom.append(icon, iconContent);
    
    return icon;
}



/**
 * @param {!string} tabTitle The title of the tab page to add.
 * @return {!Element} The created element.
 * @private
 */
nrg.ui.Tabs.prototype.createTabPage_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id' : 'TabPage_' + goog.string.createUniqueString(),
	'class': nrg.ui.Tabs.CSS.PAGE,
	'label': tabTitle
    });
}



/**
 * As sated.
 * @private
 */
nrg.ui.Tabs.prototype.checkOrientation_ = function(orient){
    if (!goog.isString(orient)){
	throw new TypeError('String required!')
    }
    orient = orient.toUpperCase();
    if (nrg.ui.Tabs.ORIENTATIONS.indexOf(orient) == -1){
	throw new Error('Invalid orienation!');
    }
}



/**
 * @return {!number}
 */
nrg.ui.Tabs.prototype.getTabCount = function() {
    return this.Tabs_.length;
}



/**
 * @return {!number} The index of the last active tab.
 * @public
 */
nrg.ui.Tabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}



/**
 * @return {!number} The index of the previous active tab (before last active).
 * @public
 */
nrg.ui.Tabs.prototype.getPreviousActiveTab = function(){
    return this.prevActiveTab_;
}



/**
 * As stated.
 *
 * @return {!Array.Element} The tab elements.
 * @public
 */
nrg.ui.Tabs.prototype.getTabElements = function() {
    var elts = [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.TAB);
    });
    return elts;
}



/**
 * @return {!Array.Element} The page elements.
 * @public
 */
nrg.ui.Tabs.prototype.getTabPages = function() {
    var elts = [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.PAGE);
    });
    return elts;
}



/**
 * @return {!Array.Element} The icon elements.
 * @public
 */
nrg.ui.Tabs.prototype.getTabIcons = function() {
    var elts = [];
    goog.array.forEach(this.Tabs_, function(tabItemCol){
	elts.push(tabItemCol.ICON);
    });
    return elts;
}



/**
 * Adds multiple tabs by calling on the internal 'addTab' function.
 * @param {!Array.string} tabTitles The titles of the tabs to add.
 * @public
 */
nrg.ui.Tabs.prototype.addTabs = function(tabTitles) {
    goog.array.forEach(tabTitles, function(tabTitle){
	this.addTab(tabTitle);
    }.bind(this))
}



/**
 * Clears all of the tabs.
 *
 * @public
 */
nrg.ui.Tabs.prototype.reset = function() {	
    var count =  this.Tabs_.length;
    while (count > 0) {
	this.googTabPane_.removePage(count - 1)
	count--;
    }
    this.disposeTabs();
}
   


/**
 * @param {!string} tabTitle
 * @return {!boolean} Whether or not the tab exists.
 * @public
 */
nrg.ui.Tabs.prototype.tabExists = function(tabTitle) {
    if (!goog.isDefAndNotNull(this.Tabs_)){ return false };
    var i = 0;
    var len = this.Tabs_.length;
    for(; i < len; i++) {
	if (this.Tabs_[i].TITLE == tabTitle) { return true };
    }
    return false;
}



/**
 * @param {!string} tabTitle
 * @return {nrg.ui.TabItemCollection}
 * @private
 */
nrg.ui.Tabs.prototype.getTabItemCollectionFromTitle_ = function(tabTitle) {
    if (!goog.isDefAndNotNull(this.Tabs_)){ return false };
    var i = 0;
    var len = this.Tabs_.length;
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
nrg.ui.Tabs.prototype.addTab = function(tabTitle) {
    //
    // Create the tabs if they don't exist
    //
    this.Tabs_ = goog.isDefAndNotNull(this.Tabs_) ? this.Tabs_ : [];

    //
    // Check if the tab title exists, error out.  
    //
    if (this.tabExists(tabTitle)) {
	throw new Error(tabTitle + ' is an already existing tab!');
    }
    
    //
    // create Tab Element
    //
    var tab =  this.createTabElt_(tabTitle);
    goog.dom.append(this.getElement(), tab);

    //
    //  create Tab icon	
    //
    var tabIcon =  this.createTabIcon_(tabTitle);
    goog.dom.append(tab, tabIcon);

    //
    //  create Tab page	
    //
    var content =  this.createTabPage_(tabTitle);
    goog.dom.append(this.getElement().parentNode, content);

    //
    // create Create goog TabPage object, add to tabPane
    //
    var googTab = 
    new goog.ui.TabPane.TabPage(content, tabTitle)
    this.googTabPane_.addPage(googTab);

    //
    // store above into struct
    //
    this.Tabs_.push(
	new nrg.ui.Tabs.TabItemCollection(tabTitle, tab, tabIcon, 
					   content, googTab));

    //
    // set events
    //
    this.clearEventListeners_();
    this.setClickEvents_();
    this.setHoverEvents_();
    this.deactivateAll();
    this.setActive(0);

    //
    // update
    //
    this.updateStyle();
}



/**
 * Adds either an object or an element to the contents
 * of a tab page.  The contents is always a nrg.ui.ScrollableContainer, which
 * can accept either Objects of Elements as part of its input method.
 *
 * @param {!string} tabTitle The name of the tab.
 * @param {!Object|!Element|!nrg.ui.ScrollableContainer} contents The 
 *    contents.
 * @public
 */
nrg.ui.Tabs.prototype.setTabPageContents = function (tabTitle, contents) {
    //
    // Add the tab page if it's not there.
    //
    if (!this.tabExists(tabTitle)) { this.addTab(tabTitle)};

    //
    // Get the current tab
    //
    var currTab =  this.getTabItemCollectionFromTitle_(tabTitle);
    var scrollableContainer;
    //
    // Make or use existing scrollable container...
    //
    if (contents instanceof nrg.ui.ScrollableContainer) {
	scrollableContainer = contents;
	currTab.PAGE.appendChild(contents.getElement());
    }
    else {
	scrollableContainer = new nrg.ui.ScrollableContainer()
	scrollableContainer.render(currTab.PAGE);
	scrollableContainer.addContents(contents);

	
	//window.console.log("PAGES", contents);
	//window.console.log(scrollableContainer.getPageDict());
    }

    //
    // Set the scrollable container class.
    //
    goog.dom.classes.add(scrollableContainer.getElement(), 
			 nrg.ui.Tabs.CSS.PAGE_CONTENT);

    //
    // update
    //
    this.updateStyle();
}



/**
 * Clears all event listening callbacks for tabs.
 *
 * @private
 */
nrg.ui.Tabs.prototype.clearEventListeners_ = function(){
    goog.array.forEach(this.Tabs_, function(tabCol, ind){ 
	goog.events.removeAll(tabCol.TAB);
    }.bind(this))
}



/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 *
 * @private
 */
nrg.ui.Tabs.prototype.setClickEvents_ = function() {
    goog.array.forEach(this.Tabs_, function(tabCol, ind){ 
	goog.events.listen(tabCol.TAB, 
	    goog.events.EventType.CLICK, function(event) {
		this.deactivateAll();
		this.setActive(ind);
	}.bind(this))
    }.bind(this))	
}



/**
 * Sets the default hover events, such as highlighting, when
 * the mouse hover's over the tab.
 *
 * @private
 */
nrg.ui.Tabs.prototype.setHoverEvents_ = function() {
    goog.array.forEach(this.Tabs_, function(tabCol, ind){ 
	this.setTabMouseOver_(ind);
	this.setTabMouseOut_(ind);
    }.bind(this))	
}



/**
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} ind The index of the tab.
 * @private
 */
nrg.ui.Tabs.prototype.setTabMouseOver_ = function(ind) {
    goog.events.listen(this.Tabs_[ind].TAB, 
        goog.events.EventType.MOUSEOVER, function() {
	//window.console.log(this.Tabs_[ind].ACTIVE);
	//
	// We don't need to highlight anything if we're over the active tab.
	//
	if (this.Tabs_[ind].ACTIVE === true) { return };
	
	//
	// Add the hovered class
	//
	goog.dom.classes.add(this.Tabs_[ind].TAB, nrg.ui.Tabs.CSS.TAB_ACTIVE);

	//
	// Add the hovered class by orientation
	//
	goog.dom.classes.add(this.Tabs_[ind].TAB, 
	    nrg.string.makeCssName(nrg.ui.Tabs.CSS.TAB_ACTIVE, 
	    this.orientation));
	
	//
	// Set TabIcon style change (opacity) -- applies whether active 
	// or inactive
	//
	goog.dom.classes.add(this.Tabs_[ind].ICON,
			     nrg.ui.Tabs.CSS.ICON_ACTIVE);
    }.bind(this))
}



/**
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} ind The index of the tab.
 * @private
 */
nrg.ui.Tabs.prototype.setTabMouseOut_ = function(ind) {
    goog.events.listen(this.Tabs_[ind].TAB, 
        goog.events.EventType.MOUSEOUT, function(e) { 
	//
	// We don't need to unhighlight anything if we're over the active tab.
	//
	if (this.Tabs_[ind].ACTIVE === true) { return };

	//
	// Remove the hovered class
	//
	goog.dom.classes.remove(this.Tabs_[ind].TAB, 
				nrg.ui.Tabs.CSS.TAB_ACTIVE);

	//
	// Remove the hovered class by orientation
	//
	goog.dom.classes.remove(this.Tabs_[ind].TAB, nrg.string.makeCssName(
	    nrg.ui.Tabs.CSS.TAB_ACTIVE, this.orientation));

	//
	// TabIcon style change (opacity) -- applies whether active or inactive
	//
	goog.dom.classes.remove(this.Tabs_[ind].ICON,  
				nrg.ui.Tabs.CSS.ICON_ACTIVE);
    }.bind(this))
}




/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is activated or clicked.
 *
 * @param {!number} ind The reference active tab number.
 * @public
 */
nrg.ui.Tabs.prototype.setActive = function (ind) {
    //
    // Store the active 
    //
    this.Tabs_[ind].ACTIVE = true;
	
    //
    // Track indices
    //
    this.prevActiveTab_ = this.lastActiveTab_;
    this.lastActiveTab_ = ind;

    //
    // goog.ui.Tab method
    //
    this.googTabPane_.setSelectedIndex(ind);

    //
    // Classes
    //
    goog.dom.classes.add(this.Tabs_[ind].TAB, nrg.ui.Tabs.CSS.TAB_ACTIVE);
    goog.dom.classes.add(this.Tabs_[ind].TAB, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.TAB_ACTIVE, this.orientation));

    // Page
    goog.dom.classes.add(this.Tabs_[ind].PAGE, nrg.ui.Tabs.CSS.PAGE_ACTIVE);
    goog.dom.classes.add(this.Tabs_[ind].PAGE, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.PAGE_ACTIVE, this.orientation));

    // Icon
    goog.dom.classes.add(this.Tabs_[ind].ICON, nrg.ui.Tabs.CSS.ICON_ACTIVE);
    goog.dom.classes.add(this.Tabs_[ind].ICON, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.ICON_ACTIVE, this.orientation));
}



/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is deactivated.
 *
 * @param {!number} ind The tab index to deactivate.
 * @public
 */
nrg.ui.Tabs.prototype.deactivate = function (ind) {
    //
    // Store the active 
    //
    this.Tabs_[ind].ACTIVE = false;

    //
    // goog.ui.Tab method
    //
    this.googTabPane_.setSelectedIndex(0);

    //
    // Classes
    //
    goog.dom.classes.remove(this.Tabs_[ind].TAB, nrg.ui.Tabs.CSS.TAB_ACTIVE);
    goog.dom.classes.remove(this.Tabs_[ind].TAB, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.TAB_ACTIVE, this.orientation));

    // Page
    goog.dom.classes.remove(this.Tabs_[ind].PAGE, nrg.ui.Tabs.CSS.PAGE_ACTIVE);
    goog.dom.classes.remove(this.Tabs_[ind].PAGE, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.PAGE_ACTIVE, this.orientation));

    // Icon
    goog.dom.classes.remove(this.Tabs_[ind].ICON, nrg.ui.Tabs.CSS.ICON_ACTIVE);
    goog.dom.classes.remove(this.Tabs_[ind].ICON, nrg.string.makeCssName(
	nrg.ui.Tabs.CSS.ICON_ACTIVE, this.orientation));
}



/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when all tabs are deactivated.
 *
 * @public
 */
nrg.ui.Tabs.prototype.deactivateAll = function () { 
    goog.array.forEach(this.Tabs_, function(tabColl, ind){
	this.deactivate(ind);
    }.bind(this))
}




/**
 * @inheritDoc
 */
nrg.ui.Tabs.prototype.updateStyle = function () {
    //window.console.log("\n\n\n\n**********UPDATE STYLE", this.orientation);
    if (!this.getElement().parentNode) { return };
    
    //
    // Need to do this -- google takes it over.
    //
    goog.dom.classes.add(this.getElement(), nrg.ui.Tabs.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
	    nrg.string.makeCssName(nrg.ui.Tabs.ELEMENT_CLASS, 
			    this.orientation));
    //window.console.log(nrg.ui.Tabs.ELEMENT_CLASS);
    //
    // IMPORTANT: Necessary because google takes it over...
    //
    goog.array.forEach(this.Tabs_, function(tabColl, i){

	goog.dom.classes.add(tabColl.TAB, nrg.string.makeCssName(
	    nrg.ui.Tabs.CSS.TAB, this.orientation));

	goog.dom.classes.add(tabColl.ICON, nrg.string.makeCssName(
	    nrg.ui.Tabs.CSS.ICON, this.orientation));

	goog.dom.classes.add(tabColl.PAGE, nrg.string.makeCssName(
	    nrg.ui.Tabs.CSS.PAGE, this.orientation));
	
    }.bind(this))

    

    switch (this.orientation) {
    case 'TOP':
	this.updateStyleTop_();
	break;
    case 'BOTTOM':
	//nrg.style.setStyle(this.getElement(), {'width': '100%'});
	//this.getResizable().setMinHeight(this.getTabHeight());
	this.updateStyleBottom_();
	break;

    case 'LEFT':
	break;
    case 'RIGHT':
	this.updateStyleRight_();	
	break;
    } 

    //
    // Calculate the tab size
    //
    if (this.Tabs_.length > 0){
	var tabSize = goog.style.getSize(this.Tabs_[0].TAB);
	if (tabSize.width > 0 && tabSize.height > 0){
	    this.tabSize = tabSize;
	}
    } 
}



/**
 * @private
 */
nrg.ui.Tabs.prototype.updateStyleVertical_ = function() { 
    goog.array.forEach(this.Tabs_, function(tObj){
	if (!this.getElement().parentNode){ return };
	nrg.style.setStyle(tObj.TAB, {
	    'height' : (100/this.Tabs_.length).toString() + '%',
	})

	//
	// Set the width of the tab page
	//
	tObj.PAGE.style.width = 'calc(100% - ' + 
	    goog.style.getSize(tObj.TAB).width + 'px)';

    }.bind(this))
}


/**
 * @private
 */
nrg.ui.Tabs.prototype.updateStyleHorizontal_ = function() { 
    //
    // Sets tab widths
    //
    var width;
    goog.array.forEach(this.Tabs_, function(tObj, i){
	if (!this.getElement().parentNode){ return };
	width = 100/this.Tabs_.length;
	nrg.style.setStyle(tObj.TAB, {
	    'width' : (width).toString() + '%',
	    'left': (i * width).toString() + '%'
	})
    }.bind(this))
}



/**
 * @private
 */
nrg.ui.Tabs.prototype.updateStyleRight_ = function() {
    this.updateStyleVertical_();
}



/**
 * @private
 */
nrg.ui.Tabs.prototype.updateStyleTop_ = function() { 
    this.updateStyleHorizontal_();


}



/**
 * @private
 */
nrg.ui.Tabs.prototype.disposeTabs_ = function() {
    //
    // Loop through tabs
    //
    goog.array.forEach(this.Tabs_, function(tabItemColl){
	//
	// Loop through the collection
	//
	goog.object.forEach(tabItemColl, function(tabItem, key2){
	    //
	    // Remove events
	    //
	    goog.events.removeAll(tabItem);

	    //
	    // Run dispose, if the item has the methods
	    //
	    if (tabItem.disposeInternal){
		tabItem.dispose();

	    } else if (tabItem.dispose){
		tabItem.dispose();
	    }

	    //
	    // Deletes
	    //
	    delete tabItem;	
	    delete tabItemColl[key2];
	})
	goog.object.clear(tabItemColl);
	delete tabItemColl;
    })

    //
    // Clear the array
    //
    goog.array.clear(this.Tabs_);
}



/**
 * @inheritDoc
 */
nrg.ui.Tabs.prototype.disposeInternal = function() {
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
    this.googTabPane_.dispose();
    delete this.googTabPane_;

    // others
    delete this.lastActiveTab_;
    delete this.prevActiveTab_;
    delete this.tabHeight_;
    delete this.orientation;
}



goog.exportSymbol('nrg.ui.Tabs.ORIENTATIONS', nrg.ui.Tabs.ORIENTATIONS);
goog.exportSymbol('nrg.ui.Tabs.DEFAULT_ORIENTATION',
	nrg.ui.Tabs.DEFAULT_ORIENTATION);
goog.exportSymbol('nrg.ui.Tabs.ID_PREFIX', nrg.ui.Tabs.ID_PREFIX);
goog.exportSymbol('nrg.ui.Tabs.CSS_SUFFIX', nrg.ui.Tabs.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.Tabs.TabItemCollection',
	nrg.ui.Tabs.TabItemCollection);
goog.exportSymbol('nrg.ui.Tabs.prototype.tabSize',
	nrg.ui.Tabs.prototype.tabSize);
goog.exportSymbol('nrg.ui.Tabs.prototype.render',
	nrg.ui.Tabs.prototype.render);
goog.exportSymbol('nrg.ui.Tabs.prototype.getTabCount',
	nrg.ui.Tabs.prototype.getTabCount);
goog.exportSymbol('nrg.ui.Tabs.prototype.getLastActiveTab',
	nrg.ui.Tabs.prototype.getLastActiveTab);
goog.exportSymbol('nrg.ui.Tabs.prototype.getPreviousActiveTab',
	nrg.ui.Tabs.prototype.getPreviousActiveTab);
goog.exportSymbol('nrg.ui.Tabs.prototype.getTabElements',
	nrg.ui.Tabs.prototype.getTabElements);
goog.exportSymbol('nrg.ui.Tabs.prototype.getTabPages',
	nrg.ui.Tabs.prototype.getTabPages);
goog.exportSymbol('nrg.ui.Tabs.prototype.getTabIcons',
	nrg.ui.Tabs.prototype.getTabIcons);
goog.exportSymbol('nrg.ui.Tabs.prototype.addTabs',
	nrg.ui.Tabs.prototype.addTabs);
goog.exportSymbol('nrg.ui.Tabs.prototype.reset', nrg.ui.Tabs.prototype.reset);
goog.exportSymbol('nrg.ui.Tabs.prototype.tabExists',
	nrg.ui.Tabs.prototype.tabExists);
goog.exportSymbol('nrg.ui.Tabs.prototype.addTab',
	nrg.ui.Tabs.prototype.addTab);
goog.exportSymbol('nrg.ui.Tabs.prototype.setTabPageContents',
	nrg.ui.Tabs.prototype.setTabPageContents);
goog.exportSymbol('nrg.ui.Tabs.prototype.setActive',
	nrg.ui.Tabs.prototype.setActive);
goog.exportSymbol('nrg.ui.Tabs.prototype.deactivate',
	nrg.ui.Tabs.prototype.deactivate);
goog.exportSymbol('nrg.ui.Tabs.prototype.deactivateAll',
	nrg.ui.Tabs.prototype.deactivateAll);
goog.exportSymbol('nrg.ui.Tabs.prototype.updateStyle',
	nrg.ui.Tabs.prototype.updateStyle);
goog.exportSymbol('nrg.ui.Tabs.prototype.disposeInternal',
	nrg.ui.Tabs.prototype.disposeInternal);
