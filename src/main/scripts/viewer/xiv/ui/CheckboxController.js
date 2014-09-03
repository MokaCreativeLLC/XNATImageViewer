/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.CheckboxController');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.ui.Checkbox');
goog.require('goog.events');

// xiv
goog.require('xiv.ui.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.CheckboxController = function(){
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
		     xiv.ui.CheckboxController.CSS.CHECKBOXHOLDER);


    /**
     * @type {!goog.ui.Checkbox}
     * @private
     */
    this.checkbox_ = new goog.ui.Checkbox(true);
    this.checkbox_.decorate(this.checkboxHolder_);
    this.setComponent(this.checkbox_);


    // Events
    goog.events.listen(this.checkbox_, goog.events.EventType.CHANGE, 
		       this.onChange_.bind(this));
    		       
}

goog.inherits(xiv.ui.CheckboxController, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.CheckboxController', 
xiv.ui.CheckboxController);



/**
 * @const
 * @public
 */
xiv.ui.CheckboxController.ID_PREFIX =  'xiv.ui.CheckboxController';


/**
 * @enum {string}
 * @expose
 */
xiv.ui.CheckboxController.CSS_SUFFIX = {
    CHECKBOXHOLDER: 'checkboxholder'
};




/**
 * @public
 */
xiv.ui.CheckboxController.prototype.refresh = function(){
    var isChecked = this.getComponent().isChecked();
    this.setChecked(isChecked);
}




/**
 * @param {!boolean} checked
 * @public
 */
xiv.ui.CheckboxController.prototype.setChecked = 
function(checked){
    this.getComponent().setChecked(checked);
}



/**
 * @private
 */
xiv.ui.CheckboxController.prototype.onChange_ = function(){
   this.dispatchComponentEvent();
}



/**
 * @inheritDoc
 */
xiv.ui.CheckboxController.prototype.dispatchComponentEvent = function(){
    //window.console.log("DISPATCH CHECKBOX", this.checkbox_.isChecked());
    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
	checked: this.checkbox_.isChecked()
    })
}



/**
 * @return {!Element}
 */
xiv.ui.CheckboxController.prototype.getCheckboxHolder = function() {
    return this.checkboxHolder_;
}



/**
 * @inheritDoc
 */
xiv.ui.CheckboxController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    goog.dom.removeNode(this.checkboxHolder_);
    delete this.checkboxHolder_;
    
    // Check box
    goog.events.removeAll(this.checkbox_);
    this.checkbox_.dispose();
    delete this.checkbox_;
}




goog.exportSymbol('xiv.ui.CheckboxController.ID_PREFIX',
	xiv.ui.CheckboxController.ID_PREFIX);
goog.exportSymbol('xiv.ui.CheckboxController.CSS_SUFFIX',
	xiv.ui.CheckboxController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.CheckboxController.prototype.setChecked',
	xiv.ui.CheckboxController.prototype.setChecked);
goog.exportSymbol('xiv.ui.CheckboxController.prototype.refresh',
	xiv.ui.CheckboxController.prototype.refresh);
goog.exportSymbol('xiv.ui.CheckboxController.prototype.getCheckboxHolder',
	xiv.ui.CheckboxController.prototype.getCheckboxHolder);
goog.exportSymbol(
    'xiv.ui.CheckboxController.prototype.dispatchComponentEvent',
    xiv.ui.CheckboxController.prototype.dispatchComponentEvent);
goog.exportSymbol('xiv.ui.CheckboxController.prototype.disposeInternal',
	xiv.ui.CheckboxController.prototype.disposeInternal);




