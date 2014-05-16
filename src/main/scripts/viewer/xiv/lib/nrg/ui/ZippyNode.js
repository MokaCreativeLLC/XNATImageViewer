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

// nrg
goog.require('nrg.ui');
goog.require('nrg.string');
goog.require('nrg.ui.Component');



/**
 * A ZippyNode represents a collection of elements releveant to creating
 * a Zippy folder hierarchy (ZippyTree).  
 *
 * @param {!string} The title of the node.
 * @param {!element} The parent element of the zippy.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('nrg.ui.ZippyNode');
nrg.ui.ZippyNode = function (title, parentElement) {
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
    this.header_ = nrg.ui.ZippyNode.createZippyHeader_(title);
    parentElement.appendChild(this.header_); // IMPORTANT!!!!


    /**
     * @type {!Element}
     * @private
     */
    this.headerLabel_ = nrg.ui.ZippyNode.createZippyHeaderLabel_(title);
    this.header_.appendChild(this.headerLabel_);


    /**
     * @type {!Element}
     * @private
     */
    this.expandIcon_ = nrg.ui.ZippyNode.createZippyExpandIcon_(title);
    this.header_.appendChild(this.expandIcon_);


    /**
     * @type {Array.<Element | nrg.ui.ZippyNode>}
     * @private
     */
    this.contentHolder_ = nrg.ui.ZippyNode.createZippyContentHolder_(title);
    parentElement.appendChild(this.contentHolder_); // IMPORTANT!!!!


    /**
     * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
     * @private
     */
    this.Zippy_ = new this.zippyType_(this.header_, this.contentHolder_, true);


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
    this.setZippyEvents_Hover_();
    this.setZippyEvents_ExpandAndCollapse_();
}
goog.inherits(nrg.ui.ZippyNode, nrg.ui.Component);
goog.exportSymbol('nrg.ui.ZippyNode', nrg.ui.ZippyNode);



/**
 * @type {!string} 
 * @expose 
 * @const
 */ 
nrg.ui.ZippyNode.ID_PREFIX = 'nrg.ui.ZippyNode';



/**
 * @enum {string}
 */
nrg.ui.ZippyNode.EventType = {
  EXPANDED: goog.events.getUniqueId('expanded'),
  COLLAPSED: goog.events.getUniqueId('collapsed'),
};



/**
 * @enum {string}
 * @const
 */ 
nrg.ui.ZippyNode.CSS_SUFFIX = {
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
nrg.ui.ZippyNode.createZippyHeaderLabel_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyHeaderLabel_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.ZippyNode.CSS.HEADER_LABEL
    }, nrg.string.truncateString(title, 
       nrg.ui.ZippyNode.MAX_LABEL_LENGTH))
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
nrg.ui.ZippyNode.createZippyExpandIcon_ = function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyExpandIcon_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.ZippyNode.CSS.EXPAND_ICON
    }, '+');
}



/**
 * As stated.
 * @param {!string} title The title of the zippy.
 * @return {!Element} The described element.
 * @private
 */
nrg.ui.ZippyNode.createZippyContentHolder_ = 
function(title){
    return goog.dom.createDom('div', {
	'id': "ZippyContent_" + title + '_' + goog.string.createUniqueString(),
	'class': nrg.ui.ZippyNode.CSS.CONTENT
    });
}



/**
 * As stated.
 * @param {!string} title The key of the zippy.
 * @return {!Element} The header element.
 * @private
 */
nrg.ui.ZippyNode.createZippyHeader_ = function(title) {
    return goog.dom.createDom('div', {
	'id': "ZippyHeader_" + title  + '_' + goog.string.createUniqueString(),
	'class': nrg.ui.ZippyNode.CSS.HEADER
    });
}



/**
 * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @private
 */
nrg.ui.ZippyNode.prototype.zippyType_ = goog.ui.AnimatedZippy;



/**
 * @return {!string} The node title
 * @public
 */
nrg.ui.ZippyNode.prototype.getTitle = function() {
    return this.title_
}



/**
 * @return {Object.<string, goog.ui.ZippyNode>} The node collection.
 * @public
 */
nrg.ui.ZippyNode.prototype.getNodes = function() {
    return this.Nodes_
}



/**
 * As stated.
 * @return {!Element}
 * @public
 */
nrg.ui.ZippyNode.prototype.getHeader = function () { 
    return this.header_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
nrg.ui.ZippyNode.prototype.getContentHolder = function () { 
    return this.contentHolder_ 
};



/**
 * As stated.
 * @return {!Element}
 * @public
 */
nrg.ui.ZippyNode.prototype.getHeaderLabel = function () { 
    return this.headerLabel_; 
};



/**
 * As stated.
 * @return {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @public
 */
nrg.ui.ZippyNode.prototype.getZippy = function () { 
    return this.Zippy_; 
};



/**
 * @param {!boolean} exp
 * @public
 */
nrg.ui.ZippyNode.prototype.setExpanded = function (exp) { 
    this.Zippy_.setExpanded(exp);
};




/**
 * As stated.  NOTE: This function needs to be called before contents are set.
 * @return {!boolean} animated 'true' to set the zippys animated, 'false' 
 *     otherwise.
 * @public
 */
nrg.ui.ZippyNode.prototype.setAnimated = function(animated){
    this.zippyType_ = (animated === true) ? goog.ui.AnimatedZippy : 
	goog.ui.Zippy;
}



/**
 * As stated.
 * @private
 */
nrg.ui.ZippyNode.prototype.setZippyEvents_ExpandAndCollapse_ = function() {
    goog.events.listen(this.Zippy_,goog.object.getValues(goog.ui.Zippy.Events), 
    function(e) { 
	if (!this.Zippy_.isBusy()) {
	    if (e.target.isExpanded()) {
		this.onZippyExpanded_();
	    } else {
		this.onZippyCollapsed_();
	    }
	}
    }.bind(this));
}



/**
 * As stated.
 * @private
 */
nrg.ui.ZippyNode.prototype.setZippyEvents_Hover_ = function() {
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOVER, 
		       this.onZippyMouseOver_.bind(this));
    goog.events.listen(this.header_, goog.events.EventType.MOUSEOUT, 
		       this.onZippyMouseOut_.bind(this));
} 



/**
 * Callback for when a zippy is expanded.
 * @private
 */
nrg.ui.ZippyNode.prototype.onZippyExpanded_ = function(){
    this.expandIcon_.innerHTML = '-';
    nrg.style.setStyle(this.expandIcon_, { 'margin-left': '-1em' });
    this.dispatchEvent({
	type: nrg.ui.ZippyNode.EventType.EXPANDED
    });
}



/**
 * As stated.
 * @private
 */
nrg.ui.ZippyNode.prototype.onZippyCollapsed_ = function(){
    this.expandIcon_.innerHTML = '+';
    nrg.style.setStyle(this.expandIcon_, { 'margin-left': '-1.1em' });
    this.dispatchEvent({
	type: nrg.ui.ZippyNode.EventType.COLLAPSED
    });
}



/**
 * @private
 */
nrg.ui.ZippyNode.prototype.onZippyMouseOver_ = function(){
    goog.dom.classes.add(this.header_, 
			 nrg.ui.ZippyNode.CSS.HEADER_MOUSEOVER);
    goog.dom.classes.add(this.expandIcon_, 
			 nrg.ui.ZippyNode.CSS.EXPAND_ICON_MOUSEOVER);
}



/**
 * @private
 */
nrg.ui.ZippyNode.prototype.onZippyMouseOut_ = function(){
    goog.dom.classes.remove(this.header_, 
			    nrg.ui.ZippyNode.CSS.HEADER_MOUSEOVER);
    goog.dom.classes.remove(this.expandIcon_, 
			    nrg.ui.ZippyNode.CSS.EXPAND_ICON_MOUSEOVER);
}



/**
 * @inheritDoc
 */
nrg.ui.ZippyNode.prototype.disposeInternal = function(){
    goog.base(this ,'disposeInternal');


    // Header label
    goog.dom.removeNode(this.headerLabel_);
    delete this.headerLabel_;

    // Expand Icon
    goog.dom.removeNode(this.expandIcon_);
    delete this.expandIcon_;

    // Header
    goog.events.removeAll(this.header_);
    goog.dom.removeNode(this.header_);
    delete this.header_;

    // Holder
    goog.dom.removeNode(this.contentHolder_);
    delete this.contentHolder_;
    
    // Zippy
    if (goog.isDefAndNotNull(this.Zippy_)){
	this.Zippy_.disposeInternal();
	goog.events.removeAll(this.Zippy_);
	delete this.Zippy_;
    }

    // Sub-Nodes
    nrg.ui.disposeComponentMap(this.Nodes_);
    delete this.Nodes_;


    // Storage Key
    delete this.storageKey_;
    delete this.title_;
}



