/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.interactors.InputController');

// goog
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * xiv.ui.layouts.interactors.InputController
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
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
 * @expose
 */
xiv.ui.layouts.interactors.InputController.CSS_SUFFIX = {
    INPUT_BOX: 'inputbox',
    INPUT_BOX_HOVERED: 'inputbox-hovered',
    DISPLAY: 'display',
}



/**
 * @type {?Element}
 * @protected
 */
xiv.ui.layouts.interactors.InputController.prototype.displayElt = null;




/**
 * @type {?Element}
 * @protected
 */
xiv.ui.layouts.interactors.InputController.prototype.inputBox = null;



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
    if (!goog.isDefAndNotNull(this.inputBox)) { return };
    return this.inputBox.value;
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setValue = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return}
    this.inputBox.value = num;
    this.updateValue();
}




/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setMaximum = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    this.inputBox.max = num;
    this.updateValue();
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.InputController.prototype.setMinimum = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    this.inputBox.min = num;
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
    this.inputBox.value = value;
    this.dispatchEvent({
	type: xiv.ui.layouts.interactors.InputController.EventType.INPUT,
	value: this.inputBox.value
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
    this.displayElt = goog.dom.createDom('div');
    goog.dom.appendChild(this.getElement(), this.displayElt);
    goog.dom.classes.add(this.displayElt,
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
    this.inputBox = goog.dom.createDom('input');
    this.inputBox.type = 'number';  
    this.inputBox.step = 1;
    this.inputBox.min = 0;
    this.inputBox.value = 0;   
    goog.dom.appendChild(this.getElement(), this.inputBox);
    goog.dom.classes.add(this.inputBox,
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


    goog.events.listen(this.inputBox, goog.events.EventType.MOUSEENTER, 
    function(e){
	e.stopPropagation();
	this.inputBox.style.opacity = 1;
	this.displayElt.style.opacity = 0;
    }.bind(this))

    goog.events.listen(this.inputBox, goog.events.EventType.MOUSELEAVE, 
    function(e){
	e.stopPropagation();
	this.inputBox.style.opacity = 0;
	this.displayElt.style.opacity = 1;
    }.bind(this))


    goog.events.listen(this.inputBox, goog.events.EventType.INPUT, 
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
  
    if (this.inputBox) {
	goog.events.removeAll(this.inputBox);
	goog.dom.removeNode(this.inputBox);
	delete this.inputBox;
    } 

    if (this.displayElt) {
	goog.events.removeAll(this.displayElt);
	goog.dom.removeNode(this.displayElt);
	delete this.displayElt;
    } 
}




goog.exportSymbol('xiv.ui.layouts.interactors.InputController.EventType',
	xiv.ui.layouts.interactors.InputController.EventType);
goog.exportSymbol('xiv.ui.layouts.interactors.InputController.ID_PREFIX',
	xiv.ui.layouts.interactors.InputController.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.interactors.InputController.CSS_SUFFIX',
	xiv.ui.layouts.interactors.InputController.CSS_SUFFIX);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.displayElt',
    xiv.ui.layouts.interactors.InputController.prototype.displayElt);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.inputBox',
    xiv.ui.layouts.interactors.InputController.prototype.inputBox);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.getValue',
    xiv.ui.layouts.interactors.InputController.prototype.getValue);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.setValue',
    xiv.ui.layouts.interactors.InputController.prototype.setValue);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.setMaximum',
    xiv.ui.layouts.interactors.InputController.prototype.setMaximum);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.setMinimum',
    xiv.ui.layouts.interactors.InputController.prototype.setMinimum);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.updateValue',
    xiv.ui.layouts.interactors.InputController.prototype.updateValue);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.onInput',
    xiv.ui.layouts.interactors.InputController.prototype.onInput);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.render',
    xiv.ui.layouts.interactors.InputController.prototype.render);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.InputController.prototype.disposeInternal',
    xiv.ui.layouts.interactors.InputController.prototype.disposeInternal);
