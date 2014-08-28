/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ButtonController');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.ui.Button');
goog.require('goog.events');

// xiv
goog.require('xiv.ui.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.ButtonController = function(){
    goog.base(this);


    /**
     * @type {!goog.ui.Button}
     * @private
     */
    this.button_ = new goog.ui.Button('Reset');

    this.setComponent(this.button_);
   
    goog.dom.classes.add(this.button_.getElement(), 
			 'xiv-ui-buttoncontroller-element');


    // Events
    goog.events.listen(this.button_.getElement(), 
		       goog.events.EventType.CLICK, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.ButtonController, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.ButtonController', 
xiv.ui.ButtonController);



/**
 * @const
 * @public
 */
xiv.ui.ButtonController.ID_PREFIX =  'xiv.ui.ButtonController';


/**
 * @enum {string}
 * @expose
 */
xiv.ui.ButtonController.CSS_SUFFIX = {};





/**
 * @inheritDoc
 */
xiv.ui.ButtonController.prototype.dispatchComponentEvent = function(){
    //window.console.log("DISPATCH BUTTON", this.button_.isChecked());
    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
	checked: this.button_.isChecked()
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ButtonController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');    
    // Button
    goog.events.removeAll(this.button_);
    goog.events.removeAll(this.button_.getElement());
    this.button_.dispose();
    delete this.button_;
}




goog.exportSymbol('xiv.ui.ButtonController.ID_PREFIX',
	xiv.ui.ButtonController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ButtonController.CSS_SUFFIX',
	xiv.ui.ButtonController.CSS_SUFFIX);
goog.exportSymbol(
    'xiv.ui.ButtonController.prototype.dispatchComponentEvent',
    xiv.ui.ButtonController.prototype.dispatchComponentEvent);
goog.exportSymbol('xiv.ui.ButtonController.prototype.disposeInternal',
	xiv.ui.ButtonController.prototype.disposeInternal);




