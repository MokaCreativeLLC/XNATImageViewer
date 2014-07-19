/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ViewBoxHandler');

// goog
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fx');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.style');
goog.require('goog.fx.easing');
goog.require('goog.dom.classes');
goog.require('goog.object');

// nrg
goog.require('nrg.string');
goog.require('nrg.style');
goog.require('nrg.fx');
goog.require('nrg.ui.Component');

// gxnat
goog.require('gxnat.vis.VisNode');

// xiv
goog.require('xiv.ui.ViewBox');

//-----------




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
xiv.ui.ViewBoxHandler = function () {
    goog.base(this);
}
goog.inherits(xiv.ui.ViewBoxHandler, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ViewBoxHandler', xiv.ui.ViewBoxHandler);



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ViewBoxHandler.CSS_SUFFIX = {
    HANDLE: 'handle',
    VIEWBOXDRAGCLONE: 'viewboxdragclone',
    CLOSEBUTTON: 'closebutton',
    ADDROWBUTTON: 'addrowbutton',
    ADDCOLUMNBUTTON: 'addcolumnbutton',
}



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxHandler.EventType = {
    VIEWABLE_PRELOAD: goog.events.getUniqueId('viewable_preload'),
    VIEWABLE_LOADED: goog.events.getUniqueId('viewable_load'),
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
 * @type {!number}
 * @const
 */
xiv.ui.ViewBoxHandler.prototype.MAX_ROWS = 5;


/**
 * @type {!number}
 * @const
 */
xiv.ui.ViewBoxHandler.prototype.MAX_COLUMNS = 5;


/**
 * @type {Object}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.HandlerButtons_;



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.dragDropHandles_;



/**
 * @type {Object.<string, Element>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.closeButtons_;



/**
 * @type {Object.<string, goog.math.Coordinate>}
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
 * Returns the number of xiv.ui.ViewBox rows.
 *
 * @return {number}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.rowCount = function() {
    return this.ViewBoxes_.length;
}



/**
 * Returns an empty matrix sized to the ViewBoxes_ property.
 * @return {Array} 
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getEmptyMatrix = function(callback) {
    var arr = [];
    goog.array.forEach(this.ViewBoxes_, function(ViewBoxRow, i){
	arr.push([]);
	goog.array.forEach(ViewBoxRow, function(ViewBox){
	    arr[i].push(null);
	})	
    })
    return arr;
}




/**
 * Utility method that loops through the multi-dimensional 'viewers' array 
 * performing the user-specified 'callback' operation on every viewer.  
 * 
 * @param {!Function} callback
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.loop = function(callback) {
    if (!this.ViewBoxes_){ return;}
    goog.array.forEach(this.ViewBoxes_, function(ViewBoxRow, i){
	goog.array.forEach(ViewBoxRow, function(ViewBox, j){
	    callback(ViewBox, i, j, this.ViewBoxes_.length, ViewBoxRow.length);
	}.bind(this))	
    }.bind(this))
}



/**
 * Inserts a xiv.ui.ViewBox column into the xiv.ui.Modal, matching
 * the row count.  For instance, if a given modal has two 
 * rows of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * column to the right.
 *
 * @param {xiv.ui.ViewBox} opt_ViewBox
 * @param {boolean=} opt_animate Allows the user to animate the row insertion.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.insertColumn = 
function(opt_ViewBox, opt_animate) {
    if (!this.ViewBoxes_){ this.ViewBoxes_ = [[]] };

    var i = 0, newColumn = [];
    var columnLen;

    if (goog.isDefAndNotNull(opt_ViewBox)){
        var inds = this.getViewBoxIndices_(opt_ViewBox);
        if(this.ViewBoxes_[inds.i].length < this.MAX_COLUMNS) {
            newColumn.push(this.createViewBox_());
            goog.array.insertAt(this.ViewBoxes_[inds.i], newColumn[0], inds.j+1);
        }
    }
    else {
        newColumn = [];
        columnLen = this.ViewBoxes_.length ? this.ViewBoxes_.length : 1;
        for (i = 0; i < columnLen; i++) {newColumn.push(this.createViewBox_())};

        //
        // If there are no Viewers in the modal, add one. Otherwise, insert
        // the new column.
        //
        if (this.ViewBoxes_.length === 0) {
            this.ViewBoxes_.push([newColumn[0]]);
        } else {
            goog.array.forEach(this.ViewBoxes_, function(ViewBoxRow, i) {
            ViewBoxRow.push(newColumn[i]);
            })
        }
    }

    opt_animate =  (opt_animate === undefined) ? true : opt_animate;


    // Events.
    this.onViewBoxesChanged_(newColumn, opt_animate);
    this.resetDragDropGroup_();
}



/**
 * Removes a column of xiv.ui.ViewBoxes from the xiv.ui.Modal.
 * @param {boolean=} opt_animate Allows the user to animate the column removal.
 * @deprecated
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
	    this.removeViewBox_(ViewBoxCol[rowLen])
	    ViewBoxCol.splice(rowLen, 1);		
	}.bind(this))
    }

    // Events.
    this.onViewBoxesChanged_(null, opt_animate);
    this.resetDragDropGroup_();
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @return {Object.<string, number>}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxIndices_ = function(ViewBox){
    var i = 0;
    var j = 0;
    var len = this.ViewBoxes_.length;
    var len2 = 0;
    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    if (ViewBox === this.ViewBoxes_[i][j]) {
		return {
		    i: i,
		    j: j
		}
	    }
	}
    }
}



/**
 * @return {!boolean}
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.ViewBoxesRendering = function(){
    //window.console.log("VIR RENDER");
    var i = 0;
    var j = 0;
    var len = this.ViewBoxes_.length;
    var len2 = 0;
    for (i=0; i < len; i++) {
	for (j=0, len2 = this.ViewBoxes_[i].length; j < len2; j++) {
	    //window.console.log(i, j, this.ViewBoxes_[i][j].isRendering());
	    if (this.ViewBoxes_[i][j].isRendering()) {
		return true;
	    }
	}
    }
    return false;
}




/**
 * Inserts a xiv.ui.ViewBox row into the xiv.ui.Modal, matching
 * the column count.  For instance, if a given modal has two 
 * columns of xiv.ui.ViewBoxes, this will insert a two xiv.ui.ViewBox length
 * row at the bottom.
 *
 * @param {xiv.ui.ViewBox} opt_ViewBox
 * @param {boolean=} opt_animate Allows the user to animate the row insertion.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.insertRow = function(opt_ViewBox, opt_animate) {

    if (!this.ViewBoxes_){
	this.ViewBoxes_ = [[]]; 
    }

    var newRow = [];
    var i, rowLen;

    if (goog.isDefAndNotNull(opt_ViewBox)){
        var inds = this.getViewBoxIndices_(opt_ViewBox);
        newRow = [];
        rowLen = this.ViewBoxes_[inds.i].length;
        if(this.ViewBoxes_.length < this.MAX_ROWS){
            for (i=0; i < rowLen; i++) {newRow.push(this.createViewBox_())};
            goog.array.insertAt(this.ViewBoxes_, newRow, inds.i + 1);
        }
    }
    else {
        rowLen = (this.ViewBoxes_[0] && this.ViewBoxes_[0].length) ?
            this.ViewBoxes_[0].length : 1;
        if(this.ViewBoxes_.length < this.MAX_ROWS){
            for (i=0; i < rowLen; i++) {newRow.push(this.createViewBox_())};
            this.ViewBoxes_.push(newRow);
        }
    }

    //
    // Events
    //
    opt_animate =  (opt_animate === undefined) ? true : opt_animate;
    this.onViewBoxesChanged_(newRow, opt_animate);
    this.resetDragDropGroup_();
}




/**
 * Removes a row of xiv.ui.ViewBoxes from the xiv.ui.Modal.
 *
 * @param {boolean=} opt_animate Allows the user to animate the row removal.
 * @deprecated
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
	    this.removeViewBox_(currDelViewBox)
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
 * instead of an md-array.
 *
 * @return {Array.<xiv.ui.ViewBox>}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxes = function() {
    var arr = [];
    this.loop(function(ViewBox) { 
	arr.push(ViewBox);	
    })
    return arr;
}




/**
 * Returns the xiv.ui.ViewBox elements as a single array.
 *
 * instead of an md-array.
 * @return {Array.<Element>}
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.getViewBoxElements = function() {
    var arr = [];
    this.loop(function(ViewBox) { 
	arr.push(ViewBox.getElement());	
    })
    return arr;
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

    this.addCloseButton_(ViewBox);
    this.addDragDropHandle_(ViewBox);
    this.addAddRowButton_(ViewBox);
    this.addAddColumnButton_(ViewBox);

    this.setViewBoxEvents_(ViewBox);
    return ViewBox;    
}


/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.addAddColumnButton_ = function(ViewBox){
    //
    // Create the element
    //
    var addColumnButton = goog.dom.createDom('img', {
	'id': xiv.ui.ViewBoxHandler.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBoxHandler.CSS.ADDCOLUMNBUTTON,
	'src': serverRoot + '/images/viewer/xiv/ui/ViewBoxManager/addcolumn.png'
    });

    //
    // Set the hover class
    //
    nrg.style.setHoverClass(addColumnButton, 
			    xiv.ui.ViewBoxHandler.CSS.ADDCOLUMNBUTTON 
			    + '-hovered');

    //
    // Dispatch event on click
    //
    goog.events.listen(addColumnButton, 
		       goog.events.EventType.CLICK,
		       function(){
			   this.insertColumn(ViewBox);
		       }.bind(this))
    
    //
    // Set an attribute
    //
    addColumnButton.setAttribute(xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR, 
			     ViewBox.getElement().id); 

    //
    // Add to the menu
    //
    ViewBox.addToMenu('TOP_LEFT', addColumnButton, 1);
    // Add to class property.
    if (!this.addColumnButtons_){ this.addColumnButtons_ = {}};
    this.addColumnButtons_[ViewBox.getElement().id] = addColumnButton;


    // Tool tip
    addColumnButton.title = "Add ViewBox Column";
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.addAddRowButton_ = function(ViewBox){
    //
    // Create the element
    //
    var addRowButton = goog.dom.createDom('img', {
	'id': xiv.ui.ViewBoxHandler.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBoxHandler.CSS.ADDROWBUTTON,
	'src': serverRoot + '/images/viewer/xiv/ui/ViewBoxManager/addrow.png'
    });

    //
    // Set the hover class
    //
    nrg.style.setHoverClass(addRowButton, 
			    xiv.ui.ViewBoxHandler.CSS.ADDROWBUTTON 
			    + '-hovered');

    //
    // Dispatch event on click
    //
    goog.events.listen(addRowButton, 
		       goog.events.EventType.CLICK,
		       function(){
			   this.insertRow(ViewBox);
		       }.bind(this))
    
    //
    // Set an attribute
    //
    addRowButton.setAttribute(xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR, 
			     ViewBox.getElement().id); 

    //
    // Add to the menu
    //
    ViewBox.addToMenu('TOP_LEFT', addRowButton, 1);
    // Add to class property.
    if (!this.addRowButtons_){ this.addRowButtons_ = {}};
    this.addRowButtons_[ViewBox.getElement().id] = addRowButton;


    // Tool tip
    addRowButton.title = "Add ViewBox Row";
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.addCloseButton_ = function(ViewBox){
    //
    // Create the element
    //
    var closeButton = goog.dom.createDom('img', {
	'id': xiv.ui.ViewBoxHandler.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBoxHandler.CSS.CLOSEBUTTON,
	'src': serverRoot + '/images/viewer/xiv/ui/Modal/close.png'
    });

    //
    // Set the hover class
    //
    nrg.style.setHoverClass(closeButton, xiv.ui.ViewBoxHandler.CSS.CLOSEBUTTON 
			    + '-hovered');

    //
    // Dispatch event on click
    //
    goog.events.listen(closeButton, 
		       goog.events.EventType.CLICK,
		       function(){
			   this.onViewBoxClosed_(ViewBox);
		       }.bind(this))
    
    //
    // Set an attribute
    //
    closeButton.setAttribute(xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR, 
			     ViewBox.getElement().id); 

    //
    // Add to the menu
    //
    ViewBox.addToMenu('TOP_LEFT', closeButton, 1);
    // Add to class property.
    if (!this.closeButtons_){ this.closeButtons_ = {}};
    this.closeButtons_[ViewBox.getElement().id] = closeButton;


    // Tool tip
    closeButton.title = "Close ViewBox";
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
    ViewBox.addToMenu('TOP_LEFT', dragDropHandle, 1);

    // Add to class property.
    if (!this.dragDropHandles_){ this.dragDropHandles_ = {}};
    this.dragDropHandles_[ViewBox.getElement().id] = dragDropHandle;

    // Tool tip
    dragDropHandle.title = "Drag / Swap ViewBox";
}


/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onThumbnailLoaded_ = function(e){
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.VIEWABLE_LOADED,
	ViewBox: e.target
    })
}


/**
 * @param {gxnat.vis.VisNode} VisNode
 * @param {!Function} callback
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.ViewBoxFromVisNode = 
function(VisNode, callback){
    this.loop(function(ViewBox){  
	if (goog.array.contains(ViewBox.getViewableTrees(), VisNode)){
	    callback(ViewBox);
	}
    })
}




/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onThumbnailPreload_ = function(e){
    this.dispatchEvent({
	type: xiv.ui.ViewBoxHandler.EventType.VIEWABLE_PRELOAD,
	ViewBox: e.target
    })
}


/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onRenderError_ = function(e){
    this.dispatchEvent(e);
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.setViewBoxEvents_ = function(ViewBox) {

    // Onload
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.VIEWABLE_LOADED, 
	this.onThumbnailLoaded_.bind(this))
   
    // Preload
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.VIEWABLE_PRELOAD, 
	this.onThumbnailPreload_.bind(this))

    // Error
    goog.events.listen(ViewBox, xiv.ui.ViewBox.EventType.RENDER_ERROR, 
	this.onRenderError_.bind(this))
}



/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.removeViewBox_ = function(ViewBox){
    //
    // fade out
    //
    nrg.fx.fadeTo(ViewBox.getElement(), 
		  nrg.ui.Component.animationLengths.FAST, 0);

    //
    // Remove the handle
    //
    goog.dom.removeNode(this.dragDropHandles_[ViewBox.getElement().id]);

    //
    // Remove the handle
    //
    goog.dom.removeNode(this.closeButtons_[ViewBox.getElement().id]);

    //
    // Remove the xiv.ui.ViewBox
    //
    ViewBox.dispose();
}


/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.adjustToClose_ = function(ViewBox){
    var newViewBoxes = [];
    var currActiveRow = 0;
    var currActiveCol = 0;
    var newViewBoxRow, colCount, newColCount;
    var colsEven = true;

    //
    // First remove the view box
    //
    this.removeViewBox_(ViewBox);

    //
    // Then we have to clean up the View Boxes matrix
    //
    goog.array.forEach(this.ViewBoxes_, function(ViewBoxCol, i) {
	//
	// Create the new row
	//
	newViewBoxRow = [];

	//
	// Store only non-disposed objects
	//
	goog.array.forEach(ViewBoxCol, function(_ViewBox, j) {
	    if (!_ViewBox.isDisposed()){
		//window.console.log(_ViewBox.getElement());
		newViewBoxRow.push(_ViewBox);	
	    }
	}.bind(this))

	//
	// Add new row
	//
	if (newViewBoxRow.length != 0){
	    newViewBoxes.push(newViewBoxRow);
	    newColCount = newViewBoxes[newViewBoxes.length - 1].length;

	    //
	    // Determine if the columns are uneven
	    //
	    if (newViewBoxes.length == 1){
		colCount = newColCount;
	    }
	    else if (newColCount != colCount){
		colsEven = false;
	    }
	}
    }.bind(this))

    this.ViewBoxes_ = newViewBoxes;

    this.onViewBoxesChanged_(null, true);
    this.resetDragDropGroup_();

}


/**
 * @param {xiv.ui.ViewBox} ViewBox
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onViewBoxClosed_ = function(ViewBox){

    //
    // Exit out if there's only one ViewBox
    //
    if (this.numViewBoxes() == 1) { return };

    var inUse = ViewBox.checkInUseAndShowDialog(function(){
	this.adjustToClose_(ViewBox);
    }.bind(this))
    if (!inUse){
	this.adjustToClose_(ViewBox);
    }
}



/**
 * Determines whether a match is found between a given ViewBox object and
 * a related object that's either the element, id or the same ViewBox object.
 * 
 * @param {xiv.ui.ViewBox} ViewBox The ViewBox object to base the match against.
 * @param {xiv.ui.ViewBox|Element|string, matrchObj xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @return {boolan}  Whether there was a match;
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.isMatch = function(ViewBox, matchObj) {
    var byObj = (ViewBox === matchObj);
    var byElement = (ViewBox.getElement() === matchObj);
    var byId = (ViewBox.getElement().id === matchObj);
    return (byObj || byElement || byId);
}




/**
 * Swaps one xiv.ui.ViewBox with another based on the class, 
 * the element of the ID.
 * 
 * @param {xiv.ui.ViewBox|Element|string} swapper xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @param {xiv.ui.ViewBox|Element|string, swapee xiv.ui.ViewBox Class, 
 *     xiv.ui.ViewBox.getElement(), or xiv.ui.ViewBox ID
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.swapIndices_ = function(swapper, swapee) {
    //window.console.log('\n\nSWAPPER', swapper);
    //window.console.log('SWAPPEE', swapee);

    var swapper_i, swapper_j, swapee_i, swapee_j;

    var i = 0, j = 0;
    var len = this.ViewBoxes_.length;
    var ViewBoxRow, len2, ViewBox;

    //window.console.log('I', i, len);
    for (; i < len; i++){
	
	ViewBoxRow = this.ViewBoxes_[i];
	len2 = ViewBoxRow.length;
	//window.console.log('J', j, len2);
	//j = 0;
	for (j = 0; j < len2; j++){
	    ViewBox = this.ViewBoxes_[i][j];

	    window.console.log(ViewBox.getElement());

	    if (this.isMatch(ViewBox, swapper)){
		swapper_i = i;
		swapper_j = j;	
		//break;
	    }
	    
	    
	    if (this.isMatch(ViewBox, swapee)){
		swapee_i = i;
		swapee_j = j;
		//break;
	    }

	    if (goog.isDefAndNotNull(swapper_i) && 
		goog.isDefAndNotNull(swapee_i)){
		//break;
	    }
	}
    }

    window.console.log(swapper_i, swapper_j, swapee_i, swapee_j);

    //
    // If both viewBoxes are found, swap them...
    //
    if (goog.isNumber(swapper_i) && goog.isNumber(swapee_i)){
	//
	// Swap them within the matrix
	//
	var tempViewBox = this.ViewBoxes_[swapper_i][swapper_j];
	this.ViewBoxes_[swapper_i][swapper_j] = 
	    this.ViewBoxes_[swapee_i][swapee_j];
	this.ViewBoxes_[swapee_i][swapee_j] = tempViewBox;

	//
	// Swap the sizes
	//
	var swapperSize = goog.style.getSize(
		this.ViewBoxes_[swapper_i][swapper_j].getElement());
	var swapeeSize = goog.style.getSize(
		this.ViewBoxes_[swapee_i][swapee_j].getElement());
	goog.style.setSize(this.ViewBoxes_[swapee_i][swapee_j].getElement(), 
			   swapperSize);
	goog.style.setSize(this.ViewBoxes_[swapper_i][swapper_j].getElement(), 
			   swapeeSize);
    }
}	




/**
 * Returns the total number of xiv.ui.ViewBoxes within a modal.
 * @return {number} The total number of View Boxes.
 * @public
 */
xiv.ui.ViewBoxHandler.prototype.numViewBoxes = function() {
    var count = 0;
    this.loop(function(ViewBox){
	count++;
    })
    return count;
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
 * @param {!Element} ViewBoxElementA The first xiv.ui.ViewBox element 
 *     to swap.
 * @param {!Element} ViewBoxElementB The second xiv.ui.ViewBox element 
 *     to swap.
 * @param {boolean=} opt_animate Whether to animate the swap.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.animateSwap_ = 
function(ViewBoxElementA, ViewBoxElementB, opt_animated) {

    var animLen = (opt_animated === false) ? 0 : 
	nrg.ui.Component.animationLengths.MEDIUM;
    var animQueue = new goog.fx.AnimationParallelQueue();
    var ViewBoxADims =  this.ViewBoxPositions_[ViewBoxElementA.id];
    var ViewBoxBDims = this.ViewBoxPositions_[ViewBoxElementB.id];

    ViewBoxElementA[xiv.ui.ViewBoxHandler.IS_SWAPPING] = true;
    ViewBoxElementB[xiv.ui.ViewBoxHandler.IS_SWAPPING] = true;

    //window.console.log(ViewBoxElementA, ViewBoxADims);
    //window.console.log(ViewBoxElementB, ViewBoxBDims);
    //
    // Add animations to queue.
    //
    animQueue.add(this.generateSlide_(
	ViewBoxElementA, 
	ViewBoxBDims.x, 
	ViewBoxBDims.y, 
	300));
    
    animQueue.add(this.generateSlide_(
	ViewBoxElementB, 
	ViewBoxADims.x, 
	ViewBoxADims.y, 
        300));
    

    goog.events.listenOnce(animQueue, 'end', function() {
	window.console.log("SWAP END");
	this.onSwapAnimationEnd_(ViewBoxElementA, ViewBoxElementB);
    }.bind(this))

    //
    // Play animation
    //
    animQueue.play();
}




/**
 * @param {!Element} ViewBoxElementA The first xiv.ui.ViewBox element 
 *     to swap.
 * @param {!Element} ViewBoxElementB The second xiv.ui.ViewBox element 
 *     to swap.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.onSwapAnimationEnd_ = 
function(ViewBoxElementA, ViewBoxElementB){
    ViewBoxElementA[xiv.ui.ViewBoxHandler.IS_SWAPPING] = false;
    ViewBoxElementB[xiv.ui.ViewBoxHandler.IS_SWAPPING] = false;

    //
    // then dispatch change event.
    //
    this.recordPositions_();
    this.swapIndices_(ViewBoxElementA, ViewBoxElementB);
    window.console.log(this.ViewBoxes_);
    //this.onViewBoxesChanged_();
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
	if (goog.isDefAndNotNull(ViewBox.getElement())){
	    this.dragDropGroup_.addItem(
		this.dragDropHandles_[ViewBox.getElement().id]);
	    this.dragDropTargets_.addItem(ViewBox.getElement());
	}
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
    if (goog.isDefAndNotNull(this.ViewBoxPositions_)){
	goog.object.clear(this.ViewBoxPositions_);
    } else {
	this.ViewBoxPositions_ = {};
    }
    /**
    this.loop(function(ViewBox){
	this.dragDropHandles_[ViewBox.getElement().id].style.visibility = 
	    'hidden';
    }.bind(this))
    */
    this.recordPositions_();
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
 * @private
 */
xiv.ui.ViewBoxHandler.IS_SWAPPING = goog.string.createUniqueString();



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


	if (!ViewBoxElementA[xiv.ui.ViewBoxHandler.IS_SWAPPING] &&
	    !ViewBoxElementB[xiv.ui.ViewBoxHandler.IS_SWAPPING]){
	    // Swap internally, then animate it.
	    
	    this.animateSwap_(ViewBoxElementA, ViewBoxElementB);

	}
    }
}




/**
 * @param {!Element} ViewBoxElementA The first ViewBox element.
 * @param {!Element} ViewBoxElementB The second ViewBox element.
 * @private
 */
xiv.ui.ViewBoxHandler.prototype.recordPositions_ = function(){
    this.loop(function(ViewBox){
	this.ViewBoxPositions_[ViewBox.getElement().id] = 
	    goog.style.getPosition(ViewBox.getElement());
    }.bind(this))
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

    var srcViewBoxPos = goog.style.getClientPosition(originalViewBox);
    var srcViewBoxDims = {
	'left': srcViewBoxPos.x,
	'top': srcViewBoxPos.y
    }
    var draggerClone = this.createDraggerClone_(dragger);
    this.repositionDraggerClone_(dragger, draggerClone);
    this.createDragEndAnim_(draggerClone, srcViewBoxDims).play();
    this.showDragDropHandles_();

    this.onViewBoxesChanged_();
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
	goog.dom.removeNode(ViewBox.getElement());
	ViewBox.dispose();
    }.bind(this));


    // The ViewBoxes 2D array.
    goog.array.forEach(this.ViewBoxes_, function(arr){
	goog.array.clear(arr);
    })
    goog.array.clear(this.ViewBoxes_); 
    delete this.ViewBoxes_;


    // Drag Drop handles
    this.disposeElementMap(this.dragDropHandles_);
    delete this.dragDropHandles_;


    // Drag Drop handles
    this.disposeElementMap(this.closeButtons_);
    delete this.closeButtons_;


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




goog.exportSymbol('xiv.ui.ViewBoxHandler.CSS_SUFFIX',
	xiv.ui.ViewBoxHandler.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ViewBoxHandler.EventType',
	xiv.ui.ViewBoxHandler.EventType);
goog.exportSymbol('xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR',
	xiv.ui.ViewBoxHandler.VIEW_BOX_ATTR);
goog.exportSymbol('xiv.ui.ViewBoxHandler.ID_PREFIX',
	xiv.ui.ViewBoxHandler.ID_PREFIX);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.MAX_ROWS',
	xiv.ui.ViewBoxHandler.prototype.MAX_ROWS);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.MAX_COLUMNS',
	xiv.ui.ViewBoxHandler.prototype.MAX_COLUMNS);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.rowCount',
	xiv.ui.ViewBoxHandler.prototype.rowCount);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getEmptyMatrix',
	xiv.ui.ViewBoxHandler.prototype.getEmptyMatrix);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.loop',
	xiv.ui.ViewBoxHandler.prototype.loop);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.insertColumn',
	xiv.ui.ViewBoxHandler.prototype.insertColumn);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.removeColumn',
	xiv.ui.ViewBoxHandler.prototype.removeColumn);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.insertRow',
	xiv.ui.ViewBoxHandler.prototype.insertRow);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.removeRow',
	xiv.ui.ViewBoxHandler.prototype.removeRow);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBoxByElement',
	xiv.ui.ViewBoxHandler.prototype.getViewBoxByElement);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBoxElement',
	xiv.ui.ViewBoxHandler.prototype.getViewBoxElement);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBox',
	xiv.ui.ViewBoxHandler.prototype.getViewBox);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBoxes',
	xiv.ui.ViewBoxHandler.prototype.getViewBoxes);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBoxElements',
	xiv.ui.ViewBoxHandler.prototype.getViewBoxElements);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.setViewBoxesParent',
	xiv.ui.ViewBoxHandler.prototype.setViewBoxesParent);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.ViewBoxFromVisNode',
	xiv.ui.ViewBoxHandler.prototype.ViewBoxFromVisNode);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.isMatch',
	xiv.ui.ViewBoxHandler.prototype.isMatch);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.numViewBoxes',
	xiv.ui.ViewBoxHandler.prototype.numViewBoxes);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getViewBoxAfter',
	xiv.ui.ViewBoxHandler.prototype.getViewBoxAfter);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.getFirstEmpty',
	xiv.ui.ViewBoxHandler.prototype.getFirstEmpty);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.ViewBoxesRendering',
	xiv.ui.ViewBoxHandler.prototype.ViewBoxesRendering);
goog.exportSymbol('xiv.ui.ViewBoxHandler.prototype.disposeInternal',
	xiv.ui.ViewBoxHandler.prototype.disposeInternal);
