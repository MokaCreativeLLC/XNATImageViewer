/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.string');

// utils
goog.require('moka.ui.Thumbnail');



/**
 * xiv.ui.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 * @constructor
 * @param {gxnat.Viewable} Viewable_ The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {moka.ui.Thumbnail}
 */
goog.provide('xiv.ui.Thumbnail');
xiv.ui.Thumbnail = function (Viewable_) {
    goog.base(this);


    /**
     * @type {gxnat.Viewable}
     * @private
     */    
    this.Viewable_ = Viewable_;

    //window.console.log("THUMB1:", Viewable_, this.Viewable_['thumbnailUrl']);
    //window.console.log("THUMB2:", Viewable_, this.Viewable_['files']);

    this.setImage(this.Viewable_['thumbnailUrl']);
    this.createText_();
    this.createHoverable();
    goog.dom.classes.add(this.getHoverable(), 
			 xiv.ui.Thumbnail.CSS_CLASS_PREFIX);
       
}
goog.inherits(xiv.ui.Thumbnail, moka.ui.Thumbnail);
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
    this.Viewable_['queryUrl'].split("/");

    var headerText =  /**@type {!string}*/ 
    splitArr[splitArr.length - 1].split(".")[0];

    var displayText =  /**@type {!string}*/ '';
    displayText += "<b><font size = '2'>" + headerText  + "</font></b><br>";
    displayText += "Frmt: " + this.Viewable_['sessionInfo']
             ["Format"]['value'].toString()  + "<br>";

    /**
    displayText += 'Type: ' + this.Viewable_['sessionInfo']
             ["type"]['value']   + "</b><br>";
    displayText += 'Expt: ' + this.Viewable_['sessionInfo']['experiments'];
    */

    this.setText(displayText);
}




/**
 * Returns the gxnat.Viewable object associated with the thumbnail.
 * @return {gxnat.Viewable}
 * @public
 */
xiv.ui.Thumbnail.prototype.getViewable = function(){
    return this.Viewable_;
}




