/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

// goog
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.array');

// utils
goog.require('nrg.convert');
goog.require('nrg.style');

// xiv
goog.require('nrg.ui.Component');





/**
 * 'xiv.ui.InfoWidget' is a parent class that allows visualization
 * frameworks to display and render images within the xiv.ui.ViewBox.
 * Every xiv.ui.ViewBox object contains a 'xiv.ui.InfoWidget' which is the
 * element/class that visualizes the imaging information. Currently, the 
 * defaulted child class of the displayer is 'XTK', though this hierarchy is 
 * set it place to allow for a number of visualization toolkits to
 * be in use.
 *
 * @constructor
 * @extends {nrg.ui.Overlay}
 */
goog.provide('xiv.ui.InfoWidget');
xiv.ui.InfoWidget = function () {
    goog.base(this);
}
goog.inherits(xiv.ui.InfoWidget, nrg.ui.Overlay);
goog.exportSymbol('xiv.ui.InfoWidget', xiv.ui.InfoWidget);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.InfoWidget.prototype.ID_PREFIX =  'xiv.ui.InfoWidget';



/**
 * @enum {string}  
 * @const
 */ 
xiv.ui.InfoWidget.CSS_PREFIX = {}






/**
 * Creates an element pair for display in the 'Info' tabs,
 * though the elements could hypothetically go anywhere.
 * Format is key/value and it requires a parent element to 
 * attach to.  
 * 
 * @private
 * @param {!Element} parent The parent element.
 * @param {!string} label The label text.
 * @param {!string} value The value of the label text.
 * @return {Element} The label-value pair as a DOM element.
 */
xiv.ui.InfoWidget.prototype.createLabelValuePair_ = 
function(parent, label, value) {


    var lab_ = goog.dom.createDom("div", {
	'id': 'InfoTabDataLabel',
	'class': xiv.ui.InfoWidget.TABCONTENT_INFO_LABEL_CLASS
    }, (label + ":"));
    goog.dom.append(parent, lab_);
   
    var val_ = goog.dom.createDom("div", {
	'id': 'InfoTabDataValue',
	'class': xiv.ui.InfoWidget.TABCONTENT_INFO_VALUE_CLASS
    }, value);
    goog.dom.append(lab_, val_)
    


    //------------------
    // Return label Element.
    //------------------ 
    return lab_;
}




/**
 * Constructs a series of label-value pairs
 * displaying the relevant XNAT metadata related to 
 * viewing DICOMs.
 *
 * @private
 * @param {!gxnat.viewableProperties} xnatProperties The properties
 *    to derive the tab from.
 * @return {!Element} The tab as a div element.
 */
xiv.ui.InfoWidget.prototype.createDicomTab_ = function(xnatProperties) {
    
    var highImportanceKeys = ["Scan", "Format", "type"]; 
    var sessionInfo = xnatProperties.getSessionInfo() ;

    var prevBottom = 0;
    var counter = 0;
    var currTop = 0;
    var currLabel, currValue;
    var labelValuePair = undefined;
    var contents = undefined;
    var keys = [];
    var reorderedKeys = [];
    var currDims;


    //
    // Create a contents element as a parent
    // of all the other elements.
    //
    contents = goog.dom.createDom("div", {
	'id': 'InfoTabContents',
	'class': xiv.ui.InfoWidget.TABCONTENT_INFO_CLASS
    });
    goog.dom.append(this.getElement().parentNode, contents);


    //
    // Get usable keys from the 'sessionInfo' argument.
    //
    for (var key in sessionInfo) {
	if (sessionInfo[key] && sessionInfo[key]['label'] && 
	    sessionInfo[key]['value']) {
	    keys.push(key);
	}
    }


    //
    // Splice highImportanceKeys from keys, then concat both
    // to create reorderedKeys.
    //
    goog.array.forEach(highImportanceKeys, function(hiKey){
	keys.splice(keys.indexOf(hiKey), 1);
    })
    reorderedKeys = highImportanceKeys.concat(keys)
    

    //
    // Loop through all and create pairs, heights
    //
    goog.array.forEach(reorderedKeys, function(key){

	currLabel = goog.string.toTitleCase(goog.string.trim(
	    sessionInfo[key]['label']));
	currValue = sessionInfo[key]['value'];
	currTop = prevBottom + 6;
	labelValuePair = this.createLabelValuePair_(contents, 
						    currLabel, currValue[0]);
	
	//
	// Add "highImportance" class to high importance keys
	// (i.e. big bold font)
	//
	nrg.style.setStyle(labelValuePair, {'top': currTop});
	goog.array.forEach(highImportanceKeys, function(highImportanceKey){
	    if (currLabel.toLowerCase() === highImportanceKey.toLowerCase()) {
		goog.dom.classes.add(labelValuePair, 
		xiv.ui.InfoWidget.TABCONTENT_INFO_HIGHIMPORTANCE_CLASS);
	    }
	})

	//
	// Calculate the hieghts of the label/value pairs.
	//
	currDims = nrg.style.getComputedStyle(labelValuePair, 
						['height', 'top']);
	prevBottom = 0;
	for (dim in currDims){ 
	    prevBottom += nrg.convert.toInt(currDims[dim]); 
	}
	counter++;
    }.bind(this))
    

    //
    // We need to get an exact idea of the contents height
    // so we can send that contents into a ScrollGallery, which
    // will know how to scroll through that information.
    //
    nrg.style.setStyle(contents, {'height' : prevBottom + 6})
    return contents;
   
}




/**
 * Constructs a series of label-value pairs
 * displaying the relevant XNAT metadata related to 
 * viewing Slicer scenes.  Simpler in comparison to
 * DICOMS because the metadata content is considerably less.
 *
 * TODO: Consider redesigning to acommodate for metatdata options
 * growing more complex.
 *
 * NOTE: There is a fair amount of code copy from 'createDicomTab' 
 * because this method might potentially change depending on the 
 * demands of the XNAT metadata to display.
 *
 * @private
 * @param {!gxnat.viewableProperties} xnatProperties The properties
 *    to derive the tab from.
 * @return {!Element} The tab as a div element.
 */
xiv.ui.InfoWidget.prototype.createSlicerTab_ = function(xnatProperties) {
    var highImportanceKeys = ["Name"]; 
    var prevBottom = 0;
    var counter = 0;
    var currTop = 0;
    var currLabel, currValue;
    var labelValuePair = undefined;
    var contents = undefined;
    var keys = [];
    var currDims;



    //------------------
    // Create a contents element as a parent
    // of all the other elements.
    //------------------
    contents = goog.dom.createDom("div", {
	'id': 'InfoTabContents',
	'class': xiv.ui.InfoWidget.TABCONTENT_INFO_CLASS
    });
    goog.dom.append(this.getElement().parentNode, contents);



    //------------------
    // Construct simple key-value pair and add to array to loop
    // through to create the key-value elements.
    //------------------
    keys.push({'label':'Name', 'value': xnatProperties['Name']})
    


    //------------------
    // Loop through the keys array to create elements.
    //------------------
    goog.array.forEach(keys, function(key){
	//nrg.dom.debug("KEY", key)
	currLabel = key['label'];
	currValue = key['value'];
	currTop = prevBottom + 6;
	labelValuePair = this.createLabelValuePair_(contents, 
						    currLabel, currValue);
	//nrg.dom.debug(labelValuePair);


	//
	// Add "highImportance" class to high importance keys
	// (i.e. big bold font)
	//
	nrg.style.setStyle(labelValuePair, {'top': currTop});
	goog.array.forEach(highImportanceKeys, function(highImportanceKey){
	    if (currLabel === highImportanceKey) {
		goog.dom.classes.add(labelValuePair, 
		xiv.ui.InfoWidget.TABCONTENT_INFO_HIGHIMPORTANCE_CLASS);
	    }
	})


	//
	// Calculate the hieghts of the label/value pairs.
	//
	currDims = nrg.style.getComputedStyle(labelValuePair, 
					      ['height', 'top']);
	prevBottom = 0;
	for (dim in currDims){ 
	    prevBottom += nrg.convert.toInt(currDims[dim]); 
	}
	counter++;
    }.bind(this))
    


    //------------------
    // We need to get an exact idea of the contents height
    // so we can send that contents into a ScrollGallery, which
    // will know how to scroll through that information.
    //------------------
    nrg.style.setStyle(contents, {'height' : prevBottom + 6})
    return contents;
  
}




