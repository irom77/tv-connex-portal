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
            ip: 'localhost',
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
        $scope.chartSeriesCache = [];
        $scope.chartSeries = ['EurtV2', 'Eurt', 'ClientDelay', 'NetworkDelay'];
        //initialize the series
        _.forEach($scope.chartSeries, function(key){
            $scope.chartData.push({
                key: key,
                values: []
            });
            $scope.chartSeriesCache.push({
                value: key
            });
        });
        //the data table that is returned via the connex query
        $scope.data = [];
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

        $scope.updateChartData = function(){
            var chartData = [];
            //initialize the series
            _.forEach($scope.chartSeries, function(key){
                chartData.push({
                    key: key,
                    values: []
                });
            });
            _.forEach($scope.data, function(dataItem) {
                _.forEach(chartData, function(seriesObj){
                    if(Number(dataItem[seriesObj.key])){
                        seriesObj.values.push([new Date(dataItem.StartTime).getTime(),Number(dataItem[seriesObj.key])]);
                    } else {
                        console.log("NAN returned: " + dataItem[seriesObj.key]);
                    }
                });
            });
            $scope.chartData = chartData;
        };

        $scope.makeConnexQuery = function(queryParams, cbk){
            var callback = cbk || function(response){
                    $scope.response = response;
                    $scope.responseRecieved = true;

                    //detect if the data will be chartable
                    $scope.drawChart = queryParams.query.indexOf('Trend') !== -1;
                    //if drawChart is true, render the chart
                    if($scope.drawChart && response.Table){
                        $scope.data = angular.copy(response.Table);
                        $scope.updateChartData();
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
                $scope.apmApplications.unshift({ApplicationName: 'None', ApplicationDescription: '', 'ApplicationId': -1});
                $scope.queryParams.applicationId = -1;
            });
        };
        $scope.getApmServers = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = 'APMTopServers';
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmServers = response.Table;
                $scope.apmServers.unshift({ServerHostName: 'None', ServerDescription: '', 'ServerId': -1});
                $scope.queryParams.serverId = -1;
            });
        };
        $scope.getApmSites = function(){
            var queryParams = angular.copy($scope.queryParams);
            queryParams.query = 'APMTopSites';
            $scope.makeConnexQuery(queryParams, function(response){
                $scope.apmSites = response.Table;
                $scope.apmSites.unshift({SiteName: 'None', SiteDescription: '', 'SiteId': -1});
                $scope.queryParams.siteId = -1;
            });
        };

        $scope.sanitizeFilters = function(params){
            //TODO fix coersion bug
            if(params.serverId === -1){
                delete params.serverId;
            }
            if(params.siteId === -1){
                delete params.siteId;
            }
            if(params.applicationId === -1){
                delete params.applicationId;
            }
            if(params.startTime){
                params.startTime = new Date(params.startTime);
            }
            if(params.endTime){
                params.endTime = new Date(params.endTime);
            }
        };

        $scope.setChartOptions = function(){
            $scope.chartSeries = $scope.chartSeriesCache.map(function(val){return val.value;});
            $scope.updateChartData($scope.data);
        };

        $scope.xAxisTickFormat = function(){
            return function(d){
                return d3.time.format('%x-%H:%M')(new Date(d));
            };
        };

        $scope.yAxisTickFormat = function(){
            return function(d){
                if(typeof d === 'number'){
                    return d.toPrecision(5);
                }
            };
        };
    }
]);
