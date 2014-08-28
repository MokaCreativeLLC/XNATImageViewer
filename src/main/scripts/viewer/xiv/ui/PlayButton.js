/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.PlayButton');

// goog
goog.require('goog.string');
goog.require('goog.ui.Slider');
goog.require('goog.Timer');

// nrg
goog.require('nrg.ui.Component');


//-----------




/**
 * xiv.ui.PlayButton
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.PlayButton = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.PlayButton, 
	      nrg.ui.Component);
goog.exportSymbol('xiv.ui.PlayButton', 
		  xiv.ui.PlayButton);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.PlayButton.ID_PREFIX =  
    'xiv.ui.PlayButton';


/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.PlayButton.EventType = {}



/**
 * @enum {string}
 * @expose
 */
xiv.ui.PlayButton.CSS_SUFFIX = {
    IMAGE: 'image'
}



/**
 * @type {?Element}
 * @private
 */
xiv.ui.PlayButton.prototype.image_ = null;



/**
 * @type {!boolean}
 * @private
 */
xiv.ui.PlayButton.prototype.isPlaying_ = false;



/**
 * @type {!goog.ui.Slider}
 * @private
 */
xiv.ui.PlayButton.prototype.slider_ = null;



/**
 * @private
 * @type {?goog.Timer}
 */
xiv.ui.PlayButton.prototype.timer_ = null;




/**
 * @private
 * @type {!number}
 */
xiv.ui.PlayButton.prototype.interval_ = 70;



/**
 * @inheritDoc
 */
xiv.ui.PlayButton.prototype.render = 
function(parentElement) {
    goog.base(this, 'render', parentElement);

    this.image_ = goog.dom.createDom('img', {
	'id': 'PlayButton_' + goog.string.createUniqueString()
    })
    goog.dom.classes.add(this.image_,
			 xiv.ui.PlayButton.CSS.IMAGE);
    goog.dom.appendChild(this.getElement(), this.image_);

    this.image_.src = serverRoot + 
	'/images/viewer/xiv/ui/other/play.png';

    //window.console.log(this.getElement().parentNode);
    //this.getElement().style.zIndex = 5000;


    goog.events.listen(this.image_, goog.events.EventType.CLICK, function(e){
	if (this.isPlaying_){
	    this.isPlaying_ = false;
	    this.pause();
	} 
	else {
	    this.isPlaying_ = true;
	    this.play();
	}
    }.bind(this))
}



/**
 * @public
 */
xiv.ui.PlayButton.prototype.pause = function(){
    //window.console.log("PAUSE!");
    this.image_.src = serverRoot + 
	'/images/viewer/xiv/ui/other/play.png';

    if (!goog.isDefAndNotNull(this.slider_)) { return }
    if (!goog.isDefAndNotNull(this.timer_)) { return }
    

    this.timer_.stop();

}



/**
 * @public
 */
xiv.ui.PlayButton.prototype.play = function(){
    //window.console.log("PLAY!");
    this.image_.src = serverRoot + 
	'/images/viewer/xiv/ui/other/pause.png';

    //
    // Exit out if no slider
    //
    if (!goog.isDefAndNotNull(this.slider_)) { return }

    //
    // Remove any existing timers
    //
    if (!goog.isDefAndNotNull(this.timer_)){
	this.timer_ = new goog.Timer();
    }
    this.timer_.setInterval(this.interval_);

    this.timer_.addEventListener(goog.Timer.TICK, function(e) {
	if (this.slider_.getValue() == this.slider_.getMaximum()){
	    this.slider_.setValue(this.slider_.getMinimum());
	} else {
	    this.slider_.setValue(this.slider_.getValue() + 1);
	}
    }.bind(this));

    this.timer_.start();
}



/**
 * @public
 * @param {!number}
 */
xiv.ui.PlayButton.prototype.setInterval = 
function(interval){
    this.interval_ = interval;
}



/**
 * @public
 * @return {!boolean}
 */
xiv.ui.PlayButton.prototype.isPlaying = function(){
    return this.isPlaying_;
}



/**
 * @public
 * @param {!goog.ui.Slider}
 */
xiv.ui.PlayButton.prototype.setSlider = 
function(slider){
    this.slider_ = slider;
}


/**
 * @inheritDoc
 */
xiv.ui.PlayButton.prototype.disposeInternal =
function(){
    goog.base(this, 'disposeInternal');
    goog.dom.removeNode(this.image_);
    goog.events.removeAll(this.image_);
    delete this.image_;


    if (goog.isDefAndNotNull(this.timer_)){
	goog.events.removeAll(this.timer_);
	this.timer_.dispose();
    }

    delete this.slider_;
    delete this.isPlaying_;
    delete this.timer_;
    delete this.interval_;
}

goog.exportSymbol(
    'xiv.ui.PlayButton.ID_PREFIX',
    xiv.ui.PlayButton.ID_PREFIX);

goog.exportSymbol(
    'xiv.ui.PlayButton.prototype.pause',
    xiv.ui.PlayButton.prototype.pause);

goog.exportSymbol(
    'xiv.ui.PlayButton.prototype.play',
    xiv.ui.PlayButton.prototype.play);

goog.exportSymbol(
    'xiv.ui.PlayButton.prototype.isPlaying',
    xiv.ui.PlayButton.prototype.isPlaying);

goog.exportSymbol(
    'xiv.ui.PlayButton.prototype.setInterval',
    xiv.ui.PlayButton.prototype.setInterval);

goog.exportSymbol(
    'xiv.ui.PlayButton.prototype.setSlider',
    xiv.ui.PlayButton.prototype.setSlider);


