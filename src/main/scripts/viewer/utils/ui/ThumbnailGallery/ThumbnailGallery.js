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
 * @extends {utils.ui.ScrollableContainer}
 * @constructor
 */
goog.provide('utils.ui.ThumbnailGallery');
utils.ui.ThumbnailGallery = function (opt_args) {

    //------------------
    // Call parent
    //------------------ 
    utils.ui.ScrollableContainer.call(this);
    this.getElement().setAttribute('id',  "utils.ui.ThumbnailGallery" + utils.dom.uniqueId());



    /**
     * @type {?utils.ui.ScrollableContainer}
     * @private
     */
    this.ScrollableContainer_ = null;




    /**
     * @type {?Array.<utils.ui.Thumbnail> | ?Object<string, utils.ui.Thumbnail>}
     * @private
     */
    this.Thumbnails_ = null;





    //------------------
    // Reset thumbnails
    //------------------ 
    this.Thumbnails_ = {};



    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = new utils.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb.element);
    this.thumbnailClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_CLASS);
    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb.image);
    this.thumbnailImageClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS);
    this.thumbnailTextClasses_ = goog.dom.classes.get(tempThumb.text);
    this.thumbnailTextClasses_.push(utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS);
    goog.dom.removeNode(tempThumb.element);
    delete tempThumb;

    
}
goog.inherits(utils.ui.ThumbnailGallery, utils.ui.ScrollableContainer);
goog.exportSymbol('utils.ui.ThumbnailGallery', utils.ui.ThumbnailGallery);



utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX = 
    /**@type {string} @const*/ goog.getCssName('utils-ui-scrollablethumbnailgallery');
utils.ui.ThumbnailGallery.ELEMENT_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, '');
utils.ui.ThumbnailGallery.DIALOG_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'dialog');
utils.ui.ThumbnailGallery.THUMBNAIL_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail');
utils.ui.ThumbnailGallery.THUMBNAIL_IMAGE_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-image');
utils.ui.ThumbnailGallery.THUMBNAIL_TEXT_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
utils.ui.ThumbnailGallery.THUMBNAILGALLERY_CLASS = 
    /**@type {string} @const*/ goog.getCssName(utils.ui.ThumbnailGallery.CSS_CLASS_PREFIX, 'thumbnailgallery');








/**
* @param {!String} thumbnailUrl The url for the thumbnail image.
* @param {!String} displayText The display text of the thumbnail.
*/
utils.ui.ThumbnailGallery.prototype.makeThumbnail = function(thumbnailUrl, displayText) {

    var thumbnail = new utils.ui.Thumbnail();
    
    goog.dom.classes.addRemove(thumbnail.element, goog.dom.classes.get(thumbnail.element), this.thumbnailClasses_);
    goog.dom.classes.addRemove(thumbnail.text, goog.dom.classes.get(thumbnail.text), this.thumbnailTextClasses_);
    goog.dom.classes.addRemove(thumbnail.image, goog.dom.classes.get(thumbnail.image), this.thumbnailImageClasses_);

    thumbnail.setImage(thumbnailUrl);
    thumbnail.setText(displayText);

    return thumbnail;
        
}




/**
* @param {!utils.ui.Thumbnail} thumbnail The thumbnail object to add to the scrollable container.
* @param {string= | Array.string=} opt_folders The optional zippy folder name to put the thumbnail in.  Otherwise it goes to the parent.
*/
utils.ui.ThumbnailGallery.prototype.addThumbnail = function(thumbnail, opt_folders) {

    var folders = (opt_folders === undefined) ? ['parentFolder'] : 
	goog.isArray(opt_folders) ? opt_folders : [opt_folders];
    var contents = {};
    var boundHoverScroll = this.hoverScroll.bind(this);

    //
    // Bind clone to mouse wheel.
    //
    this.bindToMouseWheel(thumbnail.hoverNode, boundHoverScroll);


    //
    // Track thumbnail.
    //
    this.Thumbnails_[thumbnail.element.id] = thumbnail;
    

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
	    currContents[folders[i]] = thumbnail.element;
	}
    }
    this.addContents(contents);
}




/**
* @param {!string} thumbnailUrl The url for the thumbnail image.
* @param {!string} displayText The display text of the thumbnail.
* @param {string= | Array.string=} opt_folders The optional zippy folder name to put the thumbnail in.  Otherwise it goes to the parent.
*/
utils.ui.ThumbnailGallery.prototype.insertThumbnail = function(thumbnailUrl, displayText, opt_folders) {
    var thumbnail = this.makeThumbnail(thumbnailUrl, displayText)
    this.addThumbnail(thumbnail, opt_folders);
    this.setThumbnailClasses_('image');
    this.setThumbnailClasses_('text');
    this.setThumbnailClasses_('thumbnail');
    return thumbnail;
}



/**
* @param {!String}
*/
utils.ui.ThumbnailGallery.prototype.hoverScroll = function(){
    
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

    if (!this.currMousewheelThumbnail_){ return }
    this.currMousewheelThumbnail_._onMouseOver();    
    
  
    // Return out if the hoverNode is the element.
    // We don't need to reposition it.
    if (this.currMousewheelThumbnail_.hoverNode === this.currMousewheelThumbnail_.element) { return };


    // Set position otherwise
    var eltPos = utils.style.absolutePosition(this.currMousewheelThumbnail_.element);
    utils.style.setStyle(this.currMousewheelThumbnail_.hoverNode, {
	'position': 'absolute',
	'top': eltPos['top'], 
	'left': eltPos['left'],
	'z-index': 10000
    });
    
};




/**
* @param {!String} nodeCategory
* @private
*/
utils.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = function (nodeCategory) {

    var classes = [];
    var element;
    for (var thumbID in this.Thumbnails_) {
	switch(nodeCategory){
	case 'thumbnail':
	    classes = this.thumbnailClasses_;
	    element = this.Thumbnails_[thumbID].element;
	    break;
	case 'image':
	    classes = this.thumbnailImageClasses_;
	    element = this.Thumbnails_[thumbID].image;
	    break;
	case 'text':
	    classes = this.thumbnailTextClasses_;
	    element = this.Thumbnails_[thumbID].text;
	    break;   
	default:
	    break;
	}
    	goog.dom.classes.addRemove(element,  goog.dom.classes.get(element), classes);
	
    }
}




/**
* @param {!String} className
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailClass = function (className) {
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
* @param {!String} className
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailImageClass = function (className) {
    window.console.log(" \n\n\n*********   add thumbnail image class", className);
    this.thumbnailImageClasses_.push(className);
    this.setThumbnailClasses_('image');
}




/**
* @param {!String} className
*/
utils.ui.ThumbnailGallery.prototype.addThumbnailTextClass = function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
* @param {Object=}
*/
utils.ui.ThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       utils.style.setStyle(this.getElement(), opt_args);
   }
}
