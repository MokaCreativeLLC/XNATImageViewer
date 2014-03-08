/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');
goog.require('goog.dom.classes');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy.Events');
goog.require('goog.ui.Zippy');

// utils
goog.require('utils.string');
goog.require('utils.events.EventManager');



/**
 * A ZippyNode represents a collection of elements releveant to creating
 * a Zippy folder hierarchy (ZippyTree).  
 * @param {!string} The title of the node.
 * @param {!element} The parent element of the zippy.
 * @constructor
 */
goog.provide('utils.ui.ZippyNode');
utils.ui.ZippyNode = function (title, parentElement) {

    /**
     * @type {!string}
     * @private
     */
    this.title_ = title;


    /**
     * @type {!Element}
     * @private
     */
    this.header_ = utils.ui.ZippyNode.createZippyHeader_(title);
    parentElement.appendChild(this.header_); // IMPORTANT!!!!


    /**
     * @type {!Element}
     * @private
     */
    this.headerLabel_ = utils.ui.ZippyNode.createZippyHeaderLabel_(title);
    this.header_.appendChild(this.headerLabel_);


    /**
     * @type {!Element}
     * @private
     */
    this.expandIcon_ = utils.ui.ZippyNode.createZippyExpandIcon_(title);
    this.header_.appendChild(this.expandIcon_);


    /**
     * @type {Array.<Element | utils.ui.ZippyNode>}
     * @private
     */
    this.contentHolder_ = utils.ui.ZippyNode.createZippyContentHolder_(title);
    parentElement.appendChild(this.contentHolder_); // IMPORTANT!!!!


    /**
     * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
     * @private
     */
    this.zippy_ = new this.zippyType_(this.header_, this.contentHolder_, true);


    /**
     * @type {!string}
     * @private
     */
    this.storageKey_ = goog.getUid(this);


    /**
     * @type {!Object.<string, goog.ui.ZippyNode>}
     * @private
     */
    this.Nodes_ = {};

    // Events
    utils.events.EventManager.addEventManager(this, 
					      utils.ui.ZippyNode.EventType);
    this.setZippyEvets_Hover_();
    this.setZippyEvents_ExpandAndCollapse_();
}
goog.exportSymbol('utils.ui.ZippyNode', utils.ui.ZippyNode);



/**
 * Event types.
 * @enum {string}
 */
utils.ui.ZippyNode.EventType = {
  EXPANDED: goog.events.getUniqueId('expanded'),
  COLLAPSED: goog.events.getUniqueId('contracted'),
};



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.CSS_CLASS_PREFIX = 
    goog.getCssName('utils-ui-zippynode');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_HEADER_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyheader');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_HEADER_SUB_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyheader-sub');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_HEADER_LABEL_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyheaderlabel');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_HEADER_LABEL_SUB_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyheaderlabel-sub');

/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_ICON_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyexpandicon');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_ICON_SUB_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyexpandicon-sub');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_CONTENT_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 'zippycontent');



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_CONTENT_SUB_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippycontent-sub');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_HEADER_MOUSEOVER_CLASS =  
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyheader-mouseover');


/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
utils.ui.ZippyNode.ZIPPY_ICON_MOUSEOVER_CLASS = 
goog.getCssName(utils.ui.ZippyNode.CSS_CLASS_PREFIX, 
		'zippyexpandicon-mouseover');



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The header label.
 * @private
 */
utils.ui.ZippyNode.createZippyHeaderLabel_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyHeaderLabel_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': utils.ui.ZippyNode.ZIPPY_HEADER_LABEL_CLASS
    }, utils.string.truncateString(title, 
       utils.ui.ZippyNode.MAX_LABEL_LENGTH))
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
utils.ui.ZippyNode.createZippyExpandIcon_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyExpandIcon_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': utils.ui.ZippyNode.ZIPPY_ICON_CLASS
    }, '+');
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
utils.ui.ZippyNode.createZippyContentHolder_ = 
function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyContent_" + title + '_' + goog.string.createUniqueString(),
	'class': utils.ui.ZippyNode.ZIPPY_CONTENT_CLASS
    });
}



/**
 * As stated.
 * @param {!string} title The key of the zippy.
 * @return {!Element} The header element.
 * @private
 */
utils.ui.ZippyNode.createZippyHeader_ = function(title) {
    return goog.dom.createDom('div', {
	'id': "ZippyHeader_" + title  + '_' + goog.string.createUniqueString(),
	'class': utils.ui.ZippyNode.ZIPPY_HEADER_CLASS
    });
}



/**
 * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @private
 */
utils.ui.ZippyNode.prototype.zippyType_ = goog.ui.AnimatedZippy;



/**
 * As stated.
 * @return {Object.<string, goog.ui.ZippyNode>} The node collection.
 * @public
 */
utils.ui.ZippyNode.prototype.getNodes = function() {
    return this.Nodes_
}



/**
 * As stated.
 * @return {!Element}
 * @public
 */
utils.ui.ZippyNode.prototype.getHeader = function () { 
    return this.header_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
utils.ui.ZippyNode.prototype.getContentHolder = function () { 
    return this.contentHolder_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
utils.ui.ZippyNode.prototype.getHeaderLabel = function () { 
    return this.headerLabel_; 
};



/**
 * As stated.
 * @return {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @public
 */
utils.ui.ZippyNode.prototype.getZippy = function () { 
    return this.zippy_; 
};



/**
 * As stated.  NOTE: This function needs to be called before contents are set.
 * @return {!boolean} animated 'true' to set the zippys animated, 'false' 
 *     otherwise.
 * @public
 */
utils.ui.ZippyNode.prototype.setAnimated = function(animated){
    this.zippyType_ = (animated === true) ? goog.ui.AnimatedZippy : 
	goog.ui.Zippy;
}



/**
 * As stated.
 * @private
 */
utils.ui.ZippyNode.prototype.setZippyEvents_ExpandAndCollapse_ = function() {
    goog.events.listen(this.zippy_,goog.object.getValues(goog.ui.Zippy.Events), 
    function(e) { 		
	if (e.target.isExpanded()) {
	    this.onZippyExpanded_();
	} else {
	    this.onZippyCollapsed_();
	}
    }.bind(this));
}



/**
 * As stated.
 * @private
 */
utils.ui.ZippyNode.prototype.setZippyEvets_Hover_ = function() {
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOVER, 
		       this.onZippyMouseOver_.bind(this));
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOUT, 
		       this.onZippyMouseOut_.bind(this));
} 



/**
 * Callback for when a zippy is expanded.
 * @private
 */
utils.ui.ZippyNode.prototype.onZippyExpanded_ = function(){
    this.expandIcon_.innerHTML = '-';
    utils.style.setStyle(this.expandIcon_, { 'margin-left': '-1em' });
    this['EVENTS'].runEvent('EXPANDED', this);
}



/**
 * As stated.
 * @private
 */
utils.ui.ZippyNode.prototype.onZippyCollapsed_ = function(){
    this.expandIcon_.innerHTML = '+';
    utils.style.setStyle(this.expandIcon_, { 'margin-left': '-1.1em' });
    this['EVENTS'].runEvent('COLLAPSED', this);
}



/**
 * As stated.
 * @private
 */
utils.ui.ZippyNode.prototype.onZippyMouseOver_ = function(){
    goog.dom.classes.add(this.header_, 
			 utils.ui.ZippyNode.ZIPPY_HEADER_MOUSEOVER_CLASS);
    goog.dom.classes.add(this.expandIcon_, 
			 utils.ui.ZippyNode.ZIPPY_ICON_MOUSEOVER_CLASS);
}



/**
 * As stated.
 * @private
 */
utils.ui.ZippyNode.prototype.onZippyMouseOut_ = function(){
    goog.dom.classes.remove(this.header_, 
			    utils.ui.ZippyNode.ZIPPY_HEADER_MOUSEOVER_CLASS);
    goog.dom.classes.remove(this.expandIcon_, 
			    utils.ui.ZippyNode.ZIPPY_ICON_MOUSEOVER_CLASS);
}

