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
goog.require('nrg.string');
goog.require('nrg.fx');
goog.require('nrg.ui.Thumbnail');
goog.require('nrg.ui.ThumbnailGallery');
goog.require('nrg.ui.Resizable');

// xiv
goog.require('xiv.ui.Thumbnail');



/**
 * xiv.ui.ThumbnailGallery handles the interactive features of 
 * xiv.ui.Thumbnails such as drag and drop, and also keeps a running list of 
 * them. 
 * @constructor
 * @extends {nrg.ui.ThumbnailGallery}
 */
goog.provide('xiv.ui.ThumbnailGallery');
xiv.ui.ThumbnailGallery = function () {
    goog.base(this);

    // inits
    this.initDragDrop_();
}
goog.inherits(xiv.ui.ThumbnailGallery, nrg.ui.ThumbnailGallery);
goog.exportSymbol('xiv.ui.ThumbnailGallery', xiv.ui.ThumbnailGallery);



/**
 * Event types.
 * @enum {string}
 */
xiv.ui.ThumbnailGallery.EventType = {
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
xiv.ui.ThumbnailGallery.ID_PREFIX = 'xiv.ui.ThumbnailGallery';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ThumbnailGallery.CSS_SUFFIX = {
    THUMBNAIL_DRAGGING: 'thumbnail-dragging',
};



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailGallery.ANIM_MED = 300;



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailGallery.DRAGGER_ID = 'THUMBNAIL_DRAGGER_' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ThumbnailGallery.DRAGGER_FADER_ID = 
    xiv.ui.ThumbnailGallery.DRAGGER_ID + '_FADER' + 
    goog.string.createUniqueString();




/**
 * @type {?goog.fx.DragDropGroup}
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.thumbnailDragDropGroup_ =  null;




/**
 * @type {?goog.fx.DragDropGroup}
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.thumbnailTargetGroup_ = null;




/**
 * Returns a newly created xiv.ui.Thumbnail object. 
 *
 * @param {gxnat.vis.ViewableTree} _Viewable The Viewable object to derive the 
 *     Thumbnail from.
 * @param {!string | !Array.string} folders The folders which the thumbnails 
 *     belong to.
 * @public
 */
xiv.ui.ThumbnailGallery.prototype.createAndAddThumbnail = 
function(_Viewable, folders) {
    this.addThumbnail(this.createThumbnail(_Viewable), folders);
}



/**
 * Returns a newly created xiv.ui.Thumbnail object. 
 *
 * @param {gxnat.vis.ViewableTree} _Viewable The Viewable object to derive the
 *    Thumbnail from.
 * @returns {xiv.ui.Thumbnail}
 * @public
 */
xiv.ui.ThumbnailGallery.prototype.createThumbnail = function(_Viewable) {

    //window.console.log(_Viewable['thumbnailUrl']);
    var thumbnail = 
    new xiv.ui.Thumbnail(_Viewable);
    goog.events.listen(thumbnail, nrg.ui.Thumbnail.EventType.CLICK, function(){
	//window.console.log("THUM", thumbnail);
	this.dispatchEvent({
	    type: xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_CLICK,
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
xiv.ui.ThumbnailGallery.prototype.addThumbnail = function(thumbnail, folders){
    goog.base(this, 'addThumbnail', thumbnail, folders);    
    this.addDragDropSource_(thumbnail);
}



/**
 * As stated.
 * @public
 */
xiv.ui.ThumbnailGallery.prototype.clearThumbnailDropTargets = function(target) {
    this.thumbnailTargetGroup_.removeItems();
}



/**
 * Adds a target element to the group.  Manages its border change in the 
 * DragDrop process.
 *
 * @param {Element} target The target element to add.
 * @public
 */
xiv.ui.ThumbnailGallery.prototype.addThumbnailDropTarget = function(target) {
    this.thumbnailTargetGroup_.addItem(target);
}



/**
 * Adds an array of elements to the target group.
 *
 * @param {!Array.<Element>} targetArr The target elements to add.
 * @public
 */
xiv.ui.ThumbnailGallery.prototype.addThumbnailDropTargets = 
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
xiv.ui.ThumbnailGallery.prototype.getThumbnailByElement = function(element) {
    return this.Thumbs_[element.id];
}



/**
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.clearDragDropGroups_ = function(){
    if (goog.isDefAndNotNull(this.thumbnailDragDropGroup_)){
	this.thumbnailDragDropGroup_.removeItems();
	this.thumbnailDragDropGroup_.disposeInternal();
	this.thumbnailDragDropGroup = null;
    }
    if (goog.isDefAndNotNull(this.thumbnailTargetGroup_)){
	this.thumbnailTargetGroup_.removeItems();
	this.thumbnailTargetGroup_.disposeInternal();
	this.thumbnailTargetGroup = null;
    }
}




/**
 * Defines the goog.fx.DragDropGroup listeners, using the
 * methods outlined in goog.fx.DragDrop tutorials. Such as here:
 * https://code.google.com/p/closure-library/wiki/DragDrop
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.initDragDrop_ = function(){

    this.thumbnailDragDropGroup_ =  new goog.fx.DragDropGroup();
    this.thumbnailTargetGroup_ = new goog.fx.DragDropGroup();



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
xiv.ui.ThumbnailGallery.prototype.createDragElement_ = function(srcElt) {
    // Get the thumbnail ID from the ancestor.
    var thumbId = /**@type {!string}*/  goog.dom.getAncestorByTagNameAndClass(
	srcElt, 'div', xiv.ui.Thumbnail.ELEMENT_CLASS).id.replace(
	    nrg.ui.Thumbnail.HOVERABLE_PREFIX, '');

    // Exit out of the id is not stored.
    if (!goog.object.containsKey(this.Thumbs_, thumbId)) {
	return;
    }
    
    // Set the thumbnail to an 'active' stated.
    this.Thumbs_[thumbId].setActive(true, true);

    // Create  and return the drag element
    var dragEl = /**@type {!Element}*/ 
	this.Thumbs_[thumbId].getElement().cloneNode(true);
    dragEl.setAttribute('id', xiv.ui.ThumbnailGallery.DRAGGER_ID + 
		       dragEl.id);
    goog.dom.classes.add(dragEl, 
			 xiv.ui.ThumbnailGallery.CSS.THUMBNAIL_DRAGGING);
    return dragEl;
}



/**
 * Changes the border of Thumbnail to highlight color.
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.onDragOver_ = function (event) {
    this.dispatchEvent({
	type: xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DRAG_OVER,
	thumbnailTargetElement: event.dropTargetItem.element
    });
}



/**
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.onDragOut_ = function (event) {
    this.dispatchEvent({
	type: xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DRAG_OUT,
	thumbnailTargetElement: event.dropTargetItem.element
    });
}



/**
 * DragEnd function for thumbnails.  
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.onDragEnd_ = function (event) {

    // Get the top trag element
    var dragThumbnails = goog.dom.getElementsByClass(
	xiv.ui.ThumbnailGallery.CSS.THUMBNAIL_DRAGGING);

    // Fade out the draggers
    goog.array.forEach(dragThumbnails, function(elt){
	nrg.fx.fadeOut(elt, xiv.ui.ThumbnailGallery.ANIM_MED, function(){ 
	    goog.dom.removeNode(elt);
	})
    })

    //
    if (!goog.isDefAndNotNull(dragThumbnails[0])) { return };

    // Get the thumbnail Object
    var originalThumbnail = this.Thumbs_[dragThumbnails[0].id.replace(
	xiv.ui.ThumbnailGallery.DRAGGER_ID, '')];

    // Deactivate that thumb 
    originalThumbnail.setActive(false, true);

}



/**
 * Thumbnail drop event.
 * @param {!Event} Dummy event.
 * @private
 */
xiv.ui.ThumbnailGallery.prototype.onDrop_ = function(event) {

    var dragThumbnail =
	goog.dom.getElementByClass(
	    xiv.ui.ThumbnailGallery.CSS.THUMBNAIL_DRAGGING);


    if (!goog.isDefAndNotNull(dragThumbnail)) { return };

    // Clone the dragger element so we can fade the clone out..
    // not super necessary but nice effect.
    dragThumbnail.style.opacity = 0;
    var dragClone = 
    dragThumbnail.cloneNode(true);
    dragClone.style.opacity = 1;
    document.body.appendChild(dragClone);
    goog.dom.removeNode(dragThumbnail);


    // If we're at the target, dispatch event.
    if (event.dropTargetItem.element) {
	this.dispatchEvent({
	    type: 
	    xiv.ui.ThumbnailGallery.EventType.THUMBNAIL_DROPPED_INTO_TARGET,
	    Thumbnail: this.Thumbs_[dragThumbnail.id.replace(
		xiv.ui.ThumbnailGallery.DRAGGER_ID, '')],
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
xiv.ui.ThumbnailGallery.prototype.addDragDropSource_ = function(thumbnail){
    var thumbElt = /**@type {!Element}*/ thumbnail.getHoverable();
    if (thumbElt) {
	this.thumbnailDragDropGroup_.addItem(thumbElt);
    }
}




/**
 * @inheritDoc
 */
xiv.ui.ThumbnailGallery.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    this.clearDragDropGroups_();
}
