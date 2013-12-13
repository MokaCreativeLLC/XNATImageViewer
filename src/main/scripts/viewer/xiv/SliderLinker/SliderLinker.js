//******************************************************
//  Init
//
//******************************************************
goog.require('xiv');

goog.provide('SliderLinker');

SliderLinker = function (args) {
	
	var that = this;



	/**
	 * @type {Array.<Array.<number>>}
	 * @private
	 */		
	this.borderColorSet_ = [
		[155,205,5,1],
		[21,2,200,1],
		[25,200,55,1],
		[200,5,200,1],
		[0,255,0,1],
		[0,200,0,1],
		[0,0,200,1],
		[200,0,0,1],
		[200,200,0,1]
	];
	
	/**
	 * @type {Array}
	 * @private
	 */	
	this.groups_ = [];


		
	this.addGroup();	
}


goog.exportSymbol('SliderLinker', SliderLinker);



/**
 * @type {number}
 * @const
 */		
SliderLinker.MAX_GROUPS = xiv.MAX_SCROLL_LINK_GROUPS;
	
/**
 * @type {Object} 
 * @const
 * @private
 */
SliderLinker.popupArgs = {
	widgetCSS: {
  		fontFamily: utils.globals.fontFamily,
  		fontSize: utils.globals.fontSizeM,
  		color: "rgba(255,255,255,1)",
  		border: "solid",
  		borderWidth: 1,
  		borderColor: "rgba(255,255,255,1)",
  		backgroundColor: "rgba(0,0,0,1)",
  		borderRadius: 0,
  		zIndex: 10000
  	},
  	
  	buttonCSS: {
  		height: utils.globals.fontSizeM * 2,
  		position: "absolute",
  		border: "solid",
  		color: "rgba(255,255,255,1)",	  		
  		borderWidth: 1,
  		borderColor: "rgba(255,255,255,1)",
  		backgroundColor: "rgba(125,125,125,1)",
  		borderRadius: 0,
  		cursor: "pointer"
  	}
}


/**
 * @expose
 * @return {Array}
 */
SliderLinker.prototype.getGroups = function () {
	return this.groups_;
}


/**
 * @expose
 * @ return {Object}
 */
SliderLinker.prototype.lastGroup = function () {
	return this.groups_[this.groups_.length - 1];
}	 


/**
 * @expose
 */
SliderLinker.prototype.addGroup = function () {

	this.groups_.push({
		border: "solid 2px rgba(" + this.borderColorSet_[this.groups_.length].toString() + ")",
		groupID: "linkGroup_" + this.groups_.length,
		xiv.ViewBoxes: [],
		prevxiv.ViewBoxes: []
	})		

}


/**
 * @param {Object}
 * @private
 */		
SliderLinker.prototype.addToLastGroup = function(ViewBox) {
	//
	//  Remove the scan viewer from group if it exists
	//
	this.removeFromGroup(xiv.ViewBox, false);
	
	
	//
	//  1. Add the xiv.ViewBox to the last group
	//
	if (this.groups_[this.groups_.length - 1].xiv.ViewBoxManager.indexOf(xiv.ViewBox) === -1) {
	
		//("HERE - last group: ", this.lastGroup().border)
		this.groups_[this.groups_.length - 1].xiv.ViewBoxManager.push(xiv.ViewBox);
		
		//
		//  Set the border color
		//
		xiv.ViewBox.selectorBox.style.border = this.lastGroup().border;
		utils.fx.fadeTo(xiv.ViewBox.selectorBox, xiv.ANIM_FAST, 1);
		//(xiv.ViewBox.selectorBox.style.border)

	}

}


/**
 * @param {Object}
 * @private
 */	
SliderLinker.prototype.clearSelectorBox = function(ViewBox) {
	
	//("CLEARING SELECTOR BOX of ", xiv.ViewBox._element.id)
	xiv.ViewBox.selectorBox.style.border = "none";		
	
	goog.events.unlisten(xiv.ViewBox._element, goog.events.EventType.MOUSEOVER, that.sliderlink_mouseover);
	goog.events.unlisten(xiv.ViewBox._element, goog.events.EventType.MOUSEOUT, that.sliderlink_mouseout);
	
	goog.array.forEach(xiv.ViewBox._element.defaultMouseEvents, function(event) {
		event();		
	})

	xiv.ViewBox.FrameSlider.clearLinked();		
}




/**
 * @param {Object}
 * @param {boolean=}
 * @return {boolean}
 */		
SliderLinker.prototype.removeFromGroup = function (viewerInGroup, clearSelectorBox) {

	var tempInd, viewer;
	var removed = false;
	
	
	goog.array.forEach(this.groups_,  function(group){
		
		if (!removed) {
			
			tempInd = group.xiv.ViewBoxManager.indexOf(viewerInGroup);	
			
			if (tempInd > -1) {

				if (clearSelectorBox) {
					that.clearSelectorBox(group.xiv.ViewBoxManager[tempInd]);						
				}					
				group.xiv.ViewBoxManager.splice(tempInd, 1);		

				removed = true;	
			}									
		}							
	})
	
	
	return removed;
}


/**
 * @param {Object}
 */		
SliderLinker.prototype.removeGroup = function (viewerInGroup) {

	var tempInd, findIndex, removed;
	
	
	that.forEach_({
		
		before: function(group, groups) {
			if (!removed) {
				tempInd = group.xiv.ViewBoxManager.indexOf(viewerInGroup);					
			}
		},
		
		during: function(viewer, group) {
			if (tempInd > -1 && !removed) {
				that.clearSelectorBox(viewer);
			}													
		},
		
		after: function(group, groups) {
			if (tempInd > -1 && !removed)  {
				
				findIndex = groups.indexOf(group);
				if (i>0) {
					groups.splice(findIndex, 1);
				} else {
					group.xiv.ViewBoxManager = [];
				}
				removed = true;
			}				
		}	
	})
}




/**
 * @param {Element}
 * @param {Object}
 * @return {Element}
 */		
SliderLinker.prototype.addSelectorBox = function (parent, dims) {
	
	var newDims = utils.dom.mergeArgs(dims, {
		position: "absolute",
		border: "solid 3px rgba(255,0,0,1)",
		cursor: "pointer"
	})
	var box =  utils.dom.makeElement("div", parent, "selectorBox", newDims);
	return box;
	
}	




/**
 * @private
 */		
SliderLinker.prototype.clearAll_ = function () {
		
	
	XV.xiv.ViewBoxManager( function(ViewBox) {
			that.removeFromGroup(xiv.ViewBox, true);
	});

	this.groups_ = [];
	this.addGroup();
}




/**
 * @param {string}
 */		
SliderLinker.prototype.getViewBoxSetFromID = function (ID) {
	
	that.forEach_(function(viewer, group) {		
					
		if (viewer._element.id === ID) {
			return {
				viewer: viewer,
				viewerset: group.xiv.ViewBoxManager
			}
		}
		
	})	
		
}




/**
 * @param{number=}
 */			
SliderLinker.prototype.showExisting = function (delay ) {
	
	var delayVal = (delay) ? delay: 0;

	that.forEach_(function(viewer, group) {					
		
		var fadeIn = function() {	
			utils.fx.fadeIn(viewer, xiv.ANIM_FAST);		
		}
	    var delayAnim = new goog.async.Delay(fadeIn, delayVal);
        delayAnim.start();
		
	})
}




/**
 * @param{number=}
 */		
SliderLinker.prototype.hideExisting = function (delay) {
	
	var delayVal = (delay) ? delay: 0;
	
	if (!this.stayVisible) { 
		that.forEach_(function(viewer, group) {				
			
			var fadeOut = function() {	
				utils.fx.fadeOut(viewer, xiv.ANIM_FAST);		
			}
		    var delayAnim = new goog.async.Delay(fadeOut, delayVal);
	        delayAnim.start();
	
		})		
	}
	
}




/**
 * @param{number=}
 */
SliderLinker.prototype.flashExisting = function (delay) {
	
	var delayVal = (delay) ? delay: 500;
	
	that.forEach_(function(viewer, group) {
		
		utils.fx.fadeIn(viewer.selectorBox, xiv.ANIM_FAST, function() {
			
			var fadeOut = function() {	
				utils.fx.fadeOut(viewer, xiv.ANIM_FAST);		
			}
		    var delayAnim = new goog.async.Delay(fadeOut, delayVal);
	        delayAnim.start();
	        
		});

	})			
}




/**
 * @param {Element}
 * @private
 */	
SliderLinker.prototype.disableSelectorBox_ = function (selectorBox) {
	utils.style.setStyle( selectorBox, {'pointer-events': 'none'});		
}




/**
 * @param {Element}
 * @private
 */	
SliderLinker.prototype.enableSelectorBox_ = function (selectorBox) {
	utils.style.setStyle( selectorBox, {'pointer-events': 'auto'});		
}




/**
 * @private
 */
SliderLinker.prototype.takeSnapshot_ = function () {
	that.forEach_(function(viewer) {
		group.prevxiv.ViewBoxes.push(viewer);		
	})
}




/**
 * @param {(function|object)}
 * @private
 */
 SliderLinker.prototype.forEach_ = function(callbacks) {

	var callbacks_ = {};

	if (typeof callbacks === 'function') {
	
		callbacks_.during = callbacks;
	
	} else if (typeof callbacks === 'object') {
	
		callbacks_ = {};
	
	}
	goog.array.forEach(groups,  function(group){
		
		if (callbacks_.before) { 
			callbacks_.before(group, groups);
		}
		
		
		goog.array.forEach(group.xiv.ViewBoxManager,  function(viewer){
		
			if (callbacks_.during) { 
				callbacks_.during(viewer, group, groups);
			}
		
		})
		
		
		if (callbacks_.after) { 
			callbacks_.after(group, groups);
		}
		
	})	
}
	
	
/**
 * @protected
 */	
SliderLinker.prototype.cancel = function () {
	
	that.forEach_({
		
		'during' : function(viewer) {
			that.clearSelectorBox(viewer);			
		},
		
		'after' : function(group) {
			group.xiv.ViewBoxManager = this.groups_[i].prevxiv.ViewBoxes;
			group.prevxiv.ViewBoxes = [];		
			that.hideExisting();					
		}
		
	})

	

	this.processGroups();			
}


/**
 * @private
 */
SliderLinker.prototype.processGroups = function () {
	

	//
	//  Clear all mouse-related events from selectorBoxes
	//
	XV.xiv.ViewBoxManager( function(ViewBox) {
		
		that.disableSelectorBox_(xiv.ViewBox.selectorBox);
		that.hideExisting(500);
						
	});

	
	
	//
	//  Process viewers that are in an existing groups
	//
	that.forEach_(function(viewer) {

		goog.events.listen(viewer._element, goog.events.EventType.MOUSEOVER, that.sliderlink_mouseover);
		goog.events.listen(viewer._element, goog.events.EventType.MOUSEOUT, that.sliderlink_mouseout);

	})
	
}

/**
 * @param {goog.events.Event}
 * @private
 */
SliderLinker.prototype.sliderlink_mouseover = function (event) {	
	//
	//  Get the linked set based on the event.currentTarget.id
	//
	var set = xiv.SliderLinker.getViewBoxSetFromID(event.currentTarget.id);		
	//
	//  Get the viewer that's being hovered
	//			
	var mouseoverxiv.ViewBox = set.viewer;
	//
	//  Get the set of the viewer that's associated with the hovered viewer
	//
	var viewerGroup = set.viewerset;
	//
	//  Loop through viewergroup, apply "linkSlider" rule on !mouseoverxiv.ViewBox viewers
	//
	goog.array.forEach( viewerGroup, function(otherxiv.ViewBox) { 
		if (otherxiv.ViewBox !== mouseoverxiv.ViewBox) {
			mouseoverxiv.ViewBox.FrameSlider.linkSlider(otherxiv.ViewBox.FrameSlider);	
		}		
	})
}



/**
 * @param {goog.events.Event}
 * @private
 */
SliderLinker.prototype.sliderlink_mouseout =  function (event) {	
	var set = xiv.SliderLinker.getViewBoxSetFromID(event.currentTarget.id);
	
	if (set) {				
		set.viewer.FrameSlider.clearLinked();						
	}
}
SliderLinker.prototype.addClearAllPopup = function (currxiv.ViewBox, message) {
	
	this.takeSnapshot_();	
	
	var that = this;
	var messageVal = (typeof message === 'undefined') ?  "Are you sure you want to clear all links?" : message;
	
	
	var b = new utils.ui.DialogBox(utils.dom.mergeArgs(that.popupArgs, {	  	
		buttons: ["Yes", "Cancel"],
		message: messageVal
  	}));
  	
	var popup = b._element();		
	
	
	
	b.setButtonOnclick("yes", function (event) {
		utils.dom.stopPropagation(event);
		utils.fx.fadeOutAndRemove(popup, xiv.ANIM_FAST, function(){ 
			that.clearAll_();
		})
	});



	b.setButtonOnclick("cancel", function (event) {
		utils.dom.stopPropagation(event);
		utils.fx.fadeOutAndRemove(popup, xiv.ANIM_FAST, function(){ 
			that.clearAll_();
		})	
	});

	
	XV.updateStyle();	
	utils.fx.fadeOut(popup, 0, function () {
		utils.fx.fadeIn(popup, xiv.ANIM_FAST);
	});
		
}
SliderLinker.prototype.addLinkMenuPopup = function (currxiv.ViewBox, message) {
	
	this.takeSnapshot_();
	this.lastxiv.ViewBoxSelected = currxiv.ViewBox;		
	this.setxiv.ViewBoxClickListen(currxiv.ViewBox);
	
	
	var that = this;
	var messageVal = (typeof message === 'undefined') ?  "Select viewers to link. Click 'Done' when finished." : message;	
	var b = new utils.ui.DialogBox(utils.dom.mergeArgs(that.popupArgs, {	  	
		buttons: ["DONE", "Cancel"],
		message: messageVal
  	}));
	var popup = b._element();	

	
	b.setButtonOnclick("done", function (event) {
		utils.dom.stopPropagation(event);
		utils.fx.fadeOutAndRemove(popup, xiv.ANIM_FAST, function(){ 
			that.clearAll_();
		})
		that.processGroups();
	});


	b.setButtonOnclick("cancel", function (event) {		
		utils.dom.stopPropagation(event);
		utils.fx.fadeOutAndRemove(popup, xiv.ANIM_FAST, function(){ 
			that.clearAll_();
		})
		that.cancel();
	});

	
	XV.updateStyle();
	
	
	utils.fx.fadeOut(popup, 0, function () {
		utils.fx.fadeIn(popup, xiv.ANIM_FAST);
	});

}
//******************************************************
//  
//
//
//******************************************************
SliderLinker.prototype.setxiv.ViewBoxClickListen = function (currxiv.ViewBox) {
	
	var that = this;
	
	
	this.showExisting();
		

	XV.xiv.ViewBoxManager( function(ViewBox) {
				
		//
		//  Make a selector box if it doesn't exist'
		//
		if (!xiv.ViewBox.selectorBox) {

			xiv.ViewBox.selectorBox =  xiv.SliderLinker.addSelectorBox( 
				xiv.ViewBox._element.parentNode , 
				utils.style.dims(xiv.ViewBox._element)
			);
				
			xiv.ViewBox.selectorBox.style.border = 'none';	
			xiv.ViewBox.selectorBox.xiv.ViewBox = xiv.ViewBox;	
			
			
			
			xiv.ViewBox.selectorBox.onclick = function () {				
				
				var box = this;
				var viewer = box.xiv.ViewBox;

				that.lastxiv.ViewBoxSelected = viewer;
				that.addToLastGroup(viewer);

			}	
			
						
		} else {
			
			that.enableSelectorBox_(xiv.ViewBox.selectorBox);
			
		}



		
		//--------------------------
		//  SELECT CURRVIEWER
		//--------------------------
		if (xiv.ViewBox === currxiv.ViewBox) {
			
			xiv.ViewBox.selectorBox.onclick();

		}		
	});

}
//******************************************************
//  Init
//
//******************************************************


SliderLinker = function (args) {
	
	var that = this;



	/**
	 * @type {Array.<Array.<number>>}
	 * @private
	 */		
	this.borderColorSet_ = [
		[155,205,5,1],
		[21,2,200,1],
		[25,200,55,1],
		[200,5,200,1],
		[0,255,0,1],
		[0,200,0,1],
		[0,0,200,1],
		[200,0,0,1],
		[200,200,0,1]
	];
	
	/**
	 * @type {Array}
	 * @private
	 */	
	this.groups_ = [];


		
	this.addGroup();	
}





/**
 * @type {number}
 * @const
 */		
SliderLinker.MAX_GROUPS = xiv.MAX_SCROLL_LINK_GROUPS;
	
/**
 * @type {Object} 
 * @const
 * @private
 */
SliderLinker.popupArgs = {
	widgetCSS: {
  		fontFamily: utils.globals.fontFamily,
  		fontSize: utils.globals.fontSizeM,
  		color: "rgba(255,255,255,1)",
  		border: "solid",
  		borderWidth: 1,
  		borderColor: "rgba(255,255,255,1)",
  		backgroundColor: "rgba(0,0,0,1)",
  		borderRadius: 0,
  		zIndex: 10000
  	},
  	
  	buttonCSS: {
  		height: utils.globals.fontSizeM * 2,
  		position: "absolute",
  		border: "solid",
  		color: "rgba(255,255,255,1)",	  		
  		borderWidth: 1,
  		borderColor: "rgba(255,255,255,1)",
  		backgroundColor: "rgba(125,125,125,1)",
  		borderRadius: 0,
  		cursor: "pointer"
  	}
}


/**
 * @expose
 * @return {Array}
 */
SliderLinker.prototype.getGroups = function () {
	return this.groups_;
}


/**
 * @expose
 * @ return {Object}
 */
SliderLinker.prototype.lastGroup = function () {
	return this.groups_[this.groups_.length - 1];
}	 


/**
 * @expose
 */
SliderLinker.prototype.addGroup = function () {

	this.groups_.push({
		border: "solid 2px rgba(" + this.borderColorSet_[this.groups_.length].toString() + ")",
		groupID: "linkGroup_" + this.groups_.length,
		xiv.ViewBoxes: [],
		prevxiv.ViewBoxes: []
	})		

}


/**
 * @param {Object}
 * @private
 */		
SliderLinker.prototype.addToLastGroup = function(ViewBox) {
	//
	//  Remove the scan viewer from group if it exists
	//
	this.removeFromGroup(xiv.ViewBox, false);
	
	
	//
	//  1. Add the xiv.ViewBox to the last group
	//
	if (this.groups_[this.groups_.length - 1].xiv.ViewBoxManager.indexOf(xiv.ViewBox) === -1) {
	
		//("HERE - last group: ", this.lastGroup().border)
		this.groups_[this.groups_.length - 1].xiv.ViewBoxManager.push(xiv.ViewBox);
		
		//
		//  Set the border color
		//
		xiv.ViewBox.selectorBox.style.border = this.lastGroup().border;
		utils.fx.fadeTo(xiv.ViewBox.selectorBox, xiv.ANIM_FAST, 1);
		//(xiv.ViewBox.selectorBox.style.border)

	}

}


/**
 * @param {Object}
 * @private
 */	
SliderLinker.prototype.clearSelectorBox = function(ViewBox) {
	
	//("CLEARING SELECTOR BOX of ", xiv.ViewBox._element.id)
	xiv.ViewBox.selectorBox.style.border = "none";		
	
	goog.events.unlisten(xiv.ViewBox._element, goog.events.EventType.MOUSEOVER, that.sliderlink_mouseover);
	goog.events.unlisten(xiv.ViewBox._element, goog.events.EventType.MOUSEOUT, that.sliderlink_mouseout);
	
	goog.array.forEach(xiv.ViewBox._element.defaultMouseEvents, function(event) {
		event();		
	})

	xiv.ViewBox.FrameSlider.clearLinked();		
}




/**
 * @param {Object}
 * @param {boolean=}
 * @return {boolean}
 */		
SliderLinker.prototype.removeFromGroup = function (viewerInGroup, clearSelectorBox) {

	var tempInd, viewer;
	var removed = false;
	
	
	goog.array.forEach(this.groups_,  function(group){
		
		if (!removed) {
			
			tempInd = group.xiv.ViewBoxManager.indexOf(viewerInGroup);	
			
			if (tempInd > -1) {

				if (clearSelectorBox) {
					that.clearSelectorBox(group.xiv.ViewBoxManager[tempInd]);						
				}					
				group.xiv.ViewBoxManager.splice(tempInd, 1);		

				removed = true;	
			}									
		}							
	})
	
	
	return removed;
}


/**
 * @param {Object}
 */		
SliderLinker.prototype.removeGroup = function (viewerInGroup) {

	var tempInd, findIndex, removed;
	
	
	that.forEach_({
		
		before: function(group, groups) {
			if (!removed) {
				tempInd = group.xiv.ViewBoxManager.indexOf(viewerInGroup);					
			}
		},
		
		during: function(viewer, group) {
			if (tempInd > -1 && !removed) {
				that.clearSelectorBox(viewer);
			}													
		},
		
		after: function(group, groups) {
			if (tempInd > -1 && !removed)  {
				
				findIndex = groups.indexOf(group);
				if (i>0) {
					groups.splice(findIndex, 1);
				} else {
					group.xiv.ViewBoxManager = [];
				}
				removed = true;
			}				
		}	
	})
}




/**
 * @param {Element}
 * @param {Object}
 * @return {Element}
 */		
SliderLinker.prototype.addSelectorBox = function (parent, dims) {
	
	var newDims = utils.dom.mergeArgs(dims, {
		position: "absolute",
		border: "solid 3px rgba(255,0,0,1)",
		cursor: "pointer"
	})
	var box =  utils.dom.makeElement("div", parent, "selectorBox", newDims);
	return box;
	
}	




/**
 * @private
 */		
SliderLinker.prototype.clearAll_ = function () {
		
	
	XV.xiv.ViewBoxManager( function(ViewBox) {
			that.removeFromGroup(xiv.ViewBox, true);
	});

	this.groups_ = [];
	this.addGroup();
}




/**
 * @param {string}
 */		
SliderLinker.prototype.getViewBoxSetFromID = function (ID) {
	
	that.forEach_(function(viewer, group) {		
					
		if (viewer._element.id === ID) {
			return {
				viewer: viewer,
				viewerset: group.xiv.ViewBoxManager
			}
		}
		
	})	
		
}




/**
 * @param{number=}
 */			
SliderLinker.prototype.showExisting = function (delay ) {
	
	var delayVal = (delay) ? delay: 0;

	that.forEach_(function(viewer, group) {					
		
		var fadeIn = function() {	
			utils.fx.fadeIn(viewer, xiv.ANIM_FAST);		
		}
	    var delayAnim = new goog.async.Delay(fadeIn, delayVal);
        delayAnim.start();
		
	})
}




/**
 * @param{number=}
 */		
SliderLinker.prototype.hideExisting = function (delay) {
	
	var delayVal = (delay) ? delay: 0;
	
	if (!this.stayVisible) { 
		that.forEach_(function(viewer, group) {				
			
			var fadeOut = function() {	
				utils.fx.fadeOut(viewer, xiv.ANIM_FAST);		
			}
		    var delayAnim = new goog.async.Delay(fadeOut, delayVal);
	        delayAnim.start();
	
		})		
	}
	
}




/**
 * @param{number=}
 */
SliderLinker.prototype.flashExisting = function (delay) {
	
	var delayVal = (delay) ? delay: 500;
	
	that.forEach_(function(viewer, group) {
		
		utils.fx.fadeIn(viewer.selectorBox, xiv.ANIM_FAST, function() {
			
			var fadeOut = function() {	
				utils.fx.fadeOut(viewer, xiv.ANIM_FAST);		
			}
		    var delayAnim = new goog.async.Delay(fadeOut, delayVal);
	        delayAnim.start();
	        
		});

	})			
}




/**
 * @param {Element}
 * @private
 */	
SliderLinker.prototype.disableSelectorBox_ = function (selectorBox) {
	utils.style.setStyle( selectorBox, {'pointer-events': 'none'});		
}




/**
 * @param {Element}
 * @private
 */	
SliderLinker.prototype.enableSelectorBox_ = function (selectorBox) {
	utils.style.setStyle( selectorBox, {'pointer-events': 'auto'});		
}




/**
 * @private
 */
SliderLinker.prototype.takeSnapshot_ = function () {
	that.forEach_(function(viewer) {
		group.prevxiv.ViewBoxes.push(viewer);		
	})
}




/**
 * @param {(function|object)}
 * @private
 */
 SliderLinker.prototype.forEach_ = function(callbacks) {

	var callbacks_ = {};

	if (typeof callbacks === 'function') {
	
		callbacks_.during = callbacks;
	
	} else if (typeof callbacks === 'object') {
	
		callbacks_ = {};
	
	}
	goog.array.forEach(groups,  function(group){
		
		if (callbacks_.before) { 
			callbacks_.before(group, groups);
		}
		
		
		goog.array.forEach(group.xiv.ViewBoxManager,  function(viewer){
		
			if (callbacks_.during) { 
				callbacks_.during(viewer, group, groups);
			}
		
		})
		
		
		if (callbacks_.after) { 
			callbacks_.after(group, groups);
		}
		
	})	
}
	
	
/**
 * @protected
 */	
SliderLinker.prototype.cancel = function () {
	
	that.forEach_({
		
		'during' : function(viewer) {
			that.clearSelectorBox(viewer);			
		},
		
		'after' : function(group) {
			group.xiv.ViewBoxManager = this.groups_[i].prevxiv.ViewBoxes;
			group.prevxiv.ViewBoxes = [];		
			that.hideExisting();					
		}
		
	})

	

	this.processGroups();			
}


/**
 * @private
 */
SliderLinker.prototype.processGroups = function () {
	

	//
	//  Clear all mouse-related events from selectorBoxes
	//
	XV.xiv.ViewBoxManager( function(ViewBox) {
		
		that.disableSelectorBox_(xiv.ViewBox.selectorBox);
		that.hideExisting(500);
						
	});

	
	
	//
	//  Process viewers that are in an existing groups
	//
	that.forEach_(function(viewer) {

		goog.events.listen(viewer._element, goog.events.EventType.MOUSEOVER, that.sliderlink_mouseover);
		goog.events.listen(viewer._element, goog.events.EventType.MOUSEOUT, that.sliderlink_mouseout);

	})
	
}

/**
 * @param {goog.events.Event}
 * @private
 */
SliderLinker.prototype.sliderlink_mouseover = function (event) {	
	//
	//  Get the linked set based on the event.currentTarget.id
	//
	var set = xiv.SliderLinker.getViewBoxSetFromID(event.currentTarget.id);		
	//
	//  Get the viewer that's being hovered
	//			
	var mouseoverxiv.ViewBox = set.viewer;
	//
	//  Get the set of the viewer that's associated with the hovered viewer
	//
	var viewerGroup = set.viewerset;
	//
	//  Loop through viewergroup, apply "linkSlider" rule on !mouseoverxiv.ViewBox viewers
	//
	goog.array.forEach( viewerGroup, function(otherxiv.ViewBox) { 
		if (otherxiv.ViewBox !== mouseoverxiv.ViewBox) {
			mouseoverxiv.ViewBox.FrameSlider.linkSlider(otherxiv.ViewBox.FrameSlider);	
		}		
	})
}



/**
 * @param {goog.events.Event}
 * @private
 */
SliderLinker.prototype.sliderlink_mouseout =  function (event) {	
	var set = xiv.SliderLinker.getViewBoxSetFromID(event.currentTarget.id);
	
	if (set) {				
		set.viewer.FrameSlider.clearLinked();						
	}
}
