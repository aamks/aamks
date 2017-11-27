angular.module('wf-lib-part.directive', ['ui.router', 'wf-globals.service'])
.directive('wfLibPart', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/libraries/wf-lib-part',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
