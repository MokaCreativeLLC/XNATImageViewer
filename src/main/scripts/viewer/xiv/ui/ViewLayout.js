/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// utils
goog.require('moka.string');

// xiv
goog.require('xiv');




/**
 * xiv.ui.ViewLayout
 *
 * @constructor
 * @param {!string, array.<string>=}
 */
goog.provide('xiv.ui.ViewLayout');
xiv.ui.ViewLayout = function(viewSchemeName, cssSuffixes) {
    var that = this;
    var cssSuffixes = cssSuffixes ? cssSuffixes : ['v', 'x', 'y', 'z'];
    var cssId = moka.string.stripNonAlphanumeric(viewSchemeName.toLowerCase());


    this.id = viewSchemeName;
    this.title = viewSchemeName;
    this.src = xiv.ICON_URL + "ViewLayouts/" + goog.string.toTitleCase(this.id) +  "-white.png";
    this.cssPrefix = goog.getCssName(xiv.ui.ViewLayout.VIEWSCHEME_CLASS_PREFIX, cssId);


    this.cssSheets = {};
    this.cssSheetsInteractor = {}
    goog.array.forEach(cssSuffixes, function(suffix){
	that.cssSheets[suffix] = goog.getCssName(that.cssPrefix, suffix);
	//console.log(that.cssSheets[suffix]);
	that.cssSheetsInteractor[suffix] = goog.getCssName(goog.getCssName(xiv.ui.ViewLayout.VIEWSCHEME_INTERACTOR_CLASS_PREFIX, cssId), suffix);
    })


   

}
goog.exportSymbol('xiv.ui.ViewLayout', xiv.ui.ViewLayout);



xiv.ui.ViewLayout.VIEWSCHEME_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewlayout');
xiv.ui.ViewLayout.VIEWSCHEME_INTERACTOR_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(xiv.ui.ViewLayout.VIEWSCHEME_CLASS_PREFIX, 'interactor');




xiv.ui.ViewLayout.prototype.id = /** @type {string}*/ '';
xiv.ui.ViewLayout.prototype.src = /** @type {string}*/ '';
xiv.ui.ViewLayout.prototype.title = /** @type {string}*/ '';
xiv.ui.ViewLayout.prototype.cssPrefix = /** @type {string}*/ '';
xiv.ui.ViewLayout.prototype.cssSheets = /** @type {Object.<string,string>}*/ '';
xiv.ui.ViewLayout.prototype.cssSheetsInteractor = /** @type {Object.<string,string>}*/ '';




