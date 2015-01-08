'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
    request = require('request'),
    querystring = require('querystring'),
    _ = require('lodash');

/**
 * Make a query to connex
 */
var makeConnexRequest = function (dataRequestConfig, callback){
    //verify that the required fields are passed in
    if (!dataRequestConfig || !_.isObject(dataRequestConfig)){
        throw new Error('connexRequest - proper config object is required');
    }
    else if (!_.has(dataRequestConfig, 'url')){
        throw new Error('connexRequest - url is required');
    }
    else if (!callback || typeof callback !== 'function'){
        throw new Error('connexRequest - callback is required');
    }
    else if (!_.has(dataRequestConfig, 'params' || !_.isObject(dataRequestConfig.params))){
        throw new Error('connexRequest - params is required and must be an object');
    }
    var method = dataRequestConfig.method || 'GET',
        url = dataRequestConfig.url,
        params = dataRequestConfig.params;
    //get the data
    var dataUri = url + '?' + querystring.stringify(params);
    console.log(JSON.stringify(dataUri));
    request(
        {
            uri: dataUri,
            json: true
        },
        function (error, response, body) {
            //the response to be sent via the callback
            var dataResponse = body;
            console.log(JSON.stringify(body));
            if (!error) {
                if (response.statusCode === 200) {
                    dataResponse = body;
                }
            }
            else{
                console.log('error ' + JSON.stringify(error));
                console.log('response ' + JSON.stringify(response));
                console.log(JSON.stringify(body));
            }
            try {
                callback(dataResponse);
            } catch (e) {
                throw new Error('dataManager - callback function threw an error');
            }
        }
    );
};

exports.makeQuery = function(req, res) {
    var payload = req.body,
        requestObj = {
        url: payload.url + '/Portal/Portal/Services/ConnexDataAccess.ashx',
        params: {
            userName: payload.userName,
            password: payload.password,
            domain: payload.domain,
            query: payload.query,
            format: 'json',
            startTime: payload.startTime,
            endTime: payload.endTime,
            filter: '',
            allowV1Metrics: 'true'
        }
    };

    //build out the filter
    if(_.has(payload, 'serverId') && !_.isUndefined(payload.serverId)){
        requestObj.params.filter= 'serverId='+payload.serverId;
    }
    if(_.has(payload, 'applicationId') && !_.isUndefined(payload.applicationId)){
        if(!!requestObj.params.filter){
            requestObj.params.filter += ' AND ';
        }
        requestObj.params.filter += 'applicationId='+payload.applicationId;
    }
    if(_.has(payload, 'siteId') && !_.isUndefined(payload.siteId)){
        if(!!requestObj.params.filter){
            requestObj.params.filter += ' AND ';
        }
        requestObj.params.filter += 'siteId='+payload.siteId;
    }

    // make the request
    makeConnexRequest(requestObj, function(response){
            res.send(response);
        }
    );
};

