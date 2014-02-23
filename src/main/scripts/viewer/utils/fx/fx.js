/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
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
goog.require('goog.fx.Animation');

// utils
goog.require('utils.style');
goog.require('utils.convert');




/**
 * 'utils.fx' is a class that provides for a variety of 
 * effects to apply to a given element.  It makes use of the
 * 'goog.fx' package where it can.  
 * @constructor
 */
goog.provide('utils.fx');
utils.fx = function () {};
goog.exportSymbol('utils.fx', utils.fx);





/**
 * Fades in an element in 'time' time, with 'callback'
 * called once completed.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
utils.fx.fadeIn = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    utils.fx.fadeTo(element, opt_time, 1, opt_callback);
}




/**
 * Fades in an Element, setting the start opacity to zero.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
utils.fx.fadeInFromZero = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    utils.fx.fadeTo(element, 0, 0, function() {
	utils.fx.fadeTo(element, opt_time, 1, opt_callback);
    });
}




/**
 * Fades out an Element.
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
utils.fx.fadeOut = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    utils.fx.fadeTo(element, opt_time, 0, opt_callback);
}




/**
 * Fades out an Element, then removes it frop the dom.
 *
 * @param {!Element} element Element to fade. 
 * @param {number=} opt_time Time for animation to occur. Defaults to 500ms.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
utils.fx.fadeOutAndRemove = function (element, opt_time, opt_callback) {
    if (opt_time === undefined) {
	opt_time = 500;
    }
    utils.fx.fadeTo(element, opt_time, 0, function() { 
	element.parentNode.removeChild(element);
	opt_callback && opt_callback();
    });
}





/**
 * Fades an element to a given opacity.
 * @param {!Element} element Element to fade. 
 * @param {number=} time Time for animation to occur.
 * @param {number=} opacity The opacity to fade to.
 * @param {function=} opt_callback Callback when animation is complete.
 * @public
 */
utils.fx.fadeTo = function (element, time, opacity, callback) {
    var prevOp = /**@type {!number}*/ element.style.opacity ? 
	parseInt(element.style.opacity, 10) : 1;
    var f = /**@type {!goog.fx.dom.Fade}*/  
    new goog.fx.dom.Fade(element, prevOp, opacity, time);
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
 * @param {Element} elt
 * @param {Object.<string, string|number>} startDim The start dimensions.
 * @param {Object.<string, string|number>} endDim The end dimensions.
 * @param {number} duration The duration to create the animations from.
 * @return {Object.<string, goog.fx.Animation>}
 * @public
 */
utils.fx.createAnimsFromDims = function(elt, startDim, endDim, duration) {

    var animations = /**@type{Object.<string, goog.fx.dom.PredefinedEffect>}*/ 
    {};
    var easing = /**@type{goog.fx.easing.easeOut}*/ 
    goog.fx.easing.easeOut;


    //------------------
    // Assess for Fade out - visibility change.
    //------------------
    if (startDim['visibility'] !== endDim['visibility']) {
	var fadeIn = /**@type{boolean}*/(startDim['visibility'] === 'hidden' && 
		      endDim['visibility'] === 'visible') ? true : false;
	if (fadeIn) {
	    animations['fadein'] = new goog.fx.dom.FadeInAndShow(elt, duration) 
	} else {
	    animations['fadeout'] = 
		new goog.fx.dom.FadeOutAndHide(elt, duration);
	}
    }



    //------------------
    // Assess for Resize.
    //------------------
    if (startDim['height'] !== endDim['height'] || startDim['width'] 
	!== endDim['width']) {
	// Filter out Nan values.
	if (!isNaN(startDim['height']) && !isNaN(endDim['height']) && 
	    !isNaN(startDim['width']) && !isNaN(endDim['width'])) {
	    //window.console.log("RESIZE", elt, [startDim['width']
	    //startDim['height']],  [endDim['width'], endDim['height']]);
	    var resize = /**@type{goog.fx.dom.Resize}*/ 
	    new goog.fx.dom.Resize(elt, [startDim['width'], 
					 startDim['height']],  
				   [endDim['width'], endDim['height']], 
				   duration, easing);
	    animations['resize'] = resize;
	}
    }



    //------------------
    // Assess for Slide.
    //------------------
    if (startDim['top'] !== endDim['top'] || 
	startDim['left'] !== endDim['left']) {
	// Filter out Nan values.
	if (!isNaN(startDim['top']) && !isNaN(endDim['top']) 
	    && !isNaN(startDim['left']) && !isNaN(endDim['left'])) {
	    //console.log("SLIDE", elt, [startDim['left'], startDim['top']],  
	    //[endDim['left'], endDim['top']]);
	    var slide = /**@type{goog.fx.dom.Slide}*/
	    new goog.fx.dom.Slide(elt, [startDim['left'], 
					startDim['top']],  
				  [endDim['left'], endDim['top']], 
				  duration, easing);
	    animations['slide'] = slide;
	}
    }



    //------------------
    // Assess for BgColor.
    //------------------
    if (startDim['background-color'] !== endDim['background-color']) {
	
	var startBG = /**@type{!string | !Array.number}*/
	startDim['background-color'];
	var endBG = /**@type{!string | !Array.number}*/
	endDim['background-color']
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

	var startColor = /**@type{!Array.number}*/
	(typeof startBG === 'string') ? 
	    utils.convert.rgbToArray(startBG).slice(0, 3) : 
	    (startBG).slice(0, 3)
	var endColor = /**@type{!Array.number}*/ (typeof endBG === 'string') ? 
	    utils.convert.rgbToArray(endBG).slice(0, 3) : (endBG).slice(0, 3);

	if (startColor !== endColor && startColor !== undefined && 
	    endColor !== undefined) {
	    animations['bgcolortransform'] = 
		new goog.fx.dom.BgColorTransform(elt, startColor, endColor, 
						 duration, easing);
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
 * 'utils.fx.createAnimsFromDims' to get the animations,
 * then adds them to a parallel queue and plays them.
 * @param {!Array.Element} elts The array of elements to parallel animate.
 * @param {!Array.<Object.<string, string|number>>} startDims The start 
 *    dimensions.
 * @param {!Array.<Object.<string, string|number>>} endDims The end dimensions.
 * @param {!number} duration The duration to create the animations from.
 * @param {function=} opt_onbegin Callback when animation starts.
 * @param {function=} opt_onanimate Callback when animation is running.
 * @param {function=} opt_onent Callback when animation ends.
 * @return {Object.<string, goog.fx.Animation>}
 * @public
 */
utils.fx.parallelAnimate  = function (elts, startDims, endDims, duration, 
				      opt_onbegin, opt_onanimate, opt_onend) {

    var animQueue = /**@type {!goog.fx.AnimationParallelQueue}*/ 
    new goog.fx.AnimationParallelQueue();  
    var animCallbackApplied = /**@type {!boolean}*/ 
    false;

 
    //------------------
    // Apply animation states and add to queue.
    //------------------
    goog.array.forEach(elts, function(elt, i) {
	//window.console.log(elt, i, startDims[i], endDims[i]);
	var anims = /**@type{Object.<string, goog.fx.Animation>}*/
	utils.fx.createAnimsFromDims(elt, startDims[i], endDims[i], duration);
	var key = /**@type {!string}*/ '';
	for (key in anims) { 
	    animQueue.add(anims[key]) 
	}


	// Animate callbacks cannot be conductd in the 
	// animQueue so we have to apply it to one of the
	// internal animations.
	if (!animCallbackApplied && key in anims) {
	    goog.events.listen(anims[key], goog.fx.Animation.EventType.ANIMATE,
			       function() {
				   opt_onanimate();
			       })
	    animCallbackApplied = true;
	}
    })


    //------------------
    // Start / End Callbacks.
    //------------------
    if (opt_onbegin) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.BEGIN, 
			   function() { opt_onbegin();})
    }

    if (opt_onend) {
	goog.events.listen(animQueue, goog.fx.Animation.EventType.END, 
			   function() { opt_onend();})
    }



    //------------------
    // Play animation.
    //------------------
    animQueue.play();
}




/**
 * Sets the basic hover states of a given element.
 * @param {!Element} elt The element to listen to.
 * @param {number=} opt_overOp The mouseover opacity. Defaults to 1.
 * @param {number=} opt_outOp The mouseout opacity. Defaults to 0.5.
 * @public
 */
utils.fx.setBasicHoverStates = function(elt, overOp, outOp){
    overOp = overOp === undefined ? 1 : overOp
    outOp = outOp === undefined ? .5 : outOp

    var mouseOver = /**@type {!function} */ function(event) { 
	utils.style.setStyle(elt, {
	    'opacity': overOp
	});
    }
    var mouseOut = /**@type {!function} */ function(event) {
	utils.style.setStyle(elt, {
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
