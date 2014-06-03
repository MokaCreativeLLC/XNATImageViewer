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


    /**
     * @type {Object.<string, Element}
     * @private
     */
    this.toggleButtons_ = {};
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
    BUTTON_THREEDTOGGLE: 'button-threedtoggle',
    BUTTON_INFOTOGGLE: 'button-infotoggle',
    BUTTON_HELPTOGGLE: 'button-helptoggle',
    BUTTON_CROSSHAIRTOGGLE: 'button-crosshairtoggle',
    BUTTON_BRIGHTNESSCONSTRASTTOGGLE: 'button-brightnesscontrasttoggle',
    INFODIALOG: 'infodialog',
    INFODIALOG_TEXT: 'infodialog-text',
    HELPDIALOG: 'helpdialog',
    HELPDIALOG_DIALOG: 'helpdialog-dialog',
    HELPDIALOG_TEXT: 'helpdialog-text',
    INUSEDIALOG: 'inusedialog',
}



/**
 * @enum {string}
 */
xiv.ui.ViewBoxDialogs.DIALOGS = {
    INFO: 'info',
    HELP: 'help',
    INUSE: 'inuse'
}



/**
 * @const
 */
xiv.ui.ViewBoxDialogs.TOGGLED_CLASS = 'ToggleClass_' + 
    goog.string.createUniqueString();




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
    goog.events.listenOnce(this.Dialogs_[this.constructor.DIALOGS.INUSE], 
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
    this.Dialogs_[this.constructor.DIALOGS.INUSE] = new nrg.ui.Overlay();
    this.Dialogs_[this.constructor.DIALOGS.INUSE].setButtonSet(
	goog.ui.Dialog.ButtonSet.YES_NO);
    this.Dialogs_[this.constructor.DIALOGS.INUSE].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[this.constructor.DIALOGS.INUSE].setContent(
	'ViewBox in use.&nbspProceed anyway?');
}



/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.showInUseDialog = function(){    
    //
    // Add the class.
    //
    goog.dom.classes.add(this.Dialogs_[this.constructor.DIALOGS.INUSE].
			 getElement(), 
			 this.constructor.CSS.INUSEDIALOG);
    //
    // Config
    //
    this.Dialogs_[this.constructor.DIALOGS.INUSE].setModal(true);
    this.Dialogs_[this.constructor.DIALOGS.INUSE].setVisible(true);
    this.Dialogs_[this.constructor.DIALOGS.INUSE].center()
}






/**
 * @param {string} ControllerTag
 * @param {boolean=} opt_visible
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.toggleVisible = function(tag, opt_visible){
    var opacity = (opt_visible === false) ? 0 : 1;
    nrg.fx.fadeTo(this.Dialogs_[tag].getElement(), 200, opacity);
}




/**
 * @public
 * @return {nrg.ui.Dialog}
 */
xiv.ui.ViewBoxDialogs.prototype.getHelpDialog = function(){
    return this.Dialogs_[this.constructor.DIALOGS.HELP];
}


/**
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.createHelpDialog_ = function(){
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[this.constructor.DIALOGS.HELP])){
	this.Dialogs_[this.constructor.DIALOGS.HELP].dispose();
    }
    this.Dialogs_[this.constructor.DIALOGS.HELP] = new xiv.ui.HelpDialog();

    
    //
    // Add text and render
    //
    this.Dialogs_[this.constructor.DIALOGS.HELP].setModal(false);
    this.Dialogs_[this.constructor.DIALOGS.HELP].setButtonSet(null);
    this.Dialogs_[this.constructor.DIALOGS.HELP].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[this.constructor.DIALOGS.HELP].setVisible(false);
    this.Dialogs_[this.constructor.DIALOGS.HELP].center();


    //
    // Classes
    //
    /*
    goog.dom.classes.add(this.Dialogs_[this.constructor.DIALOGS.HELP].
			 getElement(), 
			 this.constructor.CSS.HELPDIALOG);
    goog.dom.classes.add(this.Dialogs_[this.constructor.DIALOGS.HELP].
			 getTextElements()[0], 
			 this.constructor.CSS.HELPDIALOG_TEXT);
    */
    //
    // Toggle button
    // 
    var helpToggle = 
	this.createToggleButton_(
	    this.constructor.CSS.BUTTON_HELPTOGGLE,
	   'Help', 
            function(button){
	      this.Dialogs_[this.constructor.DIALOGS.HELP].setVisible(
	         (button.getAttribute('checked') == 'true'));
	      this.Dialogs_[this.constructor.DIALOGS.HELP].center();
            }.bind(this), 

            serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png'
       );


    //
    // Store button
    //
    this.toggleButtons_[this.constructor.DIALOGS.HELP] = helpToggle;

    //
    // Grey out button on close
    //
    goog.events.listen(this.Dialogs_[this.constructor.DIALOGS.HELP], 
		      nrg.ui.Overlay.EventType.CLOSE_BUTTON_CLICKED, function(){
			  this.onToggleButtonClicked_(helpToggle);
		      }.bind(this))


    //
    // toggle off help
    //
    this.onToggleButtonClicked_(this.toggleButtons_
				[this.constructor.DIALOGS.HELP]);
    //this.Dialogs_[this.constructor.DIALOGS.HELP].setVisible(false);
}




/**
 * @public
 */
xiv.ui.ViewBoxDialogs.prototype.createInfoDialog = function(){
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.Dialogs_[this.constructor.DIALOGS.INFO])){
	this.Dialogs_[this.constructor.DIALOGS.INFO].dispose();
    }
    this.Dialogs_[this.constructor.DIALOGS.INFO] = new nrg.ui.Overlay();

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
    this.Dialogs_[this.constructor.DIALOGS.INFO].setModal(false);
    this.Dialogs_[this.constructor.DIALOGS.INFO].addText(infoText);
    this.Dialogs_[this.constructor.DIALOGS.INFO].setButtonSet(null);
    this.Dialogs_[this.constructor.DIALOGS.INFO].render(
	this.ViewBox_.getViewFrame());
    this.Dialogs_[this.constructor.DIALOGS.INFO].setVisible(true);
    this.Dialogs_[this.constructor.DIALOGS.INFO].moveToCorner('left', 'top');

    //
    // Set the mouseover
    //
    this.Dialogs_[this.constructor.DIALOGS.INFO].addContentClass(
	'xiv-ui-viewboxdialogs-infodialog-content')
    this.Dialogs_[this.constructor.DIALOGS.INFO].setMouseoverClass(
	'xiv-ui-viewboxdialogs-infodialog-hovered')


    //
    // Classes
    //
    goog.dom.classes.add(this.Dialogs_[this.constructor.DIALOGS.INFO].
			 getElement(), 
			 this.constructor.CSS.INFODIALOG);
    goog.dom.classes.add(this.Dialogs_[this.constructor.DIALOGS.INFO].
			 getTextElements()[0], 
			 this.constructor.CSS.INFODIALOG_TEXT);
    
    //
    // Toggle button
    // 
    var infoToggle = 
	this.createToggleButton_(this.constructor.CSS.BUTTON_INFOTOGGLE,
			    'Info. Display', 
       function(button){

	   this.Dialogs_[this.constructor.DIALOGS.INFO].setVisible(
	       (button.getAttribute('checked') == 'true'));
	   this.Dialogs_[this.constructor.DIALOGS.INFO].moveToCorner
	   ('left', 'top');


	   window.console.log(
	       this.Dialogs_[this.constructor.DIALOGS.INFO].getElement());

       }.bind(this), serverRoot + 
			     '/images/viewer/xiv/ui/ViewBox/Toggle-Info.png');

    //
    // Store button
    //
    this.toggleButtons_[this.constructor.DIALOGS.INFO] = infoToggle;



    goog.events.listen(this.Dialogs_[this.constructor.DIALOGS.INFO], 
		      nrg.ui.Overlay.EventType.CLOSE_BUTTON_CLICKED, function(){
			  this.onToggleButtonClicked_(infoToggle);
		      }.bind(this))
}




/**
 * @param {!Element}
 * @param {Function=}
 */
xiv.ui.ViewBoxDialogs.prototype.onToggleButtonClicked_ = 
function(button, opt_onCheck){

    button.setAttribute('checked', 
	(button.getAttribute('checked') == 'true') ? 'false': 'true');

    if (button.getAttribute('checked') == 'true') {
	goog.dom.classes.add(button, button.getAttribute(
	    xiv.ui.ViewBoxDialogs.TOGGLED_CLASS));
    } else {
	goog.dom.classes.remove(button, button.getAttribute(
	    xiv.ui.ViewBoxDialogs.TOGGLED_CLASS));
    }

    if (goog.isDefAndNotNull(opt_onCheck)){
	opt_onCheck(button);
    }
}



/**
 * @param {!string} defaultClass,
 * @param {string=} opt_tooltip
 * @param {Function=} opt_onCheck
 * @param {src=} opt_src
 * @return {Element}
 * @private
 */
xiv.ui.ViewBoxDialogs.prototype.createToggleButton_ = 
    function(defaultClass, opt_tooltip, opt_onCheck, opt_src) {
	//
	// Create the toggle button
	//
	var onClass = goog.getCssName(defaultClass, 'on')
	var iconbutton = goog.dom.createDom('img', defaultClass);


	iconbutton.title = opt_tooltip;


	if (goog.isDefAndNotNull(opt_src)){
	    iconbutton.src = opt_src;
	}

	//
	// Set the default check stated
	//
	iconbutton.setAttribute('checked', 'true');
	iconbutton.setAttribute(xiv.ui.ViewBoxDialogs.TOGGLED_CLASS, 
				defaultClass + '-on')
	
	//
	// Add the 'on' class if it's default class is on
	//
	goog.dom.classes.add(iconbutton, onClass);

	//
	// Clean up the CSS
	//
	nrg.style.setStyle(iconbutton, {'cursor': 'pointer'})


	//
	// Toggle event
	//
	goog.events.listen(iconbutton, goog.events.EventType.CLICK, 
	function(e){
	    window.console.log("CLICK", e.target);
	    this.onToggleButtonClicked_(iconbutton, opt_onCheck);
	}.bind(this));

	//
	// Adds to menu
	//
	this.ViewBox_.addToMenu('LEFT', iconbutton);
	return iconbutton;
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


    //
    // Dialogs
    //
    if (goog.isDefAndNotNull(this.toggleButtons_)){
	goog.object.forEach(this.toggleButtons_, function(tb){
	    goog.events.removeAll(tb);
	    goog.dom.removeNode(tb);
	    delete tb;
	}.bind(this))
	goog.object.clear(this.toggleButtons_);
    }



    // toggle buttons MenuLeft
    if (goog.isDefAndNotNull(this.toggleButtons_)){
	goog.dom.removeNode(this.menus_.LEFT);
	delete this.menus_.LEFT;
	
	goog.object.forEach(this.toggleButtons_, function(button){
	    goog.events.removeAll(button);
	    goog.dom.removeNode(button);
	    button = null;
	})
	goog.array.clear(this.toggleButtons_);
	delete this.toggleButtons_;
    }
}
