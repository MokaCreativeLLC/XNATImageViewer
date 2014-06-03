/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// nrg
goog.require('goog.ui.Dialog');


/**
 *
 * @constructor
 * @extends {goog.ui.Dialog}
 */
goog.provide('nrg.ui.Overlay');
nrg.ui.Overlay = function () {
    goog.base(this);
}
goog.inherits(nrg.ui.Overlay, goog.ui.Dialog);
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
  CLOSED: goog.events.getUniqueId('close'),
  CLOSE_BUTTON_CLICKED: goog.events.getUniqueId('close-button-clicked'),
}


/**
 * @enum {string}
 */
nrg.ui.Overlay.CSS = {
    OVERLAY: 'nrg-ui-overlay-overlay',
    BACKGROUND: 'nrg-ui-overlay-background',
    CLOSEBUTTON: 'nrg-ui-overlay-closebutton',
    CLOSEBUTTON_IMAGE: 'nrg-ui-overlay-closebutton-image',
    TEXT: 'nrg-ui-overlay-text',
    TITLE: 'nrg-ui-overlay-title',
    CONTENT: 'nrg-ui-overlay-content',
    BUTTONS: 'nrg-ui-overlay-buttons',
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
 * @param {string=} opt_eltMouseover
 * @param {string=} opt_titleMouseover
 * @public
 */
nrg.ui.Overlay.prototype.setMouseoverClass = 
function(opt_eltMouseover) {

    this.titleElt_.style.visibility = 'hidden';
    this.closeButton_.style.visibility = 'hidden';

    if (goog.isDefAndNotNull(opt_eltMouseover)){
	nrg.style.setHoverClass(this.getElement(), opt_eltMouseover,
				null, null,
        function(){
	    this.titleElt_.style.visibility = 'visible';
	    this.closeButton_.style.visibility = 'visible';
        }.bind(this),
 
        function(){
	    this.titleElt_.style.visibility = 'hidden';
	    this.closeButton_.style.visibility = 'hidden';
        }.bind(this));
    }
}


/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Overlay.prototype.addTitleClass = function(eltClass) {
    window.console.log('TITLE', this.titleElt_);
    goog.dom.classes.add(this.titleElt_, eltClass);
}



/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Overlay.prototype.addContentClass = function(eltClass) {
    goog.dom.classes.add(this.content_, eltClass);
}



/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Overlay.prototype.addCloseButtonClass = function(eltClass) {
    goog.dom.classes.add(this.closeButton_, eltClass);
}


/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Overlay.prototype.addCloseSpanClass = function(eltClass) {
    goog.dom.classes.add(this.closeSpan_, eltClass);
}


/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Overlay.prototype.addButtonsClass = function(eltClass) {
    goog.dom.classes.add(this.buttonCollection_, eltClass);
}


/** 
 * @private
 */
nrg.ui.Overlay.prototype.modifyButtonCollection_ = function() {
    goog.dom.classes.add(this.buttonCollection_, nrg.ui.Overlay.CSS.BUTTONS);
}



/** 
 * @private
 */
nrg.ui.Overlay.prototype.modifyContent_ = function() {
    goog.dom.classes.add(this.content_, nrg.ui.Overlay.CSS.CONTENT);
}



/** 
 * @private
 */
nrg.ui.Overlay.prototype.modifyTitle_ = function() {
    goog.dom.classes.add(this.titleElt_, nrg.ui.Overlay.CSS.TITLE);
}



/** 
 * @private
 */
nrg.ui.Overlay.prototype.modifyCloseButton_ = function() {

    //
    // Get the span holder of the close button
    //
    this.closeSpan_ = 
	goog.dom.getElementsByClass('modal-dialog-title-close', 
				    this.getElement())[0];
    goog.dom.classes.add(this.closeSpan_, nrg.ui.Overlay.CSS.CLOSEBUTTON);


    //
    // Create the close button image
    //
    this.closeButton_ = goog.dom.createDom('img', {
	'id': this.constructor.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.CLOSEBUTTON_IMAGE
    })
    this.closeButton_.src = serverRoot + 
	'/images/viewer/xiv/ui/Modal/close.png';

    //
    // Add button to span
    //
    goog.dom.appendChild(this.closeSpan_, this.closeButton_);

    goog.events.listen(this.closeButton_, goog.events.EventType.CLICK, 
		       function(e)
		       {
			   this.setVisible(!this.isVisible());
			   
			   this.dispatchEvent({
			       type: nrg.ui.Overlay.EventType.
				   CLOSE_BUTTON_CLICKED
			   })
			   e.stopPropagation();
		       }.bind(this))
		       
}



/**
 * @public
 */
nrg.ui.Overlay.prototype.applyFadeTransitions = function() {
    var dialogElt = this.getElement();
    var popupShowTransition = goog.fx.dom.FadeIn(dialogElt,
	nrg.ui.Component.animationLengths.SLOW);
    var popupHideTransition = goog.fx.dom.FadeOut(dialogElt,
	nrg.ui.Component.animationLengths.SLOW);
    var bgShowTransition = goog.fx.dom.FadeIn(dialogElt,
	nrg.ui.Component.animationLengths.SLOW);
    var bgHideTransition = goog.fx.dom.FadeOut(dialogElt,
	nrg.ui.Component.animationLengths.SLOW);
    this.setTransition(popupShowTransition, popupHideTransition,
				  bgShowTransition, bgHideTransition);

}




/**
 * @param {!string} cornerX
 * @param {1string} cornerY
 * @public
 */
nrg.ui.Overlay.prototype.moveToCorner = function(cornerX, cornerY) {
    var dialogElt = this.getElement();
    
    if (cornerX == 'left'){
	dialogElt.style.left = '0px';
    }

    if (cornerY == 'top'){
	dialogElt.style.top = '0px';
    }
}




/**
 * @public
 */
nrg.ui.Overlay.prototype.center = function() {
    var dialogElt = this.getElement();
    var parentSize = goog.style.getSize(this.getElement().parentNode);

    if (goog.isDefAndNotNull(this.getBackgroundElement())){
	var inUseBg = this.getBackgroundElement();
	nrg.style.setStyle(inUseBg, {
	    'width': parentSize.width,
	    'height': parentSize.height,
	    'z-index': 199 
	})
    }
    
    //
    // Reposition
    // 
    var dialogSize = goog.style.getSize(dialogElt);
    dialogElt.style.left = 'calc(50% - ' + dialogSize.width/2 + 'px)';
    dialogElt.style.top = 'calc(50% - ' + dialogSize.height/2 + 'px)';
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

    

    //return;
    var text = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Text_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Overlay.CSS.TEXT
    }, opt_text)
    if (!goog.isDefAndNotNull(this.texts_)){
	this.texts_ = [];
    }
    this.texts_.push(text);
    text.innerHTML = opt_text || '';
    //goog.dom.appendChild(this.overlay_, text);
    this.setContent(opt_text);
    return text;
}




/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.getOverlay = function() {
    return this.getElement();
}



/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);

    //
    // Add overlay class
    //
    goog.dom.classes.add(this.getElement(), 'nrg-ui-overlay');


    /**
     * @private
     * @type {Element}
     */
    this.titleElt_ = goog.dom.getElementsByClass('modal-dialog-title', 
					    this.getElement())[0];

    /**
     * @private
     * @type {Element}
     */
    this.content_ = goog.dom.getElementsByClass('modal-dialog-content', 
					    this.getElement())[0];


    /**
     * @private
     * @type {Element}
     */
    this.buttonCollection_ = goog.dom.getElementsByClass('modal-dialog-buttons', 
					    this.getElement())[0];


    /**
     * @private
     * @type {Element}
     */
    this.closeButton_ = null;  // gets created in 'modifyCloseButton'


    //
    // Modify children
    //
    this.modifyCloseButton_();
    this.modifyButtonCollection_();
    this.modifyTitle_();
    this.modifyContent_();
}




/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.setVisible = function(visible) {
    goog.base(this, 'setVisible', visible);
}



/**
 * @return {Array.<Element>} The text elements.
 * @public
 */
nrg.ui.Overlay.prototype.getTextElements = function() {
    return this.texts_;
}




/**
 * @inheritDoc
 */
nrg.ui.Overlay.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    delete this.buttonCollection_;
    delete this.titleElt_;
    delete this.content_;
    delete this.closeButton_;
    delete this.closeSpan_;


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

    


}
