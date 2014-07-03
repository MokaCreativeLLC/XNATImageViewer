
// goog
goog.require('goog.labs.userAgent.browser');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.dom');

// nrg
goog.require('nrg.fx');
goog.require('nrg.ui.ErrorOverlay');


//-----------



/**
 * @constructor
 */
goog.provide('xiv.compatibility');
xiv.compatibility = {}
goog.exportSymbol('xiv.compatibility', xiv.compatibility);


/**
 * @public
 * @return {boolean}
 */
xiv.compatibility.isCompatible = function(){
    var isCompatible = true;
    var version = goog.labs.userAgent.browser.getVersion();
    var browserList = {
	'Chrome': {
	    isBrowser: goog.labs.userAgent.browser.isChrome(),
	    minVersion: 11
	},
	'IE': {
	    isBrowser: goog.labs.userAgent.browser.isIE(),
	    minVersion: 11
	},
	'Safari': {
	    isBrowser: goog.labs.userAgent.browser.isSafari(),
	    minVersion: 5.1
	},
	'Opera': {
	    isBrowser: goog.labs.userAgent.browser.isOpera(),
	    minVersion: 12
	},
	'Firefox': {
	    isBrowser: goog.labs.userAgent.browser.isFirefox(),
	    minVersion: 4
	}
    }

    var oldBrowserDetected = false;
    goog.object.forEach(browserList, function(browser){
	if (browser.isBrowser && !oldBrowserDetected){
	    //window.console.log(browser.minVersion, version,
	    //goog.string.compareVersions(browser.minVersion, version)
	    //)
	    if (goog.string.compareVersions(browser.minVersion, version)
	       == 1){
		xiv.compatibility.onOutdatedBrowser_();
		isCompatible = false;
		oldBrowserDetected = true;
	    }	    
	}
    })

    //----------------------
    //  WebGL Check
    //----------------------
    if (isCompatible && !xiv.compatibility.checkForWebGL()){
	xiv.compatibility.onWebGLDisabled_();
	isCompatible = false;
    }
    return isCompatible;
}


/**
 * @private
 */
xiv.compatibility.onOutdatedBrowser_ = function(){
    var errorString = '<br>'+
	'XImgView is supported on the following browsers:<br>' +
	'Google Chrome, Version 12+<br>' + 
	'Firefox, Version 4+<br>' + 
	'Safari, Version 5.1+<br>' + 
	'Opera Next, Version 12+<br>' +
	'Internet Explorer, Version 11+<br>';


    //alert(errorString);    
    var ErrorOverlay = new nrg.ui.ErrorOverlay(errorString);

    //
    // Add bg and closebutton
    //
    ErrorOverlay.addBackground();
    ErrorOverlay.addCloseButton();

    //
    // Add image
    //
    var errorImg = ErrorOverlay.addImage();
    goog.dom.classes.add(errorImg, nrg.ui.ErrorOverlay.CSS.NO_WEBGL_IMAGE);
    errorImg.src = serverRoot + 
	'/images/viewer/xiv/ui/Overlay/sadbrain-white.png';

    //
    // Positions the overlay relative to the window as opposed to the 
    // document.
    //
    ErrorOverlay.getElement().style.position = 'fixed'
    ErrorOverlay.getElement().style.height = '240px'

    //
    // Add above text and render
    //
    ErrorOverlay.addText(errorString);
    ErrorOverlay.getTextElements()[0].style.top = '120px';
    ErrorOverlay.render();

    //
    // Fade in the error overlay
    //
    ErrorOverlay.getElement().style.opacity = 0;
    nrg.fx.fadeInFromZero(ErrorOverlay.getElement(), 400);
}



/**
 * @private
 */
xiv.compatibility.onWebGLDisabled_ = function(){
    var errorString = '<br>'+
	'It looks like ' +
	'<a style="color: #00FFFF" ' + 
	'href="https://developer.mozilla.org/en-US/docs/Web/WebGL/' + 
	'Getting_started_with_WebGL">WebGL or Experimental-WebGL</a>' + 
	' is disabled.<br><br>How to enable WebGL in '; 
    var browserName;
    var howToUrl = ':<br> <a  style="color: #00FFFF" href=';;

    if (goog.labs.userAgent.browser.isIE()){
	browserName = 'Internet Explorer'
	howToUrl += 
      '"http://msdn.microsoft.com/en-us/library/ie/bg182648(v=vs.85).aspx">' + 
	'http://msdn.microsoft.com/en-us/library/ie/bg182648(v=vs.85).aspx' 
	    + '</a>'
    }
    else if (goog.labs.userAgent.browser.isChrome()){
	browserName = 'Chrome'
	howToUrl += 
	    '"https://www.biodigitalhuman.com/home/enabling-webgl.html">' + 
	'https://www.biodigitalhuman.com/home/enabling-webgl.html' + '</a>'
    }
    else if (goog.labs.userAgent.browser.isFirefox()){
	browserName = 'Firefox'
	howToUrl += 
	    '"https://www.biodigitalhuman.com/home/enabling-webgl.html">' + 
	'https://www.biodigitalhuman.com/home/enabling-webgl.html' + '</a>'
    }
    else if (goog.labs.userAgent.browser.isSafari()){
	browserName = 'Safari'
	howToUrl += '"https://discussions.apple.com/thread/3300585?start=0">' + 
	'https://discussions.apple.com/thread/3300585?start=0' + '</a>'
    }
    else if (goog.labs.userAgent.browser.isOpera()){
	browserName = 'Opera'
	howToUrl += '"http://techdows.com/2012/06/turn-on-hardware-' + 
	    'acceleration-and-webgl-in-opera-12.html">' + 
	'http://techdows.com/2012/06/turn-on-hardware-acceleration' + 
	    '-and-webgl-in-opera-12.html' + '</a>'
    }


    errorString += browserName + howToUrl;

    //alert(errorString);    
    var ErrorOverlay = new nrg.ui.ErrorOverlay(errorString);

    //
    // Add bg and closebutton
    //
    ErrorOverlay.addBackground();
    ErrorOverlay.addCloseButton();

    //
    // Add image
    //
    var errorImg = ErrorOverlay.addImage();
    goog.dom.classes.add(errorImg, nrg.ui.ErrorOverlay.CSS.NO_WEBGL_IMAGE); 
    errorImg.src = serverRoot + 
	'/images/viewer/xiv/ui/Overlay/sadbrain-white.png';

    //
    // Add above text and render
    //
    ErrorOverlay.addText(errorString)
    ErrorOverlay.getTextElements()[0].style.top = '120px';
    ErrorOverlay.render();

    //
    // Positions the overlay relative to the window as opposed to the 
    // document.
    //
    ErrorOverlay.getElement().style.position = 'fixed'

    //
    // Fade in the error overlay
    //
    ErrorOverlay.getElement().style.opacity = 0;
    nrg.fx.fadeInFromZero(ErrorOverlay.getElement(), 400);
}



/**
 * NOTE: Derived from: 
 * http://stackoverflow.com/questions/11871077/proper-way-to-detect-
 *     webgl-support
 *
 * @public
 */
xiv.compatibility.checkForWebGL = function(){
    var canvas = goog.dom.createDom('canvas');
    var webGlFound;
    try { 
	webGlFound = canvas.getContext("webgl") || 
	    canvas.getContext("experimental-webgl"); 
    }
    catch (x) { 	
	webGlFound = null; 
    }
    return goog.isDefAndNotNull(webGlFound) ? true : false;
}


goog.exportSymbol('xiv.compatibility.isCompatible', 
		  xiv.compatibility.isCompatible);
goog.exportSymbol('xiv.compatibility.checkForWebGL', 
		  xiv.compatibility.checkForWebGL);
