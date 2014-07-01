/** 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Dialog');
goog.require('goog.events');
goog.require('goog.dom.classes');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.fx.dom.FadeIn');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.style');
goog.require('goog.fx.Dragger');
goog.require('goog.dom.classlist');
goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('goog.math.Rect');
goog.require('goog.array');

// nrg
goog.require('nrg.style');
goog.require('nrg.ui.Component.animationLengths');


/**
 *
 * @constructor
 * @extends {goog.ui.Dialog}
 */
goog.provide('nrg.ui.Dialog');
nrg.ui.Dialog = function () {
    goog.base(this);
    this.setEscapeToCancel(false);
}
goog.inherits(nrg.ui.Dialog, goog.ui.Dialog);
goog.exportSymbol('nrg.ui.Dialog', nrg.ui.Dialog);



/**
 * @type {!string} 
 * @const
 * @expose
 */
nrg.ui.Dialog.ID_PREFIX =  'nrg.ui.Dialog';


/**
 * Event types.
 * @enum {string}
 * @public
 */
nrg.ui.Dialog.EventType = {
  OPENED: goog.events.getUniqueId('open'),
  CLOSED: goog.events.getUniqueId('close'),
  CLOSE_BUTTON_CLICKED: goog.events.getUniqueId('close-button-clicked'),
}


/**
 * @enum {string}
 */
nrg.ui.Dialog.CSS = {
    OVERLAY: 'nrg-ui-dialog-overlay',
    BACKGROUND: 'nrg-ui-dialog-background',
    CLOSEBUTTON: 'nrg-ui-dialog-closebutton',
    CLOSEBUTTON_IMAGE: 'nrg-ui-dialog-closebutton-image',
    TEXT: 'nrg-ui-dialog-text',
    TITLE: 'nrg-ui-dialog-title',
    CONTENT: 'nrg-ui-dialog-content',
    BUTTONS: 'nrg-ui-dialog-buttons',
};




/**
 * @type {Element}
 * @private
 */
nrg.ui.Dialog.prototype.background_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Dialog.prototype.closeButton_;



/**
 * @type {Array.<Element>}
 * @private
 */
nrg.ui.Dialog.prototype.images_;



/**
 * @type {Array.<Element>}
 * @private
 */
nrg.ui.Dialog.prototype.texts_;




/** 
 * @param {string=} opt_eltMouseover
 * @param {string=} opt_titleMouseover
 * @public
 */
nrg.ui.Dialog.prototype.setMouseoverClass = 
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
nrg.ui.Dialog.prototype.addTitleClass = function(eltClass) {
    //window.console.log('TITLE', this.titleElt_);
    goog.dom.classes.add(this.titleElt_, eltClass);
}



/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Dialog.prototype.addContentClass = function(eltClass) {
    goog.dom.classes.add(this.content_, eltClass);
}



/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Dialog.prototype.addCloseButtonClass = function(eltClass) {
    goog.dom.classes.add(this.closeButton_.parentNode, eltClass);
}



/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Dialog.prototype.addCloseButtonImageClass = function(eltClass) {
    goog.dom.classes.add(this.closeButton_, eltClass);
}


/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Dialog.prototype.addCloseSpanClass = function(eltClass) {
    goog.dom.classes.add(this.closeSpan_, eltClass);
}





/** 
 * @param {!string} eltClass
 * @public
 */
nrg.ui.Dialog.prototype.addButtonsClass = function(eltClass) {
    goog.dom.classes.add(this.buttonCollection_, eltClass);
}


/** 
 * @private
 */
nrg.ui.Dialog.prototype.modifyButtonCollection_ = function() {
    goog.dom.classes.add(this.buttonCollection_, nrg.ui.Dialog.CSS.BUTTONS);
}



/** 
 * @private
 */
nrg.ui.Dialog.prototype.modifyContent_ = function() {
    goog.dom.classes.add(this.content_, nrg.ui.Dialog.CSS.CONTENT);
}



/** 
 * @private
 */
nrg.ui.Dialog.prototype.modifyTitle_ = function() {
    goog.dom.classes.add(this.titleElt_, nrg.ui.Dialog.CSS.TITLE);
}



/** 
 * @private
 */
nrg.ui.Dialog.prototype.modifyCloseButton_ = function() {

    //
    // Get the span holder of the close button
    //
    this.closeSpan_ = 
	goog.dom.getElementsByClass('modal-dialog-title-close', 
				    this.getElement())[0];
    goog.dom.classes.add(this.closeSpan_, nrg.ui.Dialog.CSS.CLOSEBUTTON);


    //
    // Create the close button image
    //
    this.closeButton_ = goog.dom.createDom('img', {
	'id': this.constructor.ID_PREFIX + '_CloseButton_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Dialog.CSS.CLOSEBUTTON_IMAGE
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
			       type: nrg.ui.Dialog.EventType.
				   CLOSE_BUTTON_CLICKED
			   })
			   e.stopPropagation();
		       }.bind(this))
		       
}



/**
 * @public
 */
nrg.ui.Dialog.prototype.applyFadeTransitions = function() {
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
nrg.ui.Dialog.prototype.moveToCorner = function(cornerX, cornerY) {
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
nrg.ui.Dialog.prototype.center = function() {
    //window.console.log("CENTER");

    var dialogElt = this.getElement();
    var parentElt = this.getElement().parentNode;
    var parentSize = goog.style.getSize(parentElt);
    
    //
    // Background adjustments
    //
    if (goog.isDefAndNotNull(this.getBackgroundElement())){
	var inUseBg = this.getBackgroundElement();
	if (inUseBg.opacity == 0){
	    goog.dom.removeNode(inUseBg);   
	}
	else {
	    nrg.style.setStyle(inUseBg, {
		'width': parentSize.width,
		'height': parentSize.height,
		'z-index': 199 
	    })
	}
    }
    
    //
    // Reposition to center
    // 
    var dialogSize = goog.style.getSize(dialogElt);
    var x = 0, y = 0;
    
    //
    // Center only if the dialog size is less than the parent
    //
    if (dialogSize.width <= parentSize.width) {
	x = parentSize.width/2 - dialogSize.width/2;
    }
    if (dialogSize.height <= parentSize.height) {
	y = parentSize.height/2 - dialogSize.height/2;
    }

    //
    // Set position
    //
    goog.style.setPosition(dialogElt, x, y);
}




/**
 * Whether the dialog is draggable. Defaults to true.
 * @type {boolean}
 * @private
 */
nrg.ui.Dialog.prototype.draggable_ = true;




/**
 * Dragger.
 * @type {goog.fx.Dragger}
 * @private
 */
nrg.ui.Dialog.prototype.dragger_ = null;



/**
 * Sets whether the dialog can be dragged.
 * @param {boolean} draggable Whether the dialog can be dragged.
 */
nrg.ui.Dialog.prototype.setDraggable = function(draggable) {
    this.draggable_ = draggable;
    this.setDraggingEnabled_(draggable && this.isInDocument());
};




/**
 * Enables or disables dragging.
 * @param {boolean} enabled Whether to enable it.
 * @private.
 */
nrg.ui.Dialog.prototype.setDraggingEnabled_ = function(enabled) {
    // This isn't ideal, but the quickest and easiest way to append
    // title-draggable to the last class in the class_ string, then trim and
    // split the string into an array (in case the dialog was set up with
    // multiple, space-separated class names).
    var classNames = goog.string.trim(goog.getCssName(this.getClass(),
				'title-draggable')).split(' ');

    var titleEl = this.getTitleElement();
    if (this.getElement()) {
	if (enabled) {
	    goog.dom.classlist.addAll(
		goog.asserts.assert(titleEl), classNames);
	} else {
	    goog.dom.classlist.removeAll(
		goog.asserts.assert(titleEl), classNames);
	}
    }

    if (enabled && !this.dragger_) {
	this.dragger_ = this.createDragger();
	goog.dom.classlist.addAll(goog.asserts.assert(titleEl), classNames);
	goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.START,
			   this.setDraggerLimits_, false, this);
    } else if (!enabled && this.dragger_) {
	this.dragger_.dispose();
	this.dragger_ = null;
    }
};




/**
 * @public
 */
nrg.ui.Dialog.prototype.updateLimits = function() {
    this.setDraggerLimits_();
}




/**
 * Sets dragger limits when dragging is started.
 * NOTE: Taken/Modified from the original closure code.
 * 
 * @param {!goog.events.Event} e goog.fx.Dragger.EventType.START event.
 * @private
 */
nrg.ui.Dialog.prototype.setDraggerLimits_ = function(e) {
    var doc = this.getDomHelper().getDocument();
    var win = goog.dom.getWindow(doc) || window;
    var parentElt = this.getElement().parentNode;
    var parentSize = goog.style.getSize(parentElt);

    //window.console.log("PARENT", parentSize);
    // Take the max of scroll height and view height for cases in which document
    // does not fill screen.
    var viewSize = goog.dom.getViewportSize(win);
    var dialogSize = goog.style.getSize(this.getElement());

    if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
	//
	// Ensure position:fixed dialogs can't be dragged beyond the viewport.
	//
	this.dragger_.setLimits(new goog.math.Rect(
	    0, 
	    0,
	    Math.max(0, viewSize.width - dialogSize.width),
	    Math.max(0, viewSize.height - dialogSize.height)));
    } else {
	//
	// Set limits to parent only if the dialog size less than that of 
	// the parent
	//
	var w = (dialogSize.width <= parentSize.width) ?  
	    parentSize.width - dialogSize.width : 0;
	var h = (dialogSize.height <= parentSize.height) ?  
	    parentSize.height - dialogSize.height : 0;

	this.dragger_.setLimits(
	    new goog.math.Rect(
		    -1 * dialogSize.width, 
		    -1 * dialogSize.height, 
		parentSize.width + dialogSize.width, 
		parentSize.height + dialogSize.height));
    }
};




/**
 * @param {string=} opt_src The image source
 * @return {Element} The image object.
 * @public
 */
nrg.ui.Dialog.prototype.addImage = function(opt_src) {
    var image = goog.dom.createDom('img', {
	'id': this.constructor.ID_PREFIX + '_Image_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Dialog.CSS.IMAGE
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
nrg.ui.Dialog.prototype.addText = function(opt_text) {

    

    //return;
    var text = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_Text_' + 
	    goog.string.createUniqueString(),
	'class': nrg.ui.Dialog.CSS.TEXT
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
nrg.ui.Dialog.prototype.getOverlay = function() {
    return this.getElement();
}



/**
 * @inheritDoc
 */
nrg.ui.Dialog.prototype.render = function(opt_parentElement) {
    goog.base(this, 'render', opt_parentElement);

    //
    // Add overlay class
    //
    goog.dom.classes.add(this.getElement(), 'nrg-ui-dialog');


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

    //
    // Hijack the draggable
    //
    nrg.ui.Dialog.superClass_.setDraggable.call(this, false);
    this.setDraggable(true);
}




/**
 * @inheritDoc
 */
nrg.ui.Dialog.prototype.setVisible = function(visible) {
    goog.base(this, 'setVisible', visible);
}



/**
 * @return {Array.<Element>} The text elements.
 * @public
 */
nrg.ui.Dialog.prototype.getTextElements = function() {
    return this.texts_;
}




/**
 * @inheritDoc
 */
nrg.ui.Dialog.prototype.disposeInternal = function() {
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
