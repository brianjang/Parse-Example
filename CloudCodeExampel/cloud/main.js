
// Use Parse.Cloud.define to define as many cloud functions as you want.
var ERROR_BY_USER_INPUT_PARAM = -100;
 
//for my
var APP_ID = 'YOUR_APP_ID';
var APP_API_KEY = 'YOUR_API_KEY';

 var PARSE_CLASSES_ADDR = 'https://api.parse.com/1/classes/';
 
var _makePostBody = function(opt) {
 
    var cmd = {};
 
    var keys = Object.keys(opt);
        var i = keys.length;
        //process options
        while(i--) {
            var key = keys[i];
            switch (key) {
                default:
                    cmd[key] = opt[key];
            }//end of switch
        } //end of while
 
    return cmd;
};
 
var _returnError = function(request, response, msg, rc) {
 
    var ret = {};
    ret.reason = msg;
    ret.code = rc;
    response.success(ret);
};
 
var _makeHttpReqObj = function (request, response, cmd) {
 
    var httpObj = {
        url : cmd.url,
        success: function(httpResponse) {
        // response.success(httpResponse.text);
            // var res = {};
            // res.text = httpResponse.text;
            // res.interval = 100;
 
            var res = JSON.parse(httpResponse.text);
            response.success(res);
            // response.success(res);
        },
        error: function(httpResponse) {
            // console.error('Request failed with response code ' + httpResponse.status);
            _returnError(request, response, JSON.parse(httpResponse.text), httpResponse.status);
        }
    };
     
    if (cmd.params !== undefined) {
        httpObj.params = cmd.params;
    }
 
    if (cmd.headers === undefined) {
        _returnError(request, response, "[Error] HTTP header section is worng", ERROR_BY_USER_INPUT_PARAM);
    }
    httpObj.headers = cmd.headers;
 
    if (cmd.body !== undefined) {
        httpObj.body = cmd.body;
    }
 
    if(cmd.mode !== undefined) {
        httpObj.method = cmd.mode;
    }
 
    return httpObj;
};
 
var _commonSendHttp = function(request, response, opt) {
 
    var cmd ={};
         
    var keys = Object.keys(opt);
    var i = keys.length;
    //process options
    while(i--) {
        var key = keys[i];
        switch (key) {
            case 'method':
                cmd.mode = opt[key]; //method is pre-built property
                break;
            case 'url':
                cmd.url = opt[key];
                break;
            case 'params':
                cmd.params = opt[key];
                break;
            case 'headers':
                cmd.headers = opt[key];
                break;
            case 'body':
                cmd.body = opt[key];
                break;
            default:
                cmd[key] = opt[key];
        }//end of switch
    } //end of while
 
    if(cmd.mode == 'GET' || cmd.mode == 'POST' || cmd.mode == 'PUT' || cmd.mode == 'DELETE') {
 
        var httpObj = _makeHttpReqObj(request, response, cmd);
        Parse.Cloud.httpRequest(httpObj);
    } else {
         
        _returnError(request, response, cmd.mode, ERROR_BY_USER_INPUT_PARAM);
    }
};
 
// For example:
/**
*
* curl -X POST \
-H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
-H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
-H "Connection: keep-alive" \
-H "Content-Type: application/json" \
-d '{}' \
https://api.parse.com/1/functions/hello
*/
Parse.Cloud.define("hello", function(request, response) {
 
    // response.success("Hello FB!");
 
    var opt = {};
    opt.mode = 'GET';
    opt.url = 'http://www.google.com/search'
    opt.params = {q : 'Sean Plott'};
    _commonSendHttp(request, response, opt);
 
    // _sendHttpGet(response, 'http://www.google.com/search', {q : 'Sean Plott'});
 
});
 
Parse.Cloud.define("averageStars", function(request, response) {
 
    var query = new Parse.Query("Review");
    query.equalTo("movie", request.params.movie);
    query.find({
        success: function(results) {
          var sum = 0;
          for (var i = 0; i < results.length; ++i) {
            sum += results[i].get("stars");
          }
          response.success(sum / results.length);
        },
        error: function() {
          response.error("movie lookup failed");
        }
  });
});
 
 
/**
* how to test with curl {"col":"temper", "data": {"owner": "brian.jang", "t_c": 27}}
* curl -X POST \
  -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
  -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
  -H "Content-Type: application/json" \
  -d '{"col":"fluffy", "data": {"o": "fluffy", "d_id" : "A001" ,"t_c": 27, "i_s": 10}}' \
  https://api.parse.com/1/functions/createObject
*/
Parse.Cloud.define("createObject", function(request, response) {
 
    var dbColName = request.params.col;
    var parseAddr = PARSE_CLASSES_ADDR;
    var reqUrl = parseAddr.concat(dbColName);
    var bodyData =  _makePostBody(request.params.data);
 
    if (dbColName === undefined || bodyData === undefined) {
        _returnError(request, response, "[Error] db name or data has wrong format", ERROR_BY_USER_INPUT_PARAM);
    }
     
    // create db collection on Parse.com
    var opt = {};
    opt.mode = 'POST';
    opt.url = reqUrl;
    opt.headers = {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Parse-Application-Id' : APP_ID,
            'X-Parse-REST-API-Key' : APP_API_KEY
        };
    opt.body = bodyData;
    _commonSendHttp(request, response, opt);
 
    // response.success(reqUrl);
});
 
/**
* hwo to test with curl {"col":"temper", "data": {"obj_id" : '8r5wFjIplA'}
* curl -X POST \
  -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
  -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
  -H "Content-Type: application/json" \
  -d '{"col":"fluffy", "data": {"obj_id" : "4IU4i8dihs"}}' \
  https://api.parse.com/1/functions/RetrievObject
 
*/
Parse.Cloud.define("RetrievObject", function(request, response) {
 
    var dbColName = request.params.col;
    var ojbId = request.params.data.obj_id;
    var reqUrl = PARSE_CLASSES_ADDR + dbColName + '/'+ ojbId;
 
    if (dbColName === undefined || ojbId === undefined) {
        _returnError(request, response, "[Error] db name or data has wrong format", ERROR_BY_USER_INPUT_PARAM);
    }
 
// curl -X GET \
//   -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
//   -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
//   https://api.parse.com/1/classes/temper/4IU4i8dihs
    var opt = {};
    opt.mode = 'GET';
    opt.url = reqUrl;
    opt.headers = {
            'X-Parse-Application-Id' : APP_ID,
            'X-Parse-REST-API-Key' : APP_API_KEY
        }
    _commonSendHttp(request, response, opt);
});
 
/**  
* how to test with curl {"col":"temper", "data": {"owner": "brian.jang", "t_c": 27}}
* curl -X POST \
  -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
  -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
  -H "Content-Type: application/json" \
  -d '{"col":"fluffy", "data": {"obj_id" : "4IU4i8dihs", "temp_c": 37}}' \
  https://api.parse.com/1/functions/UpdateObject
*/
Parse.Cloud.define("UpdateObject", function(request, response) {
 
    var dbColName = request.params.col;
    var ojbId = request.params.data.obj_id;
 
    var reqUrl = PARSE_CLASSES_ADDR + dbColName + '/'+ ojbId;
    var bodyData =  _makePostBody(request.params.data);
 
    if (dbColName === undefined || bodyData === undefined || ojbId === undefined) {
        _returnError(request, response, "[Error] db name or data has wrong format", ERROR_BY_USER_INPUT_PARAM);
    }
     
    // create db collection on Parse.com
    var opt = {};
    opt.mode = 'PUT';
    opt.url = reqUrl;
    opt.headers = {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Parse-Application-Id' : APP_ID,
            'X-Parse-REST-API-Key' : APP_API_KEY
        };
    opt.body = bodyData;
    _commonSendHttp(request, response, opt);
});
 
/**  
* how to test with curl 
* curl -X POST \
  -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
  -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
  -H "Content-Type: application/json" \
  -d '{"col":"fluffy", "data": {"obj_id" : "4IU4i8dihs"}}' \
  https://api.parse.com/1/functions/DeleteObject
*/
Parse.Cloud.define("DeleteObject", function(request, response) {
    var dbColName = request.params.col;
    var ojbId = request.params.data.obj_id;
 
    var reqUrl = PARSE_CLASSES_ADDR + dbColName + '/'+ ojbId;
    var bodyData =  _makePostBody(request.params.data);
 
    if (dbColName === undefined || bodyData === undefined || ojbId == undefined) {
        _returnError(request, response, "[Error] db name or data has wrong format", ERROR_BY_USER_INPUT_PARAM);
    }
     
    // create db collection on Parse.com
    var opt = {};
    opt.mode = 'DELETE';
    opt.url = reqUrl;
    opt.headers = {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Parse-Application-Id' : APP_ID,
            'X-Parse-REST-API-Key' : APP_API_KEY
        };
    opt.body = bodyData;
    _commonSendHttp(request, response, opt);
});
 
/**  
* how to test with curl 
* curl -X POST \
  -H "X-Parse-Application-Id: G5DeUoiZMLxMPELna3FM2G9Lqa3ihzSIcLsZOuTr" \
  -H "X-Parse-REST-API-Key: mXPdL4xqPuHgOEHKh22JhlqU2V2Pkzwy65Lulz9A" \
  -H "Content-Type: application/json" \
  -d '{"col":"fluffy", "data": {"obj_id" : "4IU4i8dihs", "temp_c" : {"__op" : "Delete"} } }' \
  https://api.parse.com/1/functions/DeleteObjectField
*/
Parse.Cloud.define("DeleteObjectField", function(request, response) {
 
    var dbColName = request.params.col;
    var ojbId = request.params.data.obj_id;
 
    var reqUrl = PARSE_CLASSES_ADDR + dbColName + '/'+ ojbId;
    var bodyData =  _makePostBody(request.params.data);
 
    if (dbColName === undefined || bodyData === undefined || ojbId === undefined) {
        _returnError(request, response, "[Error] db name or data has wrong format", ERROR_BY_USER_INPUT_PARAM);
    }
     
    // create db collection on Parse.com
    var opt = {};
    opt.mode = 'PUT';
    opt.url = reqUrl;
    opt.headers = {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Parse-Application-Id' : APP_ID,
            'X-Parse-REST-API-Key' : APP_API_KEY
        };
    opt.body = bodyData;
    _commonSendHttp(request, response, opt);
});
 
/**
* hwo to test with curl
*/
Parse.Cloud.define("BatchObject", function(request, response) {
    response.success("Not yet implemented");
});
