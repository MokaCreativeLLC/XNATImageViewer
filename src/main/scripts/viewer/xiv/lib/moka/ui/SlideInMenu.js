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
goog.require('moka.ui.Component');



/**
 * moka.ui.SlideInMenu is a menu that appears on user hovering over an icon.
 * It then rotates the icon of the menu based on the item selected.
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('moka.ui.SlideInMenu');
moka.ui.SlideInMenu = function () {	
    goog.base(this);


    /**
     * @private
     * @type {Object.<string, moka.ui.menuItemCollection>}
     */
    this.menuItems_ = {};



    /**
     * @private
     * @type {Element}
     */
    this.holder_ = goog.dom.createDom("div", {
	'id' : this.constructor.ID_PREFIX + 
	    '_Holder_' + goog.string.createUniqueString(),
	'class': moka.ui.SlideInMenu.CSS.MENUHOLDER
    })
    goog.dom.append(this.getElement(), this.holder_);


    /**
     * @private
     * @type {Element}
     */
    this.icon_ = goog.dom.createDom("img", {
	'id': this.constructor.ID_PREFIX + 
	    '_Icon_' + goog.string.createUniqueString(),
	'class': moka.ui.SlideInMenu.CSS.ICON
    });	
    goog.dom.append(this.getElement(), this.icon_);


    /**
     * @private
     * @type {!goog.ui.Menu}
     */   
    this.menu_ = new goog.ui.Menu();



    this.setMenuEvents_(); 
    this.hideMenu(undefined, 0);
    this.menu_.render(this.holder_); 
    // must come after the render
    goog.dom.classes.add(this.menu_.getElement(), 
			 moka.ui.SlideInMenu.CSS.MENU);
}
goog.inherits(moka.ui.SlideInMenu, moka.ui.Component);
goog.exportSymbol('moka.ui.SlideInMenu', moka.ui.SlideInMenu)



/**
 * @enum {string}
 * @public
 */
moka.ui.SlideInMenu.EventType = {
    ITEM_SELECTED: 'item_selected',
};



/**
 * @type {!Object}
 * @public
 */
moka.ui.menuItemCollection = {
    ITEM : null,
    CONTENT: null,
    ICON: null
}



/**
 * @type {!string} 
 * @const
*/
moka.ui.SlideInMenu.ID_PREFIX =  'moka.ui.SlideInMenu';



/**
 * @enum {string}
 * @public
 */
moka.ui.SlideInMenu.CSS_SUFFIX = {
    ICON: 'icon',
    ICON_HOVERED: 'icon-hovered',
    MENU: 'menu',
    MENUHOLDER: 'menuholder',
    MENUITEM: 'menuitem',
    MENUITEM_HIGHLIGHT: 'menuitem-highlight',
    MENUITEM_ICON: 'menuitem-icon'
}



/**
 * @const
 * @type {number}
 */	
moka.ui.SlideInMenu.ANIM_LEN_IN = 500;



/**
 * @const
 * @type {number}
 */	
moka.ui.SlideInMenu.ANIM_LEN_OUT = 700;



/**
 * @const
 * @type {number}
 */	
moka.ui.SlideInMenu.MOUSEOUT_HIDE = 
    moka.ui.SlideInMenu.ANIM_LEN_OUT + 800; 



/**
 * Animates the position and opacity of the xiv.ui.SelectedItem menu
 * (i.e. slides it and fades it in/out).
 *
 * @param {!Element} elt
 * @param {!Array.number} startPos
 * @param {!Array.number} endPos
 * @param {number=} opt_animTime
 */
moka.ui.SlideInMenu.createAnimIn_  = 
function (elt, startPos, endPos, opt_animTime) {
    opt_animTime = goog.isDef(opt_animTime) ? opt_animTime : 
	moka.ui.SlideInMenu.ANIM_LEN_IN;
    return [new goog.fx.dom.FadeInAndShow(elt, opt_animTime),
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
moka.ui.SlideInMenu.createAnimOut_  =
function (elt, startPos, endPos, opt_animTime) {
    opt_animTime = goog.isDef(opt_animTime) ? opt_animTime : 
	moka.ui.SlideInMenu.ANIM_LEN_OUT;
    return [new goog.fx.dom.FadeOutAndHide(elt, opt_animTime),
	    new goog.fx.dom.Slide(elt, startPos, endPos, 
	        opt_animTime, goog.fx.easing.easeOut)];
}



/**
 * Animates the position and opacity of the xiv.ui.SelectedItem menu
 * (i.e. slides it and fades it in/out)/
 * @param {!Array.<goog.fx.Animation> | !goog.fx.Animation} anims
 * @param {Function=} opt_callback
 */
moka.ui.SlideInMenu.runAnimations_  = function (anims, opt_callback) {
    anims = goog.isArray(anims) ? anims : [anims]
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/
    new goog.fx.AnimationParallelQueue();
    goog.events.listen(animQueue, 'end', function() {
	if (opt_callback) { opt_callback() };
	animQueue.disposeInternal();
	animQueue = null;
    }.bind(this))
    goog.array.forEach(anims, function(anim){
	animQueue.add(anim);
    }) 
    animQueue.play();
}



/**
 * @type {string}
 */
moka.ui.SlideInMenu.prototype.prevSelectedItem_ = undefined;



/**
 * @type {string}
 */
moka.ui.SlideInMenu.prototype.currSelectedItem_ = undefined;



/**
 * @private
 * @type {boolean}
 */
moka.ui.SlideInMenu.prototype.menuVisible_ = false;



/**
 * @private
 * @type {!Array.number}
 */
moka.ui.SlideInMenu.prototype.hidePos_ = [-100, -100];



/**
 * @private
 * @type {!Array.number}
 */
moka.ui.SlideInMenu.prototype.showPos_ = [0, 0];



/**
 * @param {!boolean} bool
 * @private
 */
moka.ui.SlideInMenu.prototype.matchMenuIconToSelected_ = true;



/**
 * @param {!boolean} bool
 * @private
 */
moka.ui.SlideInMenu.prototype.matchMenuTitleToSelected_ = true;



/**
 * @param {!number} x
 * @param {!number} y
 * @public
 */
moka.ui.SlideInMenu.prototype.setHidePosition = function(x, y) {
    return this.hidePos_ = [x, y];
}



/**
 * @param {!number} x
 * @param {!number} y
 * @public
 */
moka.ui.SlideInMenu.prototype.setShowPosition = function(x, y) {
    return this.showPos_ = [x, y];
}



/**
 * @return {!Array.number}
 * @public
 */
moka.ui.SlideInMenu.prototype.getHidePosition = function(src) {
    return this.hidePos_;
}


/**
 * @return {!Array.number}
 * @public
 */
moka.ui.SlideInMenu.prototype.getShowPosition = function(src) {
    return this.showPos_;
}


/**
 * @return {!Element}
 * @public
 */
moka.ui.SlideInMenu.prototype.getMenu = function() {
    return this.menu_;
}


/**
 * @return {!Element}
 * @public
 */
moka.ui.SlideInMenu.prototype.getMenuHolder = function() {
    return this.holder_;
}



/**
 * @return {!Element}
 * @public
 */
moka.ui.SlideInMenu.prototype.getMenuIcon = function() {
    return this.icon_;
}



/**
 * @param {!string} src
 * @public
 */
moka.ui.SlideInMenu.prototype.setMenuIconSrc = function(src) {
    this.icon_.src = src;
}



/**
 * @param {!string} title
 * @public
 */
moka.ui.SlideInMenu.prototype.setMenuItemIconSrc = function(title, src) {
    this.menuItems_[title].ICON.src = src;
}



/**
 * @param {!string} The title.
 * @return {!number}
 * @public
 */
moka.ui.SlideInMenu.prototype.getIndexFromTitle = function(title) {
    return goog.object.getKeys(this.menuItems_).indexOf(title);
}



/**
 * @param {!string} ind The index.
 * @return {!number}
 * @public
 */
moka.ui.SlideInMenu.prototype.getTitleFromIndex = function(index) {
    return goog.object.getKeys(this.menuItems_)[index];
}



/**
 * @param {!number} ind The index.
 * @return {moka.ui.menuItemcollection}
 * @public
 */
moka.ui.SlideInMenu.prototype.getItemCollectionFromIndex = function(ind) {
    return this.menuItems_[goog.object.getKeys(this.menuItems_)[ind]];
}



/**
 * @param {!boolean} bool
 * @public
 */
moka.ui.SlideInMenu.prototype.matchMenuIconToSelected = function(bool) {
    return this.matchMenuIconToSelected_ = bool;
}



/**
 * @param {!boolean} bool
 * @public
 */
moka.ui.SlideInMenu.prototype.matchMenuTitleToSelected = function(bool) {
    return this.matchMenuTitleToSelected_ = bool;
}



/**
 * @return {String}
 * @public
 */
moka.ui.SlideInMenu.prototype.getSelectedMenuItem = function() {
    return this.currSelectedItem_;
}



/**
 * Highlights the appropriate menuItem after the user 
 * has clicked on it, unhighlights the rest.
 *
 * @param {!number} index
 * @public
 */
moka.ui.SlideInMenu.prototype.setHighlightedIndex = function(index) {

    // Highlight the menuitem.
    goog.dom.classes.add(
	this.menuItems_[this.getTitleFromIndex(index)].CONTENT, 
		moka.ui.SlideInMenu.CSS.MENUITEM_HIGHLIGHT);

    // Adjust icon src, if needed.
    if (this.matchMenuIconToSelected_){
	this.icon_.src = 
	    this.menuItems_[this.getTitleFromIndex(index)].ICON.src;
    }

    // Adjust title, if needed.
    if (this.matchMenuTitleToSelected_){
	this.getElement().title  = 
	    this.getItemCollectionFromIndex(index).ITEM.getContent();
    }
}



/**
 * @public
 */
moka.ui.SlideInMenu.prototype.deselectAll = function() {
    goog.object.forEach(this.menuItems_, function(itemCol, key){
	goog.dom.classes.remove(itemCol.CONTENT, 
		moka.ui.SlideInMenu.CSS.MENUITEM_HIGHLIGHT);	
    }.bind(this))
}



/**
 * @param {!Array.string | !string} itemTitles The titles of the menu items.
 * @param {!Array.string | !string} opt_iconSrc The optional sources for the
 *    menu item icons.
 * @throws {Error} If the a title is already taken.
 * @public
 */
moka.ui.SlideInMenu.prototype.addMenuItem = function(itemTitles, 
							opt_iconSrc) {

    itemTitles = goog.isString(itemTitles) ?  [itemTitles] : itemTitles;
    opt_iconSrc = opt_iconSrc || [];
    opt_iconSrc = goog.isArray(opt_iconSrc) ? opt_iconSrc : [opt_iconSrc];
    
    var item = /**@type {goog.ui.MenuItem}*/ null;
    var childNodes = /**@type {{length: number}}*/ null;
    var content = /**@type {Element}*/ null;
    var icon = /**@type {Element}*/ null;
    
    goog.array.forEach(itemTitles, function(title, i){
	if (this.menuItems_[title]){
	    throw new Error(title + ' is already in use!');
	}
	
	// create the menu item.
	item = new goog.ui.MenuItem(title)
	this.menu_.addItem(item);

	// Modify the content element.
	content = item.getContentElement();
	goog.dom.classes.add(content,
			     moka.ui.SlideInMenu.CSS.MENUITEM_CONTENT);
	content.title = title;

	// Set the icon.
	icon = goog.dom.createDom("img", {
	    'id':  moka.ui.SlideInMenu.ID_PREFIX + '_MenuItemIcon_' + 
		goog.string.createUniqueString(),
	    'class' : moka.ui.SlideInMenu.CSS.ICON
	});

	// Set the icon src, if available.
	icon.src = (i <= opt_iconSrc.length - 1) ? opt_iconSrc[i] : null;
	goog.dom.append(content, icon);
	
	// Store the item.
	this.menuItems_[title] = goog.object.clone(moka.ui.menuItemCollection);
	this.menuItems_[title].ITEM = item;
	this.menuItems_[title].CONTENT = content;
	this.menuItems_[title].ICON = icon;
    }.bind(this))    
}



/**
 * Sets a menu item active either by its index number or title. 
 * @param {!number | !string} indexOrTitle Either the index or the title to 
 *    set the item selected.
 * @param {boolean=} opt_deactivateOthers Optional: whether to deactive other
 *    selected items.  Defaults to true.
 * @throws {Error} If title is invalid.
 * @public
 */
moka.ui.SlideInMenu.prototype.setSelected = 
function(indexOrTitle, opt_deactivateOthers) {

    // Set index, assert value
    var index = /**@param {!number}*/ indexOrTitle;
    if (goog.isString(index)) {
	if (!this.menuItems_[index]){
	    throw new Error(index + ' does not exist!');
	}
	index = this.getIndexFromTitle(index);
    } 

    // Record the view layouts, previous and current.
    this.prevSelectedItem_ = this.currSelectedItem_ ? 
	this.currSelectedItem_ : indexOrTitle;
    this.currSelectedItem_ = indexOrTitle;

    // Highlight / unhighlight the relevant menu items.
    this.setHighlightedIndex(index);

    // Deactivate others
    if (!goog.isDef(opt_deactivateOthers) || opt_deactivateOthers){
	this.deselectAll();
    }
    
    // Dispatch the event
    this.dispatchEvent({
	type: moka.ui.SlideInMenu.EventType.ITEM_SELECTED,
	index: index,
	title: this.getItemCollectionFromIndex(index).ITEM.getContent()
    });

    if (this.menuVisible_){
	this.hideMenu();
    }
}



/**
 * @param {Function=} opt_callback
 * @param {number=} opt_animTime
 * @public
 */
moka.ui.SlideInMenu.prototype.showMenu = 
function(opt_callback, opt_animTime) {
    this.holder_.style.visibility = 'visible';
    moka.ui.SlideInMenu.runAnimations_(moka.ui.SlideInMenu.createAnimIn_(
	this.holder_, this.hidePos_, this.showPos_, opt_animTime), function(){
	    window.console.log(this.holder_);
	    this.menuVisible_ = true;
	    if (goog.isDef(opt_callback)){
		opt_callback();
	    }	
	}.bind(this));
}



/**
 * @param {Function=} opt_callback
 * @param {number=} opt_animTime
 * @public
 */
moka.ui.SlideInMenu.prototype.hideMenu = 
function(opt_callback, opt_animTime) {
    moka.ui.SlideInMenu.runAnimations_(moka.ui.SlideInMenu.createAnimOut_(
	this.holder_, this.showPos_, this.hidePos_, opt_animTime), function() {
	    this.menuVisible_ = false;
	    this.holder_.style.visibility = 'hidden';
	    window.console.log(this.holder_);
	    if (goog.isDef(opt_callback)){
		opt_callback();
	    }
	}.bind(this));
}



/**
 * @private
 */
moka.ui.SlideInMenu.prototype.setMenuEvents_ = function() {

    // CLICK: Show or hide the menu
    goog.events.listen(this.getElement(), goog.events.EventType.CLICK, 
	function (event) {
	    if (!this.menuVisible_) { this.showMenu() } 
	    else { this.hideMenu() }		   
	}.bind(this))

    // Mouseover / Mouseout hover over the main icon.
    moka.style.setHoverClass(this.icon_, 
			      moka.ui.SlideInMenu.CSS.ICON_HOVERED);

    // Onclick: Menu items (i.e. the view planes) - select-
    goog.events.listen(this.menu_, 'action', function(e) {
	moka.dom.stopPropagation(e);
	this.setSelected(parseInt(e.target.getId().replace(/:/g, ''), 10));
    }.bind(this));  
}



/** 
 * @inheritDoc 
 */
moka.ui.SlideInMenu.prototype.disposeInternal = function() {
    moka.ui.SlideInMenu.superClass_.disposeInternal.call(this);

    goog.object.forEach(this.menuItems_, function(item, pos){
	item.ITEM.dispose();
	goog.dom.remove(item.getElement());
	item = null;
    })

};



/**
 * TODO: Reinvestigate the hover probabilities of this. 
 *
 * @deprecated
 * @private
 */
moka.ui.SlideInMenu.prototype.closeCountdown_ = function(opt_delay) {
    var dateObj = new Date();
    opt_delay = goog.isDef(opt_delay) ? opt_delay : 
	moka.ui.SlideInMenu.MOUSEOUT_HIDE;
    var mouseoutDate = dateObj.getTime();
    delay = new goog.async.Delay(function(){ 
	determineMenuHideable(opt_delay) 
    }, opt_delay);
    delay.start();
}



/**
 * TODO: Reinvestigate the hover probabilities of this. 
 *
 * @deprecated
 * @private
 */
moka.ui.SlideInMenu.prototype.determineMenuHideable_ = function(delayTime) {
    var dateObj = new Date();
    if (!isHovered && ((dateObj.getTime() - mouseoutDate) >= delayTime)) { 
	this.hideMenu()
    }
}
