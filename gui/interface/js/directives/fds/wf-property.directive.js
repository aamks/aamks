angular.module('wf-property.directive', ['wf-globals.service', 'wf-http.service', 'wf-fds-object.service'])
.directive('wfProperty', function( Globals, GlobalValues, $rootScope, Fds, Prop, DeepDiff, lodash, Calc, IdGenerator, $timeout, SafeApply, List) {
	

	function link(scope, element, attrs) {
		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.output=$rootScope.main.currentScenario.fds_object.output;

		scope.rampFunctions=$rootScope.main.currentScenario.fds_object.rampFunctions;
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
			propQuantities:GlobalValues.values.enums.propQuantity,
			propFlowType:GlobalValues.values.enums.propFlowType,
			propSprayPattern:GlobalValues.values.enums.propSprayPattern,

			smokeDetectorModel:GlobalValues.values.enums.smokeDetectorModel,
			clearyParams:GlobalValues.values.fds_object_enums.cleary_options,
			propSmokeviewId:GlobalValues.values.enums.propSmokeviewId
		}
//}}}
		// INDEXES//{{{
		scope.indexes={
			prop:{
				index:0,
				changedIndex:false
			}		
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentPropList={
			value:scope.output.props,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var propList=new List(scope, 'prop', scope.output.props, scope.currentPropList, scope.ui.output.prop, scope.indexes.prop, scope.listRange, Prop, 'prop','file', scope.lib.props, scope.ui.output.libProp);
		var libPropList=new List(scope, 'prop', scope.lib.props, scope.currentPropList , scope.ui.output.libProp, {index:0}, scope.listRange, Prop, 'prop', 'lib');
//}}}
		//INIT EDIT WINDOW//{{{
		propList.initElement();
		//}}}
		//HELP//{{{
		scope.help={
			prop:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
			

		scope.functions.prop={
			switch_lib: function() {
				if(scope.ui.output.prop.lib=='closed') {
					scope.ui.output.prop.lib='open';
				} else {
					scope.ui.output.prop.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.output.prop.help=='closed') {
					scope.ui.output.prop.help='open';
				} else {
					scope.ui.output.prop.help='closed';
				}
		
			},
			activate: function($index) {
				propList.activate($index);
			},
			newItem:function() {
				propList.newItem();

			},
			remove:function($index) {
				propList.remove($index);
			},
			increaseRange:function() {
				propList.increaseRange();
			},
			decreaseRange:function() {
				propList.decreaseRange()
			},
			addAngle:function() {
				scope.prop.addAngle(0,0);
			},
			removeAngle:function($index) {
				scope.prop.removeAngle($index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.prop, attribute+'.help', '');
					if(help) {
						scope.help.prop=help;
					}
				} else {
					scope.help.prop='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.prop, attribute+'.help', '');
					if(help) {
						scope.help.prop=help;
					}
				} else {
					scope.help.prop='';
				}
			}

		}
//}}}
		//LIBRARY FUNCTIONS//{{{
		scope.functions.libProp={
			activate: function($index) {
				libPropList.activateLib($index);
			},
			newItem:function() {
				libPropList.newItemLib();

			},
			remove:function($index) {
				libPropList.remove($index);
			},
			increaseRange:function() {
				libPropList.increaseRange();
			},
			decreaseRange:function() {
				libPropList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers, attribute+'.help', '');
					if(help) {
						scope.help.prop=help;
					}
				} else {
					scope.help.prop='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.prop, attribute+'.help', '');
					if(help) {
						scope.help.prop=help;
					}
				} else {
					scope.help.prop='';
				}
			}

		}
//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-property',
		link : link,
		controller : controller,
		scope : {}
	}



})
.filter('propType', function(lodash) {
	return function(arr, type) {
		var res=lodash.filter(arr, function(elem) {return elem.quantity==type})
		return res;
	}
})

	
