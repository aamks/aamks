<div class="breadcrumb-left">
	<i ng-if="main.currentScenarioId!=undefined"></i>
	<i ng-if="main.currentRiskScenarioId!=undefined"></i>
	<div class="breadcrumb-path">
		<p ng-if="state.$current.name=='application.projects'">Projects<span ng-if="main.currentScenarioId!=undefined">{{functions.projects_scenario()}}</span></p>	
		<p ng-if="state.$current.name!='application.projects'">{{main.currentProject.name}} {{functions.path(state, params)}}</p>
	</div>
</div>
<div class="breadcrumb-right">
	<span ng-if="main.currentScenarioId!=undefined || main.currentRiskScenarioId!=undefined">CAD file: {{main.currentScenario.ac_file}}</span>
	<span ng-if="main.currentScenarioId!=undefined || main.currentRiskScenarioId!=undefined">|</span>
	<span ng-if="main.currentScenarioId!=undefined" ng-click="functions.updateScenario()">Save FDS scenario</br><i class="material-icons">save</i></span>
	<span ng-if="main.currentRiskScenarioId!=undefined" ng-click="functions.updateRiskScenario()">Save Risk scenario</br><i class="material-icons">save</i></span>
	<span ng-if="main.currentScenarioId!=undefined" ng-click="functions.updateLibrary()">Save library</br><i class="material-icons">save</i></span>
	<span ng-if="main.currentScenarioId!=undefined || main.currentRiskScenarioId!=undefined">|</span>
	<span ng-if="main.currentScenarioId!=undefined && main.websocket.connection.state=='open'" ng-click="functions.createLibraryLayers()">Sync lib layers</br><i class="material-icons">layers</i></span>
	<!--<span ng-if="main.currentScenarioId!=undefined" ng-click="functions.syncAll()">Sync all to CAD</br><i class="material-icons">sync</i></span>-->
	<span ng-if="main.currentScenarioId!=undefined || main.currentRiskScenarioId!=undefined" ng-click="functions.trigger()">Connect CAD</br><i class="material-icons" ng-class="{connected: connection.state=='open', disconnected: connection.state=='close'}">sync</i></span>
</div>
