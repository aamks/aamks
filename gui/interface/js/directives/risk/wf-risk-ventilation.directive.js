angular.module('wf-risk-ventilation.directive', ['ui.router', 'wf-globals.service'])
.directive('wfRiskVentilation', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-ventilation',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
