/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.string');

// utils
goog.require('utils.ui.Thumbnail');



/**
 * xiv.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 * @constructor
 * @param {utils.xnat.Viewable} Viewable_ The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {utils.ui.Thumbnail}
 */
goog.provide('xiv.Thumbnail');
xiv.Thumbnail = function (Viewable_) {
    goog.base(this);


    /**
     * @type {utils.xnat.Viewable}
     */    
    this.Viewable_ = Viewable_;


    //window.console.log("THUMB1:", Viewable_, this.Viewable_['thumbnailUrl']);
    //window.console.log("THUMB2:", Viewable_, this.Viewable_['files']);


    this.setImage(this.Viewable_['thumbnailUrl']);
    this.createText_();
    this.createHoverable()
    goog.dom.classes.add(this.hoverable_, xiv.Thumbnail.CSS_CLASS_PREFIX);
       
}
goog.inherits(xiv.Thumbnail, utils.ui.Thumbnail);
goog.exportSymbol('xiv.Thumbnail', xiv.Thumbnail);



/**
 * @type {!string} 
 * @const
*/
xiv.Thumbnail.ID_PREFIX =  'xiv.Thumbnail';



/**
 * @type {!string} 
 * @const
*/
xiv.Thumbnail.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(utils.string.getLettersOnly(
    xiv.Thumbnail.ID_PREFIX));



/**
 * @type {!string} 
 * @const
 */
xiv.Thumbnail.DRAGGING_CLASS = 
    goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'dragging');



/**
 * Creates the text associated with the thumbnail.
 * @private
 */
xiv.Thumbnail.prototype.createText_ = function(){

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
 * Returns the utils.xnat.Viewable object associated with the thumbnail.
 * @return {utils.xnat.Viewable}
 * @public
 */
xiv.Thumbnail.prototype.getViewable = function(){
    return this.Viewable_;
}




