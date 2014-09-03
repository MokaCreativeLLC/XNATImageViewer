/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ViewableGroupMenu');

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.dom.classes');

// nrg
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.fx');
goog.require('nrg.ui.ThumbnailGallery');
goog.require('nrg.ui.Component');
goog.require('nrg.ui.Thumbnail');

//-----------



/**
 * ViewableGroupMenu is a class that allows the user to choose a 
 * specific 'view' when loading a slicer file.  It reveals itself
 * when a user puts a Slicer mrb thumbnail into a ViewBox
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
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
 * @expose
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
xiv.ui.ViewableGroupMenu.prototype.render = function(parentElement) {
    goog.base(this, 'render', parentElement);

    this.background_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Background_' + 
	    goog.string.createUniqueString(),
    });
    goog.dom.classes.add(this.background_, this.constructor.CSS.BACKGROUND);
    if (goog.isDefAndNotNull(this.getElement().parentNode) || 
	goog.isDefAndNotNull(parentElement)){
	var parent = parentElement || this.getElement().parentNode;
	//window.console.log("APRENT", parent);
	goog.dom.append(parent, this.background_);
    } else {
	goog.dom.append(this.getElement(), this.background_);
    }
    //window.console.log(this.background_);

    this.headerText_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_HeaderText_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewableGroupMenu.CSS.HEADER
    });
    this.headerText_.innerHTML = '<b> Select Slicer Scene View <b>';
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
	this.ThumbnailGallery_.dispose();
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
	e.target.pulse(300, function(){
	    //window.console.log("\nDISPATCH VIEW SELECT");
	    this.dispatchEvent({
		type: xiv.ui.ViewableGroupMenu.EventType.VIEWSELECTED,
		thumbnail: thumbnail
	    });
	}.bind(this))			   
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
	this.ThumbnailGallery_.dispose();
	delete this.ThumbnailGallery_;
    }
}



goog.exportSymbol('xiv.ui.ViewableGroupMenu.ID_PREFIX',
	xiv.ui.ViewableGroupMenu.ID_PREFIX);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.EventType',
	xiv.ui.ViewableGroupMenu.EventType);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.CSS_SUFFIX',
	xiv.ui.ViewableGroupMenu.CSS_SUFFIX);

goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.render',
	xiv.ui.ViewableGroupMenu.prototype.render);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.getBackground',
	xiv.ui.ViewableGroupMenu.prototype.getBackground);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.show',
	xiv.ui.ViewableGroupMenu.prototype.show);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.createAndAddThumbnail',
	xiv.ui.ViewableGroupMenu.prototype.createAndAddThumbnail);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.hide',
	xiv.ui.ViewableGroupMenu.prototype.hide);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.reset',
	xiv.ui.ViewableGroupMenu.prototype.reset);
goog.exportSymbol('xiv.ui.ViewableGroupMenu.prototype.disposeInternal',
	xiv.ui.ViewableGroupMenu.prototype.disposeInternal);
