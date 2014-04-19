/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// goog
goog.require('goog.Disposable');
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.dom');

// lib
goog.require('moka.string');
goog.require('moka.dom');
goog.require('moka.array');
goog.require('moka.style');
goog.require('moka.ui.ZippyTree');



/**
 * xiv.vis.XtkController defines the controllers
 * for Xtk objects.  These include sliders, toggle buttons,
 * checkboxes, etc.  The controllers apply to 2D xtk objects
 * (volumes) and 3D xtk objects.
 *
 * @constructor
 * @extends {goog.Disposable}
 */
goog.provide('xiv.vis.XtkController');
xiv.vis.XtkController = function(){

    this.rowElements_;
    this.component_;
    this.componentElement_;
    
}
goog.inherits(xiv.vis.XtkController, goog.Disposable);
goog.exportSymbol('xiv.vis.XtkController', xiv.vis.XtkController);






/**
 * @const 
 * @type {!Array.<string>}
 */
xiv.vis.XtkController.rowSpacing = ['0%','27%','35%', '55%', '88%'];



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.vis.XtkController.ID_PREFIX =  'xiv.vis.XtkController';



/**
 * @type {!string} 
 * @const
*/
xiv.vis.XtkController.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(
    xiv.vis.XtkController.ID_PREFIX.toLowerCase().replace(/\./g,'-'));




/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.ELEMENT_CLASS =  
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, '');


/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.BUTTON_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'button');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.RADIO_BUTTON_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'button-radio');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.LABEL_BUTTON_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'label-button');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.ROW_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'row');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.LABEL_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'label');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.VALUE_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'value');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.SLIDER_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'slider');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.SLIDER_WIDGET_CLASS = 
    goog.getCssName(xiv.vis.XtkController.SLIDER_CLASS, 'widget');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.SLIDER_THUMB_CLASS = 
    goog.getCssName(xiv.vis.XtkController.SLIDER_CLASS, 'thumb');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.SLIDER_TRACK_CLASS = 
    goog.getCssName(xiv.vis.XtkController.SLIDER_CLASS, 'track');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.TWOTHUMBSLIDER_CLASS = 
   goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'twothumbslider');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.TWOTHUMBSLIDER_WIDGET_CLASS = 
    goog.getCssName(xiv.vis.XtkController.TWOTHUMBSLIDER_CLASS, 'widget');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.TWOTHUMBSLIDER_THUMB_CLASS = 
    goog.getCssName(xiv.vis.XtkController.TWOTHUMBSLIDER_CLASS, 'thumb');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.TWOTHUMBSLIDER_TRACK_CLASS = 
    goog.getCssName(xiv.vis.XtkController.TWOTHUMBSLIDER_CLASS, 'track');



/**
 * @type {string} 
 * @const
 */
xiv.vis.XtkController.THUMB_HOVER_CLASS = 
    goog.getCssName(xiv.vis.XtkController.CSS_CLASS_PREFIX, 'thumb-hover');





/**
 * Creates a buttonRow that allows the user to toggle the
 * visibility of an xtkObject in the viewer.
 *
 * @param {!string} fileName
 * @param {Element=} opt_parentbutton
 * @private
 */
xiv.vis.XtkController.createVisible_ = 
function(fileName, opt_parentbutton){


    //------------------
    // Create the button toggle callback: 
    // set the visibility of the object.
    //------------------
    var callback = function(button) {
	this.menuMap_[button.getAttribute('file')]['xtkObj'].visible = 
	    this.menuMap_[button.getAttribute('file')]['visible'].checked;
    }.bind(this)



    //------------------
    // Make the button row used for adjusting 
    // the visibility of the xtkObj.
    //------------------
    var buttonRow = this.createButtonRow("Visible", callback, fileName, 
				   {'checked' : true, 'category' : 'Volume3d'});
    if (opt_parentbutton){
	if (!opt_parentbutton.subbuttons) {opt_parentbutton.subbuttons = []};
	opt_parentbutton.subbuttons.push(buttonRow['button']);
    }
    return buttonRow;
}




/**
 * Creates a sliderRow that allows the user to toggle the
 * threshold of an xtkObject in the viewer.
 *
 * TODO: Threshold adjustment would be here...need to determine a more
 * precise way of defining bounds.  Currently the xtkObk.min/max parameters
 * yield NaN values.
 *
 * @param {!String}
 * @return {Element}
 * @private
 */
xiv.vis.XtkController.createThreshold_ = function(fileName){

    var sliderRow, slider, xtkObj;


    //------------------
    // Define the 'slide' callback: threshold adjust.
    //------------------
    var callback = function(slider){
        this.menuMap_[slider.file]['xtkObj'].lowerThreshold = 
	    slider.getValue();
        this.menuMap_[slider.file]['xtkObj'].upperThreshold = 
	    slider.getValue() + slider.getExtent();
    }.bind(this)

    sliderRow =  this.createSliderRow('Threshold', callback, 
				    fileName, {'type' : 'twothumb'});
    slider = sliderRow['slider']['slider'];
    xtkObj = this.menuMap_[slider.file]['xtkObj'];


    //------------------
    // TODO: Threshold adjustment would be here...we need to determine a more
    // precise way of defining threshold bounds.  Currently the xtkObk.min/max 
    // parameters yield NaN values.
    //------------------
    var max = 100000000;
    slider.setMinimum(0);
    slider.setMaximum(max);
    slider.setExtent(max);
    slider.setValue(0);

    return sliderRow;
	    
}




/**
 * Creates a buttonRow that allows the user to toggle the
 * volume rendering checkbox of a given volume.
 *
 * @param {!String}
 * @return {Element}
 * @private
 */
xiv.vis.XtkController.createVolumeRendering_ = function(fileName){
    var callback = function(button){
        this.menuMap_[button.getAttribute('file')]['xtkObj'].
	    volumeRendering = button.checked;
    }.bind(this)
    return this.createButtonRow("Volume Rendering", callback, fileName)
}




/**
 * Creates a radioButton for the 2D menu that allows the user
 * to toggle the 2D volume shows in the 2D view planes.
 *
 * @param {!string} fileName The filename to associate with the 2D Toggle button.
 * @param {!string} category The category of the 2D toggle button.
 * @return {Element}
 * @private
 */
xiv.vis.XtkController.createToggleButton2D_ = 
function(fileName, category){

    


    //------------------
    // Define the toggle callback.
    //------------------
    var callback = function(button){

	var notTheSameButton, sameCategory;

	//
	// Set the pertaining XtkObject.isSelected parameter to 'true'
	// otherwise it wont load in the XtkPlane.
	//
	this.menuMap_[button.id]['xtkObj'].isSelectedVolume = true;

	//
	// Add the xtkObject to renderers.
	//
	goog.array.forEach(this.onVolumeToggled2D_, function(callback){ 
	    callback(button.id)});

	//
	// Loop through all radio buttons, untoggling all but
	// the one this was just clicked.
	//
	goog.array.forEach(goog.dom.getElementsByClass(
	    xiv.vis.XtkController.RADIO_BUTTON_CLASS), function(otherButton){
	    theSameButton = (otherButton.id === button.id);
	    sameCategory = (otherButton.getAttribute('category') !== undefined)
		    && (otherButton.getAttribute('category') === 
			button.getAttribute('category'));
	 
	    //
	    // Uncheck all other toggles, sets XtkObject.isSelected to 'false'
	    //
	    if (!theSameButton && sameCategory) {
		otherButton.checked =  false;
		this.menuMap_[otherButton.id]['xtkObj'].isSelectedVolume = 
		    otherButton.checked;
	    }
	}.bind(this))
    }.bind(this)



    //------------------
    // Make the button row.
    //------------------
    var bRow = this.createButtonRow(fileName, callback, 'toggle2D', {'type' : 'radio', 'category': 'Volume2D'});
    bRow['button'].checked = this.menuMap_[fileName]['xtkObj'].isSelectedVolume;
    bRow['button'].setAttribute('id', fileName);

    return bRow;
}




/**
 * Creates a buttonRow for the 3D menu that allows the user
 * to display all xtk objects within the category folder.
 *
 * @return {Element}
 * @private
 */
xiv.vis.XtkController.createDisplayAllRow_ = function(){

    var callback = function(button){
	goog.array.forEach(button.subbuttons, function(subbutton){ 
	    subbutton.checked = button.checked;
	    subbutton.onclick();
	})
    }

    return xiv.vis.XtkController.createButtonRow(
	'SHOW ALL', callback, 'DisplayAll', {'checked' : true});
}




/**
 * Creates a sliderRow for the 3D menu that allows the user
 * to adjust the opacity of all the xtk objects within the category
 * folder.
 *
 * @return {Element}
 * @private
 */
xiv.vis.XtkController.createMasterOpacityRow_ = function(){

    //------------------
    // Define the slide callback.
    //------------------
    var callback = function(slider) {
	goog.array.forEach(slider.subsliders, function(subslider){ 
	    subslider.setValue(slider.getValue());})
    }



    //------------------
    // Make the slider row.
    //------------------
    return this.createSliderRow('Master Opacity', callback, 'MasterOpacity');     
}




/**
 * Creates a sliderRow for the 3D menu that allows the user
 * to adjust the opacity of a given xtkObject.
 *
 * @param {!String, Object=}
 * @private
 */
xiv.vis.XtkController.createOpacity_ = 
function(fileName, opt_parentslider){
 

    //------------------
    // Define the slide callback.
    //------------------
    var callback = function(slider){	
	this.menuMap_[slider.file]['xtkObj'].opacity = 
	    this.menuMap_[slider.file]['opacity'].getValue();
    }.bind(this)



    //------------------
    // Make the slider row.
    //------------------
    var opSlider = this.createSliderRow('Opacity', callback, fileName);



    //------------------
    // Adjust subsliders if they exist.
    //------------------
    if (opt_parentslider){
	if (!opt_parentslider.subsliders) {opt_parentslider.subsliders = [];}
	opt_parentslider.subsliders.push(opSlider['slider']['slider']);
    }
    return opSlider;
}




/**
 * Makes a menu row containing an array of elements.
 *
 * @private
 * @param {Array.<Element>} eltArr
 * @param { Array=} opt_lefts
 * @return {Element}
 */
xiv.vis.XtkController.createRow = function (eltArr, opt_lefts) {
    var row = goog.dom.createDom('div', {
	'id' : 'ElementRow_' + goog.string.createUniqueString(),
	'class': xiv.vis.XtkController.ROW_CLASS
    });



    //------------------
    // Loop through each element and space
    // them out accordingly.
    //------------------    
    goog.array.forEach(eltArr, function(elt, i){
	moka.style.setStyle(elt, {
	    'position': 'absolute',
	    'left': ((100 / eltArr.length) * i).toString() + '%',
	})
	//console.log(row, elt);
	goog.dom.append(row, elt);
    })



    //------------------
    // If opt_lefts are provided, reassign the lefts
    // of the elements according to opt_lefts.
    //------------------    
    goog.array.forEach(opt_lefts, function(left, i){
	moka.style.setStyle(eltArr[i], {'left' : opt_lefts[i]});
    })
    

    return row;
}

/**
 * @param {Element=} Element
 * @param {goog.ui.Component=} component
 */
xiv.vis.XtkController = function(element, component) {
    this.element = element;
    this.component = component;
}

/**
 * Constructs the visibility controls of the 3D menu for provided
 * xtkObjects.
 *
 * @private
 * @param {!X.Object} xtkObject
 * @return {ArrayElement}
 */
xiv.vis.XtkController.createGenericControls_3D = 
function(xtkObject){
 
    var fileName = '';
    var displayAll = xiv.vis.XtkController.createDisplayAllRow_();
    //var masterOpacity = xiv.vis.XtkController.createMasterOpacityRow_();


    return [
	displayAll,
	//masterOpacity
    ];


    var opacity, visible;
    


    //------------------
    // Construct the SHOW ALL and 
    // Master Opacity controlers...
    //------------------
    this.menuMap_[folderName3D] = {};
    this.menuMap_[folderName3D]['display all'] = displayAll['button'];
    this.menuMap_[folderName3D]['master opacity'] = 
	masterOpacity['slider']['slider']; 

    this.menu3D_.addContents( 
	this.createRow([displayAll['label'], 
		      displayAll['button'], 
		      masterOpacity['label'], 
		      masterOpacity['slider']['element'],  
		      masterOpacity['value']], 
		     xiv.vis.XtkController.rowSpacing), [folderName3D]);



    //------------------
    // Loop through all of the XtkObjects and construct
    // the subfolder opacity controllers.
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  moka.string.basename(goog.isArray(xtkObject.file) ? 
					 xtkObject.file[0] : xtkObject.file);

	// Special case for annotations
	fileName = xtkObject.caption ? xtkObject.caption : fileName;

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	this.menuMap_[fileName] = {};
	this.menuMap_[fileName]['xtkObj'] = xtkObject;

	visible = this.createVisible_(fileName, displayAll['button'], 
				    displayAll['button']);
	this.menuMap_[fileName]['visible'] = visible['button'];

	opacity = 
	    this.createOpacity_(fileName, masterOpacity['slider']['slider']);
	this.menuMap_[fileName]['opacity'] = opacity['slider']['slider'];


	this.menu3D_.addContents(  
	    this.createRow([visible['label'], visible['button'], 
			  opacity['label'], opacity['slider']['element'], 
			  opacity['value']], 
			  xiv.vis.XtkController.rowSpacing),
	    [folderName3D, fileName]);

    }.bind(this))
}




/**
 * Addes volumes to the controller menu, first creating the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) and then adding volume-specific controls, such as threshold
 * sliders and volumeRendering toggles.
 *
 * @param {X.Object}
 */ 
xiv.vis.XtkController.createControllers_Volume = function(xtkObject){
 
    var fileName = '';
    var folderName3D = 'Volumes';
    var folderName2D = 'Volumes';
    var threshold, volumeRendering, toggle2d;



    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    var gen = xiv.vis.XtkController.createGenericControls_3D(xtkObject);

    window.console.log("GENERIC CONTROLS!", gen);
    return gen;

    

    //------------------
    // Then, construct the volume-specific controllers in the 
    // subfolders of the menu (these include thresholds, volume rendering,
    // and 2D toggle controls).
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  moka.string.basename(
	    goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	if (!this.menuMap_[fileName]) { 
	    this.menuMap_[fileName] = {};
	    this.menuMap_[fileName]['xtkObj'] = xtkObject;
	}

	threshold = this.createThreshold_(fileName);
	volumeRendering = this.createVolumeRendering_(fileName);
	toggle2d = this.createToggleButton2D_(fileName);

	this.menuMap_[fileName]['threshold'] = threshold['slider']['slider'];
	this.menuMap_[fileName]['volume rendering'] = volumeRendering['button'];
	this.menuMap_[fileName]['toggle2d'] = toggle2d['button']; 

	this.menu3D_.addContents( 
	    this.createRow([volumeRendering['label'], 
			  volumeRendering['button'], 
			  threshold['label'],		
			  threshold['slider']['element'], 
			  threshold['value']], 
			 xiv.vis.XtkController.rowSpacing), 
	    [folderName3D, fileName]);
	
	this.menu2D_.addContents(
	    this.createRow([toggle2d['button'] , 
			  toggle2d['label']], ['10px', '8%']), 
	    [folderName2D])
	
    }.bind(this))
}




/**
 * Addes meshes to the controller menu. Only the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) are needed.
 *
 * @param {Array.<X.Object>}
 */ 
xiv.vis.XtkController.addMeshes = function(xtkObjects){
 
    var folderName3D = 'Meshes';



    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    this.createGenericControls_3D(folderName3D, xtkObjects);
}




/**
 * Addes DICOMS to the controller menu. Both the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) are needed and the 
 *
 * @param {Array.<X.Object>}
 */ 
xiv.vis.XtkController.addDicoms = function(xtkObjects){
   
    var folderName3D = 'DICOM';
    


    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    this.createGenericControls_3D(folderName3D, xtkObjects);



    //------------------
    // Then, construct the DICOM-specific controllers 
    // (threshold, volume rendering).
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  moka.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	if (!this.menuMap_[fileName]) { 
	    this.menuMap_[fileName] = {};
	    this.menuMap_[fileName]['xtkObj'] = xtkObject;
	}

	threshold = this.createThreshold_(fileName);
	volumeRendering = this.createVolumeRendering_(fileName);

	this.menuMap_[fileName]['threshold'] = threshold['slider']['slider'];
	this.menuMap_[fileName]['volume rendering'] = volumeRendering['button'];

	this.menu3D_.addContents(this.createRow([volumeRendering['label'], 
		volumeRendering['button'], threshold['label'], 
		threshold['slider']['element'], threshold['value']], 
		xiv.vis.XtkController.rowSpacing ), 
				 [folderName3D, fileName]);		
    }.bind(this))
}




/**
 * Adds annotations to the controller menu. Only the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) are needed.
 *
 * @param {Array.<X.Object>}
 */ 
xiv.vis.XtkController.addAnnotations = function(xtkObjects){
   
    var folderName3D = 'Annotations';
    this.createGenericControls_3D(folderName3D, xtkObjects);
}




/**
 * Adds fibers to the controller menu. These require many
 * customized controllers.
 *
 * @param {Array.<X.object>}
 */
xiv.vis.XtkController.addFiber = function(xtkObjects){
    
    var fileName = '';
    var folderName3D = 'Fibers';
    var displayAll = this.createDisplayAllRow_();
    var masterOpacity = this.createMasterOpacityRow_();
    var opacity, visible;



    //------------------
    // Construct the SHOW ALL and 
    // Master Opacity controlers...
    //------------------    
    this.menuMap_[folderName3D] = {};
    this.menuMap_[folderName3D]['display all'] = displayAll['button'];
    this.menuMap_[folderName3D]['master opacity'] = masterOpacity['slider']; 

    this.menu3D_.addContents(
	this.createRow([displayAll['label'], 
		      displayAll['button'], 
		      masterOpacity['label'], 
		      masterOpacity['slider']['element'],  
		      masterOpacity['value']], 
		     xiv.vis.XtkController.rowSpacing),  [folderName3D]);



    //------------------
    // Construct the fiber-specific controllers.
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  moka.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	opacity = this.createOpacity_(fileName, masterOpacity['slider']);
	visible = this.createVisible_(fileName, displayAll['button']);


	this.menuMap_[fileName] = {};
	this.menuMap_[fileName]['xtkObj'] = xtkObject;
	this.menuMap_[fileName]['opacity'] = opacity['slider'];
	this.menuMap_[fileName]['visible'] = visible['button'];

	//
	// Visible and opacity are the same row.
	//
	this.menu3D_.addContents(
	    this.createRow([visible['label'], visible['button'], 
			  opacity['label'], opacity['slider']['element'], 
			  opacity['value']], 
			 xiv.vis.XtkController.rowSpacing), 
	    [folderName3D, fileName]);
    }.bind(this))
}




/**
 * Utility function for defaulting 
 * to document.body if not a valid element.
 *
 * @param {Element=}
 * @return {Element}
 */
xiv.vis.XtkController.getParent = function(elt){
    return elt ? elt : document.body;
}




/**
 * @param {!String} labelTitle
 * @param {Element=} opt_parent
 * @return {Element}
 */
xiv.vis.XtkController.createLabel = function(labelTitle, opt_parent){
    return goog.dom.createDom('div',{
	'id' : 'Label_' + goog.string.removeAll(labelTitle, ' ')  + '_' +
	    + goog.string.createUniqueString(),
	'class': xiv.vis.XtkController.LABEL_CLASS
    }, labelTitle);
}




/**
 * Makes a number display element for sliders.
 * 
 * @param {Element=}
 * @return {Element}
 */
xiv.vis.XtkController.createNumberDisplay = function(opt_parent){
    var value = goog.dom.createDom('div', {
	'id' : 'NumberDisplay_' + goog.string.createUniqueString(),
	'class': xiv.vis.XtkController.VALUE_CLASS
    });
    goog.dom.append(this.getParent(opt_parent), value);

    return value;
}




/**
 * Makes a slider row for controls.
 *
 * @param {!String, !function, !String, Object=}
 * @return {Element}
 */
xiv.vis.XtkController.createSliderRow = function(labelTitle, callback, fileAttr, opt_args) {

    var slider, sliderElt, sliderPackage, label, value;



    //------------------
    // Make Slider.
    //------------------
    sliderPackage = (opt_args && opt_args['type'] === 'twothumb') ? this.createTwoThumbSlider(document.body, opt_args) :  this.createSlider(document.body, opt_args);
    slider = sliderPackage['slider'];
    sliderElt = sliderPackage['element'];
    slider.file = fileAttr;



    //------------------
    // Make slider label.
    //------------------
    label = this.createLabel(labelTitle, document.body);



    //------------------
    // Make slider value label.
    //------------------
    value = this.createNumberDisplay(document.body);
    value.innerHTML = (slider.getValue) ? slider.getValue().toFixed(2) : 
	(1).toFixed(2);
    if (opt_args && opt_args['type'] === 'twothumb') { 

	// Make a slight adjustment to the two thumb value display.
	value.style.marginTop = '-.5em';
	value.style.height = '2em';
	value.innerHTML = "s: " + slider.getValue() + "<br>e: " +
	    (slider.getValue() + slider.getExtent());
    } 



    //------------------
    // Set callbacks.
    //------------------
    var slideCallback = function(event) {
	//window.console.log("HERE");
	if (opt_args && opt_args['type'] === 'twothumb') { 
	    value.innerHTML = "s: " + slider.getValue() + "<br>e: " + (slider.getValue() + slider.getExtent());
	} else {
	    value.innerHTML = slider.getValue().toFixed(2);
	}
        callback(slider);
    }


    //
    // Need to differentiate between callbacks from the two thumb slider
    // and the slider
    //
    if (slider['EVENTS']){
	slider['EVENTS'].onEvent('SLIDE', slideCallback);

    } else {
	goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, slideCallback);
    }

    return { 'slider': sliderPackage, 'value': value,'label': label}
}




/**
 * Makes a button row for controls.
 *
 * @param {!String, !function, !String, Object=}
 * @return {Element}
 */
xiv.vis.XtkController.createButtonRow = 
function(labelTitle, callback, fileAttr, opt_args){
    var button, label



    //------------------
    // Make Button
    //------------------
    button = (opt_args && opt_args['type'] === 'radio') ? 
	xiv.vis.XtkController.createRadioButton(document.body) : 
	xiv.vis.XtkController.createCheckBox(document.body);
    button.setAttribute('file', fileAttr);



    //------------------
    // Set additional arguments
    //------------------
    if (opt_args !== undefined){
	for (var arg in opt_args) {
	    button.setAttribute(arg, opt_args[arg]);
	}
    }



    //------------------
    // Make Label
    //------------------
    label = xiv.vis.XtkController.createLabel(labelTitle, document.body);
    goog.dom.classes.add(label, xiv.vis.XtkController.LABEL_BUTTON_CLASS);



    //------------------
    // Callbacks
    //------------------
    button.onclick = function(){callback(button)};
    //goog.events.listen(button, goog.events.EventType.CLICK, function(){ callback(button) } )


    return { 'button': button, 'label': label}
}




/**
 * Makes a slider to be added to a sliderRow.
 *
 * @param {Element=} opt_parent
 * @param {Object=} opt_args 
 * @return {Object}
 */
xiv.vis.XtkController.createSlider = function(opt_parent, opt_args) {
    var slider;



    //------------------
    // Make slider.
    //------------------
    slider = new moka.ui.GenericSlider();
    this.getParent(opt_parent).appendChild(slider.getElement());



    //------------------
    // Set slider classes.
    //------------------
    goog.dom.classes.add(slider.getElement(), 
			 xiv.vis.XtkController.SLIDER_WIDGET_CLASS);
    goog.dom.classes.add(slider.getThumb(), 
			 xiv.vis.XtkController.SLIDER_THUMB_CLASS);
    goog.dom.classes.add(slider.getTrack(),
			 xiv.vis.XtkController.SLIDER_TRACK_CLASS);
    slider.setHoverClasses(xiv.vis.XtkController.THUMB_HOVER_CLASS);



    //------------------
    // Other arguments.
    //------------------
    slider.setMinimum(0);
    slider.setMaximum(1);
    slider.setStep(.01);
    slider.setValue(1);



    //------------------
    // Set slider params provided in 'opt_args',
    //------------------    
    if (opt_args) {
	if (opt_args['maximum'])  {slider.setMaximum(opt_args['maximum'])};
	if (opt_args['minimum'])  {slider.setMaximum(opt_args['minimum'])};
	if (opt_args['step'])  {slider.setStep(opt_args['step'])} ;
	if (opt_args['value'])  {slider.setValue(opt_args['value'])};
    }


    return {'slider': slider, 'element': slider.getElement()};
}




/**
 * Makes a two-thumb slider to be added to a sliderRow.  We 
 * refer to goog.ui.TwoThumb slider for this, as opposed to a
 * sibling class of moka.ui.GenericSlider.
 *
 * @param {Element=} opt_parent
 * @param {Object=} opt_args
 * @return {Element}
 */
xiv.vis.XtkController.createTwoThumbSlider = function(opt_parent, opt_args) {

    //------------------
    // Make the slider element.
    //------------------
    var elt = goog.dom.createDom('div', {
	'id' : 'ThresholdSlider_' + goog.string.createUniqueString(),
    });    
    goog.dom.append(this.getParent(opt_parent), elt);



    //------------------
    // Make the track element.
    //------------------
    var track = goog.dom.createDom('div', {
	'id' : 'ThresholdSlider_track_'+ goog.string.createUniqueString(),
	'class' : xiv.vis.XtkController.TWOTHUMBSLIDER_TRACK_CLASS
    });    
    goog.dom.append(elt, track);



    //------------------
    // Make the slider widget.
    //------------------
    var slider = new goog.ui.TwoThumbSlider;
    slider.decorate(elt);



    //------------------
    // NOTE: this is here because google closure changes the 
    // CSS when we apply the decorate method to 'elt'.
    //------------------    
    goog.dom.classes.add(elt, xiv.vis.XtkController.TWOTHUMBSLIDER_WIDGET_CLASS);



    //-------------------
    // We need to change the CSS of all of the slider's child
    // elements.
    //-------------------
    goog.array.forEach(goog.dom.getChildren(slider.getElement()), 
		       function(child) {
	if (child.className === 'goog-twothumbslider-value-thumb' || 
	    child.className === 'goog-twothumbslider-extent-thumb') {
	    goog.dom.classes.add(child, 
			xiv.vis.XtkController.TWOTHUMBSLIDER_THUMB_CLASS);
	    moka.style.setHoverClass(child,  
		xiv.vis.XtkController.THUMB_HOVER_CLASS, 
				      function(applyHover, removeHover){

		//
		// set Dragging class
		//
		moka.ui.GenericSlider.superClass_.addEventListener.call(
		    slider, goog.ui.SliderBase.EventType.DRAG_START, 
		    function (e) {

		    // Suspend mouseout listener when dragging.
		    goog.events.unlisten(child, 
			goog.events.EventType.MOUSEOUT, removeHover);
		    goog.dom.classes.add(child, 
			xiv.vis.XtkController.THUMB_HOVER_CLASS);
		});	  
		moka.ui.GenericSlider.superClass_.addEventListener.call(
		    slider, goog.ui.SliderBase.EventType.DRAG_END, 
		    function (e) {

		    //
		    // Reapply mouseout listener when done dragging.
		    //
		    goog.events.listen(child, goog.events.EventType.MOUSEOUT, 
				       removeHover);
		    goog.dom.classes.remove(child, 
				xiv.vis.XtkController.THUMB_HOVER_CLASS);
		});
	    });
	}		
    })



    //------------------
    // Set slider params provided in 'opt_args',
    //------------------     
    if (opt_args) {
	if (opt_args['maximum'])  {slider.setMaximum(opt_args['maximum'])};
	if (opt_args['minimum'])  {slider.setMaximum(opt_args['minimum'])};
	if (opt_args['step'])  {slider.setStep(opt_args['step'])} ;
	if (opt_args['value'])  {slider.setValue(opt_args['value'])};
	if (opt_args['extent'])  {slider.setExtent(opt_args['extent'])};
    }
    


    return {'slider': slider, 'element': elt};	       
}




/**
 * @return {!Element}
 */
xiv.vis.XtkController.createCheckBox = function(opt_parent){
    return goog.dom.createDom('input', { 
	'id': 'CheckBox_'+ goog.string.createUniqueString(),
	'class': xiv.vis.XtkController.BUTTON_CLASS + ',' + 
	    xiv.vis.XtkController.CHECKBOX_CLASS
    });  
}




/**
 * @return {!Element}
 */
xiv.vis.XtkController.createRadioButton = function() {
    return goog.dom.createDom('input', {
	'id': xiv.vis.XtkController.BUTTON_CLASS + 
	    goog.string.createUniqueString(),
	'class': xiv.vis.XtkController.BUTTON_CLASS + ' ' 
	    + xiv.vis.XtkController.RADIO_BUTTON_CLASS
    });
}





