goog.addDependency('../../../X/io/loader.js', ['X.loader'], [
    'X.parserIMA'
]);

goog.addDependency('../../../_custom/X/io/parserIMA.js', ['X.parserIMA'], [
    'X.event', 
    'X.object', 
    'X.parser', 
    'X.triplets', 
    'goog.math.Vec3'
]);


goog.addDependency('./XnatIO', ['XnatIO'], [
    'X.parserIMA'
]);
