/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

//utils
goog.require('utils.xnat');
goog.require('utils.xnat.Path');



/**
 * Splits the 'url' argument into various XNAT level folders.
 * @param {!string | utils.xnat.Path} xnatPath The URL to derive the path 
 *    object from.
 * @constructor
 * @dict
 */
goog.provide('utils.xnat.ProjectTree');
utils.xnat.ProjectTree = function(xnatPath){
    window.console.log("\n\nProject Tree init path: ", xnatPath);

    /**
     * @type {!utils.xnat.Path}
     */
    this.initPath_ = new utils.xnat.Path(xnatPath);

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
utils.xnat.ProjectTree.prototype.exptCount_ = 0;


/**
 * @type {!number}
 * @private
 */
utils.xnat.ProjectTree.prototype.exptRetrieved_ = 0;



utils.xnat.ProjectTree.prototype.load = function(callback){

    // First, get the experiment count.
    utils.xnat.jsonGet(this.initPath_['prefix'] + '/' + 'experiments', 
	function(exptArr){
	    
	    // Count the number of experiments within the project.
	    for (var i=0; i<exptArr.length; i++){
		if(exptArr[i]['project'] === this.initPath_['projects']){
		    this.exptCount_++;
		}
	    }
	    //window.console.log("CALLBACK", callback);
	    // Call getTree
	    this['projects'].push(this.getTree('projects', 
	    		this.initPath_.pathByLevel('projects'), callback));
			   
	}.bind(this))
}




utils.xnat.ProjectTree.prototype.getTree = function(currLevel, levelUri, 
						    callback){
    
    var node = {};
    node['_Path'] = new utils.xnat.Path(levelUri);
    //window.console.log(callback);
    if (currLevel === this.STOP_LEVEL) {
	this.exptRetrieved_++;
	if (this.exptRetrieved_ === this.exptCount_){
	    callback(this)
	}
	return node;
    }


    var nextLevelInd = utils.xnat.Path.xnatLevelOrder.indexOf(currLevel) + 1;
    node['_nextLevel'] = utils.xnat.Path.xnatLevelOrder[nextLevelInd];
    node['_nextLevelQuery'] = node['_Path']['originalUrl'] 
	+ '/' + node['_nextLevel'];
    node[node['_nextLevel']] = [];


    var tree = {};
    utils.xnat.jsonGet(node['_nextLevelQuery'], function(nextLevelJsonArr){
	node['_nextLevelJsons'] = nextLevelJsonArr;
	goog.array.forEach(nextLevelJsonArr, function(nextLevelObj){
	    tree = this.getTree(node['_nextLevel'], 
				node['_Path']['originalUrl'] 
				+ '/' + node['_nextLevel'] + '/' + 
				nextLevelObj['ID'], callback)
	    node[node['_nextLevel']].push(tree);		
	}.bind(this))
    }.bind(this))    

    return node;
}



/**
 * @param {} 
 * @public
 */
utils.xnat.ProjectTree.prototype.getLevelUris = function(getLevel){

    var uris = [];
    this.getLevelUris_(getLevel, 'projects', this, uris);
    return uris;
}



/**
 * @param {} 
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



