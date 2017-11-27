<div class="form-box">
	<div class="form-title">
		<label class="header">General dump</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Data saving counts (NFRAMES):</label>
			<div class="field-container">
				<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="output.general.set_nframes" pu-elastic-input />
			</div>
		</div>
		<div class="form-column">
			<label>Plot 3D save interval (DT_PL3D):</label>
			<div class="field-container">
				<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="output.general.set_dt_pl3d"  pu-elastic-input/>
				<katex>s</katex>
			</div>
		</div>
		<div class="form-column-break"/>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Select Plot3D quanitities:</label>
			<div class="field-container">
				<select ng-change="functions.dump.pl3dQuantitiesChanged(functions.dump.pl3dQuantities)" ng-model="functions.dump.pl3dQuantities" ng-options="element as element.label for element in enums.pl3dQuantities" chosen multiple width="1000"><option value=""></option></select>
			</div>
		</div>
	</div>
	<div class="form-title">
		<label class="header">Other</label>
	</div>
	<div class="form-row">
		<div class="form-column">
			<label>Mass file:</label>
			<div class="field-container">
				<input type=checkbox ng-model="output.general.mass_file"/>
			</div>
		</div>
		<div class="form-column">
			<label>Smoke 3D:</label>
			<div class="field-container">
				<input type=checkbox ng-model="output.general.smoke3d"/> 
			</div>
		</div>
		<div class="form-column">
			<label>Status file:</label>
			<div class="field-container">
				<input type=checkbox ng-model="output.general.status_file"/>
			</div>
		</div>
	</div>

</div>
