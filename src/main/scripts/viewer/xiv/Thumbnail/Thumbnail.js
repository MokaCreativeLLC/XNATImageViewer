/** 
* @author sunilk@mokacreativellc.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/

/**
 * Google closure includes
 */
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');


/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.style');

/**
 * viewer-widget includes
 */
goog.require('xiv');
goog.require('xiv.Widget');




/**
 * xiv.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 *
 * @constructor
 * @param {Object}
 * @extends {utils.ui.Thumbnail}
 */
goog.provide('xiv.Thumbnail');
xiv.Thumbnail = function (properties) {

    var that = this;
    var eltId = '';
    
    
    utils.ui.Thumbnail.call(this);
    this._element.setAttribute('id',  'xiv.Thumbnail' + utils.dom.uniqueId());
    this._hoverClone.setAttribute('id', 'xiv.Thumbnail.hoverClone' + utils.dom.uniqueId());
    this._hoverClone.setAttribute('thumbnailid', this._element.getAttribute('id'));
    goog.dom.classes.add(this._element, xiv.Thumbnail.CSS_CLASS_PREFIX);
    //goog.dom.classes.add(this._hoverClone, xiv.Thumbnail.CSS_CLASS_PREFIX);



    //------------------
    // Properties object
    //------------------    
    this._properties = properties;



    //------------------
    // Set setImage
    //------------------
    this.setImage(this._properties['thumbnailUrl']);



    //------------------
    // Set _displayText
    //------------------
    var headerText = '';
    var displayText = '';
    switch(this._properties['category'].toLowerCase())
    {
    case 'dicom':
	headerText = this._properties['sessionInfo']["Scan"]['value'];
	break;
    case 'slicer':
	headerText = this._properties['Name'].split(".")[0];
	break;
    }
    displayText += "<b><font size = '2'>" + headerText  + "</font></b><br>";
    displayText += "Frmt: " + this._properties['sessionInfo']["Format"]['value'].toString()  + "<br>";
    displayText += 'Type: ' + this._properties['sessionInfo']["type"]['value']   + "</b><br>";
    displayText += 'Expt: ' + this._properties['sessionInfo']['experiments'];
    this.setDisplayText(displayText)



    //------------------
    // Set setHoverCloneParen
    //------------------
    this.setHoverCloneParent(xiv._Modal._element);    
}
goog.inherits(xiv.Thumbnail, utils.ui.Thumbnail);
goog.exportSymbol('xiv.Thumbnail', xiv.Thumbnail);


xiv.Thumbnail.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-thumbnail');
xiv.Thumbnail.DRAGGING_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Thumbnail.CSS_CLASS_PREFIX, 'dragging');


/**
 * @type {?Object}
 * @const
 */
xiv.Thumbnail.prototype._properties = null;




/**
* @return {Array.<string>}
*/
xiv.Thumbnail.prototype.getFiles = function() {
    return this._properties.files;	
}




/**
 * Clones the thumbnail to create a draggable element.
 *
 * @param {Element}
 */
xiv.Thumbnail.prototype.createDragElement = function(sourceEl) {
    var elt =  goog.dom.createDom('div', 'foo', 'Custom drag element');
    utils.style.setStyle(elt, {
	'color':  "rgba(255,0,0,1)",
	'background-color':  "rgba(255,200,0,1)",
	'width':  200,
	'height':  200
    });
};




