angular.module('wf-text.directive', ['wf-globals.service', 'ui.codemirror', 'wf-raw-file.service', 'wf-codemirror-vim.service', 'wf-scenario.service', 'wf-safe-apply.service'])
.directive('wfText', function($state, $stateParams, Globals, RawFileSync, CodemirrorVim, ScenarioManager, $rootScope, SafeApply) {


	function link(scope, element, attrs) {
		scope.scenario=$rootScope.main.currentScenario;
		
		scope.sim_display="";

		scope.functions.api={
			objtotext:function() {
				//console.log("original current scenario: ");
				//console.log(scope.scenario);
				//console.log("start serialized current scenario (to string): ");
				//console.log(scope.scenario.serialize());
				//console.log("end serialized current scenario (to string): ");
				
				//var textRepr=JSON.stringify(scope.scenario.fds_object, null, '\t');
				//console.log(textRepr)

				ScenarioManager.objectToText(scope.scenario).then(function(result) {
				//	console.log("result scenario from server: ");
				//	console.log(result.data);
					scope.scenario.fds_file = result.data;
					//scope.scenario.fds_file=scope.scenario.fds_file+"\n\nRAW OBJECT:\n\n"+textRepr;
					SafeApply.apply(scope);

					//console.log(scope.scenario);
				}, function(error) {
					console.log(error);
				})


			},
			texttoobj:function() {
				console.log("original current scenario: ");
				console.log(scope.scenario);
				console.log("serialized current scenario (to string): ");
				console.log(scope.scenario.serialize());
				ScenarioManager.textToObject($rootScope.main.currentScenario).then(function(result) {
					console.log("result scenario from server: ");
					console.log(result);
				}, function(error) {
					console.log(error);
				})


			},
			start_simulation:function() {
				if(scope.sim_display=="") {
					scope.sim_display="Running simulation ...";
					ScenarioManager.runScenario($rootScope.main.currentScenario);
				} else {
					scope.sim_display="";
				}	
			}
		}

		if(scope.scenario.fds_object && scope.scenario.fds_obj!={}) {
			//console.log(scope.scenario.fds_obj);
			scope.functions.api.objtotext();
		}
		//console.log($rootScope.main);

		/*
		 		scope.functions.resize=function() {
			var codemirrorElement=element.find('#codemirror-wrapper');
			var editorElement=element.find('#text-editor-container');
			var controlsElement=element.find('#text-editor-controls');
			if(editorElement) {

				codemirrorElement.css({'height' : '50px'});
				
				editorElement.css({'height': '50px'});
				var controlsHeight=controlsElement[0].offsetHeight;
				var elementHeight=element[0].offsetHeight;
				var height=elementHeight+'px';

				editorElement.css({'height': height});

				var cmHeight=elementHeight-controlsHeight-16+'px';
				codemirrorElement.css({'height' : cmHeight});
			}
		}

		angular.element($window).bind('resize', function() {
			scope.functions.resize();
		});
		scope.functions.resize();


		 
		 */
	}

	function controller($scope, $element) {
		$scope.textEditor={};
			CodemirrorVim.editorOptions.keyMap = ($rootScope.main.editor == 'normal') ? 'default' : 'vim';
			$scope.textEditor={
				editorOptions : CodemirrorVim.editorOptions
			}

			$scope.functions={
				parseRawFile: function() {
					RawFileSync.parseRawFile($scope.fds.current.rawText).then(function(parsedFile) {
						$scope.fds.current.parsed=parsedFile;
					});

				},
				onLoad : CodemirrorVim.onLoad,
			}
		
	}

	return {
		templateUrl: Globals.partialsUrl+'/wf-text',
		link : link,
		controller : controller,
		scope : {}
	}



})
	
