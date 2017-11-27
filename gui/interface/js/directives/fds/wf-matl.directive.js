angular.module('wf-matl.directive', ['wf-globals.service', 'ngLodash', 'wf-list.service', 'wf-dialog.service','wf-fds-object.service','wf-id-generator.service'])
.directive('wfMatl', function(Globals, GlobalValues, $rootScope, Matl, Ramp, lodash, $timeout, List, DialogManager, IdGenerator) {
	

	function link(scope, element, attrs) {
	
		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.geometry=$rootScope.main.currentScenario.fds_object.geometry;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		
		scope.libremovers=$rootScope.main.lib.removers;
		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;

		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.geometry[data.name].scrollPosition=data.position;
			}
		})
//}}}
		//ENUMS//{{{
		scope.enums={
			colors:GlobalValues.values.enums.colors,
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			matl:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentMatlList={
			value:scope.geometry.matls,
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			matlList:new List(scope, 'matl', scope.geometry.matls, scope.currentMatlList, scope.ui.geometry.matl, scope.indexes.matl, scope.listRange, Matl, 'matl','file', scope.lib.matls, scope.ui.geometry.libMatl),
			libMatlList:new List(scope, 'matl', scope.lib.matls,scope.currentMatlList , scope.ui.geometry.libMatl, {index:0}, scope.listRange, Matl, 'matl', 'lib'),
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.matlList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			matl:`The MATL namelist group is used to deﬁne the properties of the materials that make up boundary solid 
				surfaces. A solid boundary can consist of multiple layers of different materials, and each layer can consist
				of multiple material components.`,
		}
//}}}
//FUNCTIONS//{{{
		scope.functions={};

		scope.selected = 0;
				
		scope.functions.matl={
			switch_lib: function() {
				if(scope.ui.geometry.matl.lib=='closed') {
					scope.ui.geometry.matl.lib='open';
				} else {
					scope.ui.geometry.matl.lib='closed';
				}
			},
			switch_help: function() {
				if(scope.ui.geometry.matl.help=='closed') {
					scope.ui.geometry.matl.help='open';
				} else {
					scope.ui.geometry.matl.help='closed';
				}
		
			},

			activate: function($index) {
				lists.matlList.activate($index);
				scope.selected = $index;
			},
			newItem:function() {
				lists.matlList.newItem();
			},
			exportToLib: function($index) {
				lists.matlList.exportToLib($index);
			},
			removePrompt:function($index) {
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.geometry.matl.begin;	
				scope.info.matl_id=scope.geometry.matls[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.matl_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-matl-prompt");
				} else {
					scope.removers.matl_remove(scope.info.updatedIndex);
					lists.matlList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.removers.matl_remove(scope.info.updatedIndex);
					lists.matlList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.matlList.increaseRange();
			},
			decreaseRange:function() {
				lists.matlList.decreaseRange()
			},
			addNewRamp:function(matl,type) {
				var tempRamp=new Ramp({'type':'matl', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.ramps.ramps);
				scope.ramps.ramps.push(tempRamp);
				var matl_id = matl.id;
				var matl_index=lodash.findIndex(scope.geometry.matls,function(material) {
					return material.id==matl_id;
				})
				if(type=='cond'){
					scope.geometry.matls[matl_index].conductivity_ramp=tempRamp;
				} else if(type=='spec') {
					scope.geometry.matls[matl_index].specific_heat_ramp=tempRamp;
				}
			},
			addConductivityStep:function() {
				scope.matl.conductivity_ramp.addStep(0,0);
			},
			removeConductivityStep:function(index) {
				scope.matl.conductivity_ramp.removeStep(index);
			},
			addSpecificHeatStep:function() {
				scope.matl.specific_heat_ramp.addStep(0,0);
			},
			removeSpecificHeatStep:function(index) {
				scope.matl.specific_heat_ramp.removeStep(index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.matl, attribute+'.help', '');
					if(help) {
						scope.help.matl=help;
					}
				} else {
					scope.help.matl='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.matl, attribute+'.help', '');
					if(help) {
						scope.help.matl=help;
					}
				} else {
					scope.help.matl='';
				}
			}
		}
//}}}
		// LIBRARY FUNCTIONS//{{{
		scope.functions.libMatl={
			activate: function($index) {
				lists.libMatlList.activateLib($index);

			},
			newItem:function() {
				lists.libMatlList.newItemLib();
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
			remove:function($index) {
				lists.libMatlList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.geometry.libMatl.begin;	
				scope.info.ramp_id=scope.lib.matls[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.matl_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libmatl-prompt");
				} else {
					scope.libremovers.matl_remove(scope.info.updatedIndex);
					lists.libMatlList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.matl_remove(scope.info.updatedIndex);
					lists.libMatlList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.geometry.libMatl.begin;
				var base=scope.lib.importers.matl_import(scope.lib.matls[updatedIndex], scope.geometry.matls, scope.ramps.ramps, scope.lib.ramps);
				lists.matlList.importItem(base);	
			},

			increaseRange:function() {
				lists.libMatlList.increaseRange();
			},
			decreaseRange:function() {
				lists.libMatlList.decreaseRange()
			},
			addNewRamp:function(matl,type) {
				var tempRamp=new Ramp({'type':'matl', 'steps':[{'t':0,'f':0},{'t':1,'f':1}]});
				tempRamp.id=IdGenerator.genId('ramp', scope.lib.ramps);
				scope.lib.ramps.push(tempRamp);
				var matl_id = matl.id;
				var matl_index=lodash.findIndex(scope.lib.matls,function(material) {
					return material.id==matl_id;
				})
				if(type=='cond'){
					scope.lib.matls[matl_index].conductivity_ramp=tempRamp;
				} else if(type=='spec') {
					scope.lib.matls[matl_index].specific_heat_ramp=tempRamp;
				}
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.matl, attribute+'.help', '');
					if(help) {
						scope.help.matl=help;
					}
				} else {
					scope.help.matl='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.matl, attribute+'.help', '');
					if(help) {
						scope.help.matl=help;
					}
				} else {
					scope.help.matl='';
				}
			}


			
				
		}
		///}}}

	}

	function controller($scope, $element) {


	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-matl',
		link : link,
		controller : controller,
		scope : {}
	}



})
.filter('slice', function() {
	return function(arr, start, end) {
		return (arr || []).slice(start, end);
	};
})
.filter('rampType', function(lodash) {
	return function(arr, type) {
		var res=lodash.filter(arr, function(elem) {return elem.type==type})
		return res;
	}
})
