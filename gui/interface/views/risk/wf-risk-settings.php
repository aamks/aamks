<div class="form-box">
	<div class="form-row-regular">
		<label>PROPERTY</label>
		<label>DISTRIBUTION</label>
		<label>VAR 1</label>
		<label>VAR 2</label>
	</div>
	<div class="form-row-regular">
		<label>WINDOW OPEN </label>
		<label> {{settings.window_open.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.window_open.set_var1" />
		</div>	
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.window_open.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>PLAIN DOOR OPEN</label>
		<label>{{settings.plain_door_open.distribution.label}} </label>
		<div class="field-container">
			<input type=text  class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.plain_door_open.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.plain_door_open.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>DOOR WITH CLOSER</label>
		<label> {{settings.door_with_closer.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.door_with_closer.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.door_with_closer.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>ELECTRIC RELEASE DOOR</label>
		<label> {{settings.electric_release_door.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.electric_release_door.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.electric_release_door.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>ORIGIN OF FIRE</label>
		<label> {{settings.origin_of_fire.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.origin_of_fire.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.origin_of_fire.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE DETECTORS TRIGGER TEMPERATURE</label>
		<label> {{settings.fire_detectors_trigger_temp.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_detectors_trigger_temp.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_detectors_trigger_temp.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE DETECTORS FAILURE</label>
		<label> {{settings.fire_detectors_failure.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_detectors_failure.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_detectors_failure.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>SPRINKLER FAILURE</label>
		<label> {{settings.sprinkler_failure.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.sprinkler_failure.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.sprinkler_failure.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>SPRINKLER TRIGGER TEMPERATURE</label>
		<label> {{settings.sprinkler_trigger_temp.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.sprinkler_trigger_temp.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.sprinkler_trigger_temp.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>OUTDOOR TEMPERATURE</label>
		<label> {{settings.outdoor_temp.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.outdoor_temp.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.outdoor_temp.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>HORIZONTAL SPEED</label>
		<label> {{settings.horizontal_speed.distribution.label}}  </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.horizontal_speed.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.horizontal_speed.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>VERTICAL SPEED</label>
		<label> {{settings.vertical_speed.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.vertical_speed.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.vertical_speed.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>ALARM TIME </label>
		<label> {{settings.alarm_time.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.alarm_time.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.alarm_time.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE LOCATION</label>
		<label> {{settings.fire_location.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_location.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_location.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE HRR</label>
		<label> {{settings.fire_hrr.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_hrr.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_hrr.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE ALPHA</label>
		<label> {{settings.fire_alpha.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_alpha.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_alpha.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE CO</label>
		<label> {{settings.fire_co.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_co.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_co.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>FIRE SOOT</label>
		<label> {{settings.fire_soot.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_soot.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.fire_soot.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>PRE-EVACUATION TIME</label>
		<label> {{settings.pre_movement.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.pre_movement.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.pre_movement.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>PEOPLE DENSITY ROOM</label>
		<label> {{settings.density_room.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.density_room.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.density_room.set_var2" />
		</div>
	</div>
	
	<div class="form-row-regular">
		<label>PEOPLE DENSITY CORRIDOR</label>
		<label> {{settings.density_corridor.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.density_corridor.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.density_corridor.set_var2" />
		</div>
	</div>

	<div class="form-row-regular">
		<label>SPEED ALHPA PARAMETER</label>
		<label> {{settings.alpha_speed.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.alpha_speed.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.alpha_speed.set_var2" />
		</div>
	</div>
	
	<div class="form-row-regular">
		<label>SPEED BETA PARAMETER</label>
		<label> {{settings.beta_speed.distribution.label}} </label>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.beta_speed.set_var1" />
		</div>
		<div class="field-container">
			<input type=text class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="settings.beta_speed.set_var2" />
		</div>
	</div>

</div>
