/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.ToggleButton');

// nrg


// xiv




/**
 * @constructor
 * @param {xiv.ui.ViewBox} ViewBox
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ViewBoxDialogs');

xiv.ui.ViewBoxDialogs = function (ViewBox) {
    goog.base(this);



    /**
     * @type {Object.<string, goog.ui.Dialog>}
     * @private
     */
    this.Dialogs_ = {};



    /**
     * @private
     * @type {xiv.ui.ViewBox}
     */
    this.ViewBox_ = ViewBox;
}
goog.inherits(xiv.ui.ViewBoxDialogs, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ViewBoxDialogs', xiv.ui.ViewBoxDialogs);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxDialogs.EventType = {
    //THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
    DIALOG_OPENED: goog.events.getUniqueId('dialog-opened'),
    DIALOG_CLOSED: goog.events.getUniqueId('dialog-closed'),
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBoxDialogs.ID_PREFIX =  'xiv.ui.ViewBoxDialogs';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxDialogs.CSS_SUFFIX = {
    HELP_TOGGLE: 'help-toggle',
    LEVELS_TOGGLE: 'levels-toggle',
    INFO_TOGGLE: 'info-toggle',

    RENDERCONTROLMENU_TOGGLE: 'rendercontrol-toggle',

    INFODIALOG: 'infodialog',
    INFODIALOG_TEXT: 'infodialog-text',
    INUSEDIALOG: 'inusedialog',
}


/**
 * @enum {string}
 */
xiv.ui.ViewBoxDialogs.DIALOG_KEYS = {
    INFO: 'Info_' + goog.string.createUniqueString(),
    HELP: 'Help_' + goog.string.createUniqueString(),
    INUSE: 'InUse_' + goog.string.createUniqueString(),
    LEVELS: 'Levels_' + goog.string.createUniqueString(),
    RENDERCONTROLMENU: 'RenderControlMenu_' + goog.string.createUniqueString(),
}



/**
 * @const
 */
xiv.ui.ViewBoxDialogs.TOGGLED_CLASS = 'ToggleClass_' + 
    goog.string.createUniqueString();




/**
 * @return {Objects.<string, nrg.ui.Overlay>}
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.getDialogs = function(){
    return this.Dialogs_
};



/**
 * @param {!string} dialogKey
 * @return {nrg.ui.Overlay}
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.getDialog = function(dialogKey){
    return this.Dialogs_[dialogKey]
};




/**
 * @param {!string} dialogKey
 * @param {!string} dialogClass
 * @param {!string} toggleButtonClass
 * @param {!string} toggleButtonSrc
 * @param {string=} opt_title
 * @param {boolean=} opt_isOn
 * @param {boolean=} opt_setModal
 * @param {string=} opt_buttonSet
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createGenericDialog = 
function(dialogKey, dialogClass, toggleButtonClass, toggleButtonSrc,
	 opt_title, opt_isOn, opt_setModal, opt_buttonSet){

    //
    // Set the title
    //
    var title = goog.isDefAndNotNull(opt_title) ? opt_title : '';


    //
    // Create the toggle button
    //
    var toggle = this.ViewBox_.createToggleButton(
	'LEFT', 
	toggleButtonClass, 
	dialogKey,
	title, 
	function(button){

	    var opened = button.getAttribute('checked') == 'true';
	    this.Dialogs_[dialogKey].setVisible(opened);
	    this.Dialogs_[dialogKey].center();
	    
	    var eventKey = opened ? 
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

	    this.dispatchEvent({
		type: eventKey,
		dialog: this.Dialogs_[dialogKey]
	    })

	}.bind(this), 
	toggleButtonSrc);



    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[dialogKey])){
	this.Dialogs_[dialogKey].dispose();
    }
    this.Dialogs_[dialogKey] = new nrg.ui.Overlay();

    //
    // Set the dialog modal
    //
    this.Dialogs_[dialogKey].setModal(
	goog.isDefAndNotNull(opt_setModal) ? opt_setModal : false);

    //
    // Set the button set
    //
    this.Dialogs_[dialogKey].setButtonSet(
	goog.isDefAndNotNull(opt_buttonSet) ? opt_buttonSet : null);

    //
    // Render the dialog
    //
    this.Dialogs_[dialogKey].render(this.ViewBox_.getViewFrame());

    //
    // Center the dialog
    //
    this.Dialogs_[dialogKey].center();

    //
    // Set the dialog title
    //
    this.Dialogs_[dialogKey].setTitle(title);

    //
    // Add classes
    //
    goog.dom.classes.add(this.Dialogs_[dialogKey].getElement(), dialogClass);

    //
    // Grey out button on close
    //
    goog.events.listen(this.Dialogs_[dialogKey], 
	nrg.ui.Overlay.EventType.CLOSE_BUTTON_CLICKED, 
	function(){
	    this.ViewBox_.onToggleButtonClicked(toggle);
	}.bind(this))
    
    //
    // Set off
    //
    if (opt_isOn === false){
	goog.testing.events.fireClickEvent(
	    this.ViewBox_.getToggleButtons()[dialogKey]);
    }
}




/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createRenderControlDialog = function(){
    this.createGenericDialog(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.RENDERCONTROLMENU,
	'xiv-ui-viewboxdialogs-rendercontrol-dialog',
	xiv.ui.ViewBoxDialogs.CSS.RENDERCONTROLMENU_TOGGLE,
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-RenderControlMenu.png',
	'Misc. Render Controls',
	false,
	false
    );
}



/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createLevelsDialog = function(){
    this.createGenericDialog(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS,
	'xiv-ui-viewboxdialogs-levels-dialog',
	xiv.ui.ViewBoxDialogs.CSS.LEVELS_TOGGLE,
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-BrightnessContrast.png',
	'Brightness / Contrast',
	false,
	false
    );
}



/**
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.render = function(){
    //
    // Inits
    //
    this.createInUseDialog_();
    this.createHelpDialog_();
}



/**
 * @param {Function=} opt_onYes
 * @param {Function=} opt_onNo
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.setInUseSelect =
 function(opt_onYes, opt_onNo){
    goog.events.listenOnce(this.Dialogs_
			   [xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE], 
    goog.ui.Dialog.EventType.SELECT, 
    function(e) {
	if (e.key === 'yes' && goog.isDefAndNotNull(opt_onYes)){
	    opt_onYes(this);
	}
	if (e.key === 'no' && goog.isDefAndNotNull(opt_onNo)){
	    opt_onNo(this);
	}
    }.bind(this));
}



/**
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.createInUseDialog_ = function(){
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE] = 
	new nrg.ui.Overlay();
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].setButtonSet(
	goog.ui.Dialog.ButtonSet.YES_NO);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].setContent(
	'ViewBox in use.&nbspProceed anyway?');
}



/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.showInUseDialog = function(){    
    //
    // Add the class.
    //
    goog.dom.classes.add(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].
			 getElement(), 
			 xiv.ui.ViewBoxDialogs.CSS.INUSEDIALOG);
    //
    // Config
    //
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].setModal(true);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].setVisible(true);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INUSE].center()
}






/**
 * @param {string} ControllerTag
 * @param {boolean=} opt_visible
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.toggleVisible = function(tag, opt_visible){
    var opacity = (opt_visible === false) ? 0 : 1;
    if (goog.isDefAndNotNull(this.Dialogs_[tag].getElement())){
	nrg.fx.fadeTo(this.Dialogs_[tag].getElement(), 200, opacity);
    }
}




/**
 * @public
 * @return {nrg.ui.Dialog}
 */
xiv.ui.ViewBoxDialogs.prototype.getHelpDialog = function(){
    return this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP];
}


/**
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.createHelpDialog_ = function(){
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP])){
	this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].dispose();
    }
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP] = 
	new xiv.ui.HelpDialog();

    
    //
    // Add text and render
    //
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].setModal(false);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].setButtonSet(null);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].setVisible(false);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].center();


    //
    // Toggle button
    // 
    var helpToggle = 
	this.ViewBox_.createToggleButton(
	    'LEFT', 
	    xiv.ui.ViewBoxDialogs.CSS.HELP_TOGGLE,
	    xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP,
	   'Help', 
            function(button){
		var opened = button.getAttribute('checked') == 'true';
		this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].
		    setVisible(opened);
		this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].center();


		var eventKey = opened ? 
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

		this.dispatchEvent({
		    type: eventKey,
		    dialog: this.Dialogs_[dialogKey]
		})
            }.bind(this), 
            serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png'
       );

    //
    // Grey out button on close
    //
    goog.events.listen(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP], 
		      nrg.ui.Overlay.EventType.CLOSE_BUTTON_CLICKED, function(){
			 this.ViewBox_.onToggleButtonClicked(helpToggle);
		      }.bind(this))


    //
    // toggle off help
    //
   this.ViewBox_.onToggleButtonClicked(helpToggle);
    //this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP].setVisible(false);
}




/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createInfoDialog = function(){
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO])){
	this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].dispose();
    }
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO] = new nrg.ui.Overlay();

    //
    // Generate widget text
    //
    var infoText = '';

    //
    // For viewables with a 'sessionInfo' property (i.e. Scans)
    //
    if (this.ViewBox_.getViewableTrees().length > 0) {
 	goog.object.forEach(this.ViewBox_.getViewableTrees()[0].
			    getSessionInfo(), 
	    function(value, key){
		if (goog.isDefAndNotNull(value)){
		    if (value.length > 0){
			infoText += key + ': ' + value + '<br>';
		    }
		}
	    })
    }

    //
    // Slicer thumbnails -- the filename is sufficient for now.
    //
    else {
	infoText = goog.string.path.basename(
	    this.ViewBox_.getViewableTrees()[0].getQueryUrl());
    }
    
    //
    // Add text and render
    //
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].setModal(false);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].addText(infoText);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].setButtonSet(null);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].setVisible(true);
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].moveToCorner('left', 'top');

    //
    // Set the mouseover
    //
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].addContentClass(
	'xiv-ui-viewboxdialogs-infodialog-content')
    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].setMouseoverClass(
	'xiv-ui-viewboxdialogs-infodialog-hovered')


    //
    // Classes
    //
    goog.dom.classes.add(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].
			 getElement(), 
			 xiv.ui.ViewBoxDialogs.CSS.INFODIALOG);
    goog.dom.classes.add(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].
			 getTextElements()[0], 
			 xiv.ui.ViewBoxDialogs.CSS.INFODIALOG_TEXT);
    
    //
    // Toggle button
    // 
    var infoToggle = 
	this.ViewBox_.createToggleButton(
	    'LEFT', 
	    xiv.ui.ViewBoxDialogs.CSS.INFO_TOGGLE,
	    xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO,
	    'Info. Display', 
	    function(button){

		var opened = button.getAttribute('checked') == 'true';
		this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO].
		    setVisible(opened);
		this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO]
		    .moveToCorner
		('left', 'top');

		var eventKey = opened ? 
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

		this.dispatchEvent({
		    type: eventKey,
		    dialog: this.Dialogs_[dialogKey]
		})
		
	    }.bind(this), serverRoot + 
		'/images/viewer/xiv/ui/ViewBox/Toggle-Info.png');
  

    goog.events.listen(this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO], 
		      nrg.ui.Overlay.EventType.CLOSE_BUTTON_CLICKED, function(){
			 this.ViewBox_.onToggleButtonClicked(infoToggle);
		      }.bind(this))
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxDialogs.prototype.disposeInternal = function(){
    delete this.ViewBox_;

    //
    // Dialogs
    //
    if (goog.isDefAndNotNull(this.Dialogs_)){
	goog.object.forEach(this.Dialogs_, function(Dialog){
	    goog.events.removeAll(Dialog);
	    Dialog.disposeInternal();
	    Dialog.dispose();
	}.bind(this))
	goog.object.clear(this.Dialogs_);
    }
}
