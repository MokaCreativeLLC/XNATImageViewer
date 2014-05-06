/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');

// utils
goog.require('nrg.ui.Component');




/**
 * xiv.ui.layouts.interactors.FrameDisplay
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.interactors.FrameDisplay');
xiv.ui.layouts.interactors.FrameDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.FrameDisplay, nrg.ui.Component);
goog.exportSymbol('xiv.ui.layouts.interactors.FrameDisplay', 
		  xiv.ui.layouts.interactors.FrameDisplay);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.FrameDisplay.EventType = {
    INPUT: 'input',
    DISPLAY: 'display'
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.FrameDisplay.ID_PREFIX =  
    'xiv.ui.layouts.interactors.FrameDisplay';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.FrameDisplay.CSS_SUFFIX = {
    INPUT_BOX: 'inputbox',
    INPUT_BOX_HOVERED: 'inputbox-hovered',
}



/**
 * @type {?Element}
 * @private
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.inputBox_ = null;




/**
 * @return {!number}
 * @public
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.getCurrentFrame = 
function() {
    if (!goog.isDefAndNotNull(this.inputBox_)) { return };
    return this.inputBox_.value;
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.setCurrentFrame = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox_)){return}
    this.inputBox_.value = Math.min(this.inputBox_.max, 
				    Math.max(0, Math.round(num)));
    this.updateCurrentFrame_();
}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.setTotalFrames = 
function(num){
    if (!goog.isDefAndNotNull(this.inputBox_)){return};
    this.inputBox_.max = Math.max(0, Math.round(num));
    this.updateAll_();
}



/**
 * @private
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.updateCurrentFrame_ = 
function(){
    //if (!goog.isDefAndNotNull(this.inputBox_)){return}
    this.displayElt_.innerHTML = this.inputBox_.value + 
	' / ' + this.inputBox_.max;
}



/**
 * @private
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.updateAll_ = function(){
    if (!goog.isDefAndNotNull(this.inputBox_)){return}
    this.updateCurrentFrame_();
}



/**
 * @param {Event} 
 * @private
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.onInput_ = function(e){
    var value = parseInt(e.target.value);
    this.inputBox_.value = value;
    this.dispatchEvent({
	type: xiv.ui.layouts.interactors.FrameDisplay.EventType.INPUT,
	value: this.inputBox_.value
    });
    
}




/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.FrameDisplay.prototype.render = 
function(parentElement) {
    goog.base(this, 'render', parentElement);

    //
    // Input box
    //
    this.displayElt_ = goog.dom.createDom('div');
    goog.dom.appendChild(this.getElement(), this.displayElt_);
    goog.dom.classes.add(this.displayElt_,
        xiv.ui.layouts.interactors.FrameDisplay.CSS.DISPLAY);

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
        xiv.ui.layouts.interactors.FrameDisplay.CSS.INPUT_BOX);


    //
    // Reveal the input box when hovering
    //
    // Mouseover
    goog.events.listen(this.getElement(), goog.events.EventType.MOUSEOVER, 
    function(){
	goog.dom.classes.add(this.inputBox_,
            xiv.ui.layouts.interactors.FrameDisplay.CSS.INPUT_BOX_HOVERED)
    }.bind(this))

    // Mouse out
    goog.events.listen(this.getElement(), goog.events.EventType.MOUSEOUT, 
    function(){
	goog.dom.classes.set(this.inputBox_,
            xiv.ui.layouts.interactors.FrameDisplay.CSS.INPUT_BOX)
    }.bind(this))


    goog.events.listen(this.inputBox_, goog.events.EventType.INPUT, 
		      this.onInput_.bind(this))

    //window.console.log("INPUT", this.inputBox_, this.inputBox_.parentNode);
    this.updateAll_();
}



/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.FrameDisplay.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    
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




