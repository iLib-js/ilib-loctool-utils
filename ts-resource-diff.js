/*
 * ts-resource-diff.js - TS resource file comparison.
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
 var xml2json = require("xml2json");
 var PrettyData = require("pretty-data").pd;

 function usage() {
    console.log("Usage: ts-diff [file1] [file2]\n" +
        "diff.js\n" +
        "  It shows the result of adding and deleting to file2 compared to file1.\n" +
        "-h or --help\n" +
        "file1\n" +
        "  ts file1.\n" +
        "file2\n" +
        "  ts file2.\n");
    process.exit(1);
}

process.argv.forEach(function (val, index, array) {
    if (val === "-h" || val === "--help") {
        usage();
    }
});

var xmlOrg = process.argv[2];
var xmlNew = process.argv[3];

var resourceData, resourceDataNew;
var newString = [], removedString = [];
var newFile = [], removedFile = [];

function isArray(obj) {
    if (typeof(obj) === 'object') {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    return false;
}

function searchValue(obj, source, comment) {
    var result = obj.filter(function(item){
        var itemComment = typeof (item.comment) !== "undefined" ? item.comment.$t: "";
        return ((item.source.$t === source) && (comment === itemComment));
    })
    return (result.length !== 0) ? true :false;
}

function readXmls(xmlOrg, xmlNew) {
    if (!fs.existsSync(xmlOrg)) {
        util.error("Could not access file: " + xmlOrg);
        usage();
    } else {
        xmlFile = fs.readFileSync(xmlOrg, "utf-8");
        var json = xml2json.toJson(xmlFile, {
            object: true,
            sanitize: true,
            reversible: true,
            trim: false
        })
        resourceData = json.TS.context;
    }

    if (!fs.existsSync(xmlNew)) {
        util.error("Could not access file: " + xmlNew);
        usage();
    } else {
        xmlFile2 = fs.readFileSync(xmlNew, "utf-8");
        var jsonNew = xml2json.toJson(xmlFile2, {
            object: true,
            sanitize: true,
            reversible: true,
            trim: false
        });
        resourceDataNew = jsonNew.TS.context;
    }
}

function compareArray(filename, arrayOrg, arrayNew) {
    var arrOrg = isArray(arrayOrg)? arrayOrg :[arrayOrg];
    var arrNew = isArray(arrayNew)? arrayNew :[arrayNew];
    var result;
    for (var i=0; i< arrOrg.length; i++) {
        var string = arrOrg[i].source.$t;
        var comment = typeof (arrOrg[i].comment) !== "undefined" ? arrOrg[i].comment.$t : "";

        result = searchValue(arrNew, string, comment);

        if (!result) {
            var str = "[filename] " + filename + ".qml  " + "[string] " + string;
            if (comment !== ""){
                str = str + comment;
            }
            removedString.push(str);
        }
    }
    for (var i=0; i< arrNew.length; i++) {

        var string = arrNew[i].source.$t;
        var comment = typeof (arrNew[i].comment) !== "undefined" ? arrNew[i].comment.$t : "";

        result = searchValue(arrOrg, string, comment);

        if (!result) {
            var str = "[filename] " + filename + ".qml  " + "[string] " + string;
            if (comment !== "") {
                comment = "    [comment]  " + comment;
                str = str + comment;
            }
            newString.push(str);
            //console.log("!!!");
        }
    }
}

function compareFile (resourceData, resourceDataNew) {
    var filename;
    var resourceDataArr = isArray(resourceData)? resourceData :[resourceData];
    var resourceDataNewArr = isArray(resourceDataNew)? resourceDataNew :[resourceDataNew];

    for (var i= 0; i < resourceDataArr.length; i++) {
        filename = resourceDataArr[i].name.$t;
        
        var temp = resourceDataNewArr.filter(function(element){
            if (element.name.$t === filename) {
                return element
            }
        })
        if (temp.length != 0) {
            compareArray(filename, resourceDataArr[i].message, temp[0].message);
        }
        else {
            removedFile.push(filename);
        }
    }

    for (var i= 0; i < resourceDataNewArr.length; i++) {
        filename = resourceDataNewArr[i].name.$t;
        var temp = resourceDataArr.filter(function(element){
            if (element.name.$t === filename) {
                return element
            }
        })
        if (temp.length == 0) {
            var str = "Newly AddedFile: " + filename + ".qml";
            newFile.push(filename);
        }
    }
}

function result() {
    console.log("============================= [ Result ] ============================= ");
    console.log("Total Removed File Num: " + removedFile.length);
    console.log("Total Removed String Num: " + removedString.length);
    console.log("Total Added File Num: " + newFile.length);
    console.log("Total Added String Num: " + newString.length);
    console.log("============================= [ detail ] ============================= ");

    removedFile.forEach(function (element) {
        console.log("Removed File: ", element, ".qml");
    });
    
    removedString.forEach(function (element){
        console.log("Removed String: ", element);
    });
    
    newString.forEach(function (element){
        console.log("New String: ", element);
    });
    newFile.forEach(function (element){
        console.log("New File: ", element, ".qml");
    });
}

readXmls(xmlOrg, xmlNew);
compareFile(resourceData, resourceDataNew);
result();