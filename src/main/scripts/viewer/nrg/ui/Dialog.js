/** 
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.Dialog');

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
goog.require('nrg.ui.Component');


/**
 *
 * @constructor
 * @extends {goog.ui.Dialog}
 */
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
 * @expose
 */
nrg.ui.Dialog.CSS = {
    OVERLAY: 'nrg-ui-dialog-overlay',
    BACKGROUND: 'nrg-ui-dialog-background',
    CLOSEBUTTON: 'nrg-ui-dialog-closebutton',
    CLOSEBUTTON_IMAGE: 'nrg-ui-dialog-closebutton-image',
    SUBTEXT: 'nrg-ui-dialog-subtext',
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
 * Whether the dialog is draggable. Defaults to true.
 * @type {boolean}
 * @private
 */
nrg.ui.Dialog.prototype.draggable_ = true;




/**
 * Dragger.
 * @type {?goog.fx.Dragger}
 * @private
 */
nrg.ui.Dialog.prototype.dragger_ = null;



/**
 * @type {?goog.math.Coordinate}
 * @private
 */
nrg.ui.Dialog.prototype.posOnClose_ = null;



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
	nrg.style.setHoverClass(this.getElement(), 
				opt_eltMouseover,
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
 * @param {!string} cornerY
 * @param {number=} opt_adderX
 * @param {number=} opt_adderY
 * @public
 */
nrg.ui.Dialog.prototype.moveToCorner = 
function(cornerX, cornerY, opt_adderX, opt_adderY) {
    var dialogElt = this.getElement();
    var parentSize = goog.style.getSize(dialogElt.parentNode);
    var dialogSize = goog.style.getSize(dialogElt);

    opt_adderX = goog.isDefAndNotNull(opt_adderX) ? opt_adderX : 0;
    opt_adderY = goog.isDefAndNotNull(opt_adderY) ? opt_adderY : 0;

    if (cornerX == 'left'){
	dialogElt.style.left = 0 + opt_adderX + 'px';
    }
    else if (cornerX == 'right'){
	//window.console.log(dialogElt.parentNode, parentSize);
	dialogElt.style.left = parentSize.width - dialogSize.width +
	    opt_adderX + 'px';
    }

    if (cornerY == 'top'){
	dialogElt.style.top = 0 + opt_adderY + 'px';
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
 * @public
 * @return {?goog.math.Rect}
 */
nrg.ui.Dialog.prototype.getDraggerLimits = function() {
    return goog.isDefAndNotNull(this.dragger_) ? this.dragger_.limits :
	null;
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
    if (!goog.isDefAndNotNull(this.getElement())){
	return;
    }

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
    goog.dom.appendChild(this.getContentElement(), image);
    //this.setContent(image);

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
    goog.dom.appendChild(this.getContentElement(), text);
    //this.setContent(opt_text);
    return text;
}





/**
 * @param {!string} text The text for this
 * @public
 */
nrg.ui.Dialog.prototype.addSubText = function(text) {

    //return;
    var subTextElt = goog.dom.createDom('div', {
	'id': 'ErrorSub_' + goog.string.createUniqueString(),
	'class': nrg.ui.Dialog.CSS.SUBTEXT
    })

    subTextElt.innerHTML = text;

    goog.dom.appendChild(this.getContentElement(), subTextElt);

    return subTextElt;
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
    if (!this.isInDocument()){
	goog.base(this, 'render', opt_parentElement);
    }
    else if (goog.isDefAndNotNull(opt_parentElement) &&
	this.getElement().parentNode != opt_parentElement){
	goog.dom.append(opt_parentElement, this.getElement());
	return;
    }
    
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
    this.buttonCollection_ = goog.dom.getElementsByClass(
	'modal-dialog-buttons', 
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
    //window.console.log("SET VISIBLE", visible, this.getElement(),
    //this.getTitle(), this.isVisible())
	
    if (!goog.isDefAndNotNull(this.getElement())) { return }

    if (!goog.isDefAndNotNull(this.posOnClose_)){
	this.posOnClose_ = goog.style.getPosition(this.getElement());
    }

    if (this.isVisible() && visible == false){
	this.posOnClose_ = goog.style.getPosition(this.getElement());
	goog.base(this, 'setVisible', visible);
    } 


    else if (!this.isVisible() && visible == true){
	goog.base(this, 'setVisible', visible);
	goog.style.setPosition(this.getElement(), this.posOnClose_);
	return;
    }
}



/**.
 * @public
 */
nrg.ui.Dialog.prototype.resizeToContents = function() {

  var dialogElt = this.getElement();
  var contentElt = this.getContentElement();
  var maxWidth = 0;
  var maxHeight = 0;
  var scrollWidth = 0;
  var scrollHeight = 0;
  //
  // Temporarily set the overflow of the dialog to 'visible'
  //
  var oldOverflow = dialogElt.style.overflow;
  dialogElt.style.overflow = 'visible';
  //
  // Loop through all of the text elements
  //
  if (goog.isDefAndNotNull(this.texts_)){
    goog.array.forEach(this.texts_, function(textElt){
      // Get the scrollWidth and scrollHeight of the textElt 
      scrollWidth = textElt.scrollWidth;
      scrollHeight = textElt.scrollHeight;
      // Adjust maxWidth and maxHeight
      maxWidth = (scrollWidth > maxWidth) ? scrollWidth : maxWidth;
      maxHeight = (scrollHeight > maxHeight) ? scrollHeight : maxHeight;
      // Set the text width to the scroll dimensions 
      goog.style.setSize(textElt, scrollWidth, scrollHeight);
    });
  }

  // Re-apply the oldOverflow if needed, otherwise, remove the property.
  if (!goog.isDefAndNotNull(oldOverflow)){
    dialogElt.style.removeProperty('overflow');
  } else {
    dialogElt.style.overflow = oldOverflow;
  }

  // IMPORTANT! Set the size of the contentElt.
  goog.style.setSize(contentElt, maxWidth, maxHeight);

  var size = goog.style.getSize(this.getContentElement());
//    window.console.log(size);
  goog.style.setSize(this.getElement(), size.width + 20, size.height + 20);
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

    if (goog.isDefAndNotNull(this.posOnClose_)){
	goog.object.clear(this.posOnClose_);
	delete this.posOnClose_;
    }


}


goog.exportSymbol('nrg.ui.Dialog.ID_PREFIX', nrg.ui.Dialog.ID_PREFIX);
goog.exportSymbol('nrg.ui.Dialog.EventType', nrg.ui.Dialog.EventType);
goog.exportSymbol('nrg.ui.Dialog.prototype.setMouseoverClass',
	nrg.ui.Dialog.prototype.setMouseoverClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addTitleClass',
	nrg.ui.Dialog.prototype.addTitleClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addContentClass',
	nrg.ui.Dialog.prototype.addContentClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addCloseButtonClass',
	nrg.ui.Dialog.prototype.addCloseButtonClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addCloseButtonImageClass',
	nrg.ui.Dialog.prototype.addCloseButtonImageClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addCloseSpanClass',
	nrg.ui.Dialog.prototype.addCloseSpanClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.addButtonsClass',
	nrg.ui.Dialog.prototype.addButtonsClass);
goog.exportSymbol('nrg.ui.Dialog.prototype.applyFadeTransitions',
	nrg.ui.Dialog.prototype.applyFadeTransitions);
goog.exportSymbol('nrg.ui.Dialog.prototype.moveToCorner',
	nrg.ui.Dialog.prototype.moveToCorner);
goog.exportSymbol('nrg.ui.Dialog.prototype.center',
	nrg.ui.Dialog.prototype.center);
goog.exportSymbol('nrg.ui.Dialog.prototype.setDraggable',
	nrg.ui.Dialog.prototype.setDraggable);
goog.exportSymbol('nrg.ui.Dialog.prototype.updateLimits',
	nrg.ui.Dialog.prototype.updateLimits);
goog.exportSymbol('nrg.ui.Dialog.prototype.addImage',
	nrg.ui.Dialog.prototype.addImage);
goog.exportSymbol('nrg.ui.Dialog.prototype.addText',
	nrg.ui.Dialog.prototype.addText);
goog.exportSymbol('nrg.ui.Dialog.prototype.addSubText',
	nrg.ui.Dialog.prototype.addSubText);
goog.exportSymbol('nrg.ui.Dialog.prototype.getOverlay',
	nrg.ui.Dialog.prototype.getOverlay);
goog.exportSymbol('nrg.ui.Dialog.prototype.render',
	nrg.ui.Dialog.prototype.render);
goog.exportSymbol('nrg.ui.Dialog.prototype.setVisible',
	nrg.ui.Dialog.prototype.setVisible);
goog.exportSymbol('nrg.ui.Dialog.prototype.getTextElements',
	nrg.ui.Dialog.prototype.getTextElements);
goog.exportSymbol('nrg.ui.Dialog.prototype.resizeToContents',
	nrg.ui.Dialog.prototype.resizeToContents);
goog.exportSymbol('nrg.ui.Dialog.prototype.getDraggerLimits',
	nrg.ui.Dialog.prototype.getDraggerLimits);
goog.exportSymbol('nrg.ui.Dialog.prototype.disposeInternal',
	nrg.ui.Dialog.prototype.disposeInternal);
