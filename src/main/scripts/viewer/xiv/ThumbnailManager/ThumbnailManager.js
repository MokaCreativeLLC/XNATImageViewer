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
goog.require('utils.events.EventManager');
goog.require('utils.string');
goog.require('utils.fx');
goog.require('utils.ui.Thumbnail');
goog.require('utils.ui.ThumbnailGallery');

// xiv
goog.require('xiv.Thumbnail');



/**
 * xiv.Thumbnail manager handles the interactive features of xiv.Thumbnails
 * such as drag and drop, and also keeps a running list of them. 
 * @constructor
 */
goog.provide('xiv.ThumbnailManager');
xiv.ThumbnailManager = function () {

    /**
     * @dict
     * @private
     */    
    this.thumbs_ = {};

    
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


    // events
    utils.events.EventManager.addEventManager(this, 
					      xiv.ThumbnailManager.EventType);

    // inits
    this.createThumbnailGallery_();
    this.initDragDrop_();
}
goog.exportSymbol('xiv.ThumbnailManager', xiv.ThumbnailManager);



/**
 * Event types.
 * @enum {string}
 */
xiv.ThumbnailManager.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  THUMBNAILCLICK: goog.events.getUniqueId('thumbnailclick'),
  THUMBNAILDROP: goog.events.getUniqueId('thumbnaildrop'),
};



/**
 * @type {!string} 
 * @const
 */
xiv.ThumbnailManager.ANIM_MED = 300;



/**
 * @type {!string} 
 * @expose
 * @const
 */
xiv.ThumbnailManager.ORIGINAL_BORDER_ATTR = 'originalbordercolor' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @const
 */
xiv.ThumbnailManager.DRAGGER_ID = 'THUMBNAIL_DRAGGER' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @const
 */
xiv.ThumbnailManager.DRAGGER_FADER_ID = 
    xiv.ThumbnailManager.DRAGGER_ID + '_FADER' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @expose
 * @const
 */
xiv.ThumbnailManager.ID_PREFIX = 'xiv.ThumbnailManager';



/**
 * @type {!string}
 * @expose 
 * @const
 */
xiv.ThumbnailManager.CSS_CLASS_PREFIX = 
    goog.string.toSelectorCase(
	utils.string.getLettersOnly(xiv.ThumbnailManager.ID_PREFIX));



/**
 * @type {!string}
 * @expose 
 * @const
 */
xiv.ThumbnailManager.THUMBNAILGALLERY_CLASS =  
    goog.getCssName(xiv.ThumbnailManager.CSS_CLASS_PREFIX, 'thumbnailgallery');



/**
 * @type {utils.ui.ThumbnailGallery}
 * @private
 */
xiv.ThumbnailManager.prototype.ThumbnailGallery_;



/**
 * As stated.
 * @public
 * @return {utils.ui.ThumbnailGallery}
 */
xiv.ThumbnailManager.prototype.getThumbnailGallery = function() {
    return this.ThumbnailGallery_;
} 



/**
 * Sets the thumbnail's hover parent.
 * @param {!Element} elt The hover parent of the thumbnails.
 * @public
 */
xiv.ThumbnailManager.prototype.setHoverParent = function(elt){
    this.loop(function(thumbnail){
	goog.dom.append(elt, thumbnail.getHoverable());
    })
}



/**
 * Loops through all The thumbnails, applying a callback to them.
 * @param {!function} The callback to apply in the loop.
 * @public
 */
xiv.ThumbnailManager.prototype.loop = function(callback){
    for (key in this.thumbs_) {
	if (goog.isFunction(callback)) {
	    callback(this.thumbs_[key]);
	}
    }
}



/**
 * Returns a newly created xiv.Thumbnail object. 
 * @param {utils.xnat.Viewable} _Viewable The Viewable object to derive the 
 *     Thumbnail from.
 * @param {!string | !Array.string} folders The folders which the thumbnails 
 *     belong to.
 * @public
 */
xiv.ThumbnailManager.prototype.createAndAddThumbnail = 
function(_Viewable, folders) {
    this.addThumbnail(this.createThumbnail(_Viewable), folders);
}



/**
 * Returns a newly created xiv.Thumbnail object. 
 * @param {utils.xnat.Viewable} _Viewable The Viewable object to derive the
 *    Thumbnail from.
 * @returns {xiv.Thumbnail}
 * @public
 */
xiv.ThumbnailManager.prototype.createThumbnail = function(_Viewable) {
    //window.console.log(_Viewable['thumbnailUrl']);
    var thumbnail = /**@type {!xiv.Thumbnail}*/ new xiv.Thumbnail(_Viewable);
    thumbnail['EVENTS'].onEvent('CLICK',  function(){
	//window.console.log("THUM", thumbnail);
	this['EVENTS'].runEvent('THUMBNAILCLICK', thumbnail);
    }.bind(this))
    return thumbnail;
}



/**
 * Adds a xiv.Thumbnail to both the private thumbs_ list as well as the 
 * dragdropsource group.
 * @param {xiv.Thumbnail} thumbnail The thumbnail to add.
 * @param {!string | !Array.string} folders The folders which the thumbnails 
 *     belong to.
 * @public
 */
xiv.ThumbnailManager.prototype.addThumbnail = function(thumbnail, folders){

    // Add to private array.
    this.thumbs_[thumbnail.getElement().getAttribute('id')] = thumbnail;

    // Add to gallery
    //window.console.log(folders);
    this.ThumbnailGallery_.addThumbnail(thumbnail, folders);    

    // Add also to the drag drop tracking group.
    this.addDragDropSource_(thumbnail);

    //------------------
    // If the thumbnail is in a xiv.ViewBox, 
    // then highlight the view box that the 
    // thumbnail was dropped into when we hover over it.
    //------------------
    this['EVENTS'].onEvent('MOUSEOVER', function(callback){
	thumbnail['EVENTS'].onEvent('MOUSEOVER', callback);
    }.bind(this))
    this['EVENTS'].onEvent('MOUSEOUT', function(callback){
	thumbnail['EVENTS'].onEvent('MOUSEOUT', callback);
    }.bind(this))

}



/**
 * Adds a target element to the group.  Manages its border change in the 
 * DragDrop process.
 * @param {Element} target The target element to add.
 * @public
 */
xiv.ThumbnailManager.prototype.addDragDropTarget = function(target) {
    this.thumbnailTargetGroup_.addItem(target);
    target.setAttribute(xiv.ThumbnailManager.ORIGINAL_BORDER_ATTR, 
			target.style.borderColor);
}



/**
 * Adds an array of elements to the target group.
 * @param {!Array.<Element>} targetArr The target elements to add.
 * @public
 */
xiv.ThumbnailManager.prototype.addDragDropTargets = function(targetArr) {
    goog.array.forEach(targetArr, function (target) {
	this.addDragDropTarget(target);
    }.bind(this)) 
}



/**
 * Returns the xiv.Thumbnail class when the argument is its element. 
 * @param {Element} The element to search the stored Thumbnail objects for.
 * @returns {xiv.Thumbnail} The Thumbnail object which the element belongs to.
 * @public
 */
xiv.ThumbnailManager.prototype.getThumbnailByElement = function(element) {
    return this.thumbs_[element.id];
}



/**
 * As stated.
 * @private
 */
xiv.ThumbnailManager.prototype.createThumbnailGallery_ = function() {
    this.ThumbnailGallery_ = new utils.ui.ThumbnailGallery();
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.ThumbnailManager.THUMBNAILGALLERY_CLASS);
} 



/**
 * Defines the goog.fx.DragDropGroup listeners, using the
 * methods outlined in goog.fx.DragDrop tutorials. Such as here:
 * https://code.google.com/p/closure-library/wiki/DragDrop
 * @private
 */
xiv.ThumbnailManager.prototype.initDragDrop_ = function(){
    //window.console.log("INIT DRAG DROP");

    // Define the xiv.Thumbnail clone, for dragging.
    this.thumbnailDragDropGroup_.createDragElement = 
	this.createDragElement_.bind(this);
 
    // Dragger events
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragover', this.dragOver_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragend', this.dragEnd_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragout', this.dragOut_.bind(this));

    // target events
    goog.events.listen(this.thumbnailTargetGroup_, 
		       'drop', this.drop_.bind(this));

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
 * Instead we want the entire xiv.Thumbnail (text, image and all) to
 * be cloned.
 * @param {!Element} srcElt The source element of the thumbnail to derive the
 *     drag element from.
 * @return {!Element} The drag element.
 * @private
 */
xiv.ThumbnailManager.prototype.createDragElement_ = function(srcElt) {
    //window.console.log("CREATE DRAG ELEMENT");

    while (srcElt) {
	if (srcElt.getAttribute('thumbnailid')) {
	    break;
	}
	srcElt = srcElt.parentNode;
    }
    //window.console.log(srcElt, this.thumbs_);
    
    var originalThumbnail = /**@type {!Element}*/ goog.dom.getElement(
	srcElt.getAttribute('thumbnailid'));  
    //window.console.log(originalThumbnail);
    var Thumb = /**@type {!Element}*/
    this.thumbs_[originalThumbnail.getAttribute('id')];

    if (!Thumb) { return;}
    Thumb.setActive(true, true);

    var dragEl = /**@type {!Element}*/ originalThumbnail.cloneNode(true);
    dragEl.setAttribute('id', xiv.ThumbnailManager.DRAGGER_ID);
    goog.dom.classes.set(dragEl, xiv.Thumbnail.DRAGGING_CLASS);
    return dragEl;
}



/**
 * Changes the border of Thumbnail to highlight color.
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ThumbnailManager.prototype.dragOver_ = function (event) {
    event.dropTargetItem.element.style.borderColor = 
	'rgb(255,255,255)';
}



/**
 * Reverts thumbnaiil to old border.
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ThumbnailManager.prototype.dragOut_ = function (event) {
    event.dropTargetItem.element.style.borderColor = 
	event.dropTargetItem.element.getAttribute(
	    xiv.ThumbnailManager.ORIGINAL_BORDER_ATTR);
}



/**
 * DragEnd function for thumbnails.  
 * @param {!Event} event Dummy event.
 * @private
 */
xiv.ThumbnailManager.prototype.dragEnd_ = function (event) {
    
    //------------------
    // Get the origin thumbnail Element, from which the cloned xiv.Thumbnail 
    // came.  This is conducted through a class query.
    //------------------
    var dragThumbnail = /**@type {!Element}*/
	goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, 
				    utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    var originalThumbnail = /**@type {!Element}*/
	goog.dom.getElement(dragThumbnail.getAttribute('thumbnailid'))
    var Thumb = /**@type {!xiv.Thumbnail}*/
    this.getThumbnailByElement(originalThumbnail);

    //------------------
    // Deactivate that thumb as dragging activates it.  If it is dropped
    // into a xiv.ViewBox, it will get reactivated  if successfully loaded.
    //------------------
    Thumb.setActive(false, true);


    //*************************************************************
    //
    // THIS IS WHERE THE THUMBNAIL IS LOADED INTO THE VIEW BOX.
    //
    //*************************************************************
    if (dragThumbnail.dropTarget) {
	this.thumbnailDroppedIntoTarget_(originalThumbnail, 
			dragThumbnail.dropTarget).bind(this);
    }
}



/**
 * Runs the event callbacks when a thumbnail has been dropped into its target.
 * @param {!xiv.Thumbnail} thumbnail The dragged thumbnail.
 * @param {!Element} target The thumbnail's target element.
 * @private
 */
xiv.ThumbnailManager.prototype.thumbnailDroppedIntoTarget_ = 
function(thumbnail, target) {
    var thumbDraggerFader = /**@type {!Element}*/
    goog.dom.getElement(xiv.ThumbnailManager.DRAGGER_FADER_ID);
    utils.fx.fadeOutAndRemove(thumbDraggerFader,
			      xiv.ThumbnailManager.ANIM_MED, 
			      function(){ delete thumbDraggerFader })
    this['EVENTS'].runEvent('THUMBNAILDROP', target, thumbnail);
}



/**
 * Thumbnail drop event.
 * @param {!Event} Dummy event.
 * @private
 */
xiv.ThumbnailManager.prototype.drop_ = function(event) {

    var dragThumbnail = /**@type {!Element}*/
	goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, 
				    utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    var thumbDragger = /**@type {!Element}*/
    goog.dom.getElement(xiv.ThumbnailManager.DRAGGER_ID); 
    var dragClone = /**@type {!Element}*/
    thumbDragger.cloneNode(true);


    //------------------
    // Clone the dragger element so we can fade the clone out
    // in the 'dragEnd' function.
    //------------------
    dragClone.setAttribute('id', xiv.ThumbnailManager.DRAGGER_FADER_ID);
    document.body.appendChild(dragClone);
    goog.dom.removeNode(thumbDragger);
    delete thumbDragger;



    //------------------
    // We don't do the drop callbacks here
    // because the "drop" event occurs before the
    // "dragEnd" event.  Rather than implement asnyc handling
    // of the two, the xiv.ViewBox 'loadxiv.Thumbnail' call will occur
    // at dragEnd if there's a dropTarget for original xiv.Thumbnail
    //------------------
    dragThumbnail.dropTarget = event.dropTargetItem.element;
}



/**
 * Adds the element of the xiv.Thumbnail class to 
 * the DragDropGroup (not to be confused with the xiv.Thumbnail
 * class itself).
 * @param {xiv.Thumbnail} The Thumbnail to add.
 * @private
 */
xiv.ThumbnailManager.prototype.addDragDropSource_ = function(thumbnail){
    var thumbElt = /**@type {!Element}*/ thumbnail.getHoverable();
    if (thumbElt) {
	this.thumbnailDragDropGroup_.addItem(thumbElt);
    }
}
