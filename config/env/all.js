'use strict';

module.exports = {
	app: {
		title: 'TruView Connex Portal',
		description: 'A lightweight portal to make connex queries and visualize them',
		keywords: 'TruView, Connex'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
				'public/lib/json-edit/css/styles.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/jquery-ui/jquery-ui.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/lodash/dist/lodash.min.js',
				'public/lib/moment/moment.js',
				'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
				'public/lib/d3/d3.min.js',
				'public/lib/n3-line-chart/dist/line-chart.min.js',
				'public/lib/angular-ui-sortable/sortable.min.js',
				'public/lib/json-edit/js/directives.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	},
	servers: [
		//{name: '10.250.10.45', url: 'http://10.250.10.45'},
		{name: '10.250.10.66', url: 'http://10.250.10.66'},
		//{name: '10.250.11.76', url: 'https://10.250.11.76'}
	],
	connexBaseUrl: '/Portal/Portal/Services/ConnexDataAccess.ashx'
};
