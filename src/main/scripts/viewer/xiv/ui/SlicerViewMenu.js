/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array');
goog.require('goog.dom');

// utils
goog.require('moka.dom');
goog.require('moka.style');
goog.require('moka.fx');
goog.require('moka.ui.ThumbnailGallery');



/**
 * SlicerViewMenu is a class that allows the user to choose a 
 * specific 'view' when loading a slicer file.  It reveals itself
 * when a user puts a Slicer mrb thumbnail into a ViewBox
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.SlicerViewMenu');
xiv.ui.SlicerViewMenu = function () {

    goog.base(this);
    moka.fx.fadeOut(this.getElement(), 0);



    /**
     * @type {!Element}
     * @private
     */
    this.headerText_ = goog.dom.createDom('div', {
	'id': 'DialogText',
	'class': xiv.ui.SlicerViewMenu.HEADERTEXT_CLASS
    }, '<b> Select View <b>');




    /**
     * @type {?moka.ui.ThumbnailGallery}
     * @private
     */
    this.ThumbnailGallery_ = new moka.ui.ThumbnailGallery();
 

    //
    // Events
    //
    moka.events.EventManager.addEventManager(this, 
					      xiv.ui.SlicerViewMenu.EventType);



    //
    // Appends
    //
    goog.dom.append(this.getElement(), this.ThumbnailGallery_.getElement());
    goog.dom.append(this.getElement(), this.headerText);


    /**
     * The stored mrb properites to derive the elements
     * from.
     *
     * @param {?xiv.slicer.mrbProperties}
     * @private
     */
    this.mrbProperties_ = null;



    //
    // Set classes
    //
    goog.dom.classes.add(this.ThumbnailGallery_.getElement(), 
			 xiv.ui.SlicerViewMenu.THUMBNAILGALLERY_CLASS);
    this.ThumbnailGallery_.addThumbnailClass(
	xiv.ui.SlicerViewMenu.THUMBNAIL_CLASS);
    this.ThumbnailGallery_.addThumbnailImageClass(
	xiv.ui.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS);
    this.ThumbnailGallery_.addThumbnailTextClass(
	xiv.ui.SlicerViewMenu.THUMBNAIL_TEXT_CLASS);
}
goog.inherits(xiv.ui.SlicerViewMenu, moka.ui.Component);
goog.exportSymbol('xiv.ui.SlicerViewMenu', xiv.ui.SlicerViewMenu);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.SlicerViewMenu.ID_PREFIX =  'xiv.ui.SlicerViewMenu';




/**
 * Event types.
 * @enum {string}
 */
xiv.ui.SlicerViewMenu.EventType = {
  VIEWSELECTED: goog.events.getUniqueId('viewselected'),
};









/**
 * As stated.
 *
 * @return {?xiv.slicer.mrbProperties} The stored
 *    mrbProperties.
 * @private
 */
xiv.ui.SlicerViewMenu.prototype.getMrbProperties = function(){
    return this.mrbProperties_
}




/**
 * As stated.
 *
 * @return {!moka.ui.ThumbnailGallery}
 * @public
 */
xiv.ui.SlicerViewMenu.prototype.getThumbnailGallery = function(){
    return this.ThumbnailGallery_;
};



/**
 * As stated.
 *
 * @public
 */
xiv.ui.SlicerViewMenu.prototype.showDialog = function() {
    moka.fx.fadeIn(this.getElement(), xiv.ANIM_SLOW);
}



/**
 * As stated.
 *
 * @public
 */
xiv.ui.SlicerViewMenu.prototype.hideDialog = function() {
    moka.fx.fadeOut(this.getElement(), xiv.ANIM_MED);
    goog.dom.removeNode(this.getElement());
}




/**
 * Resets the menu to show information pertaing to the
 * properties in the argument.
 *
 * @param {!xiv.slicer.mrbProperties} mrbProperties
 * @public
 */
xiv.ui.SlicerViewMenu.prototype.reset = function (mrbProperties) {

    var scenes = [];
    var mrmlBase = '';
    var displayText = '';
    var thumbnail;


    this.mrbProperties_ = mrbProperties;


    //----------------
    // Make thumbnail from Slicer settings.
    //----------------    
    for (var mrmlFile in this.mrbProperties_){
	mrmlBase = moka.string.basename(mrmlFile);
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
 * @param {!moka.ui.Thumbnail} thumbnail R
 * @private
 */
xiv.ui.SlicerViewMenu.prototype.setThumbnailOnClick_ = function (thumbnail) {
    thumbnail['EVENTS'].onEvent('CLICK', function(){
	this['EVENTS'].runEvent('VIEWSELECTED', 
				this.mrbProperties_[thumbnail._MRML_][thumbnail._SCENE_]);
    }.bind(this))
}






xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ 
    goog.getCssName('xiv-slicerviewmenu');
xiv.ui.SlicerViewMenu.ELEMENT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, '');
xiv.ui.SlicerViewMenu.HEADERTEXT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, 'headertext');
xiv.ui.SlicerViewMenu.THUMBNAIL_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail');
xiv.ui.SlicerViewMenu.THUMBNAIL_IMAGE_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-image');
xiv.ui.SlicerViewMenu.THUMBNAIL_TEXT_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnail-displaytext');
xiv.ui.SlicerViewMenu.THUMBNAILGALLERY_CLASS = /**@type {string} @const*/ 
    goog.getCssName(xiv.ui.SlicerViewMenu.CSS_CLASS_PREFIX, 'thumbnailgallery');
