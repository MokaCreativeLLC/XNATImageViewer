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
    // Set Styles
    //------------------
    goog.dom.classes.set(this._element, utils.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this._image, utils.ui.Thumbnail.IMAGE_CLASS);
    goog.dom.classes.set(this._displayText, utils.ui.Thumbnail.TEXT_CLASS);



    //------------------
    // Reset callbacks.
    //------------------
    this.mouseoverCallbacks_ = [];
    this.mouseoutCallbacks_ = [];



    //------------------
    // Set Hover Methods
    //------------------
    this._hoverCloneParent = document.body;
    this.resetHoverClone_();



    //------------------
    // Set Hover Methods
    //------------------
    this.setHoverListeners_(true);



    //------------------
    // Call defaults
    //------------------
    this._onMouseOut();
    
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
 * @type {!Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype.setHoverCloneParent = function(parent){

    //------------------
    // If the hover clone parent isn't the element
    //------------------
    if (parent !== this._element) {
	this._hoverCloneParent = parent;
	this._hoverCloneParent.appendChild(this._hoverClone);



    //------------------
    // If the hover clone is the element, we basically 
    // set the hover clone to the element.
    //------------------	
    } else {
	if ((this._hoverClone !== this._element) && (parent === this._element)) {

	    console.log("COVER AS PARENT");
	    this._hoverCloneParent = parent;
	    goog.dom.removeNode(this._hoverClone);
	    delete this._hoverClone;
	    this._hoverClone = this._element;
	    this.resetHoverClone_();
	}
    }
};



/**
* @private
*/
utils.ui.Thumbnail.prototype.resetHoverClone_ = function() {

    var that = this;


    //------------------
    // Update the existing hover clone if it exists.
    //------------------    
    if ((this._hoverClone !== null) && (this._hoverClone !== this._element)){
	var newChildren = goog.dom.getChildren(this._element);
	var prevChildren = goog.dom.getChildren(this._hoverClone);
	goog.dom.removeChildren(this._hoverClone);
	goog.array.forEach(newChildren, function(child){
	    that._hoverClone.appendChild(child.cloneNode(true));
	})
	this._hoverClone.setAttribute('class', goog.dom.getElement(this._hoverClone.getAttribute('thumbnailid')).getAttribute('class'));
    } 



    //------------------
    // Create a new hover clone only if it doesn't exist or
    // it's not equal to _element.
    //------------------
    else if (this._hoverClone !== this._element){
	this._hoverClone = this._element.cloneNode(true);
	this._hoverClone.style.visibility = 'hidden';
	this.setHoverListeners_(true, this._hoverClone);
	this._hoverClone.id = 'HOVERCLONE_' + this._hoverClone.id;
	goog.dom.classes.add(this._hoverClone, utils.ui.Thumbnail.HOVER_CLONE_CLASS);
    }



    //------------------
    // Add the .thumbnailid property for retrieval of original
    // thumbnail (drag and drop)
    //------------------
    this._hoverClone.setAttribute('thumbnailid', that._element.id);
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
 * @private
 */
utils.ui.Thumbnail.prototype._onMouseOver = function() {

    //------------------
    // Apply classes.
    //------------------
    goog.dom.classes.add(this._hoverClone, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
    goog.dom.classes.add(this._hoverClone.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
    goog.dom.classes.add(this._hoverClone.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);


    if (this._hoverClone.style.visibility !== 'visible') {

	// We get the absolute position of the thumbnail._element
	// if the _hoverClone parent is NOT the thumbnail._element (i.e. the document body).
	var thumbnailDims = utils.style.absolutePosition(this._element);
	var imgClone = goog.dom.getElementByClass(utils.ui.Thumbnail.IMAGE_CLASS, this._hoverClone)
	var textClone = goog.dom.getElementByClass(utils.ui.Thumbnail.TEXT_CLASS, this._hoverClone);
	var cloneWidth = 0;


	// Adjust only if the _hover clone is not the _element.
	if (this._hoverClone !== this._element) {
	    // Set the clone width to something wider than the original thumbnail width
	    // only if the the cloneWidth is calculated to be larger (text spillover)
	    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
	    cloneWidth = (cloneWidth > this._element.clientWidth) ? cloneWidth : this._element.clientWidth;
	    utils.style.setStyle(this._hoverClone, {
		'position': 'absolute',
		'top': thumbnailDims['top'], 
		'left': thumbnailDims['left'],
		'width':  cloneWidth,
		'visibility': 'visible'
	    });
	}
    }


    //------------------
    // Run callbacks.
    //------------------
    if (this.mouseverCallbacks_ !== null) {
	goog.array.forEach(this.mouseoverCallbacks_, function(callback){ callback(this)});
    }
}


/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @private
 */
utils.ui.Thumbnail.prototype._onMouseOut = function() {

    if (this._hoverClone) { 
	this._hoverClone.style.visibility = 'hidden';
	goog.dom.classes.remove(this._hoverClone, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	goog.dom.classes.remove(this._hoverClone.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	goog.dom.classes.remove(this._hoverClone.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);
	this._element.style.visibility = 'visible';
    }

    if (this.mouseoutCallbacks_ !== null) {
	goog.array.forEach(this.mouseoutCallbacks_, function(callback){ callback(this)});
    }
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 *
 * @param {boolean} set Whether to apply the event listener or remove it.
 * @param {Element=} opt_hoverable The hoverable to apply the even listener to.
 * @private
 */
utils.ui.Thumbnail.prototype.setHoverListeners_ = function(set, opt_hoverable) {
    var that = this;
    var hoverable = opt_hoverable ? opt_hoverable : this._element


    if (set) {
	goog.events.listen(hoverable, goog.events.EventType.MOUSEOVER, this._onMouseOver.bind(this));
	goog.events.listen(hoverable, goog.events.EventType.MOUSEOUT, this._onMouseOut.bind(this));
	
    } else {
	goog.events.unlisten(hoverable, goog.events.EventType.MOUSEOVER, this._onMouseOver.bind(this));
	goog.events.unlisten(hoverable, goog.events.EventType.MOUSEOUT, this._onMouseOut.bind(this));
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
