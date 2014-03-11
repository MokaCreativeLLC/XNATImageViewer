// goog
goog.require('goog.array');
goog.require('goog.string');

// moka
goog.require('moka.string');





/**
 * @constructor
 * @dict
 * @param {Array.<string>} fileCollection The file urls within the slicer .mrb.
 * @return {xiv.slicer.mrbProperties}
 * @private
 */
goog.provide('xiv.slicer.mrbProperties');
xiv.slicer.mrbProperties = function(fileColleciton){
    xiv.slicer.mrbProperties.getPropertiesPerMrml_(fileCollection, this);
    xiv.slicer.mrbProperties.getMrbScreenShots_(fileCollection, this);
    xiv.slicer.mrbProperties.updateUrls_(this);
}
goog.exportSymbol('xiv.slicer.mrbProperties', xiv.slicer.mrbProperties);




/**
 * Loop the 'viewables' aspect of the properties object.
 * @param {!Object} properties
 * @param {!callback} callback
 * @public
*/
xiv.XtkDisplayer.loopProperties = function(properties, callback){
    for (var mrmlFilename in properties){
	for (var scene in properties[mrmlFilename]){
	    for (var prop in properties[mrmlFilename][scene]){
		viewableArr = properties[mrmlFilename][scene][prop];
		if (goog.isArray(viewableArr)){
		    goog.array.forEach(viewableArr, function(viewable){
			callback(mrmlFilename, scene, prop, viewable);
		    })
		}
	    }
	}	
    }
}




/**
 * @param {!Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {!Object} properties The slicer properties.
 * @private
 */
xiv.slicer.mrbProperties.getPropertiesPerMrml_ = function(fileCollection, properties){
    var basename = '';
    var ext = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = moka.string.basename(fileName);
	ext = moka.string.getFileExtension(basename).toLowerCase();
	if ((ext === 'mrml') && (goog.string.startsWith(basename, '.') !== true)) {
	    // Get the Slicer properties for each file
	    console.log("MRML", ext, basename, fileName);
	    properties[fileName] = xiv.slicer.getSlicerProperties(fileName);
	    
	}
    });
}



/**
 * @param {!Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {!Object} properties The slicer properties.
 * @private
 */
xiv.slicer.properties.getMrbScreenShots_ = function(fileCollection, properties){
    var basename = '';
    var ext = '';
    var screenshotName = '';
    var cleanedSceneName = '';
    var mrmlFilename = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = moka.string.basename(fileName);
	ext = moka.string.getFileExtension(basename).toLowerCase();
	screenshotName = basename.split('.')[0].toLowerCase().replace(' ', '');

	//
	// Get pngs and skip and files this start with '.'
	//
	if ((ext === 'png') && !(goog.string.startsWith(basename, '.'))) {
	    for (mrmlFilename in properties){
		goog.array.forEach(properties[mrmlFilename]['__scenes__'], function(sceneName){
		    cleanedSceneName = sceneName.split('.')[0].toLowerCase().replace(' ', '');
		    //window.console.log(screenshotName, cleanedSceneName, cleanedSceneName.indexOf(screenshotName))
		    if (cleanedSceneName.indexOf(screenshotName) > -1){
			properties[mrmlFilename][sceneName]['thumbnail'] = fileName;
		    }
		})
	    }
	}
    }));
}



/**
 * Update the urls of the files to be
 * to the accurate relative path.  (Since the
 * urls were read from the mrml, they start relative to 
 * the slicer file path).
 *
 * @param {xiv.slicer.mrbProperties} properties
 * @private
 */
xiv.slicer.mrbProperties.updateUrls_ = function(properties){
    var viewableArr = [];

    var updateUrl = function(mrml, url) { 
	// If there's a '!' in the mrml url, then
	// we're likely extracting a file from the .mrb.
	var folderPrefix = (mrml.indexOf('!') === -1) ? moka.string.dirname(mrml) + '/' : mrml.split('!')[0] + '!';
	var firstUrl = folderPrefix + goog.string.remove(url, './');
	window.console.log("UPDATE URL", mrml, url, firstUrl);
	return firstUrl
    };

    xiv.slicer.mrbProperties.loopProperties(this, function(mrmlFilename, scene, prop, viewable){
	if (viewable['file']) {
	    viewable['file'] =  updateUrl(mrmlFilename, viewable['file']);
	} 
	if (viewable['properties'] && viewable['properties']['fiberDisplay']) {
	    goog.array.forEach(viewable['properties']['fiberDisplay'], function(fiberDisplay){
		if (fiberDisplay['colorTable']) {
		    fiberDisplay['colorTable'] =  updateUrl(mrmlFilename, fiberDisplay['colorTable']);
		}
	    })   
	}
    })
    
}
