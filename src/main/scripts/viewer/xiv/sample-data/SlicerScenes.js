// xiv
goog.require('xiv.sampleData.Sample');
goog.require('xiv.sampleData.SampleCollection');

//-----------

/**
 * @extends {xiv.sampleData.SampleCollection}
 * @constructor
 */
goog.provide('xiv.sampleData.SlicerScenes');
xiv.sampleData.SlicerScenes = function() {
    goog.base(this);
    this.Samples.push(this.sample1_);
}
goog.inherits(xiv.sampleData.SlicerScenes, xiv.sampleData.SampleCollection);
goog.exportSymbol('xiv.sampleData.SlicerScenes', xiv.sampleData.SlicerScenes);




/**
 * @const
 * @type {!xiv.sampleData.Sample}
 * @private
 */
xiv.sampleData.SlicerScenes.prototype.sample1_ = new xiv.sampleData.Sample ([
    'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/VolumeOnly/Slicer Data Bundle Scene View.png',
    'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/VolumeOnly/VolumeOnly.mrml',
    'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/VolumeOnly/Data/MRHead.nrrd',
], {
    'Type': "Slicer Scene",
}, 
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/VolumeOnly/Slicer Data Bundle Scene View.png',
['Test Project 1', 
 'Test Subject 1', 
 'Test Experiment 1-1'])

