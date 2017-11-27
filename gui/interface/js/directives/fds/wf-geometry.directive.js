angular.module('wf-geometry.directive', ['ui.router', 'wf-globals.service'])
.directive('wfGeometry', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-geometry',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
