angular.module('wf-boundary.directive', ['wf-globals.service', 'wf-fds-object.service'])
.directive('wfBoundary', function( Globals, GlobalValues, HttpManager, $rootScope, Fds, Bndf, Specie, Part, lodash, Calc, IdGenerator, $timeout, List) {

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
//}}}
		//ENUMS//{{{
		scope.enums={
			directions:GlobalValues.values.enums.directions,

		}
//}}}
		// INDEXES//{{{
		scope.indexes={
			bndf:{
				index:0,
				changedIndex:false
			}		
		}
//}}}
		//CURRENT LISTS
		//LIST FUNCTIONS
		//INIT EDIT WINDOW
		//HELP//{{{
		scope.help={
			bndf:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};

		scope.functions.bndf={
			addSpec: function(index) {
				scope.output.bndfs[index].addSpec();				
			},
			removeSpec:function(parent, index) {

			},
			addPart: function(index) {
				scope.output.bndfs[index].addPart();				
			},
			removePart:function(parent, index) {

				scope.output.bndfs[parent].removePart(index);				
			},
			listIndex:function(index, parent) {
				var count=0;
				if(parent) {
					var subIndex=index;
					index=parent;
				}
				for(var i=0;i<=index;i++) {
					if(scope.output.bndfs[i].marked==true) {
						if(scope.output.bndfs[i].specs) {
							if(i<index) {
								count+=scope.output.bndfs[i].specs.length;
							}
						} else {
							if(scope.output.bndfs[i].parts) {
								if(i<index) {
									count+=scope.output.bndfs[i].parts.length;
								}
							} else {
								count++;
							}

						}

					}
				}

				if(parent) {
					count+=subIndex+1;
				}

				return count;
			},
			checked:function(index){
				if(scope.output.bndfs[index].marked==true) {
					scope.functions.bndf.quantities.push(scope.output.bndfs[index]);
				}
				else {
					lodash.remove(scope.functions.bndf.quantities,scope.output.bndfs[index]);
				}
			},
			quantities: [],
			marked:function(quantities){
				lodash.forEach(scope.output.bndfs, function(bndf){
					bndf.marked = false;
				});
				lodash.forEach(quantities, function(quantity){
					quantity.marked = true;
				});
			}
		}


		// Zaladuj wartosci do ng-model multiselecta
		lodash.forEach(scope.output.bndfs, function(bndf){
			if(bndf.marked == true){
				scope.functions.bndf.quantities.push(bndf);
			}
		});
//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-boundary',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
