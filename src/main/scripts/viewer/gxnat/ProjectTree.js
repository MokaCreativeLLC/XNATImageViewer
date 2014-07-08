 /**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.string');

// gxnat
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


    //
    // Another way of storing: direct reference.
    //
    this[gxnat.ProjectTree.PROJ_DIRECT] = {}		 
    this[gxnat.ProjectTree.SUBJ_DIRECT] = {}		 
    this[gxnat.ProjectTree.EXPT_DIRECT] = {}		 
}
goog.inherits(gxnat.ProjectTree, goog.Disposable);
goog.exportSymbol('gxnat.ProjectTree', gxnat.ProjectTree);



/**
 * @constructor
 * @param {!string | !gnxat.Path} levelUriOrPath The uri of the level 
 * @return {!Object} The empty tree node.
 * @extends {goog.Disposable}
 */
gxnat.ProjectTree.TreeNode = function(levelUriOrPath){
    //
    // Store the path as a property
    //
    this[gxnat.ProjectTree.PATH_KEY] = goog.isString(levelUriOrPath) ? 
	new gxnat.Path(levelUriOrPath) : levelUriOrPath;
    
    //
    // Store the current level
    //
    this[gxnat.ProjectTree.LEVEL_KEY] = 
	this[gxnat.ProjectTree.PATH_KEY].getDeepestLevel();  

    //
    // Construct next level attributes.
    //
    var nextLevelInd = gxnat.Path.xnatLevelOrder.indexOf(
	this[gxnat.ProjectTree.PATH_KEY].getDeepestLevel()) + 1;

    if (nextLevelInd != -1){

	//
	// Store the next level key property
	//
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
 * @type {!string}
 * @private
 */
gxnat.ProjectTree.TreeNode.prototype.title_;



/**
 * @param {!string} title
 * @public
 */
gxnat.ProjectTree.TreeNode.prototype.setTitle = function(title) {
    this.title_ = title;
}



/**
 * @param {!string} title
 * @public
 */
gxnat.ProjectTree.TreeNode.prototype.getTitle = function(title) {
    return this.title_;
}



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
gxnat.ProjectTree.LEVEL_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVELQUERY_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVELJSON_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.PATH_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVEL_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.NEXTLEVELLOADED_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.ISLOADING_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.METADATA_KEY = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.PROJ_DIRECT = goog.string.createUniqueString();



/**
 * @const
 */
gxnat.ProjectTree.SUBJ_DIRECT = goog.string.createUniqueString();


/**
 * @const
 */
gxnat.ProjectTree.EXPT_DIRECT = goog.string.createUniqueString();



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
    //'race',
    //'ethnicity',
    'gender',
    'handedness',
    //'dob',
    //'age',
    'label',
    'URI'
]


/**
 * @const
 */
gxnat.ProjectTree.EXPERIMENT_METADATA = [
    'label',
    'URI'
]




/**
 * @param {gxnat.ProjectTree.TreeNode} node1
 * @param {gxnat.ProjectTree.TreeNode} node2
 * @return {!number}
 * @public
 */
gxnat.ProjectTree.compareNodeTitles = function(node1, node2){
    //window.console.log("SORTING: ", node1.getTitle(), node2.getTitle());
    return goog.string.numerateCompare(node1.getTitle(), node2.getTitle());
}



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
 * @type {!gxnat.ProjectTree.TreeNode}
 * @private
 */
gxnat.ProjectTree.prototype.Proj_;



/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {!Array.string} The node uris
 */
gxnat.ProjectTree.prototype.getBranchTitles = function(treeNode) {
    var nodeTitles = [];
    goog.object.forEach(this.getBranchFromEndNode(treeNode), 
    function(treeNode, key){
	//window.console.log(treeNode[gxnat.ProjectTree.METADATA_KEY]);
	if (key == 'projects') {
	    nodeTitles.push(treeNode[gxnat.ProjectTree.METADATA_KEY]['ID']);
	} else {
	    nodeTitles.push(treeNode[gxnat.ProjectTree.METADATA_KEY]['label']);
	}
    })
    return nodeTitles;
}




/**
 * @param {!gxnat.ProjectTree.TreeNode} treeNode
 * @return {!Array.string} The node uris
 */
gxnat.ProjectTree.prototype.getBranchUris = function(treeNode){
    var nodeUris = [];
    goog.object.forEach(this.getBranchFromEndNode(treeNode), 
    function(treeNode, key){
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
gxnat.ProjectTree.prototype.getBranchFromEndNode = function(endNode) {

    branch = {
	'projects': this.Proj_
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
	branch['subjects'] = this[gxnat.ProjectTree.SUBJ_DIRECT]
	    [endNode[gxnat.ProjectTree.PATH_KEY].pathByLevel('subjects')]
	branch['experiments'] = endNode;
    }

    return branch;    
}



/** 
 * @public
 * @param {Function=} opt_onNodeAdded
 * @param {Function=} opt_done
 */
gxnat.ProjectTree.prototype.loadInitBranch = 
function(opt_onNodeAdded, opt_onDone) {
    this.loadBranch(this.initPath_, opt_onNodeAdded, opt_onDone);
}


/** 
 * @public
 * @param {!string | !gxnat.Path} endNodeObj
 * @param {Function=} opt_onNodeAdded
 * @param {Function=} opt_done
 */
gxnat.ProjectTree.prototype.loadBranch = 
function(endNodeObj, opt_onNodeAdded, opt_onDone) {
    var endNodePath = goog.isString(endNodeObj) ? new gxnat.Path(endNodeObj) :
	endNodeObj;
    var subjPath, exptPath;

    //
    // PROJECT
    //
    if (!goog.isDefAndNotNull(this.Proj_)){
	this.loadProject(function(projNode){
	    if (goog.isDefAndNotNull(opt_onNodeAdded)){
		opt_onNodeAdded(projNode);
	    }
	    this.loadBranch(endNodePath, opt_onNodeAdded, opt_onDone);
	}.bind(this))
	return;
    }
    var branch = {
	'projects': this.Proj_
    };

    //
    // SUBJECT
    //
    if (goog.isDefAndNotNull(endNodePath['subjects'])){

	subjPath = endNodePath.pathByLevel('subjects');

	if (!goog.isDefAndNotNull(this[gxnat.ProjectTree.SUBJ_DIRECT]
				  [subjPath])){
	    this.loadSubject(subjPath, function(subjNode){
		this.loadSubjectMetadata(subjNode, function(){
		    if (goog.isDefAndNotNull(opt_onNodeAdded)){
			opt_onNodeAdded(subjNode);
		    }
		    this.loadBranch(endNodePath, opt_onNodeAdded, opt_onDone);
		}.bind(this))
	    }.bind(this))
	    return;
	}
	branch['subjects'] = this[gxnat.ProjectTree.SUBJ_DIRECT][subjPath];
    }



    //
    // EXPERIMENT
    //
    if (goog.isDefAndNotNull(endNodePath['experiments'])){

	exptPath = endNodePath.pathByLevel('experiments');

	if (!goog.isDefAndNotNull(this[gxnat.ProjectTree.EXPT_DIRECT]
				  [exptPath])) {


	    //
	    // Then the experiment
	    //
	    this.loadExperiment(exptPath, function(exptNode){
		//
		// Then recurse
		//
		if (goog.isDefAndNotNull(opt_onNodeAdded)){
		    opt_onNodeAdded(exptNode);
		}
		this.loadBranch(endNodePath, opt_onNodeAdded, opt_onDone);
	    }.bind(this))
	    return;
	}

	branch['experiments'] = this[gxnat.ProjectTree.EXPT_DIRECT][exptPath];
    }

    //
    // onDone
    //
    if (goog.isDefAndNotNull(opt_onDone)){
	opt_onDone(branch);
    }
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

    //
    // We don't need to load if it's already loaded
    //
    if (goog.isDefAndNotNull(this.Proj_)){
	return;
    }
    
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
	node = new gxnat.ProjectTree.TreeNode(projUri);

	//
	// Store the node as part of the tree
	//
	this['projects'].push(node);
	this.Proj_ = node;

	//
	// Store the node as part of the tree
	//
	this[gxnat.ProjectTree.PROJ_DIRECT]
	[node[gxnat.ProjectTree.PATH_KEY]['originalUrl']] = node;

	//
	// Set the metata
	//
	node[gxnat.ProjectTree.METADATA_KEY] = projJson[0];

	node.setTitle(node[gxnat.ProjectTree.METADATA_KEY]['name']);

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
    return this[gxnat.ProjectTree.SUBJ_DIRECT][subjectUri]
}



/**
 * @param {!string} subjectUri
 * @return {gxnat.ProjectTree.TreeNode}
 * @public
 */
gxnat.ProjectTree.prototype.getExperimentNodeByUri = function(exptUri){
    return this[gxnat.ProjectTree.EXPT_DIRECT][exptUri];
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
    // Don't need do query if we already have the metadata
    //
    if (goog.isDefAndNotNull(subjNode[gxnat.ProjectTree.METADATA_KEY])){
	callback(subjNode);
	return;
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
	subjNode.setTitle(subjNode[gxnat.ProjectTree.METADATA_KEY]['label']);
	callback(subjNode)
    }.bind(this), subjQuery)
}



/**
 * @param {Function=} opt_onNodeAdded
 * @param {Function=} opt_done
 */
gxnat.ProjectTree.prototype.loadSubjects = 
function(opt_onNodeAdded, opt_onDone) { 

    //
    // Don't reload the subjects if they exist
    //
    if (goog.isDefAndNotNull(this.Proj_
			     [gxnat.ProjectTree.NEXTLEVELLOADED_KEY])
       && this.Proj_[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] == true){
	//window.console.log('Don\'t need to reload the subjects');
	return;
    }

    //
    // Query strings for getting the subject list
    //
    //var subjectsUri = this.Proj_[gxnat.ProjectTree.PATH_KEY]
    //['originalUrl'] + '/subjects';

    var subjectsUri = this.Proj_[gxnat.ProjectTree.PATH_KEY]['prefix'] +
	'/subjects';
    var subjUriSuffix = '&project=' +
	this.Proj_[gxnat.ProjectTree.PATH_KEY]['projects'] + 
	gxnat.ProjectTree.getColumnQuery(gxnat.ProjectTree.SUBJECT_METADATA);
    //window.console.log(subjectsUri, subjUriSuffix);


    //
    // Query for the subjects within the project
    //
    var subjNode;
    var subjQueryUri;
    gxnat.jsonGet(subjectsUri, function(subjJsons){
	//
	// Loop through the subjJsons
	//
	goog.array.forEach(subjJsons, function(subjJson){


	    //
	    // load subject
	    //
	    subjQueryUri = this.Proj_[gxnat.ProjectTree.PATH_KEY]['prefix'] + 
		'/projects/' + 
		this.Proj_[gxnat.ProjectTree.PATH_KEY]['projects'] + 
		'/subjects/' + subjJson['ID'];
	    subjNode = this.loadSubject(subjQueryUri);

	    //
	    // Add the Subject metadata here
	    //
	    // IMPORTANT!!!
	    //
	    // This is a workaround for XNAT performance -- it's a little too 
	    // slow to query for the subject directly.
	    //
	    if (!goog.isDefAndNotNull(subjNode[
		gxnat.ProjectTree.METADATA_KEY])){
		subjNode[gxnat.ProjectTree.METADATA_KEY] = subjJson;
		subjNode.setTitle(subjNode[gxnat.ProjectTree.METADATA_KEY]
				  ['label']);

	    }

	    //
	    // Run callback
	    //
	    if (goog.isDefAndNotNull(opt_onNodeAdded)){
		opt_onNodeAdded(subjNode);
	    }

	    //
	    // Run the callback if we've hit all subjects
	    //
	    if (this.Proj_['subjects'].length == subjJsons.length) {

		//
		// Set the NEXTLEVELLOADED key
		//
		this.Proj_[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] = true;

		//
		// Run DONE callback
		//
		if (goog.isDefAndNotNull(opt_onDone)){
		    //window.console.log("HERE ON DONE");
		    var subjNodes = this.Proj_['subjects'];
		    //
		    // sort nodes by title
		    //
		    subjNodes.sort(gxnat.ProjectTree.compareNodeTitles);
		    opt_onDone(subjNodes)
		}



	    }
	}.bind(this))
    }.bind(this), subjUriSuffix)
}



/**
 * @param {!string} subjUri
 * @param {Function=} opt_onAdded
 * @return {gxnat.ProjectTree.TreeNode} The subjectNode
 */
gxnat.ProjectTree.prototype.loadSubject = function(subjUri, opt_onAdded) { 

    //window.console.log("LOAD SUBJECT", subjUri);
    //
    // Exit out if we already have the subject
    //
    if (goog.isDefAndNotNull(this[gxnat.ProjectTree.SUBJ_DIRECT][subjUri])){
	return this[gxnat.ProjectTree.SUBJ_DIRECT][subjUri];
    }

    //
    // Create and store new subject node
    //
    subjNode = new gxnat.ProjectTree.TreeNode(subjUri);

    //
    // Store in the tree
    //
    this.Proj_['subjects'].push(subjNode);

    //
    // Store directly
    //
    this[gxnat.ProjectTree.SUBJ_DIRECT][subjUri] = subjNode;
    
    //
    // Add callback
    //
    if (goog.isDefAndNotNull(opt_onAdded)){
	opt_onAdded(subjNode);
    }

    return subjNode;
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
	exptNode.setTitle(exptNode[gxnat.ProjectTree.METADATA_KEY]
			  ['label']);
	callback(exptNode)
    }.bind(this), exptQuery)
}



/** 
 * @param {!string | !gxnat.ProjectTree.TreeNode | !gxnat.Path} subject
 * @param {Function=} opt_onAdded
 * @param {Function=} opt_onDone
 * @public
 */
gxnat.ProjectTree.prototype.loadExperiments = 
function(subject, opt_onAdded, opt_onDone) {
    //window.console.log('load experiments');
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
	window.console.log('Don\'t need to reload the experiments of ' + 
			  subjNode[gxnat.ProjectTree.PATH_KEY]['originalUrl']);
	return;
    }

    //
    // Construct the experiment query path
    //
    var exptUri = subjNode[gxnat.ProjectTree.PATH_KEY]
    ['originalUrl'] + '/experiments';
    var imageSessionStr = '?xsiType=xnat:imageSessionData';
    var exptsQueryUri = exptUri + imageSessionStr;
    
    //window.console.log('\n\n\n',exptUri);
    //window.console.log('\n\n\n',exptsQueryUri);


    //
    // Query for the subjects within the project
    //
    var exptNode;
    gxnat.jsonGet(exptsQueryUri, function(exptJsons){
	//
	// Loop through the exptJsons
	//
	goog.array.forEach(exptJsons, function(exptJson){

	    //window.console.log("\n\n\n\nEPXT JSON", exptJson);
	    this.loadExperiment(exptUri + '/' + exptJson['ID'], 
            function(exptNode){
		if (goog.isDefAndNotNull(opt_onAdded)){
		    opt_onAdded(exptNode);
		}
		//
		// Run the callback if we've hit all subjects
		//
		
		//window.console.log(subjNode['experiments']);
		if (subjNode['experiments'].length == exptJsons.length){
		    subjNode[gxnat.ProjectTree.NEXTLEVELLOADED_KEY] = true;
		    if (goog.isDefAndNotNull(opt_onDone)) {
			//window.console.log('ONE DONE!');
			var exptNodes = subjNode['experiments'];
			exptNodes.sort(gxnat.ProjectTree.compareNodeTitles);
			opt_onDone(exptNodes)
		    }
		}
	    }.bind(this));
	}.bind(this))
    }.bind(this))
}



/**
 * @param {!string} exptUri
 * @param {Function=} opt_onAdded
 */
gxnat.ProjectTree.prototype.loadExperiment = function(exptUri, opt_onAdded) { 
    //
    // Exit out if we already have the expt
    //
    if (goog.isDefAndNotNull(this[gxnat.ProjectTree.EXPT_DIRECT][exptUri])){
	//window.console.log('Don\'t need to relaoad ',  exptUri)
	return;
    }
    
    //
    // Create and store new expt node
    //
    exptNode = new gxnat.ProjectTree.TreeNode(exptUri);

    //window.console.log('\n\n\n\n', exptNode, 
    //exptNode[gxnat.ProjectTree.PATH_KEY]
    //['originalUrl']);

    //
    // Load the metadata then store
    //
    this.loadExperimentMetadata(exptNode, function(exptNode){

	var subjNode = this[gxnat.ProjectTree.SUBJ_DIRECT]
	[exptNode[gxnat.ProjectTree.PATH_KEY].pathByLevel('subjects')];
	//
	// Store in the tree
	//
	subjNode['experiments'].push(exptNode);


	//
	// Store directly
	//
	this[gxnat.ProjectTree.EXPT_DIRECT][exptUri] = exptNode;
	
	//
	// Add callback
	//
	if (goog.isDefAndNotNull(opt_onAdded)){
	    opt_onAdded(exptNode);
	}

    }.bind(this));
}



/**
 * @public
 */
gxnat.ProjectTree.prototype.dispose = function(url) {
    goog.base(this, 'dispose');

    delete this.Proj_;

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




goog.exportSymbol('gxnat.ProjectTree.TreeNode', gxnat.ProjectTree.TreeNode);
goog.exportSymbol('gxnat.ProjectTree.LEVEL_KEY', gxnat.ProjectTree.LEVEL_KEY);
goog.exportSymbol('gxnat.ProjectTree.NEXTLEVELQUERY_KEY',
	gxnat.ProjectTree.NEXTLEVELQUERY_KEY);
goog.exportSymbol('gxnat.ProjectTree.NEXTLEVELJSON_KEY',
	gxnat.ProjectTree.NEXTLEVELJSON_KEY);
goog.exportSymbol('gxnat.ProjectTree.PATH_KEY', gxnat.ProjectTree.PATH_KEY);
goog.exportSymbol('gxnat.ProjectTree.NEXTLEVEL_KEY',
	gxnat.ProjectTree.NEXTLEVEL_KEY);
goog.exportSymbol('gxnat.ProjectTree.NEXTLEVELLOADED_KEY',
	gxnat.ProjectTree.NEXTLEVELLOADED_KEY);
goog.exportSymbol('gxnat.ProjectTree.ISLOADING_KEY',
	gxnat.ProjectTree.ISLOADING_KEY);
goog.exportSymbol('gxnat.ProjectTree.METADATA_KEY',
	gxnat.ProjectTree.METADATA_KEY);
goog.exportSymbol('gxnat.ProjectTree.PROJ_DIRECT',
	gxnat.ProjectTree.PROJ_DIRECT);
goog.exportSymbol('gxnat.ProjectTree.SUBJ_DIRECT',
	gxnat.ProjectTree.SUBJ_DIRECT);
goog.exportSymbol('gxnat.ProjectTree.EXPT_DIRECT',
	gxnat.ProjectTree.EXPT_DIRECT);
goog.exportSymbol('gxnat.ProjectTree.PROJECT_METADATA',
	gxnat.ProjectTree.PROJECT_METADATA);
goog.exportSymbol('gxnat.ProjectTree.SUBJECT_METADATA',
	gxnat.ProjectTree.SUBJECT_METADATA);
goog.exportSymbol('gxnat.ProjectTree.EXPERIMENT_METADATA',
	gxnat.ProjectTree.EXPERIMENT_METADATA);
goog.exportSymbol('gxnat.ProjectTree.compareNodeTitles',
	gxnat.ProjectTree.compareNodeTitles);
goog.exportSymbol('gxnat.ProjectTree.getColumnQuery',
	gxnat.ProjectTree.getColumnQuery);
goog.exportSymbol('gxnat.ProjectTree.prototype.getBranchTitles',
	gxnat.ProjectTree.prototype.getBranchTitles);
goog.exportSymbol('gxnat.ProjectTree.prototype.getBranchUris',
	gxnat.ProjectTree.prototype.getBranchUris);
goog.exportSymbol('gxnat.ProjectTree.prototype.getBranchFromEndNode',
	gxnat.ProjectTree.prototype.getBranchFromEndNode);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadInitBranch',
	gxnat.ProjectTree.prototype.loadInitBranch);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadBranch',
	gxnat.ProjectTree.prototype.loadBranch);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadProject',
	gxnat.ProjectTree.prototype.loadProject);
goog.exportSymbol('gxnat.ProjectTree.prototype.getSubjectNodeByUri',
	gxnat.ProjectTree.prototype.getSubjectNodeByUri);
goog.exportSymbol('gxnat.ProjectTree.prototype.getExperimentNodeByUri',
	gxnat.ProjectTree.prototype.getExperimentNodeByUri);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadSubjectMetadata',
	gxnat.ProjectTree.prototype.loadSubjectMetadata);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadSubjects',
	gxnat.ProjectTree.prototype.loadSubjects);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadSubject',
	gxnat.ProjectTree.prototype.loadSubject);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadExperimentMetadata',
	gxnat.ProjectTree.prototype.loadExperimentMetadata);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadExperiments',
	gxnat.ProjectTree.prototype.loadExperiments);
goog.exportSymbol('gxnat.ProjectTree.prototype.loadExperiment',
	gxnat.ProjectTree.prototype.loadExperiment);
goog.exportSymbol('gxnat.ProjectTree.prototype.dispose',
	gxnat.ProjectTree.prototype.dispose);
