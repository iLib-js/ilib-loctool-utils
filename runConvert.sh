#!/bin/bash
#
# runConvert.sh - Convert multiple files to specific type
#
# Copyright (c) 2021, JEDLSoft
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#
# See the License for the specific language governing permissions and
# limitations under the License.
#/

echo "*** Converting multiple files ... ***"

if [ "$1" == "-h" ]; then
  echo "Usage: `basename $0` [plugin name] [inputfile Dir] [outputfile Dir]"
  exit 0
fi

locales=("ko-KR" "it-IT");

echo "Please enter the number according to the type of job you want: "
echo "1) xliff to xlsxs  2) xlsx to xliff "
read type

plugin=$1
inputDir=$2
outputDir=$3

if [ "$#" -eq 3 ]
then
    if [ -d $inputDir ]
    then
    echo directory ${inputDir} exist
    else
    echo Directory ${inputDir} Does not exists
    fi
    if [ -d $outputDir ]
    then
    echo directory ${outputDir} exist
    else
    echo Directory ${outputDir} Does not exists
    fi
else
echo "Arguments are not equals to 3"
exit 1
fi

fileConvert(){
  #echo argument $1 $2 $3 $4
  node node_modules/.bin/loctool convert -2 --plugins $4 $2 $1 --targetLocale $3
}

for locale in "${locales[@]}";
do
  if [ "$type" == 1 ];then
    inputFile=$inputDir$locale.xliff
    outputFile=$outputDir$locale.xlsx
    fileConvert $inputFile $outputFile $locale $plugin
  else
    inputFile=$inputDir$locale.xlsx
    outputFile=$outputDir$locale.xliff
    fileConvert $inputFile $outputFile $locale $plugin
  fi
done
