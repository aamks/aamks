angular.module('wf-isosurface.directive', ['wf-globals.service', 'wf-fds-object.service'])
.directive('wfIsosurface', function( Globals, GlobalValues, $rootScope, Fds, Part, Specie, Isof, lodash, Calc, IdGenerator, $timeout, List) {
	

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

		}
//}}}
		// INDEXES//{{{
		scope.indexes={
			isof:{
				index:0,
				changedIndex:false
			}		
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentIsofList={
			value:scope.output.isofs,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var isofList=new List(scope, 'isof', scope.output.isofs, scope.currentIsofList, scope.ui.output.isof, scope.indexes.isof, scope.listRange, Isof, 'isof', 'file');
//}}}
		//INIT EDIT WINDOW//{{{
		isofList.initElement();
		//}}}
		//HELP//{{{
		scope.help={
			isof:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
	
		scope.functions.isof={
			activate: function($index) {
				isofList.activate($index);
			},
			newItem:function() {
				isofList.newItem();
			},
			remove:function($index) {
				isofList.remove($index);
			},
			increaseRange:function() {
				isofList.increaseRange();
			},
			decreaseRange:function() {
				isofList.decreaseRange()
			},
			addValue:function() {
				scope.isof.addValue();
			},
			removeFunction:function(index) {
				scope.isof.removeValue(index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.isof, attribute+'.help', '');
					if(help) {
						scope.help.isof=help;
					}
				} else {
					scope.help.isof='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.isof, attribute+'.help', '');
					if(help) {
						scope.help.isof=help;
					}
				} else {
					scope.help.isof='';
				}
			}

		}
//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-isosurface',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
