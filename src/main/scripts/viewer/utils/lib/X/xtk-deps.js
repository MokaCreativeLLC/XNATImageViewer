// This file was autogenerated by /home/d/Projects/X/lib/google-closure-library/closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../utils/lib/X/X.js', ['X', 'X.counter'], []);
goog.addDependency('../../../utils/lib/X/core/base.js', ['X.base'], ['X', 'goog.events', 'goog.events.EventTarget']);
goog.addDependency('../../../utils/lib/X/core/colortable.js', ['X.colortable'], ['X.base', 'X.loadable', 'goog.structs.Map']);
goog.addDependency('../../../utils/lib/X/core/event.js', ['X.event', 'X.event.ComputingEndEvent', 'X.event.ComputingEvent', 'X.event.HoverEndEvent', 'X.event.HoverEvent', 'X.event.ModifiedEvent', 'X.event.PanEvent', 'X.event.ProgressEvent', 'X.event.RenderEvent', 'X.event.ResetViewEvent', 'X.event.RotateEvent', 'X.event.ScrollEvent', 'X.event.WindowLevelEvent', 'X.event.ZoomEvent', 'X.event.events'], ['X', 'X.object', 'X.vector', 'goog.events', 'goog.events.Event']);
goog.addDependency('../../../utils/lib/X/core/file.js', ['X.file'], ['X.base']);
goog.addDependency('../../../utils/lib/X/core/scalars.js', ['X.scalars'], ['X.base', 'X.loadable', 'X.thresholdable']);
goog.addDependency('../../../utils/lib/X/core/texture.js', ['X.texture'], ['X.base', 'X.loadable']);
goog.addDependency('../../../utils/lib/X/core/transform.js', ['X.transform'], ['X.base', 'X.matrix']);
goog.addDependency('../../../utils/lib/X/core/triplets.js', ['X.triplets'], ['X.base']);
goog.addDependency('../../../utils/lib/X/injects/constructable.js', ['X.constructable'], ['CSG', 'X.base', 'X.object', 'csgPolygon', 'csgVector', 'csgVertex']);
goog.addDependency('../../../utils/lib/X/injects/displayable.js', ['X.displayable'], ['X.base', 'X.texture', 'X.transform', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/injects/loadable.js', ['X.loadable'], ['X.base', 'X.file']);
goog.addDependency('../../../utils/lib/X/injects/thresholdable.js', ['X.thresholdable'], ['X.base']);
goog.addDependency('../../../utils/lib/X/io/interactor.js', ['X.interactor'], ['X.base', 'X.event', 'X.event.HoverEndEvent', 'X.event.HoverEvent', 'X.event.PanEvent', 'X.event.ResetViewEvent', 'X.event.RotateEvent', 'X.event.ZoomEvent', 'goog.dom', 'goog.events', 'goog.events.BrowserEvent.MouseButton', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.events.MouseWheelHandler', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/io/interactor2D.js', ['X.interactor2D'], ['X.event.ScrollEvent', 'X.interactor']);
goog.addDependency('../../../utils/lib/X/io/interactor3D.js', ['X.interactor3D'], ['X.interactor']);
goog.addDependency('../../../utils/lib/X/io/loader.js', ['X.loader'], ['X.base', 'X.event', 'X.object', 'X.parserCRV', 'X.parserDCM', 'X.parserFSM', 'X.parserIMAGE', 'X.parserLBL', 'X.parserLUT', 'X.parserMGZ', 'X.parserNII', 'X.parserNRRD', 'X.parserOBJ', 'X.parserSTL', 'X.parserTRK', 'X.parserVTK', 'goog.structs.Map']);
goog.addDependency('../../../utils/lib/X/io/parser.js', ['X.parser'], ['X.base', 'X.event', 'X.texture', 'X.triplets', 'goog.vec.Mat4', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('../../../utils/lib/X/io/parserCRV.js', ['X.parserCRV'], ['X.event', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/io/parserDCM.js', ['X.parserDCM'], ['X.event', 'X.object', 'X.parser', 'X.triplets', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/io/parserFSM.js', ['X.parserFSM'], ['X.event', 'X.object', 'X.parser', 'X.triplets', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/io/parserIMAGE.js', ['X.parserIMAGE'], ['X.event', 'X.parser']);
goog.addDependency('../../../utils/lib/X/io/parserLBL.js', ['X.parserLBL'], ['X.event', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/io/parserLUT.js', ['X.parserLUT'], ['X.event', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/io/parserMGZ.js', ['X.parserMGZ'], ['X.event', 'X.object', 'X.parser', 'X.triplets', 'Zlib.Gunzip', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/io/parserNII.js', ['X.parserNII'], ['X.event', 'X.object', 'X.parser', 'X.triplets', 'Zlib.Gunzip', 'goog.vec.Mat3', 'goog.vec.Mat4']);
goog.addDependency('../../../utils/lib/X/io/parserNRRD.js', ['X.parserNRRD'], ['X.event', 'X.object', 'X.parser', 'X.triplets', 'Zlib.Gunzip', 'goog.math.Vec3', 'goog.vec.Vec4']);
goog.addDependency('../../../utils/lib/X/io/parserOBJ.js', ['X.parserOBJ'], ['X.event', 'X.object', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/io/parserSTL.js', ['X.parserSTL'], ['X.event', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/io/parserTRK.js', ['X.parserTRK'], ['X.event', 'X.parser', 'X.triplets', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/io/parserVTK.js', ['X.parserVTK'], ['X.event', 'X.object', 'X.parser', 'X.triplets']);
goog.addDependency('../../../utils/lib/X/math/array.js', ['X.array'], ['X.base']);
goog.addDependency('../../../utils/lib/X/math/matrix.js', ['X.matrix'], ['X.vector', 'goog.vec.Mat4']);
goog.addDependency('../../../utils/lib/X/math/vector.js', ['X.vector'], ['goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/objects/cube.js', ['X.cube'], ['CSG.cube', 'X.base', 'X.constructable', 'X.object']);
goog.addDependency('../../../utils/lib/X/objects/cylinder.js', ['X.cylinder'], ['CSG.cylinder', 'X.base', 'X.constructable', 'X.object']);
goog.addDependency('../../../utils/lib/X/objects/fibers.js', ['X.fibers'], ['X.object']);
goog.addDependency('../../../utils/lib/X/objects/labelmap.js', ['X.labelmap'], ['X.volume']);
goog.addDependency('../../../utils/lib/X/objects/mesh.js', ['X.mesh'], ['X.object']);
goog.addDependency('../../../utils/lib/X/objects/object.js', ['X.object'], ['X.base', 'X.colortable', 'X.displayable', 'X.indexer', 'X.loadable', 'X.scalars']);
goog.addDependency('../../../utils/lib/X/objects/slice.js', ['X.slice'], ['X.base', 'X.object', 'goog.math.Vec3']);
goog.addDependency('../../../utils/lib/X/objects/sphere.js', ['X.sphere'], ['CSG.sphere', 'X.base', 'X.constructable', 'X.object']);
goog.addDependency('../../../utils/lib/X/objects/volume.js', ['X.volume'], ['X.object', 'X.parser', 'X.slice', 'X.thresholdable']);
goog.addDependency('../../../utils/lib/X/ui/caption.js', ['X.caption'], ['X.base', 'X.interactor', 'goog.dom', 'goog.positioning.ViewportPosition', 'goog.style', 'goog.ui.Tooltip']);
goog.addDependency('../../../utils/lib/X/ui/progressbar.js', ['X.progressbar'], ['X.base', 'goog.dom', 'goog.style', 'goog.ui.ProgressBar']);
goog.addDependency('../../../utils/lib/X/visualization/buffer.js', ['X.buffer'], ['X.base']);
goog.addDependency('../../../utils/lib/X/visualization/camera.js', ['X.camera'], ['X.base', 'X.event.PanEvent', 'X.event.RenderEvent', 'X.event.ZoomEvent', 'X.interactor', 'X.matrix', 'X.vector']);
goog.addDependency('../../../utils/lib/X/visualization/camera2D.js', ['X.camera2D'], ['X.camera', 'X.event.WindowLevelEvent']);
goog.addDependency('../../../utils/lib/X/visualization/camera3D.js', ['X.camera3D'], ['X.camera', 'X.event.RotateEvent', 'X.matrix']);
goog.addDependency('../../../utils/lib/X/visualization/indexer.js', ['X.indexer'], ['X.base']);
goog.addDependency('../../../utils/lib/X/visualization/renderer.js', ['X.renderer'], ['X.array', 'X.base', 'X.camera', 'X.camera2D', 'X.camera3D', 'X.cube', 'X.cylinder', 'X.event', 'X.interactor', 'X.interactor2D', 'X.interactor3D', 'X.labelmap', 'X.loader', 'X.object', 'X.progressbar', 'X.sphere', 'X.volume', 'goog.Timer', 'goog.dom', 'goog.events', 'goog.events.EventType']);
goog.addDependency('../../../utils/lib/X/visualization/renderer2D.js', ['X.renderer2D'], ['X.renderer', 'goog.math.Vec3', 'goog.vec.Vec4']);
goog.addDependency('../../../utils/lib/X/visualization/renderer3D.js', ['X.renderer3D'], ['X.buffer', 'X.caption', 'X.matrix', 'X.renderer', 'X.shaders', 'X.triplets', 'X.vector', 'goog.structs.Map', 'goog.style']);
goog.addDependency('../../../utils/lib/X/visualization/shaders.js', ['X.shaders'], ['X.base']);
goog.addDependency('../../../utils/lib/X/lib/csg/csg.js', ['CSG'], ['csgNode', 'csgPolygon']);
goog.addDependency('../../../utils/lib/X/lib/csg/cube.js', ['CSG.cube'], ['CSG', 'csgPolygon', 'csgVector', 'csgVertex']);
goog.addDependency('../../../utils/lib/X/lib/csg/cylinder.js', ['CSG.cylinder'], ['CSG', 'csgPolygon', 'csgVector', 'csgVertex']);
goog.addDependency('../../../utils/lib/X/lib/csg/node.js', ['csgNode'], ['csgPlane', 'csgPolygon']);
goog.addDependency('../../../utils/lib/X/lib/csg/plane.js', ['csgPlane'], ['csgVector']);
goog.addDependency('../../../utils/lib/X/lib/csg/polygon.js', ['csgPolygon'], ['csgPlane', 'csgVertex']);
goog.addDependency('../../../utils/lib/X/lib/csg/sphere.js', ['CSG.sphere'], ['CSG', 'csgPolygon', 'csgVector', 'csgVertex']);
goog.addDependency('../../../utils/lib/X/lib/csg/vector.js', ['csgVector'], []);
goog.addDependency('../../../utils/lib/X/lib/csg/vertex.js', ['csgVertex'], ['csgVector']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/adler32.js', ['Zlib.Adler32'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/bitstream.js', ['Zlib.BitStream'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/crc32.js', ['Zlib.CRC32'], ['USE_TYPEDARRAY']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/deflate.js', ['Zlib.Deflate'], ['Zlib.Adler32', 'Zlib.RawDeflate']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/gunzip.js', ['Zlib.Gunzip'], ['Zlib.CRC32', 'Zlib.GunzipMember', 'Zlib.Gzip', 'Zlib.RawInflate']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/gzip.js', ['Zlib.Gzip'], ['Zlib.CRC32', 'Zlib.RawDeflate']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/gzip_member.js', ['Zlib.GunzipMember'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/heap.js', ['Zlib.Heap'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/huffman.js', ['Zlib.Huffman'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/inflate.js', ['Zlib.Inflate'], ['Zlib', 'Zlib.Adler32', 'Zlib.RawInflate']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/inflate_stream.js', ['Zlib.InflateStream'], ['Zlib.RawInflateStream']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/rawdeflate.js', ['Zlib.RawDeflate'], ['Zlib.BitStream', 'Zlib.Heap']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/rawinflate.js', ['Zlib.RawInflate'], ['Zlib.Huffman']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/rawinflate_stream.js', ['Zlib.RawInflateStream'], ['Zlib.Huffman']);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/use.js', ['USE_TYPEDARRAY'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/util.js', ['Zlib.Util'], []);
goog.addDependency('../../../utils/lib/X/lib/zlib.js/zlib.js', ['Zlib'], ['Zlib.Deflate', 'Zlib.Inflate']);