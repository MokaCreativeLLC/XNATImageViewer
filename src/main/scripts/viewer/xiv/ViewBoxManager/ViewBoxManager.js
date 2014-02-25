
/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fx.dom');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.ui.Tooltip');

// utils
goog.require('utils.events.EventManager');
goog.require('utils.style');

// xiv
goog.require('xiv');
goog.require('xiv.ViewBox');




/**
 * xiv.ViewBoxManager handles all xiv.Modal-level operations 
 * in overseeing the xiv.ViewBoxes within a given modal.  For 
 * instance, it handles adding a xiv.ViewBox to the xiv.Modal,
 * deleting a xiv.ViewBox in the xiv.Modal, and it also tracks
 * the xiv.ViewBox locations within the modal using a multi-dimenesional
 * array.
 *
 * @param {xiv.Modal} xivModal The xiv.Modal object that holds the xiv.ViewBox 
 *    objects.
 * @constructor
 */
goog.provide('xiv.ViewBoxManager');
xiv.ViewBoxManager = function (xivModal) {


    /**
     * @type {?goog.fx.DragDropGroup}
     * @private
     */
    this.dragDropGroup_ = null;



    /**
     * @type {Object.<string, Element>}
     * @private
     */
    this.dragDropHandles_ = {};



    /**
     * @type {Array.<Array.<xiv.ViewBox>>}
     * @private
     */
    this.ViewBoxes_ = [[]]; 


    /**
     * @type {Object.<string, Object.<string, number>>}
     * @private
     */
    this.ViewBoxPositions_ = {};



    // events
    utils.events.EventManager.addEventManager(this, 
					      xiv.ViewBoxManager.EventType);
}
goog.exportSymbol('xiv.ViewBoxManager', xiv.ViewBoxManager);



/**
 * Event types.
 * @enum {string}
 */
xiv.ViewBoxManager.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
  VIEWBOXES_CHANGED: goog.events.getUniqueId('viewboxes_changed')
}




/**
 * @type {!Element}
 * @private
 */
xiv.ViewBoxManager.prototype.ViewBoxesParent_ = document.body;




/**
 * param {} arg1
 * param {} arg2
 * @private
 */
xiv.ViewBoxManager.prototype.onViewBoxesChanged_ = function(arg1, arg2) {
    this['EVENTS'].runEvent('VIEWBOXES_CHANGED', arg1, arg2);		
}




/**
 * Utility method that loops through the multi-dimensional 'viewers' array 
 * performing the user-specified 'callback' operation on every viewer.  
 * @param {function} callback The callback function to apply.
 * @return {Object | Array.<Object>}
 * @public
 */
xiv.ViewBoxManager.prototype.loop = function(callback) {
    var returnVals = /**@type {!Array}*/ [];
    var i = /**@type {!number}*/ 0; 
    var j = /**@type {!number}*/ 0;
    var retVal = /**@type {Object}*/ null;

    // Conduct the mult-dimensional loop...
    for (i=0, len = this.ViewBoxes_.length; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    retVal = callback(this.ViewBoxes_[i][j], i, j);
	    // Accumulate return values if necessary.
	    if (retVal) { returnVals.push(retVal); }
	}
    }
    return (returnVals.length === 1) ? returnVals[0] : returnVals;
}




/**
 * Returns the number of xiv.ViewBox columns.
 * @return {number}
 * @public
 */
xiv.ViewBoxManager.prototype.totalColumns = function() {
    return this.ViewBoxes_[0].length;
}




/**
 * Returns the number of xiv.ViewBox rows.
 * @return {number}
 * @public
 */
xiv.ViewBoxManager.prototype.totalRows = function() {
    return this.ViewBoxes_.length;
}




/**
 * Inserts a xiv.ViewBox column into the xiv.Modal, matching
 * the row count.  For instance, if a given modal has two 
 * rows of xiv.ViewBoxes, this will insert a two xiv.ViewBox length
 * column to the right.
 * @param {boolean=} opt_animate Allows the user to animate the column 
 *     insertion.
 * @public
 */
xiv.ViewBoxManager.prototype.insertColumn = function(opt_animate) {

    var newColumn = /**@type {!Array.ViewBox}*/ [];
    var columnLen = /**@type {!number}*/
    (this.ViewBoxes_.length) ? this.ViewBoxes_.length : 1;
    var i = /**@type {!number}*/ 0;
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    for (i = 0; i < columnLen; i++) {newColumn.push(this.createViewBox_())};

    // If there are no Viewers in the modal, add one. Otherwise, insert 
    // the new column.
    if (this.ViewBoxes_.length === 0) {
	this.ViewBoxes_.push([newColumn[0]]);
    } else {
	goog.array.forEach(this.ViewBoxes_, function(ViewBoxRow, i) {
	    ViewBoxRow.push(newColumn[i]);
	})			
    }

    // Events.
    this.onViewBoxesChanged_(newColumn, opt_animate);
    this.resetDragDropGroup_();
}



/**
 * Removes a column of xiv.ViewBoxes from the xiv.Modal.
 * @param {boolean=} opt_animate Allows the user to animate the column removal.
 * @public
 */
xiv.ViewBoxManager.prototype.removeColumn = function(opt_animate) {

    // Animate remove if opt_animate argument not provided.
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove columns only if there's greater than one viewer in the modal.
    if (this.ViewBoxes_[0] && this.ViewBoxes_[0].length > 1) {
	goog.array.forEach(this.ViewBoxes_, function(ViewBox, i) {
	    var rowLen = /**@type {!number}*/ ViewBox.length - 1;
	    utils.fx.fadeTo(ViewBox[rowLen].getElement(), xiv.ANIM_FAST, 0);

	    // Remove the drag drop handles
	    var dragDropHandle = /**@type {!Element}*/ this.dragDropHandles_[
		ViewBox[rowLen].getElement().id];
	    dragDropHandle.parentNode.removeChild(dragDropHandle);
	    delete dragDropHandle;

	    // Remove the xiv.ViewBox
	    ViewBox[rowLen].getElement().parentNode.removeChild(
		ViewBox[rowLen].getElement());
	    ViewBox.splice(rowLen, 1);		
	}.bind(this))
    }

    // Events.
    this.onViewBoxesChanged_(null, opt_animate);
    this.resetDragDropGroup_();
}




/**
 * Inserts a xiv.ViewBox row into the xiv.Modal, matching
 * the column count.  For instance, if a given modal has two 
 * columns of xiv.ViewBoxes, this will insert a two xiv.ViewBox length
 * row at the bottom.
 * @param {boolean=} opt_animate Allows the user to animate the row insertion.
 * @public
 */
xiv.ViewBoxManager.prototype.insertRow = function(opt_animate) {

    var newRow = /**@type {!Array.ViewBox}*/ [];
    var rowLen = /**@type {!number}*/ 
    (this.ViewBoxes_[0] && this.ViewBoxes_[0].length) ? 
	this.ViewBoxes_[0].length : 1;
    var i = /**@type {!number}*/ 0;
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    for (i=0; i < rowLen; i++) {newRow.push(this.createViewBox_())};
    this.ViewBoxes_.push(newRow);
    newSet = newRow;

    // Events
    this.onViewBoxesChanged_(newSet, opt_animate);
    this.resetDragDropGroup_();
}




/**
 * Removes a row of xiv.ViewBoxes from the xiv.Modal.
 *
 * @param {boolean=} opt_animate Allows the user to animate the row removal.
 * @public
 */
xiv.ViewBoxManager.prototype.removeRow = function(opt_animate) {

    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove rows only if there's greater than one
    // viewer in the modal.
    if (this.ViewBoxes_.length > 1) {
	var delRow = /**@type {!Array.ViewBox}*/
	this.ViewBoxes_[this.ViewBoxes_.length - 1];
	goog.array.forEach(delRow, function(currDelViewBox) { 
	    utils.fx.fadeTo(currDelViewBox.getElement(), xiv.ANIM_FAST, 0);
	    currDelViewBox.getElement().parentNode.removeChild(
		currDelViewBox.getElement());
	    // Remove the drag drop handles
	    var dragDropHandle = /**@type {!Element}*/ this.dragDropHandles_[
		currDelViewBox.getElement().id];
	    dragDropHandle.parentNode.removeChild(dragDropHandle);
	    delete dragDropHandle;
	}.bind(this))
	this.ViewBoxes_.splice(this.ViewBoxes_.length -1, 1);
    }

    // Events.
    this.onViewBoxesChanged_(null, opt_animate);
    this.resetDragDropGroup_();
}





/**
 * Loops through all of the viewboxes, searching if its 'element' object 
 * matches with the 'element' argument.
 * @param {!Element} element The xiv.ViewBox element to retrieve the 
 *    xiv.ViewBox object from.
 * @return {xiv.ViewBox}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBoxByElement = function(element) {
    var i = /**@type {!number}*/ 0;
    var j = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ this.ViewBoxes_.length;
    var len2 = /**@type {!number}*/ 0;
    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    if (element === this.ViewBoxes_[i][j].getElement()) {
		return  this.ViewBoxes_[i][j];	
	    }
	}
    }
}




/**
 * Returns the xiv.ViewBox element at the specified row and column.
 * @param {!number} row The row of the desired ViewBox.
 * @param {!number} col The column of the desired ViewBox.
 * @return {Element}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBoxElement = function(row, col) {
    return this.ViewBoxes_[row][col].getElement()
}




/**
 * Returns the xiv.ViewBox object at the specified row and column.
 * @param {!number} row The row of the desired ViewBox.
 * @param {!number} col The column of the desired ViewBox. 
 * @param {!number, !number}
 * @return {xiv.ViewBox}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBox = function(row, col) {
    return this.ViewBoxes_[row][col];
}





/**
 * Returns the xiv.ViewBox objects as a single list
 * instead of an md-array.
 * @return {Array.<xiv.ViewBox>}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBoxes = function() {
    return this.loop (function(ViewBox) { 
	return ViewBox;	
    })
}




/**
 * Returns the xiv.ViewBox elements as a single list
 * instead of an md-array.
 * @return {Array.<Element>}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBoxElements = function() {
    var ws = /** {Array.<Element> | Element}*/ this.loop (function(ViewBox) { 
	return ViewBox.getElement();	
    })
    return (ws instanceof Array) ? ws : [ws];
}




/**
 * @param {Element} elt
 * @public
 */
xiv.ViewBoxManager.prototype.setViewBoxesParent = function(elt) {
    this.ViewBoxesParent_ = elt;
}


/**
 * Makes a xiv.ViewBox.
 * @return {xiv.ViewBox}
 * @private
 */
xiv.ViewBoxManager.prototype.createViewBox_ = function() {

    var ViewBox = /**@type {!xiv.ViewBox}*/ new xiv.ViewBox();
    goog.dom.append(this.ViewBoxesParent_, ViewBox.getElement());
    this.addDragDropHandle_(ViewBox);
    this.setViewBoxEvents_(ViewBox);
    return ViewBox;    
}



/**
 * @param {xiv.ViewBox} ViewBox
 * @private
 */
xiv.ViewBoxManager.prototype.addDragDropHandle_ = function(ViewBox) {
    var dragDropHandle = /**@type {!Element}*/ 
    goog.dom.createDom("img",  {
	'id': 'DragAndDropHandle',
	'class' : xiv.ViewBox.DRAG_AND_DROP_HANDLE_CLASS,
	'src' : xiv.ICON_URL + "Icons/Toggle-DragAndDrop.png"
    });
    dragDropHandle.setAttribute('viewboxid', ViewBox.getElement().id); 
    goog.dom.append(this.ViewBoxesParent_, dragDropHandle)

    // Add to class property.
    this.dragDropHandles_[ViewBox.getElement().id] = dragDropHandle;

    // Tool tip
    dragDropHandle.title = "Drag and drop view box to swap.";
}



/**
 * @param {xiv.ViewBox} ViewBox
 * @private
 */
xiv.ViewBoxManager.prototype.setViewBoxEvents_ = function(ViewBox) {
    goog.array.forEach(this['EVENTS'].getEventCallbacks('THUMBNAIL_LOADED'), 
		       function(callback) {
	ViewBox['EVENTS'].onEvent('THUMBNAIL_LOADED', callback);
    });
    goog.array.forEach(this['EVENTS'].getEventCallbacks('THUMBNAIL_PRELOAD'), 
		       function(callback) {
	ViewBox['EVENTS'].onEvent('THUMBNAIL_PRELOAD', callback);
    });
    goog.array.forEach(this['EVENTS'].getEventCallbacks('THUMBNAIL_LOADERROR'), 
		       function(callback) {
	ViewBox['EVENTS'].onEvent('THUMBNAIL_LOADERROR', callback);
    });
}




/**
 * Swaps one xiv.ViewBox with another based on the class, 
 * the element of the ID.
 *
 * @param {xiv.ViewBox|Element|string} v1 xiv.ViewBox Class, 
 *     xiv.ViewBox.getElement(), or xiv.ViewBox ID
 * @param {xiv.ViewBox|Element|string, v2 xiv.ViewBox Class, 
 *     xiv.ViewBox.getElement(), or xiv.ViewBox ID
 * @public
 */
xiv.ViewBoxManager.prototype.swap = function(v1, v2) {

    //------------------
    // Loop through all view boxes to determine
    // the locations of the two xiv.ViewBoxes to swap.
    //------------------
    var arrLoc = this.loop ( function (v, i, j) { 
	var byObj = (v === v1) || (v === v2);
	var byElement = (v.getElement() === v1) || (v.getElement() === v2);
	var byId = (v.getElement().id === v1) || (v.getElement().id === v2);
	
	if (byObj || byElement || byId) {
	    return {
		"i" : i,
		"j" : j
	    }				
	}
    })


    //------------------
    // If both viewBoxes are found, swap them...
    //------------------
    if (arrLoc.length === 2) {
	var tempViewBox = this.ViewBoxes_[arrLoc[0].i][arrLoc[0].j];
	this.ViewBoxes_[arrLoc[0].i][arrLoc[0].j] = 
	    this.ViewBoxes_[arrLoc[1].i][arrLoc[1].j];
	this.ViewBoxes_[arrLoc[1].i][arrLoc[1].j] = tempViewBox;
	


    //------------------
    // Otherwise, throw an error.
    //------------------
    } else {
	throw "SWAP ERROR: "
    }
}	




/**
 * Returns the total number of xiv.ViewBoxes within
 * a modal.
 *
 * @return {number}
 * @public
 */
xiv.ViewBoxManager.prototype.numViewBoxes = function() {
    return this.ViewBoxes_.length * this.ViewBoxes_[0].length;	 
}





/**
 * Returns the xiv.ViewBox after the xiv.ViewBox provided in the argument,
 * using a left-to-right, top-to-bottom scheme.
 *
 * @param {!xiv.ViewBox} currViewBox The xiv.ViewBox to reference after.
 * @return {!xiv.ViewBox}
 * @public
 */
xiv.ViewBoxManager.prototype.getViewBoxAfter = function (currViewBox) {
    
    var i = /**@type {!number}*/ 0;
    var j = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ this.ViewBoxes_.length;
    var len2 = /**@type {!number}*/ 0;
    var maxRow = /**@type {!number}*/ 0;
    var maxCol = /**@type {!number}*/ 0;

    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    
	    if (this.ViewBoxes_[i][j] === currViewBox) {
		
		maxRow = ((i+1) === this.ViewBoxes_.length);
		maxCol = ((j+1) === this.ViewBoxes_[i].length);
		
		if (maxRow && maxCol) {
		    //utils.dom.debug("0,0")
		    return this.ViewBoxes_[0][0];
		    
		} else if (maxRow && !maxCol) {
		    //utils.dom.debug("0,j+1")
		    return this.ViewBoxes_[0][j+1];
		    
		} else if (!maxRow && maxCol) {
		    //utils.dom.debug("i+1,0")
		    return this.ViewBoxes_[i+1][0];
		    
		} else {
		    //utils.dom.debug("i+1,j+1")
		    return this.ViewBoxes_[i+1][j+1];
		}
		
	    }
	}
    }		
}




/**
 * Gets the first xiv.ViewBox without any viewable contents.
 *  
 * @return {xiv.ViewBox}
 * @public
 */
xiv.ViewBoxManager.prototype.getFirstEmpty = function() {

    //------------------
    // Populate any empty xiv.ViewBoxes, if they exist.
    //------------------
    var ViewBoxesByLoad = {};
    var loadTimes = [];
    var loaderViewBox = this.loop(function(ViewBox){
	
	if (!ViewBox.thumbnail) {
	    return ViewBox;
	}
	else{
	    ViewBoxesByLoad[ViewBox.thumbnailLoadTime] = ViewBox;
	    loadTimes.push(ViewBox.thumbnailLoadTime);
	}
    }.bind(this))



    //------------------
    // If no empty, return ViewBox which as first 
    // loaded...
    //------------------
    if (goog.isArray(loaderViewBox) && (loaderViewBox.length > 0)){
	return loaderViewBox[0];

    } else if (goog.isArray(loaderViewBox) && (loaderViewBox.length == 0)){
	loadTimes.sort();
	return ViewBoxesByLoad[loadTimes[0]];
	
    } else {
	return loaderViewBox;
    }
}




/**
 * Animates a position swap between two view boxes.
 *
 * @param {!xiv.ViewBox} ViewBoxElementA The first xiv.ViewBox element to swap.
 * @param {!xiv.ViewBox} ViewBoxElementB The second xiv.ViewBox element to swap.
 * @param {!Object.<string, string>} ViewBoxPositions The ViewBox positions to reference.
 * @param {boolean=} opt_animate Whether to animate the swap.
 * @private
 */
xiv.ViewBoxManager.prototype.animateSwap_ = function(ViewBoxElementA, ViewBoxElementB, ViewBoxPositions, opt_animated) {

    var animLen = (opt_animated === false) ? 0 : xiv.ANIM_MED;
    var animQueue = new goog.fx.AnimationParallelQueue();
    var ViewBoxADims = ViewBoxPositions[ViewBoxElementA.id]['relative'];
    var ViewBoxBDims = ViewBoxPositions[ViewBoxElementB.id]['relative'];



    //------------------
    // Define the animation method.
    //------------------
    function slide(el, a, b, duration) {
	return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], [a, b], duration, goog.fx.easing.easeOut);
    }



    //------------------
    // Add animations to queue.
    //------------------
    animQueue.add(slide(ViewBoxElementA, ViewBoxBDims['left'], ViewBoxBDims['top'], xiv.ANIM_MED));
    animQueue.add(slide(ViewBoxElementB, ViewBoxADims['left'], ViewBoxADims['top'], xiv.ANIM_MED));



    //------------------
    // When animation finishes do an array swap
    // within the xiv.ViewBox tracking property.
    //------------------
    goog.events.listen(animQueue, 'end', function() {
	this.updateDragDropHandles();
    }.bind(this))



    //------------------
    // Play animation
    //------------------
    animQueue.play();

}




/**
 * Initializes and/or resets the DragDrop swapping of xiv.ViewBoxes.
 * This needs to be called every time a xiv.ViewBox is added or 
 * removed from the MODAL.
 *
 * @private
 */
xiv.ViewBoxManager.prototype.resetDragDropGroup_ = function() {
    

    

    //------------------
    // Clear the dragDrop groups and delete.
    //------------------
    if (this.dragDropGroup_) {
	this.dragDropGroup_.removeItems();
	this.dragDropTargets.removeItems();
	delete this.dragDropGroup_;
	delete this.dragDropTargets;
    }



    //------------------
    // Create new drag-drop groups:
    // for the draggers (the handle) and 
    // the targets (the xiv.ViewBox.getElement()s).
    //------------------
    this.dragDropGroup_ = new goog.fx.DragDropGroup();
    this.dragDropTargets = new goog.fx.DragDropGroup();



    //------------------
    // Add the items to the dragDropGroup_s.
    //------------------
    this.loop(function(ViewBox) {
	this.dragDropGroup_.addItem(
	    this.dragDropHandles_[ViewBox.getElement().id]);
	this.dragDropTargets.addItem(ViewBox.getElement());
    }.bind(this))



    //------------------
    // Set the target of the 
    // dragDropGroup_ (the handles) 
    // to the targets (the xiv.ViewBox elements).
    //------------------   
    this.dragDropGroup_.addTarget(this.dragDropTargets);



    //------------------
    // Init both drag drop groups.
    //------------------   
    this.dragDropGroup_.init();
    this.dragDropTargets.init();



    //------------------
    // google.fx.dragDropGroup_ inherited function
    // to create a dragElement (a childless clone 
    // of the xiv.ViewBox.getElement()).
    //------------------
    this.dragDropGroup_.createDragElement = function(sourceElt) {
	var dragElement = this.makeDragClone_(goog.dom.getElement(sourceElt.getAttribute('viewboxid')));
	return dragElement;
    }.bind(this);




    //------------------
    // Listen for drag events.
    //------------------
    goog.events.listen(this.dragDropGroup_, 'dragstart', 
		       this.dragStart_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragover', 
		       this.dragOver_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragend', 
		       this.dragEnd_.bind(this));
}




/**
* Define DRAG START function
* We record the xiv.ViewBox positions.
*
* @param {!Event}
* @private
*/
xiv.ViewBoxManager.prototype.dragStart_ = function(event) {
    
    this.ViewBoxPositions_ = /**@type {<Object.<string, Object>}*/{};
    this.loop(function(ViewBox){
	this.ViewBoxPositions_[ViewBox.getElement().id] = {
	    'absolute': utils.style.absolutePosition(ViewBox.getElement()),
	    'relative': utils.style.dims(ViewBox.getElement())
	}
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'hidden';
    }.bind(this))
}







/**
 * Function to create drag clone.
 *
 * @param {!Event}
 * @private
 */
xiv.ViewBoxManager.prototype.makeDragClone_ = function(ViewBoxElement, opt_parent) {
    var dragElement = ViewBoxElement.cloneNode(false);
    goog.dom.classes.set(dragElement, xiv.ViewBox.DRAGGING_CLASS);
    opt_parent && opt_parent.appendChild(dragElement);
    return dragElement;
}.bind(this);





/**
 * Updates the position of the dragDropHandles_.
 *
 * @public
 */
xiv.ViewBoxManager.prototype.updateDragDropHandles = function() {
    this.loop(function(ViewBox){
	var ViewBoxDims = utils.style.dims(ViewBox.getElement());
	var dragDropHandle = this.dragDropHandles_[ViewBox.getElement().id];
	utils.style.setStyle(dragDropHandle, {'left': ViewBoxDims['left'], 'top': ViewBoxDims['top']});
    }.bind(this))
}


/**
 * Define DRAG OVER function.
 *
 * @param {!Event}
 * @private
 */
xiv.ViewBoxManager.prototype.dragOver_ = function(event) {

    if (event.dropTargetItem.getElement().id !== 
	event.dragSourceItem.currentDragElement_.getAttribute('viewboxid')) {
	var ViewBoxElementA = 
	    goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute('viewboxid'));
	var ViewBoxElementB = 
	    goog.dom.getElement(event.dropTargetItem.getElement().id);

	this.swap(ViewBoxElementA, ViewBoxElementB);
	
	this.animateSwap_(ViewBoxElementA, ViewBoxElementB, 
			  this.ViewBoxPositions_);

	//
	// We have to update ViewBoxPositions as it
	// does not update after the swap.
	//
	var valA = this.ViewBoxPositions_[ViewBoxElementA.id];
	var valB = this.ViewBoxPositions_[ViewBoxElementB.id];
	this.ViewBoxPositions_[ViewBoxElementA.id] = valB;
	this.ViewBoxPositions_[ViewBoxElementB.id] = valA;
	
    }
}



/**
 * DRAG END function.
 * NOTE: goog.fx.dragDropGroup will delete the original dragger
 * so we have to clone it to reanimate it back 
 * into place.
 *
 * @param {!Event}
 * @private
 */
xiv.ViewBoxManager.prototype.dragEnd_ = function(event) {

    var originalViewBox = goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute('viewboxid'));
    var originalViewBoxDims = utils.style.absolutePosition(originalViewBox);
    var dragger = event.dragSourceItem.parent_.dragEl_;
    var animQueue = new goog.fx.AnimationParallelQueue();	

    //
    // We have to clone the dragger as goog.fx.dragDropGroup
    // will delete the original dragger.
    //
    var draggerClone = this.makeDragClone_(dragger, document.body);
    // Set the draggerClone parent to the modal parent
    // to avoid any weird positioning issues.
    
    var dragParent = this.ViewBoxesParent_.parentNode ? 
	this.ViewBoxesParent_.parentNode : this.ViewBoxesParent_;
    goog.dom.append(dragParent, draggerClone);

    var draggerViewBoxDims = utils.style.absolutePosition(dragger);
    utils.style.setStyle(draggerClone, {
	'top': draggerViewBoxDims['top'], 
	'left': draggerViewBoxDims['left'],
	'z-index': 10000
    });


    //
    // Define the slide animation.
    //
    function slide(el, a, b, duration) {
	return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], [a,b], 
				     duration, goog.fx.easing.easeOut);
    }

    //
    // Add the slide animation to the 
    // animQueue.
    //
    animQueue.add(slide(draggerClone, 
			originalViewBoxDims['left'], 
			originalViewBoxDims['top'], 
			xiv.ANIM_FAST));

    //
    // When animation finishes, delete
    // the draggerClone.
    //
    goog.events.listen(animQueue, 'end', function() {
	draggerClone.parentNode.removeChild(draggerClone); 
	delete draggerClone;
    })
    
    //
    // Play animation
    //
    animQueue.play();

    //
    // Show dragDropHandles_
    //
    this.loop(function(ViewBox){
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'visible';	
    }.bind(this))
}


