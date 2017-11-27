angular.module('wf-risk-scenario.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-list.service', 'wf-risk-object.service'] )
.factory('RiskScenario', ['GlobalValues', 'lodash', 'Validator', '$rootScope', 'Accessor', function(GlobalsValues, lodash, Validator, $rootScope, Accessor) {//{{{
	
	function RiskScenario(base) {
	
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
		
		this.risk_object=base['risk_object'] || {};
		this.ac_file=base['ac_file'] || "";
		this.ac_hash=base['ac_hash'] || "";
		this.ui_state=base['ui_state']|| {};

		this.serialize=function() {
			var self=this;
			//var serializedObject=self.fds_object.serialize();
			var serializedScenario={
				id:self.id,
				project_id:self.project_id,
				name:self.name,
				description:self.description,
				risk_object:self.risk_object,
				ac_file:self.ac_file,
				ac_hash:self.ac_hash,
				ui_state:self.ui_state
			}

			return JSON.stringify(serializedScenario, null, '\t');

		}
	};
	return RiskScenario;	
}])//}}}
.service('RiskScenarioManager', ['$q', '$http', 'HttpManager', 'RiskScenario', 'lodash', 'Risk', function($q, $http, HttpManager, RiskScenario, lodash, Risk) {//{{{
	return {
		create : function(project_id) {//{{{
				
			var deferred=$q.defer();
	
			console.log("Create risk scenario");
			console.time("scen_req");
	
			HttpManager.request('post', '/api/risk-scenarios/'+project_id,  JSON.stringify({}))
			.then(function(result) {
				console.timeEnd("scen_req");
				console.time("scen_const");

				var data=result.data;
				var scenario=new RiskScenario({project_id:data.project_id, id:data.id, name:data.name, risk_object:new Risk(data.risk_object), ac_file:data.ac_file, ac_hash:data.ac_hash});
				deferred.resolve(scenario);

				console.timeEnd("scen_const");

			}, function(error) {
				deferred.reject(error);

				console.timeEnd("scen_const");
			});
		
			return deferred.promise;

		},//}}}
		get : function(id) {//{{{
				
			var deferred=$q.defer();
	
			console.log("Get risk scenario");
			console.time("scen_req");
	
			HttpManager.request('get', '/api/risk-scenario/'+id,  JSON.stringify({}))
			.then(function(result) {
				console.timeEnd("scen_req");
				console.time("scen_const");

				var data=result.data;
				var scenario=new RiskScenario({project_id:data.project_id, id:data.id, name:data.name, risk_object:new Risk(data.risk_object), ac_file:data.ac_file, ac_hash:data.ac_hash, ui_state:data.ui_state});
				deferred.resolve(scenario);

				console.timeEnd("scen_const");

			}, function(error) {
				deferred.reject(error);

				console.timeEnd("scen_req");
			});
		
			return deferred.promise;
		},//}}}
		update : function(scenario, type) {//{{{
				
			var deferred=$q.defer();

			console.log("Update risk scenario:");
			console.time("scen_req");

			if(type=="head") {	
				HttpManager.request('put', '/api/risk-scenario/'+scenario.id, {type:"head", data:{id:scenario.id, name:scenario.name, has_ac_file:scenario.has_ac_file} })
				.then(function(result) {
					console.timeEnd("scen_req");
					console.time("scen_const");

					var data=result.data;
					var scenario={id:data.id, name:data.name, has_ac_file:data.has_ac_file, has_fds_file:data.has_fds_file };
					deferred.resolve(scenario);

					console.timeEnd("scen_const");

				}, function(error) {
					deferred.reject(error);

					console.timeEnd("scen_req");
				});

			} else {
				console.log(scenario.risk_object);
				HttpManager.request('put', '/api/risk-scenario/'+scenario.id, {type:"all", data: {name:scenario.name, risk_object:scenario.risk_object, ui_state:scenario.ui_state, ac_file:scenario.ac_file, ac_hash:scenario.ac_hash} } /*JSON.stringify({project_id: scenario.project_id, id:scenario.id, name : scenario.name, description:scenario.description, fds_object:scenario.fds_object, fds_file : scenario.fds_file, ac_file : scenario.ac_file, ac_hash : scenario.ac_hash, ui_state:scenario.ui_state }) */)
				.then(function(result) {
					console.timeEnd("scen_req");
					console.time("scen_const");

					var data=result.data;
					var scenario=new RiskScenario({project_id:data.project_id, id:data.id, name:data.name, risk_object:data.risk_object, ac_file:data.ac_file, ac_hash:data.ac_hash, ui_state:data.ui_state});
					deferred.resolve(scenario);

					console.timeEnd("scen_const");

				}, function(error) {
					deferred.reject(error);

					console.timeEnd("scen_const");
				});
			}
		
			return deferred.promise;

		},//}}}
		delete : function(id) {//{{{
				
			var deferred=$q.defer();

			console.log("Delete risk scenario");
			console.time("scen_req");
	
			HttpManager.request('delete', '/api/risk-scenario/'+id,  JSON.stringify({}))
			.then(function(result) {
				deferred.resolve();

				console.timeEnd("scen_req");

			}, function(error) {
				deferred.reject(error);

				console.timeEnd("scen_req");
			});
		
			return deferred.promise;
		},//}}}
		objectToText : function(scenario) {//{{{
		
			var deferred=$q.defer();
			HttpManager.request('post', '/api/objtotext', scenario.serialize())
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
		runRiskScenario : function(scenario) {//{{{

			console.log(scenario);

			var deferred=$q.defer();
			
			console.log("Run risk scenario");
			console.time("scen_req");

			HttpManager.request('post', '/api/risk-scenario/'+scenario.id, JSON.stringify(scenario))
			.then(function(result) {
				console.timeEnd("scen_req");

				var res=result;	
				deferred.resolve(res);

			}, function(error) {
				deferred.reject(error);

				console.timeEnd("scen_req");
			});
		
			return deferred.promise;

		},//}}}
		generateRiskResults : function(scenario) {//{{{

			var deferred=$q.defer();
			
			HttpManager.request('post', '/api/risk-scenario/generate-results/'+scenario.id, JSON.stringify(scenario))
			.then(function(result) {
				var res=result;	
				deferred.resolve(res);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}//}}}
	}	
}]);
//}}}
