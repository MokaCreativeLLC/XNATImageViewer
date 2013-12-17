/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.array');


/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.ui.Thumbnail');

/**
 * viewer-widget includes
 */
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.ViewBox');





/**
 * 
 * @param {Object=}
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.SlicerViewMenu');
xiv.SlicerViewMenu = function () {

    xiv.Displayer.call(this, 'xiv.SlicerViewMenu');
    goog.dom.classes.set(this._element, xiv.SlicerViewMenu.ELEMENT_CLASS);
    this.Dialog_ = utils.dom.makeElement('div', this._element, 'Dialog');
    goog.dom.classes.set(this.Dialog_, xiv.SlicerViewMenu.DIALOG_CLASS);
    this.Dialog_.style.visibility = 'hidden';


    this.ThumbnailGallery_ = new utils.ui.ScrollableContainer();
    
    this.Dialog_.appendChild(this.ThumbnailGallery_._element);
}
goog.inherits(xiv.SlicerViewMenu, xiv.Widget);




xiv.SlicerViewMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-slicerviewmenu');
xiv.SlicerViewMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, '');
xiv.SlicerViewMenu.DIALOG_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'dialog');
xiv.SlicerViewMenu.THUMBNAIL_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail');
xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-image');
xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnailgallery');




/**
* @param {Object}
*/
xiv.SlicerViewMenu.prototype._slicerSettings = {}



/**
 * @type {?utils.ui.ScrollableContainer}
 * @private
 */
xiv.SlicerViewMenu.prototype.ThumbnailGallery_ = null;


/**
 * @type {?Elementr}
 * @private
 */
xiv.SlicerViewMenu.prototype.Dialog_ = null;




/**
* @param {Object}
*/
xiv.SlicerViewMenu.prototype.reset = function (slicerSettings) {
    var that = this;
    var scenes = [];
    var thumbImage = '';
    var contents = {};
    var mrmlBase




    this._slicerSettings = slicerSettings;
    
    for (var mrmlFile in this._slicerSettings){

	mrmlBase = utils.string.basename(mrmlFile);
	contents[mrmlBase] = [];

	scenes = that._slicerSettings[mrmlFile]['__scenes__'];
	goog.array.forEach(scenes, function(sceneName){
	    console.log(sceneName);
	    currThumbnail = new utils.ui.Thumbnail()
	    //currThumbnail.setImage(this._properties['thumbnailUrl']);


	    goog.dom.classes.add(currThumbnail._element, xiv.SlicerViewMenu.THUMBNAIL_CLASS)
	    
	    goog.array.forEach(goog.dom.getChildren(currThumbnail._element), function(child){
		
		//thumbImage = goog.dom.getAncestorByClass(utils.ui.Thumbnail.IMAGE_CLASS);
		if (child.getAttribute('class').indexOf(utils.ui.Thumbnail.IMAGE_CLASS) > -1){ 
		    goog.dom.classes.add(child, xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS);
		}
		else if (child.getAttribute('class').indexOf(utils.ui.Thumbnail.TEXT_CLASS) > -1){ 
		    goog.dom.classes.add(child, xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS);
		}

	    })


	    currThumbnail.setImage(that._slicerSettings[mrmlFile][sceneName]['thumbnail']);
	    currThumbnail.setDisplayText("<b><font size = '2'>" + sceneName + "</font></b><br>");
	    contents[mrmlBase].push(currThumbnail._element);
	    
	})	
    }


    this.ThumbnailGallery_.addContents(contents);
    goog.dom.classes.add(this.ThumbnailGallery_._element, xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS);
    this.Dialog_.style.visibility = 'visible';
}




/**
* @param {function}
*/
xiv.SlicerViewMenu.prototype.onViewSelected = function (callback) {
    
}



/**
* @param {function}
*/
xiv.SlicerViewMenu.prototype.showViewSelectDialog = function() {
    
}



/**
* @param {Object=}
*/
xiv.SlicerViewMenu.prototype.updateStyle = function (opt_args) {
    var that = this;
}
