const fs = require('fs');
const axios = require("axios");
var args = process.argv;
var nodeJSpath = args[0];
var scriptPath = args[1];
var scriptName = scriptPath.split("/");
scriptName = scriptName[scriptName.length-1];
var curFolder = scriptPath.replace(scriptName, "");
var tokenFile = scriptPath.replace('queryToggl.js', 'token.json')
let rawdata = fs.readFileSync(tokenFile);
let tokenInput = JSON.parse(rawdata);

//Username and password are combined into a string username:password
//or if you use the api token it should be combined xxxx:api_token
//The resulting string literal is then encoded using Base64
//The authorization method and a space i.e. "Basic " is then
//put before the encoded string. For example, if the user agent uses
//'Aladdin' as the username and 'open sesame' as the password then
//the header is formed as follows: Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==

var token = tokenInput['token']+':api_token'
token = 'Basic '+Buffer.from(token).toString('base64')
var options = {
    headers: {
    }
};

function queryApi(url, processingFnc, method = 'get', data=null){
    var instance = axios({
        method: method,
        url: url,
        timeout: 1000,
        params: { with_related_data: true},
        data: data,
        headers: {
            'Authorization': token
        }
    }).then((response) => {
        processingFnc(response.data);
    })
};

function getToday(){
    var today = new Date();
    today.setHours(23);
    today.setMinutes(59);
    today.setSeconds(59);
    var today_iso = today.toISOString();
    return today_iso;
}
function getPastDay(daysIncluded){
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setDate(today.getDate() - daysIncluded);
    var pastday_iso = today.toISOString();
    return pastday_iso;
}
function me(processingFnc){
    queryApi('https://www.toggl.com/api/v8/me', processingFnc);
}

function getUnique(data,key){
    var unique = {};
    var distinct = [];
    data.forEach(function (x) {
        if (!unique[x[key]]) {
            distinct.push(x[key]);
            unique[x[key]] = true;
        }
    });
    return distinct;
}

function getTimeEntries(processingFnc, daysTillNow){
    var date1="2019-03-15T15:08:14+02:00"
    var date2="2019-07-15T15:08:14+02:00"
    queryApi('https://www.toggl.com/api/v8/time_entries?start_date='+getPastDay(daysTillNow)+'&end_date='+getToday(), processingFnc)
}

function getUniqueTimeEntryNames(daysTillNow, processingFnc){
    getTimeEntries(function (data){
        processingFnc(getUnique(data, 'description'));
    }, daysTillNow
    );
}

function timeEntryIsRunning(timeEntry){
    return (typeof timeEntry !== undefined && typeof timeEntry.stop === "undefined");
}

function printTimeEntry(timeEntry){
    if (typeof timeEntry.description !== 'undefined'){
        console.log(timeEntry.description)
    }
    else{
        console.log(timeEntry.id)
    }
}

function stopRunningTimeEntry(id){
    queryApi('https://www.toggl.com/api/v8/time_entries/'+id+'/stop',console.log,'put')
}

function startTimeEntry(descr){
    let data = {}
    data['time_entry'] = { description: descr, created_with: "t2m4k1@github/toggl-polybar" };
    queryApi("https://www.toggl.com/api/v8/time_entries/start",console.log,"post", data);
}

function formatUniqueTimeEntryNames(input){
    var nodeJSpath = args[0];
    var scriptPath = args[1];

    var obj = {};
    getTimeEntries(function(data){
        data.forEach(function (timeEntry){
            if (timeEntry.description === undefined){
                timeEntry.description = "unnamed"
            }
            if (timeEntryIsRunning(timeEntry)){
                obj[timeEntry.description]=timeEntry.id;
            }else if (obj[timeEntry.description] !== -1){
                obj[timeEntry.description]=-1;
            }
        });
        var barString = "";
        Object.keys(obj).forEach(function(key) {
            var val = obj[key];
            if (val !== -1){
                var coloredString = "%{F#090}["+key+"]%{F-}"
                var clickableString = "%{A1:"+nodeJSpath+" "+scriptPath+" stop "+val+":}"+coloredString+"%{A}"
                barString = clickableString+" | "+barString;
            }else{
                var uncoloredString = "["+key+"]";
                var clickableString = "%{A1:"+nodeJSpath+" "+scriptPath+" start "+key+":}"+uncoloredString+"%{A}"
                barString =  clickableString+" | "+barString;
            }
        });
        console.log(barString);
    },4);
}

if (args.length == 4){
    console.log(args[2])
    var stop = args[2].match("^stop$");
    var start = args[2].match("^start$");
    var id = args[3].match("^\\d+$");
    if (stop && id){
        stopRunningTimeEntry(args[3]);
    }
    else if(start){
        startTimeEntry(args[3]);
    }
};

try{
    getUniqueTimeEntryNames(7, formatUniqueTimeEntryNames);
}
catch(e){
    fs.appendFile(curFolder+"errors.log", e, (err) =>  {
        if (err) throw err;
    })

}
