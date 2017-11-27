<div class="form-box">
	<div class="form-row">
		<div class="form-column">
			<label>Wall:</label>
			<div class="field-container">
				<select ng-options="element.id for element in libMatls" ng-model="materials.wall"><option selected value="">No material </option></select>
			</div>
		</div>
		<div class="form-column">
			<label>Thickness:</label>
			<div class="field-container">
				<input type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="materials.set_thickness_wall" pu-elastic-input/>
				<katex>m</katex>
			</div>
		</div>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Floor:</label>
			<div class="field-container">
				<select ng-options="element.id for element in libMatls" ng-model="materials.floor"><option selected value="">No material </option></select> 
			</div>
		</div>
		<div class="form-column">
			<label>Thickness:</label>
			<div class="field-container">
				<input type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="materials.set_thickness_floor" pu-elastic-input/>
				<katex>m</katex>
			</div>
		</div>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Ceiling:</label>
			<div class="field-container">
				<select ng-options="element.id for element in libMatls" ng-model="materials.ceiling"><option selected value="">No material </option></select>
			</div>
		</div>
		<div class="form-column">
			<label>Thickness:</label>
			<div class="field-container">
				<input type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="materials.set_thickness_ceiling" pu-elastic-input/>
				<katex>m</katex>
			</div>
		</div>
	</div>
</div>
