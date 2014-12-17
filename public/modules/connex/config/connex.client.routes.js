'use strict';

// Setting up route
angular.module('connex').config(['$stateProvider',
    function($stateProvider) {
        // connex state routing
        $stateProvider.
            state('Connex', {
                url: '/connex',
                templateUrl: 'modules/connex/views/test-connex.client.view.html'
            });
    }
]);
