/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.HsvPalette');

// xiv
goog.require('xiv.ui.ctrl.XtkController');




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
	    '_ColorPalette_' + goog.string.createUniqueString(),
	'class': xiv.ui.ctrl.ColorPaletteController.CSS.COLORSQUARE
    })
    this.setComponent(this.colorSquare_);
    goog.events.listen(this.colorSquare_, goog.events.EventType.CLICK, 
		       this.showColorPalette_.bind(this))


    /**
     * @type {!goog.ui.HsvPalette}
     * @private
     */    
    this.colorPalette_ = new goog.ui.HsvPalette();
    this.colorPalette_.render();
    //goog.dom.append(this.getElement(), this.colorPalette_.getElement());
    goog.events.listen(this.colorPalette_, goog.ui.Component.EventType.ACTION, 
		       this.dispatchComponentEvent.bind(this));

    

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
 * @public
 */
xiv.ui.ctrl.ColorPaletteController.CSS_SUFFIX = {
    COLORSQUARE: 'colorsquare',
    COLORPALETTEHOLDER: 'colorpaletteholder'
};



/**
 * @private
 */
xiv.ui.ctrl.ColorPaletteController.prototype.showColorPalette_ = function() {
    this.colorPaletteHolder_.style.visibility =
     (this.colorPaletteHolder_.style.visibility == 'hidden') ? 
	'visible' : 'hidden';

    window.console.log(this.colorPaletteHolder_.style.visibility);

    /**
    // Find the common ancestor
    var commonAncestor = 
    goog.dom.findCommonAncestor(this.colorPaletteHolder_, 
				this.getComponent());
    var boxPos = 
    goog.style.getRelativePosition(this.getComponent(), commonAncestor);

    window.console.log(commonAncestor);
    */

    goog.style.setPosition(this.colorPaletteHolder_, 
			   goog.style.getPageOffset(this.getComponent()));
    window.console.log(boxPos, goog.style.getPosition(this.colorPaletteHolder_))
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

    
    // Color Square
    goog.events.removeAll(this.colorSquare_);
    goog.dom.removeNode(this.colorSquare_);
    delete this.colorSquare_;


    // Color Palettte
    goog.events.removeAll(this.colorPalette_);
    this.colorPalette_.disposeInternal();
    delete this.colorPalette_;


    // Color Palette Holder
    goog.dom.removeNode(this.colorPaletteHolder_);
    delete this.colorPaletteHolder_;
}




