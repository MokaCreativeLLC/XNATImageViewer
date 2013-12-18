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
goog.require('utils.ui.ScrollableThumbnailGallery');




/**
 * 
 * @constructor
 * @param {xiv.ViewBox} ViewBox The ViewBox for the SlicerViewMenu to attach to.
 * @extends {xiv.Widget}
 */
goog.provide('xiv.SlicerViewMenu');
xiv.SlicerViewMenu = function (ViewBox) {

    this.ViewBox_ = ViewBox;
    xiv.Widget.call(this, 'xiv.SlicerViewMenu');
    goog.dom.classes.set(this._element, xiv.SlicerViewMenu.ELEMENT_CLASS);

    this.ViewBox_._element.appendChild(this._element);

    this.Dialog_ = utils.dom.makeElement('div', this._element, 'Dialog');
    goog.dom.classes.set(this.Dialog_, xiv.SlicerViewMenu.DIALOG_CLASS);
    this.Dialog_.style.visibility = 'hidden';


    this.ThumbnailGallery_ = new utils.ui.ScrollableThumbnailGallery();
    this.Dialog_.appendChild(this.ThumbnailGallery_._element);
    this.DialogText_ = utils.dom.makeElement('div', this.Dialog_, 'DialogText');
    this.DialogText_.innerHTML = '<b> Select View <b>';
    goog.dom.classes.add(this.DialogText_, xiv.SlicerViewMenu.DIALOGTEXT_CLASS);


    goog.dom.classes.add(this.ThumbnailGallery_._element, xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS);

    this.ThumbnailGallery_.addThumbnailClass(xiv.SlicerViewMenu.THUMBNAIL_CLASS);
    this.ThumbnailGallery_.addThumbnailImageClass(xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS);
    this.ThumbnailGallery_.addThumbnailTextClass(xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS);

    this.slicerSettings_ = {};
    this.thumbnailClickCallbacks = [];
 
}
goog.inherits(xiv.SlicerViewMenu, xiv.Widget);




xiv.SlicerViewMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-slicerviewmenu');
xiv.SlicerViewMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, '');
xiv.SlicerViewMenu.DIALOG_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'dialog');
xiv.SlicerViewMenu.DIALOGTEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'dialog-text');
xiv.SlicerViewMenu.THUMBNAIL_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail');
xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-image');
xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnailgallery');




/**
* @param {?Object}
*/
xiv.SlicerViewMenu.prototype._slicerSettings = null



/**
* @type {?xiv.ViewBox}
* @private
*/
xiv.SlicerViewMenu.prototype.ViewBox_ = null




/**
 * @type {?utils.ui.ScrollableContainer}
 * @private
 */
xiv.SlicerViewMenu.prototype.ThumbnailGallery_ = null;


/**
 * @type {?Element}
 * @private
 */
xiv.SlicerViewMenu.prototype.Dialog_ = null;



/**
* @param {!Array.<function>}
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
    var viewBoxDims = utils.style.dims(this.ViewBox_._element);



    //----------------
    // Make thumbnail from Slicer settings.
    //----------------
    this._slicerSettings = slicerSettings;
    for (var mrmlFile in this._slicerSettings){
	mrmlBase = utils.string.basename(mrmlFile);
	scenes = this._slicerSettings[mrmlFile]['__scenes__'];
	goog.array.forEach(scenes, function(sceneName){
	    displayText = "<b><font size = '2'>" + sceneName + "</font></b><br>";
	    thumbnail = this.ThumbnailGallery_.makeAddThumbnail(this._slicerSettings[mrmlFile][sceneName]['thumbnail'], 
								displayText, mrmlBase);

	    // Set the hover clone to the thumbnail element to avoid
	    // having the hover clone spill over.
	    thumbnail.setHoverCloneParent(thumbnail._element);
	    
	    thumbnail._MRML_ = mrmlFile;
	    thumbnail._SCENE_ = sceneName;

	    this.setThumbnailClickListener_(thumbnail);
	}.bind(this))	
    }

    
    
}



/**
* @param {function}
*/
xiv.SlicerViewMenu.prototype.onViewSelected = function (callback) {
    if (!this.thumbnailClickCallbacks_) {
	this.thumbnailClickCallbacks_ = [];
    }
    this.thumbnailClickCallbacks_.push(callback);
}



/**
* @param {!thumbnail}
* @private
*/
xiv.SlicerViewMenu.prototype.setThumbnailClickListener_ = function (thumbnail) {
    goog.events.listen(thumbnail._hoverClone, goog.events.EventType.CLICK, function(){
	// Run click callbacks
	// window.console.log("CLICK", this._slicerSettings[thumbnail._MRML_][thumbnail._SCENE_]);
	if (this.thumbnailClickCallbacks_) {
	    goog.array.forEach(this.thumbnailClickCallbacks_, 
			       function(callback){ callback(this._slicerSettings[thumbnail._MRML_][thumbnail._SCENE_]) }.bind(this));
	}
    }.bind(this))
}



/**
* @param {function}
*/
xiv.SlicerViewMenu.prototype.showViewSelectDialog = function() {
    utils.style.setStyle(this.Dialog_, {'visibility': 'visible' });
    //utils.fx.fadeIn(this.Dialog_, xiv.ANIM_FAST);
}


/**
* @param {function}
*/
xiv.SlicerViewMenu.prototype.hideViewSelectDialog = function() {
    utils.style.setStyle(this.Dialog_, {'visibility': 'hidden' });
    //utils.fx.fadeIn(this.Dialog_, xiv.ANIM_FAST);
}



/**
* @param {Object=}
*/
xiv.SlicerViewMenu.prototype.updateStyle = function (opt_args) {
}
