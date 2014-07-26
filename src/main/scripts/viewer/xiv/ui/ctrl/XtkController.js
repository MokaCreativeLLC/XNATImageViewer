/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */
goog.provide('xiv.ui.ctrl.XtkController');


// goog
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.ui.Checkbox');
goog.require('goog.string.path');
goog.require('goog.ui.Component');
goog.require('goog.dom.classes');

// X
goog.require('X.mesh');
goog.require('X.volume');
goog.require('X.fibers');
goog.require('X.sphere');
goog.require('X.object');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.string');
goog.require('nrg.dom');
goog.require('nrg.array');
goog.require('nrg.style');
goog.require('nrg.ui.ZippyTree');

//-----------



/**
 * xiv.ui.ctrl.XtkController defines the controllers
 * for Xtk objects.  These include sliders, toggle buttons,
 * checkboxes, etc.  The controllers apply to 2D xtk objects
 * (volumes) and 3D xtk objects.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.ctrl.XtkController = function() {
    goog.base(this);

    /**
     * @type {Array.<xiv.ui.ctrl.XtkController>}
     * @protected
     */
    this.masterControllers = [];



    /**
     * @type {Array.<xiv.ui.ctrl.XtkController}
     * @protected
     */
    this.subControllers = [];
}
goog.inherits(xiv.ui.ctrl.XtkController, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ctrl.XtkController', xiv.ui.ctrl.XtkController);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.XtkController.ID_PREFIX =  'xiv.ui.ctrl.XtkController';



/**
 * @enum {string}
 * @expose
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
 * @type {!string} 
 * @const
 */
xiv.ui.ctrl.XtkController.OBJ_KEY =  goog.string.createUniqueString();




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
 * @param {!X.object} xObj
 * @return {!string}
 * @protected
 */
xiv.ui.ctrl.XtkController.getXObjLabel = function(xObj){
    
    var folder = goog.isArray(xObj['file'])? 
	xObj['file'][0] : xObj['file'] || xObj['name'];
    return goog.string.path.basename(folder);
}



/**
 * @param {!X.object} xObj
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
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} controller
 * @public
 */
xiv.ui.ctrl.XtkController.setControllerFolders = 
function(xObj, controller){
    /**
    controller.setFolders([xiv.ui.ctrl.XtkController.getObjectCategory(xObj), 
			   xiv.ui.ctrl.XtkController.getXObjLabel(xObj)]);
    */
    controller.setFolders([xiv.ui.ctrl.XtkController.getXObjLabel(xObj)]);
}



/**
 * @private
 * @type {Element | goog.ui.Component}
 */
xiv.ui.ctrl.XtkController.prototype.component_;



/**
 * @private
 * @type {string}
 */
xiv.ui.ctrl.XtkController.prototype.label_;



/**
 * @private
 * @type {Array.string}
 */
xiv.ui.ctrl.XtkController.prototype.folders_;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ctrl.XtkController.prototype.initialized_ = false;



/**
 * @private
 * @type {X.object}
 */
xiv.ui.ctrl.XtkController.prototype.xObj_;



/**
 * @inheritDoc
 */
xiv.ui.ctrl.XtkController.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
}




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
 * @param {!X.object} obj
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.setXObj = function(xObj) {
    this.xObj_ = xObj;
}



/**
 * @return {X.object}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.getXObj = function() {
    return this.xObj_;
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

	//
	// Render the component if it isn't in the document
	//
	if (!this.component_.isInDocument()){
	    this.component_.render(this.getElement());
	} else {
	    if (this.component_.getElement().parentNode !== this.getElement() 
		&& this.component_.getElement() !== this.getElement()) {
		goog.dom.appendChild(this.getElement(), 
				 this.component_.getElement());
	    }
	}
    } else {
	goog.dom.appendChild(this.getElement(), elt);
    }

    if (goog.isDefAndNotNull(elt)){
	goog.dom.classes.add(elt, xiv.ui.ctrl.XtkController.CSS.COMPONENT);
	//window.console.log("\nELT", elt, elt.parentNode);
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
 * @return {!boolean}
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.isInitialized = function() {
    return this.initialized_;
}



/**
 * @param {!boolean} init
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.setInitialized = function(init) {
    this.initialized_ = init;
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
 * @param {string=} opt_label The controller label.
 * @param {Function=} opt_changeCallback The event callback applied to the 
 *   controller.
 * @return {!xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.createController = 
function(_XtkControllerSubClass, opt_label, opt_changeCallback) {

    // create
    var controller = new _XtkControllerSubClass();
    controller.render();

    // set label
    if (goog.isString(opt_label)){
	controller.setLabel(opt_label);
    }

    // add to DOM - TEMPORARY
    goog.dom.append(this.getElement(), controller.getElement());

    // set events
    if (goog.isDefAndNotNull(opt_changeCallback)){
	goog.events.listen(controller, 
			   xiv.ui.ctrl.XtkController.EventType.CHANGE, 
			   opt_changeCallback)
    }


    return controller;
}



/**
 * Updates the controller.
 * 
 * @public
 */
xiv.ui.ctrl.XtkController.prototype.update = function() {
    if (this.component_ == this){
	this.updateStyle();
	return;
    }
    else if (this.component_.updateStyle){
	this.component_.updateStyle();
    } 
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.XtkController.prototype.updateStyle = function() {
    if (this.component_.updateStyle && this.component_ != this){
	//window.console.log("UPDATE STYLE", this.component_);
	this.component_.updateStyle();
    }
}


/**
 * @param {!X.object | Array.<X.object>} xObjs
 * @param {!xiv.ui.ctrl.XtkController} ctrl
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_colorPalette = function(xObj, ctrl) {
    // create
    var color = this.createController(
	ctrl, 'Color', 
	function(e){
	    xObj['color'] = e.color;
	}.bind(this));

    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, color);

    // strore
    this.subControllers.push(color);

    color[xiv.ui.ctrl.XtkController.OBJ_KEY] = xObj;

    // set defaults
    color.update();

}



/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} ctrl
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_opacity = function(xObj, ctrl) {
    // create
    var opacity = this.createController( 
	ctrl, 'Opacity', 
	function(e){
	    xObj['opacity'] = parseFloat(e.value);
	});




    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, opacity);

    // store
    this.subControllers.push(opacity);

    // set defaults
    opacity.getComponent().setValue(1);

    opacity.getComponent().updateStyle();
} 





/**
 * @param {!X.object} xObj
 * @param {!xiv.ui.ctrl.XtkController} ctrl
 * @return {!xiv.ui.ctrl.XtkController}
 * @protected
 */
xiv.ui.ctrl.XtkController.prototype.add_visible = function(xObj, ctrl) {
    // create
    var visibleCheckBox = this.createController(
	 ctrl, 'Visible', 
	 function(e){
	     xObj['visible'] = e.checked;
	 });



    // set folder
    xiv.ui.ctrl.XtkController.setControllerFolders(xObj, visibleCheckBox);

    // store
    this.subControllers.push(visibleCheckBox);

    // set defaults
    visibleCheckBox.getComponent().setChecked(xObj['visible']);
} 



/**
 * @inheritDoc
 */
xiv.ui.ctrl.XtkController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    
    this[xiv.ui.ctrl.XtkController.OBJ_KEY] = null;
    delete this.initialized_;
    delete this.xObj_;

    //
    //  subControllers
    //
    goog.array.forEach(this.subControllers, function(subController){
	goog.events.removeAll(subController);
	subController.dispose();
	subController = null;
    })
    goog.array.clear(this.subControllers);
    delete this.subControllers;

    //
    // Master controllers.
    //
    goog.array.forEach(this.masterControllers, function(ctrl){
	goog.events.removeAll(ctrl);
	ctrl.dispose();
	controller = null;
    })
    goog.array.clear(this.masterControllers);
    delete this.masterControllers;

    //
    //  Component
    //
    if (goog.isDefAndNotNull(this.component_)){
	goog.events.removeAll(this.component_);
	if (this.component_ instanceof goog.ui.Component){
	    this.component_.dispose();
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




goog.exportSymbol('xiv.ui.ctrl.XtkController.ID_PREFIX',
	xiv.ui.ctrl.XtkController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.XtkController.CSS_SUFFIX',
	xiv.ui.ctrl.XtkController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.XtkController.EventType',
	xiv.ui.ctrl.XtkController.EventType);
goog.exportSymbol('xiv.ui.ctrl.XtkController.OBJ_KEY',
	xiv.ui.ctrl.XtkController.OBJ_KEY);
goog.exportSymbol('xiv.ui.ctrl.XtkController.createLabel',
	xiv.ui.ctrl.XtkController.createLabel);
goog.exportSymbol('xiv.ui.ctrl.XtkController.getXObjLabel',
	xiv.ui.ctrl.XtkController.getXObjLabel);
goog.exportSymbol('xiv.ui.ctrl.XtkController.getObjectCategory',
	xiv.ui.ctrl.XtkController.getObjectCategory);
goog.exportSymbol('xiv.ui.ctrl.XtkController.setControllerFolders',
	xiv.ui.ctrl.XtkController.setControllerFolders);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.render',
	xiv.ui.ctrl.XtkController.prototype.render);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.setLabel',
	xiv.ui.ctrl.XtkController.prototype.setLabel);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getLabel',
	xiv.ui.ctrl.XtkController.prototype.getLabel);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.setFolders',
	xiv.ui.ctrl.XtkController.prototype.setFolders);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getFolders',
	xiv.ui.ctrl.XtkController.prototype.getFolders);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.setXObj',
	xiv.ui.ctrl.XtkController.prototype.setXObj);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getXObj',
	xiv.ui.ctrl.XtkController.prototype.getXObj);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.setComponent',
	xiv.ui.ctrl.XtkController.prototype.setComponent);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getAllControllers',
	xiv.ui.ctrl.XtkController.prototype.getAllControllers);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getMasterControllers',
	xiv.ui.ctrl.XtkController.prototype.getMasterControllers);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.isInitialized',
	xiv.ui.ctrl.XtkController.prototype.isInitialized);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.setInitialized',
	xiv.ui.ctrl.XtkController.prototype.setInitialized);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getSubControllers',
	xiv.ui.ctrl.XtkController.prototype.getSubControllers);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.getComponent',
	xiv.ui.ctrl.XtkController.prototype.getComponent);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.dispatchComponentEvent',
	xiv.ui.ctrl.XtkController.prototype.dispatchComponentEvent);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.createController',
	xiv.ui.ctrl.XtkController.prototype.createController);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.update',
	xiv.ui.ctrl.XtkController.prototype.update);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.updateStyle',
	xiv.ui.ctrl.XtkController.prototype.updateStyle);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.add_colorPalette',
	xiv.ui.ctrl.XtkController.prototype.add_colorPalette);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.add_opacity',
	xiv.ui.ctrl.XtkController.prototype.add_opacity);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.add_visible',
	xiv.ui.ctrl.XtkController.prototype.add_visible);
goog.exportSymbol('xiv.ui.ctrl.XtkController.prototype.disposeInternal',
	xiv.ui.ctrl.XtkController.prototype.disposeInternal);
