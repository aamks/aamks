angular.module('wf-lib-prop.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibProp', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/libraries/wf-lib-prop',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
