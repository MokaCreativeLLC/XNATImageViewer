/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

// goog
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.format');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.style');
goog.require('nrg.ui.SlideInMenu');
goog.require('nrg.ui.ErrorOverlay');

// xiv
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.vis.XtkEngine');
goog.require('xiv.ui.ProgressBarPanel');
goog.require('xiv.ui.layouts.LayoutHandler');
goog.require('xiv.ui.ViewableGroupMenu');



/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ui.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ui.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the nrg.ui.SlideInMenu to the 
 * xiv.ui.layouts.LayoutHandler 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ViewBox');

xiv.ui.ViewBox = function () {
    goog.base(this);

    /**
     * @type {Array.<gxnat.vis.ViewableTree>}
     * @private
     */
    this.ViewableTrees_ = [];


    /**
     * @type {Object.<string, gxnat.vis.ViewableGroup>}
     * @private
     */
    this.ViewableGroups_ = {};


    /**
     * @struct
     * @private
     */
    this.menus_ = {
	TOP: null,
	TOP_LEFT: null,
	LEFT: null,
	BOTTOM_LEFT: null,
	BOTTOM: null,
	BOTTOM_RIGHT: null,
	RIGHT: null,
	TOP_RIGHT: null
    };
    this.addMenu_topLeft_();


    /**
     * @type {!Element}
     * @private
     */	
    this.viewFrameElt_ = goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_ViewFrame_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBox.CSS.VIEWFRAME
    });
    goog.dom.append(this.getElement(), this.viewFrameElt_);
    
    //
    // add progress bar panel
    //
    this.initProgressBarPanel_();

    //
    // update style
    //
    this.updateStyle();
}
goog.inherits(xiv.ui.ViewBox, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ViewBox', xiv.ui.ViewBox);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBox.EventType = {
    VIEWABLE_PRELOAD: goog.events.getUniqueId('viewable_preload'),
    VIEWABLE_LOADED: goog.events.getUniqueId('viewable_load'),
    VIEWABLE_LOADERROR: goog.events.getUniqueId('viewable_loaderror'),
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBox.ID_PREFIX =  'xiv.ui.ViewBox';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBox.CSS_SUFFIX = {
    HIDDEN: 'hidden',
    TABDRAGGER: 'tabdragger',
    TABDRAGGER_HANDLE: 'tabdragger-handle',
    VIEWLAYOUTMENU: 'viewlayoutmenu',
    MENU_TOP_LEFT:  'menu-top-left',
    MENU_LEFT:  'menu-left',
    VIEWLAYOUTHANDLER: 'viewlayouthandler',
    TABS: 'ziptabs',
    TAB_BOUNDS: 'ziptab-bounds',
    VIEWFRAME: 'viewframe',
    COMPONENT_HIGHLIGHT: 'component-highlight',
    VIEWABLEGROUPMENU: 'viewablegroupmenu',
}



/**
 * @dict
 * @const
 */
xiv.ui.ViewBox.defaultLayout = {
    'Scans' : 'Four-Up',
    'Slicer' : 'Conventional',
    'Slicer Scenes' : 'Conventional',
}



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.MIN_HOLDER_HEIGHT = 200;



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.SCAN_TAB_LABEL_HEIGHT =  15;


/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.SCAN_TAB_LABEL_WIDTH = 50;



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.MIN_TAB_H_PCT = .2;



/**
 * @type {number}
 * @private
 */
xiv.ui.ViewBox.prototype.thumbLoadTime_;



/**
 * @type {Array.<Element>}
 * @private
 */
xiv.ui.ViewBox.prototype.doNotHide_;



/**
 * @type {!string}
 * @private
 */
xiv.ui.ViewBox.prototype.loadState_ = 'empty';



/**
 * @type {?Object.<string, Element>}
 * @private
 */
xiv.ui.ViewBox.prototype.toggleButtons_ = null;



/**
 * @type {?xiv.ui.layouts.LayoutHandler}
 * @protected
 */
xiv.ui.ViewBox.prototype.LayoutHandler_ = null;



/**
 * @type {?nrg.ui.SlideInMenu}
 * @private
 */
xiv.ui.ViewBox.prototype.LayoutMenu_ = null;



/**
 * @type {?xiv.vis.XtkEngine}
 * @private
 */
xiv.ui.ViewBox.prototype.Renderer_ = null;



/**
 * @type {?xiv.ui.ProgressBarPanel}
 * @private
 */
xiv.ui.ViewBox.prototype.ProgressBarPanel_ = null;



/**
 * @type {?xiv.ui.ViewableGroupMenu}
 * @private
 */
xiv.ui.ViewBox.prototype.ViewableGroupMenu_ = null;



/**
 * @type {?xiv.ui.ViewBoxDialogs}
 * @private
 */
xiv.ui.ViewBox.prototype.Dialogs_ = null;



/**
 * @type {?xiv.ui.ViewBoxInteractorHandler}
 * @private
 */
xiv.ui.ViewBox.prototype.InteractorHandler_ = null;



/**
 * @type {!boolean}
 * @private
 */
xiv.ui.ViewBox.prototype.hasLoadComponents_ = false;



/**
 * @return {!Object.<string, Element>}
 * @public
 */
xiv.ui.ViewBox.prototype.getMenus = function() {
    return this.menus_;
}



/**
 * @return {!string} The load state of the viewer.
 * @public
 */
xiv.ui.ViewBox.prototype.getLoadState = function() {
    return this.loadState_;
}


/**
 * @return {!Array.<gxnat.vis.ViewableTree>} 
 * @public
 */
xiv.ui.ViewBox.prototype.getViewableTrees =  function() {
    return this.ViewableTrees_;
}



/**
 * @return {!Element} 
 * @public
 */
xiv.ui.ViewBox.prototype.getViewFrame =  function() {
    return this.viewFrameElt_;
}




/**
 * @return {!xiv.ui.layouts.LayoutHandler} 
 * @public
 */
xiv.ui.ViewBox.prototype.getLayoutHandler =  function() {
    return this.LayoutHandler_;
}



/**
 * Get the associated ViewableGroupMenu for this object.
 * @return {!xiv.ui.ViewableGroupMenu} The ViewableGroupMenu object of the 
 *    ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.getViewableGroupMenu =  function() {
    return this.ViewableGroupMenu_;
}



/**
 * Get the associated thumbnail load time for this object.
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.highlight =  function() {
    goog.dom.classes.add(this.viewFrameElt_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.unhighlight =  function() {
    goog.dom.classes.remove(this.viewFrameElt_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}




/**
 * Get the associated thumbnail load time for this object.
 *
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.getThumbnailLoadTime =  function() {
    return this.thumbLoadTime_;
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.clearThumbnailLoadTime =  function() {
    this.thumbLoadTime_ = undefined;
}



/**
 * Adds an element to the doNotHide list.
 * @param {!Element} element The element to prevent from hiding when no 
 *    Thumbnail is loaded.
 * @public
 */
xiv.ui.ViewBox.prototype.doNotHide = function(element){
    this.doNotHide_ = (this.doNotHide_) ? this.doNotHide_ : [];
    this.doNotHide_.push(element);
};



/**
 * Allows for external communication to set
 * the viewscheme within the xiv.ui.ViewBox by communicating
 * to its nrg.ui.SlideInMenu object.
 * @param {!string} layout Sets the view layout associated with the argument.
 * @public
 */
xiv.ui.ViewBox.prototype.setLayout = function(layout) {
    this.LayoutMenu_.setSelected(layout);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderStart_ = function(){
    this.ProgressBarPanel_.setValue(0);
    this.ProgressBarPanel_.showValue(true);
    this.showSubComponent_(this.ProgressBarPanel_, 0);
    this.highlight();
}



/**
 * @param {!number} value
 * @private
 */
xiv.ui.ViewBox.prototype.setProgressBarPct_ = function(value){
    this.ProgressBarPanel_.setLabel('');
    this.ProgressBarPanel_.showValue(true);
    this.ProgressBarPanel_.setValue(value * 100);
}



/**
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBox.prototype.onRendering_ = function(e){
    this.highlight();
    this.setProgressBarPct_(e.value);
}




/**
 * @struct
 */
xiv.ui.ViewBox.ControllersSet = function(controller, folders){
    this.CONTROLLER = controller;
    this.FOLDERS = folders;
}



/**
 * Introduces a delay mechanism so we're not presented 
 * with awkward progress bar issues.
 *
 * @param {number=} opt_delay The optional delay time.  Defaults to 1000.
 * @param {Function=} callback The optional callback function.
 * @private
 */
xiv.ui.ViewBox.prototype.hideProgressBarPanel_ = 
function(opt_delay, opt_callback){

    //window.console.log("HIDE PROG!");
    this.progTimer_ = goog.Timer.callOnce(function() {
	this.progTimer_ = null;
	//window.console.log("CALLBACK 1");
	this.hideSubComponent_(this.ProgressBarPanel_, 500, function(){
	    this.updateStyle();
	    if (goog.isDefAndNotNull(opt_callback)){
		//window.console.log("CALLBACK 2");
		opt_callback();
	    }
	}.bind(this));
    }.bind(this), goog.isNumber(opt_delay) ? opt_delay : 1000);
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderEnd_ = function(e){    
    //
    // Untoggle wait for render errors
    //
    this.toggleWaitForRenderErrors_(false);

    //
    // HACK: We want to get rid of xtk's progress bar.
    //
    goog.array.forEach(goog.dom.getElementsByClass('xtk-progress-bar'), 
		       function(bar){
			   bar.visibility = 'hidden';
		       });

    //
    // Set the layout based the orientation of the ViewableTree
    //
    if (goog.isDefAndNotNull(this.ViewableTrees_[0].getOrientation())){
	this.setLayout(this.ViewableTrees_[0].getOrientation());
    }
    

    //
    // Create dialogs
    //
    this.Dialogs_.createDialogs(); 

    //
    // Show load components (menu)
    //
    this.fadeInLoadComponents_(0, null, null);

    //
    // Create interactors
    //
    this.InteractorHandler_.createInteractors();

    //
    // Hide progress bar
    //
    this.hideProgressBarPanel_(800, function(){

	//
	// Set progress bar value to 0
	//
	this.ProgressBarPanel_.setValue(0);

	//
	// Update style
	//
	this.updateStyle();

	//
	// Run resize callback to be safe.
	//
	this.onLayoutResize_();

	//
	// Dispatch loaded
	//
	this.dispatchEvent(xiv.ui.ViewBox.EventType.VIEWABLE_LOADED);

	//
	// unhighlight
	//
	this.unhighlight();

    }.bind(this));
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutResize_ = function(e){
    //
    // Update the renderer style
    //
    this.updateStyle_Renderer_();

    //
    // Update the interactors
    //
    if (goog.isDefAndNotNull(this.InteractorHandler_)){
	this.InteractorHandler_.update();
    }

    //
    // Exit out if no renderer
    //
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };

    //
    // Update the controller handler
    //
    this.InteractorHandler_.onLayoutResize();
}





/**
 * @param {!gxnat.vis.ViewableTree} ViewableTree.
 * @private
 */
xiv.ui.ViewBox.prototype.loadViewableTree_ = function(ViewableTree){
    //
    // Reset the group menu
    //
    this.ViewableGroupMenu_.reset();

    //
    // Clear the viewable groups
    //
    goog.object.clear(this.ViewableGroups_);
    
    //
    // Store tree
    //
    if (!goog.array.contains(this.ViewableTrees_, ViewableTree)){
	//window.console.log('\n\n\n\nVIEWABLE TREE', ViewableTree);
	this.ViewableTrees_.push(ViewableTree);	
    }

    //
    // Get the default layout
    //
    if (this.ViewableTrees_.length == 1) {
	this.setLayout(
	    xiv.ui.ViewBox.defaultLayout[ViewableTree.getCategory()]);
    }


    //
    // Break apart the tree into the ViewGroups, then create a menu from
    // it if there are more than one ViewGroups
    //

    //window.console.log(ViewableTree);
    var viewGroups = ViewableTree.getViewableGroups();
    var thumb = null;
    if (viewGroups.length > 1){
	//window.console.log("TOTAL VIEW GROUPS", viewGroups.length);
	
	//
	// Add a thumbnail to the ViewableGroup Menu based on the ViewGroup
	//
	goog.array.forEach(viewGroups, function(viewGroup, i){
	    thumb = this.ViewableGroupMenu_.createAndAddThumbnail(
		viewGroup.getThumbnailUrl(), viewGroup.getTitle() || i);

	    //
	    // Apply the UID to the thumb
	    //
	    this.ViewableGroups_[goog.getUid(thumb)] = viewGroup;	
	}.bind(this))

	//
	// Show the Viewable group menu
	//
	this.showSubComponent_(this.ViewableGroupMenu_, 400);
    }
    else {

	//
	// Otherwise just load the individual group
	//
	this.load(viewGroups[0], false);
    }
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.showInUseDialog = function(){
    this.Dialogs_.showInUseDialog();
}



/**
 * @param {Function=} opt_onYes
 * @return {!boolean} Whether dialog was shown 
 * @public
 */
xiv.ui.ViewBox.prototype.checkInUseAndShowDialog = function(opt_onYes){
    //
    // Prompt user to load if something is already loaded
    //
    if (goog.isDefAndNotNull(this.thumbLoadTime_)){
	this.showInUseDialog();
	this.Dialogs_.setInUseSelect(opt_onYes);
	return true;
    } 
    return false;
}


/**
 * Loads a gxnat.vis.ViewableTree object into the appropriate renderers.
 *
 * @param {!gxnat.vis.ViewableTree | !gxnat.vis.ViewableGroup} ViewableTree.
 * @param {!boolean} opt_initLoadComponents
 * @public
 */
xiv.ui.ViewBox.prototype.load = function (ViewableSet, opt_initLoadComponents) {
    
    //
    // Dispatch preload
    //
    this.dispatchEvent(xiv.ui.ViewBox.EventType.VIEWABLE_PRELOAD);

    
    //
    // Prompt user if something is already loaded
    //
    if (this.checkInUseAndShowDialog(function(){
	    this.thumbLoadTime_ = undefined;
	    this.load(ViewableSet, opt_initLoadComponents);
	}.bind(this))){
	return;
    }


    //
    // Output an error dialog if there's no data in the set.
    //
    if (!goog.isDefAndNotNull(ViewableSet)){
	this.onRenderError_('The data set is empty!');
	return;
    }

    //
    // Do we re-initialize the load components?
    //
    opt_initLoadComponents = goog.isDefAndNotNull(opt_initLoadComponents) ?
	opt_initLoadComponents : true;

    //
    // If so, then we dispose them and re-initialize
    //
    if (opt_initLoadComponents) {
	this.disposeLoadComponents_();
	this.initLoadComponents_();
    }

    //
    // Hide the menus
    //
    this.hideSubComponent_(this.ViewableGroupMenu_, 400);
        
    //
    // Show the progress bar
    //
    this.showSubComponent_(this.ProgressBarPanel_, 0);

    //
    // Load the Viewable tree and exit out if we have to present
    // the user with loading various ViewGroups (mostly for Slicer files)
    //
    // The loadViewableTree_ method will return to this once a ViewableSet
    // has been selected by the user.
    //
    if (ViewableSet instanceof gxnat.vis.ViewableTree){
	this.loadViewableTree_(ViewableSet);
	return;
    }

    //
    // Sync the render plane w/ the Layout
    //
    var layoutPlane;
    goog.object.forEach(this.Renderer_.getPlanes(), function(plane, key) { 
	layoutPlane = this.LayoutHandler_.getCurrentLayoutFrame(key);
	if (layoutPlane) {
	    plane.init(layoutPlane.getElement());
	}
    }.bind(this))

    //
    // Listen once for RENDER_START, RENDER_END
    //
    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));

    //
    // Listen for RENDERING event (we'll unlisten on 
    // for it in the RENDER_END callback)
    //
    goog.events.listen(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this));

    //
    // Wait for render errors
    // 
    this.toggleWaitForRenderErrors_(true);

    //
    // Do a zip download+render for scans (Viewer handles downloading)
    //
    if (ViewableSet.getCategory().toLowerCase() == 'scans') {
	this.renderScanViaZipDownload_(ViewableSet);
	return;
    } 

    //
    // Otherwise, do a standard render (XTK handles downloading).
    //
    this.renderViewableSet_(ViewableSet);
}
 



/**
 * @private
 */
xiv.ui.ViewBox.prototype.renderScanViaZipDownload_ = function(ViewableSet){
    //
    // Show a downloading state in the progress bar...
    //
    this.showSubComponent_(this.ProgressBarPanel_, 0);
    this.setProgressBarPct_(0);

    //
    // NOTE: this is in uncompressed format, so the download will be less
    // than this.  Nevertheless, we use this information for the progress bar.
    //
    var totalFileSize = this.ViewableTrees_[this.ViewableTrees_.length - 1]
	.getTotalSize();
    
    //
    // Construct the zip url
    //
    var firstFile = ViewableSet.getViewables()[0].getFiles()[0];
    var filesUrl = firstFile.split('/files/')[0] + '/files';
    window.console.log("XImgView Zip Downloading (XHR): " +  filesUrl);

    //
    // Get files as zip
    //
    gxnat.getFilesAsZip(
	filesUrl, 
	function(zip) { 
	    //window.console.log('Downloaded: ' + filesUrl + '!');
	    ViewableSet.getViewables()[0].setFileDataFromZip(zip);
	    this.renderViewableSet_(ViewableSet);
	}.bind(this), 

	function(event) {
	    this.highlight();
	    this.setProgressBarPct_(event.loaded/totalFileSize);
	}.bind(this)
    );
}





/**
 * @private
 */
xiv.ui.ViewBox.prototype.renderViewableSet_ = function(ViewableSet){
    //
    // Render!!!
    //
    this.Renderer_.render(ViewableSet);

    //
    // Remember the time in which the thumbnail was loaded
    //
    this.thumbLoadTime_ = (new Date()).getTime(); 
}




/**
 * @param {!boolean} toggle
 * @private
 */
xiv.ui.ViewBox.prototype.toggleWaitForRenderErrors_ = function(toggle) {
    if (toggle === true) {
	window.onerror = function(message, url, lineNumber) {  
	    this.onRenderError_(message);
	}.bind(this);
    } else {
	window.onerror = undefined;
    }
}


/**
 * @param {string} opt_errorMsg
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderError_ = function(opt_errorMsg){
    //
    // unhighlight the ViewBox
    //
    this.unhighlight();

    //
    // Hide the progress bar panels
    //
    this.hideProgressBarPanel_();

    //
    // Dispable render error wating
    //
    this.toggleWaitForRenderErrors_(false);

    //
    // Dispose the load components
    //
    this.disposeLoadComponents_();

    //
    // Create the error message
    //
    opt_errorMsg = opt_errorMsg.replace('Uncaught Error: ', '') 
	|| 'A render error occured :(<br>'; 
    //opt_errorMsg += '. Canceling render.';

    //
    // Dispatch the error
    //
    this.dispatchEvent({
	type: xiv.ui.ViewBox.EventType.THUMBNAIL_LOADERROR,
	message: opt_errorMsg
    })

    //
    // Construct an error overlay
    //
    var ErrorOverlay = new nrg.ui.ErrorOverlay();

    //
    // Add bg and closebutton
    //
    ErrorOverlay.addBackground();
    ErrorOverlay.addCloseButton();

    
    //
    // Add image
    //
    var errorImg = ErrorOverlay.addImage();
    goog.dom.classes.add(errorImg, nrg.ui.ErrorOverlay.CSS.NO_WEBGL_IMAGE);
    errorImg.src = serverRoot + 
	'/images/viewer/xiv/ui/Overlay/sadbrain-white.png';

    //
    // Add above text and render
    //
    ErrorOverlay.addText(opt_errorMsg || '');
    ErrorOverlay.render(this.viewFrameElt_);

    //
    // Fade in the error overlay
    //
    ErrorOverlay.getElement().style.opacity = 0;
    ErrorOverlay.getElement().style.zIndex = 1000;
    nrg.fx.fadeInFromZero(ErrorOverlay.getElement(), xiv.ANIM_TIME);
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChangeStart_ = function(e){
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	if (goog.isDefAndNotNull( e.transitionElements[planeOr])){
	    //
	    // Attach the render plane to the transition element
	    //
	    renderPlane.setContainer( e.transitionElements[planeOr]);	
	    renderPlane.updateStyle();
	}
    })
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChanging_ = function(e){
    //
    // Update the render planes
    //
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	renderPlane.updateStyle();
    })

    //
    // Update the interactors
    //
    this.InteractorHandler_.update()
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChangeEnd_ = function(e){
    var frames = e.frames;
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	//
	// Put the renderers in the new layout frames
	//
	if (goog.isDefAndNotNull(frames[planeOr])){
	    //window.console.log("CHANGE END", this.LayoutHandler_.
	    //currLayoutTitle_, frames[planeOr].getElement());
	    renderPlane.setContainer(frames[planeOr].getElement());
	    renderPlane.updateStyle();
	}
    }.bind(this))


    //
    // Update the interactors
    //
    this.InteractorHandler_.update()
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.initLoadComponents_ = function() {
    //
    // Toggle menu
    //
    this.initToggleMenu_();

    //
    // Dialogs
    //
    this.initDialogs_();
    
    //
    // Layout Handler
    //
    this.initLayoutHandler_();

    //
    // Renderer
    //
    this.initRenderer_();

    //
    // Group menu
    //
    this.initViewableGroupMenu_();

    //
    // interactor handler
    //
    this.initInteractorHandler_();

    //
    // Sync layout menu to layout handler
    //
    this.InteractorHandler_.syncLayoutMenuToLayoutHandler(this.LayoutMenu_);

    //
    // Register that components have been loaded
    //
    this.hasLoadComponents_ = true;
}



/**
 * @param {number=} opt_fadeTime
 * @param {Function=} opt_onBegin Callback when animation starts.
 * @param {Function=} opt_onAnimate Callback when animation is running.
 * @param {Function=} opt_onEnd Callback when animation ends.
 * @private
 */
xiv.ui.ViewBox.prototype.fadeInLoadComponents_ = 
function(opt_fadeTime, opt_onBegin, opt_onAnimate, opt_onEnd) {
    opt_fadeTime = goog.isNumber(opt_fadeTime) ? opt_fadeTime : 500;
    var anims = [];
    var fadeables = [this.menus_.LEFT,
		     this.LayoutMenu_.getElement(), 
		     this.LayoutHandler_.getElement()];
    goog.array.forEach(fadeables, function(fadeable){
	anims.push(nrg.fx.generateAnim_Fade(fadeable, {'opacity':0}, 
					    {'opacity':1}, opt_fadeTime)); 
    })   
    nrg.fx.parallelAnimate(anims, opt_onBegin, opt_onAnimate, opt_onEnd);
}



/**
 * @param {!nrg.ui.Component} subComponent The component to show.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
 * @param {Function=} opt_callback The optional callback.
 * @private
 */
xiv.ui.ViewBox.prototype.hideSubComponent_ = 
function(subComponent, opt_fadeTime, opt_callback) {
    if (!goog.isDefAndNotNull(subComponent)) { return }

    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;

    var onOut = function(){
	subComponent.getElement().style.visibility = 'hidden';
	subComponent.getElement().style.zIndex = '-1';
	if (opt_callback) { opt_callback() };
    }

    if ((subComponent.getElement().style.visibility == 'hidden') ||
	(opt_fadeTime == 0)) { 
	onOut();
	return;
    } 
    nrg.fx.fadeOut(subComponent.getElement(), opt_fadeTime, onOut);
  
}




/**
 * @param {!nrg.ui.Component} subComponent The component to show.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
 * @param {Function=} opt_callback The optional callback function.
 * @private
 */
xiv.ui.ViewBox.prototype.showSubComponent_ = function(subComponent, 
						      opt_fadeTime,
						      opt_callback) {
    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;

    subComponent.getElement().style.opacity = '0';
    subComponent.getElement().style.zIndex = '1000';	
    subComponent.getElement().style.visibility = 'visible';

    if (opt_fadeTime == 0) { 
	subComponent.getElement().style.opacity = '1';
	if (opt_callback) { opt_callback() };
	return;
    } 

    nrg.fx.fadeIn(subComponent.getElement(), opt_fadeTime, function(){
	if (opt_callback) { opt_callback() };
    });
}




/**
* @private
*/
xiv.ui.ViewBox.prototype.initProgressBarPanel_ = function(){
    this.ProgressBarPanel_ = new xiv.ui.ProgressBarPanel(); 
    goog.dom.append(this.viewFrameElt_, this.ProgressBarPanel_.getElement());
    this.ProgressBarPanel_.getElement().style.opacity = 0;
    this.ProgressBarPanel_.getElement().style.zIndex = 100000;
    this.hideSubComponent_(this.ProgressBarPanel_);
}



/**
* @private
*/
xiv.ui.ViewBox.prototype.initDialogs_ = function(){
    this.Dialogs_ = new xiv.ui.ViewBoxDialogs(this);
}



/**
* @private
*/
xiv.ui.ViewBox.prototype.initInteractorHandler_ = function(){
    this.InteractorHandler_ = 
	new xiv.ui.ViewBoxInteractorHandler(this,
					    this.Renderer_, 
					    this.LayoutHandler_, 
					    this.Dialogs_);
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.addMenu_topLeft_ = function() {

    this.menus_.TOP_LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_top_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.CSS.MENU_TOP_LEFT,
	'viewbox': this.getElement().id
    });
    goog.dom.append(this.getElement(), this.menus_.TOP_LEFT);
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.addMenu_left_ = function() {
    this.menus_.LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.CSS.MENU_LEFT,
	'viewbox': this.getElement().id
    });
    this.menus_.LEFT.style.opacity = 0;
    goog.dom.append(this.getElement(), this.menus_.LEFT);
}




/**
 * @param {!string} menuLoc
 * @param {!Element} element
 * @param {number=} opt_insertInd 
 * @private
 */
xiv.ui.ViewBox.prototype.addToMenu = function(menuLoc, element, opt_insertInd){
    element.style.position = 'relative';
    element.style.display = 'block';
    element.style.marginLeft = 'auto';
    element.style.marginRight = 'auto';
    element.style.marginTop = '6px';
    element.style.marginBottom = '6px';

    var insertBeforeElt = null;
    var currMenu;

    switch(menuLoc){
    case 'TOP_LEFT':
	currMenu = this.menus_.TOP_LEFT;
	break;
    case 'LEFT':
	currMenu = this.menus_.LEFT;
	break;
    case 'BOTTOM_LEFT':
	currMenu = this.menus_.BOTTOM_LEFT;
	break;
    case 'TOP_RIGHT':
	currMenu = this.menus_.TOP_RIGHT;
	break;
    case 'RIGHT':
	currMenu = this.menus_.RIGHT;
	break;
    case 'BOTTOM_RIGHT':
	currMenu = this.menus_.BOTTOM_RIGHT;
	break;
    }

    //window.console.log(this.menus_.LEFT);
    if (goog.isNumber(opt_insertInd)){
	currMenu.insertBefore(element, 
		currMenu.childNodes[opt_insertInd])
    } else {
	goog.dom.append(currMenu, element);
    }
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.createLayoutMenu_ = function(){
    this.LayoutMenu_ = new nrg.ui.SlideInMenu();
    
    //
    // Add to left menu.
    //
    this.addToMenu('LEFT', this.LayoutMenu_.getElement());

    //
    // Class.
    //
    goog.dom.classes.add(this.LayoutMenu_.getElement(), 
	xiv.ui.ViewBox.CSS.VIEWLAYOUTMENU);

    //
    // Match settings
    //
    this.LayoutMenu_.matchMenuIconToSelected(true);
    this.LayoutMenu_.matchMenuTitleToSelected(true);

    //
    // Set opacities.
    //
    this.LayoutMenu_.getElement().style.opacity = 0;
    this.LayoutMenu_.getMenuHolder().style.opacity = 0;
    
    //
    // Append the holder to the view frame elt.
    //
    goog.dom.appendChild(this.viewFrameElt_, this.LayoutMenu_.getMenuHolder());
}



/**
 * @param {!Element}
 * @param {Function=}
 * @public
 */
xiv.ui.ViewBox.prototype.onToggleButtonClicked = 
function(button, opt_onCheck){
    button.setAttribute('checked', 
	(button.getAttribute('checked') == 'true') ? 'false': 'true');

    //window.console.log("\n\nCLICK", button);
  
    if (button.getAttribute('checked') == 'true') {
	goog.dom.classes.add(button, button.getAttribute(
	    xiv.ui.ViewBoxDialogs.TOGGLED_CLASS));
    } else {
	goog.dom.classes.remove(button, button.getAttribute(
	    xiv.ui.ViewBoxDialogs.TOGGLED_CLASS));
    }

    if (goog.isDefAndNotNull(opt_onCheck)){
	opt_onCheck(button);
    }
}



/**
 * @param {!string} buttonKey
 * @return {Element} The toggle button
 * @public
 */
xiv.ui.ViewBox.prototype.toggleButtonChecked = function(buttonKey){
    return this.toggleButtons_[buttonKey].
	getAttribute('checked').toString() == 'true';
}



/**
 * @param {!string} buttonKey
 * @return {Element} The toggle button
 * @public
 */
xiv.ui.ViewBox.prototype.getToggleButton = function(buttonKey){
    return this.toggleButtons_[buttonKey];
}



/**
 * @param {!string} buttonKey
 * @public
 */
xiv.ui.ViewBox.prototype.fireToggleButton = function(buttonKey){
    goog.testing.events.fireClickEvent(this.toggleButtons_[buttonKey]);
}



/**
 * @param {!string | !Array.<string>} buttonKeys
 * @public
 */
xiv.ui.ViewBox.prototype.untoggle = function(buttonKeys){
    if (!goog.isArray(buttonKeys)){
	buttonKeys = [buttonKeys];
    }

    goog.array.forEach(buttonKeys, function(buttonKey){
	if (goog.isDefAndNotNull(this.toggleButtons_[buttonKey]) &&
	    this.toggleButtonChecked(buttonKey)){
	    goog.testing.events.fireClickEvent(this.toggleButtons_[buttonKey]);
	}
    }.bind(this))
}




/**
 * @param {!string} menuLocation
 * @param {!string} defaultClass,
 * @param {!string} identifier
 * @param {!string} opt_title
 * @param {Function=} opt_onCheck
 * @param {src=} opt_src
 * @return {Element}
 * @throws {Error} If the identifier is already in use.
 * @public
 */
xiv.ui.ViewBox.prototype.createToggleButton = 
    function(menuLocation, defaultClass, identifier,
	     opt_title, opt_onCheck, opt_src) {
	//
	// Create the toggle button
	//
	var onClass = goog.getCssName(defaultClass, 'on')
	var iconbutton = goog.dom.createDom('img', defaultClass);
	iconbutton.id = this.makeId('IconButton_');
	iconbutton.title = opt_title;


	if (goog.isDefAndNotNull(opt_src)){
	    iconbutton.src = opt_src;
	}

	//
	// Set the default check stated
	//
	iconbutton.setAttribute('checked', 'true');
	iconbutton.setAttribute(xiv.ui.ViewBoxDialogs.TOGGLED_CLASS, 
				defaultClass + '-on')
	
	//
	// Add the 'on' class if it's default class is on
	//
	goog.dom.classes.add(iconbutton, onClass);

	//
	// Clean up the CSS
	//
	nrg.style.setStyle(iconbutton, {'cursor': 'pointer'})


	//
	// Toggle event
	//
	goog.events.listen(iconbutton, goog.events.EventType.CLICK, 
	function(e){
	    //window.console.log("CLICK", e.target);
	    this.onToggleButtonClicked(iconbutton, opt_onCheck);
	    
	    //iconbutton.getAttribute('checked').toString() == 'true');
	}.bind(this));

	//
	// Adds to menu
	//
	this.addToMenu(menuLocation, iconbutton);

	//
	// Store button
	//
	
	if (!goog.isDefAndNotNull(this.toggleButtons_)){
	    this.toggleButtons_ = {};
	}
	else if (goog.isDefAndNotNull(this.toggleButtons_[identifier])){
	    throw new Error('Invalid identifier for toggle button.  In use.');
	} 
	this.toggleButtons_[identifier] = iconbutton;
	//window.console.log(iconbutton, identifier);
	return iconbutton;
    }





/**
 * @private
 */
xiv.ui.ViewBox.prototype.initToggleMenu_ = function(){
    this.addMenu_left_();
    this.createLayoutMenu_();
}




/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initLayoutHandler_ = function(){
    this.LayoutHandler_ = new xiv.ui.layouts.LayoutHandler();
    //this.LayoutHandler_.animateLayoutChange(false);
    this.LayoutHandler_.getElement().style.opacity = 0;
    
    goog.dom.append(this.viewFrameElt_, this.LayoutHandler_.getElement());
    goog.dom.classes.add(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.VIEWLAYOUTHANDLER);

    //
    // EVENTS
    //
    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.RESIZE, 
	this.onLayoutResize_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_START, 
	this.onLayoutChangeStart_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGING, 
	this.onLayoutChanging_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_END, 
	this.onLayoutChangeEnd_.bind(this));
}



/**
 * As stated.
 *
 * @private
 */
xiv.ui.ViewBox.prototype.initViewableGroupMenu_ = function(){
    this.ViewableGroupMenu_ = new xiv.ui.ViewableGroupMenu();
    this.ViewableGroupMenu_.render(this.viewFrameElt_);

    goog.dom.append(this.viewFrameElt_, this.ViewableGroupMenu_.getElement());
    goog.dom.append(this.viewFrameElt_, 
		    this.ViewableGroupMenu_.getBackground());

    goog.dom.classes.add(this.ViewableGroupMenu_.getElement(), 
			 xiv.ui.ViewBox.CSS.VIEWABLEGROUPMENU)

    goog.events.listen(this.ViewableGroupMenu_, 
		       xiv.ui.ViewableGroupMenu.EventType.VIEWSELECTED, 
		       function(e){
			   //window.console.log("VIEW SELECT", e);

			   this.load(this.ViewableGroups_[
			       goog.getUid(e.thumbnail)], false)
		       }.bind(this))

    this.hideSubComponent_(this.ViewableGroupMenu_);
}




/**
 * @return {xiv.vis.RenderEngine}
 * @public
 */
xiv.ui.ViewBox.prototype.getToggleButtons = function(){
    return this.toggleButtons_;
}



/**
 * Initializes the 'xiv.ui.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 * @private
 */
xiv.ui.ViewBox.prototype.initRenderer_ = function(){
    this.Renderer_ = new xiv.vis.XtkEngine();

    //
    // Listen for Errors!
    //
    goog.events.listen(this.Renderer_, xiv.vis.XtkEngine.EventType.ERROR,
	function(e){
	    this.onRenderError_(e.message);
	}.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.updateStyle = function (opt_args) {
    goog.base(this, 'updateStyle', opt_args);

    this.updateStyle_LayoutHandler_();
    this.updateStyle_Renderer_();
    this.updateStyle_LayoutMenu_();

    if (goog.isDefAndNotNull(this.Dialogs_)){
	this.Dialogs_.update();
    }
  
    if (goog.isDefAndNotNull(this.InteractorHandler_)){
	this.InteractorHandler_.updateInteractorStyles();
    }
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutMenu_ = function () {
    if (!goog.isDefAndNotNull(this.LayoutMenu_)) { return };
    var frameSize = goog.style.getSize(this.viewFrameElt_);
    this.LayoutMenu_.setHidePosition(-100, frameSize.height/2 - 130);
    this.LayoutMenu_.setShowPosition(0, frameSize.height/2 - 130);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutHandler_ = function () {
    if (!goog.isDefAndNotNull(this.LayoutHandler_)) { return };
    this.LayoutHandler_.updateStyle();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_Renderer_ = function () {
    if (!this.Renderer_) { return };
    this.Renderer_.updateStyle();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.disposeLoadComponents_ = function () {
    
    // Clear the reference to the groups
    goog.object.clear(this.ViewableGroups_);
    goog.array.clear(this.ViewableTrees_);


    // Layout Handler
    if (goog.isDefAndNotNull(this.LayoutHandler_)){
    // Unlisten - Layout Handler
	goog.events.removeAll(this.LayoutHandler_);
	goog.dispose(this.LayoutHandler_.dispose());
	delete this.LayoutHandler_;
    }


    // LayoutMenu
    if (goog.isDefAndNotNull(this.LayoutMenu_)){
	// Unlisten - LayoutMenu 
	goog.events.removeAll(this.LayoutMenu_);	
	this.LayoutMenu_.dispose();
	delete this.LayoutMenu_;
    }

    // Renderer
    if (goog.isDefAndNotNull(this.Renderer_)){
	this.Renderer_.dispose();
	delete this.Renderer_;
    }


    // ViewableGroupMenu
    if (goog.isDefAndNotNull(this.ViewableGroupMenu_)){
	this.ViewableGroupMenu_.dispose();
	delete this.ViewableGroupMenu_;
    }

   
    // Dialogs
    if (goog.isDefAndNotNull(this.Dialogs_)){
	this.Dialogs_.disposeInternal();
    } 

    // Controller handler
    if (goog.isDefAndNotNull(this.InteractorHandler_)){
	this.InteractorHandler_.disposeInternal();
    } 
    
    if (goog.isDefAndNotNull(this.toggleButtons_)){
	goog.dom.removeNode(this.menus_.LEFT);
	delete this.menus_.LEFT;
	
	goog.object.forEach(this.toggleButtons_, function(button){
	    goog.events.removeAll(button);
	    goog.dom.removeNode(button);
	    button = null;
	})
	goog.array.clear(this.toggleButtons_);
	delete this.toggleButtons_;
    }
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.disposeInternal = function () {
    goog.base(this, 'disposeInternal');
    
    //
    // Dispose the load Components_
    //
    this.disposeLoadComponents_();

    //
    // Progress Bar Panel
    //
    if (goog.isDefAndNotNull(this.ProgressBarPanel_)){
	this.ProgressBarPanel_.dispose();
	delete this.ProgressBarPanel_;
    }    

    //
    // Elements - viewFrame
    //
    goog.dom.removeNode(this.viewFrameElt_);
    goog.events.removeAll(this.viewFrameElt_);
    delete this.viewFrameElt_;

    //
    // Elements - menus
    //
    goog.object.forEach(this.menus_, function(menu, key){
	goog.dom.removeNode(menu);
	delete this.menus_[key];
    }.bind(this))
    delete this.menus_;

    // Primitive types
    delete this.Viewables_;
    delete this.hasLoadComponents_;
}


goog.exportSymbol('xiv.ui.ViewBox.EventType', xiv.ui.ViewBox.EventType);
goog.exportSymbol('xiv.ui.ViewBox.ID_PREFIX', xiv.ui.ViewBox.ID_PREFIX);
goog.exportSymbol('xiv.ui.ViewBox.CSS_SUFFIX', xiv.ui.ViewBox.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ViewBox.defaultLayout', 
		  xiv.ui.ViewBox.defaultLayout);
goog.exportSymbol('xiv.ui.ViewBox.MIN_HOLDER_HEIGHT', 
		  xiv.ui.ViewBox.MIN_HOLDER_HEIGHT);
goog.exportSymbol('xiv.ui.ViewBox.SCAN_TAB_LABEL_HEIGHT', 
		  xiv.ui.ViewBox.SCAN_TAB_LABEL_HEIGHT);
goog.exportSymbol('xiv.ui.ViewBox.SCAN_TAB_LABEL_WIDTH',
		  xiv.ui.ViewBox.SCAN_TAB_LABEL_WIDTH);
goog.exportSymbol('xiv.ui.ViewBox.MIN_TAB_H_PCT', 
		  xiv.ui.ViewBox.MIN_TAB_H_PCT);

goog.exportSymbol('xiv.ui.ViewBox.prototype.getToggleButtons', 
		  xiv.ui.ViewBox.prototype.getToggleButtons);

goog.exportSymbol('xiv.ui.ViewBox.prototype.getMenus', 
		  xiv.ui.ViewBox.prototype.getMenus);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getLoadState', 
		  xiv.ui.ViewBox.prototype.getLoadState);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getViewableTrees', 
		  xiv.ui.ViewBox.prototype.getViewableTrees);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getLayoutHandler', 
		  xiv.ui.ViewBox.prototype.getLayoutHandler);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getViewableGroupMenu', 
		  xiv.ui.ViewBox.prototype.getViewableGroupMenu);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getViewFrame', 
		  xiv.ui.ViewBox.prototype.getViewFrame);
goog.exportSymbol('xiv.ui.ViewBox.prototype.highlight', 
		  xiv.ui.ViewBox.prototype.highlight);
goog.exportSymbol('xiv.ui.ViewBox.prototype.unhighlight', 
		  xiv.ui.ViewBox.prototype.unhighlight);
goog.exportSymbol('xiv.ui.ViewBox.prototype.getThumbnailLoadTime', 
		  xiv.ui.ViewBox.prototype.getThumbnailLoadTime);
goog.exportSymbol('xiv.ui.ViewBox.prototype.clearThumbnailLoadTime', 
		  xiv.ui.ViewBox.prototype.clearThumbnailLoadTime);
goog.exportSymbol('xiv.ui.ViewBox.prototype.updateIconSrcFolder', 
		  xiv.ui.ViewBox.prototype.updateIconSrcFolder);
goog.exportSymbol('xiv.ui.ViewBox.prototype.doNotHide', 
		  xiv.ui.ViewBox.prototype.doNotHide);
goog.exportSymbol('xiv.ui.ViewBox.prototype.setLayout', 
		  xiv.ui.ViewBox.prototype.setLayout);
goog.exportSymbol('xiv.ui.ViewBox.prototype.load', 
		  xiv.ui.ViewBox.prototype.load);
goog.exportSymbol('xiv.ui.ViewBox.prototype.checkInUseAndShowDialog', 
		  xiv.ui.ViewBox.prototype.checkInUseAndShowDialog);
goog.exportSymbol('xiv.ui.ViewBox.prototype.showInUseDialog', 
		  xiv.ui.ViewBox.prototype.showInUseDialog);
goog.exportSymbol('xiv.ui.ViewBox.prototype.addToMenu', 
		  xiv.ui.ViewBox.prototype.addToMenu);
goog.exportSymbol('xiv.ui.ViewBox.prototype.updateStyle', 
		  xiv.ui.ViewBox.prototype.updateStyle);
goog.exportSymbol('xiv.ui.ViewBox.prototype.disposeInternal', 
		  xiv.ui.ViewBox.prototype.disposeInternal);
