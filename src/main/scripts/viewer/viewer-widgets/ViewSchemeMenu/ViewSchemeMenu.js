/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuButton');
goog.require('goog.dom');

/**
 * utils includes
 */
goog.require('XnatViewerWidget');
goog.require('XnatViewerGlobals');

/**
 * viewer-widget includes
 */



/**
 * ViewSchemeMenu allows viewers to toggle between
 * the anatamical view planes, 3D planes, and multiple
 * view planes of the viewable data.
 *
 * @constructor
 * @param {!Object.<string, ViewScheme>, Object=}
 * @extends {XnatViewerWidget}
 */
goog.provide('ViewSchemeMenu');
ViewSchemeMenu = function (viewSchemes, opt_args) {
  		
    XnatViewerWidget.call(this, utils.dom.mergeArgs(opt_args, {'id' : 'ViewSchemeMenu'}));
    var that = this;
    this.viewSchemes_ = viewSchemes;

    

    //------------------
    // Define the _element, and apply its class
    //------------------
    this._element.title  = "Select View Plane";
    goog.dom.classes.set(this._element, ViewSchemeMenu.ELEMENT_CLASS);



    //------------------
    // Define MenuHolder element, and apply its class.
    //------------------
    this.menuHolder_ = utils.dom.makeElement("div", this._element, "shortMenuDiv")
    goog.dom.classes.set(this.menuHolder_, ViewSchemeMenu.MENUHOLDER_CLASS);



    //------------------
    // Define the icon of the menu and apply its class.
    //------------------
    this.icon_ = utils.dom.makeElement("img", this._element, "menuIcon");	
    this.icon_.src = XnatViewerGlobals.ICON_URL + "ViewSchemeMenu/Menu.png";
    goog.dom.classes.set(this.icon_, ViewSchemeMenu.ICON_CLASS);

    

    //------------------
    // Establish the closure menu
    //------------------
    this.menu_ = new goog.ui.Menu();
    this.menu_.setId('viewSchemeClosureMenu');
   

    
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
    for (key in this.viewSchemes_) {


	//
	// Add MenuItem (a closure class)
	//
	var title = this.viewSchemes_[key].title;
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
	goog.dom.classes.add(content, ViewSchemeMenu.MENUITEM_CONTENT_CLASS);
	content.title = title;
	content.setAttribute('viewschemeid', title);


	//
	// Set the icon of the menu item (the anatomical 
	// plane.
	//
	contentIcon = utils.dom.makeElement("img", content, "contentIcon");
	contentIcon.src = this.viewSchemes_[key]['src'];
	goog.dom.classes.add(contentIcon, ViewSchemeMenu.MENUITEM_ICON_CLASS);

	i++;
    }
    this.menu_.render(this.menuHolder_);
    goog.dom.classes.add(this.menu_.element_, ViewSchemeMenu.MENU_CLASS);



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
goog.inherits(ViewSchemeMenu, XnatViewerWidget);
goog.exportSymbol('ViewSchemeMenu', ViewSchemeMenu)




ViewSchemeMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewschememenu');
ViewSchemeMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.CSS_CLASS_PREFIX, '');
ViewSchemeMenu.MENUHOLDER_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.CSS_CLASS_PREFIX, 'menuholder');
ViewSchemeMenu.ICON_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.CSS_CLASS_PREFIX, 'icon');
ViewSchemeMenu.ICON_HOVERED_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.ICON_CLASS, 'hovered');
ViewSchemeMenu.MENU_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.CSS_CLASS_PREFIX, 'menu');
ViewSchemeMenu.MENUITEM_CONTENT_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.CSS_CLASS_PREFIX, 'menuitem');
ViewSchemeMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.MENUITEM_CONTENT_CLASS, 'highlight');
ViewSchemeMenu.MENUITEM_ICON_CLASS = /**@type {string} @const*/ goog.getCssName(ViewSchemeMenu.MENUITEM_CONTENT_CLASS, 'icon');




/**
 * @const
 * @type {number}
 */	
ViewSchemeMenu.animationDuration = 700




/**
 * @const
 * @type {number}
 */	
ViewSchemeMenu.mouseoutHide = ViewSchemeMenu.animationDuration + 800; 




/**
 * @private
 * @type {Element}
 */	
ViewSchemeMenu.prototype.menuHolder_ = undefined; 




/**
 * @private
 * @type {Element}
 */	
ViewSchemeMenu.prototype.icon_ = undefined;;




/**
 * Closure menu
 *
 * @type {goog.ui.Menu}
 * @private
 */
ViewSchemeMenu.prototype.menu_ = undefined;




/**
 * @type {string}
 */
ViewSchemeMenu.prototype.prevViewScheme_ = undefined;




/**
 * @type {string}
 */
ViewSchemeMenu.prototype.currViewScheme_ = undefined;




/**
 * @private
 * @type {boolean}
 */
ViewSchemeMenu.prototype.menuVisible_ = false;



/**
 * @private
 * @type {?Object.<string, ViewScheme>}
 */
ViewSchemeMenu.prototype.viewSchemes_ = null;




/**
 * @private
 * @type {?Array.<goog.ui.MenuItem>}
 */
ViewSchemeMenu.prototype.menuItems_ = null;




/**
 * @private
 * @type {?Array.<function>}
 */
ViewSchemeMenu.prototype.selectMenuItemCallbacks_ = null;




/**
 * @type {function(function)}
 */
ViewSchemeMenu.prototype.onMenuItemClicked = function(callback) {
    this.selectMenuItemCallbacks_.push(callback) 
}




/**
 * @type {function()}
 * @private
 */
ViewSchemeMenu.prototype.clearCallbacks = function() {
    this.selectMenuItemCallbacks_ = [];
}




/**
 * Enacts the appropriate menu changes and calls 
 * the appropriate methods when a viewScheme is set. 
 * This is called when the user interacts with the menu.
 *
 * @param {!String}
 */
ViewSchemeMenu.prototype.setViewScheme = function(viewScheme) {
    var that = this;

    
    for (var i=0, len = this.menuItems_.length; i < len; i++){

	//------------------
	// Match the viewScheme string with the menuItem.
	//------------------
	if (this.menuItems_[i].getId().toLowerCase() === viewScheme.toLowerCase()) {

	    //
	    // Record the view schemes, previous and current.
	    //
	    that.prevViewScheme_ = that.currViewScheme_ ? that.currViewScheme_ : viewScheme;
	    that.currViewScheme_ = viewScheme;


	    //
	    // Highlight / unhighlight the relevant menu items.
	    //
	    this.setHighlightedIndex(i);


	    //
	    // Run callbacks.
	    //
	    goog.array.forEach(that.selectMenuItemCallbacks_, function(callback){ callback(viewScheme)})
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
ViewSchemeMenu.prototype.setMenuInteraction = function() {
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
	var delayTime = (opt_delay !==undefined) ? opt_delay : ViewSchemeMenu.mouseoutHide;
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
	// the 'ViewSchemeMenu.mouseoutHide limit'.
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
    goog.events.listen(this._element, goog.events.EventType.CLICK, function (event) {
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
    utils.style.setHoverClass(this.icon_, ViewSchemeMenu.ICON_HOVERED_CLASS);



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
	that.setViewScheme(selectedPlane);


	//
	// We set this to false because we want the menu
	// to go away if the user lingers on the clicked menu item.
	//
	isHovered = false;
	closeCountdown(1000);
    });  
}



/**
 * Highlights the appropriate menuItem after the user 
 * has clicked on it, unhighlights the rest.
 *
 * @param {!number}
 */
ViewSchemeMenu.prototype.setHighlightedIndex = function(index) {
    var that = this;
    
   

    //------------------
    // Highlight the menuitem.
    //------------------
    var highlightContent = goog.dom.getElementByClass(ViewSchemeMenu.MENUITEM_CONTENT_CLASS, this.menuItems_[index].element_);
    goog.dom.classes.add(highlightContent, ViewSchemeMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);



    //------------------
    // Change the icon as well (to white).
    //------------------
    var iconContent = goog.dom.getElementByClass(ViewSchemeMenu.MENUITEM_ICON_CLASS, highlightContent);
    iconContent.src = iconContent.src;



    //------------------
    // Change main menu icon to the current
    // viewScheme.
    //------------------
    this.icon_.src = iconContent.src;



    //------------------
    // Adjust title.
    //------------------
    this._element.title  = "Select View Plane (" + highlightContent.getAttribute('viewschemeid') + ")";



    //------------------
    // Unhighlight from other contents.
    //------------------
    var menuContents = goog.dom.getElementsByClass('goog-menuitem-content', this.menu_.element_);
    for (var i = 0, len = menuContents.length; i < len; i++) {
	if (menuContents[i] !== highlightContent) {
	    goog.dom.classes.remove(menuContents[i], ViewSchemeMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);
	    iconContent = goog.dom.getElementByClass(ViewSchemeMenu.MENUITEM_ICON_CLASS, menuContents[i]);
	}
    }
}




/**
 * @return {String}
 */
ViewSchemeMenu.prototype.getSelectedViewScheme = function(viewScheme) {
    return this.currViewScheme_;
}




/**
 * Animates the position and opacity of the ViewScheme menu
 * (i.e. slides it and fades it in/out)/
 *
 * @param {Array.<number>, Array.<number>, function=}
 */
ViewSchemeMenu.prototype.animateMenu  = function (startPos, endPos, opt_callback) {
    //utils.dom.debug("Animate!");
    var that = this;
    var animQueue = new goog.fx.AnimationParallelQueue();
    var easing = goog.fx.easing.easeOut;



    //------------------
    // Fade in when moving in the realm of the viewer
    //------------------
    if (startPos[0] < endPos[0]) {
	utils.fx.fadeInFromZero(this.menuHolder_, ViewSchemeMenu.animationDuration);
    } else {
	easing = goog.fx.easing.easeIn;
	utils.fx.fadeOut(this.menuHolder_, ViewSchemeMenu.animationDuration);
    }



    //------------------
    // Define Slide animation
    //------------------
    var slide = new goog.fx.dom.Slide(this.menuHolder_, startPos, endPos, ViewSchemeMenu.animationDuration, easing)



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
