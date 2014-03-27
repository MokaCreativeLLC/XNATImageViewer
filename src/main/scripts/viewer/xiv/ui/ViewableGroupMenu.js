/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');

// utils
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.fx');
goog.require('moka.ui.ThumbnailGallery');



/**
 * ViewableGroupMenu is a class that allows the user to choose a 
 * specific 'view' when loading a slicer file.  It reveals itself
 * when a user puts a Slicer mrb thumbnail into a ViewBox
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewableGroupMenu');
xiv.ui.ViewableGroupMenu = function () {

    goog.base(this);


    /**
     * @type {!Element}
     * @private
     */
    this.background_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Background_' + 
	    goog.string.createUniqueString(),
    });
    goog.dom.classes.add(this.background_, this.constructor.CSS.BACKGROUND);
    goog.dom.append(this.getElement(), this.background_);



    /**
     * @type {!Element}
     * @private
     */
    this.headerText_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_HeaderText_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewableGroupMenu.CSS.HEADER
    });
    this.headerText_.innerHTML = '<b> Select View <b>';
    goog.dom.append(this.getElement(), this.headerText_);



    /**
     * @type {?moka.ui.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_ = null;


    this.init();
}
goog.inherits(xiv.ui.ViewableGroupMenu, moka.ui.Component);
goog.exportSymbol('xiv.ui.ViewableGroupMenu', xiv.ui.ViewableGroupMenu);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewableGroupMenu.ID_PREFIX =  'xiv.ui.ViewableGroupMenu';




/**
 * Event types.
 * @enum {string}
 */
xiv.ui.ViewableGroupMenu.EventType = {
  VIEWSELECTED: goog.events.getUniqueId('viewselected'),
};



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewableGroupMenu.CSS_SUFFIX = {
    HEADER: 'header',
    THUMBNAIL: 'thumbnail',
    THUMBNAIL_TEXT: 'thumbnail-text',
    THUMBNAIL_IMAGE: 'thumbnail-image',
    THUMBNAILGALLERY: 'thumbnailgallery',
    BACKGROUND: 'background'
    
}



/**
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.getBackground = function() {
    return this.background_
}



/**
 * As stated.
 *
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.show = function() {
    moka.fx.fadeIn(this.getElement(), xiv.ANIM_SLOW);
}



/**
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.createAndAddThumbnail = 
function(imageUrl, displayText) {
    var thumb = 
	this.ThumbnailGallery_.createAndAddThumbnail(imageUrl, displayText);
    this.setThumbnailOnClick_(thumb);
}



/**
 * As stated.
 *
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.hide = function() {
    moka.fx.fadeOut(this.getElement(), xiv.ANIM_MED);
    goog.dom.removeNode(this.getElement());
}




/**
 * Resets the menu to show information pertaing to the
 * properties in the argument.
 *
 * @param {!xiv.slicer.mrbProperties} mrbProperties
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.init = function () {

    if (goog.isDefAndNotNull(this.ThumbnailGallery_)){
	this.ThumbnailGallery_.disposeInternal();
	delete this.ThumbnailGallery_;
    }

    this.ThumbnailGallery_ = new moka.ui.ThumbnailGallery();
    goog.dom.append(this.getElement(), this.ThumbnailGallery_.getElement());
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.ui.ViewableGroupMenu.CSS.THUMBNAILGALLERY);

    this.ThumbnailGallery_.addThumbnailClass(
	xiv.ui.ViewableGroupMenu.CSS.THUMBNAIL);

    this.ThumbnailGallery_.addThumbnailImageClass(
	xiv.ui.ViewableGroupMenu.CSS.THUMBNAIL_IMAGE);

    this.ThumbnailGallery_.addThumbnailTextClass(
	xiv.ui.ViewableGroupMenu.CSS.THUMBNAIL_TEXT);
 
}




/**
 * Calls the 'VIEWSELECTED' event when a Thumbnail is clicked.
 *
 * @param {!moka.ui.Thumbnail} thumbnail R
 * @private
 */
xiv.ui.ViewableGroupMenu.prototype.setThumbnailOnClick_ = function (thumbnail) {
    goog.events.listen(thumbnail, moka.ui.Thumbnail.EventType.CLICK, 
    function(e){
	window.console.log("CLICK!");
	this.dispatchEvent({
	    type: xiv.ui.ViewableGroupMenu.EventType.VIEWSELECTED,
	    thumbnail: thumbnail
	});			   
    }.bind(this))
}





xiv.ui.ViewableGroupMenu.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    window.console.log("IMPLEMENT DISPOSE INTERNAL HERE!");
    
    goog.events.removeAll(this);


    goog.dom.removeNode(this.headerText_);
    delete this.headerText_;
    
    this.ThumbnailGallery_.disposeInternal();
    delete this.ThumbnailGallery_;
}




