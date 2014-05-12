/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');

// nrg
goog.require('nrg.style');
goog.require('nrg.dom');
goog.require('nrg.ui.Thumbnail');
goog.require('nrg.ui.ScrollableContainer');
goog.require('nrg.ui.ZippyTree');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain nrg.ui.Thumbnail objects and methods pertaining to their 
 * interaction.
 * @constructor
 * @extends {nrg.ui.ScrollableContainer}
 */
goog.provide('nrg.ui.ThumbnailGallery');
nrg.ui.ThumbnailGallery = function () {
    goog.base(this);
}
goog.inherits(nrg.ui.ThumbnailGallery, nrg.ui.ScrollableContainer);
goog.exportSymbol('nrg.ui.ThumbnailGallery', nrg.ui.ThumbnailGallery);



/**
 * @type {!string} 
 * @expose
 * @const
 */
nrg.ui.ThumbnailGallery.ID_PREFIX = 'nrg.ui.ThumbnailGallery';



/**
 * @type {!Array.string} 
 * @const
 */ 
nrg.ui.ThumbnailGallery.CSS_SUFFIX = {
    DIALOG : 'dialog',
    THUMBNAIL: 'thumbnail', 
    THUMBNAIL_IMAGE: 'thumbnail-image',
    THUMBNAIL_DISPLAYTEXT: 'thumbnail-text', 

}



/**
 * @const
 */
nrg.ui.ThumbnailGallery.THUMB_SORT_TAG = goog.string.createUniqueString();





/**
 * @type {Object.<string, nrg.ui.Thumbnail>}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.Thumbs_;



/**
 * @type {string}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.storedHoverThumbId_;



/**
 * @private
 * @type {nrg.ui.ZippyTree}
 */
nrg.ui.ThumbnailGallery.prototype.ZippyTree_;



/**
 * @type {Array.<string>}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.thumbnailClasses_;



/**
 * @type {Array.<string>}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.thumbnailTextClasses_;



/**
 * @type {Array.<string>}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.thumbnailImageClasses_;



/**
 * @private
 * @type {!boolean}
 */
nrg.ui.ThumbnailGallery.prototype.sortThumbnailsOnInsert_ = false;



/**
 * @private
 * @type {!boolean} bool
 */
nrg.ui.ThumbnailGallery.prototype.sortThumbnailsOnInsert = function(bool){
    this.sortThumbnailsOnInsert_ = bool;
    if (goog.isDefAndNotNull(this.ZippyTree_) 
	&& this.sortThumbnailsOnInsert_){
	this.ZippyTree_.setCustomInsertMethod(
	    nrg.ui.ThumbnailGallery.thumbnailSorter)
    }
}



/**
 * @inheritDoc
 */
nrg.ui.ThumbnailGallery.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);

    this.setDefaultClasses_();    

    //
    // Zippy Tree
    //
    this.ZippyTree_ = new nrg.ui.ZippyTree();
    
    //
    // Apply sort method
    //
    if (this.sortThumbnailsOnInsert_){
	this.ZippyTree_.setCustomInsertMethod(
	    nrg.ui.ThumbnailGallery.thumbnailSorter)
    }


    goog.dom.append(this.getScrollArea(), this.ZippyTree_.getElement());
    //this.ZippyTree_.render(this.getScrollArea());

    // Do fade in effects when zippy tree contents is added.
    this.ZippyTree_.toggleFadeInFx(true);

    this.setZippyTreeEvents_();
}



/**
 * Binary insertion sort algorithim: O(log n) worst case, 
 * which means on set of Thumbnails it will be O(n * log n) worst case.  
 *
 * @public
 * @param {!Element} holderElt
 * @param {!Element} insertElt
 */
nrg.ui.ThumbnailGallery.thumbnailSorter = function(holderElt, insertElt){
    //
    // For no siblings...
    //
    if (!goog.isDefAndNotNull(holderElt.childNodes) || 
	holderElt.childNodes.length == 0) {
	goog.dom.appendChild(holderElt, insertElt);
	return;
    }

    //
    // Preliminary sort params
   //
    var siblings = goog.dom.getChildren(holderElt);


    var insertEltText = 
	insertElt[nrg.ui.ThumbnailGallery.THUMB_SORT_TAG].toLowerCase(); 
    var comparer;
    var compareStr;
    var currSibling;
    var len = siblings.length
    var i = 0;


    //
    // Linear insert
    //
    for (; i < len; i++){

	currSibling = siblings[i];
	//window.console.log(currSibling);
	if (!goog.isDefAndNotNull(currSibling
	    [nrg.ui.ThumbnailGallery.THUMB_SORT_TAG])){
	    continue;
	}

	compareStr = currSibling
	    [nrg.ui.ThumbnailGallery.THUMB_SORT_TAG].toLowerCase();
	comparer = goog.string.numerateCompare(insertEltText, compareStr)

	// insert only when the text is less...
	if (comparer < 0) {
	    goog.dom.insertSiblingBefore(insertElt, currSibling);
	    return;
	}
    }

    //
    // Otherwise, insert at the end...
    //
    goog.dom.appendChild(holderElt, insertElt);
};




/**
 * @return {nrg.ui.ZippyTree}
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.getZippyTree = function(){
    return this.ZippyTree_;
}



/**
 * Makes and returns a nrg.ui.Thumbmnail, removing the default 
 * element classes, and applying the classes pertinent to the
 * ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @return {!nrg.ui.Thumbnail}
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.createThumbnail = function(imageUrl, 
							     displayText) {

    var thumbnail = new nrg.ui.Thumbnail();
 
    goog.dom.classes.addRemove(thumbnail.getElement(), 
			       goog.dom.classes.get(thumbnail.getElement()), 
			       this.thumbnailClasses_);
    goog.dom.classes.addRemove(thumbnail.getTextElement(), 
			       goog.dom.classes.get(thumbnail.getTextElement()), 
			       this.thumbnailTextClasses_);
    goog.dom.classes.addRemove(thumbnail.getImage(), 
			       goog.dom.classes.get(thumbnail.getImage()), 
			       this.thumbnailImageClasses_);

    thumbnail.setImage(imageUrl);
    thumbnail.setText(displayText);

    return thumbnail;
        
}



/**
 * Loops through all The thumbnails, applying a callback to them.
 *
 * @param {!Function} The callback to apply in the loop.
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.loop = function(callback){
    goog.object.forEach(this.Thumbs_, function(thumb){
	callback(thumb);
    })
}



/**
 * Sets the thumbnail's hover (mouseover) parent.  This allows for a more
 * seamless UX when scrolling and overing over a thumbnail.
 * 
 * @param {!Element} elt The hover parent of the thumbnails.
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.setHoverParent = function(elt){
    this.loop(function(thumbnail){
	goog.dom.append(elt, thumbnail.getHoverable());
    })
}


/**
 * @param {Array.<string>} folders The zippy structure.
 */
nrg.ui.ThumbnailGallery.prototype.addFolders = function(folders) {
    var blankDiv = goog.dom.createDom('div', {
	'id': 'blankDiv'
    })

    //
    // Apply a little hack around the blank div for sorting.
    //
    blankDiv[nrg.ui.ThumbnailGallery.THUMB_SORT_TAG] = '-1';
    this.ZippyTree_.addContents(blankDiv, folders);
    this.mapSliderToContents();
}




/**
 * Adds a thumbnail to the gallery, or a gallery zippy if the opt_folders 
 * argument is provided.
 *
 * @param {!nrg.ui.Thumbnail} thumbnail The thumbnail object to add to the 
 *   scrollable container.
 * @param {string= | Array.<string>=} opt_folders The optional zippy structure.
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.addThumbnail = 
function(thumbnail, opt_folders) {

    if (goog.object.containsValue(this.Thumbs_, thumbnail)) { return };

    // Track thumbnail.
    this.Thumbs_ = this.Thumbs_ ? this.Thumbs_ : {};
    this.Thumbs_[thumbnail.getElement().getAttribute('id')] = thumbnail;

    // Bind clone to mouse wheel.
    this.getSlider().bindToMouseWheel(thumbnail.getHoverable());
    goog.events.listen(this.getSlider(), 
		     nrg.ui.Slider.EventType.MOUSEWHEEL, 
			 this.onHoverAndScroll_.bind(this));

    //
    // Create a sort ID for the thumbnail 
    //
    thumbnail.getElement()[nrg.ui.ThumbnailGallery.THUMB_SORT_TAG] = 
	thumbnail.getText().toLowerCase();

    this.ZippyTree_.addContents(thumbnail.getElement(), opt_folders);


    //
    // Remap the slider
    //
    this.mapSliderToContents();
}



/**
 * Makes and inserts a thumbnail in to a given part of the ThumbnailGallery.
 * @param {!string} imageUrl The url for the thumbnail image.
 * @param {!string} displayText The display text of the thumbnail.
 * @param {string= | Array.string=} opt_folders The optional zippy 
 * folder name to put the thumbnail in.  Otherwise it goes to the parent.
 * @return {!nrg.ui.Thumbnail}
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.createAndAddThumbnail = 
function(imageUrl, displayText, opt_folders) {
    var thumbnail =  this.createThumbnail(imageUrl, displayText);
    this.addThumbnail(thumbnail, opt_folders);
    this.setThumbnailClasses_('image');
    this.setThumbnailClasses_('text');
    this.setThumbnailClasses_('thumbnail');
    this.mapSliderToContents();
    
    return thumbnail;
}
 


/**
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.setZippyTreeEvents_ = function(){ 
    goog.events.listen(this.ZippyTree_,
		       nrg.ui.ZippyTree.EventType.CONTENTADDED,
		       this.mapSliderToContents.bind(this));

    goog.events.listen(this.ZippyTree_,
	nrg.ui.ZippyNode.EventType.EXPANDED,
	this.mapSliderToContents.bind(this));

    goog.events.listen(this.ZippyTree_,
	nrg.ui.ZippyNode.EventType.COLLAPSED,
	this.mapSliderToContents.bind(this));
}



/**
 * As stated.
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.clearHoverThumb_ = function(){ 
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
nrg.ui.ThumbnailGallery.prototype.onHoverAndScroll_ = function(){    

    var mouseElt = 
    document.elementFromPoint(event.clientX, event.clientY);
    var mouseThumb =
    goog.dom.getAncestorByClass(mouseElt, nrg.ui.Thumbnail.ELEMENT_CLASS);


    // Exit out if not over a thumbnail or thumbnail's hoverable.
    if (!mouseThumb) { 
	this.clearHoverThumb_();
	return;
    }

    var hoverThumbId = /**@type{!string}*/ 
    mouseThumb.id.replace(nrg.ui.Thumbnail.HOVERABLE_PREFIX, '');

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
nrg.ui.ThumbnailGallery.prototype.setThumbnailClasses_ = 
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
		element = this.Thumbs_[thumbID].getTextElement();
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
nrg.ui.ThumbnailGallery.prototype.addThumbnailClass = function (className) {
    if (!goog.isDefAndNotNull(this.thumbnailClasses_)){
	this.setDefaultClasses_();
    }
    this.thumbnailClasses_.push(className);
    this.setThumbnailClasses_('thumbnail');
}




/**
 * Adds a CSS class to the the thumbnail image.
 * @param {!string} className
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.addThumbnailImageClass = 
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
nrg.ui.ThumbnailGallery.prototype.addThumbnailTextClass = 
function (className) {
    this.thumbnailTextClasses_.push(className);
    this.setThumbnailClasses_('text');
}




/**
 * Generic update style function.
 * @param {Object=}
 * @public
 */
nrg.ui.ThumbnailGallery.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       nrg.style.setStyle(this.getElement(), opt_args);
   }
}




/**
 * Sets the default classes of the various elements within the class.
 * @private
 */
nrg.ui.ThumbnailGallery.prototype.setDefaultClasses_ = function() {
    //------------------
    // Apply the Thumbnail classes by creating a dummy thumbnail.
    //------------------  
    var tempThumb = new nrg.ui.Thumbnail();
    this.thumbnailClasses_ = goog.dom.classes.get(tempThumb.getElement());
    this.thumbnailClasses_.push(nrg.ui.ThumbnailGallery.CSS.THUMBNAIL);
    this.thumbnailImageClasses_ = goog.dom.classes.get(tempThumb.getImage());
    this.thumbnailImageClasses_.push(
	nrg.ui.ThumbnailGallery.CSS.THUMBNAIL_IMAGE);
    this.thumbnailTextClasses_ = 
	goog.dom.classes.get(tempThumb.getTextElement());
    this.thumbnailTextClasses_.push(
	nrg.ui.ThumbnailGallery.CSS.THUMBNAIL_TEXT);
    goog.dom.removeNode(tempThumb.getElement());
    delete tempThumb;
}



/**
 * @inheritDoc
 */
nrg.ui.ThumbnailGallery.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // onInsert
    delete this.sortThumbnailsOnInsert_;

    
    // Thumbs
    if (goog.isDefAndNotNull(this.Thumbs_)){
	nrg.ui.disposeComponentMap(this.Thumbs_);
	delete this.Thumbs_;
    }

    // Zippy Tree
    if (goog.isDefAndNotNull(this.ZippyTree_)){
	goog.events.removeAll(this.ZippyTree_);
	this.ZippyTree_.disposeInternal();
	delete this.ZippyTree_;
    }
    
    // Thumbnail classes
    if (goog.isDefAndNotNull(this.thumbnailClasses_)){
	goog.array.clear(this.thumbnailClasses_);
	delete this.thumbnailClasses_;
    }

    // Image classes
    if (goog.isDefAndNotNull(this.thumbnailImageClasses_)){
	goog.array.clear(this.thumbnailImageClasses_);
	delete this.thumbnailImageClasses_;
    }

    // Text classes
    if (goog.isDefAndNotNull(this.thumbnailTextClasses_)){
	goog.array.clear(this.thumbnailTextClasses_);
	delete this.thumbnailTextClasses_;
    }
    // other
    delete this.storedHoverThumbId_;
}

