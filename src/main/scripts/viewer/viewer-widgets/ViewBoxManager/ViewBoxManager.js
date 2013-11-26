/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */

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
}



/**
 * Removes a column of ViewBoxes from the Modal.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.removeColumn = function(opt_animate) {

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
	    ViewBox[rowLen]._element.parentNode.removeChild(ViewBox[rowLen]._element);
	    ViewBox.splice(rowLen, 1);							
	})
    }



    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(null, opt_animate);
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
}




/**
 * Removes a row of ViewBoxes from the Modal.
 *
 * @param {boolean=}
 */
ViewBoxManager.prototype.removeRow = function(opt_animate) {

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
	})
	this.ViewBoxes_.splice(this.ViewBoxes_.length -1, 1);
    }



    //------------------
    // Run the appropriate updates.
    //------------------
    this.updateModal(null, opt_animate);
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
ViewBoxManager.prototype.getViewBoxWidget = function(row, col) {
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
ViewBoxManager.prototype.getViewBoxWidgets = function() {
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
    var v = new ViewBox({
	'parent': this.Modal_._modal
    });
    return v;
    
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
    var arrLoc = loop ( function (v, i, j) { 
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
    // Populate any empty ViewBoxes
    //------------------
    var w = this.loop(function(viewbox){
	if (!viewbox.getThumbnail()) {
	    return viewbox;
	}
    })
    if (w) {
	return (w instanceof Array) ? w[0] : w;
    }
}


