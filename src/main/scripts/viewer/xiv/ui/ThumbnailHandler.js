/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');

// utils
goog.require('moka.string');
goog.require('moka.fx');
goog.require('moka.ui.Thumbnail');
goog.require('moka.ui.ThumbnailGallery');
goog.require('moka.ui.Component');

// xiv
goog.require('xiv.ui.Thumbnail');



/**
 * xiv.ui.ThumbnailHandler handles the interactive features of 
 * xiv.ui.Thumbnails such as drag and drop, and also keeps a running list of 
 * them. 
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ThumbnailHandler');
xiv.ui.ThumbnailHandler = function () {
    goog.base(this);
    
    /**
     * @dict
     * @private
     */    
    this.Thumbs_ = {};

    
    /**
     * @type {!goog.fx.DragDropGroup}
     * @private
     */
    this.thumbnailDragDropGroup_ =  new goog.fx.DragDropGroup();


    /**
     * @type {!goog.fx.DragDropGroup}
     * @private
     */
    this.thumbnailTargetGroup_ = new goog.fx.DragDropGroup();



    // inits
    this.createThumbnailGallery_();
    this.initDragDrop_();
}
goog.inherits(xiv.ui.ThumbnailHandler, moka.ui.Component);
goog.exportSymbol('xiv.ui.ThumbnailHandler', xiv.ui.ThumbnailHandler);



/**
 * Event types.
 * @enum {string}
 */
xiv.ui.ThumbnailHandler.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  THUMBNAIL_DRAG_OVER: goog.events.getUniqueId('thumbnail-drag-over'),
  THUMBNAIL_DRAG_OUT: goog.events.getUniqueId('thumbnail-drag-out'),
  THUMBNAIL_CLICK: goog.events.getUniqueId('thumbnailclick'),
  THUMBNAIL_DROPPED_INTO_TARGET: 
    goog.events.getUniqueId('thumbnail-dropped-into-target')
};



/**
 * @type {!string} 
 * @expose
 * @const
 */
xiv.ui.ThumbnailHandler.ID_PREFIX = 'xiv.ui.ThumbnailHandler';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ThumbnailHandler.CSS_SUFFIX = {
    THUMBNAILGALLERY: 'thumbnailgallery',
    THUMBNAIL_DRAGGING: 'thumbnail-dragging',
};



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailHandler.ANIM_MED = 300;



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailHandler.DRAGGER_ID = 'THUMBNAIL_DRAGGER_' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailHandler.DRAGGER_FADER_ID = 
    xiv.ui.ThumbnailHandler.DRAGGER_ID + '_FADER' + 
    goog.string.createUniqueString();




/**
 * @type {moka.ui.ThumbnailGallery}
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.ThumbnailGallery_;



/**
 * As stated.
 * @public
 * @return {moka.ui.ThumbnailGallery}
 */
xiv.ui.ThumbnailHandler.prototype.getThumbnailGallery = function() {
    return this.ThumbnailGallery_;
} 



/**
 * Sets the thumbnail's hover (mouseover) parent.  This allows for a more
 * seamless UX when scrolling and overing over a thumbnail.
 * 
 * @param {!Element} elt The hover parent of the thumbnails.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.setHoverParent = function(elt){
    this.loop(function(thumbnail){
	goog.dom.append(elt, thumbnail.getHoverable());
    })
}



/**
 * Loops through all The thumbnails, applying a callback to them.
 *
 * @param {!function} The callback to apply in the loop.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.loop = function(callback){
    for (key in this.Thumbs_) {
	if (goog.isFunction(callback)) {
	    callback(this.Thumbs_[key]);
	}
    }
}



/**
 * Returns a newly created xiv.ui.Thumbnail object. 
 *
 * @param {gxnat.Viewable} _Viewable The Viewable object to derive the 
 *     Thumbnail from.
 * @param {!string | !Array.string} folders The folders which the thumbnails 
 *     belong to.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.createAndAddThumbnail = 
function(_Viewable, folders) {
    this.addThumbnail(this.createThumbnail(_Viewable), folders);
}



/**
 * Returns a newly created xiv.ui.Thumbnail object. 
 *
 * @param {gxnat.Viewable} _Viewable The Viewable object to derive the
 *    Thumbnail from.
 * @returns {xiv.ui.Thumbnail}
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.createThumbnail = function(_Viewable) {
    //window.console.log(_Viewable['thumbnailUrl']);
    var thumbnail = /**@type {!xiv.ui.Thumbnail}*/ 
    new xiv.ui.Thumbnail(_Viewable);
    goog.events.listen(thumbnail, moka.ui.Thumbnail.EventType.CLICK, function(){
	//window.console.log("THUM", thumbnail);
	this.dispatchEvent({
	    type: xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_CLICK,
	    thumbnail: thumbnail
	});
    }.bind(this))
    return thumbnail;
}



/**
 * Adds a xiv.ui.Thumbnail to both the private thumbs_ list as well as the 
 * dragdropsource group.
 * @param {xiv.ui.Thumbnail} thumbnail The thumbnail to add.
 * @param {!string | !Array.string} folders The folders which the thumbnails 
 *     belong to.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.addThumbnail = function(thumbnail, folders){

    // Add to private array.
    this.Thumbs_[thumbnail.getElement().getAttribute('id')] = thumbnail;

    // Add to gallery
    //window.console.log(folders);
    this.ThumbnailGallery_.addThumbnail(thumbnail, folders);    

    // Add also to the drag drop tracking group.
    this.addDragDropSource_(thumbnail);

    //------------------
    // If the thumbnail is in a xiv.ui.ViewBox, 
    // then highlight the view box that the 
    // thumbnail was dropped into when we hover over it.
    //------------------
    goog.events.listen(this, xiv.ui.ThumbnailHandler.EventType.MOUSEOVER, 
		       function(callback){
	goog.events.listen(thumbnail, xiv.ui.Thumbnail.EventType.MOUSEOVER, 
			   callback);
    }.bind(this))

    goog.events.listen(this, xiv.ui.ThumbnailHandler.EventType.MOUSEOUT,  
			   function(callback){
	goog.events.listen(thumbnail, xiv.ui.Thumbnail.EventType.MOUSEOUT, 
			   callback);
    }.bind(this))
}



/**
 * As stated.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.clearThumbnailDropTargets = function(target) {
    this.thumbnailTargetGroup_.removeItems();
}



/**
 * Adds a target element to the group.  Manages its border change in the 
 * DragDrop process.
 *
 * @param {Element} target The target element to add.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.addThumbnailDropTarget = function(target) {
    this.thumbnailTargetGroup_.addItem(target);
}



/**
 * Adds an array of elements to the target group.
 *
 * @param {!Array.<Element>} targetArr The target elements to add.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.addThumbnailDropTargets = 
function(targetArr) {
    goog.array.forEach(targetArr, function (target) {
	this.addThumbnailDropTarget(target);
    }.bind(this)) 
}



/**
 * Returns the xiv.ui.Thumbnail class when the argument is its element. 
 * @param {Element} The element to search the stored Thumbnail objects for.
 * @returns {xiv.ui.Thumbnail} The Thumbnail object which the element belongs 
 * to.
 * @public
 */
xiv.ui.ThumbnailHandler.prototype.getThumbnailByElement = function(element) {
    return this.Thumbs_[element.id];
}



/**
 * As stated.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.createThumbnailGallery_ = function() {
    //window.console.log('\n\nCREATE THUMBNAIL GALLERY');
    this.ThumbnailGallery_ = new moka.ui.ThumbnailGallery();
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.ui.ThumbnailHandler.CSS.THUMBNAILGALLERY);
} 



/**
 * Defines the goog.fx.DragDropGroup listeners, using the
 * methods outlined in goog.fx.DragDrop tutorials. Such as here:
 * https://code.google.com/p/closure-library/wiki/DragDrop
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.initDragDrop_ = function(){
    //window.console.log("INIT DRAG DROP");

    // Define the xiv.ui.Thumbnail clone, for dragging.
    this.thumbnailDragDropGroup_.createDragElement = 
	this.createDragElement_.bind(this);
 
    // Drag over
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragover', this.onDragOver_.bind(this));

    // Drag end
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragend', this.onDragEnd_.bind(this));

    // Drag out
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragout', this.onDragOut_.bind(this));

    // target events
    goog.events.listen(this.thumbnailTargetGroup_, 
		       'drop', this.onDrop_.bind(this));

    // Set targets
    this.thumbnailDragDropGroup_.addTarget(this.thumbnailTargetGroup_);

    // Init the groups as per goog.fx.DragDrop
    this.thumbnailTargetGroup_.init();
    this.thumbnailDragDropGroup_.init();

}



/**
 * Creates a drag element that is the clone of the thumbnail.
 * This is implemented because if a user were to click on the text,
 * for instance, the "dragging" clone would be just the text.
 * Instead we want the entire xiv.ui.Thumbnail (text, image and all) to
 * be cloned.
 *
 * @param {!Element} srcElt The source element of the thumbnail to derive the
 *     drag element from.
 * @return {!Element} The drag element.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.createDragElement_ = function(srcElt) {
    // Get the thumbnail ID from the ancestor.
    var thumbId = /**@type {!string}*/  goog.dom.getAncestorByTagNameAndClass(
	srcElt, 'div', xiv.ui.Thumbnail.ELEMENT_CLASS).id.replace(
	    moka.ui.Thumbnail.HOVERABLE_PREFIX, '');

    // Exit out of the id is not stored.
    if (!goog.object.containsKey(this.Thumbs_, thumbId)) {
	return;
    }
    
    // Set the thumbnail to an 'active' stated.
    this.Thumbs_[thumbId].setActive(true, true);

    // Create  and return the drag element
    var dragEl = /**@type {!Element}*/ 
	this.Thumbs_[thumbId].getElement().cloneNode(true);
    dragEl.setAttribute('id', xiv.ui.ThumbnailHandler.DRAGGER_ID + 
		       dragEl.id);
    goog.dom.classes.add(dragEl, 
			 xiv.ui.ThumbnailHandler.CSS.THUMBNAIL_DRAGGING);
    return dragEl;
}



/**
 * Changes the border of Thumbnail to highlight color.
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.onDragOver_ = function (event) {
    this.dispatchEvent({
	type: xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DRAG_OVER,
	thumbnailTargetElement: event.dropTargetItem.element
    });
}



/**
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.onDragOut_ = function (event) {
    this.dispatchEvent({
	type: xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DRAG_OUT,
	thumbnailTargetElement: event.dropTargetItem.element
    });
}



/**
 * DragEnd function for thumbnails.  
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.onDragEnd_ = function (event) {

    // Get the top trag element
    var dragThumbnails = /**@type {!Element}*/
	goog.dom.getElementsByClass(
	    xiv.ui.ThumbnailHandler.CSS.THUMBNAIL_DRAGGING);

    // Fade out the draggers
    goog.array.forEach(dragThumbnails, function(elt){
	moka.fx.fadeOut(elt, xiv.ui.ThumbnailHandler.ANIM_MED, function(){ 
	    goog.dom.removeNode(elt);
	})
    })

    // Get the thumbnail Object
    var originalThumbnail = /**@type {!Element}*/
	this.Thumbs_[dragThumbnails[0].id.replace(
	    xiv.ui.ThumbnailHandler.DRAGGER_ID, '')];

    // Deactivate that thumb 
    originalThumbnail.setActive(false, true);

}



/**
 * Thumbnail drop event.
 * @param {!Event} Dummy event.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.onDrop_ = function(event) {

    var dragThumbnail = /**@type {!Element}*/
	goog.dom.getElementByClass(
	    xiv.ui.ThumbnailHandler.CSS.THUMBNAIL_DRAGGING);


    // Clone the dragger element so we can fade the clone out..
    // not super necessary but nice effect.
    dragThumbnail.style.opacity = 0;
    var dragClone = /**@type {!Element}*/
    dragThumbnail.cloneNode(true);
    dragClone.style.opacity = 1;
    document.body.appendChild(dragClone);
    goog.dom.removeNode(dragThumbnail);


    // If we're at the target, dispatch event.
    if (event.dropTargetItem.element) {
	this.dispatchEvent({
	    type: 
	    xiv.ui.ThumbnailHandler.EventType.THUMBNAIL_DROPPED_INTO_TARGET,
	    Thumbnail: this.Thumbs_[dragThumbnail.id.replace(
		xiv.ui.ThumbnailHandler.DRAGGER_ID, '')],
	    targetElement: event.dropTargetItem.element
	});
    }
}



/**
 * Adds the element of the xiv.ui.Thumbnail class to 
 * the DragDropGroup (not to be confused with the xiv.ui.Thumbnail
 * class itself).
 *
 * @param {xiv.ui.Thumbnail} The Thumbnail to add.
 * @private
 */
xiv.ui.ThumbnailHandler.prototype.addDragDropSource_ = function(thumbnail){
    var thumbElt = /**@type {!Element}*/ thumbnail.getHoverable();
    if (thumbElt) {
	this.thumbnailDragDropGroup_.addItem(thumbElt);
    }
}
