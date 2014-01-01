/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');

/**
 * utils includes
 */
goog.require('utils.array');

/**
 * viewer-widget includes
 */
goog.require('xiv.Thumbnail');




/**
 * xiv.Thumbnail manager handles the interactive features of xiv.Thumbnails
 * such as drag and drop, and also keeps a running list of them for
 * the xiv._Modal ckass to reference. 
 *
 * @constructor
 */
goog.provide('xiv.ThumbnailManager');
xiv.ThumbnailManager = function () {
    this.initDragDrop();
    this.dropCallbacks_ = [];
    this.clickCallbacks_ = [];
    this.thumbs_ = [];
}
goog.exportSymbol('xiv.ThumbnailManager', xiv.ThumbnailManager);




/**
 * @type {?Array.<function>}
 * @private
 */
xiv.ThumbnailManager.prototype.dropCallbacks_ = null;




/**
 * @type {?Array.<function>}
 * @private
 */
xiv.ThumbnailManager.prototype.clickCallbacks_ = null;




/**
 * @type {?Array.<xiv.Thumbnail>}
 * @private
 */
xiv.ThumbnailManager.prototype.thumbs_ = null;



/**
 * @type {?goog.fx.DragDropGroup}
 * @private
 */
this.thumbnailDragDropGroup_ = null;


/**
 * @type {?goog.fx.DragDropGroup}
 * @private
 */
this.thumbnailTargetGroup_ = null;





/**
 * Loops through all the thumbnails, applying
 * a callback to them as necessary.
 *
 * @param {opt_callback?} The callback to apply
 * to each thumbnail.
 * @public
 */
xiv.ThumbnailManager.prototype.loop = function(opt_callback){
    goog.array.forEach(this.thumbs_, function(_thumbnail){
	opt_callback && opt_callback(_thumbnail);
    })
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
    var srcElt = goog.dom.getAncestorByClass(srcElt, xiv.Thumbnail.CSS_CLASS_PREFIX);
    var originalThumbnail = goog.dom.getElement(srcElt.getAttribute('thumbnailid'));
    var Thumb = this.getThumbnailByElement(originalThumbnail);
    if (!Thumb) { return;}
    Thumb.setActive(true);

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
    var dragThumbnail = goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, utils.ui.Thumbnail.CSS_CLASS_PREFIX);
    var originalThumbnail = goog.dom.getElement(dragThumbnail.getAttribute('thumbnailid'))
    var Thumb = this.getThumbnailByElement(originalThumbnail);



    //------------------
    // Deactivate that thumb as dragging activates it.  If it is dropped
    // into a xiv.ViewBox, it will get reactivated  if successfully loaded.
    //------------------
    Thumb.setActive(false);



    //*************************************************************
    //
    // THIS IS WHERE THE THUMBNAIL IS LOADED INTO THE VIEW BOX.
    //
    //*************************************************************
    if (dragThumbnail.dropTarget) {
	var thumbDraggerFader = goog.dom.getElement('THUMBNAIL_DRAGGER_FADER');
	utils.fx.fadeOutAndRemove(thumbDraggerFader, xiv.ANIM_MED, function(){
	    delete thumbDraggerFader;	
	})
	goog.array.forEach(this.dropCallbacks_, function(callback) {
	    callback(dragThumbnail.dropTarget, originalThumbnail);
	    delete dragThumbnail.dropTarget;
 	})
    }
}



/**
 * Defines 'drop': See comments below for details.
 *
 * @param {!Event}
 * @private
 */
xiv.ThumbnailManager.prototype.drop_ = function(event) {

    var dragThumbnail = goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, utils.ui.Thumbnail.CSS_CLASS_PREFIX);
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

    //------------------
    // Create Drag and drop Groups as 
    // per goog.fx.DragGroup.
    //------------------
    this.thumbnailDragDropGroup_ = new goog.fx.DragDropGroup();
    this.thumbnailTargetGroup_ = new goog.fx.DragDropGroup();



    //------------------
    // Define the xiv.Thumbnail clone, for dragging.
    //------------------
    this.thumbnailDragDropGroup_.createDragElement = this.createDragElement_.bind(this)



    //------------------ 
    // Dragger events
    //------------------
    goog.events.listen(this.thumbnailDragDropGroup_, 'dragover', this.dragOver_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 'dragend', this.dragEnd_.bind(this));
    goog.events.listen(this.thumbnailDragDropGroup_, 'dragout', this.dragOut_.bind(this));



    //------------------
    // target events
    //------------------
    goog.events.listen(this.thumbnailTargetGroup_, 'drop', this.drop_.bind(this));



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
 * Adds a xiv.Thumbnail to both the private thumbs_ list as well as the 
 * dragdropsource group.
 *
 * @param {xiv.Thumbnail}
 */
xiv.ThumbnailManager.prototype.add = function(thumbnail){

    //------------------
    // Add to private array.
    //------------------
    this.thumbs_.push(thumbnail);



    //------------------
    // Add also to the drag drop tracking group.
    //------------------
    this.addDragDropSource(thumbnail);



    //------------------
    // If the thumbnail is in a xiv.ViewBox, 
    // then highlight the view box that the 
    // thumbnail was dropped into when we hover over it.
    //------------------
    thumbnail.onMouseOver = function(Thumbnail){
	xiv._Modal.ViewBoxManager.loop(function(ViewBox){
	    if (ViewBox.currentThumbnail_ === Thumbnail){
		utils.style.setStyle(ViewBox.element, 
				     {'border-color':'rgb(255,255,255)'});
	    }
	})
    }
    //
    // Do the opposite on mouseout
    //
    thumbnail.onMouseOut = function(Thumbnail){
	xiv._Modal.ViewBoxManager.loop(function(ViewBox){
	    if (ViewBox.currentThumbnail_ === Thumbnail){
		utils.style.setStyle(ViewBox.element, 
				     {'border-color':ViewBox.element.getAttribute('originalbordercolor')});
	    }
	})
    }

}




/**
 * Adds the element of the xiv.Thumbnail class to 
 * the DragDropGroup (not to be confused with the xiv.Thumbnail
 * class itself).
 *
 * @param {xiv.Thumbnail}
 */
xiv.ThumbnailManager.prototype.addDragDropSource = function(thumbnail){
    var thumbElt = thumbnail.hoverNode;
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
 * Callback for when a drop occurs.
 *
 * @param {function}
 * @protected
 */
xiv.ThumbnailManager.prototype.addDropCallback = function(callback) {
    this.dropCallbacks_.push(callback);
}




/**
 * Callback for when a click occurs (same things as a drop).
 *
 * @param {function}
 * @protected
 */
xiv.ThumbnailManager.prototype.addClickCallback = function(callback) {
    this.clickCallbacks_.push(callback);
}




/**
 * Returns the xiv.Thumbnail class when the argument is its element. 
 *
 * @param {Element}
 * @returns {xiv.Thumbnail}
 */
xiv.ThumbnailManager.prototype.getThumbnailByElement = function(element) {
    for (var i=0, len = this.thumbs_.length; i < len; i++) {
	if (goog.dom.getAncestorByClass(element, xiv.Thumbnail.CSS_CLASS_PREFIX) == this.thumbs_[i].element) {
	    return this.thumbs_[i];
	}	
    }
}




/**
 * Returns a newly created xiv.Thumbnail object. 
 *
 * @param {utils.xnat.properties} xnatProperties
 * @param {boolean=} opt_addToManager
 * @returns {xiv.Thumbnail}
 * @public
 */
xiv.ThumbnailManager.prototype.makeXivThumbnail = function(xnatProperties, opt_addToManager) {
    var thumbnail = new xiv.Thumbnail(xnatProperties);
    if ((opt_addToManager === undefined) || (opt_addToManager === true)) { 
	this.add(thumbnail);
	thumbnail.onClick = function(){
	    goog.array.forEach(this.clickCallbacks_, function(callback){
		callback(thumbnail)
	    })
	}.bind(this)
    }
    return thumbnail;
}
