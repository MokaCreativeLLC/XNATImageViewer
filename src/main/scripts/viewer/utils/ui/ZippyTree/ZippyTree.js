/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy.Events');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.dom.FadeIn');
goog.require('goog.ui.Zippy');

// utils
goog.require('utils.events.EventManager');
goog.require('utils.ui.ZippyNode');



/**
 * @constructor
 * @extends {utils.ui.ZippyNode}
 */
goog.provide('utils.ui.ZippyTree');
utils.ui.ZippyTree = function () {

    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_' + 
	goog.string.createUniqueString(),
	'class': this.constructor.ELEMENT_CLASS,
    })

    // PARENT CONSTRUCTOR
    goog.base(this, '', this.element_); 

    // Hide the header
    goog.dom.classes.add(this.getHeader(), utils.ui.ZippyTree.ROOT_NODE_CLASS);

    // Events
    utils.events.EventManager.addEventManager(this, 
					      utils.ui.ZippyTree.EventType);


    this.secondaryQueue_ = [];
    this.AnimQueue_= new goog.fx.AnimationSerialQueue();

    goog.events.listen(this.AnimQueue_, 'end', this.continueAnim_.bind(this));
}
goog.inherits(utils.ui.ZippyTree, utils.ui.ZippyNode);
goog.exportSymbol('utils.ui.ZippyTree', utils.ui.ZippyTree);



/**
* @public
*/
utils.ui.ZippyTree.prototype.runFadeIn = function() {
    return;
}


/**
* @private
*/
utils.ui.ZippyTree.prototype.continueAnim_ = function() {
    window.console.log("ANIM DONE", this.AnimQueue_.isPlaying());
    this.AnimQueue_.disposeInternal();
    while(this.secondaryQueue_.length){

	//window.console.log("Adding anim");
	var anim = this.secondaryQueue_[0];
	
	this.AnimQueue_.add(anim);
	//window.console.log(anim);
	goog.array.removeAt(this.secondaryQueue_, 0);

    }
    goog.events.listen(this.AnimQueue_, 'end', this.continueAnim_.bind(this));
    //window.console.log("PLAYTING");
    this.AnimQueue_.play();
}



/**
 * Event types.
 * @enum {string}
 */
utils.ui.ZippyTree.EventType = {
  CONTENTADDED: goog.events.getUniqueId('contentadded'),
  NODEADDED: goog.events.getUniqueId('zippyadded'),
};



/**
 * @type {!string} 
 * @const
 * @expose
 */
utils.ui.ZippyTree.ID_PREFIX =  'utils.ui.ZippyTree';



/**
 * @const
 * @type {!number}
 */
utils.ui.ZippyTree.INDENT_PCT = 5;



/**
 * @type {!string} 
 * @const
*/
utils.ui.ZippyTree.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(utils.ui.ZippyTree.ID_PREFIX.toLowerCase().
			   replace(/\./g,'-'));



/**
 * @type {!string} 
 * @const
*/
utils.ui.ZippyTree.ELEMENT_CLASS =  
goog.getCssName(utils.ui.ZippyTree.CSS_CLASS_PREFIX, '');



/**
 * @type {!string} 
 * @const
*/
utils.ui.ZippyTree.ROOT_NODE_CLASS =  
goog.getCssName(utils.ui.ZippyTree.CSS_CLASS_PREFIX, 'rootnode');



/**
 * @const
 * @type {!number}
 */
utils.ui.ZippyTree.FADE_TIME = 70;



/**
 * @type {!number}
 * @private
 */
utils.ui.ZippyTree.prototype.maxDepth_ = 0;



/**
 * @type {!number}
 * @private
 */
utils.ui.ZippyTree.prototype.fadeInFx_ = false;



/**
 * As stated.
 * @param {!boolean} Toggler.
 * @public
 */
utils.ui.ZippyTree.prototype.toggleFadeInFx = function(b) {
    return this.fadeInFx_ = (b === true);
}



/**
 * As stated.
 * @return {!Element} The element.
 * @public
 */
utils.ui.ZippyTree.prototype.getElement = function() {
    return this.element_
}




/**
 * 
 * @param {!Element} element
 * @param {string= | Array.string=} opt_folders
 * @param {function=} opt_callback
 * @public
 */
utils.ui.ZippyTree.prototype.addContent = 
function(element, opt_folders) {

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
 * @param {!string | !Array.string} folders
 * @param {!Element} element
 * @private
 */
utils.ui.ZippyTree.prototype.createBranch_ = function(folders, 
						      opt_parentNode,
						      opt_contentElt) {
    
    var opt_parentNode = opt_parentNode ? opt_parentNode : this;
    var contentHolder = /**@type {!Element}*/ opt_parentNode.getContentHolder();
    var initOpacity = this.fadeInFx_ ? 0 : 1;
    var fadeInTime = this.fadeInFx_ ? utils.ui.ZippyTree.FADE_TIME : 0;



    // If at the end of the hierarchy, then add to contentHolder.
    if (folders.length == 0 && opt_contentElt){

	if (opt_contentElt) {
	    utils.style.setStyle(opt_contentElt, {'position': 'relative'});
	    opt_contentElt.style.opacity = initOpacity;
	    goog.dom.append(contentHolder, opt_contentElt);
	    var anim = new goog.fx.dom.FadeIn(opt_contentElt, fadeInTime);
	    if (!this.AnimQueue_.isPlaying()){		
		this.AnimQueue_.add(anim)
	    } else{
		this.secondaryQueue_.push(anim);
	    }
	}
	
	this.indentNodes_();
	
	if (!this.AnimQueue_.isPlaying()){
	    this.AnimQueue_.play();
	} 

	this['EVENTS'].runEvent('CONTENTADDED');

	return;
    }

    // Get existing nodes.
    var currNode = /**@type {utils.ui.ZippyNode}*/ undefined;
    if (opt_parentNode.getNodes()[folders[0]]){
	currNode = opt_parentNode.getNodes()[folders[0]];
	// Modify folders...
	var newFolders = /**@type {!Array.string}*/
	(folders.length > 1) ? folders.slice(1) : [];
	this.createBranch_(newFolders, currNode, opt_contentElt);
    }
    
    // Otherwise, create new node...
    else {

	contentHolder.style.opacity = initOpacity;

	currNode = /**@type {!utils.ui.ZippyNode}*/
	new utils.ui.ZippyNode(folders[0], contentHolder);
	opt_parentNode.getNodes()[folders[0]] = currNode;

	var header = currNode.getHeader();
	header.style.opacity = initOpacity;
	contentHolder.style.opacity = 1;
	
	var anim = new goog.fx.dom.FadeIn(header, fadeInTime);
	if (!this.AnimQueue_.isPlaying()){
	    window.console.log("add header anim");
	    this.AnimQueue_.add(anim)
	} else {
	    window.console.log("add header queue anim");
	    this.secondaryQueue_.push(anim);
	}

	// Modify folders...
	var newFolders = /**@type {!Array.string}*/
	(folders.length > 1) ? folders.slice(1) : [];
	this.createBranch_(newFolders, currNode, opt_contentElt);
	this.indentNodes_();
	
	this['EVENTS'].runEvent('NODEADDED', currNode);
    }


}



/**
 * Indents the zippy headers based on their depth.
 * @private
 */
utils.ui.ZippyTree.prototype.indentNodes_ = function(currNode, currDepth){

    var currNodeset = /**@type {Object.<string, goog.ui.ZippyNode>}*/ 
    currNode ? currNode.getNodes(): this.getNodes();    

    //if (currNode){ window.console.log('\n\n',currNode.title_)}
    //window.console.log("NODE COUNT", goog.object.getCount(currNodeset));
   var currDepth = /**@type {!number}*/ currDepth ? currDepth : 0; 


    if (!currNodeset || (goog.object.getCount(currNodeset) == 0)){ 

	var holder = currNode.getContentHolder();
	currDepth--;
	goog.array.forEach(holder.childNodes, function(node){
	node.style.width = (100 - (this.maxDepth_ * 
			     this.constructor.INDENT_PCT)).toString() + '%';
	node.style.left = (currDepth  * 
			     this.constructor.INDENT_PCT).toString() + '%';
	
	}.bind(this))
	return 

    };



    goog.object.forEach(currNodeset, function(loopNode){
	var header = /**@type {!utils.ui.ZippyNode}*/ loopNode.getHeader();
	header.style.width = (100 - (this.maxDepth_ * 
			     this.constructor.INDENT_PCT)).toString() + '%';
	header.style.left = (currDepth * 
			     this.constructor.INDENT_PCT).toString() + '%';
	//window.console.log(header.id, currDepth);
	this.indentNodes_(loopNode, currDepth+1);
    }.bind(this))

}





