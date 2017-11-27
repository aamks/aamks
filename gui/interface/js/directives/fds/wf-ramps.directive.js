angular.module('wf-ramps.directive', [ 'wf-globals.service', 'ngLodash', 'wf-fds-object.service','wf-list.service', 'wf-dialog.service'])
.directive('wfRamps', function( Globals, GlobalValues, $rootScope, Ramp, lodash, $timeout, List, DialogManager ) {
	

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;
		scope.info={};
		scope.lib=$rootScope.main.lib;
	
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		scope.libremovers=$rootScope.main.lib.removers;
		scope.libimporterss=$rootScope.main.lib.importers;

		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.ramps[data.name].scrollPosition=data.position;
			}
		})
	//}}}
		//ENUMS//{{{
		scope.enums={
			rampType:GlobalValues.values.enums.rampType
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			ramp:{
				index:0,
				changedIndex:false
			}
		
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentRampList={
			value:scope.ramps.ramps,
			type: "file"
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			rampList:new List(scope, 'ramp', scope.ramps.ramps, scope.currentRampList, scope.ui.ramps.ramp, scope.indexes.ramp, scope.listRange, Ramp, 'ramp', 'file' ,scope.lib.ramps, scope.ui.ramps.libRamp),
			libRampList:new List(scope, 'ramp', scope.lib.ramps,scope.currentRampList , scope.ui.ramps.libRamp, {index:0}, scope.listRange, Ramp, 'ramp', 'lib')
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.rampList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			ramp:'',
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={
			ramp:{},
			lib:{
				ramp:{}
			}

		};
	
		scope.functions.ramp={
			switch_lib: function() {
				if(scope.ui.ramps.ramp.lib=='closed') {
					scope.ui.ramps.ramp.lib='open';
				} else {
					scope.ui.ramps.ramp.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.ramps.ramp.help=='closed') {
					scope.ui.ramps.ramp.help='open';
				} else {
					scope.ui.ramps.ramp.help='closed';
				}
		
			},
			activate: function($index) {
				lists.rampList.activate($index);
			},
			newItem:function() {
				lists.rampList.newItem();

			},
			exportItemPrompt:function($index) {
				lists.rampList.exportItem($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.ramps.ramp.begin;	
				scope.info.ramp_id=scope.ramps.ramps[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.ramp_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-ramp-prompt");
				} else {
					scope.removers.ramp_remove(scope.info.updatedIndex);
					lists.rampList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.removers.ramp_remove(scope.info.updatedIndex);
					lists.rampList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			increaseRange:function() {
				lists.rampList.increaseRange();
			},
			decreaseRange:function() {
				lists.rampList.decreaseRange()
			},
			addStep:function() {
				scope.ramp.addStep(0,0);
			},
			removeStep:function($index) {
				scope.ramp.removeStep($index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.ramp, attribute+'.help', '');
					if(help) {
						scope.help.ramp=help;
					}
				} else {
					scope.help.ramp='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.ramp, attribute+'.help', '');
					if(help) {
						scope.help.ramp=help;
					}
				} else {
					scope.help.ramp='';
				}
			}

		}
//}}}
		//LIBRARY FUNCTIONS//{{{
		scope.functions.libRamp={
			activate: function($index) {
				lists.libRampList.activateLib($index);
			},
			newItem:function() {
				lists.libRampList.newItemLib();

			},
			remove:function($index) {
				lists.libRampList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.ramps.libRamp.begin;	
				scope.info.ramp_id=scope.lib.ramps[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.ramp_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libramp-prompt");
				} else {
					scope.libremovers.ramp_remove(scope.info.updatedIndex);
					lists.libRampList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.ramp_remove(scope.info.updatedIndex);
					lists.libRampList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.ramps.libRamp.begin;
				var base=scope.lib.importers.ramp_import(scope.lib.ramps[updatedIndex], scope.ramps.ramps);
				lists.rampList.importItem(base);	
			},
			increaseRange:function() {
				lists.libRampList.increaseRange();
			},
			decreaseRange:function() {
				lists.libRampList.decreaseRange()
			},
			addStep:function() {
				scope.ramp.addStep(0,0);
			},
			removeStep:function($index) {
				scope.ramp.removeStep($index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.ramp, attribute+'.help', '');
					if(help) {
						scope.help.ramp=help;
					}
				} else {
					scope.help.ramp='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.ramp, attribute+'.help', '');
					if(help) {
						scope.help.ramp=help;
					}
				} else {
					scope.help.ramp='';
				}
			}

		}
///}}}

	}

	function controller($scope, $element) {


	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-ramps',
		link : link,
		controller : controller,
		scope : {}
	}



})
