/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.utils.ErrorCatcher');


// goog
goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.style');

// nrg
goog.require('nrg.ui.Dialog');
goog.require('nrg.ui.ErrorDialog');
goog.require('nrg.fx');

//-----------




/**
 * @constructor
 * @extends {goog.Disposable}
 */
xiv.utils.ErrorCatcher = function() {
    goog.base(this);
}
goog.inherits(xiv.utils.ErrorCatcher, goog.Disposable);
goog.exportSymbol('xiv.utils.ErrorCatcher', xiv.utils.ErrorCatcher);




/**
 * @const
 * @private
 */
xiv.utils.ErrorCatcher.HYPERLINK_COLOR = '#5CB8E6';



/**
 * @const
 * @public
 */
xiv.utils.ErrorCatcher.executeTestError = function(){
    throw "TEST ERROR!"
};




/**
 * @public
 * @return {boolean}
 */
xiv.utils.ErrorCatcher.isCompatible = function(){

    var isCompatible = true;
    var version = goog.labs.userAgent.browser.getVersion();
    //window.console.log(goog.labs.userAgent.browser.isChrome());

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
		xiv.utils.ErrorCatcher.onOutdatedBrowser_();
		isCompatible = false;
		oldBrowserDetected = true;
	    }	    
	}
    })

    //----------------------
    //  WebGL Check
    //----------------------
    if (isCompatible && !xiv.utils.ErrorCatcher.checkForWebGL()){
	xiv.utils.ErrorCatcher.onWebGLDisabled_();
	isCompatible = false;
    }
    return isCompatible;
}


/**
 * @param {!string | !Array.<string>} errorStrings
 * @param {string= | Array.<string>=} opt_subStrings 
 * @return {nrg.ui.ErrorDialog}
 * @private
 */
xiv.utils.ErrorCatcher.createDocumentErrorDialog_ = 
function(errorStrings, opt_subStrings){
    //window.console.log("\n\n\nCENTER");
    if (!goog.isArray(errorStrings)){
	errorStrings = [errorStrings];
    }
    
    if (goog.isDefAndNotNull(opt_subStrings) &&
	!goog.isArray(opt_subStrings)){
	opt_subStrings = [opt_subStrings];
    }

    //alert(errorString);    
    var ErrorDialog = new nrg.ui.ErrorDialog(null);
    ErrorDialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);

    goog.array.forEach(errorStrings, function(errorString){
	ErrorDialog.addText(errorString);
    })
    
    if (goog.isDefAndNotNull(opt_subStrings)){
	goog.array.forEach(opt_subStrings, function(subStr){
	    ErrorDialog.addSubText(subStr);
	})
    }
    
    ErrorDialog.setTitle('XImgView Error');
    ErrorDialog.setVisible(true);

    //window.console.log("\n\n\nCENTER");


    ErrorDialog.getElement().style.position = 'fixed'
    ErrorDialog.center();
    ErrorDialog.getElement().style.opacity = 0;
    nrg.fx.fadeIn(ErrorDialog.getElement(), 400);

    ErrorDialog.getBackgroundElement().style.opacity = 0;
    nrg.fx.fadeTo(ErrorDialog.getBackgroundElement(), 400, .75);
    
    ErrorDialog.getElement().style.height = '250px';
    var size = goog.style.getSize(ErrorDialog.getElement());
    ErrorDialog.getElement().style.top = 'calc(50% - ' + size.height/2 + 'px)';
    ErrorDialog.getElement().style.left = 'calc(50% - ' + size.width/2 + 'px)';


    ErrorDialog.resizeToContents();
    ErrorDialog.center();
    //window.console.log("\n\n\nCENTER");
    //
    // Delete the dialog on close or OK press
    //
    var removeDialog = function(e){
	//window.console.log('disposing', e.target, e.target.getElement());
	e.target.dispose();
    }
    goog.events.listenOnce(
	ErrorDialog, 
	goog.ui.Dialog.EventType.SELECT, 
	removeDialog);
    goog.events.listenOnce(
	ErrorDialog, 
	nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, 
	removeDialog)
}



/**
 * @private
 */
xiv.utils.ErrorCatcher.onOutdatedBrowser_ = function(){
    var errorString = '<br>'+
	'XImgView is supported on the following browsers:<br>' +
	'Google Chrome, Version 12+<br>' + 
	'Firefox, Version 4+<br>' + 
	'Safari, Version 5.1+<br>' + 
	'Opera Next, Version 12+<br>' +
	'Internet Explorer, Version 11+<br>';

    xiv.utils.ErrorCatcher.createDocumentErrorDialog_(errorString);
}



/**
 * @private
 */
xiv.utils.ErrorCatcher.onWebGLDisabled_ = function(){
    var errorString = '<br>'+
	'It looks like ' +
	'<a target="_blank" style="color: ' 
	+ xiv.utils.ErrorCatcher.HYPERLINK_COLOR + '" ' + 
	'href="https://developer.mozilla.org/en-US/docs/Web/WebGL/' + 
	'Getting_started_with_WebGL">Experimental-WebGL</a>' + 
	' is disabled.<br><br><br>';
 
    var browserName;
    var howToUrl = 	'<a target="_blank" style="color: ' 
	+ xiv.utils.ErrorCatcher.HYPERLINK_COLOR + '" ' + 
	' href=';

    if (goog.labs.userAgent.browser.isIE()){
	browserName = 'Internet Explorer'
	howToUrl += 
      '"http://msdn.microsoft.com/en-us/library/ie/bg182648(v=vs.85).aspx">' 
    }
    else if (goog.labs.userAgent.browser.isChrome()){
	browserName = 'Chrome'
	howToUrl += 
	 '"https://productforums.google.com/forum/#!msg/chrome/' + 
	    'CgYesRogD4c/sU1TQsRgnWgJ">'
    }
    else if (goog.labs.userAgent.browser.isFirefox()){
	browserName = 'Firefox'
	howToUrl += 
	    '"https://support.mozilla.org/en-US/questions/984663">'
    }
    else if (goog.labs.userAgent.browser.isSafari()){
	browserName = 'Safari'
	howToUrl += '"https://discussions.apple.com/thread/3300585?start=0">'
    }
    else if (goog.labs.userAgent.browser.isOpera()){
	browserName = 'Opera'
	howToUrl += '"http://techdows.com/2012/06/turn-on-hardware-' + 
	    'acceleration-and-webgl-in-opera-12.html">'
    }
    howToUrl += 'How to enable WebGL in ' + browserName + '.</a>';

    xiv.utils.ErrorCatcher.createDocumentErrorDialog_(errorString + howToUrl);
}



/**
 * NOTE: Derived from: 
 * http://stackoverflow.com/questions/11871077/proper-way-to-detect-
 *     webgl-support
 * @expose
 * @public
 */
xiv.utils.ErrorCatcher.checkForWebGL = function(){
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




/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.utils.ErrorCatcher.EventType = {
    ERROR: goog.events.getUniqueId('error')
}



/**
 * @type {Array.string}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.consoleLog_ = [];



/**
 * @type {?Function}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.windowConsoleLog_ = null;



/**
 * @type {?Function}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.newConsoleLog_ = null;



/**
 * @type {?nrg.ui.ErrorDialog}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.ErrorDialog_ = null;



/**
 * @type {!Element}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.dialogParent_ = document.body;



/**
 * @type {?Function}
 * @private
 */
xiv.utils.ErrorCatcher.prototype.onErrorCallback_ = null;




/**
 * @return {!Array.string}
 * @public
 */
xiv.utils.ErrorCatcher.prototype.getConsoleLog = function(){
    return this.consoleLog_;
}


/**
 * @param {!Function} callback
 * @public
 */
xiv.utils.ErrorCatcher.prototype.setOnErrorCallback = function(callback){
    this.onErrorCallback_ = callback;
}




/**
 * @param {!Element} parentElt
 * @public
 */
xiv.utils.ErrorCatcher.prototype.setDialogParent = function(parentElt) {
    this.dialogParent_ = parentElt;
}



/**
 * @private
 */
xiv.utils.ErrorCatcher.prototype.listenForConsoleOutput_ = function() {
    //
    // Track the log errors
    //
    goog.array.clear(this.consoleLog_);
    var that = this;
    this.windowConsoleLog_ = window.console.log;

    this.newConsoleLog_ = function(){
	if (that.windowConsoleLog_){
	    that.windowConsoleLog_.apply(this, arguments);
	}
	var argText = '';
	goog.array.forEach(arguments, function(argument, i){
	    if (i > 0) { argText += ' ' };
	    argText += argument;
	})
	that.consoleLog_.push(argText);
    }
    window.console.log = this.newConsoleLog_;
}



/**
 * @private
 */
xiv.utils.ErrorCatcher.prototype.unlistenForConsoleOutput_ = function() {
    if (goog.isDefAndNotNull(this.windowConsoleLog_)){
	window.console.log = this.windowConsoleLog_;
	this.windowConsoleLog_ = null;
	this.newConsoleLog_ = null;
    }
}


/**
 * @param {!boolean} toggle
 * @public
 */
xiv.utils.ErrorCatcher.prototype.waitForError = function(toggle) {
    if (toggle === true) {
	this.listenForConsoleOutput_();
	window.onerror = this.onError.bind(this);
    } else {
	window.onerror = undefined;
	this.unlistenForConsoleOutput_();
    }
}





/**
 * @param {?string} opt_errorMsg
 * @param {?string} opt_url
 * @param {?number} opt_lineNumber
 * @public
 */
xiv.utils.ErrorCatcher.prototype.onError = 
function(opt_errorMsg, opt_url, opt_lineNumber){

    if (goog.isDefAndNotNull(this.ErrorDialog_)){
	return;
    }

    if (goog.isDefAndNotNull(this.onErrorCallback_)){
	this.onErrorCallback_();
    }



    //
    // Create the error message
    //
    var errorMessage = ''; 
    var subMessage = '';

    /*
    if (this.consoleLog_.indexOf(
	'Unknown number of bits allocated - using default: 32 bits') > -1){

	errorMessage += 'XImgView\'s render engine (' + 
	    '<a target="_blank" style="color: ' + 
	    xiv.utils.ErrorCatcher.HYPERLINK_COLOR + '" ' + 
	    'href="https://github.com/xtk/X#readme">' + 
	    'XTK</a>' + 
	    ') does not yet support big-endian encoded DICOMs :(<br><br>';
	subMessage += 
	    '<a target="_blank" style="color: ' + 
	    xiv.utils.ErrorCatcher.HYPERLINK_COLOR + '" ' + 
	    'href="http://stackoverflow.com/questions/' + 
	    '22356911/xtk-error-while-loading-dicom-files">For more ' + 
	    'information click here.</a>';


	subMessage += '<br><br>Console reference:<br>' + 
	    '\'Unknown number of bits allocated - using default: 32 bits\'';


    } else {
	*/
    errorMessage = '<b>Render Error!</b><br><br>';
    if (goog.isString(opt_errorMsg)){
	subMessage += opt_errorMsg + '<br>'; 
    }
    if (goog.isString(opt_url)){
	subMessage += 'src: ' + opt_url + '<br>';
	if (goog.isNumber(opt_lineNumber)){
	    subMessage += ' line: ' + opt_lineNumber + '<br>';
	}
    }
    //}

    //window.console.log(errorMessage, subMessage);

    //
    // Construct an error overlay
    //
    this.ErrorDialog_ = new nrg.ui.ErrorDialog();
    this.ErrorDialog_.render(this.dialogParent_);

    //
    // Add above text and render
    //
    this.ErrorDialog_.setButtonSet(null);
    this.ErrorDialog_.addText(errorMessage);
    this.ErrorDialog_.addSubText(subMessage);
    this.ErrorDialog_.setModal(true);

    this.ErrorDialog_.setVisible(true);
    this.ErrorDialog_.resizeToContents();
    this.ErrorDialog_.center();
    //this.ErrorDialog_.getElement().style.opacity = 0;


    //nrg.fx.fadeIn(this.ErrorDialog_.getElement(), 200)


    //
    // Delete the dialog on close
    //
    goog.events.listenOnce(
	this.ErrorDialog_, 
	nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, 
	function(e){
	    e.target.dispose();
	    this.ErrorDialog_ = null;
	}.bind(this))
}



/**
 * @public
 */
xiv.utils.ErrorCatcher.prototype.clear = function(){
    if (goog.isDefAndNotNull(this.ErrorDialog_)){
	this.ErrorDialog_.dispose();
	delete this.ErrorDialog_;
    }
}




/**
 * @inheritDoc
 */
xiv.utils.ErrorCatcher.prototype.dispose = function(){
    goog.base(this, 'dispose');
    this.clear();
    delete this.windowConsoleLog_;
    delete this.newConsoleLog_;
    delete this.dialogParent_;
}




goog.exportSymbol('xiv.utils.ErrorCatcher.EventType',
	xiv.utils.ErrorCatcher.EventType);
goog.exportSymbol('xiv.utils.ErrorCatcher.isCompatible',
	xiv.utils.ErrorCatcher.isCompatible);
goog.exportSymbol('xiv.utils.ErrorCatcher.executeTestError',
	xiv.utils.ErrorCatcher.executeTestError);
goog.exportSymbol('xiv.utils.ErrorCatcher.checkForWebGL',
	xiv.utils.ErrorCatcher.checkForWebGL);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.setOnErrorCallback',
	xiv.utils.ErrorCatcher.prototype.setOnErrorCallback);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.setDialogParent',
	xiv.utils.ErrorCatcher.prototype.setDialogParent);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.getConsoleLog',
	xiv.utils.ErrorCatcher.prototype.getConsoleLog);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.waitForError',
	xiv.utils.ErrorCatcher.prototype.waitForError);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.clear',
	xiv.utils.ErrorCatcher.prototype.clear);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.onError',
	xiv.utils.ErrorCatcher.prototype.onError);
goog.exportSymbol('xiv.utils.ErrorCatcher.prototype.dispose',
	xiv.utils.ErrorCatcher.prototype.dispose);
