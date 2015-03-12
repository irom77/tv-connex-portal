'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'tv-connex-portal';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('connex');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Configuring the connex module
angular.module('connex', ['ui.bootstrap.datetimepicker', 'nvd3ChartDirectives', 'JSONedit']).run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Connex', 'connex', 'item');
    }
]);

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
        $scope.chartSeries = ['EurtV2', 'Eurt', 'NetworkDelay'];
        $scope.chartSeriesCache = angular.copy($scope.chartSeries);
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
                    seriesObj.values.push([new Date(dataItem.StartTime).getTime(),Number(dataItem[seriesObj.key])]);
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
            $scope.chartSeries = angular.copy($scope.chartSeriesCache);
            $scope.updateChartData($scope.data);
        };

        $scope.xAxisFormat = function(){
            return function(d){
                return d3.time.format('%H:%M')(moment.unix(d).toDate());
            };
        };
    }
]);

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

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Menus',
	function($scope, Menus) {
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope',
	function($scope) {
	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);