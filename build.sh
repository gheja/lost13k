#!/bin/bash

now=`date +%Y%m%d_%H%M%S`
zip="../lost13k_${now}.zip"

cd src

zip -r9 $zip index.html *.js
