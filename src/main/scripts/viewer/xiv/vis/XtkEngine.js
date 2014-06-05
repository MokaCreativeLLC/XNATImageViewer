/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xtk
goog.require('X.mesh');
goog.require('X.volume');
goog.require('X.fibers');
goog.require('X.sphere');

// xiv
goog.require('xiv.vis.XtkPlane');
goog.require('xiv.vis.XtkPlane2D');
goog.require('xiv.vis.XtkPlane3D');
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.XtkControllerTree');



/**
 * @constructor
 * @extends {xiv.vis.RenderEngine}
 */
goog.provide('xiv.vis.XtkEngine');
xiv.vis.XtkEngine = function () {
    goog.base(this);
    

    /**
     * @type {!xiv.ui.ctrl.XtkControllerTree}
     * @private
     */
    this.ControllerTree_ = null;



    /**
     * @type {!Object.<string, X.Object>}
     * @private
     */
    this.currXObjects_ = {
	'volumes' : [],
	'meshes' : [],
	'fibers': [],
	'spheres' : [],
    };



    /**
     * @type {!xiv.vis.XtkPlane2D}
     * @private
     */
    this.PlaneX_ = new xiv.vis.XtkPlane2D('X');



    /**
     * @type {!xiv.vis.XtkPlane2D}
     * @private
     */
    this.PlaneY_ = new xiv.vis.XtkPlane2D('Y');



    /**
     * @type {!xiv.vis.XtkPlane2D}
     * @private
     */
    this.PlaneZ_ = new xiv.vis.XtkPlane2D('Z');



    /**
     * @type {!xiv.vis.XtkPlane3D}
     * @private
     */
    this.PlaneV_ = new xiv.vis.XtkPlane3D();

    

    /**
     * @type {!xiv.vis.XtkPlane2D}
     * @private
     */
    this.primaryRenderPlane_ = null;
    this.setPrimaryRenderPlane(this.PlaneV_);

    this.setRenderPlaneEvents_();
}
goog.inherits(xiv.vis.XtkEngine, xiv.vis.RenderEngine);
goog.exportSymbol('xiv.vis.XtkEngine', xiv.vis.XtkEngine);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.vis.XtkEngine.EventType = {
    SLICE_NAVIGATED: goog.events.getUniqueId('slice-navigated'),
    SHIFT_DOWN: goog.events.getUniqueId('shift-down'),
    SHIFT_UP: goog.events.getUniqueId('shift-up'),
    ERROR: goog.events.getUniqueId('error'),
    ZOOM: goog.events.getUniqueId('zoom'),
    LEFTMOUSE_DOWN: goog.events.getUniqueId('leftmouse-down'),
    LEFTMOUSE_UP: goog.events.getUniqueId('leftmouse-up')
}




/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.vis.XtkEngine.ID_PREFIX =  'xiv.vis.XtkEngine';




/**
 * @const 
 * @dict
 */
xiv.vis.XtkEngine.ANATOMICAL_TO_CARTESIAN =  {
    'SAGITTAL': 'X',
    'CORONAL': 'Y',
    'AXIAL' : 'Z',
    'TRANSVERSE': 'Z'
};



/**
 * @type {!boolean}
 * @private
 */
xiv.vis.XtkEngine.prototype.renderEndCalled_ = false;



/**
 * @param {!gxnat.vis.ViewableGroup} ViewableGroup
 * @private
 */
xiv.vis.XtkEngine.prototype.getAnnotations_ = function(ViewableGroup) {
    if (!goog.isDefAndNotNull(ViewableGroup.getRenderProperties().annotations))
	{ return }

    goog.array.forEach(ViewableGroup.getRenderProperties().annotations,
		       function(annotationsNode){
			   this.currXObjects_['spheres'].push(
			       xiv.vis.XtkEngine.createAnnotation(
				   annotationsNode))
		       }.bind(this))
}



/**
 * @param {!boolean} on
 * @public
 */
xiv.vis.XtkEngine.prototype.setVPlaneOn = function(on) {
    this.PlaneV_.setOn(on);
}




/**
 * @param {xiv.vis.XtkPlane} Plane
 * @public
 */
xiv.vis.XtkEngine.prototype.setPrimaryRenderPlane = function(Plane) {
    this.primaryRenderPlane_ = Plane;
    this.setPrimaryRenderPlaneEvents_();
    
}



/**
 * @param {Event}
 * @private
 */
xiv.vis.XtkEngine.prototype.onSliceNavigated_ = function(e) {
    this.dispatchEvent(e)
}



/**
 * @param {Event}
 * @private
 */
xiv.vis.XtkEngine.prototype.setRenderPlaneEvents_ = function() {
    //
    // SLICE NAVIGATED EVENTS
    //
    goog.object.forEach(this.getPlanes(), function(Plane, planeOr){
	goog.events.listen(Plane, 
			   xiv.vis.XtkEngine.EventType.SLICE_NAVIGATED, 
			   this.onSliceNavigated_.bind(this))

	goog.events.listen(Plane, 
			   xiv.vis.XtkEngine.EventType.SHIFT_UP,
			   function(e){
			       //window.console.log("SHIFT UP 2!");
			   }.bind(this))
    }.bind(this))
}


/**
 * @private
 */
xiv.vis.XtkEngine.prototype.setPrimaryRenderPlaneEvents_ = function() {

    // Unlisten on the given planes
    goog.object.forEach(this.getPlanes(), function(Plane, planeOr){
	goog.events.listen(Plane, 
			   xiv.vis.RenderEngine.EventType.RENDERING, 
			   this.onRendering_.bind(this))
	goog.events.listen(Plane, 
			     xiv.vis.RenderEngine.EventType.RENDER_END, 
			     this.onRenderEnd_.bind(this))
    }.bind(this))



    // Re-listen on the primary
    this.primaryRenderPlane_.init();
    goog.events.listen(this.primaryRenderPlane_, 
		       xiv.vis.RenderEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this))

    goog.events.listen(this.primaryRenderPlane_, 
		       xiv.vis.RenderEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this))
}



/**
 * @public
 */
xiv.vis.XtkEngine.prototype.updateControllers = function(){
    goog.array.forEach(this.getControllers3D(), function(ctrl){
	ctrl.update();
    }.bind(this));

    goog.array.forEach(this.getControllers2D(), function(ctrl){
	ctrl.update();
    }.bind(this));
}



/**
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.vis.XtkEngine.prototype.getControllers3D = function(){
    return this.ControllerTree_.getControllers3D();
}



/**
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.vis.XtkEngine.prototype.getControllers2D = function(){
    //window.console.log(this, this.ControllerTree_);
    return this.ControllerTree_.getControllers2D();
}



/**
 * @param {!gxnat.vis.ViewableGroup} ViewableGroup
 * @private
 */
xiv.vis.XtkEngine.prototype.createXObjects_ = function(ViewableGroup) {
    //
    // Clear existing controller tree
    //
    if (goog.isDefAndNotNull(this.ControllerTree_)){
	this.ControllerTree_.dispose();
	this.ControllerTree_ = null;
    }
    this.ControllerTree_ = new xiv.ui.ctrl.XtkControllerTree();

    
    //
    // Annotations
    //
    
    if (goog.isDefAndNotNull(ViewableGroup.getRenderProperties() &&
	goog.isDefAndNotNull(ViewableGroup.getRenderProperties().annotations))){
	this.getAnnotations_(ViewableGroup);
	//window.console.log("\n\n\n\n\n************ANNOTATIONS!!!!");
	goog.array.forEach(this.currXObjects_['spheres'], function(annot){

	    //window.console.log("ANNOT", annot);
	    this.ControllerTree_.createControllers(annot);
	}.bind(this))
    }

   
    //window.console.log("*********CONTROLLER TREE!!!", 
    //this.ControllerTree_, this.currXObjects_);


    //
    // Volumes, meshes and fibers
    //
    var fileList;
    goog.array.forEach(ViewableGroup.getViewables(), function(Viewable){
	fileList = Viewable.getFiles();
	if (!goog.isDefAndNotNull(fileList)) { return };

	//window.console.log(ViewableGroup, Viewable, Viewable.getFiles());
	currXObj = xiv.vis.XtkEngine.createXObject(fileList);
	renderProps = Viewable.getRenderProperties();

	if (!currXObj) { return }
	//
	// Create controllers
	//
	this.ControllerTree_.createControllers(currXObj, renderProps);

	// Volumes
	if (currXObj instanceof X.volume) {
	    this.constructor.setRenderProperties_Volume_(
		currXObj, renderProps);
	    this.currXObjects_['volumes'].push(currXObj);

	    //
	    // IMPORTANT!!! 
	    //
	    currXObj.reslicing = false;
	    //window.console.log("RESLICING", currXObj.transform);

	}

	// Meshes
	else if (currXObj instanceof X.mesh){
	    this.constructor.setRenderProperties_Mesh_(
		currXObj, renderProps);
	    this.currXObjects_['meshes'].push(currXObj);
	}

	// Fibers
	else if (currXObj instanceof X.fibers){
	    this.constructor.setRenderProperties_Fiber_(
		currXObj, renderProps);
	    this.currXObjects_['fibers'].push(currXObj);
	}
    }.bind(this))
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.render3dPlane = function(){
    
    //window.console.log("No volumes found! Only rendering in 3D!");
    this.setPrimaryRenderPlane(this.PlaneV_);
    this.PlaneV_.init();
    goog.object.forEach(this.currXObjects_, function(xObjArr, key){
	if (key !== 'volumes'){
	    goog.array.forEach(xObjArr, function(xObj){
		this.PlaneV_.add(xObj);
	    }.bind(this))
	}
    }.bind(this))
    this.PlaneV_.render();
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.renderAllPlanes = function(){
    var selVol = this.getSelectedVolume();
    var otherXObjects = [];

    //
    // Store all non-volume objects.
    //
    goog.object.forEach(this.currXObjects_, function(xObjArr, key){
	if (key !== 'volumes'){
	    goog.array.forEach(xObjArr, function(xObj){
		otherXObjects.push(xObj);
	    })
	}
    }.bind(this))

    //
    // Add the selected volume
    //
    otherXObjects.push(selVol);
    //window.console.log("SELECTED VOLUME", selVol, this.primaryRenderPlane_);
    //window.console.log("OTHER X OBJECTS", otherXObjects);

    //
    // Add objects to primary render plane
    //
    goog.array.forEach(otherXObjects, function(xObj){
	this.primaryRenderPlane_.add(xObj);
    }.bind(this))

    //
    // Once rendered, add to secoundary planes
    //
    this.primaryRenderPlane_.Renderer.onShowtime = function(){
	this.renderNonPrimary_(otherXObjects)
    }.bind(this);

    //
    // Render!
    //
    this.primaryRenderPlane_.render();
}



/**
 * @param {!gxnat.vis.ViewableGroup} ViewableGroup
 * @return {Array.<xiv.vis.XtkPlane>}
 */
xiv.vis.XtkEngine.prototype.render = function (ViewableGroup) {

    this.renderEndCalled_ = false;


    //
    // Create the XObjects
    //
    this.createXObjects_(ViewableGroup);

    
    //
    // Set the background color and camera if render properties are defined
    //
    var renderProps = ViewableGroup.getRenderProperties();

    
    if (goog.isDefAndNotNull(renderProps)) {
	if (goog.isDefAndNotNull(renderProps.backgroundColor)) {
	    this.PlaneV_.setBackground(
		ViewableGroup.getRenderProperties().backgroundColor);
	}

	if (goog.isDefAndNotNull(renderProps.camera)) {
	    this.PlaneV_.setCamera(
		ViewableGroup.getRenderProperties().camera);
	}
    } 

    //
    // Otherwise just set the default camera
    //
    else {
	this.PlaneV_.setBackground();
	this.PlaneV_.setCamera();
    }

    //------------------------------------------ 
    //
    //  IMPORTANT!!!!!!!!!       DO NOT ERASE!!!
    //
    //  You have to add xObject to one plane at a time as opposed to 
    //  all at once.  If there are volumes, we start with the
    //  this.primaryRenderPlane_ 
    //
    //  IF THERE ARE NO VOLUMES, we feed everthing into the 3D renderer.
    //
    //------------------------------------------
    if (this.currXObjects_['volumes'].length > 0) {
	
	// Get the first ON plane.
	var Planes = this.getPlanes();
	var key = '';
	for (key in Planes) {
	    if (Planes[key].isOn()){
		this.setPrimaryRenderPlane(Planes[key]);
		break;
	    }
	}
	
	// Then render
	this.renderAllPlanes();

    } else if (this.PlaneV_.isOn()) {
	this.render3dPlane();
    }
}




/**
 * @param {Array.<X.object>} xObjects
 * @public
 */
xiv.vis.XtkEngine.prototype.renderNonPrimary_ = function(xObjects){
    goog.object.forEach(this.getPlanes(), function(Plane, planeOr){

	// We already rendered the primary plane
	if ((Plane == this.primaryRenderPlane_) ||
	   !Plane.isOn()) { return };

	// Add objects to other planes.
	goog.array.forEach(xObjects, function(xObj){
	    Plane.add(xObj);
	})

	// Then render them.
	Plane.render();
    })
}



/**
 * @return {X.Volume}
 * @public
 */
xiv.vis.XtkEngine.prototype.getSelectedVolume = function(){

    //window.console.log("\n*\n*\n*\n*\n*\n*GET SELECTED VOLUME!");

    if (this.currXObjects_['volumes'].length == 0) {return};

    //
    // First look for the selected volume
    //
    var i = 0;
    var len = this.currXObjects_['volumes'].length;
    for (; i<len; i++){
	var vol = this.currXObjects_['volumes'][i];
	if (vol['isSelectedVolume']){
	    //window.console.log("\n*\n*\n*\n*\n*\n*SELECTED VOLUME FOUND!");
	    return vol;
	}
    }

    //
    // Default to the first volume if no selected volume
    //
    //window.console.log("\n*\n*\n*\n*\n*\n*SELECTED VOLUME NOT FOUND!");
    this.currXObjects_['volumes'][0]['isSelectedVolume'] = true;
    return this.currXObjects_['volumes'][0];
    
}



/**
 * @public
 */
xiv.vis.XtkEngine.prototype.updateStyle = function(){
    goog.object.forEach(this.getPlanes(), function(plane, key) { 
	plane.updateStyle();
    }.bind(this))
}



/**
 * @param {!X.Object} xObj 
 * @param {!gxnat.vis.RenderProperties} renderProperties 
 * @private
 */
xiv.vis.XtkEngine.setRenderProperties_Mesh_ = 
function(xObj, renderProperties){
    xObj.color = renderProperties.color || [.5,.5,.5];
    xObj.opacity = renderProperties.opacity || 1;

}


/**
 * @param {!X.Object} xObj 
 * @param {!gxnat.vis.RenderProperties} renderProperties 
 * @private
 */
xiv.vis.XtkEngine.setRenderProperties_Volume_ = 
function(xObj, renderProperties){

    if (!goog.isDefAndNotNull(renderProperties)) {  
	renderProperties = {
	    origin: [0,0,0],
	    upperThreshold: 10000,
	    lowerThreshold: -10000,
	    isSelectedVolume: true,
	    volumeRendering: false
	}
    };

    //
    // Origin
    //
    xObj.origin = renderProperties.origin;

    //
    // Upper threshold
    //
    xObj.upperThreshold = renderProperties.upperThreshold;

    //
    // Lower threshold
    //
    xObj.lowerThreshold = renderProperties.lowerThreshold;

    //
    // Volume Rendering
    //
    xObj.volumeRendering = renderProperties.volumeRendering;


    //
    // Selected Volume
    //
    xObj['isSelectedVolume'] = renderProperties.isSelectedVolume;
    

    if (goog.isDefAndNotNull(renderProperties.labelMapFile)){
	xObj.labelmap.file = renderProperties.labelMapFile;
	xObj.labelmap.colortable.file = 
	    renderProperties.labelMapColorTableFile;
    }
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.onRendering_ = function(e){
    //window.console.log("ON RENDERING - ENGINE! ", e.value);

    if (e.value == 1){

	//
	// DANGEROUS!  Hacky way of calling RenderEnd but XTK kicks back
	// errors if we call RENDER_END this early.
	//
	if (!this.renderEndCalled_) {

	    this.dispatchEvent({
		type: xiv.vis.RenderEngine.EventType.RENDERING,
		value: e.value
	    })
	    
	   var timer = goog.Timer.callOnce(function(){


		this.onRenderEnd_(e);
		this.renderEndCalled_ = true;
	   }.bind(this), 500)
	}
    }
    
    else {
	this.dispatchEvent({
	    type: xiv.vis.RenderEngine.EventType.RENDERING,
	    value: e.value
	})
    }
}



/**
 * @param {Event}
 * @private
 */
xiv.vis.XtkEngine.prototype.onRenderEnd_ = function(e){
    //window.console.log("\n\nON RENDER END EGINE!");
    this.dispatchEvent({
	type: xiv.vis.RenderEngine.EventType.RENDER_END,
	value: e.value
    })
}



/**
 * @return {xiv.vis.XtkPlane}
 */
xiv.vis.XtkEngine.prototype.getPlaneX = function () {
    return this.PlaneX_;
}


/**
 * @return {xiv.vis.XtkPlane}
 */
xiv.vis.XtkEngine.prototype.getPlaneY = function () {
    return this.PlaneY_;
}


/**
 * @return {xiv.vis.XtkPlane}
 */
xiv.vis.XtkEngine.prototype.getPlaneZ = function () {
    return this.PlaneZ_;
}


/**
 * @return {xiv.vis.XtkPlane}
 */
xiv.vis.XtkEngine.prototype.getPlaneV = function () {
    return this.PlaneV_;
}






/**
 * @return {Array.<xiv.vis.XtkPlane>}
 */
xiv.vis.XtkEngine.prototype.getPlanes = function () {
    var obj  = {};
    obj[this.PlaneX_.getOrientation()] = this.PlaneX_;
    obj[this.PlaneY_.getOrientation()] = this.PlaneY_;
    obj[this.PlaneZ_.getOrientation()] = this.PlaneZ_;
    obj[this.PlaneV_.getOrientation()] = this.PlaneV_;
    return obj;
}



/**
 * @inheritDoc
 */
xiv.vis.XtkEngine.prototype.dispose = function () {
    goog.base(this, 'dispose');
    
    if (goog.isDefAndNotNull(this.ControllerTree_)){
 	this.ControllerTree_.dispose();
	delete this.ControllerTree_;
    }


    goog.events.removeAll(this.PlaneX_);
    goog.events.removeAll(this.PlaneY_);
    goog.events.removeAll(this.PlaneZ_);
    goog.events.removeAll(this.PlaneV_);


    delete this.primaryRenderPlane_;

    this.PlaneX_.dispose();
    delete this.PlaneX_;

    this.PlaneY_.dispose();
    delete this.PlaneY_;

    this.PlaneZ_.dispose();
    delete this.PlaneZ_;

    this.PlaneV_.dispose();
    delete this.PlaneV_;

    delete this.renderEndCalled_;
}



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.volumeExtensions_ = [
    'nrrd', 
    'nii', 
    'nii.gz', 
    'mgh', 
    'mgz', 
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.dicomExtensions_ = [
    'dicom', 
    'dcm',
    'ima',
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.analyzeExtensions_ = [
    'hdr',
    'img'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.niftiExtensions_ = [
    'nii',
    'nii.gz'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.imageExtensions_ = [
    'jpeg',
    'jpg',
    'gif',
    'png',
    'img'
];





/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.vis.XtkEngine.meshExtensions_ = [
    'stl',
    'vtk',
    'obj',
    'fsm',
    'inflated',
    'smoothwm',
    'pial',
    'orig'
];




/**
 * @const
 * @type {Array.<string>}
 */
xiv.vis.XtkEngine.fiberExtensions_ = [
    'trk'
];





/**
 * Returns XTK object (mesh, volume, ...) to be created, as determined by
 * file extension. https://github.com/xtk/X/wiki/X%3AFileformats
 *
 * @param {string} ext Extension of file, all lowercase
 * @return {Object} New X object
 */
xiv.vis.XtkEngine.generateXtkObjectFromExtension = function(ext) {
    var obj = undefined;
    if (this.isMesh(ext)) { 
	obj = new X.mesh();
    } else if (this.isVolume(ext) || this.isDicom(ext) || this.isImage(ext)){
	obj = new X.volume();
	obj.reslicing = false;
    } else if (this.isFiber(ext)){
	obj = new X.fibers();
    } else {

    }
    return obj;
};




/**
 * Makes an annotation by creating a sphere
 * and applying the relevant parameters to that
 * sphere (center, name, color, radius, etc.).
 * 
 * @param {!gxnat.slicer.AnnotationsNode} annotationsNode
 * @param {number=} opt_radius The optional radius.
 * @return {X.sphere}
 */
xiv.vis.XtkEngine.createAnnotation = 
function(annotationsNode, opt_radius) {

    var annotation = new X.sphere();
    annotation.center = annotationsNode.position;
    annotation.caption = annotationsNode.name;
    annotation.name = annotationsNode.name;
    annotation.radius = (opt_radius === undefined) ? 3 : opt_radius;
    annotation.color = [10,0,0];

    //window.console.log(annotationObj['opacity'], annotationObj['visible']);
    //annotation.opacity = annotationObj['opacity'];
    //annotation.visible = annotationObj['visible'];
    
    //window.console.log("\n\n\n\t\tANNOT", annotation);
    return annotation;
};





/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK volume.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isVolume = function(ext) {
     return (this.volumeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is paret of an image set.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isImage = function(ext) {
     return (this.imageExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a DICOM set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isDicom = function(ext) {
     return (this.dicomExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an Analyze set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isAnalyze = function(ext) {
     return (this.analyzeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a NIFTI set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isNifti = function(ext) {
     return (this.niftiExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK mesh.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isMesh = function(ext) {
    return (this.meshExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK fiber bundle.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isFiber = function(ext) {
   return (this.fiberExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * @return {Object.<string, Array>}
 */
xiv.vis.XtkEngine.ViewablesObject = {
    'fibers': [],
    'volumes': [],
    'dicoms': [],
    'analyze': [],
    'nifti': [],
    'meshes':[],
    'annotations': [],
    'images':[]
}



/**
 * Returns the type of the object associated with the given file type. 
 * The object type will be either 'volume', 'mesh', or 'fiber'.
 *
 * @param {!string | !Array.<string>} fileCollection The files to 
 *    categorize based on X.Objects.
 * @return {!string | !Array.<string>}
 */

xiv.vis.XtkEngine.getViewables = function(fileCollection) {

    //-------------------------	
    // Get an empty viewables object for storage.
    //-------------------------	    
    var viewableTypes = 
	goog.object.clone(xiv.vis.XtkEngine.ViewablesObject);
    
    

    //-------------------------	
    // Make 'fileCollection' an array if it's not.
    //-------------------------	
    if (!goog.isArray(fileCollection)) { fileCollection = [fileCollection] }



    //-------------------------	
    // Loop through fileCollection the first time
    // for Slicer files and fiber bundles.  The mrmls, for instance
    // take priority over the other node files.
    //-------------------------	
    var basename = '';
    var ext = '';
    for (var i = 0, len = fileCollection.length; i < len; i++) {
	basename = goog.string.path.basename(fileCollection[i]).toLowerCase();
	ext = goog.string.path.extension(basename);

	//window.console.log("IS DICOM", ext, this.isDicom(ext));
	//
	// Skip if the filename starts with a period
	//
	if (goog.string.startsWith(basename, '.')) continue;
	
	if (ext === 'mrml') { 
	    viewableTypes['slicer'].push(fileCollection[i]);
	
	} else if (this.isVolume(ext)) {
	    viewableTypes['volumes'].push(fileCollection[i]);

	} else if (this.isDicom(ext)) {
	    viewableTypes['dicoms'].push(fileCollection[i]);

	} else if (this.isMesh(ext)){
	    viewableTypes['meshes'].push(fileCollection[i]);

	} else if (this.isFiber(ext)){
	    viewableTypes['fibers'].push(fileCollection[i]);

	} else if (this.isImage(ext)){
	    viewableTypes['images'].push(fileCollection[i]);

	} 
    }
    


    //-------------------------	
    // Rerturn the constructed 'viewableTypes' object.
    //-------------------------	
    window.console.log("VIEWABLE TYPES", viewableTypes);


    //----------------
    // Cull Empty Viewables
    //----------------
    goog.object.forEach(viewableTypes, function(vbl, key){
	if (!vbl.length){
	    goog.object.remove(viewableTypes, key); 
	}
    })
    //window.console.log("VIEWABLE TYPES - culled", viewableTypes);
    return viewableTypes
}




/**
 * Creates and returns a new X object, generating
 * the type of X object by the extension provided in
 * the fileCollection.
 *
 * @param {!string | !Array.<string>}
 * @return {X.Object}
 */
xiv.vis.XtkEngine.createXObject = function(fileCollection) {

    //window.console.log("FILE COLLECT", fileCollection);fileCollection[0]
    var ext = (goog.isArray(fileCollection)) ? 
	nrg.string.getFileExtension(fileCollection[0]) : 
	nrg.string.getFileExtension(fileCollection);
    var obj = this.generateXtkObjectFromExtension(ext);  
    
    if (!goog.isDefAndNotNull(obj)){
	var errorString = 'No renderable files in the set :(<br>';
	throw new Error(errorString);
    }
	
    var urlEncode = function(url){
	var dirname = nrg.string.dirname(url);
	var basename = nrg.string.basename(url);

	//
	// Four doubly encododed basenames
	//
	if ((basename.indexOf('%') > -1) || (basename.indexOf(' ') > -1)){
	    basename = goog.string.urlEncode(basename);
	}

	//console.log("\n\n*********RETN", dirname ,   basename);
	return dirname + '/' + basename
    }

    //
    // URL decode
    //
    if (goog.isArray(fileCollection)){
	var newFileCollection = [];
	goog.array.forEach(fileCollection, function(fileName){
	    newFileCollection.push(urlEncode(fileName));
	})
	fileCollection = newFileCollection;
	
    } else {
	fileCollection = urlEncode(fileCollection)
    }


    //console.log("FIRST", fileCollection, obj);  


    
    obj.file = fileCollection;



    //console.log(obj);
    //return
    return obj;
}



goog.exportSymbol('xiv.vis.XtkEngine.EventType', xiv.vis.XtkEngine.EventType);
goog.exportSymbol('xiv.vis.XtkEngine.ID_PREFIX', xiv.vis.XtkEngine.ID_PREFIX);
goog.exportSymbol('xiv.vis.XtkEngine.ANATOMICAL_TO_CARTESIAN',
	xiv.vis.XtkEngine.ANATOMICAL_TO_CARTESIAN);
goog.exportSymbol('xiv.vis.XtkEngine.generateXtkObjectFromExtension',
	xiv.vis.XtkEngine.generateXtkObjectFromExtension);
goog.exportSymbol('xiv.vis.XtkEngine.createAnnotation',
	xiv.vis.XtkEngine.createAnnotation);
goog.exportSymbol('xiv.vis.XtkEngine.isVolume', xiv.vis.XtkEngine.isVolume);
goog.exportSymbol('xiv.vis.XtkEngine.isImage', xiv.vis.XtkEngine.isImage);
goog.exportSymbol('xiv.vis.XtkEngine.isDicom', xiv.vis.XtkEngine.isDicom);
goog.exportSymbol('xiv.vis.XtkEngine.isAnalyze', xiv.vis.XtkEngine.isAnalyze);
goog.exportSymbol('xiv.vis.XtkEngine.isNifti', xiv.vis.XtkEngine.isNifti);
goog.exportSymbol('xiv.vis.XtkEngine.isMesh', xiv.vis.XtkEngine.isMesh);
goog.exportSymbol('xiv.vis.XtkEngine.isFiber', xiv.vis.XtkEngine.isFiber);
goog.exportSymbol('xiv.vis.XtkEngine.ViewablesObject',
	xiv.vis.XtkEngine.ViewablesObject);

goog.exportSymbol('xiv.vis.XtkEngine.getViewables',
	xiv.vis.XtkEngine.getViewables);
goog.exportSymbol('xiv.vis.XtkEngine.createXObject',
	xiv.vis.XtkEngine.createXObject);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.setVPlaneOn',
	xiv.vis.XtkEngine.prototype.setVPlaneOn);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.setPrimaryRenderPlane',
	xiv.vis.XtkEngine.prototype.setPrimaryRenderPlane);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.updateControllers',
	xiv.vis.XtkEngine.prototype.updateControllers);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getControllers3D',
	xiv.vis.XtkEngine.prototype.getControllers3D);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getControllers2D',
	xiv.vis.XtkEngine.prototype.getControllers2D);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.render3dPlane',
	xiv.vis.XtkEngine.prototype.render3dPlane);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.renderAllPlanes',
	xiv.vis.XtkEngine.prototype.renderAllPlanes);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.render',
	xiv.vis.XtkEngine.prototype.render);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getSelectedVolume',
	xiv.vis.XtkEngine.prototype.getSelectedVolume);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.updateStyle',
	xiv.vis.XtkEngine.prototype.updateStyle);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlaneX',
	xiv.vis.XtkEngine.prototype.getPlaneX);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlaneY',
	xiv.vis.XtkEngine.prototype.getPlaneY);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlaneZ',
	xiv.vis.XtkEngine.prototype.getPlaneZ);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlaneV',
	xiv.vis.XtkEngine.prototype.getPlaneV);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlanes',
	xiv.vis.XtkEngine.prototype.getPlanes);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.dispose',
	xiv.vis.XtkEngine.prototype.dispose);
