/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */

/**
 * viewer-widget includes
 */




/**
 * XnatViewerGlobals is the class for managing
 * constant global variables 
 *
 * @constructor
 */
goog.provide('XnatViewerGlobals');
XnatViewerGlobals = function (){}
goog.exportSymbol('XnatViewerGlobals', XnatViewerGlobals);





//********************************************************
//  The GLOBAL object.
//********************************************************
XnatViewerGlobals = new XnatViewerGlobals();





//********************************************************
//  ICON URL
//********************************************************
// TODO: Looks weird because XNAT_SERVER_ROOT has no context. 
// It's being set in the containing page.
XnatViewerGlobals.ICON_URL = /** @const @type {string} */ XNAT_SERVER_ROOT + "/images/viewer/";




//********************************************************
//  IDs
//********************************************************
XnatViewerGlobals.MODAL_ID = /** @const @type {string} */ "XNATModal";




//********************************************************
//  FONTS AND COLORS
//********************************************************
XnatViewerGlobals.DARK_GREY = /** @const @type {string} */ 'rgb(35,35,35)';
XnatViewerGlobals.FONT_FAMILY = /** @const @type {string} */ 'Helvetica, Helvetica neue, Arial, sans-serif';




//********************************************************
//  ANIMATION LENGTHS
//********************************************************
XnatViewerGlobals.ANIM_VERY_FAST = /** @const @type {number} */ 100;
XnatViewerGlobals.ANIM_FAST = /** @const @type {number} */ 200;
XnatViewerGlobals.ANIM_MED = /** @const @type {number} */ 500;
XnatViewerGlobals.ANIM_SLOW = /** @const @type {number} */ 1000;




//********************************************************
//  VIEW BOX DEFAULTS
//********************************************************
XnatViewerGlobals.MIN_HOLDER_HEIGHT = /** @const @type {number} */ 200;
XnatViewerGlobals.VIEWER_DIM_RATIO = /** @const @type {number} */ .85
XnatViewerGlobals.MIN_VIEWER_HEIGHT =  /** @const @type {number} */ 320;
XnatViewerGlobals.MIN_VIEWER_WIDTH =  /** @const @type {number} */ XnatViewerGlobals.MIN_VIEWER_HEIGHT * XnatViewerGlobals.VIEWER_DIM_RATIO;
XnatViewerGlobals.VIEWER_VERTICAL_MARGIN =  /** @const @type {number} */ 20;
XnatViewerGlobals.VIEWER_HORIZONTAL_MARGIN =  /** @const @type {number} */ 20;




//********************************************************
//  THUMBNAILS
//********************************************************
XnatViewerGlobals.THUMBNAIL_IMAGE_HEIGHT =  /** @const @type {number} */ 72;
XnatViewerGlobals.THUMBNAIL_IMAGE_WIDTH =  /** @const @type {number} */ 72;
XnatViewerGlobals.THUMBNAIL_IMAGE_MARGIN_X =  /** @const @type {number} */ 8;
XnatViewerGlobals.THUMBNAIL_IMAGE_MARGIN_Y =  /** @const @type {number} */ 8;
XnatViewerGlobals.THUMBNAIL_ELEMENT_HEIGHT =  /** @const @type {number} */ XnatViewerGlobals.THUMBNAIL_IMAGE_HEIGHT + XnatViewerGlobals.THUMBNAIL_IMAGE_MARGIN_X*2;
XnatViewerGlobals.THUMBNAIL_ELEMENT_WIDTH =  /** @const @type {number} */ 200;




//********************************************************
//  EXPAND BUTTON
//********************************************************
XnatViewerGlobals.EXPAND_BUTTON_WIDTH =  /** @const @type {number} */ 30;




//********************************************************
//  VIEW BOX TABS
//********************************************************
XnatViewerGlobals.SCAN_TAB_LABEL_HEIGHT =  /** @const @type {number} */ 15;
XnatViewerGlobals.SCAN_TAB_LABEL_WIDTH =  /** @const @type {number} */ 50;
XnatViewerGlobals.MIN_TAB_HEIGHT =  /** @const @type {number} */ XnatViewerGlobals.SCAN_TAB_LABEL_HEIGHT;
XnatViewerGlobals.SCAN_TAB_HEIGHT =  /** @const @type {number} */ XnatViewerGlobals.MIN_TAB_HEIGHT;
XnatViewerGlobals.MAX_MODAL_WIDTH_PERCENTAGE =  /** @const @type {number} */ .90;
XnatViewerGlobals.MAX_MODAL_HEIGHT_PERCENTAGE =  /** @const @type {number} */ .95;
XnatViewerGlobals.TAB_CLICK_HEIGHT =  /** @const @type {number} */ 300;	




//********************************************************
//  SCROLL LINK GROUPS
//********************************************************
XnatViewerGlobals.MAX_SCROLL_LINK_GROUPS =  /** @const @type {number} */ 10;




//********************************************************
//  CONTENT DIVIDER 
//********************************************************
XnatViewerGlobals.CONTENT_DIVIDER_HEIGHT =  /** @const @type {number} */ 4;

/**
 * @param {number}
 * @return {number}
 */
XnatViewerGlobals.minContentDividerTop = function (widgetHeight) {
    return widgetHeight - XnatViewerGlobals.CONTENT_DIVIDER_HEIGHT - XnatViewerGlobals.MIN_TAB_HEIGHT;
} 




//********************************************************
//  DRAG AND DROP IMAGE
//********************************************************
XnatViewerGlobals.dragAndDropImage = new Image();
XnatViewerGlobals.dragAndDropImage.src = XnatViewerGlobals.ICON_URL + "DragAndDrop-3pt.png";


