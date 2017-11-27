angular.module('wf-main-navigation.directive', ['ui.router', 'wf-globals.service', 'ngAnimate', 'wf-scenario.service'])
.directive('wfMainNavigation', function($state, $stateParams, Globals, $rootScope, $timeout, ScenarioManager) {
	

	function link(scope, element, attrs) {

		scope.main=$rootScope.main;
		scope.state=$state;

		scope.functions={
			visual:function() {
				scope.main.currentScenario.ui_state.drawers.visual=!scope.main.currentScenario.ui_state.drawers.visual;
			},
			geometry:function() {
				scope.main.currentScenario.ui_state.drawers.geometry=!scope.main.currentScenario.ui_state.drawers.geometry;
			},
			ventilation:function() {
				scope.main.currentScenario.ui_state.drawers.ventilation=!scope.main.currentScenario.ui_state.drawers.ventilation;
			},
			fire:function() {
				scope.main.currentScenario.ui_state.drawers.fire=!scope.main.currentScenario.ui_state.drawers.fire;
			},
			output:function() {
				scope.main.currentScenario.ui_state.drawers.output=!scope.main.currentScenario.ui_state.drawers.output;
			},
			species:function() {
				scope.main.currentScenario.ui_state.drawers.species=!scope.main.currentScenario.ui_state.drawers.species;
			},
			//updateCurrentScenario:function() {
			//	if(scope.main.currentScenarioId!=undefined){
			//		ScenarioManager.update(scope.main.currentScenario, "all").then(function(scenario) {
			//			scope.main.timeout=3600;
			//		}, function(error) {

			//		});
			//	}
			//}
		}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/static/wf-main-navigation',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
