angular.module('wf-lib-matl.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibMatl', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/libraries/wf-lib-matl',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
