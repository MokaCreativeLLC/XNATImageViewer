/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author herrickr@mir.wustl.edu (Rick Herrick)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx');
goog.require('goog.events');
goog.require('goog.net.XhrIo');

/**
 * utils includes
 */
goog.require('utils.style');

/**
 * viewer-widget includes
 */
goog.require('Modal');
goog.require('XnatViewerGlobals');




/**
 * This is the global XNAT Image Viewer 
 * object.
 *
 * @constructor
 */
goog.provide('xiv');
xiv = function(){};
goog.exportSymbol('xiv', xiv);




/**
 * The main start function to load
 * up the XNAT Image Viewer.  Sets global URIs
 * (so as to load the thumbnails from a given experiment)
 * and brings up the modal accordingly.
 *
 * @param {!string, !string}
 */
goog.provide('xiv.start');
xiv.start = function (XNAT_SERVER_ROOT, target) {
    
    //------------------
    // NOTE: We set this style parameter to prevent 
    // Webkit-based browsers from responding to page scrolling, 
    // two finger gestures on Mac trackpads.
    //------------------
    document.body.style.overflow = 'hidden';



    //------------------
    // Initialize global parameters
    //------------------
    XnatViewerGlobals.ROOT_URL = XNAT_SERVER_ROOT;



    //------------------
    // Create a new Modal (viewer-widget) based
    // on the above parameters
    //------------------
    XV = new Modal({
        parent : document.body,
        pathPrepend: XNAT_SERVER_ROOT + "/REST/"
    });	
    


    //------------------
    // Set the global Xnat URI
    //------------------
    XV.setXnatPathAndLoadThumbnails(target);

};
goog.exportSymbol('xiv.start', xiv.start);

