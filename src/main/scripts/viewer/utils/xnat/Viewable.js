/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');

// utils
goog.require('utils.array');
goog.require('utils.xnat');
goog.require('utils.xnat.Path');



/**
 * Class that contains a variety of string-based properties for viewable objects
 * stored on an XNAT server.  A 'Viewable' could be a set of images, Slicer mrb,
 * etc.
 * @constructor
 * @param {!string} experimentUrl The experiment-level url of the viewable.
 * @param {!Object} viewableJson The json associated with the viewable.
 * @param {function=} opt_initComplete The callback when the init process is 
 *     complete.
 */
goog.provide('utils.xnat.Viewable');
utils.xnat.Viewable = function(experimentUrl, viewableJson, opt_initComplete) {

    this['experimentUrl'] = experimentUrl;
    this['originalJson'] = viewableJson;
    this['queryUrl'] = utils.xnat.Path.graftUrl(this['experimentUrl'], 
			this['originalJson']['URI'], 'experiments');
    this['pathObj'] = /** @type {!utils.xnat.Path} */
    new utils.xnat.Path(this['queryUrl']);

    window.console.log("QUERY URL", opt_initComplete);

    utils.xnat.Viewable.applyProperties(this);

    this.getFiles(function(){
	window.console.log("ON FILES GOTTEN");
	this.onFilesGotten_(opt_initComplete);
    }.bind(this));    
}
goog.exportSymbol('utils.xnat.Viewable', utils.xnat.Viewable);




/**
 * Constructs a the thumbnail image for the viewable unique to the Viewable 
 * sub-class.
 * @param {function=} opt_callback The callback to run once the thumbnail image
 *    has been gotten.
 * @protected
 */
utils.xnat.prototype.getThumbnailImage = goog.abstractMethod;
 


/**
 * Constructs a file URL pertaining to the nuances of the viewable.
 * @param {!Object} xnatFileJson The json object resulting from the file query
 *     from XNAT.
 * @protected
 */
utils.xnat.prototype.makeFileUrl = goog.abstractMethod;



/**
 * Applies various string-based properties to the Viewable.
 * @protected
 * @param {!Object} obj The object to apply the viewable properties to.
 */
utils.xnat.Viewable.applyProperties = function(obj){
    obj['files'] = [];
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
 * Loops through the contents of a given XNAT folder url and acquires the 
 * viewables contained within it, applying 'callback' whenever a viewable is
 * acquired.
 * @param {!string} viewableFolderUrl The url of the viewable folders.
 * @param {!function} callback The callback to apply.
 * @public
 */
utils.xnat.Viewable.loopFolderContents = function(viewableFolderUrl, callback) {
    utils.xnat.jsonGet(viewableFolderUrl, function(viewablesJson){
	goog.array.forEach(viewablesJson, function(viewable){
	    //window.console.log("VIEWABLE:", viewable);
	    callback(viewable)
	})
    })
}



/**
 * Sorts the viewable collection, which is an array of XNAT derived JSONS
 * customized (added to) for the purposes of the Image viewer.
 * @param {!Array.<utils.xnat.Viewable>} viewables The array of 
 *     utils.xnat.Viewable to sort. 
 * @param {!Array.<String>} keyDepthArr The key depth array indicating the 
 *     sorting criteria.
 * @public
 */
utils.xnat.sortXnatPropertiesArray = function (viewables, keyDepthArr){

    var sorterKeys = /**@type {!Array.<string>} */ [];
    var sorterObj = /**@type {!Object.<string, utils.xnat.Viewable>} */ {};
    var sortedViewableCollection = 
	/**@type {!Array.Object} */ [];
    var sorterKey = /**@type {!Object} */ {};

    //
    // Update sorting data types.
    //
    goog.array.forEach(viewables, function(viewable){
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
 * Callback that occurs when the file contents of the viewable have been
 * retrieved from an XNAT server.
 * @param {function=} opt_initComplete The callback to apply afterwards.
 * @private
 */
utils.xnat.Viewable.prototype.onFilesGotten_ = function(opt_initComplete){
    this.getThumbnailImage(function(){
	if (opt_initComplete){
	    window.console.log("INIT COMPLETE", this['thumbnailUrl']);
	    opt_initComplete(this)
	}
    }.bind(this));
}



/** 
 * Queries for the files associated with the viewable. This is critical because
 * the paths returned in the json may not always be the necessary 
 * query paths, for instance, in the circumstance of retreiving file contents.
 * @param {function=} opt_callback The callback to apply afterwards.
 * @public
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
	if (opt_callback){
	    opt_callback()
	}
    }.bind(this))
}




/**
 * Static function to generate viewables based on a given XNAT url.  All of
 * the viewables that are generated are subclasses of utils.xnat.Viewable.
 * @param {!string} url
 * @param {!utils.xnat.Viewable} anonViewable
 * @param {function=} opt_callback
 * @public
 */
utils.xnat.Viewable.getViewables = function(url, anonViewable, opt_callback){
    
    var pathObj = /** @type {!utils.xnat.Path} */ new utils.xnat.Path(url);
    var queryFolder = /** @type {!string} */ 
    url + '/' + anonViewable['folderQuerySuffix']
    var viewable;

    //window.console.log("HERE", url, queryFolder);
    utils.xnat.Viewable.loopFolderContents(queryFolder, function(scanJson){
	viewable = new anonViewable(pathObj.pathByLevel('experiments'), 
				    scanJson, opt_callback)
	//window.console.log(viewable);
	// sort list (shared, with custom parameters)
	delete pathObj;
    })
}
