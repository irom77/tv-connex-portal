'use strict';

//connex service used for communicating with the connex REST endpoints
angular.module('connex').factory('Connex', ['$resource',
    function($resource) {
        return $resource('/connex', {}, {
            makeQuery: {
                method: 'POST'
            }
        });
    }
]);
