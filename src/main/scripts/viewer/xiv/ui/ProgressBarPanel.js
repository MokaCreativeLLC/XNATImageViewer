/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.ProgressBar');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * xiv.ui.ProgressBarPanel
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ProgressBarPanel');
xiv.ui.ProgressBarPanel = function() {
    goog.base(this);

    //window.console.log("HERE:", xiv.ui.ProgressBarPanel.CSS);
    //window.console.log("HERE:", this.CSS, xiv.ui.ProgressBarPanel);
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
    this.labelHolder_ = goog.dom.createDom('div', {
	'id': xiv.ui.ProgressBarPanel.ID_PREFIX + '_LabelHolder_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ProgressBarPanel.CSS.LABELHOLDER
    });
    goog.dom.append(this.getElement(), this.labelHolder_);


    /**
     * @type {goog.ui.ProgressBar}
     * @private
     */
    this.ProgressBar_ = new goog.ui.ProgressBar();
    this.ProgressBar_.decorate(this.progBarHolder_);


    goog.dom.classes.add(goog.dom.getElementByClass('progress-bar-thumb', 
				    this.progBarHolder_), 
			 xiv.ui.ProgressBarPanel.CSS.THUMB)
    /**
     * @type {?Element}
     * @private
     */
    this.progressBarHolder_ = null;
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
    LABELHOLDER: 'labelholder'
}




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
    this.setValue(this.ProgressBar_.getValue());
}


/**
 * @param {!number} val
 */
xiv.ui.ProgressBarPanel.prototype.setValue = function(val) {
    this.ProgressBar_.setValue(val);
    this.labelHolder_.innerHTML = this.labelText_;
    if (this.showValue_){
	if (this.labelText_.length > 0){
	    this.labelHolder_.innerHTML += ' ';
	}
	this.labelHolder_.innerHTML += 
	this.ProgressBar_.getValue().toString() + '%';
    }
    goog.dom.classes.remove(this.progBarHolder_, 'progress-bar-horizontal');
}



/**
 * @return {!number}
 */
xiv.ui.ProgressBarPanel.prototype.getValue = function() {
    return this.ProgressBar_.getValue();
}



/**
 * @inheritDoc
 */
xiv.ui.ProgressBarPanel.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    if (goog.isDefAndNotNull(this.ProgressBar_)){
	this.ProgressBar_.dispose();
	delete this.ProgressBar_;
    }

    if (goog.isDefAndNotNull(this.progBarHolder_)){
	goog.dom.removeNode(this.progBarHolder_);
	delete this.progBarHolder_;
    }

    if (goog.isDefAndNotNull(this.labelHolder_)){
	goog.dom.removeNode(this.labelHolder_);
	delete this.labelHolder_;
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
