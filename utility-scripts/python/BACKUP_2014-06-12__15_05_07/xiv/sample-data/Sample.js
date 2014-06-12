/**
 * @param {!Array.string} files
 * @param {!Object.<string, string | number>} metadata
 * @param {!string} thumbnail
 * @param {!Array.string} folders
 * @constructor
 * @struct
 */
goog.provide('xiv.sampleData.Sample');
xiv.sampleData.Sample = function(files, metadata, thumbnail, folders){
    this.files = files;
    this.metadata = metadata;
    this.thumbnail = thumbnail;
    this.folders = folders;
}
goog.exportSymbol('xiv.sampleData.Sample', xiv.sampleData.Sample);
