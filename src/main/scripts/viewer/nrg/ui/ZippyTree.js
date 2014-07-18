/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ZippyTree');

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
goog.require('goog.dom.classes');
goog.require('goog.fx.Transition');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.dom.classlist');

// nrg
goog.require('nrg.style');
goog.require('nrg.ui.ZippyNode');




/**
 * A tree-based collection of ZippyNodes for representing a Zippy-based folder
 * hierarchy in a tree structure.
 *
 * @constructor
 * @extends {nrg.ui.ZippyNode}
 */
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


    //
    // No margins for the top
    //
    this.getHeader().style.marginTop = '0px';
    
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
 * @expose
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
nrg.ui.ZippyTree.prototype.collapseAll = function() {
    this.contractAll();
}



/**
 * WARNING: O(N) operation.  Use sparingly.
 *
 * @return {!Array.<nrg.ui.ZippyNode>}
 * @public
 */
nrg.ui.ZippyTree.prototype.getAllNodes = function() {
    var nodes = [];
    this.traverse(function(node){
	nodes.push(node);
    }, this)
    return nodes;
};



/**
 * WARNING: Potentially O(N) operation.  Use sparingly.
 *
 * @return {!Array.<nrg.ui.ZippyNode>}
 * @public
 */
nrg.ui.ZippyTree.prototype.getTopLevelNodes = function() {
    var nodes = [];
    goog.object.forEach(this.getNodes(), function(node){
	nodes.push(node);
    })
    return nodes;
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
 * @param {!string} folder The zippy folder to expand (id'd by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 */
nrg.ui.ZippyTree.prototype.setExpanded = function(folder, opt_startNode) {
    return this.setNodeExpandCollapse_(folder, opt_startNode, true);
}




/**
 * @param {!string} folder The zippy folder to collapse (id'ed by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @param {!boolean} exp
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 * @private
 */
nrg.ui.ZippyTree.prototype.setNodeExpandCollapse_ = 
function(folder, opt_startNode, exp) {
    //window.console.log("set EXPAND", folder, opt_startNode);
    opt_startNode = goog.isDefAndNotNull(opt_startNode) ? opt_startNode : this;
    if (!goog.isDefAndNotNull(opt_startNode.getNodes()[folder])){ return }

    //window.console.log(opt_startNode.getNodes());
    var currNode = opt_startNode.getNodes()[folder];
    var event = exp ? nrg.ui.ZippyNode.EventType.EXPANDED :
	nrg.ui.ZippyNode.EventType.COLLAPSED;
    var currZippy = currNode.getZippy();


    if (currZippy.isBusy()){
	goog.events.listenOnce(currZippy,event, function(){
	    if (currZippy.isExpanded() != exp){
		currNode.setExpanded(exp);
	    }})
    } 
    else {
	currNode.setExpanded(exp);
    }

    return currNode;
    
}


/**
 * @param {!string} folder The zippy folder to collapse (id'ed by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 */
nrg.ui.ZippyTree.prototype.setCollapsed = function(folder, opt_startNode) {
    return this.setNodeExpandCollapse_(folder, opt_startNode, false);
}



/**
 * @param {!Array.<string>} folders The zippy folder titles.
 * @return {Array.<nrg.ui.ZippyNode>}
 */
nrg.ui.ZippyTree.prototype.getFolderNodes = function(folders) {
    var currNode = this;
    var zippyNodes = [];
    goog.array.forEach(folders, function(folder){
	//window.console.log(folder, currNode.getNodes());
	zippyNodes.push(currNode.getNodes()[folder]);
	currNode = currNode.getNodes()[folder];
    }.bind(this))
    return zippyNodes;
}




/**
 * Main function for adding contents to the tree -- recursive.
 *
 * @param {!Element | !Array.Elements} elements The elements to add.
 * @param {string= | Array.string=} opt_folders The folders where the elements
 *    belong.
 * @public
 */
nrg.ui.ZippyTree.prototype.addContents = function(elements, opt_folders) {
    if (!goog.isArray(elements) || goog.dom.isElement(elements)){
	//window.console.log('\n\nadd contents 2', elements, opt_folders);
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
    
    if (!goog.isDefAndNotNull(elt)){return}
    
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
 * @param {!nrg.ui.ZippyNode} node The parent node.
 * @private
 */
nrg.ui.ZippyTree.prototype.setNodeEvents_ = function(node) {
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
    // Listen and dispatch the EXPANDED event
    //
    goog.events.listen(node, nrg.ui.ZippyNode.EventType.CLICKED, function(){
	this.dispatchEvent({
	    type: nrg.ui.ZippyNode.EventType.CLICKED,
	    node: node
	});
    }.bind(this))


    //
    // Listen and dispatch the COLLASPED event
    //
    goog.events.listen(node, nrg.ui.ZippyNode.EventType.COLLAPSED, function(){
	this.dispatchEvent({
	    type: nrg.ui.ZippyNode.EventType.COLLAPSED,
	    node: node
	});
    }.bind(this))
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
    
    //
    // Create parameters
    //
    parent.style.opacity = this.initOp_;
    var node = new nrg.ui.ZippyNode(title, parent, false);

    //
    // For the very first nodes, we have to set the margin top to 0
    //
    if (pNode.getHeader().parentNode == this.rootElt_ &&
	this.rootElt_.childNodes.length == 2){
	node.getHeader().style.marginTop = '5px';
    }

    //
    // Inherit width and depth CSS from parent
    //
    node.getHeader().style.left = 'inherit';
    node.getHeader().style.width = 'inherit';


    //
    // Node events
    //
    this.setNodeEvents_(node);


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
    
    /**
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
    */
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
 * Binary insertion sort algorithim: O(log n) worst case, 
 * which means on set of Thumbnails it will be O(n * log n) worst case.  
 *
 * @public
 * @param {!Element} holderElt
 * @param {!Element} insertElt
 */
nrg.ui.ZippyTree.folderSorter = function(holderElt, insertElt){
    //window.console.log("FOLDER SORTER!");
    //
    // For no siblings...
    //
    if (!goog.isDefAndNotNull(holderElt.childNodes) || 
	holderElt.childNodes.length == 0) {
	window.console.log("FOLDER SORTER", holderElt, insertElt);
	goog.dom.appendChild(holderElt, insertElt);
	return;
    }

    //
    // Preliminary sort params
    //
    var siblings = goog.dom.getChildren(holderElt);


    var insertEltText = 
	insertElt[nrg.ui.ZippyNode.NODE_STORT_TAG].toLowerCase(); 
    var comparer;
    var compareStr;
    var currSibling;
    var len = siblings.length
    var i = 0;


    //
    // Linear insert
    //
    for (; i < len; i++){

	currSibling = siblings[i];
	//window.console.log(currSibling);
	if (!goog.isDefAndNotNull(currSibling
	    [nrg.ui.ZippyNode.NODE_STORT_TAG])){
	    continue;
	}

	compareStr = currSibling
	    [nrg.ui.ZippyNode.NODE_STORT_TAG].toLowerCase();
	comparer = goog.string.numerateCompare(insertEltText, compareStr)

	// insert only when the text is less...
	if (comparer < 0) {
	    goog.dom.insertSiblingBefore(insertElt, currSibling);
	    return;
	}
    }

    //
    // Otherwise, insert at the end...
    //
    goog.dom.appendChild(holderElt, insertElt);
};




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
    if (goog.isDefAndNotNull(opt_elt)) {
	//
	// IMPORTANT!
	//
	nrg.style.setStyle(opt_elt, {'position': 'relative'});
	//opt_elt.style.opacity = this.initOp_;
	opt_elt.style.opacity = 0;
	nrg.fx.fadeIn(opt_elt, 400);

	//
	// This is where you sort the nodes!!
	//
	if (goog.isDefAndNotNull(this.customInsertMethod_)) {
	    this.customInsertMethod_(contHold, opt_elt);
	} else {
	    goog.dom.appendChild(contHold, opt_elt);
	}

	//
	// Make sure folders are always at the end of the 
	// of the contHold
	//
	/**
	window.console.log("\n\nEND OF BRANCH", 
			   contHold, 
			   contHold.parentNode, 
			   opt_elt);
			   */
	this.putFoldersAtEnd_(contHold)

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
 * Arranges all headers to be the bottom child element of the content holder.
 * 
 * @param {!Element} contentHolder
 * @private
 */
nrg.ui.ZippyTree.prototype.putFoldersAtEnd_ = function(contentHolder) {
    
    //
    // NOTE: We have to find both the headers and holder elements.  
    // Unfortunately, a zippy's contents is a sibling element of the 
    // zippy, which is why we have to parse for 'holders'
    //
    var headers = [];
    var holders = [];
    var holderChildren = goog.dom.getChildren(contentHolder);
    var holderContentsLen = holderChildren.length;


    //
    // Get all the holder elements and the conent element
    //
    goog.array.forEach(holderChildren, function(holderChild){
	if (goog.dom.classlist.contains(
	    holderChild, nrg.ui.ZippyNode.CSS.HEADER)){
	    headers.push(holderChild);
	} 

	//
	// IMPORTANT!!
	//
	// The content element associated with the zippy header is stored
	// in an unidentified 'div' which is a siblign of the header.  We have
	// to keep track of this as well.  We identify this element because it
	// should only have one child node, and that child node has the CONTENT
	// element associated with the zippy (and zippy header above).
	//
	else if (holderChild.childNodes.length == 1){
	    if (goog.dom.classlist.contains(
		holderChild.childNodes[0], nrg.ui.ZippyNode.CSS.CONTENT)){
		holders.push(holderChild);
	    }
	}
    })
   
    //
    // Add all of the holder elements to the bottom
    //
    goog.array.forEach(headers, function(headerElt, i){
	//window.console.log(contentHolder, headerElt, holderContentsLen);
	goog.dom.insertChildAt(contentHolder, headerElt, holderContentsLen);
	goog.dom.insertChildAt(contentHolder, holders[i], 
			       holderContentsLen + 1);
    })
}



/**
 * When the fade in animation finishes, continues the animation on by querying
 * from the secondary queue.
 * @private
 */
nrg.ui.ZippyTree.prototype.continueAnim_ = function() {
    this.AnimQueue_.dispose();

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
	this.disposeAnimations(this.secondaryAnimationQueue_);
	delete this.secondaryAnimationQueue_;
    }

    if (goog.isDefAndNotNull(this.AnimQueue_)){
	this.disposeAnimationQueue(this.AnimQueue_);
	delete this.AnimQueue_;
    }
}



/**
 * @inheritDoc
 */
nrg.ui.ZippyTree.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    goog.dom.removeNode(this.rootElt_);
    delete this.rootElt_;

    this.disposeAnims_();

    delete this.maxDepth_;
    delete this.fadeInFx_;
    delete this.isEmpty_;
    delete this.initOp_;
    delete this.fadeDur_;
}




goog.exportSymbol('nrg.ui.ZippyTree.EventType', nrg.ui.ZippyTree.EventType);
goog.exportSymbol('nrg.ui.ZippyTree.INDENT_PCT', nrg.ui.ZippyTree.INDENT_PCT);
goog.exportSymbol('nrg.ui.ZippyTree.ID_PREFIX', nrg.ui.ZippyTree.ID_PREFIX);
goog.exportSymbol('nrg.ui.ZippyTree.CSS_SUFFIX', nrg.ui.ZippyTree.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ZippyTree.FADE_TIME', nrg.ui.ZippyTree.FADE_TIME);
goog.exportSymbol('nrg.ui.ZippyTree.NODE_DEPTH_KEY',
	nrg.ui.ZippyTree.NODE_DEPTH_KEY);
goog.exportSymbol('nrg.ui.ZippyTree.MAX_DEPTH_KEY',
	nrg.ui.ZippyTree.MAX_DEPTH_KEY);
goog.exportSymbol('nrg.ui.ZippyTree.folderSorter',
	nrg.ui.ZippyTree.folderSorter);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.setCustomInsertMethod',
	nrg.ui.ZippyTree.prototype.setCustomInsertMethod);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.isEmpty',
	nrg.ui.ZippyTree.prototype.isEmpty);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.contractAll',
	nrg.ui.ZippyTree.prototype.contractAll);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.collapseAll',
	nrg.ui.ZippyTree.prototype.collapseAll);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.getAllNodes',
	nrg.ui.ZippyTree.prototype.getAllNodes);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.getTopLevelNodes',
	nrg.ui.ZippyTree.prototype.getTopLevelNodes);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.expandAll',
	nrg.ui.ZippyTree.prototype.expandAll);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.traverse',
	nrg.ui.ZippyTree.prototype.traverse);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.getElement',
	nrg.ui.ZippyTree.prototype.getElement);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.setExpanded',
	nrg.ui.ZippyTree.prototype.setExpanded);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.setCollapsed',
	nrg.ui.ZippyTree.prototype.setCollapsed);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.getFolderNodes',
	nrg.ui.ZippyTree.prototype.getFolderNodes);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.addContents',
	nrg.ui.ZippyTree.prototype.addContents);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.createBranch',
	nrg.ui.ZippyTree.prototype.createBranch);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.playFx',
	nrg.ui.ZippyTree.prototype.playFx);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.toggleFadeInFx',
	nrg.ui.ZippyTree.prototype.toggleFadeInFx);
goog.exportSymbol('nrg.ui.ZippyTree.prototype.disposeInternal',
	nrg.ui.ZippyTree.prototype.disposeInternal);
