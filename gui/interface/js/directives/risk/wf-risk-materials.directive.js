angular.module('wf-risk-materials.directive', ['ui.router', 'wf-globals.service'])
.directive('wfRiskMaterials', function($state, $stateParams, Globals, $rootScope) {
	

	function link(scope, element, attrs) {
		scope.ui=$rootScope.main.currentRiskScenario.ui_state;
		scope.materials=$rootScope.main.currentRiskScenario.risk_object.materials;	

		scope.libMatls=[
			{
				id: 'GYPSUM'
			},
			{
				id: 'CONCRETE'
			},
			{
				id: 'BRICK'
			}
		]	
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-materials',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
