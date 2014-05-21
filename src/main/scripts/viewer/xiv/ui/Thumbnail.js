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


    /**
     * @type {gxnat.vis.ViewableTree}
     * @private
     */    
    this.ViewableTree_ = Viewable_;

    //window.console.log("THUMB1:", Viewable_, this.ViewableTree_['thumbnailUrl']);
    //window.console.log("THUMB2:", Viewable_, this.ViewableTree_['files']);

    //this.setImage(this.ViewableTree_.getThumbnailUrl());
    this.createText_();
    this.createHoverable();
    goog.dom.classes.add(this.getHoverable(), 
			 xiv.ui.Thumbnail.CSS_CLASS_PREFIX);
       
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
 * Creates the text associated with the thumbnail.
 * @private
 */
xiv.ui.Thumbnail.prototype.createText_ = function(){

    var splitArr = /**@type {!Array.string}*/ 
    this.ViewableTree_.getQueryUrl().split("/");

    var headerText =  /**@type {!string}*/ 
    splitArr[splitArr.length - 1].split(".")[0];

    var displayText =  /**@type {!string}*/ '';
    displayText += "<b><font size = '2'>" + headerText  + "</font></b><br>";

    if (this.ViewableTree_.hasOwnProperty('getSessionInfo')){
	displayText += "Frmt: " + this.ViewableTree_.getSessionInfo()
        ["Format"]['value'].toString()  + "<br>";
    }


    /**
    displayText += 'Type: ' + this.ViewableTree_['sessionInfo']
             ["type"]['value']   + "</b><br>";
    displayText += 'Expt: ' + this.ViewableTree_['sessionInfo']['experiments'];
    */

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
