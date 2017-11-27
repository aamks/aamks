angular.module('wf-dialog.directive', ['ui.router', 'wf-globals.service'])
.directive('wfDialog', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/visual/wf-dialog',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
