goog.require('gxnat.slicer.Node');



/**
 * @struct
 * @param {!string} fileName
 * @param {!Document | !Element} mrmlDoc
 * @param {!string} mrbUrl
 * @param {!string | !Array.<string>} fileList The file list of the given mrb
 *    where the mrml is located.
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.MrmlNode = function(fileName, mrmlDoc, mrbUrl, fileList) {
    goog.base(this);

    this.url = fileName;
    this.document = mrmlDoc;
    this.files = fileList;
    this.mrbUrl = mrbUrl
}
goog.inherits(gxnat.slicer.MrmlNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.MrmlNode', gxnat.slicer.MrmlNode);
