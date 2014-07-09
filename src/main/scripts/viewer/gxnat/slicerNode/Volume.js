// goog
goog.require('goog.array');
goog.require('goog.math.Matrix');

// gxnat
goog.require('gxnat');
goog.require('gxnat.slicerNode');
goog.require('gxnat.slicerNode.Display');



/**
 * @struct
 * @constructor
 * @extends {gxnat.slicerNode.Display}
 */
goog.provide('gxnat.slicerNode.Volume');
gxnat.slicerNode.Volume = 
function(sceneViewElt, sceneViewDisplayableElt, selectedVolumeID) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);

    var i = 0;
    var sliceToRAS, _axial, _sagittal, _coronal;
    for (; i < 3; i++){

	/**
	window.console.log(
	    sceneViewElt,
	    '\n',
	    sceneViewElt.getElementsByTagName('Slice')[i].getAttribute('name'),
	    sceneViewElt.getElementsByTagName('Slice')[i],
	    sceneViewElt.getElementsByTagName('Slice')[i].
		getAttribute('sliceToRAS'))
	*/

	sliceToRAS = sceneViewElt.getElementsByTagName('Slice')[i].
	    getAttribute('sliceToRAS').split(' ').map(parseFloat);

	sliceToRASMatrix = goog.math.Matrix.map(
	    new goog.math.Matrix(4, 4), 
	    function(value, i,j){
		return sliceToRAS[i*4 + j];
	    })

	switch(i){
	case 0:
	    _axial = sliceToRASMatrix;
	    break;
	case 1:
	    _sagittal = sliceToRASMatrix;
	    break;
	case 2:
	    _coronal = sliceToRASMatrix;
	    break;
	}
    }


    this.sliceToRAS = 
	new gxnat.slicerNode.Volume.sliceToRAS(
	    _sagittal, _coronal, _axial);
    

    var isSelectedVol = 
	(selectedVolumeID !== sceneViewDisplayableElt.getAttribute('id')) ? 
	    false : true;

    var isVisible = false;
    if (isSelectedVol) {
	var sliceElts = sceneViewElt.getElementsByTagName('Slice');
	var i = 0;
	var len = sliceElts.length;
	for (; i<len; i++){
	    isVisible = sliceElts[i].getAttribute('sliceVisibility') 
		=== 'true' || false;
	    if (isVisible){ break };
	}
    } 



    // Is selected volume.
    this.isSelectedVolume = isSelectedVol;
    
    // Upper threshold
    this.upperThreshold = this.displayNodeElement ? 
	parseInt(this.displayNodeElement.
		 getAttribute('upperThreshold')) : null;
    
    // Lower threshold
    this.lowerThreshold = this.displayNodeElement ? 
	parseInt(this.displayNodeElement.
		 getAttribute('lowerThreshold')) : null;

    // Visible
    this.visible = isVisible;
    
}
goog.inherits(gxnat.slicerNode.Volume, gxnat.slicerNode.Display)
goog.exportSymbol('gxnat.slicerNode.Volume', 
		  gxnat.slicerNode.Volume);



/**
 * @struct
 * @param {!goog.math.Matrix} sagittal
 * @param {!goog.math.Matrix} coronal
 * @param {!goog.math.Matrix} axial
 */

gxnat.slicerNode.Volume.sliceToRAS = 
function(sagittal, coronal, axial) {

    this.sagittal = sagittal;
    this.coronal = coronal;
    this.axial = axial;

    var _origin = new goog.math.Matrix([[0],[0],[0],[1]]);
    var transforms = [sagittal, coronal, axial];


    goog.array.forEach(transforms, function(transform, i){
	var center = transform.multiply(_origin).toArray();
	center = [center[0][0], center[1][0], center[2][0]];

	switch(i){
	case 0:
	    this.sagittalSliceCenter = center;
	    break;
	case 1:
	    this.coronalSliceCenter = center;
	    break;
	case 2:
	    this.axialSliceCenter = center;
	    break;
	}
    }.bind(this))

    //window.console.log('\n\n\n', this)
}
goog.exportSymbol('gxnat.slicerNode.Volume.sliceToRAS', 
		  gxnat.slicerNode.Volume.sliceToRAS);
