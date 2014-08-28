/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ZippyNode');

// goog
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy.Events');
goog.require('goog.ui.Zippy');
goog.require('goog.dom.classes');
goog.require('goog.Timer');

// nrg
goog.require('nrg.string');
goog.require('nrg.ui.Component');
goog.require('nrg.style');
goog.require('nrg.fx');


/**
 * A ZippyNode represents a collection of elements releveant to creating
 * a Zippy folder hierarchy (ZippyTree).  
 *
 * @param {!string} title The title of the node.
 * @param {!element} parentElement The parent element of the zippy.
 * @param {boolean=} opt_expanded Defaults to false.
 * @param {Function=} opt_insertMethod The optional insert method.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
nrg.ui.ZippyNode = 
function (title, parentElement, opt_expanded, opt_insertMethod) {
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

    //
    // Sort tag
    //
    this.header_[nrg.ui.ZippyNode.NODE_STORT_TAG] = title.toLowerCase();

    if (goog.isDefAndNotNull(opt_insertMethod)) {
	opt_insertMethod(parentElement, this.header_);
    }
    else {
	goog.dom.appendChild(parentElement, this.header_);
	//rentElement.appendChild(this.header_); // IMPORTANT!!!!
    }

    /**
     * @type {!Element}
     * @private
     */
    this.headerLabel_ = nrg.ui.ZippyNode.createZippyHeaderLabel_(title);
    this.truncateHeaderLabel();
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
    //this.contentHolder_.style.marginTop = '20px';

    /**
     * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
     * @private
     */
    this.Zippy_ = new this.zippyType_(this.header_, this.contentHolder_, 
		      goog.isDefAndNotNull(opt_expanded) ? 
				      opt_expanded : false);

    if (this.Zippy_ instanceof goog.ui.AnimatedZippy){
	this.Zippy_.animationDuration = 500;
    }


    /**
     * @type {!string}
     * @private
     */
    this.storageKey_ = goog.getUid(this);


    /**
     * @type {!Object.<string, nrg.ui.ZippyNode>}
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
  CLICKED: goog.events.getUniqueId('clicked'),
};



/**
 * @enum {string}
 * @expose
 */ 
nrg.ui.ZippyNode.CSS_SUFFIX = {
    HEADER: 'header',
    HEADER_MOUSEOVER: 'header-mouseover',
    HEADER_LABEL: 'header-label',
    EXPAND_ICON: 'expandicon',
    EXPAND_ICON_MOUSEOVER: 'expandicon-mouseover',
    CONTENT: 'content',
    CONTENT: 'content-sub',
    LOADING_HOLDER: 'loading-holder',
    LOADING_TEXT: 'loading-text',
    LOADING_IMAGE: 'loading-image',
}




/**
 * @type {!number} 
 * @const
 */ 
nrg.ui.ZippyNode.ANIMATION_DURATION = 500;


/**
 * @param {!string} title The title of the zippy.
 * @return {!Element} The header label.
 * @private
 */
nrg.ui.ZippyNode.createZippyHeaderLabel_ = function(title){
    var label = goog.dom.createDom('div', {
	'id': "ZippyHeaderLabel_" + title + '_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.ZippyNode.CSS.HEADER_LABEL
    })
    return label;
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
 * @param {!Array.<nrg.ui.ZippyNode> | !Array.<string>} nodes
 * @param {?nrg.ui.ZippyNode} opt_startNode
 * @param {?Function} opt_expandCallback
 * @private
 */
nrg.ui.ZippyNode.serialExpand = 
function(nodes, opt_startNode, opt_expandCallback) {
    //window.console.log(nodes);
    var node = nodes[0];
    if (goog.isString(node) && goog.isDefAndNotNull(opt_startNode)){
	//window.console.log(node, opt_startNode.getNodes());
	node = opt_startNode.getNodes()[node];
    }

    node.getZippy().animationDuration = 200;
    var content = node.getContentHolder();
    if (nodes.length > 1 && !node.getZippy().isExpanded()){
	goog.events.listenOnce(
	    node, 
	    nrg.ui.ZippyNode.EventType.EXPANDED, function(){
		node.getZippy().animationDuration = 
		    nrg.ui.ZippyNode.ANIMATION_DURATION;
		nrg.ui.ZippyNode.serialExpand(
		    goog.array.slice(nodes, 1), node, opt_expandCallback);
	    })
    } 
    node.setExpanded(true);

    if (goog.isDefAndNotNull(opt_expandCallback)){
	opt_expandCallback(node, nodes);
    }
}





/**
 * @const
 */
nrg.ui.ZippyNode.NODE_STORT_TAG = goog.string.createUniqueString();



/**
 * @type {!goog.ui.AnimatedZippy | !goog.ui.Zippy}
 * @private
 */
nrg.ui.ZippyNode.prototype.zippyType_ = goog.ui.AnimatedZippy;







/**
 * @param {number=} opt_max Defaults to 45
 * @public
 */
nrg.ui.ZippyNode.prototype.truncateHeaderLabel = function(opt_max){

    opt_max = goog.isDefAndNotNull(opt_max) ? opt_max : 45;

    var label = this.headerLabel_;
    //window.console.log(this.headerLabel_);

    // 
    // Truncate accordingly
    //
    var htmlStrippedTitle = this.title_.replace(/<(?:.|\n)*?>/gm, '').
	replace('&nbsp', ' ');

    if (htmlStrippedTitle.length < this.title_){
	label.innerHTML = goog.string.truncateMiddle(this.title_, opt_max + 60);
    } else if (htmlStrippedTitle.length == this.title_.length) {
	label.innerHTML = goog.string.truncateMiddle(this.title_, opt_max);
    } else {
	label.innerHTML = this.title_;
    }
    return label;
}




/**
 * @type {!Element}
 * @public
 */
nrg.ui.ZippyNode.prototype.loadingIndicator_ = null;



/**
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyNode.prototype.hasLoadingIndicator = function(){
    return goog.isDefAndNotNull(this.loadingIndicator_);
}



/**
 * @type {!boolean}
 * @private
 */
nrg.ui.ZippyNode.prototype.loadingIndicatorRemoving_ = false;



/**
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyNode.prototype.loadingIndicatorRemoving = function(){
    return this.loadingIndicatorRemoving_;
}


/**
 * @param {boolean=} opt_fadeOut
 * @param {Function=} opt_onFadeOutEnd
 * @public
 */
nrg.ui.ZippyNode.prototype.removeLoadingIndicator = 
function(opt_fadeOut, opt_onFadeOutEnd){

    var removeLI = function(){
	goog.dom.removeNode(this.loadingIndicator_);
	this.loadingIndicator_ = null;
    }.bind(this);

    if (opt_fadeOut){
	this.loadingIndicatorRemoving_ = true;
	nrg.fx.fadeTo(this.loadingIndicator_, 500, 0, function(){
	    removeLI();
	    if (goog.isDefAndNotNull(opt_onFadeOutEnd)){
		opt_onFadeOutEnd();
	    }
	}, 1)

	return;
    }

    removeLI();
}



/**
 * @public
 */
nrg.ui.ZippyNode.prototype.addLoadingIndicator = 
function() {
    // We don't need to create a new one if it's already there
    if (goog.isDefAndNotNull(this.loadingIndicator_)) return;

    this.loadingIndicator_ = goog.dom.createDom('div', {
	'id': 'LoadingHolder_' + goog.string.createUniqueString()
    });
    goog.dom.classes.add(this.loadingIndicator_, 
			nrg.ui.ZippyNode.CSS.LOADING_HOLDER);

    var loadingText = goog.dom.createDom('div');
    goog.dom.classes.add(loadingText, 
			nrg.ui.ZippyNode.CSS.LOADING_TEXT);
    loadingText.innerHTML = 'Loading...';

    var loadingImg = goog.dom.createDom('img');
    goog.dom.classes.add(loadingImg, 
			nrg.ui.ZippyNode.CSS.LOADING_IMAGE);
    loadingImg.src =  serverRoot + 
	'/images/viewer/xiv/ui/other/loading.gif';

    //window.console.log(this.loadingIndicator_);
    goog.dom.append(this.loadingIndicator_, loadingText);
    goog.dom.append(this.loadingIndicator_, loadingImg);
    goog.dom.append(this.getContentHolder(), this.loadingIndicator_);

    this.loadingIndicator_.style.opacity = 0;
    nrg.fx.fadeIn(this.loadingIndicator_, 300);
    this.loadingIndicatorRemoving_ = false;
}



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
 * @param {!boolean} val
 * @public
 */
nrg.ui.ZippyNode.prototype.showExpandIcon = function(val) { 
    this.expandIcon_.style.visibility = (val == true) ? 'visible' : 'hidden';
};




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
    //window.console.log("ZIP", this.Zippy_, this.Zippy_.isExpanded(), exp);
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
    goog.events.listen(
	this.Zippy_,
	goog.object.getValues(goog.ui.Zippy.Events), 
	function(e) { 
	    if (!this.Zippy_.isBusy()) {
		if (e.target.isExpanded()) {
		    this.onZippyExpanded_();
		} else {
		    this.onZippyCollapsed_();
		}
	    }
	    else {
		this.onZippyClicked_();
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
nrg.ui.ZippyNode.prototype.onZippyClicked_ = function(){
    this.dispatchEvent({
	type: nrg.ui.ZippyNode.EventType.CLICKED
    });
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
 * @param {!string} subNodeText
 * @param {!number} index
 * @private
 */
nrg.ui.ZippyNode.prototype.putSubNodeAt = function(subNodeText, folderIndex) {

    var contentHolder = this.contentHolder_;
    var holderChildren = goog.dom.getChildren(contentHolder);
    var holderContentsLen = holderChildren.length;
    var i = 0;
    var len = holderChildren.length;
    var j, len2, header, isLabel, isTheSubNode, _Header, _Holder;

    //
    // Get all the holder elements and the content element
    //
    for (; i<len; i++){
	if (goog.dom.classlist.contains(
	    holderChildren[i], nrg.ui.ZippyNode.CSS.HEADER)){
	    j = 0;
	    len2 = holderChildren[i].childNodes.length;
	    for (; j<len2; j++) {
		headerChild = holderChildren[i].childNodes[j];
		isLabel = goog.dom.classlist.contains(
		    headerChild, nrg.ui.ZippyNode.CSS.HEADER_LABEL);
		isTheSubNode = headerChild.innerHTML.indexOf(subNodeText) > -1;
		if (isLabel && isTheSubNode){
		    _Header = holderChildren[i];
		    _Holder = holderChildren[i+1];
		    break;
		}
	    }
	} 
	if (goog.isDefAndNotNull(_Header)) { break }
    }

    if (goog.isDefAndNotNull(_Header)) {
	goog.dom.insertChildAt(contentHolder, _Header, folderIndex);
	goog.dom.insertChildAt(contentHolder, _Holder, folderIndex + 1);
    }

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
	this.Zippy_.dispose();
	goog.events.removeAll(this.Zippy_);
	delete this.Zippy_;
    }

    if (goog.isDefAndNotNull(this.loadingIndicator_)){
	this.removeLoadingIndicator();
	delete this.loadingIndicator_;
    }
    // Sub-Nodes
    this.disposeComponentMap(this.Nodes_);
    delete this.Nodes_;


    // Storage Key
    delete this.storageKey_;
    delete this.title_;
}



goog.exportSymbol('nrg.ui.ZippyNode.ID_PREFIX', nrg.ui.ZippyNode.ID_PREFIX);
goog.exportSymbol('nrg.ui.ZippyNode.EventType', nrg.ui.ZippyNode.EventType);
goog.exportSymbol('nrg.ui.ZippyNode.CSS_SUFFIX', nrg.ui.ZippyNode.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ZippyNode.NODE_STORT_TAG',
	nrg.ui.ZippyNode.NODE_STORT_TAG);
goog.exportSymbol('nrg.ui.ZippyNode.serialExpand',
	nrg.ui.ZippyNode.serialExpand);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.truncateHeaderLabel',
	nrg.ui.ZippyNode.prototype.truncateHeaderLabel);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getTitle',
	nrg.ui.ZippyNode.prototype.getTitle);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.addLoadingImage',
	nrg.ui.ZippyNode.prototype.addLoadingImage);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getNodes',
	nrg.ui.ZippyNode.prototype.getNodes);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getHeader',
	nrg.ui.ZippyNode.prototype.getHeader);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getContentHolder',
	nrg.ui.ZippyNode.prototype.getContentHolder);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getHeaderLabel',
	nrg.ui.ZippyNode.prototype.getHeaderLabel);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.showExpandIcon',
	nrg.ui.ZippyNode.prototype.showExpandIcon);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.getZippy',
	nrg.ui.ZippyNode.prototype.getZippy);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.setExpanded',
	nrg.ui.ZippyNode.prototype.setExpanded);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.setAnimated',
	nrg.ui.ZippyNode.prototype.setAnimated);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.hasLoadingIndicator',
	nrg.ui.ZippyNode.prototype.hasLoadingIndicator);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.addLoadingIndicator',
	nrg.ui.ZippyNode.prototype.addLoadingIndicator);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.removeLoadingIndicator',
	nrg.ui.ZippyNode.prototype.removeLoadingIndicator);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.loadingIndicatorRemoving',
	nrg.ui.ZippyNode.prototype.loadingIndicatorRemoving);
goog.exportSymbol('nrg.ui.ZippyNode.prototype.disposeInternal',
	nrg.ui.ZippyNode.prototype.disposeInternal);
