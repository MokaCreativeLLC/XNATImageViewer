/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');

// utils
goog.require('utils.array');
goog.require('utils.events');
goog.require('utils.ui.ThumbnailGallery');

// xiv
goog.require('xiv.Thumbnail');




/**
 * xiv.Thumbnail manager handles the interactive features of xiv.Thumbnails
 * such as drag and drop, and also keeps a running list of them. 
 *
 * @constructor
 * @extends {xiv.Widget}
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



    //
    // Other init functions
    //
    utils.events.addEventManager(this, xiv.ThumbnailManager.EventType);

    this.createThumbnailGallery_();
    this.initDragDrop();
}
goog.inherits(xiv.ThumbnailManager, xiv.Widget);
goog.exportSymbol('xiv.ThumbnailManager', xiv.ThumbnailManager);




/**
 * @type {utils.ui.ThumbnailGallery}
 * @private
 */
xiv.ThumbnailManager.prototype.ThumbnailGallery_;




/**
 * @public
 * @return: The Thumbnail Gallery
 */
xiv.ThumbnailManager.prototype.getThumbnailGallery = function() {
    return this.ThumbnailGallery_;
} 



/**
 * @private
 */
xiv.ThumbnailManager.prototype.createThumbnailGallery_ = function() {
    this.ThumbnailGallery_ = new utils.ui.ThumbnailGallery();
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.ThumbnailManager.THUMBNAILGALLERY_CLASS);
} 




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
 * @param {!Element} elt
 * @private
 */
xiv.ThumbnailManager.prototype.setHoverParent = function(elt){
    this.loop(function(thumbnail){
	goog.dom.append(elt, thumbnail.getHoverable());
    })
}






/**
 * Loops through all the thumbnails, applying
 * a callback to them as necessary.
 *
 * @param {opt_callback?} The callback to apply
 * to each thumbnail.
 * @public
 */
xiv.ThumbnailManager.prototype.loop = function(opt_callback){
    for (key in this.thumbs_) {
	if (goog.isFunction(opt_callback)) {
	    opt_callback(this.thumbs_[key]);
	}
    }
}




/**
 * Creates a drag element that is the clone of the thumbnail.
 * This is implemented because if a user were to click on the text,
 * for instance, the "dragging" clone would be just the text.
 * Instead we want the entire xiv.Thumbnail (text, image and all) to
 * be cloned.* Creates the dragging clone for the thumbnail.
 *
 * @param {!Element} srcElt
 * @return {!Element} 
 * @private
 */
xiv.ThumbnailManager.prototype.createDragElement_ = function(srcElt) {
    window.console.log("CREATE DRAG ELEMENT");
    var srcElt = goog.dom.getAncestorByClass(srcElt, xiv.Thumbnail.CSS_CLASS_PREFIX);
    var originalThumbnail = goog.dom.getElement(srcElt.getAttribute('thumbnailid'));
    var Thumb = this.getThumbnailByElement(originalThumbnail);
    if (!Thumb) { return;}
    Thumb.setActive(true, true);

    var dragEl = originalThumbnail.cloneNode(true);
    dragEl.setAttribute('id', 'THUMBNAIL_DRAGGER');
    goog.dom.classes.set(dragEl, xiv.Thumbnail.DRAGGING_CLASS);
    return dragEl;
}




/**
 * Define 'dragOver':  Change the border
 * to highlight color.
 *
 * @param {!Event} event
 * @private
 */
xiv.ThumbnailManager.prototype.dragOver_ = function (event) {
    event.dropTargetItem.element.style.borderColor = 
	'rgb(255,255,255)';
}



/**
 * Define 'dragOut': Revert to old border.
 *
 * @param {!Event} event
 * @private
 */
xiv.ThumbnailManager.prototype.dragOut_ = function (event) {
    event.dropTargetItem.element.style.borderColor = 
	event.dropTargetItem.element.getAttribute('originalbordercolor');
}



/**
 * Define 'dragEnd':  See comments below for details.
 *
 * @param {!Event} event
 * @private
 */
xiv.ThumbnailManager.prototype.dragEnd_ = function (event) {
    

    //------------------
    // Get the origin thumbnail Element, from which the cloned xiv.Thumbnail 
    // came.  This is conducted through a class query.
    //------------------
    var dragThumbnail = 
	goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, 
				    utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    var originalThumbnail = 
	goog.dom.getElement(dragThumbnail.getAttribute('thumbnailid'))
    var Thumb = this.getThumbnailByElement(originalThumbnail);



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
	var thumbDraggerFader = goog.dom.getElement('THUMBNAIL_DRAGGER_FADER');
	utils.fx.fadeOutAndRemove(thumbDraggerFader, 
				  xiv.ANIM_MED, 
				  function(){
				      delete thumbDraggerFader;	
				  })
	this['EVENTS'].runEvent('THUMBNAILDROP', 
				   dragThumbnail.dropTarget, 
				   originalThumbnail);
    }
}



/**
 * Defines 'drop': See comments below for details.
 *
 * @param {!Event}
 * @private
 */
xiv.ThumbnailManager.prototype.drop_ = function(event) {

    var dragThumbnail = 
	goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, 
				    utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    var thumbDragger = goog.dom.getElement('THUMBNAIL_DRAGGER'); 
    var dragClone = thumbDragger.cloneNode(true);


    //------------------
    // Clone the dragger element so we can fade the clone out
    // in the 'dragEnd' function.
    //------------------
    dragClone.setAttribute('id', 'THUMBNAIL_DRAGGER_FADER');
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
 * Defines the goog.fx.DragDropGroup listeners, using the
 * methods outlined in goog.fx.DragDrop tutorials. Such as here:
 * https://code.google.com/p/closure-library/wiki/DragDrop
 *
 * @type {function()}
 * @private
 */
xiv.ThumbnailManager.prototype.initDragDrop = function(){

    window.console.log("INIT DRAG DROP");



    //------------------
    // Define the xiv.Thumbnail clone, for dragging.
    //------------------
    this.thumbnailDragDropGroup_.createDragElement = 
	this.createDragElement_.bind(this);



    //------------------ 
    // Dragger events
    //------------------
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragover', this.dragOver_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragend', this.dragEnd_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 
		       'dragout', this.dragOut_.bind(this));



    //------------------
    // target events
    //------------------
    goog.events.listen(this.thumbnailTargetGroup_, 
		       'drop', this.drop_.bind(this));



    //------------------
    // Set targets
    //------------------
    this.thumbnailDragDropGroup_.addTarget(this.thumbnailTargetGroup_);
    


    //------------------
    // Init the groups as per goog.fx.DragDrop
    //------------------
    this.thumbnailTargetGroup_.init();
    this.thumbnailDragDropGroup_.init();

}



/**
 * Returns a newly created xiv.Thumbnail object. 
 *
 * @param {utils.xnat.viewableProperties} xnatProperties
 * @param {!string | !Array.string} folders 
 *    The folders which the thumbnails belong to.
 * @public
 */
xiv.ThumbnailManager.prototype.createAndAddThumbnail = 
function(xnatProperties, folders) {
    this.addThumbnail(this.createThumbnail(xnatProperties),folders);
}




/**
 * Returns a newly created xiv.Thumbnail object. 
 *
 * @param {utils.xnat.viewableProperties} xnatProperties
 * @returns {xiv.Thumbnail}
 * @public
 */
xiv.ThumbnailManager.prototype.createThumbnail = function(xnatProperties) {
    var thumbnail = new xiv.Thumbnail(xnatProperties);
    thumbnail['EVENTS'].onEvent('CLICK',  function(){
	//window.console.log("THUM", thumbnail);
	this['EVENTS'].runEvent('THUMBNAILCLICK', thumbnail);
    }.bind(this))
    return thumbnail;
}





/**
 * Adds a xiv.Thumbnail to both the private thumbs_ list as well as the 
 * dragdropsource group.
 *
 * @param {xiv.Thumbnail} thumbnail The thumbnail to add.
 * @param {!string | !Array.string} folders 
 *    The folders which the thumbnails belong to.
 * @public
 */
xiv.ThumbnailManager.prototype.addThumbnail = function(thumbnail, folders){

    //------------------
    // Add to private array.
    //------------------
    this.thumbs_[goog.getUid(thumbnail)] = thumbnail;


    //------------------
    // Add to gallery
    //------------------
    //window.console.log(folders);
    this.ThumbnailGallery_.addThumbnail(thumbnail, folders);    


    //------------------
    // Change the thumbnail's element id to the Uid
    //------------------
    thumbnail.getElement().setAttribute('id', goog.getUid(thumbnail));



    //------------------
    // Add also to the drag drop tracking group.
    //------------------
    this.addDragDropSource(thumbnail);



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
 * Adds the element of the xiv.Thumbnail class to 
 * the DragDropGroup (not to be confused with the xiv.Thumbnail
 * class itself).
 *
 * @param {xiv.Thumbnail}
 */
xiv.ThumbnailManager.prototype.addDragDropSource = function(thumbnail){
    var thumbElt = thumbnail.getHoverable();
    if (thumbElt) {
	this.thumbnailDragDropGroup_.addItem(thumbElt);
    }
}




/**
 * Adds a list of xiv.Thumbnail elements to the DragDrop Group.
 *
 * @param {Array.<xiv.Thumbnail>}
 */
xiv.ThumbnailManager.prototype.addDragDropSources = function(thumbnails){
    goog.array.forEach(thumbnails, function(thumbnail) {
	this.addDragDropSource(thumbnail);
    }.bind(this))
}




/**
 * Adds a target element to the group.  Manages
 * its border change in the DragDrop process.
 *
 * @param {Element}
 * @protected
 */
xiv.ThumbnailManager.prototype.addDragDropTarget = function(target) {
    this.thumbnailTargetGroup_.addItem(target);
    target.setAttribute('originalbordercolor', target.style.borderColor);
}




/**
 * Adds an array of elements to the target group.
 *
 * @param {Array.<Element>}
 * @protected
 */
xiv.ThumbnailManager.prototype.addDragDropTargets = function(targetArr) {
    goog.array.forEach(targetArr, function (target) {
	this.addDragDropTarget(target);
    }.bind(this)) 
}





/**
 * Returns the xiv.Thumbnail class when the argument is its element. 
 *
 * @param {Element}
 * @returns {xiv.Thumbnail}
 */
xiv.ThumbnailManager.prototype.getThumbnailByElement = function(element) {
    return this.thumbs_[element.id];
}





/**
 * @type {string} 
 * @const
 */
xiv.ThumbnailManager.ID_PREFIX = 'xiv.ThumbnailManager';



/**
 * @type {string} 
 * @const
 */
xiv.ThumbnailManager.CSS_CLASS_PREFIX = 
    goog.string.toSelectorCase(
	utils.string.getLettersOnly(xiv.ThumbnailManager.ID_PREFIX));


/**
 * @type {string} 
 * @const
 */
xiv.ThumbnailManager.THUMBNAILGALLERY_CLASS =  
    goog.getCssName(xiv.ThumbnailManager.CSS_CLASS_PREFIX, 'thumbnailgallery');
