/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy.Events');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.dom.FadeIn');
goog.require('goog.ui.Zippy');

// moka
goog.require('moka.style');
goog.require('moka.events.EventManager');
goog.require('moka.ui.ZippyNode');



/**
 * A tree-based collection of ZippyNodes for representing a Zippy-based folder
 * hierarchy in a tree structure.
 * @constructor
 * @extends {moka.ui.ZippyNode}
 */
goog.provide('moka.ui.ZippyTree');
moka.ui.ZippyTree = function () {

    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_' + 
	goog.string.createUniqueString(),
	'class': this.constructor.ELEMENT_CLASS,
    })


    //---------------------------------------------
    // These calls need to happen after the element_ is created!!
    goog.base(this, '', this.element_); 
    // Hide the header because it inherits from ZippyNode -- we don't need it.
    goog.dom.classes.add(this.getHeader(), moka.ui.ZippyTree.ROOT_NODE_CLASS);
    //---------------------------------------------


    /**
     * @type {!Array}
     * @private
     */
    this.secondaryQueue_ = [];


    /**
     * @type {!goog.fx.AnimationSerialQueue}
     * @private
     */
    this.AnimQueue_= new goog.fx.AnimationSerialQueue();
    goog.events.listen(this.AnimQueue_, 'end', this.continueAnim_.bind(this));

    // Events
    moka.events.EventManager.addEventManager(this, 
					      moka.ui.ZippyTree.EventType);
}
goog.inherits(moka.ui.ZippyTree, moka.ui.ZippyNode);
goog.exportSymbol('moka.ui.ZippyTree', moka.ui.ZippyTree);



/**
 * Event types.
 * @enum {string}
 */
moka.ui.ZippyTree.EventType = {
  CONTENTADDED: goog.events.getUniqueId('contentadded'),
  NODEADDED: goog.events.getUniqueId('zippyadded'),
};



/**
 * @type {!string} 
 * @const
 * @expose
 */
moka.ui.ZippyTree.ID_PREFIX =  'moka.ui.ZippyTree';



/**
 * @const
 * @type {!number}
 */
moka.ui.ZippyTree.INDENT_PCT = 5;



/**
 * @type {!string} 
 * @const
*/
moka.ui.ZippyTree.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(moka.ui.ZippyTree.ID_PREFIX.toLowerCase().
			   replace(/\./g,'-'));



/**
 * @type {!string} 
 * @const
*/
moka.ui.ZippyTree.ELEMENT_CLASS =  
goog.getCssName(moka.ui.ZippyTree.CSS_CLASS_PREFIX, '');



/**
 * @type {!string} 
 * @const
*/
moka.ui.ZippyTree.ROOT_NODE_CLASS =  
goog.getCssName(moka.ui.ZippyTree.CSS_CLASS_PREFIX, 'rootnode');



/**
 * @const
 * @type {!number}
 */
moka.ui.ZippyTree.FADE_TIME = 120;



/**
 * @type {!number}
 * @private
 */
moka.ui.ZippyTree.prototype.maxDepth_ = 0;



/**
 * @type {!number}
 * @private
 */
moka.ui.ZippyTree.prototype.fadeInFx_ = false;



/**
 * @type {!number}
 * @private
 */
moka.ui.ZippyTree.prototype.isEmpty_ = true;



/**
 * The starting opacity of newly created nodes.  Only valid if fadeInFx is
 * toggled.
 * @type {!number}
 * @private
 */
moka.ui.ZippyTree.prototype.initOp_ = 1;



/**
 * The fade duration.  Only valid if fadeInFx is toggled.
 * @type {!number}
 * @private
 */
moka.ui.ZippyTree.prototype.fadeDur_ = 0;



/**
 * As stated.
 * @return {!boolean}
 * @public
 */
moka.ui.ZippyTree.prototype.isEmpty = function() {
    return goog.dom.getChildren(this.getContentHolder()).length === 0;
};




/**
 * As stated.
 * @return {!boolean}
 * @public
 */
moka.ui.ZippyTree.prototype.contractAll = function() {
    this.traverse(function(node){
	node.getZippy().setExpanded(false);
    }, this)
};



/**
 * As stated.
 * @return {!boolean}
 * @public
 */
moka.ui.ZippyTree.prototype.expandAll = function() {
    this.traverse(function(node){
	node.getZippy().setExpanded(true);
    }, this)
};



/**
 * Traverses the tree recursively, running a callback on each node.
 * @param {!Function} callback The callback to apply.
 * @param {!moka.ui.ZippyNode} currNode The current node.
 * @return {!boolean}
 * @public
 */
moka.ui.ZippyTree.prototype.traverse = function(callback, currNode) {
    goog.object.forEach(currNode.getNodes(), function(node){
	callback(node);
	this.traverse(callback, node);
    }.bind(this))
};




/**
 * Toggles whether to apply the fade in effects.
 * @param {!boolean} b Toggler.
 * @public
 */
moka.ui.ZippyTree.prototype.toggleFadeInFx = function(b) {
    this.fadeInFx_ = (b === true);
    this.initOp_ = /**@type {!number}*/ this.fadeInFx_ ? 0 : 1;
    this.fadeDur_ = /**@type {!number}*/ 
    this.fadeInFx_ ? moka.ui.ZippyTree.FADE_TIME : 0;
}



/**
 * As stated.
 * @return {!Element} The element.
 * @public
 */
moka.ui.ZippyTree.prototype.getElement = function() {
    return this.element_
}



/**
 * Main function for adding contents to the tree -- recursive.
 * @param {!Element | !Array.Elements} elements The elements to add.
 * @param {string= | Array.string=} opt_folders The folders where the elements
 *    belong.
 * @public
 */
moka.ui.ZippyTree.prototype.addContents = function(elements, opt_folders) {
    if (!goog.isArray(elements) || goog.dom.isElement(elements)){
	this.addContent_(elements, opt_folders);
	return;
    }
    goog.array.forEach(elements, function(elt){
	this.addContents(elt, opt_folders);
    }.bind(this));
}



/**
 * Main function for adding content to the tree: the elements and its folder 
 * hierarchy.
 * @param {!Element} element The element to add.
 * @param {string= | Array.string=} opt_folders The folders where the element
 *    belongs.
 * @private
 */
moka.ui.ZippyTree.prototype.addContent_ = function(element, opt_folders) {
    //window.console.log("ADD CONTENT", element);
    if (!opt_folders){
	goog.dom.append(this.element_, element);
    } else {
	if (opt_folders){
	    opt_folders = goog.isString(opt_folders)?[opt_folders]: opt_folders;
	    if (opt_folders.length > this.maxDepth_){
		this.maxDepth_ = opt_folders.length;
	    }
	}
	this.createBranch_(opt_folders, this, element);
	this.indentNodes_();
    }
}



/**
 * Creates a branch within the tree in a recursive manner.
 * @param {!string | !Array.string} fldrs The folder or folders that create
 *    the tree nodes.
 * @param {!moka.ui.ZippyNode} pNode The parent node that initiaties
 *    further 'createBranch_' calls.
 * @param {Element=} opt_elt The element to add at the end of the branch.
 * @private
 */
moka.ui.ZippyTree.prototype.createBranch_ = function(fldrs, pNode, opt_elt) {
    
    var contHold = /**@type {!Element}*/ pNode.getContentHolder();

    // If at end of branch
    if (fldrs.length == 0 && opt_elt){
	this.onEndOfBranch_(contHold, opt_elt);
	return;
    }

    // Otherwise, recurse
    this.createBranch_(
	// Slice off top index of folders .
	(fldrs.length > 1) ? fldrs.slice(1) : [], 

	// Get existing or create new node.
	pNode.getNodes()[fldrs[0]] ? pNode.getNodes()[fldrs[0]] : 
	this.createNode_(fldrs[0], contHold, pNode),

	// maintain the end element.
	opt_elt); 
}



/**
 * Conducts node creation specific for the ZippyTree.
 * @param {!string} title The node title.
 * @param {!Element} parent The parent element.
 * @param {!moka.ui.ZippyNode} pNode The parent node.
 * @return {moka.ui.ZippyNode} The created node.
 * @private
 */
moka.ui.ZippyNode.prototype.createNode_ = function(title, parent, pNode) {

    parent.style.opacity = this.initOp_;
    var node = /**@type {!moka.ui.ZippyNode}*/
    new moka.ui.ZippyNode(title, parent);

    pNode.getNodes()[title] = node;

    node.getHeader().style.opacity = this.initOp_;
    parent.style.opacity = 1;

    this.createFadeAnim_(node.getHeader());
    this.indentNodes_();
    this['EVENTS'].runEvent('NODEADDED', node);

    return node;
}



/**
 * Creates an animation for fading in nodes.
 * @param {!Element} elt The element to fade in.
 * @private
 */
moka.ui.ZippyTree.prototype.createFadeAnim_ = function(elt) {
    var anim = /** @type {goog.fx.dom.FadeIn} */
    new goog.fx.dom.FadeIn(elt, this.fadeDur_);
    if (!this.AnimQueue_.isPlaying()){		
	this.AnimQueue_.add(anim)
    } else {
	this.secondaryQueue_.push(anim);
    }
}



/**
 * Method for when an end of branch is reached.  Called from 'createBranch_'.
 * @param {!Element} contHold The contentHolder element.
 * @param {Element=} opt_elt The optional element to add at the end of the 
 *    branch.
 * @private
 */
moka.ui.ZippyTree.prototype.onEndOfBranch_ = function(contHold, opt_elt) {
    // Add the contentElt to the given node , if it exists.
    if (opt_elt) {
	// IMPORTANT!
	moka.style.setStyle(opt_elt, {'position': 'relative'});
	opt_elt.style.opacity = this.initOp_;
	// IMPORTANT!
	goog.dom.append(contHold, opt_elt);
	this.createFadeAnim_(opt_elt);
    }
    this.indentNodes_();
    if (!this.AnimQueue_.isPlaying()) { this.AnimQueue_.play() }; 
    this['EVENTS'].runEvent('CONTENTADDED');
}



/**
 * Recursively indents the treeNodes based on their depth.
 * @param {!moka.ui.ZippyNode} currNode The node to run the indentation 
 *    calculation on.
 * @param {!number} currDepth The depth of the currNode.
 * @private
 */
moka.ui.ZippyTree.prototype.indentNodes_ = function(currNode, currDepth){

    var currNodeset = /**@type {Object.<string, goog.ui.ZippyNode>}*/ 
    currNode ? currNode.getNodes(): this.getNodes();    
    currDepth = currDepth ? currDepth : 0; 

    // If at the end of the tree...
    if (!currNodeset || (goog.object.getCount(currNodeset) == 0)){ 
	currDepth--;
	this.indentNodeElements_(currNode.getContentHolder().childNodes, 
				 currDepth)
	return; 
    }

    // Otherwise, recurse for each sub-node...
    goog.object.forEach(currNodeset, function(loopNode){
	this.indentNodeElements_(loopNode.getHeader(), currDepth)
	this.indentNodes_(loopNode, currDepth+1);
    }.bind(this))
}



/**
 * Performs indent calculations on a given element.
 * @param {!Element | !Array.Element} The element or elements to indent.
 * @param {!number} depth The depth of the element.
 * @private
 */
moka.ui.ZippyTree.prototype.indentNodeElements_ = function(elts, depth) {
    elts = goog.dom.isElement(elts) ? [elts] : elts;
    goog.array.forEach(elts, function(elt) {
	elt.style.width = (100 - (this.maxDepth_ * 
			      this.constructor.INDENT_PCT)).toString() + '%';
	elt.style.left = (depth * this.constructor.INDENT_PCT).toString() + '%';
    }.bind(this))
}



/**
 * When the fade in animation finishes, continues the animation on by querying
 * from the secondary queue.
 * @private
 */
moka.ui.ZippyTree.prototype.continueAnim_ = function() {
    this.AnimQueue_.disposeInternal();

    // Add animations in the secondary queue to the AnimQueue
    while(this.secondaryQueue_.length){
	this.AnimQueue_.add(this.secondaryQueue_[0]);
	goog.array.removeAt(this.secondaryQueue_, 0);
    }

    // Reset the 'end' listener -- it appears to get disposed as well.
    goog.events.listen(this.AnimQueue_, 'end', this.continueAnim_.bind(this));

    // Play
    this.AnimQueue_.play();
}
