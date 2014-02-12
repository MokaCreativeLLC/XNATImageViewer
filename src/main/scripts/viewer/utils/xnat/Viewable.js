/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog


// utils
goog.require('utils.xnat');



/**
 * @constructor
 */
goog.provide('utils.xnat.Viewable');
utils.xnat.Viewable = function(experimentUrl, viewableJson) {
    this['experimentUrl'] = experimentUrl;
    this['originalJson'] = viewableJson;
    this['queryUrl'] = utils.xnat.graftUrl(this['experimentUrl'], 
			this['originalJson']['URI'], 'experiments');
    //window.console.log("QUERY URL", this['queryUrl'])
    utils.xnat.Viewable.applyProperties_(this);
    this.getFiles(this.getThumbnailImage.bind(this));
    
}
goog.exportSymbol('utils.xnat.Viewable', utils.xnat.Viewable);



utils.xnat.prototype.getThumbnailImage = goog.abstractMethod;
utils.xnat.prototype.getFiles = goog.abstractMethod;
utils.xnat.prototype.getFolder = goog.abstractMethod;
utils.xnat.prototype.makeFileUrl = goog.abstractMethod;



/**
 *@public
 */
utils.xnat.Viewable.applyProperties_ = function(obj){
    obj['files'] = [];
    obj['pathObj'] = goog.object.clone(utils.xnat.defaultPathObj);
    obj['sessionInfo'] = /**@dict*/ {
        "SessionID": {'label': "Session ID", 'value': ['EMPTY EXPT']},
        "Accession #": {'label':"Accession #", 'value': ['Empty Accession']},
        "Scanner" : {'label':"Scanner", 'value': ["SIEMENS Sonata"]},
        "Format" : {'label':"Format", 'value': ["DICOM"]},
        "Age" : {'label':"Age", 'value': ["--"]},
        "Gender": {'label':"Gender", 'value': ["--"]},
        "Handedness": {'label':"Handedness", 'value': ["--"]},
        "AcqDate" : {'label':"Acq.Date", 'value': ["09-14-2007"]},
        "Scan" : {'label':"Scan", 'value': ['Empty Scan']},
        "type" : {'label':"type", 'value': ["MPRAGE"]}
    }
}





/**
* @public
*/
utils.xnat.Viewable.loopFolderContents = function(viewableFolder, callback) {
    utils.xnat.jsonGet(viewableFolder, function(viewablesJson){
	goog.array.forEach(viewablesJson, function(viewable){
	    window.console.log("VIEWABLE:", viewable);
	    callback(viewable)
	})
    })
}



/**
 * Sorts the viewable collection, which is an array of XNAT derived JSONS
 * customized (added to) for the purposes of the Image viewer.
 *
 * @param {!Array.<utils.xnat.Viewable>} xnatPropsArr The array of utils.xnat.Viewable to sort. 
 * @param {!Array.<String>} keyDepthArr The key depth array indicating the sorting criteria.
 * @public
 */
utils.xnat.sortXnatPropertiesArray = function (xnatPropsArr, keyDepthArr){

    var sorterKeys = [];
    var sorterObj = {};
    var sortedViewableCollection = [];
    var sorterKey = {};

    //
    // Update sorting data types.
    //
    goog.array.forEach(xnatPropsArr, function(viewable){
	sorterKey = viewable;
	goog.array.forEach(keyDepthArr, function(key){
	    sorterKey = sorterKey[key];
	})
	sorterKey = sorterKey.toLowerCase();
	sorterKeys.push(sorterKey);
	sorterObj[sorterKey] = viewable;
    })

    //
    // Natural sort sorterKeys.
    //
    sorterKeys = sorterKeys.sort(utils.array.naturalCompare);
    //goog.array.sort(sorterKeys);


    //
    // Construct and return the sorted collection.
    //
    goog.array.forEach(sorterKeys, function(sorterKey){
	sortedViewableCollection.push(sorterObj[sorterKey]);
    })
    return sortedViewableCollection;
}




/** 
 * NOTE: This is critical because the paths
 * returned in the json may not always be the necessary 
 * query paths.
 */
utils.xnat.Viewable.prototype.getFiles = function(opt_callback){

    var fileQueryUrl = /** @type {!string} */ this['queryUrl'] + 
	               this['constructor']['fileQuerySuffix'];
    var absoluteUrl = /** @type {!string} */ '';    
    var i = /** @type {!number} */ 0;
    var len = /** @type {!number} */ 0;

    //window.console.log(this, fileQueryUrl);
    utils.xnat.jsonGet(fileQueryUrl, function(fileUrls){
	//window.console.log(fileUrls);
	for (i=0, len = fileUrls.length; i < len; i++) {
	    var fileUrl = this.makeFileUrl(fileUrls[i]);
	    //window.console.log("ABSOLUTE URL:", fileUrls[i], fileUrl); 
	    if (fileUrl) { this['files'].push(fileUrl) };
	}

	opt_callback()
    }.bind(this))
}




utils.xnat.Viewable.getViewables = function(url, viewableObj, callback){
    
    
    var url = /** @type {!string} */ 
    utils.xnat.getXnatPathByLevel(url, 'experiments');

    var queryFolder = /** @type {!string} */ 
    url + '/' + viewableObj['folderQuerySuffix']

    //window.console.log("HERE", url, queryFolder);
    var viewable;
    utils.xnat.Viewable.loopFolderContents(queryFolder, function(scanJson){
	viewable = new viewableObj(url, scanJson)
	window.console.log(viewable);
	// derive the thumbnail (shared, individualized method)
	// store viewablePrps (shared)
	// sort list (shared, with custom parameters)
    })
}
