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
goog.require('xiv.Modal');




/**
 * This is the global XNAT Image Viewer 
 * object.
 *
 * @constructor
 */
goog.provide('xiv');
xiv = function(){};
goog.exportSymbol('xiv', xiv);




//********************************************************
//  IDs
//********************************************************
xiv.MODAL_ID = /** @const @type {string} */ "XNATModal";



//********************************************************
//  IDs
//********************************************************
xiv.DEFAULT_LAYOUT = /** @const @type {string} */ "Four-Up";



//********************************************************
//  FONTS AND COLORS
//********************************************************
xiv.DARK_GREY = /** @const @type {string} */ 'rgb(35,35,35)';
xiv.FONT_FAMILY = /** @const @type {string} */ 'Helvetica, Helvetica neue, Arial, sans-serif';




//********************************************************
//  ANIMATION LENGTHS
//********************************************************
xiv.ANIM_VERY_FAST = /** @const @type {number} */ 100;
xiv.ANIM_FAST = /** @const @type {number} */ 200;
xiv.ANIM_MED = /** @const @type {number} */ 500;
xiv.ANIM_SLOW = /** @const @type {number} */ 1000;




//********************************************************
//  VIEW BOX DEFAULTS
//********************************************************
xiv.MIN_HOLDER_HEIGHT = /** @const @type {number} */ 200;
xiv.VIEWER_DIM_RATIO = /** @const @type {number} */ .85
xiv.MIN_VIEWER_HEIGHT =  /** @const @type {number} */ 320;
xiv.MIN_VIEWER_WIDTH =  /** @const @type {number} */ xiv.MIN_VIEWER_HEIGHT * xiv.VIEWER_DIM_RATIO;
xiv.VIEWER_VERTICAL_MARGIN =  /** @const @type {number} */ 20;
xiv.VIEWER_HORIZONTAL_MARGIN =  /** @const @type {number} */ 20;




//********************************************************
//  THUMBNAILS
//********************************************************
xiv.THUMBNAIL_IMAGE_HEIGHT =  /** @const @type {number} */ 72;
xiv.THUMBNAIL_IMAGE_WIDTH =  /** @const @type {number} */ 72;
xiv.THUMBNAIL_IMAGE_MARGIN_X =  /** @const @type {number} */ 8;
xiv.THUMBNAIL_IMAGE_MARGIN_Y =  /** @const @type {number} */ 8;
xiv.THUMBNAIL_ELEMENT_HEIGHT =  /** @const @type {number} */ xiv.THUMBNAIL_IMAGE_HEIGHT + xiv.THUMBNAIL_IMAGE_MARGIN_X*2;
xiv.THUMBNAIL_ELEMENT_WIDTH =  /** @const @type {number} */ 200;




//********************************************************
//  EXPAND BUTTON
//********************************************************
xiv.EXPAND_BUTTON_WIDTH =  /** @const @type {number} */ 30;




//********************************************************
//  VIEW BOX TABS
//********************************************************
xiv.SCAN_TAB_LABEL_HEIGHT =  /** @const @type {number} */ 15;
xiv.SCAN_TAB_LABEL_WIDTH =  /** @const @type {number} */ 50;
xiv.MIN_TAB_HEIGHT =  /** @const @type {number} */ xiv.SCAN_TAB_LABEL_HEIGHT;
xiv.SCAN_TAB_HEIGHT =  /** @const @type {number} */ xiv.MIN_TAB_HEIGHT;
xiv.MAX_MODAL_WIDTH_PERCENTAGE =  /** @const @type {number} */ .90;
xiv.MAX_MODAL_HEIGHT_PERCENTAGE =  /** @const @type {number} */ .95;
xiv.TAB_CLICK_HEIGHT =  /** @const @type {number} */ 300;	




//********************************************************
//  SCROLL LINK GROUPS
//********************************************************
xiv.MAX_SCROLL_LINK_GROUPS =  /** @const @type {number} */ 10;




//********************************************************
//  CONTENT DIVIDER 
//********************************************************
xiv.CONTENT_DIVIDER_HEIGHT =  /** @const @type {number} */ 4;

/**
 * @param {number}
 * @return {number}
 */

xiv.prototype.minContentDividerTop = function (widgetHeight) {
    return widgetHeight - xiv.CONTENT_DIVIDER_HEIGHT - xiv.MIN_TAB_HEIGHT;
} 




//---------
// 'XNAT_SERVER_ROOT' set above.
//---------
//xiv.start(XNAT_SERVER_ROOT, XNAT_SAMPLE_DATA_URI);

