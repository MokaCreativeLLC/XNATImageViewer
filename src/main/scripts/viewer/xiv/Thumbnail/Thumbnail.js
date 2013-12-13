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
 * viewer-widget includes
 */
goog.require('xiv');
goog.require('xiv.Widget');




/**
 * xiv.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 *
 * @constructor
 * @param {Object, Object=}
 * @extends {xiv.Widget}
 */
goog.provide('xiv.Thumbnail');
xiv.Thumbnail = function (properties, opt_args) {

    var that = this;
    xiv.Widget.call(this, utils.dom.mergeArgs(opt_args, {'id' : 'xiv.Thumbnail'}));



    //------------------
    // Properties object
    //------------------    
    this._properties = properties;



    //------------------
    // Image
    //------------------
    this._image = new Image();
    this._image.src = this._properties['thumbnailUrl'];
    this._element.appendChild(this._image)

    
    
    //------------------
    // Add displayText element
    //------------------
    this._displayText = utils.dom.makeElement("div", this._element, "DisplayText");



    //------------------
    // Set _displayText
    //------------------
    var headerText = '';
    switch(this._properties['category'].toLowerCase())
    {
    case 'dicom':
	headerText = this._properties['sessionInfo']["Scan"]['value'];
	break;
    case 'slicer':
	headerText = this._properties['Name'].split(".")[0];
	break;
    }



    //------------------
    // Other metadata queries
    //------------------
    this._displayText.innerHTML += "<b><font size = '2'>" + headerText  + "</font></b><br>";
    this._displayText.innerHTML += "Frmt: " + this._properties['sessionInfo']["Format"]['value'].toString()  + "<br>";
    this._displayText.innerHTML += 'Type: ' + this._properties['sessionInfo']["type"]['value']   + "</b><br>";
    this._displayText.innerHTML += 'Expt: ' + this._properties['sessionInfo']['experiments'];


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
    goog.dom.classes.set(this._element, xiv.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.set(this._image, xiv.Thumbnail.IMAGE_CLASS);
    goog.dom.classes.set(this._displayText, xiv.Thumbnail.TEXT_CLASS);


    
    //------------------
    // Set image onload
    //------------------
    this._image.onload = function () {	
	if (that._onloadCallbacks) {
	    goog.array.forEach(that._onloadCallbacks, function (callback) { callback(); })	
	}
    }



    //------------------
    // Set Hover Clone
    //------------------
    this._hoverClone = that._element.cloneNode(true);
    this._hoverClone.style.visibility = 'hidden';
    xiv._Modal._element.appendChild(this._hoverClone);
    this.setHoverListeners(true, this._hoverClone);
    this._hoverClone.setAttribute('thumbnailid', that._element.id);
    this._hoverClone.id = 'HOVERCLONE_' + this._hoverClone.id;

    //
    // Add the .thumbnailid property for retrieval of original
    // thumbnail (drag and drop)
    //
    goog.array.forEach(this._hoverClone.childNodes, function(node){
	node.setAttribute('thumbnailid', that._element.id);
    })
    
}
goog.inherits(xiv.Thumbnail, xiv.Widget);
goog.exportSymbol('xiv.Thumbnail', xiv.Thumbnail);




xiv.Thumbnail.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-thumbnail');
xiv.Thumbnail.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, '');
xiv.Thumbnail.IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'image');
xiv.Thumbnail.TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'displaytext');
xiv.Thumbnail.DRAGGING_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'dragging');
xiv.Thumbnail.SELECTED_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'selected');
xiv.Thumbnail.ELEMENT_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.ELEMENT_CLASS, 'mouseover');
xiv.Thumbnail.IMAGE_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.IMAGE_CLASS, 'mouseover');
xiv.Thumbnail.TEXT_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.TEXT_CLASS, 'mouseover');
xiv.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.ELEMENT_CLASS, 'highlight');
xiv.Thumbnail.ELEMENT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.ELEMENT_CLASS, 'active');
xiv.Thumbnail.IMAGE_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.IMAGE_CLASS, 'active');
xiv.Thumbnail.TEXT_ACTIVE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.TEXT_CLASS, 'active');




/**
 * @type {?Object}
 * @const
 */
xiv.Thumbnail.prototype._properties = null;




/**
 * @type {?Image}
 * @protected
 */	
xiv.Thumbnail.prototype._image = null;




/**
 * @type {?Element}
 * @protected
 */	
xiv.Thumbnail.prototype._displayText = null;




/**
* @type {?Element}
* @public
*/
xiv.Thumbnail.prototype._hoverClone = null;




/**
* @type {Array.<function>}
* @private
*/
xiv.Thumbnail.prototype.mouseoverCallbacks_ = [];



/**
* @type {Array.<function>}
* @private
*/
xiv.Thumbnail.prototype.mouseoutCallbacks_ = [];




/**
* @param {!function}
* @private
*/
xiv.Thumbnail.prototype.addMouseoverCallback = function(callback) {
    this.mouseoverCallbacks_.push(callback);
}




/**
* @param {!function}
* @private
*/
xiv.Thumbnail.prototype.addMouseoutCallback = function(callback) {
    this.mouseoutCallbacks_.push(callback);
}




/**
* @type {boolean}
* @private
*/
xiv.Thumbnail.prototype.isActive_ = false;





/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS for style changes.
 *
 * @param {boolean, boolean=} active Active state, opt_highlight_bg 
 * whether or not to highlight the background (false if it pertains
 * to thumbnails that have been dropped in a viewer).
 */
xiv.Thumbnail.prototype.setActive = function(active, opt_highlight_bg) {

    //utils.dom.debug("setActive", active, opt_highlight_bg);
    var that = this
    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlight_bg !== false) { goog.dom.classes.add(that._element, xiv.Thumbnail.ELEMENT_HIGHLIGHT_CLASS); }
	goog.dom.classes.add(that._element, xiv.Thumbnail.ELEMENT_ACTIVE_CLASS);
	goog.dom.classes.add(that._displayText, xiv.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.add(that._image, xiv.Thumbnail.IMAGE_ACTIVE_CLASS);		
	
    } else {
	goog.dom.classes.remove(that._element, xiv.Thumbnail.ELEMENT_HIGHLIGHT_CLASS);
	goog.dom.classes.remove(that._element, xiv.Thumbnail.ELEMENT_ACTIVE_CLASS);			
	goog.dom.classes.remove(that._displayText, xiv.Thumbnail.TEXT_ACTIVE_CLASS);		
	goog.dom.classes.remove(that._image, xiv.Thumbnail.IMAGE_ACTIVE_CLASS);
    }
}




/**
* @return {boolean}
*/
xiv.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}




/**
* @return {Array.<string>}
*/
xiv.Thumbnail.prototype.getFiles = function() {
    return this._properties.files;	
}





/**
 * Applies the classes to the various objects when the mouse
 * hovers over the xiv.Thumbnail.
 *
 * @type {function(boolean)}
 * @private
 */
xiv.Thumbnail.prototype.setHovered = function(hovered) {

    var that = this;
    if (hovered){

	var eltAbsPos = utils.style.absolutePosition(this._element);
	var imgClone = goog.dom.getElementByClass(xiv.Thumbnail.IMAGE_CLASS, this._hoverClone)
	var textClone = goog.dom.getElementByClass(xiv.Thumbnail.TEXT_CLASS, this._hoverClone);


	if (this._hoverClone.style.visibility != 'visible') {
	    goog.dom.classes.add(that._hoverClone, xiv.Thumbnail.ELEMENT_MOUSEOVER_CLASS);			
	    goog.dom.classes.add(that._hoverClone.childNodes[1], xiv.Thumbnail.TEXT_MOUSEOVER_CLASS);		
	    goog.dom.classes.add(that._hoverClone.childNodes[0], xiv.Thumbnail.IMAGE_MOUSEOVER_CLASS);

	    this._hoverClone.style.visibility = 'visible';
	    utils.style.setStyle(this._hoverClone, {
		'position': 'absolute',
		'top': eltAbsPos['top'], 
		'left': eltAbsPos['left'],
		'width':  imgClone.scrollWidth + textClone.scrollWidth + 25
	    });
	}

	goog.array.forEach(that.mouseoverCallbacks_, function(callback){
	    callback(that);
	})

    } else {
	if (this._hoverClone){
	    this._hoverClone.style.visibility = 'hidden';
	}

	goog.array.forEach(that.mouseoutCallbacks_, function(callback){
	    callback(that);
	})
    }
}




/**
 * Sets the listener events for when the thumbnail is hovered on.
 *
 * @type {function(boolean, Element=)}
 * @private
 */
xiv.Thumbnail.prototype.setHoverListeners = function(set, opt_hoverable) {
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
 * Clones the thumbnail to create a draggable element.
 *
 * @param {Element}
 */
xiv.Thumbnail.prototype.createDragElement = function(sourceEl) {
    var elt =  goog.dom.createDom('div', 'foo', 'Custom drag element');
    utils.style.setStyle(elt, {
	'color':  "rgba(255,0,0,1)",
	'background-color':  "rgba(255,200,0,1)",
	'width':  200,
	'height':  200
    });
};
