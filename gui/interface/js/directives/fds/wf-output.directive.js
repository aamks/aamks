angular.module('wf-output.directive', ['ui.router', 'wf-globals.service'])
.directive('wfOutput', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-output',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
