angular.module('wf-main.service', ['ngLodash', 'wf-websocket.service','wf-http.service', 'wf-library.service', 'wf-project.service', 'wf-scenario.service', 'wf-category.service', 'wf-ui-state.service', 'wf-fds-object.service', 'wf-risk-object.service', 'wf-risk-scenario.service', 'wf-ui-risk-state.service'])
.factory('Main', ['lodash', 'Library','Project', 'ProjectManager','Scenario', 'Websocket', 'UiState', 'Fds', 'RiskScenario', 'Risk', 'UiRiskState', function(lodash, Library, Project, ProjectManager, Scenario, Websocket, UiState, Fds, RiskScenario, Risk, UiRiskState) {//{{{
	
	function Main(id) {
		
		this.userId=id || "";
		this.userName="";
		this.editor="vim";
		this.lib=new Library();
		this.projects=[];
		this.websocket={
			host: "localhost",
			port: "2012",
			messages: Websocket.messages,
			connection : Websocket.connection
		};
		this.timeout=3600;

		this.currentProject={};
		this.currentProjectId="";
		this.currentScenario={};
		this.currentScenarioId=undefined;
		this.currentRiskScenario={};
		this.currentRiskScenarioId=undefined;

		this.activeDialog=undefined;
		this.categoryManager='closed';
		this.getUserId=function() {
			return this.userId;
		}
		this.setUserId=function(id) {
			this.userId=id;
		}
		this.getUserName=function() {
			return this.userName;
		}
		this.setUserName=function(name) {
			this.userName=name;
		}

		this.newProject=function() {
			var self=this;
			ProjectManager.create().then(function(project) {
				self.projects.push(project);
			}, function(error) {

			});
		}
		this.addProject=function(project) {
			this.projects.push(project);
		}
		this.loadProjects=function() {
			var self=this;
			ProjectManager.getAll().then(function(projects) {

				projects.forEach(function(project) {
					var scenarios = [];
					var risk_scenarios = [];
					project.scenarios.forEach(function(scenario) {
					/*	
						if(scenario.fds_object == "" || scenario.fds_object == null) scenario.fds_object = new Fds();
						if(scenario.ui_state == "" || scenario.ui_state == null) scenario.ui_state = new UiState();
					*/	
						
						scenarios.push(scenario);
					});
					project.risk_scenarios.forEach(function(risk_scenario) {
					/*	
						if(risk_scenario.fds_object == "") risk_scenario.fds_object = new Risk();
						if(risk_scenario.ui_state == "") risk_scenario.ui_state = new UiRiskState();
					*/	

						risk_scenarios.push(risk_scenario);
					});
					project.scenarios=scenarios;
					project.risk_scenarios=risk_scenarios;
					self.projects.push(new Project(project));
				});

			}, function(error) {

			});		
		}
		this.removeProject=function(index) {
			var self=this;
			ProjectManager.delete(self.projects[index].id).then(function() {
				self.projects.splice(index,1);
			}, function(error) {

			});
		}

		this.setCurrentScenario=function(scenario) {
			this.currentScenario=scenario;
			this.currentScenarioId=this.currentScenario.id;
			this.currentRiskScenario={};
			this.currentRiskScenarioId=undefined;
		}

		this.setCurrentRiskScenario=function(scenario) {
			this.currentRiskScenario=scenario;
			this.currentRiskScenarioId=this.currentRiskScenario.id;
			this.currentScenario={};
			this.currentScenarioId=undefined;
		}


		this.setUserData=function(data) {
			this.userId=data.id;
			this.userName=data.userName;
			this.editor=data.editor;
			this.currentProjectId=data.currentProjectId;
			this.currentScenarioId=data.currentScenarioId;
			this.categories=data.categories;
			this.websocket.host=data.websocket_host;
			this.websocket.port=data.websocket_port;
		}

		this.getUserData=function() {
			return {
				id: this.userId,
				userName: this.userName,
				editor: this.editor,
			//	currentProject: this.currentProject,
				currentProjectId: this.currentProjectId,
			//	currentScenario: this.currentScenario,
				currentScenarioId: this.currentScenarioId,
				categories:this.categories,
				websocket_host:this.websocket.host,
				websocket_port:this.websocket.port
			}
		}

		this.setUserLibrary=function(data) {
			this.lib=data;
		}
		
	
	}
	
	return Main;	
}])
//}}}
.service('MainManager', ['$q', '$http', 'Main', 'HttpManager', 'Category','lodash' , function($q, $http, Main, HttpManager, Category, lodash) {//{{{
	return {
		get : function(id) {
			var deferred=$q.defer();
			
			HttpManager.request('get', '/api/settings/'+id)
			.then(function(result) {
					var categories=result.data.categories;
					var catObjects=lodash.map(categories, function(category) {
						var obj={};

						obj.label=category.label;
						obj.uuid=category.uuid;
						if(category.active=='t') {
							obj.active=true
						} else {
							obj.active=false
						}
					
						if(category.visible=='t') {
							obj.visible=true
						} else {
							obj.visible=false
						}
						return new Category(obj)
					});
					result.data.categories=catObjects;

					deferred.resolve(result.data);
				}, function(error) {
					deferred.reject(error);	
				});
			
				return deferred.promise;			
		},
		update : function(id, object) {
			var deferred=$q.defer();
			
			HttpManager.request('put', '/api/settings/'+id,  JSON.stringify(object))
			.then(function(result) {
					deferred.resolve(result.data);
				}, function(error) {
					deferred.reject(error);	
				});
			
				return deferred.promise;			
		}
	}
}]);
//}}}
