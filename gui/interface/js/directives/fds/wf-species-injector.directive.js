angular.module('wf-species-injector.directive', [ 'wf-globals.service','wf-safe-apply.service', 'ngLodash', 'wf-fds-object.service', 'wf-list.service', 'wf-dialog.service', 'wf-id-generator.service', 'katex'])
.directive('wfSpeciesInjector', function( Globals, GlobalValues, $rootScope, Fds, VentSpecie, SurfSpecie,  Ramp , lodash, $timeout, List, DialogManager, SafeApply, IdGenerator ) {
	

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.species=$rootScope.main.currentScenario.fds_object.species;

		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;

		scope.info={};

		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				if(data.name=='surfspecie') {
					scope.ui.species.surf.scrollPosition=data.position;
				} else if(data.name=='ventspecie'){
					scope.ui.species.vent.scrollPosition=data.position;
				}
			}
		})
//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {
			
			//if(scope.vent && scope.currentVentList.type=='file') {
			//	var vent_id=scope.vent.id;
			//
			//	var vent_index=lodash.findIndex(scope.species.vents,function(vent) {
			//		return vent.id==vent_id;
			//	})

			//	if(vent_index>=0) {
			//		var begin_index=function(index, listRange) {
			//			if(index<listRange) {
			//				return 0;
			//			} else {
			//				var res=Math.floor(index/listRange);
			//				return res*listRange;
			//			}
			//		}(vent_index, Globals.listRange);

			//		scope.ui.species.vent.begin=begin_index;
			//		scope.functions.vent.activate(vent_index);
			//	} else {

			//		scope.vent=undefined;
			//	}
			//
			//} else {

			//	scope.vent=undefined;
			//}

			//lists.ventList=new List(scope, 'vent', scope.species.vents, null, scope.ui.species.vent, scope.indexes.vent, scope.listRange, Vent, 'vent', 'file');
		
			//scope.currentVentList={
			//	value:scope.species.vents,
			//	type: "file"
			//};

			//SafeApply.apply(scope);

		})

		scope.$on('geometry_select', function(event, data) {
			scope.ui.species.vent.begin=data.begin;
			scope.functions.vent.activate(data.current);
			SafeApply.apply(scope);
		})
//}}}
		//ENUMS//{{{
		scope.enums={
			surfFlowType:GlobalValues.values.enums.specieFlowType,
			surfMassFractionFlowType:GlobalValues.values.enums.specieMassFractionFlowType,
			species:GlobalValues.values.fds_object_enums.species
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			surf:{
				index:0,
				changedIndex:false
			},
			libSurf:{
				index:0,
				changedIndex:false
			},
			vent:{
				index:0,
				changedIndex:false
			}
		
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentSurfList={
			value:scope.species.surfs,	
			type:'file'
		};
		scope.currentVentList={
			value:scope.species.vents,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			ventList:new List(scope, 'vent', scope.species.vents, scope.currentVentList, scope.ui.species.vent, scope.indexes.vent, scope.listRange, VentSpecie, 'vent', 'file'),
			surfList:new List(scope, 'surf', scope.species.surfs, scope.currentSurfList, scope.ui.species.surf, scope.indexes.surf, scope.listRange, SurfSpecie, 'surf', 'file', scope.lib.speciesurfs, scope.ui.species.libSurf),
			libSurfList:new List(scope, 'surf', scope.lib.speciesurfs, scope.currentSurfList , scope.ui.species.libSurf, {index:0}, scope.listRange, SurfSpecie, 'surf', 'lib')
		}
		//INIT EDIT WINDOW
		lists.surfList.initElement();
		lists.ventList.initElement();
		//}}}
		//HELP//{{{
		scope.help={
			vent:'',
		}
		//}}}
		//VENT FUNCTIONS//{{{
		scope.functions={};
			
		scope.functions.vent={
			
			activate: function($index) {
				lists.ventList.activate($index);
			},
			newItem:function() {
				lists.ventList.newItem();

			},
			remove:function($index) {
				var delVent=lists.ventList.getItem($index);
				var res=Websocket.syncDeleteItem(delVent);	
				if(res.status='success') {
					lists.ventList.remove($index);
				}
			},
			increaseRange:function() {
				lists.ventList.increaseRange();
			},
			decreaseRange:function() {
				lists.ventList.decreaseRange()
			},
			toggleHeater:function() {
				scope.heater=!scope.heater;
			},
			toggleLouver:function() {
				scope.louver=!scope.louver;
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.vent, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.vent, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			}

		}
//}}}
		//SURF FUNCTIONS//{{{

		scope.functions.surf={
			switch_lib: function() {
				if(scope.ui.species.surf.lib=='closed') {
					scope.ui.species.surf.lib='open';
				} else {
					scope.ui.species.surf.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.species.surf.help=='closed') {
					scope.ui.species.surf.help='open';
				} else {
					scope.ui.species.surf.help='closed';
				}
		
			},

			activate: function($index) {
				lists.surfList.activate($index);
			},
			newItem:function() {
				lists.surfList.newItem();

			},
			remove:function($index) {
				lists.surfList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.species.surf.begin;	
				scope.info.surf_id=scope.species.surfs[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.surfvent_prompt(scope.info.updatedIndex);
				console.log(scope.info);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-ventsurf-prompt");
				} else {
					var delSurf=lists.surfList.getItem(scope.info.index);
					var res=Websocket.syncDeleteItem(delSurf);	
					if(res.status='success') {

						scope.removers.surfvent_remove(scope.info.updatedIndex);
						lists.surfList.remove(scope.info.index);
					}

					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					var delSurf=lists.surfList.getItem(scope.info.index);
					var res=Websocket.syncDeleteItem(delSurf);	
					if(res.status='success') {
						scope.removers.surfvent_remove(scope.info.updatedIndex);
						lists.surfList.remove(scope.info.index);
					}
					scope.info={};
				} else {
					scope.info={};
				}
			},


			increaseRange:function() {
				lists.surfList.increaseRange();
			},
			decreaseRange:function() {
				lists.surfList.decreaseRange()
			},
			addNewRamp:function(surf) {
				var tempRamp=new Ramp({'type':'vent', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.ramps.ramps);
				scope.ramps.ramps.push(tempRamp);
				var surf_id = surf.id;
				var surf_index=lodash.findIndex(scope.species.surfs,function(surface) {
					return surface.id==surf_id;
				})
				scope.species.surfs[surf_index].ramp=tempRamp;
			},
			addRampStep:function() {
				scope.surf.ramp.addStep(0,0);
			},
			removeRampStep:function(index) {
				console.log(scope.surf)
				scope.surf.ramp.removeStep(index);
			},
			toggleHeater:function() {
				scope.heater=!scope.heater;
			},
			toggleLouver:function() {
				scope.louver=!scope.louver;
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.surf, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.surf, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			}

		}
//}}}
		//LIBRARY SURF FUNCTIONS//{{{
		scope.functions.libSurf={
			activate: function($index) {
				lists.libSurfList.activateLib($index);
			},
			newItem:function() {
				lists.libSurfList.newItemLib();

			},
			remove:function($index) {
				lists.libSurfList.remove($index);
			},
			increaseRange:function() {
				lists.libSurfList.increaseRange();
			},
			decreaseRange:function() {
				lists.libSurfList.decreaseRange()
			},
			toggleHeater:function() {
				scope.heater=!scope.heater;
			},
			toggleLouver:function() {
				scope.louver=!scope.louver;
			},
			addNewRamp:function(surf) {
				var tempRamp=new Ramp({'type':'vent', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.lib.ramps);
				scope.lib.ramps.push(tempRamp);
				var surf_id = surf.id;
				var surf_index=lodash.findIndex(scope.lib.ventsurfs,function(surface) {
					return surface.id==surf_id;
				})
				scope.lib.ventsurfs[surf_index].ramp=tempRamp;
			},

			importItem:function(index) {
				var updatedIndex=index+scope.ui.species.libSurf.begin;
				var base=scope.lib.importers.surfvent_import(scope.lib.ventsurfs[updatedIndex], scope.species.surfs, scope.ramps.ramps, scope.lib.ramps);
				lists.surfList.importItem(base);	
			},

			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.surf, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.surf, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			}

		}
//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-species-injector',
		link : link,
		controller : controller,
		scope : {}
	}



})

