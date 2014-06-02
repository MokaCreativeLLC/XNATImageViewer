/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog


// nrg
goog.require('nrg.ui.ScrollableZippyTree');
goog.require('nrg.ui.Overlay');



/**
 * @constructor
 * @extends {nrg.ui.Overlay}
 */
goog.provide('xiv.ui.HelpOverlay');
xiv.ui.HelpOverlay = function () {
    goog.base(this);
}
goog.inherits(xiv.ui.HelpOverlay, nrg.ui.Overlay);
goog.exportSymbol('xiv.ui.HelpOverlay', xiv.ui.HelpOverlay);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.HelpOverlay.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.HelpOverlay.ID_PREFIX =  'xiv.ui.HelpOverlay';



/**
 * @enum {string}
 * @public
 */
xiv.ui.HelpOverlay.CSS= {
    OVERLAY: 'nrg-ui-helpoverlay-overlay',
    TEXT: 'nrg-ui-helpoverlay-text',
    SCROLLABLEZIPPYTREE: 'nrg-ui-helpoverlay-scrollablezippytree'
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID =  xiv.ui.HelpOverlay.ID_PREFIX + 
    '.LayoutImage';


/**
 * @private
 * @type {?nrg.ui.ScrollableZippyTree}
 */
xiv.ui.HelpOverlay.prototype.ScrollableZippyTree_;



/**
 * @inheritDoc
 */
xiv.ui.HelpOverlay.prototype.render = function(opt_parentElement){

    //this.addCloseButton();
    this.addBackground();
    this.getBackground().style.backgroundColor = 'rgba(80,80,80,.8)';


    goog.base(this, 'render', opt_parentElement);

    goog.dom.classes.add(this.getOverlay(), 
			 this.constructor.CSS.OVERLAY);


    this.ScrollableZippyTree_ = new nrg.ui.ScrollableZippyTree();


    goog.dom.classes.add(this.ScrollableZippyTree_.getElement(), 
			 this.constructor.CSS.SCROLLABLEZIPPYTREE);



    this.ScrollableZippyTree_.render(this.getOverlay());


    this.addContents_();
}



/**
 * @public
 * @param {!string} buttonSrc
 */
xiv.ui.HelpOverlay.prototype.setLayoutButton = function(buttonSrc){
    var icon = document.getElementById(xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID);
    
    if (goog.isDefAndNotNull(icon)){
	document.getElementById(xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID).src = 
	    buttonSrc;
    }
}



/**
 * @private
 */
xiv.ui.HelpOverlay.prototype.addContents_ = function(){
   //
    // Generate widget text
    //    
    var imageManipLines = [
	['Zoom', 'right-click + drag', '2D and 3D panels'],
	['Reposition', 'middle-click + drag', '2D and 3D panels'],
	['Slice-scroll', 'shift + mousemove', '2D panels'],
	['Contrast', 'left-click + drag horizontally', '2D panels'],
	['Brightness', 'left-click + drag vertically', '2D panels'],
	['Resize', 'left-click + drag', 'panel borders'],
    ]
    
    var viewboxToggles = [
	['Change Layouts', '<img height=15 width=15 ' + 
	 'id=' + xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID + 
	 '></img>'],
	['3D Rendering', 
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-3D.png'
	 + '"></img>'	 
	],
	['Crosshairs', 
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png'
	 + '"></img>'	 
	],
	['Help', 
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png'
	 + '"></img>'	 
	],
	['Info. Metadata', 
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Info.png'
	 + '"></img>'	 
	],
    ]

    var modalToggles = [
	['Add ViewBox Row', 
	 '<img style="height:6px;width:12px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/insertrow.png'
	 + '"></img>'
	],
	['Remove ViewBox Row', 
	 '<img style="height:6px;width:12px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/removerow.png'
	 + '"></img>'
	],
	['Add ViewBox Column', 
	 '<img style="height:12px;width:6px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/insertcolumn.png'
	 + '"></img>'
	],
	['Remove ViewBox Column',
	 '<img style="height:12px;width:6px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/removecolumn.png'
	 + '"></img>'
	],
	['Full-screen view', 
	 '<img style="height:12px;width:12px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/fullscreen.png'
	 + '"></img>'
	],
	['Pop-up view',
	 '<img style="height:12px;width:12px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/popup.png'
	 + '"></img>'
	]
    ]

    //
    // Help Text
    //
    var helpText = "<b>HELP</b><br><br>";
    this.addText(helpText);
    goog.dom.classes.add(this.getTextElements()[0], 
			 this.constructor.CSS.TEXT);

    //
    //
    //
    this.getTextElements()[0].style.height = '15px';
    this.ScrollableZippyTree_.getSlider().bindToMouseWheel(
	this.getTextElements()[0]);

    var allLines = [imageManipLines, viewboxToggles, modalToggles];
    goog.array.forEach(allLines, function(lineArr, i){

	var currTable = '<table style="width:100%;' + 
	    'color:white;" RULES=ROWS FRAME=HSIDES ' + 
	    ' BORDERCOLOR="gray">';

	goog.array.forEach(lineArr, function(line){
	    currTable += '<tr>'
	    goog.array.forEach(line, function(cell, i){

		switch (i) {
		case 0:
		    cell = '<b><font size="3">' + cell + '</font></b>';
		    break;
		case 1:
		    cell = '<i><font size="2">' + cell + '</font></i>';
		    break;
		default:
		    cell = '<font size="2">' + cell + '</font>';
		}
		currTable += '<td height=25>' + cell + '</td>';
	    })
	    currTable += '</tr>';
	})

	currTable += '</table>';
	//
	// Add text and render
	//
	this.addText(currTable);

	var lastAddedText = this.getTextElements()[i+1];
	//window.console.log(lastAddedText)
	goog.dom.classes.add(lastAddedText, 
			     this.constructor.CSS.TEXT);

	var folderName;
	currText = i+1;
	switch(currText){
	    case 1:
	    folderName = 'Image Manipulation';
	    break;
	    case 2:
	    folderName = 'ViewBox Toggles';
	    break;
	    case 3:
	    folderName = 'Modal Toggles';
	    break;
	}
	lastAddedText.style.top = '0px';

	goog.dom.removeNode(lastAddedText);
	this.ScrollableZippyTree_.getSlider().bindToMouseWheel(lastAddedText);
	this.ScrollableZippyTree_.addContents(lastAddedText, [folderName]);
    }.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.HelpOverlay.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    //
    // Scrollable zippy tree
    //
    if (goog.isDefAndNotNull(this.ScrollableZippyTree_)){
	this.ScrollableZippyTree_.dispose();
    }
}


goog.exportSymbol('xiv.ui.HelpOverlay.EventType',
	xiv.ui.HelpOverlay.EventType);
goog.exportSymbol('xiv.ui.HelpOverlay.ID_PREFIX',
	xiv.ui.HelpOverlay.ID_PREFIX);
goog.exportSymbol('xiv.ui.HelpOverlay.CSS_SUFFIX',
	xiv.ui.HelpOverlay.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID',
	xiv.ui.HelpOverlay.LAYOUT_IMAGE_ID);
goog.exportSymbol('xiv.ui.HelpOverlay.prototype.constructor',
	xiv.ui.HelpOverlay.prototype.constructor);
goog.exportSymbol('xiv.ui.HelpOverlay.prototype.render',
	xiv.ui.HelpOverlay.prototype.render);
goog.exportSymbol('xiv.ui.HelpOverlay.prototype.setLayoutButton',
	xiv.ui.HelpOverlay.prototype.setLayoutButton);
goog.exportSymbol('xiv.ui.HelpOverlay.prototype.disposeInternal',
	xiv.ui.HelpOverlay.prototype.disposeInternal);
