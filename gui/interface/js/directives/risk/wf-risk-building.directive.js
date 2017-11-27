angular.module('wf-risk-building.directive', ['wf-globals.service'])
.directive('wfRiskBuilding', function($state, $stateParams, Globals, GlobalValues, $rootScope) {
	

	function link(scope, element, attrs) {
		
		scope.ui=$rootScope.main.currentRiskScenario.ui_state;
		scope.building=$rootScope.main.currentRiskScenario.risk_object.building;	
		
		scope.enums={
			alarmType:GlobalValues.values.risk_enums.alarmType,
			buildingType:GlobalValues.values.risk_enums.buildingType
		}	

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-building',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
