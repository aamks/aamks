angular.module('wf-risk-settings.directive', ['ui.router', 'wf-globals.service'])
.directive('wfRiskSettings', function($state, $stateParams, Globals, $rootScope) {
	

	function link(scope, element, attrs) {

		scope.ui=$rootScope.main.currentRiskScenario.ui_state;
		scope.settings=$rootScope.main.currentRiskScenario.risk_object.settings;	
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-settings',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
