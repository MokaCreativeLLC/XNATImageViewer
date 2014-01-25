/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.events');



/**
 * utils.ui.Thumbnail is a ui class for creating thumbnails.  Thumbnails
 * have two element compontents: an image and text, both of which are encapsulated
 * by a main "element".  Both the text and image are defined by setter methods.
 *
 * @constructor
 */
goog.provide('utils.ui.Thumbnail');
utils.ui.Thumbnail = function () {


    /**
     * @type {!Element}
     * @private
     */	
    this.element = goog.dom.createDom('div', {
	'id': 'utils.ui.Thumbnail_' + goog.string.createUniqueString()
    });
    this.element.setAttribute('thumbnailid', this.element.getAttribute('id'));


    /**
     * @type {!Image}
     * @private
     */	
    this.image_ = goog.dom.createDom('img', {
	'id' : 'utils.ui.Thumbnail_' + goog.string.createUniqueString()
    }); 
    

    /**
     * @type {!Element}
     * @private
     */	
    this.text_ = goog.dom.createDom('div', {
	'id': 'DisplayText_' + goog.string.createUniqueString()
    });



    //
    // Events
    //
    utils.events.addEventManager(this, utils.ui.Thumbnail.EventType);



    //
    // Other init functions.
    //
    this.initEvents_();
    this.setClasses_();
    this.setHoverListeners_(true);
    this.mouseOut_();


    //
    // DOM tree.
    //
    goog.dom.append(this.element, this.image_);
    goog.dom.append(this.element, this.text_);
    
}
goog.exportSymbol('utils.ui.Thumbnail', utils.ui.Thumbnail);




/**
 * Event types.
 * @enum {string}
 */
utils.ui.Thumbnail.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  CLICK: goog.events.getUniqueId('click'),
};




/**
 * @type {?Element}
 * @private
 */	
utils.ui.Thumbnail.prototype.hoverable_ = null;



/**
 * @type {!boolean}
 * @private
 */
utils.ui.Thumbnail.prototype.isActive_ = false;




/**
 * @return {!Element} The thumbnail div (the entire element).
 * @public
 */
utils.ui.Thumbnail.prototype.getElement = function() {
    return this.element;	
}




/**
 * @return {!Element} The thumbnail image.
 * @public
 */
utils.ui.Thumbnail.prototype.getImage = function() {
    return this.image_;	
}




/**
 * @return {!Element} The thumbnail text.
 * @public
 */
utils.ui.Thumbnail.prototype.getText = function() {
    return this.text_;	
}



/**
 * @return {!Element} The thumbnail text.
 * @public
 */
utils.ui.Thumbnail.prototype.getHoverable = function() {
    this.hoverable_ = this.hoverable_ ? this.hoverable_ : this.element;	
    return this.hoverable_
}




/**
 * @return {boolean} The 'active' state of the thumbnail (this is defined and set by the user).
 * @public
 */
utils.ui.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}




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


    this.hoverable_ = (opt_element) ? opt_element : this.element.cloneNode(true);
    this.hoverable_.setAttribute('id', 'HOVERABLE' + this.element.getAttribute('id'));
    this.hoverable_.setAttribute('thumbnailid', this.element.getAttribute('id'));
    this.hoverable_.style.visibility = 'hidden';
    goog.dom.classes.add(this.hoverable_, utils.ui.Thumbnail.HOVER_CLONE_CLASS);


    this.setHoverListeners_(true);
    if (opt_parent){ opt_parent.appendChild(this.hoverable_) }

    this.initEvents_();
}    




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS for style changes.
 *
 * @param {boolean} active Active state, 
 * @param {boolean=} opt_highlightBg Whether or not to highlight the 
 * background. Defaults to false.
 * @public
 */
utils.ui.Thumbnail.prototype.setActive = function(active, opt_highlightBg) {

    //utils.dom.debug("setActive", active, opt_highlightBg);

    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlightBg) { 
	    goog.dom.classes.add(this.element, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS); 
	}
	goog.dom.classes.add(this.element, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.add(this.text_, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.add(this.image_, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);		
	
    } else {
	goog.dom.classes.remove(this.element, utils.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS);
	goog.dom.classes.remove(this.element, utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);			
	goog.dom.classes.remove(this.text_, utils.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.remove(this.image_, utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS);
    }
}




/**
 * Generic style update method.
 * @private {Object=}
 * @public
 */
utils.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element) {
	utils.style.setStyle(this.element, opt_args);
    }
}




/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @private
 */
utils.ui.Thumbnail.prototype.mouseOver_ = function() {

    // an ugly, but necessary way of 
    // getting the hover node.
    var hoverNode = this.getHoverable();



    //------------------
    // Apply classes.
    //------------------
    goog.dom.classes.add(hoverNode, utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
    goog.dom.classes.add(hoverNode.childNodes[1], utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
    goog.dom.classes.add(hoverNode.childNodes[0], utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);



    if (hoverNode.style.visibility !== 'visible') {
	this.repositionHoverable();
    }


    //------------------
    // Run callbacks.
    //------------------
    this['EVENTS'].runEvent('MOUSEOVER');
}




/**
 * Applies the classes to the various objects when the mouse
 * hovers over the utils.ui.Thumbnail.
 *
 * @private
 */
utils.ui.Thumbnail.prototype.mouseOut_ = function() {

    // an ugly, but necessary way of 
    // getting the hover node.
    var hoverNode = this.getHoverable();
    window.console.log(hoverNode);

    if (hoverNode && hoverNode.childNodes.length > 1) { 
	hoverNode.style.visibility = 'hidden';
	goog.dom.classes.remove(hoverNode, 
				utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	goog.dom.classes.remove(hoverNode.childNodes[1], 
				utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	goog.dom.classes.remove(hoverNode.childNodes[0], 
				utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);
	this.element.style.visibility = 'visible';
    }
 
    this['EVENTS'].runEvent('MOUSEOUT');
}




/**
 * Repositions the hoverable relative to the
 * element.
 */
utils.ui.Thumbnail.prototype.repositionHoverable = function(){

    var hoverNode = this.getHoverable();


    //
    // Find the common ancestor
    //
    var commonAncestor = goog.dom.findCommonAncestor(this.element, hoverNode);
    var thumbnailDims = utils.style.getPositionRelativeToAncestor(this.element, commonAncestor);
    var imgClone = goog.dom.getElementByClass(utils.ui.Thumbnail.IMAGE_CLASS, hoverNode)
    var textClone = goog.dom.getElementByClass(utils.ui.Thumbnail.TEXT_CLASS, hoverNode);
    var cloneWidth = 0;
    
    //
    // Adjust only if the _hover clone is not the element.
    //
    if (hoverNode !== this.element) {
	// Set the clone width to something wider than the original thumbnail width
	// only if the the cloneWidth is calculated to be larger (text spillover)
	cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
	cloneWidth = (cloneWidth > this.element.clientWidth) ? cloneWidth : this.element.clientWidth;
	utils.style.setStyle(hoverNode, {
	    'position': 'absolute',
	    'top': thumbnailDims['top'], 
	    'left': thumbnailDims['left'],
	    'width':  cloneWidth,
	    'visibility': 'visible'
	});
    }
}





/**
 * Sets the listener events for when the thumbnail is hovered on.
 *
 * @param {boolean=} set Whether to apply the event listener or remove it.
 * @private
 */
utils.ui.Thumbnail.prototype.setHoverListeners_ = function(set) {

    // an ugly, but necessary way of 
    // getting the hover node.
    var hoverNode = this.getHoverable();

    if (set) {
	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOVER, 
			   this.mouseOver_.bind(this));

	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOUT, 
			   this.mouseOut_.bind(this));
	
    } else {
	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOVER, 
			     this.mouseOver_.bind(this));

	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOUT, 
			     this.mouseOut_.bind(this));
    }
}




/**
 * @private
 */	
utils.ui.Thumbnail.prototype.initEvents_ = function() {
    this['EVENTS'].clearEvent('CLICK');
    goog.events.listen(this.getHoverable(), goog.events.EventType.CLICK, function(){
	this['EVENTS'].runEvent('CLICK');
    }.bind(this));	   
}




/**
 * @private
 */
utils.ui.Thumbnail.prototype.setClasses_ = function() {
    goog.dom.classes.set(this.element, utils.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this.image_, utils.ui.Thumbnail.IMAGECLASS);
    goog.dom.classes.set(this.text_, utils.ui.Thumbnail.TEXT_CLASS);
}




utils.ui.Thumbnail.CSS_CLASS_PREFIX = /**@type {string} @expose @const*/ goog.getCssName('utils-ui-thumbnail');
utils.ui.Thumbnail.ELEMENT_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, '');
utils.ui.Thumbnail.IMAGE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'image');
utils.ui.Thumbnail.TEXT_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'displaytext');
utils.ui.Thumbnail.SELECTED_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.CSS_CLASS_PREFIX, 'selected');
utils.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'mouseover');
utils.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.IMAGE_CLASS, 'mouseover');
utils.ui.Thumbnail.TEXT_MOUSEOVER_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.TEXT_CLASS, 'mouseover');
utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'highlight');
utils.ui.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'active');
utils.ui.Thumbnail.IMAGE_ACTIVE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.IMAGE_CLASS, 'active');
utils.ui.Thumbnail.TEXT_ACTIVE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.TEXT_CLASS, 'active');
utils.ui.Thumbnail.HOVER_CLONE_CLASS = /**@type {string} @expose @const*/ goog.getCssName(utils.ui.Thumbnail.ELEMENT_CLASS, 'hoverclone');
