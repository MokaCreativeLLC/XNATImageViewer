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
xiv.ui.ctrl.MasterOpacity = function(){
    goog.base(this);

    this.setLabel('Master Opacity');


    var slider = new moka.ui.GenericSlider();
    this.setComponent(slider);



    //------------------
    // Set slider classes.
    //------------------
    goog.dom.classes.add(slider.getElement(), 
			 xiv.ui.ctrl.MasterOpacity.CSS.SLIDER);
    goog.dom.classes.add(slider.getThumb(), 
			 xiv.ui.ctrl.MasterOpacity.CSS.SLIDER_THUMB);
    goog.dom.classes.add(slider.getTrack(),
			 xiv.ui.ctrl.MasterOpacity.CSS.SLIDER_TRACK);
    slider.addThumbHoverClass(xiv.ui.ctrl.MasterOpacity.CSS.SLIDER_THUMB_HOVER);
    slider.addTrackHoverClass(xiv.ui.ctrl.MasterOpacity.CSS.SLIDER_TRACK_HOVER);



    //------------------
    // Other arguments.
    //------------------
    slider.setMinimum(0);
    slider.setMaximum(1);
    slider.setStep(.01);
    slider.setValue(1);


    // Events
    goog.events.listen(this.getComponent(), goog.events.EventType.CHANGE, 
    		       this.dispatchComponentEvent.bind(this))
}

goog.inherits(xiv.ui.ctrl.MasterOpacity, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.MasterOpacity', xiv.ui.ctrl.MasterOpacity);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.MasterOpacity.ID_PREFIX =  'xiv.ui.ctrl.MasterOpacity';


/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterOpacity.CSS_SUFFIX = {
    SLIDER: 'slider',
    SLIDER_THUMB: 'slider-thumb',
    SLIDER_THUMB_HOVER: 'slider-thumb-hover',
    SLIDER_TRACK: 'slider-track',
    SLIDER_TRACK_HOVER: 'slider-track-hover',
};


/**
 * @inheritDoc
 */
xiv.ui.ctrl.MasterOpacity.prototype.dispatchComponentEvent = function(){
    window.console.log("DISPATCH SLIDER", this.getComponent().getValue());
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	value: this.getComponent().getValue()
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.MasterOpacity.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Check box element
    goog.dom.remove(this.checkBoxElt_);
    delete this.checkBoxElt_;


    // Check box
    goog.events.removeAll(this.checkBox_);
    this.checkBox_.disposeInternal();
    delete this.checkBox_();
}




