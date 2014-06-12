/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');

// utils
goog.require('nrg.ui.Component');




/**
 * xiv.ui.layouts.interactors.InputController
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.interactors.InputController');
xiv.ui.layouts.interactors.InputController = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.InputController, nrg.ui.Component);
goog.exportSymbol('xiv.ui.layouts.interactors.InputController', 
		  xiv.ui.layouts.interactors.InputController);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.InputController.EventType = {
    INPUT: 'input',
    DISPLAY: 'display'
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.InputController.ID_PREFIX =  
    'xiv.ui.layouts.interactors.InputController';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.InputController.CSS_SUFFIX = {
    INPUT_BOX: 'inputbox',
    INPUT_BOX_HOVERED: 'inputbox-hovered',
    DISPLAY: 'display',
}



/**
 * @type {?Element}
 * @private
 */
xiv.ui.layouts.interactors.InputController.prototype.displayElt_ = null;




/**
 * @type {?Element}
 * @private
 */
xiv.ui.layouts.interactors.InputController.prototype.inputBox_ = null;



/**
 * @type {!boolean}
 * @private
 */
xiv.ui.layouts.interactors.InputController.prototype.inputHovered_ = false;



/**
 * @return {!number}
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.getValue = 
function() {
    if (!goog.isDefAndNotNull(this.inputBox_)) { return };
    return this.inputBox_.value;
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setValue = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox_)){return}
    this.inputBox_.value = num;
    this.updateValue();
}




/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setMaximum = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox_)){return};
    this.inputBox_.max = num;
    this.updateValue();
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setMinimum = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox_)){return};
    this.inputBox_.min = num;
    this.updateValue();
}






/**
 * @protected
 */
xiv.ui.layouts.interactors.InputController.prototype.updateValue = 
function(){
    //do nothing
}




/**
 * @param {Event} 
 * @protected
 */
xiv.ui.layouts.interactors.InputController.prototype.onInput = function(e){
    var value = parseInt(e.target.value);
    this.inputBox_.value = value;
    this.dispatchEvent({
	type: xiv.ui.layouts.interactors.InputController.EventType.INPUT,
	value: this.inputBox_.value
    });
    this.updateValue();
}




/**
 * @private
 */
xiv.ui.layouts.interactors.InputController.prototype.createDisplayElt_ =
function(){
    //
    // Input box
    //
    this.displayElt_ = goog.dom.createDom('div');
    goog.dom.appendChild(this.getElement(), this.displayElt_);
    goog.dom.classes.add(this.displayElt_,
        xiv.ui.layouts.interactors.InputController.CSS.DISPLAY);
}



/**
 * @private
 */
xiv.ui.layouts.interactors.InputController.prototype.createInputElt_ =
function(){
    //
    // Input box
    //
    this.inputBox_ = goog.dom.createDom('input');
    this.inputBox_.type = 'number';  
    this.inputBox_.step = 1;
    this.inputBox_.min = 0;
    this.inputBox_.value = 0;   
    goog.dom.appendChild(this.getElement(), this.inputBox_);
    goog.dom.classes.add(this.inputBox_,
        xiv.ui.layouts.interactors.InputController.CSS.INPUT_BOX);
}





/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.InputController.prototype.render = 
function(parentElement) {
    goog.base(this, 'render', parentElement);

    this.createDisplayElt_();
    this.createInputElt_();


    goog.events.listen(this.inputBox_, goog.events.EventType.MOUSEENTER, 
    function(e){
	e.stopPropagation();
	this.inputBox_.style.opacity = 1;
	this.displayElt_.style.opacity = 0;
    }.bind(this))

    goog.events.listen(this.inputBox_, goog.events.EventType.MOUSELEAVE, 
    function(e){
	e.stopPropagation();
	this.inputBox_.style.opacity = 0;
	this.displayElt_.style.opacity = 1;
    }.bind(this))


    goog.events.listen(this.inputBox_, goog.events.EventType.INPUT, 
		      this.onInput.bind(this))


    this.updateValue();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.InputController.prototype.disposeInternal = 
function(){
    goog.base(this, 'disposeInternal');
    delete this.inputHovered_;
  
    if (this.inputBox_) {
	goog.events.removeAll(this.inputBox_);
	goog.dom.removeNode(this.inputBox_);
	delete this.inputBox_;
    } 

    if (this.displayElt_) {
	goog.events.removeAll(this.displayElt_);
	goog.dom.removeNode(this.displayElt_);
	delete this.displayElt_;
    } 
}




