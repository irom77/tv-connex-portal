'use strict';

/**
 * Module dependancies
 * @type {exports}
 */
var servers = require('../../app/controllers/servers.server.controller');

module.exports = function(app) {
    // Servers Routes
    app.route('/servers')
        .get(servers.list);
    app.route('/servers/:id')
        .post(servers.connect);
};
