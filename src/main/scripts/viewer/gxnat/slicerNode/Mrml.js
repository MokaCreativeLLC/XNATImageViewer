goog.require('gxnat.slicerNode.Node');



/**
 * @struct
 * @param {!string} fileName
 * @param {!Document | !Element} mrmlDoc
 * @param {!string} mrbUrl
 * @param {!string | !Array.<string>} fileList The file list of the given mrb
 *    where the mrml is located.
 * @extends {gxnat.slicerNode.Node}
 */
goog.provide('gxnat.slicerNode.Mrml');
gxnat.slicerNode.Mrml = function(fileName, mrmlDoc, mrbUrl, fileList) {
    goog.base(this);
    this.url = fileName;
    this.document = mrmlDoc;
    this.files = fileList;
    this.mrbUrl = mrbUrl
}
goog.inherits(gxnat.slicerNode.Mrml, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.Mrml', gxnat.slicerNode.Mrml);
