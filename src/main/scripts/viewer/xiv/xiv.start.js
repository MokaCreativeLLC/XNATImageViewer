// xiv
goog.require('xiv');

// xtk
goog.require('X.loader');
goog.require('X.parserIMA');

// google
goog.require('goog.dom.fullscreen');

///////////////////////////////////////////////
//
//
//
//  THIS SCRIPT SHOULD NOT GET COMPILED!
//
//
//
///////////////////////////////////////////////





/**
 * The main start function to load
 * up the XNAT Image Viewer.  Sets global URIs
 * (so as to load the thumbnails from a given experiment)
 * and brings up the modal accordingly.
 */
startViewer = function (serverRoot, dataPath) {



    //------------------
    // CUSTOM XTK parsers
    //------------------    
    X.loader.extensions['IMA'] = [X.parserIMA, null];
    window.console.log("LOADER EXTENSIONS", X.loader.extensions);


    //------------------
    // NOTE: We set this style parameter to prevent 
    // Webkit-based browsers from responding to page scrolling, 
    // two finger gestures on Mac trackpads.
    //------------------
    document.body.style.overflow = 'hidden';



    //------------------
    // Initialize global parameters
    //------------------
    xiv.DATA_PATH = /** @const @type {string} */ dataPath;
    xiv.ROOT_URL = /** @const @type {string} */ serverRoot;
    xiv.ICON_URL = /** @const @type {string} */ serverRoot + "/images/viewer/";



    //------------------
    // Set the XNAT_QUERY_PREFIX
    //------------------
    xiv.XNAT_QUERY_PREFIX = /** @const @type {string} */ serverRoot + "/REST";
    if (xiv.XNAT_QUERY_PREFIX.length > 0 && xiv.XNAT_QUERY_PREFIX[xiv.XNAT_QUERY_PREFIX.length - 1] === "/") {
	xiv.XNAT_QUERY_PREFIX = xiv.XNAT_QUERY_PREFIX.substring(0, xiv.XNAT_QUERY_PREFIX.length - 1);
    }


    //------------------
    // Create a new Modal (viewer-widget) based
    // on the above parameters
    //------------------
    modal = new xiv.Modal();
    modal.addXnatPath(dataPath);
    modal.loadThumbnails();

};
