/*
 * json-resource-diff.js - JSON resource file comparison.
 *
 * Copyright © 2020, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var util = require('util');
var path = require("path");

function usage() {
    console.log("Usage: json-diff [file1] [file2]\n" +
        "diff.js\n" +
        "  It shows the result of adding and deleting to file2 compared to file1.\n" +
        "-h or --help\n" +
        "file1\n" +
        "  json file1.\n" +
        "file2\n" +
        "  json file2.\n");
    process.exit(1);
}

process.argv.forEach(function (val, index, array) {
    if (val === "-h" || val === "--help") {
        usage();
    }
});

var jsonOrg = process.argv[2];
var jsonNew = process.argv[3];

var resourceObj, resourceObjNew;
var newString = [], removedString = [];

function readJSONs(jsonOrg, jsonNew) {
    if (!fs.existsSync(jsonOrg)) {
        util.error("Could not access file: " + jsonOrg);
        usage();
    } else {
        resourceObj = require(path.resolve(jsonOrg));
    }

    if (!fs.existsSync(jsonNew)) {
        util.error("Could not access file: " + jsonNew);
        usage();
    } else {
        resourceNewObj = require(path.resolve(jsonNew));
    }
}

function compareFile(resourceObj, resourceNewObj) {
    for (var item in resourceObj) {
        if (!resourceNewObj.hasOwnProperty(item)) {
            removedString.push(item);
        }
    }

    for (var item in resourceNewObj) {
        if (!resourceObj.hasOwnProperty(item)) {
            newString.push(item);
        }
    }
}

function result() {
    console.log("============================= [ Result ] ============================= ");
    console.log("Total Removed String Num: " + removedString.length);
    console.log("Total Added String Num: " + newString.length);
    console.log("============================= [ detail ] ============================= ");

    removedString.forEach(function (element){
        console.log("Removed String: ", element);
    });
    
    newString.forEach(function (element){
        console.log("New String: ", element);
    });
}

readJSONs(jsonOrg, jsonNew);
compareFile(resourceObj, resourceNewObj);
result();