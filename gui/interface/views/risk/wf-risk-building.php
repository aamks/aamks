<div class="form-box">
	<div class="form-row">
		<div class="form-column">
			<label>Building type:</label>
			<div class="field-container">
				<select ng-options="type.value as type.label for type in enums.buildingType" ng-model="building.type"><option selected value="">No type</option></select> 
			</div>
		</div>
		<div class="form-column">
			<label>Alarming type:</label>
			<div class="field-container">
				<select ng-options="type.value as type.label for type in enums.alarmType" ng-model="building.alarming_type"><option selected value="">No alarming</option></select>	
			</div>
		</div>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Has fire detectors:</label>
			<div class="field-container">
				<input type=checkbox  ng-model="building.has_fire_detectors"/>
			</div>
		</div>
		<div class="form-column">
			<label>Has sprinklers:</label>
			<div class="field-container">
				<input type=checkbox  ng-model="building.has_sprinklers"/>
			</div>
		</div>
		<div class="form-column">
			<label>Has trained staff:</label>
			<div class="field-container">
				<input type=checkbox  ng-model="building.has_trained_staff"/>
			</div>
		</div>
		<div class="form-column">
			<label>Has voice alarm system:</label>
			<div class="field-container">
				<input type=checkbox  ng-model="building.has_dso"/>
			</div>
		</div>
	</div>
</div>
