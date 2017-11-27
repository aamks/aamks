angular.module('wf-list.directive', ['ui.router', 'wf-globals.service'])
.directive('wfList', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/utils/wf-list',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
