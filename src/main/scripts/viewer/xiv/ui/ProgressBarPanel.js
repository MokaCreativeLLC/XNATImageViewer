/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.ProgressBar');

// nrg




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
 * @public
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
xiv.ui.ProgressBarPanel.prototype.setLabel = function(opt_label, opt_showValue) {
    if (!this.label_ && goog.isString(opt_label) && (opt_label.length > 0)) {
	this.labelText_ = opt_label;
    }
    this.showValue_ = (opt_showValue === true);
    this.setValue(this.ProgressBar_.getValue());
}



/**
 * @param {!number} val
 */
xiv.ui.ProgressBarPanel.prototype.setValue = function(val) {

    this.ProgressBar_.setValue(val);
    this.labelHolder_.innerHTML = this.labelText_ + ' ' 
	+ this.ProgressBar_.getValue().toString() + '%';
    goog.dom.classes.remove(this.progBarHolder_, 'progress-bar-horizontal');
}



/**
 * @param {!number} val
 */
xiv.ui.ProgressBarPanel.prototype.getValue = function(val) {

    this.ProgressBar_.setValue(val);
    this.labelHolder_.innerHtml = this.labelText_ + ' ' 
	+ this.ProgressBar_.getValue().toString() + '%';
}



/**
 * @inheritDoc
 */
xiv.ui.ProgressBarPanel.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    this.ProgressBar_.disposeInternal();
    delete this.ProgressBar_;

    goog.dom.removeNode(this.progBarHolder_);
    delete this.progBarHolder_;

    goog.dom.removeNode(this.labelHolder_);
    delete this.labelHolder_;

    this.showValue_ = null;
    this.labelText_ = null;
}
