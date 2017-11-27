angular.module('wf-species.directive', [ 'wf-globals.service', 'ngLodash', 'wf-fds-object.service','wf-list.service', 'wf-dialog.service'])
.directive('wfSpecies', function(Globals, GlobalValues, $rootScope, Specie, lodash, $timeout, List, DialogManager ) {
	

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.species=$rootScope.main.currentScenario.fds_object.species;

		scope.removers=$rootScope.main.currentScenario.fds_object.removers;

		scope.libremovers=$rootScope.main.lib.removers;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				scope.ui.species[data.name].scrollPosition=data.position;
			}
		})
	//}}}
		//ENUMS//{{{
		scope.enums={

		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			specie:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentSpecieList={
			value:scope.species.species,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			specieList:new List(scope, 'specie', scope.species.species, scope.currentSpecieList, scope.ui.species.specie, scope.indexes.specie, scope.listRange, Specie, 'spec','file', scope.lib.species, scope.ui.species.libSpecie),
			libSpecieList:new List(scope, 'specie', scope.lib.species, scope.currentSpecieList , scope.ui.species.libSpecie, {index:0}, scope.listRange, Specie, 'spec', 'lib')
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.specieList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			specie:'',
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
	
		scope.functions.specie={
			switch_lib: function() {
				if(scope.ui.species.specie.lib=='closed') {
					scope.ui.species.specie.lib='open';
				} else {
					scope.ui.species.specie.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.species.specie.help=='closed') {
					scope.ui.species.specie.help='open';
				} else {
					scope.ui.species.specie.help='closed';
				}
		
			},

			activate: function($index) {
				lists.specieList.activate($index);
			},
			newItem:function() {
				lists.specieList.newItem();

			},
			remove:function($index) {
				lists.specieList.remove($index);
			},
			removePrompt:function($index) {
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.species.specie.begin;	
				scope.info.spec_id=scope.species.species[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.spec_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-spec-prompt");
				} else {

					scope.removers.spec_remove(scope.info.updatedIndex);
					lists.specieList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.removers.spec_remove(scope.info.updatedIndex);
					lists.specieList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			increaseRange:function() {
				lists.specieList.increaseRange();
			},
			decreaseRange:function() {
				lists.specieList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.specie, attribute+'.help', '');
					if(help) {
						scope.help.specie=help;
					}
				} else {
					scope.help.specie='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.specie, attribute+'.help', '');
					if(help) {
						scope.help.specie=help;
					}
				} else {
					scope.help.specie='';
				}
			}

		}
//}}}
		//LIBRARY FUNCTIONS//{{{
		scope.functions.libSpecie={
			activate: function($index) {
				lists.libSpecieList.activateLib($index);
			},
			newItem:function() {
				lists.libSpecieList.newItemLib();

			},
			remove:function($index) {
				lists.libSpecieList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.species.libSpecie.begin;	
				scope.info.ramp_id=scope.lib.species[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.spec_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libspec-prompt");
				} else {
					scope.libremovers.spec_remove(scope.info.updatedIndex);
					lists.libSpecieList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.spec_remove(scope.info.updatedIndex);
					lists.libSpecieList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},
			increaseRange:function() {
				lists.libSpecieList.increaseRange();
			},
			decreaseRange:function() {
				lists.libSpecieList.decreaseRange()
			},

			importItem:function(index) {
				var updatedIndex=index+scope.ui.species.libSpecie.begin;
				var base=scope.lib.importers.spec_import(scope.lib.species[updatedIndex], scope.species.species);
				lists.specieList.importItem(base);	
			},

			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.specie, attribute+'.help', '');
					if(help) {
						scope.help.specie=help;
					}
				} else {
					scope.help.specie='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.specie, attribute+'.help', '');
					if(help) {
						scope.help.specie=help;
					}
				} else {
					scope.help.specie='';
				}
			}

		}
//}}}

	}

	function controller($scope, $element) {


	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-species',
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

