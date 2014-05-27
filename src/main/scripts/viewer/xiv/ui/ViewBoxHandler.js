/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fx.easing');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.fx.AnimationParallelQueue');

// utils
goog.require('nrg.string');
goog.require('nrg.style');
goog.require('nrg.fx');

// xiv
goog.require('xiv.ui.ViewBox');
goog.require('nrg.ui.Component');




/**
 * xiv.ui.ViewBoxHandler handles all xiv.ui.Modal-level operations 
 * in overseeing the xiv.ui.ViewBoxes within a given modal.  For 
 * instance, it handles adding a xiv.ui.ViewBox to the xiv.ui.Modal,
 * deleting a xiv.ui.ViewBox in the xiv.ui.Modal, and it also tracks
 * the xiv.ui.ViewBox locations within the modal using a multi-dimenesional
 * array.
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ViewBoxHandler');
xiv.ui.ViewBoxHandler = function () {
    goog.base(this);
}
goog.inherits(xiv.ui.ViewBoxHandler, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ViewBoxHandler', xiv.ui.ViewBoxHandler);



/**
 * Event types. 
 *
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxHandler.CSS_SUFFIX = {
    HANDLE: 'handle',
    VIEWBOXDRAGCLONE: 'viewboxdragclone'
}



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxHandler.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
  VIEWBOXES_CHANGED: goog.events.getUniqueId('viewboxes_changed')
}



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR =  'viewboxid';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBoxHandler.ID_PREFIX =  'xiv.ui.ViewBoxHandler';



/**
 * @type {Array.<Array.<xiv.ui.ViewBox>>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.ViewBoxes_;



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.dragDropHandles_;



/**
 * @type {Object.<string, Object.<string, number>>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.ViewBoxPositions_;



/**
 * @type {goog.fx.DragDropGroup}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.dragDropGroup_;



/**
 * @type {goog.fx.DragDropGroup}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.dragDropTargets_



/**
 * @type {!Element}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.ViewBoxesParent_ = document.body;



/**
 * As stated.
 *
 * param {Array.<xiv.ui.ViewBox>=} opt_newSet The new ViewBox set 
 *    added (optional).
 * param {boolean=} opt_animate The animate argument (optional).
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onViewBoxesChanged_ = 
function(opt_newSet, opt_animate) {
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.VIEWBOXES_CHANGED,
	newSet: opt_newSet,
	animate: opt_animate
    });		
}



/**
 * Utility method that loops through the multi-dimensional 'viewers' array 
 * performing the user-specified 'callback' operation on every viewer.  
 * @param {function} callback The callback function to apply.
 *
 * @return {Object | Array.<Object>}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.loop = function(callback) {

    if (!this.ViewBoxes_){ return;}

    var returnVals = [];
    var i = 0; 
    var j = 0;
    var retVal = null;

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
 * Returns the number of xiv.ui.ViewBox columns.
 *
 * @return {number}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.columnCount = function() {
    return this.ViewBoxes_[0].length;
}




/**
 * Returns the number of xiv.ui.ViewBox rows.
 *
 * @return {number}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.rowCount = function() {
    return this.ViewBoxes_.length;
}




/**
 * Inserts a xiv.ui.ViewBox column into the xiv.ui.Modal, matching
 * the row count.  For instance, if a given modal has two 
 * rows of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * column to the right.
 *
 * @param {boolean=} opt_animate Allows the user to animate the column 
 *     insertion.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.insertColumn = function(opt_animate) {

    if (!this.ViewBoxes_){ this.ViewBoxes_ = [[]] };

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
 * Removes a column of xiv.ui.ViewBoxes from the xiv.ui.Modal.
 * @param {boolean=} opt_animate Allows the user to animate the column removal.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.removeColumn = function(opt_animate) {


    if (!this.ViewBoxes_){
	return; 
    }
    // Animate remove if opt_animate argument not provided.
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove columns only if there's greater than one viewer in the modal.
    if (this.ViewBoxes_[0] && this.ViewBoxes_[0].length > 1) {
	goog.array.forEach(this.ViewBoxes_, function(ViewBoxCol, i) {
	    var rowLen =  ViewBoxCol.length - 1;
	    if (goog.isDefAndNotNull(ViewBoxCol[rowLen].
				     getThumbnailLoadTime())){

		//
		// Check if ViewBox is in use.
		//
		ViewBoxCol[rowLen].showInUseDialog();
		ViewBoxCol[rowLen].setInUseSelect(function(ViewBox) {
		    ViewBox.clearThumbnailLoadTime();
		    this.removeColumn(opt_animate);
		}.bind(this));
		return;
	    }

	    nrg.fx.fadeTo(ViewBoxCol[rowLen].getElement(), 
			    nrg.ui.Component.animationLengths.FAST, 0);




	    goog.dom.removeNode(this.dragDropHandles_[
		ViewBoxCol[rowLen].getElement().id]);

	    // Remove the xiv.ui.ViewBox
	    ViewBoxCol[rowLen].disposeInternal();
	    ViewBoxCol.splice(rowLen, 1);		
	}.bind(this))
    }

    // Events.
    this.onViewBoxesChanged_(null, opt_animate);
    this.resetDragDropGroup_();
}




/**
 * Inserts a xiv.ui.ViewBox row into the xiv.ui.Modal, matching
 * the column count.  For instance, if a given modal has two 
 * columns of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * row at the bottom.
 * @param {boolean=} opt_animate Allows the user to animate the row insertion.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.insertRow = function(opt_animate) {

    if (!this.ViewBoxes_){
	this.ViewBoxes_ = [[]]; 
    }

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
 * Removes a row of xiv.ui.ViewBoxes from the xiv.ui.Modal.
 *
 * @param {boolean=} opt_animate Allows the user to animate the row removal.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.removeRow = function(opt_animate) {

    if (!this.ViewBoxes_){ return; }

    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove rows only if there's greater than one
    // viewer in the modal.
    if (this.ViewBoxes_.length > 1) {
	var delRow = this.ViewBoxes_[this.ViewBoxes_.length - 1];
	goog.array.forEach(delRow, function(currDelViewBox) { 
	    //
	    // Check if ViewBox is in use.
	    //
	    currDelViewBox.showInUseDialog();
	    currDelViewBox.setInUseSelect(function(ViewBox) {
		ViewBox.clearThumbnailLoadTime();
		this.removeRow(opt_animate);
	    }.bind(this));

	    nrg.fx.fadeTo(currDelViewBox.getElement(), 
			    nrg.ui.Component.animationLengths.FAST, 0);
	    // Remove the drag drop handles
	    goog.dom.removeNode(this.dragDropHandles_[
		currDelViewBox.getElement().id]);

	    currDelViewBox.disposeInternal();

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
 * @param {!Element} element The xiv.ui.ViewBox element to retrieve the 
 *    xiv.ui.ViewBox object from.
 * @return {xiv.ui.ViewBox}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxByElement = function(element) {
    var i = 0;
    var j = 0;
    var len = this.ViewBoxes_.length;
    var len2 = 0;
    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    if (element === this.ViewBoxes_[i][j].getElement()) {
		return  this.ViewBoxes_[i][j];	
	    }
	}
    }
}




/**
 * Returns the xiv.ui.ViewBox element at the specified row and column.
 * @param {!number} row The row of the desired ViewBox.
 * @param {!number} col The column of the desired ViewBox.
 * @return {Element}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxElement = function(row, col) {
    return this.ViewBoxes_[row][col].getElement()
}




/**
 * Returns the xiv.ui.ViewBox object at the specified row and column.
 * @param {!number} row The row of the desired ViewBox.
 * @param {!number} col The column of the desired ViewBox. 
 * @param {!number, !number}
 * @return {xiv.ui.ViewBox}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBox = function(row, col) {
    return this.ViewBoxes_[row][col];
}





/**
 * Returns the xiv.ui.ViewBox objects as a single array.
 *
 * instead of an md-array.
 * @return {Array.<xiv.ui.ViewBox>}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxes = function() {
    return this.loop (function(ViewBox) { 
	return ViewBox;	
    })
}




/**
 * Returns the xiv.ui.ViewBox elements as a single array.
 *
 * instead of an md-array.
 * @return {Array.<Element>}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxElements = function() {
    var ws = this.loop (function(ViewBox) { 
	return ViewBox.getElement();	
    })
    return goog.isArray(ws) ? ws : [ws];
}




/**
 * @param {Element} elt
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.setViewBoxesParent = function(elt) {
    this.ViewBoxesParent_ = elt;
}


/**
 * Makes a xiv.ui.ViewBox.
 * @return {xiv.ui.ViewBox}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.createViewBox_ = function() {
    var ViewBox = new xiv.ui.ViewBox();
    goog.dom.append(this.ViewBoxesParent_, ViewBox.getElement());
    this.addDragDropHandle_(ViewBox);
    this.setViewBoxEvents_(ViewBox);



    return ViewBox;    
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.addDragDropHandle_ = function(ViewBox) {
    var dragDropHandle =
    goog.dom.createDom("img",  {
	'id': xiv.ui.ViewBoxHandler.ID_PREFIX + 
	    '_dragHandle_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBoxHandler.CSS.HANDLE
    });
    dragDropHandle.src = 
	serverRoot + '/images/viewer/xiv/ui/ViewBoxManager/handle.png';
    dragDropHandle.setAttribute(xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR, 
				ViewBox.getElement().id); 
    ViewBox.addToMenu('TOP_LEFT', dragDropHandle, 0);

    // Add to class property.
    if (!this.dragDropHandles_){ this.dragDropHandles_ = {}};
    this.dragDropHandles_[ViewBox.getElement().id] = dragDropHandle;

    // Tool tip
    dragDropHandle.title = "Drag and drop view box to swap.";
}


/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onThumbnailLoaded_ = function(e){
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_LOADED
    })
}


/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onThumbnailPreload_ = function(e){
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_PRELOAD
    })
}


/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onThumbnailLoadError_ = function(e){
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.THUMBNAIL_LOADERROR
    })
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.setViewBoxEvents_ = function(ViewBox) {

    // Onload
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.THUMBNAIL_LOADED, 
	this.onThumbnailLoaded_.bind(this))
   
    // Preload
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.THUMBNAIL_PRELOAD, 
	this.onThumbnailPreload_.bind(this))

    // Error
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.THUMBNAIL_LOADERROR, 
	this.onThumbnailLoadError_.bind(this))
}




/**
 * Swaps one xiv.ui.ViewBox with another based on the class, 
 * the element of the ID.
 * @param {xiv.ui.ViewBox|Element|string} v1 xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @param {xiv.ui.ViewBox|Element|string, v2 xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.swap = function(v1, v2) {

    //------------------
    // Loop through all view boxes to determine
    // the locations of the two xiv.ui.ViewBoxes to swap.
    //------------------
    var arrLoc = /**@type {!Object.<string, number>}*/ 
    this.loop ( function (v, i, j) { 
	var byObj = /**@type {!boolean}*/ (v === v1) || (v === v2);
	var byElement = /**@type {!boolean}*/
	(v.getElement() === v1) || (v.getElement() === v2);
	var byId = /**@type {!boolean}*/
	(v.getElement().id === v1) || (v.getElement().id === v2);
	
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
	var tempViewBox = /**@type {!ViewBox}*/
	this.ViewBoxes_[arrLoc[0].i][arrLoc[0].j];
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
 * Returns the total number of xiv.ui.ViewBoxes within a modal.
 * @return {number} The total number of View Boxes.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.numViewBoxes = function() {
    return this.ViewBoxes_.length * this.ViewBoxes_[0].length;	 
}





/**
 * Returns the xiv.ui.ViewBox after the xiv.ui.ViewBox provided in the argument,
 * using a left-to-right, top-to-bottom scheme.
 * @param {!xiv.ui.ViewBox} currViewBox The xiv.ui.ViewBox to reference after.
 * @return {!xiv.ui.ViewBox} The ViewBox after the currViewBox.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxAfter = function (currViewBox) {
    
    var i = 0;
    var j = 0;
    var len = this.ViewBoxes_.length;
    var len2 = 0;
    var maxRow = 0;
    var maxCol = 0;

    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    
	    if (this.ViewBoxes_[i][j] === currViewBox) {
		maxRow = ((i+1) === this.ViewBoxes_.length);
		maxCol = ((j+1) === this.ViewBoxes_[i].length);
		
		if (maxRow && maxCol) {
		    return this.ViewBoxes_[0][0];
		} else if (maxRow && !maxCol) {
		    return this.ViewBoxes_[0][j+1];
		} else if (!maxRow && maxCol) {
		    return this.ViewBoxes_[i+1][0];
		} else {
		    return this.ViewBoxes_[i+1][j+1];
		}
		
	    }
	}
    }		
}




/**
 * Gets the first xiv.ui.ViewBox without any viewable contents.
 * @return {xiv.ui.ViewBox} The first empty view box.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getFirstEmpty = function() {
    var loadViewBox;

    //
    // If a ViewBox's thumbLoadTime property is undefined, then we 
    // return that ViewBox, since nothing has been loaded into it.
    //
    this.loop(function(ViewBox){
	if (!goog.isDefAndNotNull(loadViewBox)){
	    if (!goog.isDefAndNotNull(ViewBox.getThumbnailLoadTime())) {
		loadViewBox = ViewBox;
	    }
	}
    }.bind(this))
    if (goog.isDefAndNotNull(loadViewBox)) return loadViewBox;


    //
    // Otherwise we sort the ViewBoxes based on their load times, and
    // return the first one.
    //
    var ViewBoxes = this.getViewBoxes();
    if (goog.isArray(ViewBoxes)){
	ViewBoxes.sort(function(a, b){
	    if (a.getThumbnailLoadTime() < b.getThumbnailLoadTime()) return -1;
	    if (a.getThumbnailLoadTime() > b.getThumbnailLoadTime()) return 1;
	    return 0;
	})
    }
    else {
	ViewBoxes = [ViewBoxes];
    }
    return ViewBoxes[0];
}





/**
 * Define the animation method.
 *
 * @param {!Element} el The first xiv.ui.ViewBox element to swap.
 * @param {!toLeft} toLeft The to-be left position.
 * @param {!toTop} toTop The to-be top position.
 * @param {!number} duration The duration of the animation.
 * @return {!goog.fx.dom.Slide} The slide animation.
 */
xiv.ui.ViewBoxHandler.prototype.generateSlide_ = function (el, a, b, duration) {
    return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], 
				 [a, b], duration, goog.fx.easing.easeOut);
    
}




/**
 * Animates a position swap between two view boxes.
 *
 * @param {!xiv.ui.ViewBox} ViewBoxElementA The first xiv.ui.ViewBox element 
 *     to swap.
 * @param {!xiv.ui.ViewBox} ViewBoxElementB The second xiv.ui.ViewBox element 
 *     to swap.
 * @param {!Object.<string, string>} ViewBoxPositions The ViewBox positions to 
 *     reference.
 * @param {boolean=} opt_animate Whether to animate the swap.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.animateSwap_ = 
function(ViewBoxElementA, ViewBoxElementB, ViewBoxPositions, opt_animated) {

    var animLen = (opt_animated === false) ? 0 : 
	nrg.ui.Component.animationLengths.MEDIUM;
    var animQueue = new goog.fx.AnimationParallelQueue();
    var ViewBoxADims =  ViewBoxPositions[ViewBoxElementA.id]['relative'];
    var ViewBoxBDims = ViewBoxPositions[ViewBoxElementB.id]['relative'];

    //
    // Add animations to queue.
    //
    animQueue.add(this.generateSlide_(ViewBoxElementA, ViewBoxBDims['left'], 
			ViewBoxBDims['top'], 
			nrg.ui.Component.animationLengths.MEDIUM));
    animQueue.add(this.generateSlide_(ViewBoxElementB, ViewBoxADims['left'], 
			ViewBoxADims['top'], 
                        nrg.ui.Component.animationLengths.MEDIUM));

    //goog.events.listen(animQueue, 'end', function() {
    //}.bind(this))

    //
    // Play animation
    //
    animQueue.play();
}




/**
 * Initializes and/or resets the DragDrop swapping of xiv.ui.ViewBoxes.
 * This needs to be called every time a xiv.ui.ViewBox is added or 
 * removed from the MODAL.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.clearDragDropGroups_ = function(){
    // Clear the dragDrop groups and delete.
    if (this.dragDropGroup_) {
	this.dragDropGroup_.removeItems();
	this.dragDropTargets_.removeItems();
	delete this.dragDropGroup_;
	delete this.dragDropTargets_;
    }
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.addElementsToDragDropGroups_ = function() {
    this.loop(function(ViewBox) {
	this.dragDropGroup_.addItem(
	    this.dragDropHandles_[ViewBox.getElement().id]);
	this.dragDropTargets_.addItem(ViewBox.getElement());
    }.bind(this))
}




/**
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.setDragEvents_ = function() { 
    goog.events.listen(this.dragDropGroup_, 'dragstart', 
		       this.onDragStart_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragover', 
		       this.onDragOver_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragend', 
		       this.onDragEnd_.bind(this));
}




/**
 * Initializes and/or resets the DragDrop swapping of xiv.ui.ViewBoxes.
 * This needs to be called every time a xiv.ui.ViewBox is added or 
 * removed from the MODAL.
 *
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.resetDragDropGroup_ = function() { 

    this.clearDragDropGroups_();
    this.dragDropGroup_ = new goog.fx.DragDropGroup();
    this.dragDropTargets_ = new goog.fx.DragDropGroup();
    this.addElementsToDragDropGroups_();

    //------------------
    // Set the target of the dragDropGroup_ (the handles) 
    // to the targets (the xiv.ui.ViewBox elements).
    //------------------   
    this.dragDropGroup_.addTarget(this.dragDropTargets_);

    //------------------
    // Init both drag drop groups.
    //------------------   
    this.dragDropGroup_.init();
    this.dragDropTargets_.init();

    //------------------
    // google.fx.dragDropGroup_ inherited function to create a dragElement 
    // (a childless clone of the xiv.ui.ViewBox.getElement()).
    //------------------
    this.dragDropGroup_.createDragElement = this.createDragElement_.bind(this);
    this.setDragEvents_();
}



/**
 * Custom function for the dragDrop group as part of closure.
 *
 * @param {!Element} srcElt
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.createDragElement_ = function(srcElt) {
    var dragElement = this.makeDragClone_(goog.dom.getElement(
	srcElt.getAttribute(xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR)), 
					document.body);
    return dragElement;
}



/**
* Define DRAG START function.  We record the xiv.ui.ViewBox positions.
 *
* @param {!Event}
* @private
*/
xiv.ui.ViewBoxHandler.prototype.onDragStart_ = function(event) {
    this.ViewBoxPositions_ = {};
    this.loop(function(ViewBox){
	this.ViewBoxPositions_[ViewBox.getElement().id] = {
	    'absolute': nrg.style.absolutePosition(ViewBox.getElement()),
	    'relative': nrg.style.dims(ViewBox.getElement())
	}
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'hidden';
    }.bind(this))
}



/**
 * Function to create drag clone.
 *
 * @param {!Element} ViewBoxElement The ViewBox element to clone.
 * @param {Element=} opt_parent The optional parent element to append the
 *    drag clone to.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.makeDragClone_ = 
function(ViewBoxElement, opt_parent) {
    var dragElement = ViewBoxElement.cloneNode(false);
    goog.dom.classes.set(dragElement, 
			 xiv.ui.ViewBoxHandler.CSS.VIEWBOXDRAGCLONE);
    opt_parent && opt_parent.appendChild(dragElement);
    return dragElement;
}




/**
 * Define DRAG OVER function.
 *
 * @param {!Event} event The event object.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onDragOver_ = function(event) {
    if (event.dropTargetItem.element.id !== 
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR)) {

	var ViewBoxElementA =
	    goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR));
	var ViewBoxElementB = 
	    goog.dom.getElement(event.dropTargetItem.element.id);

	// Swap internally, then animate it.
	this.swap(ViewBoxElementA, ViewBoxElementB);
	this.animateSwap_(ViewBoxElementA, ViewBoxElementB, 
			  this.ViewBoxPositions_);
	this.updatePositionsFromSwap_(ViewBoxElementA, ViewBoxElementB);
    }
}




/**
 * @param {!Element} ViewBoxElementA The first ViewBox element.
 * @param {!Element} ViewBoxElementB The second ViewBox element.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.updatePositionsFromSwap_ = 
    function(ViewBoxElementA, ViewBoxElementB){
	var valA = this.ViewBoxPositions_[ViewBoxElementA.id];
	var valB = this.ViewBoxPositions_[ViewBoxElementB.id];
	this.ViewBoxPositions_[ViewBoxElementA.id] = valB;
	this.ViewBoxPositions_[ViewBoxElementB.id] = valA;
    }




/**
 * DRAG END function.
 * NOTE: goog.fx.dragDropGroup will delete the original dragger
 * so we have to clone it to reanimate it back into place.
 *
 * @param {!Event} event The event object.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onDragEnd_ = function(event) {
    var dragger = event.dragSourceItem.parent_.dragEl_;

    var originalViewBox = goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR));

    var srcViewBoxDims = nrg.style.absolutePosition(originalViewBox);

    var draggerClone = this.createDraggerClone_(dragger);
    this.repositionDraggerClone_(dragger, draggerClone);
    this.createDragEndAnim_(draggerClone, srcViewBoxDims).play();
    this.showDragDropHandles_();
}



/**
 * Creates the dragger clone element.
 * @param {!Element} dragger The dragger clone element of the View Box. 
 * @return {!Element} The deragger clone.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.createDraggerClone_ = function(dragger){  
    //
    // We have to clone the dragger as goog.fx.dragDropGroup
    // will delete the original dragger.
    //
    var draggerClone = this.makeDragClone_(dragger, document.body);

    //
    // Set the draggerClone parent to the modal parent
    // to avoid any wierd positioning issues. 
    //
    var dragParent = this.ViewBoxesParent_.parentNode ? 
	this.ViewBoxesParent_.parentNode : this.ViewBoxesParent_;


    goog.dom.append(dragParent, draggerClone);


    return draggerClone;
}




/**
 * Positions the draggerClone element to the drag element.
 *
 * @param {!Element} dragger The dragger  element of the View Box.
 * @param {!Element} draggerClone The dragger clone element of the View Box.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.repositionDraggerClone_ = 
function(dragger, draggerClone){
    var draggerViewBoxDims = 
    nrg.style.absolutePosition(dragger);
    nrg.style.setStyle(draggerClone, {
	'top': draggerViewBoxDims['top'] , 
	'left': draggerViewBoxDims['left'],
	'z-index': 10000
    });
}




/**
 * @param {!Element} draggerClone The dragger clone element of the View Box.
 * @param {!Object} srcViewBoxDims The position and dimensions of the src
 *     ViewBox.
 * @return {!goog.fx.AnimationParallelQueue} The animation queue.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.createDragEndAnim_ = 
function(draggerClone, srcViewBoxDims){
    var animQueue =  new goog.fx.AnimationParallelQueue();

    //
    // Add the slide animation to the animQueue.
    //
    animQueue.add(this.generateSlide_(draggerClone, srcViewBoxDims['left'], 
				      srcViewBoxDims['top'], 
				      nrg.ui.Component.animationLengths.FAST));

    //
    // When animation finishes, delete the draggerClone.
    //
    goog.events.listen(animQueue, 'end', function() {
	goog.dom.removeNode(draggerClone); 
    })
    
    return animQueue;
}



/**
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.showDragDropHandles_ = function(){
    this.loop(function(ViewBox){
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'visible';	
    }.bind(this))
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxHandler.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    

    // The individual ViewBoxes
    this.loop(function(ViewBox){
	goog.events.removeAll(ViewBox);
	ViewBox.disposeInternal();
	goog.dom.removeNode(ViewBox.getElement());
    }.bind(this));


    // The ViewBoxes 2D array.
    goog.array.forEach(this.ViewBoxes_, function(arr){
	goog.array.clear(arr);
    })
    goog.array.clear(this.ViewBoxes_); 
    delete this.ViewBoxes_;


    // Drag Drop handles
    nrg.ui.disposeElementMap(this.dragDropHandles_);
    delete this.dragDropHandles_;


    // View Box Positions
    goog.object.forEach(this.ViewBoxPositions_, function(pos, key){
	goog.object.clear(this.ViewBoxPositions_[key]);
	delete this.ViewBoxPositions_[key];
    }.bind(this))
    goog.object.clear(this.ViewBoxPositions_);
    delete this.ViewBoxPositions_;
	

    // Drag drop group and targets
    if (goog.isDefAndNotNull(this.dragDropGroup_)) {
	goog.events.removeAll(this.dragDropGroup_);
	this.dragDropGroup_.dispose();
    }
    delete this.dragDropGroup_;

    // Drag drop group and targets
    if (goog.isDefAndNotNull(this.dragDropTargets_)) {
	goog.events.removeAll(this.dragDropTargets_);
	this.dragDropTargets_.dispose();
    }
    delete this.dragDropTargets_;

    // View boxes parent reference.
    delete this.ViewBoxesParent_;
}
