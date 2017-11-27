angular.module('wf-project.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-list.service', 'wf-scenario.service', 'wf-risk-scenario.service', 'wf-fds-object.service', 'wf-ui-state.service'] )
.factory('Project', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', 'Scenario', 'Fds', 'UiState', function(GlobalsValues, lodash, Validator, $rootScope, Accessor, Scenario, RiskScenario, Fds, UiState) {//{{{

	function Project(base) {
	
		var accessor=new Accessor();

		if(!base) {
			base={};
		}

		this.id=base['id']||'';
		this.setId=accessor.setId;

		this.name=base['name'] || "";
		this.set_name=function(arg) {
			if(arg) {
 				this.name=arg; 
			} else {
				return this.name;
			}
		}
		this.description=base['description'] || "";

		this.set_description=function(arg) {
			if(arg) {
 				this.description=arg; 
			} else {
				return this.description;
			}

		}

		this.category=base['category']||"";
		this.scenarios=base['scenarios'] || [];
		this.risk_scenarios=base['risk_scenarios'] || [];

		this.loadScenarios=function() {
					
		}

		this.addScenario=function(scenario) {
			this.scenarios.push(scenario);
		}

		this.removeScenario=function(index) {
			this.scenarios.splice(index, 1);
		}
	
		this.addRiskScenario=function(scenario) {
			this.risk_scenarios.push(scenario);
		}

		this.removeRiskScenario=function(index) {
			this.risk_scenarios.splice(index, 1);
		}
	
		/*
		this.getId=function() {
			return _id;
		}

		this.getName=function() {
			return _name;
		}

		this.getDescription=function() {
			return _description;
		}

		this.getCategory=function() {
			return _category;
		}


		this.getScenarios=function() {
			return _scenarios;
		}

		this.getScenario=function(id) {
			return 
		}

		this.getCurrentScenario=function() {
			return _currentScenarios[0];
		}

		this.setAsCurrentScenario=function(id) {

		}
		*/

		this.serialize=function() {
			var self=this;
			var scenarios=lodash.map(self.scenarios, function(scenario) {
				return {id:scenario.id, name:scenario.name, has_ac_file:scenario.has_ac_file, has_fds_file:scenario.has_fds_file}
			});

			var risk_scenarios=lodash.map(self.risk_scenarios, function(scenario) {
				return {id:scenario.id, name:scenario.name, has_ac_file: scenario.has_ac_file}
			});

			var serializedProject={
				id:self.id,
				name:self.name,
				description:self.description,
				category:self.category,
				scenarios:scenarios,
				risk_scenarios:risk_scenarios
			}
			return JSON.stringify(serializedProject, null, '\t');
		}
		
	}
	
	return Project;	
}])//}}}
.service('ProjectManager', ['$q', '$http', 'Project', 'HttpManager', 'lodash','Accessor', 'Scenario', 'Fds', 'UiState', function($q, $http, Project, HttpManager, lodash, Accessor, Scenario, Fds, UiState) {//{{{
	var accessor=new Accessor();
	return {
 		getAll: function() {//{{{

			var deferred=$q.defer();

			HttpManager.request('get', '/api/projects',  JSON.stringify({}))
			.then(function(result) {
				var projects=[];
				projects=lodash.forEach(result.data, function(project) {
					return new Project({
						id:project.id, 
						name:project.name, 
						description:project.description, 
						category:project.category, 
						scenarios:lodash.forEach(project.scenarios, function(scenario) {
							return {id:scenario.id, name: scenario.name, has_ac_file:scenario.has_ac_file, has_fds_file:scenario.has_fds_file}
						}),
						risk_scenarios:lodash.forEach(project.risk_scenarios, function(scenario) {
							return {id:scenario.id, name: scenario.name, has_ac_file:scenario.has_ac_file}
						}),
					})
				});
				deferred.resolve(projects);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;			
		},//}}}
		create : function() {//{{{
				
			var deferred=$q.defer();

			HttpManager.request('post', '/api/projects',  JSON.stringify({}))
			.then(function(result) {
				var data=result.data;
				var project=new Project( {id:data.id, name:data.name, description: data.description, category:data.category_id, scenarios:data.scenarios });
				deferred.resolve(project);

			}, function(error) {
				deferred.reject(error.meta.details);
			});
		
			return deferred.promise;

		},//}}}
		delete : function(id) {//{{{
				
			var deferred=$q.defer();
	
			HttpManager.request('delete', '/api/project/'+id,  JSON.stringify({}))
			.then(function(result) {
				deferred.resolve();

			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;

		},//}}}
		update : function(project) {//{{{
				
			var deferred=$q.defer();

			HttpManager.request('put', '/api/project/'+project.id, project.serialize())
			.then(function(result) {
				var data=result.data;
				var project=new Project({id:data.id, name:data.name, description: data.description, category:data.category});
				deferred.resolve(project);

			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}	
		//}}}

/*//{{{ old
		get: function(id) {
				var deferred=$q.defer();
	
				HttpManager.request('get', '/api/project/'+id,  JSON.stringify({}))
				.then(function(result) {
					project=new Project(result.data.id, result.data.name, result.data.description, result.data.category);
						deferred.resolve(project);
					}, function(error) {
						deferred.reject(error);	
					});
			  
			    	return deferred.promise;			
		},
*///}}}
		
	}	
}]);
//}}}
