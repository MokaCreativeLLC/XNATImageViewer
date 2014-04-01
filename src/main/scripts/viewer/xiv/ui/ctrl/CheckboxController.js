/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog

// xiv
goog.require('xiv.ui.ctrl.XtkController');




/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.CheckboxController = function(){
    goog.base(this);

    this.setLabel('Display All');


    this.setComponent(goog.dom.createDom('div', {
	'id' : 'CheckBoxHodler_' + goog.string.createUniqueString()
    }))

    goog.dom.classes.add(this.getComponent(), 
		     xiv.ui.ctrl.CheckboxController.CSS.CHECKBOXHOLDER);


    /**
     * @type {!goog.ui.Checkbox}
     * @private
     */
    this.checkBox_ = new goog.ui.Checkbox(true);
    this.checkBox_.decorate(this.getComponent());


    // Events
    goog.events.listen(this.checkBox_, goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.ctrl.CheckboxController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.CheckboxController', 
xiv.ui.ctrl.CheckboxController);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.CheckboxController.ID_PREFIX =  'xiv.ui.ctrl.CheckboxController';


/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.CheckboxController.CSS_SUFFIX = {
    CHECKBOXHOLDER: 'checkboxholder'
};


/**
 * @inheritDoc
 */
xiv.ui.ctrl.CheckboxController.prototype.dispatchComponentEvent = function(){

    window.console.log("DISPATCH CHECKBOX", this.checkBox_.isChecked());
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	checked: this.checkBox_.isChecked()
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.CheckboxController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Check box
    goog.events.removeAll(this.checkBox_);
    this.checkBox_.disposeInternal();
    delete this.checkBox_();
}




