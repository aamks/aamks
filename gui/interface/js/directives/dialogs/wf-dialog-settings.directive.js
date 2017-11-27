angular.module('wf-dialog-settings.directive', ['ui.router', 'wf-globals.service', 'wf-main.service'])
.directive('wfDialogSettings', function($state, $stateParams, Globals, GlobalValues, $rootScope, MainManager) {
	

	function link(scope, element, attrs) {
		scope.main=$rootScope.main;
		scope.settings_copy={
			userName:scope.main.userName,
			host:scope.main.websocket.host,
			port:scope.main.websocket.port,
			editor:scope.main.editor
		}
		scope.enums={
			editor:GlobalValues.values.app_data.editor
		}
		scope.functions={
			save:function() {
				var obj=scope.settings_copy;
				//obj.currentProjectId=scope.main.currentProjectId
				//obj.currentScenarioId=scope.main.currentScenarioId
				//obj.categories=scope.main.categories
				obj.websocket={
					host: scope.main.websocket.host,
					port: scope.main.websocket.port
				}

				console.log(obj);
				console.log(scope.main.getUserData.call(obj));

				MainManager.update(scope.main.getUserId(), scope.main.getUserData.call(obj)).then(function(data) {
					scope.main.userName=scope.settings_copy.userName;
					scope.main.websocket.host=scope.settings_copy.host;
					scope.main.websocket.port=scope.settings_copy.port;
					scope.main.editor=scope.settings_copy.editor;
				}, function(error) {
					console.log('error');
					
				});
				scope.main.activeDialog=undefined;
			},
			cancel:function() {
				scope.main.activeDialog=undefined;
			}
		}	
	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/dialogs/wf-dialog-settings',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
