angular.module('wf-risk-scenario.directive', ['ui.router', 'wf-globals.service'])
.directive('wfRiskScenario', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-risk-scenario',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
