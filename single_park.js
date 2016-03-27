var MONTHS = ["Bogus", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var express = require('express');
var fs = require('fs');
// var request = require('request');
var cheerio = require('cheerio');
var HashMap = require('hashmap');
var app     = express();
var request = require('sync-request');

var goldenvaleParks = new HashMap();
var northernEmpireParks = new HashMap();

var quarters = [];
quarters['1'] = ['01', '02', '03'];
quarters['2'] = ['04', '05', '06'];
quarters['3'] = ['07', '08', '09'];
quarters['4'] = ['10', '11', '12'];

quarters['5'] = ['06', '07', '08', '09'];

var quarterChosen = process.argv[2];
if (!quarterChosen) quarterChosen = "1";

quarter = quarters[quarterChosen];


console.log("Report for single park " + new Date().toDateString());
console.log("");
console.log("======================");
console.log("");

// goldenvaleParks.set("Annwyn", "469");
// goldenvaleParks.set("Arrantor", "467");
// goldenvaleParks.set("Bellhollow", "609");
// goldenvaleParks.set("Bitter Coast", "254");
// goldenvaleParks.set("Blightstone Hallow", "398");
// goldenvaleParks.set("Boreal Dale", "363");
// goldenvaleParks.set("Bridgehaven", "662");
// goldenvaleParks.set("Caerbannog", "613");
goldenvaleParks.set("Caradoc Hold", "198");
// goldenvaleParks.set("Empire's Grove", "347");
// goldenvaleParks.set("Falcon's Rest", "587");
// goldenvaleParks.set("Goldenvale", "166");
// goldenvaleParks.set("Haranshire", "120");
// goldenvaleParks.set("Lichwood Grove", "615");
// goldenvaleParks.set("Silva Urbem", "616");
// goldenvaleParks.set("Two Rivers Point", "444");
goldenvaleParks.forEach(function(parkID, parkName) {
    printPark(parkID, parkName);
    printMonthlyDues(quarter);
});

// console.log("");
// console.log("The Northern Empire");
// console.log("===================");
// console.log("");
// northernEmpireParks.set("Felfrost", "277");
// northernEmpireParks.set("Linnagond", "494");
// northernEmpireParks.set("Twilight Peak", "79");
// northernEmpireParks.set("White Stone Valley", "498");
// northernEmpireParks.set("Wolven Fang", "77");


northernEmpireParks.forEach(function(parkID, parkName) {
    printPark(parkID, parkName);
});


function printPark(parkID, parkName) {
    attendanceDates = new Array();
    playerList = new HashMap();
    console.log("============== " + parkName + " ==============");

    officers = getOfficers('http://amtgard.com/ork/orkui/index.php?Route=Admin/setparkofficers&ParkId=' + parkID);

    monarch = officers['Monarch'];
    console.log("Monarch: " + monarch['player'] + " (ORK id: " + monarch['user'] + ") ");
    console.log("\r\nEmail or Contact Info: ____________________________________\r\n");

    primeminister = officers['Prime Minister'];
    console.log("Prime Minister: " + primeminister['player'] + " (ORK id: " + primeminister['user'] + ") ");
    console.log("\r\nEmail or Contact Info: ____________________________________\r\n");

    regent = officers['Regent'];
    console.log("Regent: " + regent['player'] + " (ORK id: " + regent['user'] + ") ");
    console.log("\r\nEmail or Contact Info: ____________________________________\r\n");

    champion = officers['Champion'];
    console.log("Champion: " + champion['player'] + " (ORK id: " + champion['user'] + ") ");
    console.log("\r\nEmail or Contact Info: ____________________________________\r\n");

    aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/' + parkID + '/Months/5';
    getAttendanceDates(aURL);

    console.log("Year\tMonth\t1-15th\t16th-on\ttotal");
    playerList.forEach(function(aMonthMap, aYear) {
        aMonthMap.forEach(function(breakdown, aMonth) {
            if (quarter.indexOf(aMonth) != -1) {
                console.log(aYear + "\t" + aMonth + "\t" + breakdown.get('begin').length + "\t" + breakdown.get('end').length + "\t" + breakdown.get('month').length);
            }
        })
    })

    console.log("Printing out unique logins per month section");
    playerList.forEach(function(aMonthMap, aYear) {
        aMonthMap.forEach(function(breakdown, aMonth) {
            if (quarter.indexOf(aMonth) != -1) {
                console.log(aYear + "\t" + aMonth + "\t1-15th total=" + breakdown.get('begin').length);
                breakdown.get('begin').forEach(function (aPlayer) {
                    console.log(aPlayer + ", ");
                })
                console.log(aYear + "\t" + aMonth + "\t16-on total=" + breakdown.get('end').length);
                breakdown.get('begin').forEach(function (aPlayer) {
                    console.log(aPlayer + ", ");
                })
                console.log(aYear + "\t" + aMonth + "\ttotal=" + breakdown.get('month').length);
            }
            // .length + "\t" + breakdown.get('end').length + "\t" + breakdown.get('month').length);
        })
    })
    console.log("");
}

function printMonthlyDues(quarter) {
    quarter.forEach(function(aMonth) {
        console.log("\r\nFor " + MONTHS[parseInt(aMonth)] + ", _________ terms of dues paid by ____________________________________");
        console.log("example 3 terms of dues paid (Ann x2 and Bob x1)\r\n");
    });
    console.log("\r\n_____ Total terms of dues paid, ____ (1$ per term paid) owed to the kingdom coffers.");
}

function getOfficers(url) {
    var fields = ['user', 'player', 'role', 'position', 'hidden1', 'hidden2']
    res = request("GET", url);
    var $ = cheerio.load(res.getBody().toString());
    var officers = {};
    $officerList = $('.information-table').children().first().next().children();
    $officerList.filter(function() {
        anOfficer = {};
        var fieldPosition = 0;
        var $officerRow = $(this).first().children()
        $officerRow.each(function () {
            $rowItem = $(this);
            anOfficer[fields[fieldPosition]] = $rowItem.text();
            fieldPosition++;
        });
        if (anOfficer['position']) {
            officers[anOfficer['position']] = anOfficer;
        }
    });
    return officers;
}

function getAttendanceDates(url) {    
    res = request("GET", url);
    var $ = cheerio.load(res.getBody().toString());
    $('.information-table').children().first().next().children().filter(function(){
        var $data = $(this);
        aDateURL = "http:" + $data.attr('onclick').substring($data.attr('onclick').indexOf('//'));
        aDateURL = aDateURL.substring(0, aDateURL.length - 1);
        aDate = $data.children().first().text();
        aMonthList = monthListForDate(aDate);
        beginEnd = null;
        if (aDate.split('-')[2] < 16) {
            beginEnd = aMonthList.get('begin');
        } else {
            beginEnd = aMonthList.get('end');
        }
        getPlayersFromUrl(aDateURL, beginEnd, aMonthList.get('month'));
    });
}

function monthListForDate(aDate) {
    dateArray = aDate.split('-');
    year = dateArray[0];
    month = dateArray[1];
    day = dateArray[2];
    yearMap = null;
    monthMap = null;
    yearMap = playerList.get(year);
    if (!yearMap) {
        yearMap = new HashMap();
        playerList.set(year, yearMap);
    }
    monthMap = yearMap.get(month);
    if (!monthMap) {
        monthMap = new HashMap();
        monthMap.set("begin", new Array());
        monthMap.set("end", new Array());
        monthMap.set("month", new Array());
        yearMap.set(month, monthMap);
    }
    return monthMap;
}

function getPlayersFromUrl(playerURL, aBeginEnd, aMonth) {    
    resPlayer = request("GET", playerURL);
    var $ = cheerio.load(resPlayer.getBody().toString());

    $('.information-table').children().next().children().filter(function(){
        var player = $(this);
        playerName = $(player.children()[2]).text();
        if (aBeginEnd.indexOf(playerName) == -1)
            aBeginEnd.push(playerName);
            // console.log(beginEnd);
        if (aMonth.indexOf(playerName) == -1)
            aMonth.push(playerName);
            // console.log(aMonth);
    });
}

// app.listen('8081')
// console.log('TaCD listening on port 8081');
exports = module.exports = app;
