angular.module('wf-surf.directive', ['wf-globals.service', 'wf-fds-object.service','ngLodash', 'wf-list.service', 'wf-dialog.service', 'wf-safe-apply.service', 'wf-websocket.service'])
.directive('wfSurf', function(Globals, GlobalValues, $rootScope, Surf, Obst, Matl, lodash, $timeout, List, DialogManager, SafeApply, Websocket) {
	
	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.geometry=$rootScope.main.currentScenario.fds_object.geometry;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		
		scope.ramps=$rootScope.main.currentScenario.fds_object.ramps;

		scope.lib=$rootScope.main.lib;
		scope.libremovers=$rootScope.main.lib.removers;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL//{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {

				scope.ui.geometry[data.name].scrollPosition=data.position;
			}
		})
//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {
		
			if(scope.surf) {	
				var surf_id=scope.surf.id;
			}
		
			lists.surfList=new List(scope, 'surf', scope.geometry.surfs, scope.currentSurfList, scope.ui.geometry.surf, scope.indexes.surf, scope.listRange, Surf, 'surf', 'file', scope.lib.surfs, scope.ui.geometry.libSurf),

			scope.currentSurfList={
				value:scope.geometry.surfs,
				type: "file"
			};

			scope.surf=undefined;

			SafeApply.apply(scope);
		})
//}}}
		//ENUMS//{{{

		scope.enums={
			colors:GlobalValues.values.enums.colors,
			backing:GlobalValues.values.enums.surfaceBacking,
			surfType:GlobalValues.values.enums.obstSurfType
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			surf:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		scope.currentSurfList={
			value:scope.geometry.surfs,	
			type:'file'
		};
	//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			surfList:new List(scope, 'surf', scope.geometry.surfs,scope.currentSurfList, scope.ui.geometry.surf, scope.indexes.surf, scope.listRange, Surf, 'surf', 'file', scope.lib.surfs, scope.ui.geometry.libSurf),
			libSurfList:new List(scope, 'surf', scope.lib.surfs, scope.currentSurfList, scope.ui.geometry.libSurf, {index:0}, scope.listRange, Surf, 'surf', 'lib'),
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.surfList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			surf:''
		}
	//}}}
	// FUNCTIONS//{{{
		scope.functions={};

		scope.functions.surf={
			switch_lib: function() {
				if(scope.ui.geometry.surf.lib=='closed') {
					scope.ui.geometry.surf.lib='open';
					console.log(scope.lib.surfs);
				} else {
					scope.ui.geometry.surf.lib='closed';
				}
		
			},
			switch_help: function() {
				if(scope.ui.geometry.surf.help=='closed') {
					scope.ui.geometry.surf.help='open';
				} else {
					scope.ui.geometry.surf.help='closed';
				}
		
			},

			activate: function($index) {
				lists.surfList.activate($index);
			},
			newItem:function() {
				lists.surfList.newItem();
			},
			exportToLib: function($index) {
				lists.surfList.exportToLib($index);
			},
			remove:function($index) {
				lists.surfList.remove($index);
			},
			removePrompt:function($index) {
		
				scope.info={};	
				scope.info.index=$index;
				scope.info.updatedIndex=$index+scope.ui.geometry.surf.begin;	
				scope.info.surf_id=scope.geometry.surfs[scope.info.updatedIndex].id;
				scope.info.elements=scope.removers.surf_prompt(scope.info.updatedIndex);
				if(lodash.find(scope.info.elements, function(element) { return element.length>0 }) ) {
					DialogManager.displayDialog("remove-surf-prompt");
				} else {
					var delSurf=lists.surfList.getItem(scope.info.index);
					var res=Websocket.syncDeleteItem(delSurf);	
					if(res.status='success') {
						scope.removers.surf_remove(scope.info.updatedIndex);
						lists.surfList.remove(scope.info.index);
					}
					scope.info={};

				}
			},
			removeConfirmed:function(trigger) {
				if(trigger==true) {
					var delSurf=lists.surfList.getItem(scope.info.index);
					var res=Websocket.syncDeleteItem(delSurf);	
					if(res.status='success') {
						scope.removers.surf_remove(scope.info.updatedIndex);
						lists.surfList.remove(scope.info.index);
					}
					scope.info={};
				} else {
					scope.info={};
				}
			},

			increaseRange:function() {
				lists.surfList.increaseRange();
			},
			decreaseRange:function() {
				lists.surfList.decreaseRange()
			},
			layer:{
				newLayer:function() {
					scope.surf.addLayer();
				},
				remove:function($index) {
					scope.surf.removeLayer($index);
				},
				material:{
					newMaterial:function($index) {
						scope.surf.addMaterial($index)
					},
					remove:function($parentIndex, $index) {
						scope.surf.removeMaterial($parentIndex, $index);
					}
				}	
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.surf, attribute+'.help', '');
					if(help) {
						scope.help.surf=help;
					}
				} else {
					scope.help.surf='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.surf, attribute+'.help', '');
					if(help) {
						scope.help.surf=help;
					}
				} else {
					scope.help.surf='';
				}
			}
				
		}
//}}}
		// LIBRARY FUNCTIONS//{{{
		scope.functions.libSurf={
			activate: function($index) {
				lists.libSurfList.activateLib($index);
			},
			newItem:function() {
				lists.libSurfList.newItemLib();
			},
			importFromLib:function($index) {
				/*
				// znajdz czy ma jakies materialy
				if(scope.lib.surfs[scope.ui.geometry.libSurf.begin+$index].layers.length > 0){
					lodash.each(scope.lib.surfs[scope.ui.geometry.libSurf.begin+$index].layers, function(layer) {
						lodash.each(layer['materials'], function(matl){
							//var material=lodash.find(scope.geometry.matls, function(material) {
							//	return material.id==matl.matl_id;
							//})
							scope.geometry.matls.push(new Matl(matl.material));	
						})
					})
				}
				console.log(scope.geometry.matls);
				scope.geometry.surfs.push(new Surf(scope.lib.surfs[scope.ui.geometry.libSurf.begin+$index], scope.geometry.matls));	
			*/
			},
			importItem:function(index) {
				var updatedIndex=index+scope.ui.geometry.libSurf.begin;
				var base=scope.lib.importers.surf_import(scope.lib.surfs[updatedIndex], scope.geometry.surfs, scope.geometry.matls, scope.lib.matls, scope.ramps.ramps, scope.lib.ramps);
				lists.surfList.importItem(base);	
			},
			remove:function($index) {
				lists.libSurfList.remove($index);
			},
			layer:{
				newLayer:function() {
					scope.surf.addLayer();
				},
				remove:function($index) {
					scope.surf.removeLayer($index);
				},
				material:{
					newMaterial:function($index) {
						scope.surf.addMaterial($index)
					},
					remove:function($parentIndex, $index) {
						scope.surf.removeMaterial($parentIndex, $index);
					}
				}	
			},
			increaseRange:function() {
				lists.libSurfList.increaseRange();
			},
			decreaseRange:function() {
				lists.libSurfList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.surf, attribute+'.help', '');
					if(help) {
						scope.help.surf=help;
					}
				} else {
					scope.help.surf='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.surf, attribute+'.help', '');
					if(help) {
						scope.help.surf=help;
					}
				} else {
					scope.help.surf='';
				}
			}
		}
//}}}

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-surf',
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

