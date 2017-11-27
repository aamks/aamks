angular.module('wf-category.service', ['ngLodash', 'wf-globals.service', 'wf-http.service', 'wf-id-generator.service', 'wf-validators.service'] )
.factory('Category', ['lodash', function(lodash) {//{{{

	function Category(base) {

		if(!base) {
			base={};
		}

		this.uuid=base['uuid']||'';
		this.label=base['label']||'';
		this.active=base['active']||false;
		this.visible=base['visible']||false;

		this.triggerActive=function() {
			if(this.active==true) {
				this.active=false;
			} else {
				this.active=true;
			}
		}
		this.set_label=function(arg) {
			if(arg) {
				this.label=arg;
			} else {
				return this.label;
			}
		}

		this.serialize=function() {
			var self=this;
			
			var serializedCategory={
				uuid:self.uuid,
				label:self.label,
				active:self.active,
				visible:self.visible
			}
			return JSON.stringify(serializedCategory, null, '\t');
		}
	}
	
	return Category;	
}])//}}}
.service('CategoryManager', ['$q', '$http', 'Category', 'HttpManager', 'lodash', 'Accessor',  function($q, $http, Category, HttpManager, lodash, Accessor) {//{{{
	return {
		update : function(uuid, object) {//{{{
			var deferred=$q.defer();
			
			HttpManager.request('put', '/api/category/'+uuid,  JSON.stringify(object))
			.then(function(result) {
					deferred.resolve(result.data);
				}, function(error) {
					deferred.reject(error);	
				});
			
				return deferred.promise;			
		},//}}}
		create : function(object) {//{{{
			var deferred=$q.defer();
			
			HttpManager.request('post', '/api/category',  JSON.stringify(object))
			.then(function(result) {
					deferred.resolve(result.data);
				}, function(error) {
					deferred.reject(error);	
				});
			
				return deferred.promise;			
		},//}}}
		delete : function(uuid) {//{{{
				
			var deferred=$q.defer();
	
			HttpManager.request('delete', '/api/category/'+uuid,  JSON.stringify({}))
			.then(function(result) {
				deferred.resolve();
			}, function(error) {
				deferred.reject(error);
			});
		
			return deferred.promise;

		},//}}}
	}
}]);
//}}}
