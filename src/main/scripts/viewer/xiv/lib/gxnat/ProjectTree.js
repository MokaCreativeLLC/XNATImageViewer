/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.Disposable');

//nrg
goog.require('gxnat');
goog.require('gxnat.Path');



/**
 * Contains various classes used for extracting 
 * information about a project, its subjects and experiments.  Communicates
 * with an XNAT host to derive this information.  Info. includes
 * the original JSON of each folder/node received from XNAT as well as 
 * gxnat.Path objects associated with each node.  The class is basically
 * an Object.<string, Array.<Object.<string.Array (to N levels of depth, but
 * it stops at the experiment level for now).
 * @param {!string} xnatProjUrl The XNAT URL to derive the path object from.
 * @constructor
 * @dict
 */
goog.provide('gxnat.ProjectTree');
gxnat.ProjectTree = function(xnatProjUrl){
    //window.console.log("\n\nProject Tree init path: ", xnatProjUrl);

    /**
     * @type {!gxnat.Path}
     * @private
     */
    this.initPath_ = new gxnat.Path(xnatProjUrl);


    //window.console.log(this.initPath_);
   

    // Necessary as the starting node for the class
    this['projects'] = [];		 
}
goog.exportSymbol('gxnat.ProjectTree', gxnat.ProjectTree);



/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVELQUERY_KEY = '_nextLevelQuery';


/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVELJSON_KEY = '_nextLevelJsons';


/**
 * @const
 */
gxnat.ProjectTree.ORIGINALURL_KEY = 'originalUrl';


/**
 * @const
 */
gxnat.ProjectTree.PATH_KEY = '_Path';


/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVEL_KEY = '_nextLevel';


/**
 * @const
 */
gxnat.ProjectTree.METADATA_KEY = 'METADATA';



/**
 * @type {!string}
 * @const
 */
gxnat.ProjectTree.prototype.STOP_LEVEL = 'experiments';



/**
 * @type {!number}
 * @private
 */
gxnat.ProjectTree.prototype.stopLevelCount_ = 0;



/**
 * @type {!number}
 * @private
 */
gxnat.ProjectTree.prototype.stopLevelRetrieved_ = 0;



/**
 * @type {!gxnat.Path}
 * @private
 */
gxnat.ProjectTree.prototype.partialPath_ = null;




/**
 * Loads the projects nodes ONLY pertianing to the initPath provided
 * in the constructor. 
 *
 * @param {!string} partialPath
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.STOP_LEVEL.  This gets passed into the
 *   getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.partialLoad = function(partialPath, doneCallback){
    this.partialPath_ = new gxnat.Path(partialPath);
    var i=0;
    var len = gxnat.Path.xnatLevelOrder.length;
    var node = this;
    var levelUri = this.partialPath_['prefix'];
    var nodeChain = [];
    var level; 
    var newNode;

    //
    // Loop xnat levels until we're at the STOP_LEVEL
    //
    for (; i<len; i++) {

	//
	// Get the current level
	//
	level = gxnat.Path.xnatLevelOrder[i];

	//
	// Create the node level
	//
	if (!goog.isDefAndNotNull(node[level])){
	    node[level] = [];
	}

	//
	// Construct the level URI
	//
	levelUri += '/' + level + '/' + this.partialPath_[level];

	//
	// Create and store the new node
	//
	newNode = this.createEmptyTreeNode_(level, levelUri);
	node[level].push(newNode)
	nodeChain.push(newNode);

	//
	// Set the new node
	//
	node = newNode;

	//
	// Break out if at STOP_LEVEL
	//
	if (level === this.STOP_LEVEL) { break; }
    }

    //
    // Recursively get the tree branch.
    //
    //window.console.log(nodeChain);
    this.getProjectTreeBranch(nodeChain[0], nodeChain, doneCallback);
    //window.console.log(this);
}


/**
 * Now we recursively cycle through the new nodes (stored in array), 
 * acquiring the relevant metadata via AJAX queries.  We then 
 * pop the node out of the array once we recieved its JSON.
 *
 * @param {!Object} currNode
 * @param {!Object} nodeChain
 * @param {!Function} onCompleteCallback
 *
 * @public
 */
gxnat.ProjectTree.prototype.getProjectTreeBranch = 
function(currNode, nodeChain, onCompleteCallback) {
    //window.console.log('\n\nCURR NODE', currNode, nodeChain);

    //
    // Get the JSON assiociated with tne node
    //
    gxnat.jsonGet(currNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'], 
	function(jsonArr){
	    //
	    // Store the metadata
	    //
	    currNode[gxnat.ProjectTree.METADATA_KEY] = jsonArr['items'][0];

	    //
	    // Pop the node out of the nodeChain array.
	    //
	    goog.array.remove(nodeChain, currNode);
	    //window.console.log(nodeChain);

	    //
	    // Run the 'done' callback if there are no nodes left.
	    //
	    if (nodeChain.length == 0){
		//window.console.log("DONE CALLBACK!", onCompleteCallback);
		onCompleteCallback(this);
		return;
	    } 

	    //
	    // Otherwise recurse...
	    //
	    else {
		this.getProjectTreeBranch(nodeChain[0], nodeChain, 
					  onCompleteCallback);
	    }
	}.bind(this))
}





/**
 * Loads the project tree.  This is implemented because of the AJAX queries
 * needed and why it's not part of the constructor.
 *
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.STOP_LEVEL.  This gets passed into the
 *   getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.load = function(callback){

    //--------------------
    // FIRST, we get all of the experiments within the project 
    // first, just to make sure have the correct count.
    //------------------
    var initQueryPath = this.initPath_['prefix'] + '/projects/' + 
	this.initPath_['projects'] + '/' + this.STOP_LEVEL;
    gxnat.jsonGet(initQueryPath, function(stopLevelArr){
	    //
	    // Store the number of experiments within the project.  
	    //
	    this.stopLevelCount_ = stopLevelArr.length;

	    //
	    // Then call getTree recrusion
	    //
	    this['projects'].push(this.getTree('projects', 
	    		this.initPath_.pathByLevel('projects'), callback)); 
	}.bind(this))
}



/**
 * Function that queries XNAT by each level node.  Levels are defined
 * by gxnat.Path.xnatLevelOrder.  Constructs a node based on the arguments
 * provided.
 *
 * @param {!string} currLevel The level to create the current node from.
 * @param {!string} levelUri The uri of the level 
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.STOP_LEVEL.
 * @public
 */
gxnat.ProjectTree.prototype.getTree = 
function(currLevel, levelUri, callback){
    var node = this.createEmptyTreeNode_(currLevel, levelUri);
    // Return if at the STOP_LEVEL
    if (currLevel === this.STOP_LEVEL) {
	this.stopLevelRetrieved_++;
	return node;
    }

    return this.createSubTree_(node, callback);
}



/**
 * As stated.
 * @param {!Object} node The tree node to derive the subtree from.
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.STOP_LEVEL.  
 * @return {!Object} The updated tree Node.
 * @private
 */
gxnat.ProjectTree.prototype.createSubTree_ = function(node, callback){

    var subTree;

    //
    // First get the json of the node.
    //
    gxnat.jsonGet(node[gxnat.ProjectTree.PATH_KEY]['originalUrl'], 
       function(levelJsonArr){

	//
	// Store the metadata -- this gives us information such as race,
	// ID, handedness, etc. depending on the level.
	//
	node[gxnat.ProjectTree.METADATA_KEY] = levelJsonArr['items'][0];

	//
	// Then query for the next level of that node.
	//
	gxnat.jsonGet(node[gxnat.ProjectTree.NEXTLEVELQUERY_KEY], 
           function(nextLevelJsonArr){

	       node[gxnat.ProjectTree.NEXTLEVELJSON_KEY] = nextLevelJsonArr;

	       goog.array.forEach(nextLevelJsonArr, function(nextLevelObj){

		   //
		   // Get the new subtree
		   //
		   subTree = this.getTree(
		       //
		       // The level of the subTree
		       //
		       node[gxnat.ProjectTree.NEXTLEVEL_KEY], 

		       //
		       // The queryURL of the subtree
		       //
		       node[gxnat.ProjectTree.PATH_KEY]['originalUrl'] 
			   + '/' + 
			   node[gxnat.ProjectTree.NEXTLEVEL_KEY] +
		       '/' + nextLevelObj['ID'], 
		       
		       //
		       // The callback once finished
		       //
		       callback)
		   
		   //
		   // Store the subtree
		   //
		   node[node[gxnat.ProjectTree.NEXTLEVEL_KEY]].push(subTree);	

		   //
		   // Store the metadata
		   //
		   subTree[gxnat.ProjectTree.METADATA_KEY] = 
		       nextLevelJsonArr[0];

		   //
		   // Run callback once all the experiments have been accounted 
		   // for.
		   //
		   if (this.stopLevelRetrieved_ === this.stopLevelCount_) {
		       callback(this)
		   }
	       }.bind(this))
	   }.bind(this))    
    }.bind(this))    
    return node;
}



/**
 * As stated.
 * @param {!string} currLevel The level to create the current node from.
 * @param {!string} levelUri The uri of the level 
 * @return {!Object} The empty tree node.
 * @private
 */
gxnat.ProjectTree.prototype.createEmptyTreeNode_ = 
function(currLevel, levelUri){
    var node = {};
    node[gxnat.ProjectTree.PATH_KEY] = new gxnat.Path(levelUri);
    
    //
    // Construct next level attributes.
    //
    var nextLevelInd = gxnat.Path.xnatLevelOrder.indexOf(currLevel) + 1;
    if (nextLevelInd != -1){
	node[gxnat.ProjectTree.NEXTLEVEL_KEY] = 
	    gxnat.Path.xnatLevelOrder[nextLevelInd];

	//
	// If next level is not a string, we skip. See 
	// gxnat.Path.xnatLevelOrder for more info.
	//
	if (goog.isString(node[gxnat.ProjectTree.NEXTLEVEL_KEY])){
	    node[gxnat.ProjectTree.NEXTLEVELQUERY_KEY] = 
		node[gxnat.ProjectTree.PATH_KEY]['originalUrl'] 
		+ '/' + node[gxnat.ProjectTree.NEXTLEVEL_KEY];
	    node[node[gxnat.ProjectTree.NEXTLEVEL_KEY]] = [];
	}
    }
    return node;
}




/**
 * Returns the XNAT URIs pertaining to a specified XNAT level.  For instance,
 * if getLevel = 'experiments', it would return all of the experiment URIs 
 * within the current project tree.
 * @param {!string} getLevel The XNAT level to get the URIs from. 
 * @return {!Array.string} The XNAT urs of the level.
 * @public
 */
gxnat.ProjectTree.prototype.getLevelUris = function(getLevel){
    var uris =  [];
    this.getLevelUris_(getLevel, 'projects', this, uris);
    return uris;
}


/**
 * Recursive function to derive the XNAT URIs. 
 * @param {!string} getLevel The XNAT level to get the UIS from. 
 * @param {!string} nextLevel The current XNAT level of the recursion. 
 * @param {!Object} treeNode The tree node object at the current level. 
 * @param {!Array.string} uris The array storing the uris. 
 * @private
 */
gxnat.ProjectTree.prototype.getLevelUris_ = 
function(getLevel, nextLevel, treeNode, uris) {

    var i = 0;
    var len = treeNode[nextLevel].length;

    //window.console.log('\n\nuris', nextLevel, getLevel, treeNode, 
    //treeNode[nextLevel], treeNode[nextLevel].length);

    for (i=0; i < len; i++){
	if (nextLevel === getLevel){
	    uris.push(treeNode[nextLevel][i][gxnat.ProjectTree.PATH_KEY]
		      ['originalUrl']);
	} else {
	    this.getLevelUris_(getLevel, 
			       treeNode[nextLevel][i]
			       [gxnat.ProjectTree.NEXTLEVEL_KEY], 
			       treeNode[nextLevel][i], 
			       uris);
	}
    }
    //window.console.log('uris 2', nextLevel, getLevel, uris);
}




/**
 * @param {!string} getLevel The XNAT level to get the URIs from. 
 * @return {!Array.<gxnat.ProjectTree>} The XNAT urs of the level.
 * @public
 */
gxnat.ProjectTree.prototype.getNodesByLevel = function(getLevel){
    var nodes =  [];
    this.getNodesByLevel_(getLevel, 'projects', this, nodes);
    return nodes;
}


/** 
 * @param {!string} getLevel The XNAT level to get the UIS from. 
 * @param {!string} nextLevel The current XNAT level of the recursion. 
 * @param {!Object} treeNode The tree node object at the current level. 
 * @param {!Array.string} nodes The array storing the nodes. 
 * @private
 */
gxnat.ProjectTree.prototype.getNodesByLevel_ = 
function(getLevel, nextLevel, treeNode, nodes) {
    var i = 0;
    var len = treeNode[nextLevel].length;

    for (i=0; i < len; i++){
	if (nextLevel === getLevel){
	    nodes.push(treeNode[nextLevel][i]);
	} else {
	    this.getNodesByLevel_(getLevel, 
			       treeNode[nextLevel][i]
				  [gxnat.ProjectTree.NEXTLEVEL_KEY], 
			       treeNode[nextLevel][i], 
			       nodes);
	}
    }
}





/**
 * @public
 */
gxnat.ProjectTree.prototype.dispose = function(url) {
    //goog.base(this, 'dispose');

    if (goog.isDefAndNotNull(this.partialPath_)){
	this.partialPath_.dispose();
	delete this.partialPath_;
    }

    this.initPath_.dispose();
    delete this.initPath_;

    //window.console.log('PRE-CLEARED TREE', this);
    goog.object.clear(this);
    //window.console.log('CLEARED TREE', this);

}
