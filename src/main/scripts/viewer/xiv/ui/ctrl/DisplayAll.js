/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog

// xiv
goog.require('xiv.ui.ctrl.CheckboxController');




/**
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
xiv.ui.ctrl.DisplayAll = function(){
    goog.base(this);
    this.setLabel('Display All');
}

goog.inherits(xiv.ui.ctrl.DisplayAll, xiv.ui.ctrl.CheckboxController);
goog.exportSymbol('xiv.ui.ctrl.DisplayAll', xiv.ui.ctrl.DisplayAll);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.DisplayAll.ID_PREFIX =  'xiv.ui.ctrl.DisplayAll';



/**
 * @inheritDoc
 */
xiv.ui.ctrl.DisplayAll.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

}




