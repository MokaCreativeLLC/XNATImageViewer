/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      'Free software' is a matter of liberty, not price.
 *      'Free' as in 'free speech', not as in 'free beer'.
 *                                         - Richard M. Stallman
 * 
 * 
 * CREDITS: Thank you to Thomas J. Re for his initial implementation.
 *
 */
// provides
goog.provide('X.parserDCM');
// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.math.Vec3');
/**
 * Create a parser for DICOM files.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserDCM = function() {
  //
  // call the standard constructor of X.parser
  goog.base(this);
  //
  // class attributes
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserDCM';
};
// inherit from X.parser
goog.inherits(X.parserDCM, X.parser);



/**
 * @inheritDoc
 */
X.parserDCM.prototype.parse = function(container, object, data, flag) {
  // X.TIMER(this._classname + '.parse');
  // needed, for renderer2d and 3d legacy...
  object.MRI = {};
  object.MRI.loaded_files = 0;
//window.console.log("\n\nBegin parse");
  // parse the byte stream
  this.parseStream(data, object);

  // return;
  // X.TIMERSTOP(this._classname + '.parse');
  // check if all slices were completed loaded
  if (!goog.isDefAndNotNull(object._file.length) || object.slices.length == object._file.length) {

    // needed, for renderer2d and 3d legacy...
    object.MRI.loaded_files = object._file.length;

    // sort slices per series
    var series = {};
    var imageSeriesPushed = {};
    for (var i = 0; i < object.slices.length; i++) {

      // series undefined yet
      if(!series.hasOwnProperty(object.slices[i]['series_instance_uid'])){

        series[object.slices[i]['series_instance_uid']] = new Array();
        imageSeriesPushed[object.slices[i]['series_instance_uid']] = {};

      }
      
      // push image if it has not been pushed yet
      if(!imageSeriesPushed[object.slices[i]['series_instance_uid']].hasOwnProperty(object.slices[i]['sop_instance_uid'])){

        imageSeriesPushed[object.slices[i]['series_instance_uid']][object.slices[i]['sop_instance_uid']] = true;
        series[object.slices[i]['series_instance_uid']].push(object.slices[i]);

      }

    }

    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    ////////////////////////////////////////////////////////////////////////

    // GLOBAL PARAMETERS
    // pointer to first image
    var seriesInstanceUID = Object.keys(series)[0];
    var first_image = series[seriesInstanceUID];



    // number of unique slices available
    var first_image_stacks = first_image.length;
    // container for volume specific information
    var volumeAttributes = {};

    ////////////////////////////////////////////////////////////////////////
    //
    // ORDER SLICES
    //
    ////////////////////////////////////////////////////////////////////////

    //
    // we can order slices based on
    //
    // image_position_patient:
    // -> each slice show have a different 'image_position_patient'
    // -> The Image Position (0020,0032) specifies the x, y, and z coordinates of
    // -> -> the upper left hand corner of the image; it is the center of the first
    // -> -> voxel transmitted. Image Orientation (0020,0037) specifies the direction
    // -> -> cosines of the first row and the first column with respect to the patient.
    // -> -> These Attributes shall be provide as a pair. Row value for the x, y, and
    // -> -> z axes respectively followed by the Column value for the x, y, and z axes
    // -> -> respectively.
    //
    // in some cases, such as diffusion, 'image_position_patient' is the same for all
    // slices. We should then use the instance_number to order the slices.
    // 
    // instance_number:
    // -> each slice show have a different 'instance_number'
    // -> A number that identifies this raw data. 
    // -> -> The value shall be unique within a series

    var _ordering = 'image_position_patient';


    if(first_image_stacks == 1){
        
        // ORDERING BASED ON IMAGE POSITION
        _ordering = 'image_position_patient';

        // set distance to 0
        series[seriesInstanceUID][0]['dist'] = 0;

		//window.console.log("ORDERING 0");

    }
    else if(first_image[0]['image_position_patient'][0] != first_image[1]['image_position_patient'][0] ||
      first_image[0]['image_position_patient'][1] != first_image[1]['image_position_patient'][1] ||
      first_image[0]['image_position_patient'][2] != first_image[1]['image_position_patient'][2]){

        // ORDERING BASED ON IMAGE POSITION
        _ordering = 'image_position_patient';

        // set distances
        var _x_cosine = new goog.math.Vec3(first_image[0]['image_orientation_patient'][0],
          first_image[0]['image_orientation_patient'][1], first_image[ 0 ]['image_orientation_patient'][2]);

        var _y_cosine = new goog.math.Vec3(first_image[ 0 ]['image_orientation_patient'][3],
          first_image[ 0 ]['image_orientation_patient'][4], first_image[ 0 ]['image_orientation_patient'][5]);

        var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

        function computeDistance(flag, arrelem)
          {
            arrelem['dist'] = arrelem['image_position_patient'][0]*flag.x +
              arrelem['image_position_patient'][1]*flag.y +
              arrelem['image_position_patient'][2]*flag.z;
            return arrelem;
          }

      // compute dist in this series
      first_image.map(computeDistance.bind(null, _z_cosine));
      // order by dist
      first_image.sort(function(a,b){return a["dist"]-b["dist"]});
    
	//
	// MOKA / NRG MOD START
	//
	//window.console.log("\n\n\nNRG: It's here where it creates errors!! We want to use the instance below.");
	//window.console.log("ORDERING 1");
	//
	// MOKA / NRG MOD END
	//
	
    }
    else if(first_image[0]['instance_number'] != first_image[1]['instance_number']){
    
      // ORDERING BASED ON instance number
      _ordering = 'instance_number';
      first_image.sort(function(a,b){return a["instance_number"]-b["instance_number"]});
    
	window.console.log("ORDERING 2");
    }
    else{

      window.console.log("Could not resolve the ordering mode");

    }


    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    ////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////
    //
    // COMPUTE SPACING
    //
    ////////////////////////////////////////////////////////////////////////

    if(isNaN(first_image[0]['pixel_spacing'][0])){

      first_image[0]['pixel_spacing'][0] = 1.;

    }

    if(isNaN(first_image[0]['pixel_spacing'][1])){

      first_image[0]['pixel_spacing'][1] = 1.;

    }



      //************************************
      //
      // MOKA / NRG MOD START
      // 
      //************************************
      //
      // Occasionally there are ordering errors based on image_position_patient (the first
      // else-if statement) approach, so we have to catch for that.
      //
      // It's also important to set the _ordering to "instance_number" because that translates
      // into various calculations below.  

      // NOTE: This has only pertained to either Little Endian Implicit Dicoms, or DICOM sets where the 
      // ordering is not consistent with the 'instance_number' property.
      //
      //window.console.log('First image', first_image[0]);
      if (first_image.length > 1){
	  var _isLittleEndianImplicit = first_image[0]['transfer_syntax_uid'] == '1.2.840.10008.1.2';
	  var _isUnorderedByInstanceNumber = true;
	  var _forceInstanceSort = false;
	  var j = 0;
	  var len = first_image.length-1;

	  function forceInstanceNumberOrdering(){
	      _ordering = 'instance_number';
	      first_image.sort(function(a,b){return a["instance_number"]-b["instance_number"]});
	      var warningStr = 
		  "\n\nNRG-modified parserDCM.js: " +
		  "Forcing 'instance_number' slice reordering."
	      /**
		 for one of the following reasons: \n" + 
		 "\t1) DICOMs are Little Endian Implicit format.\n" + 
		 "\t2) DICOMS are unordered after geometric sorting (e.g. " +
		  "sorting slices by 'image_position_patient' did not provide correct ordering).\n" + 
		  "\n\n";
	      */
	      window.console.log(warningStr);
	  }

	  for (; j<len; j++){
	      if (Math.abs(first_image[j]['instance_number'] - first_image[j+1]['instance_number']) != 1){
		  _isUnorderedByInstanceNumber = true;
		  break;
	      }
	  }
	  if(_isLittleEndianImplicit || _isUnorderedByInstanceNumber || _forceInstanceSort){
	      forceInstanceNumberOrdering();
	  }
      }
      //************************************
      //
      // MOKA / NRG MOD END
      // 
      //************************************


    if( first_image_stacks > 1) {

      switch(_ordering){
        case 'image_position_patient':
          // We work only on 2 first slices
          var _first_position = first_image[ 0 ]['image_position_patient'];
          var _second_image_position = first_image[ 1 ]['image_position_patient'];
          var _x = _second_image_position[0] - _first_position[0];
          var _y = _second_image_position[1] - _first_position[1];
          var _z = _second_image_position[2] - _first_position[2];
          first_image[0]['pixel_spacing'][2] = Math.sqrt(_x*_x + _y*_y  + _z*_z);




	  //************************************
	  //
	  // MOKA / NRG MOD START
	  //
	  //************************************
	  window.console.log("PIXEL SPACING", 
			     first_image[0] == first_image[1],
			     _first_position, _second_image_position,
			     first_image[0]['pixel_spacing'][2],
			     first_image[ 0 ],
			     first_image[ 1 ],
			     first_image[first_image.length - 1]
			    );

	  var i = 0;
	  var len = first_image.length;
	  for (; i<len; i++){
	      window.console.log("INSTANCES: ", first_image[i]['instance_number']);
	  }
          break;
	  //************************************
	  //
	  // MOKA / NRG MOD END
	  //
	  //************************************




        case 'instance_number':
          first_image[0]['pixel_spacing'][2] = 1.0;
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }

    }
    else {

      first_image[0]['pixel_spacing'][2] = 1.0;

    }


    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    // -> we estimated the spacing in all directions
    ////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////
    //
    // Estimate number of slices we are expecting
    //
    ////////////////////////////////////////////////////////////////////////

    // we execpt at least one image :)
    var first_image_expected_nb_slices = 1;
    switch(_ordering){
      case 'image_position_patient':
        // get distance between 2 points
        var _first_position = first_image[ 0 ]['image_position_patient'];
        var _last_image_position = first_image[ first_image_stacks - 1]['image_position_patient'];
        var _x = _last_image_position[0] - _first_position[0];
        var _y = _last_image_position[1] - _first_position[1];
        var _z = _last_image_position[2] - _first_position[2];
        var _distance_position = Math.sqrt(_x*_x + _y*_y  + _z*_z);
        //normalize by z spacing


        first_image_expected_nb_slices 
	    += Math.round(_distance_position/first_image[0]['pixel_spacing'][2]);



        break;
      case 'instance_number':

	//window.console.log("instance number",
	//first_image[ first_image_stacks - 1]['instance_number'] , first_image[0]['instance_number']);

        first_image_expected_nb_slices += 
	Math.abs(first_image[ first_image_stacks - 1]['instance_number'] - first_image[0]['instance_number']);


        break;
      default:
        window.console.log("Unkown ordering mode - returning: " + _ordering);
        break;
    }

    var first_slice_size = first_image[0]['columns'] * first_image[0]['rows'];
    var first_image_size = first_slice_size * (first_image_expected_nb_slices);

    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    // -> we estimated the spacing in all directions
    // -> we know how many slices we expect in the best case
    ////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////
    //
    // Prepare and fill data container
    //
    ////////////////////////////////////////////////////////////////////////

    var first_image_data = null;


      //window.console.log('BITS ALLOCATED', first_image[0].bits_allocated);
      //window.console.log("FIRST IMAGE", first_image);
      //window.console.log("FIRST IMAGE 0", first_image[1]);

    // create data container

      //window.console.log("\n\nFIRST IMAGE SIZE", first_image_size);
    switch (first_image[0].bits_allocated) {
      case 8:
        first_image_data = new Uint8Array(first_image_size);
        break;
      case 16:
        first_image_data = new Uint16Array(first_image_size);
        break;
      case 32:
        first_image_data = new Uint32Array(first_image_size);
      default:
        window.console.log("Unknown number of bits allocated - using default: 32 bits");
        break;
    }

    object._spacing = first_image[0]['pixel_spacing'];

    // fill data container
    // by pushing slices where we expect them
    // 
    // for instance, we have 3 non-consecutive slices
    // we are expecting 4 slices, the 3rd one is missing
    //
    // BEFORE:
    //
    // 0000000
    // 0000000
    // 0000000
    // 0000000
    //
    // AFTER:
    //
    // 1234123 -> first slice
    // 1234211 -> second slice
    // 0000000
    // 1232414 -> third slice

    for (var _i = 0; _i < first_image_stacks; _i++) {
      // get data
      var _data = first_image[_i].data;
      var _distance_position = 0;

      switch(_ordering){
        case 'image_position_patient':
          var _x = first_image[_i]['image_position_patient'][0] - first_image[0]['image_position_patient'][0];
          var _y = first_image[_i]['image_position_patient'][1] - first_image[0]['image_position_patient'][1];
          var _z = first_image[_i]['image_position_patient'][2] - first_image[0]['image_position_patient'][2];

	  _distance_position = Math.sqrt(_x*_x + _y*_y  + _z*_z)/first_image[0]['pixel_spacing'][2]


          break;
        case 'instance_number':
          _distance_position = first_image[_i]['instance_number'] - first_image[0]['instance_number'];
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }
	//window.console.log(_distance_position, first_slice_size);
	//window.console.log(_data);
	first_image_data.set(_data, _distance_position * first_slice_size);

	/**
	//************************************
	//
	// MOKA / NRG MOD START
	//
	//************************************
	try {
	    first_image_data.set(_data, _distance_position * first_slice_size);
	}
	catch(error){
	    switch(error.message){
	    case 'Source is too large':
	      var warningStr = 
		  "\n\nWARNING in NRG-modified parserDCM.js: \n" +
		  "Error caught in setting data.  Re-calling 'parse' method of parserDCM.js and forcing the "  + 
		    " 'instance_number' property slice reordering";
		window.console.log(warningStr);
		this.parse(container, object, data, flag, true);
		break;
	    default:
		throw(error);
	    }
	}
	//************************************
	//
	// MOKA / NRG MOD END
	//
	//************************************
	*/
    }

    volumeAttributes.data = first_image_data;
    object._data = first_image_data;

    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    // -> we estimated the spacing in all directions
    // -> we know how many slices we expect in the best case
    // -> data container contains ordered data!
    ////////////////////////////////////////////////////////////////////////

    // IJK image dimensions
    // NOTE:
    // colums is index 0
    // rows is index 1
    object._dimensions = [first_image[0]['columns'], first_image[0]['rows'], first_image_expected_nb_slices];
    volumeAttributes.dimensions = object._dimensions;

    // get the min and max intensities
    var min_max = this.arrayMinMax(first_image_data);
    var min = min_max[0];
    var max = min_max[1];

    // attach the scalar range to the volume
    volumeAttributes.min = object._min = object._windowLow = min;
    volumeAttributes.max = object._max = object._windowHigh = max;
    // .. and set the default threshold
    // only if the threshold was not already set
    if (object._lowerThreshold == -Infinity) {

      object._lowerThreshold = min;

    }
    if (object._upperThreshold == Infinity) {

      object._upperThreshold = max;

    }

    // Slices are ordered so
    // volume origin is the first slice position
    var _origin = first_image[0]['image_position_patient'];

    //
    // Generate IJK To RAS matrix and other utilities.
    //

    var IJKToRAS = goog.vec.Mat4.createFloat32();

    ////////////////////////////////////////////////////////////////////////
    //
    // IMPORTANT NOTE:
    //
    // '-' added for LPS to RAS conversion
    // IJKToRAS is Identity if we have a time series
    //
    ////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////
    //
    // IMPORTANT NOTE:
    //
    // '-' added for LPS to RAS conversion
    // IJKToRAS is Identity if we have a time series
    //
    ////////////////////////////////////////////////////////////////////////
    
    if(object['reslicing'] == 'false' || object['reslicing'] == false){
	/**
        goog.vec.Mat4.setRowValues(IJKToRAS,
          0,
          first_image[0]['pixel_spacing'][0],
          0,
          0,
          0);


          // - first_image[0]['pixel_spacing'][0]/2);
        goog.vec.Mat4.setRowValues(IJKToRAS,
          1,
          0,
          first_image[0]['pixel_spacing'][1],
          0,
          0);


          // - first_image[0]['pixel_spacing'][1]/2);
        goog.vec.Mat4.setRowValues(IJKToRAS,
          2,
          0,
          0,
          first_image[0]['pixel_spacing'][2],
          0);

          // + first_image[0]['pixel_spacing'][2]/2);
        goog.vec.Mat4.setRowValues(IJKToRAS, 3,0,0,0,1);
	*/
	//alert("RESLICNG");


	//************************************
	//
	// MOKA / NRG MOD START
	//
	//************************************
	window.console.log("NRG-modified parserDCM.js: Running an orthogonal transform because the volume's" +
			   " \"reslicing\" property is set to false.");
          var _x_cosine = new goog.math.Vec3(first_image[0]['image_orientation_patient'][0],
            first_image[ 0 ]['image_orientation_patient'][1], first_image[ 0 ]['image_orientation_patient'][2]);

          var _y_cosine = new goog.math.Vec3(first_image[ 0 ]['image_orientation_patient'][3],
            first_image[ 0 ]['image_orientation_patient'][4], first_image[ 0 ]['image_orientation_patient'][5]);


	_x_cosine.x = Math.round(_x_cosine.x);
	_x_cosine.y = Math.round(_x_cosine.y);
	_x_cosine.z = Math.round(_x_cosine.z);

	_y_cosine.x = Math.round(_y_cosine.x);
	_y_cosine.y = Math.round(_y_cosine.y);
	_y_cosine.z = Math.round(_y_cosine.z);

          var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

	//window.console.log("\n\nPARSER DCM", _x_cosine, _y_cosine, _z_cosine);

          goog.vec.Mat4.setRowValues(IJKToRAS,
            0,
            -Math.round(first_image[ 0 ]['image_orientation_patient'][0])*first_image[0]['pixel_spacing'][0],
            -Math.round(first_image[ 0 ]['image_orientation_patient'][3])*first_image[0]['pixel_spacing'][1],
            -_z_cosine.x*first_image[0]['pixel_spacing'][2],
            -_origin[0]);
            // - first_image[0]['pixel_spacing'][0]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            1,
            -Math.round(first_image[ 0 ]['image_orientation_patient'][1])*first_image[0]['pixel_spacing'][0],
            -Math.round(first_image[ 0 ]['image_orientation_patient'][4])*first_image[0]['pixel_spacing'][1],
            -_z_cosine.y*first_image[0]['pixel_spacing'][2],
            -_origin[1]);
            // - first_image[0]['pixel_spacing'][1]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            2,
            Math.round(first_image[ 0 ]['image_orientation_patient'][2])*first_image[0]['pixel_spacing'][0],
            Math.round(first_image[ 0 ]['image_orientation_patient'][5])*first_image[0]['pixel_spacing'][1],
            _z_cosine.z*first_image[0]['pixel_spacing'][2],
            _origin[2]);
            // + first_image[0]['pixel_spacing'][2]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            3,0,0,0,1);
          //break;
	//************************************
	//
	// MOKA / NRG MOD END
	//
	//************************************



    }
    else{
      switch(_ordering){
        case 'image_position_patient':

          var _x_cosine = new goog.math.Vec3(first_image[0]['image_orientation_patient'][0],
            first_image[ 0 ]['image_orientation_patient'][1], first_image[ 0 ]['image_orientation_patient'][2]);
          var _y_cosine = new goog.math.Vec3(first_image[ 0 ]['image_orientation_patient'][3],
            first_image[ 0 ]['image_orientation_patient'][4], first_image[ 0 ]['image_orientation_patient'][5]);
          var _z_cosine = goog.math.Vec3.cross(_x_cosine, _y_cosine);

          goog.vec.Mat4.setRowValues(IJKToRAS,
            0,
            -first_image[ 0 ]['image_orientation_patient'][0]*first_image[0]['pixel_spacing'][0],
            -first_image[ 0 ]['image_orientation_patient'][3]*first_image[0]['pixel_spacing'][1],
            -_z_cosine.x*first_image[0]['pixel_spacing'][2],
            -_origin[0]);
            // - first_image[0]['pixel_spacing'][0]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            1,
            -first_image[ 0 ]['image_orientation_patient'][1]*first_image[0]['pixel_spacing'][0],
            -first_image[ 0 ]['image_orientation_patient'][4]*first_image[0]['pixel_spacing'][1],
            -_z_cosine.y*first_image[0]['pixel_spacing'][2],
            -_origin[1]);
            // - first_image[0]['pixel_spacing'][1]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            2,
            first_image[ 0 ]['image_orientation_patient'][2]*first_image[0]['pixel_spacing'][0],
            first_image[ 0 ]['image_orientation_patient'][5]*first_image[0]['pixel_spacing'][1],
            _z_cosine.z*first_image[0]['pixel_spacing'][2],
            _origin[2]);
            // + first_image[0]['pixel_spacing'][2]/2);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            3,0,0,0,1);
          break;
        case 'instance_number':
          goog.vec.Mat4.setRowValues(IJKToRAS,
            0,-1,0,0,-_origin[0]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            1,-0,-1,-0,-_origin[1]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            2,0,0,1,_origin[2]);
          goog.vec.Mat4.setRowValues(IJKToRAS,
            3,0,0,0,1);
          break;
        default:
          window.console.log("Unkown ordering mode - returning: " + _ordering);
          break;
      }
    }

    volumeAttributes.IJKToRAS = IJKToRAS;
    volumeAttributes.RASToIJK = goog.vec.Mat4.createFloat32();
    goog.vec.Mat4.invert(volumeAttributes.IJKToRAS, volumeAttributes.RASToIJK);

    ////////////////////////////////////////////////////////////////////////
    // At this point:
    // -> slices are ordered by series
    // -> slices within a series are unique
    // -> we estimated the spacing in all directions
    // -> we know how many slices we expect in the best case
    // -> data container contains ordered data!
    // -> IJK To RAS (and invert) matrices
    ////////////////////////////////////////////////////////////////////////
  
    //
    // compute last required information for reslicing
    //

    // get RAS spacing
    //
    var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
    var res = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar, res);

    var tar2 = goog.vec.Vec4.createFloat32FromValues(1, 1, 1, 1);
    var res2 = goog.vec.Vec4.createFloat32();
    goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);

    volumeAttributes.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
  
    // get RAS Boundung Box
    //
    var _rasBB = X.parser.computeRASBBox(IJKToRAS, [object._dimensions[0], object._dimensions[1], object._dimensions[2]]);
    // grab the RAS Dimensions
    volumeAttributes.RASDimensions = [_rasBB[1] - _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];
  
    // get RAS Origin
    // (it is actually RAS min x, min y and min z)
    //
    volumeAttributes.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];

    // create the volume object
    object.create_(volumeAttributes);

    // re-slice the data in SAGITTAL, CORONAL and AXIAL directions

      object._image = this.reslice(object);
      
  }

  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);

};



/**
 * Default behavior if tag group/elements do not have to be processed.
 * 
 * @param {!number} _bytes The data stream.
 * @param {!number} _bytePointer The parent object.
 * @param {!number} _VR The data stream.
 * @param {!number} _VL The parent object.
 * @return {number} The new bytePointer.
 */
 X.parserDCM.prototype.handleDefaults = function(_bytes, _bytePointer, _VR, _VL) {
    switch (_VR){
      case 16975:
        // UL
      case 20819:
        // SQ
      case 20053:
        // UN
      case 22351:
        // OW

        // bytes to bits
        function byte2bits(a)
          {
            var tmp = "";
            for(var i = 128; i >= 1; i /= 2)
                tmp += a&i?'1':'0';
            return tmp;
          }

        _VL = _bytes[_bytePointer++];
        var _VLT = _bytes[_bytePointer++];

        var _b0 = _VL & 0x00FF;
        var _b1 = (_VL & 0xFF00) >> 8;

        var _b2 = _VLT & 0x00FF;
        var _b3 = (_VLT & 0xFF00) >> 8;

        var _VLb0 = byte2bits(_b0);
        var _VLb1 = byte2bits(_b1);
        var _VLb = _VLb1 + _VLb0;

        var _VLTb0 = byte2bits(_b2);
        var _VLTb1 = byte2bits(_b3);
        var _VLTb = _VLTb1 + _VLTb0;

        var _VL2 =  _VLTb + _VLb ;
        _VL = parseInt(_VL2, 2);

        // flag undefined sequence length
        if(_VL == 4294967295){
          _VL = 0;
        }

        _bytePointer+=_VL/2;
      break;

    default:
      _bytePointer+=_VL/2;
        break;
    }

  return _bytePointer;
}

/**
 * Parse the data stream according to the .nii/.nii.gz file format and return an
 * MRI structure which holds all parsed information.
 * 
 * @param {!ArrayBuffer}
 *          data The data stream.
 * @param {!X.object}
 *          object The parent object.
 * @return {Object} The MRI structure which holds all parsed information.
 */
X.parserDCM.prototype.parseStream = function(data, object) {

  // attach the given data
  this._data = data;

  if( typeof(object.slices) == "undefined" || object.slices == null ){
    object.slices = new Array();
  }

  // set slice default minimum required parameters
  var slice = {};
  slice['pixel_spacing'] = [.1, .1, Infinity];
  slice['image_orientation_patient'] = [1, 0, 0, 0, 1, 0];
  slice['image_position_patient']  = [0, 0, 0];
  // Transfer syntax UIDs
  // 1.2.840.10008.1.2: Implicit VR Little Endian
  // 1.2.840.10008.1.2.1: Explicit VR Little Endian
  // 1.2.840.10008.1.2.2: Explicit VT Big Endian
  slice['transfer_syntax_uid'] = "no_transfer_syntax_uid";

  // scan the whole file as short (2 bytes)
  var _bytes = this.scan('ushort', this._data.byteLength);
  var _bytePointer = 66; // skip the 132 byte preamble
  var _tagGroup = null;
  var _tagElement = null;
  var _VR = null;
  var _VL = null;



    //****************************************************
    //
    // MOKA / NRG MOD START
    //
    //****************************************************
    var _skipCurrent = false;
    var _dicomTypeLogged = false;
    var _dicomType;

    var _skippables = {};
    _skippables.LEI = [[0x0012, 0x0064], [0x0008, 0x1110],[0x0008, 0x1120]];
  
    //var _skippables = [[0x0008, 0x1110],[0x0008, 0x1120]];
    var i, len;

    //****************************************************
    //
    // MOKA / NRG MOD END
    //
    //****************************************************

  while (_bytePointer <  _bytes.length) {

    _tagGroup = _bytes[_bytePointer++];
    _tagElement = _bytes[_bytePointer++];

    _VR = _bytes[_bytePointer++];
    _VL = _bytes[_bytePointer++];


      // Implicit VR Little Endian case
      if((slice['transfer_syntax_uid'] == '1.2.840.10008.1.2') && (_VL == 0)){
	  _VL = _VR;
      }


      //****************************************************
      //
      // MOKA / NRG MOD START
      //
      //****************************************************
      /**
	 Certain memory pointers of DICOMS throw a wrench the parsing mechanism.
	 As a result, we have to skip them.  Prelimiary tests show that this does not
	 affect the rendering.

	 Bad (at least within the context of XTK) memory addresses include:
	 
	 0x0012, 0x0064

(0008, 0008) Image Type                          CS: ['ORIGINAL', 'PRIMARY', 'M', 'ND', 'NORM']
(0008, 0012) Instance Creation Date              DA: '20120831'
(0008, 0013) Instance Creation Time              TM: '125310.281000'
(0008, 0016) SOP Class UID                       UI: MR Image Storage
(0008, 0018) SOP Instance UID                    UI: 1.2.840.113654.2.45.5943.211300177154514993689921060436559942663
(0008, 0020) Study Date                          DA: '20120831'
(0008, 0021) Series Date                         DA: '20120831'
(0008, 0022) Acquisition Date                    DA: '20120831'
(0008, 0023) Content Date                        DA: '20120831'
(0008, 0030) Study Time                          TM: '125001.000'
(0008, 0031) Series Time                         TM: '125310.000'
(0008, 0032) Acquisition Time                    TM: '125224.100000'
(0008, 0033) Content Time                        TM: '125310.281000'
(0008, 0040) Data Set Type                       US: 0
(0008, 0041) Data Set Subtype                    LO: 'IMA NONE'
(0008, 0060) Modality                            CS: 'MR'
(0008, 0070) Manufacturer                        LO: 'SIEMENS'
(0008, 0080) Institution Name                    LO: ''
(0008, 1010) Station Name                        SH: 'SMRC'
(0008, 1030) Study Description                   LO: '3'
(0008, 103e) Series Description                  LO: 'T1 BLADE SAG'
(0008, 1070) Operators' Name                     PN: ' '
(0008, 1090) Manufacturer's Model Name           LO: 'SymphonyTim'
(0010, 0010) Patient's Name                      PN: 'MW009R'
(0010, 0020) Patient ID                          LO: 'MW009R_MR1'
(0010, 0040) Patient's Sex                       CS: 'F'
(0010, 1030) Patient's Weight                    DS: '52.1631291855'
(0012, 0062) Patient Identity Removed            CS: 'YES'
(0012, 0063) De-identification Method            LO: 'Test common deidentification v001'
(0012, 0064)  De-identification Method Code Sequence   11 item(s) ---- 
   (0008, 0100) Code Value                          SH: '113100'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Basic Application Confidentiality Profile'
   ---------
   (0008, 0100) Code Value                          SH: '113101'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Clean Pixel Data Option'
   ---------
   (0008, 0100) Code Value                          SH: '113103'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Clean Graphics Option'
   ---------
   (0008, 0100) Code Value                          SH: '113104'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Clean Structured Content Option'
   ---------
   (0008, 0100) Code Value                          SH: '113105'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Clean Descriptors Option'
   ---------
   (0008, 0100) Code Value                          SH: '113106'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Retain Longitudinal With Full Dates Option'
   ---------
   (0008, 0100) Code Value                          SH: '113108'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Retain Patient Characteristics Option'
   ---------
   (0008, 0100) Code Value                          SH: '113109'
   (0008, 0102) Coding Scheme Designator            SH: 'DCM'
   (0008, 0104) Code Meaning                        LO: 'Retain Device Identity Option'
   ---------
   (0008, 0100) Code Value                          SH: '625500'
   (0008, 0102) Coding Scheme Designator            SH: 'XNAT'
   (0008, 0103) Coding Scheme Version               SH: '0.1'
   (0008, 0104) Code Meaning                        LO: 'XNAT Edit Script'
   ---------
   (0008, 0100) Code Value                          SH: '35081'
   (0008, 0102) Coding Scheme Designator            SH: 'XNAT'
   (0008, 0103) Coding Scheme Version               SH: '0.1'
   (0008, 0104) Code Meaning                        LO: 'XNAT Edit Script'
   ---------
   (0008, 0100) Code Value                          SH: '6'
   (0008, 0102) Coding Scheme Designator            SH: 'XNAT'
   (0008, 0103) Coding Scheme Version               SH: '0.1'
   (0008, 0104) Code Meaning                        LO: 'XNAT Edit Script'
   ---------
(0018, 0020) Scanning Sequence                   CS: ['SE', 'IR']
(0018, 0021) Sequence Variant                    CS: ['SK', 'SP', 'MP', 'OSP']
(0018, 0022) Scan Options                        CS: 'IR'
(0018, 0023) MR Acquisition Type                 CS: '2D'
(0018, 0024) Sequence Name                       SH: '*tirB2d1_19'
(0018, 0025) Angio Flag                          CS: 'N'
(0018, 0050) Slice Thickness                     DS: '5'
(0018, 0080) Repetition Time                     DS: '2000'
(0018, 0081) Echo Time                           DS: '59'
(0018, 0082) Inversion Time                      DS: '859.8'
(0018, 0083) Number of Averages                  DS: '1'
(0018, 0084) Imaging Frequency                   DS: '63.573217'
(0018, 0085) Imaged Nucleus                      SH: '1H'
(0018, 0086) Echo Number(s)                      IS: '1'
(0018, 0087) Magnetic Field Strength             DS: '1.5'
(0018, 0088) Spacing Between Slices              DS: '6'
(0018, 0089) Number of Phase Encoding Steps      IS: '256'
(0018, 0091) Echo Train Length                   IS: '19'
(0018, 0093) Percent Sampling                    DS: '100'
(0018, 0094) Percent Phase Field of View         DS: '100'
(0018, 0095) Pixel Bandwidth                     DS: '360'
(0018, 1000) Device Serial Number                LO: '37019'
(0018, 1020) Software Version(s)                 LO: 'syngo MR B15'
(0018, 1030) Protocol Name                       LO: ''
(0018, 1251) Transmit Coil Name                  SH: 'Body'
(0018, 1310) Acquisition Matrix                  US: [0, 256, 256, 0]
(0018, 1312) In-plane Phase Encoding Direction   CS: 'ROW'
(0018, 1314) Flip Angle                          DS: '150'
(0018, 1315) Variable Flip Angle Flag            CS: 'N'
(0018, 1316) SAR                                 DS: '0.69060883169056'
(0018, 1318) dB/dt                               DS: '0'
(0018, 5100) Patient Position                    CS: 'HFS'
(0020, 000d) Study Instance UID                  UI: 1.2.840.113654.2.45.5943.122980150668789253093962596101153207919
(0020, 000e) Series Instance UID                 UI: 1.2.840.113654.2.45.5943.202009576256284981709391709024242379991
(0020, 0010) Study ID                            SH: ''
(0020, 0011) Series Number                       IS: '2'
(0020, 0012) Acquisition Number                  IS: '1'
(0020, 0013) Instance Number                     IS: '1'
(0020, 0032) Image Position (Patient)            DS: ['-63.492519034562', '-142.14062462095', '120.68211518741']
(0020, 0037) Image Orientation (Patient)         DS: ['-0.0453630169093', '0.99897056848382', '3.1037018e-008', '0.01917770454847', '0.00087088608459', '-0.9998157116217']
(0020, 0052) Frame of Reference UID              UI: 1.2.840.113654.2.45.5943.294296683094707850775096290142582472153
(0020, 1040) Position Reference Indicator        LO: ''
(0020, 1041) Slice Location                      DS: '-67.545417046544'
(0028, 0002) Samples per Pixel                   US: 1
(0028, 0004) Photometric Interpretation          CS: 'MONOCHROME2'
(0028, 0010) Rows                                US: 256
(0028, 0011) Columns                             US: 256
(0028, 0030) Pixel Spacing                       DS: ['0.8984375', '0.8984375']
(0028, 0100) Bits Allocated                      US: 16
(0028, 0101) Bits Stored                         US: 12
(0028, 0102) High Bit                            US: 11
(0028, 0103) Pixel Representation                US: 0
(0028, 0106) Smallest Image Pixel Value          US or SS: '\x00\x00'
(0028, 0107) Largest Image Pixel Value           US or SS: '\xcb\x01'
(0028, 1050) Window Center                       DS: '211'
(0028, 1051) Window Width                        DS: '477'
(0028, 1055) Window Center & Width Explanation   LO: 'Algo1'
(0032, 1064)  Requested Procedure Code Sequence   1 item(s) ---- 
   (0008, 0100) Code Value                          SH: 'BMR70553'
   (0008, 0102) Coding Scheme Designator            SH: 'DTL_SVC_CD'
   (0008, 0104) Code Meaning                        LO: '70553 MRI Brain wo&with contrast'
   ---------
(0040, 0002) Scheduled Procedure Step Start Date DA: '20120831'
(0040, 0003) Scheduled Procedure Step Start Time TM: '1322\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
(0040, 0244) Performed Procedure Step Start Date DA: '20120831'
(0040, 0245) Performed Procedure Step Start Time TM: '125001.000'
(7fe0, 0010) Pixel Data                          OW or OB: Array of 131072 bytes	 

      
      */

      _skipCurrent = false;
      if (_tagGroup !== undefined && _tagElement !== undefined){

	  //window.console.log("Current memory address ", '(0x' + _tagGroup.toString(16) + ', 0x' 
	      //+ _tagElement.toString(16) +')');

	  switch(slice['transfer_syntax_uid']){
	      
	  case '1.2.840.10008.1.2.1':
	      _dicomType = "Little Endian Explicit";
	      break;
	      
	  case '1.2.840.10008.1.2.2':
	      _dicomType = "Big Endian Explicit";
	      break;
	      
	  case '1.2.840.10008.1.2':
	      _dicomType = "Little Endian Implicit";
	      if (slice['transfer_syntax_uid'] == '1.2.840.10008.1.2'){
		  i = 0;
		  len = _skippables.LEI.length;
		  for (; i < len; i++){
		      if ((_tagGroup === _skippables.LEI[i][0]) && 
			  (_tagElement === _skippables.LEI[i][1])){
			  _skipCurrent = true;
			  break;
		      }
		  }
	      }
	      break;
	  }
	  
	  if (!_dicomTypeLogged && _dicomType !== undefined){
	      window.console.log("\n\nparserDCM: Identified " + _dicomType);
	      _dicomTypeLogged = true;
	  }

	  if (_skipCurrent){
	      window.console.log("\t\tSkipping ", '(0x' + _tagGroup.toString(16) + ', 0x' 
				 + _tagElement.toString(16) +')');
	      continue;
	  }
      }
      //****************************************************
      //
      // MOKA / NRG MOD END
      //
      //****************************************************


    switch (_tagGroup) {
      case 0x0002:
        // Group of DICOM meta info header
        switch (_tagElement) {
          case 0x0010:
            // TransferSyntaxUID
            var _transfer_syntax_uid = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _transfer_syntax_uid += String.fromCharCode(_b0);
              _transfer_syntax_uid += String.fromCharCode(_b1);
            }
            slice['transfer_syntax_uid'] = _transfer_syntax_uid.replace(/\0/g,'');
            break;
          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;


      case 0x0028:
      // Group of IMAGE INFO
        switch (_tagElement) {
          case 0x0010:
            // rows
            slice['rows'] = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0011:
            // cols
            slice['columns'] = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0100:
            // bits allocated
            slice.bits_allocated = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0101:
            // bits stored
            slice['bits_stored'] = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0002:
            // number of images
            slice['number_of_images'] = _bytes[_bytePointer];
            _bytePointer+=_VL/2;
            break;
          case 0x0030:
            // pixel spacing
            var _pixel_spacing = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _pixel_spacing += String.fromCharCode(_b0);
              _pixel_spacing += String.fromCharCode(_b1);
            }
            _pixel_spacing = _pixel_spacing.split("\\");
            slice['pixel_spacing'] = [ parseFloat(_pixel_spacing[0]), parseFloat(_pixel_spacing[1]), Infinity ];
            break;

          case 0x1052: // rescale intercept
          case 0x1053: // rescale slope
          case 0x1050: // WindowCenter
          case 0x1051: // WindowWidth
          case 0x0004: // "Photometric Interpretation"
          case 0x0102: // "High Bit"
          case 0x0103: // "Pixel Representation"
          case 0x1054: // "Rescale Type"
          case 0x2110: // "Lossy Image Compression"

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;
      
      case 0x0020:
        // Group of SLICE INFO
        switch (_tagElement) {
          case 0x000e:
            // Series instance UID
            slice['series_instance_uid'] = "";
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              slice['series_instance_uid'] += String.fromCharCode(_b0);
              slice['series_instance_uid'] += String.fromCharCode(_b1);
            }
            break;
          case 0x0013:
            var _position = '';
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _position += String.fromCharCode(_b0);
              _position += String.fromCharCode(_b1);
            }
            slice['instance_number'] = parseInt(_position, 10); 
            break;
          case 0x0032:
            // image position
            var _image_position = '';
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _image_position += String.fromCharCode(_b0);
              _image_position += String.fromCharCode(_b1);
            }
            _image_position = _image_position.split("\\");
            slice['image_position_patient'] = [ parseFloat(_image_position[0]), parseFloat(_image_position[1]),
                parseFloat(_image_position[2]) ];
            // _tagCount--;
            break;
          case 0x0037:
            // image orientation
            // pixel spacing
            var _image_orientation = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _image_orientation += String.fromCharCode(_b0);
              _image_orientation += String.fromCharCode(_b1);
            }
            _image_orientation = _image_orientation.split("\\");
            slice['image_orientation_patient'] = [ parseFloat(_image_orientation[0]),
                parseFloat(_image_orientation[1]), parseFloat(_image_orientation[2]),
                parseFloat(_image_orientation[3]), parseFloat(_image_orientation[4]),
                parseFloat(_image_orientation[5]) ];
            // _tagCount--;
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;

    case 0xfffe:
        // Group of undefined item
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0xe000:
          // start item
          case 0xe00d:
          // end item
          case 0xe0dd:
          // end sequence
          default:
            _VL = 0;
            _bytePointer+=_VL/2;
            break;
          }

        break;

    case 0x0008:
        // Group of SLICE INFO
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0x0018:
            // Image instance UID
            slice['sop_instance_uid'] = "";
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              slice['sop_instance_uid'] += String.fromCharCode(_b0);
              slice['sop_instance_uid'] += String.fromCharCode(_b1);
            }
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;


    case 0x0010:
        // Group of SLICE INFO
        // here we are only interested in the InstanceNumber
        switch (_tagElement) {
          case 0x2210:
            // anatomical orientation
            // pixel spacing
            var _anatomical_orientation = '';
            // pixel spacing is a delimited string (ASCII)
            var i = 0;
            for (i = 0; i < _VL / 2; i++) {
              var _short = _bytes[_bytePointer++];
              var _b0 = _short & 0x00FF;
              var _b1 = (_short & 0xFF00) >> 8;
              _anatomical_orientation += String.fromCharCode(_b0);
              _anatomical_orientation += String.fromCharCode(_b1);
            }
            break;

          default:
            _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
            break;
          }

        break;
          // We should parse the data like that...

/**
    case 0x7fe0:
	//     // Group of SLICE INFO
	//     // here we are only interested in the InstanceNumber
        switch (_tagElement) {
        case 0x0010:
            var _data = null;
            switch (slice.bits_allocated) {
            case 8:
                slice.data = new Uint8Array(slice.columns * slice.rows);
                slice.data = this.scan('uchar', slice.columns * slice.rows);
                break;
            case 16:
                slice.data = new Uint16Array(slice.columns * slice.rows);
                slice.data = this.scan('ushort', slice.columns * slice.rows);
                break;
            case 32:
                slice.data = new Uint32Array(slice.columns * slice.rows);
                slice.data = this.scan('uint', slice.columns * slice.rows);
                break;
            }
	}
*/
        break;

    //       default:
    //         _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
    //         break;
    //       }

      default:
        _bytePointer = X.parserDCM.prototype.handleDefaults(_bytes, _bytePointer, _VR, _VL);
        break;
      }

    }



    switch (slice.bits_allocated) {
      case 8:
        slice.data = new Uint8Array(slice['columns'] * slice['rows']);
        break;
      case 16:
        slice.data = new Uint16Array(slice['columns'] * slice['rows']);
        break;
      case 32:
        slice.data = new Uint32Array(slice['columns'] * slice['rows']);
        break;
    }

  // no need to jump anymore, parse data as any DICOM field.
  // jump to the beginning of the pixel data
  this.jumpTo(this._data.byteLength - slice['columns'] * slice['rows'] * 2);
  // check for data type and parse accordingly
  var _data = null;

  switch (slice.bits_allocated) {
  case 8:
    _data = this.scan('uchar', slice['columns'] * slice['rows']);
    break;
  case 16:
    _data = this.scan('ushort', slice['columns'] * slice['rows']);

    break;
  case 32:
    _data = this.scan('uint', slice['columns'] * slice['rows']);
    break;
  }

  slice['data'] = _data;

  object.slices.push(slice);

  return object;
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserDCM', X.parserDCM);
goog.exportSymbol('X.parserDCM.prototype.parse', X.parserDCM.prototype.parse);
