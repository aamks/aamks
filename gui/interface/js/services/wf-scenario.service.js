angular.module('wf-scenario.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-list.service', 'wf-sync-object.service','wf-ui-state.service', 'wf-fds-object.service'] )
.factory('Scenario', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', 'Sync', function(GlobalsValues, lodash, Validator, $rootScope, Accessor, Sync) {//{{{
	
	function Scenario(base) {
	
		var accessor=new Accessor();

		if(!base) {
			base={};
		}

		this.id=base['id']||'';
		this.setId=accessor.setId;
		
		this.project_id=base['project_id'] || "";
		this.id=base['id'] || "";
		this.name=base['name'] || "";
		this.set_name=function(arg) {
			if(arg) {
 				this.name=arg; 
			} else {
				return this.name;
			}
		}

		this.description=base['description'] || "";
		this.fds_file=base['fds_file'] || "";
		this.fds_object=base['fds_object'] || {};
		this.ac_file=base['ac_file'] || "";
		this.ac_hash=base['ac_hash'] || "";
		this.ui_state=base['ui_state']|| {};
		
		this.sync_object=base['sync_object'] || new Sync();
		this.serialize=function() {
			var self=this;
			//var serializedObject=self.fds_object.serialize();
			var serializedScenario={
				id:self.id,
				project_id:self.project_id,
				name:self.name,
				description:self.description,
				fds_file:self.fds_file,
				fds_object:self.fds_object,
				ac_file:self.ac_file,
				ac_hash:self.ac_hash,
				ui_state:self.ui_state
			}

			return JSON.stringify(serializedScenario, null);

		}
	};
	return Scenario;
}])
//}}}
.service('ScenarioManager', ['$q', '$http', 'HttpManager', '$rootScope', 'Scenario', 'lodash', 'UiState', 'Fds', function($q, $http, HttpManager, $rootScope, Scenario, lodash, UiState, Fds) {//{{{
	return {
		create : function(project_id) {//{{{
			var deferred=$q.defer();
			var ui_state=new UiState();

			HttpManager.request('post', '/api/scenarios/'+project_id,  {ui_state:ui_state})
			.then(function(result) {
				var data=result.data;
				var scenario=new Scenario({project_id:data.project_id, id:data.id, name:data.name, fds_object:new Fds(data.fds_object), ac_file:data.ac_file, ac_hash:data.ac_hash, ui_state:new UiState(data.ui_state)});
				deferred.resolve(scenario);

			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		},//}}}
		get : function(id) {//{{{
			var deferred=$q.defer();
	
			HttpManager.request('get', '/api/scenario/'+id,  JSON.stringify({}))
			.then(function(result) {
				var data=result.data;

				var scenario=new Scenario({project_id:data.project_id, id:data.id, name:data.name, fds_object:new Fds(data.fds_object), fds_file:data.fds_file, ac_file:data.ac_file, ac_hash:data.ac_hash, ui_state:new UiState(data.ui_state)});
				deferred.resolve(scenario);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		},//}}}
		update : function(scenario, type) {//{{{
			var deferred=$q.defer();

			if(type=="head") {	
				HttpManager.request('put', '/api/scenario/'+scenario.id, {type:"head", data:{id:scenario.id, name:scenario.name, has_ac_file:scenario.has_ac_file, has_fds_file:scenario.has_fds_file} })
				.then(function(result) {
					var data=result.data;
					var scenario={id:data.id, name:data.name, has_ac_file:data.has_ac_file, has_fds_file:data.has_fds_file };
					deferred.resolve(scenario);
				}, function(error) {
					deferred.reject(error);
				});
			} else {
				//HttpManager.request('put', '/api/scenario/'+scenario.id, {type:"all", data: scenario})
				HttpManager.request('put', '/api/scenario/'+scenario.id, {type:"all", data: {name:scenario.name, fds_file:"", fds_object:scenario.fds_object, ui_state:scenario.ui_state, ac_file:scenario.ac_file, ac_hash:scenario.ac_hash} })
				.then(function(result) {
					//var data=result.data;
					//var scenario=new Scenario({project_id:data.project_id, id:data.id, name:data.name, description:data.description, fds_object:data.fds_object, fds_file:data.fds_file, ac_file:data.ac_file, ac_hash:data.ac_hash, ui_state:data.ui_state});
					//deferred.resolve(scenario);
					deferred.resolve(result.data);
				}, function(error) {
					deferred.reject(error);
				});
			}
			return deferred.promise;
		},//}}}
		delete : function(id) {//{{{
			var deferred=$q.defer();
	
			HttpManager.request('delete', '/api/scenario/'+id,  JSON.stringify({}))
			.then(function(result) {
				deferred.resolve();
			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;
		},//}}}

		objectToText : function(scenario) {//{{{
			var scenarioSerialized = scenario.serialize();
		
			var deferred=$q.defer();
			HttpManager.request('post', '/api/objtotext', scenarioSerialized)
			//HttpManager.request('post', '/api/objtotext', scenario)
			.then(function(result) {
				var res=result;	
				deferred.resolve(res);
			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;

		},//}}}
		textToObject : function(scenario) {//{{{
			var deferred=$q.defer();

			HttpManager.request('post', '/api/texttoobj', scenario.serialize())
			.then(function(result) {
				var res=result;	
				deferred.resolve(res);
			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;

		},//}}}

		runScenario : function(scenario) {//{{{
			var scenarioSerialized = scenario.serialize();
		
			var deferred=$q.defer();
			HttpManager.request('post', '/api/runfdssimulation', scenarioSerialized)
			//HttpManager.request('post', '/api/objtotext', scenario)
			.then(function(result) {
				var res=result;	
				deferred.resolve(res);
			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;
		},//}}}
	}	
}]);
//}}}
