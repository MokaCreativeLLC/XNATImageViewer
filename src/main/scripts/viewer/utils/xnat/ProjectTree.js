/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');

//utils
goog.require('utils.xnat');
goog.require('utils.xnat.Path');



/**
 * Contains various classes used for extracting 
 * information about a project, its subjects and experiments.  Communicates
 * with an XNAT host to derive this information.  Info. includes
 * the original JSON of each folder/node received from XNAT as well as 
 * utils.xnat.Path objects associated with each node.  The class is basically
 * an Object.<string, Array.<Object.<string.Array (to N levels of depth, but
 * it stops at the experiment level for now).
 * @param {!string} xnatProjUrl The XNAT URL to derive the path object from.
 * @constructor
 * @dict
 */
goog.provide('utils.xnat.ProjectTree');
utils.xnat.ProjectTree = function(xnatProjUrl){
    //window.console.log("\n\nProject Tree init path: ", xnatProjUrl);
    this.initPath_ = /** @type {!utils.xnat.Path} */
    new utils.xnat.Path(xnatProjUrl);
    // Necessary as the starting node for the class
    this['projects'] = [];		 
}
goog.exportSymbol('utils.xnat.ProjectTree', utils.xnat.ProjectTree);



/**
 * @type {!string}
 * @const
 */
utils.xnat.ProjectTree.prototype.STOP_LEVEL = 'experiments';



/**
 * @type {!number}
 * @private
 */
utils.xnat.ProjectTree.prototype.stopLevelCount_ = 0;



/**
 * @type {!number}
 * @private
 */
utils.xnat.ProjectTree.prototype.stopLevelRetrieved_ = 0;



/**
 * Loads the project tree.  This is implemented because of the AJAX queries
 * needed and why it's not part of the constructor.
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   utils.xnat.ProjectTree.prototype.STOP_LEVEL.  This gets passed into the
 *   getTree function.
 * @public
 */
utils.xnat.ProjectTree.prototype.load = function(callback){

    // Get the all of the stop level nodes in the XNAT server.
    utils.xnat.jsonGet(this.initPath_['prefix'] + '/' + this.STOP_LEVEL, 
	function(stopLevelArr){
	    var i = /**@type {!number} */ 0;
	    var len = /**@type {!number} */ stopLevelArr.length;

	    // Count the number of experiments within the project that
	    // was defined in the initPath_ attribute.
	    for (i=0; i<len; i++){
		if(stopLevelArr[i]['project'] === this.initPath_['projects']){
		    this.stopLevelCount_++;
		}
	    }

	    window.console.log("CALLBACK", callback);
	    // Call getTree
	    this['projects'].push(this.getTree('projects', 
	    		this.initPath_.pathByLevel('projects'), callback)); 
	}.bind(this))
}




/**
 * Function that queries XNAT by each level node.  Levels are defined
 * by utils.xnat.Path.xnatLevelOrder.  Constructs a node based on the arguments
 * provided.
 * @param {!string} currLevel The level to create the current node from.
 * @param {!string} levelUri The uri of the level 
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   utils.xnat.ProjectTree.prototype.STOP_LEVEL.
 * @public
 */
utils.xnat.ProjectTree.prototype.getTree = 
function(currLevel, levelUri, callback){
    var node = /**@type {!Object}*/ this.createEmptyTreeNode_(currLevel, 
							      levelUri);
    // Return if at the STOP_LEVEL
    if (currLevel === this.STOP_LEVEL) {
	this.stopLevelRetrieved_++;
	// Run callback once all the experiments have been accounted for.
	if (this.stopLevelRetrieved_ === this.stopLevelCount_) {
	    callback(this)
	}
	return node;
    }

    return this.createSubTree_(node, callback);
}



/**
 * As stated.
 * @param {!Object} node The tree node to derive the subtree from.
 * @param {!function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   utils.xnat.ProjectTree.prototype.STOP_LEVEL.  
 * @return {!Object} The updated tree Node.
 * @private
 */
utils.xnat.ProjectTree.prototype.createSubTree_ = function(node, callback){

    var subTree = /**@type {!Object}*/ {};
    utils.xnat.jsonGet(node['_nextLevelQuery'], function(nextLevelJsonArr){
	node['_nextLevelJsons'] = nextLevelJsonArr;
	goog.array.forEach(nextLevelJsonArr, function(nextLevelObj){
	    subTree = this.getTree(node['_nextLevel'], 
				node['_Path']['originalUrl'] 
				+ '/' + node['_nextLevel'] + '/' + 
				nextLevelObj['ID'], callback)
	    node[node['_nextLevel']].push(subTree);		
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
utils.xnat.ProjectTree.prototype.createEmptyTreeNode_ = 
function(currLevel, levelUri){
    var node = /**@type {!Object}*/ { 
	'_Path' : new utils.xnat.Path(levelUri)
    }
    // Construct next level attributes.
    var nextLevelInd = /**@type {!number}*/
    utils.xnat.Path.xnatLevelOrder.indexOf(currLevel) + 1;
    if (nextLevelInd != -1){
	node['_nextLevel'] = utils.xnat.Path.xnatLevelOrder[nextLevelInd];
	// If next level is not a string, we skip. See 
	// utils.xnat.Path.xnatLevelOrder for more info.
	if (goog.isString(node['_nextLevel'])){
	    node['_nextLevelQuery'] = node['_Path']['originalUrl'] 
		+ '/' + node['_nextLevel'];
	    node[node['_nextLevel']] = [];
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
utils.xnat.ProjectTree.prototype.getLevelUris = function(getLevel){
    var uris =  /**@type {!Array.string}*/ [];
    this.getLevelUris_(getLevel, 'projects', this, uris);
    return uris;
}



/**
 * Recursive function to derive the XNAT URIs. 
 * @param {!string} getLevel The XNAT level to get the UIS from. 
 * @param {!string} currLevel The current XNAT level of the recursion. 
 * @param {!Object} treeNode The tree node object at the current level. 
 * @param {!Array.string} uris The array storing the uris. 
 * @private
 */
utils.xnat.ProjectTree.prototype.getLevelUris_ = function(getLevel, currLevel, 
							 treeNode, uris) {

    var i = /**@type {!number}*/ 0;
    var len = /**@type {!number}*/ treeNode[currLevel].length;
    //window.console.log('\n\nuris', treeNode, currLevel, getLevel, uris);
    for (i=0; i < len; i++){
	if (currLevel === getLevel){
	    uris.push(treeNode[currLevel][i]['_Path']['originalUrl']);
	    //window.console.log("A", uris);
	} else {
	    this.getLevelUris_(getLevel, 
			      treeNode[currLevel][i]
			      ['_nextLevel'], 
			      treeNode[currLevel][i], 
			      uris);
	}
    }
    //window.console.log('uris', currLevel, getLevel, uris);
}



