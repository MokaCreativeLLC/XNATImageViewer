/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// nrg
goog.require('nrg.ui.Component');


/**
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('nrg.ui.Overlay');
nrg.ui.Overlay = function () {
    goog.base(this);
    this.createOverlay_();
}
goog.inherits(nrg.ui.Overlay, nrg.ui.Component);
goog.exportSymbol('nrg.ui.Overlay', nrg.ui.Overlay);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.Overlay.ID_PREFIX =  'nrg.ui.Overlay';


/**
 * Event types.
 * @enum {string}
 * @public
 */
nrg.ui.Overlay.EventType = {
  OPENED: goog.events.getUniqueId('open'),
  CLOSED: goog.events.getUniqueId('close')
}


/**
 * @enum {string}
 */
nrg.ui.Overlay.CSS_SUFFIX = {
    OVERLAY: 'overlay',
    BACKGROUND: 'background',
    CLOSEBUTTON: 'closebutton',
    TEXT: 'text'
};



/**
 * @type {Element}
 * @private
 */
nrg.ui.Overlay.prototype.overlay_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Overlay.prototype.background_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Overlay.prototype.closeButton_;



/**
 * @type {Array.<Element>}
 * @private
 */
nrg.ui.Overlay.prototype.images_;



/**
 * @type {Array.<Element>}
 * @private
 */
nrg.ui.Overlay.prototype.texts_;


/**
 * @type {!boolean}
 * @private
 */
nrg.ui.Overlay.prototype.destroyOnClose_ = false;



/**
 * @type {!boolean}
 * @private
 */
nrg.ui.Overlay.prototype.closeOnHover_ = false;


/**
 * @type {string}
 * @private
 */
nrg.ui.Overlay.prototype.mouseOverKey_;



/**
 * @private
 */
nrg.ui.Overlay.prototype.createOverlay_ = function() {
    this.overlay_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Overlay_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.OVERLAY
    })
}



/**
 * @param {!boolean} closeOnHover
 * @public
 */
nrg.ui.Overlay.prototype.setCloseOnHover = function(closeOnHover) {
    this.closeOnHover_ = closeOnHover;
    if (this.closeOnHover_){
	this.mouseOverKey_  = 
	goog.events.listen(this.getElement(), goog.events.EventType.MOUSEOVER, 
			   this.close.bind(this));
    } else {
	goog.events.unlisten(this.mouseOverKey_);
    }
}



/**
 * @param {!boolean} doc
 * @public
 */
nrg.ui.Overlay.prototype.setDestroyOnClose = function(doc) {
    this.destroyOnClose_ = doc;
}



/**
 * @public
 */
nrg.ui.Overlay.prototype.addCloseButton = function() {
    this.closeButton_ = goog.dom.createDom('img', {
	'id': this.constructor.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.CLOSEBUTTON
    })
    this.closeButton_.src = serverRoot + 
	'/images/viewer/xiv/ui/Modal/close.png';
    goog.dom.appendChild(this.overlay_, this.closeButton_);
    goog.events.listen(this.closeButton_, goog.events.EventType.CLICK,
		       this.close.bind(this));
}



/**
 * @param {string=} opt_src The image source
 * @return {Element} The image object.
 * @public
 */
nrg.ui.Overlay.prototype.addImage = function(opt_src) {
    var image = goog.dom.createDom('img', {
	'id': this.constructor.ID_PREFIX + '_Image_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.IMAGE
    })

    if (!goog.isDefAndNotNull(this.images_)){
	this.images_ = [];
    }

    this.images_.push(image);
    goog.dom.appendChild(this.overlay_, image);

    if (goog.isDefAndNotNull(opt_src)){
	image.src = opt_src;
    }
    return image;
}



/**
 * @param {string=} opt_text The text for this
 * @public
 */
nrg.ui.Overlay.prototype.addText = function(opt_text) {
    var text = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Text_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.TEXT
    })
    if (!goog.isDefAndNotNull(this.texts_)){
	this.texts_ = [];
    }
    this.texts_.push(text);
    text.innerHTML = opt_text || '';
    goog.dom.appendChild(this.overlay_, text);
    return text;
}




/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.getOverlay = function() {
    return this.overlay_;
}




/**
 * @return {Array.<Element>} The text elements.
 * @public
 */
nrg.ui.Overlay.prototype.getTextElements = function() {
    return this.texts_;
}


/**
 * @public
 */
nrg.ui.Overlay.prototype.addBackground = function() {
    this.background_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Background_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.BACKGROUND
    })
}



/**
 * @return {?Element}
 * @public
 */
nrg.ui.Overlay.prototype.getBackground = function() {
    return this.background_;
}




/**
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 500.
 * @public
 */
nrg.ui.Overlay.prototype.close = function(opt_fadeTime) {
    opt_fadeTime = goog.isDefAndNotNull(opt_fadeTime) &&
	goog.isNumber(opt_fadeTime) ? opt_fadeTime : 500;

    //
    // background fade, if needed.
    //
    if (goog.isDefAndNotNull(this.background_) && 
	(this.background_.parentNode == this.getElement().parentNode)){
	nrg.fx.fadeOut(this.background_, opt_fadeTime);	
    }

    window.console.log(opt_fadeTime);

    //
    // element fade
    //
    nrg.fx.fadeOut(this.getElement(), opt_fadeTime, function(){
	this.dispatchEvent({
	    type: nrg.ui.Overlay.EventType.CLOSED,
	})
	if (this.destroyOnClose_){
	    this.dispose();
	}
    }.bind(this));
}



/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);

    goog.dom.appendChild(this.getElement(), this.overlay_);

    if (goog.isDefAndNotNull(this.background_)){
	
	//
	// Non-document parents
	//
	if (goog.isDefAndNotNull(opt_parentElement) &&
	    (opt_parentElement != document.body)) {
	    goog.dom.appendChild(this.getElement(), this.background_);
	}

	//
	// Document parents
	//
	else {
	    goog.dom.appendChild(document.body, this.background_);
	    this.background_.style.position = 'fixed';
	    this.getElement().style.zIndex = 500;
	}
    }

}



/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

     if (goog.isDefAndNotNull(this.overlay_)){
	 goog.dom.removeNode(this.overlay_);
	 delete this.overlay_;
    }

   
    if (goog.isDefAndNotNull(this.texts_)){
	goog.array.forEach(this.texts_, function(text){
	    goog.dom.removeNode(text);
	    delete text;
	})
	delete this.texts_;
    }

    if (goog.isDefAndNotNull(this.images_)){
	goog.array.forEach(this.images_, function(image){
	    goog.dom.removeNode(image);
	    delete image;
	})
	delete this.images_;
    }

    if (goog.isDefAndNotNull(this.closeButton_)){
	goog.events.removeAll(this.closeButton_);
	goog.dom.removeNode(this.closeButton_);
	delete this.background_;
    }

    if (goog.isDefAndNotNull(this.background_)){
	goog.dom.removeNode(this.background_);
	delete this.background_;
    }

    delete this.destroyOnClose_;
    delete this.closeOnHover_;
    delete this.mouseOverKey_;
}
