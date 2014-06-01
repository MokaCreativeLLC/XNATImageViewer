/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.string');

// utils
goog.require('nrg.ui.Thumbnail');



/**
 * xiv.ui.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 * @constructor
 * @param {gxnat.vis.ViewableTree} Viewable_ The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {nrg.ui.Thumbnail}
 */
goog.provide('xiv.ui.Thumbnail');
xiv.ui.Thumbnail = function (Viewable_) {
    goog.base(this);

    //
    // Default silhouette
    //
    this.setBrokenThumbnailUrl(serverRoot +
	'/images/viewer/xiv/ui/Thumbnail/silhouette.png', 
			       this.updateHoverable.bind(this))


    /**
     * @type {gxnat.vis.ViewableTree}
     * @private
     */    
    this.ViewableTree_ = Viewable_;

    this.createText_();
    this.createHoverable();
}
goog.inherits(xiv.ui.Thumbnail, nrg.ui.Thumbnail);
goog.exportSymbol('xiv.ui.Thumbnail', xiv.ui.Thumbnail);



/**
 * @type {!string} 
 * @const
*/
xiv.ui.Thumbnail.ID_PREFIX =  'xiv.ui.Thumbnail';




/**
 * @enum {string}
 * @public
 */
xiv.ui.Thumbnail.CSS_SUFFIX = {};




/**
 * @inheritDoc
 */
xiv.ui.Thumbnail.prototype.updateHoverable = function(){
    //window.console.log('update hoverable');
    var img = goog.dom.getElementsByTagNameAndClass('img', 
						    nrg.ui.Thumbnail.CSS.IMAGE, 
						    this.getHoverable());
    img = img[0];
    img.src = this.getImage().src;
}




/**
 * @inheritDoc
 */
xiv.ui.Thumbnail.prototype.createHoverable = function(){
    goog.base(this, 'createHoverable');
    goog.dom.classes.add(this.getHoverable(), 
			 xiv.ui.Thumbnail.CSS_CLASS_PREFIX);
}



/**
 * Creates the text associated with the thumbnail.
 * @private
 */
xiv.ui.Thumbnail.prototype.createText_ = function(){
    //window.console.log(this.ViewableTree_);

    //
    // Derive the header text
    //
    var headerText = '';


    //
    // Checking the sessionInfo property (most ideal option) to make header.
    //
    var treeSessionInfo = this.ViewableTree_.getSessionInfo();
    if (goog.isDefAndNotNull(treeSessionInfo['Scan ID'])){
	headerText += treeSessionInfo['Scan ID'];
    }

    //
    // Otherwise, by splitting the URL (less ideal option).
    //
    else if (goog.isDefAndNotNull(this.ViewableTree_.getQueryUrl())){
	var splitArr = this.ViewableTree_.getQueryUrl().split("/");
	headerText += splitArr[splitArr.length - 1].split(".")[0];
    }


    //
    // Construct display text
    //
    var displayText =  '';
    displayText += "<b><font size = '3'>" + headerText  + "</font></b><br>";

    //
    // Other metadata to display
    //
    var metaDisplayKeys = ['Total Frames', 'Scan Type', 'Orientation'];
    goog.array.forEach(metaDisplayKeys, function(key){
	if (goog.isDefAndNotNull(treeSessionInfo[key])){
	    displayText += "<font size = '1.5'>" + key + ": " + 
		treeSessionInfo[key]  + "<br>";
	}
    }.bind(this))

    //
    // Set the text
    //
    this.setText(displayText);
}




/**
 * Returns the gxnat.vis.ViewableTree object associated with the thumbnail.
 * @return {gxnat.vis.ViewableTree}
 * @public
 */
xiv.ui.Thumbnail.prototype.getViewable = function(){
    return this.ViewableTree_;
}



/**
 * @inheritDoc
 */
xiv.ui.Thumbnail.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    this.ViewableTree_.dispose();
    delete this.ViewableTree_;
}


goog.exportSymbol('xiv.ui.Thumbnail.ID_PREFIX', xiv.ui.Thumbnail.ID_PREFIX);
goog.exportSymbol('xiv.ui.Thumbnail.CSS_SUFFIX', xiv.ui.Thumbnail.CSS_SUFFIX);

goog.exportSymbol('xiv.ui.Thumbnail.prototype.updateHoverable',
	xiv.ui.Thumbnail.prototype.updateHoverable);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.createHoverable',
	xiv.ui.Thumbnail.prototype.createHoverable);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.getViewable',
	xiv.ui.Thumbnail.prototype.getViewable);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.disposeInternal',
	xiv.ui.Thumbnail.prototype.disposeInternal);
