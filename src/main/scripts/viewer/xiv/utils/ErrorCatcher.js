/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.utils.ErrorCatcher');

// goog
goog.require('goog.Disposable');

// nrg
goog.require('nrg.ui.ErrorDialog');


// xiv


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
	that.windowConsoleLog_.apply(this, arguments);
	var argText = '';
	goog.array.forEach(arguments, function(argument, i){
	    if (i > 0) { argText += ' ' };
	    argText += argument;
	})
	that.consoleLog_.push(argText);
    }

    window.console.log = this.newConsoleLog_;
    window.onerror = this.onError_.bind(this);
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
    } else {
	window.onerror = undefined;
	this.unlistenForConsoleOutput_();
    }
}





/**
 * @param {?string} opt_errorMsg
 * @param {?string} opt_url
 * @param {?number} opt_lineNumber
 * @private
 */
xiv.utils.ErrorCatcher.prototype.onError_ = 
function(opt_errorMsg, opt_url, opt_lineNumber){
    
    window.console.log('ON ERROR');

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


    if (this.consoleLog_.indexOf(
	'Unknown number of bits allocated - using default: 32 bits') > -1){

	errorMessage += 'The render engine (' + 
	    '<a target="_blank" style="color: #66CCFF" ' + 
	    'href="https://github.com/xtk/X#readme">' + 
	    'XTK</a>' + 
	    ') does not yet support big-endian encoded DICOMs :(<br><br>';
	subMessage += 
	    '<a target="_blank" style="color: #66CCFF" ' + 
	    'href="http://stackoverflow.com/questions/' + 
	    '22356911/xtk-error-while-loading-dicom-files">For more ' + 
	    'information click here.</a>';


	subMessage += '<br><br>Console reference:<br>' + 
	    '\'Unknown number of bits allocated - using default: 32 bits\'';


    } else {
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
    }

    //window.console.log(errorMessage, subMessage);


    //
    // Dispatch the error
    //
    /**
    this.dispatchEvent({
	type: xiv.ui.ViewBox.EventType.RENDER_ERROR,
	message: opt_errorMsg
    })
    */

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
    this.ErrorDialog_.getElement().style.opacity = 0;

    this.ErrorDialog_.resizeToContents();
    this.ErrorDialog_.center();


    nrg.fx.fadeIn(this.ErrorDialog_.getElement(), 200)


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
 * @inheritDoc
 */
xiv.utils.ErrorCatcher.prototype.dispose = function(){
    goog.base(this, 'dispose');
    if (goog.isDefAndNotNull(this.ErrorDialog_)){
	this.ErrorDialog_.dispose();
	delete this.ErrorDialog_;
    }
    delete this.windowConsoleLog_;
    delete this.newConsoleLog_;
    delete this.dialogParent_;
}
