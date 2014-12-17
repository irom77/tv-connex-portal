'use strict';

// Configuring the connex module
angular.module('connex').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Connex', 'connex', 'item');
    }
]);
