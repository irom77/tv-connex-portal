'use strict';

/**
 * Module dependancies
 * @type {exports}
 */
var connex = require('../../app/controllers/connex.server.controller');

module.exports = function(app) {
    // connex Routes
    app.route('/connex')
        .post(connex.makeQuery);
};
