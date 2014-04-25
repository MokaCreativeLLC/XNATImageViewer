/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.ui.ctrl.XtkController');



/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.SliderController = function(){
    goog.base(this);
    this.setLabel('Master Opacity');
}
goog.inherits(xiv.ui.ctrl.SliderController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.SliderController', xiv.ui.ctrl.SliderController);




/**
 * @const
 * @public
 */
xiv.ui.ctrl.SliderController.ID_PREFIX =  'xiv.ui.ctrl.SliderController';




/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.SliderController.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVER: 'slider-thumb-hover',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_HOVER: 'slider-track-hover',
    VALUE_INPUT: 'value-input',
};



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    this.createSlider_();
    this.createValueInput_();
}


/**
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.createSlider_ = function() {
    var slider = new nrg.ui.Slider();
    this.setComponent(slider);

    // Inits
    slider.setMinimum(0);
    slider.setMaximum(1);
    slider.setStep(.01);
    slider.setValue(1);

    // Classes
    goog.dom.classes.add(slider.getElement(), 
			 xiv.ui.ctrl.SliderController.CSS.SLIDER);
    goog.dom.classes.add(slider.getThumb(), 
			 xiv.ui.ctrl.SliderController.CSS.SLIDER_THUMB);
    goog.dom.classes.add(slider.getTrack(),
			 xiv.ui.ctrl.SliderController.CSS.SLIDER_TRACK);

    // Hover classes
    slider.addThumbHoverClass(
	xiv.ui.ctrl.SliderController.CSS.SLIDER_THUMB_HOVER);
    slider.addTrackHoverClass(
	xiv.ui.ctrl.SliderController.CSS.SLIDER_TRACK_HOVER);

    // Events
    goog.events.listen(this.getComponent(), goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}



/**
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.createValueInput_ = function() {
    var slider = this.getComponent();

    /**
     * @type {!Element}
     * @private
     */
    this.valueInput_ = goog.dom.createDom('input');
    this.valueInput_.type = 'number';
    this.valueInput_.step = slider.getStep();
    this.valueInput_.min = slider.getMinimum();
    this.valueInput_.max = slider.getMaximum();
    this.valueInput_.value = slider.getValue().toFixed(2);

    // Classes
    goog.dom.classes.add(this.valueInput_, 
			 xiv.ui.ctrl.SliderController.CSS.VALUE_INPUT);
    goog.dom.append(this.getElement(), this.valueInput_);
    
    // Events
    goog.events.listen(this.valueInput_, goog.events.EventType.INPUT, 
		       this.onValueInput_.bind(this));
}




/**
 * Callback for when a value in inputted in the input box.
 * 
 * @param {Event}
 * @private
 */
xiv.ui.ctrl.SliderController.prototype.onValueInput_ = function(e){
    var slider = this.getComponent();
    var val = parseFloat(this.valueInput_.value);
    val = goog.math.clamp(val, slider.getMinimum(),
			  slider.getMaximum());
    this.valueInput_.value = val;
    slider.setValue(val);
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.dispatchComponentEvent = function(){
    var val = this.getComponent().getValue().toFixed(2);
    this.valueInput_.value = val;

    window.console.log("SLIDER", val);
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	value: val
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.SliderController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // ValueInput
    if (goog.isDefAndNotNull(this.valueInput_)){
	goog.events.removeAll(this.valueInput_);
	goog.dom.remove(this.valueInput_);
	delete this.valueInput_;
    }
}




