'use strict';

/**
 * Module dependencies.
 */
var config = require('../../config/config'),
    request = require('request'),
    errorHandler = require('./errors.server.controller'),
    _ = require('lodash');

/**
 * local variables
 */
var qsDefaults = {
        format: 'json'
    };

/**
 * List of Servers
 */
exports.list = function(req, res) {
    res.json(servers);
};

/**
 * Connect to a server
 */
exports.connect = function(req, res) {
    //TODO add error handling
    var qs = _.defaults(qsDefaults, {
            userName: req.body.userName,
            password: req.body.password,
            domain: req.body.domain,
            query: 'info'
        });
    console.log('Connecting to: ' + req.body.url);
    //make an info request
    request({
        url: req.body.url + config.connexBaseUrl,
        json: qs.format === 'json',
        strictSSL: false,
        qs: qs
    }, function(error, response, body){
        res.json(response);
    });
};
