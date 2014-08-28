/** 
* @author kumar.sunil.p@gmail.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/
goog.provide('xiv.ui.Thumbnail');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.array');

// nrg
goog.require('nrg.ui.Thumbnail');

// gxnat
goog.require('gxnat.vis.ViewableTree');

//-----------



/**
 * xiv.ui.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 * @constructor
 * @param {gxnat.vis.ViewableTree} Viewable_ The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {nrg.ui.Thumbnail}
 */
xiv.ui.Thumbnail = function (Viewable_) {
    goog.base(this);

    //
    // Default silhouette
    //
    this.setBrokenThumbnailUrl(serverRoot +
	'/images/viewer/xiv/ui/Thumbnail/silhouette.png')


    /**
     * @type {gxnat.vis.ViewableTree}
     * @private
     */    
    this.ViewableTree_ = Viewable_;

    this.createText_();
}
goog.inherits(xiv.ui.Thumbnail, nrg.ui.Thumbnail);
goog.exportSymbol('xiv.ui.Thumbnail', xiv.ui.Thumbnail);



/**
 * @type {!string} 
 * @expose
*/
xiv.ui.Thumbnail.ID_PREFIX =  'xiv.ui.Thumbnail';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.Thumbnail.CSS_SUFFIX = {};




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

    //window.console.log("TREE", treeSessionInfo);

    if (goog.isDefAndNotNull(treeSessionInfo['Scan ID'])){
	headerText += treeSessionInfo['Scan ID'];
    } 
    else if (goog.isDefAndNotNull(treeSessionInfo['Name'])){
	headerText = treeSessionInfo['Name'];
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
goog.exportSymbol('xiv.ui.Thumbnail.prototype.getViewable',
	xiv.ui.Thumbnail.prototype.getViewable);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.disposeInternal',
	xiv.ui.Thumbnail.prototype.disposeInternal);
