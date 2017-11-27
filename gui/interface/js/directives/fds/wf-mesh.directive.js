angular.module('wf-mesh.directive', ['wf-globals.service', 'ngLodash', 'wf-fds-object.service','wf-list.service', 'wf-dialog.service', 'wf-websocket.service', 'wf-safe-apply.service'])
.directive('wfMesh', function(Globals, GlobalValues, $rootScope, Mesh, Open, lodash, $timeout, List, DialogManager, Websocket, SafeApply) {


	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.geometry=$rootScope.main.currentScenario.fds_object.geometry;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		
		scope.libremovers=$rootScope.main.lib.removers;
		scope.rampFunctions=$rootScope.main.currentScenario.fds_object.rampFunctions;

		scope.lib=$rootScope.main.lib;
		
		scope.globalAmpers=GlobalValues.values.defaults.ampers;	
		scope.globalWiz=GlobalValues.values.defaults.wiz;	
//}}}
		//SCROLL //{{{
		scope.listRange=Globals.listRange;	
		scope.$on('scroll', function(event, data) {
			if(!isNaN(data.position)) {
				scope.ui.geometry[data.name].scrollPosition=data.position;
			}
		})//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {
			
			if(scope.mesh) {
				var mesh_id=scope.mesh.id;
			
				var mesh_index=lodash.findIndex(scope.geometry.meshes,function(mesh) {
					return mesh.id==mesh_id;
				})

				if(mesh_index>=0) {
					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(mesh_index, Globals.listRange);

					scope.ui.geometry.mesh.begin=begin_index;
					scope.functions.mesh.activate(mesh_index);
				} else {

					scope.mesh=undefined;
				}
			
			}

			if(scope.open) {
				var open_id=scope.open.id;
			
				var open_index=lodash.findIndex(scope.geometry.opens,function(open) {
					return open.id==open_id;
				})
				console.log(open_index);

				if(open_index>=0) {
					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(open_index, Globals.listRange);

					scope.ui.geometry.open.begin=begin_index;
					scope.functions.open.activate(mesh_index);
				} else {

					scope.open=undefined;
				}
			}

			lists.meshList=new List(scope, 'mesh', scope.geometry.meshes, null, scope.ui.geometry.mesh, scope.indexes.mesh, scope.listRange, Mesh, 'mesh', 'file');
			lists.openList=new List(scope, 'open', scope.geometry.opens, null, scope.ui.geometry.open, scope.indexes.open, scope.listRange, Open, 'open', 'file');
		
			scope.currentMeshList={
				value:scope.geometry.meshes,
				type: "file"
			};

			scope.currentOpenList={
				value:scope.geometry.opens,
				type: "file"
			};

			SafeApply.apply(scope);

		})

		scope.$on('geometry_select', function(event, data) {
			if(data.list && data.list=='mesh') {
				scope.ui.geometry.mesh.begin=data.begin;
				scope.functions.mesh.activate(data.current);
			} else if(data.list & data.list=='open') {
				scope.ui.geometry.open.begin=data.begin;
				scope.functions.open.activate(data.current);
			}
			SafeApply.apply(scope);
		})//}}}
		//ENUMS//{{{
		scope.enums={
		
		}//}}}
		// INDEXES//{{{
		scope.indexes={
			mesh:{
				index:0,
				changedIndex:false
			},
			open:{
				index:0,
				changedIndex:false
			}

		}//}}}
		//CURRENT LISTS//{{{
		scope.currentMeshList={
			value:scope.geometry.meshes,	
			type:'file'
		};
		scope.currentOpenList={
			value:scope.geometry.opens,	
			type:'file'
		};//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			meshList:new List(scope, 'mesh', scope.geometry.meshes, null, scope.ui.geometry.mesh, scope.indexes.mesh, scope.listRange, Mesh, 'mesh', 'file'),
			openList:new List(scope, 'open', scope.geometry.opens, null, scope.ui.geometry.open, scope.indexes.open, scope.listRange, Open, 'open', 'file')
		}//}}}
		//INIT EDIT WINDOW//{{{
		lists.meshList.initElement();
		lists.openList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			mesh:''
		}
	//}}}
	
		//FUNCTIONS MESH //{{{
		scope.functions={};
				
		scope.functions.mesh={
			switch_help: function() {
				if(scope.ui.geometry.mesh.help=='closed') {
					scope.ui.geometry.mesh.help='open';
				} else {
					scope.ui.geometry.mesh.help='closed';
				}
		
			},
			activate: function($index) {
				lists.meshList.activate($index);
			},
			newItem:function() {
				lists.meshList.newItem();

			},
			remove:function($index) {
				var delMesh=lists.meshList.getItem($index);
				var res=Websocket.syncDeleteItem(delMesh);	
				if(res.status='success') {
					lists.meshList.remove($index);
				}
			},
			increaseRange:function() {
				lists.meshList.increaseRange();
			},
			decreaseRange:function() {
				lists.meshList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.mesh, attribute+'.help', '');
					if(help) {
						scope.help.mesh=help;
					}
				} else {
					scope.help.mesh='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.mesh, attribute+'.help', '');
					if(help) {
						scope.help.mesh=help;
					}
				} else {
					scope.help.mesh='';
				}
			},
		}//}}}

		//FUNCTIONS OPEN //{{{
		scope.functions.open={
			switch_help: function() {
				if(scope.ui.geometry.open.help=='closed') {
					scope.ui.geometry.open.help='open';
				} else {
					scope.ui.geometry.open.help='closed';
				}
		
			},
			activate: function($index) {
				lists.openList.activate($index);
			},
			newItem:function() {
				lists.openList.newItem();

			},
			remove:function($index) {
				var delOpen=lists.openList.getItem($index);
				var res=Websocket.syncDeleteItem(delOpen);	
				if(res.status='success') {
					lists.openList.remove($index);
				}
			},
			increaseRange:function() {
				lists.openList.increaseRange();
			},
			decreaseRange:function() {
				lists.openList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.vent, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.vent, attribute+'.help', '');
					if(help) {
						scope.help.vent=help;
					}
				} else {
					scope.help.vent='';
				}
			}

		}//}}}

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-mesh',
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

