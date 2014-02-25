/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.fx');
goog.require('utils.ui.ThumbnailGallery');
goog.require('utils.events.EventManager');




/**
 * SlicerViewMenu is a class that allows the user to choose a 
 * specific 'view' when loading a slicer file.  It reveals itself
 * when a user puts a Slicer mrb thumbnail into a ViewBox
 *
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.SlicerViewMenu');
xiv.SlicerViewMenu = function () {

    goog.base(this, 'xiv.SlicerViewMenu', {
	'class': xiv.SlicerViewMenu.ELEMENT_CLASS
    });
    utils.fx.fadeOut(this.getElement(), 0);



    /**
     * @type {!Element}
     * @private
     */
    this.headerText_ = goog.dom.createDom('div', {
	'id': 'DialogText',
	'class': xiv.SlicerViewMenu.HEADERTEXT_CLASS
    }, '<b> Select View <b>');




    /**
     * @type {?utils.ui.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_ = new utils.ui.ThumbnailGallery();
 

    //
    // Events
    //
    utils.events.EventManager.addEventManager(this, 
					      xiv.SlicerViewMenu.EventType);



    //
    // Appends
    //
    goog.dom.append(this.getElement(), this.ThumbnailGallery_.getElement());
    goog.dom.append(this.getElement(), this.headerText);



    //
    // Set classes
    //
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS);
    this.ThumbnailGallery_.addThumbnailClass(
	xiv.SlicerViewMenu.THUMBNAIL_CLASS);
    this.ThumbnailGallery_.addThumbnailImageClass(
	xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS);
    this.ThumbnailGallery_.addThumbnailTextClass(
	xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS);
}
goog.inherits(xiv.SlicerViewMenu, xiv.Widget);
goog.exportSymbol('xiv.SlicerViewMenu', xiv.SlicerViewMenu);




/**
 * Event types.
 * @enum {string}
 */
xiv.SlicerViewMenu.EventType = {
  VIEWSELECTED: goog.events.getUniqueId('viewselected'),
};




/**
 * The stored mrb properites to derive the elements
 * from.
 *
 * @param {?utils.slicer.mrbProperties}
 * @private
 */
xiv.SlicerViewMenu.prototype.mrbProperties_ = null;




/**
 * As stated.
 *
 * @return {?utils.slicer.mrbProperties} The stored
 *    mrbProperties.
 * @private
 */
xiv.SlicerViewMenu.prototype.getMrbProperties = function(){
    return this.mrbProperties_
}




/**
 * As stated.
 *
 * @return {!utils.ui.ThumbnailGallery}
 * @public
 */
xiv.SlicerViewMenu.prototype.getThumbnailGallery = function(){
    return this.ThumbnailGallery_;
};



/**
 * As stated.
 *
 * @public
 */
xiv.SlicerViewMenu.prototype.showDialog = function() {
    utils.fx.fadeIn(this.getElement(), xiv.ANIM_SLOW);
}



/**
 * As stated.
 *
 * @public
 */
xiv.SlicerViewMenu.prototype.hideDialog = function() {
    utils.fx.fadeOut(this.getElement(), xiv.ANIM_MED);
    goog.dom.removeNode(this.getElement());
}




/**
 * Resets the menu to show information pertaing to the
 * properties in the argument.
 *
 * @param {!utils.slicer.mrbProperties} mrbProperties
 * @public
 */
xiv.SlicerViewMenu.prototype.reset = function (mrbProperties) {

    var scenes = [];
    var mrmlBase = '';
    var displayText = '';
    var thumbnail;


    this.mrbProperties_ = mrbProperties;


    //----------------
    // Make thumbnail from Slicer settings.
    //----------------    
    for (var mrmlFile in this.mrbProperties_){
	mrmlBase = utils.string.basename(mrmlFile);
	scenes = this.mrbProperties_[mrmlFile]['__scenes__'];
	goog.array.forEach(scenes, function(sceneName){
	    // Make the thumbnail
	    displayText = "<b><font size = '2'>" + sceneName + 
		"</font></b><br>";
	    thumbnail = this.ThumbnailGallery_.makeAndInsertThumbnail(
		this.mrbProperties_[mrmlFile][sceneName]['thumbnail'], 
		displayText, mrmlBase);
	    thumbnail._MRML_ = mrmlFile;
	    thumbnail._SCENE_ = sceneName;

	    // Set the click listener for the thumbnail.
	    this.setThumbnailOnClick_(thumbnail);
	}.bind(this))	
    }

    
    
}




/**
 * Calls the 'VIEWSELECTED' event when a Thumbnail is clicked.
 *
 * @param {!utils.ui.Thumbnail} thumbnail R
 * @private
 */
xiv.SlicerViewMenu.prototype.setThumbnailOnClick_ = function (thumbnail) {
    thumbnail['EVENTS'].onEvent('CLICK', function(){
	this['EVENTS'].runEvent('VIEWSELECTED', 
				this.mrbProperties_[thumbnail._MRML_][thumbnail._SCENE_]);
    }.bind(this))
}






xiv.SlicerViewMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ 
    goog.getCssName('xiv-slicerviewmenu');
xiv.SlicerViewMenu.ELEMENT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, '');
xiv.SlicerViewMenu.HEADERTEXT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'headertext');
xiv.SlicerViewMenu.THUMBNAIL_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail');
xiv.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-image');
xiv.SlicerViewMenu.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
xiv.SlicerViewMenu.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnailgallery');
