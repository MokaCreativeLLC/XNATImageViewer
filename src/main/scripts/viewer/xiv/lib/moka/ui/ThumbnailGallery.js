/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');

// moka
goog.require('moka.style');
goog.require('moka.dom');
goog.require('moka.ui.Thumbnail');
goog.require('moka.ui.ScrollableContainer');
goog.require('moka.ui.ZippyTree');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain moka.ui.Thumbnail objects and methods pertaining to their 
 * interaction.
 * @constructor
 * @extends {moka.ui.ScrollableContainer}
 */
goog.provide('moka.ui.ThumbnailGallery');
moka.ui.ThumbnailGallery = function () {
    goog.base(this);
    this.setDefaultClasses_();    

    /**
     * @private
     * @type {!moka.ui.ZippyTree}
     */
    this.ZippyTree_ = new moka.ui.ZippyTree();
    goog.dom.append(this.getScrollArea(), this.ZippyTree_.getElement());
    
    // Do fade in effects when zippy tree contents is added.
    this.ZippyTree_.toggleFadeInFx(true);

    // Remap slider each time content is added.
    goog.events.listen(this.ZippyTree_,
       moka.ui.ZippyTree.EventType.CONTENTADDED, function() {
	  this.mapSliderToContents();
       }.bind(this))
}
goog.inherits(moka.ui.ThumbnailGallery, moka.ui.ScrollableContainer);
goog.exportSymbol('moka.ui.ThumbnailGallery', moka.ui.ThumbnailGallery);



/**
 * @type {!string} 
 * @expose
 * @const
 */
moka.ui.ThumbnailGallery.ID_PREFIX = 'moka.ui.ThumbnailGallery';



/**
 * @type {!Array.string} 
 * @const
 */ 
moka.ui.ThumbnailGallery.CSS_SUFFIX = {
    DIALOG : 'dialog',
    THUMBNAIL: 'thumbnail', 
    THUMBNAIL_IMAGE: 'thumbnail-image',
    THUMBNAIL_DISPLAYTEXT: 'thumbnail-text', 

}



/**
 * @type {Object<string, moka.ui.Thumbnail>}
 * @private
 */
moka.ui.ThumbnailGallery.prototype.Thumbs_;



/**
 * @type {moka.ui.ZippyTree}
 * @private
 */
moka.ui.ThumbnailGallery.prototype.ZippyTree_;



/**
 * @return {moka.ui.ZippyTree}
 * @private
 */
moka.ui.ThumbnailGallery.prototype.getZippyTree = function(){
    return this.ZippyTree_;
}



/**
 * Makes and returns a moka.ui.Thumbmnail, removing the default 
 * element classes, and applying the classes pertinent to the
 * ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @return {!moka.ui.Thumbnail}
 * @public
 */
moka.ui.ThumbnailGallery.prototype.createThumbnail = function(imageUrl, 
							     displayText) {

    var thumbnail = /**@type {!moka.ui.Thumbnail} */ new moka.ui.Thumbnail();
 
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
 * @param {!moka.ui.Thumbnail} thumbnail The thumbnail object to add to the 
 *   scrollable container.
 * @param {string= | Array.<string>=} opt_folders The optional zippy structure.
 * @public
 */
moka.ui.ThumbnailGallery.prototype.addThumbnail = 
function(thumbnail, opt_folders) {
    //window.console.log('Add thumbnail', thumbnail, opt_folders);

    // Bind clone to mouse wheel.
    this.getSlider().bindToMouseWheel(thumbnail.getHoverable());
    goog.events.listen(this.getSlider(), 
		     moka.ui.GenericSlider.EventType.MOUSEWHEEL, 
			 this.onHoverAndScroll_.bind(this));
    // Track thumbnail.
    this.Thumbs_ = this.Thumbs_ ? this.Thumbs_ : {};
    this.Thumbs_[thumbnail.getElement().getAttribute('id')] = thumbnail;

    //window.console.log(opt_folders, "\n\nMIN", opt_minFolderInd);
    
    
    this.ZippyTree_.addContents(thumbnail.getElement(), opt_folders);
}



/**
 * Makes and inserts a thumbnail in to a given part of the ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @param {string= | Array.string=} opt_folders The optional zippy 
 * folder name to put the thumbnail in.  Otherwise it goes to the parent.
 * @return {!moka.ui.Thumbnail}
 * @public
 */
moka.ui.ThumbnailGallery.prototype.createAndAddThumbnail = 
    function(imageUrl, displayText, opt_folders) {
	var thumbnail = /**@type {!moka.ui.Thumbnail} */
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
moka.ui.ThumbnailGallery.prototype.storedHoverThumbId_;




/**
 * As stated.
 * @private
 */
moka.ui.ThumbnailGallery.prototype.clearHoverThumb_ = function(){ 
    goog.object.forEach(this.Thumbs_, function(thumb){
	thumb.onMouseOut();
    })
    this.storedHoverThumbId_ = null;
}



/**
* Conducts the needed thumbnail element style changes when scrolling
* and hovering over the thumbnail gallery.  
* @private
*/
moka.ui.ThumbnailGallery.prototype.onHoverAndScroll_ = function(){    

    var mouseElt = /**@type {!Element} */
    document.elementFromPoint(event.clientX, event.clientY);
    var mouseThumb = /**@type {!Element} */
    goog.dom.getAncestorByClass(mouseElt, moka.ui.Thumbnail.ELEMENT_CLASS);


    // Exit out if not over a thumbnail or thumbnail's hoverable.
    if (!mouseThumb) { 
	this.clearHoverThumb_();
	return;
    }

    var hoverThumbId = /**@type{!string}*/ 
    mouseThumb.id.replace(moka.ui.Thumbnail.HOVERABLE_PREFIX, '');

    if (this.storedHoverThumbId_ !== hoverThumbId) {

	this.clearHoverThumb_();
	this.storedHoverThumbId_ = hoverThumbId;
	//window.console.log(this.storedHoverThumbId_) ;
	//window.console.log(this.Thumbs_);
	//window.console.log(
	//this.Thumbs_[this.storedHoverThumbId_].getHoverable())
	this.Thumbs_[this.storedHoverThumbId_].onMouseOver();

    }
    this.Thumbs_[this.storedHoverThumbId_].repositionHoverable();
};




/**
 * Sets the relevant classes based on the 'category' argument. 
 * Categories are: thumbnail, image and 'text'.
 * @param {!string} nodeCategory
 * @private
 */
moka.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = 
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
moka.ui.ThumbnailGallery.prototype.addThumbnailClass = function (className) {
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
 * Adds a CSS class to the the thumbnail image.
 * @param {!string} className
 * @public
 */
moka.ui.ThumbnailGallery.prototype.addThumbnailImageClass = 
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
moka.ui.ThumbnailGallery.prototype.addThumbnailTextClass = 
function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
 * Generic update style function.
 * @param {Object=}
 * @public
 */
moka.ui.ThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       moka.style.setStyle(this.getElement(), opt_args);
   }
}




/**
 * Sets the default classes of the various elements within the class.
 * @private
 */
moka.ui.ThumbnailGallery.prototype.setDefaultClasses_ = function() {
    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = /**@type {!moka.ui.Thumbnail}*/ new moka.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb.getElement());
    this.thumbnailClasses_.push(moka.ui.ThumbnailGallery.CSS.THUMBNAIL);
    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb.getImage());
    this.thumbnailImageClasses_.push(
	moka.ui.ThumbnailGallery.CSS.THUMBNAIL_IMAGE);
    this.thumbnailTextClasses_ = goog.dom.classes.get(tempThumb.getText());
    this.thumbnailTextClasses_.push(
	moka.ui.ThumbnailGallery.CSS.THUMBNAIL_TEXT);
    goog.dom.removeNode(tempThumb.getElement());
    delete tempThumb;
}

