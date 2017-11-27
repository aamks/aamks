angular.module('wf-risk-general.directive', ['ui.router', 'wf-globals.service', 'wf-risk-scenario.service'])
.directive('wfRiskGeneral', function($state, $stateParams, Globals, $rootScope, RiskScenarioManager) {
	

	function link(scope, element, attrs) {
		scope.ui=$rootScope.main.currentRiskScenario.ui_state;
		scope.currentRiskScenario=$rootScope.main.currentRiskScenario;
		scope.general=$rootScope.main.currentRiskScenario.risk_object.general;	
	
		scope.sim_display="";
		scope.run_display="Run simulations";
		scope.geometry={
			file:""
		}

		scope.functions={
			import_geometry:function() {
			
			},
			start_simulation:function() {
				if(scope.run_display=="Run simulations") {
					scope.run_display="Stop simulations";
					scope.sim_display="Running simulations, please wait ...";
					RiskScenarioManager.runRiskScenario(scope.currentRiskScenario)
					.then(function(result) {
						scope.sim_display="Simulations run successfully";
					}, function(error) {
						scope.run_display="Run simulations";
						scope.sim_display="An error occured: " + error.meta.details[0];
					});
				} else {
					scope.sim_display="";
					scope.run_display="Run simulations";
				}	
			}

		}

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-general',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
