/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes.
 */
goog.require('goog.ui.MenuButton');
goog.require('goog.style');
goog.require('goog.async.Delay');
goog.require('goog.ui.MenuItem');
goog.require('goog.array');
goog.require('goog.ui.Menu');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.fx');

/**
 * utils includes.
 */
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.fx');

/**
 * xiv includes
 */
goog.require('xiv');
goog.require('xiv.Widget');



/**
 * xiv.ViewLayoutMenu allows viewers to toggle between
 * the anatamical view planes, 3D planes, and multiple
 * view planes of the viewable data.
 *
 * @constructor
 * @param {!Object.<string, xiv.ViewLayout>}
 * @extends {xiv.Widget}
 */
goog.provide('xiv.ViewLayoutMenu');
xiv.ViewLayoutMenu = function (viewLayouts) {
  		
    xiv.Widget.call(this, 'xiv.ViewLayoutMenu');
    var that = this;
    this.viewLayouts_ = viewLayouts;

    

    //------------------
    // Define the element, and apply its class
    //------------------
    this.element.title  = "Select View Plane";
    goog.dom.classes.set(this.element, xiv.ViewLayoutMenu.ELEMENT_CLASS);



    //------------------
    // Define MenuHolder element, and apply its class.
    //------------------
    this.menuHolder_ = utils.dom.makeElement("div", this.element, "shortMenuDiv")
    goog.dom.classes.set(this.menuHolder_, xiv.ViewLayoutMenu.MENUHOLDER_CLASS);



    //------------------
    // Define the icon of the menu and apply its class.
    //------------------
    this.icon_ = utils.dom.makeElement("img", this.element, "menuIcon");	
    this.icon_.src = xiv.ICON_URL + "ViewLayoutMenu/Menu.png";
    goog.dom.classes.set(this.icon_, xiv.ViewLayoutMenu.ICON_CLASS);

    

    //------------------
    // Establish the closure menu
    //------------------
    this.menu_ = new goog.ui.Menu();
    this.menu_.setId('viewLayoutClosureMenu');
   

    
    //------------------
    // Clear Callbacks
    //------------------
    this.clearCallbacks();



    //------------------
    // Clear objects and arrays.
    //------------------
    this.menuItems_ = [];
    this.selectMenuItemCallbacks_ = [];



    //------------------
    // Add Menu Items (i.e. the view plane selectors) to menu.
    //------------------
    var i = 0;
    for (key in this.viewLayouts_) {


	//
	// Add MenuItem (a closure class)
	//
	var title = this.viewLayouts_[key].title;
	if (title === 'none') continue;
	var item = new goog.ui.MenuItem(title)
	item.setId(title);
	this.menuItems_.push(item);
	this.menu_.addItem(item);
	

	//
	// Adjust MenuItem class for the
	// image viewer's purposes.
	//
	var childNodes = goog.dom.getElementsByClass('goog-menuitem-content', this.menu_.element_);
	content = childNodes[i];
	goog.dom.classes.add(content, xiv.ViewLayoutMenu.MENUITEM_CONTENT_CLASS);
	content.title = title;
	content.setAttribute('viewlayoutid', title);


	//
	// Set the icon of the menu item (the anatomical 
	// plane.
	//
	contentIcon = utils.dom.makeElement("img", content, "contentIcon");
	contentIcon.src = this.viewLayouts_[key]['src'];
	goog.dom.classes.add(contentIcon, xiv.ViewLayoutMenu.MENUITEM_ICON_CLASS);

	i++;
    }
    this.menu_.render(this.menuHolder_);
    goog.dom.classes.add(this.menu_.element_, xiv.ViewLayoutMenu.MENU_CLASS);



    //------------------
    // Menu Interaction
    //------------------
    this.setMenuInteraction();  
  


    //------------------
    // Set default highlighted index of the menu.
    //------------------
    this.setHighlightedIndex(0);



    //------------------
    // Hide menu
    //------------------
    goog.style.showElement(this.menuHolder_, false);
}
goog.inherits(xiv.ViewLayoutMenu, xiv.Widget);
goog.exportSymbol('xiv.ViewLayoutMenu', xiv.ViewLayoutMenu)




xiv.ViewLayoutMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewlayoutmenu');
xiv.ViewLayoutMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.CSS_CLASS_PREFIX, '');
xiv.ViewLayoutMenu.MENUHOLDER_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menuholder');
xiv.ViewLayoutMenu.ICON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.CSS_CLASS_PREFIX, 'icon');
xiv.ViewLayoutMenu.ICON_HOVERED_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.ICON_CLASS, 'hovered');
xiv.ViewLayoutMenu.MENU_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menu');
xiv.ViewLayoutMenu.MENUITEM_CONTENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menuitem');
xiv.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, 'highlight');
xiv.ViewLayoutMenu.MENUITEM_ICON_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, 'icon');




/**
 * @const
 * @type {number}
 */	
xiv.ViewLayoutMenu.animationDuration = 700




/**
 * @const
 * @type {number}
 */	
xiv.ViewLayoutMenu.mouseoutHide = xiv.ViewLayoutMenu.animationDuration + 800; 




/**
 * @private
 * @type {Element}
 */	
xiv.ViewLayoutMenu.prototype.menuHolder_ = undefined; 




/**
 * @private
 * @type {Element}
 */	
xiv.ViewLayoutMenu.prototype.icon_ = undefined;;




/**
 * Closure menu
 *
 * @type {goog.ui.Menu}
 * @private
 */
xiv.ViewLayoutMenu.prototype.menu_ = undefined;




/**
 * @type {string}
 */
xiv.ViewLayoutMenu.prototype.prevViewLayout_ = undefined;




/**
 * @type {string}
 */
xiv.ViewLayoutMenu.prototype.currViewLayout_ = undefined;




/**
 * @private
 * @type {boolean}
 */
xiv.ViewLayoutMenu.prototype.menuVisible_ = false;



/**
 * @private
 * @type {?Object.<string, xiv.ViewLayout>}
 */
xiv.ViewLayoutMenu.prototype.viewLayouts_ = null;




/**
 * @private
 * @type {?Array.<goog.ui.MenuItem>}
 */
xiv.ViewLayoutMenu.prototype.menuItems_ = null;




/**
 * @private
 * @type {?Array.<function>}
 */
xiv.ViewLayoutMenu.prototype.selectMenuItemCallbacks_ = null;




/**
 * @type {function(function)}
 */
xiv.ViewLayoutMenu.prototype.onMenuItemClicked = function(callback) {
    this.selectMenuItemCallbacks_.push(callback) 
}




/**
 * @type {function()}
 * @private
 */
xiv.ViewLayoutMenu.prototype.clearCallbacks = function() {
    this.selectMenuItemCallbacks_ = [];
}




/**
 * Enacts the appropriate menu changes and calls 
 * the appropriate methods when a viewLayout is set. 
 * This is called when the user interacts with the menu.
 *
 * @param {!String} viewLayout
 */
xiv.ViewLayoutMenu.prototype.setViewLayout = function(viewLayout) {
    for (var i=0, len = this.menuItems_.length; i < len; i++){
	if (this.menuItems_[i].getId().toLowerCase() === viewLayout.toLowerCase()) {

	    // Record the view layouts, previous and current.
	    this.prevViewLayout_ = this.currViewLayout_ ? this.currViewLayout_ : viewLayout;
	    this.currViewLayout_ = viewLayout;

	    // Highlight / unhighlight the relevant menu items.
	    this.setHighlightedIndex(i);

	    // Run callbacks.
	    goog.array.forEach(this.selectMenuItemCallbacks_, function(callback){ callback(viewLayout)})
	    break;
	}
    }
}




/**
 * Manages the menu interaction EVENTS related to 
 * clicking and hovering over certain menu elements.
 * Calls on the internal 'animateMenu' method for the
 * slide and fade aspects.
 */
xiv.ViewLayoutMenu.prototype.setMenuInteraction = function() {
    var that = this;
    var isHovered = false;
    var delay = /** @type {?goog.async.Delay)}*/ null;
    var mouseoutDate = /** @type {?number}*/ null;
    var hidePos = [-200,25];
    var showPos = [-5,25]; 
    var suspendOtherClicks = false;



    //------------------
    // Countdown method after the user opens the 
    // menu.
    //------------------
    var closeCountdown = function(opt_delay) {
	var dateObj = new Date();
	var delayTime = (opt_delay !==undefined) ? opt_delay : xiv.ViewLayoutMenu.mouseoutHide;
	mouseoutDate = dateObj.getTime();
	delay = new goog.async.Delay(function(){ determineMenuHideable(delayTime) }, delayTime);
	delay.start();
    }



    //------------------
    // Checks if the menu is at a hideable state based
    // on the timer mechanism or the mouseHover.
    //------------------   
    var determineMenuHideable = function(delayTime) {

	//
	// Close menu when 1) not hovered, 2) the delay of mouseout is greater than 
	// the 'xiv.ViewLayoutMenu.mouseoutHide limit'.
	//
	var dateObj = new Date();
	if (!isHovered && ((dateObj.getTime() - mouseoutDate) >= delayTime)) { toggleMenu(false);}
    }



    //------------------
    // Define the 'toggleMenu' method (show or hide by
    // positioning (slide) and fading accordingly.)
    //------------------
    var toggleMenu = function(opt_arg){
	if (opt_arg !== undefined) {


	    //
	    // 'opt_arg' could be a boolean (programmatic calling of method).
	    //
	    if (typeof opt_arg === 'boolean') {that.menuVisible_ = !opt_arg}


	    //
	    // 'opt_arg' could be the event (UI calling of method).
	    //
	    else { utils.dom.stopPropagation(opt_arg)}
	}
	that.menuVisible_ = !that.menuVisible_   

	
	//
	// Animate the menu in if it's visible.
	// Utilises the internal 'animateMenu' method.
	//
	if (that.menuVisible_){
	    goog.style.showElement(that.menuHolder_, that.menuVisible_);
	    that.animateMenu(hidePos, showPos);


	//
	// Animate the menu out if it's not visible.
	// Utilises the internal 'animateMenu' method.
	//
	} else {
	    that.animateMenu(showPos, hidePos, function(){
		goog.style.showElement(that.menuHolder_, that.menuVisible_);
	    });
	    suspendOtherClicks = false;
	}
    }



    //------------------
    // Onclick:  Show or hide the menu
    //------------------
    goog.events.listen(this.element, goog.events.EventType.CLICK, function (event) {
	if (!suspendOtherClicks){
	    toggleMenu(event);
	    closeCountdown(2500);
	}
    });



    //------------------
    // Mouseover / Mouseout hover over a menuItem.
    //------------------
    goog.events.listen(this.menuHolder_, goog.events.EventType.MOUSEOVER, function (event) {
	isHovered = true;
    });
    goog.events.listen(this.menuHolder_, goog.events.EventType.MOUSEOUT, function (event) {
	isHovered = false;
	closeCountdown();
    });



    //------------------
    // Mouseover / Mouseout hover over the main icon.
    //------------------
    utils.style.setHoverClass(this.icon_, xiv.ViewLayoutMenu.ICON_HOVERED_CLASS);



    //------------------
    // Onclick: Menu items (i.e. the view planes) - select
    // the view planes.
    //------------------
    goog.events.listen(this.menu_, 'action', function(e) {

	//
	// Still propagates to the menu, that's why we have this
	// variable.
	//
	suspendOtherClicks = true;


	utils.dom.stopPropagation(e);
	var selectedPlane = e.target.getId();
	that.setViewLayout(selectedPlane);


	//
	// We set this to false because we want the menu
	// to go away if the user lingers on the clicked menu item.
	//
	isHovered = false;
	closeCountdown(700);
    });  
}



/**
 * Highlights the appropriate menuItem after the user 
 * has clicked on it, unhighlights the rest.
 *
 * @param {!number}
 */
xiv.ViewLayoutMenu.prototype.setHighlightedIndex = function(index) {
    var that = this;
    
   

    //------------------
    // Highlight the menuitem.
    //------------------
    var highlightContent = goog.dom.getElementByClass(xiv.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, this.menuItems_[index].element_);
    goog.dom.classes.add(highlightContent, xiv.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);



    //------------------
    // Change the icon as well (to white).
    //------------------
    var iconContent = goog.dom.getElementByClass(xiv.ViewLayoutMenu.MENUITEM_ICON_CLASS, highlightContent);
    iconContent.src = iconContent.src;



    //------------------
    // Change main menu icon to the current
    // viewLayout.
    //------------------
    this.icon_.src = iconContent.src;



    //------------------
    // Adjust title.
    //------------------
    this.element.title  = "Select View Plane (" + highlightContent.getAttribute('viewlayoutid') + ")";



    //------------------
    // Unhighlight from other contents.
    //------------------
    var menuContents = goog.dom.getElementsByClass('goog-menuitem-content', this.menu_.element_);
    for (var i = 0, len = menuContents.length; i < len; i++) {
	if (menuContents[i] !== highlightContent) {
	    goog.dom.classes.remove(menuContents[i], xiv.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);
	    iconContent = goog.dom.getElementByClass(xiv.ViewLayoutMenu.MENUITEM_ICON_CLASS, menuContents[i]);
	}
    }
}




/**
 * @return {String}
 */
xiv.ViewLayoutMenu.prototype.getSelectedViewLayout = function(viewLayout) {
    return this.currViewLayout_;
}




/**
 * Animates the position and opacity of the xiv.ViewLayout menu
 * (i.e. slides it and fades it in/out)/
 *
 * @param {Array.<number>, Array.<number>, function=}
 */
xiv.ViewLayoutMenu.prototype.animateMenu  = function (startPos, endPos, opt_callback) {
    //utils.dom.debug("Animate!");
    var that = this;
    var animQueue = new goog.fx.AnimationParallelQueue();
    var easing = goog.fx.easing.easeOut;



    //------------------
    // Fade in when moving in the realm of the viewer
    //------------------
    if (startPos[0] < endPos[0]) {
	utils.fx.fadeInFromZero(this.menuHolder_, xiv.ViewLayoutMenu.animationDuration);
    } else {
	easing = goog.fx.easing.easeIn;
	utils.fx.fadeOut(this.menuHolder_, xiv.ViewLayoutMenu.animationDuration);
    }



    //------------------
    // Define Slide animation
    //------------------
    var slide = new goog.fx.dom.Slide(this.menuHolder_, startPos, endPos, xiv.ViewLayoutMenu.animationDuration, easing)



    //------------------
    // End Callback
    //------------------
    goog.events.listen(animQueue, 'end', function() {
	if (opt_callback) { opt_callback() };
    })



    //------------------
    // Play animation.
    //------------------
    animQueue.add(slide);
    animQueue.play();


}
