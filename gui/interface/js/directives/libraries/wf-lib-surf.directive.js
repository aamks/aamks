angular.module('wf-lib-surf.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibSurf', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/libraries/wf-lib-surf',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
