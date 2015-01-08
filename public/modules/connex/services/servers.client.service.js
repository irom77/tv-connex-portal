'use strict';

//servers service used for communicating with the servers REST endpoints
angular.module('connex').factory('Servers', ['$resource',
    function($resource) {
        return $resource('/servers', {}, {
            list: {
                method: 'GET',
                isArray: true,
                url: '/servers'
            },
            connect: {
                method: 'POST'
            }
        });
    }
]);
