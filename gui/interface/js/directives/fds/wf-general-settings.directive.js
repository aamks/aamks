angular.module('wf-general-settings.directive', ['ui.router', 'wf-globals.service'])
.directive('wfGeneralSettings', function($state, $stateParams, Globals, $rootScope) {
	

	function link(scope, element, attrs) {
		scope.ui=$rootScope.main.currentScenario.ui_state;
		scope.general=$rootScope.main.currentScenario.fds_object.general;	
		scope.output=$rootScope.main.currentScenario.fds_object.output;	

		scope.functions={
			download_fds:function() {

			},
			upload_fds:function() {

			},
			delete_fds:function() {

			},
			ac_link:function() {

			},
			ac_unlink:function() {

			},
			ac_sync:function() {

			}

		}	

	}

	function controller($scope, $element) {

	}

	return {
		templateUrl: Globals.partialsUrl+'/fds/wf-general-settings',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
