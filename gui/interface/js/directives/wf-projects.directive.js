angular.module('wf-projects.directive', ['ui.router', 'wf-globals.service', 'wf-mock.service', 'wf-dialog.service', 'wf-project.service', 'wf-scenario.service','wf-risk-scenario.service', 'ngLodash', 'wf-id-generator.service', 'wf-fds-object.service', 'wf-risk-object.service', 'wf-ui-state.service', 'wf-ui-risk-state.service', 'wf-category.service'])
.directive('wfProjects', function($window, $state, $stateParams, Globals, GlobalValues, mockValues, $rootScope, DialogManager, Project,Scenario, ScenarioManager,Project, ProjectManager, lodash, $q, IdGenerator, Fds, UiState, Risk, RiskScenario, RiskScenarioManager, UiRiskState, CategoryManager, Websocket) {

	function link(scope, element, attrs) {

		scope.main=$rootScope.main;

		scope.scenarios=[];
		scope.functions={};


		// ENUMS//{{{
		scope.enums={
			projectCategories:GlobalValues.values.enums.projectCategory
		}
//}}}
		// FUNCTIONS PROJECT//{{{
		scope.functions.project={
			
			activate: function(index) {
				if(scope.main.currentProject['id']==scope.main.projects[index].id) {
					scope.main.currentProject={};
					scope.main.currentProjectId=undefined;
				} else {
					scope.main.currentProject=scope.main.projects[index];
					scope.main.currentProjectId=scope.main.currentProject['id'];
				}
			},
			remove: function(index) {
				var id=scope.main.projects[index].id;
				if(id==scope.main.currentProjectId) {
					scope.main.currentScenario={};
					scope.main.currentScenarioId=undefined;
					scope.main.currentProject={};
					scope.main.currentProjectId=undefined;
				}
				scope.main.removeProject(index);
			},
			newItem:function() {
			//	var id=IdGenerator.genId('project', scope.main.projects);
			//	scope.main.addProject(new Project({id:id, name:id, description:id+' description'}));
				scope.main.newProject();
				console.log(scope.main.projects);	
			},
			categoryTrigger: function(index) {
				CategoryManager.update(scope.main.categories[index].uuid, scope.main.categories[index]);
			},
			categoryVisible: function(index) {
				//console.log(scope.main.categories);

				var category_id=scope.main.projects[index].category;
				var category=lodash.find(scope.main.categories, function(category) {
					return category.uuid==category_id;
				});
				if(category && category.active==true) {
					return true;
				} else {
					return false;
				}
				
			},
			switchCategoryManager: function() {
				if(scope.main.categoryManager=='closed') {
					scope.main.categoryManager='open';
				} else {

					scope.main.categoryManager='closed';
				}
			},
			set_name: function(index) {
				return function(name) {
					if(name) {
						var old_name=scope.main.projects[index].name;
						scope.main.projects[index].name=name;
						ProjectManager.update(scope.main.projects[index]).then(function(project) {
							
						}, function(error) {
							scope.main.projects[index].name=old_name;
						})
					} else {
						return scope.main.projects[index].name;
					}
				}
			},
			set_description: function(index) {
				return function(description) {
					if(description) {
						var old_desc=scope.main.projects[index].description;
						scope.main.projects[index].description=description;
						ProjectManager.update(scope.main.projects[index]).then(function(project) {
							
						}, function(error) {
							scope.main.projects[index].description=old_description;
						})
					} else {
						return scope.main.projects[index].description;
					}
				}

			},
			set_category: function(index) {
				var old_category=scope.main.projects[index].category;
				ProjectManager.update(scope.main.projects[index]).then(function(project) {
							
				}, function(error) {
					scope.main.projects[index].category=old_category;
				})
			},
			/*
			newProject : function() {
				ProjectManager.create().then(function(project) {
					$rootScope.main.newProject(project);

				}, function(error) {

				});		
				
			},
						removeProject : function($index) {
				var id=scope.projects[$index].id;
				ProjectManager.delete(id).then(function() {
					scope.projects.splice([lodash.findIndex(scope.projects, function(project) {return project.id==id})], 1);
					
				}, function(error) {

				});
			},
			updateProject : function($index) {
				var deferred=$q.defer();
				ProjectManager.update(scope.projects[$index]).then(function(project) {
					deferred.resolve(project);
					var id=project.id;
					scope.projects[lodash.findIndex(scope.projects, function(project) {return project.id==id})]=project;
				}, function(error) {
					deferred.reject(error);	
				});
			
				return deferred.promise;	
			}
			*/
		}
//}}}
		// FUNCTIONS SCENARIO//{{{
		console.log(scope.main);
		scope.functions.scenario={
			activate:function(project_id, index) {
				if(scope.main.currentScenarioId!=undefined){
					ScenarioManager.update($rootScope.main.currentScenario, "all").then(function(scenario) {
						$rootScope.main.timeout=3600;
					}, function(error) {

					});
				}

				if(project_id==scope.main.currentProjectId) {
					var scenario_id=scope.main.currentProject.scenarios[index].id;
					ScenarioManager.get(scenario_id).then(function(scenario) {
						scope.main.setCurrentScenario(scenario);
					}, function(error) {

					});
				}
			},
			remove:function(project_id, index) {
				if(project_id==scope.main.currentProjectId) {
					var id=	scope.main.currentProject.scenarios[index].id;
					
					ScenarioManager.delete(id).then(function(scenario) {
						if(id==scope.main.currentScenarioId) {
							scope.main.currentScenario={};
							scope.main.currentScenarioId=undefined;
						}
						scope.main.currentProject.scenarios.splice(index,1)
					}, function(error) {

					});
				}
			},	
			newItem:function(project_id) {
				if(project_id==scope.main.currentProjectId) {
					ScenarioManager.create(project_id).then(function(scenario) {
						var has_fds=false;
						var has_ac=false;
						if(scenario.fds_file!="") {
							has_fds=true;
						}
						if(scenario.ac_file!="") {
							has_ac=true;
						}
						scope.main.currentProject.scenarios.push({id:scenario.id, name:scenario.name, has_fds_file:has_fds, has_ac_file:has_ac})
					}, function(error) {

					});
					//var id=IdGenerator.genId('scenario', scope.main.currentProject.scenarios); 
					//scope.main.currentProject.addScenario(new Scenario({id:id, project_id: project_id, name:id, fds_object:new Fds(), ui_state:new UiState()}));
				}
			},
			set_name:function(index, project_id) {
				return function(name) {
					if(project_id==scope.main.currentProjectId) {
						if(name) {
							var old_name=scope.main.currentProject.scenarios[index].name;
							scope.main.currentProject.scenarios[index].name=name;
							ScenarioManager.update(scope.main.currentProject.scenarios[index], "head").then(function(scenario) {

							}, function(error) {
								scope.main.currentProject.scenarios[index].name=old_name;
							})
						} else {
							return scope.main.currentProject.scenarios[index].name;
						}

					}
				}
			},
			download:function(project_id, index) {
				if(project_id==scope.main.currentProjectId) {
					var scenario_id=scope.main.currentProject.scenarios[index].id;
					ScenarioManager.get(scenario_id).then(function(scenario) {
						scope.main.setCurrentScenario(scenario);
						ScenarioManager.objectToText(scope.main.currentScenario).then(function(result) {
							var data = result.data;
							// Michal zobacz sciaganie pliku fds ...
							//var blob=new Blob([data]);
							//var link=document.createElement('a');
							//link.href=window.URL.createObjectURL(blob);
							//link.download="myFileName.txt";
							//link.click();

						}, function(error) {
							console.log(error);
						})
					}, function(error) {

					});
				}
			},

		}
//}}}
		// FUNCTIONS RISK SCENARIO//{{{
		scope.functions.risk_scenario={
			activate:function(project_id, index) {
				if(project_id==scope.main.currentProjectId) {
					var scenario_id=scope.main.currentProject.risk_scenarios[index].id;
					RiskScenarioManager.get(scenario_id).then(function(scenario) {
						scope.main.setCurrentRiskScenario(scenario);
					}, function(error) {

					});
				}
			},
			remove:function(project_id, index) {
				if(project_id==scope.main.currentProjectId) {
					var id=scope.main.currentProject.risk_scenarios[index].id;
					
					RiskScenarioManager.delete(id).then(function(scenario) {
						if(id==scope.main.currentScenarioId) {
							scope.main.currentRiskScenario={};
							scope.main.currentRiskScenarioId=undefined;
						}
						scope.main.currentProject.risk_scenarios.splice(index,1)
					}, function(error) {

					});
				}
			},	
			newItem:function(project_id) {
				if(project_id==scope.main.currentProjectId) {
					RiskScenarioManager.create(project_id).then(function(scenario) {
						var has_ac=false;
						if(scenario.ac_file!="") {
							has_ac=true;
						}
						scope.main.currentProject.risk_scenarios.push({id:scenario.id, name:scenario.name, has_ac_file:has_ac})
					}, function(error) {

					});
					//var id=IdGenerator.genId('scenario', scope.main.currentProject.risk_scenarios); 
					//scope.main.currentProject.addRiskScenario(new RiskScenario({id:id, project_id:project_id, name:id, risk_object:new Risk(), ui_state:new UiRiskState()}));
				}
			},
			set_name:function(index, project_id) {
				return function(name) {
					if(project_id==scope.main.currentProjectId) {

						if(name) {
							var old_name=scope.main.currentProject.risk_scenarios[index].name;
							scope.main.currentProject.risk_scenarios[index].name=name;
							RiskScenarioManager.update(scope.main.currentProject.risk_scenarios[index], "head").then(function(scenario) {

							}, function(error) {
								scope.main.currentProject.risk_scenarios[index].name=old_name;
							})
						} else {
							return scope.main.currentProject.risk_scenarios[index].name;

						}
					}
				}
			},
		}
//}}}

		scope.categories={'curr':'current', 'arch':'archive'};
		scope.allCategories=['all','current', 'archive'];

		scope.currentCategory=scope.allCategories[1];
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-projects',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
