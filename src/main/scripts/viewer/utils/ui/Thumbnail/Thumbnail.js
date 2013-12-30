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
    this._element.setAttribute('thumbnailid', this._element.getAttribute('id'));


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
utils.ui.Thumbnail.HOVER_CLONE_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'hoverclone');





/**
 * @type {?Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype._element = null;




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
utils.ui.Thumbnail.prototype._hoverable = null;


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
    goog.dom.classes.set(this._image, utils.ui.Thumbnail.IMAGE_CLASS);
};




/**
 * @param {!function} callback
 * @public
 */	
utils.ui.Thumbnail.prototype.setOnClick = function(callback){  
    goog.events.listen(this.getHoverNode(), goog.events.EventType.CLICK, callback);
};


/**
 * @return {!Element}
 * @protected
 */	
utils.ui.Thumbnail.prototype.getHoverNode = function(){  
    return this._hoverable ? this._hoverable : this._element
};





/**
 * @param {!String}
 * @protected
 */	
utils.ui.Thumbnail.prototype.setDisplayText = function(text){
    this._displayText.innerHTML = text;
};



/**
 * @protected
 */	
utils.ui.Thumbnail.prototype.update = function(){

};



/**
 * @type {!function}
 * @protected
 */	
utils.ui.Thumbnail.prototype._setImageOnload = function(callback){
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
 * @return {Element}
 * @public
 */	
utils.ui.Thumbnail.prototype.getHoverable = function(){
    return this._hoverable;
}




/**
 * @param {Element=} opt_parent The hover element's parent.
 * @param {Element=} opt_element The hover element to set in case the cloned thumbnail is not desired.
 * @public
 */	
utils.ui.Thumbnail.prototype.removeHoverable = function(opt_parent, opt_element){
    if (this._hoverable) {
	if (this._hoverable.parentNode){
	    this._hoverable = this._hoverable.parentNode.removeChild(this._hoverable);
	}
	delete this._hoverable
	this._hoverable = null;
    }
}




/**
 * @param {Element=} opt_parent The hover element's parent.
 * @param {Element=} opt_element The hover element to set in case the cloned thumbnail is not desired.
 * @public
 */	
utils.ui.Thumbnail.prototype.createHoverable = function(opt_parent, opt_element){

    this.removeHoverable();
    this.setHoverListeners_(false);
    this._hoverable = (opt_element) ? opt_element : this._element.cloneNode(true);

    this._hoverable.setAttribute('id', 'HOVERABLE_' + this._element.getAttribute('id'));
    this._hoverable.setAttribute('thumbnailid', this._element.getAttribute('id'));
    this._hoverable.style.visibility = 'hidden';
    goog.dom.classes.add(this._hoverable, utils.ui.Thumbnail.HOVER_CLONE_CLASS);
    this.setHoverListeners_(true);
    if (opt_parent){ opt_parent.appendChild(this._hoverable) }
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

    
    var hoverNode = this.getHoverNode();
    
    //------------------
    // Apply classes.
    //------------------
    goog.dom.classes.add(hoverNode, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
    goog.dom.classes.add(hoverNode.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
    goog.dom.classes.add(hoverNode.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);


    if (hoverNode.style.visibility !== 'visible') {

	// We get the absolute position of the thumbnail._element
	// if the _hoverable parent is NOT the thumbnail._element (i.e. the document body).
	var thumbnailDims = utils.style.absolutePosition(this._element);
	var imgClone = goog.dom.getElementByClass(utils.ui.Thumbnail.IMAGE_CLASS, hoverNode)
	var textClone = goog.dom.getElementByClass(utils.ui.Thumbnail.TEXT_CLASS, hoverNode);
	var cloneWidth = 0;


	// Adjust only if the _hover clone is not the _element.
	if (hoverNode !== this._element) {
	    // Set the clone width to something wider than the original thumbnail width
	    // only if the the cloneWidth is calculated to be larger (text spillover)
	    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
	    cloneWidth = (cloneWidth > this._element.clientWidth) ? cloneWidth : this._element.clientWidth;
	    utils.style.setStyle(hoverNode, {
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

    var hoverNode = this.getHoverNode();

    if (hoverNode) { 
	hoverNode.style.visibility = 'hidden';
	goog.dom.classes.remove(hoverNode, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	goog.dom.classes.remove(hoverNode.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	goog.dom.classes.remove(hoverNode.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);
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
 * @private
 */
utils.ui.Thumbnail.prototype.setHoverListeners_ = function(set) {

    var hoverNode = this.getHoverNode();
    if (set) {
	goog.events.listen(hoverNode, goog.events.EventType.MOUSEOVER, this._onMouseOver.bind(this));
	goog.events.listen(hoverNode, goog.events.EventType.MOUSEOUT, this._onMouseOut.bind(this));
	
    } else {
	goog.events.unlisten(hoverNode, goog.events.EventType.MOUSEOVER, this._onMouseOver.bind(this));
	goog.events.unlisten(hoverNode, goog.events.EventType.MOUSEOUT, this._onMouseOut.bind(this));
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
