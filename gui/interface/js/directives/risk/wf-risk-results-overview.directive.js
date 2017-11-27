angular.module('wf-risk-results-overview.directive', ['ui.router', 'wf-globals.service', 'wf-risk-scenario.service'])
.directive('wfRiskResultsOverview', function($state, $stateParams, Globals, $rootScope, RiskScenarioManager) {
	

	function link(scope, element, attrs) {
		scope.currentRiskScenario=$rootScope.main.currentRiskScenario;
		scope.ui=$rootScope.main.currentRiskScenario.ui_state;
		//scope.building=$rootScope.main.currentRiskScenario.risk_object.building;	
		//

		scope.output={
			ccdf_per: "",
			ccdf: "",
			dcbe: "",
			height: "",
			losses0: "",
			losses1: "",
			losses2: "",
			pie_fault: "",
			temp: "",
			tree: "",
			tree_steel: "",
			vis: "",
			wcbe: "",
			visual: "",
		}
		
		scope.functions={
			show_results: false,
			generate_results:function() {
				RiskScenarioManager.generateRiskResults(scope.currentRiskScenario)
				.then(function(result) {
					console.log("ok");
				}, function(error) {
					console.log("error");
					console.log(error.data.text);
					scope.output.vis=error.data.text;
					scope.functions.show_results=true;
					scope.output={
						ccdf_per: error.data.text + "ccdf_per.png" + "?decache=" + Math.random(),
						ccdf: error.data.text + "ccdf.png" + "?decache=" + Math.random(),
						dcbe: error.data.text + "dcbe.png" + "?decache=" + Math.random(),
						height: error.data.text + "height.png" + "?decache=" + Math.random(),
						losses0: error.data.text + "losses0.png" + "?decache=" + Math.random(),
						losses1: error.data.text + "losses1.png" + "?decache=" + Math.random(),
						losses2: error.data.text + "losses2.png" + "?decache=" + Math.random(),
						pie_fault: error.data.text + "pie_fault.png" + "?decache=" + Math.random(),
						temp: error.data.text + "temp.png" + "?decache=" + Math.random(),
						tree: error.data.text + "tree.png" + "?decache=" + Math.random(),
						tree_steel: error.data.text + "tree_steel.png" + "?decache=" + Math.random(),
						vis: error.data.text + "vis.png" + "?decache=" + Math.random(),
						wcbe: error.data.text + "wcbe.png" + "?decache=" + Math.random(),
						visual: error.data.text + "vis/vis.html" + "?decache=" + Math.random(),
					}
				});


			}

		}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/risk/wf-risk-results-overview',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
