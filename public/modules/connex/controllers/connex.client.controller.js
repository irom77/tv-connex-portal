'use strict';

angular.module('connex').controller('ConnexController', ['$scope', '$stateParams', '$location', 'Connex', 'Servers',
    function($scope, $stateParams, $location, Connex, Servers) {
        $scope.status = 'Not Connected';
        $scope.hideServerInfo = true;
        $scope.responseRecieved = false;
        $scope.drawChart = false;
        $scope.selectedServer = {
            id: 0,
            userName: 'TVadmin',
            password: 'tv',
            domain: 'Default'
        };
        $scope.queryParams = {
            query: null,
            startTime: new Date(new Date().getTime() - (60 * 60 * 1000)),
            endTime: new Date()
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
                    $scope.status = (!(response.statusCode) || response.statusCode !== 200) ? 'Not Connected' : 'Connected';
                    if(response.statusCode === 200 && angular.isArray(response.body.Table)){
                        //connection is valid
                        $scope.queries = response.body.Table.map(function(entry){
                            return {
                                query: entry.Query,
                                description: entry.Description,
                                uri: entry.Uri
                            };
                        });

                        //set the default query to the first one
                        $scope.queryParams.query = $scope.queries[0].query;
                    }
                });
        };
        $scope.showServerInfo = function(){
            $scope.hideServerInfo = !($scope.hideServerInfo);
        };

        $scope.makeConnexQuery = function(queryParams){
            //detect if the data will be chartable
            $scope.drawChart = queryParams.query.indexOf('Trend') !== -1;
            var params = angular.copy(queryParams);
            params.userName = $scope.selectedServer.userName;
            params.password = $scope.selectedServer.password;
            params.domain = $scope.selectedServer.domain;

            params.url = _.find($scope.servers, function(server) {
                return server.id === $scope.selectedServer.id;
            }).url;
            var connection = new Connex(params);
            connection.$makeQuery({}, function(response){
                $scope.response = response;
                $scope.responseRecieved = true;
            });
        };
    }
]);
