/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.TabPane');
goog.require('goog.ui.TabPane.TabPage');

// moka
goog.require('moka.ui.Component');
goog.require('moka.ui.Resizeable');
goog.require('moka.convert');
goog.require('moka.style');
goog.require('moka.ui.ScrollableContainer');
goog.require('moka.events.EventManager');




/**
 * xiv.ui.ViewBoxTabs are the tabs that occur at the bottom
 * of the xiv.ui.ViewBox.  They are only visible when a viewable is in the 
 * xiv.ui.ViewBox. These tabs are multi-purpose and could be used for 
 * information, object togling, image adjusting, etc.
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewBoxTabs');
xiv.ui.ViewBoxTabs = function () {
    goog.base(this);
    moka.style.setStyle(this.getElement(), {
	'top': '50%',
	'left': '25%'
    })


    /**
     * @type {!goog.ui.TabPane}
     * @private
     */
    this.googTabPane_ = new goog.ui.TabPane(this.getElement());

    // events
    moka.events.EventManager.addEventManager(this, xiv.ui.ViewBoxTabs.EventType);


    var resizeable = new moka.ui.Resizeable(this.getElement(), {
	maxWidth: 400,
	minWidth: 100,
	maxHeight: 400,
	minHeight: 100,
    })

    resizeable.setContinuousResize(true);
}
goog.inherits(xiv.ui.ViewBoxTabs, moka.ui.Component);
goog.exportSymbol('xiv.ui.ViewBoxTabs', xiv.ui.ViewBoxTabs)



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxTabs.EventType = {
  CLICKED: goog.events.getUniqueId('viewboxtab_clicked'),
}



/**
 * @dict
 * @const
 */
xiv.ui.ViewBoxTabs.ICON_SRC = {
    'Info':  'InfoIcon.png',
    'Slicer Views': 'SlicerViews.png',
}



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBoxTabs.ID_PREFIX =  'xiv.ui.ViewBoxTabs';



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBoxTabs.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(
    xiv.ui.ViewBoxTabs.ID_PREFIX.toLowerCase().replace(/\./g,'-'));



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.ELEMENT_CLASS =
    goog.getCssName(xiv.ui.ViewBoxTabs.CSS_CLASS_PREFIX, '');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.TAB_CLASS =
    goog.getCssName(xiv.ui.ViewBoxTabs.CSS_CLASS_PREFIX, 'tab');


/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.ACTIVE_TAB_CLASS =  
    goog.getCssName(xiv.ui.ViewBoxTabs.TAB_CLASS, 'active');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.HOVERED_TAB_CLASS =  
    goog.getCssName(xiv.ui.ViewBoxTabs.TAB_CLASS, 'hovered');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.TABPAGE_CLASS = 
    goog.getCssName(xiv.ui.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabpage');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.SCROLLGALLERY_CLASS = 
    goog.getCssName(xiv.ui.ViewBoxTabs.TABPAGE_CLASS, 'scrollgallery');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.ACTIVE_TABPAGE_CLASS =
    goog.getCssName(xiv.ui.ViewBoxTabs.TABPAGE_CLASS, 'active');


/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.TABICON_CLASS = 
    goog.getCssName(xiv.ui.ViewBoxTabs.CSS_CLASS_PREFIX, 'tabicon');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBoxTabs.MOUSEOVER_TABICON_CLASS = 
    goog.getCssName(xiv.ui.ViewBoxTabs.TABICON_CLASS, 'mouseover');



/**
 * @type {!string}
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.iconRoot_ = '';



/**
 * @type {!number}
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.lastActiveTab_ = 0;



/**
 * @type {Object}
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.Tabs_;



/**
 * @type {number}
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.tabHeight_ = 15;



/**
 * As stated.
 * @param {!number}
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.setTabHeight = function(h){
    this.tabHeight_ = (goog.isNumber(h) && (h > -1)) ? h : this.tabHeight_;
    this.updateStyle();
}




/**
 * As stated.
 * @type {number}
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.getLastActiveTab = function(){
    return this.lastActiveTab_;
}



/**
 * Adds multiple tabs by calling on the internal 'addTab' function.
 * @param {!Array.string} tabTitles The titles of the tabs to add.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.addTabs = function(tabTitles) {
    goog.array.forEach(tabTitles, function(tabTitle){
	this.addTab(tabTitle);
    }.bind(this))
}


/**
 * Clears all of the tabs.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.reset = function() {	
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
}
   


/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is activated or clicked.
 * @param {number} activeTabNum The reference active tab number.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.activate = function (activeTabNum) {	
    // Call goog.ui.TabPane select method.
    this.lastActiveTab_ = activeTabNum;
    this.googTabPane_.setSelectedIndex(activeTabNum);
    this.activateTabElt_(activeTabNum);
    this.activateTabPage_(activeTabNum);
}



/**
 * As stated.
 * @return {!Array.Element} The elements.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.getTabElements = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	elts.push(tabObj['tab']);
    });
    return elts;
}



/**
 * As stated.
 * @return {!Array.Element} The elements.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.getTabPage = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	elts.push(tabObj['content']);
    });
    return elts;
}



/**
 * As stated.
 * @return {!Array.Element} The elements..
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.getTabIcons = function() {
    var elts = /**@type {!Array.Element}*/ [];
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	elts.push(tabObj['icon']);
    });
    return elts;
}



/**
 * Adds a tab.  Utilises the tabObject_ object to create
 * tabs, their icons and pages.
 * @param {!string} tabTitle The title of the tab to add.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.addTab = function(tabTitle) {

    this.Tabs_ = (this.Tabs_) ? this.Tabs_ : {};

    // Check exists, error out.
    if (this.Tabs_ && this.Tabs_[tabTitle]) {
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
    this.storeTab_(tabTitle, tab, tabIcon, content, googTab);


    // style
    this.updateStyle();

    // set events
    this.clearEventListeners_();
    this.setClickEvents_();
    this.setHoverEvents_();
    this.deactivateAll();
}



/**
 * Adds either an object or an element to the contents
 * of a tab page.  The contents is always a moka.ui.ScrollableContainer, which
 * can accept either Objects of Elements as part of its input method.
 * @param {!string} tabName The name of the tab.
 * @param {!Object|!Element|!moka.ui.ScrollableContainer} contents The 
 *    contents.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.setTabPageContents = function (tabName, contents) {
    // Add the tab page if it's not there.
    if (!this.Tabs_ || !this.Tabs_[tabName]){ this.addTab(tabName) };

    var scrollableContainer = /**@type {moka.ui.ScrollableContainer}*/ null;

    // Make or use existing scrollable container...
    if (contents instanceof moka.ui.ScrollableContainer) {
	//console.log("ITS A SCROLLABLE CONTAINER");
	scrollableContainer = contents;
	this.Tabs_[tabName]['content'].appendChild(
	    scrollableContainer.getElement());
    }
    else {
	scrollableContainer = new moka.ui.ScrollableContainer()
	this.Tabs_[tabName]['content'].appendChild(
	    scrollableContainer.getElement());
	scrollableContainer.addContents(contents);
	//window.console.log("CONTENTS", contents);
	//window.console.log(scrollableContainer.getPageDict());
    }

    // Set the scrollable container class.
    goog.dom.classes.add(scrollableContainer.getElement(), 
			 xiv.ui.ViewBoxTabs.SCROLLGALLERY_CLASS);
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxTabs.prototype.updateIconSrcFolder = function() {
    goog.object.forEach(this.Tabs_, function(tabObj, key){
	//window.console.log(tabObj['icon'], tabObj['icon'].src);
	if (tabObj['icon'].childNodes[0].tagName.toLowerCase() == 'img'){
	    tabObj['icon'].childNodes[0].src = goog.string.path.join(
		this.iconUrl, tabObj['icon'].src);
	}
    }.bind(this))
}



/**
 * As stated..
 * @param {!string} tabTitle The title of the tab to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.createTabElt_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id': 'Tab_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBoxTabs.TAB_CLASS,
	'title': tabTitle,
    });
}


/**
 * As stated..
 * @param {!string} tabTitle The title of the tab icon to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.createTabIcon_ = function(tabTitle) {
    //window.console.log("ICON", this.iconUrl);

    var icon = /**@type {!Element}*/ goog.dom.createDom('div', {
	'id' : 'TabIcon_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBoxTabs.TABICON_CLASS,
    });

    
    if (this.constructor.ICON_SRC[tabTitle]) {
	goog.dom.append(icon, goog.dom.createDom('img', {
	    'src': goog.string.path.join(this.iconUrl, 
					 this.constructor.ICON_SRC[tabTitle]),
	    'class' : xiv.ui.ViewBoxTabs.TABICON_CLASS,
	}))
    } 

    // If there's no stored image resort to title...
    else {
	goog.dom.append(icon, goog.dom.createDom('div', {
	    'class' : xiv.ui.ViewBoxTabs.TABICON_CLASS
	}, tabTitle))
    }	
    return icon;
}



/**
 * As stated..
 * @param {!string} tabTitle The title of the tab page to add.
 * @return {!Element} The created element.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.createTabPage_ = function(tabTitle) {
    return goog.dom.createDom('div', {
	'id' : 'TabPage_' + goog.string.createUniqueString(),
	'class': xiv.ui.ViewBoxTabs.TABPAGE_CLASS,
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
xiv.ui.ViewBoxTabs.prototype.storeTab_ = 
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
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is deactivated.
 * @param {!number} ind The tab index to deactivate.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.deactivate = function (ind) { 
    goog.array.forEach(this.getTabElements(), function(tabElt, i){
	if (i === ind) {
	    this.deactivateTabElt_(tabElt);
	}
    }.bind(this))

    goog.array.forEach(this.getTabPage(), function(tabCont, i){
	if (i === ind) {
	    this.deactivateTabPage_(tabCont);
	}
    }.bind(this))
}



/**
 * Conducts the necessary CSS / stylesheet adjustments
 * when a tab is deactivated.
 * @public
 */
xiv.ui.ViewBoxTabs.prototype.deactivateAll = function () { 
    goog.array.forEach(this.getTabElements(), function(tabElt, i){
	this.deactivateTabElt_(tabElt);
    }.bind(this))

    goog.array.forEach(this.getTabPage(), function(tabCont, i){
	this.deactivateTabPage_(tabCont);
    }.bind(this))
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxTabs.prototype.updateStyle = function () {



    // Need to do this
    goog.dom.classes.add(this.getElement(), xiv.ui.ViewBoxTabs.ELEMENT_CLASS);


    var i = /**@type {!number}*/ 0;
    var tCount = /**@type {!number}*/ goog.object.getCount(this.Tabs_);
    var wPct = /**@type {!number}*/ 100/tCount; 
    var pHght = /**@type {!number}*/ pHght = /**@type {!number}*/ 
	    moka.style.dims(this.getElement().parentNode, 'height');
    var tabTop = parseInt(moka.style.getComputedStyle(this.getElement(), 
						      'top'), 10);
    window.console.log(tabTop);
    

    goog.object.forEach(this.Tabs_, function(tObj){

	// Resize tab wPcts
	moka.style.setStyle(tObj['tab'], {
	    'width': (wPct).toString() + '%',
	    'height' : this.tabHeight_,
	    'left': (wPct * i).toString() + '%',
	})

	// Exit out if no parent node.
	if (!this.getElement().parentNode){ return };

	    
	var contHeight = Math.floor(pHght - 
	    ((isNaN(tabTop) ? 0 : tabTop) + this.tabHeight_));
	
	var borderMgn = parseInt(moka.style.getComputedStyle(tObj['tab'], 
						'border-bottom-width'));
	borderMgn = (!borderMgn || isNaN(borderMgn) || 
		     !goog.isNumber(borderMgn)) ? 0 : borderMgn; 

	// Resize tab content height
	moka.style.setStyle(tObj['content'], {
	    'top': this.tabHeight_ - borderMgn,
	    'height': contHeight,
	})

	i++;
    }.bind(this))
}



/**
 * As sated.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.deactivateTabElt_ = function (tabElt) {
    goog.dom.classes.remove(tabElt, xiv.ui.ViewBoxTabs.ACTIVE_TAB_CLASS);
    goog.dom.classes.set(tabElt, xiv.ui.ViewBoxTabs.TAB_CLASS);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.deactivateTabPage_ = function (tabCont) {
    goog.dom.classes.set(tabCont, xiv.ui.ViewBoxTabs.TABPAGE_CLASS);
}




/**
 * Cycle through each tab, hightlighting the tab 
 * associated with ind, not hightlting the others.
 * @param {number} ind The reference active tab number.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.activateTabElt_ = function (ind) {
    window.console.log("ACTIVATE TAB ELT", ind);
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	if (i === ind) {
	    tab.setAttribute('isActive', true);
	    goog.dom.classes.add(tab, xiv.ui.ViewBoxTabs.ACTIVE_TAB_CLASS);
	}
    })	
}


/**
 * If there's an active tab, make the tab page border more prominent.
 * @param {number} ind The reference active tab number.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.activateTabPage_ = function (ind) {
    goog.array.forEach(this.getTabPage(), function(tabPage, i) {
	if (ind === i){
	    goog.dom.classes.add(tabPage, xiv.ui.ViewBoxTabs.ACTIVE_TABPAGE_CLASS);
	    //moka.fx.fadeInFromZero(tabPage, tabFadeIn);
	}	
    })	
}


/**
 * Clears all event listening callbacks for tabs.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.clearEventListeners_ = function(){
    goog.array.forEach(goog.dom.getElementsByClass(xiv.ui.ViewBoxTabs.TAB_CLASS, 
				this.getElement()), function(tab, i) { 
	goog.events.removeAll(tab);
    })
}



/**
 * Sets the default click events when a user clicks on a tab
 * (i.e. tab activation and tab deactivation).
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.setClickEvents_ = function() {
    // Cycle through each tab...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {
	    window.console.log("CLICK", i);
	    this.deactivateAll();
	    this['EVENTS'].runEvent('CLICKED', i);
	    this.activate(i);
	}.bind(this))
    }.bind(this))	
}



/**
 * As stated.
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} i The index of the tab.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.setTabMouseOver_ = function(tab, i) {
    goog.events.listen(tab, goog.events.EventType.MOUSEOVER, function() { 
	goog.dom.classes.add(tab, xiv.ui.ViewBoxTabs.HOVERED_TAB_CLASS);
	
	// Set TabIcon style change (opacity) -- applies whether active 
	// or inactive
	goog.array.forEach(goog.dom.getElementsByClass(
	    this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.add(icon, 
			xiv.ui.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
    }.bind(this))
}



/**
 * As stated.
 * @param {!Element} tab The tab to apply the event listener to.
 * @param {!number} i The index of the tab.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.setTabMouseOut_ = function(tab, i) {
    goog.events.listen(tab, goog.events.EventType.MOUSEOUT, function(e) { 
	goog.dom.classes.remove(tab, xiv.ui.ViewBoxTabs.HOVERED_TAB_CLASS);
	// TabIcon style change (opacity) -- applies whether active or inactive
	goog.array.forEach(goog.dom.getElementsByClass(
	    this.TABICON_CLASS, tab), function(icon){
		goog.dom.classes.remove(icon, 
				    xiv.ui.ViewBoxTabs.MOUSEOVER_TABICON_CLASS);
	    }.bind(this))
    }.bind(this))
}



/**
 * Sets the default hover events, such as highlighting, when
 * the mouse hover's over the tab.
 * @private
 */
xiv.ui.ViewBoxTabs.prototype.setHoverEvents_ = function() {
    // Cycle through each tab...
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	this.setTabMouseOver_(tab, i);
	this.setTabMouseOut_(tab, i);
    }.bind(this))	
}





