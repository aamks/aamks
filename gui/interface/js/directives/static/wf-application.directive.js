angular.module('wf-application.directive', ['ui.router', 'wf-globals.service', 'wf-mock.service', 'wf-main.service', 'wf-scenario.service', 'wf-fds-object.service', 'wf-ui-state.service', 'wf-project.service', 'wf-library.service', 'wf-risk-object.service', 'wf-risk-scenario.service', 'wf-ui-risk-state.service'])
.directive('wfApplication', function($state, $stateParams, Globals, GlobalValues, mockValues, $rootScope, Main, MainManager, ProjectManager, Scenario, ScenarioManager, Fds, Matl, Obst, Ramp, Surf, Mesh, Part, Prop, UiState, Project, Library, LibraryManager, RiskScenario, Risk, UiRiskState) {
	

	function link(scope, element, attrs) {
	
	}

	function controller($scope, $element) {
		// Potrzebne zeby wywolac utworzenie obiektu, pozniej id jest przekazywane z serwera z sesji po zalogowaniu
		var mockUserId="0"; 
		$rootScope.main=new Main(mockUserId);	
		
		$scope.functions={
			loadUserData : function(id) {
				MainManager.get(id).then(function(userData) {
					$rootScope.main.setUserData(userData);
				}, function(error) {
					console.log(error);	
				});
			},
			loadUserProjects : function() {
				$rootScope.main.loadProjects();
			},
			loadUserLibrary : function(id) {
				LibraryManager.get().then(function(libraryData) {
					$rootScope.main.setUserLibrary(libraryData);
				}, function(error) {
					console.log(error);	
				});
			},
		}	

		$scope.functions.loadUserData(mockUserId);
		$scope.functions.loadUserProjects();
		$scope.functions.loadUserLibrary(mockUserId);

		$rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
			if($rootScope.main.currentScenarioId) {
				$rootScope.main.currentScenario.ui_state.setLink(toState.name)
			} else if($rootScope.main.currentiRiskScenarioId) {
				$rootScope.main.currentRiskScenario.ui_state.setLink(toState.name)
			}
		});

		// Autozapisywanie scenariusza
		//$scope.$watch('$root.main.currentScenario.fds_object', function(newVal, oldVal){
		//	if(newVal!=undefined){
		//		ScenarioManager.update($rootScope.main.currentScenario, "all").then(function(scenario) {
		//			$rootScope.main.timeout=3600;

		//		}, function(error) {
		//			
		//		});
		//	}
		//}, true);

		//console.log($rootScope);
	}

	return {
		templateUrl: Globals.partialsUrl+'/static/wf-application',
		link : link,
		controller : controller,
		scope : false
	}

});
	
