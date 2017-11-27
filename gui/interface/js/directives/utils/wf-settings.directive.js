angular.module('wf-settings.directive', ['ui.router', 'wf-globals.service'])
.directive('wfSettings', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/utils/wf-settings',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
