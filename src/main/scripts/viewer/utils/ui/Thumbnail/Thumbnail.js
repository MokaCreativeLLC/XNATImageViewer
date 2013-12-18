/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

/**
 * Google closure includes
 */
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');


/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.style');





/**
 * utils.ui.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 *
 * @constructor
 * @param {opt_args}
 */
goog.provide('utils.ui.Thumbnail');
utils.ui.Thumbnail = function (opt_args) {

    var that = this;
    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;


    //------------------
    // Define the thumbnail element.
    //------------------
    this._element = utils.dom.makeElement('div', parent, "utils.ui.Thumbnail");


    //------------------
    // Image
    //------------------
    this._image = new Image();
    this._element.appendChild(this._image)

    
    
    //------------------
    // Add displayText element
    //------------------
    this._displayText = utils.dom.makeElement("div", this._element, "DisplayText");


    //------------------
    // Set Hover Methods
    //------------------
    this.setHoverListeners(true);
	
    

    //------------------
    // Call defaults
    //------------------
    that.setHovered(false);



    //------------------
    // Set Styles
    //------------------
    goog.dom.classes.set(this._element, utils.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this._image, utils.ui.Thumbnail.IMAGE_CLASS);
    goog.dom.classes.set(this._displayText, utils.ui.Thumbnail.TEXT_CLASS);



    this.mouseoverCallbacks_ = [];
    this.mouseoutCallbacks_ = [];



    this._hoverCloneParent = document.body;
    this.resetHoverClone_();
    
}
goog.exportSymbol('utils.ui.Thumbnail', utils.ui.Thumbnail);




utils.ui.Thumbnail.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('utils-ui-thumbnail');
utils.ui.Thumbnail.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, '');
utils.ui.Thumbnail.IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'image');
utils.ui.Thumbnail.TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'displaytext');
utils.ui.Thumbnail.SELECTED_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'selected');
utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'mouseover');
utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.IMAGE_CLASS, 'mouseover');
utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.TEXT_CLASS, 'mouseover');
utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'highlight');
utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'active');
utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.IMAGE_CLASS, 'active');
utils.ui.Thumbnail.TEXT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.TEXT_CLASS, 'active');
utils.ui.Thumbnail.HOVER_CLONE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.TEXT_CLASS, 'hoverclone');





/**
 * @type {?Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype._element = null;



/**
 * @type {Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype._hoverCloneParent = null;



/**
 * @type {?Image}
 * @protected
 */	
utils.ui.Thumbnail.prototype._image = null;



/**
 * @type {?Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype._displayText = null;



/**
 * @type {?Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype._hoverClone = null;


/**
* @type {Array.<function>}
* @private
*/
utils.ui.Thumbnail.prototype.mouseoverCallbacks_ = null;



/**
* @type {Array.<function>}
* @private
*/
utils.ui.Thumbnail.prototype.mouseoutCallbacks_ = null;



/**
* @type {boolean}
* @private
*/
utils.ui.Thumbnail.prototype.isActive_ = false;



/**
* @return {boolean}
*/
utils.ui.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}



/**
 * @param {!String}
 * @protected
 */	
utils.ui.Thumbnail.prototype.setImage = function(url){
    this._image.src = url;
    this.resetHoverClone_();
};



/**
 * @param {!String}
 * @protected
 */	
utils.ui.Thumbnail.prototype.setDisplayText = function(text){
    this._displayText.innerHTML = text;
    this.resetHoverClone_();
};



/**
 * @protected
 */	
utils.ui.Thumbnail.prototype.update = function(){
    this.resetHoverClone_();
};



/**
 * @type {!Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype.setHoverCloneParent = function(parent){
    this._hoverCloneParent = parent;
    this._hoverCloneParent.appendChild(this._hoverClone);
};



/**
 * @type {!function}
 * @protected
 */	
utils.ui.Thumbnail.prototype.imageOnload = function(callback){
    this._image.onload = callback;
};



/**
* @param {!function}
* @private
*/
utils.ui.Thumbnail.prototype.addMouseoverCallback = function(callback) {
    this.mouseoverCallbacks_.push(callback);
}




/**
* @param {!function}
* @private
*/
utils.ui.Thumbnail.prototype.addMouseoutCallback = function(callback) {
    this.mouseoutCallbacks_.push(callback);
}



/**
* @private
*/
utils.ui.Thumbnail.prototype.resetHoverClone_ = function() {

    var that = this;
    
    if (this._hoverClone !== null){
	//console.log(this._hoverClone);
	var newChildren = goog.dom.getChildren(this._element);
	var prevChildren = goog.dom.getChildren(this._hoverClone);
	goog.dom.removeChildren(this._hoverClone);
	goog.array.forEach(newChildren, function(child){
	    that._hoverClone.appendChild(child.cloneNode(true));
	})
	//console.log("CLASS", );
	this._hoverClone.setAttribute('class', goog.dom.getElement(this._hoverClone.getAttribute('thumbnailid')).getAttribute('class'));

    } else {

	//
	// Set Hover Clone
	//
	this._hoverClone = this._element.cloneNode(true);
	this._hoverClone.style.visibility = 'hidden';
	this.setHoverListeners(true, this._hoverClone);
	this._hoverClone.setAttribute('thumbnailid', that._element.id);
	this._hoverClone.id = 'HOVERCLONE_' + this._hoverClone.id;
	goog.dom.classes.add(this._hoverClone, utils.ui.Thumbnail.HOVER_CLONE_CLASS);
    }

    //
    // Add the .thumbnailid property for retrieval of original
    // thumbnail (drag and drop)
    //
    goog.array.forEach(this._hoverClone.childNodes, function(node){
	node.setAttribute('thumbnailid', that._element.id);
    })


    this.setHoverCloneParent(this._hoverCloneParent);
}




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS for style changes.
 *
 * @param {boolean, boolean=} active Active state, opt_highlight_bg 
 * whether or not to highlight the background (false if it pertains
 * to thumbnails that have been dropped in a viewer).
 */
utils.ui.Thumbnail.prototype.setActive = function(active, opt_highlight_bg) {

    //utils.dom.debug("setActive", active, opt_highlight_bg);
    var that = this
    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlight_bg !== false) { goog.dom.classes.add(that._element, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS); }
	goog.dom.classes.add(that._element, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.add(that._displayText, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.add(that._image, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);		
	
    } else {
	goog.dom.classes.remove(that._element, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS);
	goog.dom.classes.remove(that._element, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);			
	goog.dom.classes.remove(that._displayText, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.remove(that._image, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);
    }
}



/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @type {function(boolean)}
 * @private
 */
utils.ui.Thumbnail.prototype.setHovered = function(hovered) {

    var that = this;
    if (hovered){
	if (this._hoverClone.style.visibility != 'visible') {

	    //
	    // We get the absolute position of the thumbnail._element
	    // if the _hoverClone parent is NOT the thumbnail._element (i.e. the document body).
	    //
	    var thumbnailDims = {};
	    if (this._hoverClone.parentNode !== this._element){
		thumbnailDims = utils.style.absolutePosition(this._element);
		
	    } else {
		//console.log(this._element.style.opacity);
		//console.log(this._element.style.zIndex);
		this._element.style.visibility = 'hidden';
		thumbnailDims['left'] = 0;
		thumbnailDims['top'] = 0;
	    }
	    var imgClone = goog.dom.getElementByClass(utils.ui.Thumbnail.IMAGE_CLASS, this._hoverClone)
	    var textClone = goog.dom.getElementByClass(utils.ui.Thumbnail.TEXT_CLASS, this._hoverClone);
	    var cloneWidth = 0;

	    goog.dom.classes.add(that._hoverClone, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	    goog.dom.classes.add(that._hoverClone.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	    goog.dom.classes.add(that._hoverClone.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);

	    this._hoverClone.style.visibility = 'visible';
	    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;

	    //
	    // Set the clone width to something wider than the original thumbnail width
	    // only if the the cloneWidth is calculated to be larger (text spillover)
	    cloneWidth = (cloneWidth > this._element.clientWidth) ? cloneWidth : this._element.clientWidth;
	    
	    utils.style.setStyle(this._hoverClone, {
		'position': 'absolute',
		'top': thumbnailDims['top'], 
		'left': thumbnailDims['left'],
		'width':  cloneWidth,
		'opacity': 1,
		//'z-index': 10000,
	    });
	}

	goog.array.forEach(that.mouseoverCallbacks_, function(callback){
	    callback(that);
	})

    } else {
	if (this._hoverClone){
	    this._hoverClone.style.visibility = 'hidden';
	    this._element.style.visibility = 'visible';
	}

	if (this.mouseoutCallbacks_ !== null) {
	    goog.array.forEach(this.mouseoutCallbacks_, function(callback){
		callback(that);
	    })
	}
    }
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 *
 * @type {function(boolean, Element=)}
 * @private
 */
utils.ui.Thumbnail.prototype.setHoverListeners = function(set, opt_hoverable) {
    var that = this;
    var mouseover = function() { that.setHovered(true) };
    var mouseout = function() { that.setHovered(false) };
    var hoverable = opt_hoverable ? opt_hoverable : this._element


    
    if (set) {

	goog.events.listen(hoverable, goog.events.EventType.MOUSEOVER, mouseover);
	goog.events.listen(hoverable, goog.events.EventType.MOUSEOUT, mouseout);
	
    } else {

	goog.events.unlisten(hoverable, goog.events.EventType.MOUSEOVER, mouseover);
	goog.events.unlisten(hoverable, goog.events.EventType.MOUSEOUT, mouseout);

    }
}




/**
 * 
 */
utils.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this._element) {
	utils.style.setStyle(this._element, opt_args);
    }
}
