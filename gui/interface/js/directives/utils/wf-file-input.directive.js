angular.module('wf-file-input.directive', ['ui.router', 'wf-globals.service', 'ngFileSaver', 'ngStorage','wf-safe-apply.service' ])
.directive('wfFileInput', function($state, $stateParams, Globals, FileSaver, Blob, $q, $http, $localStorage, $sessionStorage, $window, $timeout, SafeApply) {
	
	
	function link(scope, elem, attr, ngModel) {
		
		$timeout(function() {
			//scope.file=ngModel.$modelValue;
			scope.oldFile=angular.copy(scope.file);

			if(scope.file && scope.file.name && scope.file.name!="" && scope.file.content && scope.file.content!="") {
				scope.action="CHANGE GEOMETRY";
			} else {
				scope.action="LOAD GEOMETRY";
			}
		}, 0);
	}


	function controller($scope, $element, $attrs) {
		
		$scope.file={
			name:"",
			content:""
		};

		$scope.functions={
			uploadLocal : function(event) {
				var reader = new FileReader();
				reader.onload = function(){
					$scope.file.name=event.target.files[0].name;
					$scope.file.content=reader.result;
					//$scope.functions.uploadToServer();
					
					SafeApply.apply($scope);

				};
				reader.readAsText(event.target.files[0]);

				
			},
			uploadToServer : function() {

				var res=$scope.$parent.$eval($attrs.fsInputMethod);
				
				res.then(function(result) {
					$scope.oldFile=angular.copy($scope.file);

					console.log($scope.$parent.scenarios);
				}, function(error) {
					$scope.file.name=$scope.oldFile.name;
					$scope.file.content=$scope.oldFile.content;
					console.log($scope.$parent.scenarios);
				});
				

			},
			download : function() {
				var file=new Blob([$scope.file.content], { type: 'text/plain;charset=utf-8' });
				var fileName=$scope.file.name || "file.fds";
				FileSaver.saveAs(file, fileName);

			},
			delete : function() {
				$scope.file.name="";
				$scope.file.content="";
				$scope.functions.uploadToServer();
			}
		}

	}


	return {
		templateUrl: Globals.partialsUrl+'/utils/wf-file-input',
		link : link,
		controller: controller,
		require: '?ngModel',
		scope : {}
	}


})


