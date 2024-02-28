#!/bin/bash

cd scripts
cd csvToJson && npm start
cd ../
node deletePlantsDirectory.mjs && node setupFiles.mjs
