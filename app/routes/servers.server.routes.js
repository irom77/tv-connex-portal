'use strict';

/**
 * Module dependancies
 * @type {exports}
 */
var servers = require('../../app/controllers/servers.server.controller');

module.exports = function(app) {
    // Servers Routes
    app.route('/servers')
        .post(servers.connect);
};
