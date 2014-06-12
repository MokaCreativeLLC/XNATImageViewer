/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.object');

// nrg
goog.require('nrg.string');

// xiv
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.LayoutFrame');
goog.require('xiv.ui.layouts.interactors.Crosshairs');
goog.require('xiv.ui.layouts.interactors.FrameDisplay');
goog.require('xiv.ui.layouts.interactors.ZoomDisplay');
goog.require('xiv.ui.layouts.interactors.Slider');




/**
 * xiv.ui.layouts.XyzvLayout
 *
 * @constructor
 * @param {string= | Array.<string>=} opt_frames
 * @extends {xiv.ui.layouts.Layout}
 */
goog.provide('xiv.ui.layouts.XyzvLayout');
xiv.ui.layouts.XyzvLayout = function(opt_frames) { 
    goog.base(this);

    opt_frames = goog.isDefAndNotNull(opt_frames) ? opt_frames :
	goog.object.getValues(xiv.ui.layouts.XyzvLayout.FRAMES);
    opt_frames = goog.isArray(opt_frames) ? opt_frames : [opt_frames];

    goog.array.forEach(opt_frames, function(frameTitle, i){
	opt_frames[i] = frameTitle.toUpperCase();
    })
    
    this.validateFrameTitles_(opt_frames);
    this.addLayoutFrames_(opt_frames);
    this.setupLayoutFrames_();
    this.updateStyle();
}
goog.inherits(xiv.ui.layouts.XyzvLayout, xiv.ui.layouts.Layout);
goog.exportSymbol('xiv.ui.layouts.XyzvLayout', xiv.ui.layouts.XyzvLayout);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.TITLE = 'XyzvLayout';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.XyzvLayout.ID_PREFIX =  'xiv.ui.layouts.XyzvLayout';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.FRAMES = {
    X: 'X',
    Y: 'Y',
    Z: 'Z',
    V: 'V'
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.XyzvLayout.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v',
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVERED: 'slider-thumb-hovered',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_X: 'slider-track-x',
    SLIDER_TRACK_Y: 'slider-track-y',
    SLIDER_TRACK_Z: 'slider-track-z',
    FRAMENUMBER: 'framenumber',
}


 
/**
 * @struct
 */
xiv.ui.layouts.XyzvLayout.InteractorSet = 
function(slider, display, crosshairs, zoom) {
    this.SLIDER = slider;
    this.FRAME_DISPLAY = display;
    this.CROSSHAIRS = crosshairs;   
    this.ZOOM_DISPLAY = zoom;   
}
goog.exportSymbol('xiv.ui.layouts.XyzvLayout.InteractorSet', 
		  xiv.ui.layouts.XyzvLayout.InteractorSet);



/**
 * @type {!number}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.resizeMargin = 0;




/**
 * @param {!string} planeOr The plane orientation to apply the boundary to.
 * @param {!string | Array.<string>} resizeDirs The resize directions.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setLayoutFrameResizable = 
function(planeOr, resizeDirs){
    //
    // Set the resize directions
    //
    this.LayoutFrames[planeOr].setResizeDirections(resizeDirs);

    //
    // Create and set the resize boundary
    //
    var boundElt = this.createResizeBoundary(planeOr)
    goog.dom.append(this.getElement(), boundElt);
    boundElt.style.position = 'absolute';
    this.LayoutFrames[planeOr].getResizable().setBoundaryElement(boundElt);

    //
    // IMPORTANT!!!! Update the resize boundary.
    //
    this.LayoutFrames[planeOr].getResizable().update();
}




/**
 * @param {!string} planeOr The plane orientation to apply the boundary to.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.createResizeBoundary = function(planeOr){
    return  goog.dom.createDom('div', {
	'id' : this.constructor.ID_PREFIX + '_ResizeBoundary_' + 
	    planeOr + '_' + goog.string.createUniqueString(),
	'class': goog.getCssName(this.constructor.ELEMENT_CLASS, 
				 planeOr.toLowerCase() + '-resizeboundary')
    })
}



/**
 * @param {!Array.<string>} frameTitles
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.validateFrameTitles_ = 
function(frameTitles){
    //
    // Validate length
    //
    if (frameTitles.length > 
	goog.object.getCount(xiv.ui.layouts.XyzvLayout.FRAMES)){
	throw new Error('Invalid amount of frames ' + frameTitles + 
			'. Must be ' + xiv.ui.layouts.XyzvLayout.FRAMES);
    }

    //
    // Validate values
    //
    goog.array.forEach(frameTitles, function(title){
	if (!goog.object.containsValue(
	    xiv.ui.layouts.XyzvLayout.FRAMES, title)){
	    throw new Error('Invalid frame title ', title);
	}
    }.bind(this))
}




/**
 * @param {!Object} frames
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addLayoutFrames_ = function(frames){
    var planeTitle = '';
    goog.array.forEach(frames, 
	function(title, key){
	    planeTitle = title.toUpperCase();
	    this.addLayoutFrame(new xiv.ui.layouts.LayoutFrame(planeTitle));
	    goog.dom.append(this.getElement(), 
			    this.LayoutFrames[planeTitle].getElement());
	    goog.dom.classes.add(this.LayoutFrames[planeTitle].getElement(), 
				 xiv.ui.layouts.XyzvLayout.CSS[key])
	}.bind(this))
}



/**
 * @public
 * @param{xiv.ui.layout.XyzvLayout} newLayout
 */
xiv.ui.layouts.XyzvLayout.prototype.transferInteractors = function(Layout) {
    Layout.setInteractors(this.getInteractors());
}



/**
 * @public
 * @param {Object.<xiv.ui.layouts.XyzvLayout.InteractorSet>} interactors
 */
xiv.ui.layouts.XyzvLayout.prototype.setInteractors = function(interactors) {
    this.loopXyz(function(LayoutFrame, key) {
	if (goog.isDefAndNotNull(interactors[key])){

	    //
	    // Slider
	    //
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER] =
		interactors[key].SLIDER;
	    goog.dom.removeNode(
		interactors[key].SLIDER.getElement());
	    goog.dom.appendChild(LayoutFrame.getElement(), 
				 interactors[key].SLIDER.getElement());

	    //
	    // Frame Display
	    //
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY] =
		interactors[key].FRAME_DISPLAY;

	    goog.dom.removeNode(
		interactors[key].FRAME_DISPLAY.getElement());
	    goog.dom.appendChild(LayoutFrame.getElement(), 
				 interactors[key].FRAME_DISPLAY.getElement());
	    
	    //window.console.log(interactors[key].FRAME_DISPLAY.getElement())

	    //
	    // Crosshairs
	    //
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS] =
		interactors[key].CROSSHAIRS;
	    goog.dom.appendChild(LayoutFrame.getElement(), 
				interactors[key].CROSSHAIRS.vertical);
	    goog.dom.appendChild(LayoutFrame.getElement(), 
				interactors[key].CROSSHAIRS.horizontal);
	}
    })   
}




/**
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.addInteractors = function() {
    this.removeAllInteractors();
    this.addLayoutFrameSliders_();
    this.addFrameDisplays_();
    this.addZoomDisplays_();
    this.addCrosshairs_();
};




/**
 * @return {Object.<string, xiv.ui.layouts.XyzvLayout.InteractorSet>}
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.getInteractors = function() {
    var interactors = {}
    this.loopXyz(function(LayoutFrame, key) {
	interactors[key] = new xiv.ui.layouts.XyzvLayout.InteractorSet(
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER], 
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY],
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS],
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.ZOOM_DISPLAY])
    }) 
    return interactors
};


/**
 * @param {!string} plane The plane of the layout frame.
 * @return {xiv.ui.layouts.XyzvLayout.InteractorSet}
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.getInteractorsByPlane = function(plane) {
    var LayoutFrame = this.LayoutFrames[plane];
    return new xiv.ui.layouts.XyzvLayout.InteractorSet(
	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER], 
	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY],
	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])

};


/**
 * @param {!string} plane The plane of the layout frame.
 * @param {!string} interactorKey The key of the interactor.
 * @return {xiv.ui.layouts.XyzvLayout.InteractorSet}
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.getInteractorByPlane = 
function(plane, interactorKey) {
    //window.console.log(plane, interactorKey);
    //window.console.log(this.LayoutFrames);
    return this.LayoutFrames[plane][interactorKey];
};


/**
 * @param {!string} plane The plane of the layout frame.
 * @return {xiv.ui.layouts.LayoutFrame}
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.getFrameByPlane = 
function(plane) {
    return this.LayoutFrames[plane];
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addLayoutFrameSliders_ = function(){ 
    var slider;

    this.loopXyz(function(LayoutFrame, key) {			
	    slider = new nrg.ui.Slider('horizontal');
	    slider.render(LayoutFrame.getElement());

	    slider.getElement().id = key + "_LayoutFrameSlider_" +
		goog.string.createUniqueString();


	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER] = slider;



	    goog.dom.classes.addRemove(slider.getElement(), null,
				       [xiv.ui.layouts.XyzvLayout.CSS.SLIDER]);
	    
	    goog.dom.classes.addRemove(slider.getThumb(), null,
			[xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB]);

	    goog.dom.classes.addRemove(slider.getTrack(), null,
			[xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK ,
			 goog.getCssName(
			     xiv.ui.layouts.XyzvLayout.CSS.SLIDER_TRACK, 
			 key.toLowerCase())]);
			 
            slider.addThumbHoverClass(
	        xiv.ui.layouts.XyzvLayout.CSS.SLIDER_THUMB_HOVERED);

    }.bind(this));
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addFrameDisplays_ = function(){
    var frameDisplay;
    this.loopXyz(function(LayoutFrame, key) {	
	frameDisplay = new xiv.ui.layouts.interactors.FrameDisplay();

	frameDisplay.render(LayoutFrame.getElement());

	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY] = 
	    frameDisplay; 
    }.bind(this));
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addZoomDisplays_ = function(){
    var zoomDisplay;
    this.loopXyz(function(LayoutFrame, key) {	
	zoomDisplay = new xiv.ui.layouts.interactors.ZoomDisplay();

	zoomDisplay.render(LayoutFrame.getElement());

	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.ZOOM_DISPLAY] = 
	    zoomDisplay; 
    }.bind(this));
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addCrosshairs_ = function(){
    var crosshairs;
    this.loopXyz(function(LayoutFrame, key) {

	crosshairs = new xiv.ui.layouts.interactors.Crosshairs();

	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS] = 
	    crosshairs; 

	crosshairs.render(LayoutFrame.getElement());
	goog.dom.appendChild(LayoutFrame.getElement(), crosshairs.horizontal);
	goog.dom.appendChild(LayoutFrame.getElement(), crosshairs.vertical);

    }.bind(this));
}



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loopXyz = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.FRAMES, 
	function(frame, key) {	
	    frame = frame.toUpperCase();
	    if ((!goog.isDefAndNotNull(this.LayoutFrames[frame])) 
		|| (frame == 'V')) { return };
	    callback(this.LayoutFrames[frame], frame);
	}.bind(this))
};



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loop = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.FRAMES, 
	function(frame, key) {	
	    frame = frame.toUpperCase();
	    callback(this.LayoutFrames[frame], frame);
	}.bind(this))
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrames_ = function(){
    if (goog.isDefAndNotNull(this.LayoutFrames['X'])){
	this.setupLayoutFrame_X();
    }
    if (goog.isDefAndNotNull(this.LayoutFrames['Y'])){
	this.setupLayoutFrame_Y();
    }
    if (goog.isDefAndNotNull(this.LayoutFrames['Z'])){
	this.setupLayoutFrame_Z();
    }
    if (goog.isDefAndNotNull(this.LayoutFrames['V'])){
	this.setupLayoutFrame_V();
    }
}



/**
 * Sets up the relevant frame.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_X = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['X'].getElement(), 
			 this.constructor.CSS.X);
};



/**
 * Sets up the relevant frame.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_Y = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['Y'].getElement(), 
			 this.constructor.CSS.Y);
};



/**
 * @param {Function=} callback
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.onXYLayoutFrameResize_ = 
function(callback){
    this.calcDims();

    var xSize = goog.style.getSize(this.LayoutFrames['X'].getElement());
    var ySize = goog.style.getSize(this.LayoutFrames['Y'].getElement());
    var zSize = goog.style.getSize(this.LayoutFrames['Z'].getElement());

    //
    // Determine delta by tallying all the sizes
    //
    var deltaX = xSize.width + ySize.width + zSize.width - this.currSize.width;
    
    callback(xSize, ySize, zSize, deltaX)
}




/**
 * Sets up the relevant frame.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_Z = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['Z'].getElement(), 
			 this.constructor.CSS.Z);
};



/**
 * Sets up the relevant frame.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_V = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['V'].getElement(),
			 this.constructor.CSS.V);
};



/**
 * Callback for when (or if) the relevant frame is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_X = goog.nullFunction;



/**
 * Callback for when (or if) the relevant frame is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_Y = goog.nullFunction;



/**
 * Callback for when (or if) the relevant frame is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_Z = goog.nullFunction;



/**
 * Callback for when (or if) the relevant frame is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_V = goog.nullFunction;



/**
 * updateStyle function for the relevant frame.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_X = goog.nullFunction;



/**
 * updateStyle function for the relevant frame.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_Z = goog.nullFunction;


/**
 * updateStyle function for the relevant frame.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_Y = goog.nullFunction;



/**
 * updateStyle function for the relevant frame.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_V = goog.nullFunction;




/**
 * @inheritDoc
 */
xiv.ui.layouts.XyzvLayout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    
    delete this.resizeMargin;
    
}




