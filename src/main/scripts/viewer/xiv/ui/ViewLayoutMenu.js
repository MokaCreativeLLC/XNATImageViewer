/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.MenuButton');
goog.require('goog.style');
goog.require('goog.async.Delay');
goog.require('goog.ui.MenuItem');
goog.require('goog.array');
goog.require('goog.ui.Menu');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.fx');

// utils
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.fx');

// xiv
goog.require('moka.ui.Component');



/**
 * xiv.ui.ViewLayoutMenu allows viewers to toggle between
 * the anatamical view planes, 3D planes, and multiple
 * view planes of the viewable data.
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewLayoutMenu');
xiv.ui.ViewLayoutMenu = function () {	
    goog.base(this);
    this.getElement().title = 'Select View Plane';


    /**
     * @private
     * @type {Element}
     */
    this.menuHolder_ = goog.dom.createDom("div", {
	'id' : this.constructor.ID_PREFIX + 
	    '_Holder_' + goog.string.createUniqueString(),
	'class': xiv.ui.ViewLayoutMenu.MENUHOLDER_CLASS
    })
    goog.dom.append(this.getElement(), this.menuHolder_);


    /**
     * @private
     * @type {Element}
     */
    this.icon_ = goog.dom.createDom("img", {
	'id': this.constructor.ID_PREFIX + 
	    '_Icon_' + goog.string.createUniqueString(),
	'class': xiv.ui.ViewLayoutMenu.ICON_CLASS
    });	
    goog.dom.append(this.getElement(), this.icon_);


    /**
     * @private
     * @type {!goog.ui.Menu}
     */   
    this.menu_ = new goog.ui.Menu();
    this.menu_.setId('ViewLayoutMenu');


    /**
     * @private
     * @type {?Array.<goog.ui.MenuItem>}
     */
    this.menuItems_ = [];


    goog.array.forEach(xiv.ui.ViewLayoutMenu.Layouts, function(title, i){

	var item = new goog.ui.MenuItem(title)
	item.setId(title);
	this.menuItems_.push(item);
	this.menu_.addItem(item);
	

	// Adjust MenuItem class for the
	// image viewer's purposes.
	var childNodes = goog.dom.getElementsByClass('goog-menuitem-content', 
						     this.menu_.getElement());
	content = childNodes[i];
	goog.dom.classes.add(content, 
			     xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_CLASS);
	content.title = title;
	content.setAttribute('viewlayoutid', title);

	// Set the icon of the menu item (the anatomical 
	// plane.
	contentIcon = goog.dom.createDom("img", {
	    'id': "contentIcon_" + goog.string.createUniqueString(),
	    'class' : xiv.ui.ViewLayoutMenu.MENUITEM_ICON_CLASS
	});
	goog.dom.append(content, contentIcon);
    }.bind(this))
    this.menu_.render(this.menuHolder_);
    goog.dom.classes.add(this.menu_.getElement(), 
			 xiv.ui.ViewLayoutMenu.MENU_CLASS);


    //this.setMenuInteraction();  
    //this.setHighlightedIndex(0);
}
goog.inherits(xiv.ui.ViewLayoutMenu, moka.ui.Component);
goog.exportSymbol('xiv.ui.ViewLayoutMenu', xiv.ui.ViewLayoutMenu)




/**
 * @type {!Array.string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.Layouts  = [
    'SAGITTAL',
    'CORONAL',
    'TRANSVERSE',
    'THREE_D',
    'CONVENTIONAL',
    'FOUR_UP'
]





/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.ID_PREFIX =  'xiv.ui.ViewLayoutMenu';



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(xiv.ui.ViewLayoutMenu.ID_PREFIX.toLowerCase().
			   replace(/\./g,'-'));



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.ELEMENT_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX, '');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.MENUHOLDER_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menuholder');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.ICON_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX, 'icon');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.ICON_HOVERED_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.ICON_CLASS, 'hovered');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.MENU_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menu');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.CSS_CLASS_PREFIX, 'menuitem');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, 'highlight');



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewLayoutMenu.MENUITEM_ICON_CLASS = 
    goog.getCssName(xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, 'icon');




/**
 * @const
 * @type {number}
 */	
xiv.ui.ViewLayoutMenu.animationDuration = 700




/**
 * @const
 * @type {number}
 */	
xiv.ui.ViewLayoutMenu.mouseoutHide = 
    xiv.ui.ViewLayoutMenu.animationDuration + 800; 






/**
 * @type {string}
 */
xiv.ui.ViewLayoutMenu.prototype.prevViewLayout_ = undefined;




/**
 * @type {string}
 */
xiv.ui.ViewLayoutMenu.prototype.currViewLayout_ = undefined;




/**
 * @private
 * @type {boolean}
 */
xiv.ui.ViewLayoutMenu.prototype.menuVisible_ = false;





/**
 * @private
 * @type {?Array.<function>}
 */
xiv.ui.ViewLayoutMenu.prototype.selectMenuItemCallbacks_ = null;




/**
 * @type {function(function)}
 */
xiv.ui.ViewLayoutMenu.prototype.onMenuItemClicked = function(callback) {
    this.selectMenuItemCallbacks_.push(callback) 
}




/**
 * @type {function()}
 * @private
 */
xiv.ui.ViewLayoutMenu.prototype.clearCallbacks = function() {
    this.selectMenuItemCallbacks_ = [];
}




/**
 * Enacts the appropriate menu changes and calls 
 * the appropriate methods when a viewLayout is set. 
 * This is called when the user interacts with the menu.
 * @param {!String} viewLayout The view layout to set.
 */
xiv.ui.ViewLayoutMenu.prototype.setViewLayout = function(viewLayout) {
    var i = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ this.menuItems_.length;

    for (i=0; i < len; i++){
	if (this.menuItems_[i].getId().toLowerCase() === 
	    viewLayout.toLowerCase()) {

	    // Record the view layouts, previous and current.
	    this.prevViewLayout_ = this.currViewLayout_ ? 
		this.currViewLayout_ : viewLayout;
	    this.currViewLayout_ = viewLayout;

	    // Highlight / unhighlight the relevant menu items.
	    this.setHighlightedIndex(i);

	    // Run callbacks.
	    goog.array.forEach(this.selectMenuItemCallbacks_, 
			       function(callback){ callback(viewLayout)})
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
xiv.ui.ViewLayoutMenu.prototype.setMenuInteraction = function() {

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
	var delayTime = (opt_delay !==undefined) ? opt_delay : xiv.ui.ViewLayoutMenu.mouseoutHide;
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
	// the 'xiv.ui.ViewLayoutMenu.mouseoutHide limit'.
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
	    if (typeof opt_arg === 'boolean') {this.menuVisible_ = !opt_arg}


	    //
	    // 'opt_arg' could be the event (UI calling of method).
	    //
	    else { moka.dom.stopPropagation(opt_arg)}
	}
	this.menuVisible_ = !this.menuVisible_   

	
	//
	// Animate the menu in if it's visible.
	// Utilises the internal 'animateMenu' method.
	//
	if (this.menuVisible_){
	    goog.style.showElement(this.menuHolder_, this.menuVisible_);
	    this.animateMenu(hidePos, showPos);


	//
	// Animate the menu out if it's not visible.
	// Utilises the internal 'animateMenu' method.
	//
	} else {
	    this.animateMenu(showPos, hidePos, function(){
		goog.style.showElement(this.menuHolder_, this.menuVisible_);
	    });
	    suspendOtherClicks = false;
	}
    }.bind(this)



    //------------------
    // Onclick:  Show or hide the menu
    //------------------
    goog.events.listen(this.getElement(), goog.events.EventType.CLICK, function (event) {
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
    moka.style.setHoverClass(this.icon_, 
			      xiv.ui.ViewLayoutMenu.ICON_HOVERED_CLASS);



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


	moka.dom.stopPropagation(e);
	var selectedPlane = e.target.getId();
	window.console.log("HERE", selectedPlane);
	this.setViewLayout(selectedPlane);


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
xiv.ui.ViewLayoutMenu.prototype.setHighlightedIndex = function(index) {

   

    //------------------
    // Highlight the menuitem.
    //------------------
    var highlightContent = goog.dom.getElementByClass(xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_CLASS, this.menuItems_[index].getElement());
    goog.dom.classes.add(highlightContent, xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);



    //------------------
    // Change the icon as well (to white).
    //------------------
    var iconContent = goog.dom.getElementByClass(xiv.ui.ViewLayoutMenu.MENUITEM_ICON_CLASS, highlightContent);
    iconContent.src = iconContent.src;



    //------------------
    // Change main menu icon to the current
    // viewLayout.
    //------------------
    this.icon_.src = iconContent.src;



    //------------------
    // Adjust title.
    //------------------
    this.getElement().title  = "Select View Plane (" + highlightContent.getAttribute('viewlayoutid') + ")";



    //------------------
    // Unhighlight from other contents.
    //------------------
    var menuContents = goog.dom.getElementsByClass('goog-menuitem-content', this.menu_.getElement());
    for (var i = 0, len = menuContents.length; i < len; i++) {
	if (menuContents[i] !== highlightContent) {
	    goog.dom.classes.remove(menuContents[i], xiv.ui.ViewLayoutMenu.MENUITEM_CONTENT_HIGHLIGHT_CLASS);
	    iconContent = goog.dom.getElementByClass(xiv.ui.ViewLayoutMenu.MENUITEM_ICON_CLASS, menuContents[i]);
	}
    }
}




/**
 * @return {String}
 */
xiv.ui.ViewLayoutMenu.prototype.getSelectedViewLayout = function(viewLayout) {
    return this.currViewLayout_;
}




/**
 * Animates the position and opacity of the xiv.ui.ViewLayout menu
 * (i.e. slides it and fades it in/out)/
 *
 * @param {Array.<number>, Array.<number>, function=}
 */
xiv.ui.ViewLayoutMenu.prototype.animateMenu  = function (startPos, endPos, opt_callback) {
    //moka.dom.debug("Animate!");

    var animQueue = new goog.fx.AnimationParallelQueue();
    var easing = goog.fx.easing.easeOut;



    //------------------
    // Fade in when moving in the realm of the viewer
    //------------------
    if (startPos[0] < endPos[0]) {
	moka.fx.fadeInFromZero(this.menuHolder_, 
				xiv.ui.ViewLayoutMenu.animationDuration);
    } else {
	easing = goog.fx.easing.easeIn;
	moka.fx.fadeOut(this.menuHolder_, xiv.ui.ViewLayoutMenu.animationDuration);
    }



    //------------------
    // Define Slide animation
    //------------------
    var slide = new goog.fx.dom.Slide(this.menuHolder_, 
		startPos, endPos, xiv.ui.ViewLayoutMenu.animationDuration, easing)



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
