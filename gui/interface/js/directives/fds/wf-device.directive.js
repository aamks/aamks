angular.module('wf-device.directive', ['wf-globals.service', 'wf-fds-object.service'])
.directive('wfDevice', function( Globals, GlobalValues, $rootScope, Fds, Part, Specie, Devc, lodash, Calc, IdGenerator, $timeout, List) {
	

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.output=$rootScope.main.currentScenario.fds_object.output;

		scope.species=$rootScope.main.currentScenario.fds_object.species;
		scope.parts=$rootScope.main.currentScenario.fds_object.parts;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				scope.ui.output[data.name].scrollPosition=data.position;
			}
		})
	//}}}
		//ENUMS//{{{
		scope.enums={
			directions:GlobalValues.values.enums.directions,
			isofQuantities:GlobalValues.values.enums.isofQuantity,
			devcQuantities:GlobalValues.values.enums.devcQuantity,

			devcGeomType:GlobalValues.values.enums.devcGeomType,
			devcType:GlobalValues.values.enums.devcType,
			devcStatistics:GlobalValues.values.enums.devcStatistics,
			devcInitialState:GlobalValues.values.enums.devcInitialState,
			devcLatch:GlobalValues.values.enums.devcLatch,
			devcTripDirection:GlobalValues.values.enums.devcTripDirection,
			devcQuantityType:GlobalValues.values.enums.devcQuantityType,
			smokeDetectorModel:GlobalValues.values.enums.smokeDetectorModel,
			clearyParams:GlobalValues.values.fds_object_enums.cleary_options,
		}
//}}}
		// INDEXES//{{{
		scope.indexes={
			devc:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentDevcList={
			value:scope.output.devcs,	
			type:'file'
		};
	//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			devcList: new List(scope, 'devc', scope.output.devcs, scope.currentDevcList, scope.ui.output.devc, scope.indexes.devc, scope.listRange, Devc, 'devc', 'file'),
			libDevcList: new List(scope, 'devc', scope.lib.devcs, scope.currentDevcList , scope.ui.output.libDevc, {index:0}, scope.listRange, Devc, 'devc', 'lib'),
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.devcList.initElement();
		//}}}
		//HELP//{{{
		scope.help={
			devc:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
		
		scope.functions.devc={
			switch_lib: function() {
				if(scope.ui.output.devc.lib=='closed') {
					scope.ui.output.devc.lib='open';
				} else {
					scope.ui.output.devc.lib='closed';
				}
			},
			switch_help: function() {
				if(scope.ui.output.devc.help=='closed') {
					scope.ui.output.devc.help='open';
				} else {
					scope.ui.output.devc.help='closed';
				}
		
			},
			activate: function($index) {
				lists.devcList.activate($index);
			},
			newItem:function() {
				lists.devcList.newItem();

			},
			remove:function($index) {
				lists.devcList.remove($index);
			},
			increaseRange:function() {
				lists.devcList.increaseRange();
			},
			decreaseRange:function() {
				lists.devcList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.devc, attribute+'.help', '');
					if(help) {
						scope.help.devc=help;
					}
				} else {
					scope.help.devc='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.devc, attribute+'.help', '');
					if(help) {
						scope.help.devc=help;
					}
				} else {
					scope.help.devc='';
				}
			}

		}
//}}}
		// LIBRARY FUNCTIONS//{{{
		scope.functions.libDevc={
			activate: function($index) {
				lists.libDevcList.activateLib($index);

			},
			newItem:function() {
				lists.libDevcList.newItemLib();
			},
			importFromLib:function($index) {
				/*
				// znajdz najpierw czy ma jakies rampy ustawione
				if(scope.lib.matls[scope.ui.geometry.libMatl.begin+$index].conductivity_ramp.id != ''){
					scope.ramps.ramps.push(new Ramp(scope.lib.matls[scope.ui.geometry.libMatl.begin+$index].conductivity_ramp));
				}
				scope.geometry.matls.push(new Matl(scope.lib.matls[scope.ui.geometry.libMatl.begin+$index]));	
				*/
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.output.libDevc.begin;
				var base=scope.lib.importers.devc_import(scope.lib.devcs[updatedIndex], scope.output.devcs);
				lists.devcList.importItem(base);	
			},

			remove:function($index) {
				lists.libDevcList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.output.libDevc.begin;	
				scope.info.ramp_id=scope.lib.devcs[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.devc_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					//DialogManager.displayDialog("remove-libmatl-prompt");
				} else {
					scope.libremovers.devc_remove(scope.info.updatedIndex);
					lists.libDevcList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.devc_remove(scope.info.updatedIndex);
					lists.libDevcList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.libDevcList.increaseRange();
			},
			decreaseRange:function() {
				lists.libDevcList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.devc, attribute+'.help', '');
					if(help) {
						scope.help.devc=help;
					}
				} else {
					scope.help.devc='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.devc, attribute+'.help', '');
					if(help) {
						scope.help.devc=help;
					}
				} else {
					scope.help.devc='';
				}
			}
		}
		///}}}

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-device',
		link : link,
		controller : controller,
		scope : {}
	}

})
.filter('devcType', function(lodash) {
	return function(arr, type) {
		var res=lodash.filter(arr, function(elem) {return elem.type==type})
		return res;
	}
})
.filter('devcQuantityType', function(lodash) {
	return function(arr, type) {
		var res=lodash.filter(arr, function(elem) {return elem.quantity==type})
		return res;
	}
})
