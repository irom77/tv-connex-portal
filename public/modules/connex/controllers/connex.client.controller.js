'use strict';

angular.module('connex').controller('ConnexController', ['$scope', '$stateParams', '$location', 'Connex', 'Servers',
    function($scope, $stateParams, $location, Connex, Servers) {
        $scope.status = 'Not Connected';
        $scope.selectedServer = {
            id: 0,
            userName: 'TVadmin',
            password: 'tv',
            domain: 'Default'
        };

        Servers.list()
            .$promise.then(function(servers){
                $scope.selectedServer = angular.extend($scope.selectedServer, servers[0]);
                $scope.servers = servers;
                //attempt to connect to the selectedServer
                $scope.connect();
            });

        $scope.connect = function(){
            $scope.status = 'Connecting';
            var server = new Servers($scope.selectedServer);
            server.$connect({}, function(response){
                    $scope.connectResponse = angular.copy(response);
                    $scope.status = (response.statusCode === 400) ? 'Not Connected' : 'Connected';
                });
        };
    }
]);
