/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

/**
 * Google closure includes.
 */
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.array');


/**
 * utils includes.
 */
goog.require('utils.convert');
goog.require('utils.dom');
goog.require('utils.style');


/**
 * xiv includes.
 */
goog.require('xiv.ViewBox');
goog.require('xiv.Widget');
goog.require('xiv');




/**
 * 'xiv.Displayer' is a parent class that allows visualization
 * frameworks to display and render images within the xiv.ViewBox.
 * Every xiv.ViewBox object contains a 'xiv.Displayer' which is the element/class
 * that visualizes the imaging information. Currently, the defaulted
 * child class of the displayer is 'XTK', though this hierarchy is 
 * set it place to allow for a number of visualization toolkits to
 * be in use.
 *
 * @param {}
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.Displayer');
xiv.Displayer = function () {
    xiv.Widget.call(this, 'xiv.Displayer');
}
goog.inherits(xiv.Displayer, xiv.Widget);
goog.exportSymbol('xiv.Displayer', xiv.Displayer);




xiv.Displayer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
xiv.Displayer.TABCONTENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.Displayer.CSS_CLASS_PREFIX, 'tabcontent');
xiv.Displayer.TABCONTENT_INFO_CLASS = /**@const*/ goog.getCssName(xiv.Displayer.TABCONTENT_CLASS, 'info');
xiv.Displayer.TABCONTENT_INFO_LABEL_CLASS = /**@const*/ goog.getCssName(xiv.Displayer.TABCONTENT_INFO_CLASS, 'label');
xiv.Displayer.TABCONTENT_INFO_VALUE_CLASS = /**@const*/ goog.getCssName(xiv.Displayer.TABCONTENT_INFO_CLASS, 'value');
xiv.Displayer.TABCONTENT_INFO_HIGHIMPORTANCE_CLASS = /**@const*/ goog.getCssName(xiv.Displayer.TABCONTENT_INFO_CLASS, 'highimportance');




/**
 * Method that determines whether to use the 'data' 
 * argument Object to create Dicom-informational tabs
 * or Slicer-informational tabs.
 *
 * @param {!Object}
 * @return {Element}
 */
xiv.Displayer.prototype.makeInfoTabContents = function (data) {	
    return (data['category'].toLowerCase() === 'slicer') ? this.makeSlicerTab(data) : this.makeDicomTab(data);
}




/**
 * Creates an element pair for display in the 'Info' tabs,
 * though the elements could hypothetically go anywhere.
 * Format is key/value and it requires a parent element to 
 * attach to.  
 * 
 * @param {!Element, !string, !string}
 * @return {Element}
 */
xiv.Displayer.prototype.makeLabelValuePair = function(parent, label, value) {
    var that = this;



    //------------------
    // Make the label element (child of 'parent').
    // Set its innerHTML.
    //------------------
    var lab_ = utils.dom.makeElement("div", parent, "InfoTabDataLabel");
    goog.dom.classes.set(lab_, xiv.Displayer.TABCONTENT_INFO_LABEL_CLASS);
    lab_.innerHTML = label + ":";



    //------------------
    // Make the value element (child of 'label').
    // Set its innerHTML.
    //------------------    
    var val_ = utils.dom.makeElement("div", lab_, "InfoTabDataValue");
    goog.dom.classes.set(val_, xiv.Displayer.TABCONTENT_INFO_VALUE_CLASS);
    val_.innerHTML = value;
    


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
 * @param {!Object}
 * @return {Element}
 */
xiv.Displayer.prototype.makeDicomTab = function(data) {
    var that = this;
    var highImportanceKeys = ["Scan", "Format", "type"]; 
    var sessionInfo = data['sessionInfo'];



    //------------------
    // Internal function to create the 
    // list of information to display
    //------------------ 
    function makeSessionInfoData(sessionInfo) {
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
	contents = utils.dom.makeElement("div", that._element.parentNode, "InfoTabContents");
	goog.dom.classes.set(contents, xiv.Displayer.TABCONTENT_INFO_CLASS);


	//
	// Get usable keys from the 'sessionInfo' argument.
	//
	for (var key in sessionInfo) {
	    if (sessionInfo[key] && sessionInfo[key]['label'] && sessionInfo[key]['value']) {
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

	    currLabel = goog.string.toTitleCase(goog.string.trim(sessionInfo[key]['label']));
	    currValue = sessionInfo[key]['value'];
	    currTop = prevBottom + 6;
	    labelValuePair = that.makeLabelValuePair(contents, currLabel, currValue[0]);
	    
	    //
	    // Add "highImportance" class to high importance keys
	    // (i.e. big bold font)
	    //
	    utils.style.setStyle(labelValuePair, {'top': currTop});
	    goog.array.forEach(highImportanceKeys, function(highImportanceKey){
		if (currLabel.toLowerCase() === highImportanceKey.toLowerCase()) {
		    goog.dom.classes.add(labelValuePair, xiv.Displayer.TABCONTENT_INFO_HIGHIMPORTANCE_CLASS);
		}
	    })

	    //
	    // Calculate the hieghts of the label/value pairs.
	    //
	    currDims = utils.style.getComputedStyle(labelValuePair, ['height', 'top']);
	    prevBottom = 0;
	    for (dim in currDims){ 
		prevBottom += utils.convert.toInt(currDims[dim]); 
	    }
	    counter++;
	})
	

	//
	// We need to get an exact idea of the contents height
	// so we can send that contents into a ScrollGallery, which
	// will know how to scroll through that information.
	//
	utils.style.setStyle(contents, {'height' : prevBottom + 6})
	return contents;
    }

    return makeSessionInfoData(sessionInfo);
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
 * NOTE: There is a fair amount of code copy from 'makeDicomTab' 
 * because this method might potentially change depending on the 
 * demands of the XNAT metadata to display.
 *
 * @param {!Object}
 * @return {Element}
 */
xiv.Displayer.prototype.makeSlicerTab = function(data) {
    var that = this;
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
    contents = utils.dom.makeElement("div", that._element.parentNode, "InfoTabContents");
    goog.dom.classes.set(contents, xiv.Displayer.TABCONTENT_INFO_CLASS);



    //------------------
    // Construct simple key-value pair and add to array to loop
    // through to create the key-value elements.
    //------------------
    keys.push({'label':'Name', 'value': data['Name']})
    


    //------------------
    // Loop through the keys array to create elements.
    //------------------
    goog.array.forEach(keys, function(key){
	//utils.dom.debug("KEY", key)
	currLabel = key['label'];
	currValue = key['value'];
	currTop = prevBottom + 6;
	labelValuePair = that.makeLabelValuePair(contents, currLabel, currValue);
	//utils.dom.debug(labelValuePair);


	//
	// Add "highImportance" class to high importance keys
	// (i.e. big bold font)
	//
	utils.style.setStyle(labelValuePair, {'top': currTop});
	goog.array.forEach(highImportanceKeys, function(highImportanceKey){
	    if (currLabel === highImportanceKey) {
		goog.dom.classes.add(labelValuePair, xiv.Displayer.TABCONTENT_INFO_HIGHIMPORTANCE_CLASS);
	    }
	})


	//
	// Calculate the hieghts of the label/value pairs.
	//
	currDims = utils.style.getComputedStyle(labelValuePair, ['height', 'top']);
	prevBottom = 0;
	for (dim in currDims){ 
	    prevBottom += utils.convert.toInt(currDims[dim]); 
	}
	counter++;
    })
    


    //------------------
    // We need to get an exact idea of the contents height
    // so we can send that contents into a ScrollGallery, which
    // will know how to scroll through that information.
    //------------------
    utils.style.setStyle(contents, {'height' : prevBottom + 6})
    return contents;
  
}
