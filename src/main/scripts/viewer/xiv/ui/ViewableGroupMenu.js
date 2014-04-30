/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');

// utils
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.fx');
goog.require('nrg.ui.ThumbnailGallery');



/**
 * ViewableGroupMenu is a class that allows the user to choose a 
 * specific 'view' when loading a slicer file.  It reveals itself
 * when a user puts a Slicer mrb thumbnail into a ViewBox
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ViewableGroupMenu');
xiv.ui.ViewableGroupMenu = function () {
    goog.base(this);
}
goog.inherits(xiv.ui.ViewableGroupMenu, nrg.ui.Component);
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
 * @type {?nrg.ui.ThumbnailGallery}
 * @private
 */
xiv.ui.ViewableGroupMenu.prototype.ThumbnailGallery_ = null;



/**
 * @type {?Element}
 * @private
 */
xiv.ui.ViewableGroupMenu.prototype.background_ = null;



/**
 * @type {!Element}
 * @private
 */
xiv.ui.ViewableGroupMenu.prototype.headerText_ = null;




/**
 * @inheritDoc
 */
xiv.ui.ViewableGroupMenu.prototype.render = function() {
    goog.base(this, 'render');

    this.background_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Background_' + 
	    goog.string.createUniqueString(),
    });
    goog.dom.classes.add(this.background_, this.constructor.CSS.BACKGROUND);
    goog.dom.append(this.getElement(), this.background_);

    this.headerText_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_HeaderText_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewableGroupMenu.CSS.HEADER
    });
    this.headerText_.innerHTML = '<b> Select View <b>';
    goog.dom.append(this.getElement(), this.headerText_);

    if (!goog.isDefAndNotNull(this.ThumbnailGallery_)){
	this.reset();
    }
}



/**
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.getBackground = function() {
    return this.background_;
}



/**
 * As stated.
 *
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.show = function() {
    nrg.fx.fadeIn(this.getElement(), xiv.ANIM_SLOW);
}



/**
 * @return {nrg.ui.Thumbnail}
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.createAndAddThumbnail = 
function(imageUrl, displayText) {
    if (!goog.isDefAndNotNull(this.ThumbnailGallery_)){
	this.reset();
    }

    var thumb = 
	this.ThumbnailGallery_.createAndAddThumbnail(imageUrl, displayText);
    this.setThumbnailOnClick_(thumb);
    return thumb;
}



/**
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.hide = function() {
    nrg.fx.fadeOut(this.getElement(), 500);
    goog.dom.removeNode(this.getElement());
}




/**
 * Resets the menu to show information pertaing to the
 * properties in the argument.
 *
 * @param {!xiv.slicer.mrbProperties} mrbProperties
 * @public
 */
xiv.ui.ViewableGroupMenu.prototype.reset = function () {

    if (goog.isDefAndNotNull(this.ThumbnailGallery_)){
	this.ThumbnailGallery_.disposeInternal();
	delete this.ThumbnailGallery_;
    }

    this.ThumbnailGallery_ = new nrg.ui.ThumbnailGallery();
    this.ThumbnailGallery_.sortThumbnailsOnInsert(true);
    this.ThumbnailGallery_.render(this.getElement());
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
 * @param {!nrg.ui.Thumbnail} thumbnail R
 * @private
 */
xiv.ui.ViewableGroupMenu.prototype.setThumbnailOnClick_ = function (thumbnail) {
    goog.events.listen(thumbnail, nrg.ui.Thumbnail.EventType.CLICK, 
    function(e){
	window.console.log("CLICK!");
	this.dispatchEvent({
	    type: xiv.ui.ViewableGroupMenu.EventType.VIEWSELECTED,
	    thumbnail: thumbnail
	});			   
    }.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.ViewableGroupMenu.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    //
    // Background
    //
    if (goog.isDefAndNotNull(this.background_)){
	goog.dom.removeNode(this.background_);
	delete this.background_;
    }
    
    //
    // Header text
    //
    if (goog.isDefAndNotNull(this.headerText_)){
	goog.dom.removeNode(this.headerText_);
	delete this.headerText_;
    }
    
    //
    // Thumbnail Gallery
    //
    if (goog.isDefAndNotNull(this.ThumbnailGallery_)){
	this.ThumbnailGallery_.disposeInternal();
	delete this.ThumbnailGallery_;
    }
}




