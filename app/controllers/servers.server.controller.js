'use strict';

/**
 * Module dependencies.
 */
var servers = require('../../config/config').servers,
    errorHandler = require('./errors.server.controller'),
    _ = require('lodash');

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
    res.json({status: 'Connected'});
};
