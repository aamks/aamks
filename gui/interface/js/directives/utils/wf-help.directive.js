angular.module('wf-help.directive', ['ui.router', 'wf-globals.service'])
.directive('wfHelp', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/utils/wf-help',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
