goog.provide('xiv.sampleData.SampleCollection');


// goog
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.Disposable');

// xiv
goog.require('xiv.sampleData.Sample');

//-----------


/**
 * @extends {goog.Disposable}
 * @constructor
 */
xiv.sampleData.SampleCollection = function(){
    goog.base(this);

    /**
     * @type {Array.<xiv.sampleData.Sample>}
     * @protected
     */
    this.Samples = [];
}
goog.inherits(xiv.sampleData.SampleCollection, goog.Disposable)
goog.exportSymbol('xiv.sampleData.SampleCollection', 
		  xiv.sampleData.SampleCollection);



/**
 * @return  {Array.<xiv.sampleData.Sample>}
 * @protected
 */
xiv.sampleData.SampleCollection.prototype.getSamples = function(Sample){
    return this.Samples;
}



/**
 * @inheritDoc
 */
xiv.sampleData.SampleCollection.prototype.dispose = function(){
    goog.base(this, 'dispose');

    //
    // Delete the samples
    //
    goog.array.forEach(this.Samples, function(Sample){
	goog.object.clear(Sample);
    })
    delete this.Samples;
}


goog.exportSymbol('xiv.sampleData.SampleCollection.Samples', 
		  xiv.sampleData.SampleCollection.Samples);
goog.exportSymbol('xiv.sampleData.SampleCollection.getSamples', 
		  xiv.sampleData.SampleCollection.getSamples);
goog.exportSymbol('xiv.sampleData.SampleCollection.dispose', 
		  xiv.sampleData.SampleCollection.dispose);
