/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.vis.XtkEngine');


// goog
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.string.path');

// X
goog.require('X.mesh');
goog.require('X.volume');
goog.require('X.fibers');
goog.require('X.sphere');
goog.require('X.object');
goog.require('X.renderer');
goog.require('X.renderer2D');
goog.require('X.renderer3D');

// nrg
goog.require('nrg.string');

// gxnat
goog.require('gxnat.vis.ViewableGroup');
goog.require('gxnat.vis.RenderProperties');
goog.require('gxnat.slicerNode.Annotations');


// xiv
goog.require('xiv.vis.XtkPlane');
goog.require('xiv.vis.XtkPlane2D');
goog.require('xiv.vis.XtkPlane3D');
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.XtkControllerTree');

//-----------



/**
 * @extends {xiv.vis.RenderEngine}
 * @constructor
 */
xiv.vis.XtkEngine = function () {
    goog.base(this);
    

    /**
     * @type {!xiv.ui.ctrl.XtkControllerTree}
     * @private
     */
    this.ControllerTree_ = null;



    /**
     * @type {!Object.<string, X.object>}
     * @private
     */
    this.currXObjects_ = {
	'volumes' : [],
	'meshes' : [],
	'fibers' : [],
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
     * @type {Object.<string, xiv.vis.XtkPlane>}
     * @private
     */
    this.Planes_ = {}
    this.Planes_[this.PlaneX_.getOrientation()] = this.PlaneX_;
    this.Planes_[this.PlaneY_.getOrientation()] = this.PlaneY_;
    this.Planes_[this.PlaneZ_.getOrientation()] = this.PlaneZ_;
    this.Planes_[this.PlaneV_.getOrientation()] = this.PlaneV_;



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
 * @type {!string} 
 * @const
 * @expose
 */
xiv.vis.XtkEngine.SLICE_TO_RAS_KEY =  'sliceToRAS' + 
    goog.string.createUniqueString();



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY =  'hasLabelMap';



/**
 * @type {!boolean}
 * @private
 */
xiv.vis.XtkEngine.prototype.renderEndCalled_ = false;



/**
 * @return {!Array.<X.object>} 
 * @private
 */
xiv.vis.XtkEngine.prototype.getCurrentVolumes = function() {
    return this.currXObjects_['volumes'];
}



/**
 * @return {!Array.<X.object>} 
 * @private
 */
xiv.vis.XtkEngine.prototype.getCurrentMeshes = function() {
    return this.currXObjects_['meshes'];
}



/**
 * @return {!Array.<X.object>} 
 * @private
 */
xiv.vis.XtkEngine.prototype.getCurrentAnnotations = function() {
    return this.currXObjects_['spheres'];
}



/**
 * @param {gxnat.vis.ViewableGroup} ViewableGroup
 * @private
 */
xiv.vis.XtkEngine.prototype.extractAnnotations_ = function(ViewableGroup) {
    if (!goog.isDefAndNotNull(ViewableGroup.getRenderProperties().annotations))
	{ return }

    goog.array.forEach(ViewableGroup.getRenderProperties().annotations,
		       function(annotationsNode){
			   this.currXObjects_['spheres'].push(
			       this.createAnnotation_(annotationsNode))
		       }.bind(this))
}



/**
 * @param {!string} plane
 * @param {!boolean} on
 * @public
 */
xiv.vis.XtkEngine.prototype.setPlaneEnabled = function(plane, on) {

    switch(plane.toLowerCase()){
	case 'x':
	this.PlaneX_.setEnabled(on);
	break;

	case 'y':
	this.PlaneY_.setEnabled(on);
	break;

	case 'z':
	this.PlaneZ_.setEnabled(on);
	break;

	case 'v':
	this.PlaneV_.setEnabled(on);
	break;
    }
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
 * @return {xiv.vis.XtkPlane}
 * @public
 */
xiv.vis.XtkEngine.prototype.getPrimaryRenderPlane = function() {
    return this.primaryRenderPlane_;
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
    // Re-listen on the primary
    this.primaryRenderPlane_.init();
    this.renderKey_ = goog.events.listen(
	this.primaryRenderPlane_, 
	xiv.vis.RenderEngine.EventType.RENDERING, 
	this.onRendering_.bind(this))
}



/**
 * @public
 */
xiv.vis.XtkEngine.prototype.updateControllers = function(){
    this.ControllerTree_.updateControllers();
}



/**
 * @return {xiv.ui.ctrl.XtkControllerTree}
 * @public
 */
xiv.vis.XtkEngine.prototype.getControllerTree = function(){
    return this.ControllerTree_;
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
	this.extractAnnotations_(ViewableGroup);
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
	//window.console.log('f', ViewableGroup, Viewable, Viewable.getFiles());
	currXObj = this.createXObject_(fileList, Viewable.getFileData());
	renderProps = Viewable.getRenderProperties();

	if (!currXObj) { return }
	//window.console.log('here2');
	//
	// Create controllers
	//
	this.ControllerTree_.createControllers(currXObj, renderProps);
	//window.console.log('here12');
	// Volumes
	if (currXObj instanceof X.volume) {

	    if (ViewableGroup.getCategory().toLowerCase() == 'scans'){
		//window.console.log('Turning off reslicing for scan');
		//currXObj['reslicing'] = false;
		//currXObj['transform'].rotateX(45);
		//currXObj['transform'].rotateY(45);
		//currXObj['transform'].rotateZ(45);
		//window.console.log(currXObj['transform']);
	    }
	    xiv.vis.XtkEngine.setRenderProperties_Volume_(
		currXObj, renderProps);
	    this.currXObjects_['volumes'].push(currXObj);
	    //window.console.log('\n\nreslicing', currXObj['reslicing']);
	    //window.console.log('\n\nreslicing', currXObj['transform']);
	    //window.console.log(currXObj, currXObj['dimensionsRAS']);
	}

	// Meshes
	else if (currXObj instanceof X.mesh){
	    xiv.vis.XtkEngine.setRenderProperties_Mesh_(
		currXObj, renderProps);
	    this.currXObjects_['meshes'].push(currXObj);
	}

	// Fibers
	else if (currXObj instanceof X.fibers){
	    xiv.vis.XtkEngine.setRenderProperties_Fiber_(
		currXObj, renderProps);
	    this.currXObjects_['fibers'].push(currXObj);
	}
    }.bind(this))
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.render3dPlane = function(){
    // 
    // set the primary render plane to 3d
    //
    this.setPrimaryRenderPlane(this.PlaneV_);

    //
    // Initialize
    //
    this.PlaneV_.init();

    //
    // Add object
    //
    goog.object.forEach(this.currXObjects_, function(xObjArr, key){
	if (key !== 'volumes'){
	    goog.array.forEach(xObjArr, function(xObj){
		this.PlaneV_.add(xObj);
		//this.PlaneX_.add(xObj);
	    }.bind(this))
	}
    }.bind(this))

    //
    // Render end
    //
    goog.events.listenOnce(
	this.PlaneV_.getRenderer(), 
	xiv.vis.RenderEngine.EventType.RENDER_END, 
	function(e){
	    this.onRenderEnd_();
	    this.PlaneX_.render();
	}.bind(this))

    //
    // OK, render!
    //
    this.PlaneV_.render();
}



/**
 * @param {X.volume=} opt_volume The optional volume to render.  Defaults to 
 *    the selected volume.
 * @public
 */
xiv.vis.XtkEngine.prototype.render2D = function(opt_volume){
    var volume = goog.isDefAndNotNull(opt_volume) ? opt_volume :
	this.getSelectedVolume();
    goog.object.forEach(this.Planes_, function(Plane, planeOr){
	if (planeOr.toLowerCase() == 'v') { return }
	Plane.init();
	Plane.add(volume);
	Plane.render();    
    })  
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.hideNonSelectedVolumes_ = function(){
    var selVol = this.getSelectedVolume();
    goog.object.forEach(this.currXObjects_['volumes'], function(vol){
	if (vol !== selVol){
	    vol.visible = false;
	}
    })
}




/**
 * @public
 */
xiv.vis.XtkEngine.prototype.renderAllPlanes = function(){
    var selectedVolume = this.getSelectedVolume();
    var nonVolumes = [];
    var volumes = [];
    var planeArr = ['x','y','z','v'];

    //
    // Store all non-volume objects.
    //
    goog.object.forEach(this.currXObjects_, function(xObjArr, key){
	currArr = (key == 'volumes') ? volumes : nonVolumes;
	goog.array.forEach(xObjArr, function(xObj){
	   currArr.push(xObj);
	})
    }.bind(this))
    //window.console.log('VOLUMES', volumes);
    //window.console.log('SELECTED VOLUMES', selectedVolume);

    //
    // Add all non-volumes to PlaneV
    //
    goog.array.forEach(nonVolumes, function(xObj){
	this.PlaneV_.add(xObj);
    }.bind(this))


    //
    // Add all the other volumes to plane V
    //
    goog.array.forEach(volumes, function(vol){
	if (vol !== selectedVolume){
	    vol['visible'] = true;
	    this.PlaneV_.add(vol);
	}
    }.bind(this))

    //
    // Render only non-primary's selected volume once the primary is finished.
    //

    /**
     * @type {X.renderer}
     */
    var renderer = this.primaryRenderPlane_.getRenderer();


    renderer['onShowtime'] = function(){
	var ors = goog.array.remove(planeArr, 
		this.primaryRenderPlane_.getOrientation().toLowerCase());
	this.renderNonPrimary_(selectedVolume, ors);
    }.bind(this);

    //
    // Render!
    //
    this.primaryRenderPlane_.add(selectedVolume);
    this.primaryRenderPlane_.render();
}



/**
 * @param {!gxnat.vis.ViewableGroup} ViewableGroup
 * @return {Array.<xiv.vis.XtkPlane>}
 */
xiv.vis.XtkEngine.prototype.render = function (ViewableGroup) {

    this.renderEndCalled_ = false;
    //window.console.log('currXObjects', this.currXObjects_);

    //
    // Create the XObjects
    //
    this.createXObjects_(ViewableGroup);
    //window.console.log('currXObjects2', this.currXObjects_);
    
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
	    if (Planes[key].isEnabled()){
		this.setPrimaryRenderPlane(Planes[key]);
		break;
	    }
	}
	//window.console.log("PRIM", this.primaryRenderPlane_);
	// Then render
	this.renderAllPlanes();

    } else if (this.PlaneV_.isEnabled()) {
	this.render3dPlane();
    }
}




/**
 * @param {!X.volume} xVolume
 * @param {!Array.string} planeOrientations
 * @public
 */
xiv.vis.XtkEngine.prototype.renderNonPrimary_ = 
function(xVolume, planeOrientations){
    var unrenderedNonPrimary = goog.object.getCount(this.getPlanes()) - 1;

    goog.object.forEach(this.getPlanes(), function(Plane, planeOr){
	//
	// We already rendered the primary plane, so we skip that
	// or any plane that has been turned off
	//
	if ((Plane == this.primaryRenderPlane_) ||
	   !Plane.isEnabled()) { return };

	//
	// Add the volume to the other planes.
	//
	Plane.add(xVolume);

	//
	// Count down the amount of renderers that have finsished
	//
	goog.events.listenOnce(
	    Plane.getRenderer(), xiv.vis.RenderEngine.EventType.RENDER_END, 
	    function(e){
		
		unrenderedNonPrimary--;
		/*
		window.console.log("RENDER END!", Plane.getOrientation(),
				  unrenderedNonPrimary);
				  */
	
		//
		// When all renderers have finished, run onRenderEnd_
		//
		if (unrenderedNonPrimary == 0){
		    this.onRenderEnd_();
		}
	    }.bind(this))

	//
	// Then render each plane!
	//
	Plane.render();
    }.bind(this))
}



/**
 * @return {X.volume}
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
	if (vol[xiv.vis.RenderEngine.SELECTED_VOL_KEY]){
	    //window.console.log("\n*\n*\n*\n*\n*\n*SELECTED VOLUME FOUND!");
	    return vol;
	}
    }

    //
    // Default to the first volume if no selected volume
    //
    //window.console.log("\n*\n*\n*\n*\n*\n*SELECTED VOLUME NOT FOUND!");
    this.currXObjects_['volumes'][0]
    [xiv.vis.RenderEngine.SELECTED_VOL_KEY] = true;
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
 * @param {!X.object} xObj 
 * @param {!gxnat.vis.RenderProperties} renderProperties 
 * @private
 */
xiv.vis.XtkEngine.setRenderProperties_Mesh_ = 
function(xObj, renderProperties){
    //window.console.log('here1');
    xObj['color'] = renderProperties.color || [.5,.5,.5];
    xObj['opacity'] = renderProperties.opacity || 1;
}


/**
 * @param {!X.object} xObj 
 * @param {!gxnat.vis.RenderProperties} renderProperties 
 * @private
 */
xiv.vis.XtkEngine.setRenderProperties_Volume_ = 
function(xObj, renderProperties){
    //window.console.log('here2a');
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
    xObj['origin'] = renderProperties.origin;

    //
    // Upper threshold
    //
    xObj['upperThreshold'] = renderProperties.upperThreshold;

    //
    // Lower threshold
    //
    xObj['lowerThreshold'] = renderProperties.lowerThreshold;

    //
    // Volume Rendering
    //
    xObj['volumeRendering'] = renderProperties.volumeRendering;


    //
    // Selected Volume
    //
    xObj[xiv.vis.RenderEngine.SELECTED_VOL_KEY] = 
	renderProperties.isSelectedVolume;

    //
    // Slice to RAS
    //
    xObj[xiv.vis.XtkEngine.SLICE_TO_RAS_KEY] = renderProperties.sliceToRAS;


    if (goog.isDefAndNotNull(renderProperties.labelMapFile)){
	xObj['labelmap']['file'] = renderProperties.labelMapFile;
	xObj['labelmap']['colortable']['file'] = 
	    renderProperties.labelMapColorTableFile;
	xObj[xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY] = true;
	//window.console.log(renderProperties.labelMapColorTableFile);
    } else {
	xObj[xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY] = false;
    }
}



/**
 * @private
 */
xiv.vis.XtkEngine.prototype.onRendering_ = function(e){
    //window.console.log("ON RENDERING - ENGINE! ", e.value);
    if (!this.renderEndCalled_) {
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
    /**
    window.console.log("\n\nON RENDER END ENGINE!", 
		       this.PlaneX_.getVolume(), 'RAS', 
		       this.PlaneX_.getVolume().dimensionsRAS);
    */
    

    //
    // Hide non-selected volumes
    //
    // NOTE: This is to accommodate for an XTK bug, where if a volume's
    // visibility is set to false, and it is then added to a renderer,
    // the renderer will not render it.
    //
    this.hideNonSelectedVolumes_();

    //
    // Unlisten for the rendering
    //
    goog.events.unlistenByKey(this.renderKey_);
    this.renderEndCalled_ = true;

 
    this.dispatchEvent({
	type: xiv.vis.RenderEngine.EventType.RENDER_END,
	value: goog.isDefAndNotNull(e) ? e.value : 1
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
 * @param {!string}
 * @return {xiv.vis.XtkPlane}
 */
xiv.vis.XtkEngine.prototype.getPlaneByOrientation = function (or) {
    return this.Planes_[or];
}



/**
 * @return {Array.<xiv.vis.XtkPlane>}
 */
xiv.vis.XtkEngine.prototype.getPlanes = function () {
    return this.Planes_;
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
 * @private
 */
xiv.vis.XtkEngine.prototype.generateXtkObjectFromExtension_ = function(ext) {
    var obj = undefined;
    if (xiv.vis.XtkEngine.isMesh(ext)) { 
	obj = new X.mesh();
    } else if (xiv.vis.XtkEngine.isVolume(ext) || 
	       xiv.vis.XtkEngine.isDicom(ext) || 
	       xiv.vis.XtkEngine.isImage(ext)){
	obj = new X.volume();
    } else if (xiv.vis.XtkEngine.isFiber(ext)){
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
 * @param {!gxnat.slicerNode.Annotations} annotationsNode
 * @param {number=} opt_radius The optional radius.
 * @return {X.sphere}
 * @private
 */
xiv.vis.XtkEngine.prototype.createAnnotation_ = 
function(annotationsNode, opt_radius) {

    var annotation = new X.sphere();
    annotation['center'] = annotationsNode.position;
    annotation['caption'] = annotationsNode.name;
    annotation['name'] = annotationsNode.name;
    annotation['radius'] = (opt_radius === undefined) ? 3 : opt_radius;
    annotation['color'] = [.85,0,0];

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
     return (xiv.vis.XtkEngine.volumeExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is paret of an image set.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isImage = function(ext) {
     return (xiv.vis.XtkEngine.imageExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a DICOM set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isDicom = function(ext) {
     return (xiv.vis.XtkEngine.dicomExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an Analyze set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isAnalyze = function(ext) {
     return (xiv.vis.XtkEngine.analyzeExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a NIFTI set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isNifti = function(ext) {
     return (xiv.vis.XtkEngine.niftiExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK mesh.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isMesh = function(ext) {
    return (xiv.vis.XtkEngine.meshExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK fiber bundle.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.vis.XtkEngine.isFiber = function(ext) {
   return (xiv.vis.XtkEngine.fiberExtensions_.indexOf(ext) > -1 ) ?  
	true: false;
}




/**
 * Creates and returns a new X object, generating
 * the type of X object by the extension provided in
 * the fileCollection.
 *
 * @param {!string | !Array.<string>} fileCollection
 * @param {!string | !Array} opt_fileData
 * @private
 * @return {X.object}
 */
xiv.vis.XtkEngine.prototype.createXObject_ = 
function(fileCollection, opt_fileData) {

    //window.console.log("FILE COLLECT", fileCollection);
    var ext = (goog.isArray(fileCollection)) ? 
	nrg.string.getFileExtension(fileCollection[0]) : 
	nrg.string.getFileExtension(fileCollection);

    var obj = this.generateXtkObjectFromExtension_(ext);  
    
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
	    //basename = goog.string.urlEncode(basename);
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

    //window.console.log("Fildedata", opt_fileData);
    if (goog.isDefAndNotNull(opt_fileData)){
	obj['file'] = goog.object.getKeys(opt_fileData);
	obj['filedata'] = goog.object.getValues(opt_fileData);
    } else {
	obj['file'] = fileCollection;
    }


    //console.log(obj);
    //return
    return obj;
}




/**
 * @inheritDoc
 */
xiv.vis.XtkEngine.prototype.dispose = function () {
    goog.base(this, 'dispose');
    //window.console.log("ENGINE DISPOSE");
    if (goog.isDefAndNotNull(this.ControllerTree_)){
 	this.ControllerTree_.dispose();
	delete this.ControllerTree_;
    }


    goog.events.removeAll(this.PlaneX_);
    goog.events.removeAll(this.PlaneY_);
    goog.events.removeAll(this.PlaneZ_);
    goog.events.removeAll(this.PlaneV_);
  


    delete this.primaryRenderPlane_;

    goog.object.clear(this.Planes_);
    delete this.Planes_;


    this.PlaneX_.dispose();
    delete this.PlaneX_;

    this.PlaneY_.dispose();
    delete this.PlaneY_;

    this.PlaneZ_.dispose();
    delete this.PlaneZ_;

    this.PlaneV_.dispose();
    delete this.PlaneV_;


    goog.object.forEach(this.currXObjects_, function(objArr){
	goog.object.forEach(objArr, function(obj){
	    goog.events.removeAll(obj)
	    //obj.destroy();
	    goog.object.clear(obj);
	})	
    })
    goog.object.clear(this.currXObjects_);
    //window.console.log(this.currXObjects_);
    delete this.currXObjects_;

    delete this.renderEndCalled_;
}




goog.exportSymbol('xiv.vis.XtkEngine.EventType', xiv.vis.XtkEngine.EventType);
goog.exportSymbol('xiv.vis.XtkEngine.ID_PREFIX', xiv.vis.XtkEngine.ID_PREFIX);
goog.exportSymbol('xiv.vis.XtkEngine.ANATOMICAL_TO_CARTESIAN',
	xiv.vis.XtkEngine.ANATOMICAL_TO_CARTESIAN);
goog.exportSymbol('xiv.vis.XtkEngine.SLICE_TO_RAS_KEY',
	xiv.vis.XtkEngine.SLICE_TO_RAS_KEY);
goog.exportSymbol('xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY',
	xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY);

goog.exportSymbol('xiv.vis.XtkEngine.isVolume', xiv.vis.XtkEngine.isVolume);
goog.exportSymbol('xiv.vis.XtkEngine.isImage', xiv.vis.XtkEngine.isImage);
goog.exportSymbol('xiv.vis.XtkEngine.isDicom', xiv.vis.XtkEngine.isDicom);
goog.exportSymbol('xiv.vis.XtkEngine.isAnalyze', xiv.vis.XtkEngine.isAnalyze);
goog.exportSymbol('xiv.vis.XtkEngine.isNifti', xiv.vis.XtkEngine.isNifti);
goog.exportSymbol('xiv.vis.XtkEngine.isMesh', xiv.vis.XtkEngine.isMesh);
goog.exportSymbol('xiv.vis.XtkEngine.isFiber', xiv.vis.XtkEngine.isFiber);


goog.exportSymbol('xiv.vis.XtkEngine.prototype.getCurrentMeshes',
	xiv.vis.XtkEngine.prototype.getCurrentMeshes);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getCurrentAnnotations',
	xiv.vis.XtkEngine.prototype.getCurrentAnnotations);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getCurrentVolumes',
	xiv.vis.XtkEngine.prototype.getCurrentVolumes);

goog.exportSymbol('xiv.vis.XtkEngine.prototype.setPlaneEnabled',
	xiv.vis.XtkEngine.prototype.setPlaneEnabled);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.setPrimaryRenderPlane',
	xiv.vis.XtkEngine.prototype.setPrimaryRenderPlane);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPrimaryRenderPlane',
	xiv.vis.XtkEngine.prototype.getPrimaryRenderPlane);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.updateControllers',
	xiv.vis.XtkEngine.prototype.updateControllers);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getControllerTree',
	xiv.vis.XtkEngine.prototype.getControllerTree);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.render3dPlane',
	xiv.vis.XtkEngine.prototype.render3dPlane);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.render2D',
	xiv.vis.XtkEngine.prototype.render2D);
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
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlaneByOrientation',
	xiv.vis.XtkEngine.prototype.getPlaneByOrientation);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.getPlanes',
	xiv.vis.XtkEngine.prototype.getPlanes);
goog.exportSymbol('xiv.vis.XtkEngine.prototype.dispose',
	xiv.vis.XtkEngine.prototype.dispose);
