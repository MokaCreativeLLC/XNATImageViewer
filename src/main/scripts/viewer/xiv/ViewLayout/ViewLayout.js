/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes.
 */
goog.require('goog.string');
goog.require('goog.array');


/**
 * utils includes.
 */
goog.require('utils.string');


/**
 * xiv includes.
 */
goog.require('xiv');




/**
 * xiv.ViewLayout
 *
 * @constructor
 * @param {!string, array.<string>=}
 */
goog.provide('xiv.ViewLayout');
xiv.ViewLayout = function(viewSchemeName, cssSuffixes) {
    var that = this;
    var cssSuffixes = cssSuffixes ? cssSuffixes : ['v', 'x', 'y', 'z'];
    var cssId = utils.string.stripNonAlphanumeric(viewSchemeName.toLowerCase());


    this.id = viewSchemeName;
    this.title = viewSchemeName;
    this.src = xiv.ICON_URL + "ViewLayouts/" + goog.string.toTitleCase(this.id) +  "-white.png";
    this.cssPrefix = goog.getCssName(xiv.ViewLayout.VIEWSCHEME_CLASS_PREFIX, cssId);


    this.cssSheets = {};
    this.cssSheetsInteractor = {}
    goog.array.forEach(cssSuffixes, function(suffix){
	that.cssSheets[suffix] = goog.getCssName(that.cssPrefix, suffix);
	//console.log(that.cssSheets[suffix]);
	that.cssSheetsInteractor[suffix] = goog.getCssName(goog.getCssName(xiv.ViewLayout.VIEWSCHEME_INTERACTOR_CLASS_PREFIX, cssId), suffix);
    })


   

}
goog.exportSymbol('xiv.ViewLayout', xiv.ViewLayout);



xiv.ViewLayout.VIEWSCHEME_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewlayout');
xiv.ViewLayout.VIEWSCHEME_INTERACTOR_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(xiv.ViewLayout.VIEWSCHEME_CLASS_PREFIX, 'interactor');




xiv.ViewLayout.prototype.id = /** @type {string}*/ '';
xiv.ViewLayout.prototype.src = /** @type {string}*/ '';
xiv.ViewLayout.prototype.title = /** @type {string}*/ '';
xiv.ViewLayout.prototype.cssPrefix = /** @type {string}*/ '';
xiv.ViewLayout.prototype.cssSheets = /** @type {Object.<string,string>}*/ '';
xiv.ViewLayout.prototype.cssSheetsInteractor = /** @type {Object.<string,string>}*/ '';




