/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.dom.classes');

// nrg
goog.require('nrg.ui.ScrollableContainer');
goog.require('nrg.ui.ZippyTree');
goog.require('nrg.ui.Thumbnail');
goog.require('nrg.ui.ZippyNode');
goog.require('nrg.ui.ZippyTree.EventType');
goog.require('nrg.ui.ZippyNode.EventType');
goog.require('nrg.style');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain nrg.ui.Thumbnail objects and methods pertaining to their 
 * interaction.
 * @constructor
 * @extends {nrg.ui.ScrollableContainer}
 */
goog.provide('nrg.ui.ScrollableZippyTree');
nrg.ui.ScrollableZippyTree = function () {
    goog.base(this);
}
goog.inherits(nrg.ui.ScrollableZippyTree, nrg.ui.ScrollableContainer);
goog.exportSymbol('nrg.ui.ScrollableZippyTree', nrg.ui.ScrollableZippyTree);



/**
 * Event types.
 * @enum {string}
 * @public
 */
nrg.ui.ScrollableZippyTree.EventType = {}


/**
 * @type {!string} 
 * @expose
 * @const
 */
nrg.ui.ScrollableZippyTree.ID_PREFIX = 'nrg.ui.ScrollableZippyTree';



/**
 * @type {!Array.string} 
 * @const
 */ 
nrg.ui.ScrollableZippyTree.CSS_SUFFIX = {
    ZIPPYTREE: 'zippytree'
}



/**
 * @protected
 * @type {nrg.ui.ZippyTree}
 */
nrg.ui.ScrollableZippyTree.prototype.ZippyTree;



/**
 * @inheritDoc
 */
nrg.ui.ScrollableZippyTree.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);   
    //
    // Zippy Tree
    //
    this.ZippyTree = new nrg.ui.ZippyTree();
    //
    // Zippy Tree class
    //
    goog.dom.classes.add(this.ZippyTree.getElement(), 
			 nrg.ui.ScrollableZippyTree.CSS.ZIPPYTREE);
    //
    // Add the zippy tree
    //
    goog.dom.appendChild(this.getScrollArea(), this.ZippyTree.getElement());

    //
    // Set the zippy tree events
    //
    this.setZippyTreeEvents();

    //
    // Respond to scroll deltas
    //
    this.Slider.setUseDeltaToScroll(true, .3);
}



/**
 * @param {!Element | !Array.Elements} elements The elements to add.
 * @param {string= | Array.string=} opt_folders The folders where the elements
 *    belong.
 * @public
 */
nrg.ui.ScrollableZippyTree.prototype.addContents = 
function(elements, opt_folders) {
    this.ZippyTree.addContents(elements, opt_folders);
    //var slider = this.getSlider();
    elements = !goog.isArray(elements) ? [elements] : elements;
    
    goog.array.forEach(elements, function(element){
	//this.Slider.bindToMouseWheel(element);
    }.bind(this))
    //
    // Bind to mousewheel
    //
    this.getSlider().bindToMouseWheel(this.ZippyTree.getElement());
}


/**
 * @public
 */
nrg.ui.ScrollableZippyTree.prototype.expandAll = function() {
    this.ZippyTree.expandAll();
}



/**
 * @public
 */
nrg.ui.ScrollableZippyTree.prototype.collapseAll = function() {
    this.ZippyTree.collapseAll();
}



/**
 * @param {!string} folder The zippy folder to expand (id'ed by title)
 * @param {nrg.ui.ZippyNode=} The opitional zippy node, defaults to 'this'.
 * @return {nrg.ui.ZippyNode} The expanded zippy node.
 */
nrg.ui.ScrollableZippyTree.prototype.setExpanded = 
function(folder, opt_startNode) {
    //window.console.log('\n\n\nsetExpanded', folder);
    this.ZippyTree.setExpanded(folder, opt_startNode);
}



/**
 * @return {nrg.ui.ZippyTree}
 * @private
 */
nrg.ui.ScrollableZippyTree.prototype.getZippyTree = function(){
    return this.ZippyTree;
}



/**
 * @param {Array.<string>} folders The zippy structure.
 */
nrg.ui.ScrollableZippyTree.prototype.addFolders = function(folders) {
    this.ZippyTree.createBranch(folders);
    this.mapSliderToContents();
}



/**
 * @protected
 */
nrg.ui.ScrollableZippyTree.prototype.setZippyTreeEvents = function(){ 
    goog.events.listen(this.ZippyTree,
	nrg.ui.ZippyTree.EventType.CONTENTADDED,
	this.mapSliderToContents.bind(this));

    goog.events.listen(this.ZippyTree,
	nrg.ui.ZippyNode.EventType.EXPANDED,
	this.mapSliderToContents.bind(this));

    goog.events.listen(this.ZippyTree,
	nrg.ui.ZippyNode.EventType.COLLAPSED,
	this.mapSliderToContents.bind(this));

    goog.events.listen(this.ZippyTree,
	nrg.ui.ZippyNode.EventType.NODEADDED,
	this.mapSliderToContents.bind(this));
}




/**
 * @inheritDoc
 */
nrg.ui.ScrollableZippyTree.prototype.updateStyle = function (opt_args) {
   if (opt_args) {
       nrg.style.setStyle(this.getElement(), opt_args);
   }
}




/**
 * @inheritDoc
 */
nrg.ui.ScrollableZippyTree.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Zippy Tree
    if (goog.isDefAndNotNull(this.ZippyTree)){
	goog.events.removeAll(this.ZippyTree);
	this.ZippyTree.dispose();
	delete this.ZippyTree;
    }
}

