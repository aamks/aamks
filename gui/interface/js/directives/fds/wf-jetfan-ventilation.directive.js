angular.module('wf-jetfan-ventilation.directive', ['wf-globals.service', 'ngLodash', 'wf-fds-object.service','wf-list.service', 'wf-dialog.service', 'wf-websocket.service', 'wf-safe-apply.service', 'wf-id-generator.service'])
.directive('wfJetfanVentilation', function(Globals, GlobalValues, $rootScope, Jetfan, lodash, $timeout, Ramp, List, DialogManager, Websocket, SafeApply, IdGenerator) {
	
	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.ventilation=$rootScope.main.currentScenario.fds_object.ventilation;

		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL //{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				scope.ui.ventilation[data.name].scrollPosition=data.position;
			}
		})//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {

			if(scope.jetfan) {
				var jetfan_id=scope.jetfan.id;
			
				var jetfan_index=lodash.findIndex(scope.ventilation.jetfans,function(jetfan) {
					return jetfan.id==jetfan_id;
				})

				if(jetfan_index>=0) {
					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(jetfan_index, Globals.listRange);

					scope.ui.ventilation.jetfan.begin=begin_index;
					scope.functions.jetfan.activate(mesh_index);
				} else {

					scope.jetfan=undefined;
				}
			
			}

			lists.jestfanList=new Jetfan(scope, 'jetfan', scope.ventilation.jetfans, null, scope.ui.ventilation.jetfan, scope.indexes.jetfan, scope.listRange, Jetfan, 'jetfan', 'file');
		
			scope.currentJetfanList={
				value:scope.ventilation.jetfans,
				type: "file"
			};

			SafeApply.apply(scope);

		})

		scope.$on('geometry_select', function(event, data) {
			if(data.list && data.list=='jetfan') {
				scope.ui.ventilation.jetfan.begin=data.begin;
				scope.functions.jetfan.activate(data.current);
			}
			SafeApply.apply(scope);
		})//}}}
		//ENUMS//{{{
		scope.enums={
			jetfanFlowType:GlobalValues.values.enums.jetfanFlowType,
			jetfanAreaType:GlobalValues.values.enums.jetfanAreaType,
			jetfanDirection:GlobalValues.values.enums.jetfanDirection
		}//}}}
		// INDEXES//{{{
		scope.indexes={
			jetfan:{
				index:0,
				changedIndex:false
			}
		}//}}}
		//CURRENT LISTS//{{{
		scope.currentJetfanList={
			value:scope.ventilation.jetfans,	
			type:'file'
		};//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			jetfanList:new List(scope, 'jetfan', scope.ventilation.jetfans, scope.currentJetfanList, scope.ui.ventilation.jetfan, scope.indexes.jetfan, scope.listRange, Jetfan, 'jetfan', 'file', scope.lib.jetfans, scope.ui.ventilation.libJetfan),
			libJetfanList:new List(scope, 'jetfan', scope.lib.jetfans, scope.currentJetfanList , scope.ui.ventilation.libJetfan, {index:0}, scope.listRange, Jetfan, 'jetfan', 'lib')
		}//}}}
		//INIT EDIT WINDOW//{{{
		lists.jetfanList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			jetfan:''
		}
	//}}}
		//FUNCTIONS JETFAN //{{{
		scope.louver=false;

		scope.functions={};
				
		scope.functions.jetfan={
			switch_help: function() {
				if(scope.ui.ventilation.jetfan.help=='closed') {
					scope.ui.ventilation.jetfan.help='open';
				} else {
					scope.ui.ventilation.jetfan.help='closed';
				}
			},
			switch_lib: function() {
				if(scope.ui.ventilation.jetfan.lib=='closed') {
					scope.ui.ventilation.jetfan.lib='open';
				} else {
					scope.ui.ventilation.jetfan.lib='closed';
				}
			},
			toggleLouver:function() {
				scope.louver=!scope.louver;
			},
			activate: function($index) {
				lists.jetfanList.activate($index);
			},
			newItem:function() {
				lists.jetfanList.newItem();
			},
			remove:function($index) {
				var delJetfan=lists.jetfanList.getItem($index);
				var res=Websocket.syncDeleteItem(delJetfan);	
				if(res.status='success') {
					lists.jetfanList.remove($index);
				}
			},
			increaseRange:function() {
				lists.jetfanList.increaseRange();
			},
			decreaseRange:function() {
				lists.jetfanList.decreaseRange()
			},
			addNewRamp:function(jetfan) {
				var tempRamp=new Ramp({'type':'vent', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.ramps.ramps);
				scope.ramps.ramps.push(tempRamp);
				var jetfan_id = jetfan.id;
				var jetfan_index=lodash.findIndex(scope.ventilation.jetfans,function(jet) {
					return jet.id==jetfan_id;
				})
				scope.ventilation.jetfans[jetfan_index].ramp=tempRamp;
			},
			addRampStep:function() {
				scope.jetfan.ramp.addStep(0,0);
			},
			removeRampStep:function(index) {
				scope.jetfan.ramp.removeStep(index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.jetfan, attribute+'.help', '');
					if(help) {
						scope.help.jetfan=help;
					}
				} else {
					scope.help.jetfan='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalWiz.jetfan, attribute+'.help', '');
					if(help) {
						scope.help.jetfan=help;
					}
				} else {
					scope.help.jetfan='';
				}
			}
		}//}}}
		// LIBRARY FUNCTIONS//{{{
		scope.functions.libJetfan={
			activate: function($index) {
				lists.libJetfanList.activateLib($index);

			},
			newItem:function() {
				lists.libJetfanList.newItemLib();
			},
			importFromLib:function($index) {
				/*
				// znajdz najpierw czy ma jakies rampy ustawione
				if(scope.lib.matls[scope.ui.geometry.libJetfan.begin+$index].conductivity_ramp.id != ''){
					scope.ramps.ramps.push(new Ramp(scope.lib.matls[scope.ui.geometry.libJetfan.begin+$index].conductivity_ramp));
				}
				scope.geometry.matls.push(new Jetfan(scope.lib.matls[scope.ui.geometry.libJetfan.begin+$index]));	
				*/
			},
			addNewRamp:function(jetfan) {
				var tempRamp=new Ramp({'type':'vent', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.lib.ramps);
				scope.lib.ramps.push(tempRamp);
				var jetfan_id = jetfan.id;
				var jetfan_index=lodash.findIndex(scope.lib.jetfans,function(jet) {
					return jet.id==jetfan_id;
				})
				scope.lib.jetfans[jetfan_index].ramp=tempRamp;
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.ventilation.libJetfan.begin;
				var base=scope.lib.importers.jetfan_import(scope.lib.jetfans[updatedIndex], scope.ventilation.jetfans, scope.ramps.ramps, scope.lib.ramps);
				lists.jetfanList.importItem(base);	
			},

			remove:function($index) {
				lists.libJetfanList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.geometry.libJetfan.begin;	
				scope.info.ramp_id=scope.lib.jetfans[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.jetfan_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libjetfan-prompt");
				} else {
					scope.libremovers.jetfan_remove(scope.info.updatedIndex);
					lists.libJetfanList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.jetfan_remove(scope.info.updatedIndex);
					lists.libJetfanList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.libJetfanList.increaseRange();
			},
			decreaseRange:function() {
				lists.libJetfanList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.jetfan, attribute+'.help', '');
					if(help) {
						scope.help.jetfan=help;
					}
				} else {
					scope.help.jetfan='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.jetfan, attribute+'.help', '');
					if(help) {
						scope.help.jetfan=help;
					}
				} else {
					scope.help.jetfan='';
				}
			}


			
				
		}
		///}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-jetfan-ventilation',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
