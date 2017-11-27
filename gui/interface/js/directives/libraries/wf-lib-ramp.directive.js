angular.module('wf-lib-ramp.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibRamp', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/visual/wf-lib-ramp',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
