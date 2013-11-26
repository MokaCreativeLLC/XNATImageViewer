/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */



goog.provide('ViewScheme');





/**
 * ViewScheme
 *
 * @constructor
 * @param {!string, array.<string>=}
 */
ViewScheme = function(viewSchemeName, cssSuffixes) {
    var that = this;
    var cssSuffixes = cssSuffixes ? cssSuffixes : ['v', 'x', 'y', 'z'];
    var cssId = utils.string.stripNonAlphanumeric(viewSchemeName.toLowerCase());


    this.id = viewSchemeName;
    this.title = viewSchemeName;
    this.src = XnatViewerGlobals.ICON_URL + "ViewSchemes/" + goog.string.toTitleCase(this.id) +  "-white.png";
    this.cssPrefix = goog.getCssName(ViewScheme.VIEWSCHEME_CLASS_PREFIX, cssId);


    this.cssSheets = {};
    this.cssSheetsInteractor = {}
    goog.array.forEach(cssSuffixes, function(suffix){
	that.cssSheets[suffix] = goog.getCssName(that.cssPrefix, suffix);
	that.cssSheetsInteractor[suffix] = goog.getCssName(goog.getCssName(ViewScheme.VIEWSCHEME_INTERACTOR_CLASS_PREFIX, cssId), suffix);
    })


   

}
goog.exportSymbol('ViewScheme', ViewScheme);



ViewScheme.VIEWSCHEME_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewscheme');
ViewScheme.VIEWSCHEME_INTERACTOR_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName(ViewScheme.VIEWSCHEME_CLASS_PREFIX, 'interactor');




ViewScheme.prototype.id = /** @type {string}*/ '';
ViewScheme.prototype.src = /** @type {string}*/ '';
ViewScheme.prototype.title = /** @type {string}*/ '';
ViewScheme.prototype.cssPrefix = /** @type {string}*/ '';
ViewScheme.prototype.cssSheets = /** @type {Object.<string,string>}*/ '';
ViewScheme.prototype.cssSheetsInteractor = /** @type {Object.<string,string>}*/ '';




