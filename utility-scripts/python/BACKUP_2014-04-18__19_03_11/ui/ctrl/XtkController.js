/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// goog
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.string.path');
goog.require('goog.dom');
goog.require('goog.ui.Checkbox');

// lib
goog.require('moka.ui.Component');
goog.require('moka.string');
goog.require('moka.dom');
goog.require('moka.array');
goog.require('moka.style');
goog.require('moka.ui.ZippyTree');

// xiv
goog.require('xiv.ui.ctrl.CheckboxController');
goog.require('xiv.ui.ctrl.SliderController');
goog.require('xiv.ui.ctrl.TwoThumbSliderController');
goog.require('xiv.ui.ctrl.ColorPaletteController');
goog.require('xiv.ui.ctrl.RadioButtonController');



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
     * @type {!Array.<xiv.ui.ctrl.XtkController>}
     * @protected
     */
    this.masterControllers = [];


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
 * @param {!X.Object} xObj
 * @return {!string}
 * @protected
 */
xiv.ui.ctrl.XtkController.getXObjLabel = function(xObj){
    
    var folder = goog.isArray(xObj.file)? xObj.file[0] : xObj.file || xObj.name;
    return goog.string.path.basename(folder);
}



/**
 * @param {!X.Object} xObj
 * @return {!string}
 * @public
 */
xiv.ui.ctrl.XtkController.getObjectCategory = 
function(xObj){
    if (xObj instanceof X.mesh){
	return 'Meshes';
    } 
    else if (xObj instanceof X.volume){
	return 'Volumes';
    }
    else if (xObj instanceof X.fibers){
	return 'Fibers';
    }
    else if (xObj instanceof X.sphere){
	return 'Annotations';
    }
}




/**
 * @param {!X.Object} xObj
 * @param {!xiv.ui.ctrl.XtkController} controller
 * @public
 */
xiv.ui.ctrl.XtkController.setControllerFolders = 
function(xObj, controller){
    controller.setFolders([xiv.ui.ctrl.XtkController.getObjectCategory(xObj), 
			   xiv.ui.ctrl.XtkController.getXObjLabel(xObj)]);
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
 * @return {!Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getAllControllers = function() {
    return goog.array.concat(this.masterControllers, this.subControllers);
}



/**
 * @return {!Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getMasterControllers = function() {
    return this.masterControllers;
}



/**
 * @return {!Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getSubControllers = function() {
    return this.subControllers;
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
 * @param {!Object} _XtkControllerSubClass The subclass of the XtkController.
 * @param {!string} label The controller label.
 * @param {!Function} changeCallback The event callback applied to the 
 *   controller.
 * @return {!xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.createController = 
function(_XtkControllerSubClass, label, changeCallback) {

    // create
    var controller = new _XtkControllerSubClass();

    // set events
    goog.events.listen(controller, 
		       xiv.ui.ctrl.XtkController.EventType.CHANGE, 
		       changeCallback)
    // set label
    controller.setLabel(label);

    // add to DOM - TEMPORARY
    goog.dom.append(this.getElement(), controller.getElement());

    return controller;
}



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_colorPalette = function(xObj) {
    // create
    var color = this.createController(
	xiv.ui.ctrl.ColorPaletteController, 'Color', 
	function(e){
	    xObj.color = e.color
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, color);

    // strore
    this.subControllers.push(color);
    
    // set defaults
    color.getComponent().setColor(goog.color.rgbArrayToHex(
	xObj.color.map( function(x) { 
	    return goog.math.clamp(parseFloat(x), 0, 1) * 255; 
	})
    ))
}



/**
 * @param {!X.Object} xObj
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_opacity = function(xObj) {
    // create
    var opacity = this.createController( 
	xiv.ui.ctrl.SliderController, 'Opacity', 
	function(e){
	    window.console.log(e.value);
	    xObj.opacity = parseFloat(e.value);
	});

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, opacity);

    // store
    this.subControllers.push(opacity);

    // set defaults
    opacity.getComponent().setValue(1);
} 



/**
 * @param {!X.Object} xObj
 * @return {!xiv.ui.ctr.XtkController}
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_visible = function(xObj) {
    // create
    var visibleCheckBox = this.createController(
	 xiv.ui.ctrl.CheckboxController, 'Visible', 
	 function(e){
	     xObj.visible = e.checked;
	 });

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, visibleCheckBox);

    // store
    this.subControllers.push(visibleCheckBox);

    // set defaults
    visibleCheckBox.getComponent().setChecked(xObj.visible);
} 



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


    // Master controllers.
    goog.object.forEach(this.masterControllers, function(controller){
	goog.events.removeAll(controller);
	controller.disposeInternal();
	controller = null;
    })
    goog.array.clear(this.masterControllers);
    delete this.masterControllers;


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




