/** 
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.Thumbnail');

// goog
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.events.EventType');
goog.require('goog.Timer');

// nrg
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.ui.Component');




/**
 * nrg.ui.Thumbnail is a ui class for creating thumbnails.  Thumbnails
 * have two element compontents: an image and text, both of which are 
 * encapsulated  by a main "element".  Both the text and image are defined by 
 * setter methods.
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
nrg.ui.Thumbnail = function () {
    goog.base(this);

    /**
     * @type {!Image}
     * @private
     */	
    this.image_ = goog.dom.createDom('img', {
	'id' : 'nrg.ui.Thumbnail_' + goog.string.createUniqueString()
    }); 
    goog.dom.append(this.getElement(), this.image_);


    /**
     * @type {!Element}
     * @private
     */	
    this.text_ = goog.dom.createDom('div', {
	'id': 'DisplayText_' + goog.string.createUniqueString()
    });
    goog.dom.append(this.getElement(), this.text_);


    /**
     * @type {!Element}
     * @private
     */	
    this.selectIndicator_ = goog.dom.createDom('div', {
	'id': 'selectedIndicator_' + goog.string.createUniqueString()
    });
    goog.dom.classes.add(this.selectIndicator_, 
			 nrg.ui.Thumbnail.CSS.SELECTINDICATOR);
    goog.dom.append(this.getElement(), this.selectIndicator_);
    //window.console.log(this.selectIndicator_);



    // Other init functions.
    //window.console.log(this);
    this.setEvents_();
    this.setClasses_();
    
}
goog.inherits(nrg.ui.Thumbnail, nrg.ui.Component);
goog.exportSymbol('nrg.ui.Thumbnail', nrg.ui.Thumbnail);




/**
 * Event types.
 * @enum {string}
 */
nrg.ui.Thumbnail.EventType = {
  CLICK: goog.events.getUniqueId('click'),
};



/**
 * @type {!string} 
 * @expose
 * @const
 */
nrg.ui.Thumbnail.ID_PREFIX = 'nrg.ui.Thumbnail';



/**
 * @enum {string}
 * @expose
 */ 
nrg.ui.Thumbnail.CSS_SUFFIX = {
    IMAGE: 'image',
    TEXT: 'text',
    SELECTED: 'selected',
    MOUSEOVER: 'mouseover',
    IMAGE_MOUSEOVER: 'image-mouseover',
    TEXT_MOUSEOVER: 'text-mouseover',
    HIGHLIGHT: 'highlight',
    ACTIVE: 'active',
    IMAGE_ACTIVE: 'image-active',
    TEXT_ACTIVE: 'text-active',
    SELECTINDICATOR: 'selectindicator',
    SELECTINDICATOR_ACTIVE: 'selectindicator-active',
    HOVERABLE: 'hoverable'
}




/**
 * @type {?string}
 * @private
 */	
nrg.ui.Thumbnail.prototype.brokenThumbnailUrl_ = null;




/**
 * @type {!boolean}
 * @private
 */
nrg.ui.Thumbnail.prototype.isActive_ = false;




/**
 * Gets the image element of the thumbnail.
 * @return {!Image} The thumbnail image.
 * @public
 */
nrg.ui.Thumbnail.prototype.getImage = function() {
    return this.image_;	
}



/**
 * @param {!string} url The thumbnail image url.
 * @public
 */
nrg.ui.Thumbnail.prototype.setBrokenThumbnailUrl = function(url) {
    this.brokenThumbnailUrl_ = url;
    this.image_.onerror = function(){
	this.image_.onerror = '';
	this.image_.src = this.brokenThumbnailUrl_;
    }.bind(this);
}



/**
 * Gets the text of the thumbnail.
 * @return {!Element} The thumbnail text.
 * @public
 */
nrg.ui.Thumbnail.prototype.getTextElement = function() {
    return this.text_;	
}



/**
 * @return {!string} The first string of the thumbnail text element.
 * @public
 */
nrg.ui.Thumbnail.prototype.getText = function() {
    var currTextChild = this.text_;
    while (currTextChild.childNodes[0]){
	currTextChild = currTextChild.childNodes[0];
    }
    return currTextChild.parentNode.innerHTML;
    
}



/**
 * Pulses the thumbnail.
 * @param {number=} opt_duration
 * @param {Function=} opt_end
 * @public
 */
nrg.ui.Thumbnail.prototype.pulse = function(opt_duration, opt_onEnd) {
    
    if (!goog.isDefAndNotNull(opt_duration)) { opt_duration = 500}

    var interval = 50;
    var intervalCount = 0;
    if (!goog.isDefAndNotNull(this.timer_)){
	this.timer_ = new goog.Timer();
    }
    this.timer_.setInterval(interval);

    this.timer_.addEventListener(goog.Timer.TICK, function(e) {
	intervalCount += interval;
	this.getElement().style.opacity = (intervalCount / interval) % 2; 
	if (intervalCount >= opt_duration){
	    this.timer_.stop();
	    this.timer_.dispose();
	    delete this.timer_;
	    this.getElement().style.opacity = 1;

	    if (goog.isDefAndNotNull(opt_onEnd)){
		opt_onEnd();
	    }
	}
    }.bind(this));
    this.timer_.start();
}






/**
 * @return {boolean} The 'active' state of the thumbnail (this is defined and 
 * set by the user).
 * @public
 */
nrg.ui.Thumbnail.prototype.isActive = function() {
    return this.isActive_;	
}




/**
 * Sets the image src object.
 * @param {!String} url The image src.
 * @public
 */	
nrg.ui.Thumbnail.prototype.setImage = function(url){
    this.image_.src = url;
    goog.dom.classes.set(this.image_, nrg.ui.Thumbnail.CSS.IMAGE);
};




/**
 * Sets the text associated with the thumbnail.
 * @param {!String}
 * @public
 */	
nrg.ui.Thumbnail.prototype.setText = function(text){
    this.text_.innerHTML = text;
};




/**
 * Sets the thumbnail state to 'active'.  Applies the appropriate 
 * CSS class for style changes.
 * @param {boolean} active Active state, 
 * @param {boolean=} opt_highlightBg Whether or not to highlight the 
 * background. Defaults to false.
 * @public
 */
nrg.ui.Thumbnail.prototype.setActive = function(active, opt_highlightBg) {

    //nrg.dom.debug("setActive", active, opt_highlightBg);

    var elt = this.getElement()
    this.isActive_ = active;
    if (this.isActive_){
	if (opt_highlightBg) { 
	    goog.dom.classes.add(elt, 
				 nrg.ui.Thumbnail.CSS.HIGHLIGHT); 
	}
	goog.dom.classes.add(elt, 
			     nrg.ui.Thumbnail.CSS.ACTIVE);
	goog.dom.classes.add(this.text_, 
			     nrg.ui.Thumbnail.CSS.TEXT_ACTIVE);		
	goog.dom.classes.add(this.image_, 
			     nrg.ui.Thumbnail.CSS.IMAGE_ACTIVE);
	goog.dom.classes.add(this.selectIndicator_, 
			     nrg.ui.Thumbnail.CSS.SELECTINDICATOR_ACTIVE);
	
    } else {
	goog.dom.classes.remove(elt, 
				nrg.ui.Thumbnail.CSS.HIGHLIGHT);
	goog.dom.classes.remove(elt, 
				nrg.ui.Thumbnail.CSS.ACTIVE);
	goog.dom.classes.remove(this.text_, 
				nrg.ui.Thumbnail.CSS.TEXT_ACTIVE);		
	goog.dom.classes.remove(this.image_, 
				nrg.ui.Thumbnail.CSS.IMAGE_ACTIVE);
	goog.dom.classes.remove(this.selectIndicator_, 
			     nrg.ui.Thumbnail.CSS.SELECTINDICATOR_ACTIVE);
    }
}




/**
 * Generic style update method.
 * @type {Object=} opt_args The arguments to apply to the style.
 * @public
 */
nrg.ui.Thumbnail.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.getElement()) {
	nrg.style.setStyle(this.getElement(), opt_args);
    }
}




/**
 * Applies the classes to the various objects when the mouse
 * hovers over the nrg.ui.Thumbnail.
 * @private
 */
nrg.ui.Thumbnail.prototype.onMouseEnter = function() {
}


/**
 * Applies the classes to the various objects when the mouse hovers over the 
 * nrg.ui.Thumbnail.
 * @public
 */
nrg.ui.Thumbnail.prototype.onMouseLeave = function() {

}






/**
 * Initializes the events associated with the thumbnail.
 * @private
 */	
nrg.ui.Thumbnail.prototype.setEvents_ = function() {

    if (goog.events.hasListener(
	this.getElement(), 
	nrg.ui.Thumbnail.EventType.CLICK)){
	goog.events.unlistenByKey(nrg.ui.Thumbnail.EventType.CLICK);
	
    }
    goog.events.listen(
	this.getElement(), 
	goog.events.EventType.CLICK, 
	function(){
	    this.dispatchEvent({
		type: nrg.ui.Thumbnail.EventType.CLICK
	    });
    }.bind(this));

}




/**
 * @private
 */
nrg.ui.Thumbnail.prototype.setClasses_ = function() {
    goog.dom.classes.set(this.getElement(), nrg.ui.Thumbnail.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
			 nrg.ui.Thumbnail.CSS.HOVERABLE);
    goog.dom.classes.set(this.image_, nrg.ui.Thumbnail.CSS.IMAGE);
    goog.dom.classes.set(this.text_, nrg.ui.Thumbnail.CSS.TEXT);
}




nrg.ui.Thumbnail.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Broad events.
    goog.events.removeAll(this);
    goog.events.removeAll(this.getElement());

    // Image
    goog.dom.removeNode(this.image_);
    delete this.image_;

    // text
    goog.dom.removeNode(this.text_);
    delete this.text_;


    // broken thumbnail
    delete this.brokenThumbnalUrl_

    // is active
    delete this.isActive_;
}




goog.exportSymbol('nrg.ui.Thumbnail.EventType', nrg.ui.Thumbnail.EventType);
goog.exportSymbol('nrg.ui.Thumbnail.ID_PREFIX', nrg.ui.Thumbnail.ID_PREFIX);
goog.exportSymbol('nrg.ui.Thumbnail.CSS_SUFFIX', nrg.ui.Thumbnail.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.getImage',
	nrg.ui.Thumbnail.prototype.getImage);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.setBrokenThumbnailUrl',
	nrg.ui.Thumbnail.prototype.setBrokenThumbnailUrl);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.getTextElement',
	nrg.ui.Thumbnail.prototype.getTextElement);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.getText',
	nrg.ui.Thumbnail.prototype.getText);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.isActive',
	nrg.ui.Thumbnail.prototype.isActive);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.setImage',
	nrg.ui.Thumbnail.prototype.setImage);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.setText',
	nrg.ui.Thumbnail.prototype.setText);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.setActive',
	nrg.ui.Thumbnail.prototype.setActive);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.updateStyle',
	nrg.ui.Thumbnail.prototype.updateStyle);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.pulse',
	nrg.ui.Thumbnail.prototype.pulse);
goog.exportSymbol('nrg.ui.Thumbnail.prototype.disposeInternal',
	nrg.ui.Thumbnail.prototype.disposeInternal);
