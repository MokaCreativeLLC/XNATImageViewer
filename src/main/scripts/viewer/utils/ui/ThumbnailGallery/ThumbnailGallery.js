/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');

// utils
goog.require('utils.style');
goog.require('utils.dom');
goog.require('utils.ui.Thumbnail');
goog.require('utils.ui.ScrollableContainer');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain utils.ui.Thumbnail objects.
 * @constructor
 * @extends {utils.ui.ScrollableContainer}
 */
goog.provide('utils.ui.ThumbnailGallery');
utils.ui.ThumbnailGallery = function () {
    goog.base(this);
    this.getElement().setAttribute('id', "utils.ui.ThumbnailGallery" + '_' + 
				   goog.string.createUniqueString());
    this.setClasses_();    
}
goog.inherits(utils.ui.ThumbnailGallery, utils.ui.ScrollableContainer);
goog.exportSymbol('utils.ui.ThumbnailGallery', utils.ui.ThumbnailGallery);



/**
 * @type {Object<string, utils.ui.Thumbnail>}
 * @private
 */
utils.ui.ThumbnailGallery.prototype.Thumbnails_;



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
utils.ui.ThumbnailGallery.prototype.createThumbnail = function(imageUrl, 
							     displayText) {

    var thumbnail = new utils.ui.Thumbnail();
 
    goog.dom.classes.addRemove(thumbnail.getElement(), 
			       goog.dom.classes.get(thumbnail.getElement()), 
			       this.thumbnailClasses_);
    goog.dom.classes.addRemove(thumbnail.getText(), 
			       goog.dom.classes.get(thumbnail.getText()), 
			       this.thumbnailTextClasses_);
    goog.dom.classes.addRemove(thumbnail.getImage(), 
			       goog.dom.classes.get(thumbnail.getImage()), 
			       this.thumbnailImageClasses_);

    thumbnail.setImage(imageUrl);
    thumbnail.setText(displayText);

    return thumbnail;
        
}




/**
 * Adds a thumbnail to the gallery, or a gallery zippy if the opt_folders 
 * argument is provided.
 *
 * @param {!utils.ui.Thumbnail} thumbnail The thumbnail object to add to the 
 *   scrollable container.
 * @param {string= | Array.<string>=} opt_folders The optional zippy 
 * folder name to put the thumbnail in.  Otherwise it goes to the parent.
 * @public
 */
utils.ui.ThumbnailGallery.prototype.addThumbnail = function(thumbnail, 
							    opt_folders) {
    // Bind clone to mouse wheel.
    this.bindToMouseWheel(thumbnail.getHoverable(), 
			  this.onHoverAndScroll_.bind(this));
    // Track thumbnail.
    if (!this.Thumbnails_){
	this.Thumbnails_ = {};
    }
    this.Thumbnails_[goog.getUid(thumbnail)] = thumbnail;
    // Set folders

    window.console.log(opt_folders);
    this.addElementAndFolders_(thumbnail.getElement(), 
			      (opt_folders === undefined) ? ['parentFolder'] : 
			      goog.isArray(opt_folders) ? opt_folders : 
			      [opt_folders])
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
utils.ui.ThumbnailGallery.prototype.createAndAddThumbnail = 
    function(imageUrl, displayText, opt_folders) {
	var thumbnail = this.createThumbnail(imageUrl, displayText)
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
    var hoveredThumbnail =  goog.dom.getAncestorByClass(mouseOverElt, 
				utils.ui.Thumbnail.CSS_CLASS_PREFIX);
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
	    this.Thumbnails_[thumbID]['EVENTS'].runEvent('MOUSEOUT');
	}

	//
	// Refevert to the actual ID of the element, assuming
	// that the hovered element is a descendent of a thumbnail.
	//
	originalThumbnailId = goog.dom.getAncestorByClass(mouseOverElt, 
					utils.ui.Thumbnail.CSS_CLASS_PREFIX).id;

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
    if (this.currMousewheelThumbnail_ && (this.currMousewheelThumbnail_ 
			!== this.Thumbnails_[originalThumbnailId])){
	this.currMousewheelThumbnail_['EVENTS'].runEvent('MOUSEOUT'); 
    } 
    this.currMousewheelThumbnail_ = this.Thumbnails_[originalThumbnailId];
    //window.console.log("\n\nThe mouse is over", 
    // this.Thumbnails_[originalThumbnailId].element_.id);
    //window.console.log("This is showing", 
    // this.currMousewheelThumbnail_.element_.id);


    //------------------ 
    // If there's no new hovered thunbnail,
    // return out, otherwise call the mouseOver.
    //------------------ 
    if (!this.currMousewheelThumbnail_){ return }
    this.currMousewheelThumbnail_['EVENTS'].runEvent('MOUSEOVER');   
    
  

    //------------------ 
    // Return out if the hoverNode is the Thumbnail element.
    // (We don't need to reposition it.)
    //------------------ 
    if (this.currMousewheelThumbnail_.getHoverable() === 
	this.currMousewheelThumbnail_.getElement()) { return };



    //------------------ 
    // Reposition if the Thumbnail hover element is
    // different than the Thumbnail element.
    //------------------ 
    this.currMousewheelThumbnail_.repositionHoverable();
};




/**
 * Sets the relevant classes based on the 'category' argument. 
 * Categories are: thumbnail, image and 'text'.
 *
 * @param {!string} nodeCategory
 * @private
 */
utils.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = 
    function (nodeCategory) {

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
    	    goog.dom.classes.addRemove(element,  
				       goog.dom.classes.get(element), classes);
	    
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
utils.ui.ThumbnailGallery.prototype.addThumbnailImageClass = 
    function (className) {
	//window.console.log(" \n\n\n*********   
	//add thumbnail image class", className);
	this.thumbnailImageClasses_.push(className);
	this.setThumbnailClasses_('image');
    }




/**
 * @param {!string} className
 * @public
 */
utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass = 
    function (className) {
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




/**
 * @private
 */
utils.ui.ThumbnailGallery.prototype.setClasses_ = function() {
    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = new utils.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb.getElement());
    this.thumbnailClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_CLASS);
    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb.getImage());
    this.thumbnailImageClasses_.push(
	utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS);
    this.thumbnailTextClasses_ = goog.dom.classes.get(tempThumb.getText());
    this.thumbnailTextClasses_.push(
	utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS);
    goog.dom.removeNode(tempThumb.getElement());
    delete tempThumb;
}




/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX = 
    goog.getCssName('utils-ui-scrollablethumbnailgallery');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.ELEMENT_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, '');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.DIALOG_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'dialog');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.THUMBNAIL_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 
		    'thumbnail-image');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 
		    'thumbnail-displaytext');

/**
* @type {string} 
* @expose 
* @const
*/ 
utils.ui.ThumbnailGallery.THUMBNAILGALLERY_CLASS = 
    goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 
		    'thumbnailgallery');
