/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog

// moka
goog.require('moka.ui.Tabs');
goog.require('moka.ui.Resizeable');





/**
 *
 * TODO: Implement the other orientatations (LEFT, RIGHT, TOP)
 *
 * @constructor
 * @param {string=} opt_orientation
 * @extends {moka.ui.Tabs}
 */
goog.provide('moka.ui.ZipTabs');
moka.ui.ZipTabs = function (opt_orientation) {
    goog.base(this);

    this.checkOrientation_(opt_orientation ||
			  moka.ui.ZipTabs.DEFAULT_ORIENTATION);
    this.setClassesByOrientation_();

    /**
     * @type {!moka.ui.Resizeable}
     * @private
     */
    this.Resizeable_ = new moka.ui.Resizeable(this.getElement(), 
			     moka.ui.ZipTabs.RESIZE_DIR[this.orientation_]);

    // required!
    this.updateStyle();


 
}
goog.inherits(moka.ui.ZipTabs, moka.ui.Tabs);
goog.exportSymbol('moka.ui.ZipTabs', moka.ui.ZipTabs)



/**
 * @type {Array.string}
 * @const
 */
moka.ui.ZipTabs.ORIENTATIONS = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.DEFAULT_ORIENTATION = moka.ui.ZipTabs.ORIENTATIONS[1];



/**
 * @type {Array.string}
 * @const
 */
moka.ui.ZipTabs.RESIZE_DIR = {
    'TOP': 'BOTTOM', 
    'BOTTOM': 'TOP', 
    'LEFT': 'RIGHT', 
    'RIGHT': 'LEFT',
};



/**
 * Event types.
 * @enum {string}
 * @public
 */
moka.ui.ZipTabs.EventType = {
  CLICKED: goog.events.getUniqueId('viewboxtab_clicked'),
}



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.ID_PREFIX =  'moka.ui.ZipTabs';



/**
 * @type {!string} 
 * @const
 */
moka.ui.ZipTabs.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(
    moka.ui.ZipTabs.ID_PREFIX.toLowerCase().replace(/\./g,'-'));



/**
 * @type {string} 
 * @const
 */
moka.ui.ZipTabs.ELEMENT_CLASS =
    goog.getCssName(moka.ui.ZipTabs.CSS_CLASS_PREFIX, '');



/**
 * @param {string}
 * @private
 */
moka.ui.ZipTabs.prototype.orientation_;



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.checkOrientation_ = function(orient){
    if (!goog.isString(orient)){
	throw new TypeError('String required!')
    }
    orient = orient.toUpperCase();
    if (moka.ui.ZipTabs.ORIENTATIONS.indexOf(orient) == -1){
	throw new Error('Invalid orienation!');
    }
    this.orientation_ = orient;
}



/**
 * As sated.
 * @private
 */
moka.ui.ZipTabs.prototype.getResizeable = function(orient){
    return this.Resizeable_;
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @param {!number} clickInd The clicked tab index.
 * @private
 */
moka.ui.ZipTabs.prototype.onTabClicked_ = function(clickInd) {
    window.console.log("On tab clicked!");
    this.Resizeable_.slideDragger(
	'TOP', new goog.math.Coordinate(0, 140));

}



moka.ui.ZipTabs.prototype.setClassesByOrientation_ = function() {
    goog.dom.classes.add(this.getElement(), moka.ui.ZipTabs.ELEMENT_CLASS);
    goog.dom.classes.add(this.getElement(), 
		goog.getCssName(moka.ui.ZipTabs.CSS_CLASS_PREFIX, 
			       this.orientation_.toLowerCase()));


    // In-line calculations
    switch (this.orientation_) {

    case 'BOTTOM':
	moka.style.setStyle(this.getElement(), {
	    'height': 
	    this.getTabHeight()
	})
	this.getElement().style.top = 'calc(100% - ' 
	    + this.getTabHeight() +'px)';
	break;
    case 'TOP':
	// to do

    case 'LEFT':
	// to do

    case 'RIGHT':
	// to do
    }
}



/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    
    switch (this.orientation_) {

    case 'TOP':
    case 'BOTTOM':
	moka.style.setStyle(this.getElement(), {'width': '100%'});
	this.getResizeable().setMinHeight(this.getTabHeight());
	break;
    case 'LEFT':
    case 'RIGHT':
	moka.style.setStyle(this.getElement(), {'height': '100%'});
	// TO DO:
	//this.getResizeable().setMinHeight(this.getTabWidth());
	break;
    }    
}



/**
 * @inheritDoc
 */
moka.ui.ZipTabs.prototype.addTab = function(tabTitle) {
    goog.base(this, 'addTab', tabTitle);
    goog.array.forEach(this.getTabElements(), function(tab, i) { 
	goog.events.listen(tab, goog.events.EventType.MOUSEUP, function(event) {
	    window.console.log("HERE!");
	    this.onTabClicked_();
	}.bind(this))
    }.bind(this))
}
