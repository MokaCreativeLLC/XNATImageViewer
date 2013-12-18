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
goog.require('utils.dom');
goog.require('utils.ui.Thumbnail');
goog.require('utils.ui.ScrollableContainer');







/**
 * 
 * @param {Object=}
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('utils.ui.ScrollableThumbnailGallery');
utils.ui.ScrollableThumbnailGallery = function (opt_args) {

    var that = this;
    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;


    //------------------
    // Define the element.
    //------------------
    this._element = utils.dom.makeElement('div', parent, "utils.ui.ScrollableThumbnailGallery");
    goog.dom.classes.set(this._element, utils.ui.ScrollableThumbnailGallery.ELEMENT_CLASS);

    this.ScrollableContainer_ = new utils.ui.ScrollableContainer();
    this._element.appendChild(this.ScrollableContainer_._element)

    this.Thumbnails_ = {};



    //------------------
    // Apply the Thumbnail classes.
    //------------------  
    var tempThumb = new utils.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb._element);
    this.thumbnailClasses_.push(utils.ui.ScrollableThumbnailGallery.THUMBNAIL_CLASS);

    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb._image);
    this.thumbnailImageClasses_.push(utils.ui.ScrollableThumbnailGallery.THUMBNAIL_IMAGE_CLASS);

    this.thumbnailTextClasses_ = goog.dom.classes.get(tempThumb._displayText);
    this.thumbnailTextClasses_.push(utils.ui.ScrollableThumbnailGallery.THUMBNAIL_TEXT_CLASS);

    goog.dom.removeNode(tempThumb._element);
    delete tempThumb;

    
}
goog.exportSymbol('utils.ui.ScrollableThumbnailGallery', utils.ui.ScrollableThumbnailGallery);



utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('utils-ui-scrollablethumbnailgallery');
utils.ui.ScrollableThumbnailGallery.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, '');
utils.ui.ScrollableThumbnailGallery.DIALOG_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, 'dialog');
utils.ui.ScrollableThumbnailGallery.THUMBNAIL_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail');
utils.ui.ScrollableThumbnailGallery.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-image');
utils.ui.ScrollableThumbnailGallery.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
utils.ui.ScrollableThumbnailGallery.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnailgallery');





/**
 * @type {?utils.ui.ScrollableContainer}
 * @private
 */
utils.ui.ScrollableThumbnailGallery.prototype.ScrollableContainer_ = null;



/**
 * @type {?Array.<utils.ui.Thumbnail> | ?Object<string, utils.ui.Thumbnail>}
 * @private
 */
utils.ui.ScrollableThumbnailGallery.prototype.Thumbnails_ = null;




/**
* @param {!String} thumbnailUrl The url for the thumbnail image.
* @param {!String} displayText The display text of the thumbnail.
*/
utils.ui.ScrollableThumbnailGallery.prototype.makeThumbnail = function(thumbnailUrl, displayText) {

    var thumbnail = new utils.ui.Thumbnail();
    
    goog.dom.classes.addRemove(thumbnail._element, goog.dom.classes.get(thumbnail._element), this.thumbnailClasses_);
    goog.dom.classes.addRemove(thumbnail._displayText, goog.dom.classes.get(thumbnail._displayText), this.thumbnailTextClasses_);
    goog.dom.classes.addRemove(thumbnail._image, goog.dom.classes.get(thumbnail._image), this.thumbnailImageClasses_);

    thumbnail.setImage(thumbnailUrl);
    thumbnail.setDisplayText(displayText);

    return thumbnail;
        
}



/**
* @param {!utils.ui.Thumbnail} thumbnail The thumbnail object to add to the scrollable container.
* @param {String=} opt_folder The optional zippy folder name to put the thumbnail in.  Otherwise it goes to the parent.
*/
utils.ui.ScrollableThumbnailGallery.prototype.addThumbnail = function(thumbnail, opt_folder) {

    var opt_folder = (opt_folder === undefined) ? 'parentFolder' : opt_folder;
    var contents = {};

    var boundHoverScroll = this.hoverScroll.bind(this);
    // Bind clone to mouse wheel.
    this.ScrollableContainer_.bindToMouseWheel(thumbnail._hoverClone, boundHoverScroll);

    // Track thumbnail.
    this.Thumbnails_[thumbnail._element.id] = thumbnail;
    
    // Add contents to the ScrollableContainer.
    contents[opt_folder] = thumbnail._element
    this.ScrollableContainer_.addContents(contents);
}




/**
* @param {!String} thumbnailUrl The url for the thumbnail image.
* @param {!String} displayText The display text of the thumbnail.
* @param {String=} opt_folder The optional zippy folder name to put the thumbnail in.  Otherwise it goes to the parent.
*/
utils.ui.ScrollableThumbnailGallery.prototype.makeAddThumbnail = function(thumbnailUrl, displayText, opt_folder) {
    var thumbnail = this.makeThumbnail(thumbnailUrl, displayText)
    this.addThumbnail(thumbnail, opt_folder);
    return thumbnail;
}



/**
* @param {!String}
*/
utils.ui.ScrollableThumbnailGallery.prototype.hoverScroll = function(){
    
    var elementMouseIsOver = document.elementFromPoint(event.clientX, event.clientY);
    var originalThumbnail =  goog.dom.getAncestorByClass(elementMouseIsOver, utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    if (!originalThumbnail) { return };
    var originalThumbnailId  = originalThumbnail.getAttribute('thumbnailid');

    if (originalThumbnailId === null) {
	for (var thumbID in this.Thumbnails_) {
	    this.Thumbnails_[thumbID]._onMouseOut();
	}
	originalThumbnailId = goog.dom.getAncestorByClass(elementMouseIsOver, utils.ui.Thumbnail.CSS_CLASS_PREFIX).id;

	// Unhover and exit if we're not over a thumbnail, 
	if (originalThumbnailId === null) { 
	    this.currMousewheelThumbnail_.setHovered(false); 
	    return;
	}
    }
    


    if (this.currMousewheelThumbnail_ && (this.currMousewheelThumbnail_ !== this.Thumbnails_[originalThumbnailId])){
	this.currMousewheelThumbnail_._onMouseOut(); 
    } 
    this.currMousewheelThumbnail_ = this.Thumbnails_[originalThumbnailId];
    this.currMousewheelThumbnail_._onMouseOver();    
    
  
    // Return out if the _hoverClone is the element.
    // We don't need to reposition it.
    if (this.currMousewheelThumbnail_._hoverClone === this.currMousewheelThumbnail_._element) { return };


    // Set position otherwise
    var eltPos = utils.style.absolutePosition(this.currMousewheelThumbnail_._element);
    utils.style.setStyle(this.currMousewheelThumbnail_._hoverClone, {
	'position': 'absolute',
	'top': eltPos['top'], 
	'left': eltPos['left'],
	'z-index': 10000
    });
    
};




/**
* @param {!String}
* @private
*/
utils.ui.ScrollableThumbnailGallery.prototype.setThumbnailClasses_ = function (nodeCategory) {

    var classes = [];
    var element;
    for (var thumbID in this.Thumbnails_) {
	switch(nodeCategory){
	case 'thumbnail':
	    classes = this.thumbnailClasses_;
	    element = this.Thumbnails_[thumbID]._element;
	    break;
	case 'image':
	    classes = this.thumbnailImageClasses_;
	    element = this.Thumbnails_[thumbID]._image;
	    break;
	case 'text':
	    classes = this.thumbnailTextClasses_;
	    element = this.Thumbnails_[thumbID]._displayText;
	    break;   
	default:
	    break;
	}
    	goog.dom.classes.addRemove(element,  goog.dom.classes.get(element), classes);
	this.Thumbnails_[thumbID].update();
    }
    
}




/**
* @param {!String}
*/
utils.ui.ScrollableThumbnailGallery.prototype.addThumbnailClass = function (className) {
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
* @param {!String}
*/
utils.ui.ScrollableThumbnailGallery.prototype.addThumbnailImageClass = function (className) {
    this.thumbnailImageClasses_.push(className);
    this.setThumbnailClasses_('image');
}




/**
* @param {!String}
*/
utils.ui.ScrollableThumbnailGallery.prototype.addThumbnailTextClass = function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
* @param {!String}
*/
utils.ui.ScrollableThumbnailGallery.prototype.addScrollableContainerClass = function (className) {
    goog.dom.classes.add(this.ScrollableContainer_, className);
}




/**
* @param {Object=}
*/
utils.ui.ScrollableThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       utils.style.setStyle(this._element, opt_args);
   }
}
