/** 
* @author kumar.sunil.p@gmail.com (Sunil Kumar)
* @author amh1646@rit.edu (Amanda Hartung)
*/
goog.provide('xiv.ui.Thumbnail');

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.classes');
goog.require('goog.array');
goog.require('goog.events');

// nrg
goog.require('nrg.ui.Thumbnail');

// gxnat
goog.require('gxnat.vis.ViewableTree');

//-----------



/**
 * xiv.ui.Thumbnail is the parent class of Slicer and Dicom thumbnails.
 * @constructor
 * @param {gxnat.vis.ViewableTree} Viewable_ The properties that 
 *    define the XNAT-specific thumbnail
 * @extends {nrg.ui.Thumbnail}
 */
xiv.ui.Thumbnail = function (Viewable_) {
    goog.base(this);

    //
    // Default silhouette
    //
    this.setBrokenThumbnailUrl(serverRoot +
	'/images/viewer/xiv/ui/Thumbnail/silhouette.png')


    /**
     * @type {gxnat.vis.ViewableTree}
     * @private
     */    
    this.ViewableTree_ = Viewable_;

    this.createText_();



}
goog.inherits(xiv.ui.Thumbnail, nrg.ui.Thumbnail);
goog.exportSymbol('xiv.ui.Thumbnail', xiv.ui.Thumbnail);



/**
 * @type {!string} 
 * @expose
*/
xiv.ui.Thumbnail.ID_PREFIX =  'xiv.ui.Thumbnail';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.Thumbnail.CSS_SUFFIX = {
    HOVERINFO: 'hoverinfo',
    HOVERINFO_ARROW: 'hoverinfo-arrow',
    HOVERINFO_ARROWTOP: 'hoverinfo-arrowtop',
    HOVERINFO_ARROWBOTTOM: 'hoverinfo-arrowbottom',
    HOVERINFO_APPEAR: 'hoverinfo-appear',
    HOVERINFO_DISAPPEAR: 'hoverinfo-disappear',
    INFOHOVERTEXT: 'infohovertext',
    IMAGE: 'image',
    TEXT: 'image'
};



/**
 * @type {!Element}
 * @private  
 */
xiv.ui.Thumbnail.prototype.infoHoverText_ = null;


/**
 * @type {!Element}
 * @private  
 */
xiv.ui.Thumbnail.prototype.infoDiv_ = null;


/**
 * @type {!Element}
 * @private  
 */
xiv.ui.Thumbnail.prototype.infoHoverArrow_ = null;




/**
 * Creates the text associated with the thumbnail.
 * @private
 */
xiv.ui.Thumbnail.prototype.createText_ = function(){
    //window.console.log(this.ViewableTree_);

    //
    // Derive the header text
    //
    var headerText = '';


    //
    // Checking the sessionInfo property (most ideal option) to make header.
    //
    var treeSessionInfo = this.ViewableTree_.getSessionInfo();

    //window.console.log("TREE", treeSessionInfo);

    if (goog.isDefAndNotNull(treeSessionInfo['Scan ID'])){
	headerText += treeSessionInfo['Scan ID'];
    } 
    else if (goog.isDefAndNotNull(treeSessionInfo['Name'])){
	headerText = treeSessionInfo['Name'];
    }

    //
    // Otherwise, by splitting the URL (less ideal option).
    //
    else if (goog.isDefAndNotNull(this.ViewableTree_.getQueryUrl())){
	var splitArr = this.ViewableTree_.getQueryUrl().split("/");
	headerText += splitArr[splitArr.length - 1].split(".")[0];
    }


    //
    // Construct display text
    //
    var displayText =  '';
    displayText += "<b><font size = '3'>" + headerText  + "</font></b><br>";

    //
    // Other metadata to display
    //
    var metaDisplayKeys = ['Total Frames', 'Scan Type', 'Orientation'];
    goog.array.forEach(metaDisplayKeys, function(key){
	if (goog.isDefAndNotNull(treeSessionInfo[key])){
	    displayText += "<font size = '1.5'>" + key + ": " + 
		treeSessionInfo[key]  + "<br>";
	}
    }.bind(this))

    //
    // Set the text
    //
    this.setText(displayText);


    this.createInfoHover_();
}




/**
 * @private  
 */
xiv.ui.Thumbnail.prototype.createInfoHover_ = function(){

    this.infoHoverText_ = goog.dom.createDom('div',{
	'id': 'MetdataLink_' + goog.string.createUniqueString(),
    }, "more...")
    goog.dom.classes.add(this.infoHoverText_, 
			 xiv.ui.Thumbnail.CSS.INFOHOVERTEXT);
    goog.dom.append(this.getElement(), this.infoHoverText_);

    goog.dom.classes.add(this.getElement(), 'xiv-ui-thumbnail');
    goog.dom.classes.add(this.getImage(), xiv.ui.Thumbnail.CSS.IMAGE);

    
    this.infoDiv_ = goog.dom.createDom('div',{
	'id': 'InfoHover_' + goog.string.createUniqueString(),
    })
    goog.dom.classes.add(this.infoDiv_, xiv.ui.Thumbnail.CSS.HOVERINFO);
    goog.dom.append(goog.dom.getElementsByClass('xiv-ui-modal')[0], 
		    this.infoDiv_);


    this.infoHoverArrow_ = goog.dom.createDom('div',{
	'id': 'InfoHoverArrow_' + goog.string.createUniqueString(),
    })
    goog.dom.classes.add(this.infoHoverArrow_, 
			 xiv.ui.Thumbnail.CSS.HOVERINFO_ARROW);
    goog.dom.append(this.infoDiv_.parentNode, this.infoHoverArrow_);

    var arrowBottom = goog.dom.createDom('div',{
	'id': 'InfoHoverArrowBottom_' + goog.string.createUniqueString(),
    })
    goog.dom.classes.add(arrowBottom, 
			 xiv.ui.Thumbnail.CSS.HOVERINFO_ARROWBOTTOM);
    goog.dom.append(this.infoHoverArrow_, arrowBottom);

    var arrowTop = goog.dom.createDom('div',{
	'id': 'InfoHoverArrowTop_' + goog.string.createUniqueString(),
    })
    goog.dom.classes.add(arrowTop, 
			 xiv.ui.Thumbnail.CSS.HOVERINFO_ARROWTOP);
    goog.dom.append(this.infoHoverArrow_, arrowTop);




    this.infoDiv_.innerHTML = this.getViewable().getSessionInfoAsHtml();

    goog.array.forEach([this.infoDiv_, this.infoHoverArrow_], function(elt){
	elt.style.opacity = 0;
	elt.style.visibility = 'hidden';
    })

    goog.events.listen(
	this.infoHoverText_,
	goog.events.EventType.MOUSEENTER, 
	this.showInfo.bind(this))

    goog.events.listen(
	this.infoHoverText_,
	goog.events.EventType.MOUSELEAVE, 
	this.hideInfo.bind(this))
}



/**
 * @public
 */
xiv.ui.Thumbnail.prototype.showInfo = function(){

    var abs = 
	goog.style.getRelativePosition(this.getElement(), 
				       this.infoDiv_.parentNode);

    /*
    goog.dom.classes.remove(this.infoDiv_, 
			    xiv.ui.Thumbnail.CSS.HOVERINFO_DISAPPEAR);
    goog.dom.classes.add(this.infoDiv_,
			 xiv.ui.Thumbnail.CSS.HOVERINFO_APPEAR);
    */

    //this.infoHoverArrow_.style.opacity = 1;


    goog.array.forEach([this.infoDiv_, this.infoHoverArrow_], function(elt){
	elt.style.visibility = 'visible';
    })  

    //
    // Positions the infoDiv to be in screen
    //
    var infoDivY = abs.y - 13;
    if ((infoDivY + this.infoDiv_.offsetHeight) > window.innerHeight){
	infoDivY = window.innerHeight - 
	    goog.style.getSize(this.infoDiv_).height;
    } 
    else if (infoDivY < 0){
	infoDivY = 2;
    }

    //
    // Sets the position
    //
    goog.style.setPosition(
	this.infoDiv_, 
	abs.x + goog.style.getSize(this.getElement()).width + 13,
	infoDivY)

    goog.style.setPosition(
	this.infoHoverArrow_, 
	abs.x + goog.style.getSize(this.getElement()).width - 6,
	abs.y + 7)

    nrg.fx.fadeIn(this.infoDiv_, 200);
    nrg.fx.fadeIn(this.infoHoverArrow_, 200);
    /*
    nrg.fx.parallelFade(
	[this.infoDiv_, this.infoHoverArrow_], 
	[this.infoDiv_.style.opacity, this.infoHoverArrow_.style.opacity],
	[1,1],
	200,
	null,
	null,
	function(){
	    //window.console.log(this.infoDiv_, this.infoHoverArrow_);
	}.bind(this));
    */
    //window.console.log(this.infoHoverArrow_);
}


/**
 * @public
 */
xiv.ui.Thumbnail.prototype.hideInfo = function(){
    //this.infoHoverArrow_.style.opacity = 0;
    //this.infoHoverArrow_.style.visible = 'hidden';

    nrg.fx.fadeOut(this.infoDiv_, 200, function(){
	this.infoDiv_.style.visibility = 'hidden';
    }.bind(this));
    nrg.fx.fadeOut(this.infoHoverArrow_, 200, function(){
	this.infoHoverArrow_.style.visibility = 'hidden';
    }.bind(this));

    /*
    nrg.fx.parallelFade(
	[this.infoDiv_, this.infoHoverArrow_], 
	[this.infoDiv_.style.opacity, this.infoHoverArrow_.style.opacity],
	[0,0],
	200, null, null, function(){
	    goog.array.forEach([this.infoDiv_, this.infoHoverArrow_], 
			       function(elt){
				   elt.style.visibility = 'hidden';
			       }) 
	}.bind(this));
	*/

}



/**
 * Returns the gxnat.vis.ViewableTree object associated with the thumbnail.
 * @return {gxnat.vis.ViewableTree}
 * @public
 */
xiv.ui.Thumbnail.prototype.getViewable = function(){
    return this.ViewableTree_;
}



/**
 * @inheritDoc
 */
xiv.ui.Thumbnail.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    this.ViewableTree_.dispose();
    delete this.ViewableTree_; 
    delete this.infoHoverText_;
    delete this.infoDiv_;
    delete this.infoHoverArrow_;
}


goog.exportSymbol('xiv.ui.Thumbnail.ID_PREFIX', xiv.ui.Thumbnail.ID_PREFIX);
goog.exportSymbol('xiv.ui.Thumbnail.CSS_SUFFIX', xiv.ui.Thumbnail.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.getViewable',
	xiv.ui.Thumbnail.prototype.getViewable);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.hideInfo',
	xiv.ui.Thumbnail.prototype.hideInfo);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.showInfo',
	xiv.ui.Thumbnail.prototype.showInfo);
goog.exportSymbol('xiv.ui.Thumbnail.prototype.disposeInternal',
	xiv.ui.Thumbnail.prototype.disposeInternal);
