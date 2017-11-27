angular.module('wf-lib-fire.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibFire', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/libraries/wf-lib-fire',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
