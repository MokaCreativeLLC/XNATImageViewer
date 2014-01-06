/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */


/**
 * Google closure includes
 */
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');


/**
 * utils includes
 */
goog.require('utils.style');
goog.require('utils.dom');
goog.require('utils.ui.Thumbnail');
goog.require('utils.ui.ScrollableContainer');





/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically contain
 * utils.ui.Thumbnail objects.
 *
 * @extends {utils.ui.ScrollableContainer}
 * @constructor
 */
goog.provide('utils.ui.ThumbnailGallery');
utils.ui.ThumbnailGallery = function () {

    //------------------
    // Call parent
    //------------------ 
    utils.ui.ScrollableContainer.call(this);
    this.getElement().setAttribute('id',  "utils.ui.ThumbnailGallery" + utils.dom.uniqueId());




    /**
     * @type {!Object<string, utils.ui.Thumbnail>}
     * @private
     */
    this.Thumbnails_ = {};




    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = new utils.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb.getElement());
    this.thumbnailClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_CLASS);
    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb.getImage());
    this.thumbnailImageClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS);
    this.thumbnailTextClasses_ = goog.dom.classes.get(tempThumb.getText());
    this.thumbnailTextClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS);
    goog.dom.removeNode(tempThumb.getElement());
    delete tempThumb;

    
}
goog.inherits(utils.ui.ThumbnailGallery, utils.ui.ScrollableContainer);



utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX = 
    /**@type {string} @expose @const*/ goog.getCssName('utils-ui-scrollablethumbnailgallery');
utils.ui.ThumbnailGallery.ELEMENT_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, '');
utils.ui.ThumbnailGallery.DIALOG_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'dialog');
utils.ui.ThumbnailGallery.THUMBNAIL_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail');
utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-image');
utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
utils.ui.ThumbnailGallery.THUMBNAILGALLERY_CLASS = 
    /**@type {string} @expose @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnailgallery');








/**
 * Makes and returns a utils.ui.Thumbmnail, removing the default 
 * element classes, and applying the classes pertinent to the
 * ThumbnailGallery.
 *
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @return {!utils.ui.Thumbnail}
 * @public
 */
utils.ui.ThumbnailGallery.prototype.makeThumbnail = function(imageUrl, displayText) {

    var thumbnail = new utils.ui.Thumbnail();
 
    goog.dom.classes.addRemove(thumbnail.getElement(), goog.dom.classes.get(thumbnail.getElement()), this.thumbnailClasses_);
    goog.dom.classes.addRemove(thumbnail.getText(), goog.dom.classes.get(thumbnail.getText()), this.thumbnailTextClasses_);
    goog.dom.classes.addRemove(thumbnail.getImage(), goog.dom.classes.get(thumbnail.getImage()), this.thumbnailImageClasses_);

    thumbnail.setImage(imageUrl);
    thumbnail.setText(displayText);

    return thumbnail;
        
}




/**
* Adds a thumbnail to the gallery, or a gallery zippy if the opt_folders argument is provided.
*
* @param {!utils.ui.Thumbnail} thumbnail The thumbnail object to add to the scrollable container.
* @param {string= | Array.<string>=} opt_folders The optional zippy 
* folder name to put the thumbnail in.  Otherwise it goes to the parent.
* @public
*/
utils.ui.ThumbnailGallery.prototype.addThumbnail = function(thumbnail, opt_folders) {

    var folders = (opt_folders === undefined) ? ['parentFolder'] : 
	goog.isArray(opt_folders) ? opt_folders : [opt_folders];
    var contents = {};
  

    //
    // Bind clone to mouse wheel.
    //
    this.bindToMouseWheel(thumbnail.hoverNode, this.onHoverAndScroll_.bind(this));


    //
    // Track thumbnail.
    //
    this.Thumbnails_[thumbnail.getElement().id] = thumbnail;
    

    //
    // Add contents to the ScrollableContainer based on
    // the folder depth.
    //
    var currContents = contents;
    for (var i=0, len = folders.length; i < len; i++){
	currContents[folders[i]] = {};
	if (i < len - 1){
	    currContents = currContents[folders[i]];
	} else {
	    currContents[folders[i]] = thumbnail.getElement();
	}
    }
    this.addContents(contents);
}




/**
 * Makes and inserts a thumbnail in to a given part of the ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @param {string= | Array.string=} opt_folders The optional zippy 
 * folder name to put the thumbnail in.  Otherwise it goes to the parent.
 * @return {!utils.ui.Thumbnail}
 * @public
 */
utils.ui.ThumbnailGallery.prototype.insertAndMakeThumbnail = function(imageUrl, displayText, opt_folders) {
    var thumbnail = this.makeThumbnail(imageUrl, displayText)
    this.addThumbnail(thumbnail, opt_folders);
    this.setThumbnailClasses_('image');
    this.setThumbnailClasses_('text');
    this.setThumbnailClasses_('thumbnail');
    return thumbnail;
}



/**
* Conducts the needed thumbnail element style changes when scrolling
* and hovering over the thumbnail gallery.  If this didn't exist,
* the first thumbnail's hover element would persist during the scroll.  This
* allows for the current thumbnail's hover element to display.
*
* @private
*/
utils.ui.ThumbnailGallery.prototype.onHoverAndScroll_ = function(){    

    //------------------
    // First get the element the mouse is over.
    //------------------ 
    var mouseOverElt = document.elementFromPoint(event.clientX, event.clientY);



    //------------------
    // Then determine if the mouseOverElt is a Thumbnail element
    // by assessing its classes.
    //
    // Return out if the mouse is not over a Thumbnail element.
    //------------------ 
    var hoveredThumbnail =  goog.dom.getAncestorByClass(mouseOverElt, utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    if (!hoveredThumbnail) { return };



    //------------------
    // Get the custom attribute 'thumbnailid' 
    // of the hovered Thumbnail element.  This allows us
    // to find the original Thubmnail element, which may be different
    // than the hovered Thumbnail element.
    //------------------ 
    var originalThumbnailId  = hoveredThumbnail.getAttribute('thumbnailid');



    //------------------
    // If there's no originalThumbnailId...
    //
    // (Either the case when we're over nothing, OR
    // the Thumbnail hover element is the actual Thumbnail element)
    //------------------ 
    if (originalThumbnailId === null) {

	//
	// Unhover all of the thumbnails
	//
	for (var thumbID in this.Thumbnails_) {
	    this.Thumbnails_[thumbID]._onMouseOut();
	}

	//
	// Refevert to the actual ID of the element, assuming
	// that the hovered element is a descendent of a thumbnail.
	//
	originalThumbnailId = goog.dom.getAncestorByClass(mouseOverElt, utils.ui.Thumbnail.CSS_CLASS_PREFIX).id;

	//
	// If there's still no ID, we unhover the saved Thumbnail
	// (it means we're over nothing).
	//
	if (originalThumbnailId === null) { 
	    this.currMousewheelThumbnail_.setHovered(false); 
	    return;
	}
    }
    


    //------------------
    // Derive the thumbnail that the mousewheel is over:
    // First unhover the previously stored one, then
    // set the stored one to the new one.
    //------------------ 
    if (this.currMousewheelThumbnail_ && (this.currMousewheelThumbnail_ !== this.Thumbnails_[originalThumbnailId])){
	this.currMousewheelThumbnail_._onMouseOut(); 
    } 
    this.currMousewheelThumbnail_ = this.Thumbnails_[originalThumbnailId];



    //------------------ 
    // If there's no new hovered thunbnail,
    // return out, otherwise call the mouseOver.
    //------------------ 
    if (!this.currMousewheelThumbnail_){ return }
    this.currMousewheelThumbnail_._onMouseOver();    
    
  

    //------------------ 
    // Return out if the hoverNode is the Thumbnail element.
    // (We don't need to reposition it.)
    //------------------ 
    if (this.currMousewheelThumbnail_.hoverNode === this.currMousewheelThumbnail_.getElement()) { return };



    //------------------ 
    // Reposition if the Thumbnail hover element is
    // different than the Thumbnail element.
    //------------------ 
    var eltPos = utils.style.absolutePosition(this.currMousewheelThumbnail_.getElement());
    utils.style.setStyle(this.currMousewheelThumbnail_.hoverNode, {
	'position': 'absolute',
	'top': eltPos['top'], 
	'left': eltPos['left'],
	'z-index': 10000
    });
    
};




/**
 * Sets the relevant classes based on the 'category' argument. 
 * Categories are: thumbnail, image and 'text'.
 *
 * @param {!string} nodeCategory
 * @private
 */
utils.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = function (nodeCategory) {

    var classes = [];
    var element;
    for (var thumbID in this.Thumbnails_) {
	switch(nodeCategory){
	case 'thumbnail':
	    classes = this.thumbnailClasses_;
	    element = this.Thumbnails_[thumbID].getElement();
	    break;
	case 'image':
	    classes = this.thumbnailImageClasses_;
	    element = this.Thumbnails_[thumbID].getImage();
	    break;
	case 'text':
	    classes = this.thumbnailTextClasses_;
	    element = this.Thumbnails_[thumbID].getText();
	    break;   
	default:
	    break;
	}
    	goog.dom.classes.addRemove(element,  goog.dom.classes.get(element), classes);
	
    }
}




/**
* @param {!string} className
* @public
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailClass = function (className) {
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
* @param {!string} className
* @public
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailImageClass = function (className) {
    //window.console.log(" \n\n\n*********   add thumbnail image class", className);
    this.thumbnailImageClasses_.push(className);
    this.setThumbnailClasses_('image');
}




/**
* @param {!string} className
* @public
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass = function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
* @param {Object=}
* @public
*/
utils.ui.ThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       utils.style.setStyle(this.getElement(), opt_args);
   }
}



goog.exportSymbol('utils.ui.ThumbnailGallery', utils.ui.ThumbnailGallery);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.makeThumbnail', utils.ui.ThumbnailGallery.prototype.makeThumbnail);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.addThumbnail', utils.ui.ThumbnailGallery.prototype.addThumbnail);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.insertAndMakeThumbnail', utils.ui.ThumbnailGallery.prototype.insertAndMakeThumbnail);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.addThumbnailClass', utils.ui.ThumbnailGallery.prototype.addThumbnailClass);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.addThumbnailImageClass', utils.ui.ThumbnailGallery.prototype.addThumbnailImageClass);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass', utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass);
goog.exportSymbol('utils.ui.ThumbnailGallery.prototype.updateStyle', utils.ui.ThumbnailGallery.prototype.updateStyle);

