var express = require('express');
var fs = require('fs');
// var request = require('request');
var cheerio = require('cheerio');
var HashMap = require('hashmap');
var app     = express();
var request = require('sync-request');

console.log("Starting");
var goldenvaleParks = new HashMap();
// goldenvaleParks.set("Annwyn", "469");
// goldenvaleParks.set("Arrantor", "467");
// goldenvaleParks.set("Bellhollow", "609");
// goldenvaleParks.set("Bitter Coast", "254");
goldenvaleParks.set("Blightstone Hallow", "398");
// goldenvaleParks.set("Boreal Dale", "363");
// goldenvaleParks.set("Caerbannog", "613");
// goldenvaleParks.set("Caradoc Hold", "198");
// goldenvaleParks.set("Empire's Grove", "347");
// goldenvaleParks.set("Falcon's Rest", "587");
// goldenvaleParks.set("Goldenvale", "166");
// goldenvaleParks.set("Haranshire", "120");
// goldenvaleParks.set("Lichwood Grove", "615");
// goldenvaleParks.set("Silva Urbem", "616");
// goldenvaleParks.set("Two Rivers Point", "444");
// goldenvaleParks.set("Felfrost", "277");
// goldenvaleParks.set("Linnagond", "494");
// goldenvaleParks.set("Twilight Peak", "79");
// goldenvaleParks.set("White Stone Valley", "498");
// goldenvaleParks.set("Wolven Fang", "77");

goldenvaleParks.forEach(function(parkID, parkName) {
    attendanceDates = new Array();
    playerList = new HashMap();
    console.log(parkName );
    aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/' + parkID + '/Months/5';
    getAttendanceDates(aURL);

    // console.log("Year\tMonth\t1-15th\t16th-on\ttotal");
    // playerList.forEach(function(aMonthMap, aYear) {
    //     aMonthMap.forEach(function(breakdown, aMonth) {
    //         console.log(aYear + "\t" + aMonth + "\t" + breakdown.get('begin').length + "\t" + breakdown.get('end').length + "\t" + breakdown.get('month').length);
    //     })
    // })

    console.log("Printing out unique logins per month section");
    playerList.forEach(function(aMonthMap, aYear) {
        aMonthMap.forEach(function(breakdown, aMonth) {
            if (aMonth > 3) {
                return;
            }
            console.log(aYear + "\t" + aMonth + "\t1-15th total=" + breakdown.get('begin').length);
            breakdown.get('begin').forEach(function (aPlayer) {
                console.log(aPlayer + ", ");
            })
            console.log(aYear + "\t" + aMonth + "\t16-on total=" + breakdown.get('end').length);
            breakdown.get('begin').forEach(function (aPlayer) {
                console.log(aPlayer + ", ");
            })
            console.log(aYear + "\t" + aMonth + "\ttotal=" + breakdown.get('month').length);
            // .length + "\t" + breakdown.get('end').length + "\t" + breakdown.get('month').length);
        })
    })

});

// Felfrost
// console.log("Felfrost unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/277/Months/12';

// White Stone Valley
// console.log("White Stone Valley unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/498/Months/6';


// console.log("Goldenvale unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/166/Months/6';

// Twilight Peak
// console.log("Twilight Peak unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/79/Months/6';

// The Northern Empire
// console.log("The Northern Empire unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/347/Months/6';

// Caradoc Hold
// console.log("Caradoc Hold unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/198/Months/6';


// Wolvenfang
// console.log("Wolvenfang unique attendance per month");
// aURL = 'http://amtgard.com/ork/orkui/index.php?Route=Reports/attendance/Park/77/Months/6';

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