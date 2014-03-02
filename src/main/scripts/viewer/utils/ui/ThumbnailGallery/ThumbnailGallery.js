/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');

// utils
goog.require('utils.style');
goog.require('utils.dom');
goog.require('utils.ui.Thumbnail');
goog.require('utils.ui.ScrollableContainer');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain utils.ui.Thumbnail objects and methods pertaining to their 
 * interaction.
 * @constructor
 * @extends {utils.ui.ScrollableContainer}
 */
goog.provide('utils.ui.ThumbnailGallery');
utils.ui.ThumbnailGallery = function () {
    goog.base(this);
    this.getElement().setAttribute('id', "utils.ui.ThumbnailGallery" + '_' + 
				   goog.string.createUniqueString());
    this.setDefaultClasses_();    
}
goog.inherits(utils.ui.ThumbnailGallery, utils.ui.ScrollableContainer);
goog.exportSymbol('utils.ui.ThumbnailGallery', utils.ui.ThumbnailGallery);



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
* @const*/ 
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




/**
 * @type {Object<string, utils.ui.Thumbnail>}
 * @private
 */
utils.ui.ThumbnailGallery.prototype.Thumbs_;



/**
 * Makes and returns a utils.ui.Thumbmnail, removing the default 
 * element classes, and applying the classes pertinent to the
 * ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @return {!utils.ui.Thumbnail}
 * @public
 */
utils.ui.ThumbnailGallery.prototype.createThumbnail = function(imageUrl, 
							     displayText) {

    var thumbnail = /**@type {!utils.ui.Thumbnail} */ new utils.ui.Thumbnail();
 
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
 * @param {string= | Array.<string>=} opt_folders The optional zippy structure.
 * @param {!number} opt_minFolderInd The optional index of the 
 *     zippy structure to minimize.  All are expanded otherwise
 * folder name to put the thumbnail in.  Otherwise it goes to the parent.
 * @public
 */
utils.ui.ThumbnailGallery.prototype.addThumbnail = 
function(thumbnail, opt_folders) {
    // Bind clone to mouse wheel.
    this.bindToMouseWheel(thumbnail.getHoverable(), 
			  this.onHoverAndScroll_.bind(this));
    // Track thumbnail.
    if (!this.Thumbs_){
	this.Thumbs_ = {};
    }
    this.Thumbs_[thumbnail.getElement().getAttribute('id')] = thumbnail;
    // Set folders

    //window.console.log(opt_folders, "\n\nMIN", opt_minFolderInd);
    this.addElementAndFolders(thumbnail.getElement(), 
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
	var thumbnail = /**@type {!utils.ui.Thumbnail} */
	this.createThumbnail(imageUrl, displayText)
	this.addThumbnail(thumbnail, opt_folders);
	this.setThumbnailClasses_('image');
	this.setThumbnailClasses_('text');
	this.setThumbnailClasses_('thumbnail');
	return thumbnail;
}



/**
 * @type {string}
 * @private
 */
utils.ui.ThumbnailGallery.prototype.storedHoverThumbId_;




/**
 * As stated.
 * @private
 */
utils.ui.ThumbnailGallery.prototype.clearHoverThumb_ = function(){ 
    goog.object.forEach(this.Thumbs_, function(thumb){
	thumb.mouseOut();
    })
    this.storedHoverThumbId_ = null;
}



/**
* Conducts the needed thumbnail element style changes when scrolling
* and hovering over the thumbnail gallery.  
* @private
*/
utils.ui.ThumbnailGallery.prototype.onHoverAndScroll_ = function(){    

    //window.console.log('onHoverAndScroll');
    var mouseElt = /**@type {!Element} */
    document.elementFromPoint(event.clientX, event.clientY);
    var mouseThumb = /**@type {!Element} */
    goog.dom.getAncestorByClass(mouseElt, utils.ui.Thumbnail.CSS_CLASS_PREFIX);

    // Exit out if not over a thumbnail or thumbnail's hoverable.
    if (!mouseThumb) { 
	this.clearHoverThumb_();
	return;
    }

    var hoverThumbId = /**@type{!string}*/ 
    mouseThumb.getAttribute('thumbnailid');
    if (this.storedHoverThumbId_ !== hoverThumbId) {
	this.clearHoverThumb_();
	this.storedHoverThumbId_ = hoverThumbId;
	this.Thumbs_[this.storedHoverThumbId_].mouseOver();
	//window.console.log(this.storedHoverThumbId_) 
	//window.console.log(
	//this.Thumbs_[this.storedHoverThumbId_].getHoverable())
    }
    this.Thumbs_[this.storedHoverThumbId_].repositionHoverable();
};




/**
 * Sets the relevant classes based on the 'category' argument. 
 * Categories are: thumbnail, image and 'text'.
 * @param {!string} nodeCategory
 * @private
 */
utils.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = 
    function (nodeCategory) {

	/**
	 * @type {Element} 
	 */
	var element;
	var classes = /**@type {!Array.string} */ [];
	var thumbID = /**@type {!string} */ '';
	for (thumbID in this.Thumbs_) {
	    switch(nodeCategory){
	    case 'thumbnail':
		classes = this.thumbnailClasses_;
		element = this.Thumbs_[thumbID].getElement();
		break;
	    case 'image':
		classes = this.thumbnailImageClasses_;
		element = this.Thumbs_[thumbID].getImage();
		break;
	    case 'text':
		classes = this.thumbnailTextClasses_;
		element = this.Thumbs_[thumbID].getText();
		break;   
	    default:
		break;
	    }
    	    goog.dom.classes.addRemove(element,  
				       goog.dom.classes.get(element), classes);
	    
	}
}




/**
 * Adds a CSS class to the the thumbnail.
 * @param {!string} className
 * @public
 */
utils.ui.ThumbnailGallery.prototype.addThumbnailClass = function (className) {
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
 * Adds a CSS class to the the thumbnail image.
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
 * Adds a CSS class to the the thumbnail text.
 * @param {!string} className
 * @public
 */
utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass = 
function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
 * Generic update style function.
 * @param {Object=}
 * @public
 */
utils.ui.ThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       utils.style.setStyle(this.getElement(), opt_args);
   }
}




/**
 * Sets the default classes of the various elements within the class.
 * @private
 */
utils.ui.ThumbnailGallery.prototype.setDefaultClasses_ = function() {
    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = /**@type {!utils.ui.Thumbnail}*/ new utils.ui.Thumbnail();
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

