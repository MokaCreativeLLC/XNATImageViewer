python ./closure-library/closure/bin/build/closurebuilder.py \
--root ./closure-library \
--root ./gxnat \
--root ./nrg \
--root ./X \
--root ./_custom \
--root ./xiv \
--namespace "xiv" \
--namespace "xiv.start" \
--namespace "xiv.ui.Modal" \
--output_mode=compiled \
--compiler_jar=./compiler-latest/compiler.jar \
--compiler_flags="--language_in=ECMASCRIPT5" \
--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
--compiler_flags="--externs=./jszip/jszip.min.js" \
--compiler_flags="--create_source_map=./xiv-min.js.map" \
--compiler_flags="--js_output_file=xiv-min.js"
python ../../../../utility-scripts/python/addSourceMapLine.py -j ./xiv-min.js -s ./xiv-min.js.map

