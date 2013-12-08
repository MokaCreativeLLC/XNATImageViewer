/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx.DragDrop');

/**
 * utils includes
 */
goog.require('utils.array');

/**
 * viewer-widget includes
 */
goog.require('Thumbnail');




/**
 * Thumbnail manager handles the interactive features of Thumbnails
 * such as drag and drop, and also keeps a running list of them for
 * the Modal ckass to reference. 
 *
 * @param {Object=}
 * @constructor
 */
goog.provide('ThumbnailManager');
ThumbnailManager = function (modal) {
    this.initDragDrop();
}
goog.exportSymbol('ThumbnaiManager', ThumbnailManager);




/**
 * @type {Array.<function>}
 * @private
 */
ThumbnailManager.prototype.dropCallbacks_ = [];




/**
 * @type {Array.<function>}
 * @private
 */
ThumbnailManager.prototype.clickCallbacks_ = [];




/**
 * @type {Array.<Thumbnail>}
 * @private
 */
ThumbnailManager.prototype.thumbs_ = [];




/**
 * Loops through all the thumbnails, applying
 * a callback to them as necessary.
 *
 * @param {opt_callback?} The callback to apply
 * to each thumbnail.
 * @public
 */
ThumbnailManager.prototype.loop = function(opt_callback){
    goog.array.forEach(this.thumbs_, function(Thumbnail){
	opt_callback && opt_callback(Thumbnail);
    })
}




/**
 * Defines the goog.fx.DragDropGroup listeners, using the
 * methods outlined in goog.fx.DragDrop tutorials. Such as here:
 * https://code.google.com/p/closure-library/wiki/DragDrop
 *
 * @type {function()}
 * @private
 */
ThumbnailManager.prototype.initDragDrop = function(){
    var that = this;



    //------------------
    // Create Drag and drop Groups as 
    // per goog.fx.DragGroup.
    //------------------
    this.thumbnailDragDropGroup = new goog.fx.DragDropGroup();
    this.thumbnailTargetGroup = new goog.fx.DragDropGroup();



    //------------------
    // Define the Thumbnail clone, for dragging.
    //
    // Creates a drag element that is the clone of the thumbnail.
    // This is implemented because if a user were to click on the text,
    // for instance, the "dragging" clone would be just the text.
    // Instead we want the entire Thumbnail (text, image and all) to
    // be cloned.
    //------------------
    this.thumbnailDragDropGroup.createDragElement = function(sourceEl) {
	var originalThumbnail = goog.dom.getElement(sourceEl.getAttribute('thumbnailid'));
	var Thumb = that.getThumbnailByElement(originalThumbnail);
	if (!Thumb) {
	    return;
	}
	Thumb.setActive(true);
	var dragEl = originalThumbnail.cloneNode(true);
	dragEl.setAttribute('id', 'THUMBNAIL_DRAGGER');
	goog.dom.classes.set(dragEl, Thumbnail.DRAGGING_CLASS);
	return dragEl;
    };



    //------------------
    // Define 'dragOver':  Change the border
    // to highlight color.
    //------------------
    function dragOver(event) {
	event.dropTargetItem.element.style.borderColor = 'rgb(255,255,255)';
    }



    //------------------
    // Define 'dragOut': Revert to old border.
    //------------------
    function dragOut(event) {
	var elt = event.dropTargetItem.element;
	elt.style.borderColor = elt.getAttribute('originalbordercolor');
    }



    //------------------
    // Define 'dragEnd':  See comments below for details.
    //------------------
    function dragEnd(event) {
	//
	// Get the origin thumbnail Element, from which the cloned Thumbnail 
        // came.  This is conducted through a class query.
	//
	var dragThumbnail = goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, Thumbnail.CSS_CLASS_PREFIX);
	var originalThumbnail = goog.dom.getElement(dragThumbnail.getAttribute('thumbnailid'))
	
	//
	// Get the Thumbnail class that holds the dragThumbnail element.
	//
	var Thumb = that.getThumbnailByElement(originalThumbnail);

	//
	// Deactivate that thumb as dragging activates it.  If it is dropped
        // into a ViewBox, it will get reactivated  if successfully loaded.
	//
	Thumb.setActive(false);


	//////////////////////////////////
	//
	// THIS IS WHERE THE THUMBNAIL IS LOADED INTO THE VIEW BOX.
	//
	//////////////////////////////////
	if (dragThumbnail.dropTarget) {

	    var thumbDraggerFader = goog.dom.getElement('THUMBNAIL_DRAGGER_FADER');

	    utils.fx.fadeOutAndRemove(thumbDraggerFader, XnatViewerGlobals.ANIM_MED, function(){
		
		delete thumbDraggerFader;	


	    });
	    goog.array.forEach(that.dropCallbacks_, function(callback) {
		callback(dragThumbnail.dropTarget, originalThumbnail);
		delete dragThumbnail.dropTarget;
 	    })
	}
    }



    //------------------
    // Define 'drop': See comments below for details.
    //-----------------
    function drop(event) {
	//
	// Get the origin thumbnail Element, from which the cloned Thumbnail 
        // came.  This is conducted through a class query.
	//
	var dragThumbnail = goog.dom.getAncestorByClass(event.dragSourceItem.currentDragElement_, Thumbnail.CSS_CLASS_PREFIX);


	//
	// The dragger element
	//
	var thumbDragger = goog.dom.getElement('THUMBNAIL_DRAGGER'); 


	//
	// Clone the dragger element so we can fade the clone out
	// in the 'dragEnd' function.
	//
	var dragClone = thumbDragger.cloneNode(true);
	dragClone.setAttribute('id', 'THUMBNAIL_DRAGGER_FADER');
	document.body.appendChild(dragClone);


	//
	// Delete the Thumbnail Dragger.  
	//
	goog.dom.removeNode(thumbDragger);
	delete thumbDragger;


	//
	// We don't do the drop callbacks here
	// because the "drop" event occurs before the
	// "dragEnd" event.  Rather than implement asnyc handling
	// of the two, the ViewBox 'loadThumbnail' call will occur
	// at dragEnd if there's a dropTarget for original Thumbnail
	//
	dragThumbnail.dropTarget = event.dropTargetItem.element;
    }



    //------------------ 
    // For all thumbnails, apply the methods above that
    // define the behaviors for dragging and dropping.
    //------------------
    goog.events.listen(this.thumbnailDragDropGroup, 'dragover', dragOver);
    goog.events.listen(this.thumbnailDragDropGroup, 'dragend', dragEnd);
    goog.events.listen(this.thumbnailDragDropGroup, 'dragout', dragOut);



    //------------------
    // For all drop targets (i.e. ViewBoxes) apply the relevant
    // methods as well.
    //------------------
    goog.events.listen(this.thumbnailTargetGroup, 'drop', drop);



    //------------------
    // Define the relationship betwen the Drop targets and the draggable
    // elements.  Simply put: draggable element -> set target -> drop target.
    //------------------
    that.thumbnailDragDropGroup.addTarget(that.thumbnailTargetGroup);
    


    //------------------
    // Init the groups as per goog.fx.DragDrop
    //------------------
    that.thumbnailTargetGroup.init();
    that.thumbnailDragDropGroup.init();

}




/**
 * Adds a Thumbnail to both the private thumbs_ list as well as the 
 * dragdropsource group.
 *
 * @type {function(Thumbnail)}
 */
ThumbnailManager.prototype.add = function(thumbnail){

    //------------------
    // Add to private array.
    //------------------
    this.thumbs_.push(thumbnail);



    //------------------
    // Add also to the drag drop tracking group.
    //------------------
    this.addDragDropSource(thumbnail);



    //------------------
    // If the thumbnail is in a ViewBox, 
    // then highlight the view box that the 
    // thumbnail was dropped into when we hover over it.
    //------------------
    thumbnail.addMouseoverCallback(function(Thumbnail){
	XV.ViewBoxManager.loop(function(ViewBox){
	    if (ViewBox.currentThumbnail_ === Thumbnail){
		utils.style.setStyle(ViewBox._element, {'border-color':'rgb(255,255,255)'});
	    }
	})
    })
    //
    // Do the opposite on mouseout
    //
    thumbnail.addMouseoutCallback(function(Thumbnail){
	XV.ViewBoxManager.loop(function(ViewBox){
	    if (ViewBox.currentThumbnail_ === Thumbnail){
		utils.style.setStyle(ViewBox._element, {'border-color':ViewBox._element.getAttribute('originalbordercolor')});
	    }
	})
    })

}




/**
 * Adds the element of the Thumbnail class to 
 * the DragDropGroup (not to be confused with the Thumbnail
 * class itself).
 *
 * @param {Thumbnail}
 */
ThumbnailManager.prototype.addDragDropSource = function(thumbnail){
    //var thumbElt = goog.dom.getAncestorByClass(thumbnail.getElement(), Thumbnail.CSS_CLASS_PREFIX);
    var thumbElt = thumbnail._hoverClone;
    //console.log("HVOER CLONE", thumbElt);
    if (thumbElt) {
	this.thumbnailDragDropGroup.addItem(thumbElt, thumbElt.firstChild.nodeValue);
    }
}




/**
 * Adds a list of Thumbnail elements to the DragDrop Group.
 *
 * @param {Array.<Thumbnail>}
 */
ThumbnailManager.prototype.addDragDropSources = function(thumbnails){
    var that = this;
    goog.array.forEach(thumbnails, function(thumbnail) {
	that.addDragDropSource(thumbnail);
    })
}




/**
 * Adds a target element to the group.  Manages
 * its border change in the DragDrop process.
 *
 * @param {Element}
 * @protected
 */
ThumbnailManager.prototype.addDragDropTarget = function(target) {
    this.thumbnailTargetGroup.addItem(target);
    target.setAttribute('originalbordercolor', target.style.borderColor);
}




/**
 * Adds an array of elements to the target group.
 *
 * @param {Array.<Element>}
 * @protected
 */
ThumbnailManager.prototype.addDragDropTargets = function(targetArr) {
    var that = this;
    goog.array.forEach(targetArr, function (target) {
	that.addDragDropTarget(target);
    }) 
}




/**
 * Callback for when a drop occurs.
 *
 * @param {function}
 * @protected
 */
ThumbnailManager.prototype.addDropCallback = function(callback) {
    this.dropCallbacks_.push(callback);
}




/**
 * Callback for when a click occurs (same things as a drop).
 *
 * @param {function}
 * @protected
 */
ThumbnailManager.prototype.addClickCallback = function(callback) {
    this.clickCallbacks_.push(callback);
}




/**
 * Returns the Thumbnail class when the argument is its _element. 
 *
 * @param {Element}
 * @returns {Thumbnail}
 */
ThumbnailManager.prototype.getThumbnailByElement = function(element) {
    for (var i=0, len = this.thumbs_.length; i < len; i++) {
	if (goog.dom.getAncestorByClass(element, Thumbnail.CSS_CLASS_PREFIX) == this.thumbs_[i]._element) {
	    return this.thumbs_[i];
	}	
    }
}




/**
 * Returns a newly created Thumbnail object. 
 *
 * @param {Element, Object, Object=, boolean=}
 * @returns {Thumbnail}
 */
ThumbnailManager.prototype.makeThumbnail = function(parent, properties, style, addToManager) {
    var that = this;



    //------------------
    // Create new Thumbnail.
    //------------------
    var thumbnail = new Thumbnail(properties);
    thumbnail.setElementParentNode(parent);
   


    //------------------
    // Set the style of the Thumbnail.
    //------------------
    thumbnail.updateStyle(style);



    //------------------
    // Add the Thumbnail to the Manager (this class).
    //------------------
    if (addToManager) { 
	this.add(thumbnail);
	
	//
	// Add click listener
	//
	goog.events.listen(thumbnail._hoverClone, goog.events.EventType.CLICK, function(){

	    //
	    // Run click callbacks
	    //
	    goog.array.forEach(that.clickCallbacks_, function(callback){
		console.log("click callback");
		callback(thumbnail)
	    })
	});
    }


    return thumbnail;
}
