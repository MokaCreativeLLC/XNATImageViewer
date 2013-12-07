/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.ui.Tooltip');

/**
 * utils includes
 */
goog.require('utils.style');

/**
 * viewer-widget includes
 */
goog.require('ViewBox');




/**
 * ViewBoxManager handles all Modal-level operations 
 * in overseeing the ViewBoxes within a given modal.  For 
 * instance, it handles adding a ViewBox to the Modal,
 * deleting a ViewBox in the Modal, and it also tracks
 * the ViewBox locations within the modal using a multi-dimenesional
 * array.
 *
 * @param {Object=}
 * @constructor
 */
goog.provide('ViewBoxManager');
ViewBoxManager = function (XnatViewerModal) {
    this.Modal_  = XnatViewerModal;
    this.viewersChangedCallbacks_ = [];
}
goog.exportSymbol('ViewBoxManager', ViewBoxManager);




/**
 * @type {?Modal}
 * @private
 */
ViewBoxManager.prototype.Modal_  = null;




/**
 * @type {Array.<function>}
 * @private
 */
ViewBoxManager.prototype.viewersChangedCallbacks_ = [];




/**
 * @type {?goog.fx.DragDropGroup}
 * @private
 */
ViewBoxManager.prototype.dragDropGroup = null;




/**
 * @type {Object.<string, Element>}
 * @private
 */
ViewBoxManager.prototype.dragDropHandles = {};




/**
 * @type {function()}
 * @private
 */
ViewBoxManager.prototype.runViewBoxesChangedCallbacks = function() {
    if (this.viewersChangedCallbacks_.length > 0) {	
	goog.array.forEach(this.viewersChangedCallbacks_, function(a) { a();});
    }	
}




/**
* @private
* @type {Array.<Array.<ViewBox>>}
*/
ViewBoxManager.prototype.ViewBoxes_ = [[]];




/**
* Utility method that loops through the multi-dimensional 
* 'viewers' array performing the user-specified 'callback' 
* operation on every viewer.  
*
* @param {function} callback 
* @return {Object | Array.<Object>}
*/
ViewBoxManager.prototype.loop = function(callback) {
    var returnVals = [];
    

    //------------------
    // Conduct the mult-dimensional loop...
    //------------------
    for (var i=0, len = this.ViewBoxes_.length; i < len; i++) {
	for (var j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {

	    //
	    // Apply callback to current viewer, providing
	    // the viewer arguments and the array location
	    // of the viewer to the callback.
	    //
	    var r = callback(this.ViewBoxes_[i][j], i, j);

	    //
	    // Accumulate the return values specified
	    // in the 'callback' operation.
	    //
	    if (r) {
		returnVals.push(r);
	    }
	}
    }
    


    //------------------
    // Construct the return object either
    // as an array or as a single entity.
    //------------------
    if (returnVals.length > 0) {
	if (returnVals.length === 1) {
	    return returnVals[0]
	} else {
	    return returnVals;
	}
    }		
    
}




/**
 * Returns the number of ViewBox columns.
 *
 * @return {number}
 */
ViewBoxManager.prototype.numCols = function() {
    return this.ViewBoxes_[0].length;
}




/**
 * Returns the number of ViewBox rows.
 *
 * @return {number}
 */
ViewBoxManager.prototype.numRows = function() {
    return this.ViewBoxes_.length;
}




/**
 * Inserts a ViewBox column into the Modal, matching
 * the row count.  For instance, if a given modal has two 
 * rows of ViewBoxes, this will insert a two ViewBox length
 * column to the right.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.insertColumn = function(opt_animate) {

    //------------------
    // Animate insertion if opt_animate argument not provided.
    //------------------
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;
		


    //------------------
    // Construct the new column as an array.
    //------------------
    var newColumn = [];
    var columnLen = (this.ViewBoxes_.length) ? this.ViewBoxes_.length : 1;
    for (var i = 0; i < columnLen; i++) {					
	newColumn.push(this.makeViewBox());						
    }


    //------------------
    // If there are no Viewers in the modal, add one...
    //------------------    
    if (this.ViewBoxes_.length === 0) {
	this.ViewBoxes_.push([newColumn[0]]);



    //------------------
    // Otherwise, insert the new column.
    //------------------
    } else {
	goog.array.forEach(this.ViewBoxes_, function(ViewBoxRow, i) {
	    ViewBoxRow.push(newColumn[i]);
	})			
    }
    


    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(newColumn, opt_animate);



    //------------------
    // Reset DragDropGroup
    //------------------
    this.resetDragDropGroup();
}



/**
 * Removes a column of ViewBoxes from the Modal.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.removeColumn = function(opt_animate) {

    var that = this;

    //------------------
    // Animate remove if opt_animate argument not provided.
    //------------------
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;



    //------------------
    // Remove columns only if there's greater than one
    // viewer in the modal.
    //------------------
    if (this.ViewBoxes_[0] && this.ViewBoxes_[0].length > 1) {
	goog.array.forEach(this.ViewBoxes_, function(ViewBox, i) {
	    var rowLen = ViewBox.length - 1;
	    utils.fx.fadeTo(ViewBox[rowLen]._element, XnatViewerGlobals.ANIM_FAST, 0);
	    
	    //
	    // Remove the drag drop handles
	    // 
	    var dragDropHandle = that.dragDropHandles[ViewBox[rowLen]._element.id];
	    dragDropHandle.parentNode.removeChild(dragDropHandle);
	    delete dragDropHandle;

	    //
	    // Remove the ViewBox
	    //
	    ViewBox[rowLen]._element.parentNode.removeChild(ViewBox[rowLen]._element);
	    ViewBox.splice(rowLen, 1);		
	})
    }



    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(null, opt_animate);



    //------------------
    // Reset DragDropGroup
    //------------------
    this.resetDragDropGroup();
}




/**
 * Inserts a ViewBox row into the Modal, matching
 * the column count.  For instance, if a given modal has two 
 * columns of ViewBoxes, this will insert a two ViewBox length
 * row at the bottom.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.insertRow = function(opt_animate) {

    //------------------
    // Animate remove if opt_animate argument not provided.
    //------------------
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;



    //------------------
    // Add row.
    //------------------
    var newRow = [];
    var rowLen = (this.ViewBoxes_[0] && this.ViewBoxes_[0].length) ? this.ViewBoxes_[0].length : 1;
    for (var i=0; i < rowLen; i++) { 						
	newRow.push(this.makeViewBox());
    }
    this.ViewBoxes_.push(newRow);
    newSet = newRow;



    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(newSet, opt_animate);



    //------------------
    // Reset DragDropGroup
    //------------------
    this.resetDragDropGroup();
}




/**
 * Removes a row of ViewBoxes from the Modal.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.removeRow = function(opt_animate) {

    var that = this;

    //------------------
    // Animate remove if opt_animate argument not provided.
    //------------------
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;



    //------------------
    // Remove rows only if there's greater than one
    // viewer in the modal.
    //------------------
    if (this.ViewBoxes_.length > 1) {
	var delRow = this.ViewBoxes_[this.ViewBoxes_.length - 1];
	goog.array.forEach(delRow, function(currDelViewBox) { 
	    utils.fx.fadeTo(currDelViewBox._element, XnatViewerGlobals.ANIM_FAST, 0);
	    currDelViewBox._element.parentNode.removeChild(currDelViewBox._element);
	    //
	    // Remove the drag drop handles
	    // 
	    var dragDropHandle = that.dragDropHandles[currDelViewBox._element.id];
	    dragDropHandle.parentNode.removeChild(dragDropHandle);
	    delete dragDropHandle;
	})
	this.ViewBoxes_.splice(this.ViewBoxes_.length -1, 1);
    }



    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(null, opt_animate);



    //------------------
    // Reset DragDropGroup
    //------------------
    this.resetDragDropGroup();
}





/**
 * Updates the Modal dimensions, fades out the newly added
 * viewers, then fades them back in.
 *
 * @param {?Array.<ViewBox>, boolean=}
 */
ViewBoxManager.prototype.updateModal = function(newViewBoxSet, opt_animate) {

    //------------------
    // If we are to animate, first fade out the ViewBoxes in the newViewBox set.
    // Then, we animate the Modal as it changes its dimensions.
    //------------------
    if (opt_animate) {

	//
	// Fade out the new viewboxes.
	//
	if (newViewBoxSet) {
	    goog.array.forEach(newViewBoxSet, function(newViewBox) {
		utils.style.setStyle(newViewBox._element, {'opacity': 0})
	    })
	}

	//
	// Animate the modal
	//
	this.Modal_.animateModal();


    //------------------
    // Otherwise we just update the style of the modal.
    //------------------	
    } else {
	this.Modal_.updateStyle();
    }	


    //------------------
    // Run the appropriate updates (this is where
    // the new viewboxes will fade back in).
    //------------------
    this.runViewBoxesChangedCallbacks();
}




/**
 * Loops through all of the viewboxes, searching
 * if its 'element' object matches with the 'element'
 * argument.
 *
 * @param {!Element}
 * @return {ViewBox}
 */
ViewBoxManager.prototype.getViewBoxByElement = function(element) {
    for (var i=0, len = this.ViewBoxes_.length; i < len; i++) {
	for (var j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    if (element === this.ViewBoxes_[i][j]._element) {
		return  this.ViewBoxes_[i][j];	
	    }
	}
    }
}




/**
 * Returns the ViewBox element at the specified 
 * row and column.
 *
 * @param {!number, !number}
 * @return {Element}
 */
ViewBoxManager.prototype.getViewBoxElement = function(row, col) {
    return this.ViewBoxes_[row][col]._element
}




/**
 * Returns the ViewBox object at the specified 
 * row and column.
 *
 * @param {!number, !number}
 * @return {ViewBox}
 */
ViewBoxManager.prototype.getViewBox = function(row, col) {
    return this.ViewBoxes_[row][col];
}





/**
 * Returns the ViewBox objects as a single list
 * instead of an md-array.
 *
 * @return {Array.<ViewBox>}
 */
ViewBoxManager.prototype.getViewBoxes = function() {
    var ws = this.loop (function (ViewBox) { 
	return ViewBox;	
    })
    return ws;
}




/**
 * Returns the ViewBox elements as a single list
 * instead of an md-array.
 *
 * @return {Array.<Element>}
 */
ViewBoxManager.prototype.getViewBoxElements = function() {
    var ws = this.loop (function (ViewBox) { 
	return ViewBox._element;	
    })
    
    return (ws instanceof Array) ? ws : [ws];
}




/**
 * Makes a ViewBox.
 *
 * @return {ViewBox}
 */
ViewBoxManager.prototype.makeViewBox = function() {

    //------------------
    // Create ViewBox
    //------------------
    var viewBox = new ViewBox({
	'parent': this.Modal_._modal
    });



    //------------------
    // DragAndDrop Handle.
    //------------------    	
    var modalWindow = goog.dom.getElementsByClass(Modal.MODAL_CLASS)[0];
    var dragDropHandle = utils.dom.makeElement("img", modalWindow, "DragAndDropHandle");
    dragDropHandle.src = XnatViewerGlobals.ICON_URL + "Icons/Toggle-DragAndDrop.png";
    dragDropHandle.ViewBoxId = viewBox._element.id; 

    //
    // Apply class.
    //
    goog.dom.classes.set(dragDropHandle, ViewBox.DRAG_AND_DROP_HANDLE_CLASS);
    
    //
    // Add to class property.
    //
    this.dragDropHandles[viewBox._element.id] = dragDropHandle;

    //
    // Tool tip
    //
    dragDropHandle.title = "Drag and drop view box to swap.";


    return viewBox;    
}




/**
 * Swaps one ViewBox with another based on the class, 
 * the element of the ID.
 *
 * @param {ViewBox|Element|string, ViewBox|Element|string} v1,v2: ViewBox Class, ViewBox.element_, or ViewBox ID
 */
ViewBoxManager.prototype.swap = function(v1, v2) {

    //------------------
    // Loop through all view boxes to determine
    // the locations of the two ViewBoxes to swap.
    //------------------
    var arrLoc = this.loop ( function (v, i, j) { 
	var byObj = (v === v1) || (v === v2);
	var byElement = (v._element === v1) || (v._element === v2);
	var byId = (v._element.id === v1) || (v._element.id === v2);
	
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
	this.ViewBoxes_[arrLoc[0].i][arrLoc[0].j] = this.ViewBoxes_[arrLoc[1].i][arrLoc[1].j];
	this.ViewBoxes_[arrLoc[1].i][arrLoc[1].j] = tempViewBox;
	


    //------------------
    // Otherwise, throw an error.
    //------------------
    } else {
	throw "SWAP ERROR: "
    }
}	




/**
 * Returns the total number of ViewBoxes within
 * a modal.
 *
 * @return {number}
 */
ViewBoxManager.prototype.numViewBoxes = function() {
    return this.ViewBoxes_.length * this.ViewBoxes_[0].length;	 
}




/**
 * Maintains a callback array for when the number of ViewBoxes
 * change within the Modal.
 *
 * @param {function}
 */
ViewBoxManager.prototype.addViewBoxesChangedCallback = function(callback) {
    this.viewersChangedCallbacks_.push(callback);
}




/**
 * Returns the ViewBox after the ViewBox provided in the argument,
 * using a left-to-right, top-to-bottom scheme.
 *
 * @param {!ViewBox}
 * @return {!ViewBox}
 */
ViewBoxManager.prototype.getViewBoxAfter = function (currViewBox) {
    
    for (var i=0, len = this.ViewBoxes_.length; i < len; i++) {
	for (var j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    
	    if (this.ViewBoxes_[i][j] === currViewBox) {
		
		var maxRow = ((i+1) === this.ViewBoxes_.length);
		var maxCol = ((j+1) === this.ViewBoxes_[i].length);
		
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
 * Gets the first ViewBox without any viewable contents.
 *  
 *
 * @return {ViewBox}
 */
ViewBoxManager.prototype.getFirstEmpty = function() {

    //------------------
    // Populate any empty ViewBoxes, if they exist.
    //------------------
    var ViewBoxesByLoad = {};
    var loadTimes = [];
    var w = this.loop(function(ViewBox){
	
	if (!ViewBox.getThumbnail()) {
	    return ViewBox;
	}
	else{
	    ViewBoxesByLoad[ViewBox._thumbnailLoadTime] = ViewBox;
	    loadTimes.push(ViewBox._thumbnailLoadTime);
	}
    })
    if (w) {
	return (w instanceof Array) ? w[0] : w;
    }



    //------------------
    // If there are no empty ViewBoxes,
    // then choose the one where the thumbnail was
    // loaded the farthest time ago.
    //------------------
    else {
	loadTimes.sort();
	return ViewBoxesByLoad[loadTimes[0]];
    }
}




/**
 * Animates a position swap between two view boxes.
 *
 * @param {ViewBox, ViewBox, Object.<string, string>, ?boolean}
 */
ViewBoxManager.prototype.animateSwap = function(ViewBoxElementA, ViewBoxElementB, ViewBoxPositions, opt_animated) {

    var that = this;
    var animLen = (opt_animated === false) ? 0 : XnatViewerGlobals.ANIM_MED;
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
    animQueue.add(slide(ViewBoxElementA, ViewBoxBDims['left'], ViewBoxBDims['top'], XnatViewerGlobals.ANIM_MED));
    animQueue.add(slide(ViewBoxElementB, ViewBoxADims['left'], ViewBoxADims['top'], XnatViewerGlobals.ANIM_MED));



    //------------------
    // When animation finishes do an array swap
    // within the ViewBox tracking property.
    //------------------
    goog.events.listen(animQueue, 'end', function() {
	that.updateDragDropHandles();
    })



    //------------------
    // Play animation
    //------------------
    animQueue.play();

}




/**
 * Initializes and/or resets the DragDrop swapping of ViewBoxes.
 * This needs to be called every time a ViewBox is added or 
 * removed from the MODAL.
 */
ViewBoxManager.prototype.resetDragDropGroup = function() {
    
    var that = this;
    var ViewBoxPositions = /**@type {<Object.<string, Object>}*/{};

    //------------------
    // Clear the dragDrop groups and delete.
    //------------------
    if (this.dragDropGroup) {
	this.dragDropGroup.removeItems();
	this.dragDropTargets.removeItems();
	delete this.dragDropGroup;
	delete this.dragDropTargets;
    }



    //------------------
    // Create new drag-drop groups:
    // for the draggers (the handle) and 
    // the targets (the ViewBox._elements).
    //------------------
    this.dragDropGroup = new goog.fx.DragDropGroup();
    this.dragDropTargets = new goog.fx.DragDropGroup();



    //------------------
    // Add the items to the dragDropGroups.
    //------------------
    this.loop(function(ViewBox) {
	that.dragDropGroup.addItem(that.dragDropHandles[ViewBox._element.id]);
	that.dragDropTargets.addItem(ViewBox._element);
    })



    //------------------
    // Set the target of the 
    // dragDropGroup (the handles) 
    // to the targets (the ViewBox elements).
    //------------------   
    this.dragDropGroup.addTarget(this.dragDropTargets);



    //------------------
    // Init both drag drop groups.
    //------------------   
    this.dragDropGroup.init();
    this.dragDropTargets.init();



    //------------------
    // Function to create drag clone.
    //------------------
    var makeDragClone = function(ViewBoxElement, opt_parent) {
	var dragElement = ViewBoxElement.cloneNode(false);
	goog.dom.classes.set(dragElement, ViewBox.DRAGGING_CLASS);
	opt_parent && opt_parent.appendChild(dragElement);
	return dragElement;
    };



    //------------------
    // google.fx.dragDropGroup inherited function
    // to create a dragElement (a childless clone 
    // of the ViewBox._element).
    //------------------
    this.dragDropGroup.createDragElement = function(sourceElt) {
	var dragElement = makeDragClone(goog.dom.getElement(sourceElt.ViewBoxId));
	return dragElement;
    };



    //------------------
    // Define DRAG START function
    //
    // We record the ViewBox positions.
    //------------------
    var dragStart = function(event) {
	that.loop(function(ViewBox){
	    ViewBoxPositions[ViewBox._element.id] = {
		'absolute': utils.style.absolutePosition(ViewBox._element),
		'relative': utils.style.dims(ViewBox._element)
	    }
	    that.dragDropHandles[ViewBox._element.id].style.visibility = 'hidden';
	})
    }



    //------------------
    // Define DRAG OVER function.
    //------------------
    var dragOver = function(event) {

	if (event.dropTargetItem.element.id !== event.dragSourceItem.currentDragElement_.ViewBoxId) {
	    var ViewBoxElementA = goog.dom.getElement(event.dragSourceItem.currentDragElement_.ViewBoxId);
	    var ViewBoxElementB = goog.dom.getElement(event.dropTargetItem.element.id);

	    that.swap(ViewBoxElementA, ViewBoxElementB);
	    
	    that.animateSwap(ViewBoxElementA, ViewBoxElementB, ViewBoxPositions);

	    //
	    // We have to update ViewBoxPositions as it
	    // does not update after the swap.
	    //
	    var valA = ViewBoxPositions[ViewBoxElementA.id];
	    var valB = ViewBoxPositions[ViewBoxElementB.id];
	    ViewBoxPositions[ViewBoxElementA.id] = valB;
	    ViewBoxPositions[ViewBoxElementB.id] = valA;
	    
	}
    }




    //------------------
    // Define DRAG END function.
    //
    // NOTE: goog.fx.dragDropGroup will delete the original dragger
    // so we have to clone it to reanimate it back 
    // into place.
    //------------------
    var dragEnd = function(event) {

	var originalViewBox = goog.dom.getElement(event.dragSourceItem.currentDragElement_.ViewBoxId);
	var originalViewBoxDims = utils.style.absolutePosition(originalViewBox);
	var dragger = event.dragSourceItem.parent_.dragEl_;
	var draggerViewBoxDims = utils.style.absolutePosition(dragger);
	var animQueue = new goog.fx.AnimationParallelQueue();	

	//
	// We have to clone the dragger as goog.fx.dragDropGroup
	// will delete the original dragger.
	//
	var draggerClone = makeDragClone(dragger, document.body);
	draggerClone.style.left =  draggerViewBoxDims['left'];
	draggerClone.style.top = draggerViewBoxDims['top'];
	draggerClone.style.zIndex = 10000;

	//
	// Define the slide animation.
	//
	function slide(el, a, b, duration) {
	    return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], [a, b], 
					 duration, goog.fx.easing.easeOut);
	}

	//
	// Add the slide animation to the 
	// animQueue.
	//
	animQueue.add(slide(draggerClone, originalViewBoxDims['left'], 
			    originalViewBoxDims['top'], XnatViewerGlobals.ANIM_FAST));

	//
	// When animation finishes, delete
	// the draggerClone.
	//
	goog.events.listen(animQueue, 'end', function() {
	    document.body.removeChild(draggerClone); 
	    delete draggerClone;
	})
	
	//
	// Play animation
	//
	animQueue.play();

	//
	// Show dragDropHandles
	//
	that.loop(function(ViewBox){
	    that.dragDropHandles[ViewBox._element.id].style.visibility = 'visible';	
	})
    }



    //------------------
    // Listen for drag events.
    //------------------
    goog.events.listen(this.dragDropGroup, 'dragstart', dragStart);
    goog.events.listen(this.dragDropGroup, 'dragover', dragOver);
    goog.events.listen(this.dragDropGroup, 'dragend', dragEnd);
}



/**
 * Updates the position of the dragDropHandles.
 */
ViewBoxManager.prototype.updateDragDropHandles = function() {

    var that = this;

    this.loop(function(ViewBox){
	var ViewBoxDims = utils.style.dims(ViewBox._element);
	var dragDropHandle = that.dragDropHandles[ViewBox._element.id];
	utils.style.setStyle(dragDropHandle, {'left': ViewBoxDims['left'], 'top': ViewBoxDims['top']});
    })
}
