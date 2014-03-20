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

// moka
goog.require('moka.string');
goog.require('moka.ui.Component');



/**
 * A ZippyNode represents a collection of elements releveant to creating
 * a Zippy folder hierarchy (ZippyTree).  
 * @param {!string} The title of the node.
 * @param {!element} The parent element of the zippy.
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('moka.ui.ZippyNode');
moka.ui.ZippyNode = function (title, parentElement) {
    goog.base(this);

    /**
     * @type {!string}
     * @private
     */
    this.title_ = title;


    /**
     * @type {!Element}
     * @private
     */
    this.header_ = moka.ui.ZippyNode.createZippyHeader_(title);
    parentElement.appendChild(this.header_); // IMPORTANT!!!!


    /**
     * @type {!Element}
     * @private
     */
    this.headerLabel_ = moka.ui.ZippyNode.createZippyHeaderLabel_(title);
    this.header_.appendChild(this.headerLabel_);


    /**
     * @type {!Element}
     * @private
     */
    this.expandIcon_ = moka.ui.ZippyNode.createZippyExpandIcon_(title);
    this.header_.appendChild(this.expandIcon_);


    /**
     * @type {Array.<Element | moka.ui.ZippyNode>}
     * @private
     */
    this.contentHolder_ = moka.ui.ZippyNode.createZippyContentHolder_(title);
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


    this.setZippyEvets_Hover_();
    this.setZippyEvents_ExpandAndCollapse_();
}
goog.inherits(moka.ui.ZippyNode, moka.ui.Component);
goog.exportSymbol('moka.ui.ZippyNode', moka.ui.ZippyNode);



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
moka.ui.ZippyNode.ID_PREFIX = 'moka.ui.ZippyNode';



/**
 * @enum {string}
 */
moka.ui.ZippyNode.EventType = {
  EXPANDED: goog.events.getUniqueId('expanded'),
  COLLAPSED: goog.events.getUniqueId('contracted'),
};



/**
 * @enum {string}
 * @const
 */ 
moka.ui.ZippyNode.CSS_SUFFIX = {
    HEADER: 'header',
    HEADER_MOUSEOVER: 'header-mouseover',
    HEADER_LABEL: 'header-label',
    EXPAND_ICON: 'expandicon',
    EXPAND_ICON_MOUSEOVER: 'expandicon-mouseover',
    CONTENT: 'content',
    CONTENT: 'content-sub'
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The header label.
 * @private
 */
moka.ui.ZippyNode.createZippyHeaderLabel_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyHeaderLabel_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': moka.ui.ZippyNode.CSS.HEADER_LABEL
    }, moka.string.truncateString(title, 
       moka.ui.ZippyNode.MAX_LABEL_LENGTH))
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
moka.ui.ZippyNode.createZippyExpandIcon_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyExpandIcon_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': moka.ui.ZippyNode.CSS.EXPAND_ICON
    }, '+');
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
moka.ui.ZippyNode.createZippyContentHolder_ = 
function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyContent_" + title + '_' + goog.string.createUniqueString(),
	'class': moka.ui.ZippyNode.CSS.CONTENT
    });
}



/**
 * As stated.
 * @param {!string} title The key of the zippy.
 * @return {!Element} The header element.
 * @private
 */
moka.ui.ZippyNode.createZippyHeader_ = function(title) {
    return goog.dom.createDom('div', {
	'id': "ZippyHeader_" + title  + '_' + goog.string.createUniqueString(),
	'class': moka.ui.ZippyNode.CSS.HEADER
    });
}



/**
 * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @private
 */
moka.ui.ZippyNode.prototype.zippyType_ = goog.ui.AnimatedZippy;



/**
 * As stated.
 * @return {Object.<string, goog.ui.ZippyNode>} The node collection.
 * @public
 */
moka.ui.ZippyNode.prototype.getNodes = function() {
    return this.Nodes_
}



/**
 * As stated.
 * @return {!Element}
 * @public
 */
moka.ui.ZippyNode.prototype.getHeader = function () { 
    return this.header_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
moka.ui.ZippyNode.prototype.getContentHolder = function () { 
    return this.contentHolder_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
moka.ui.ZippyNode.prototype.getHeaderLabel = function () { 
    return this.headerLabel_; 
};



/**
 * As stated.
 * @return {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @public
 */
moka.ui.ZippyNode.prototype.getZippy = function () { 
    return this.zippy_; 
};



/**
 * As stated.  NOTE: This function needs to be called before contents are set.
 * @return {!boolean} animated 'true' to set the zippys animated, 'false' 
 *     otherwise.
 * @public
 */
moka.ui.ZippyNode.prototype.setAnimated = function(animated){
    this.zippyType_ = (animated === true) ? goog.ui.AnimatedZippy : 
	goog.ui.Zippy;
}



/**
 * As stated.
 * @private
 */
moka.ui.ZippyNode.prototype.setZippyEvents_ExpandAndCollapse_ = function() {
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
moka.ui.ZippyNode.prototype.setZippyEvets_Hover_ = function() {
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOVER, 
		       this.onZippyMouseOver_.bind(this));
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOUT, 
		       this.onZippyMouseOut_.bind(this));
} 



/**
 * Callback for when a zippy is expanded.
 * @private
 */
moka.ui.ZippyNode.prototype.onZippyExpanded_ = function(){
    this.expandIcon_.innerHTML = '-';
    moka.style.setStyle(this.expandIcon_, { 'margin-left': '-1em' });
    this.dispatchEvent({
	type: moka.ui.ZippyNode.EventType.EXPANDED
    });
}



/**
 * As stated.
 * @private
 */
moka.ui.ZippyNode.prototype.onZippyCollapsed_ = function(){
    this.expandIcon_.innerHTML = '+';
    moka.style.setStyle(this.expandIcon_, { 'margin-left': '-1.1em' });
    this.dispatchEvent({
	type: moka.ui.ZippyNode.EventType.COLLAPSED
    });
}



/**
 * As stated.
 * @private
 */
moka.ui.ZippyNode.prototype.onZippyMouseOver_ = function(){
    goog.dom.classes.add(this.header_, 
			 moka.ui.ZippyNode.CSS.HEADER_MOUSEOVER);
    goog.dom.classes.add(this.expandIcon_, 
			 moka.ui.ZippyNode.CSS.EXPAND_ICON_MOUSEOVER);
}



/**
 * As stated.
 * @private
 */
moka.ui.ZippyNode.prototype.onZippyMouseOut_ = function(){
    goog.dom.classes.remove(this.header_, 
			    moka.ui.ZippyNode.CSS.HEADER_MOUSEOVER);
    goog.dom.classes.remove(this.expandIcon_, 
			    moka.ui.ZippyNode.CSS.EXPAND_ICON_MOUSEOVER);
}

