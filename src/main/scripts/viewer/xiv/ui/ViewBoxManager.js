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
goog.require('moka.string');
goog.require('moka.style');
goog.require('moka.fx');
goog.require('moka.events.EventManager');

// xiv
goog.require('xiv.ui.ViewBox');




/**
 * xiv.ui.ViewBoxManager handles all xiv.ui.Modal-level operations 
 * in overseeing the xiv.ui.ViewBoxes within a given modal.  For 
 * instance, it handles adding a xiv.ui.ViewBox to the xiv.ui.Modal,
 * deleting a xiv.ui.ViewBox in the xiv.ui.Modal, and it also tracks
 * the xiv.ui.ViewBox locations within the modal using a multi-dimenesional
 * array.
 * @constructor
 */
goog.provide('xiv.ui.ViewBoxManager');
xiv.ui.ViewBoxManager = function () {
    // events
    moka.events.EventManager.addEventManager(this, 
					      xiv.ui.ViewBoxManager.EventType);
}
goog.exportSymbol('xiv.ui.ViewBoxManager', xiv.ui.ViewBoxManager);



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBoxManager.ANIM_FAST =  150;



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBoxManager.ANIM_MED =  300;



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBoxManager.ANIM_SLOW =  600;



/**
 * @type {!string} 
 * @const
 */
xiv.ui.ViewBoxManager.VIEW_BOX_ATTR =  'viewboxid';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBoxManager.ID_PREFIX =  'xiv.ui.ViewBoxManager';



/**
 * @type {!string}
 * @expose 
 * @const
 */
xiv.ui.ViewBoxManager.CSS_CLASS_PREFIX = 
goog.string.toSelectorCase(xiv.ui.ViewBoxManager.ID_PREFIX.toLowerCase().
			   replace(/\./g,'-'));



/**
 * @type {!string}
 * @expose 
 * @const
 */
xiv.ui.ViewBoxManager.HANDLE_CLASS =  
    goog.getCssName(xiv.ui.ViewBoxManager.CSS_CLASS_PREFIX, 'handle');


/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxManager.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
  VIEWBOXES_CHANGED: goog.events.getUniqueId('viewboxes_changed')
}



/**
 * @enum (string}
 */
xiv.ui.ViewBoxManager.ICON_SRC = {
    HANDLE: 'Toggle-DragAndDrop.png'
}



/**
 * @type {Array.<Array.<xiv.ui.ViewBox>>}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.ViewBoxes_;



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.dragDropHandles_;



/**
 * @type {Object.<string, Object.<string, number>>}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.ViewBoxPositions_;



/**
 * @type {goog.fx.DragDropGroup}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.dragDropGroup_;



/**
 * @type {!Element}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.ViewBoxesParent_ = document.body;



/**
 * @type {!string}
 * @protected
 */  
xiv.ui.ViewBoxManager.prototype.iconBaseUrl = '';



/**
 * @type {!string}
 * @protected
 */  
xiv.ui.ViewBoxManager.prototype.iconUrl = '';



/**
 * Sets the icon url to derive any images from.
 * @param {!string} url The url to derive the icon images from.
 * @public
 */
xiv.ui.ViewBoxManager.prototype.setIconBaseUrl = function(url) {
    this.iconBaseUrl = url;
    this.iconUrl = goog.string.path.join( this.iconBaseUrl, 
				this.constructor.ID_PREFIX.replace(/\./g,'/'));
    if (this.updateIconSrcFolder){
	this.updateIconSrcFolder();
    }
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxManager.prototype.updateIconSrcFolder = function() {
    this.loop(function(ViewBox){
	this.dragDropHandles_[ViewBox.getElement().id].src = 
	goog.string.path.join(this.iconUrl,	
			this.dragDropHandles_[ViewBox.getElement().id].src)
	ViewBox.setIconBaseUrl(this.iconBaseUrl);
    }.bind(this))
}



/**
 * As stated.
 * param {Object=} opt_arg1 The first argument to apply.
 * param {Object=} opt_arg2 The second argument to apply.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.onViewBoxesChanged_ = 
function(opt_arg1, opt_arg2) {
    this['EVENTS'].runEvent('VIEWBOXES_CHANGED', opt_arg1, opt_arg2);		
}



/**
 * Utility method that loops through the multi-dimensional 'viewers' array 
 * performing the user-specified 'callback' operation on every viewer.  
 * @param {function} callback The callback function to apply.
 * @return {Object | Array.<Object>}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.loop = function(callback) {

    if (!this.ViewBoxes_){ return;}

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
 * Returns the number of xiv.ui.ViewBox columns.
 * @return {number}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.columnCount = function() {
    return this.ViewBoxes_[0].length;
}




/**
 * Returns the number of xiv.ui.ViewBox rows.
 * @return {number}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.rowCount = function() {
    return this.ViewBoxes_.length;
}




/**
 * Inserts a xiv.ui.ViewBox column into the xiv.ui.Modal, matching
 * the row count.  For instance, if a given modal has two 
 * rows of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * column to the right.
 * @param {boolean=} opt_animate Allows the user to animate the column 
 *     insertion.
 * @public
 */
xiv.ui.ViewBoxManager.prototype.insertColumn = function(opt_animate) {

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
xiv.ui.ViewBoxManager.prototype.removeColumn = function(opt_animate) {


    if (!this.ViewBoxes_){
	return; 
    }
    // Animate remove if opt_animate argument not provided.
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove columns only if there's greater than one viewer in the modal.
    if (this.ViewBoxes_[0] && this.ViewBoxes_[0].length > 1) {
	goog.array.forEach(this.ViewBoxes_, function(ViewBox, i) {
	    var rowLen = /**@type {!number}*/ ViewBox.length - 1;
	    moka.fx.fadeTo(ViewBox[rowLen].getElement(), 
			    xiv.ui.ViewBoxManager.ANIM_FAST, 0);

	    // Remove the drag drop handles
	    var dragDropHandle = /**@type {!Element}*/ this.dragDropHandles_[
		ViewBox[rowLen].getElement().id];
	    dragDropHandle.parentNode.removeChild(dragDropHandle);
	    delete dragDropHandle;

	    // Remove the xiv.ui.ViewBox
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
 * Inserts a xiv.ui.ViewBox row into the xiv.ui.Modal, matching
 * the column count.  For instance, if a given modal has two 
 * columns of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * row at the bottom.
 * @param {boolean=} opt_animate Allows the user to animate the row insertion.
 * @public
 */
xiv.ui.ViewBoxManager.prototype.insertRow = function(opt_animate) {

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
xiv.ui.ViewBoxManager.prototype.removeRow = function(opt_animate) {

    if (!this.ViewBoxes_){ return; }

    opt_animate =  (opt_animate === undefined) ? true : opt_animate;

    // Remove rows only if there's greater than one
    // viewer in the modal.
    if (this.ViewBoxes_.length > 1) {
	var delRow = /**@type {!Array.ViewBox}*/
	this.ViewBoxes_[this.ViewBoxes_.length - 1];
	goog.array.forEach(delRow, function(currDelViewBox) { 
	    moka.fx.fadeTo(currDelViewBox.getElement(), 
			    xiv.ui.ViewBoxManager.ANIM_FAST, 0);
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
 * @param {!Element} element The xiv.ui.ViewBox element to retrieve the 
 *    xiv.ui.ViewBox object from.
 * @return {xiv.ui.ViewBox}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.getViewBoxByElement = function(element) {
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
 * Returns the xiv.ui.ViewBox element at the specified row and column.
 * @param {!number} row The row of the desired ViewBox.
 * @param {!number} col The column of the desired ViewBox.
 * @return {Element}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.getViewBoxElement = function(row, col) {
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
xiv.ui.ViewBoxManager.prototype.getViewBox = function(row, col) {
    return this.ViewBoxes_[row][col];
}





/**
 * Returns the xiv.ui.ViewBox objects as a single list
 * instead of an md-array.
 * @return {Array.<xiv.ui.ViewBox>}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.getViewBoxes = function() {
    return this.loop (function(ViewBox) { 
	return ViewBox;	
    })
}




/**
 * Returns the xiv.ui.ViewBox elements as a single list
 * instead of an md-array.
 * @return {Array.<Element>}
 * @public
 */
xiv.ui.ViewBoxManager.prototype.getViewBoxElements = function() {
    var ws = /** {Array.<Element> | Element}*/ this.loop (function(ViewBox) { 
	return ViewBox.getElement();	
    })
    return (ws instanceof Array) ? ws : [ws];
}




/**
 * @param {Element} elt
 * @public
 */
xiv.ui.ViewBoxManager.prototype.setViewBoxesParent = function(elt) {
    this.ViewBoxesParent_ = elt;
}


/**
 * Makes a xiv.ui.ViewBox.
 * @return {xiv.ui.ViewBox}
 * @private
 */
xiv.ui.ViewBoxManager.prototype.createViewBox_ = function() {
    var ViewBox = /**@type {!xiv.ui.ViewBox}*/ new xiv.ui.ViewBox();
    goog.dom.append(this.ViewBoxesParent_, ViewBox.getElement());
    ViewBox.setIconBaseUrl(this.iconBaseUrl);
    this.addDragDropHandle_(ViewBox);
    this.setViewBoxEvents_(ViewBox);
    return ViewBox;    
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxManager.prototype.addDragDropHandle_ = function(ViewBox) {
    var dragDropHandle = /**@type {!Element}*/ 
    goog.dom.createDom("img",  {
	'id': 'DragAndDropHandle',
	'class' : xiv.ui.ViewBoxManager.HANDLE_CLASS
	//'src' : this.iconUrl + '/' + xiv.ui.ViewBoxManager.ICON_SRC['HANDLE']
    });
    dragDropHandle.setAttribute(xiv.ui.ViewBoxManager.VIEW_BOX_ATTR, 
				ViewBox.getElement().id); 
    goog.dom.append(this.ViewBoxesParent_, dragDropHandle)

    // Add to class property.
    if (!this.dragDropHandles_){ this.dragDropHandles_ = {}};
    this.dragDropHandles_[ViewBox.getElement().id] = dragDropHandle;

    // Tool tip
    dragDropHandle.title = "Drag and drop view box to swap.";
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxManager.prototype.setViewBoxEvents_ = function(ViewBox) {
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
 * Swaps one xiv.ui.ViewBox with another based on the class, 
 * the element of the ID.
 * @param {xiv.ui.ViewBox|Element|string} v1 xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @param {xiv.ui.ViewBox|Element|string, v2 xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @public
 */
xiv.ui.ViewBoxManager.prototype.swap = function(v1, v2) {

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
xiv.ui.ViewBoxManager.prototype.numViewBoxes = function() {
    return this.ViewBoxes_.length * this.ViewBoxes_[0].length;	 
}





/**
 * Returns the xiv.ui.ViewBox after the xiv.ui.ViewBox provided in the argument,
 * using a left-to-right, top-to-bottom scheme.
 * @param {!xiv.ui.ViewBox} currViewBox The xiv.ui.ViewBox to reference after.
 * @return {!xiv.ui.ViewBox} The ViewBox after the currViewBox.
 * @public
 */
xiv.ui.ViewBoxManager.prototype.getViewBoxAfter = function (currViewBox) {
    
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
xiv.ui.ViewBoxManager.prototype.getFirstEmpty = function() {

    // Populate any empty xiv.ui.ViewBoxes, if they exist.
    var ViewBoxesByLoad = /**@type {!number}*/ {};
    var loadTimes = /**@type {!Array.<!string | !number>}*/ [];
    var loaderViewBox = /**@type {!xiv.ui.ViewBox}*/ this.loop(function(ViewBox){
	if (!ViewBox.thumbnail) {
	    return ViewBox;
	}
	else{
	    var loadTime = /**@type {number}*/ ViewBox.getThumbnailLoadTime()
	    ViewBoxesByLoad[loadTime] = ViewBox;
	    loadTimes.push(loadTime);
	}
    }.bind(this))


    // If no empty, return ViewBox which as first loaded...
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
 * Updates the position of the dragDropHandles_.
 * @public
 */
xiv.ui.ViewBoxManager.prototype.updateDragDropHandles = function() {
    this.loop(function(ViewBox){
	var ViewBoxDims = /**@type {!Object}*/
	moka.style.dims(ViewBox.getElement());
	var dragDropHandle = /**@type {!Element}*/
	this.dragDropHandles_[ViewBox.getElement().id];
	moka.style.setStyle(dragDropHandle, {'left': ViewBoxDims['left'], 
					      'top': ViewBoxDims['top']});
    }.bind(this))
}



/**
 * Define the animation method.
 * @param {!Element} el The first xiv.ui.ViewBox element to swap.
 * @param {!toLeft} toLeft The to-be left position.
 * @param {!toTop} toTop The to-be top position.
 * @param {!number} duration The duration of the animation.
 * @return {!goog.fx.dom.Slide} The slide animation.
 */
xiv.ui.ViewBoxManager.prototype.generateSlide_ = function (el, a, b, duration) {
    return new goog.fx.dom.Slide(el, [el.offsetLeft, el.offsetTop], 
				 [a, b], duration, goog.fx.easing.easeOut);
    
}




/**
 * Animates a position swap between two view boxes.
 * @param {!xiv.ui.ViewBox} ViewBoxElementA The first xiv.ui.ViewBox element to swap.
 * @param {!xiv.ui.ViewBox} ViewBoxElementB The second xiv.ui.ViewBox element to swap.
 * @param {!Object.<string, string>} ViewBoxPositions The ViewBox positions to 
 *     reference.
 * @param {boolean=} opt_animate Whether to animate the swap.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.animateSwap_ = 
function(ViewBoxElementA, ViewBoxElementB, ViewBoxPositions, opt_animated) {

    var animLen = /**@type {!number}*/
    (opt_animated === false) ? 0 : xiv.ui.ViewBoxManager.ANIM_MED;
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/
    new goog.fx.AnimationParallelQueue();
    var ViewBoxADims = /**@type {!Object}*/
    ViewBoxPositions[ViewBoxElementA.id]['relative'];
    var ViewBoxBDims = /**@type {!Object}*/
    ViewBoxPositions[ViewBoxElementB.id]['relative'];

    // Add animations to queue.
    animQueue.add(this.generateSlide_(ViewBoxElementA, ViewBoxBDims['left'], 
			ViewBoxBDims['top'], xiv.ui.ViewBoxManager.ANIM_MED));
    animQueue.add(this.generateSlide_(ViewBoxElementB, ViewBoxADims['left'], 
			ViewBoxADims['top'], xiv.ui.ViewBoxManager.ANIM_MED));

    goog.events.listen(animQueue, 'end', function() {
	this.updateDragDropHandles();
    }.bind(this))


    animQueue.play();
}




/**
 * Initializes and/or resets the DragDrop swapping of xiv.ui.ViewBoxes.
 * This needs to be called every time a xiv.ui.ViewBox is added or 
 * removed from the MODAL.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.clearDragDropGroups_ = function(){
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
xiv.ui.ViewBoxManager.prototype.addElementsToDragDropGroups_ = function() {
    this.loop(function(ViewBox) {
	this.dragDropGroup_.addItem(
	    this.dragDropHandles_[ViewBox.getElement().id]);
	this.dragDropTargets_.addItem(ViewBox.getElement());
    }.bind(this))
}




/**
 * As stated
 * @private
 */
xiv.ui.ViewBoxManager.prototype.setDragEvents_ = function() { 
    goog.events.listen(this.dragDropGroup_, 'dragstart', 
		       this.dragStart_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragover', 
		       this.dragOver_.bind(this));
    goog.events.listen(this.dragDropGroup_, 'dragend', 
		       this.dragEnd_.bind(this));
}




/**
 * Initializes and/or resets the DragDrop swapping of xiv.ui.ViewBoxes.
 * This needs to be called every time a xiv.ui.ViewBox is added or 
 * removed from the MODAL.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.resetDragDropGroup_ = function() { 

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
    this.dragDropGroup_.createDragElement = function(sourceElt) {
	var dragElement = /**@type {!Element}*/
	this.makeDragClone_(goog.dom.getElement(
	    sourceElt.getAttribute(xiv.ui.ViewBoxManager.VIEW_BOX_ATTR)));
	return dragElement;
    }.bind(this);

    this.setDragEvents_();
}




/**
* Define DRAG START function.  We record the xiv.ui.ViewBox positions.
* @param {!Event}
* @private
*/
xiv.ui.ViewBoxManager.prototype.dragStart_ = function(event) {
    this.ViewBoxPositions_ = {};
    this.loop(function(ViewBox){
	this.ViewBoxPositions_[ViewBox.getElement().id] = {
	    'absolute': moka.style.absolutePosition(ViewBox.getElement()),
	    'relative': moka.style.dims(ViewBox.getElement())
	}
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'hidden';
    }.bind(this))
}




/**
 * Function to create drag clone.
 * @param {!Element} ViewBoxElement The ViewBox element to clone.
 * @param {Element=} opt_parent The optional parent element to append the
 *    drag clone to.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.makeDragClone_ = 
function(ViewBoxElement, opt_parent) {
    var dragElement = /**@type {!Element}*/ ViewBoxElement.cloneNode(false);
    goog.dom.classes.set(dragElement, xiv.ui.ViewBox.DRAGGING_CLASS);
    opt_parent && opt_parent.appendChild(dragElement);
    return dragElement;
}




/**
 * Define DRAG OVER function.
 * @param {!Event} event The event object.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.dragOver_ = function(event) {
    if (event.dropTargetItem.element.id !== 
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxManager.VIEW_BOX_ATTR)) {

	var ViewBoxElementA = /**@type {!Element}*/
	    goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxManager.VIEW_BOX_ATTR));
	var ViewBoxElementB = /**@type {!Element}*/
	    goog.dom.getElement(event.dropTargetItem.element.id);

	// Swap internally, then animate it.
	this.swap(ViewBoxElementA, ViewBoxElementB);
	this.animateSwap_(ViewBoxElementA, ViewBoxElementB, 
			  this.ViewBoxPositions_);

	this.updatePositionsFromSwap_(ViewBoxElementA, ViewBoxElementB);
    }
}




/**
 * As stated.
 * @param {!Element} ViewBoxElementA The first ViewBox element.
 * @param {!Element} ViewBoxElementB The second ViewBox element.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.updatePositionsFromSwap_ = 
function(ViewBoxElementA, ViewBoxElementB){
    var valA = /**@type {!Object}*/
    this.ViewBoxPositions_[ViewBoxElementA.id];
    var valB = /**@type {!Object}*/
    this.ViewBoxPositions_[ViewBoxElementB.id];
	this.ViewBoxPositions_[ViewBoxElementA.id] = valB;
    this.ViewBoxPositions_[ViewBoxElementB.id] = valA;
}




/**
 * DRAG END function.
 * NOTE: goog.fx.dragDropGroup will delete the original dragger
 * so we have to clone it to reanimate it back into place.
 * @param {!Event} event The event object.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.dragEnd_ = function(event) {

    var dragger = /**@type {!Element}*/
    event.dragSourceItem.parent_.dragEl_;

    var originalViewBox = /**@type {!Element}*/ goog.dom.getElement(
	event.dragSourceItem.currentDragElement_.getAttribute(
	    xiv.ui.ViewBoxManager.VIEW_BOX_ATTR));

    var srcViewBoxDims = /**@type {!Object}*/
    //goog.style.getPosition(originalViewBox);	
    moka.style.absolutePosition(originalViewBox);
    //window.console.log(srcViewBoxDims);
 
    var draggerClone = /**@type {!Element}*/
    this.createDraggerClone_(dragger);
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
xiv.ui.ViewBoxManager.prototype.createDraggerClone_ = function(dragger){  
    // We have to clone the dragger as goog.fx.dragDropGroup
    // will delete the original dragger.
    var draggerClone = /**@type {!Element}*/
    this.makeDragClone_(dragger, document.body);

    // Set the draggerClone parent to the modal parent
    // to avoid any wierd positioning issues.    
    var dragParent = /**@type {!Element}*/ this.ViewBoxesParent_.parentNode ? 
	this.ViewBoxesParent_.parentNode : this.ViewBoxesParent_;
    goog.dom.append(dragParent, draggerClone);
    return draggerClone;
}




/**
 * Positions the draggerClone element to the drag element.
 * @param {!Element} dragger The dragger  element of the View Box.
 * @param {!Element} draggerClone The dragger clone element of the View Box.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.repositionDraggerClone_ = 
function(dragger, draggerClone){
    var draggerViewBoxDims = /**@type {!Object}*/
    moka.style.absolutePosition(dragger);
    moka.style.setStyle(draggerClone, {
	'top': draggerViewBoxDims['top'] , 
	'left': draggerViewBoxDims['left'],
	'z-index': 10000
    });
}




/**
 * As stated.
 * @param {!Element} draggerClone The dragger clone element of the View Box.
 * @param {!Object} srcViewBoxDims The position and dimensions of the src
 *     ViewBox.
 * @return {!goog.fx.AnimationParallelQueue} The animation queue.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.createDragEndAnim_ = 
function(draggerClone, srcViewBoxDims){
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/
    new goog.fx.AnimationParallelQueue();
    // Add the slide animation to the animQueue.

    animQueue.add(this.generateSlide_(draggerClone, 
				      srcViewBoxDims['left'], 
				      srcViewBoxDims['top'], 
				      xiv.ui.ViewBoxManager.ANIM_FAST));

    // When animation finishes, delete the draggerClone.
    goog.events.listen(animQueue, 'end', function() {
	draggerClone.parentNode.removeChild(draggerClone); 
	delete draggerClone;
    })
    
    return animQueue;
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBoxManager.prototype.showDragDropHandles_ = function(){
    this.loop(function(ViewBox){
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'visible';	
    }.bind(this))
}
