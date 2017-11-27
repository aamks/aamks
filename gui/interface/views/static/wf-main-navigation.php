<div class="navigation-element-1" ui-sref="application.projects">
	<a ng-click="functions.updateCurrentScenario()" ng-class="state.$current.name=='application.projects' ? 'active':'' ">PROJECTS</a>
</div>
<!-- FDS menu {{{ -->
<div ng-if="main.currentScenarioId!=undefined" class="navigation-group-1">
	<div class="navigation-element-1" ng-click="functions.visual()">
		<a>VISUAL EDITOR</a>
		<i ng-if="!main.currentScenario.ui_state.drawers.visual" class="material-icons">expand_more</i>
		<i ng-if="main.currentScenario.ui_state.drawers.visual" class="material-icons">expand_less</i>
	</div>
	<div ng-class="main.currentScenario.ui_state.drawers.visual  ? 'open' : 'close'" class="navigation-group-2">
		<div class="navigation-element-2" ui-sref="application.fds-scenario.visual.general-settings({id: main.currentScenarioId})">
			<i class="material-icons null"></i><a ng-class="state.$current.name=='application.fds-scenario.visual.general-settings' ? 'active':'' ">GENERAL</a>
		</div>

		<div class="navigation-element-2" ng-click="functions.geometry()">
			<i ng-if="!main.currentScenario.ui_state.drawers.geometry" class="material-icons">expand_more</i>
			<i ng-if="main.currentScenario.ui_state.drawers.geometry" class="material-icons">expand_less</i>
			<a>GEOMETRY</a>
		</div>
		<div ng-class="main.currentScenario.ui_state.drawers.geometry ? 'open' : 'close'" class="navigation-group-3">
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.mesh({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.mesh' ? 'active':'' ">MESH</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.matl({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.matl' ? 'active':'' ">MATERIAL</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.surf({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.surf' ? 'active':'' ">SURFACE</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.obst({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.obst' ? 'active':'' ">OBSTRUCTION</a>
			</div>

		</div>
		<div class="navigation-element-2" ng-click="functions.ventilation()">
			<i ng-if="!main.currentScenario.ui_state.drawers.ventilation" class="material-icons">expand_more</i>
			<i ng-if="main.currentScenario.ui_state.drawers.ventilation" class="material-icons">expand_less</i>
			<a>VENTILATION</a>
		</div>
		<div ng-class="main.currentScenario.ui_state.drawers.ventilation  ? 'open' : 'close'" class="navigation-group-3">
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.basic-ventilation({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.basic-ventilation' ? 'active':'' ">BASIC</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.jetfan-ventilation({id: main.currentScenarioId})">
				<a  ng-class="state.$current.name=='application.fds-scenario.visual.jetfan-ventilation' ? 'active':'' ">JETFAN</a>
			</div>
		</div>
		<div class="navigation-element-2" ng-click="functions.fire()">
			<i ng-if="!main.currentScenario.ui_state.drawers.fire" class="material-icons">expand_more</i>			
			<i ng-if="main.currentScenario.ui_state.drawers.fire" class="material-icons">expand_less</i>
			<a>FIRE</a>
		</div>
		<div ng-class="main.currentScenario.ui_state.drawers.fire  ? 'open' : 'close'" class="navigation-group-3">
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.fires({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.fires' ? 'active':'' ">FIRES</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.combustion({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.combustion' ? 'active':'' ">COMBUSTION</a>
			</div>
		</div>
		<div class="navigation-element-2" ng-click="functions.output()">
			<i ng-if="!main.currentScenario.ui_state.drawers.output" class="material-icons">expand_more</i>
			<i ng-if="main.currentScenario.ui_state.drawers.output" class="material-icons">expand_less</i>
			<a>OUTPUT</a>
		</div>
		<div ng-class="main.currentScenario.ui_state.drawers.output  ? 'open' : 'close'" class="navigation-group-3">
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.general-dump({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.general-dump' ? 'active':'' ">GENERAL-DUMP</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.boundary({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.boundary' ? 'active':'' ">BOUNDARY</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.slice({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.slice' ? 'active':'' ">SLICE</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.isosurface({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.isosurface' ? 'active':'' ">ISOSURFACE</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.device({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.device' ? 'active':'' ">DEVICE</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.property({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.property' ? 'active':'' ">PROPERTY</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.control({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.control' ? 'active':'' ">CONTROL</a>
			</div>

		</div>
		<div class="navigation-element-2" ng-click="functions.species()">
			<i ng-if="!main.currentScenario.ui_state.drawers.species" class="material-icons">expand_more</i>			
			<i ng-if="main.currentScenario.ui_state.drawers.species" class="material-icons">expand_less</i>
			<a>SPECIES</a>
		</div>
		<div ng-class="main.currentScenario.ui_state.drawers.species ? 'open' : 'close'" class="navigation-group-3">
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.species({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.species' ? 'active':'' ">SPEC</a>
			</div>
			<div class="navigation-element-3" ui-sref="application.fds-scenario.visual.species-injector({id: main.currentScenarioId})">
				<a ng-class="state.$current.name=='application.fds-scenario.visual.species-injector' ? 'active':'' ">INJECTOR</a>
			</div>
		</div>
		<div class="navigation-element-2" ui-sref="application.fds-scenario.visual.particles({id: main.currentScenarioId})">
			<i class="material-icons null"></i>
			<a ng-class="state.$current.name=='application.fds-scenario.visual.particles' ? 'active':'' ">PARTICLES</a>
		</div>
		<div class="navigation-element-2" ui-sref="application.fds-scenario.visual.ramps({id: main.currentScenarioId})">
			<i class="material-icons null"></i>
			<a ng-class="state.$current.name=='application.fds-scenario.visual.ramps' ? 'active':'' ">RAMPS</a>
		</div>
	</div>
	<div class="navigation-element-1"  ui-sref="application.fds-scenario.text({id: main.currentScenarioId})">
		<a ng-class="state.$current.name=='application.fds-scenario.text' ? 'active':'' " >TEXT EDITOR</a>
	</div>

</div>
<!-- }}} -->
<!-- Risk menu {{{ -->
<div ng-if="main.currentRiskScenarioId!=undefined" class="navigation-group-1">
	<div class="navigation-element-1"   ui-sref="application.risk-scenario.general({id: main.currentRiskScenarioId})">
		<a  ng-class="state.$current.name=='application.risk-scenario.general' ? 'active':'' ">GENERAL</a>
	</div>
	<div class="navigation-element-1"  ui-sref="application.risk-scenario.building({id: main.currentRiskScenarioId})" >
		<a  ng-class="state.$current.name=='application.risk-scenario.building' ? 'active':'' ">BUILDING</a>
	</div>
	<div class="navigation-element-1" ui-sref="application.risk-scenario.materials({id: main.currentRiskScenarioId})">
		<a  ng-class="state.$current.name=='application.risk-scenario.materials' ? 'active':'' " >MATERIALS</a>
	</div>
	<!--
	<div class="navigation-element-1" ui-sref="application.risk-scenario.ventilation({id: main.currentRiskScenarioId})">
		<a  ng-class="state.$current.name=='application.risk-scenario.ventilation' ? 'active':'' ">VENTILATION</a>
	</div>
	-->
	<div class="navigation-element-1" ui-sref="application.risk-scenario.settings({id: main.currentRiskScenarioId})">
		<a  ng-class="state.$current.name=='application.risk-scenario.settings' ? 'active':'' ">SETTINGS</a>
	</div>
	<div class="navigation-element-1" ui-sref="application.risk-scenario.results-overview({id: main.currentRiskScenarioId})">
		<a  ng-class="state.$current.name=='application.risk-scenario.results-overview' ? 'active':'' " >RESULTS OVERVIEW</a>
	</div>
</div>
<!-- }}} -->

