/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ViewBoxDialogs');

// goog
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.Dialog');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.testing.events');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.object');
goog.require('goog.string.path');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.ui.Dialog');
goog.require('nrg.fx');

// xiv
goog.require('xiv.ui.HelpDialog');

//-----------




/**
 * @constructor
 * @param {xiv.ui.ViewBox} ViewBox
 * @extends {nrg.ui.Component}
 */

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
 * @expose
 */
xiv.ui.ViewBoxDialogs.CSS_SUFFIX = {
    GENERIC_TOGGLE: 'generic-toggle',
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
}



/**
 * @const
 */
xiv.ui.ViewBoxDialogs.TOGGLED_CLASS = 'ToggleClass_' + 
    goog.string.createUniqueString();




/**
 * @return {Objects.<string, nrg.ui.Dialog>}
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.getDialogs = function(){
    return this.Dialogs_
};



/**
 * @param {!string} dialogKey
 * @return {nrg.ui.Dialog}
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
xiv.ui.ViewBoxDialogs.prototype.createGenericToggleableDialog = 
function(dialogKey, dialogClass, toggleButtonClass, toggleButtonSrc,
	 opt_title, opt_isOn, opt_setModal, opt_buttonSet, opt_onToggle){

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
	    //this.Dialogs_[dialogKey].center();
	    
	    var eventKey = opened ? 
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

	    this.dispatchEvent({
		type: eventKey,
		dialog: this.Dialogs_[dialogKey],
		dialogKey: dialogKey
	    }) 

	}.bind(this), 
	toggleButtonSrc);



    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[dialogKey])){
	this.Dialogs_[dialogKey].dispose();
    }
    var currDialog = new nrg.ui.Dialog();
    this.Dialogs_[dialogKey] = currDialog;

    //
    // Set the dialog modal
    //
    currDialog.setModal(
	goog.isDefAndNotNull(opt_setModal) ? opt_setModal : false);

    //
    // Set the button set
    //
    currDialog.setButtonSet(
	goog.isDefAndNotNull(opt_buttonSet) ? opt_buttonSet : null);

    //
    // Render the dialog
    //
    currDialog.render(this.ViewBox_.getViewFrame());

    //
    // Set BG
    //
    currDialog.setBackgroundElementOpacity(0);
    //goog.dom.removeNode(currDialog.getBackgroundElement());  

    //
    // Center the dialog
    //
    this.Dialogs_[dialogKey].center();
 

    //
    // Set the dialog title
    //
    currDialog.setTitle(title);

    //
    // Add classes
    //
    goog.dom.classes.add(currDialog.getElement(), dialogClass);

    //
    // Grey out button on close
    //
    goog.events.listen(currDialog, 
	nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, 
	function(){
	    this.ViewBox_.onToggleButtonClicked(toggle);
	}.bind(this))

    //
    // AFTER_SHOW events
    //
    goog.events.listen(currDialog, 
	goog.ui.Dialog.EventType.AFTER_SHOW, 
	function(e){
	    //window.console.log('AFTER_SHOW:', e.target.getElement());
	    // Do nothing for now...
	}.bind(this))
    

    this.Dialogs_[dialogKey].setVisible(true);
    this.Dialogs_[dialogKey].center();
    this.Dialogs_[dialogKey].center(false);


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
xiv.ui.ViewBoxDialogs.prototype.createMeshesDialog = function(){
    this.createGenericToggleableDialog(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.MESHES,
	'xiv-ui-viewboxdialogs-meshes-dialog',
	xiv.ui.ViewBoxDialogs.CSS.GENERIC_TOGGLE,
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Mesh.png',
	'Volume Controls',
	false,
	false
    );
}




/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createVolumesDialog = function(){
    this.createGenericToggleableDialog(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.VOLUMES,
	'xiv-ui-viewboxdialogs-volumes-dialog',
	xiv.ui.ViewBoxDialogs.CSS.GENERIC_TOGGLE,
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Volume.png',
	'Volume Controls',
	false,
	false
    );
}


/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createDialogs = function(){
    this.createInUseDialog_();
    this.createHelpDialog_();
    this.createInfoDialog_();
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
	new nrg.ui.Dialog();
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
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.update = function(){
    goog.object.forEach(this.Dialogs_, function(Dialog){
	Dialog.updateLimits();
    })
}



/**
 * @param {string} ControllerTag
 * @param {boolean=} opt_visible
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.toggleVisible = function(tag, opt_visible){
    var opacity = (opt_visible === false) ? 0 : 1;
    window.console.log(tag, this.Dialogs_[tag]);
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

    var volCount = this.ViewBox_.getRenderer().getCurrentVolumes().length;
    var meshCount = this.ViewBox_.getRenderer().getCurrentMeshes().length;
    var annotCount = this.ViewBox_.getRenderer().getCurrentAnnotations().length;
    var helpDialog = 
	new xiv.ui.HelpDialog(volCount > 0, meshCount > 0, annotCount > 0);

    /**
    window.console.log('\n\n\nVOLS', 
		       this.ViewBox_.getRenderer().getCurrentVolumes(), 
		       'MESHES', 
		       this.ViewBox_.getRenderer().getCurrentMeshes(), 
		      'ANNOT', 
		       this.ViewBox_.getRenderer().getCurrentAnnotations());
    */
    //
    // Add text and render
    //
    helpDialog.setModal(false);
    helpDialog.setButtonSet(null);
    helpDialog.render(this.ViewBox_.getViewFrame());
    helpDialog.setVisible(false);
    helpDialog.center();


    //
    // Toggle button
    // 
    var helpToggle = 
	this.ViewBox_.createToggleButton(
	    'LEFT', 
	    xiv.ui.ViewBoxDialogs.CSS.GENERIC_TOGGLE,
	    xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP,
	   'Help', 
            function(button){
		var opened = button.getAttribute('checked') == 'true';
		helpDialog.setVisible(opened);
		helpDialog.center();

		var eventKey = opened ? 
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

		this.dispatchEvent({
		    type: eventKey,
		    dialog: helpDialog
		})
            }.bind(this), 
            serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png'
       );

    //
    // Grey out button on close
    //
    goog.events.listen(helpDialog, 
		      nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, function(){
			 this.ViewBox_.onToggleButtonClicked(helpToggle);
		      }.bind(this))


    //
    // toggle off help
    //
   this.ViewBox_.onToggleButtonClicked(helpToggle);
    //helpDialog.setVisible(false);


    this.Dialogs_[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP] = 
	new xiv.ui.HelpDialog();
}




/**
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.createInfoDialog_ = function(){
    var dialogKey = xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO;
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[
	dialogKey])){
	this.Dialogs_[dialogKey].dispose();
    }
    currDialog = new nrg.ui.Dialog();

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
    currDialog.setModal(false);
    currDialog.addText(infoText);
    currDialog.setButtonSet(null);
    currDialog.render(this.ViewBox_.getViewFrame());
    currDialog.setVisible(true);
    currDialog.moveToCorner('left', 'top', 0, -15);
    currDialog.setTitle('Info. Display');

    //
    // Set the mouseover
    //
    currDialog.setMouseoverClass(
	'xiv-ui-viewboxdialogs-infodialog-hovered')


    //
    // Classes
    //
    goog.dom.classes.add(currDialog.getElement(), 
			 xiv.ui.ViewBoxDialogs.CSS.INFODIALOG);
    goog.dom.classes.add(currDialog.getTextElements()[0], 
			 xiv.ui.ViewBoxDialogs.CSS.INFODIALOG_TEXT);


    //
    // Toggle button
    // 
    var infoToggle = 
	this.ViewBox_.createToggleButton(
	    'LEFT', 
	    xiv.ui.ViewBoxDialogs.CSS.GENERIC_TOGGLE,
	    dialogKey,
	    'Info. Display', 
	    function(button){

		var opened = button.getAttribute('checked') == 'true';
		currDialog.setVisible(opened);
		currDialog.moveToCorner('left', 'top', 0, -15);

		var eventKey = opened ? 
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		    xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

		this.dispatchEvent({
		    type: eventKey,
		    dialog: currDialog
		})
		
	    }.bind(this), serverRoot + 
		'/images/viewer/xiv/ui/ViewBox/Toggle-Info.png');
  

    goog.events.listen(currDialog, 
		      nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, function(){
			 this.ViewBox_.onToggleButtonClicked(infoToggle);
		      }.bind(this))


    currDialog.resizeToContents();
    this.Dialogs_[dialogKey] = currDialog;
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




goog.exportSymbol('xiv.ui.ViewBoxDialogs.EventType',
	xiv.ui.ViewBoxDialogs.EventType);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.ID_PREFIX',
	xiv.ui.ViewBoxDialogs.ID_PREFIX);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.CSS_SUFFIX',
	xiv.ui.ViewBoxDialogs.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.DIALOG_KEYS',
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.TOGGLED_CLASS',
	xiv.ui.ViewBoxDialogs.TOGGLED_CLASS);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.getDialogs',
	xiv.ui.ViewBoxDialogs.prototype.getDialogs);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.getDialog',
	xiv.ui.ViewBoxDialogs.prototype.getDialog);
goog.exportSymbol(
    'xiv.ui.ViewBoxDialogs.prototype.createGenericToggleableDialog',
	xiv.ui.ViewBoxDialogs.prototype.createGenericToggleableDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.createMeshesDialog',
	xiv.ui.ViewBoxDialogs.prototype.createMeshesDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.createVolumesDialog',
	xiv.ui.ViewBoxDialogs.prototype.createVolumesDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.createDialogs',
	xiv.ui.ViewBoxDialogs.prototype.createDialogs);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.setInUseSelect',
	xiv.ui.ViewBoxDialogs.prototype.setInUseSelect);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.showInUseDialog',
	xiv.ui.ViewBoxDialogs.prototype.showInUseDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.update',
	xiv.ui.ViewBoxDialogs.prototype.update);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.toggleVisible',
	xiv.ui.ViewBoxDialogs.prototype.toggleVisible);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.getHelpDialog',
	xiv.ui.ViewBoxDialogs.prototype.getHelpDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.disposeInternal',
	xiv.ui.ViewBoxDialogs.prototype.disposeInternal);
