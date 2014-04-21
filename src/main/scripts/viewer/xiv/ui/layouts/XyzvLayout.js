/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.object');

// moka
goog.require('moka.string');

// xiv
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.LayoutFrame');
goog.require('xiv.ui.layouts.interactors.Crosshairs');




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
	goog.object.getValues(xiv.ui.layouts.XyzvLayout.PLANES);
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
xiv.ui.layouts.XyzvLayout.PLANES = {
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
function(slider, display, crosshairs) {
    this.SLIDER = slider;
    this.DISPLAY = display;
    this.CROSSHAIRS = crosshairs;   
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
	goog.object.getCount(xiv.ui.layouts.XyzvLayout.PLANES)){
	throw new Error('Invalid amount of frames ' + frameTitles + 
			'. Must be ' + xiv.ui.layouts.XyzvLayout.PLANES);
    }

    //
    // Validate values
    //
    goog.array.forEach(frameTitles, function(title){
	if (!goog.object.containsValue(
	    xiv.ui.layouts.XyzvLayout.PLANES, title)){
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
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER] =
		interactors[key].SLIDER;
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.DISPLAY] =
		interactors[key].DISPLAY;
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS] =
		interactors[key].CROSSHAIRS;
	}
    })   
}



/**
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.addInteractors = function() {
    this.addLayoutFrameSliders_();
    this.addFrameDisplayers_();
    this.addCrosshairs_();
};




/**
 * @return {Object.<xiv.ui.layouts.XyzvLayout.InteractorSet>}
 * @public
 */
xiv.ui.layouts.XyzvLayout.prototype.getInteractors = function() {
    var interactors = {}
    this.loopXyz(function(LayoutFrame, key) {
	interactors[key] = new xiv.ui.layouts.XyzvLayout.InteractorSet(
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER], 
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.DISPLAY],
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])
    }) 
    return interactors
};



/**
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.addLayoutFrameSliders_ = function(){ 
    var slider;

    this.loopXyz(function(LayoutFrame, key) {			
	    slider = new moka.ui.GenericSlider('horizontal');

	    slider.getElement().id = key + "_LayoutFrameSlider_" +
		goog.string.createUniqueString();


	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER] = slider;


	    goog.dom.append(LayoutFrame.getElement(), slider.getElement());

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
xiv.ui.layouts.XyzvLayout.prototype.addFrameDisplayers_ = function(){

    var numberElt;
    this.loopXyz(function(LayoutFrame, key) {	
		
	numberElt = goog.dom.createDom('div', {});
	numberElt.style.color = 'rgba(255,255,255)';

	LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.DISPLAY] = numberElt;

	goog.dom.append(LayoutFrame.getElement(), numberElt);

	goog.events.listen(
	    LayoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER],
 
	    moka.ui.GenericSlider.EventType.SLIDE, function(e){
		numberElt.innerHTML = e.value.toString() + '/' + 
		    e.maximum.toString();

	}.bind(this))

	goog.dom.classes.addRemove(numberElt, null,
			[xiv.ui.layouts.XyzvLayout.CSS.FRAMENUMBER]);

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

	goog.dom.append(LayoutFrame.getElement(), crosshairs.vertical);
	goog.dom.append(LayoutFrame.getElement(), crosshairs.horizontal);
	
    }.bind(this));
}



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loopXyz = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 
	function(plane, key) {	
	    plane = plane.toUpperCase();
	    if ((!goog.isDefAndNotNull(this.LayoutFrames[plane])) 
		|| (plane == 'V')) { return };
	    callback(this.LayoutFrames[plane], plane);
	}.bind(this))
};



/**
 * @param {!Function}
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.loop = function(callback){
    goog.object.forEach(xiv.ui.layouts.XyzvLayout.PLANES, 
	function(plane, key) {	
	    plane = plane.toUpperCase();
	    callback(this.LayoutFrames[plane], plane);
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
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_X = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['X'].getElement(), 
			 this.constructor.CSS.X);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_Y = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['Y'].getElement(), 
			 this.constructor.CSS.Y);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_Z = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['Z'].getElement(), 
			 this.constructor.CSS.Z);
};



/**
 * Sets up the relevant plane.  
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.setupLayoutFrame_V = function(){
    if (!goog.isDefAndNotNull(this.constructor.CSS)) { return };
    goog.dom.classes.add(this.LayoutFrames['V'].getElement(),
			 this.constructor.CSS.V);
};



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_X = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_Y = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_Z = goog.nullFunction;



/**
 * Callback for when (or if) the relevant plane is resized.
 * @protected
 */
xiv.ui.layouts.XyzvLayout.prototype.onLayoutFrameResize_V = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_X = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_Z = goog.nullFunction;


/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_Y = goog.nullFunction;



/**
 * updateStyle function for the relevant plane.
 * @private
 */
xiv.ui.layouts.XyzvLayout.prototype.updateStyle_V = goog.nullFunction;




/**
* @inheritDoc
*/
xiv.ui.layouts.XyzvLayout.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    window.console.log("Need to implement disposeInternal for: " + 
		       this.constructor.ID_PREFIX);
    
    delete this.resizeMargin;
    
}




