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
 * utils.ui.Thumbnail is the a generic class for creating thumbnails.
 *
 * @constructor
 * @param {Object=} opt_args The arguments to define the Thubnail.
 */
goog.provide('utils.ui.Thumbnail');
utils.ui.Thumbnail = function (opt_args) {

    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;


    /**
     * @type {!Element}
     * @private
     */	
    this.element_ = utils.dom.makeElement('div', parent, "utils.ui.Thumbnail");
    this.element_.setAttribute('thumbnailid', this.element_.getAttribute('id'));


    /**
     * @type {!Image}
     * @private
     */	
    this.image_ = new Image();
    this.element_.appendChild(this.image_)



    /**
     * @type {!Element}
     * @private
     */	
    this.text_ = utils.dom.makeElement("div", this.element_, "DisplayText");



    /**
     * @type {?Element}
     * @private
     */	
    this.hoverable_ = null;


    /**
     * @type {!Array.<function>}
     * @private
     */
    this.onMouseOver_ = [];



    /**
     * @type {!Array.<function>}
     * @private
     */
    this.onMouseOut_ = [];



    /**
     * @type {boolean}
     * @private
     */
    this.isActive_ = false;



    //------------------
    // Set Styles
    //------------------
    goog.dom.classes.set(this.element_, utils.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this.image_, utils.ui.Thumbnail.IMAGECLASS);
    goog.dom.classes.set(this.text_, utils.ui.Thumbnail.TEXT_CLASS);


    //------------------
    // Set Hover Methods
    //------------------
    this.setHoverListeners_(true);



    //------------------
    // Call defaults
    //------------------
    this.mouseOut_();
    
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
 * @return {Element} The thumbnail div (the entire element).
 * @public
 */
utils.ui.Thumbnail.prototype.__defineGetter__('element', function() {
    return this.element_;	
})




/**
 * @return {Element} The thumbnail image.
 * @public
 */
utils.ui.Thumbnail.prototype.__defineGetter__('image', function() {
    return this.image_;	
})




/**
 * @return {Element} The thumbnail text.
 * @public
 */
utils.ui.Thumbnail.prototype.__defineGetter__('text', function() {
    return this.text_;	
})



/**
 * @return {Element} The thumbnail text.
 * @public
 */
utils.ui.Thumbnail.prototype.__defineGetter__('hoverNode', function() {
    return this.hoverable_ ? this.hoverable_ : this.element_;	
})




/**
 * @return {boolean} The 'active' state of the thumbnail (this is defined and set by the user).
 * @public
 */
utils.ui.Thumbnail.prototype.__defineGetter__('isActive', function() {
    return this.isActive_;	
})



/**
 * @param {!function} callback The callback for the specified event.
 * @public
 */	
utils.ui.Thumbnail.prototype.__defineSetter__('onClick', function(callback) {
    goog.events.listen(this.hoverNode, goog.events.EventType.CLICK, callback);	
})




/**
* @param {!function} callback The callback for the specified event.
* @private
*/
utils.ui.Thumbnail.prototype.__defineSetter__('onMouseOver' , function(callback) {
    //window.console.log("Thumbnail on mouse over:", callback);
    this.onMouseOver_.push(callback);
})




/**
* @param {!function} callback The callback for the specified event.
* @private
*/
utils.ui.Thumbnail.prototype.__defineSetter__('onMouseOut' , function(callback) {
    this.onMouseOut_.push(callback);
})




/**
 * @param {!String} url The image src.
 * @public
 */	
utils.ui.Thumbnail.prototype.setImage = function(url){
    this.image_.src = url;
    goog.dom.classes.set(this.image_, utils.ui.Thumbnail.IMAGE_CLASS);
};




/**
 * @param {!String}
 * @public
 */	
utils.ui.Thumbnail.prototype.setText = function(text){
    this.text_.innerHTML = text;
};




/**
 * @param {Element=} opt_parent The hover element's parent.
 * @param {Element=} optelement_ The hover element to set in case the cloned thumbnail is not desired.
 * @public
 */	
utils.ui.Thumbnail.prototype.removeHoverable = function(opt_parent, opt_element){
    if (this.hoverable_) {
	if (this.hoverable_.parentNode){
	    this.hoverable_ = this.hoverable_.parentNode.removeChild(this.hoverable_);
	}
	delete this.hoverable_
	this.hoverable_ = null;
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
    this.hoverable_ = (opt_element) ? opt_element : this.element_.cloneNode(true);

    this.hoverable_.setAttribute('id', 'HOVERABLE' + this.element_.getAttribute('id'));
    this.hoverable_.setAttribute('thumbnailid', this.element_.getAttribute('id'));
    this.hoverable_.style.visibility = 'hidden';
    goog.dom.classes.add(this.hoverable_, utils.ui.Thumbnail.HOVER_CLONE_CLASS);
    this.setHoverListeners_(true);
    if (opt_parent){ opt_parent.appendChild(this.hoverable_) }
}    




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS for style changes.
 *
 * @param {boolean, boolean=} active Active state, opt_highlight_bg 
 * whether or not to highlight the background (false if it pertains
 * to thumbnails that have been dropped in a viewer).
 * @public
 */
utils.ui.Thumbnail.prototype.setActive = function(active, opt_highlight_bg) {

    //utils.dom.debug("setActive", active, opt_highlight_bg);

    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlight_bg !== false) { goog.dom.classes.add(this.element_, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS); }
	goog.dom.classes.add(this.element_, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.add(this.text_, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.add(this.image_, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);		
	
    } else {
	goog.dom.classes.remove(this.element_, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS);
	goog.dom.classes.remove(this.element_, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);			
	goog.dom.classes.remove(this.text_, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.remove(this.image_, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);
    }
}




/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @private
 */
utils.ui.Thumbnail.prototype.mouseOver_ = function() {

    
    var hoverNode = this.hoverNode;
    
    //------------------
    // Apply classes.
    //------------------
    goog.dom.classes.add(hoverNode, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
    goog.dom.classes.add(hoverNode.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
    goog.dom.classes.add(hoverNode.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);


    if (hoverNode.style.visibility !== 'visible') {

	//
	// Find the common ancestor
	//
	var commonAncestor = goog.dom.findCommonAncestor(this.element_, hoverNode);
	var thumbnailDims = utils.style.getPositionRelativeToAncestor(this.element_, commonAncestor);
	var imgClone = goog.dom.getElementByClass(utils.ui.Thumbnail.IMAGE_CLASS, hoverNode)
	var textClone = goog.dom.getElementByClass(utils.ui.Thumbnail.TEXT_CLASS, hoverNode);
	var cloneWidth = 0;


	// Adjust only if the _hover clone is not the element_.
	if (hoverNode !== this.element_) {
	    // Set the clone width to something wider than the original thumbnail width
	    // only if the the cloneWidth is calculated to be larger (text spillover)
	    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
	    cloneWidth = (cloneWidth > this.element_.clientWidth) ? cloneWidth : this.element_.clientWidth;
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
    //window.console.log("MOSUE OVER", this.onMouseOver_);
    goog.array.forEach(this.onMouseOver_, function(callback){ 

	//window.console.log('callback', callback);
	if (callback) {
	    callback(this)
	}
    }.bind(this));
    
}


/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @private
 */
utils.ui.Thumbnail.prototype.mouseOut_ = function() {

    var hoverNode = this.hoverNode;

    if (hoverNode) { 
	hoverNode.style.visibility = 'hidden';
	goog.dom.classes.remove(hoverNode, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	goog.dom.classes.remove(hoverNode.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	goog.dom.classes.remove(hoverNode.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);
	this.element_.style.visibility = 'visible';
    }

 
    goog.array.forEach(this.onMouseOut_, function(callback){ 
	//window.console.log('callback', callback);
	callback(this)
    }.bind(this));
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 *
 * @param {boolean} set Whether to apply the event listener or remove it.
 * @private
 */
utils.ui.Thumbnail.prototype.setHoverListeners_ = function(set) {

    var hoverNode = this.hoverNode;
    if (set) {
	goog.events.listen(hoverNode, goog.events.EventType.MOUSEOVER, this.mouseOver_.bind(this));
	goog.events.listen(hoverNode, goog.events.EventType.MOUSEOUT, this.mouseOut_.bind(this));
	
    } else {
	goog.events.unlisten(hoverNode, goog.events.EventType.MOUSEOVER, this.mouseOver_.bind(this));
	goog.events.unlisten(hoverNode, goog.events.EventType.MOUSEOUT, this.mouseOut_.bind(this));
    }
}




/**
 * @public
 */
utils.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element_) {
	utils.style.setStyle(this.element_, opt_args);
    }
}



goog.exportSymbol('utils.ui.Thumbnail.prototype.setImage', utils.ui.Thumbnail.prototype.setImage);
goog.exportSymbol('utils.ui.Thumbnail.prototype.setText', utils.ui.Thumbnail.prototype.setText);
goog.exportSymbol('utils.ui.Thumbnail.prototype.removeHoverable', utils.ui.Thumbnail.prototype.removeHoverable);
goog.exportSymbol('utils.ui.Thumbnail.prototype.createHoverable', utils.ui.Thumbnail.prototype.createHoverable);
goog.exportSymbol('utils.ui.Thumbnail.prototype.setActive', utils.ui.Thumbnail.prototype.setActive);
goog.exportSymbol('utils.ui.Thumbnail.prototype.updateStyle', utils.ui.Thumbnail.prototype.updateStyle);
