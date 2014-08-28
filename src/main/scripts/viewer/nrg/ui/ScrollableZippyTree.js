/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ScrollableZippyTree');

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
goog.require('nrg.style');



/**
 * Thumbnail Galleries are subclass of ScrollableContainer that specifically 
 * contain nrg.ui.Thumbnail objects and methods pertaining to their 
 * interaction.
 * @constructor
 * @extends {nrg.ui.ScrollableContainer}
 */
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
 * @expose
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
 * @param {!Element} element
 * @param {number=} opt_heightBuffer
 * @param {Function=} opt_onTick
 * @param {Function=} opt_onEnd
 * @public
 */
nrg.ui.ScrollableZippyTree.prototype.scaleElementOnChange = 
function(element, opt_heightBuffer, opt_onTick, opt_onEnd) {
   this.ZippyTree.scaleElementOnChange(
       element, 
       opt_heightBuffer, 
       function(){
	   if (goog.isDefAndNotNull(opt_onTick)){
	       opt_onTick();
	   }
	   this.mapSliderToContents();
       }.bind(this),
       function(){
	   if (goog.isDefAndNotNull(opt_onEnd)){
	       opt_onEnd();
	   }
       }.bind(this)
   );
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




goog.exportSymbol('nrg.ui.ScrollableZippyTree.EventType',
	nrg.ui.ScrollableZippyTree.EventType);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.ID_PREFIX',
	nrg.ui.ScrollableZippyTree.ID_PREFIX);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.CSS_SUFFIX',
	nrg.ui.ScrollableZippyTree.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.render',
	nrg.ui.ScrollableZippyTree.prototype.render);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.addContents',
	nrg.ui.ScrollableZippyTree.prototype.addContents);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.expandAll',
	nrg.ui.ScrollableZippyTree.prototype.expandAll);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.collapseAll',
	nrg.ui.ScrollableZippyTree.prototype.collapseAll);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.setExpanded',
	nrg.ui.ScrollableZippyTree.prototype.setExpanded);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.getZippyTree',
	nrg.ui.ScrollableZippyTree.prototype.getZippyTree);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.addFolders',
	nrg.ui.ScrollableZippyTree.prototype.addFolders);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.setZippyTreeEvents',
	nrg.ui.ScrollableZippyTree.prototype.setZippyTreeEvents);
goog.exportSymbol(
    'nrg.ui.ScrollableZippyTree.prototype.scaleElementOnChange',
    nrg.ui.ScrollableZippyTree.prototype.scaleElementOnChange);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.updateStyle',
	nrg.ui.ScrollableZippyTree.prototype.updateStyle);
goog.exportSymbol('nrg.ui.ScrollableZippyTree.prototype.disposeInternal',
	nrg.ui.ScrollableZippyTree.prototype.disposeInternal);
