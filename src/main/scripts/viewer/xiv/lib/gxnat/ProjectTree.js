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
 *
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

    //
    // Necessary as the starting node for the class
    //
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
gxnat.ProjectTree.DEFAULT_STOP_LEVEL = 'experiments';



/**
 * @type {!string}
 * @private
 */
gxnat.ProjectTree.prototype.currStopLevel_ = 
    gxnat.ProjectTree.DEFAULT_STOP_LEVEL;



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
 * @param {!string
 * @private
 */
gxnat.ProjectTree.prototype.setStopLevel = function(xnatLevel) {
    this.currStopLevel_ = xnatLevel;
};



/**
 * Loads the projects nodes ONLY pertianing to the initPath provided
 * in the constructor. 
 *
 * @param {!string} branchPath
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.DEFAULT_STOP_LEVEL.  This gets passed into the
 *   getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.loadBranch = 
function(branchPath, doneCallback){
    this.branchPath_ = new gxnat.Path(branchPath);
    var i=0;
    var len = gxnat.Path.xnatLevelOrder.length;
    var node = this;
    var levelUri = this.branchPath_['prefix'];
    var nodeChain = [];
    var level; 
    var newNode;


    this.currStopLevel_ = this.branchPath_.getDeepestLevel();

    //
    // Loop xnat levels until we're at the STOP_LEVEL
    //
    for (; i<len; i++) {
	
	newNode = null;

	//
	// Get the current level
	//
	level = gxnat.Path.xnatLevelOrder[i];
	
	//
	// Construct the level URI
	//
	levelUri += '/' + level + '/' + this.branchPath_[level];

	//
	// Create the node level
	//
	if (!goog.isDefAndNotNull(node[level])){
	    node[level] = [];
	    //window.console.log("LEVEL", node, level);
	}

	//
	// Check if new node exists
	//	
	else if (node[level].length > 0){
	    var j = 0;
	    var len2 = node[level].length;
	    var subNode;

	    for (; j<len2; j++) {
		subNode = node[level][j];
		if (subNode[gxnat.ProjectTree.PATH_KEY]
		    ['originalUrl'] == levelUri) {
		    //window.console.log("EXISTS!");
		    newNode = subNode;
		}
	    }
	} 

	//
	// Otherwise Create and store the new node
	//
	if (!goog.isDefAndNotNull(newNode)) {
	    newNode = this.createEmptyTreeNode_(level, levelUri);
	    node[level].push(newNode)
	    nodeChain.push(newNode);
	}

	//
	// Set the new node
	//
	node = newNode;
	//window.console.log("LEVEL", level, levelUri, node, 
	//newNode, nodeChain);

	//
	// Break out if at STOP_LEVEL
	//
	if (level === this.currStopLevel_) { break; }
    }

    //
    // Recursively get the tree branch.
    //
    //window.console.log(nodeChain);
    this.getBranch(nodeChain[0], nodeChain, doneCallback);
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
gxnat.ProjectTree.prototype.getBranch = 
function(currNode, nodeChain, onCompleteCallback) {
    //window.console.log('\n\nCURR NODE', currNode, nodeChain);

    var continue_ = function(){
	//
	// Pop the node out of the nodeChain array.
	//
	goog.array.remove(nodeChain, currNode);

	//
	// Run the 'done' callback if there are no nodes left.
	//
	if (nodeChain.length == 0){
	    onCompleteCallback(this);
	    return;
	} 

	//
	// Otherwise recurse...
	//
	else {
	    this.getBranch(nodeChain[0], nodeChain, 
			   onCompleteCallback);
	}
    }.bind(this)


    //
    // We don't need to call the jsonGet if we have the metadata key defined.
    //
    if (goog.isDefAndNotNull(
	currNode[gxnat.ProjectTree.METADATA_KEY])) {
	continue_();
    }


    //
    // Get the JSON assiociated with tne node
    //
    gxnat.jsonGet(currNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'], 
	function(jsonArr){
	    //
	    // Store the metadata
	    //
	    if (!goog.isDefAndNotNull(
		currNode[gxnat.ProjectTree.METADATA_KEY])) {
		currNode[gxnat.ProjectTree.METADATA_KEY] = jsonArr['items'][0];
		window.console.log('1', jsonArr['items'][0]);
	    }

	    continue_();
	}.bind(this))
}




/** 
 * @param {!gxnat.Path} subjPath The subject path to start the load tree 
 *     recursion from.
 * @param {!Function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.DEFAULT_STOP_LEVEL or by the opt_stopLevel 
 *   argument.  This gets passed into the getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.loadExperiments = 
function(subjPath, callback) {

    this.currStopLevel_ = 'experiments';
    this.stopLevelRetrieved_ = 0;

    //
    // Construct the query path
    //
    var queryPath = subjPath['originalUrl'] + '/experiments';

    //
    // Find the subject node associated with the subjPath
    //
    var i = 0, len = this['projects'][0]['subjects'].length;
    var subjNode, currSubjNode;
    for(; i<len; i++) {
	subjNode = this['projects'][0]['subjects'][i];
	if(subjNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'] == 
	    subjPath['originalUrl']){
	    currSubjNode = subjNode;
	    break;
	}
    }

    //
    // Pass the current subject node into the callback
    //
    var doneCallback = function(){
	var exptNodeCount = currSubjNode['experiments'].length;
	var counter = 0;
	goog.array.forEach(currSubjNode['experiments'], function(exptNode, i){

	    //
	    // Get the metadata for each experiment node
	    //
	    gxnat.jsonGet(exptNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'], 
                function(levelJsonArr){
		    counter++;
		    if (!goog.isDefAndNotNull(exptNode
				[gxnat.ProjectTree.METADATA_KEY])) {
			exptNode[gxnat.ProjectTree.METADATA_KEY] = 
			    levelJsonArr['items'][0];
		    }
		    if (counter == exptNodeCount){
			callback(currSubjNode);
		    }
		}.bind(this))
	}.bind(this))	
    }

    //
    // Get the tree within the subject node
    //
    this.getTree('subjects', null, doneCallback, currSubjNode);
}



/**
 * @param {!Function} callback The callback function to run once the subjects
 *     have been loaded.
 */
gxnat.ProjectTree.prototype.loadSubjects = function(callback) { 
    //this.loadFromRoot_(callback, 'subjects');

    this.stopLevelRetrieved_ = 0;
    this.currStopLevel_ = 'subjects';
    this.getTree('projects', 
		 this.initPath_.pathByLevel('projects'), callback, 
		 this['projects'][0])
}



/**
 * Loads the project tree.  This is implemented because of the AJAX queries
 * needed and why it's not part of the constructor.
 * The current default stop level of 'experiments' 
 * tends to create performance issues on large CNDA projects, so it's preferred
 * that stopLevel be defined as 'subjects' by the user.
 *
 * @param {!Function} callback The callback function to run once the tree has
 *     been fully loaded up the level defined the stopLevel 
 *     argument.  This gets passed into the getTree function.
 * @param {!string} stopLevel The stop level, either 'subjects' or 
 *     'experiments'.  
 * @public
 */
gxnat.ProjectTree.prototype.loadFromRoot_ = function(callback, stopLevel){

    this.stopLevelRetrieved_ = 0;
    this.currStopLevel_ = stopLevel;
    var initQueryPath = this.initPath_['prefix'] + '/projects/' + 
	this.initPath_['projects'] + '/' + this.currStopLevel_;

    //
    // Begin a chain of JSON get events.
    //
    gxnat.jsonGet(initQueryPath, function(stopLevelArr){
	//
	// Store the number of stopLevel objects within the project.  
	//
	this.stopLevelCount_ = stopLevelArr.length;

	//
	// If the project is not defined...
	//
	if (this['projects'].length == 0) {
	    this['projects'].push(this.getTree('projects', 
	    	this.initPath_.pathByLevel('projects'), callback)); 
	} 

	//
	// If it is defined...
	//
	else {
	    this.getTree('projects', 
			 this.initPath_.pathByLevel('projects'), callback, 
					       this['projects'][0])
	    
	}
    }.bind(this))
}



/**
 * Function that queries XNAT by each level node.  Levels are defined
 * by gxnat.Path.xnatLevelOrder.  Constructs a node based on the arguments
 * provided.
 *
 * @param {!string} currLevel The level to create the current node from.
 * @param {?string} levelUri The uri of the level 
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 'currStopLevel_' property.
 * @param {!Object} opt_startNode The optional starting node.
 * @public
 */
gxnat.ProjectTree.prototype.getTree = 
function(currLevel, levelUri, callback, opt_startNode){
    //window.console.log("OPT START NODE", opt_startNode);

    var node = goog.isDefAndNotNull(opt_startNode) ? opt_startNode : 
	this.createEmptyTreeNode_(currLevel, levelUri);

    //window.console.log("GET TREE", this.stopLevelRetrieved_);

    // Return if at the STOP_LEVEL
    if (currLevel === this.currStopLevel_) {
	this.stopLevelRetrieved_++;
	return node;
    }

    return this.createSubTree_(node, callback);
}



/**
 * @param {!Object} node The tree node to derive the subtree from.
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.DEFAULT_STOP_LEVEL.  
 * @return {!Object} The updated tree Node.
 * @private
 */
gxnat.ProjectTree.prototype.createSubTree_ = function(node, callback){
    var subTree;


    var continue_ = function(node, nextLevelJsonArr){
	//
	// Loop through the next levels...
	//
	var subTreeQuery, subNodes, existingSubNode;
	goog.array.forEach(nextLevelJsonArr, function(nextLevelObj){

	    //
	    // Construct the queryUrl for the subTree
	    //
	    subTreeQuery = 
		node[gxnat.ProjectTree.PATH_KEY]['originalUrl'] +
		'/' + node[gxnat.ProjectTree.NEXTLEVEL_KEY] +
		'/' + nextLevelObj['ID'];

	    //
	    // Params
	    //
	    subNodes = node[node[gxnat.ProjectTree.NEXTLEVEL_KEY]];
	    existingSubNode = null;

	    //
	    // First check if we already have a subtree with the same
	    // path, so we don't recreate
	    //
	    if (subNodes.length > 0){
		goog.array.forEach(subNodes, function(subNode){
		    if (subNode[gxnat.ProjectTree.PATH_KEY]
			['originalUrl'] == subTreeQuery) {
			existingSubNode = subNode;
		    }
		})
	    }
	    //
	    // Get the subTree (it won't create a new one if it's
	    // alreadt there)
	    //
	    subTree = this.getTree(
		node[gxnat.ProjectTree.NEXTLEVEL_KEY], 
		subTreeQuery, 
		callback, existingSubNode)
	    
	    //
	    // Store the subtree
	    //
	    if (!goog.array.contains(subNodes, subTree)){
		subNodes.push(subTree);	
	    }

	    //
	    // Run callback once all the experiments have been accounted 
	    // for.
	    //
	    if (this.stopLevelRetrieved_ === this.stopLevelCount_) {
		//window.console.log(this.stopLevelCount_);
		callback(this)
	    }
	}.bind(this))
    }.bind(this)
    
    //
    // If we already have the next levels defined, we don't need to do it
    // again...
    //
    if (goog.isDefAndNotNull(node[gxnat.ProjectTree.NEXTLEVELJSON_KEY])){
	continue_(node, node[gxnat.ProjectTree.NEXTLEVELJSON_KEY]);
    }
    
    //
    // First get the json of the node.
    //
    gxnat.jsonGet(node[gxnat.ProjectTree.PATH_KEY]['originalUrl'], 
       function(levelJsonArr){
	   
	   //window.console.log('\n\nBegin');
	   //window.console.log(node[gxnat.ProjectTree.PATH_KEY]['originalUrl'])
	   //window.console.log(levelJsonArr);
	//
	// Store the metadata -- this gives us information such as race,
	// ID, handedness, etc. depending on the level.
	//
	if (!goog.isDefAndNotNull(node[gxnat.ProjectTree.METADATA_KEY])) {
	    node[gxnat.ProjectTree.METADATA_KEY] = levelJsonArr['items'][0];
	    window.console.log('3', node[gxnat.ProjectTree.METADATA_KEY]);
	}
	   
	//
	// Return if no next level query key is given
        //
	if (!goog.isDefAndNotNull(node[gxnat.ProjectTree.NEXTLEVELQUERY_KEY])){
	    return;
	}

	//
	// Then query for the next level of that node.
	//
	gxnat.jsonGet(node[gxnat.ProjectTree.NEXTLEVELQUERY_KEY], 
           function(nextLevelJsonArr){

	       //window.console.log(node[gxnat.ProjectTree.NEXTLEVEL_KEY], 
		//		  this.currStopLevel_);
	       if (node[gxnat.ProjectTree.NEXTLEVEL_KEY] == 
		   this.currStopLevel_) {
		   this.stopLevelCount_ = nextLevelJsonArr.length;
	       }

	       //
	       // Set the nextLevel property
	       //
	       node[gxnat.ProjectTree.NEXTLEVELJSON_KEY] = nextLevelJsonArr;

	       continue_(node, node[gxnat.ProjectTree.NEXTLEVELJSON_KEY]);
	       
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

    if (goog.isDefAndNotNull(this.branchPath_)){
	this.branchPath_.dispose();
	delete this.branchPath_;
    }

    this.initPath_.dispose();
    delete this.initPath_;
    
    this.currStopLevel_ = null;
    delete this.currStopLevel_;

    //window.console.log('PRE-CLEARED TREE', this);
    goog.object.clear(this);
    //window.console.log('CLEARED TREE', this);

}
