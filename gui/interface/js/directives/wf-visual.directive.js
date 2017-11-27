angular.module('wf-visual.directive', ['ui.router', 'wf-globals.service'])
.directive('wfVisual', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-visual',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
