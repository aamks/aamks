angular.module('wf-accessor.service', ['ngLodash', 'wf-http.service', 'wf-globals.service', 'wf-id-generator.service', 'wf-validators.service', 'wf-websocket.service', 'wf-autocad.service', 'wf-list.service'])
.factory('Accessor', ['IdGenerator', 'lodash', 'Validator', '$injector', function(IdGenerator, lodash, Validator, $injector) {
	
	function Accessor() {

var MyMath = {};

MyMath.round = function(number, precision) {
	var factor = Math.pow(10, precision);
	var tempNumber = number * factor;
	var roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
};

		this.setter=function(self, attribute, globalAttribute, arg) {//{{{
			if(arg) {
				if(Validator.attribute(arg, globalAttribute)) {
					if(globalAttribute.type=='Real' || globalAttribute.type=='RealPair' || globalAttribute.type=='RealTriplet' || globalAttribute.type=='Realtriplet' || globalAttribute.type=='RealSextuplet' || globalAttribute.type=='Integer' || globalAttribute.type=='IntegerTriplet' ) {
						var normArg=Validator.normalizeReal(arg)*1;
					} else {
						var normArg=arg;
					}
					var Websocket=$injector.get('Websocket');
					Websocket.syncUpdateItem(self, [{atr:attribute, val:normArg}]).then(function(res) {
						if(res.status=='success') {	
							lodash.set(self, attribute, normArg);
						} else {
							//lodash.set(self, attribute, normArg);
						}
					}, function(res) {
						
					});
				}
			} else {
				return lodash.get(self, attribute);
			}
		}
//}}}
		this.setterLib=function(self, attribute, globalAttribute, arg) {//{{{
			if(arg) {
				if(Validator.attribute(arg, globalAttribute)) {
					if(globalAttribute.type=='Real' || globalAttribute.type=='RealPair' || globalAttribute.type=='RealTriplet' || globalAttribute.type=='Realtriplet' || globalAttribute.type=='RealSextuplet' || globalAttribute.type=='Integer' || globalAttribute.type=='IntegerTriplet' ) {
						var normArg=Validator.normalizeReal(arg)*1;
					} else {
						var normArg=arg;
					}
					
					lodash.set(self, attribute, normArg);
				}
			} else {
				return 	lodash.get(self, attribute);

			}
		}
//}}}
		this.boolSetter=function(self, attribute, globalAttribute) {//{{{
			var newValue=lodash.get(self, attribute);
			var oldValue=!newValue;

			var Websocket=$injector.get('Websocket');
			Websocket.syncUpdateItem(self, [{atr:attribute, val:newValue}]).then(function(res) {
				if(res.status=='success') {	
					console.log('bool success');
					//lodash.set(self, attribute, normArg);
				} else {
					lodash.set(self, attribute, oldValue);
				}
			}, function(res) {
				
			});

		}
//}}}
		this.selectSetter=function(self, attribute, oldValue, list) {//{{{

			var Websocket=$injector.get('Websocket');
			Websocket.syncUpdateItem(self, []).then(function(res) {
				if(res.status=='success') {	
					console.log('select success');
					//lodash.set(self, attribute, normArg);
				} else {
					if(list) {
						var oldObject=lodash.find(list, function(element) {
							return element.id==oldValue
						})
						if(oldObject) {
							lodash.set(self, attribute, oldObject);
						}
					} else {
					
						lodash.set(self, attribute, oldValue);
					}
				}
			}, function(res) {
				
			});

		}
//}}}
		this.calcSetter=function(self, attribute, globalAttribute, calcFunction, calcAttributes, arg) {//{{{
			if(arg) {
				if(Validator.attribute(arg, globalAttribute)) {
					console.log('validator passed');
					if(globalAttribute.type=='Real' || globalAttribute.type=='RealPair' || globalAttribute.type=='RealTriplet' || globalAttribute.type=='Realtriplet' || globalAttribute.type=='RealSextuplet' || globalAttribute.type=='Integer' || globalAttribute.type=='IntegerTriplet' ) {
						var normArg=Validator.normalizeReal(arg)*1;
					} else {
						var normArg=arg;
					}
					
					// pobiera atrybuty
					var attrs=lodash.mapValues(calcAttributes, function(element) {
						return element.value;
					})

					var results=calcFunction(attrs);
					var modifiedObject=calcAttributes[Object.keys(results)[0]]['obj'];
					var theSameObject=true;
					var attributeArray=[];

					lodash.forIn(results, function(value, key) {
						//lodash.set(calcAttributes[key]['obj'], calcAttributes[key]['path'], value);
						if(calcAttributes[key]['obj']!==modifiedObject) {
							theSameObject=false;
						} else {
							attributeArray.push({atr:calcAttributes[key]['path'], val:value});
						}
					});

					if(theSameObject){
						
						var Websocket=$injector.get('Websocket');
						Websocket.syncUpdateItem(modifiedObject, attributeArray).then(function(res) {
							if(res.status=='success') {	
								lodash.each(results, function(value, key) {
									var currentObject=calcAttributes[key]['obj'];
									var currentAttribute=calcAttributes[key]['path'];
									lodash.set(currentObject, currentAttribute, value);
								})
							} else {
								//lodash.set(self, attribute, normArg);
							}
						}, function(res) {
							
						});
					} else {
					
					}
				}
			} else {
				return 	lodash.get(self, attribute);

			}

		}
//}}}
//}}}

		this.setId=function(list) {//{{{
			var obj=this;	
			return function(id) {
		
				var res=arguments.length ? (IdGenerator.correctId(id, list.value) ? 'correct' : 'incorrect') : 'getter';
				if(res=='getter') {
					return obj.id;
				}

				if(res=='incorrect') {
					return null;
				}
				if(res=='correct') {
					console.log('correct');
					//obj.id=id;	
					
					var Websocket=$injector.get('Websocket');
			
					Websocket.syncUpdateItem(obj, [{atr:'id', val:id}]).then(function(response) {
					
						if(response.status=='success') {	
							obj.id=id;
						} else {

						}
					}, function(error) {
						
					});
				

				} 
				
			}
		}
//}}}
		this.setIdLib=function(list) {//{{{
			var obj=this;	
			return function(id) {
		
				var res=arguments.length ? (IdGenerator.correctId(id, list.value) ? 'correct' : 'incorrect') : 'getter';
				if(res=='getter') {
					return obj.id;
				}

				if(res=='incorrect') {
					return null;
				}
				if(res=='correct') {
					console.log('correct');
					obj.id=id;	
				} 
				
			}
		}
//}}}

		this.toReal=function(value) {//{{{

			if(typeof value=='string') {
				value=parseFloat(value);
				value=MyMath.round(value, 4);
			}
			return value
		}
//}}}
		this.toBool=function(value, def) {//{{{
		
			if(typeof value=='string') {
				if(value==='true') {
					value=true;
				} else if(value==='false') {
					value=false;
				} else {
					value=def;
				}
			} else if(typeof value=='boolean') {
				return value;
			} else {
				value=def;
			}

			return value

		}
//}}}
		this.toInt=function(value) {//{{{
		
			if(typeof value=='string') {
				value=parseInt(value);
			}
			else {
				value=MyMath.round(value, 0);
			}

			return value

		}

	}
//}}}

	return Accessor;

}]);
