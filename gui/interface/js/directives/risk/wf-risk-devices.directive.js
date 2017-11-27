angular.module('wf-risk-devices.directive', ['ui.router', 'wf-globals.service'])
.directive('wfRiskDevices', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-devices',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
