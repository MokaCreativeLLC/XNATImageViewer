/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.HoverInput');

// goog
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * nrg.ui.HoverInput
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
nrg.ui.HoverInput = function() { 
    goog.base(this);
}
goog.inherits(nrg.ui.HoverInput, nrg.ui.Component);
goog.exportSymbol('nrg.ui.HoverInput', 
		  nrg.ui.HoverInput);



/**
 * Event types.
 * @enum {string}
 * @public
 */
nrg.ui.HoverInput.EventType = {
    INPUT: goog.events.getUniqueId('input'),
    DISPLAY: goog.events.getUniqueId('display')
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.HoverInput.ID_PREFIX =  
    'nrg.ui.HoverInput';



/**
 * @enum {string}
 * @expose
 */
nrg.ui.HoverInput.CSS_SUFFIX = {
    INPUT_BOX: 'inputbox',
    INPUT_BOX_HOVERED: 'inputbox-hovered',
    DISPLAY: 'display',
}



/**
 * @type {?Element}
 * @protected
 */
nrg.ui.HoverInput.prototype.displayElt = null;




/**
 * @type {?Element}
 * @protected
 */
nrg.ui.HoverInput.prototype.inputBox = null;



/**
 * @type {!boolean}
 * @private
 */
nrg.ui.HoverInput.prototype.inputHovered_ = false;




/**
 * @param {!number} num
 * @public
 */
nrg.ui.HoverInput.prototype.setValue = function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return}
    this.inputBox.value = num;
    this.updateValue();
}




/**
 * @return {!number}
 * @public
 */
nrg.ui.HoverInput.prototype.getValue = function() {
    if (!goog.isDefAndNotNull(this.inputBox)) { return };
    return this.inputBox.value;
}



/**
 * @param {!number} num
 * @public
 */
nrg.ui.HoverInput.prototype.setMaximum = function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    this.inputBox.max = num;
    this.updateValue();
}



/**
 * @return {!number}
 * @public
 */
nrg.ui.HoverInput.prototype.getMaximum = function(){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    return this.inputBox.max;
}



/**
 * @param {!number} num
 * @public
 */
nrg.ui.HoverInput.prototype.setMinimum = function(num){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    this.inputBox.min = num;
    this.updateValue();
}



/**
 * @return {!number}
 * @public
 */
nrg.ui.HoverInput.prototype.getMinimum = function(){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    return this.inputBox.min;
}


/**
 * @param {!number} step
 * @public
 */
nrg.ui.HoverInput.prototype.setStep = function(step){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    this.inputBox.step = step;
    this.updateValue();
}



/**
 * @return {!number}
 * @public
 */
nrg.ui.HoverInput.prototype.getStep = function(){
    if (!goog.isDefAndNotNull(this.inputBox)){return};
    return this.inputBox.step;
}


/**
 * @return {!Element}
 * @public
 */
nrg.ui.HoverInput.prototype.getInputElement = function(){
    return this.inputBox;
}



/**
 * @return {!Element}
 * @public
 */
nrg.ui.HoverInput.prototype.getDisplayElement = function(){
    return this.displayElt;
}



/**
 * @type {!string}
 * @protected
 */
nrg.ui.HoverInput.prototype.alignment = 'right';



/**
 * @param {!string} align
 * @throws {Error} If argument is not 'right' or 'left'
 * @public
 */
nrg.ui.HoverInput.prototype.setDisplayAlignment = function(align){
    align = align.toLowerCase();
    if (align == 'right' || align == 'left'){
	this.alignment = align;
    } else {
	throw new Error ("Invalid alignment: " + align);
    }
} 


/**
 * @protected
 */
nrg.ui.HoverInput.prototype.alignDisplayElement = function(){
    if (this.alignment == 'right') {
	this.displayElt.style.left = 
	    'calc(100% - ' + 
	    goog.style.getSize(this.displayElt).width.toString() + 
	    'px)';
    } else {
	this.displayElt.style.left = '0px';
    }
}


/**
 * @protected
 */
nrg.ui.HoverInput.prototype.updateValue = 
function(){
    this.displayElt.innerHTML = this.inputBox.value;
    this.alignDisplayElement();
}




/**
 * @param {Event} 
 * @protected
 */
nrg.ui.HoverInput.prototype.onInput = function(e){
    var value = parseInt(e.target.value);
    this.inputBox.value = value;
    this.dispatchEvent({
	type: nrg.ui.HoverInput.EventType.INPUT,
	value: this.inputBox.value
    });
    this.updateValue();
}




/**
 * @private
 */
nrg.ui.HoverInput.prototype.createDisplayElt_ =
function(){
    //
    // Input box
    //
    this.displayElt = goog.dom.createDom('div');
    goog.dom.appendChild(this.getElement(), this.displayElt);
    goog.dom.classes.add(this.displayElt,
        nrg.ui.HoverInput.CSS.DISPLAY);
}




/**
 * @private
 */
nrg.ui.HoverInput.prototype.createInputElt_ =
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
        nrg.ui.HoverInput.CSS.INPUT_BOX);
}





/**
 * @inheritDoc
 */
nrg.ui.HoverInput.prototype.render = 
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


    goog.events.listen(this.inputBox, 
		       goog.events.EventType.INPUT, 
		       this.onInput.bind(this))


    this.updateValue();
}



/**
* @inheritDoc
*/
nrg.ui.HoverInput.prototype.disposeInternal = 
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




goog.exportSymbol('nrg.ui.HoverInput.EventType', nrg.ui.HoverInput.EventType);
goog.exportSymbol('nrg.ui.HoverInput.ID_PREFIX', nrg.ui.HoverInput.ID_PREFIX);
goog.exportSymbol('nrg.ui.HoverInput.CSS_SUFFIX', nrg.ui.HoverInput.CSS_SUFFIX);

//
// Protected
//
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.displayElt',
    nrg.ui.HoverInput.prototype.displayElt);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.inputBox',
    nrg.ui.HoverInput.prototype.inputBox);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.alignDisplayElement',
    nrg.ui.HoverInput.prototype.alignDisplayElement);


//
// Public
//
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.setDisplayAlignment',
    nrg.ui.HoverInput.prototype.setDisplayAlignment);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getValue',
    nrg.ui.HoverInput.prototype.getValue);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.setValue',
    nrg.ui.HoverInput.prototype.setValue);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.setStep',
    nrg.ui.HoverInput.prototype.setStep);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getStep',
    nrg.ui.HoverInput.prototype.getStep);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.setMaximum',
    nrg.ui.HoverInput.prototype.setMaximum);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getMaximum',
    nrg.ui.HoverInput.prototype.getMaximum);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.setMinimum',
    nrg.ui.HoverInput.prototype.setMinimum);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getMinimum',
    nrg.ui.HoverInput.prototype.getMinimum);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.updateValue',
    nrg.ui.HoverInput.prototype.updateValue);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.onInput',
    nrg.ui.HoverInput.prototype.onInput);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getInputElement',
    nrg.ui.HoverInput.prototype.getInputElement);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.getDisplayElement',
    nrg.ui.HoverInput.prototype.getDisplayElement);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.render',
    nrg.ui.HoverInput.prototype.render);
goog.exportSymbol(
    'nrg.ui.HoverInput.prototype.disposeInternal',
    nrg.ui.HoverInput.prototype.disposeInternal);
