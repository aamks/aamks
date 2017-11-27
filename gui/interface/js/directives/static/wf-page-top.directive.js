angular.module('wf-page-top.directive', ['ui.router', 'wf-globals.service', 'wf-http.service'])
.directive('wfPageTop', function($window, $state, $stateParams, Globals, GlobalValues, $rootScope, HttpManager) {
	

	function link(scope, element, attrs) {
		scope.version=GlobalValues.values.app_data.version;
		scope.main=$rootScope.main;

		scope.main=$rootScope.main;
		scope.functions={
			settings:function() {
				scope.main.activeDialog="settings";
			},
			logout:function() {
				HttpManager.request('get', '/logout').then(function(result) {
					$window.location.href='/';	
				}, function(error) {
					
				});
			}
		}	
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/static/wf-page-top',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
