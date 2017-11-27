angular.module('wf-lib-spec.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibSpec', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/visual/wf-lib-spec',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
