/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.ColorPaletteController');

// goog
goog.require('goog.ui.HsvPalette');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.color');

// xiv
goog.require('xiv.ui.ctrl.XtkController');

//-----------




/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.ColorPaletteController = function(){
    goog.base(this);

    this.setLabel('Color');



    /**
     * @type {!Element}
     * @private
     */
    this.colorSquare_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + 
	    '_ColorSquare_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.ColorPaletteController.CSS.COLORSQUARE
    })
    goog.dom.append(this.getElement(), this.colorSquare_);
    goog.events.listen(this.colorSquare_, goog.events.EventType.CLICK, 
    this.showColorPalette_.bind(this));



    /**
     * @type {!goog.ui.HsvPalette}
     * @private
     */    
    this.colorPalette_ = new goog.ui.HsvPalette();
    this.colorPalette_.render();
    //goog.dom.append(this.getElement(), this.colorPalette_.getElement());
    goog.events.listen(this.colorPalette_, goog.ui.Component.EventType.ACTION, 
		       this.dispatchComponentEvent.bind(this));
    this.setComponent(this.colorPalette_);
    goog.dom.classes.add(this.colorPalette_.getElement(), 
			 this.constructor.CSS.COLORPALETTE);
    

    /**
     * @type {!Element}
     * @private
     */
    this.colorPaletteHolder_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + 
	    '_ColorPaletteHolder_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.ColorPaletteController.CSS.COLORPALETTEHOLDER
    })
    goog.dom.append(document.body, this.colorPaletteHolder_);
    goog.dom.append(this.colorPaletteHolder_, this.colorPalette_.getElement());
    this.colorPaletteHolder_.style.visibility = 'hidden';


    /**
     * @type {!Element}
     * @private
     */
    this.closeButton_ = goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + 
	    '_CloseButton_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.ColorPaletteController.CSS.CLOSEBUTTON
    })
    goog.dom.append(this.colorPaletteHolder_, this.closeButton_);
    goog.events.listen(this.closeButton_, goog.events.EventType.CLICK, 
		       this.showColorPalette_.bind(this))
}

goog.inherits(xiv.ui.ctrl.ColorPaletteController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController', 
xiv.ui.ctrl.ColorPaletteController);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.ColorPaletteController.ID_PREFIX =  
    'xiv.ui.ctrl.ColorPaletteController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.ctrl.ColorPaletteController.CSS_SUFFIX = {
    COLORSQUARE: 'colorsquare',
    COLORPALETTEHOLDER: 'colorpaletteholder',
    COLORPALETTE: 'colorpalette',
    CLOSEBUTTON: 'closebutton'
};



/**
 * @const
 */
xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_X = 20;



/**
 * @const
 */
xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_Y = 20;



/**
 * @private
 */
xiv.ui.ctrl.ColorPaletteController.prototype.showColorPalette_ = function() {

    this.colorPaletteHolder_.style.visibility =
     (this.colorPaletteHolder_.style.visibility == 'hidden') ? 
	'visible' : 'hidden';

    var offset = goog.style.getPageOffset(this.colorSquare_);
    var colorSquareSize = goog.style.getSize(this.colorSquare_);
    var panelSize = goog.style.getSize(this.colorPaletteHolder_);

    var prelimX = offset.x + colorSquareSize.width + 
	xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_X;
    var prelimY = offset.y - 
	xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_Y;
    
    var screenH = parseInt(window.innerHeight);
    var screenW = parseInt(window.innerWidth);
    
    //window.console.log(screenH, prelimY, panelSize.height);

    if ((prelimY + panelSize.height) > screenH) {
	prelimY -= (prelimY + panelSize.height) - screenH;
    }

    goog.style.setPosition(this.colorPaletteHolder_, 
			   prelimX, prelimY);
}




/**
 * @inheritDoc
 */
xiv.ui.ctrl.ColorPaletteController.prototype.update = function() {
    var r = Math.floor(
	this[xiv.ui.ctrl.XtkController.OBJ_KEY].color[0] * 255);
    var g = Math.floor(this[xiv.ui.ctrl.XtkController.OBJ_KEY].color[1] * 255);
    var b = Math.floor(this[xiv.ui.ctrl.XtkController.OBJ_KEY].color[2] * 255);

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    this.getComponent().setColor(goog.color.rgbArrayToHex([r,g,b]))
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.ColorPaletteController.prototype.dispatchComponentEvent = 
function(e){

    // Set the colorSquare color
    this.colorSquare_.style.backgroundColor = e.target.getColor();

    // Dispatch event
    this.dispatchEvent({
	type: xiv.ui.ctrl.XtkController.EventType.CHANGE,
	color: goog.color.hexToRgb(e.target.getColor()).map( function(x) { 
	    return x / 255; 
	})
    })
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.ColorPaletteController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Close button
    goog.events.removeAll(this.closeButton_);
    goog.dom.removeNode(this.closeButton_);
    delete this.closeButton_;


    // Color Square
    goog.events.removeAll(this.colorSquare_);
    goog.dom.removeNode(this.colorSquare_);
    delete this.colorSquare_;


    // Color Palettte
    goog.events.removeAll(this.colorPalette_);
    this.colorPalette_.dispose();
    delete this.colorPalette_;


    // Color Palette Holder
    goog.dom.removeNode(this.colorPaletteHolder_);
    delete this.colorPaletteHolder_;
}



goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController.ID_PREFIX',
	xiv.ui.ctrl.ColorPaletteController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController.CSS_SUFFIX',
	xiv.ui.ctrl.ColorPaletteController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_X',
	xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_X);
goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_Y',
	xiv.ui.ctrl.ColorPaletteController.PANEL_MARGIN_Y);
goog.exportSymbol('xiv.ui.ctrl.ColorPaletteController.prototype.update',
	xiv.ui.ctrl.ColorPaletteController.prototype.update);
goog.exportSymbol(
    'xiv.ui.ctrl.ColorPaletteController.prototype.dispatchComponentEvent',
    xiv.ui.ctrl.ColorPaletteController.prototype.dispatchComponentEvent);
goog.exportSymbol(
    'xiv.ui.ctrl.ColorPaletteController.prototype.disposeInternal',
    xiv.ui.ctrl.ColorPaletteController.prototype.disposeInternal);



