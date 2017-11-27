angular.module('wf-top-navigation.directive', ['ui.router', 'wf-globals.service', 'wf-safe-apply.service', 'wf-scenario.service', 'wf-library.service', 'wf-risk-scenario.service'])
.directive('wfTopNavigation', function($state, $stateParams, Globals, $rootScope, Websocket, SafeApply, ScenarioManager, LibraryManager, RiskScenarioManager, $timeout) {

	function link(scope, element, attrs, ngToast) {

		scope.main=$rootScope.main;
		scope.state=$state;
		scope.params=$stateParams;

		scope.connection=$rootScope.main.websocket.connection;
	/*	
		scope.$on('websocket_close', function(event, data) {
			console.log('close');
			$timeout(function() {
				SafeApply.apply(scope);
			}, 10)

		})

		scope.$on('websocket_open', function(event, data) {
			console.log('open');
			$timeout(function() {
				SafeApply.apply(scope);
			}, 10)
		})
*/
		scope.$watch('connection.state', function(newValue, oldValue) {
			SafeApply.apply(scope);
		}, true);

		scope.functions={
			open : Websocket.open.bind(this, $rootScope.main.websocket),
			close : Websocket.close,
			path : function(state, params) {
				var state_array=state.$current.name.split('.');

				if(state_array[1]=='fds-scenario') {
					var link=state_array[state_array.length-1];
					var segment="";
					if(link=="obst" || link=="mesh" || link=="matl" || link=="surf") {
						segment=" >> Geometry"
					}
					if(link=="basic-ventilation" || link=="jetfan-ventilation") {
						segment=" >> Ventilation"
					}
					if(link=="fires" || link=="groups" || link=="combustion") {
						segment=" >> Fires"
					} 
					if(link=="general-dump" || link=="boundary" || link=="slice" || link=="isosurface" || link=="device" || link=="property" || link=="control") {
						segment=" >> Output"
					}

					var path= " >> "+ scope.main.currentScenario.name + segment +" >> "+ link +" (id: "+ params.id +")";
					return path;
				} else {
					if(state_array[1]=='risk-scenario') {
						var path= " >> "+ scope.main.currentRiskScenario.name + " >> "+state_array[state_array.length-1].toUpperCase() +"("+ params.id +")" ;	
						return path;

					} else {
						return "";
					}
				}
			},
			projects_scenario:function() {
				return " >> "+ scope.main.currentProject.name+" >> "+scope.main.currentScenario.name;
			}
		}

		scope.functions.trigger=function() {
				if(scope.main.websocket.connection.state=='open') {
					scope.functions.close();	
				}
				if(scope.main.websocket.connection.state=='close') {
					setTimeout(function() {
						scope.functions.open();	
					}, 7000);
					setTimeout(function() {
						scope.functions.open();	
					}, 10000);
					scope.functions.open();	
				}
		}
		
		scope.functions.syncAll=function() {
			Websocket.syncAll($rootScope.main.currentScenario);
		}

		scope.functions.updateScenario=function() {
			ScenarioManager.update($rootScope.main.currentScenario, "all").then(function(scenario) {

			}, function(error) {
				
			});
		}
		scope.functions.updateRiskScenario=function() {
			RiskScenarioManager.update($rootScope.main.currentRiskScenario, "all").then(function(scenario) {

			}, function(error) {
				
			});
		}

		scope.functions.updateLibrary=function() {
			LibraryManager.update($rootScope.main.lib).then(function(lib) {
				console.log(lib);
			}, function(error) {
				
			});
			
		}
		scope.functions.createLibraryLayers=function() {
			Websocket.createLibraryLayers($rootScope.main.lib);
			
		}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/static/wf-top-navigation',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
