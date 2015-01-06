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
    },
    servers = config.servers;
//add ids to the servers
for(var i = 0; i < servers.length; i++){
    servers[i].id = i;
}

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
    //right now, ids are simply indexes
    var server = servers[req.params.id],
        qs = _.defaults(qsDefaults, {
            userName: req.body.userName,
            password: req.body.password,
            domain: req.body.domain,
            query: 'info'
        });
    console.log('Connecting to: ' + server.url);
    //make an info request
    request({
        url: server.url + config.connexBaseUrl,
        json: qs.format === 'json',
        strictSSL: false,
        qs: qs
    }, function(error, response, body){
        res.json(response);
    });
};
