angular.module('wf-obst.directive', ['wf-globals.service', 'wf-http.service', 'wf-fds-object.service', 'wf-deep-diff.service', 'ngLodash', 'wf-safe-apply.service', 'wf-list.service', 'wf-dialog.service', 'wf-websocket.service'])
.directive('wfObst', function(Globals, GlobalValues, HttpManager, $rootScope, Fds, Mesh, Matl, Ramp, Surf, Obst, Hole, DeepDiff, lodash, $timeout, SafeApply, List, DialogManager, Websocket) {

	function link(scope, element, attrs) {

		//GLOBALS	//{{{
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.geometry=$rootScope.main.currentScenario.fds_object.geometry;
		scope.removers=$rootScope.main.currentScenario.fds_object.removers;
		scope.output=$rootScope.main.currentScenario.fds_object.output;
		
		//scope.libremovers=$rootScope.main.lib.removers;
		//scope.rampFunctions=$rootScope.main.currentScenario.fds_object.rampFunctions;

		//scope.lib=$rootScope.main.lib;
		
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
		$timeout(function() {
			scope.$broadcast('scrollPos', {name:'obst', position:scope.ui.geometry.obst.scrollPosition});
			scope.$broadcast('scrollPos', {name:'hole', position:scope.ui.geometry.hole.scrollPosition});
		}, 0);
//}}}
		//WEBSOCKET UPDATE//{{{
		scope.$on('geometry_update', function(event, data) {
			
			if(scope.obst) {
				var obst_id=scope.obst.id;
			
				var obst_index=lodash.findIndex(scope.geometry.obsts,function(obst) {
					return obst.id==obst_id;
				})

				if(obst_index>=0) {
					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(obst_index, Globals.listRange);

				
					scope.ui.geometry.obst.begin=begin_index;
					scope.functions.obst.activate(obst_index);
				} else {

					scope.obst=undefined;
				}
			}

			lists.obstList=new List(scope, 'obst', scope.geometry.obsts, null, scope.ui.geometry.obst, scope.indexes.obst, scope.listRange, Obst, 'obst', 'file');
		
		
			scope.currentObstList={
				value:scope.geometry.obsts,
				type: "file"
			};

			if(scope.hole) {
				var hole_id=scope.hole.id;
			
				var hole_index=lodash.findIndex(scope.geometry.holes,function(hole) {
					return hole.id==hole_id;
				})
				if(hole_index>=0) {

					var begin_index=function(index, listRange) {
						if(index<listRange) {
							return 0;
						} else {
							var res=Math.floor(index/listRange);
							return res*listRange;
						}
					}(hole_index, Globals.listRange);

					scope.ui.geometry.hole.begin=begin_index;
					scope.functions.hole.activate(hole_index);
				} else {
					scope.hole=undefined;
				}
			}

			lists.holeList=new List(scope, 'hole', scope.geometry.holes, null, scope.ui.geometry.hole, scope.indexes.hole, scope.listRange, Hole, 'hole', 'file');
		
		
			scope.currentHoleList={
				value:scope.geometry.holes,
				type: "file"
			};

			SafeApply.apply(scope);

		})


		scope.$on('geometry_select', function(event, data) {
			if(data.list && data.list=='obst') {
				scope.ui.geometry.obst.begin=data.begin;
				scope.functions.obst.activate(data.current);
			} else if(data.list & data.list=='hole') {

				scope.ui.geometry.hole.begin=data.begin;
				scope.functions.hole.activate(data.current);
			}
			SafeApply.apply(scope);
		})
//}}}
		//ENUMS//{{{
		scope.enums={
			colors:GlobalValues.values.enums.colors,
			surfType:GlobalValues.values.enums.obstSurfType
		}
		//}}}
		// INDEXES//{{{
		scope.indexes={
			obst:{
				index:0,
				changedIndex:false
			},
			hole:{
				index:0,
				changedIndex:false
			}
		}
//}}}
		//CURRENT LISTS//{{{
		
		scope.currentObstList={
			value:scope.geometry.obsts,	
			type:'file'
		};
		scope.currentHoleList={
			value:scope.geometry.holes,	
			type:'file'
		};
//}}}
		//LIST FUNCTIONS//{{{
		var lists={
			obstList:new List(scope, 'obst', scope.geometry.obsts, null, scope.ui.geometry.obst, scope.indexes.obst, scope.listRange, Obst, 'obst', 'file'),
			holeList:new List(scope, 'hole', scope.geometry.holes, null, scope.ui.geometry.hole, scope.indexes.hole, scope.listRange, Hole, 'hole', 'file')
		}
//}}}
		//INIT EDIT WINDOW//{{{
		lists.obstList.initElement();
		lists.holeList.initElement();
//}}}
		//HELP//{{{
		scope.help={
			mesh:'',
			matl:'',
			surf:'',
			obst:''
		}
	//}}}
		//FUNCTIONS OBST//{{{
		scope.functions={};

		scope.functions.obst={
			activate: function($index) {
				lists.obstList.activate($index);
			},
			newItem:function() {
				lists.obstList.newItem(scope.geometry.surfs);
			},
			remove:function($index) {
				var delObst=lists.obstList.getItem($index);
				var res=Websocket.syncDeleteItem(delObst);	
				if(res.status='success') {

					lists.obstList.remove($index);
				
				}
			},
			increaseRange:function() {
				lists.obstList.increaseRange();
			},
			decreaseRange:function() {
				lists.obstList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.obst, attribute+'.help', '');
					if(help) {
						scope.help.obst=help;
					}
				} else {
					scope.help.obst='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.obst, attribute+'.help', '');
					if(help) {
						scope.help.obst=help;
					}
				} else {
					scope.help.obst='';
				}
			}

		}
//}}}
		//FUNCTIONS HOLE//{{{
		scope.functions.hole={
			activate: function($index) {
				lists.holeList.activate($index);
			},
			newItem:function() {
				lists.holeList.newItem();
			},
			remove:function($index) {
				var delHole=lists.holeList.getItem($index);
				var res=Websocket.syncDeleteItem(delHole);	
				if(res.status='success') {
					lists.holeList.remove($index);
				}
			},
			increaseRange:function() {
				lists.holeList.increaseRange();
			},
			decreaseRange:function() {
				lists.holeList.decreaseRange()
			},
			helpAmpers:function(attribute) {
				if(attribute!='') {
					var help=lodash.get(scope.globalAmpers.hole, attribute+'.help', '');
					if(help) {
						scope.help.obst=help;
					}
				} else {
					scope.help.obst='';
				}
			},
			helpWiz:function(attribute) {
				if(attribute!='') {

					var help=lodash.get(scope.globalWiz.hole, attribute+'.help', '');
					if(help) {
						scope.help.obst=help;
					}
				} else {
					scope.help.obst='';
				}
			}

		}
		//}}}
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-obst',
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

