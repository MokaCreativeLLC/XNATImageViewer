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
 * @extends {goog.Disposable}
 * @constructor
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
goog.inherits(gxnat.ProjectTree, goog.Disposable);
goog.exportSymbol('gxnat.ProjectTree', gxnat.ProjectTree);



/**
 * @constructor
 * @param {!string} currLevel The level to create the current node from.
 * @param {!string} levelUri The uri of the level 
 * @return {!Object} The empty tree node.
 * @extends {goog.Disposable}
 */
gxnat.ProjectTree.TreeNode = function(currLevel, levelUri){
    this[gxnat.ProjectTree.PATH_KEY] = new gxnat.Path(levelUri);
    
    //
    // Construct next level attributes.
    //
    var nextLevelInd = gxnat.Path.xnatLevelOrder.indexOf(currLevel) + 1;
    if (nextLevelInd != -1){
	this[gxnat.ProjectTree.NEXTLEVEL_KEY] = 
	    gxnat.Path.xnatLevelOrder[nextLevelInd];

	//
	// If next level is not a string, we skip. See 
	// gxnat.Path.xnatLevelOrder for more info.
	//
	if (goog.isString(this[gxnat.ProjectTree.NEXTLEVEL_KEY])){
	    this[gxnat.ProjectTree.NEXTLEVELQUERY_KEY] = 
		this[gxnat.ProjectTree.PATH_KEY]['originalUrl'] 
		+ '/' + this[gxnat.ProjectTree.NEXTLEVEL_KEY];
	    this[this[gxnat.ProjectTree.NEXTLEVEL_KEY]] = [];
	}
    }
}
goog.inherits(gxnat.ProjectTree.TreeNode, goog.Disposable);
goog.exportSymbol('gxnat.ProjectTree.TreeNode', gxnat.ProjectTree.TreeNode);



/**
 * @public
 */
gxnat.ProjectTree.TreeNode.prototype.dispose = function(url) {
    goog.base(this, 'dispose');
    if (goog.isDefAndNotNull(this[gxnat.ProjectTree.PATH_KEY])){
	this[gxnat.ProjectTree.PATH_KEY].dispose();
    }
    goog.object.clear(this);
    //window.console.log('CLEARED NODE', this);
}



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
gxnat.ProjectTree.NEXTLEVELLOADED_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.METADATA_KEY = 'METADATA';



/**
 * @const
 */
gxnat.ProjectTree.PROJECT_METADATA = [
    'ID',
    'description',
    'name',
    'URI',
]



/**
 * @const
 */
gxnat.ProjectTree.SUBJECT_METADATA = [
    'height',
    'weight',
    'race',
    'ethnicity',
    'gender',
    'handedness',
    'dob',
    'age'
]


/**
 * @const
 */
gxnat.ProjectTree.EXPERIMENT_METADATA = [
    // nothing yet
]





/**
 * @param {Array.<string>} columnTitles
 * @return {!string} colStr
 */
gxnat.ProjectTree.getColumnQuery = function(columnTitles){
    var colStr = '&columns='
    goog.array.forEach(columnTitles, function(columnTitle, i){
	separator = ',';
	if (i == columnTitles.length - 1){
	    separator = '';
	}
	colStr += columnTitle + separator;
    })
    return colStr;
}



/**
 * @param {!Array.<gxnat.ProjectTree.TreeNode> | !gxnat.ProjectTree.TreeNode} 
 *     treeNodes
 * @return {!Array.string} The node uris
 */
gxnat.ProjectTree.getNodeUris = function(treeNodes){
    if (!goog.isArray(treeNodes)){
	treeNodes = [treeNodes];
    }
    var nodeUris = [];
    goog.array.forEach(treeNodes, function(treeNode){
	nodeUris.push(treeNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'])
    })
    return nodeUris;
}



/** 
 * @public
 * @param {!gxnat.ProjectTree.TreeNode} endNode
 * @return {!Object} An object similar to the tree, but with only one value
 *    in its XNAT level arrays.
 */
gxnat.ProjectTree.prototype.getBranch = function(endNode) {

    branch = {
	'projects': this['projects'][0]
    }

    //window.console.log('ENDNODE', this, endNode);

    //
    // End node is a subject
    //
    if (endNode[gxnat.ProjectTree.NEXTLEVEL_KEY] == 'experiments'){
	branch['subjects'] = endNode;
    }

    //
    // End node is an experiment
    //
    else if (goog.isArray(endNode[gxnat.ProjectTree.NEXTLEVEL_KEY])){
	branch['subjects'] = this.getSubjectNodeByUri(
	    endNode[gxnat.ProjectTree.PATH_KEY].pathByLevel('subjects'));
	branch['experiments'] = endNode;
    }

    return branch;    
}



/** 
 * @param {!gxnat.Path | !string} projPath The subject path to start the load 
 *   tree recursion from.
 * @param {!Function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.DEFAULT_STOP_LEVEL or by the opt_stopLevel 
 *   argument.  This gets passed into the getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.loadProject = function(callback) {
    var colStr = 
	gxnat.ProjectTree.getColumnQuery(gxnat.ProjectTree.PROJECT_METADATA);
    var projUri = this.initPath_['prefix'] + '/projects/' + 
	this.initPath_['projects'];

    //
    // First get the metadata associated with the project
    //
    var node;
    gxnat.jsonGet(this.initPath_['prefix'] + '/projects', function(projJson){
	//window.console.log('projJson', projJson);
	node = new gxnat.ProjectTree.TreeNode('projects', projUri);

	//
	// Store the node
	//
	this['projects'].push(node);

	//
	// Set the metata
	//
	node[gxnat.ProjectTree.METADATA_KEY] = projJson[0];

	//
	// Run the callback
	//
	callback(node);
    }.bind(this), '&ID=' + this.initPath_['projects'] + colStr)
}



/**
 * @param {!string} subjectUri
 * @return {gxnat.ProjectTree.TreeNode}
 * @public
 */
gxnat.ProjectTree.prototype.getSubjectNodeByUri = function(subjectUri){

    //
    // Exit out if the nodes aren't there
    //
    if (this['projects'].length == 0) {
	return;
    }
    else if (this['projects'][0]['subjects'].length == 0) {
	return;
    }

    //
    // loop through the subject nodes
    //
    var i = 0;
    var len = this['projects'][0]['subjects'].length;
    var subjNode;
    for (; i<len; i++){
	subjNode = this['projects'][0]['subjects'][i];
	if (subjNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'] ==
	    subjectUri) {
	    return subjNode;
	}
    }
}



/**
 * @param {!string} subjectUri
 * @return {gxnat.ProjectTree.TreeNode}
 * @public
 */
gxnat.ProjectTree.prototype.getExperimentNodeByUri = function(exptUri){
    var exptPath = new gxnat.Path(exptUri);
    var subjPath = exptPath.pathByLevel('subjects');
    var subjNode = this.getSubjectNodeByUri(subjPath);
    
    //
    // Exit out if no experiments
    //
    if (!goog.isDefAndNotNull(subjNode['experiments']) || 
	subjNode['experiments'].length == 0) {
	return;
    }

    var i = 0;
    var len = subjNode['experiments'].length;
    var exptNode;
    for (; i < len; i++) {
	exptNode = subjNode['experiments'][i];
	if (exptNode[gxnat.ProjectTree.PATH_KEY]['originalUrl'] == exptUri){
	    return exptNode;
	}
    }
}


/**
 * This is a separate function because we only want to call it when we
 * absolutely need it.
 *
 * @param {!string | !gxnat.ProjectTree.TreeNode | !gxnat.Path} subject
 * @param {!Function} callback The callback function to run once the subjects
 *     have been loaded.
 * @public
 */
gxnat.ProjectTree.prototype.loadSubjectMetadata = 
function(subject, callback) { 
    //
    // Get the appropriate subject node
    //
    var subjNode = subject;
    if (goog.isString(subject)){
	subjNode = this.getSubjectNodeByUri(subject);
    } 
    else if (subject instanceof gxnat.Path) {
	subjNode = this.getSubjectNodeByUri(subject['originalUrl']);	
    } 

    //
    // Metadata query strings
    //
    var subjMetadataQueryPrefix = this.initPath_['prefix'] + '/subjects';
    var colStr = 
	gxnat.ProjectTree.getColumnQuery(gxnat.ProjectTree.SUBJECT_METADATA);
    var subjId = subjNode[gxnat.ProjectTree.PATH_KEY]['subjects'];
    var subjQuery = '&ID=' + subjId + colStr;

    gxnat.jsonGet(subjMetadataQueryPrefix, function(subjMetadataJson){
	subjNode[gxnat.ProjectTree.METADATA_KEY] = subjMetadataJson[0];
	callback(subjNode)
    }.bind(this), subjQuery)
}



/**
 * @param {!Function} callback The callback function to run once the subjects
 *     have been loaded.
 */
gxnat.ProjectTree.prototype.loadSubjects = function(callback) { 
    var projNode = this['projects'][0];

    //
    // Don't reload the subjects if they exists
    //
    if (goog.isDefAndNotNull(projNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY])
       && projNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] == true){
	//window.console.log('Don\'t need to reload the subjects');
	return;
    }


    //
    // Query strings for getting the subject list
    //
    var subjectsUri = this['projects'][0][gxnat.ProjectTree.PATH_KEY]
    ['originalUrl'] + '/subjects';


    //
    // Query for the subjects within the project
    //
    var subjNode;
    gxnat.jsonGet(subjectsUri, function(subjJsons){
	//
	// Loop through the subjJsons
	//
	goog.array.forEach(subjJsons, function(subjJson){
	    
	    //
	    // Create and store new subject node
	    //
	    subjNode = new gxnat.ProjectTree.TreeNode('subjects', 
				subjectsUri + '/' + subjJson['ID']);
	    projNode['subjects'].push(subjNode);
	    
	    //
	    // Run the callback if we've hit all subjects
	    //
	    if (projNode['subjects'].length == 
		subjJsons.length){
		projNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] == true;
		callback(projNode['subjects'])
	    }
   
	}.bind(this))
    }.bind(this))
}



/**
 * This is a separate function because we only want to call it when we
 * absolutely need it.
 *
 * @param {!string | !gxnat.ProjectTree.TreeNode | !gxnat.Path} experiment
 * @param {!Function} callback The callback function to run once the experiments
 *     have been loaded.
 * @public
 */
gxnat.ProjectTree.prototype.loadExperimentMetadata = 
function(experiment, callback) { 
    //
    // Get the appropriate experiment node
    //
    var exptNode = experiment;
    if (goog.isString(experiment)){
	exptNode = this.getExperimentNodeByUri(experiment);
    } 
    else if (experiment instanceof gxnat.Path) {
	exptNode = this.getExperimentNodeByUri(experiment['originalUrl']);	
    } 

    //
    // Metadata query strings
    //
    var exptMetadataQueryPrefix = this.initPath_['prefix'] + '/experiments';
    var colStr = 
	gxnat.ProjectTree.getColumnQuery(gxnat.ProjectTree.EXPERIMENT_METADATA);
    var exptId = exptNode[gxnat.ProjectTree.PATH_KEY]['experiments'];
    var exptQuery = '&ID=' + exptId + colStr;

    gxnat.jsonGet(exptMetadataQueryPrefix, function(exptMetadataJson){
	exptNode[gxnat.ProjectTree.METADATA_KEY] = exptMetadataJson[0];
	callback(exptNode)
    }.bind(this), exptQuery)
}



/** 
 * @param {!string | !gxnat.ProjectTree.TreeNode | !gxnat.Path} subject
 * @param {!Function} callback The callback function to run once the tree has
 *   been fully loaded up the level defined by 
 *   gxnat.ProjectTree.prototype.DEFAULT_STOP_LEVEL or by the opt_stopLevel 
 *   argument.  This gets passed into the getTree function.
 * @public
 */
gxnat.ProjectTree.prototype.loadExperiments = 
function(subject, callback) {

    //
    // Get the appropriate subject node
    //
    var subjNode = subject;
    if (goog.isString(subject)){
	subjNode = this.getSubjectNodeByUri(subject);
    } 
    else if (subject instanceof gxnat.Path) {
	subjNode = this.getSubjectNodeByUri(subject['originalUrl']);	
    } 

    if (goog.isDefAndNotNull(subjNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY])
       && subjNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] == true){
	//window.console.log('Don\'t need to reload the experiments');
	return;
    }

    //
    // Load the subject metadata if it doesn't exist FIRST.
    //
    if (!goog.isDefAndNotNull(subjNode[gxnat.ProjectTree.METADATA_KEY])){

	this.loadSubjectMetadata(subjNode, function(subjNode){
	    //window.console.log("Got subject metadata ", subjNode, 
	    // subjNode[gxnat.ProjectTree.METADATA_KEY]);
	    //
	    // Re-call method after completion.
	    //
	    this.loadExperiments(subjNode, callback);
	}.bind(this))
    }

    //
    // Construct the experiment query path
    //
    var exptsUri = subjNode[gxnat.ProjectTree.PATH_KEY]
    ['originalUrl'] + '/experiments';

    //
    // Query for the subjects within the project
    //
    var exptNode;
    gxnat.jsonGet(exptsUri, function(exptJsons){
	//
	// Loop through the exptJsons
	//
	goog.array.forEach(exptJsons, function(exptJson){
	    
	    //
	    // Create and store new subject node
	    //
	    //window.console.log(exptJson);
	    exptNode = new gxnat.ProjectTree.TreeNode('experiments', 
				exptsUri + '/' + exptJson['ID']);
	    subjNode['experiments'].push(exptNode);
	    
	    //
	    // Run the callback if we've hit all subjects
	    //
	    if (subjNode['experiments'].length == exptJsons.length){
		subjNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] = true;
		callback(subjNode['experiments'])
	    }
  
	}.bind(this))
    }.bind(this))
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
    goog.base(this, 'dispose');

    //
    // Dispose the init path
    //
    this.initPath_.dispose();
    delete this.initPath_;

    //
    // Clear the tree structure
    //
    goog.array.forEach(this['projects'], function(projNode){
	if (goog.isDefAndNotNull(projNode['subjects'])){
	    goog.array.forEach(projNode['subjects'], function(subjNode){
		if (goog.isDefAndNotNull(subjNode['experiments'])){
		    goog.array.forEach(subjNode['experiments'], 
				       function(exptNode){
			exptNode.dispose();
		    })	  
		}
		subjNode.dispose();
	    })
	}
	projNode.dispose();
    })

    //window.console.log('PRE-CLEARED TREE', this);
    goog.object.clear(this);
    //window.console.log('CLEARED TREE', this);
}
