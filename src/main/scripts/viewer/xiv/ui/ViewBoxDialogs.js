/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
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
goog.require('goog.style');

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
    MODALDIALOG: 'modaldialog',
}


/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxDialogs.DIALOG_KEYS = {
    INFO: 'Info_' + goog.string.createUniqueString(),
    HELP: 'Help_' + goog.string.createUniqueString(),
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

	    var currDialog = this.Dialogs_[dialogKey];
	    var opened = button.getAttribute('checked') == 'true';
	    //currDialog.setVisible(opened);
	    //this.Dialogs_[dialogKey].center();
	    
	    currDialog.setVisible(opened);

	    var eventKey = opened ? 
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED :
		xiv.ui.ViewBoxDialogs.EventType.DIALOG_CLOSED

	    this.dispatchEvent({
		type: eventKey,
		dialog: this.Dialogs_[dialogKey],
		dialogKey: dialogKey
	    }) 

	    //
	    // Update the position
	    //
	    this.updatePositions_(currDialog);
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
xiv.ui.ViewBoxDialogs.prototype.createPostRenderDialogs = function(){
    this.createHelpDialog_();
    this.createInfoDialog_();
}




/**
 * @param {!String} dialogKey
 * @throws Error if dialogKey is invalid.
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.validateDialogExists_ = function(dialogKey){
    if (!goog.isDefAndNotNull(this.Dialogs_[dialogKey])){
	throw new Error('Invalid dialog key: ', dialogKey);
    }
}


/**
 * @param {!string} content
 * @param {Element=} opt_parent
 * @param {Element=} opt_parent
 * @public
 */
xiv.ui.ViewBoxDialogs.createModalYesNoDialog = 
function(content, opt_parent, opt_onYes, opt_onNo){

    var dialog = new nrg.ui.Dialog();
    dialog.setButtonSet(goog.ui.Dialog.ButtonSet.YES_NO);
    dialog.render(goog.isDefAndNotNull(opt_parent) ? 
		  opt_parent : document.body);
    dialog.setContent(content);

    //
    // Add the class.
    //
    goog.dom.classes.add(
	dialog.getElement(), 
	'nrg-ui-dialogs-yesnomodal');

    //
    // Config
    //
    dialog.setModal(true);


    var dialogElt = dialog.getElement();
    var dialogBG = dialog.getBackgroundElement();
    var fadeTime = 150;


    goog.events.listenOnce(
	dialog, 
	goog.ui.Dialog.EventType.SELECT, 
	function(e) {

	    var dialogClone = dialogElt.cloneNode(true);
	    dialogClone.style.opacity = 1;
	    dialogClone.style.display = 'inline';
	    goog.dom.append(dialogElt.parentNode, dialogClone);

	    var dialogBGClone = dialogBG.cloneNode(true);
	    dialogBGClone.style.opacity = .7;
	    dialogBGClone.style.display = 'inline';
	    goog.dom.append(dialogElt.parentNode, dialogBGClone);

	    dialogClone.style.zIndex = 2000000000;
	    dialogBGClone.style.zIndex = 2000000000;


	    nrg.fx.parallelFade(
		[dialogClone, dialogBGClone], 1, 0, null, null, 
		function(){
		    goog.dom.removeNode(dialogClone);
		    delete dialogClone;
		    goog.dom.removeNode(dialogBGClone);
		    delete dialogBGClone;
		});
				 

	    var key = e.key.toLowerCase();
	    if (key === 'yes' && goog.isDefAndNotNull(opt_onYes)){
		opt_onYes();
	    }
	    else if (key === 'no' && goog.isDefAndNotNull(opt_onNo)){
		opt_onNo();
	    }

	    dialog.setDisposeOnHide(true);
	    dialog.onHide();
	});

    dialog.setVisible(true);
    dialog.center(true);
    dialog.setDisposeOnHide(false);

    dialogElt.style.opacity = 0;
    dialogElt.style.zIndex = 2000000000;
    dialogBG.style.opacity = 0;
    dialogBG.style.zIndex = 2000000000;
    nrg.fx.fadeIn(dialogElt, fadeTime);
    nrg.fx.fadeTo(dialogBG, fadeTime, .7);
}



/**
 * @return {Array.<Element>}
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.getVisibleDialogElements = function(){
    var elts = [];
    goog.object.forEach(this.Dialogs_, function(dialog){
	if (dialog.isVisible()){
	    elts.push(dialog.getElement());
	}
    })
    return elts;
} 



/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.showModalDialog = function(dialogKey){
    this.validateDialogExists_(dialogKey);
    this.Dialogs_[dialogKey].setVisible(true);
    this.Dialogs_[dialogKey].center()
} 


/**
 * @param {nrg.ui.Dialog}
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.updatePositions_ = function(opt_dialog){
    
    //window.console.log('\n\nUPDATE POSITONS');
    var dialogs = goog.isDefAndNotNull(opt_dialog) ? [opt_dialog] : 
	this.Dialogs_
    
    //
    // If we're out of bounds, we want to move the dialog 
    // back to the limits.
    //
    goog.object.forEach(dialogs, function(currDialog){

	if (!goog.isDefAndNotNull(currDialog) || goog.isFunction(currDialog)){
	    return}
	//window.console.log(currDialog);
	var limits = currDialog.getDraggerLimits();
	//window.console.log('limits', limits);		
	var key;

	//
	// Exit out if: 
	// 1) No limits are defined OR
	// 2) The limits have NaN values
	//
	if (!goog.isDefAndNotNull(limits)){return}
	for (key in limits){
	    if (isNaN(limits[key]) && !goog.isFunction(limits[key])){
		return;
	    }
	}

	//window.console.log(limits);
	var currSize = goog.style.getSize(currDialog.getElement());
	var currPos = goog.style.getPosition(currDialog.getElement());
	//window.console.log('before', currPos);
	var dialogRight = currPos.x + currSize.width;
	var dialogBottom = currPos.y + currSize.height;
	var limitsRight = limits.left + limits.width;
	var limitsBottom = limits.top + limits.height;

	//window.console.log('dial', dialogRight, dialogBottom);
	//window.console.log('imits', limitsRight, limitsBottom);

	var newX = currPos.x;
	var newY = currPos.y;

	if (dialogRight > limitsRight){
	    newX = (limits.left + limits.width) - currSize.width; 
	} 
	
	if (newX < 0){
	    newX = 0;
	}

	if (dialogBottom > limitsBottom){
	    newY = (limits.top + limits.height) - currSize.height; 
	} 
	
	if (newY < -15){
	    newY = -15;
	}
	//window.console.log('after', newX, newY);
	goog.style.setPosition(currDialog.getElement(), newX, newY);
    })
}



/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.update = function(){
    goog.object.forEach(this.Dialogs_, function(Dialog){
	Dialog.updateLimits();
	this.updatePositions_(Dialog);
    }.bind(this))
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

    goog.dom.classes.add(currDialog.getTitleElement(),
			 'xiv-ui-viewboxdialogs-infodialog-title');


    //
    // Generate widget text
    //
    var infoText = '';

    //
    // For viewables with a 'sessionInfo' property (i.e. Scans)
    //
    if (this.ViewBox_.getViewableTrees().length > 0) {
	infoText = this.ViewBox_.getViewableTrees()[0].getSessionInfoAsHtml();
    }

    //
    // Slicer thumbnails -- the filename is sufficient for now.
    //
    else {
	infoText = goog.string.path.basename(
	    this.ViewBox_.getViewableTrees()[0].getQueryUrl());
    }
    
    var dialogTitle = 'Info.';

    //
    // Add text and render
    //
    currDialog.setModal(false);
    currDialog.addText(infoText);
    currDialog.setButtonSet(null);
    currDialog.render(this.ViewBox_.getViewFrame());
    currDialog.setVisible(true);
    currDialog.moveToCorner('left', 'top', 0, -12);
    currDialog.setTitle(dialogTitle);


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
	    dialogTitle, 
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


		//
		// Hide the corner interactors
		//
		this.ViewBox_.showCornerInteractors(opened);

	    }.bind(this), serverRoot + 
		'/images/viewer/xiv/ui/ViewBox/Toggle-Info.png');
  

    //
    // Since we close the interactors as well, we don't want to turn
    // the toggle button off when the button is clicked.
    //
    /*
    goog.events.listen(currDialog, 
		      nrg.ui.Dialog.EventType.CLOSE_BUTTON_CLICKED, function(){
			 //this.ViewBox_.onToggleButtonClicked(infoToggle);
		      }.bind(this))
		      */
    currDialog.resizeToContents();
    this.Dialogs_[dialogKey] = currDialog;
    //
    // Close Info
    //
    this.ViewBox_.fireToggleButton(xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO); 

    var text = goog.dom.getElementsByClass('nrg-ui-dialog-text',
				   currDialog.getElement())
    //window.console.log(text);
    goog.dom.classes.add(text[0], 
	'xiv-ui-viewboxdialogs-infodialog-text');

    goog.dom.classes.add(currDialog.getContentElement(),
			 'xiv-ui-viewboxdialogs-infodialog-content');
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
goog.exportSymbol('xiv.ui.ViewBoxDialogs.createModalDialog',
	xiv.ui.ViewBoxDialogs.createModalDialog);
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
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.createPostRenderDialogs',
	xiv.ui.ViewBoxDialogs.prototype.createPostRenderDialogs);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.dispsePostRenderDialogs',
	xiv.ui.ViewBoxDialogs.prototype.disposePostRenderDialogs);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.setModalDialogOnYes',
	xiv.ui.ViewBoxDialogs.prototype.setModalDialogOnYes);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.showModalDialog',
	xiv.ui.ViewBoxDialogs.prototype.showModalDialog);

goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.getVisibleDialogElements',
	xiv.ui.ViewBoxDialogs.prototype.getVisibleDialogElements);

goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.update',
	xiv.ui.ViewBoxDialogs.prototype.update);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.toggleVisible',
	xiv.ui.ViewBoxDialogs.prototype.toggleVisible);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.getHelpDialog',
	xiv.ui.ViewBoxDialogs.prototype.getHelpDialog);
goog.exportSymbol('xiv.ui.ViewBoxDialogs.prototype.disposeInternal',
	xiv.ui.ViewBoxDialogs.prototype.disposeInternal);
