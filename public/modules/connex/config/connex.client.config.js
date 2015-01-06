'use strict';

// Configuring the connex module
angular.module('connex', ['ui.bootstrap.datetimepicker']).run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Connex', 'connex', 'item');
    }
]);
