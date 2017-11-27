angular.module('mainapp', ['ui.router', 'ngSanitize', 'directives', 'ui.codemirror', 'ngTinyScrollbar', 'wf-globals.service', 'ngAnimate', 'puElasticInput', 'katex', 'cgBusy', 'ui-notification', 'angular-loading-bar' ])
.controller('InitController', function($scope, globals , GlobalValues) {


})
.config(['$stateProvider', '$urlRouterProvider', 'Globals', function($stateProvider, $urlRouterProvider, Globals) { 

	var partialsUrl=Globals.partialsUrl;
	$stateProvider
//{{{ Application - level 0
		.state('application', {
			url: '',
			abstract: true,
			views: {
				'app-view' : {
					template: '<wf-application></wf-application>',
					controller: 'InitController',
					resolve: {
						globals: function(GlobalValues) {
							return GlobalValues.getGlobals();
						}
					}
					
				}
			}
		})//}}}
		/* 1 poziom */
		.state('application.projects', {
			url: '/projects',
			views: {
				'editor-view' : {
					template: '<wf-projects class="editor"></wf-projects>'
				}
			}
		})
		.state('application.fds-scenario', {
			url: '/fds-scenario/{id}',
			views: {
				'editor-view' : {
					template: '<div class="editor-wrapper" ui-view="scenario-editor"></div>'
				}
			}
		})
		.state('application.risk-scenario', {
			url: '/risk-scenario/{id}',
			views: {
				'editor-view' : {
					template: '<div class="editor-wrapper" ui-view="scenario-editor"></div>'

				}
			}
		})
		.state('application.categories', {
			url: '/categories',
			views: {
				'editor-view' : {
					template: '<wf-categories class="editor"></wf-categories>'
				}
			}
		})
		/* 2 poziom - fds */
		.state('application.fds-scenario.text', {
			url: '/text',
			views: {
				'scenario-editor' : {
					template: '<wf-text class="editor"></wf-text>'
				}
			}
		})
		.state('application.fds-scenario.visual', {
			url: '/visual',
			views: {
				'scenario-editor' : {
					template: '<div class="editor-wrapper" ui-view="visual-editor"></div>'
				}
			}
		})
		
	
		/* 2 poziom - risk */
		.state('application.risk-scenario.general', {
			url: '/general',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-general class="editor"></wf-risk-general>'
				}
			}
		})
		.state('application.risk-scenario.building', {
			url: '/building',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-building class="editor"></wf-risk-building>'
				}
			}
		})
		.state('application.risk-scenario.materials', {
			url: '/materials',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-materials class="editor"></wf-risk-materials>'
				}
			}
		})
		.state('application.risk-scenario.ventilation', {
			url: '/ventilation',
			views: {
				'scenario-editor' : {
					template: '<wf-ventilation class="editor"></wf-ventilation>'
				}
			}
		})
		.state('application.risk-scenario.devices', {
			url: '/devices',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-devices class="editor"></wf-risk-devices>'
				}
			}
		})
		.state('application.risk-scenario.settings', {
			url: '/settings',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-settings class="editor"></wf-risk-settings>'
				}
			}
		})
		.state('application.risk-scenario.results-overview', {
			url: '/results-overview',
			views: {
				'scenario-editor' : {
					template: '<wf-risk-results-overview class="editor"></wf-risk-results-overview>'
				}
			}
		})

		/*3 poziom - fds -visual */

		.state('application.fds-scenario.visual.general-settings', {
			url: '/general-settings',
			views: {
				'visual-editor' : {
					template: '<wf-general-settings class="editor"></wf-general-settings>'
				}
			}
		})
		.state('application.fds-scenario.visual.species', {
			url: '/species',
			views: {
				'visual-editor' : {
					template: '<wf-species class="editor"></wf-species>'
				}
			}
		})
		.state('application.fds-scenario.visual.species-injector', {
			url: '/species-injector',
			views: {
				'visual-editor' : {
					template: '<wf-species-injector class="editor"></wf-species-injector>'
				}
			}
		})
		.state('application.fds-scenario.visual.particles', {
			url: '/particles',
			views: {
				'visual-editor' : {
					template: '<wf-particles class="editor"></wf-particles>'
				}
			}
		})
		.state('application.fds-scenario.visual.ramps', {
			url: '/ramps',
			views: {
				'visual-editor' : {
					template: '<wf-ramps class="editor"></wf-ramps>'
				}
			}
		})
		.state('application.fds-scenario.visual.mesh', {
			url: '/mesh',
			views: {
				'visual-editor' : {
					template: '<wf-mesh class="editor"></wf-mesh>'
				}
			}
		})
		.state('application.fds-scenario.visual.matl', {
			url: '/matl',
			views: {
				'visual-editor' : {
					template: '<wf-matl class="editor"></wf-matl>'
				}
			}
		})
		.state('application.fds-scenario.visual.surf', {
			url: '/surf',
			views: {
				'visual-editor' : {
					template: '<wf-surf class="editor"></wf-surf>'
				}
			}
		})
		.state('application.fds-scenario.visual.obst', {
			url: '/obst',
			views: {
				'visual-editor' : {
					template: '<wf-obst class="editor"></wf-obst>'
				}
			}
		})
		.state('application.fds-scenario.visual.basic-ventilation', {
			url: '/basic-ventilation',
			views: {
				'visual-editor' : {
					template: '<wf-basic-ventilation class="editor"></wf-basic-ventilation>'
				}
			}
		})
		.state('application.fds-scenario.visual.jetfan-ventilation', {
			url: '/jetfan-ventilation',
			views: {
				'visual-editor' : {
					template: '<wf-jetfan-ventilation class="editor"></wf-jetfan-ventilation>'
				}
			}
		})
		.state('application.fds-scenario.visual.fires', {
			url: '/fires',
			views: {
				'visual-editor' : {
					template: '<wf-fires class="editor"></wf-fires>'
				}
			}
		})
		.state('application.fds-scenario.visual.combustion', {
			url: '/combustion',
			views: {
				'visual-editor' : {
					template: '<wf-combustion class="editor"></wf-combustion>'
				}
			}
		})
		.state('application.fds-scenario.visual.general-dump', {
			url: '/general-dump',
			views: {
				'visual-editor' : {
					template: '<wf-general-dump class="editor"></wf-general-dump>'
				}
			}
		})
		.state('application.fds-scenario.visual.boundary', {
			url: '/boundary',
			views: {
				'visual-editor' : {
					template: '<wf-boundary class="editor"></wf-boundary>'
				}
			}
		})
		.state('application.fds-scenario.visual.slice', {
			url: '/slice',
			views: {
				'visual-editor' : {
					template: '<wf-slice class="editor"></wf-slice>'
				}
			}
		})
		.state('application.fds-scenario.visual.isosurface', {
			url: '/isosurface',
			views: {
				'visual-editor' : {
					template: '<wf-isosurface class="editor"></wf-isosurface>'
				}
			}
		})
		.state('application.fds-scenario.visual.device', {
			url: '/device',
			views: {
				'visual-editor' : {
					template: '<wf-device class="editor"></wf-device>'
				}
			}
		})
		.state('application.fds-scenario.visual.property', {
			url: '/property',
			views: {
				'visual-editor' : {
					template: '<wf-property class="editor"></wf-property>'
				}
			}
		})
		.state('application.fds-scenario.visual.control', {
			url: '/control',
			views: {
				'visual-editor' : {
					template: '<wf-control class="editor"></wf-control>'
				}
			}
		})

	$urlRouterProvider.otherwise('projects');

}])

