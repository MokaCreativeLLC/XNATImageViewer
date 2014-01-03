/**
 * @author sunilk@mokacreativellc.com
 */

/**
 * Google closure indcludes
 */
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.string');

/**
 * utils indcludes
 */
goog.require('utils.dom');
goog.require('utils.ui.GenericSlider');




/**
 * utils.ui.ScrollableContainer allows the user to input
 * contents to create a scrollable div.  It's a compound object
 * that uses goog.ui.AnimatedZippy (for condensing contents and 
 * creating folders) and utils.ui.genericSlider for scrolling
 * through the contents.
 *
 * @param {Object=}
 * @constructor
 */
goog.provide('utils.ui.ScrollableContainer');
utils.ui.ScrollableContainer = function (opt_args) {
   
    var parent = opt_args && opt_args['parent'] ? opt_args['parent'] : document.body;
    


    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.makeElement("div", parent, "ScrollableContainer");




    /**
     * @type {!Element}
     * @private
     */
    this.scrollArea_ = utils.dom.makeElement("div", this.element_, "ScrollArea");




    /**
     * @type {!utils.ui.GenericSlider}
     * @private
     */
    this.Slider_ = new utils.ui.GenericSlider({ 'parent': this.element_, 'orientation' : 'vertical'});




    /**
     * @type {utils.ui.ScrollableContainer.contentsDict}
     * @dict
     * @private
     */	
    this.contentsDict_ = {};




    /**
     * @type {!number}
     * @private
     */
    this.defaultIndentation_ = 5;




    /**
     * @type {Object.<number, number>}
     * @dict
     * @private
     */
    this.indentations_ = {};




    //------------------
    // Set Slider UI and callbacks
    //------------------
    this.Slider_.addSlideCallback(this.mapSliderToContents.bind(this));  
    this.Slider_.bindToMouseWheel(this.element_);

    

    //------------------
    // Set style - the container.
    //------------------
    goog.dom.classes.set(this.element_, utils.ui.ScrollableContainer.ELEMENT_CLASS);
    goog.dom.classes.set(this.scrollArea_, utils.ui.ScrollableContainer.SCROLL_AREA_CLASS);



    //------------------
    // Set style - Slider
    //------------------
    goog.dom.classes.add(this.Slider_.element, utils.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS);
    goog.dom.classes.add(this.Slider_.thumb, utils.ui.ScrollableContainer.SLIDER_THUMB_CLASS);
    goog.dom.classes.add(this.Slider_.track, utils.ui.ScrollableContainer.SLIDER_TRACK_CLASS);
    this.Slider_.setHoverClass(utils.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS);


    //------------------
    // Update style
    //------------------
    this.updateStyle();

}
goog.exportSymbol('utils.ui.ScrollableContainer', utils.ui.ScrollableContainer)




/**
 * @constructor
 * @dict
 */
utils.ui.ScrollableContainer.contentsDict;
goog.exportSymbol('utils.ui.ScrollableContainer.contentsDict', utils.ui.ScrollableContainer.contentsDict);




/**
 * @constructor
 * @struct
 */
utils.ui.ScrollableContainer.contentsStruct = function(header, headerLabel, expandIcon, content, zippy, depth){ 
    this.header = /** @type {Element} */header;
    this.headerLabel = /** @type {Element} */headerLabel;
    this.expandIcon = /** @type {Element} */expandIcon;
    this.content = /** @type {Element} */ content;
    this.zippy = /** @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy} */zippy;
    this.depth = /** @type {!number} */depth;
};
goog.exportSymbol('utils.ui.ScrollableContainer.contentsStruct', utils.ui.ScrollableContainer.contentsStruct);





utils.ui.ScrollableContainer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('utils-ui-scrollablecontainer');
utils.ui.ScrollableContainer.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, '');
utils.ui.ScrollableContainer.SCROLL_AREA_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'scrollarea');
utils.ui.ScrollableContainer.SLIDER_ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-widget');
utils.ui.ScrollableContainer.SLIDER_THUMB_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-thumb');
utils.ui.ScrollableContainer.SLIDER_THUMB_HOVERED_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-thumb-hovered');
utils.ui.ScrollableContainer.SLIDER_TRACK_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'slider-track');
utils.ui.ScrollableContainer.ZIPPY_HEADER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyheader');
utils.ui.ScrollableContainer.ZIPPY_HEADER_SUB_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyheader-sub');
utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyheaderlabel');
utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_SUB_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyheaderlabel-sub');
utils.ui.ScrollableContainer.ZIPPY_ICON_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyexpandicon');
utils.ui.ScrollableContainer.ZIPPY_ICON_SUB_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyexpandicon-sub');
utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippycontent');
utils.ui.ScrollableContainer.ZIPPY_CONTENT_SUB_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippycontent-sub');
utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyheader-mouseover');
utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS = /**@type {string} @const*/ goog.getCssName(utils.ui.ScrollableContainer.CSS_CLASS_PREFIX, 'zippyexpandicon-mouseover');





/**
 * @return {!Element}
 * @public
 */
utils.ui.ScrollableContainer.prototype.getElement = function(){
    return this.element_;
}




/**
 * @return {!utils.ui.GenericSlider}
 * @public
 */
utils.ui.ScrollableContainer.prototype.getSlider = function(){
    return this.Slider_;
}




/**
 * @return {!utils.ui.ScrollableContainer.contentsDict}
 * @public
 */
utils.ui.ScrollableContainer.prototype.getContentsDict = function(){
    return this.contentsDict_;
}





/**
 * Refits the sliders track range to suit the height
 * of all of the contents, which is 'scrollArea_'.
 *
 * @public
 */
utils.ui.ScrollableContainer.prototype.mapSliderToContents = function () {

    var widgetHeight = utils.style.dims(this.element_, 'height');
    var scrollAreaHeight = utils.convert.toInt(utils.style.getComputedStyle(this.scrollArea_, 'height'));
    var beforeRange = [this.Slider_.getMinimum(), this.Slider_.getMaximum()];
    var afterRange = [0, scrollAreaHeight - widgetHeight];
    var sliderThumb = this.Slider_.thumb;



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
	var sendVal = Math.abs(this.Slider_.getValue() - 100);
	var remap = utils.convert.remap1D(sendVal, beforeRange, afterRange);
	var t = remap.newVal;
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
 * Generic updateStyle method. 
 *
 * @param {Object=} opt_args
 */
utils.ui.ScrollableContainer.prototype.updateStyle = function (opt_args) {
    if (opt_args) { utils.style.setStyle(this.element_, opt_args) }
}




/**
 * Expand the zippy folder within the contents.
 *
 * @param {!string} zKey
 * @public
 */
utils.ui.ScrollableContainer.prototype.setZippyExpanded = function(zKey) {
    this.contentsDict_[zKey].zippy.setExpanded(true);
}




/**
 * Expands all zippy folders within the contents.
 *
 * @param {boolean=} expand
 * @public
 */
utils.ui.ScrollableContainer.prototype.setZippysExpanded = function(expand) {
    for (zKey in this.contentsDict_){
	this.contentsDict_[zKey].zippy.setExpanded((expand === false) ? false : true);
    }
}




/**
 * Allows user to programitcally scroll to a position within
 * the scrollableContainer.
 *
 * @param {!number|!string} val
 * @public
 */
utils.ui.ScrollableContainer.prototype.scrollTo = function(val) {

    if (typeof val === 'string'){
	val = val.toLowerCase();
	if (val === 'top') {this.Slider_.setValue(this.Slider_.getMaximum());}
	else if (val === 'bottom') {this.Slider_.setValue(this.Slider_.getMinimum());}
    } else {
	this.Slider_.setValue(val);
    }
}




/**
 * Binds the mouse wheel scroll events appropriated for the slider through
 * the provided elements.
 *
 * @param {!Element} element The element to listen for the mousewheel event that triggers the slider to move.
 * @param {function=} opt_callback (Optional) The callback that occurs as the mousewheel scrolls.
 * @public
 */
utils.ui.ScrollableContainer.prototype.bindToMouseWheel = function(element, opt_callback) {
    this.Slider_.bindToMouseWheel(element, opt_callback);
}




/**
 * @param {!Element} element The element to calculate depth from.
 * @return {number} The depth of the element within the container.
 * @public
 */
utils.ui.ScrollableContainer.prototype.getDepth = function(element){
    var depth = 0;
    var parentNode = element.parentNode;
    while (parentNode) {
	if (parentNode.className && parentNode.className.indexOf(utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS) > -1){ depth++;}
	parentNode = parentNode.parentNode;
    }
    return depth
}



/**
 * @param {!Element} element The element to calculate depth from.
 * @return {number} The indentation abount attributed to the depth. 
 * @public
 */
utils.ui.ScrollableContainer.prototype.getNodeIndentation = function(element){
    var depth = this.getDepth(element);
    var indent = this.indentations_[depth];
    if (goog.isDef(indent)){
	return indent;
    } else {
	return depth * this.defaultIndentation_;
    }
}



/**
 * Allows the user to set the indentation of the zippy
 * at a given depth.
 *
 * @param {!number} depth  
 * @param {!number} indentation
 * @public
 */
utils.ui.ScrollableContainer.prototype.setIndentationByDepth = function(depth, indentation){
    this.indentations_[depth] = indentations;
}




/**
 * Checks if a given zippy exists within the contents.
 *
 * @param {!string} zKey
 * @return {boolean}
 * @public
 */
utils.ui.ScrollableContainer.prototype.zippyExists = function(zKey) {
   return zKey in this.contentsDict_;
}




/**
 * Adds a zippy to the contents of the main element.
 *
 * @param {!string} zKey
 * @param {Element=} opt_parent
 * @return {goog.ui.AnimatedZippy}
 * @public
 */
utils.ui.ScrollableContainer.prototype.addZippy = function(zKey, opt_parent) {

    var header, headerLabel, expandIcon, content, zippy;		
    var counter = 0;


    //------------------
    // Set the parent to the scroll area or to the optional parent.
    //------------------
    opt_parent = opt_parent ? opt_parent : this.scrollArea_



    //------------------
    // Zippy header
    //------------------
    for (var key in this.contentsDict_) { counter++; }



    //------------------
    // Return if zippy exists
    //------------------
    if (this.contentsDict_[zKey] !== undefined) { return;}



    //------------------
    // Zippy header margins need to be differentiated between the top one and others.
    // because the top one needs to be at the top of the contents and others need
    // to have a margin.
    //------------------
    header = utils.dom.makeElement("div", opt_parent, "ZippyHeader_" + zKey);
    if (!counter) header.style.marginTop = '0px'; 
    header.key = zKey;
    



    //------------------
    // Set the zippy label.
    //------------------
    headerLabel = utils.dom.makeElement("div", header, "ZippyHeaderLabel_" + zKey);
    headerLabel.innerHTML = goog.string.toTitleCase(zKey);
    
    


    //------------------
    // Shorten the innerHTML if too long.
    //------------------
    var maxLabelLength = 30;
    if (headerLabel.innerHTML.length > maxLabelLength){
	headerLabel.innerHTML = headerLabel.innerHTML.substring(0, maxLabelLength - 3) + '...';
    }

    

    //------------------
    // Add the Zippy expand icon
    //------------------
    expandIcon = utils.dom.makeElement("div", header, "ZippyExpandIcon_" + zKey);
    expandIcon.innerHTML = "+";
    
    


    //------------------
    // Add Zippy content
    //------------------
    content = utils.dom.makeElement("div", opt_parent, "ZippyContent_" + zKey);
    

    
    
    //------------------
    // Create goog.ui.AnimatedZippy
    //------------------
    zippy = new goog.ui.AnimatedZippy(header, content, true);
    


    
    //------------------
    // Set Expand content event.
    //------------------
    var EVENTS = goog.object.getValues(goog.ui.Zippy.Events);
    goog.events.listen(zippy, EVENTS, function(e) { 		
	
	//
	// Create a map that allows the slider to move
	// the contents in proportion to the slider.
	//
	this.mapSliderToContents(this.Slider_, this);		
	

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
    
    
    
    //------------------
    // Define Hover function (style change)
    //------------------
    function applyHover(cssObj, e) {
	(e.target == e.currentTarget) ? utils.style.setStyle(e.target, cssObj) : 
	    utils.style.setStyle(goog.dom.getAncestorByClass(e.target, 
							     utils.ui.ScrollableContainer.ZIPPY_HEADER_CLASS), cssObj)	
	utils.style.setStyle(expandIcon, cssObj['iconColor']);  
    }


    
    //------------------
    // Apply general CSS
    //------------------
    goog.dom.classes.add(header, utils.ui.ScrollableContainer.ZIPPY_HEADER_CLASS);
    goog.dom.classes.add(headerLabel, utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_CLASS);
    goog.dom.classes.add(expandIcon, utils.ui.ScrollableContainer.ZIPPY_ICON_CLASS);
    goog.dom.classes.add(content, utils.ui.ScrollableContainer.ZIPPY_CONTENT_CLASS);



    //------------------
    // Apply Zippy indentation in container div (CSS)
    //------------------
    this.indentHeaders_();

    
    //var depth = this.getDepth(header);
    //goog.dom.classes.add(header, utils.ui.ScrollableContainer.ZIPPY_HEADER_SUB_CLASS);
    //goog.dom.classes.add(headerLabel, utils.ui.ScrollableContainer.ZIPPY_HEADER_LABEL_SUB_CLASS);
    //goog.dom.classes.add(expandIcon, utils.ui.ScrollableContainer.ZIPPY_ICON_SUB_CLASS);
    //goog.dom.classes.add(content, utils.ui.ScrollableContainer.ZIPPY_CONTENT_SUB_CLASS);
    


    //------------------
    // Define Mouseover, Mouseout functions.
    //------------------
    goog.events.listen(header, goog.events.EventType.MOUSEOVER, function(){
	goog.dom.classes.add(header, utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS);
	goog.dom.classes.add(expandIcon, utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS);
    });
    goog.events.listen(header, goog.events.EventType.MOUSEOUT, function(){
	goog.dom.classes.remove(header, utils.ui.ScrollableContainer.ZIPPY_HEADER_MOUSEOVER_CLASS);
	goog.dom.classes.remove(expandIcon, utils.ui.ScrollableContainer.ZIPPY_ICON_MOUSEOVER_CLASS);
    });	   
    



    //------------------
    // Record all of the relevant objects
    //------------------
    this.contentsDict_[zKey] = new utils.ui.ScrollableContainer.contentsStruct(
	header,
	headerLabel,
	expandIcon, 
	content, 
	zippy,
	this.getDepth(header)
    );

    //this.contentsDict_[zKey]['header'] = header;
    //this.contentsDict_[zKey]['depth'] = this.getDepth(header);
    //this.contentsDict_[zKey]['headerLabel'] = headerLabel;
    //this.contentsDict_[zKey]['expandIcon'] = expandIcon;
    //this.contentsDict_[zKey]['content'] = content;
    //this.contentsDict_[zKey]['zippy'] = zippy;




    //------------------
    // Return the zippy.
    //------------------
    return zippy;
}



/**
 *
 * @private
 */
utils.ui.ScrollableContainer.prototype.indentHeaders_ = function(){

    var furthestIndent = 0;
    for (key in this.contentsDict_){ 
	var header = this.contentsDict_[key].header;
	furthestIndent = this.getNodeIndentation(header);
    }
    var width = 100 - furthestIndent;   


    for (key in this.contentsDict_){
	var header = this.contentsDict_[key].header;
	var indentPct = this.getNodeIndentation(header);
	header.style.left = (indentPct).toString() + '%';
	header.style.width = (width).toString() + '%';
    }
}







/**
 * Semi-recursive contents adder for programatically adding
 * contents to the container, where the contents have a hierarchy.
 * (i.e. there are main zippys, main contents, and sub-zippys and
 * sub-contents).
 *
 * For instance, say you want the contents to resemble this:
 *
 * MAIN_ZIPPY:
 *   |- (main contents)
 *   |- SUB_ZIPPY_1
 *      |- (sub contents 1)
 *   |- SUB_ZIPPY_2
 *      |- (sub contents 2)
 *
 * @param {!Element|!Objects|!Array} contents
 * @param {Element=} opt_parent
 * @param {String=} opt_parentKey
 */
utils.ui.ScrollableContainer.prototype.addContents = function (contents, opt_parent, opt_parentKey) {

    //------------------
    // Set the parent element to the 'scrollArea' (main contents div)
    // if none is provided.
    //------------------
    opt_parent =  opt_parent ? opt_parent : this.scrollArea_;



    //------------------
    // For 'contents' Elements...
    //------------------
    if (goog.dom.isElement(contents)) {

	// All contents need to be relatively positioned.
	utils.style.setStyle(contents, {'position': 'relative'});
	
	// Add element to the parent Element
	goog.dom.appendChild(opt_parent, contents);


	// Indent the contents
	this.indentHeaders_();
	contents.style.left = (this.getNodeIndentation(opt_parent)).toString() + '%';


	// When there's no zippy parent folder, we set the height
	// of the main element_ to the scroll area.
	if (utils.style.dims(this.element_, 'height') === 0 && opt_parent === this.scrollArea_){
	    utils.style.setStyle(this.element_, {'height': utils.style.dims(this.scrollArea_, 'height')});
	}

	// Allows user to move the contents when sliding the slider.
	this.mapSliderToContents(this.Slider_, this);

	// Do we expand the zippy?
	//this.expandZippy(opt_parentKey);
    	


    //------------------
    // For 'contents'  arrays...
    //------------------
    } else if (goog.isArray(contents)){
	for (var i=0, len = contents.length; i < len; i++) {
	    this.addContents(contents[i], opt_parent, opt_parentKey);
	}
    	


    //------------------
    // For 'contents' objects...
    //------------------
    } else if (goog.isObject(contents)){
	for (var key in contents) {
	    //
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
	    // contents[parent]['parentFolder'] = [Elts] <- puts elts in contents[parent]
	    // contents[parent][subfolder] = [subElts]
	    //
	    if (key === 'parentFolder'){
		this.addContents(contents[key], this.contentsDict_[opt_parentKey].content, opt_parentKey);
	    }
	    else {
		//
		// Keep root folders expanded, but sub-folders closed.
		// expanded = (opt_parent === this.scrollArea_) ? true : false;
		//
		this.addZippy(key, opt_parent);
		this.addContents(contents[key], this.contentsDict_[key].content, key);	
	    }
	}
    }
}
