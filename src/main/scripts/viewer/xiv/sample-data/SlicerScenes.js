goog.provide('xiv.sampleData.SlicerScenes');

// xiv
goog.require('xiv.sampleData.Sample');
goog.require('xiv.sampleData.SampleCollection');

//-----------

/**
 * @extends {xiv.sampleData.SampleCollection}
 * @constructor
 */
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
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Slicer Data Bundle Scene View_1.png',
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/XnatSamples_MR1_MeshAnd2Vol.mrml',
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Data/1.3.12.2.1107.5.2.32.35177.30000006121218324675000000034-4-176-slutbu.dcm.nrrd',
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Data/4%3a%20t1_mpr_1mm_p2_pos50-label.nrrd',
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Data/F.fcsv',
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Data/brain.vtk'
], {
    'Name': 'Example Slicer Scene',
    'Type': "Slicer Scene",
}, 
'src/main/scripts/viewer/xiv/sample-data/slicer-scenes/SampleScene2/Slicer Data Bundle Scene View_1.png',
['Test Project 1-P', 
 'Test Subject 1-S', 
 'Test Experiment 1-E'])

