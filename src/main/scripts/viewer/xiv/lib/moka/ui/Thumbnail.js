/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');

// moka
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.events.EventManager');




/**
 * moka.ui.Thumbnail is a ui class for creating thumbnails.  Thumbnails
 * have two element compontents: an image and text, both of which are 
 * encapsulated  by a main "element".  Both the text and image are defined by 
 * setter methods.
 *
 * @constructor
 */
goog.provide('moka.ui.Thumbnail');
moka.ui.Thumbnail = function () {


    /**
     * @type {!Element}
     * @private
     */	
    this.element_ = goog.dom.createDom('div', {
	'id': 'moka.ui.Thumbnail_' + goog.string.createUniqueString()
    });
    this.element_.setAttribute('thumbnailid', this.element_.getAttribute('id'));


    /**
     * @type {!Image}
     * @private
     */	
    this.image_ = goog.dom.createDom('img', {
	'id' : 'moka.ui.Thumbnail_' + goog.string.createUniqueString()
    }); 
    goog.dom.append(this.element_, this.image_);


    /**
     * @type {!Element}
     * @private
     */	
    this.text_ = goog.dom.createDom('div', {
	'id': 'DisplayText_' + goog.string.createUniqueString()
    });
    goog.dom.append(this.element_, this.text_);


    //
    // Events
    //
    moka.events.EventManager.addEventManager(this, 
					      moka.ui.Thumbnail.EventType);


    //
    // Other init functions.
    //
    this.initEvents_();
    this.setClasses_();
    this.setHoverListeners_(true);
    this.mouseOut();    
}
goog.exportSymbol('moka.ui.Thumbnail', moka.ui.Thumbnail);




/**
 * Event types.
 * @enum {string}
 */
moka.ui.Thumbnail.EventType = {
  MOUSEOVER: goog.events.getUniqueId('mouseover'),
  MOUSEOUT: goog.events.getUniqueId('mouseout'),
  CLICK: goog.events.getUniqueId('click'),
};



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.CSS_CLASS_PREFIX =  
    goog.getCssName('moka-ui-thumbnail');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.ELEMENT_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.CSS_CLASS_PREFIX, '');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.IMAGE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.CSS_CLASS_PREFIX, 'image');


/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.TEXT_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.CSS_CLASS_PREFIX, 'displaytext');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.SELECTED_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.CSS_CLASS_PREFIX, 'selected');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS = 
    goog.getCssName(moka.ui.Thumbnail.ELEMENT_CLASS, 'mouseover');


/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.IMAGE_CLASS, 'mouseover');


/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.TEXT_MOUSEOVER_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.TEXT_CLASS, 'mouseover');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.ELEMENT_ACTIVE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.ELEMENT_CLASS, 'highlight');


/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.ELEMENT_ACTIVE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.ELEMENT_CLASS, 'active');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.IMAGE_ACTIVE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.IMAGE_CLASS, 'active');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.TEXT_ACTIVE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.TEXT_CLASS, 'active');



/**
 * @type {string} 
 * @expose 
 * @const
 */
moka.ui.Thumbnail.HOVER_CLONE_CLASS =  
    goog.getCssName(moka.ui.Thumbnail.ELEMENT_CLASS, 'hoverclone');



/**
 * @type {?Element}
 * @private
 */	
moka.ui.Thumbnail.prototype.hoverable_ = null;



/**
 * @type {!boolean}
 * @private
 */
moka.ui.Thumbnail.prototype.isActive_ = false;



/**
 * Gets the primary div that defines the thumbnail.
 * @return {!Element} The thumbnail div (the entire element).
 * @public
 */
moka.ui.Thumbnail.prototype.getElement = function() {
    return this.element_;	
}




/**
 * Gets the image element of the thumbnail.
 * @return {!Image} The thumbnail image.
 * @public
 */
moka.ui.Thumbnail.prototype.getImage = function() {
    return this.image_;	
}




/**
 * Gets the text of the thumbnail.
 * @return {!Element} The thumbnail text.
 * @public
 */
moka.ui.Thumbnail.prototype.getText = function() {
    return this.text_;	
}



/**
 * Gets the hoverable div of the thumbnail.
 * @return {!Element} The hoverable div.
 * @public
 */
moka.ui.Thumbnail.prototype.getHoverable = function() {
    this.hoverable_ = this.hoverable_ ? this.hoverable_ : this.element_;	
    return this.hoverable_
}




/**
 * @return {boolean} The 'active' state of the thumbnail (this is defined and 
 * set by the user).
 * @public
 */
moka.ui.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}




/**
 * Sets the image src object.
 * @param {!String} url The image src.
 * @public
 */	
moka.ui.Thumbnail.prototype.setImage = function(url){
    this.image_.src = url;
    goog.dom.classes.set(this.image_, moka.ui.Thumbnail.IMAGE_CLASS);
};




/**
 * Sets the text associated with the thumbnail.
 * @param {!String}
 * @public
 */	
moka.ui.Thumbnail.prototype.setText = function(text){
    this.text_.innerHTML = text;
};




/**
 * Removes the hoverable div element associated with the thumbnail.
 * @public
 */	
moka.ui.Thumbnail.prototype.removeHoverable = function(){
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
moka.ui.Thumbnail.prototype.createHoverable = function(opt_parent, 
							opt_element) {

    this.removeHoverable();
    this.setHoverListeners_(false);


    this.hoverable_ = (opt_element) ? opt_element : 
	this.element_.cloneNode(true);
    this.hoverable_.setAttribute('id', 'HOVERABLE' + 
				 this.element_.getAttribute('id'));
    this.hoverable_.setAttribute('thumbnailid', 
				 this.element_.getAttribute('id'));
    this.hoverable_.style.visibility = 'hidden';
    goog.dom.classes.add(this.hoverable_, 
			 moka.ui.Thumbnail.HOVER_CLONE_CLASS);

    this.setHoverListeners_(true);
    if (opt_parent){ opt_parent.appendChild(this.hoverable_) }

    this.initEvents_();
}    




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS class for style changes.
 * @param {boolean} active Active state, 
 * @param {boolean=} opt_highlightBg Whether or not to highlight the 
 * background. Defaults to false.
 * @public
 */
moka.ui.Thumbnail.prototype.setActive = function(active, opt_highlightBg) {

    //moka.dom.debug("setActive", active, opt_highlightBg);

    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlightBg) { 
	    goog.dom.classes.add(this.element_, 
				 moka.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS); 
	}
	goog.dom.classes.add(this.element_, 
			     moka.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.add(this.text_, 
			     moka.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.add(this.image_, 
			     moka.ui.Thumbnail.IMAGE_ACTIVE_CLASS);		
	
    } else {
	goog.dom.classes.remove(this.element_, 
				moka.ui.Thumbnail.ELEMENT_HIGHLIGHT_CLASS);
	goog.dom.classes.remove(this.element_, 
				moka.ui.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.remove(this.text_, 
				moka.ui.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.remove(this.image_, 
				moka.ui.Thumbnail.IMAGE_ACTIVE_CLASS);
    }
}




/**
 * Generic style update method.
 * @private {Object=} opt_args The arguments to apply to the style.
 * @public
 */
moka.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element_) {
	moka.style.setStyle(this.element_, opt_args);
    }
}



/**
 * Repositions the hoverable relative to the main element.
 * @public
 */
moka.ui.Thumbnail.prototype.repositionHoverable = function(){

    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    // Adjust only if the hover node is different from the element.
    if (hoverNode === this.element_) { return }


    // Find the common ancestor
    var commonAncestor = /**@type {Element}*/
    goog.dom.findCommonAncestor(this.element_, hoverNode);
    var thumbnailDims = /**@type {Object}*/
    moka.style.getPositionRelativeToAncestor(
	this.element_, commonAncestor);
    var imgClone = /**@type {Element}*/ 
    hoverNode.getElementsByTagName('img')[0];
    var textClone = /**@type {Element}*/ 
    hoverNode.getElementsByTagName('div')[0];
    var cloneWidth = /**@type {!number}*/ 0;


    // Set the clone width to something wider than the original thumbnail 
    // width only if the the cloneWidth is calculated to be larger (text 
    // spillover)
    cloneWidth = imgClone.scrollWidth + textClone.scrollWidth + 25;
    cloneWidth = (cloneWidth > this.element_.clientWidth) ? cloneWidth : 
	this.element_.clientWidth;
    moka.style.setStyle(hoverNode, {
	'position': 'absolute',
	'top': thumbnailDims['top'], 
	'left': thumbnailDims['left'],
	'width':  cloneWidth,
	'visibility': 'visible'
    });
}



/**
 * Applies the classes to the various objects when the mouse
 * hovers over the moka.ui.Thumbnail.
 * @private
 */
moka.ui.Thumbnail.prototype.mouseOver = function() {
    //window.console.log("MOUSEOVER");
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    goog.dom.classes.add(hoverNode, 
			 moka.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);	
    goog.dom.classes.add(hoverNode.childNodes[1], 
			 moka.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);		
    goog.dom.classes.add(hoverNode.childNodes[0], 
			 moka.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);
    if (hoverNode !== this.element_) {
	this.repositionHoverable();
    }
    this['EVENTS'].runEvent('MOUSEOVER');
}




/**
 * Applies the classes to the various objects when the mouse hovers over the 
 * moka.ui.Thumbnail.
 * @public
 */
moka.ui.Thumbnail.prototype.mouseOut = function() {
    //window.console.log("MOUSEPUT");
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    if (hoverNode && hoverNode.childNodes.length > 1) { 
	
	//window.console.log("MOUSEPUT_2");
	goog.dom.classes.remove(hoverNode, 
				moka.ui.Thumbnail.ELEMENT_MOUSEOVER_CLASS);
	goog.dom.classes.remove(hoverNode.childNodes[1], 
				moka.ui.Thumbnail.TEXT_MOUSEOVER_CLASS);
	goog.dom.classes.remove(hoverNode.childNodes[0], 
				moka.ui.Thumbnail.IMAGE_MOUSEOVER_CLASS);

	hoverNode.style.visibility = (hoverNode !== this.element_) ? 'hidden' : 
	    'visible';
	
    }
    this['EVENTS'].runEvent('MOUSEOUT');
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 * @param {boolean=} set Whether to apply the event listener or remove it.
 * @private
 */
moka.ui.Thumbnail.prototype.setHoverListeners_ = function(set) {
    var hoverNode = /**@type {!Element}*/ this.getHoverable();
    if (set) {
	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOVER, 
			   this.mouseOver.bind(this));
	goog.events.listen(hoverNode, 
			   goog.events.EventType.MOUSEOUT, 
			   this.mouseOut.bind(this));
    } else {
	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOVER, 
			     this.mouseOver.bind(this));
	goog.events.unlisten(hoverNode, 
			     goog.events.EventType.MOUSEOUT, 
			     this.mouseOut.bind(this));
    }
}




/**
 * Initializes the events associated with the thumbnail.
 * @private
 */	
moka.ui.Thumbnail.prototype.initEvents_ = function() {
    this['EVENTS'].clearEvent('CLICK');
    goog.events.listen(this.getHoverable(), 
		       goog.events.EventType.CLICK, function(){
			   this['EVENTS'].runEvent('CLICK');
    }.bind(this));	   
}




/**
 * @private
 */
moka.ui.Thumbnail.prototype.setClasses_ = function() {
    goog.dom.classes.set(this.element_, moka.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this.image_, moka.ui.Thumbnail.IMAGECLASS);
    goog.dom.classes.set(this.text_, moka.ui.Thumbnail.TEXT_CLASS);
}




