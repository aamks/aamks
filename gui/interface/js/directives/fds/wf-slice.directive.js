angular.module('wf-slice.directive', ['wf-globals.service', 'wf-fds-object.service', 'wf-safe-apply.service', 'wf-websocket.service'])
.directive('wfSlice', function( Globals, GlobalValues, $rootScope, Fds, Part, Specie, Slcf, lodash, Calc, IdGenerator, $timeout, List, SafeApply, Websocket) {
	
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
			propQuantities:GlobalValues.values.enums.propQuantity,
			slcfQuantities:GlobalValues.values.enums.slcfQuantity,
		}
//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {
			if(scope.slcf) {
				var slcf_id=scope.slcf.id;
			}
			slcfList=new List(scope, 'slcf', scope.output.slcfs, null, scope.ui.output.slcf, scope.indexes.slcf, scope.listRange, Slcf, 'slcf', 'file');
		
		
			scope.currentSlcfList={
				value:scope.output.slcfs,
				type: "file"
			};


			scope.slcf=undefined;

			SafeApply.apply(scope);

		})
//}}}
		// INDEXES//{{{
		scope.indexes={
			slcf:{
				index:0,
				changedIndex:false
			}		
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentSlcfList={
			value:scope.output.slcfs,	
			type:'file'
		};
		//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			slcfList:new List(scope, 'slcf', scope.output.slcfs, scope.currentSlcfList, scope.ui.output.slcf, scope.indexes.slcf, scope.listRange, Slcf, 'slcf', 'file', scope.lib.slcfs, scope.ui.output.libSlcf),
			libSlcfList:new List(scope, 'slcf', scope.lib.slcfs, scope.currentSlcfList , scope.ui.output.libSlcf, {index:0}, scope.listRange, Slcf, 'slcf', 'lib'),
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.slcfList.initElement();
		//}}}
		//HELP//{{{
		scope.help={
			slcf:''
		}
	//}}}
		//FUNCTIONS//{{{
		scope.functions={};
			
		scope.functions.slcf={
			switch_lib: function() {
				if(scope.ui.output.slcf.lib=='closed') {
					scope.ui.output.slcf.lib='open';
				} else {
					scope.ui.output.slcf.lib='closed';
				}
			},
			switch_help: function() {
				if(scope.ui.output.slcf.help=='closed') {
					scope.ui.output.slcf.help='open';
				} else {
					scope.ui.output.slcf.help='closed';
				}
			},
			activate: function($index) {
				lists.slcfList.activate($index);
			},
			newItem:function() {
				lists.slcfList.newItem();

			},
			remove:function($index) {
				lists.slcfList.remove($index);
			},
			increaseRange:function() {
				lists.slcfList.increaseRange();
			},
			decreaseRange:function() {
				lists.slcfList.decreaseRange()
			},
			addSpec:function(index) {
				scope.slcf.addSpec(index);
			},
			removeSpec:function(parent, index) {
				scope.slcf.removeSpec(parent, index);
			},
			addPart:function(index) {

				scope.slcf.addPart(index);
			},
			removePart:function(parent, index) {

				scope.slcf.removePart(parent, index);
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.slcf, attribute+'.help', '');
					if(help) {
						scope.help.slcf=help;
					}
				} else {
					scope.help.slcf='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.slcf, attribute+'.help', '');
					if(help) {
						scope.help.slcf=help;
					}
				} else {
					scope.help.slcf='';
				}
			},
			listIndex:function(index, parent) {
				var count=0;
				var slcfIndex;
				var quantityIndex;
				var partSpecIndex;
				var slcf;
				var subIndex;

				if(parent) {
					subIndex=index;
					index=parent;
				}

				slcfIndex=lodash.findIndex(scope.output.slcfs, function(value) {
					return value.id==scope.slcf.id;
				});	
				
				// all marked quantities and specs/parts in previous slcfs
				for(var i=0; i<slcfIndex; i++) {
					slcf=scope.output.slcfs[i];
					for(var j=0; j<slcf.quantities.length; j++) {
						if(slcf.quantities[j].marked==true) {
							if(slcf.quantities[j].specs!=undefined) {
								count+=slcf.quantities[j].specs.length;
							} else if(slcf.quantities[j].parts!=undefined) {

								count+=slcf.quantities[j].parts.length;
							} else {
								count++;
							}
						}
					}
				}

				for(var j=0; j<index; j++) {
					if(scope.slcf.quantities[j].marked==true) {
						if(scope.slcf.quantities[j].specs!=undefined) {
							count+=scope.slcf.quantities[j].specs.length;
						} else if(scope.slcf.quantities[j].parts!=undefined) {
							count+=scope.slcf.quantities[j].parts.length;
						} else {
							count++;
						}
					}
				}
	
				if(parent) {
					count+=subIndex;
				}

				count++;
				return count;
			}


		}
//}}}
		// LIBRARY FUNCTIONS//{{{
		scope.functions.libSlcf={
			activate: function($index) {
				lists.libSlcfList.activateLib($index);

			},
			newItem:function() {
				lists.libSlcfList.newItemLib();
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
				var updatedIndex=index+scope.ui.output.libSlcf.begin;
				var base=scope.lib.importers.slcf_import(scope.lib.slcfs[updatedIndex], scope.output.slcfs);
				lists.slcfList.importItem(base);	
			},

			remove:function($index) {
				lists.libSlcfList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.output.libSlcf.begin;	
				scope.info.ramp_id=scope.lib.slcfs[scope.info.updatedIndex].id;
				scope.info.elements=scope.libremovers.slcf_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-libmatl-prompt");
				} else {
					scope.libremovers.slcf_remove(scope.info.updatedIndex);
					lists.libSlcfList.remove(scope.info.index);
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				
				if(trigger==true) {
					scope.libremovers.slcf_remove(scope.info.updatedIndex);
					lists.libSlcfList.remove(scope.info.index);
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.libSlcfList.increaseRange();
			},
			decreaseRange:function() {
				lists.libSlcfList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.slcf, attribute+'.help', '');
					if(help) {
						scope.help.matl=help;
					}
				} else {
					scope.help.matl='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.slcf, attribute+'.help', '');
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
		templateUrl: Globals.partialsUrl+'/fds/wf-slice',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
