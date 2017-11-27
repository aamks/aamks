angular.module('wf-particles.directive', [ 'wf-globals.service', 'ngLodash','wf-fds-object.service', 'wf-list.service', 'wf-dialog.service'] )
.directive('wfParticles', function(  Globals, GlobalValues, $rootScope, Part, lodash, $timeout, List, DialogManager ) {
	

	function link(scope, element, attrs) {

		//GLOBALS	
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.parts=$rootScope.main.currentScenario.fds_object.parts;

		scope.lib=$rootScope.main.lib;
		
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		
		scope.libremovers=$rootScope.main.lib.removers;
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
		//SCROLL
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.parts[data.name].scrollPosition=data.position;
			}
		})
	
		//ENUMS

		scope.enums={
		}
		
		// INDEXES
		scope.indexes={
			part:{
				index:0,
				changedIndex:false
			}
		
		}

		//CURRENT LISTS
		scope.currentPartList={
			value:scope.parts.parts,	
			type:'file'
		};

		//LIST FUNCTIONS
		var lists={
			partList:new List(scope, 'part', scope.parts.parts, scope.currentPartList, scope.ui.parts.part, scope.indexes.part, scope.listRange, Part, 'part','file', scope.lib.parts, scope.ui.parts.libPart),
			libPartList:new List(scope, 'part', scope.lib.parts, scope.currentPartList , scope.ui.parts.libPart, {index:0}, scope.listRange, Part, 'part', 'lib')
		}
		//INIT EDIT WINDOW
		lists.partList.initElement();


		//HELP
		scope.help={
			part:'',
		}
	
	
		//FUNCTIONS
		scope.functions={
			part:{},
			lib:{
				part:{}
			}

		};
	
		scope.functions.part={
			switch_lib: function() {
				if(scope.ui.parts.part.lib=='closed') {
					scope.ui.parts.part.lib='open';
				} else {
					scope.ui.parts.part.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.parts.part.help=='closed') {
					scope.ui.parts.part.help='open';
				} else {
					scope.ui.parts.part.help='closed';
				}
		
			},

			activate: function($index) {
				lists.partList.activate($index);
			},
			newItem:function() {
				lists.partList.newItem();

			},
			remove:function($index) {
				lists.partList.remove($index);
			},
			removePrompt:function($index) {
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.parts.part.begin;	
				scope.info.part_id=scope.parts.parts[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.part_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-part-prompt");
				} else {

					scope.removers.part_remove(scope.info.updatedIndex);
					lists.partList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.removers.part_remove(scope.info.updatedIndex);
					lists.partList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			increaseRange:function() {
				lists.partList.increaseRange();
			},
			decreaseRange:function() {
				lists.partList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.part, attribute+'.help', '');
					if(help) {
						scope.help.part=help;
					}
				} else {
					scope.help.part='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.part, attribute+'.help', '');
					if(help) {
						scope.help.part=help;
					}
				} else {
					scope.help.part='';
				}
			}

		}

		scope.functions.libPart={
			activate: function($index) {
				lists.libPartList.activateLib($index);
			},
			newItem:function() {
				lists.libPartList.newItemLib();

			},
			remove:function($index) {
				lists.libPartList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.parts.libPart.begin;	
				scope.info.ramp_id=scope.lib.parts[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.part_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libpart-prompt");
				} else {
					scope.libremovers.part_remove(scope.info.updatedIndex);
					lists.libPartList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.part_remove(scope.info.updatedIndex);
					lists.libPartList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			increaseRange:function() {
				lists.libPartList.increaseRange();
			},
			decreaseRange:function() {
				lists.libPartList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.part, attribute+'.help', '');
					if(help) {
						scope.help.part=help;
					}
				} else {
					scope.help.part='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.part, attribute+'.help', '');
					if(help) {
						scope.help.part=help;
					}
				} else {
					scope.help.part='';
				}
			}

		}

		scope.$watch('ui.parts.tab', function(newValue, oldValue) {
			
			switch(newValue) {
				case 0:
					$timeout(function() {
						scope.$broadcast('scrollPos', {name:'part', position:scope.ui.parts.part.scrollPosition});
						scope.$broadcast('scrollPos', {name:'libPart', position:scope.ui.parts.libPart.scrollPosition});
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
		templateUrl: Globals.partialsUrl+'/fds/wf-particles',
		link : link,
		controller : controller,
		scope : {}
	}



})

