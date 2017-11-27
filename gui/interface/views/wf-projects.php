<div class="projects-title" ng-if="main.categoryManager!='open'">
	<div class="add-project" ng-click="functions.project.newItem()">
		<i class="material-icons">add_box</i>
		<h2>Add project</h2>
	</div>
	<div class="projects-categories">
		<div class="project-category" ng-class="category.active ? 'active' : ''" ng-click="category.triggerActive(); functions.project.categoryTrigger($index)" ng-repeat="category in main.categories" ng-show="category.visible==true">
			<p>{{category.label}}</p>
		</div>
	</div>
	<i class="material-icons" ng-click="functions.project.switchCategoryManager()">menu</i>
</div>
<div ng-if="main.categoryManager!='open'">
	<div class="project-item" ng-repeat="project in main.projects" ng-show="functions.project.categoryVisible($index)" >
	<!--<div class="project-item" ng-repeat="project in main.projects">-->
		<div class="project-signature" >
			<i ng-if="main.projects[$index]['id']!=main.currentProjectId" class="material-icons" ng-click="functions.project.activate($index)">expand_more</i>
			<i ng-if="main.projects[$index]['id']==main.currentProjectId" class="material-icons" ng-click="functions.project.activate($index)">expand_less</i>
			<input class="no-shadow" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="functions.project.set_name($index)" />
			<select ng-model="project.category" ng-change="functions.project.set_category($index)" ng-options="category.uuid as category.label for category in main.categories" chosen disable-search="true"></select>
			<i class="material-icons red" ng-click="functions.project.remove($index)">delete_forever</i>
			<div class="project-desc-wrapper">
				<label>Description:</label>
				<input class="project-desc no-shadow" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="functions.project.set_description($index)" />
			</div>
		</div>
		<div class="scenario-list" ng-class="project.id==main.currentProjectId ? 'open' : 'close'" >
			<div class="scenario-list-title">
				<div class="scenario-signature">
					<h2>SCENARIOS LIST<h2>
				</div>
				<div class="scenario-controls">
					<div class="add-button" ng-click="functions.risk_scenario.newItem(project.id)">
						<i class="material-icons">add_box</i>
						<label>Add Risk Scenario</label>
					</div>
					<div class="add-button" ng-click="functions.scenario.newItem(project.id)">
						<i class="material-icons ml+">add_box</i>
						<label>Add FDS Scenario</label>
					</div>
				</div>
			</div>
			<div class="scenario-item" ng-repeat="scenario in project.scenarios" ng-class="{scenarioItemActive: main.currentProject.scenarios[$index].id===main.currentScenarioId }">
				<div class="scenario-signature" ng-click="functions.scenario.activate(project.id, $index)">
					<i class="material-icons ico">apps</i>
				</div>
				<div class="scenario-controls">
					<input class="no-shadow" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="functions.scenario.set_name($index, project.id)" />
					<i class="material-icons" ng-click="functions.scenario.activate(project.id, $index)">open_in_new</i>
					<i class="material-icons ml+" ng-click="functions.scenario.download(project.id, $index)">file_download</i>
					<i class="material-icons ml+ red" ng-click="functions.scenario.remove(project.id, $index)">delete_forever</i>
				</div>
			</div>	
			<div class="scenario-item" ng-repeat="risk_scenario in project.risk_scenarios" ng-class="{scenarioItemActive:main.currentProject.risk_scenarios[$index].id===main.currentRiskScenarioId}"> 
				<div class="scenario-signature" ng-click="functions.risk_scenario.activate(project.id, $index)">
					<i class="material-icons ico">equalizer</i>
				</div>
				<div class="scenario-controls">	
					<input class="no-shadow" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="functions.risk_scenario.set_name($index, project.id)" />
					<i class="material-icons" ng-click="functions.risk_scenario.activate(project.id, $index)">open_in_new</i>
					<i class="material-icons ml+ red" ng-click="functions.risk_scenario.remove(project.id, $index)">delete_forever</i>
				</div>
			</div>
		</div>
	</div>
</div>
<wf-categories ng-if="main.categoryManager=='open'"></wf-categories>
