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

// nrg
goog.require('nrg.style');
goog.require('nrg.ui.ZippyNode');



/**
 * A tree-based collection of ZippyNodes for representing a Zippy-based folder
 * hierarchy in a tree structure.
 * @constructor
 * @extends {nrg.ui.ZippyNode}
 */
goog.provide('nrg.ui.ZippyTree');
nrg.ui.ZippyTree = function () {
    // goog.base called later...

    /**
     * @type {!Element}
     * @private
     */
    this.rootElt_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_' + 
	goog.string.createUniqueString(),
	'class': this.constructor.ELEMENT_CLASS,
    })


    //---------------------------------------------
    // These calls need to happen after the element_ is created!!
    goog.base(this, '', this.rootElt_, true); 
    // Hide the header because it inherits from ZippyNode -- we don't need it.
    goog.dom.classes.add(this.getHeader(), nrg.ui.ZippyTree.CSS.ROOT_NODE);
    //---------------------------------------------
}
goog.inherits(nrg.ui.ZippyTree, nrg.ui.ZippyNode);
goog.exportSymbol('nrg.ui.ZippyTree', nrg.ui.ZippyTree);



/**
 * Event types.
 * @enum {string}
 */
nrg.ui.ZippyTree.EventType = {
  CONTENTADDED: goog.events.getUniqueId('contentadded'),
  NODEADDED: goog.events.getUniqueId('zippyadded'),
};



/**
 * @const
 * @type {!number}
 */
nrg.ui.ZippyTree.INDENT_PCT = 5;



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.ZippyTree.ID_PREFIX =  'nrg.ui.ZippyTree';



/**
 * @enum {string} 
 * @const
*/
nrg.ui.ZippyTree.CSS_SUFFIX = {
    ROOT_NODE: 'rootnode'
}



/**
 * @const
 * @type {!number}
 */
nrg.ui.ZippyTree.FADE_TIME = 300;



/**
 * @const
 */
nrg.ui.ZippyTree.NODE_DEPTH_KEY = '_nodeDepth';



/**
 * @const
 */
nrg.ui.ZippyTree.MAX_DEPTH_KEY = '_maxDepth';



/**
 * @type {!number}
 * @private
 */
nrg.ui.ZippyTree.prototype.maxDepth_ = 1;



/**
 * @type {!number}
 * @private
 */
nrg.ui.ZippyTree.prototype.fadeInFx_ = false;



/**
 * @type {!number}
 * @private
 */
nrg.ui.ZippyTree.prototype.isEmpty_ = true;



/**
 * The starting opacity of newly created nodes.  Only valid if fadeInFx is
 * toggled.
 * @type {!number}
 * @private
 */
nrg.ui.ZippyTree.prototype.initOp_ = 1;



/**
 * The fade duration.  Only valid if fadeInFx is toggled.
 * @type {!number}
 * @private
 */
nrg.ui.ZippyTree.prototype.fadeDur_ = 0;



/**
 * @type {Function}
 * @private
 */
nrg.ui.ZippyTree.prototype.customInsertMethod_ ;



/**
 * @type {?Array}
 * @private
 */
nrg.ui.ZippyTree.prototype.secondaryAnimQueue_ = null;



/**
 * @type {?goog.fx.AnimationSerialQueue}
 * @private
 */
nrg.ui.ZippyTree.prototype.AnimQueue_ = null;



/**
 * @param {!Function} method
 * @private
 */
nrg.ui.ZippyTree.prototype.setCustomInsertMethod = function(method){
    this.customInsertMethod_ = method;
};



/**
 * As stated.
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyTree.prototype.isEmpty = function() {
    return goog.dom.getChildren(this.getContentHolder()).length === 0;
};



/**
 * As stated.
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyTree.prototype.contractAll = function() {
    this.traverse(function(node){
	node.getZippy().setExpanded(false);
    }, this)
};



/**
 * As stated.
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyTree.prototype.expandAll = function() {
    this.traverse(function(node){
	node.getZippy().setExpanded(true);
    }, this)
};



/**
 * Traverses the tree recursively, running a callback on each node.
 * @param {!Function} callback The callback to apply.
 * @param {!nrg.ui.ZippyNode} currNode The current node.
 * @return {!boolean}
 * @public
 */
nrg.ui.ZippyTree.prototype.traverse = function(callback, currNode) {
    goog.object.forEach(currNode.getNodes(), function(node){
	callback(node);
	this.traverse(callback, node);
    }.bind(this))
};



/**
 * @return {!Element} The element.
 * @public
 */
nrg.ui.ZippyTree.prototype.getElement = function() {
    return this.rootElt_
}



/**
 * @param {!string} folder The zippy folder to expand (id'ed by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 */
nrg.ui.ZippyTree.prototype.setExpanded = function(folder, opt_startNode) {
    //window.console.log("set EXPAND", folder, opt_startNode);
    opt_startNode = goog.isDefAndNotNull(opt_startNode) ? opt_startNode : this;
    //window.console.log(opt_startNode.getNodes());

    if (goog.isDefAndNotNull(opt_startNode.getNodes()[folder])){
	var currNode = opt_startNode.getNodes()[folder];
	var currZippy = currNode.getZippy();
	currZippy.setExpanded(true);
	return currNode;
    }
}


/**
 * @param {!string} folder The zippy folder to collapse (id'ed by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 */
nrg.ui.ZippyTree.prototype.setCollapsed = function(folder, opt_startNode) {
    //window.console.log("set EXPAND", folder, opt_startNode);
    opt_startNode = goog.isDefAndNotNull(opt_startNode) ? opt_startNode : this;
    //window.console.log(opt_startNode.getNodes());

    if (goog.isDefAndNotNull(opt_startNode.getNodes()[folder])){
	var currNode = opt_startNode.getNodes()[folder];
	var currZippy = currNode.getZippy();
	currZippy.setExpanded(false);
	return currNode;
    }
}



/**
 * @param {!Array.<string>} folders The zippy folder titles.
 * @return {Array.<nrg.ui.ZippyNode>}
 */
nrg.ui.ZippyTree.prototype.getFolderNodes = function(folders) {
    var currNode = this;
    var zippyNodes = [];
    goog.array.forEach(folders, function(folder){
	zippyNodes.push(currNode.getNodes()[folder]);
	currNode = currNode.getNodes()[folder];
    }.bind(this))
    return zippyNodes;
}




/**
 * Main function for adding contents to the tree -- recursive.
 * @param {!Element | !Array.Elements} elements The elements to add.
 * @param {string= | Array.string=} opt_folders The folders where the elements
 *    belong.
 * @public
 */
nrg.ui.ZippyTree.prototype.addContents = function(elements, opt_folders) {
    if (!goog.isArray(elements) || goog.dom.isElement(elements)){
	//window.console.log('add contents 2', elements);
	this.addContent_(elements, opt_folders);
	return;
    }
    goog.array.forEach(elements, function(elt){
	//window.console.log('add contents', elements);
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
nrg.ui.ZippyTree.prototype.addContent_ = function(element, opt_folders) {
    
    if (!opt_folders){
	goog.dom.append(this.rootElt_, element);
    } else {
	if (opt_folders){
	    opt_folders = goog.isString(opt_folders)?[opt_folders]: opt_folders;
	    if (opt_folders.length > this.maxDepth_){
		this.maxDepth_ = opt_folders.length;
	    }
	}
	this.createBranch(opt_folders, this, element);
    }
}



/**
 * Creates a branch within the tree in a recursive manner.
 *
 * @param {!string | !Array.string} fldrs The folder or folders that create
 *    the tree nodes.
 * @param {nrg.ui.ZippyNode=} opt_pNode The parent node that initiaties
 *    further 'createBranch' calls.  Defaults to 'this' if not specified.
 * @param {Element=} opt_elt The element to add at the end of the branch.
 * @param (Number=} opt_currDepth The optional depth of the node.  Defaults to
 *     1.
 * @public
 */
nrg.ui.ZippyTree.prototype.createBranch = 
function(fldrs, opt_pNode, opt_elt, opt_currDepth) {
    //
    // set the current depth
    //
    opt_currDepth = goog.isDefAndNotNull(opt_currDepth) ? opt_currDepth : 1;

    //
    // Set the parent node
    //
    opt_pNode = goog.isDefAndNotNull(opt_pNode) ? opt_pNode: this;
    var contHold = opt_pNode.getContentHolder();

    //
    // If at end of branch
    //
    if (fldrs.length == 0){
	this.onEndOfBranch_(contHold, opt_elt);
	
	//
	// Indent the end element
	//
	if (goog.isDefAndNotNull(opt_elt)){
	    this.indentElement_(opt_elt, opt_currDepth - 2);
	}
	return;
    } 

    //
    // Set max depth
    //
    if (fldrs.length > 0 && fldrs.length > this.maxDepth_){
	this.maxDepth_ = fldrs.length;
    } 

    //
    // Generate the current node or use an existing node
    //
    var currNode = opt_pNode.getNodes()[fldrs[0]] ? 
	opt_pNode.getNodes()[fldrs[0]] : 
	this.createNode_(fldrs[0], contHold, opt_pNode);

    //
    // Indent the element
    //
    this.indentNode_(currNode, opt_currDepth);

    
    //
    // And recurse
    //
    this.createBranch(

	// slice off top index of folders .
	(fldrs.length > 1) ? fldrs.slice(1) : [], 

	// current node
	currNode,

	// end element.
	opt_elt,

	// depth
	opt_currDepth + 1); 
}



/**
 * Indents a node base on a provided depth.  Takes some precuations
 * for certain child elements of the nodes (like the header)
 *
 * @param {!nrg.ui.ZippyTree} node The node to indent.
 * @param {!number} depth The depth to indent at.
 * @private
 */
nrg.ui.ZippyTree.prototype.indentNode_ = function(node, depth){
    this.indentElement_(node.getHeader(), depth-1);
}



/**
 * Indents an element base on a provided depth.
 *
 * @param {!Element} elt The element to indent.
 * @param {!number} depth The depth to indent at.
 * @param {boolean=} opt_applyWidth Whether to apply the indent to Width CSS
 *     attribute.
 * @param {boolean=} opt_applyLeft Whether to apply the indent to Left CSS
 *     attribute.
 * @private
 */
nrg.ui.ZippyTree.prototype.indentElement_ = 
function(elt, depth, opt_applyWidth, opt_applyLeft){
    //window.console.log('indent element_', elt, depth);
    
    if (elt[nrg.ui.ZippyTree.MAX_DEPTH_KEY] == this.maxDepth_) { 
	//window.console.log(elt, ' is already indented.');
	return 
    } 
    else if (!goog.isDefAndNotNull(elt[nrg.ui.ZippyTree.MAX_DEPTH_KEY])) {
	elt[nrg.ui.ZippyTree.MAX_DEPTH_KEY] = this.maxDepth_;
    }

    //
    // Catch any bad values
    //
    depth = (depth < 0) ? 0 : depth;

    //
    // Add the MAX_DEPTH and NODE_DEPTH properties
    //
    if (!goog.isDefAndNotNull(elt[nrg.ui.ZippyTree.NODE_DEPTH_KEY])) {
	elt[nrg.ui.ZippyTree.NODE_DEPTH_KEY] = depth;
    }

    //
    // Only change the indentation IF the its MAX_DEPTH property has
    // changed with the tree's maxDepth_
    //

    //
    // We have do do this funny calculation b/c 
    //

    if (!goog.isDefAndNotNull(opt_applyWidth) || 
	opt_applyWidth == true){
	var width = 100 - (depth * nrg.ui.ZippyTree.INDENT_PCT);
	elt.style.width = (width).toString() + '%';
    }
    if (!goog.isDefAndNotNull(opt_applyLeft) || 
	opt_applyLeft == true) {
	elt.style.left = (depth * 
			  nrg.ui.ZippyTree.INDENT_PCT).toString() + '%';
    }

      
}




/**
 * Conducts node creation specific for the ZippyTree.
 *
 * @param {!string} title The node title.
 * @param {!Element} parent The parent element.
 * @param {!nrg.ui.ZippyNode} pNode The parent node.
 * @return {nrg.ui.ZippyNode} The created node.
 * @private
 */
nrg.ui.ZippyTree.prototype.createNode_ = function(title, parent, pNode) {
    //window.console.log('\n\nPARENT', parent);

    //
    // Create parameters
    //
    parent.style.opacity = this.initOp_;
    var node = new nrg.ui.ZippyNode(title, parent, false);
    //node.setExpanded(false);

    //
    // Inherit width and depth CSS from parent
    //
    node.getHeader().style.left = 'inherit';
    node.getHeader().style.width = 'inherit';

    //
    // Listen and dispatch the EXPANDED event
    //
    goog.events.listen(node, nrg.ui.ZippyNode.EventType.EXPANDED, function(){
	//window.console.log('expanded!');
	//this.indentNodes_();
	this.dispatchEvent({
	    type: nrg.ui.ZippyNode.EventType.EXPANDED,
	    node: node
	});
    }.bind(this))


    //
    // Listen and dispatch the COLLASPED event
    //
    goog.events.listen(node, nrg.ui.ZippyNode.EventType.COLLAPSED, function(){
	//window.console.log('collapsed!');
	//this.indentNodes_();
	this.dispatchEvent({
	    type: nrg.ui.ZippyNode.EventType.COLLAPSED,
	    node: node
	});
    }.bind(this))

    //
    // Set the parent node
    //
    pNode.getNodes()[title] = node;

    //
    // Set styles
    //
    node.getHeader().style.opacity = this.initOp_;
    parent.style.opacity = 1;

    //
    // Fade in the node only if specified
    //
    if (this.fadeInFx_) {
	this.createFadeAnim_(node.getHeader());
    }

    //
    // Dispatch the NODEADDED event
    //
    this.dispatchEvent({
	type: nrg.ui.ZippyTree.EventType.NODEADDED,
	node: node
    });


    return node;
}



/**
 * Creates an animation for fading in nodes.
 * @param {!Element} elt The element to fade in.
 * @param {Function=} opt_callback The optional callback once faded in.
 * @private
 */
nrg.ui.ZippyTree.prototype.createFadeAnim_ = function(elt, opt_callback) {
    
    //window.console.log(this.fadeDur_);
    var anim = new goog.fx.dom.FadeIn(elt, this.fadeDur_);

    anim.play();
    return;

    if (!this.AnimQueue_.isPlaying()){		
	this.AnimQueue_.add(anim);
    } else {
	//this.AnimQueue_.pause();
	//this.AnimQueue_.add(anim);
	//this.AnimQueue_.play();
	this.secondaryAnimQueue_.push(anim);
    }

    if (opt_callback){
	anim.addEventListener(goog.fx.Transition.EventType.END, function(e){ 
	    opt_callback(e);
	})
    }
}



/**
 * @public
 */
nrg.ui.ZippyTree.prototype.playFx = function(){
    if (this.fadeInFx_ && !this.AnimQueue_.isPlaying()){
	this.AnimQueue_.play();
    }
}


/**
 * Toggles whether to apply the fade in effects.  O(n) since you're looking
 * at every node in the tree.
 *
 * @param {!boolean} b Toggler.
 * @public
 */
nrg.ui.ZippyTree.prototype.toggleFadeInFx = function(b) {
    this.fadeInFx_ = (b === true);
    this.initOp_ = this.fadeInFx_ ? 0 : 1;
    this.fadeDur_ = this.fadeInFx_ ? nrg.ui.ZippyTree.FADE_TIME : 0;

    if (this.fadeInFx_){
	//
	// Dispose animations
	//
	this.disposeAnims_();

	//
	// Run queue
	//
	this.secondaryAnimQueue_ = [];
	this.AnimQueue_ = new goog.fx.AnimationParallelQueue();
	goog.events.listen(this.AnimQueue_, 'end', 
			   this.continueAnim_.bind(this));
    }
}



/**
 * Method for when an end of branch is reached.  Called from 'createBranch'.
 * @param {!Element} contHold The contentHolder element.
 * @param {Element=} opt_elt The optional element to add at the end of the 
 *    branch.
 * @private
 */
nrg.ui.ZippyTree.prototype.onEndOfBranch_ = function(contHold, opt_elt) {
    //
    // Add the contentElt to the given node , if it exists.
    //
    if (opt_elt) {
	//
	// IMPORTANT!
	//
	nrg.style.setStyle(opt_elt, {'position': 'relative'});
	opt_elt.style.opacity = this.initOp_;
	//
	// This is where you sort the nodes.
	//
	if (goog.isDefAndNotNull(this.customInsertMethod_)) {
	    this.customInsertMethod_(contHold, opt_elt);
	} else {
	    goog.dom.appendChild(contHold, opt_elt);
	}

	//
	// Fade in the end node
	//
	if (this.fadeInFx_) { 
	    this.createFadeAnim_(opt_elt, function(){
		this.dispatchEvent({
		    type: nrg.ui.ZippyTree.EventType.CONTENTADDED
		});
	    }.bind(this));
	    return;
	} 

	//
	// Otherwise, dispatch
	// 
	this.dispatchEvent({
	    type: nrg.ui.ZippyTree.EventType.CONTENTADDED
	});
    }
}




/**
 * When the fade in animation finishes, continues the animation on by querying
 * from the secondary queue.
 * @private
 */
nrg.ui.ZippyTree.prototype.continueAnim_ = function() {
    this.AnimQueue_.disposeInternal();

    // Add animations in the secondary queue to the AnimQueue
    while(this.secondaryAnimQueue_.length){
	this.AnimQueue_.add(this.secondaryAnimQueue_[0]);
	goog.array.removeAt(this.secondaryAnimQueue_, 0);
    }

    // Reset the 'end' listener -- it appears to get disposed as well.
    goog.events.listen(this.AnimQueue_, 'end', this.continueAnim_.bind(this));

    // Play
    this.AnimQueue_.play();
}



/**
 * @private
 */
nrg.ui.ZippyTree.prototype.disposeAnims_ = function(){

    if (goog.isDefAndNotNull(this.secondaryAnimationQueue_)){
	nrg.ui.disposeAnimations(this.secondaryAnimationQueue_);
	delete this.secondaryAnimationQueue_;
    }

    if (goog.isDefAndNotNull(this.AnimQueue_)){
	nrg.ui.disposeAnimationQueue(this.AnimQueue_);
	delete this.AnimQueue_;
    }
}



/**
 * @inheritDoc
 */
nrg.ui.ZippyTree.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    goog.dom.removeNode(this.rootElt_);
    this.rootElt_;

    this.disposeAnims_();

    delete this.maxDepth_;
    delete this.fadeInFx_;
    delete this.isEmpty_;
    delete this.initOp_;
    delete this.fadeDur_;
}
