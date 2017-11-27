angular.module('wf-fires.directive', ['wf-globals.service', 'wf-safe-apply.service', 'wf-fds-object.service', 'wf-dialog.service', 'wf-websocket.service', 'wf-id-generator.service'])
.directive('wfFires', function(  Globals, GlobalValues, $rootScope, Fds, Fire, Fuel, SurfFire, FireVent, Ramp, lodash, $timeout, List, DialogManager, SafeApply, IdGenerator ) {
	
	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.fires=$rootScope.main.currentScenario.fds_object.fires;

		scope.species=$rootScope.main.currentScenario.fds_object.species.species;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
		//SCROLL
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.fires[data.name].scrollPosition=data.position;
			}
		})
//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(fire, data) {
			
			if(scope.fire && scope.currentFireList.type=='file') {
				var fire_id=scope.fire.id;
			
				var fire_index=lodash.findIndex(scope.fires.fires,function(fire) {
					return fire.id==fire_id;
				})

				if(fire_index>=0) {
					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(fire_index, Globals.listRange);

					scope.ui.fires.fire.begin=begin_index;
					scope.functions.fire.activate(fire_index);
				} else {

					scope.fire=undefined;
				}
			
			} else {

				scope.fire=undefined;
			}

			lists.fireList=new List(scope, 'fire', scope.fires.fires, null, scope.ui.fires.fire, scope.indexes.fire, scope.listRange, Fire, 'fire', 'file', scope.lib.fires, scope.ui.fires.libFire);
		
			scope.currentFireList={
				value:scope.fires.fires,
				type: "file"
			};

			SafeApply.apply(scope);

		})

		scope.$on('geometry_select', function(fire, data) {
			scope.ui.fires.fire.begin=data.begin;
			scope.functions.fire.activate(data.current);
			SafeApply.apply(scope);
		})
//}}}
		//ENUMS//{{{
		scope.enums={
			timeFunction:GlobalValues.values.enums.timeFunction,
			fireType:GlobalValues.values.enums.fireType,
			hrrType:GlobalValues.values.enums.hrrType,
			radcals:GlobalValues.values.enums.radcals
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			fire:{
				index:0,
				changedIndex:false
			},
			libFire:{
				index:0,
				changedIndex:false
			},
			fuel:{
				index:0,
				changedIndex:false
			},
			libFuel:{
				index:0,
				changedIndex:false
			},
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentFireList={
			value:scope.fires.fires,	
			type:'file'
		};
		scope.currentFuelList={
			value:scope.fires.fuels,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			fireList:new List(scope, 'fire', scope.fires.fires, scope.currentFireList, scope.ui.fires.fire, scope.indexes.fire, scope.listRange, Fire, 'fire','file', scope.lib.fires, scope.ui.fires.libFire),
			libFireList:new List(scope, 'fire', scope.lib.fires, scope.currentFireList , scope.ui.fires.libFire, {index:0}, scope.listRange, Fire, 'fire', 'lib'),
			//fuelList:new List(scope, 'fuel', scope.fires.fuels, scope.currentFuelList, scope.ui.fires.fuel, scope.indexes.fuel, scope.listRange, Fuel, 'fuel','file', scope.lib.fuels, scope.ui.fires.libFuel),
			//libFuelList:new List(scope, 'fuel', scope.lib.fuels, scope.currentFuelList , scope.ui.fires.libFuel, {index:0}, scope.listRange, Fuel, 'fuel', 'lib'),
		}	
//}}}
		//INIT EDIT WINDOW//{{{
		lists.fireList.initElement();
		//lists.fuelList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			fire:'',
			fuel:'',
			combustion:'',
			radiation:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
		
		var sr_points=[];
		var tq_points=[];
		scope.functions.helpers={
			calculate_sr_points:function() {
				var totalTime;

				if(scope.fire.totalTime()=='Infinity') {

					totalTime=100;
					sr_points[0]={t:0, f:0};
					sr_points[1]={t:totalTime, f:0};

				} else {
					totalTime=scope.fire.totalTime();
					sr_points[0]={t:0, f:0};
				   	sr_points[1]={t:totalTime, f:1};
			
				}

				return sr_points;

			},
			calculate_tq_points:function() {
				var totalTime;

				if(scope.fire.totalTime()=='Infinity') {
					totalTime=100;
					tq_points[0]={t:0, f:0};
					tq_points[1]={t:totalTime, f:0};
				} else {
					totalTime=scope.fire.totalTime();
					tq_points[0]={t:0, f:0};
				   	tq_points[1]={t:totalTime, f:1};
				}

				return tq_points;
			}
		}	
		scope.functions.fire={
			switch_lib:function() {
				if(scope.ui.fires.fire.lib=='closed') {
					scope.ui.fires.fire.lib='open';
				} else {
					scope.ui.fires.fire.lib='closed';
				}
			},
			switch_help: function() {
				if(scope.ui.fires.fire.help=='closed') {
					scope.ui.fires.fire.help='open';
				} else {
					scope.ui.fires.fire.help='closed';
				}
			},
			activate: function($index) {
				lists.fireList.activate($index)
			},
			newItem:function() {
				lists.fireList.newItem();
			},
			remove:function($index) {
				lists.fireList.remove($index);
			},
			removePrompt:function($index) {
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.fires.fire.begin;	
				scope.info.fire_id=scope.fires.fires[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.fire_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-fire-prompt");
				} else {

					scope.removers.fire_remove(scope.info.updatedIndex);
					lists.fireList.remove(scope.info.index);
					scope.info={};
				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.removers.fire_remove(scope.info.updatedIndex);
					lists.fireList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.fireList.increaseRange();
			},
			decreaseRange:function() {
				lists.fireList.decreaseRange()
			},
			/// Michal sprawdz tutaj czy tak moze byc
			addNewRamp:function() {
				var tempRamp=new Ramp({'type':'fire', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.ramps.ramps);
				scope.ramps.ramps.push(tempRamp);
				scope.fire.surf.ramp=tempRamp;
			},
			addRampStep:function() {
				scope.fire.surf.ramp.addStep(0,0);
			},
			removeRampStep:function(index) {
				scope.fire.surf.ramp.removeStep(index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers, attribute+'.help', '');
					if(help) {
						scope.help.fire=help;
					}
				} else {
					scope.help.fire='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalWiz.fire, attribute+'.help', '');
					if(help) {
						scope.help.fire=help;
					}
				} else {
					scope.help.fire='';
				}
			}
		}
//}}}
		//LIBRARY FUNCTIONS//{{{
		scope.functions.libFire={
			activate: function($index) {
				lists.libFireList.activateLib($index);
			},
			newItem:function() {
				lists.libFireList.newItemLib();

			},
			remove:function($index) {
				lists.libFireList.remove($index);
			},
			increaseRange:function() {
				lists.libFireList.increaseRange();
			},
			decreaseRange:function() {
				lists.libFireList.decreaseRange()
			},
			addNewRamp:function() {
				var tempRamp=new Ramp({'type':'fire', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.lib.ramps);
				scope.lib.ramps.push(tempRamp);
				scope.fire.surf.ramp=tempRamp;
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.fires.libFire.begin;
				var base=scope.lib.importers.fire_import(scope.lib.fires[updatedIndex], scope.fires.fires, scope.ramps.ramps, scope.lib.ramps);
				lists.fireList.importItem(base);	
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers, attribute+'.help', '');
					if(help) {
						scope.help.fire=help;
					}
				} else {
					scope.help.fire='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.fire, attribute+'.help', '');
					if(help) {
						scope.help.fire=help;
					}
				} else {
					scope.help.fire='';
				}
			}

		}
//}}}

		scope.functions.fuel={
			activate: function($index) {
				lists.fuelList.activate($index);
			},
			newItem:function() {
				lists.fuelList.newItem();

			},
			remove:function($index) {
				lists.fuelList.remove($index);
			},
			increaseRange:function() {
				lists.fuelList.increaseRange();
			},
			decreaseRange:function() {
				lists.fuelList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers, attribute+'.help', '');
					if(help) {
						scope.help.fuel=help;
					}
				} else {
					scope.help.fuel='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.fuel, attribute+'.help', '');
					if(help) {
						scope.help.fuel=help;
					}
				} else {
					scope.help.fuel='';
				}
			}

		}

		scope.functions.libFuel={
			activate: function($index) {
				lists.libFuelList.activateLib($index);
			},
			newItem:function() {
				lists.libFuelList.newItemLib();

			},
			remove:function($index) {
				lists.libFuelList.remove($index);
			},
			increaseRange:function() {
				lists.libFuelList.increaseRange();
			},
			decreaseRange:function() {
				lists.libFuelList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers, attribute+'.help', '');
					if(help) {
						scope.help.fuel=help;
					}
				} else {
					scope.help.fuel='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.fuel, attribute+'.help', '');
					if(help) {
						scope.help.fuel=help;
					}
				} else {
					scope.help.fuel='';
				}
			}
		}
	}

	function controller($scope, $element) {


	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-fires',
		link : link,
		controller : controller,
		scope : {}
	}



})

