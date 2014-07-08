/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.events');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.RadioButtonController');
xiv.ui.ctrl.RadioButtonController = function(){
    goog.base(this);


    this.setComponent(goog.dom.createDom('input', {
	'id' : this.constructor.ID_PREFIX + '_RadioButtonHolder_' + 
	    goog.string.createUniqueString(),
	'type' : 'radio'
    }))
    goog.dom.classes.add(this.getComponent(), 
			 xiv.ui.ctrl.RadioButtonController.CSS.RADIOBUTTON);


    // Events
    goog.events.listen(this.getComponent(), goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.ctrl.RadioButtonController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.RadioButtonController', 
xiv.ui.ctrl.RadioButtonController);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.RadioButtonController.ID_PREFIX =  
    'xiv.ui.ctrl.RadioButtonController';


/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.RadioButtonController.CSS_SUFFIX = {
    RADIOBUTTON: 'radiobutton'
};


/**
 * @inheritDoc
 */
xiv.ui.ctrl.RadioButtonController.prototype.dispatchComponentEvent = function(){
    //window.console.log("DISPATCH RADIO", this.getComponent().checked);
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	checked: this.getComponent().checked
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.RadioButtonController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    // Nothing to do
}




goog.exportSymbol('xiv.ui.ctrl.RadioButtonController.ID_PREFIX',
	xiv.ui.ctrl.RadioButtonController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.RadioButtonController.CSS_SUFFIX',
	xiv.ui.ctrl.RadioButtonController.CSS_SUFFIX);
goog.exportSymbol(
    'xiv.ui.ctrl.RadioButtonController.prototype.dispatchComponentEvent',
    xiv.ui.ctrl.RadioButtonController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.ctrl.RadioButtonController.prototype.disposeInternal',
    xiv.ui.ctrl.RadioButtonController.prototype.disposeInternal);
