/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.ButtonController');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.ui.Button');
goog.require('goog.events');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.ButtonController = function(){
    goog.base(this);


    /**
     * @type {!goog.ui.Button}
     * @private
     */
    this.button_ = new goog.ui.Button('Reset to Defaults');

    this.setComponent(this.button_);
    
    this.button_.getElement().style.fontFamily = 
	'Helvetica,"Helvetica neue", Arial, sans-serif';
    this.button_.getElement().style.fontSize = '10px';
    this.button_.getElement().style.width = '100%';

    // Events
    goog.events.listen(this.button_.getElement(), 
		       goog.events.EventType.CLICK, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.ctrl.ButtonController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.ButtonController', 
xiv.ui.ctrl.ButtonController);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.ButtonController.ID_PREFIX =  'xiv.ui.ctrl.ButtonController';


/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.ButtonController.CSS_SUFFIX = {};





/**
 * @inheritDoc
 */
xiv.ui.ctrl.ButtonController.prototype.dispatchComponentEvent = function(){
    //window.console.log("DISPATCH BUTTON", this.button_.isChecked());
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	checked: this.button_.isChecked()
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.ButtonController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');    
    // Button
    goog.events.removeAll(this.button_);
    goog.events.removeAll(this.button_.getElement());
    this.button_.dispose();
    delete this.button_;
}




goog.exportSymbol('xiv.ui.ctrl.ButtonController.ID_PREFIX',
	xiv.ui.ctrl.ButtonController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.ButtonController.CSS_SUFFIX',
	xiv.ui.ctrl.ButtonController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.ButtonController.prototype.setChecked',
	xiv.ui.ctrl.ButtonController.prototype.setChecked);
goog.exportSymbol(
    'xiv.ui.ctrl.ButtonController.prototype.dispatchComponentEvent',
    xiv.ui.ctrl.ButtonController.prototype.dispatchComponentEvent);
goog.exportSymbol('xiv.ui.ctrl.ButtonController.prototype.disposeInternal',
	xiv.ui.ctrl.ButtonController.prototype.disposeInternal);




