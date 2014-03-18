/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events');
goog.require('goog.color');
goog.require('goog.fx.dom');
goog.require('goog.fx.Transition');
goog.require('goog.fx.dom.Fade');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.BgColorTransform');
goog.require('goog.fx.dom.FadeOutAndHide');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.Animation');

// moka
goog.require('moka.style');
goog.require('moka.convert');




/**
 * 'moka.fx' is a class that provides for a variety of 
 * effects to apply to a given element.  It makes use of the
 * 'goog.fx' package where it can.  
 * @constructor
 */
goog.provide('moka.fx');
moka.fx = function () {};
goog.exportSymbol('moka.fx', moka.fx);





/**
 * Fades in an element in 'time' time, with 'callback'
 * called once completed.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
moka.fx.fadeIn = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    moka.fx.fadeTo(element, opt_time, 1, opt_callback);
}




/**
 * Fades in an Element, setting the start opacity to zero.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
moka.fx.fadeInFromZero = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    moka.fx.fadeTo(element, 0, 0, function() {
	moka.fx.fadeTo(element, opt_time, 1, opt_callback);
    });
}




/**
 * Fades out an Element.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
moka.fx.fadeOut = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    moka.fx.fadeTo(element, opt_time, 0, opt_callback);
}




/**
 * Fades out an Element, then removes it frop the dom.
 *
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
moka.fx.fadeOutAndRemove = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    moka.fx.fadeTo(element, opt_time, 0, function() { 
	element.parentNode.removeChild(element);
	opt_callback && opt_callback();
    });
}





/**
 * Fades an element to a given opacity.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur.  Defaults to google
 *    defaults.
 * @param {number=} opt_opacity The opacity to fade to.
 * @param {function=} opt_callback Callback when animation is complete.
 * @param {number=} opt_startOp The opacity to start from.  Calculates it 
 *    otherwise.
 * @public
 */
moka.fx.fadeTo = function (element, opt_time, opt_opacity, callback, 
			    opt_startOp) {

    if (!opt_startOp){
	opt_startOp = /**@type {!number}*/ element.style.opacity ? 
	    parseInt(element.style.opacity, 10) : 1;
    }

    var f = /**@type {!goog.fx.dom.Fade}*/  
    new goog.fx.dom.Fade(element, opt_startOp, opt_opacity, opt_time);
    if (callback) {
	f.addEventListener(goog.fx.Transition.EventType.END, function(e){ 
	    callback(e);
	})		
    }
    f.play();
}




/**
 * @const
 * @expose
 */
moka.fx.animGenStyles = [
    'left',
    'top',
    'width',
    'height',
    'opacity',
    'background-color',
    'color',
    'z-index'
]



/**
 * As stated.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {goog.fx.dom.Animation}
 */ 
moka.fx.generateAnim_Slide = function(elt, startDim, endDim, duration){

    if (goog.object.containsKey(startDim, 'left') || 
	goog.object.containsKey(endDim, 'left')   || 
	goog.object.containsKey(startDim, 'top')  || 
	goog.object.containsKey(endDim, 'top'))    {
	
	// Filter out Nan values.
	if (!isNaN(startDim['top']) && !isNaN(endDim['top']) 
	    && !isNaN(startDim['left']) && !isNaN(endDim['left'])) {
	    //console.log("SLIDE", elt, [startDim['left'], startDim['top']],  
	    //[endDim['left'], endDim['top']]);
	    return new goog.fx.dom.Slide(elt, 
		[startDim['left'], startDim['top']],  
		[endDim['left'], endDim['top']], duration, 
					 goog.fx.easing.easeOut);
	}

    }
}




/**
 * As stated.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {goog.fx.dom.Animation}
 */
moka.fx.generateAnim_Resize = function(elt, startDim, endDim, duration){

    if (goog.object.containsKey(startDim, 'height') || 
	goog.object.containsKey(endDim, 'height')   || 
	goog.object.containsKey(startDim, 'width')  || 
	goog.object.containsKey(endDim, 'width'))    {
	
	// Filter out Nan values.
	if (!isNaN(startDim['height']) && !isNaN(endDim['height']) && 
	    !isNaN(startDim['width']) && !isNaN(endDim['width'])) {
	    //window.console.log("RESIZE", elt, [startDim['width']
	    //startDim['height']],  [endDim['width'], endDim['height']]);
	    return new goog.fx.dom.Resize(elt, 
		[startDim['width'], startDim['height']],  
		[endDim['width'], endDim['height']], 
					  duration, goog.fx.easing.easeOut);
	}


    }
}



/**
 * As stated.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {goog.fx.dom.Animation}
 */
moka.fx.generateAnim_Fade = function(elt, startDim, endDim, duration){
    if (goog.object.containsKey(startDim, 'opacity') || 
	goog.object.containsKey(endDim, 'opacity')) {
	    goog.array.forEach([startDim, endDim], function(dim){
		// Set undefined values
		if (!goog.object.containsKey(dim, 'opacity')){
		    dim['opacity'] = 1;
		}
		// Make sure we have numbers
		if (!goog.isNumber(dim['opacity'])){
		    dim['opacity'] = parseInt(dim['opacity'], 10);
		}
	    })
	    // Only create animation if dims inequality.
	    if (startDim['opacity'] !== endDim['opacity']){
		return new goog.fx.dom.Fade(elt, startDim['opacity'],
					    endDim['opacity'],
					    duration);
	    }
    }
}




/**
 * As stated.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {goog.fx.dom.Animation}
 */ 
moka.fx.generateAnim_RemoveAddFade = function(elt, startDim, endDim, duration){
    if (goog.object.containsKey(startDim, 'visibility') || 
	goog.object.containsKey(endDim, 'visibility')) {  

	// Set any undefined values
	goog.array.forEach([startDim, endDim], function(dim){
	    if (!goog.object.containsKey(dim, 'visibility')){
		dim['visibility'] = 'visible';
	    }
	}) 

	if (startDim['visibility'] !== endDim['visibility']) {
	    return (startDim['visibility'] === 'hidden') ? 
		new goog.fx.dom.FadeInAndShow(elt, duration) :
		new goog.fx.dom.FadeOutAndHide(elt, duration);
	}
    }
}



/**
 * As stated.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {goog.fx.dom.Animation}
 */ 
moka.fx.generateAnim_BgColorTrans = function(elt, startDim, endDim, duration) {

    if (goog.object.containsKey(startDim, 'background-color') || 
	goog.object.containsKey(endDim, 'background-color')) {   

	// Set any undefined values
	goog.array.forEach([startDim, endDim], function(dim){
	    if (!goog.object.containsKey(dim, 'background-color')){
		dim['background-color'] = 'rgb(255,255,255)';
	    }
	})

	var startColor = /**@type{!string | !Array.number}*/
	goog.color.parse(startDim['background-color']);
	var endColor = /**@type{!string | !Array.number}*/
	goog.color.parse(endDim['background-color']);    

	// Only return animation if there's a change.
	if (startColor.hex !== endColor.hex) {
	    return new goog.fx.dom.BgColorTransform(
		elt, 
		goog.color.hexToRgb(startColor), 
		goog.color.hexToRgb(endColor), 
		duration, goog.fx.easing.easeOut);
	}
    }
}



/**
 * Creates a parallel animation set based on the changes that occur
 * between the 'startDims' and 'endDims' arguments.  Utilizes
 * 'moka.fx.createAnimsFromDims' to get the animations,
 * then adds them to a parallel queue and plays them.
 * @param {!Element} elt The element to generate the animations for.
 * @param {!Object.<string, string|number>} startDims The start 
 *    dimensions.
 * @param {!Object.<string, string|number>} endDims The end dimensions.
 * @param {!number} duration The animation durations.
 * @return {Array.<goog.fx.dom.Animation>}
 * @public
 */
moka.fx.generateAnimations = function (elt, startDim, endDim, duration) {
    
    var anims = /**@type {!Array.<goog.fx.Animation>}*/ [];

    goog.array.forEach(moka.fx.animGenStyles, function(style){
	switch(style){
	    // we only need one, otherwise it'll create a repeat.
	case 'left':  
	    window.console.log("HERE!");
	    anims.push(
		moka.fx.generateAnim_Slide(elt, startDim, endDim, duration));
	    break;

	    // we only need one, otherwise it'll create a repeat.
	case 'height':
	    anims.push(
		moka.fx.generateAnim_Resize(elt, startDim, endDim, duration));
	    break;


	case 'opacity':
	    anims.push(
		moka.fx.generateAnim_Fade(elt, startDim, endDim, duration));
	    break;
	case 'visibility':
	    anims.push(
		moka.fx.generateAnim_RemoveAddFade(elt, 
						   startDim, endDim, duration));
	    break;
	case 'background-color':
	    anims.push(
		moka.fx.generateAnim_BgColorTrans(elt, 
						   startDim, endDim, duration));
	    break;
	}
    })


    // Clean out undefined values.
    // Not so elegant :-/
    var anims2 = /**@type {!Array.<goog.fx.Animation>}*/ [];
    goog.array.forEach(anims, function(anim){
	if (anim){
	    anims2.push(anim);
	}
    })
    delete anims;
    return anims2;
}



/**
 * Creates a parallel animation set based on the arguments.
 * 
 * @param {!Array.<goog.fx.dom.Animation>} anims The animations.
 * @param {Function=} opt_onBegin Callback when animation starts.
 * @param {Function=} opt_onAnimate Callback when animation is running.
 * @param {Function=} opt_onEnd Callback when animation ends.
 * @public
 */
moka.fx.parallelAnimate = 
function (anims, opt_onBegin, opt_onAnimate, opt_onEnd) {
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/ 
    new goog.fx.AnimationParallelQueue();  

    goog.array.forEach(anims, function(anim){
	if (opt_onAnimate){
	    goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE,
			       opt_onAnimate);
	}
	animQueue.add(anim);
    });


    if (opt_onBegin) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.BEGIN, 
			   opt_onBegin)
    }

    goog.events.listen(animQueue, goog.fx.Animation.EventType.END, 
	function() { 
	    if (opt_onEnd) { opt_onEnd() };
	    animQueue.disposeInternal();
	    animQueue = null;
	    delete animQueue;
	})

    animQueue.play();
}



/**
 * Creates a parallel animation set based on the arguments.
 * 
 * @param {!Array.<goog.fx.dom.Animation>} anims The animations.
 * @param {Function=} opt_onBegin Callback when animation starts.
 * @param {Function=} opt_onAnimate Callback when animation is running.
 * @param {Function=} opt_onEnd Callback when animation ends.
 * @public
 */
moka.fx.serialAnimate = 
function (anims, opt_onBegin, opt_onAnimate, opt_onEnd) {
    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/ 
    new goog.fx.AnimationSerialQueue();  

    goog.array.forEach(anims, function(anim){
	if (opt_onAnimate){
	    goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE,
			       opt_onAnimate);
	}
	animQueue.add(anim);
    });


    if (opt_onBegin) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.BEGIN, 
			   opt_onBegin)
    }

    goog.events.listen(animQueue, goog.fx.Animation.EventType.END, 
	function() { 
	    if (opt_onEnd) { opt_onEnd() };
	    animQueue.disposeInternal();
	    animQueue = null;
	    delete animQueue;
	})

    animQueue.play();
}




/**
 * Sets the basic hover states of a given element.
 * @param {!Element} elt The element to listen to.
 * @param {number=} opt_overOp The mouseover opacity. Defaults to 1.
 * @param {number=} opt_outOp The mouseout opacity. Defaults to 0.5.
 * @public
 */
moka.fx.setBasicHoverStates = function(elt, overOp, outOp){
    overOp = overOp === undefined ? 1 : overOp
    outOp = outOp === undefined ? .5 : outOp

    var mouseOver = /**@type {!function} */ function(event) { 
	moka.style.setStyle(elt, {
	    'opacity': overOp
	});
    }
    var mouseOut = /**@type {!function} */ function(event) {
	moka.style.setStyle(elt, {
	    'opacity': outOp
	})
    }
    goog.events.listen(elt, 
		       goog.events.EventType.MOUSEOVER, 
		       mouseOver);


    goog.events.listen(elt, 
		       goog.events.EventType.MOUSEOUT, 
		       mouseOut);

    mouseOut();
}


