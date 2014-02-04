/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');

// utils
goog.require('utils.dom');
goog.require('utils.style');

// xiv
goog.require('xiv');
goog.require('xiv.Widget');





/**
 * xiv.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 *
 * @constructor
 * @param {utils.xnat.viewableProperties} xnatProperties The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {utils.ui.Thumbnail}
 */
goog.provide('xiv.Thumbnail');
xiv.Thumbnail = function (xnatProperties) {

    utils.ui.Thumbnail.call(this);
    goog.dom.classes.add(this.getElement(), xiv.Thumbnail.CSS_CLASS_PREFIX);



    /**
     * @type {!utils.xnat.viewableProperties}
     * @const
     */    
    this.xnatProperties_ = xnatProperties;



    //------------------
    // Set setImage
    //------------------
    this.setImage(this.xnatProperties_['thumbnailUrl']);



    //------------------
    // Set text
    //------------------
    var headerText = '';
    var displayText = '';
    switch(this.xnatProperties_['category'].toLowerCase())
    {
    case 'dicom':
	headerText = this.xnatProperties_['sessionInfo']["Scan"]['value'];
	break;
    case 'slicer':
	headerText = this.xnatProperties_['Name'].split(".")[0];
	break;
    }
    displayText += "<b><font size = '2'>" + headerText  + "</font></b><br>";
    displayText += "Frmt: " + this.xnatProperties_['sessionInfo']["Format"]['value'].toString()  + "<br>";
    displayText += 'Type: ' + this.xnatProperties_['sessionInfo']["type"]['value']   + "</b><br>";
    displayText += 'Expt: ' + this.xnatProperties_['sessionInfo']['experiments'];
    this.setText(displayText)



    //------------------
    // hoverable_
    //------------------
    this.createHoverable()
    goog.dom.classes.add(this.hoverable_, xiv.Thumbnail.CSS_CLASS_PREFIX);
       
}
goog.inherits(xiv.Thumbnail, utils.ui.Thumbnail);
goog.exportSymbol('xiv.Thumbnail', xiv.Thumbnail);



/**
 * @return {utils.xnat.viewableProperties} The XNAT-related properties object of the thumbnail.
 * @public
 */
xiv.Thumbnail.prototype.getXnatProperties = function(){
    return this.xnatProperties_;
}




xiv.Thumbnail.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-thumbnail');
xiv.Thumbnail.DRAGGING_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'dragging');




