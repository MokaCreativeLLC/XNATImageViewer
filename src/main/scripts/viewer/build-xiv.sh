python ./closure-library/closure/bin/build/closurebuilder.py \
--root ./closure-library \
--root ./gxnat \
--root ./nrg \
--root ./X \
--root ./_custom \
--root ./jszip \
--root ./xiv \
--namespace "xiv" \
--namespace "xiv.start" \
--namespace "xiv.ui.Modal" \
--output_mode=compiled \
--compiler_jar=./compiler-latest/compiler.jar \
--compiler_flags="--language_in=ECMASCRIPT5" \
--compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS" \
> ./xiv-min.js
