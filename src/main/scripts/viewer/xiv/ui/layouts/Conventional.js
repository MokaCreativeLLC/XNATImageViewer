/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.Conventional');

// goog
goog.require('goog.style')
goog.require('goog.events')
goog.require('goog.object')
goog.require('goog.array')
goog.require('goog.string')

// nrg
goog.require('nrg.ui.Resizable')
goog.require('nrg.string')
goog.require('nrg.style')

// xiv
goog.require('xiv.ui.layouts.Layout')
goog.require('xiv.ui.layouts.XyzvLayout')

//-----------


/**
 * xiv.ui.layouts.Conventional
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
xiv.ui.layouts.Conventional = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.Conventional, xiv.ui.layouts.XyzvLayout);
goog.exportSymbol('xiv.ui.layouts.Conventional', xiv.ui.layouts.Conventional);



/**
 * @type {!string}
 * @public
 * @expose
 */
xiv.ui.layouts.Conventional.TITLE = 'Conventional';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.Conventional.EventType = {}



/**
 * @type {!string}
 * @const
 * @expose
 */
xiv.ui.layouts.Conventional.ID_PREFIX =  'xiv.ui.layouts.Conventional';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.layouts.Conventional.CSS_SUFFIX = {
    X: 'x',
    Y: 'y',
    Z: 'z',
    V: 'v',
    V_BOUNDARY: 'v-boundary'
}




/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_X = function(){
    goog.base(this, 'setupLayoutFrame_X');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('X', ['RIGHT', 'TOP_RIGHT']);

    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['X'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE,
        this.onLayoutFrameResize_X.bind(this));

    goog.events.listen(this.LayoutFrames['X'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE_END,
        this.updateStyle.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Y = function(){
    goog.base(this, 'setupLayoutFrame_Y');

    // Do nothing for now

}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Z = function(){
    goog.base(this, 'setupLayoutFrame_Z');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('Z', ['RIGHT', 'TOP_RIGHT']);

    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['Z'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE,
        this.onLayoutFrameResize_Z.bind(this));

    goog.events.listen(this.LayoutFrames['Z'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE_END,
        this.updateStyle.bind(this));
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_V = function(){
    goog.base(this, 'setupLayoutFrame_V');

    //
    // Set the plane resizable
    //
    this.setLayoutFrameResizable('V', 'BOTTOM');

    //
    // Listen for the RESIZE event.
    //
    goog.events.listen(this.LayoutFrames['V'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE,
        this.onLayoutFrameResize_V.bind(this));


    goog.events.listen(this.LayoutFrames['V'].getResizable(),
        nrg.ui.Resizable.EventType.RESIZE_END,
        this.updateStyle.bind(this));
}


/**
 * @param {Function=};
 * @private
 */
xiv.ui.layouts.Conventional.prototype.onZXLayoutFrameResize_ =
    function(callback, e){
        this.calcDims();
        var xSize = goog.style.getSize(this.LayoutFrames['X'].getElement());
        var ySize = goog.style.getSize(this.LayoutFrames['Y'].getElement());
        var zSize = goog.style.getSize(this.LayoutFrames['Z'].getElement());
        callback(xSize, ySize, zSize);
    }



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_X = function(e){
    this.onZXLayoutFrameResize_(function(xSize, ySize, zSize){
        var yWidth = Math.max(this.currSize.width - xSize.width - zSize.width,
            this.minLayoutFrameWidth_);
        var zWidth = zSize.width;
        var xTop = this.currSize.height - xSize.height;
        if(this.minLayoutFrameWidth_ == yWidth){
            zWidth = Math.max(this.currSize.width - xSize.width - ySize.width,
                this.minLayoutFrameWidth_);
            goog.style.setPosition(this.LayoutFrames['X'].getElement(),
                zWidth, xTop);
        }

        //
        // Z LayoutFrame
        //
        goog.style.setPosition(this.LayoutFrames['Z'].getElement(),
            0, xTop);
        goog.style.setSize(this.LayoutFrames['Z'].getElement(),
            zWidth, xSize.height);

        //
        // Y LayoutFrame
        //
        goog.style.setPosition(this.LayoutFrames['Y'].getElement(),
            zSize.width + xSize.width, xTop);
        goog.style.setSize(this.LayoutFrames['Y'].getElement(),
            yWidth, xSize.height);

        //
        // V LayoutFrame
        //
        goog.style.setSize(this.LayoutFrames['V'].getElement(),
            this.currSize.width,
            this.currSize.height - xSize.height);
    }.bind(this), e);

    //
    // Dispatch
    //
    this.dispatchResize();
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_Z = function(e){
    this.onZXLayoutFrameResize_(function(xSize, ySize, zSize){
        var xWidth = Math.max(this.currSize.width - zSize.width - ySize.width,
            this.minLayoutFrameWidth_);
        var yWidth = ySize.width;
        var zTop = this.currSize.height - zSize.height
        if(this.minLayoutFrameWidth_ == xWidth){
            yWidth = Math.max(this.currSize.width - zSize.width - xSize.width,
                this.minLayoutFrameWidth_);
        }

        //
        // X LayoutFrame
        //
        goog.style.setPosition(this.LayoutFrames['X'].getElement(),
            zSize.width, zTop);
        goog.style.setSize(this.LayoutFrames['X'].getElement(),
            xWidth, zSize.height);

        //
        // Y LayoutFrame
        //
        goog.style.setPosition(this.LayoutFrames['Y'].getElement(),
            zSize.width + xWidth, zTop);
        goog.style.setSize(this.LayoutFrames['Y'].getElement(),
            yWidth, ySize.height);

        //
        // V LayoutFrame
        //
        goog.style.setSize(this.LayoutFrames['V'].getElement(),
            this.currSize.width,
            this.currSize.height - zSize.height);
    }.bind(this), e)

    //
    // Dispatch
    //
    this.dispatchResize();
}



/**
 * @override
 * @param {!Event} e
 */
xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_V = function(e){
    this.calcDims();
    var xyzTop = parseInt(this.LayoutFrames['V'].getElement().style.height);
    var xyzHeight = this.currSize.height - xyzTop;

    goog.object.forEach(this.LayoutFrames, function(plane){
        //
        // Skip V
        //
        if (plane === this.LayoutFrames['V']) {return};

        //
        // Adjust others
        //
        nrg.style.setStyle(plane.getElement(), {
            'top': xyzTop,
            'height': xyzHeight
        })
    }.bind(this))

    //
    // Update
    //
    this.updateStyle_X();
    this.updateStyle_Y();

    //
    // Required!
    //
    this.dispatchResize();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    //window.console.log('Conventional update', this.currSize);
    //this.calcDims();
    this.updateStyle_V();
    this.updateXyzHeights_();
    this.updateXyzWidths_();

    this.updateStyle_X();
    this.updateStyle_Y();
    this.updateStyle_Z();
}



/**
 * @private
 */
xiv.ui.layouts.Conventional.prototype.updateXyzHeights_ = function() {
    var vHeight = parseInt(this.LayoutFrames['V'].getElement().style.height);
    var xyzHeight = Math.max(
        this.currSize.height - vHeight, this.minLayoutFrameHeight_);
    this.loopXyz(function(frame, key){
        frame.getElement().style.top = vHeight + 'px';
        frame.getElement().style.height = xyzHeight + 'px';
    })
}



/**
 * @private
 */
xiv.ui.layouts.Conventional.prototype.updateXyzWidths_ = function() {
    var frameSize;
    var widthDiff = 1 - ((this.prevSize.width - this.currSize.width) /
        this.prevSize.width);
    if (this.prevSize.width !== this.currSize.width) {
        this.loopXyz(function(frame, key){
            frameSize = goog.style.getSize(frame.getElement());
            frame.getElement().style.width =
                Math.max(frameSize.width * widthDiff,
                    this.minLayoutFrameWidth_).toString() + 'px';
        }.bind(this))
    }
}



/**
 * @param {!string} Either or the Z or X plane string.
 * @private
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_ZX_ = function(plane) {
    var vHandle = this.LayoutFrames['V'].getResizable().
        getResizeDragger('BOTTOM');
    var boundaryElt = this.LayoutFrames[plane].getResizable().
        getBoundaryElement();
    var planePos = goog.style.getPosition(this.LayoutFrames[plane].
        getElement());
    var planeSize = goog.style.getSize(this.LayoutFrames[plane].getElement());

    //
    // Boundary
    //
    goog.style.setPosition(boundaryElt,
        parseInt(boundaryElt.style.left),
        this.minLayoutFrameHeight_);
    goog.style.setSize(boundaryElt,
        this.currSize.width - this.minLayoutFrameWidth_ * 3,
        this.currSize.height - this.minLayoutFrameHeight_ * 2);

    //
    // Right Handle
    //
    var rightHandle = this.LayoutFrames[plane].getResizable().getHandle('RIGHT')
    goog.style.setPosition(rightHandle, planePos.x + planeSize.width,
        planePos.y);
    goog.style.setHeight(rightHandle,
        this.currSize.height - vHandle.handlePos.y);

    //
    // Top-right handle
    //
    goog.style.setPosition(
        this.LayoutFrames[plane].getResizable().getHandle('TOP_RIGHT'),
        planePos.x + planeSize.width, planePos.y);

    //
    // IMPORTANT!!
    //
    this.LayoutFrames[plane].getResizable().update();
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_X = function() {
    //
    // Set the left of the frame
    //
    this.LayoutFrames['X'].getElement().style.left =
        this.LayoutFrames['Z'].getElement().style.width

    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
        this.LayoutFrames['X'].getResizable().getBoundaryElement(), {
            'left': this.minLayoutFrameWidth_ * 2
        })

    //
    // Call common
    //
    this.updateStyle_ZX_('X');
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_Y = function() {
    this.LayoutFrames['Y'].getElement().style.left =
        (parseInt(this.LayoutFrames['Z'].getElement().style.width) +
            parseInt(this.LayoutFrames['X'].getElement().style.width)).toString() +
            'px';
}



/**
 * @inheritDoc
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_Z = function() {
    //
    // Set the left of the boundary
    //
    nrg.style.setStyle(
        this.LayoutFrames['Z'].getResizable().getBoundaryElement(), {
            'left': this.minLayoutFrameWidth_
        })

    //
    // Call common
    //
    this.updateStyle_ZX_('Z');
}



/**
 * @private
 */
xiv.ui.layouts.Conventional.prototype.updateStyle_V = function() {

    //
    // Scale accordingly
    //
    if ((this.prevSize.width !== this.currSize.width) ||
        (this.prevSize.height !== this.currSize.height)) {

        var frameSize = goog.style.getSize(this.LayoutFrames['V'].getElement());
        var heightDiff = 1 - ((this.prevSize.height - this.currSize.height) /
            this.prevSize.height);

        goog.style.setSize(this.LayoutFrames['V'].getElement(),
            this.currSize.width,
            Math.max(frameSize.height * heightDiff,
                this.minLayoutFrameHeight_));
    }


    //
    // Boundary
    //
    goog.style.setPosition(
        this.LayoutFrames['V'].getResizable().getBoundaryElement(),
        this.currSize.width,
        this.minLayoutFrameHeight_);

    goog.style.setSize(
        this.LayoutFrames['V'].getResizable().getBoundaryElement(),
        this.currSize.width - this.minLayoutFrameWidth_ * 3,
        this.currSize.height - this.minLayoutFrameHeight_ * 2);

    //
    // Top handle
    //
    var topHandle = this.LayoutFrames['V'].getResizable().getHandle('BOTTOM')
    goog.style.setPosition(topHandle,
        0,  goog.style.getSize(this.LayoutFrames['V'].getElement()).height);
    goog.style.setWidth(topHandle, this.currSize.width)



    //
    // IMPORTANT!!
    //
    this.LayoutFrames['V'].getResizable().update();
}




goog.exportSymbol('xiv.ui.layouts.Conventional.TITLE',
    xiv.ui.layouts.Conventional.TITLE);
goog.exportSymbol('xiv.ui.layouts.Conventional.EventType',
    xiv.ui.layouts.Conventional.EventType);
goog.exportSymbol('xiv.ui.layouts.Conventional.ID_PREFIX',
    xiv.ui.layouts.Conventional.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.Conventional.CSS_SUFFIX',
    xiv.ui.layouts.Conventional.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_X',
    xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_X);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Y',
    xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Y);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Z',
    xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_Z);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_V',
    xiv.ui.layouts.Conventional.prototype.setupLayoutFrame_V);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_Z',
    xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_Z);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_X',
    xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_X);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_V',
    xiv.ui.layouts.Conventional.prototype.onLayoutFrameResize_V);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.updateStyle',
    xiv.ui.layouts.Conventional.prototype.updateStyle);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.updateStyle_X',
    xiv.ui.layouts.Conventional.prototype.updateStyle_X);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.updateStyle_Y',
    xiv.ui.layouts.Conventional.prototype.updateStyle_Y);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.updateStyle_Z',
    xiv.ui.layouts.Conventional.prototype.updateStyle_Z);
goog.exportSymbol('xiv.ui.layouts.Conventional.prototype.updateStyle_V',
    xiv.ui.layouts.Conventional.prototype.updateStyle_V);
