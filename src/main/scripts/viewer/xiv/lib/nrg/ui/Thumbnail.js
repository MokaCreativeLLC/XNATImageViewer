/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');

// nrg
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.ui.Component');




/**
 * nrg.ui.Thumbnail is a ui class for creating thumbnails.  Thumbnails
 * have two element compontents: an image and text, both of which are 
 * encapsulated  by a main "element".  Both the text and image are defined by 
 * setter methods.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('nrg.ui.Thumbnail');
nrg.ui.Thumbnail = function () {
    goog.base(this);

    /**
     * @type {!Image}
     * @private
     */	
    this.image_ = goog.dom.createDom('img', {
	'id' : 'nrg.ui.Thumbnail_' + goog.string.createUniqueString()
    }); 
    goog.dom.append(this.getElement(), this.image_);


    /**
     * @type {!Element}
     * @private
     */	
    this.text_ = goog.dom.createDom('div', {
	'id': 'DisplayText_' + goog.string.createUniqueString()
    });
    goog.dom.append(this.getElement(), this.text_);


    // Other init functions.
    //window.console.log(this);
    this.setEvents_();
    this.setClasses_();
    this.setHoverListeners_(true);
    this.onMouseOut();    
}
goog.inherits(nrg.ui.Thumbnail, nrg.ui.Component);
goog.exportSymbol('nrg.ui.Thumbnail', nrg.ui.Thumbnail);




/**
 * Event types.
 * @enum {string}
 */
nrg.ui.Thumbnail.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  CLICK: goog.events.getUniqueId('click'),
};



/**
 * @type {!string} 
 * @expose
 * @const
 */
nrg.ui.Thumbnail.ID_PREFIX = 'nrg.ui.Thumbnail';



/**
 * @enum {string}
 * @const
 */ 
nrg.ui.Thumbnail.CSS_SUFFIX = {
    IMAGE: 'image',
    TEXT: 'text',
    SELECTED: 'selected',
    MOUSEOVER: 'mouseover',
    IMAGE_MOUSEOVER: 'image-mouseover',
    TEXT_MOUSEOVER: 'text-mouseover',
    HIGHLIGHT: 'highlight',
    ACTIVE: 'active',
    IMAGE_ACTIVE: 'image-active',
    TEXT_ACTIVE: 'text-active',
    HOVERCLONE: 'hoverclone'
}



/**
 * @type {!string} 
 * @const
 */
nrg.ui.Thumbnail.HOVERABLE_PREFIX = 'HOVERABLE_';



/**
 * @type {?string}
 * @private
 */	
nrg.ui.Thumbnail.prototype.brokenThumbnailUrl_ = null;



/**
 * @type {?Element}
 * @private
 */	
nrg.ui.Thumbnail.prototype.hoverable_ = null;



/**
 * @type {!boolean}
 * @private
 */
nrg.ui.Thumbnail.prototype.isActive_ = false;




/**
 * Gets the image element of the thumbnail.
 * @return {!Image} The thumbnail image.
 * @public
 */
nrg.ui.Thumbnail.prototype.getImage = function() {
    return this.image_;	
}



/**
 * @return {!string} url The thumbnail image url.
 * @public
 */
nrg.ui.Thumbnail.prototype.setBrokenThumbnailUrl = function(url) {
    this.brokenThumbnailUrl_ = url;
    this.image_.onerror = function(){
	this.image_.onerror = '';
	this.image_.src = this.brokenThumbnailUrl_;
    }.bind(this);
}



/**
 * Gets the text of the thumbnail.
 * @return {!Element} The thumbnail text.
 * @public
 */
nrg.ui.Thumbnail.prototype.getTextElement = function() {
    return this.text_;	
}



/**
 * @return {!string} The first string of the thumbnail text element.
 * @public
 */
nrg.ui.Thumbnail.prototype.getText = function() {
    var currTextChild = this.text_;
    while (currTextChild.childNodes[0]){
	currTextChild = currTextChild.childNodes[0];
    }
    return currTextChild.parentNode.innerHTML;
    
}



/**
 * Gets the hoverable div of the thumbnail.
 * @return {!Element} The hoverable div.
 * @public
 */
nrg.ui.Thumbnail.prototype.getHoverable = function() {
    this.hoverable_ = this.hoverable_ ? this.hoverable_ : this.getElement();	
    return this.hoverable_
}




/**
 * @return {boolean} The 'active' state of the thumbnail (this is defined and 
 * set by the user).
 * @public
 */
nrg.ui.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}




/**
 * Sets the image src object.
 * @param {!String} url The image src.
 * @public
 */	
nrg.ui.Thumbnail.prototype.setImage = function(url){
    this.image_.src = url;
    goog.dom.classes.set(this.image_, nrg.ui.Thumbnail.CSS.IMAGE);
};




/**
 * Sets the text associated with the thumbnail.
 * @param {!String}
 * @public
 */	
nrg.ui.Thumbnail.prototype.setText = function(text){
    this.text_.innerHTML = text;
};




/**
 * Removes the hoverable div element associated with the thumbnail.
 * @public
 */	
nrg.ui.Thumbnail.prototype.removeHoverable = function(){
    if (this.hoverable_) {
	if (this.hoverable_.parentNode){
	    this.hoverable_ = this.hoverable_.parentNode.removeChild(
		this.hoverable_);
	}
	delete this.hoverable_
	this.hoverable_ = null;
    }
}




/**
 * Creates the hoverable element associated with the thumbnail.
 * @param {Element=} opt_parent The hover element's parent.
 * @param {Element=} opt_element The hover element to set in case the cloned 
 *    thumbnail is not desired.
 * @public
 */	
nrg.ui.Thumbnail.prototype.createHoverable = function(opt_parent, 
							opt_element) {

    this.removeHoverable();
    this.setHoverListeners_(false);


    this.hoverable_ = (opt_element) ? opt_element : 
	this.getElement().cloneNode(true);
    this.hoverable_.setAttribute('id', nrg.ui.Thumbnail.HOVERABLE_PREFIX + 
				 this.getElement().getAttribute('id'));
    this.hoverable_.style.visibility = 'hidden';
    goog.dom.classes.add(this.hoverable_, 
			 nrg.ui.Thumbnail.CSS.HOVERCLONE);

    this.setHoverListeners_(true);
    if (opt_parent){ opt_parent.appendChild(this.hoverable_) }

    this.setEvents_();
}    




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS class for style changes.
 * @param {boolean} active Active state, 
 * @param {boolean=} opt_highlightBg Whether or not to highlight the 
 * background. Defaults to false.
 * @public
 */
nrg.ui.Thumbnail.prototype.setActive = function(active, opt_highlightBg) {

    //nrg.dom.debug("setActive", active, opt_highlightBg);

    var elt = this.getElement()
    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlightBg) { 
	    goog.dom.classes.add(elt, 
				 nrg.ui.Thumbnail.CSS.HIGHLIGHT); 
	}
	goog.dom.classes.add(elt, 
			     nrg.ui.Thumbnail.CSS.ACTIVE);
	goog.dom.classes.add(this.text_, 
			     nrg.ui.Thumbnail.CSS.TEXT_ACTIVE);		
	goog.dom.classes.add(this.image_, 
			     nrg.ui.Thumbnail.CSS.IMAGE_ACTIVE);		
	
    } else {
	goog.dom.classes.remove(elt, 
				nrg.ui.Thumbnail.CSS.HIGHLIGHT);
	goog.dom.classes.remove(elt, 
				nrg.ui.Thumbnail.CSS.ACTIVE);
	goog.dom.classes.remove(this.text_, 
				nrg.ui.Thumbnail.CSS.TEXT_ACTIVE);		
	goog.dom.classes.remove(this.image_, 
				nrg.ui.Thumbnail.CSS.IMAGE_ACTIVE);
    }
}




/**
 * Generic style update method.
 * @private {Object=} opt_args The arguments to apply to the style.
 * @public
 */
nrg.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.getElement()) {
	nrg.style.setStyle(this.getElement(), opt_args);
    }
}



/**
 * Repositions the hoverable relative to the main element.
 * @public
 */
nrg.ui.Thumbnail.prototype.repositionHoverable = function(){

    var elt = this.getElement();
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    // Adjust only if the hover node is different from the element.
    if (hoverNode === elt) { return }


    // Find the common ancestor
    var commonAncestor = /**@type {Element}*/
    goog.dom.findCommonAncestor(elt, hoverNode);
    var thumbPos = /**@type {!goog.math.Coordinate}*/
    goog.style.getRelativePosition(elt, commonAncestor);
    
    var imgClone = /**@type {Element}*/ 
    hoverNode.getElementsByTagName('img')[0];
    var textClone = /**@type {Element}*/ 
    hoverNode.getElementsByTagName('div')[0];
    var cloneWidth = /**@type {!number}*/ 0;


    // Set the clone width to something wider than the original thumbnail 
    // width only if the the cloneWidth is calculated to be larger (text 
    // spillover)
    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
    cloneWidth = (cloneWidth > elt.clientWidth) ? cloneWidth : 
	elt.clientWidth;
    nrg.style.setStyle(hoverNode, {
	'position': 'absolute',
	'left': thumbPos.x,
	'top': thumbPos.y, 
	'width':  cloneWidth,
	'visibility': 'visible'
    });
}



/**
 * Applies the classes to the various objects when the mouse
 * hovers over the nrg.ui.Thumbnail.
 * @private
 */
nrg.ui.Thumbnail.prototype.onMouseOver = function() {
    //window.console.log("MOUSEOVER");
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    goog.dom.classes.add(hoverNode, 
			 nrg.ui.Thumbnail.CSS.MOUSEOVER);	
    goog.dom.classes.add(hoverNode.childNodes[1], 
			 nrg.ui.Thumbnail.CSS.TEXT_MOUSEOVER);		
    goog.dom.classes.add(hoverNode.childNodes[0], 
			 nrg.ui.Thumbnail.CSS.IMAGE_MOUSEOVER);
    if (hoverNode !== this.getElement()) {
	this.repositionHoverable();
    }

    this.dispatchEvent({
	type: nrg.ui.Thumbnail.EventType.MOUSEOVER
    });
}




/**
 * Applies the classes to the various objects when the mouse hovers over the 
 * nrg.ui.Thumbnail.
 * @public
 */
nrg.ui.Thumbnail.prototype.onMouseOut = function() {
    //window.console.log("MOUSEPUT");
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    if (hoverNode && hoverNode.childNodes.length > 1) { 
	
	//window.console.log("MOUSEPUT_2");
	goog.dom.classes.remove(hoverNode, 
				nrg.ui.Thumbnail.CSS.MOUSEOVER);
	goog.dom.classes.remove(hoverNode.childNodes[1], 
				nrg.ui.Thumbnail.CSS.TEXT_MOUSEOVER);
	goog.dom.classes.remove(hoverNode.childNodes[0], 
				nrg.ui.Thumbnail.CSS.IMAGE_MOUSEOVER);

	hoverNode.style.visibility = (hoverNode !== this.getElement()) ? 
	    'hidden' : 'visible';
	
    }
    this.dispatchEvent({
	type: nrg.ui.Thumbnail.EventType.MOUSEOUT
    });
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 * @param {boolean=} set Whether to apply the event listener or remove it.
 * @private
 */
nrg.ui.Thumbnail.prototype.setHoverListeners_ = function(set) {
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    if (set) {
	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOVER, 
			   this.onMouseOver.bind(this));
	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOUT, 
			   this.onMouseOut.bind(this));
    } else {
	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOVER, 
			     this.onMouseOver.bind(this));
	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOUT, 
			     this.onMouseOut.bind(this));
    }
}




/**
 * Initializes the events associated with the thumbnail.
 * @private
 */	
nrg.ui.Thumbnail.prototype.setEvents_ = function() {

    if (goog.events.hasListener(this.getHoverable(), 
			      nrg.ui.Thumbnail.EventType.CLICK)){
	goog.events.unlistenByKey(nrg.ui.Thumbnail.EventType.CLICK);
	
    }
    goog.events.listen(this.getHoverable(), 
		       goog.events.EventType.CLICK, function(){
			 this.dispatchEvent({
			     type: nrg.ui.Thumbnail.EventType.CLICK
			 });
    }.bind(this));	   
}




/**
 * @private
 */
nrg.ui.Thumbnail.prototype.setClasses_ = function() {
    goog.dom.classes.set(this.getElement(), nrg.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this.image_, nrg.ui.Thumbnail.CSS.IMAGE);
    goog.dom.classes.set(this.text_, nrg.ui.Thumbnail.CSS.TEXT);
}




nrg.ui.Thumbnail.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Broad events.
    goog.events.removeAll(this);
    goog.events.removeAll(this.getElement());

    // Hoverable events and object.
    if (goog.isDefAndNotNull(this.hoverable_)){
	goog.events.removeAll(this.hoverable_);
	goog.dom.removeNode(this.hoverable_);
	delete this.hoverable_;
    }

    // Image
    goog.dom.removeNode(this.image_);
    delete this.image_;

    // text
    goog.dom.removeNode(this.text_);
    delete this.text_;


    // broken thumbnail
    delete this.brokenThumbnalUrl_

    // is active
    delete this.isActive_;
}
