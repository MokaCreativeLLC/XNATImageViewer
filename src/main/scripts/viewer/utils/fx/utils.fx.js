/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.events');
goog.require('goog.fx.dom');
goog.require('goog.fx.Transition');
goog.require('goog.fx.dom.Fade');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.BgColorTransform');
goog.require('goog.fx.dom.FadeOutAndHide');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.AnimationParallelQueue');

/**
 * utils includes
 */
goog.require('utils.style');




/**
 * 'utils.fx' is a class that provides for a variety of 
 * effects to apply to a given element.  It makes use of the
 * 'goog.fx' package where it can.  
 * 
 * @constructor
 */
goog.provide('utils.fx');
utils.fx = function () {};
goog.exportSymbol('utils.fx', utils.fx);





/**
 * Fades in an element in 'time' time, with 'callback'
 * called once completed.
 *
 * @param {!Element, !number, function=} the element to fade, the fade time, and the callback on completion.
 */
utils.fx.fadeIn = function (element, time, callback) {
    utils.fx.fadeTo(element, time, 1, callback);
}




/**
 * Fades in an Element, setting the start opacity to zero.
 *
 * @param {!Element, !number, function=} the element to fade, the fade time, and the callback on completion.
 */
utils.fx.fadeInFromZero = function (element, time, callback) {
    utils.fx.fadeTo(element, 0, 0, function() {
	utils.fx.fadeTo(element, time, 1, callback);
    });
}




/**
 * Fades out an Element.
 *
 * @param {!Element, !number, function=} the element to fade, the fade time, and the callback on completion.
 */
utils.fx.fadeOut = function (element, time, callback) {
    utils.fx.fadeTo(element, time, 0, callback);
}




/**
 * Fades out an Element, then removes it frop the dom.
 *
 * @param {!Element, !number, function=} the element to fade, the fade time, and the callback on completion.
 */
utils.fx.fadeOutAndRemove = function (element, time, callback) {
    utils.fx.fadeTo(element, time, 0, function() { 
	element.parentNode.removeChild(element);
	callback();
    });
}





/**
 * Fades an element to a given opacity.
 *
 * @param {!Element, !number, function=} the element to fade, the fade time, the target opacity, and the callback on completion.
 */
utils.fx.fadeTo = function (element, time, opacity, callback) {
    var prevOp = element.style.opacity ? parseInt(element.style.opacity, 10) : 1;
    var f = new goog.fx.dom.Fade(element, prevOp, opacity, time);
    if (callback) {
	f.addEventListener(goog.fx.Transition.EventType.END, function(e){ 
	    callback(e);
	})		
    }
    f.play();
}




/**
 * Generates a 'goog.fx.dom' based on the provided arguments 'startDim'
 * and 'endDim'.  Parses and analyzes both 'startDim' and 'endDim' to 
 * generate the appropriate kind of animation, then returns an object
 * of animations categorised by type.
 *
 * @param {Element, Object.<string, string|number>, Object.<string, string|number>, function=}
 * @return {Object.<string, goog.fx.Animation>}
 */
utils.fx.getAnimationsFromDimChange = function(elt, startDim, endDim, duration) {

    var animations = {};



    //------------------
    // Assess for Fade out - visibility change.
    //------------------
    if (startDim['visibility'] !== endDim['visibility']) {
	var fadeIn = (startDim['visibility'] === 'hidden' && endDim['visibility'] === 'visible') ? true : false;
	if (fadeIn) {
	    animations['fadein'] = new goog.fx.dom.FadeInAndShow(elt, duration) 
	} else {
	    animations['fadeout'] = new goog.fx.dom.FadeOutAndHide(elt, duration);
	}
    }



    //------------------
    // Assess for Resize.
    //------------------
    if (startDim['height'] !== endDim['height'] || startDim['width'] !== endDim['width']) {
	// Filter out Nan values.
	if (!isNaN(startDim['height']) && !isNaN(endDim['height']) && !isNaN(startDim['width']) && !isNaN(endDim['width'])) {
	    //console.log("RESIZE", elt, [startDim['width'], startDim['height']],  [endDim['width'], endDim['height']]);
	    var resize = new goog.fx.dom.Resize(elt, [startDim['width'], startDim['height']],  [endDim['width'], endDim['height']], duration, goog.fx.easing.easeOut);
	    animations['resize'] = resize;
	}
    }



    //------------------
    // Assess for Slide.
    //------------------
    if (startDim['top'] !== endDim['top'] || startDim['left'] !== endDim['left']) {
	// Filter out Nan values.
	if (!isNaN(startDim['top']) && !isNaN(endDim['top']) && !isNaN(startDim['left']) && !isNaN(endDim['left'])) {
	    //console.log("SLIDE", elt, [startDim['left'], startDim['top']],  [endDim['left'], endDim['top']]);
	    var slide = new goog.fx.dom.Slide(elt, [startDim['left'], startDim['top']],  [endDim['left'], endDim['top']], duration, goog.fx.easing.easeOut);
	    animations['slide'] = slide;
	}
    }



    //------------------
    // Assess for BgColor.
    //------------------
    if (startDim['background-color'] !== endDim['background-color']) {
	
	var startBG = startDim['background-color'];
	var endBG = endDim['background-color']
	var bothBG = [startBG, endBG]
	
	//
	// TODO: Need to clean these values
	//
	goog.array.forEach(bothBG, function(bg, i){
	    if (bg === 'transparent'){
		bothBG[i] = 'rgb(0,0,0)';
	    }
	})
	startBG = bothBG[0];
	endBG = bothBG[1];
	//console.log(startBG, endBG)

	var startColor = (typeof startBG === 'string') ? utils.convert.rgbToArray(startBG).slice(0, 3) : (startBG).slice(0, 3)
	var endColor = (typeof endBG === 'string') ? utils.convert.rgbToArray(endBG).slice(0, 3) : (endBG).slice(0, 3);

	if (startColor !== endColor && startColor !== undefined && endColor !== undefined) {
	    animations['bgcolortransform'] = new goog.fx.dom.BgColorTransform(elt, startColor, endColor, duration, goog.fx.easing.easeOut);
	}
    }



    //------------------
    // Return animations.
    //------------------
    return animations;
}




/**
 * Creates a parallel animation set based on the changes that occur
 * between the 'startDims' and 'endDims' arguments.  Utilizes
 * 'utils.fx.getAnimationsFromDimChange' to get the animations,
 * then adds them to a parallel queue and plays them.
 *
 * @param {Array.<Element>, Array.<Object.<string, string|number>>, Array.<Object.<string, string|number>>, number|Array.<number>, function=, function=, function=}
 */
utils.fx.parallelAnimate  = function (elts, startDims, endDims, duration, opt_onbegin, opt_onanimate, opt_onend) {


    var animQueue = new goog.fx.AnimationParallelQueue();  
    var animCallbackApplied = false;



    //------------------
    // Apply animation states and add to queue.
    //------------------
    goog.array.forEach(elts, function(elt, i) {
	var anims = utils.fx.getAnimationsFromDimChange(elt, startDims[i], endDims[i], duration);
	for (var key in anims) { animQueue.add(anims[key]) }


	// Animate callbacks cannot be conductd in the 
	// animQueue so we have to apply it to one of the
	// internal animations.
	if (!animCallbackApplied) {
	    goog.events.listen(anims[key], goog.fx.Animation.EventType.ANIMATE, function() {
		opt_onanimate();
	    })
	    animCallbackApplied = true;
	}
    })

    

    //------------------
    // Start / End Callbacks.
    //------------------
    if (opt_onbegin) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.BEGIN, function() { opt_onbegin();})
    }

    if (opt_onend) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.END, function() { opt_onend();})
    }



    //------------------
    // Play animation.
    //------------------
    animQueue.play();
}