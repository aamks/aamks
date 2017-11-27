angular.module('wf-websocket.service', ['wf-globals.service', 'wf-autocad.service', 'angular-websocket', 'wf-safe-apply.service', 'ngLodash', 'wf-fds-object.service', 'ui-notification'])
.factory('WebsocketMessage', [ function() {//{{{
	
	function Message(id, requestID, status, method, data) {
		
		this.id=id || "";
		this.requestID=requestID || "";
		this.status=status || "";
		this.method=method || "";
		this.data=data || {};
	}

	return Message;

}])//}}}
.service('Websocket', ['Globals','$state','$websocket', 'SafeApply', '$q','WebsocketMessage',  '$timeout', '$rootScope', 'lodash', 'Autocad', 'Mesh', 'Open', 'Obst', 'Hole', 'Vent', 'Devc', 'Slcf', 'Surf', 'SurfVent', 'SurfFire' , 'FireVent', 'Notification', function(Globals, $state, $websocket, SafeApply, $q, WebsocketMessage, $timeout, $rootScope, lodash, Autocad, Mesh, Open, Obst, Hole, Vent, Devc, Slcf, Surf, SurfVent, SurfFire, FireVent, Notification) {

	var messages=[];
	var stream;
	var callbacks={};
	var connection={state: "close"};
	var intentionalClose=false;

	var timeLimit=5000;

	var idGenerator=function() {//{{{
		var id=Date.now()+'';
		var rand=Math.round(1000*Math.random())+'';
		id=id+rand;
		return id;
	}//}}}
   	var send=function(message) {//{{{
		console.log(message);
    	stream.send(message);
	}//}}}
	var open=function(websocket) {//{{{
		stream=$websocket('ws://'+websocket.host+':'+websocket.port);
		stream.onOpen(function() {
			if(connection.state=='close')
				Notification.success('Websocket CAD connected');
			connection.state='open';
			this.onMessage(function(message) {//{{{
				console.log("Wiadomość z AC:");
				console.log(message);
				var data=parseMessage(message.data);
				//messages.push(JSON.parse(message.data));
				//var data = JSON.parse(message.data);
  				if (angular.isDefined(callbacks[data.requestID])) {
	      			var callback = callbacks[data.requestID];
		      		delete callbacks[data.requestID];
			      	callback.resolve(data);
				} else {
					
					if(data.method && data.method!="") {
						switch(data.method) {
							case "fExport"://{{{
								console.log("fExport");
								//var res=Autocad.transformAcGeometry(data.data.geometry, $rootScope.main.currentScenario.fds_object.geometry);
								
								$timeout(function() {
									// Clean lists //{{{
									lodash.remove($rootScope.main.currentScenario.fds_object.geometry.meshes, function(mesh) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.geometry.opens, function(open) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.geometry.obsts, function(obst) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.geometry.holes, function(hole) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.geometry.surfs, function(surf) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.ventilation.surfs, function(surf) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.ventilation.vents, function(vent) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.ventilation.jetfans, function(jetfan) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.fires.fires, function(fire) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.output.slcfs, function(slcf) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.output.devcs, function(devc) {
										return true;
									});
									lodash.remove($rootScope.main.currentScenario.fds_object.ramps.ramps, function(ramp) {
										return true;
									});
									//}}}
									var newObject=Autocad.transformAcGeometry(data.data, $rootScope.main.currentScenario.fds_object);
									// Add AC objects//{{{
									lodash.each(newObject.geometry.meshes, function(mesh) {
										$rootScope.main.currentScenario.fds_object.geometry.meshes.push(mesh);
										// Tutaj przeliczyc 
									});
									lodash.each(newObject.geometry.opens, function(open) {
										$rootScope.main.currentScenario.fds_object.geometry.opens.push(open);
									});
									lodash.each(newObject.output.devcsSurfs, function(devc) {
										$rootScope.main.currentScenario.fds_object.output.devcs.push(devc);
									});
									lodash.each(newObject.output.devcs, function(devc) {
										$rootScope.main.currentScenario.fds_object.output.devcs.push(devc);
									});
									lodash.each(newObject.geometry.obsts, function(obst) {
										$rootScope.main.currentScenario.fds_object.geometry.obsts.push(obst);
									});
									lodash.each(newObject.geometry.holes, function(hole) {
										$rootScope.main.currentScenario.fds_object.geometry.holes.push(hole);
									});
									lodash.each(newObject.geometry.surfs, function(surf) {
										$rootScope.main.currentScenario.fds_object.geometry.surfs.push(surf);
									});
									lodash.each(newObject.ventilation.surfs, function(surf) {
										$rootScope.main.currentScenario.fds_object.ventilation.surfs.push(surf);
									});
									lodash.each(newObject.ventilation.vents, function(vent) {
										$rootScope.main.currentScenario.fds_object.ventilation.vents.push(vent);
									});
									lodash.each(newObject.ventilation.jetfans, function(jetfan) {
										$rootScope.main.currentScenario.fds_object.ventilation.jetfans.push(jetfan);
									});
									lodash.each(newObject.fires.fires, function(fire) {
										$rootScope.main.currentScenario.fds_object.fires.fires.push(fire);
									});
									lodash.each(newObject.output.slcfs, function(slcf) {
										$rootScope.main.currentScenario.fds_object.output.slcfs.push(slcf);
									});
									//}}}
									$rootScope.main.currentScenario.ac_file = data.data.ac_file;
									$rootScope.main.currentScenario.ac_hash = data.data.ac_hash;
									$rootScope.$broadcast('geometry_update', {message:'update'});
								}, 0);
								break;
//}}}
							case "cExport"://{{{
								$rootScope.main.currentRiskScenario.risk_object.geometry=data.data;
								break;
//}}}
							case "fGetLibraryLayers"://{{{
								console.log("doszlo");
								var answer=JSON.stringify({
									method: data.method,
									id: idGenerator(),
									requestID: data.id,
									data: {},
									status: "success"
								})
								stream.send(answer);
								createLibraryLayers($rootScope.main.lib);
								break;
//}}}
							case "selectObjectAc"://{{{
								console.log('select');
								console.log(data);

								var idAC=data.data.idAC;
								if(idAC && idAC!="") {

									var ui_state=$rootScope.main.currentScenario.ui_state;
									var element=findElementByIdAC(idAC, $rootScope.main.currentScenario.fds_object);	
									var listRange=Globals.listRange;
									
									console.log(element);

									if(element && element.type) {
										switch(element.type) {
											case 'mesh':
												$state.go('application.fds-scenario.visual.mesh',{id:$rootScope.main.currentScenarioId} );
												break;
											case 'open':
												$state.go('application.fds-scenario.visual.open',{id:$rootScope.main.currentScenarioId} );
												break;
											case 'surf':
												break;
											case 'obst':
												$state.go('application.fds-scenario.visual.obst',{id:$rootScope.main.currentScenarioId} );
												var list="obst";
												break;
											case 'hole':
												$state.go('application.fds-scenario.visual.obst',{id:$rootScope.main.currentScenarioId} );
												var list="hole";
												break;
											case 'vent':
												$state.go('application.fds-scenario.visual.basic-ventilation',{id:$rootScope.main.currentScenarioId} );
												break;

											case 'jetfan':
												$state.go('application.fds-scenario.visual.jetfan-ventilation',{id:$rootScope.main.currentScenarioId} );
												break;

											case 'fire':
												$state.go('application.fds-scenario.visual.fires',{id:$rootScope.main.currentScenarioId} );
												break;

											case 'slcf':
												$state.go('application.fds-scenario.visual.slice',{id:$rootScope.main.currentScenarioId} );
												break;

											case 'devc':
												$state.go('application.fds-scenario.visual.device',{id:$rootScope.main.currentScenarioId} );
												break;
										}


										var beginIndex=calculateBeginIndex(element.index, listRange);
										var currentIndex=element.index-beginIndex;
										var listType=list || undefined;
										$timeout(function() {	
											if(listType) {
												$rootScope.$broadcast('geometry_select', {begin:beginIndex, current:currentIndex, list:listType});
											} else {
												$rootScope.$broadcast('geometry_select', {begin:beginIndex, current:currentIndex});
											}
										},0)
									} else {
										var answer=JSON.stringify({
											method: data.method,
											id: idGenerator(),
											requestID: data.id,
											data: {},
											status: "error"
										})
										//console.log(answer);
										//console.log(stream);
										stream.send(answer);


									}
								}
								break;
//}}}
							default://{{{
								console.log("default");
//}}}
						}
					}

					//console.log('Odpowiedz do AC:');
					var answer=JSON.stringify({
						method: data.method,
						id: idGenerator(),
						requestID: data.id,
						data: {},
						status: "success"
					})
					//console.log(answer);
					//console.log(stream);
					stream.send(answer);
					
				}
			});	
//}}}
			this.onClose(function(event) {//{{{

				console.log('connection closed');
				//console.log(event);
				connection.state="close";

			
				function reconnect(counter) {
					if(counter<50 && connection.state=='close') {	
						$timeout(function() {
							console.log(counter);
							counter++;
							open($rootScope.main.websocket);
							reconnect(counter);
						}, 100)
					} else {
				
					}
				
				}
				
				if(intentionalClose==false) {
					//console.log('trying to reconnect...');
					//reconnect(0);
				} else {
					intentionalClose=false;
				}

				
			});
//}}}
		});
	}//}}}
	var close=function() {//{{{
		stream.close();
		Notification.error('Websocket CAD disconnected');
		intentionalClose=true;
	}//}}}
	var clear=function() {//{{{
		messages.length=0;
	}//}}}
	var sendAndWait=function(method, data) {//{{{

		var request=new WebsocketMessage(idGenerator(), "", "success", method, data);
		console.log(request);
   		var deferred = $q.defer();
     	callbacks[request.id] = deferred;
		//console.log("Przed stream.send");
		var stringMessage=JSON.stringify(request);
		//console.log(stringMessage);
		stream.send(stringMessage);
		//console.log("Po stream.send");

		$timeout(function() {
			//console.log('defered:');
			//console.log(callbacks[request.id]);
			if(callbacks[request.id]) {
				console.log('AC nie odpowiedział w ciągu 5s');
				console.log(callbacks[request.id]);
				
			}
		}, timeLimit);

		return deferred.promise.then(function(response) {
			console.log('s&w response: ');
			console.log(response);
			request.response = response;
			return response;
		});
	};//}}}
	var parseMessage=function(messageString) {//{{{

		var parsedMessage={};
		try {
			parsedMessage=JSON.parse(messageString);

		} catch(err) {
			parsedMessage={
				'id':"",
				'requestID':"",
				'status':"error",
				'method':"",
				'data':{}

			}
		}
		
		var message=new WebsocketMessage(parsedMessage.id, parsedMessage.requestID, parsedMessage.status, parsedMessage.method, parsedMessage.data);
		
		return message
	}//}}}

	var syncAll=function(obj) {//{{{
		var data=obj;
		var method="syncAllWeb";

		var result=$q.defer();
		if(connection.state=='open') {
			console.log('syncAll sending...');
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
				} else {

	              	result.resolve({status: 'error'});
				}
			}, function(error) {

				console.log(error);
				result.resolve({status: 'error'});
			})	
		} else {
			console.log('no connection');
			/*
			var name=elementClass(obj)+'s';
			$rootScope.main.currentScenario.sync_object.add_ac(name, obj.uuid);
			
			console.log($rootScope.main.currentScenario.sync_object);
			*/
			result.resolve({status: 'success'});
		}

		return result.promise;
	}//}}}
	var syncLayers=function(obj) {//{{{
		var data=obj;
		var method="syncLayersWeb";
		var result=$q.defer();
		
		if(connection.state=='open') {
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
				} else {

	              	result.resolve({status: 'error'});
				}
			}, function(error) {

				console.log(error);
				result.resolve({status: 'error'});
			})	
		} else {
			console.log('no connection');
			/*
			var name=elementClass(obj)+'s';
			$rootScope.main.currentScenario.sync_object.add_ac(name, obj.uuid);
			
			console.log($rootScope.main.currentScenario.sync_object);
			*/
			result.resolve({status: 'success'});
		}

		return result.promise;
	}//}}}
	var createLibraryLayers=function(obj) {//{{{
		var data=obj;
		var method="createLibraryLayers";

		var result=$q.defer();
		if(connection.state=='open') {
			console.log('createLibraryLayers sending...');
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
					Notification.success('Library layers synced with CAD');
				} else {
	              	result.resolve({status: 'error'});
					Notification.error('Library layers not synced with CAD');
				}
			}, function(error) {
				console.log(error);
				result.resolve({status: 'error'});
				Notification.error('Library layers not synced with CAD');
			})	
		} else {
			console.log('no connection');
			result.resolve({status: 'success'});
			Notification.error('No CAD connection');
		}

		return result.promise;
	}//}}}
	var syncUpdateItem=function(obj, attrArray) {//{{{

		var method;
		var data;
		var result=$q.defer();

		console.log(elementClass(obj));
		switch(elementClass(obj)) {
			case "obst"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='xb.x1'|| element.atr=='xb.x2'|| element.atr=='xb.y1'|| element.atr=='xb.y2'|| element.atr=='xb.z1'|| element.atr=='xb.z2' || element.atr=='id' || element.atr=='elevation' || element.atr=='surf.surf_id' || element.atr=='surf.surf_idx' || element.atr=='surf.surf_id1';

				})) {
					console.log('update obst');
					method="updateObstWeb";
					var newObj=new Obst(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "hole"://{{{
				console.log('update hole');
				method="updateHoleWeb";
				var newObj=new Hole(obj);
				lodash.each(attrArray, function(element) {
					lodash.set(newObj, element.atr, element.val);
				})
				data=newObj;
				break;//}}}
			case "mesh"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='xb.x1'|| element.atr=='xb.x2'|| element.atr=='xb.y1'|| element.atr=='xb.y2'|| element.atr=='xb.z1'|| element.atr=='xb.z2' || element.atr=='id' ;
				})) {
					method="updateMeshWeb";
					var newObj=new Mesh(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update mesh');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "open"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='xb.x1'|| element.atr=='xb.x2'|| element.atr=='xb.y1'|| element.atr=='xb.y2'|| element.atr=='xb.z1'|| element.atr=='xb.z2' || element.atr=='id' ;
				})) {

					method="updateOpenWeb";
					var newObj=new Open(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update open');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "vent"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='xb.x1'|| element.atr=='xb.x2'|| element.atr=='xb.y1'|| element.atr=='xb.y2'|| element.atr=='xb.z1'|| element.atr=='xb.z2' || element.atr=='id' || element.atr=='elevation' || element.atr=='surf.surf_id' ;

				})) {

					method="updateVentWeb";
					var newObj=new Vent(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update vent');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "firevent"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='xb.x1'|| element.atr=='xb.x2'|| element.atr=='xb.y1'|| element.atr=='xb.y2'|| element.atr=='xb.z1'|| element.atr=='xb.z2' || element.atr=='id' || element.atr=='elevation';

				})) {

					method="updateFireVentWeb";
					var newObj=new FireVent(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update firevent');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "surf"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='id' || element.atr=='color';

				})) {

					method="updateObstSurfWeb";
					var newObj=new Surf(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update surf');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "surfvent"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='id' || element.atr=='color';

				})) {
					method="updateVentSurfWeb";
					var newObj=new SurfVent(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update surfvent');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "surffire"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='id' || element.atr=='color';

				})) {

					method="updateFireSurfWeb";
					var newObj=new SurfFire(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update surffire');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "slcf"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='id'

				})) {
					method="updateSlcfWeb";
					var newObj=new Slcf(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update slcf');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "devc"://{{{
				if(lodash.find(attrArray, function(element) {
					return element.atr=='id'

				})) {
					method="updateDevcWeb";
					var newObj=new Devc(obj);
					lodash.each(attrArray, function(element) {
						lodash.set(newObj, element.atr, element.val);
					})
					data=newObj;
					console.log('update devc');
					break;
				} else {
					result.resolve({status: 'success'});
					return result.promise;
					break;
				}//}}}
			case "other"://{{{
				console.log('inny');	
				result.resolve({status: 'success'});
				
				return result.promise;
				break;//}}}
		}

		if(connection.state=='open') {
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
				} else {
					result.resolve({status: 'error'});
				}
			}, function(error) {
				console.log(error);
				// zmienic, gdy metody beda zaimplementowane!!!
				result.resolve({status: 'error'});
			})	
		} else {
			console.log('no connection');
			var name=elementClass(obj)+'s';
			$rootScope.main.currentScenario.sync_object.add_ac(name, obj.uuid);
			
			console.log($rootScope.main.currentScenario.sync_object);
			result.resolve({status: 'success'});
		}

		return result.promise;
	}//}}}
	var syncCreateItem=function(obj) {//{{{
	
		var method;
		var data;

		var result=$q.defer();
		switch(elementClass(obj)) {
			case "obst":
				console.log('create obst');
				method="createObstWeb";
				var newObj=new Obst(obj);
				data=newObj;
				break;
			case "hole":
				console.log('create hole');
				method="createHoleWeb";
				var newObj=new Hole(obj);
				data=newObj;
				break;
			case "mesh":
				method="createMeshWeb";
				var newObj=new Mesh(obj);
				data=newObj;
				console.log('create mesh');
				break;
			case "open":
				method="createOpenWeb";
				var newObj=new Open(obj);
				data=newObj;
				console.log('create open');
				break;
			case "vent":
				method="createVentWeb";
				var newObj=new Vent(obj);
				data=newObj;
				console.log('create vent');
				break;
			case "firevent":
				method="createFireVentWeb";
				var newObj=new FireVent(obj);
				data=newObj;
				console.log('create firevent');
				break;
			case "surf":
				method="createObstSurfWeb";
				var newObj=new Surf(obj);
				data=newObj;
				console.log('create surf');
				break;
			case "surfvent":
				method="createVentSurfWeb";
				var newObj=new SurfVent(obj);
				data=newObj;
				console.log('create surfvent');
				break;
			case "surffire":
				method="createFireSurfWeb";
				var newObj=new SurfFire(obj);
				data=newObj;
				console.log('create surffire');
				break;
			case "slcf":
				method="createSlcfWeb";
				var newObj=new Slcf(obj);
				data=newObj;
				console.log('create slcf');
				break;
			case "devc":
				method="createDevcWeb";
				var newObj=new Devc(obj);
				data=newObj;
				console.log('create devc');
				break;
			case "other":
				console.log('inny');
				
				result.resolve({status: 'success'});
				return result.promise;
				break;
			
		}


		if(connection.state=='open') {
			sendAndWait(method, data).then(function(response) {
				//console.log(response);
				if(response.status && response.status=='success' && response.data && response.data.idAC) {	
					result.resolve({status: 'success', idAC: response.data.idAC});
				} else {

					result.resolve({status: 'error'});
				}
			}, function(error) {

				console.log(error);
				// zmienic, gdy metody beda zaimplementowane!!!
				
				result.resolve({status: 'error'});
			})	
		
		} else {
			console.log('no connection');
			var name=elementClass(obj)+'s';
			$rootScope.main.currentScenario.sync_object.add_ac(name, obj.uuid);
			
			console.log($rootScope.main.currentScenario.sync_object);

			result.resolve({status: 'success'});
		}

		return result.promise;

	}//}}}
	var syncDeleteItem=function(obj) {//{{{
		var method;
		var data;
		var result=$q.defer();

		switch(elementClass(obj)) {
			case "obst"://{{{
				console.log('delete obst');
				method="deleteObstWeb";
				var newObj=new Obst(obj);
				data=newObj;
				break;//}}}
			case "hole"://{{{
				console.log('delete hole');
				method="deleteHoleWeb";
				var newObj=new Hole(obj);
				data=newObj;
				break;//}}}
			case "mesh"://{{{
				method="deleteMeshWeb";
				var newObj=new Mesh(obj);
				data=newObj;
				console.log('delete mesh');
				break;//}}}
			case "open"://{{{
				method="deleteOpenWeb";
				var newObj=new Open(obj);
				data=newObj;
				console.log('delete open');
				break;//}}}
			case "vent"://{{{
				method="deleteVentWeb";
				var newObj=new Vent(obj);
				data=newObj;
				console.log('delete vent');
				break;//}}}
			case "firevent"://{{{
				method="deleteFireVentWeb";
				var newObj=new FireVent(obj);
				data=newObj;
				console.log('delete firevent');
				break;//}}}
			case "surf"://{{{
				method="deleteObstSurfWeb";
				var newObj=new Surf(obj);
				data=newObj;
				console.log('delete surf');
				break;//}}}
			case "surfvent"://{{{
				method="deleteVentSurfWeb";
				var newObj=new SurfVent(obj);
				data=newObj;
				console.log('delete surfvent');
				break;//}}}
			case "surffire"://{{{
				method="deleteFireSurfWeb";
				var newObj=new SurfFire(obj);
				data=newObj;
				console.log('delete surffire');
				break;//}}}
			case "slcf"://{{{
				method="deleteSlcfWeb";
				var newObj=new Slcf(obj);
				data=newObj;
				console.log('delete slcf');
				break;//}}}
			case "devc"://{{{
				method="deleteDevcWeb";
				var newObj=new Devc(obj);
				data=newObj;
				console.log('delete devc');
				break;//}}}
			case "other"://{{{
				console.log('inny');	
				result.resolve({status: 'success'});
				return result.promise;
				break;//}}}
		}

		if(connection.state=='open') {
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
				} else {
					result.resolve({status: 'error'});
				}
			}, function(error) {
				console.log(error);
				result.resolve({status: 'error'});
			})	
		} else {
			console.log('no connection');
			var name=elementClass(obj)+'s';
			$rootScope.main.currentScenario.sync_object.remove_ac(name, obj);
			
			console.log($rootScope.main.currentScenario.sync_object);

			result.resolve({status: 'success'});
		}
		return result.promise;
	}//}}}
	var syncSelectItem=function(obj) {//{{{

		console.log('select: ');
		console.log(obj);
		var data=obj;
		var method="selectObjectWeb";

		var result=$q.defer();
		if(connection.state=='open') {
			sendAndWait(method, data).then(function(response) {
				console.log(response);
				if(response.status && response.status=='success') {	
					result.resolve({status: 'success'});
				} else {

	              	result.resolve({status: 'error'});
				}
			}, function(error) {

				console.log(error);
				result.resolve({status: 'error'});
			})	
		} else {
			console.log('no connection');
			result.resolve({status: 'success'});
		}
	}//}}}

	var elementClass=function(obj) {//{{{
	
		if(obj instanceof Obst) {
			return "obst";
		} else if(obj instanceof Hole) {
			return "hole";
		} else if(obj instanceof Mesh) {
			return "mesh";
		} else if(obj instanceof Open) {
			return "open";
		} else if(obj instanceof Vent) {
			return "vent";
		} else if(obj instanceof Surf) {
			return "surf";
		} else if(obj instanceof Slcf) {
			return "slcf";
		} else if(obj instanceof Devc) {
			return "devc";
		} else if(obj instanceof FireVent) {
			return "firevent";
		} else if(obj instanceof SurfFire) {
			return "surffire";
		} else if(obj instanceof SurfVent ) {
			return "surfvent";
		} else {
			return "other";
		}
	}//}}}
	var findElementByIdAC=function(idAC, fds_object) {//{{{

		var result="";

		var element={
			type:"",
			index:"",
			idAC:idAC
		};

		result=lodash.findIndex(fds_object.geometry.meshes, function(elem) {
			return elem.idAC==idAC;
		})
		
		if(result>=0) {
			element.type='mesh';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.geometry.opens, function(elem) {
			return elem.idAC==idAC;
		})
		
		if(result>=0) {
			element.type='open';
			element.index=result;
			return element;
		} 
/*
		result=lodash.findIndex(fds_object.geometry.surfs, function(elem) {

			return elem.idAC==idAC;
		})

		if(result>=0) {
			element.type='surf';
			element.index=result;
			return element;
		} 
*/
		result=lodash.findIndex(fds_object.geometry.obsts, function(elem) {

			return elem.idAC==idAC;
		})

		if(result>=0) {
			element.type='obst';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.geometry.holes, function(elem) {

			return elem.idAC==idAC;
		})

		if(result>=0) {
			element.type='hole';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.ventilation.vents, function(elem) {

			return elem.idAC==idAC;
		})

		if(result>=0) {
			element.type='vent';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.ventilation.jetfans, function(elem) {

			return elem.idAC==idAC;
		})

		if(result>=0) {
			element.type='jetfan';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.fires.fires, function(elem) {

			return elem.idAC==idAC;
		})


		if(result>=0) {
			element.type='fire';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.output.slcfs, function(elem) {

			return elem.idAC==idAC;
		})


		if(result>=0) {
			element.type='slcf';
			element.index=result;
			return element;
		} 

		result=lodash.findIndex(fds_object.output.devcs, function(elem) {

			return elem.idAC==idAC;
		})


		if(result>=0) {
			element.type='devc';
			element.index=result;
			return element;
		} 

	}//}}}

	var calculateBeginIndex=function(index, listRange) {//{{{
		if(index<listRange) {
			return 0;
		} else {
			var res=Math.floor(index/listRange);
			return res*listRange;
		}
	}//}}}

	return {
		messages: messages,
		connection: connection,
		send: send,
		sendAndWait: sendAndWait,
		open: open,
		close: close,
		clear: clear,
		syncUpdateItem: syncUpdateItem,
		syncCreateItem: syncCreateItem,
		syncDeleteItem: syncDeleteItem,
		syncSelectItem: syncSelectItem,
		syncAll: syncAll,
		syncLayers: syncLayers,
		createLibraryLayers: createLibraryLayers
	}
}])
