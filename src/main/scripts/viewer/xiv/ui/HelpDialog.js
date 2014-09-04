/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.HelpDialog');

// goog
goog.require('goog.dom.classes');
goog.require('goog.dom');
goog.require('goog.array');

// nrg
goog.require('nrg.ui.ScrollableZippyTree');
goog.require('nrg.ui.Dialog');

//-----------



/**
 * @param {boolean=} opt_showVolHelp Defaults to false.
 * @param {boolean=} opt_showMeshHelp Defaults to false.
 * @param {boolean=} opt_showAnnotHelp Defaults to false.
 * @constructor
 * @extends {nrg.ui.Dialog}
 */
xiv.ui.HelpDialog = 
function (opt_showVolHelp, opt_showMeshHelp, opt_showAnnotHelp) {
    goog.base(this);

    /**
     * @type {!boolean}
     * @private
     */
    this.showVolHelp_ = opt_showVolHelp === true;

    /**
     * @type {!boolean}
     * @private
     */
    this.showMeshHelp_ = opt_showMeshHelp === true;

    /**
     * @type {!boolean}
     * @private
     */
    this.showAnnotHelp_ = opt_showAnnotHelp === true;

    //window.console.log(this.showVolHelp_, 
    //this.showMeshHelp_, this.showAnnotHelp_)
}
goog.inherits(xiv.ui.HelpDialog, nrg.ui.Dialog);
goog.exportSymbol('xiv.ui.HelpDialog', xiv.ui.HelpDialog);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.HelpDialog.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.HelpDialog.ID_PREFIX =  'xiv.ui.HelpDialog';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.HelpDialog.CSS = {
    DIALOG: 'nrg-ui-helpdialog-dialog',
    TEXT: 'nrg-ui-helpdialog-text',
    SCROLLABLEZIPPYTREE: 'xiv-ui-helpdialog-scrollablezippytree',
    TITLE: 'xiv-ui-helpdialog-title',
    CLOSEBUTTON: 'xiv-ui-helpdialog-closebutton',
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.HelpDialog.LAYOUT_IMAGE_ID =  xiv.ui.HelpDialog.ID_PREFIX + 
    '.LayoutImage';


/**
 * @private
 * @type {?nrg.ui.ScrollableZippyTree}
 */
xiv.ui.HelpDialog.prototype.ScrollableZippyTree_;



/**
 * @inheritDoc
 */
xiv.ui.HelpDialog.prototype.render = function(opt_parentElement){
    goog.base(this, 'render', opt_parentElement);

    goog.dom.classes.add(this.getElement(), 'xiv-ui-helpdialog');


    this.ScrollableZippyTree_ = new nrg.ui.ScrollableZippyTree();

    goog.dom.classes.add(this.ScrollableZippyTree_.getElement(), 
			 xiv.ui.HelpDialog.CSS.SCROLLABLEZIPPYTREE);

    this.ScrollableZippyTree_.render(this.getElement());

    this.populateZippy_();

    //window.console.log("HERE", xiv.ui.HelpDialog.CSS.TITLE);
    this.addTitleClass(xiv.ui.HelpDialog.CSS.TITLE);
    this.addCloseSpanClass(xiv.ui.HelpDialog.CSS.CLOSEBUTTON);

    //goog.dom.removeNode(this.ScrollableZippyTree_.getElement());
    //this.setContent(this.ScrollableZippyTree_.getElement());
    //window.console.log("HERE", this.ScrollableZippyTree_.getElement());
}



/**
 * @public
 * @param {!string} buttonSrc
 */
xiv.ui.HelpDialog.prototype.setLayoutButton = function(buttonSrc){
    var icon = document.getElementById(xiv.ui.HelpDialog.LAYOUT_IMAGE_ID);
    
    if (goog.isDefAndNotNull(icon)){
	document.getElementById(xiv.ui.HelpDialog.LAYOUT_IMAGE_ID).src = 
	    buttonSrc;
    }
}



/**
 * @private
 */
xiv.ui.HelpDialog.prototype.populateZippy_ = function(){
   //
    // Generate widget text
    //    
    var imageManipLines = [
	/*
	['Zoom', 'keystroke \'Z\'<br>Zoom In ' + 
	 '(drag up)<br>Zoom Out (drag down)', '2D and 3D panels'],
	['Pan', 'middle-click + drag<br>ctrl + left-click + drag' +
	  '<br>ctrl + right-click + drag', 
	 '2D and 3D panels<br>2D panels<br>2D panels'],
	['Contrast', 'left-click + drag vertically', '2D panels'],
	['Brightness', 'left-click + drag horizontally', '2D panels'],
	['Slice-scroll', 'shift + mousemove', '2D panels'],
	*/
	['Resize', 'left-click + drag', 'panel borders'],
    ]
    
    var viewboxManip = [
	['Close ViewBox', 
	 '<img style="height:10px;width:10px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/close.png'
	 + '"></img>'
	],
	['Add ViewBox Column', 
	 '<img style="height:12px;width:6px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/insertcolumn.png'
	 + '"></img>'
	],
	['Add ViewBox Row', 
	 '<img style="height:6px;width:12px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/insertrow.png'
	 + '"></img>'
	],
	['Drag/Swap ViewBox', 
	 '<img style="height:17px;width:7px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBoxManager/handle.png'
	 + '"></img>'
	],
    ]

    var viewboxToggles = [
	['Change Layouts', 
	 ' ',
	 '<img height=15 width=15 ' + 
	 'id=' + xiv.ui.HelpDialog.LAYOUT_IMAGE_ID + 
	 '></img>'],

	['Help', 
	 'keystroke: ?',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png'
	 + '"></img>'],


	['Info. Metadata', 
	 'keystroke: I',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Info.png'
	 + '"></img>'	 
	],


	['Settings', 
	 'keystroke: S',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-Settings.png'
	 + '"></img>'	 
	],

	['Levels', 
	 'keystroke: B or L',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-Levels.png'
	 + '"></img>'	 
	],


	['2D Pan', 
	 'keystroke: H or P',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-2DPan.png'
	 + '"></img>'	 
	],


	['2D Zoom', 
	 'keystroke: Z',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-2DZoom.png'
	 + '"></img>'	 
	],


	['2D Crosshairs', 
	 'keystroke: C',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png'
	 + '"></img>'],
    ]


    if (this.showVolHelp_){
	viewboxToggles.push(['Volumes', 
	 'keystroke: V',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-Volumes.png'
	 + '"></img>'	 
	])
    }

    if (this.showMeshHelp_){
	viewboxToggles.push(['Meshes', 
	 'keystroke: M',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-Meshes.png'
	 + '"></img>'	 
	])
    }

    if (this.showAnnotHelp_){
	viewboxToggles.push(['Annotations', 
	 'keystroke: A',
	 '<img style="height:15px;width:15px" src="' +
	 serverRoot + 
	 '/images/viewer/xiv/ui/ViewBox/Toggle-Annotations.png'
	 + '"></img>'	 
	])
    }
    


    var modalToggles = [
	['Close XImgView', 
	 '<img style="height:10px;width:10px" src="' +
	 serverRoot + '/images/viewer/xiv/ui/Modal/close.png'
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
    this.setTitle('Help');


    var allLines = [
	imageManipLines, 
	viewboxManip,
	viewboxToggles, 
	modalToggles
    ];
    goog.array.forEach(allLines, function(lineArr, i){
	
	var currTable = '<table style="margin-left:10%;width:90%;' + 
	    'color:white;left:10%;" RULES=ROWS FRAME=HSIDES ' + 
	    ' BORDERCOLOR="black">';

	goog.array.forEach(lineArr, function(line){
	    currTable += '<tr>'
	    goog.array.forEach(line, function(cell, i){

		switch (i) {
		case 0:
		    cell = '<b><font size="1">' + cell + '</font></b>';
		    break;
		case 1:
		    cell = '<i><font size="1">' + cell + '</font></i>';
		    break;
		default:
		    cell = '<font size="1">' + cell + '</font>';
		}
		currTable += '<td height=25>' + cell + '</td>';
	    })
	    currTable += '</tr>';
	})

	currTable += '</table>';
	//
	// Add text and render
	//
	//this.addText(currTable);

	//var lastAddedText = this.getTextElements()[i+1];
	//window.console.log(lastAddedText)
	//goog.dom.classes.add(lastAddedText, 
	//xiv.ui.HelpDialog.CSS.TEXT);

	var folderName;
	currText = i+1;
	switch(currText){
	    case 1:
	    folderName = 'Images';
	    break;
	    case 2:
	    folderName = 'ViewBox Manipulation';
	    break;
	    case 3:
	    folderName = 'ViewBox Toggles';
	    break;
	    case 4:
	    folderName = 'Modal';
	    break;
	}
	//lastAddedText.style.top = '0px';

	goog.dom.removeNode(currTable);
	//this.ScrollableZippyTree_.getSlider().bindToMouseWheel(currTable);

	var contents = goog.dom.createDom('div');
	contents.innerHTML = currTable;
	this.ScrollableZippyTree_.addContents(contents, [folderName]);
    }.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.HelpDialog.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    delete this.showVolHelp_;
    delete this.showMeshHelp_;
    delete this.showAnnotHelp_;


    //
    // Scrollable zippy tree
    //
    if (goog.isDefAndNotNull(this.ScrollableZippyTree_)){
	this.ScrollableZippyTree_.dispose();
    }
}


goog.exportSymbol('xiv.ui.HelpDialog.EventType', xiv.ui.HelpDialog.EventType);
goog.exportSymbol('xiv.ui.HelpDialog.ID_PREFIX', xiv.ui.HelpDialog.ID_PREFIX);
goog.exportSymbol('xiv.ui.HelpDialog.LAYOUT_IMAGE_ID',
	xiv.ui.HelpDialog.LAYOUT_IMAGE_ID);
goog.exportSymbol('xiv.ui.HelpDialog.CSS_SUFFIX',
	xiv.ui.HelpDialog.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.HelpDialog.prototype.render',
	xiv.ui.HelpDialog.prototype.render);
goog.exportSymbol('xiv.ui.HelpDialog.prototype.setLayoutButton',
	xiv.ui.HelpDialog.prototype.setLayoutButton);
goog.exportSymbol('xiv.ui.HelpDialog.prototype.disposeInternal',
	xiv.ui.HelpDialog.prototype.disposeInternal);
