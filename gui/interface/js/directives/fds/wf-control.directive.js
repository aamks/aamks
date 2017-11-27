angular.module('wf-control.directive', ['wf-globals.service', 'wf-http.service', 'wf-fds-object.service'])
.directive('wfControl', function( Globals, GlobalValues, $rootScope, Fds, Ctrl, lodash, Calc, IdGenerator, $timeout, List) {

	function link(scope, element, attrs) {

		//GLOBALS	
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.output=$rootScope.main.currentScenario.fds_object.output;

		scope.rampFunctions=$rootScope.main.currentScenario.fds_object.rampFunctions;
		scope.species=$rootScope.main.currentScenario.fds_object.species;
		scope.parts=$rootScope.main.currentScenario.fds_object.parts;
		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
		//SCROLL
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.output[data.name].scrollPosition=data.position;
			}
		})
	
		//ENUMS

		scope.enums={
			directions:GlobalValues.values.enums.directions,
			ctrlFunctions:GlobalValues.values.enums.ctrlFunction,
		}

		// INDEXES
		scope.indexes={
			ctrl:{
				index:0,
				changedIndex:false
			}
		
		}

		//CURRENT LISTS
		scope.currentCtrlList={
			value:scope.output.ctrls,	
			type:'file'
		};

		//LIST FUNCTIONS

		var ctrlList=new List(scope, 'ctrl', scope.output.ctrls, scope.currentCtrlList, scope.ui.output.ctrl, scope.indexes.ctrl, scope.listRange, Ctrl, 'ctrl', 'file');

		//INIT EDIT WINDOW
		ctrlList.initElement();
		
		//HELP
		scope.help={
			ctrl:''
		}
	
	
		//FUNCTIONS
		scope.functions={};
		
		scope.functions.ctrl={
			activate: function($index) {
				ctrlList.activate($index);
			},
			newItem:function() {
				ctrlList.newItem();

			},
			remove:function($index) {
				ctrlList.remove($index);
			},
			increaseRange:function() {
				ctrlList.increaseRange();
			},
			decreaseRange:function() {
				ctrlList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.ctrl, attribute+'.help', '');
					if(help) {
						scope.help.ctrl=help;
					}
				} else {
					scope.help.ctrl='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.ctrl, attribute+'.help', '');
					if(help) {
						scope.help.ctrl=help;
					}
				} else {
					scope.help.ctrl='';
				}
			}

		}


	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-control',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
