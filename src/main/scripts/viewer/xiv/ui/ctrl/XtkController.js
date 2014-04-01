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
goog.require('goog.ui.Checkbox');

// lib
goog.require('moka.ui.Component');
goog.require('moka.string');
goog.require('moka.dom');
goog.require('moka.array');
goog.require('moka.style');
goog.require('moka.ui.ZippyTree');



/**
 * xiv.ui.ctrl.XtkController defines the controllers
 * for Xtk objects.  These include sliders, toggle buttons,
 * checkboxes, etc.  The controllers apply to 2D xtk objects
 * (volumes) and 3D xtk objects.
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ctrl.XtkController');
xiv.ui.ctrl.XtkController = function() {
    goog.base(this);

    /**
     * @type {!Array.<xiv.ui.ctrl.XtkController}
     * @protected
     */
    this.subControllers = [];
}
goog.inherits(xiv.ui.ctrl.XtkController, moka.ui.Component);
goog.exportSymbol('xiv.ui.ctrl.XtkController', xiv.ui.ctrl.XtkController);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.XtkController.ID_PREFIX =  'xiv.ui.ctrl.XtkController';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.XtkController.CSS_SUFFIX = {
    LABEL: 'label',
    COMPONENT: 'component'
}


/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.XtkController.EventType = {
    CHANGE: goog.events.getUniqueId('change'),
}



/**
 * @private
 * @type {!Element | !goog.ui.Component}
 */
xiv.ui.ctrl.XtkController.prototype.component_ = null;



/**
 * @private
 * @type {!string}
 */
xiv.ui.ctrl.XtkController.prototype.label_ = null;



/**
 * @private
 * @type {!Array.string}
 */
xiv.ui.ctrl.XtkController.prototype.folders_ = null;



/**
 * @param {!string} labelTitle The label title;
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.setLabel = function(labelTitle) {
    if (!goog.isDefAndNotNull(this.label_)){
	this.label_ = xiv.ui.ctrl.XtkController.createLabel();
	goog.dom.append(this.getElement(), this.label_);
    }
    this.label_.innerHTML = labelTitle;
}



/**
 * @return {string=}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getLabel = function() {
    return this.label_;
}



/**
 * @param {!string | !Array.<string>} folders
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.setFolders = function(folders) {
    if (goog.isString(folders)){
	folders = [folders];
    }
    this.folders_ = folders;
}



/**
 * @return {Array.<string>=}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getFolders = function() {
    return this.folders_;
}


/**
 * @param {!Element | !goog.ui.Component} component
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.setComponent = function(component) {
    this.component_ = component;

    var elt = this.component_;
    if (this.component_ instanceof goog.ui.Component){
	elt = this.component_.getElement();
    } 

    if (goog.isDefAndNotNull(elt)){
	goog.dom.append(this.getElement(), elt);
	goog.dom.classes.add(elt, xiv.ui.ctrl.XtkController.CSS.COMPONENT);
    }
}



/**
 * @return {Element= | goog.ui.Component=}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getComponent = function() {
    return this.component_;
}


/**
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.dispatchComponentEvent = goog.nullFunction;



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
 
    //  subControllers
    goog.array.forEach(this.subControllers, function(){
	goog.events.removeAll(subController);
	subController.disposeInternal();
	subController = null;
    })
    goog.array.clear(this.subControllers);
    delete this.subControllers;


    //  Component
    if (goog.isDefAndNotNull(this.component_)){
	goog.events.removeAll(this.component_);
	if (this.component_ instanceof goog.ui.Component){
	    this.component_.disposeInternal();
	} else {
	    goog.dom.removeNode(this.component_);
	}
	delete this.component_;
    }

    // Folders
    if (goog.isDefAndNotNull(this.folders_)){
	goog.array.clear(this.folders_);
	delete this.folders_;
    }

    // Label
    if (goog.isDefAndNotNull(this.label_)){
	goog.dom.removeNode(this.label_);
	delete this.label_;
    }
}



/**
 * @const 
 * @type {!Array.<string>}
 */
xiv.ui.ctrl.XtkController.rowSpacing = ['0%','27%','35%', '55%', '88%'];



/**
 * Creates a sliderRow for the 3D menu that allows the user
 * to adjust the opacity of all the xtk objects within the category
 * folder.
 *
 * @return {Element}
 * @private
 */
xiv.ui.ctrl.XtkController.createMasterOpacityRow_ = function(){

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
xiv.ui.ctrl.XtkController.createOpacity_ = 
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
xiv.ui.ctrl.XtkController.createRow = function (eltArr, opt_lefts) {
    var row = goog.dom.createDom('div', {
	'id' : 'ElementRow_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.XtkController.ROW_CLASS
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
 * Constructs the visibility controls of the 3D menu for provided
 * xtkObjects.
 *
 * @private
 * @param {!X.Object} xtkObject
 * @return {ArrayElement}
 */
xiv.ui.ctrl.XtkController.createGenericControls_3D = 
function(xtkObject){
 
    var fileName = '';
    var displayAll = xiv.ui.ctrl.XtkController.createDisplayAllController_();
    //var masterOpacity = xiv.ui.ctrl.XtkController.createMasterOpacityRow_();


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
		     xiv.ui.ctrl.XtkController.rowSpacing), [folderName3D]);



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
			  xiv.ui.ctrl.XtkController.rowSpacing),
	    [folderName3D, fileName]);

    }.bind(this))
}




xiv.ui.ctrl.XtkController.createControllers_Category = function(xObjects){
    return [new xiv.ui.ctrl.DisplayAllController(xObjects),
	    new xiv.ui.ctrl.MasterOpacityController(xObjects)];
}




/**
 * Addes volumes to the controller menu, first creating the 
 * standard visibility controls (that apply to meshes, annotations, and
 * volumes) and then adding volume-specific controls, such as threshold
 * sliders and volumeRendering toggles.
 *
 * @param {X.Object}
 */ 
xiv.ui.ctrl.XtkController.createControllers_Volume = function(xtkObject){
 
    var fileName = '';
    var folderName3D = 'Volumes';
    var folderName2D = 'Volumes';
    var threshold, volumeRendering, toggle2d;



    //------------------
    // First, construct the 'standard' visibility 
    // controllers.
    //------------------
    var gen = xiv.ui.ctrl.XtkController.createGenericControls_3D(xtkObject);

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
			 xiv.ui.ctrl.XtkController.rowSpacing), 
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
xiv.ui.ctrl.XtkController.addMeshes = function(xtkObjects){
 
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
xiv.ui.ctrl.XtkController.addDicoms = function(xtkObjects){
   
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
		xiv.ui.ctrl.XtkController.rowSpacing ), 
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
xiv.ui.ctrl.XtkController.addAnnotations = function(xtkObjects){
   
    var folderName3D = 'Annotations';
    this.createGenericControls_3D(folderName3D, xtkObjects);
}




/**
 * Adds fibers to the controller menu. These require many
 * customized controllers.
 *
 * @param {Array.<X.object>}
 */
xiv.ui.ctrl.XtkController.addFiber = function(xtkObjects){
    
    var fileName = '';
    var folderName3D = 'Fibers';
    var displayAll = this.createDisplayAllController_();
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
		     xiv.ui.ctrl.XtkController.rowSpacing),  [folderName3D]);



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
			 xiv.ui.ctrl.XtkController.rowSpacing), 
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
xiv.ui.ctrl.XtkController.getParent = function(elt){
    return elt ? elt : document.body;
}




/**
 * Creates a div label 
 * @return {Element}
 */
xiv.ui.ctrl.XtkController.createLabel = function(){
    return goog.dom.createDom('div',{
	'id' : 'Label_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.XtkController.CSS.LABEL
    });
}




/**
 * Makes a number display element for sliders.
 * 
 * @param {Element=}
 * @return {Element}
 */
xiv.ui.ctrl.XtkController.createNumberDisplay = function(opt_parent){
    var value = goog.dom.createDom('div', {
	'id' : 'NumberDisplay_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.XtkController.VALUE_CLASS
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
xiv.ui.ctrl.XtkController.createSliderRow = function(labelTitle, callback, fileAttr, opt_args) {

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
	goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, 
			   slideCallback);
    }

    return { 'slider': sliderPackage, 'value': value,'label': label}
}




/**
 * Makes a button row for controls.
 *
 * @param {!string} labelTitle
 * @param {!Function} callback
 * @param {!string} fileAttr
 * @param {Object=} opt_args
 * @return {Element}
 */
xiv.ui.ctrl.XtkController.createButton = 
function(labelTitle, callback, fileAttr, opt_args){


    //------------------
    // Make Button
    //------------------
    button = (opt_args && opt_args['type'] === 'radio') ? 
	xiv.ui.ctrl.XtkController.createRadioButton(document.body) : 
	xiv.ui.ctrl.XtkController.createCheckBox(document.body);
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
    // Callbacks
    //------------------

    //button.onclick = function(){callback(button)};
    //goog.events.listen(button, goog.events.EventType.CLICK, 
    //function(){ callback(button) } )

        
    return { 'button': button}
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
xiv.ui.ctrl.XtkController.createTwoThumbSlider = function(opt_parent, opt_args) {

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
	'class' : xiv.ui.ctrl.XtkController.TWOTHUMBSLIDER_TRACK_CLASS
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
    goog.dom.classes.add(elt, 
			 xiv.ui.ctrl.XtkController.TWOTHUMBSLIDER_WIDGET_CLASS);



    //-------------------
    // We need to change the CSS of all of the slider's child
    // elements.
    //-------------------
    goog.array.forEach(goog.dom.getChildren(slider.getElement()), 
		       function(child) {
	if (child.className === 'goog-twothumbslider-value-thumb' || 
	    child.className === 'goog-twothumbslider-extent-thumb') {
	    goog.dom.classes.add(child, 
			xiv.ui.ctrl.XtkController.TWOTHUMBSLIDER_THUMB_CLASS);
	    moka.style.setHoverClass(child,  
		xiv.ui.ctrl.XtkController.THUMB_HOVER_CLASS, 
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
			xiv.ui.ctrl.XtkController.THUMB_HOVER_CLASS);
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
				xiv.ui.ctrl.XtkController.THUMB_HOVER_CLASS);
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
xiv.ui.ctrl.XtkController.createRadioButton = function() {
    return goog.dom.createDom('input', {
	'id': xiv.ui.ctrl.XtkController.BUTTON_CLASS + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.XtkController.BUTTON_CLASS + ' ' 
	    + xiv.ui.ctrl.XtkController.RADIO_BUTTON_CLASS
    });
}





