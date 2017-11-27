<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<title>
			aamks - Simulation Modules
		</title>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
		<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>

		<link href="/styles/app.css" rel="stylesheet" />

		<link href="https://fonts.googleapis.com/css?family=Play" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

		<link href="/js/lib/angular-busy/dist/angular-busy.min.css" rel="stylesheet" />

		<link rel="stylesheet" type="text/css" href="/js/lib/angular-loading-bar/build/loading-bar.min.css"/>
		<link href="/js/lib/angular-ui-notification/dist/angular-ui-notification.min.css" rel="stylesheet" />

		<!--<link rel="stylesheet" href="/resources/visualize/css/themes/base/jquery-ui.css">
		WEBGL TEMP
		<style>
			#container {
				background: : #000;
				height: 800px;
				width: auto;
				overflow:hidden;
			}

			#left {
				width: 100px;
				/*height: 200px;*/
				float: left;
			}
			#controller{
				overflow: hidden;
			}
			#slider{
				padding-left: 20px;
				padding-right: 20px;
				height: 2em;
			  overflow: hidden;
			}
			#slider-handler {
				width: 3em;
				height: 1.6em;
				top: 50%;
				margin-top: -.8em;
				text-align: center;
				line-height: 1.6em;
			}
		</style> -->


		<!-- -->

	</head>
	<body class="theme-dark">
		<toast></toast>
		<div id="pagecontainer" ng-app="mainapp" ui-view="app-view">
		</div>
		<div id="scripts">
			<!-- WEBGL TEMPORARY -->

			<!-- Canvas
			<script src="/js/lib/paperjs/paper.js"></script>
			-->

			<!-- LUMX deps -->
			<script src="/js/lib/jquery/dist/jquery.min.js"></script>
			<script src="/js/lib/d3/d3.js"></script>
			<!--angular and libs-->
			<script src="/js/lib/angular/angular.min.js"></script>
			<script src="/js/lib/angular-ui-codemirror/ui-codemirror.js"></script>
			<script src="/js/lib/angular-ui-router/release/angular-ui-router.js"></script>
			<!-- <script src="/js/lib/angular-websocket/dist/angular-websocket.js"></script> -->
			<script src="/js/lib/angular-websocket/dist/angular-websocket.js"></script>
			<script src="/js/lib/angular-file-saver/dist/angular-file-saver.bundle.js"></script>
			<script src="/js/lib/angular-sanitize/angular-sanitize.js"></script>
			<script src="/js/lib/angular-animate/angular-animate.js"></script>
			<script src="/js/lib/ng-lodash/build/ng-lodash.js"></script>
			<script src="/js/lib/ngTinyScrollbar/dist/ng-tiny-scrollbar.js"></script>
			<script src="/js/lib/ngstorage/ngStorage.js"></script>
			<!--pu elastic input-->
			<script src="/js/lib/angular-elastic-input/dist/angular-elastic-input.min.js"></script>
			<!--katex units-->
			<script type="text/javascript" src="/js/lib/katex/dist/katex.min.js"></script>
			<script type="text/javascript" src="/js/lib/katex/dist/contrib/auto-render.min.js"></script>
			<script type="text/javascript" src="/js/lib/angular-katex/angular-katex.js"></script>
			<!--angular busy-->
			<script type="text/javascript" src="/js/lib/angular-busy/dist/angular-busy.min.js"></script>

			<!--angular loading bar-->
			<script src="/js/lib/angular-loading-bar/build/loading-bar.js"></script>
			<!--chosen-->
			<script type="text/javascript" src="/js/lib/chosen/chosen.jquery.js"></script>
			<script type="text/javascript" src="/js/lib/angular-chosen-localytics/dist/angular-chosen.js"></script>


			<script type="text/javascript" src="/js/lib/angular-ui-notification/dist/angular-ui-notification.js"></script>


			<!--main app-->
			<script src="/js/app.js"></script>
			<!--SERVICES-->
			<script src="/js/services/wf-globals.service.js"></script>
			<script src="/js/services/wf-raw-file.service.js"></script>
			<script src="/js/services/wf-websocket.service.js"></script>
			<script src="/js/services/wf-autocad.service.js"></script>
			<script src="/js/services/wf-codemirror-vim.service.js"></script>
			<script src="/js/services/wf-mock.service.js"></script>
			<script src="/js/services/wf-main.service.js"></script>
			<script src="/js/services/wf-project.service.js"></script>
			<script src="/js/services/wf-help.service.js"></script>
			<script src="/js/services/wf-dialog.service.js"></script>
			<script src="/js/services/wf-http.service.js"></script>
			<script src="/js/services/wf-scenario.service.js"></script>
			<script src="/js/services/wf-fds-object.service.js"></script>
			<script src="/js/services/wf-safe-apply.service.js"></script>
			<script src="/js/services/wf-deep-diff.service.js"></script>
			<script src="/js/services/wf-calc.service.js"></script>
			<script src="/js/services/wf-id-generator.service.js"></script>
			<script src="/js/services/wf-validators.service.js"></script>
			<script src="/js/services/wf-ui-state.service.js"></script>
			<script src="/js/services/wf-list.service.js"></script>
			<script src="/js/services/wf-accessor.service.js"></script>
			<script src="/js/services/wf-sync-object.service.js"></script>
			<script src="/js/services/wf-library.service.js"></script>
			<script src="/js/services/wf-risk-object.service.js"></script>
			<script src="/js/services/wf-risk-scenario.service.js"></script>
			<script src="/js/services/wf-ui-risk-state.service.js"></script>
			<script src="/js/services/wf-category.service.js"></script>

			<!--DIRECTIVES-->
			<script src="/js/directives/static/wf-application.directive.js"></script>
			<script src="/js/directives/static/wf-main-navigation.directive.js"></script>
			<script src="/js/directives/static/wf-page-top.directive.js"></script>
			<script src="/js/directives/static/wf-top-navigation.directive.js"></script>
			
			<script src="/js/directives/wf-projects.directive.js"></script>
			<script src="/js/directives/wf-categories.directive.js"></script>
			<script src="/js/directives/wf-fds-scenario.directive.js"></script>
			<script src="/js/directives/wf-risk-scenario.directive.js"></script>
			
			<script src="/js/directives/wf-categories.directive.js"></script>

			<script src="/js/directives/wf-text.directive.js"></script>
			<script src="/js/directives/wf-visual.directive.js"></script>

			<script src="/js/directives/risk/wf-risk-general.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-building.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-materials.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-ventilation.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-devices.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-settings.directive.js"></script>
			<script src="/js/directives/risk/wf-risk-results-overview.directive.js"></script>

			<script src="/js/directives/fds/wf-general-settings.directive.js"></script>
			<script src="/js/directives/fds/wf-geometry.directive.js"></script>
			<script src="/js/directives/fds/wf-ventilation.directive.js"></script>
			<script src="/js/directives/fds/wf-output.directive.js"></script>
			<script src="/js/directives/fds/wf-species.directive.js"></script>
			<script src="/js/directives/fds/wf-species-injector.directive.js"></script>
			<script src="/js/directives/fds/wf-particles.directive.js"></script>
			<script src="/js/directives/fds/wf-ramps.directive.js"></script>

			<script src="/js/directives/fds/wf-mesh.directive.js"></script>
			<script src="/js/directives/fds/wf-matl.directive.js"></script>
			<script src="/js/directives/fds/wf-surf.directive.js"></script>
			<script src="/js/directives/fds/wf-obst.directive.js"></script>		
			<script src="/js/directives/fds/wf-basic-ventilation.directive.js"></script>
			<script src="/js/directives/fds/wf-jetfan-ventilation.directive.js"></script>
			<script src="/js/directives/fds/wf-fires.directive.js"></script>
			<script src="/js/directives/fds/wf-combustion.directive.js"></script>
			<script src="/js/directives/fds/wf-general-dump.directive.js"></script>
			<script src="/js/directives/fds/wf-boundary.directive.js"></script>
			<script src="/js/directives/fds/wf-slice.directive.js"></script>
			<script src="/js/directives/fds/wf-isosurface.directive.js"></script>
			<script src="/js/directives/fds/wf-device.directive.js"></script>
			<script src="/js/directives/fds/wf-property.directive.js"></script>
			<script src="/js/directives/fds/wf-control.directive.js"></script>

			<script src="/js/directives/dialogs/wf-dialog-settings.directive.js"></script>
			
			<script src="/js/directives/libraries/wf-lib-matl.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-surf.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-fire.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-prop.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-part.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-spec.directive.js"></script>
			<script src="/js/directives/libraries/wf-lib-ramp.directive.js"></script>

			<script src="/js/directives/utils/wf-help.directive.js"></script>
			<script src="/js/directives/utils/wf-list.directive.js"></script>
			<script src="/js/directives/utils/wf-dialog.directive.js"></script>
			<script src="/js/directives/utils/wf-settings.directive.js"></script>
			<script src="/js/directives/utils/wf-unique-select.directive.js"></script>
			<script src="/js/directives/utils/wf-d3.directive.js"></script>
			<script src="/js/directives/utils/wf-file-input.directive.js"></script>
			<script src="/js/directives/utils/wf-change.directive.js"></script>
			
			<script src="/js/directives/directives.js"></script>
			
			<!--CODEMIRROR	-->
			<script src="/js/lib/codemirror/lib/codemirror.js"></script>
			<script src="/js/lib/codemirror/addon/dialog/dialog.js"></script>
			<script src="/js/lib/codemirror/addon/scroll/simplescrollbars.js"></script>
			<script src="/js/lib/codemirror/addon/search/searchcursor.js"></script>
			<script src="/js/lib/codemirror/addon/hint/show-hint.js"></script>
			<script src="/js/lib/codemirror/addon/hint/fds-hint.js"></script>
			<script src="/js/lib/codemirror/addon/display/fullscreen.js"></script>
			<script src="/js/lib/codemirror/addon/fold/foldcode.js"></script>
			<script src="/js/lib/codemirror/addon/fold/foldgutter.js"></script>
			<script src="/js/lib/codemirror/addon/fold/fds-fold.js"></script>
			<script src="/js/lib/codemirror/keymap/vim.js"></script>
			<script src="/js/lib/codemirror/mode/fds/fds.js"></script>
		</div>
	</body>
</html>
