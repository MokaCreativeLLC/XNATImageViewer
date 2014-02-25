/**
 * @author sunilk@mokacreativellc.com
 */

// goog
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');

// utils
goog.require('utils.dom');
goog.require('utils.convert');
goog.require('utils.style');
goog.require('utils.string');
goog.require('utils.ui.GenericSlider');




/**
 * utils.ui.ScrollableContainer allows the user to input contents to create a 
 * scrollable div.  It's a compound object that uses goog.ui.AnimatedZippy or 
 * goog.ui.Zippy (for condensing contents and creating folders) and 
 * utils.ui.GenericSlider for scrolling through the contents.
 * @constructor
 */
goog.provide('utils.ui.ScrollableContainer');
utils.ui.ScrollableContainer = function (opt_args) {
    /**
     * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
     * @private
     */
    this.zippyType_ = goog.ui.AnimatedZippy;



    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.createDom('div', {
	'id': 'ScrollableContainer_' + goog.string.createUniqueString(),
	'class': utils.ui.ScrollableContainer.ELEMENT_CLASS
    });



    /**
     * @type {!Element}
     * @private
     */
    this.scrollArea_ = goog.dom.createDom("div", {
	'id': 'ScrollArea_' + goog.string.createUniqueString(),
	'class' :  utils.ui.ScrollableContainer.SCROLL_AREA_CLASS
    });
    goog.dom.append(this.element_, this.scrollArea_);



    /**
     * @type {!utils.ui.GenericSlider}
     * @private
     */
    this.Slider_ = new utils.ui.GenericSlider();
    this.Slider_.setOrientation('vertical');
    goog.dom.append(this.element_, this.Slider_.getElement());


    //------------------
    // Set Slider UI and callbacks
    //------------------
    this.setSliderCallbacks_();
    this.setSliderStyles_();
    this.updateStyle();
}
goog.exportSymbol('utils.ui.ScrollableContainer', utils.ui.ScrollableContainer);



/**
 * The restricted properties struct that define a set of contents for the 
 * scrollable container.
 * @constructor
 * @dict
 * @param {Element} header The zippy header element.
 * @param {Element} content The zippy content element.
 * @param {Element} headerLabel The zippy header label element.
 * @param {Element} expandIcon The expand icon of the scrollable container.
 * @param {Element} content The content element.
 * @param {!goog.ui.AnimatedZippy | !goog.ui.Zippy} zippy The zippy object.
 * @param {!number} depth The depth of the struct.
 */
utils.ui.ScrollableContainer.contentsDict = 
function(header, content, zippy, depth){ 
    this['header'] = /**@type {Element}*/ header;
    this['headerLabel'] = /**@type {Element}*/ header.childNodes[0];
    this['expandIcon'] = /**@type {Element}*/ header.childNodes[1];
    this['content'] = /**@type {Element}*/ content;
    this['zippy'] = /**@type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}*/zippy;
    this['depth'] = /**@type {!number}*/ depth;
};
goog.exportSymbol('utils.ui.contentsStruct', utils.ui.contentsStruct);




/**
 * Creates an object structured such that the elt argument belongs in the last
 * folder of the 'folders' argument.  For instance, if elt is
 * a div and folders = ['a', 'b', 'c'], then elt would be in a folder tree
 * ending in c.
 * @param {!Element} elt  The element to apply to the folder.
 * @param {!Array.string} folders The folder array.
 * @return {Object} An n-dimensional object tree.
 * @public
 */
utils.ui.ScrollableContainer.folderTreeFromArray = function(elt, folders) {
    //window.console.log(folders[0]);
    var obj = /**@type {Object}*/ {};
    obj[folders[0]] = (folders.length == 1) ? elt : 
	utils.ui.ScrollableContainer.folderTreeFromArray(elt, folders.slice(1));
    return obj
}



/**
 * @type {!string}
 * @const
 */ 
utils.ui.ScrollableContainer.CONTENT_REF_ATTR = 'contentid'


/**
 * As stated.
 * @param {!string} zKey The key of the zippy.
 * @param {!Element} parentElt The parene element of the zippy header.
 * @return {!Element} The header element.
 * @private
 */
utils.ui.ScrollableContainer.prototype.createZippyHeader_ = 
function(zKey, parentElt) {
    var header = /**@type {!Element} */ 
    goog.dom.createDom('div', {'id': "ZippyHeader_" + zKey});
    parentElt.appendChild(header);
    header.key = zKey;

    // Add the header label, expandIcon
    var headerLabel = /**@type {!Element} */ this.createZippyHeaderLabel_(zKey);
    var expandIcon = /**@type {!Element} */ this.createZippyExpandIcon_(zKey);
    header.appendChild(headerLabel);
    header.appendChild(expandIcon);

    // Contents need to be added to header's parent.
    var zippyContents = /**@type {!Element}*/ this.createZippyContent_(zKey);
    header.setAttribute(utils.ui.ScrollableContainer.CONTENT_REF_ATTR, 
			zippyContents.id);
    parentElt.appendChild(zippyContents);
    return header;
}





/**
 * As stated.
 * @param {!string} zKey The key of the zippy.
 * @return {!Element} The header label.
 * @private
 */
utils.ui.ScrollableContainer.prototype.createZippyHeaderLabel_ = function(zKey){
    return goog.dom.createDom('div', {'id': "ZippyHeaderLabel_" + zKey + '_' + 
				      goog.string.createUniqueString()},
			      utils.string.truncateString(
			      goog.string.toTitleCase(zKey), 
		              utils.ui.ScrollableContainer.MAX_LABEL_LENGTH))
}




/**
 * As stated.
 * @param {!string} zKey The key of the zippy.
 * @return {!Element} The described element.
 * @private
 */
utils.ui.ScrollableContainer.prototype.createZippyExpandIcon_ = function(zKey){
     return goog.dom.createDom('div', {'id': "ZippyExpandIcon_" + zKey + '_' +  
				      goog.string.createUniqueString()}, '+');
}



/**
 * As stated.
 * @param {!string} zKey The key of the zippy.
 * @return {!Element} The described element.
 * @private
 */
utils.ui.ScrollableContainer.prototype.createZippyContent_ = function(zKey){
    return goog.dom.createDom('div', {'id': "ZippyContent_" + zKey + '_' +  
				      goog.string.createUniqueString()});
}



/**
 * @const
 * @type {!number}
 */
utils.ui.ScrollableContainer.MAX_LABEL_LENGTH = 30;




/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.CSS_CLASS_PREFIX = 
    goog.getCssName('utils-ui-scrollablecontainer');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ELEMENT_CLASS =  
    goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, '');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.SCROLL_AREA_CLASS =  
    goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		    'scrollarea');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-widget');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.SLIDER_THUMB_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-thumb');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'slider-thumb-hovered');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.SLIDER_TRACK_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'slider-track');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_HEADER_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyheader');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_HEADER_SUB_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyheader-sub');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyheaderlabel');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_SUB_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyheaderlabel-sub');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_ICON_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyexpandicon');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_ICON_SUB_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyexpandicon-sub');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippycontent');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_CONTENT_SUB_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippycontent-sub');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS =  
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyheader-mouseover');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS = 
goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 
		'zippyexpandicon-mouseover');



/**
 * @type {Array.number}
 * @private
 */
utils.ui.ScrollableContainer.prototype.indents_;




/**
 * @type {!number}
 * @private
 */
utils.ui.ScrollableContainer.prototype.defaultIndentation_ = 5;



/**
 * Semi-recursive contents adder for inserting contents to the container, 
 * where the contents have a hierarchy (i.e. there are main zippys, main 
 * contents, and sub-zippys and sub-contents).
 * For instance, say you want the contents hierarchy to resemble this:
 *
 * mainElements
 * ZIPPY
 *   |- contentsElements
 *   |- SUB_ZIPPY
 *      |- subContentsElements
 *      |- SUB_SUB_ZIPPY
 *         |- subSubContentsElements
 *
 * The external function call would look something like this:
 * 
 * var contents = {
 *     'parentFolder': mainElements,
 *     'ZIPPY': {
 * 	'parentFolder': contentsElements,
 * 	'SUB_ZIPPY': {
 * 	    'parentFolder': subContentsElements,
 * 
 * 	    // This doesn't need a 'parentFolder' property 
 * 	    // because the elements are not competing in hierarchy with a 
 * 	    // zippy.  If there was a 'SUB_SUB_SUB_ZIPPY' we would
 * 	    // need it.
 * 	    'SUB_SUB_ZIPPY' : subSubContentsElements
 * 	}
 *     }
 * }
 * 
 * var sc = new utils.ui.ScrollableContainer();
 * sc.addContents(contents);
 *
 * @param {!Element|!Objects|!Array} contents The contents to add to the 
 *     container.
 * @param {Element=} opt_parent (Optional) The parent to add the contents to 
 *     (i.e. a zippy element).  Defaults to scrollArea_.
 * @param {String=} opt_parentKey (Optional) The key of the parent zippy to 
 *     add the contents to.
 * @public
 */
utils.ui.ScrollableContainer.prototype.addContents = function (contents, 
							       opt_parent, 
							       opt_parentKey) {

    //window.console.log("ADD CONTENTS", contents, opt_parent, opt_parentKey);
    opt_parent =  opt_parent ? opt_parent : this.scrollArea_;
    if (goog.dom.isElement(contents)) {
	this.addContentsElement_(contents, opt_parent, opt_parentKey);
    } else if (goog.isArray(contents)) {
	this.addContentsArray_(contents, opt_parent, opt_parentKey);
    } else if (goog.isObject(contents)){
	this.addContentsObject_(contents, opt_parent, opt_parentKey);
    }
}




/**
 * Allows user to add an element and the folders from which it belongs to.
 * @param {!Element} elt
 * @param {!Array.string} folders
 * @public
 */
utils.ui.ScrollableContainer.prototype.addElementAndFolders = 
    function(elt, folders) {
	//window.console.log("\n\nCONTENTS", elt, folders);
    var contents = /**@type {!Object}*/
        utils.ui.ScrollableContainer.folderTreeFromArray(elt, folders)
    //window.console.log("\n\nCONTENTS", contents);
    this.addContents(contents);
}




/**
 * As stated.  NOTE: This function needs to be called before contents are set.
 * @return {!boolean} animated 'true' to set the zippys animated, 'false' 
 *     otherwise.
 * @public
 */
utils.ui.ScrollableContainer.prototype.setZippysAnimated = function(animated){
    this.zippyType_ = (animated === true) ? goog.ui.AnimatedZippy : 
	goog.ui.Zippy;
}




/**
 * Returns the primary element.
 * @return {!Element} The ScrollableContainer main element.
 * @public
 */
utils.ui.ScrollableContainer.prototype.getElement = function(){
    return this.element_;
}




/**
 * As stated.
 * @return {!utils.ui.GenericSlider} The Slider object.
 * @public
 */
utils.ui.ScrollableContainer.prototype.getSlider = function(){
    return this.Slider_;
}



/**
 * As stated.
 * @return {!utils.ui.ScrollableContainer.contentsDict} The contents dictionary.
 * @public
 */
utils.ui.ScrollableContainer.prototype.getContentsDict = function(){
    return this.contentsDict_;
}



/**
 * Generic updateStyle method. 
 * @param {Object=} opt_args The style object to apply.
 * @public
 */
utils.ui.ScrollableContainer.prototype.updateStyle = function (opt_args) {
    if (opt_args) { utils.style.setStyle(this.element_, opt_args) }
}



/**
 * Expand the zippy folder within the contents.
 * @param {!string} zKey The key of the stored zippy to expand or compress.
 * @param {boolean=} opt_expand (Optional) 'true' to expand zippy, 'false' to 
 *    compress.  Defaults to 'true'.
 * @public
 */
utils.ui.ScrollableContainer.prototype.setZippyExpanded = 
function(zKey, opt_expand) {
    this.contentsDict_[zKey]['zippy'].setExpanded((opt_expand === false) ? 
					       false : true);
}




/**
 * Expands all zippy folders within the contents.
 * @param {boolean=} opt_expand (Optional) 'true' to expand zippy, 'false' 
 *    to compress.  Defaulted to 'true'.
 * @public
 */
utils.ui.ScrollableContainer.prototype.setZippysExpanded = function(opt_expand)
{
    var zKey = /**@type {!string} */ '';
    for (zKey in this.contentsDict_){
	this.contentsDict_[zKey]['zippy'].setExpanded((opt_expand === false) ? 
						   false : true);
    }
}




/**
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided elements.
 * @param {!Element} element The element to listen for the mousewheel event 
 *     that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback to fire as the 
 *     mousewheel scrolls.
 * @public
 */
utils.ui.ScrollableContainer.prototype.bindToMouseWheel = function(element, 
								opt_callback) {
    this.Slider_.bindToMouseWheel(element, opt_callback);
}




/**
 * Gets the depth of an element within the contents.
 * @param {!Element} element The element to calculate depth from.
 * @return {number} The depth of the element within the container.
 * @public
 */
utils.ui.ScrollableContainer.prototype.getDepth = function(element){
    var depth =  /**@type {!number}*/ 0;
    var parentNode =  /**@type {!Element}*/ element.parentNode;
    while (parentNode) {
	if (parentNode.className && parentNode.className.indexOf(
	    utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS) > -1){ depth++;}
	parentNode = parentNode.parentNode;
    }
    return depth
}



/**
 * Gets the indentation of an element within the contents.
 * @param {!Element} element The element to calculate the depth relative to 
 *     the entire container.
 * @return {number} The indentation amount attributed to the depth of the node. 
 * @public
 */
utils.ui.ScrollableContainer.prototype.getNodeIndentation = function(element) {
    var depth =  /**@type {!number}*/ this.getDepth(element);


    this.setIndentationByDepth(depth);


    var indent =  /**@type {!number}*/ this.indents_[depth];
    if (goog.isDef(indent)){
	return indent;
    } else {
	return depth * this.defaultIndentation_;
    }
}



/**
 * Allows the user to set the indentation of the zippy at its given depth.  
 * If such a depth doesn't exist, nothing will happen.
 * @param {!number} depth The depth level to set the indentation from.
 * @param {number=} opt_indent The optional px amount (as a number) to 
 *    indent.  (Defaults to 5 * depth).
 * @public
 */
utils.ui.ScrollableContainer.prototype.setIndentationByDepth = 
function(depth, opt_indent) {
    this.indents_ = this.indents_ ? this.indents_ : [];

    // Construct the other indents if they're not there.
    if (this.indents_.length < (depth + 1)){
	var i = /**@type {!number}*/ 0;
	for (i=0; i<depth; i++){
	    this.indents_[i] = i * this.defaultIndentation_;
	}
    }

    if (opt_indent !== undefined){
	this.indents_[depth] = opt_indent;
    }
}




/**
 * Checks if a given zippy exists within the contents.
 * @param {!string} zKey The key of the zippy (it's label) to check.
 * @return {!boolean} Whether the zippy exists.
 * @public
 */
utils.ui.ScrollableContainer.prototype.zippyExists = function(zKey) {
   return zKey in this.contentsDict_;
}




/**
 * Adds a zippy to the contents either the main element (scrollArea_) or 
 * the 'opt_parent'.
 * @param {!string} zKey The name and label of the zippy.
 * @param {Element=} opt_parent The parent element to add the zippy to.
 * @return {!goog.ui.AnimatedZippy | !goog.ui.Zippy} The zippy object.
 * @public
 */
utils.ui.ScrollableContainer.prototype.addZippy = function(zKey, opt_parent) {
   
    // Exit out if the zippy exists
    if (this.contentsDict_ && this.contentsDict_.hasOwnProperty(zKey)){
	return
    }
    
    var header = /**@type {Element}*/ this.createZippyHeader_(zKey, 
			opt_parent ? opt_parent : this.scrollArea_);

    header.setAttribute('zkey', zKey);
    // Adjust the header margin
    header.style.marginTop = goog.object.getCount(this.contentsDict_) ?
			      '0px' : header.style.marginTop; 
    

    var contentsElt = /**@type {Element}*/ goog.dom.getElement(
	header.getAttribute(utils.ui.ScrollableContainer.CONTENT_REF_ATTR));


    var zippy = /** @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy} */
    new this.zippyType_(header, contentsElt, true)



    // Store zippy and header
    this.contentsDict_ = this.contentsDict_ ? this.contentsDict_ : {};
    if (this.contentsDict_[zKey] !== undefined) {return};
    this.contentsDict_[zKey] = new utils.ui.ScrollableContainer.contentsDict(
	header, contentsElt, zippy, this.getDepth(header));

    // zippy inits
    this.addZippyCss_(zKey);
    this.addZippyEvents_(zKey);
    this.setZippyExpandedEvents_(zKey);
    this.indentZippys_();

    return zippy;
}



/**
 * As stated.
 * @param {!string} zKey The name and label of the zippy.
 * @private
 */
utils.ui.ScrollableContainer.prototype.addZippyCss_ = function(zKey) {		
    goog.dom.classes.add(this.contentsDict_[zKey]['header'], 
			 utils.ui.ScrollableContainer.ZIPPY_HEADER_CLASS);
    goog.dom.classes.add(this.contentsDict_[zKey]['headerLabel'], 
			 utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_CLASS);
    goog.dom.classes.add(this.contentsDict_[zKey]['expandIcon'], 
			 utils.ui.ScrollableContainer.ZIPPY_ICON_CLASS);
    goog.dom.classes.add(this.contentsDict_[zKey]['content'], 
			 utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS);

}



/**
 * As stated.
 * @param {!string} zKey The name and label of the zippy.
 * @private
 */
utils.ui.ScrollableContainer.prototype.addZippyEvents_ = function(zKey) {
    //------------------
    // Define Mouseover, Mouseout functions.
    //------------------
    goog.events.listen(this.contentsDict_[zKey]['header'], 
		       goog.events.EventType.MOUSEOVER, function(){
	goog.dom.classes.add(this.contentsDict_[zKey]['header'], 
		utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS);
	goog.dom.classes.add(this.contentsDict_[zKey]['expandIcon'], 
		utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS);
    }.bind(this));
    goog.events.listen(this.contentsDict_[zKey]['header'], 
		       goog.events.EventType.MOUSEOUT, function(){
	goog.dom.classes.remove(this.contentsDict_[zKey]['header'], 
		utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS);
	goog.dom.classes.remove(this.contentsDict_[zKey]['expandIcon'], 
		utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS);
    }.bind(this));	   
} 





/**
 * @type {utils.ui.ScrollableContainer.contentsDict}
 * @dict
 * @private
 */	
utils.ui.ScrollableContainer.prototype.contentsDict_;



/**
 * Sets the default styles for the various components.
 * @private
 */
utils.ui.ScrollableContainer.prototype.setSliderStyles_ = function(){
    goog.dom.classes.add(this.Slider_.getElement(), 
			 utils.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS);
    goog.dom.classes.add(this.Slider_.getThumb(), 
			 utils.ui.ScrollableContainer.SLIDER_THUMB_CLASS);
    goog.dom.classes.add(this.Slider_.getTrack(), 
			 utils.ui.ScrollableContainer.SLIDER_TRACK_CLASS);
    this.Slider_.setThumbHoverClass(
	utils.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS);
}




/**
 * Refits the sliders track range to suit the height
 * of all of the contents, which is 'scrollArea_'.
 * This should be appled AFTER contents have been set.
 * @private
 */
utils.ui.ScrollableContainer.prototype.mapSliderToContents_ = function () {
    var widgetHeight = /**@type {!number}*/
    utils.style.dims(this.element_, 'height');

    var scrollAreaHeight = /**@type {!number}*/
    utils.convert.toInt(utils.style.getComputedStyle(
	this.scrollArea_, 'height'));

    var beforeRange = /**@type {!Array.number}*/
    [this.Slider_.getMinimum(), this.Slider_.getMaximum()];

    var afterRange = /**@type {!Array.number}*/
    [0, scrollAreaHeight - widgetHeight];

    var sliderThumb = /**@type {!Element}*/ this.Slider_.thumb;


    //------------------
    // If there's the scrollArea (contents) is greater
    // than the height of the container element, then we 
    // enable the slider and reposition the contents so it
    // can be slideable...
    //------------------
    if (widgetHeight < scrollAreaHeight) {

	// The slider thumbnail's height is a function of
	// how much scroll area is hidden.  Want to make sure the height
	// is proportional to the contents.
	utils.style.setStyle(sliderThumb, {
	    'opacity': 1,
	    'height': widgetHeight * (widgetHeight / scrollAreaHeight)
	});

	// Enable the slider
	this.Slider_.setEnabled(true);
	

	// Move the scroll area to the top (as the slider's thumbnail
	// is at the top).
	var sendVal = /**@type {!number}*/
	    Math.abs(this.Slider_.getValue() - 100);
	var remap = /**@type {!number}*/
	    utils.convert.remap1D(sendVal, beforeRange, afterRange);
	var t = /**@type {!number}*/ remap['remappedVal'];
	    utils.style.setStyle( this.scrollArea_, {'top': -t});	



    //------------------
    // Otherwise we hide and disable the slider.
    //------------------	
    }
    else {
	utils.style.setStyle(sliderThumb, { 'opacity': 0});
	this.Slider_.setEnabled(false);
	this.Slider_.setValue(100);
    }	
}



/**
 * Indents the zippy headers based on their depth.
 * @private
 */
utils.ui.ScrollableContainer.prototype.indentZippys_ = function(){

    var furthestIndent = /**@type {!number}*/ 0;
    var key = /**@type {!string}*/ '';
    var header = /**@type {Element}*/ undefined;

    for (key in this.contentsDict_){ 
	header = /**@type {!Element}*/ this.contentsDict_[key]['header'];
	furthestIndent = this.getNodeIndentation(header);
    }
    var width = /**@type {!number}*/ 100 - furthestIndent;   


    for (key in this.contentsDict_){
	header = /**@type {!Element}*/ this.contentsDict_[key]['header'];
	var indentPct = /**@type {!number}*/ this.getNodeIndentation(header);
	header.style.left = (indentPct).toString() + '%';
	header.style.width = (width).toString() + '%';
    }
}




/**
 * Sets the slider callbacks.
 * @private
 */
utils.ui.ScrollableContainer.prototype.setSliderCallbacks_ = function() {
    this.Slider_['EVENTS'].onEvent('SLIDE', 
				   this.mapSliderToContents_.bind(this));  
    this.Slider_.bindToMouseWheel(this.element_);
}




/**
 * As stated.
 * @param {!string} zKey The name and label of the zippy.
 */
utils.ui.ScrollableContainer.prototype.setZippyExpandedEvents_ = function(zKey)
{

    var zippy = /**@type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}*/
    this.contentsDict_[zKey]['zippy'];
    
    goog.events.listen(zippy, goog.object.getValues(goog.ui.Zippy.Events)
		       , function(e) { 		
	
	var expandIcon = /**@type {!Element}*/ 
			   this.contentsDict_[zKey]['expandIcon'];
	//
	// Create a map that allows the slider to move
	// the contents in proportion to the slider.
	//
	this.mapSliderToContents_(this.Slider_, this);		
	

	//
	// Change expand icon to '+' or '-'
	//
	if (e.target.isExpanded()) {
	    expandIcon.innerHTML =  "-";
	    utils.style.setStyle(expandIcon, { 'margin-left': '-1em' })
	} else {
	    expandIcon.innerHTML =  "+";
	    utils.style.setStyle(expandIcon, { 'margin-left': '-1.1em' })	
	}
    }.bind(this));
}



/**
 * Method for adding an element.
 * @param {!Element} contents The contents to add to the  container.
 * @param {Element=} opt_parent (Optional) The parent to add the contents to 
 *     (i.e. a zippy element).  Defaults to scrollArea_.
 * @param {String=} opt_parentKey (Optional) The key of the parent zippy to 
 *     add the contents to.
 * @private
 */
utils.ui.ScrollableContainer.prototype.addContentsElement_ = 
function (contents, opt_parent, opt_parentKey) {

    //window.console.log("ADD CONTENTS ELEMENT", contents, 
    //		       opt_parent, opt_parentKey);
    // All contents need to be relatively positioned.
    utils.style.setStyle(contents, {'position': 'relative'});
    // Add element to the parent Element
    goog.dom.appendChild(opt_parent, contents);

    // Indent the contents
    this.indentZippys_();
    contents.style.left = (this.getNodeIndentation(opt_parent)).toString() +'%';

    // When there's no zippy parent folder, we set the height
    // of the main element_ to the scroll area.
    if (utils.style.dims(this.element_, 'height') === 0 && 
	opt_parent === this.scrollArea_){
	utils.style.setStyle(this.element_, {'height': 
			utils.style.dims(this.scrollArea_, 'height')});
    }

    // Allows user to move the contents when sliding the slider.
    this.mapSliderToContents_(this.Slider_, this);
    
}


/**
 * Method for adding an array containing elements.
 * @param {!Array} contents The contents to add to the container.
 * @param {Element=} opt_parent (Optional) The parent to add the contents to 
 *     (i.e. a zippy element).  Defaults to scrollArea_.
 * @param {String=} opt_parentKey (Optional) The key of the parent zippy to 
 *     add the contents to.
 * @private
 */
utils.ui.ScrollableContainer.prototype.addContentsArray_ = 
function (contents, opt_parent, opt_parentKey) {
    var i = /**@type {!number}*/ 0;
    var len =  /**@type {!number}*/ contents.length;
    for (i=0; i < len; i++) {
	this.addContents(contents[i], opt_parent, opt_parentKey);
    }
}



/**
 * Method for adding an object.
 * @param {!Object} contents The contents to add to the container.
 * @param {Element=} opt_parent (Optional) The parent to add the contents to 
 *     (i.e. a zippy element).  Defaults to scrollArea_.
 * @param {String=} opt_parentKey (Optional) The key of the parent zippy to 
 *     add the contents to.
 * @private
 */
utils.ui.ScrollableContainer.prototype.addContentsObject_ = 
function (contents, opt_parent, opt_parentKey) {
    var key =  /**@type {!string}*/ '';
    for (key in contents) {
	// NOTE: The below conditional is incase you want to put 
	// the contained object in the 
        // parent folder.  This is because
	// each tree level has to be of the same type.
	//
	// Invalid: 
	// contents[parent] = [Elts] <- creates errors
	// contents[parent][subfolder] = [subElts]
	//
	// Valid: 
	// contents[parent]['parentFolder'] = [Elts] <- puts elts in 
	// contents[parent]
	// contents[parent][subfolder] = [subElts]
	if (key === 'parentFolder'){
	    this.addContents(contents[key],
			     this.contentsDict_[opt_parentKey].content, 
			     opt_parentKey);
	}
	else {
	    // Keep root folders expanded, but sub-folders closed.
	    // expanded = (opt_parent === this.scrollArea_) ? true : false;
	    //window.console.log('\n\nADD ZIPPY', key);
	    this.addZippy(key, opt_parent);
	    this.addContents(contents[key], 
			     this.contentsDict_[key]['content'], key);	
	}
    }
}
