<div class="form-box">
	<div class="form-row">
		<div class="form-column">
			<label>Project name:</label>
			<div class="field-container">
				<input type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_project_name" pu-elastic-input/>
			</div>
		</div>
		<div class="form-column">
			<label>Elevation:</label>
			<div class="field-container">
				<input  class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_elevation" pu-elastic-input/>
			</div>
		</div>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Simulation time:</label>
			<div class="field-container">
				<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_simulation_time" pu-elastic-input/>
				<unit>s</unit>
			</div>
		</div>
		<div class="form-column">
			<label>Number of simulations:</label>
			<div class="field-container">
				<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_number_of_simulations" pu-elastic-input/>
				<unit> </unit>
			</div>
		</div>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Indoor temperature:</label>
			<div class="field-container">
				<input  class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_indoor_temp" pu-elastic-input/>
				<unit>C</unit>
			</div>
		</div>
		<div class="form-column">
			<label>Humidity:</label>
			<div class="field-container">
				<input  class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_humidity" pu-elastic-input/>	
			<unit>%</unit>
			</div>
		</div>
		<div class="form-column">
			<label>Indoor pressure:</label>
			<div class="field-container">
				<input  class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="general.set_indoor_pressure" pu-elastic-input/>
				<unit>Pa</unit>
			</div>
		</div>
	</div>
	<!--
	<div class="form-row-regular import-geometry">
		<button ng-click="functions.import_geometry()">IMPORT GEOMETRY</button>
		<wf-file-input ng-model="geometry.file"></wf-file-input>
	</div>
	-->
	<div class="form-row simulation-controls">
		<button ng-click="functions.start_simulation()">{{run_display}}</button>
		<p>{{sim_display}}</p>
	</div>

</div>
