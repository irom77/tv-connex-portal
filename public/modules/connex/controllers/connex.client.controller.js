'use strict';

angular.module('connex').controller('ConnexController', ['$scope', '$stateParams', '$location', 'Connex', 'Servers',
    function($scope, $stateParams, $location, Connex, Servers) {
        $scope.status = 'Connect';
        $scope.collapseTruViewServerConfig = false;
        $scope.hideServerInfo = true;
        $scope.responseRecieved = false;
        $scope.drawChart = false;
        $scope.selectedTab = 'response';
        $scope.protocols = ['http://', 'https://'];
        $scope.selectedServer = {
            protocol: $scope.protocols[0],
            ip: '10.250.10.45',
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
        $scope.chartSeries = [
            {y: 'EurtV2', color: 'green', type: 'area', label: 'EurtV2', min: 0},
            {y: 'Eurt', color: 'gray', type: 'area', label: 'Eurt', min: 0},
            {y: 'ClientDelay', color: 'yellow', type: 'line', label: 'ClientDelay', min: 0},
            {y: 'NetworkDelay', color: 'purple', type: 'line', label: 'NetworkDelay'},
            {y: 'ServerDelay', color: 'orange', type: 'line', label: 'ServerDelay'},
            {y: 'ApplicationDelay', color: 'blue', type: 'line', label: 'ApplicationDelay'},
        ];
        $scope.chartOptions = {
            axes: {
                x: {key: 'x', type: 'date', ticks: 5},
                y: {type: 'linear', ticks: 5}
            },
            series: [
            ],
            lineMode: 'linear',
            tension: 0.7,
            drawLegend: true
        };

        $scope.setChartOptions = function(){
            $scope.chartOptions.series = angular.copy($scope.chartSeries);
        };
        //set the chart options to start
        $scope.setChartOptions();

        $scope.connect = function(){
            $scope.status = 'Connecting';
            $scope.selectedServer.url= $scope.selectedServer.protocol + $scope.selectedServer.ip;
            var server = new Servers($scope.selectedServer);
            server.$connect({}, function(response){
                    $scope.connectResponse = angular.copy(response);
                    $scope.status = (!(response.statusCode) || response.statusCode !== 200) ? 'Not Connected' : 'Connected';
                    if(response.statusCode === 200 && angular.isArray(response.body.Table)){
                        $scope.collapseTruViewServerConfig = true;
                        //connection is valid
                        $scope.queries = response.body.Table.map(function(entry){
                            return {
                                query: entry.Query,
                                description: entry.Description,
                                uri: entry.Uri
                            };
                        });

                        //set the default query to 'ApmServerTrend'
                        $scope.queryParams.query = $scope.queries[0].query;

                        $scope.getApmApplications();
                        $scope.getApmServers();
                        $scope.getApmSites();
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
            $scope.sanitizeFilters(params);
            params.userName = $scope.selectedServer.userName;
            params.password = $scope.selectedServer.password;
            params.domain = $scope.selectedServer.domain;

            params.url = $scope.selectedServer.url;
            var connection = new Connex(params);
            connection.$makeQuery({}, callback);
        };

        $scope.getApmApplications = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = 'APMTopApplications';
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmApplications = response.Table;
                $scope.apmApplications.unshift({ApplicationName: "None", ApplicationDescription: "", "ApplicationId": -1});
                $scope.queryParams.applicationId = -1;
            })
        };
        $scope.getApmServers = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = 'APMTopServers';
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmServers = response.Table;
                $scope.apmServers.unshift({ServerHostName: "None", ServerDescription: "", "ServerId": -1});
                $scope.queryParams.serverId = -1;
            })
        };
        $scope.getApmSites = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = 'APMTopSites';
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmSites = response.Table;
                $scope.apmSites.unshift({SiteName: "None", SiteDescription: "", "SiteId": -1});
                $scope.queryParams.siteId = -1;
            })
        };

        $scope.sanitizeFilters = function(params){
            //TODO fix coersion bug
            if(params.serverId == -1){
                delete params['serverId'];
            }
            if(params.siteId == -1){
                delete params['siteId'];
            }
            if(params.applicationId == -1){
                delete params['applicationId'];
            }
        }
    }
]);
