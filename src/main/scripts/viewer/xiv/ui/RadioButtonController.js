/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.RadioButtonController');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.events');

// xiv
goog.require('xiv.ui.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.RadioButtonController = function(){
    goog.base(this);


    this.setComponent(goog.dom.createDom('input', {
	'id' : this.constructor.ID_PREFIX + '_RadioButtonHolder_' + 
	    goog.string.createUniqueString(),
	'type' : 'radio'
    }))
    goog.dom.classes.add(this.getComponent(), 
			 xiv.ui.RadioButtonController.CSS.RADIOBUTTON);


    // Events
    goog.events.listen(this.getComponent(), goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.RadioButtonController, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.RadioButtonController', 
xiv.ui.RadioButtonController);



/**
 * @const
 * @public
 */
xiv.ui.RadioButtonController.ID_PREFIX =  
    'xiv.ui.RadioButtonController';


/**
 * @enum {string}
 * @expose
 */
xiv.ui.RadioButtonController.CSS_SUFFIX = {
    RADIOBUTTON: 'radiobutton'
};


/**
 * @inheritDoc
 */
xiv.ui.RadioButtonController.prototype.dispatchComponentEvent = function(){
    //window.console.log("DISPATCH RADIO", this.getComponent().checked);
    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
	checked: this.getComponent().checked
    })
}



/**
 * @inheritDoc
 */
xiv.ui.RadioButtonController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    // Nothing to do
}




goog.exportSymbol('xiv.ui.RadioButtonController.ID_PREFIX',
	xiv.ui.RadioButtonController.ID_PREFIX);
goog.exportSymbol('xiv.ui.RadioButtonController.CSS_SUFFIX',
	xiv.ui.RadioButtonController.CSS_SUFFIX);
goog.exportSymbol(
    'xiv.ui.RadioButtonController.prototype.dispatchComponentEvent',
    xiv.ui.RadioButtonController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.RadioButtonController.prototype.disposeInternal',
    xiv.ui.RadioButtonController.prototype.disposeInternal);
