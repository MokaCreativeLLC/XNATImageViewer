goog.provide('xiv.sampleData.Sample');

/**
 * @param {!Array.string} files
 * @param {!Object.<string, string | number>} metadata
 * @param {!string} thumbnail
 * @param {!Array.string} folders
 * @param {string=} opt_zipUrl
 * @constructor
 * @struct
 */
xiv.sampleData.Sample = 
function(files, metadata, thumbnail, folders, opt_zipUrl){
    this.files = files;
    this.metadata = metadata;
    this.thumbnail = thumbnail;
    this.folders = folders;
    this.zipUrl = opt_zipUrl;
}
goog.exportSymbol('xiv.sampleData.Sample', xiv.sampleData.Sample);
