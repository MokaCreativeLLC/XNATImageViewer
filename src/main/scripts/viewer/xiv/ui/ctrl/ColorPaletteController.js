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


    

    /**
     * @type {!goog.ui.Popup}
     * @private
     */
    this.popup_ = new goog.ui.Popup(this.colorPaletteHolder_);
    this.popup_.setHideOnEscape(true);
    this.popup_.setAutoHide(true);
    this.popup_.setVisible(false);
    //goog.dom.append(this.popup_.getElement(), this.colorPaletteHolder_);
    
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
xiv.ui.ctrl.ColorPaletteController.prototype.showColorPalette_ = function(){
 

    //goog.events.listen(window, goog.events.EventType.RESIZE, onResize);
    //goog.events.listen(document, goog.events.EventType.MOUSEMOVE, onMouseMove);
    // goog.events.listen(absBox, goog.events.EventType.MOUSEOUT,
    // onAbsBoxMouseOut);


    /**
      var btn = document.getElementById('btn');
      var buttonCorner = toCorner(
          getCheckedValue(document.forms[0].elements['button_corner']));
      var menuCorner = toCorner(
          getCheckedValue(document.forms[0].elements['menu_corner']));

      var t = parseInt(document.getElementById('margin_top').value);
      var r = parseInt(document.getElementById('margin_right').value);
      var b = parseInt(document.getElementById('margin_bottom').value);
      var l = parseInt(document.getElementById('margin_left').value);
      var margin = new goog.math.Box(t, r, b, l);
    */

      ///popup.setVisible(false);
      //popup.setPinnedCorner(menuCorner);
      //popup.setMargin(margin);
      //popup.setPosition(new goog.positioning.AnchoredViewportPosition(btn,
      //    buttonCorner));

    window.console.log(this.colorPaletteHolder_, this.popup_.getElement());
    window.console.log("SHOW COLOR PALETTE");
    this.popup_.setVisible(true);
}



/**
 * @inheritDoc
 */
xiv.ui.ctrl.ColorPaletteController.prototype.dispatchComponentEvent = 
function(e){

    window.console.log("COLOR SELECTED", e.target.getColor());
    window.console.log("RGB", 
		    goog.color.hexToRgb(e.target.getColor()).map(
			function(x) { 
			    return x / 255; 
			}))
    this.colorSquare_.style.backgroundColor = e.target.getColor();


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




