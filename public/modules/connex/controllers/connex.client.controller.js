'use strict';

angular.module('connex').controller('ConnexController', ['$scope', '$stateParams', '$location', 'Connex', 'Servers',
    function($scope, $stateParams, $location, Connex, Servers) {
        $scope.status = 'Not Connected';
        $scope.hideServerInfo = true;
        $scope.responseRecieved = false;
        $scope.drawChart = false;
        $scope.selectedTab = 'response';
        $scope.selectedServer = {
            id: 0,
            userName: 'TVadmin',
            password: 'tv',
            domain: 'Default'
        };
        $scope.queryParams = {
            query: null,
            startTime: new Date(new Date().getTime() - (240 * 60 * 1000)),
            endTime: new Date()
        };

        //charting config
        $scope.chartData = [];
        $scope.chartOptions = {
            axes: {
                x: {key: 'x', type: 'date', ticks: 5},
                y: {type: 'linear', ticks: 5}
            },
            series: [
                {y: 'EurtV2', color: 'steelblue', type: 'area', label: 'EurtV2'},
                {y: 'Eurt', color: 'black', type: 'area', label: 'Eurt'}
            ],
            lineMode: 'linear',
            tension: 0.7,
            drawLegend: true
        };
        $scope.chartableMetrics = [];

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

                        $scope.getApmServers();
                    }
                });
        };

        $scope.showServerInfo = function(){
            $scope.hideServerInfo = !($scope.hideServerInfo);
        };

        $scope.makeConnexQuery = function(queryParams, cbk){
            var callback = cbk || function(response){
                    $scope.response = response;
                    $scope.responseRecieved = true;

                    //detect if the data will be chartable
                    $scope.drawChart = queryParams.query.indexOf('Trend') !== -1;
                    //if drawChart is true, render the chart
                    if($scope.drawChart && response.Table){
                        $scope.chartData = angular.copy(response.Table);
                        _.forEach($scope.chartData, function(dataItem) { dataItem.x = new Date(dataItem.StartTime)});
                    }
                };
            //mark that the response is not received
            $scope.responseRecieved = false;
            var params = angular.copy(queryParams);
            params.userName = $scope.selectedServer.userName;
            params.password = $scope.selectedServer.password;
            params.domain = $scope.selectedServer.domain;

            params.url = _.find($scope.servers, function(server) {
                return server.id === $scope.selectedServer.id;
            }).url;
            var connection = new Connex(params);
            connection.$makeQuery({}, callback);
        };

        $scope.getApmServers = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = "APMTopServers";
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmServers = response.Table;
            })
        }
    }
]);
