angular.module('wf-globals.service', ['wf-http.service', 'ngLodash'])
.constant('Globals', {
	partialsUrl: 'partials/',
	listRange: 200
})
.service('GlobalValues', ['$q', 'HttpManager', 'lodash', function($q, HttpManager, lodash) {

	var values={
		defaults:{
			ampers:{},
			wiz:{},
			risk:{}
		},
		enums:{},
		risk_enums:{}
	}

	var normalizeAmper=function(object) {
	
		
		var result=lodash.chain(object)
		.mapKeys(function(value, key) {
			return key.toLowerCase();
		})
		.mapValues(function(value, key) {
			var attrs=lodash.chain(value)
			.mapKeys(function(value, key) {
				return key.toLowerCase();
			})
			.mapValues(function(attr) {
				return lodash.mapKeys(attr, function(value, key) {
					key=='default' ? key='value' : null;
					return key;
				})	
			})
			.mapValues(function(attr) {
			
				if((attr.type=='Logical' || attr.type=='Real' || attr.type=='Integer' || attr.type=='Character') && Array.isArray(attr.value)) {
					attr.value=attr.value[0];
				}	

				if(attr.type=='Character' && attr.value!=undefined) {
					
					if(attr.value.substring(0,3)=='ct ') {
						attr.value=attr.value.substring(3).toLowerCase();
					
					}

				}

				attr.type=='Logical' ? (attr.value=='true' ? attr.value=true : attr.value=false) : null;
				attr.type=='Real' ? (attr.value!=undefined ? attr.value=parseFloat(attr.value) : attr.value=0) : null;
				attr.type=='Integer' ? (attr.value!=undefined ? attr.value=parseInt(attr.value) : attr.value=0) : null;
				attr.type=='Character' ? (attr.value!=undefined ? attr.value=attr.value : attr.value="") : null;
				if((attr.type=='RealPair' || attr.type=='Realtriplet' || attr.type=='RealTriplet' || attr.type=='RealSextuplet') && attr.value) {
					attr.value=lodash.map(attr.value[0].split(','), function(val) {return parseFloat(val)})
					
				}

				if(attr.type=='IntegerTriplet' && attr.value) {
					attr.value=lodash.map(attr.value[0].split(','), function(val) {return parseInt(val)})
					
				}

				if(attr.type=='Logicaltriplet' || attr.type=='LogicalSextuplet' && attr.value) {
					attr.value=lodash.map(attr.value, function(val) {return val=='true' ? val=true : val=false; });
					//attr.value=lodash.map(attr.value[0].split(','), function(val) {return parseFloat(val)})
					
				}


				if(attr.valid_ranges && attr.valid_ranges.length>0) {
					attr.valid_ranges=lodash.map(attr.valid_ranges, function(val) {
						var newVal=lodash.mapValues(val, function(elem) {
							if(elem!='__') {
								return parseFloat(elem);
							} else {
								return elem;
							}
						});
						return newVal;
					})		
				}

				// TEMP!!!
				attr.error_messages={
					pattern: "wrong type!"	
				}
				//attr.error_ranges=[];
				//attr.warning_ranges=[];
				return attr;
			})
			.value()

			return attrs;
		})
		.value();
		return result;	
	}


	var normalizeEnums=function(object) {
		var result=lodash.mapValues(object, function(value) {
			var newVal=lodash.map(value, function(element) {
				var newElement=lodash.mapValues(element, function(item) {
					
					var newItem=item;
					if(item==='true') {
						newItem=true;
					}

					if(item==='false') {
						newItem=false;
					}
				
					return newItem;
				})
				return newElement;
			})
			return newVal;
		})
		return result;
	}

	var normalizeSpecies=function(object) {
		var result=lodash.map(object, function(value) {
			return value;
		})

		return result;
	}

	var getAmpers=function() {
		var self=this;
		var deferred=$q.defer();
		HttpManager.request('get', '/api/amperjson')
		.then(function(result) {
			self.values.defaults.ampers=normalizeAmper(result.data);
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
		
	}

	var getWiz=function() {
		var self=this;
		var deferred=$q.defer();
		HttpManager.request('get', '/api/wizjson')
		.then(function(result) {
			self.values.defaults.wiz=normalizeAmper(result.data);
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
		
	}

	var getGlobals=function() {
		var self=this;
		var deferred=$q.defer();
		HttpManager.request('get', '/api/globals')
		.then(function(result) {
			self.values.defaults.ampers=normalizeAmper(result.data.ampers);
			self.values.defaults.wiz=normalizeAmper(result.data.wiz);
			self.values.defaults.risk=normalizeAmper(result.data.risk);
			self.values.enums=normalizeEnums(result.data.enums);
			self.values.risk_enums=normalizeEnums(result.data.risk_enums);
			self.values.fds_object_enums={
				species:normalizeSpecies(result.data.fds_object_enums.species),
				cleary:normalizeSpecies(result.data.fds_object_enums.cleary)
			}	
			self.values.fds_object_enums.cleary_options=lodash.map(self.values.fds_object_enums.cleary, function(element) {
				return lodash.pick(element, ['label', 'value']);
			})
			self.values.app_data=result.data.app_data;

			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
		
	}


	return {
		values:values,
		getAmpers:getAmpers,
		getWiz:getWiz,
		getGlobals:getGlobals
	}
}])

