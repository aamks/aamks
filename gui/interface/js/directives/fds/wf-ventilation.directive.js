angular.module('wf-ventilation.directive', ['wf-globals.service', 'wf-http.service', 'wf-fds-object.service', 'wf-globals.service', 'wf-deep-diff.service', 'ngLodash', 'wf-dialog.service', 'wf-websocket.service'])
.directive('wfVentilation', function( Globals, GlobalValues, HttpManager, $rootScope, Fds, Vent, SurfVent, ObstVent, Ramp , DeepDiff, lodash, Calc, IdGenerator, $timeout, SafeApply, List, DialogManager, Websocket) {
	

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.ventilation=$rootScope.main.currentScenario.fds_object.ventilation;

		scope.rampFunctions=$rootScope.main.currentScenario.fds_object.rampFunctions;
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

				scope.ui.ventilation[data.name].scrollPosition=data.position;
			}
		})
	//}}}
		//ENUMS//{{{

		scope.enums={

			surfFlowType:GlobalValues.values.enums.surfVentFlowType
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
			value:scope.ventilation.surfs,	
			type:'file'
		};
		scope.currentVentList={
			value:scope.ventilation.vents,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			ventList:new List(scope, 'vent', scope.ventilation.vents, scope.currentVentList, scope.ui.ventilation.vent, scope.indexes.vent, scope.listRange, Vent, 'vent', 'file'),
			surfList:new List(scope, 'surf', scope.ventilation.surfs, scope.currentSurfList, scope.ui.ventilation.surf, scope.indexes.surf, scope.listRange, SurfVent, 'surf','file', scope.lib.ventsurfs, scope.ui.ventilation.libSurf),
			libSurfList:new List(scope, 'surf', scope.lib.ventsurfs, scope.currentSurfList , scope.ui.ventilation.libSurf, {index:0}, scope.listRange, SurfVent, 'surf', 'lib')
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.surfList.initElement();
		lists.ventList.initElement();
//}}}
		//LOUVER, HEATER//{{{
		scope.louver=false;
		scope.heater=false;
//}}}
		//HELP//{{{
		scope.help={
			vent:'',
		}
	//}}}
		//FUNCTIONS VENT//{{{
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
		//FUNCTIONS VENT//{{{
		scope.functions.surf={
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
				scope.info.updatedIndex=$index+scope.ui.ventilation.surf.begin;	
				scope.info.surf_id=scope.ventilation.surfs[scope.info.updatedIndex].id;
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
		//FUNCTIONS VENT LIB//{{{
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

		scope.$watch('ui.ventilation.tab', function(newValue, oldValue) {
			
			switch(newValue) {
				case 0:
					$timeout(function() {
						scope.$broadcast('scrollPos', {name:'vent', position:scope.ui.ventilation.vent.scrollPosition});
						scope.$broadcast('scrollPos', {name:'surf', position:scope.ui.ventilation.surf.scrollPosition});
						scope.$broadcast('scrollPos', {name:'libSurf', position:scope.ui.ventilation.libSurf.scrollPosition});
					}, 0);
					break;
				case 1:
					$timeout(function() {
					}, 0);
					break;
			
				default :
					break;

			}		
		}, true);

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-ventilation',
		link : link,
		controller : controller,
		scope : {}
	}



})


angular.module('wf-ventilation.directive', ['ui.router', 'wf-globals.service'])
.directive('wfVentilation', function($state, $stateParams, Globals) {
	

	function link(scope, element, attrs) {

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-ventilation',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
