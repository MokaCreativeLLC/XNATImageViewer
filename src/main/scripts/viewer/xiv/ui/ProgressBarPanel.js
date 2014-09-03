/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ProgressBarPanel');

// goog
goog.require('goog.ui.ProgressBar');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.structs.Queue');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * xiv.ui.ProgressBarPanel
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.ProgressBarPanel = function() {
    goog.base(this);

    /**
     * @type {!Element}
     * @private
     */	
    this.progBarHolder_ = goog.dom.createDom('div', {
	'id': xiv.ui.ProgressBarPanel.ID_PREFIX + '_ProgBarHolder_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ProgressBarPanel.CSS.PROGBARHOLDER
    });
    goog.dom.append(this.getElement(), this.progBarHolder_);


    /**
     * @type {!Element}
     * @private
     */
    this.progThumb_ = goog.dom.createDom('div', {
	'id': xiv.ui.ProgressBarPanel.ID_PREFIX + '_ProgBarThumb_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ProgressBarPanel.CSS.THUMB
    });
    goog.dom.append(this.progBarHolder_, this.progThumb_);



    /**
     * @type {!Element}
     * @private
     */	
    this.labelHolder_ = goog.dom.createDom('div', {
	'id': xiv.ui.ProgressBarPanel.ID_PREFIX + '_LabelHolder_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ProgressBarPanel.CSS.LABELHOLDER
    });
    goog.dom.append(this.getElement(), this.labelHolder_);


    /**
     * @type {!Element}
     * @private
     */	
    this.endNode_ = goog.dom.createDom('div', {
	'id': xiv.ui.ProgressBarPanel.ID_PREFIX + '_EndNode_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ProgressBarPanel.CSS.ENDNODE
    });
    goog.dom.append(this.progThumb_, this.endNode_);
}
goog.inherits(xiv.ui.ProgressBarPanel, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ProgressBarPanel', xiv.ui.ProgressBarPanel);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ProgressBarPanel.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ProgressBarPanel.ID_PREFIX =  'xiv.ui.ProgressBarPanel';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ProgressBarPanel.CSS_SUFFIX = {
    THUMB: 'thumb',
    PROGBARHOLDER: 'progbarholder',
    PROGRESSBAR: 'progressbar',
    LABELHOLDER: 'labelholder',
    ENDNODE: 'endnode',
    ENDNODE_GLOW: 'endnode-glow',
    GLOWNODE: 'glownode',
}


/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ProgressBarPanel.EventType = {
    ANIM_END: goog.events.getUniqueId('anim-end')
}




/**
 * @return {!number}
 * @private
 */
xiv.ui.ProgressBarPanel.prototype.value_= 0;



/**
 * @return {?goog.structs.Queue}
 * @private
 */
xiv.ui.ProgressBarPanel.prototype.valueQueue_= null;



/**
 * @type {string}
 * @public
 */
xiv.ui.ProgressBarPanel.prototype.labelText_ = '';



/**
 * @type {boolean}
 * @public
 */
xiv.ui.ProgressBarPanel.prototype.showValue_ = false;



/**
 * @param {string=}
 * @param {boolean=}
 */
xiv.ui.ProgressBarPanel.prototype.setLabel = function(opt_label) {
    this.labelText_ = opt_label;
    this.labelHolder_.innerHTML = this.labelText_;
}



/**
 * @param {boolean=}
 */
xiv.ui.ProgressBarPanel.prototype.showValue = function(opt_showValue) {
    this.showValue_ = goog.isDefAndNotNull(opt_showValue) && 
	(opt_showValue === false) ? false : true;
    this.setValue(this.value_);
}


/**
 * @param {!number} val
 */
xiv.ui.ProgressBarPanel.prototype.setValue = function(val) {
    
    if (val < 0 || val > 100) { return }
    this.value_ = val;
    this.progThumb_.style.width = 'calc(' + val.toString() + '% + 4px)';
    
    if (this.value_ == 0 && 
	goog.dom.classes.has(this.endNode_, 
			 xiv.ui.ProgressBarPanel.CSS.ENDNODE_GLOW)){
	goog.dom.classes.remove(this.endNode_,
			     xiv.ui.ProgressBarPanel.CSS.ENDNODE_GLOW);
    }
    else if (this.value_ > 90 && 
       !goog.dom.classes.has(this.endNode_, 
			 xiv.ui.ProgressBarPanel.CSS.ENDNODE_GLOW)){
	goog.dom.classes.add(this.endNode_,
			     xiv.ui.ProgressBarPanel.CSS.ENDNODE_GLOW);
    }
    this.labelHolder_.innerHTML = this.labelText_;
    if (this.showValue_){
	if (this.labelText_.length > 0){
	    this.labelHolder_.innerHTML += ' ';
	}
	this.labelHolder_.innerHTML += 
	this.value_.toString() + '%';
    }
}



/**
 * @return {!number}
 */
xiv.ui.ProgressBarPanel.prototype.getValue = function() {
    return this.value_;
}



/**
 * @inheritDoc
 */
xiv.ui.ProgressBarPanel.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    if (goog.isDefAndNotNull(this.progThumb_)){
	goog.dom.removeNode(this.progThumb_);
	delete this.progThumb_;
    }

    if (goog.isDefAndNotNull(this.progBarHolder_)){
	goog.dom.removeNode(this.progBarHolder_);
	delete this.progBarHolder_;
    }

    if (goog.isDefAndNotNull(this.labelHolder_)){
	goog.dom.removeNode(this.labelHolder_);
	delete this.labelHolder_;
    }

    if (goog.isDefAndNotNull(this.endNode_)){
	goog.dom.removeNode(this.endNode_);
	delete this.endNode_;
    }

    if (goog.isDefAndNotNull(this.valueQueue_)){
	goog.object.clear(this.valueQueue_);
	delete this.valueQueue_;
    }
    this.showValue_ = null;
    this.labelText_ = null;
}



goog.exportSymbol('xiv.ui.ProgressBarPanel.EventType',
	xiv.ui.ProgressBarPanel.EventType);
goog.exportSymbol('xiv.ui.ProgressBarPanel.ID_PREFIX',
	xiv.ui.ProgressBarPanel.ID_PREFIX);
goog.exportSymbol('xiv.ui.ProgressBarPanel.CSS_SUFFIX',
	xiv.ui.ProgressBarPanel.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ProgressBarPanel.prototype.setLabel',
	xiv.ui.ProgressBarPanel.prototype.setLabel);
goog.exportSymbol('xiv.ui.ProgressBarPanel.prototype.showValue',
	xiv.ui.ProgressBarPanel.prototype.showValue);
goog.exportSymbol('xiv.ui.ProgressBarPanel.prototype.setValue',
	xiv.ui.ProgressBarPanel.prototype.setValue);
goog.exportSymbol('xiv.ui.ProgressBarPanel.prototype.getValue',
	xiv.ui.ProgressBarPanel.prototype.getValue);
goog.exportSymbol('xiv.ui.ProgressBarPanel.prototype.disposeInternal',
	xiv.ui.ProgressBarPanel.prototype.disposeInternal);
