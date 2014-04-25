/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog

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
 * @enum {string}
 */
nrg.ui.Overlay.CSS_SUFFIX = {
    BACKGROUND: 'background',
    CLOSEBUTTON: 'closebutton',
    TEXT: 'text'
};



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
 * @public
 */
nrg.ui.Overlay.prototype.addCloseButton = function() {
    this.closeButton_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.CLOSEBUTTON
    })
    goog.dom.appendChild(this.getElement(), this.closeButton_);

    goog.events.listen(this.closeButton_, goog.events.EventType.CLICK,
		       this.fadeOutAndDispose_.bind(this));
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
    goog.dom.appendChild(this.getElement(), image);

    if (goog.isDefAndNotNull(opt_src)){
	image.src = opt_src;
    }
    return image;
}



/**
 * @param {string=} opt_text The text for this
 * @return {Element} The image object.
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

    goog.dom.appendChild(this.getElement(), text);

    return text;
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
    goog.dom.appendChild(this.getElement(), this.background_);
}



/**
 * @private
 */
nrg.ui.Overlay.prototype.fadeOutAndDispose_ = function(opt_parentElement) {
    nrg.fx.fadeOut(this.getElement(), 500, function(){
	this.disposeInternal();
    }.bind(this));
}



/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);
    if (goog.isDefAndNotNull(this.background_)){
	//goog.dom.appendChild(this.getElement(), this.background_);
    }
}



/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    
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
}
