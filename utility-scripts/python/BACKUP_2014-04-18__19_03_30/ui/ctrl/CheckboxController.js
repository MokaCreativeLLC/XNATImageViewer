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


    /**
     * @type {!Element}
     * @private
     */
    this.checkboxHolder_ = goog.dom.createDom('div', {
	'id' : 'CheckboxHodler_' + goog.string.createUniqueString()
    })
    goog.dom.classes.add(this.checkboxHolder_, 
		     xiv.ui.ctrl.CheckboxController.CSS.CHECKBOXHOLDER);


    /**
     * @type {!goog.ui.Checkbox}
     * @private
     */
    this.checkbox_ = new goog.ui.Checkbox(true);
    this.checkbox_.decorate(this.checkboxHolder_);
    this.setComponent(this.checkbox_);


    // Events
    goog.events.listen(this.checkbox_, goog.events.EventType.CHANGE, 
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

    window.console.log("DISPATCH CHECKBOX", this.checkbox_.isChecked());
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	checked: this.checkbox_.isChecked()
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.CheckboxController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    goog.dom.removeNode(this.checkboxHolder_);
    delete this.checkboxHolder_;
    
    // Check box
    goog.events.removeAll(this.checkbox_);
    this.checkbox_.disposeInternal();
    delete this.checkbox_();
}




