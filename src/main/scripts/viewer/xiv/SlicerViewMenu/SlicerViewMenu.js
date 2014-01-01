/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.array');
goog.require('goog.dom');


/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.fx');
goog.require('utils.ui.ScrollableContainer.ThumbnailGallery');




/**
 * 
 * @constructor
 * @param {xiv.ViewBox} ViewBox The ViewBox for the SlicerViewMenu to attach to.
 * @extends {xiv.Widget}
 */
goog.provide('xiv.SlicerViewMenu');
xiv.SlicerViewMenu = function () {

    //------------------
    // Call parent
    //------------------ 
    xiv.Widget.call(this, 'xiv.SlicerViewMenu');
    goog.dom.classes.set(this.element, xiv.SlicerViewMenu.ELEMENT_CLASS);
    // Hide the element.
    utils.fx.fadeOut(this.element, 0);



    //------------------
    // Reset array and object properties
    //------------------ 
    this.slicerSettings_ = {};
    this.thumbnailClickCallbacks = []; 



    //------------------
    // Thumbnail Gallery.
    //------------------ 
    this.ThumbnailGallery_ = new utils.ui.ScrollableContainer.ThumbnailGallery();
    this.element.appendChild(this.ThumbnailGallery_.element);



    //------------------
    // DialogText
    //------------------ 
    this.headerText_ = utils.dom.makeElement('div', this.element, 'DialogText');
    this.headerText_.innerHTML = '<b> Select View <b>';
    goog.dom.classes.add(this.headerText_, xiv.SlicerViewMenu.HEADERTEXT_CLASS);



    //------------------
    // Set classes
    //------------------ 
    goog.dom.classes.add(this.ThumbnailGallery_.element, xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS);
    this.ThumbnailGallery_.addThumbnailClass(xiv.SlicerViewMenu.THUMBNAIL_CLASS);
    this.ThumbnailGallery_.addThumbnailImageClass(xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS);
    this.ThumbnailGallery_.addThumbnailTextClass(xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS);
}
goog.inherits(xiv.SlicerViewMenu, xiv.Widget);
goog.exportSymbol('xiv.SlicerViewMenu', xiv.SlicerViewMenu);




xiv.SlicerViewMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-slicerviewmenu');
xiv.SlicerViewMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, '');
xiv.SlicerViewMenu.HEADERTEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'headertext');
xiv.SlicerViewMenu.THUMBNAIL_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail');
xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-image');
xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnailgallery');




/**
* @param {?Object}
*/
xiv.SlicerViewMenu.prototype._slicerSettings = null;



/**
* @type {?xiv.ViewBox}
* @private
*/
xiv.SlicerViewMenu.prototype.ViewBox_ = null;




/**
 * @type {?utils.ui.ScrollableContainer.ThumbnailGallery}
 * @private
 */
xiv.SlicerViewMenu.prototype.ThumbnailGallery_ = null;



/**
 * @return {?utils.ui.ScrollableContainer.ThumbnailGallery}
 */
xiv.SlicerViewMenu.prototype.getThumbnailGallery = function(){
    return this.ThumbnailGallery_;
};





/**
* @param {?Array.<function>}
*/
xiv.SlicerViewMenu.prototype.clickCallbacks_ = null;





/**
* @param {!Object}
*/
xiv.SlicerViewMenu.prototype.reset = function (slicerSettings) {

    var scenes = [];
    var mrmlBase = '';
    var displayText = '';
    var thumbnail;


    //----------------
    // Make thumbnail from Slicer settings.
    //----------------
    this._slicerSettings = slicerSettings;
    for (var mrmlFile in this._slicerSettings){
	mrmlBase = utils.string.basename(mrmlFile);
	scenes = this._slicerSettings[mrmlFile]['__scenes__'];
	goog.array.forEach(scenes, function(sceneName){
	    // Make the thumbnail
	    displayText = "<b><font size = '2'>" + sceneName + "</font></b><br>";
	    thumbnail = this.ThumbnailGallery_.insertThumbnail(this._slicerSettings[mrmlFile][sceneName]['thumbnail'], displayText, mrmlBase);
	    thumbnail._MRML_ = mrmlFile;
	    thumbnail._SCENE_ = sceneName;

	    // Set the click listener for the thumbnail.
	    this.setThumbnailClickListener_(thumbnail);
	}.bind(this))	
    }

    
    
}



/**
* @param {!function}
*/
xiv.SlicerViewMenu.prototype.onViewSelected = function (callback) {
    if (!this.thumbnailClickCallbacks_) {
	this.thumbnailClickCallbacks_ = [];
    }
    this.thumbnailClickCallbacks_.push(callback);
}



/**
* @param {!utils.ui.Thumbnail}
* @private
*/
xiv.SlicerViewMenu.prototype.setThumbnailClickListener_ = function (thumbnail) {
    thumbnail.onClick = function(){
	// Run click callbacks
	if (this.thumbnailClickCallbacks_) {
	    goog.array.forEach(this.thumbnailClickCallbacks_, 
			       function(callback){ callback(this._slicerSettings[thumbnail._MRML_][thumbnail._SCENE_]) }.bind(this));
	}
    }.bind(this)
}



/**
*/
xiv.SlicerViewMenu.prototype.showViewSelectDialog = function() {
    utils.fx.fadeIn(this.element, xiv.ANIM_SLOW);
}



/**
*/
xiv.SlicerViewMenu.prototype.hideViewSelectDialog = function() {
    utils.fx.fadeOut(this.element, xiv.ANIM_MED);
    goog.dom.removeNode(this.element);
}



/**
* @param {Object=}
*/
xiv.SlicerViewMenu.prototype.updateStyle = function (opt_args) {
}
