/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure indcludes
 */
goog.require('goog.dom');
goog.require('goog.ui.ProgressBar');

/**
 * utils indcludes
 */
goog.require('utils.dom');
goog.require('utils.globals');

/**
 * viewer-widget includes
 */




/**
 * Modification of goog.ui.ProgressBar.
 *
 * @constructor
 */
utils.gui.ProgressBar = function (parent, args) { 
    var progBar = {};	
    


    //------------------
    // Make the Element
    //------------------
    progBar.element = utils.dom.makeElement('div', parent, 'ProgressElement', {
	position: 'absolute',
	marginLeft: '25%',
	width: '50%',
	marginTop : '50%'
    });
    


    //------------------ 
    // Label
    //------------------
    progBar.label = utils.dom.makeElement('div', progBar.element, 'ProgressBar_Label', {
	fontFamily: utils.globals.fontFamily,
	color: 'rgba(255,255,255)',
	fontSize: 11
    });
    progBar.label.innerHTML = 'Loading...'
    


    //------------------
    // Bar
    //------------------
    progBar.bar = utils.dom.makeElement('div', progBar.element, 'ProgressBar', {
	height: 10,
	borderRadius: 'none',
	position: 'relative',
	top: 5,
	//'backgroundColor': 'rgb(0,0,0)',
	'borderRadius': 0,
	'border': 'solid 1px rgba(125,125,125)',
	overflow: 'hidden'
    });	



    //------------------ 
    // Bar - style
    //------------------
    var pbgoog = new goog.ui.ProgressBar;
    pbgoog.decorate(progBar.bar);



    //------------------
    //  Color indicator
    //------------------
    var progChild = goog.dom.getElementByClass("progress-bar-thumb", progBar.element);
    utils.style.setStyle(progChild, {
    	'background': '#d4e4ff',
    	'borderRadius' : 0,
    	'border' : 'solid 1px rgb(180,180,180)',
    	'height' : '100%'
    });	
    

    
    //------------------
    // update
    //------------------
    progBar.update = function (args) {
	
	var isClear = (args['clear']) ? args['clear'] : false;
	var isMax = (args['max']) ? args['clear'] : false;
	var isAdd = (args['add']) ? args['add'] : false;		
	var isLabel = (args['label']) ? args['label'] : false;		
	
	if (isClear) {
	    pbgoog.setValue(0);
	}
	
	if (isMax) {
	    pbgoog.setMaximum(args['max']);
	}
	
	if (isAdd) {
	    pbgoog.setValue(pbgoog.getValue() + args['add']);
	}
	
	if (isLabel) {
	    progBar.label.innerHTML = args['label'];
	}		
	
    }
    
    progBar.hide = function () {
	goog.style.showElement(progBar.element, false);
    }
    
    progBar.show = function () {
	goog.style.showElement(progBar.element, true);
    }
    return progBar;
}


/**
 * Hides the progress bar accordingly.
 *
 * @expose
 * @override
 */
utils.gui.ProgressBar.prototype.hide = function() {
   return utils.gui.ProgressBar.superClass_.hide.call(this);
};