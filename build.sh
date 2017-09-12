#!/bin/bash

now=`date +%Y%m%d_%H%M%S`
zip1="../../build_${now}_advanced.zip"
zip1b="../../build_${now}_advanced_advzip.zip"
shave="no"

mkdir -p ./build/stage1

cd ./build/stage1

{
	echo "\"use strict\";"
	cat ../../src/config.js \
		../../src/lib.js \
		../../src/animation.js \
		../../src/landscape.js \
		../../src/solar.js \
		../../src/starmap.js \
		../../src/wormhole.js \
		../../src/noise.js \
		../../src/title.js \
		../../src/main.js \
		| grep -vE '^\"use strict'
} > a.js

java -jar ../compiler/compiler.jar \
	--compilation_level ADVANCED_OPTIMIZATIONS \
	--js a.js \
	--js_output_file b.js \
	--logging_level FINEST \
	--warning_level VERBOSE \
	--summary_detail_level 3

cat ../../src/index.min.html | sed \
	-e '/<!-- insert minified javascript here -->/{' \
	-e 'i <script>' \
	-e 'r b.js' \
	-e 'a </script>' \
	-e 'd}' \
	> index.html


if [ "$shave" == "yes" ]; then
	cp index.html index.html.1
	cat index.html.1 | tr -d '\r' | tr '\n' ' ' > index.html
fi

zip -9 $zip1 index.html

cp $zip1 $zip1b
if [ "$shave" == "yes" ]; then
	../advancecomp/advancecomp-1.20/advzip -z -4 -i 50000 $zip1b
else
	../advancecomp/advancecomp-1.20/advzip -z -4 -i 500 $zip1b
fi

ls -albtr * $zip1 $zip1b
