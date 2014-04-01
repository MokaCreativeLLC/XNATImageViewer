/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.DisplayAll');
goog.require('xiv.ui.ctrl.MasterOpacity');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.MasterController');
xiv.ui.ctrl.MasterController = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.Object>}
     * @private
     */
    this.xObjs_ = [];
}
goog.inherits(xiv.ui.ctrl.MasterController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.MasterController', xiv.ui.ctrl.MasterController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.MasterController.ID_PREFIX =  'xiv.ui.ctrl.MasterController';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterController.CSS_SUFFIX = {};



/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController.prototype.add = function(xObj) {
    window.console.log('MASTER CONTROLLER ADDING', xObj);

    this.xObjs_.push(xObj);

    if (this.xObjs_.length == 1){

	goog.dom.append(document.body, this.getElement());
	var displayAll =  new xiv.ui.ctrl.DisplayAll();
	goog.events.listen(displayAll, 
			   xiv.ui.ctrl.XtkController.EventType.CHANGE, 
			   function(e){
			       window.console.log("CHECK!", e.checked);
			   })



	var masterOpacity = new xiv.ui.ctrl.MasterOpacity();

	
	this.subControllers.push(displayAll);
	this.subControllers.push(masterOpacity);




	this.getElement().style.position = 'absolute';
	this.getElement().style.left = '10%';
	this.getElement().style.top = '30%';
	this.getElement().style.height = '200px';
	this.getElement().style.width = '200px';
	this.getElement().style.backgroundColor = 'rgba(20,200,20,1)';
	this.getElement().style.opacity = 1;
	this.getElement().style.zIndex = 4000;
	window.console.log('sub', this.getElement());


	goog.dom.append(this.getElement(), displayAll.getElement());
	goog.dom.append(this.getElement(), masterOpacity.getElement());
	//this.addMasterControls_();


	
    }
}


/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController.prototype.addMasterControls_ = goog.nullFunction;



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.MasterController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    goog.array.clear(this.xObjs_);
    delete this.xObjs_;

    window.console.log("need to implement dispose methods" + 
		       " for MasterController");
}



