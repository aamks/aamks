angular.module('wf-general-dump.directive', ['wf-globals.service', 'wf-http.service', 'wf-fds-object.service'])
.directive('wfGeneralDump', function( Globals, GlobalValues, $rootScope, Fds, Prop, Bndf, Slcf, Isof, Devc, Ctrl, lodash, Calc, IdGenerator, $timeout, List) {
	

	function link(scope, element, attrs) {
		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.output=$rootScope.main.currentScenario.fds_object.output;

		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
		//}}}
		//SCROLL
		//ENUMS//{{{
		scope.enums={
			pl3dQuantities:GlobalValues.values.enums.pl3dQuantity
		}
//}}}
		// INDEXES//{{{
		scope.indexes={
		}
//}}}
		//CURRENT LISTS
		//LIST FUNCTIONS
		//INIT EDIT WINDOW
		//HELP//{{{
		scope.help={
			general:''
		}
	//}}}
		//FUNCTIONS//{{{

		scope.functions={};
		scope.functions.dump={
			//addSpec: function(index) {
			//	scope.output.bndfs[index].addSpec();				
			//},
			//removeSpec:function(parent, index) {

			//},
			//addPart: function(index) {
			//	scope.output.bndfs[index].addPart();				
			//},
			//removePart:function(parent, index) {

			//	scope.output.bndfs[parent].removePart(index);				
			//},
			//listIndex:function(index, parent) {
			//	var count=0;
			//	if(parent) {
			//		var subIndex=index;
			//		index=parent;
			//	}
			//	for(var i=0;i<=index;i++) {
			//		if(scope.output.bndfs[i].marked==true) {
			//			if(scope.output.bndfs[i].specs) {
			//				if(i<index) {
			//					count+=scope.output.bndfs[i].specs.length;
			//				}
			//			} else {
			//				if(scope.output.bndfs[i].parts) {
			//					if(i<index) {
			//						count+=scope.output.bndfs[i].parts.length;
			//					}
			//				} else {
			//					count++;
			//				}

			//			}

			//		}
			//	}

			//	if(parent) {
			//		count+=subIndex+1;
			//	}

			//	return count;
			//},
			//checked:function(index){
			//	if(scope.output.bndfs[index].marked==true) {
			//		scope.functions.bndf.quantities.push(scope.output.bndfs[index]);
			//	}
			//	else {
			//		lodash.remove(scope.functions.bndf.quantities,scope.output.bndfs[index]);
			//	}
			//},

			pl3dQuantities: [],
			pl3dQuantitiesChanged:function(quantities){
				lodash.remove(scope.output.general.plot3d_quantities);
				lodash.forEach(quantities, function(quantity){
					scope.output.general.plot3d_quantities.push(quantity.quantity);
				});
			}
		}
	
		// Zaladuj wartosci do ng-model multiselecta
		lodash.forEach(scope.output.general.plot3d_quantities, function(quantity){
			var pl3dQuantity = lodash.find(scope.enums.pl3dQuantities, function(q) {
				return q.quantity == quantity;
			})
			scope.functions.dump.pl3dQuantities.push(pl3dQuantity);
		});

		//}}}
	
	}

	function controller($scope, $element) {
		$scope.output=$rootScope.main.currentScenario.fds_object.output;

		$scope.functions={};
		$scope.functions.dump={
			pl3dQuantities:lodash.map($scope.output.general.plot3d_quantities, function(q){
				return q;
			})
		};

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-general-dump',
		link : link,
		controller : controller,
		scope : {}
	}



})
