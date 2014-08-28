/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ColorPaletteController');

// goog
goog.require('goog.ui.HsvPalette');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.color');

// xiv
goog.require('xiv.ui.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.ColorPaletteController = function(){
    goog.base(this);

    this.setLabel('Color');



    /**
     * @type {!goog.ui.HsvPalette}
     * @private
     */    
    this.colorPalette_ = new goog.ui.HsvPalette();
    this.colorPalette_.render();
    //goog.dom.append(this.getElement(), this.colorPalette_.getElement());
    goog.events.listen(this.colorPalette_, goog.ui.Component.EventType.ACTION, 
		       this.dispatchComponentEvent.bind(this));
    goog.dom.classes.add(this.colorPalette_.getElement(), 
			 this.constructor.CSS.COLORPALETTE);
    

    /**
     * @type {!Element}
     * @private
     */
    this.colorPaletteHolder_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + 
	    '_ColorPaletteHolder_' + goog.string.createUniqueString(),
	'class': xiv.ui.ColorPaletteController.CSS.COLORPALETTEHOLDER
    })
    goog.dom.append(this.colorPaletteHolder_, this.colorPalette_.getElement());



    /**
     * @type {!Element}
     * @private
     */
    this.mainElement_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + 
	    '_ColorPalette_' + goog.string.createUniqueString(),
	'class': xiv.ui.ColorPaletteController.CSS.ELEMENT_PREFIX
    })
    
    //goog.dom.appendChild(this.mainElement_, this.colorSquare_);
    goog.dom.appendChild(this.getElement(), this.colorPaletteHolder_);
    //goog.dom.appendChild(this.getElement(), this.mainElement_);

    this.setComponent(this.colorPaletteHolder_);
    //this.setFolder('color');

}

goog.inherits(xiv.ui.ColorPaletteController, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.ColorPaletteController', 
xiv.ui.ColorPaletteController);



/**
 * @const
 * @public
 */
xiv.ui.ColorPaletteController.ID_PREFIX =  
    'xiv.ui.ColorPaletteController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ColorPaletteController.CSS_SUFFIX = {
    COLORSQUARE: 'colorsquare',
    COLORPALETTEHOLDER: 'colorpaletteholder',
    COLORPALETTE: 'colorpalette',
    CLOSEBUTTON: 'closebutton'
};



/**
 * @const
 */
xiv.ui.ColorPaletteController.PANEL_MARGIN_X = 20;



/**
 * @const
 */
xiv.ui.ColorPaletteController.PANEL_MARGIN_Y = 20;



/**
 * @inheritDoc
 */
xiv.ui.ColorPaletteController.prototype.refresh = function() {
    var r = Math.floor(
	this[xiv.ui.XtkController.OBJ_KEY].color[0] * 255);
    var g = Math.floor(this[xiv.ui.XtkController.OBJ_KEY].color[1] * 255);
    var b = Math.floor(this[xiv.ui.XtkController.OBJ_KEY].color[2] * 255);

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    this.colorPalette_.setColor(goog.color.rgbArrayToHex([r,g,b]))
}



/**
 * @inheritDoc
 */
xiv.ui.ColorPaletteController.prototype.dispatchComponentEvent = 
function(e){

    // Set the colorSquare color
    //this.colorSquare_.style.backgroundColor = e.target.getColor();

    // Dispatch event
    this.dispatchEvent({
	type: xiv.ui.XtkController.EventType.CHANGE,
	color: goog.color.hexToRgb(e.target.getColor()).map( function(x) { 
	    return x / 255; 
	})
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ColorPaletteController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Color Palettte
    goog.events.removeAll(this.colorPalette_);
    this.colorPalette_.dispose();
    delete this.colorPalette_;


    // Color Palette Holder
    goog.dom.removeNode(this.colorPaletteHolder_);
    delete this.colorPaletteHolder_;
}



goog.exportSymbol('xiv.ui.ColorPaletteController.ID_PREFIX',
	xiv.ui.ColorPaletteController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ColorPaletteController.CSS_SUFFIX',
	xiv.ui.ColorPaletteController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ColorPaletteController.PANEL_MARGIN_X',
	xiv.ui.ColorPaletteController.PANEL_MARGIN_X);
goog.exportSymbol('xiv.ui.ColorPaletteController.PANEL_MARGIN_Y',
	xiv.ui.ColorPaletteController.PANEL_MARGIN_Y);
goog.exportSymbol('xiv.ui.ColorPaletteController.prototype.refresh',
	xiv.ui.ColorPaletteController.prototype.refresh);
goog.exportSymbol(
    'xiv.ui.ColorPaletteController.prototype.dispatchComponentEvent',
    xiv.ui.ColorPaletteController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.ColorPaletteController.prototype.disposeInternal',
    xiv.ui.ColorPaletteController.prototype.disposeInternal);



