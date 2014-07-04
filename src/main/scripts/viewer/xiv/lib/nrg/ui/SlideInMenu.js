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
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.Animation');
goog.require('goog.dom.classes');
goog.require('goog.fx.dom.FadeIn');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.easing');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.object');
goog.require('goog.Timer');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.fx');
goog.require('nrg.ui');




/**
 * nrg.ui.SlideInMenu is a menu that appears on user hovering over an icon.
 * It then rotates the icon of the menu based on the item selected.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('nrg.ui.SlideInMenu');
nrg.ui.SlideInMenu = function () {	
    goog.base(this);


    /**
     * @private
     * @type {Object.<string, nrg.ui.SlideInMenu.menuItemCollection>}
     */
    this.menuItems_ = {};



    /**
     * @private
     * @type {Element}
     */
    this.holder_ = goog.dom.createDom("div", {
	'id' : this.constructor.ID_PREFIX + 
	    '_Holder_' + goog.string.createUniqueString(),
	'class': nrg.ui.SlideInMenu.CSS.MENUHOLDER
    })
    goog.dom.append(this.getElement(), this.holder_);


    /**
     * @private
     * @type {Element}
     */
    this.icon_ = goog.dom.createDom("img", {
	'id': this.constructor.ID_PREFIX + 
	    '_Icon_' + goog.string.createUniqueString(),
	'class': nrg.ui.SlideInMenu.CSS.ICON
    });	
    goog.dom.append(this.getElement(), this.icon_);


    /**
     * @private
     * @type {!goog.ui.Menu}
     */   
    this.menu_ = new goog.ui.Menu();


    /**
     * @private
     * @type {!goog.fx.AnimationParallelQueue}
     */
    this.animQueue_ =  new goog.fx.AnimationParallelQueue();


    /**
     * @private
     * @type {!Array.<goog.fx.Animation>}
     */
    this.anims_ =  [];

    //
    // Events
    //
    this.setMenuEvents_(); 

    //
    // Hide the menu initially
    //
    this.hideMenu(undefined, 0);

    //
    // Render the menu in the holder
    //
    this.menu_.render(this.holder_); 

    //
    // must come after the render
    //
    goog.dom.classes.add(this.menu_.getElement(), 
			 nrg.ui.SlideInMenu.CSS.MENU);
}
goog.inherits(nrg.ui.SlideInMenu, nrg.ui.Component);
goog.exportSymbol('nrg.ui.SlideInMenu', nrg.ui.SlideInMenu)



/**
 * @type {!string} 
 * @const
*/
nrg.ui.SlideInMenu.ID_PREFIX =  'nrg.ui.SlideInMenu';



/**
 * @enum {string}
 * @public
 */
nrg.ui.SlideInMenu.EventType = {
    ITEM_SELECTED: 'item_selected',
};



/**
 * @enum {string}
 * @public
 */
nrg.ui.SlideInMenu.CSS_SUFFIX = {
    ICON: 'icon',
    ICON_HOVERED: 'icon-hovered',
    MENU: 'menu',
    MENUHOLDER: 'menuholder',
    MENUITEM: 'menuitem',
    MENUITEM_HIGHLIGHT: 'menuitem-highlight',
    MENUITEM_ICON: 'menuitem-icon'
};



/**
 * @type {!Object}
 * @public
 */
nrg.ui.SlideInMenu.menuItemCollection = {
    ITEM : null,
    CONTENT: null,
    ICON: null
}



/**
 * @const
 * @type {number}
 */	
nrg.ui.SlideInMenu.FADE_OUT_COUNTDOWN = 450;



/**
 * @const
 * @type {number}
 */	
nrg.ui.SlideInMenu.ANIM_LEN_IN = 500;



/**
 * @const
 * @type {number}
 */	
nrg.ui.SlideInMenu.ANIM_LEN_OUT = 700;



/**
 * @const
 * @type {number}
 */	
nrg.ui.SlideInMenu.MOUSEOUT_HIDE = 
    nrg.ui.SlideInMenu.ANIM_LEN_OUT + 800; 



/**
 * Animates the position and opacity of the xiv.ui.SelectedItem menu
 * (i.e. slides it and fades it in/out).
 *
 * @param {!Element} elt
 * @param {!Array.number} startPos
 * @param {!Array.number} endPos
 * @param {number=} opt_animTime
 */
nrg.ui.SlideInMenu.createAnimIn_  = 
function (elt, startPos, endPos, opt_animTime) {
    opt_animTime = goog.isDef(opt_animTime) ? opt_animTime : 
	nrg.ui.SlideInMenu.ANIM_LEN_IN;
    return [new goog.fx.dom.FadeIn(elt, opt_animTime),
	    new goog.fx.dom.Slide(elt, startPos, endPos, opt_animTime, 
				  goog.fx.easing.easeOut)];
}



/**
 * Animates the position and opacity of the xiv.ui.SelectedItem menu
 * (i.e. slides it and fades it in/out).
 *
 * @param {!Element} elt
 * @param {!Array.number} startPos
 * @param {!Array.number} endPos
 * @param {number=} opt_animTime
 */
nrg.ui.SlideInMenu.createAnimOut_  =
function (elt, startPos, endPos, opt_animTime) {
    opt_animTime = goog.isDef(opt_animTime) ? opt_animTime : 
	nrg.ui.SlideInMenu.ANIM_LEN_OUT;
    return [new goog.fx.dom.FadeOut(elt, opt_animTime),
	    new goog.fx.dom.Slide(elt, startPos, endPos, 
	        opt_animTime, goog.fx.easing.easeOut)];
}




/**
 * @type {string}
 */
nrg.ui.SlideInMenu.prototype.prevSelectedItem_ = undefined;



/**
 * @type {string}
 */
nrg.ui.SlideInMenu.prototype.currSelectedItem_ = undefined;



/**
 * @private
 * @type {boolean}
 */
nrg.ui.SlideInMenu.prototype.menuVisible_ = false;



/**
 * @private
 * @type {!Array.number}
 */
nrg.ui.SlideInMenu.prototype.hidePos_ = [-100, -100];



/**
 * @private
 * @type {!Array.number}
 */
nrg.ui.SlideInMenu.prototype.showPos_ = [0, 0];



/**
 * @param {!boolean} bool
 * @private
 */
nrg.ui.SlideInMenu.prototype.matchMenuIconToSelected_ = true;



/**
 * @param {!boolean} bool
 * @private
 */
nrg.ui.SlideInMenu.prototype.matchMenuTitleToSelected_ = true;



/**
 * @param {!number} x
 * @param {!number} y
 * @public
 */
nrg.ui.SlideInMenu.prototype.setHidePosition = function(x, y) {
    return this.hidePos_ = [x, y];
}



/**
 * @param {!number} x
 * @param {!number} y
 * @public
 */
nrg.ui.SlideInMenu.prototype.setShowPosition = function(x, y) {
    return this.showPos_ = [x, y];
}



/**
 * @return {!Array.number}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getHidePosition = function(src) {
    return this.hidePos_;
}


/**
 * @return {!Array.number}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getShowPosition = function(src) {
    return this.showPos_;
}


/**
 * @return {!Element}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getMenu = function() {
    return this.menu_;
}


/**
 * @return {!Element}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getMenuHolder = function() {
    return this.holder_;
}



/**
 * @return {!Element}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getMenuIcon = function() {
    return this.icon_;
}



/**
 * @param {!string} src
 * @public
 */
nrg.ui.SlideInMenu.prototype.setMenuIconSrc = function(src) {
    this.icon_.src = src;
}



/**
 * @param {!string} title
 * @public
 */
nrg.ui.SlideInMenu.prototype.setMenuItemIconSrc = function(title, src) {
    this.menuItems_[title].ICON.src = src;
}



/**
 * @param {!string} The title.
 * @return {!number}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getIndexFromTitle = function(title) {
    //window.console.log(this.menuItems_);
    return goog.object.getKeys(this.menuItems_).indexOf(title);
}



/**
 * @param {!string} ind The index.
 * @return {!number}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getTitleFromIndex = function(index) {
    return goog.object.getKeys(this.menuItems_)[index];
}



/**
 * @param {!number} ind The index.
 * @return {nrg.ui.menuItemcollection}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getItemCollectionFromIndex = function(ind) {
    return this.menuItems_[goog.object.getKeys(this.menuItems_)[ind]];
}



/**
 * @param {!boolean} bool
 * @public
 */
nrg.ui.SlideInMenu.prototype.matchMenuIconToSelected = function(bool) {
    return this.matchMenuIconToSelected_ = bool;
}



/**
 * @param {!boolean} bool
 * @public
 */
nrg.ui.SlideInMenu.prototype.matchMenuTitleToSelected = function(bool) {
    return this.matchMenuTitleToSelected_ = bool;
}



/**
 * @return {string}
 * @public
 */
nrg.ui.SlideInMenu.prototype.getSelectedMenuItem = function() {
    return this.currSelectedItem_;
}


/**
 * @private
 */
nrg.ui.SlideInMenu.prototype.clearAnimQueue_ = function(){
    if (!goog.isDefAndNotNull(this.animQueue_)) { return }

    //
    // Stop the queue
    //
    this.animQueue_.stop();

    //
    // Dispose and remove the old/existing animations
    //
    goog.array.forEach(this.anims_, function(anim){
	this.animQueue_.remove(anim);
	anim.dispose();
    }.bind(this))

    //
    // Clear the anims_ array
    //
    goog.array.clear(this.anims_);
}



/**
 * Animates the position and opacity of the xiv.ui.SelectedItem menu
 * (i.e. slides it and fades it in/out)/
 *
 * @param {!Array.<goog.fx.Animation> | !goog.fx.Animation} anims
 * @param {Function=} opt_callback
 */
nrg.ui.SlideInMenu.prototype.runAnimations_  = function (anims, opt_callback) {
    //
    // Clear the current anim queue
    //
    this.clearAnimQueue_();

    //
    // Store the current anims
    //
    goog.array.forEach(goog.isArray(anims) ? anims : [anims], function(anim){
	this.animQueue_.add(anim);
	this.anims_.push(anim);
    }.bind(this)) 

    //
    // Make sure the holder is visible before running the anims
    //
    this.holder_.style.visibility = 'visible';

    //
    // Set the events
    //
    goog.events.listenOnce(this.animQueue_, goog.fx.Animation.EventType.END, 
	function(e) {
	    if (opt_callback) { opt_callback() };
	}.bind(this))


    //
    // Play the animation queue
    //
    this.animQueue_.play();
}


/**
 * @private
 * @type {!number}
 */
nrg.ui.SlideInMenu.prototype.fadeOutTimer_ = null;




/**
 * @private
 */
nrg.ui.SlideInMenu.prototype.startFadeOutTimer_ = function() { 

    //
    // Remove any existing timers
    //
    if (goog.isDefAndNotNull(this.fadeOutTimer_)){
	goog.Timer.clear(this.fadeOutTimer_)
	this.fadeOutTimer_ = null;
    }

    this.fadeOutTimer_ = goog.Timer.callOnce(function() {
	//
	// destroy the timer
	//
	this.fadeOutTimer_ = null; 

	//
	// Exit out if the menu isn't visible
	//
	if (!this.menuVisible_) {return}

	//
	// Hide and exit if not over a menu item
	//
	if (!this.mouseIsOverMenu_ && this.menuVisible_){
	    this.hideMenu();
	    return;
	}

	//
	// recurse
	//
	this.startFadeOutTimer_();

	//
	// check again later
	//
    }.bind(this), nrg.ui.SlideInMenu.FADE_OUT_COUNTDOWN); 
}



/**
 * Highlights the appropriate menuItem after the user 
 * has clicked on it, unhighlights the rest.
 *
 * @param {!number} index
 * @public
 */
nrg.ui.SlideInMenu.prototype.setHighlightedIndex = function(index) {
    //
    // Highlight the menuitem.
    //
    //window.console.log(this.menuItems_, index, this.getTitleFromIndex(index));
    goog.dom.classes.add(
	this.menuItems_[this.getTitleFromIndex(index)].CONTENT, 
		nrg.ui.SlideInMenu.CSS.MENUITEM_HIGHLIGHT);

    //
    // Adjust icon src, if needed.
    //
    if (this.matchMenuIconToSelected_){
	this.icon_.src = 
	    this.menuItems_[this.getTitleFromIndex(index)].ICON.src;
    }

    //
    // Adjust title, if needed.
    //
    if (this.matchMenuTitleToSelected_){
	this.getElement().title  = 
	    this.getItemCollectionFromIndex(index).ITEM.getContent();
    }
}



/**
 * @public
 */
nrg.ui.SlideInMenu.prototype.deselectAll = function() {
    goog.object.forEach(this.menuItems_, function(itemCol, key){
	goog.dom.classes.remove(itemCol.CONTENT, 
		nrg.ui.SlideInMenu.CSS.MENUITEM_HIGHLIGHT);	
    }.bind(this))
}



/**
 * @param {!Array.string | !string} itemTitles The titles of the menu items.
 * @param {!Array.string | !string} opt_iconSrc The optional sources for the
 *    menu item icons.
 * @throws {Error} If the a title is already taken.
 * @public
 */
nrg.ui.SlideInMenu.prototype.addMenuItem = function(itemTitles, 
							opt_iconSrc) {

    itemTitles = goog.isString(itemTitles) ?  [itemTitles] : itemTitles;
    opt_iconSrc = opt_iconSrc || [];
    opt_iconSrc = goog.isArray(opt_iconSrc) ? opt_iconSrc : [opt_iconSrc];
    
    var item = null;
    var childNodes = null;
    var content = null;
    var icon = null;
    
    goog.array.forEach(itemTitles, function(title, i){
	if (this.menuItems_[title]){
	    throw new Error(title + ' is already in use!');
	}
	
	//
	// create the menu item.
	//
	item = new goog.ui.MenuItem(title)
	this.menu_.addItem(item);

	//
	// Modify the content element.
	//
	content = item.getContentElement();
	goog.dom.classes.add(content, nrg.ui.SlideInMenu.CSS.MENUITEM);
	content.title = title;

	//
	// Set the icon.
	//
	icon = goog.dom.createDom("img", {
	    'id':  nrg.ui.SlideInMenu.ID_PREFIX + '_MenuItemIcon_' + 
		goog.string.createUniqueString(),
	    'class' : nrg.ui.SlideInMenu.CSS.MENUITEM_ICON
	});

	//
	// Set the icon src, if available.
	//
	icon.src = (i <= opt_iconSrc.length - 1) ? opt_iconSrc[i] : null;
	goog.dom.append(content, icon);
	
	//
	// Store the item.
	//
	this.menuItems_[title] = 
	    goog.object.clone(nrg.ui.SlideInMenu.menuItemCollection);
	this.menuItems_[title].ITEM = item;
	this.menuItems_[title].CONTENT = content;
	this.menuItems_[title].ICON = icon;
    }.bind(this))    
}



/**
 * Sets a menu item active either by its index number or title. 
 *
 * @param {!number | !string} indexOrTitle Either the index or the title to 
 *    set the item selected.
 * @param {boolean=} opt_deactivateOthers Optional: whether to deactive other
 *    selected items.  Defaults to true.
 * @throws {Error} If title is invalid.
 * @public
 */
nrg.ui.SlideInMenu.prototype.setSelected = 
function(indexOrTitle, opt_deactivateOthers) {
    //
    // Set index, assert value
    //
    var index = indexOrTitle;
    if (goog.isString(index)) {
	if (!this.menuItems_[index]){
	    throw new Error(index + ' does not exist!');
	}
	index = this.getIndexFromTitle(index);
    } 

    //
    // Record the view layouts, previous and current.
    //
    this.prevSelectedItem_ = this.currSelectedItem_ ? 
	this.currSelectedItem_ : indexOrTitle;
    this.currSelectedItem_ = indexOrTitle;

    //
    // Deactivate others
    //
    if (!goog.isDef(opt_deactivateOthers) || opt_deactivateOthers){
	this.deselectAll();
    }

    //
    // Highlight / unhighlight the relevant menu items.
    //
    this.setHighlightedIndex(index);
   

    //
    // Dispatch the event
    //
    this.dispatchSelected_(index);
}



/**
 * @param {!number | !string} index The tab index.
 * @private
 */
nrg.ui.SlideInMenu.prototype.dispatchSelected_ = function(index){
    //window.console.log("DISPATCH SELECTED");
    this.dispatchEvent({
	type: nrg.ui.SlideInMenu.EventType.ITEM_SELECTED,
	index: index,
	title: this.getItemCollectionFromIndex(index).ITEM.getContent()
    });
}



/**
 * @param {Function=} opt_callback
 * @param {number=} opt_animTime
 * @public
 */
nrg.ui.SlideInMenu.prototype.showMenu = function(opt_callback, opt_animTime) {
    //
    // Create the animations associated with sliding IN
    //
    this.runAnimations_(nrg.ui.SlideInMenu.createAnimIn_(
	this.holder_, this.hidePos_, this.showPos_, opt_animTime), function(){
	    //
	    // Track menu visibility
	    //
	    this.menuVisible_ = true;

	    //
	    // Run callback
	    //
	    if (goog.isDefAndNotNull(opt_callback)){
		opt_callback();
	    }	
	}.bind(this));
}



/**
 * @param {Function=} opt_callback
 * @param {number=} opt_animTime
 * @public
 */
nrg.ui.SlideInMenu.prototype.hideMenu = function(opt_callback, opt_animTime) {
    //
    // Create the animations associated with sliding OUT
    //
    this.runAnimations_(nrg.ui.SlideInMenu.createAnimOut_(
	this.holder_, this.showPos_, this.hidePos_, opt_animTime), function() {
	    //
	    // Track menu visibility
	    //	    
	    this.menuVisible_ = false;

	    //
	    // Hide the holder
	    //
	    this.holder_.style.visibility = 'hidden';

	    //
	    // callback
	    //
	    if (goog.isDef(opt_callback)){
		opt_callback();
	    }
	}.bind(this));
}



/**
 * @private
 */
nrg.ui.SlideInMenu.prototype.setMenuEvents_ = function() {
    //
    // CLICK: Show or hide the menu
    //
    goog.events.listen(this.getElement(), goog.events.EventType.CLICK, 
	function (event) {
	    if (!this.menuVisible_) { this.showMenu() } 
	    else { this.hideMenu() }		   
	}.bind(this))

    //
    // Mouseover / Mouseout hover over the main icon.
    //
    //nrg.style.setHoverClass(this.icon_, 
    //nrg.ui.SlideInMenu.CSS.ICON_HOVERED);

    //
    // Onclick: Menu items (i.e. the view planes) - select-
    //
    goog.events.listen(this.menu_, 'action', function(e) {
	//nrg.dom.stopPropagation(e);
	//window.console.log();
	this.setSelected(e.target.getContent());
    }.bind(this));  


    //
    // Onclick: Menu items (i.e. the view planes) - select-
    //
    goog.events.listen(this.holder_, goog.events.EventType.MOUSEOVER, 
	function(e) {
	    //window.console.log("MOUSE OVER!");
	    this.mouseIsOverMenu_ = true;
	}.bind(this)); 
    goog.events.listen(this.holder_, goog.events.EventType.MOUSEOUT, 
	function(e) {
	    //window.console.log("MOUSE OUT!");
	    this.mouseIsOverMenu_ = false;
	    this.startFadeOutTimer_();
	}.bind(this)); 
}



/**
 * @inheritDoc
 */
nrg.ui.SlideInMenu.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.mouseIsOverMenu_;
    delete this.fadeOutTimer_;

    //
    // Anims
    //
    this.clearAnimQueue_();
    goog.array.clear(this.anims_);
    delete this.anims_;

    
    //
    // Menu items
    //
    goog.object.forEach(this.menuItems_, function(item, key){
	goog.events.removeAll(item);
	goog.dom.removeNode(item);
	delete this.menuItems_[key];
    }.bind(this))
    goog.object.clear(this.menuItems_);
    delete this.menuItems_;

    //
    // Holder
    //
    goog.dom.removeNode(this.holder_);
    delete this.holder_;

    //
    // Icon
    //
    goog.dom.removeNode(this.icon_);
    delete this.icon_;

    //
    // Menu
    //
    goog.events.removeAll(this.menu_);
    this.menu_.dispose();
    delete this.menu_;

    //
    // Animation Queue
    //
    nrg.ui.disposeAnimationQueue(this.animQueue_);
    delete this.animQueue_;

    delete this.prevSelectedItem_;
    delete this.currSelectedItem_;
    delete this.menuVisible_;
    delete this.hidePos_;
    delete this.showPos_;
    delete this.matchMenuIconToSelected_;
    delete this.matchMenuTitleToSelected_;
}





goog.exportSymbol('nrg.ui.SlideInMenu.ID_PREFIX',
	nrg.ui.SlideInMenu.ID_PREFIX);
goog.exportSymbol('nrg.ui.SlideInMenu.EventType',
	nrg.ui.SlideInMenu.EventType);
goog.exportSymbol('nrg.ui.SlideInMenu.CSS_SUFFIX',
	nrg.ui.SlideInMenu.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.SlideInMenu.menuItemCollection',
	nrg.ui.SlideInMenu.menuItemCollection);
goog.exportSymbol('nrg.ui.SlideInMenu.FADE_OUT_COUNTDOWN',
	nrg.ui.SlideInMenu.FADE_OUT_COUNTDOWN);
goog.exportSymbol('nrg.ui.SlideInMenu.ANIM_LEN_IN',
	nrg.ui.SlideInMenu.ANIM_LEN_IN);
goog.exportSymbol('nrg.ui.SlideInMenu.ANIM_LEN_OUT',
	nrg.ui.SlideInMenu.ANIM_LEN_OUT);
goog.exportSymbol('nrg.ui.SlideInMenu.MOUSEOUT_HIDE',
	nrg.ui.SlideInMenu.MOUSEOUT_HIDE);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setHidePosition',
	nrg.ui.SlideInMenu.prototype.setHidePosition);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setShowPosition',
	nrg.ui.SlideInMenu.prototype.setShowPosition);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getHidePosition',
	nrg.ui.SlideInMenu.prototype.getHidePosition);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getShowPosition',
	nrg.ui.SlideInMenu.prototype.getShowPosition);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getMenu',
	nrg.ui.SlideInMenu.prototype.getMenu);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getMenuHolder',
	nrg.ui.SlideInMenu.prototype.getMenuHolder);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getMenuIcon',
	nrg.ui.SlideInMenu.prototype.getMenuIcon);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setMenuIconSrc',
	nrg.ui.SlideInMenu.prototype.setMenuIconSrc);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setMenuItemIconSrc',
	nrg.ui.SlideInMenu.prototype.setMenuItemIconSrc);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getIndexFromTitle',
	nrg.ui.SlideInMenu.prototype.getIndexFromTitle);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getTitleFromIndex',
	nrg.ui.SlideInMenu.prototype.getTitleFromIndex);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getItemCollectionFromIndex',
	nrg.ui.SlideInMenu.prototype.getItemCollectionFromIndex);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.matchMenuIconToSelected',
	nrg.ui.SlideInMenu.prototype.matchMenuIconToSelected);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.matchMenuTitleToSelected',
	nrg.ui.SlideInMenu.prototype.matchMenuTitleToSelected);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.getSelectedMenuItem',
	nrg.ui.SlideInMenu.prototype.getSelectedMenuItem);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setHighlightedIndex',
	nrg.ui.SlideInMenu.prototype.setHighlightedIndex);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.deselectAll',
	nrg.ui.SlideInMenu.prototype.deselectAll);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.addMenuItem',
	nrg.ui.SlideInMenu.prototype.addMenuItem);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.setSelected',
	nrg.ui.SlideInMenu.prototype.setSelected);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.showMenu',
	nrg.ui.SlideInMenu.prototype.showMenu);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.hideMenu',
	nrg.ui.SlideInMenu.prototype.hideMenu);
goog.exportSymbol('nrg.ui.SlideInMenu.prototype.disposeInternal',
	nrg.ui.SlideInMenu.prototype.disposeInternal);
