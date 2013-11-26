/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

/**
 * Google closure indcludes
 */
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.net.XhrIo');
goog.require('goog.dom.xml');
goog.require('goog.array');

/**
 * utils indcludes
 */
goog.require('utils.dom');
goog.require('utils.array');

/**
 * viewer-widget includes
 */



/**
 * XnatIO is the class that handles communication with the XNAT 
 * server.  It uses RESTful calls to acquire JSON objects that are
 * parsed to construct Thumbnails, which contain information regarding
 * image sets that can be loaded into a ViewBox.  XnatIO makes use of 
 * several Google Closure libraries to communicate with the XNAT server, 
 * especially goog.net.XhrIo and goog.dom.xml.
 *
 * @constructor
 */
goog.provide("XnatIO");
var XnatIO = function() {}
goog.exportSymbol('XnatIO', XnatIO)




/**
 * Returns a placeholder object containing the relevant key-value pairings
 * for displaying metadata over a specific 'Viewable', which could be a scan
 * or a slicer file.
 *
 * @return {Object.<string, Array.<string> | string, | Object.<string, string>>}
 */
XnatIO.prototype.getEmptyViewableData = function(){
    return {
        'category' : 'dicom',
        'files':['testfile.text'],
        'thumbnailImageSrc':'image.jpeg',
        'sessionInfo': {
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
    };
};




/**
 * Queries a server for a JSON formatted object
 * for processing in the 'callback' argument.  Utilizes the
 * Google closure library 'XhrIo' to handle communication with
 * the XNAT server.
 *
 * @param {!string, !function}
 * @expose
 */
XnatIO.prototype.jsonGet = function(url, callback){
    utils.dom.debug("XnatIO - jsonGet: ", url);



    //------------------
    // Construct the url to give a json formatted object
    // in its response.
    //------------------
    var queryChar = (url.indexOf('?') > -1) ? '&' : '?';
    var queryUrl = url + queryChar + "format=json";



    //------------------
    // Send the URL to server, run callback on the resonse
    // object.
    //------------------
    goog.net.XhrIo.send(queryUrl, function(e) {
	var xhr = e.target;
	var obj = xhr.getResponseJson();
	callback(obj['ResultSet']['Result'])
    });
}




/**
 * Queries a server using a generic 'GET' call. 
 * Sends the response object into the 'callback'
 * argument.
 *
 * @param {!string, !function}
 * @expose
 */
XnatIO.prototype.get = function(url, callback){
    utils.dom.debug("XnatIO - get: ", url);
    goog.net.XhrIo.send(url, function(e) {
	var xhr = e.target;
	var obj = xhr;
	callback(obj)
    });
}




/**
 * Splits a url at the 'splitString' argument, then
 * returns an object with the split result.  If it cannot be
 * split, returns the entire url and the string.
 *
 * @param {!string, !string} 
 * @return {Object.<string,string>}
 * @expose
 */
XnatIO.prototype.splitUrl = function(url, splitString){

    //------------------
    // Split the string accordingly.
    //------------------
    var splitInd = url.indexOf(splitString);
    if (splitInd > -1) {
	return {
	    'before': url.substring(0, splitInd), 
	    'splitter': splitString, 
	    'after': url.substring(splitInd + splitString.length, url.length)
	}



    //------------------
    // Otherwise return the entire url and splitString.
    //------------------
    } else {
	return {
	    'before': url, 
	    'splitter': splitString, 
	}    
    }
}




/**
 * Constructs an XNAT Uri stopping at the desired 'level'.
 * Calls on the internal 'getXnatPathObject' method to split
 * the uri into it's various level components.  From then, it builds
 * the return string.
 *
 * @param {!string, !string}
 * @return {string}
 * @expose
 */
XnatIO.prototype.getXnatPathByLevel = function(url, level){
    
    //------------------
    // Splits the url into its various level components.
    //------------------
    var pathObj = this.getXnatPathObject(url)



    //------------------
    // Construct the new URL, stopping at the given 'level'
    //------------------
    if (pathObj[level]) {
	var returnString = pathObj['prefix'];
	
	if (pathObj['projects']){
	    returnString += "projects/" + pathObj['projects'];
	}

	if (pathObj['subjects']){
	    returnString += "/subjects/" + pathObj['subjects'];
	}

	if (pathObj['experiments']){
	    returnString += "/experiments/" + pathObj['experiments'];
	}

	if (pathObj['scans']){
	    returnString += "scans/" + pathObj['scans'];
	}
	else if (pathObj['resources']){
	    returnString += "resources/" + pathObj['resources'];
	}

	if (pathObj['files']){
	    returnString += "/files/" + pathObj['files'];
	}

	return returnString;
    }
    else {
	throw new Error("XnatIO - getXnatPathByLevel: No folder specified at the '" + level + "' level.")
    }
}






/**
 * Split's the 'url' argument into various XNAT level
 * folders.
 *
 * @param {!string}
 * @return {string}
 * @expose
 */
XnatIO.prototype.getXnatPathObject = function(url){
    var pathObj =  {
	'prefix': "",
	'projects':undefined,
	'subjects':undefined,
	'experiments':undefined,
	'scans':undefined,
	'resources':undefined,
	'files':undefined,
    }



    //------------------
    // Split the url at the '/' chars.  Loop through
    // the split array..
    //------------------
    var splitter = url.split("/");
    var len = splitter.length;
    for (var i=0; i<len; i++){
	if (pathObj.hasOwnProperty(splitter[i]) && splitter[i+1]) {
	    

	    //
	    // The 'prefix' string -- usually the server name
	    // and the 'data/archive/' or 'xnat/' prefix. 
	    //
	    if (splitter[i] === 'projects' &&  i != 0){
		var j = 0;
		while (j < i){
		    pathObj['prefix'] += splitter[j] + "/";
		    j++;
		}
	    }


	    //
	    // Construct key-value pair.  Key is the XNAT level
	    // value is the folder.
	    //
	    pathObj[splitter[i]] = splitter[i+1];
	    i++;
	}
    }

    return pathObj;
}




/**
 * Acquires the viewables within a given XNAT URL.  The
 * URL must be at least at the 'experiments' level and the
 * 'viewableType' argument specifies whether to retrieve 
 * 'scans' viewables or 'slicer' viewables.  The 'callback' 
 * argument is passed into the specific methods for retrieving
 * the viewables.
 *
 * @param {!string, !string, function=}
 * @expose
 */
XnatIO.prototype.getViewables = function(url, viewableType, callback){

    var that = this;
    var queryUrl = this.getXnatPathByLevel(url, 'experiments');

    switch(viewableType.toLowerCase())
    {
    case 'scans':
	that.getScans(queryUrl, callback);
	break;
    case 'slicer':
	that.getSlicer(queryUrl, callback);
	break;
    }  
}




/**
 * Inventories the 'scans' within a given XNAT URI to 
 * construct an object that can be described as a 'viewable'
 * which is key-value structure pointing to various data and
 * meatadata of a given 'scan' for loading into the 'Displayer'
 * object. 
 *
 * @param {!string, !function}
 */
XnatIO.prototype.getScans = function (url, callback){

    var that = this;
    var viewableFolder = 'scans';
    var queryFolder = url + "/" + viewableFolder;
    var pathObj = this.getXnatPathObject(url);



    utils.dom.debug('XnatIO.getScans: Sending simple request for ['+ queryFolder + ']');

    

    //--------------------
    // Loop through all the scans within a given
    // experiment.
    //--------------------
    that.jsonGet(queryFolder, function(obj){
	goog.array.forEach(obj, function(scans){


	    //
	    // Construct a fileQueryUrl for every scan folder.
	    //
	    var fileQueryUrl = url + "/" + viewableFolder + "/" + scans['ID'] + "/files";


	    //
	    // Loop through fileList within the 'scans' folder.
	    //
	    that.jsonGet(fileQueryUrl, function(fileList){


		//
		// Add file URIs to array.
		//
		var scanFileArr = [];
		goog.array.forEach(fileList, function(fileObj){
		    // NOTE: Adding XnatViewerGlobals.ROOT_URL is 
		    // SUPER CRITICAL!
		    scanFileArr.push(XnatViewerGlobals.ROOT_URL + fileObj['URI']);
		});
		
		
		//
		// Populate medatadata object pertaining to
		// the scan. See keys below...
		//
		var viewable = that.getEmptyViewableData();
		for (key in pathObj){
		    if (pathObj[key] !== 'undefined'){
			viewable['sessionInfo'][key] = pathObj[key]; 
		    }
		}
		viewable['files'] = scanFileArr;
		viewable['sessionInfo']['SessionID']['value'] = [pathObj['experiments']];
		viewable['sessionInfo']['Accession #']['value'] = [pathObj['projects']];
		viewable['sessionInfo']['Scan']['value'] =  [scans['ID']];
				

		//
		// Select the image in the middle of the list to 
		// serve as the thumbnail after sorting the fileURIs
		// using natural sort.
		//
		scanFileArr = scanFileArr.sort(utils.array.naturalCompare);
		var imgInd = Math.floor((scanFileArr.length) / 2);
		var thumbImg = scanFileArr[imgInd];


		//
		// Define the thumbnailImage URI
		//
		viewable['thumbnailImageSrc'] = thumbImg + "?format=image/jpeg";

		
		//
		// Run callback.
		//
		callback(viewable);
	    })	
	})
    })
}




/**
 * Inventories the 'resources/Slicer/files' folder within a given XNAT URI to 
 * construct an object that can be described as a 'viewable'
 * which is key-value structure pointing to various data and
 * meatadata of a given Slicer file (.mrb) for loading into the 'Displayer'
 * object. 
 *
 * @param {!string, !function}
 */
XnatIO.prototype.getSlicer = function (url, callback){
    var that = this;
    var viewableFolder = 'Slicer';
    var queryFolder = url + "/resources/" + viewableFolder + "/files";
    var pathObj = this.getXnatPathObject(url);
    var readableFiles = ['.mrml', '.nrrd']; 



    utils.dom.debug('XnatIO.getSlicer: Sending simple request for ['+ queryFolder + ']');



    //--------------------
    // Loop through the contents of the 'Slicer' query
    // folder.
    //--------------------
    that.jsonGet(queryFolder, function(obj){
	utils.dom.debug('XNAT IO 386: ' + obj)
	goog.array.forEach(obj, function(viewableFile){
	    var viewableSlicerPackageFiles = [];
	    var slicerThumb = ""; 
	    var fileQueryStr = queryFolder + "/" + viewableFile['Name'];


	    //
	    // Loop through all of the .mrb files.
	    //
	    that.jsonGet(fileQueryStr + "?listContents=true", function(response){


		//
		// Get the .mrb contents to determine what of it can 
		// be viewed.  This is done through the 'listContents' suffix
		// when communicating with an XNAT server.
		//
		utils.dom.debug('XNAT IO 392: ' + fileQueryStr + "?listContents=true");
		goog.array.forEach(response, function(r) {

		    //
		    // Only consider contents files that actually refer to a file,
		    // so that it can be loaded into the viewer (Sometimes these contents
		    // do not refer to a file).
		    //
		    if (r['File Name'][r['File Name'].length-1] != '/') {
			viewableSlicerPackageFiles.push(fileQueryStr + "!" + r['File Name']);
		    }   

		})


		//
		// Populate medatadata object.  See keys
		// below for specificity.
		//
		var viewable = that.getEmptyViewableData();
		for (key in viewableFile){
		    viewable[key] = viewableFile[key];
		}
		for (key in pathObj){
		    if (pathObj[key] !== 'undefined'){
			viewable['sessionInfo'][key] = pathObj[key]; 
		    }
		}
		viewable['files'] = viewableSlicerPackageFiles;
		viewable['category'] = 'Slicer';
		viewable['sessionInfo']['SessionID']['value'] = [pathObj['experiments']];
		viewable['sessionInfo']['Format']['value'] = ['.mrb'];
		viewable['sessionInfo']['Accession #']['value'] = [pathObj['projects']];


		//
		// Get thumbnailImage by looking through files
		// to determine what can be used for the thumbnail representation.
		// (Slicer usually packages a screenshot).
		// Select the first one.
		//
		var imageArr = ['jpeg', 'jpg', 'png', 'gif'];
		var imageFound = false;
		goog.array.forEach(viewable['files'], function(fileName){
		    var ext = utils.string.getFileExtension(fileName);
		    goog.array.forEach(imageArr, function(imageType){
			if (ext === imageType && !imageFound){
			    viewable['thumbnailImageSrc'] = fileName; 
			    imageFound = true;
			}
		    })
		})
	

		//
		// Run callback.
		//
		callback(viewable);
	    });

	})		
    })
}