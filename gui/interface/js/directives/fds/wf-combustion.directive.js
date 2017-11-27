angular.module('wf-combustion.directive', ['wf-globals.service', 'wf-fds-object.service', 'wf-dialog.service', 'wf-websocket.service'])
.directive('wfCombustion', function(  Globals, GlobalValues, $rootScope, Fds,Fire, Fuel, SurfFire, FireVent, Ramp, lodash, $timeout, List, DialogManager ) {

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.fires=$rootScope.main.currentScenario.fds_object.fires;

		scope.species=$rootScope.main.currentScenario.fds_object.species.species;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				scope.ui.fires[data.name].scrollPosition=data.position;
			}
		})
	//}}}
		//ENUMS//{{{
		scope.enums={
			radcals:GlobalValues.values.enums.radcals
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			fuel:{
				index:0,
				changedIndex:false
			},
			libFuel:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentFuelList={
			value:scope.fires.fuels,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			fuelList:new List(scope, 'fuel', scope.fires.fuels, scope.currentFuelList, scope.ui.fires.fuel, scope.indexes.fuel, scope.listRange, Fuel, 'fuel','file', scope.lib.fuels, scope.ui.fires.libFuel),
			libFuelList:new List(scope, 'fuel', scope.lib.fuels, scope.currentFuelList , scope.ui.fires.libFuel, {index:0}, scope.listRange, Fuel, 'fuel', 'lib'),
		}	
//}}}
		//INIT EDIT WINDOW//{{{
		//lists.fuelList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			fuel:'',
			combustion:'',
			radiation:''
		}
	//}}}
	
		//FUNCTIONS//{{{
		scope.functions={};

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
//}}}
		//LIB FUNCTIONS//{{{
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
//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-combustion',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
