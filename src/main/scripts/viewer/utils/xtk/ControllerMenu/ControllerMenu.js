/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// goog
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.dom');

// utils
goog.require('utils.string');
goog.require('utils.xtk');
goog.require('utils.dom');
goog.require('utils.array');
goog.require('utils.style');
goog.require('utils.ui.ZippyTree');




/**
 * utils.xtk.ControllerMenu defines the controllers
 * for Xtk objects.  These include sliders, toggle buttons,
 * checkboxes, etc.  The controllers apply to 2D xtk objects
 * (volumes) and 3D xtk objects.
 *
 * @constructor
 */
goog.provide('utils.xtk.ControllerMenu');
utils.xtk.ControllerMenu = function() {

    /**
     * @private
     * @type {!utils.ui.ZippyTree}
     */ 
    this.menu2D_ = new utils.ui.ZippyTree();


    /**
     * @private
     * @type {!utils.ui.ZippyTree}
     */ 
    this.menu3D_ = new utils.ui.ZippyTree();


    /**
     * @private
     * @type {!Object}
     */ 
    this.menuMap_ = {};


    /**
     * @private
     * @type {!Array.function}
     */ 
    this.onVolumeToggled2D_ = [];
}
goog.exportSymbol('utils.xtk.ControllerMenu', utils.xtk.ControllerMenu);



/**
 * @const 
 * @type {!Array.<string>}
 */
utils.xtk.ControllerMenu.rowSpacing = ['0%','27%','35%', '55%', '88%'];


utils.xtk.ControllerMenu.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xtkutils-controllermenu');
utils.xtk.ControllerMenu.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, '');
utils.xtk.ControllerMenu.BUTTON_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'button');
utils.xtk.ControllerMenu.RADIO_BUTTON_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'button-radio');
utils.xtk.ControllerMenu.LABEL_BUTTON_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'label-button');
utils.xtk.ControllerMenu.ROW_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'row');
utils.xtk.ControllerMenu.LABEL_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'label');
utils.xtk.ControllerMenu.VALUE_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'value');
utils.xtk.ControllerMenu.SLIDER_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'slider');
utils.xtk.ControllerMenu.SLIDER_WIDGET_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.SLIDER_CLASS, 'widget');
utils.xtk.ControllerMenu.SLIDER_THUMB_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.SLIDER_CLASS, 'thumb');
utils.xtk.ControllerMenu.SLIDER_TRACK_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.SLIDER_CLASS, 'track');
utils.xtk.ControllerMenu.TWOTHUMBSLIDER_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'twothumbslider');
utils.xtk.ControllerMenu.TWOTHUMBSLIDER_WIDGET_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.TWOTHUMBSLIDER_CLASS, 'widget');
utils.xtk.ControllerMenu.TWOTHUMBSLIDER_THUMB_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.TWOTHUMBSLIDER_CLASS, 'thumb');
utils.xtk.ControllerMenu.TWOTHUMBSLIDER_TRACK_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.TWOTHUMBSLIDER_CLASS, 'track');
utils.xtk.ControllerMenu.THUMB_HOVER_CLASS = /** @const @type {String} */ goog.getCssName(utils.xtk.ControllerMenu.CSS_CLASS_PREFIX, 'thumb-hover');




/**
 * @return {Object.<string, Object | null>}
 * @public
 */
utils.xtk.ControllerMenu.prototype.getMenuAsObject = function(){

    this.menu2D_.contractAll();
    this.menu3D_.contractAll();

    return {
	'2D' : this.menu2D_.isEmpty() ? null : this.menu2D_.getElement(),
	'3D' : this.menu3D_.isEmpty() ? null : this.menu3D_.getElement(),
    }
}



/**
 * @return {!Object}
 * @public
 */
utils.xtk.ControllerMenu.prototype.__defineGetter__('MenuMap', function(){
    return this.menuMap_
})



/**
 * @return {!Object}
 * @public
 */
utils.xtk.ControllerMenu.prototype.__defineGetter__('Menu2D', function(){
    return this.menu2D_
})



/**
 * @return {!Object}
 * @public
 */
utils.xtk.ControllerMenu.prototype.__defineGetter__('Menu3D', function(){
    return this.menu3D_
})



/**
 * @param {!function}
 * @public
 */
utils.xtk.ControllerMenu.prototype.__defineSetter__('onVolumeToggled2D', function(callback){
    return this.onVolumeToggled2D_.push(callback)
})




/**
 * Constructs the controller menu -- main function.
 *
 * @param {Object.<string, Array.<X.object>>}
 */
utils.xtk.ControllerMenu.prototype.makeControllerMenu = function(viewables) {

    //------------------
    // DICOMS
    //------------------
    if (viewables['dicoms'].length) {
	this.addDicoms(viewables['dicoms']);
    } 



    //------------------
    // Volumes
    //------------------
    if (viewables['volumes'].length) {
	this.addVolumes(viewables['volumes']);
    } 



    //------------------
    // Meshes 
    //------------------
    if (viewables['meshes'].length){
	this.addMeshes(viewables['meshes']);
    } 



    //------------------
    // Fiber bundles
    //------------------
    if (viewables['fibers'].length){
	this.addFiber(viewables['fibers']);
    }



    //------------------
    // Annotations
    //------------------
    if (viewables['annotations'] && viewables['annotations'].length > 0) {
	this.addAnnotations(viewables['annotations']);
    } 
}





/**
 * Creates a buttonRow that allows the user to toggle the
 * visibility of an xtkObject in the viewer.
 *
 * @param {!string} fileName
 * @param {Element=} opt_parentbutton
 * @private
 */
utils.xtk.ControllerMenu.prototype.makeVisible_ = function(fileName, opt_parentbutton){


    //------------------
    // Create the button toggle callback: 
    // set the visibility of the object.
    //------------------
    var callback = function(button) {
	this.menuMap_[button.getAttribute('file')]['xtkObj'].visible = this.menuMap_[button.getAttribute('file')]['visible'].checked;
    }.bind(this)



    //------------------
    // Make the button row used for adjusting 
    // the visibility of the xtkObj.
    //------------------
    var buttonRow = this.makeButtonRow("Visible", callback, fileName, {'checked' : true, 'category' : 'Volume3d'});
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
utils.xtk.ControllerMenu.prototype.makeThreshold_ = function(fileName){

    var sliderRow, slider, xtkObj;


    //------------------
    // Define the 'slide' callback: threshold adjust.
    //------------------
    var callback = function(slider){
        this.menuMap_[slider.file]['xtkObj'].lowerThreshold = slider.getValue();
        this.menuMap_[slider.file]['xtkObj'].upperThreshold = slider.getValue() + slider.getExtent();
    }.bind(this)

    sliderRow =  this.makeSliderRow('Threshold', callback, fileName, {'type' : 'twothumb'});
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
utils.xtk.ControllerMenu.prototype.makeVolumeRendering_ = function(fileName){
    var callback = function(button){
        this.menuMap_[button.getAttribute('file')]['xtkObj'].volumeRendering = button.checked;
    }.bind(this)
    return this.makeButtonRow("Volume Rendering", callback, fileName)
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
utils.xtk.ControllerMenu.prototype.makeToggleButton2D_ = function(fileName, category){

    


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
	goog.array.forEach(this.onVolumeToggled2D_, function(callback){ callback(button.id)});

	//
	// Loop through all radio buttons, untoggling all but
	// the one this was just clicked.
	//
	goog.array.forEach(goog.dom.getElementsByClass(utils.xtk.ControllerMenu.RADIO_BUTTON_CLASS), function(otherButton){
	    theSameButton = (otherButton.id === button.id);
	    sameCategory = (otherButton.getAttribute('category') !== undefined) && (otherButton.getAttribute('category') === button.getAttribute('category'));
	 
	    //
	    // Uncheck all other toggle buttons, sets XtkObject.isSelected to 'false'
	    //
	    if (!theSameButton && sameCategory) {
		otherButton.checked =  false;
		this.menuMap_[otherButton.id]['xtkObj'].isSelectedVolume = otherButton.checked;
	    }
	}.bind(this))
    }.bind(this)



    //------------------
    // Make the button row.
    //------------------
    var bRow = this.makeButtonRow(fileName, callback, 'toggle2D', {'type' : 'radio', 'category': 'Volume2D'});
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
utils.xtk.ControllerMenu.prototype.makeDisplayAll_ = function(){

    //------------------
    // Define the toggle callback.
    //------------------
    var callback = function(button){
	goog.array.forEach(button.subbuttons, function(subbutton){ 
	    subbutton.checked = button.checked;
	    subbutton.onclick();
	})
    }



    //------------------
    // Make the button row.
    //------------------
    return this.makeButtonRow('SHOW ALL', callback, 'DisplayAll', {'checked' : true});
}




/**
 * Creates a sliderRow for the 3D menu that allows the user
 * to adjust the opacity of all the xtk objects within the category
 * folder.
 *
 * @return {Element}
 * @private
 */
utils.xtk.ControllerMenu.prototype.makeMasterOpacity_ = function(){

    //------------------
    // Define the slide callback.
    //------------------
    var callback = function(slider) {
	goog.array.forEach(slider.subsliders, function(subslider){ subslider.setValue(slider.getValue());})
    }



    //------------------
    // Make the slider row.
    //------------------
    return this.makeSliderRow('Master Opacity', callback, 'MasterOpacity');     
}




/**
 * Creates a sliderRow for the 3D menu that allows the user
 * to adjust the opacity of a given xtkObject.
 *
 * @param {!String, Object=}
 * @private
 */
utils.xtk.ControllerMenu.prototype.makeOpacity_ = function(fileName, opt_parentslider){
 

    //------------------
    // Define the slide callback.
    //------------------
    var callback = function(slider){	
	this.menuMap_[slider.file]['xtkObj'].opacity = this.menuMap_[slider.file]['opacity'].getValue();
    }.bind(this)



    //------------------
    // Make the slider row.
    //------------------
    var opSlider = this.makeSliderRow('Opacity', callback, fileName);



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
utils.xtk.ControllerMenu.prototype.makeRow = function (eltArr, opt_lefts) {
    var row = goog.dom.createDom('div', {
	'id' : 'ElementRow_' + goog.string.createUniqueString(),
	'class': utils.xtk.ControllerMenu.ROW_CLASS
    });



    //------------------
    // Loop through each element and space
    // them out accordingly.
    //------------------    
    goog.array.forEach(eltArr, function(elt, i){
	utils.style.setStyle(elt, {
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
	utils.style.setStyle(eltArr[i], {'left' : opt_lefts[i]});
    })
    

    return row;
}




/**
 * Constructs the visibility controls of the 3D menu for provided
 * xtkObjects.
 *
 * @private
 * @param {!String, !X.Object}
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeStandardVisibilityControls3D = function(folderName3D, xtkObjects){
 
    var fileName = '';
    var displayAll = this.makeDisplayAll_();
    var masterOpacity = this.makeMasterOpacity_();
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
	this.makeRow([displayAll['label'], 
		      displayAll['button'], 
		      masterOpacity['label'], 
		      masterOpacity['slider']['element'],  
		      masterOpacity['value']], 
		     utils.xtk.ControllerMenu.rowSpacing), [folderName3D]);



    //------------------
    // Loop through all of the XtkObjects and construct
    // the subfolder opacity controllers.
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  utils.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	// Special case for annotations
	fileName = xtkObject.caption ? xtkObject.caption : fileName;

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	this.menuMap_[fileName] = {};
	this.menuMap_[fileName]['xtkObj'] = xtkObject;

	visible = this.makeVisible_(fileName, displayAll['button'], displayAll['button']);
	this.menuMap_[fileName]['visible'] = visible['button'];

	opacity = 
	    this.makeOpacity_(fileName, masterOpacity['slider']['slider']);
	this.menuMap_[fileName]['opacity'] = opacity['slider']['slider'];


	this.menu3D_.addContents(  
	    this.makeRow([visible['label'], visible['button'], 
			  opacity['label'], opacity['slider']['element'], 
			  opacity['value']], 
			  utils.xtk.ControllerMenu.rowSpacing),
	    [folderName3D, fileName]);

    }.bind(this))
}




/**
 * Addes volumes to the controller menu, first creating the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) and then adding volume-specific controls, such as threshold
 * sliders and volumeRendering toggles.
 *
 * @param {Array.<X.Object>}
 */ 
utils.xtk.ControllerMenu.prototype.addVolumes = function(xtkObjects){
 
    var fileName = '';
    var folderName3D = 'Volumes';
    var folderName2D = 'Volumes';
    var threshold, volumeRendering, toggle2d;



    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    this.makeStandardVisibilityControls3D(folderName3D, xtkObjects);



    //------------------
    // Then, construct the volume-specific controllers in the 
    // subfolders of the menu (these include thresholds, volume rendering,
    // and 2D toggle controls).
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  utils.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	if (!this.menuMap_[fileName]) { 
	    this.menuMap_[fileName] = {};
	    this.menuMap_[fileName]['xtkObj'] = xtkObject;
	}

	threshold = this.makeThreshold_(fileName);
	volumeRendering = this.makeVolumeRendering_(fileName);
	toggle2d = this.makeToggleButton2D_(fileName);

	this.menuMap_[fileName]['threshold'] = threshold['slider']['slider'];
	this.menuMap_[fileName]['volume rendering'] = volumeRendering['button'];
	this.menuMap_[fileName]['toggle2d'] = toggle2d['button']; 

	this.menu3D_.addContents( 
	    this.makeRow([volumeRendering['label'], 
			  volumeRendering['button'], 
			  threshold['label'],		
			  threshold['slider']['element'], 
			  threshold['value']], 
			 utils.xtk.ControllerMenu.rowSpacing), 
	    [folderName3D, fileName]);
	
	this.menu2D_.addContents(
	    this.makeRow([toggle2d['button'] , 
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
utils.xtk.ControllerMenu.prototype.addMeshes = function(xtkObjects){
 
    var folderName3D = 'Meshes';



    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    this.makeStandardVisibilityControls3D(folderName3D, xtkObjects);
}




/**
 * Addes DICOMS to the controller menu. Both the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) are needed and the 
 *
 * @param {Array.<X.Object>}
 */ 
utils.xtk.ControllerMenu.prototype.addDicoms = function(xtkObjects){
   
    var folderName3D = 'DICOM';
    


    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    this.makeStandardVisibilityControls3D(folderName3D, xtkObjects);



    //------------------
    // Then, construct the DICOM-specific controllers 
    // (threshold, volume rendering).
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  utils.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	//
	// Putting this first because we need the xObject
	// for 2D toggle defining.
	//
	if (!this.menuMap_[fileName]) { 
	    this.menuMap_[fileName] = {};
	    this.menuMap_[fileName]['xtkObj'] = xtkObject;
	}

	threshold = this.makeThreshold_(fileName);
	volumeRendering = this.makeVolumeRendering_(fileName);

	this.menuMap_[fileName]['threshold'] = threshold['slider']['slider'];
	this.menuMap_[fileName]['volume rendering'] = volumeRendering['button'];

	this.menu3D_.addContents(this.makeRow([volumeRendering['label'], 
		volumeRendering['button'], threshold['label'], 
		threshold['slider']['element'], threshold['value']], 
		utils.xtk.ControllerMenu.rowSpacing ), 
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
utils.xtk.ControllerMenu.prototype.addAnnotations = function(xtkObjects){
   
    var folderName3D = 'Annotations';
    this.makeStandardVisibilityControls3D(folderName3D, xtkObjects);
}




/**
 * Adds fibers to the controller menu. These require many
 * customized controllers.
 *
 * @param {Array.<X.object>}
 */
utils.xtk.ControllerMenu.prototype.addFiber = function(xtkObjects){
    
    var fileName = '';
    var folderName3D = 'Fibers';
    var displayAll = this.makeDisplayAll_();
    var masterOpacity = this.makeMasterOpacity_();
    var opacity, visible;



    //------------------
    // Construct the SHOW ALL and 
    // Master Opacity controlers...
    //------------------    
    this.menuMap_[folderName3D] = {};
    this.menuMap_[folderName3D]['display all'] = displayAll['button'];
    this.menuMap_[folderName3D]['master opacity'] = masterOpacity['slider']; 

    this.menu3D_.addContents(
	this.makeRow([displayAll['label'], 
		      displayAll['button'], 
		      masterOpacity['label'], 
		      masterOpacity['slider']['element'],  
		      masterOpacity['value']], 
		     utils.xtk.ControllerMenu.rowSpacing),  [folderName3D]);



    //------------------
    // Construct the fiber-specific controllers.
    //------------------
    goog.array.forEach(xtkObjects, function(xtkObject, i){
	fileName =  utils.string.basename(goog.isArray(xtkObject.file) ? xtkObject.file[0] : xtkObject.file);

	opacity = this.makeOpacity_(fileName, masterOpacity['slider']);
	visible = this.makeVisible_(fileName, displayAll['button']);


	this.menuMap_[fileName] = {};
	this.menuMap_[fileName]['xtkObj'] = xtkObject;
	this.menuMap_[fileName]['opacity'] = opacity['slider'];
	this.menuMap_[fileName]['visible'] = visible['button'];

	//
	// Visible and opacity are the same row.
	//
	this.menu3D_.addContents(
	    this.makeRow([visible['label'], visible['button'], 
			  opacity['label'], opacity['slider']['element'], 
			  opacity['value']], 
			 utils.xtk.ControllerMenu.rowSpacing), 
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
utils.xtk.ControllerMenu.prototype.getParent = function(elt){
    return elt ? elt : document.body;
}




/**
 * Makes a controller label element.
 *
 * @param {!String} labelTitle
 * @param {Element=} opt_parent
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeLabel = function(labelTitle, opt_parent){
    var label = goog.dom.createDom('div',{
	'id' : 'Label' + goog.string.removeAll(labelTitle, ' ') + goog.string.createUniqueString(),
	'class': utils.xtk.ControllerMenu.LABEL_CLASS
    });
    goog.dom.append(this.getParent(opt_parent), label);
    
    label.innerHTML = labelTitle;
    return label;
}




/**
 * Makes a number display element for sliders.
 * 
 * @param {Element=}
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeNumberDisplay = function(opt_parent){
    var value = goog.dom.createDom('div', {
	'id' : 'NumberDisplay_' + goog.string.createUniqueString(),
	'class': utils.xtk.ControllerMenu.VALUE_CLASS
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
utils.xtk.ControllerMenu.prototype.makeSliderRow = function(labelTitle, callback, fileAttr, opt_args) {

    var slider, sliderElt, sliderPackage, label, value;



    //------------------
    // Make Slider.
    //------------------
    sliderPackage = (opt_args && opt_args['type'] === 'twothumb') ? this.makeTwoThumbSlider(document.body, opt_args) :  this.makeSlider(document.body, opt_args);
    slider = sliderPackage['slider'];
    sliderElt = sliderPackage['element'];
    slider.file = fileAttr;



    //------------------
    // Make slider label.
    //------------------
    label = this.makeLabel(labelTitle, document.body);



    //------------------
    // Make slider value label.
    //------------------
    value = this.makeNumberDisplay(document.body);
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
utils.xtk.ControllerMenu.prototype.makeButtonRow = function(labelTitle, callback, fileAttr, opt_args){
    var button, label



    //------------------
    // Make Button
    //------------------
    button = (opt_args && opt_args['type'] === 'radio') ? this.makeRadioButton(document.body) : this.makeCheckbox(document.body);
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
    label = this.makeLabel(labelTitle, document.body);
    goog.dom.classes.add(label, utils.xtk.ControllerMenu.LABEL_BUTTON_CLASS);



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
utils.xtk.ControllerMenu.prototype.makeSlider = function(opt_parent, opt_args) {
    var slider;



    //------------------
    // Make slider.
    //------------------
    slider = new utils.ui.GenericSlider();
    this.getParent(opt_parent).appendChild(slider.getElement());



    //------------------
    // Set slider classes.
    //------------------
    goog.dom.classes.add(slider.getElement(), 
			 utils.xtk.ControllerMenu.SLIDER_WIDGET_CLASS);
    goog.dom.classes.add(slider.getThumb(), 
			 utils.xtk.ControllerMenu.SLIDER_THUMB_CLASS);
    goog.dom.classes.add(slider.getTrack(),
			 utils.xtk.ControllerMenu.SLIDER_TRACK_CLASS);
    slider.setHoverClasses(utils.xtk.ControllerMenu.THUMB_HOVER_CLASS);



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
 * sibling class of utils.ui.GenericSlider.
 *
 * @param {Element=} opt_parent
 * @param {Object=} opt_args
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeTwoThumbSlider = function(opt_parent, opt_args) {

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
	'class' : utils.xtk.ControllerMenu.TWOTHUMBSLIDER_TRACK_CLASS
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
    goog.dom.classes.add(elt, utils.xtk.ControllerMenu.TWOTHUMBSLIDER_WIDGET_CLASS);



    //-------------------
    // We need to change the CSS of all of the slider's child
    // elements.
    //-------------------
    goog.array.forEach(goog.dom.getChildren(slider.getElement()), 
		       function(child) {
	if (child.className === 'goog-twothumbslider-value-thumb' || 
	    child.className === 'goog-twothumbslider-extent-thumb') {
	    goog.dom.classes.add(child, 
			utils.xtk.ControllerMenu.TWOTHUMBSLIDER_THUMB_CLASS);
	    utils.style.setHoverClass(child,  
		utils.xtk.ControllerMenu.THUMB_HOVER_CLASS, 
				      function(applyHover, removeHover){

		//
		// set Dragging class
		//
		utils.ui.GenericSlider.superClass_.addEventListener.call(
		    slider, goog.ui.SliderBase.EventType.DRAG_START, 
		    function (e) {

		    // Suspend mouseout listener when dragging.
		    goog.events.unlisten(child, 
			goog.events.EventType.MOUSEOUT, removeHover);
		    goog.dom.classes.add(child, 
			utils.xtk.ControllerMenu.THUMB_HOVER_CLASS);
		});	  
		utils.ui.GenericSlider.superClass_.addEventListener.call(
		    slider, goog.ui.SliderBase.EventType.DRAG_END, 
		    function (e) {

		    //
		    // Reapply mouseout listener when done dragging.
		    //
		    goog.events.listen(child, goog.events.EventType.MOUSEOUT, 
				       removeHover);
		    goog.dom.classes.remove(child, 
				utils.xtk.ControllerMenu.THUMB_HOVER_CLASS);
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
 * As stated.
 * @param {Element=}
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeCheckbox = function(opt_parent){

    var checkbox = /**@type {Element}*/ goog.dom.createDom('input', { 
	'id': 'CheckBox'+ goog.string.createUniqueString(),
	'class': utils.xtk.ControllerMenu.BUTTON_CLASS
    });    
    goog.dom.append(this.getParent(opt_parent), checkbox);

    checkbox.type = 'checkbox';

    return checkbox;
}




/**
 * As stated.
 *
 * @param {Element=} opt_parent
 * @return {Element}
 */
utils.xtk.ControllerMenu.prototype.makeRadioButton = function(opt_parent){

    var radio = goog.dom.createDom('input', {
	'id': utils.xtk.ControllerMenu.BUTTON_CLASS + goog.string.createUniqueString(),
	'class': utils.xtk.ControllerMenu.BUTTON_CLASS + ' ' 
	    + utils.xtk.ControllerMenu.RADIO_BUTTON_CLASS
    });    
    goog.dom.append(this.getParent(opt_parent), radio);

    radio.type = 'radio';

    return radio;
}





