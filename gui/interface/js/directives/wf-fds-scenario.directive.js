angular.module('wf-fds-scenario.directive', ['ui.router', 'wf-globals.service'])
.directive('wfFdsScenario', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-fds-scenario',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
