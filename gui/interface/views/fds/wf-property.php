<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.prop.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add PROP</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="prop">
				<div class="list-item" ng-repeat="propItem in output.props|slice:ui.output.prop.begin:(ui.output.prop.begin+listRange)">
					<a ng-click="functions.prop.activate($index)" ng-class="{active: propItem===prop}"> {{propItem.id}} </a>
					<i class="material-icons red" ng-click="functions.prop.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="output.props.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.prop.decreaseRange()">chevron_left</i>
					<p>{{ui.output.prop.begin}}-{{ui.output.prop.begin+listRange>output.props.length ? output.props.length:ui.output.prop.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.prop.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: prop && currentPropList.type=='lib'}">
			<div class="form-row" ng-if="!prop">
				<label class='header'>Click 'New' to add prop to prop list</label>
			</div>
			<div ng-if="prop && currentPropList.type=='file'">
				<div class="form-title">
					<label class='header'>{{prop.id}} DEFINITION</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.setId(currentPropList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Type:</label>
						<div class="field-container">
							<select ng-model="prop.type" ng-options="element.value as element.label for element in enums.propQuantities" chosen disable-search="true"></select>
						</div>
					</div>
				</div>

				<div class="form-row form-row-group">
					<label class="head">Settings</label>
					<div class="form-column" ng-if="prop.type=='sprinkler' || prop.type=='heat_detector'">
						<label>RTI:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="prop.set_rti" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>C factor:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_k_factor" pu-elastic-input/>
						</div>
					</div>	
					<div class="form-column" ng-if="prop.type=='sprinkler' || prop.type=='heat_detector'" >
						<label>Activation temperature:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_activation_temperature" pu-elastic-input/>	
						</div>
					</div>
					<div class="form-column" ng-if="prop.type=='sprinkler' || prop.type=='heat_detector'" >
						<label>Initial temperature:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_activation_temperature" pu-elastic-input/>	
						</div>
					</div>

					<div class="form-column-break"/>

					<div class="form-column">
						<label>Flow type:</label>
						<div class="field-container">
							<select ng-model="prop.flow_type" ng-options="element.value as element.label for element in enums.propFlowType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="prop.flow_type=='flowRate'">
						<label>Flow rate:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_flow_rate" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column" ng-if="prop.flow_type=='massFlowRate'">
						<label>Mass flow rate:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_mass_flow_rate" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column" ng-if="prop.flow_type=='kFactor'">
						<label>K factor:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_k_factor" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column" ng-if="prop.flow_type=='kFactor'">
						<label>Operating pressure:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_operating_pressure" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>Orifice diameter:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_orifice_diameter" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column" ng-if="prop.flow_type!='kFactor'">
						<label>Particle velocity:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_particle_velocity" pu-elastic-input/>
						</div>
					</div>

					<div class="form-column-break"/>


					<div class="form-column">
						<label>Offset:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_offset" pu-elastic-input/>	
						</div>
					</div>
				</div>

				<div class="form-row form-row-group">
					<label class="head">Spray angle</label>
					<div class="form-title">
						<label>Add angle:</label>
						<i class="material-icons" ng-click="functions.prop.addAngle()">add_box</i>
					</div>
					<div class="form-column">
						<label>Spray pattern shape:</label>
						<div class="field-container">
							<select ng-model="prop.spray_pattern_shape" ng-options="element.value as element.label for element in enums.propSprayPattern" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="prop.spray_pattern_shape=='gaussian'">
						<label>Spray pattern mu:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_pattern_mu" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column" ng-if="prop.spray_pattern_shape=='gaussian'">
						<label>Spray pattern beta:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_pattern_beta" pu-elastic-input/>
						</div>
					</div>
					<div ng-repeat="spray_angle in prop.spray_angle">
						<div class="form-column">
							<label>Spray angle 1:</label>
							<div class="field-container">
								<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="spray_angle.sp1" pu-elastic-input/>
							</div>
						</div>
						<div class="form-column">
							<label>Spray angle 2:</label>
							<div class="field-container">
								<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="spray_angle.sp2" pu-elastic-input/> 
							</div>
						</div>
						<div class="form-column">
							<div class="field-container">
								<i class="material-icons" ng-click="functions.prop.removeAngle($index)">delete_forever</i>
							</div>
						</div>
					</div>

				</div>



				<div class="field-group" ng-if="prop.type=='sprinkler' || prop.type=='nozzle'" >
					<div class="form-row-regular">
						<label>PARTICLE:</label>
						<div class="field-container">
							<select ng-model="prop.part_id" ng-options="part.id for part in parts.parts"></select> 	
						</div>
					</div>	
					<div class="form-row-regular">
						<label>PRESSURE RAMP:</label>
						<div class="field-container">
							<select ng-model="prop.pressure_ramp" ng-options="ramp.id for ramp in rampFunctions.ramps"></select> 
						</div>
					</div>	
					<div class="form-row-double">
						<label>SPRAY ANGLE:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_angle1"/>	
						</div>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_angle2"/>	
						</div>
					</div>	
				</div>
				<div class="field-group" ng-if="prop.type=='smoke_detector'" >
					<div class="form-row-regular">
						<label>MODEL: </label>
						<div class="field-container">
							<select  ng-model="prop.smoke_detector_model" ng-options="element.value as element.label for element in enums.smokeDetectorModel"></select>
						</div>
					</div>	
					<div class="form-row-regular" ng-if="prop.smoke_detector_model=='heskestad'">
						<label>PATH LENGTH:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_path_length"/>
						</div>
					</div>	
					<div class="field-group" ng-if="prop.smoke_detector_model=='cleary'" >
						<div class="form-row-regular">
							<label>TYPE:</label>
							<div class="field-container">
								<select ng-change="prop.change_smoke_detector_model_type()"  ng-model="prop.smoke_detector_model_type" ng-options="element.value as element.label for element in enums.clearyParams"></select>
							</div>
						</div>	
						<div class="form-row-regular">
							<label>ALPHA E:</label>
							<div class="field-container">
								<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_alpha_e"/>	
							</div>
						</div>	
						<div class="form-row-regular">
							<label>BETA E:</label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_beta_e"/>	
							</div>
						</div>	
						<div class="form-row-regular">
							<label>ALPHA C: </label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_alpha_c"/>
							</div>
						</div>	
						<div class="form-row-regular">
							<label>BETA C: </label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_beta_c"/>
							</div>
						</div>	
					</div>
					<div class="form-row-regular">
						<label>ACTIVATION OBSCURATION:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_activation_obscuration"/>	
						</div>
					</div>

				</div>
				<div class="form-row-regular">
					<label>SMOKEVIEW VISUALISATION:</label>
					<div class="field-container">
					 	<select ng-model="prop.smokeview_id" ng-options="element.value as element.label for element in enums.propSmokeviewId"></select>
					</div>
				</div>


			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="prop && currentPropList.type=='lib'">
				<div class="form-title">
					<label class='header'>{{prop.id}} DEFINITION</label>
				</div>
				<div class="form-row-regular">
					<label>ID: </label>
					<div class="field-container">
						<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.setId_lib(currentPropList)" /> 
					</div>
				</div>

				<div class="form-row-regular">
					<label>TYPE:</label>
					<div class="field-container">
						<select ng-model="prop.type" ng-options="element.value as element.label for element in enums.propQuantities"></select>
					</div>
				</div>
				<div class="form-row-regular" ng-if="prop.type=='sprinkler' || prop.type=='heat_detector'">
					<label>RTI:</label>
					<div class="field-container">
						<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="prop.set_rti_lib"/>
					</div>
				</div>
				<div class="form-row-regular" ng-if="prop.type=='sprinkler' || prop.type=='heat_detector'" >
					<label>ACTIVATION TEMPERATURE </label>
					<div class="field-container">
						<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_activation_temperature_lib"/>	
					</div>
				</div>

				<div class="field-group" ng-if="prop.type=='sprinkler' || prop.type=='nozzle'" >
					<div class="form-row-regular">
						<label>OFFSET: </label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_offset_lib"/>	
						</div>
					</div>
					<div class="form-row-regular">
						<label>FLOW RATE:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_flow_rate_lib"/>
						</div>
					</div>	
					<div class="form-row-regular">
						<label>OPERATING PRESSURE:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_operating_pressure_lib"/>
						</div>
					</div>	
					<div class="form-row-regular">
						<label>K FACTOR:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_k_factor_lib"/>
						</div>
					</div>	
					<div class="form-row-regular">
						<label>PARTICLE VELOCITY:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_particle_velocity_lib"/>	
						</div>
					</div>	
					<div class="form-row-regular">
						<label>PARTICLE:</label>
						<div class="field-container">
							<select ng-model="prop.part_id" ng-options="part.id for part in lib.parts"></select> 	
						</div>
					</div>	
					<div class="form-row-regular">
						<label>PRESSURE RAMP:</label>
						<div class="field-container">
							<select ng-model="prop.pressure_ramp" ng-options="ramp.id for ramp in rampFunctions.ramps"></select> 
						</div>
					</div>	
					<div class="form-row-double">
						<label>SPRAY ANGLE:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_angle1_lib"/>	
						</div>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_spray_angle2_lib"/>	
						</div>
					</div>	
				</div>
				<div class="field-group" ng-if="prop.type=='smoke_detector'" >
					<div class="form-row-regular">
						<label>MODEL: </label>
						<div class="field-container">
							<select  ng-model="prop.smoke_detector_model" ng-options="element.value as element.label for element in enums.smokeDetectorModel"></select>
						</div>
					</div>	
					<div class="form-row-regular" ng-if="prop.smoke_detector_model=='heskestad'">
						<label>PATH LENGTH:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_path_length_lib"/>
						</div>
					</div>	
					<div class="field-group" ng-if="prop.smoke_detector_model=='cleary'" >
						<div class="form-row-regular">
							<label>TYPE:</label>
							<div class="field-container">
								<select ng-change="prop.change_smoke_detector_model_type()"  ng-model="prop.smoke_detector_model_type" ng-options="element.value as element.label for element in enums.clearyParams"></select>
							</div>
						</div>	
						<div class="form-row-regular">
							<label>ALPHA E:</label>
							<div class="field-container">
								<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_alpha_e_lib"/>	
							</div>
						</div>	
						<div class="form-row-regular">
							<label>BETA E:</label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_beta_e_lib"/>	
							</div>
						</div>	
						<div class="form-row-regular">
							<label>ALPHA C: </label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_alpha_c_lib"/>
							</div>
						</div>	
						<div class="form-row-regular">
							<label>BETA C: </label>
							<div class="field-container">
								<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_beta_c_lib"/>
							</div>
						</div>	
					</div>
					<div class="form-row-regular">
						<label>ACTIVATION OBSCURATION:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="prop.set_activation_obscuration_lib"/>	
						</div>
					</div>

				</div>
				<div class="form-row-regular">
					<label>SMOKEVIEW VISUALISATION:</label>
					<div class="field-container">
					 	<select ng-model="prop.smokeview_id" ng-options="element.value as element.label for element in enums.propSmokeviewId"></select>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.output.prop.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.prop.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libProp.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add PROP</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libProp">
							<div class="list-item" ng-repeat="propItem in lib.props|slice:ui.output.libProp.begin:(ui.output.libProp.begin+listRange)">
								<a ng-click="functions.libProp.activate($index)" ng-class="{activeLib: propItem===prop}"> {{propItem.id}} </a>
								<i class="material-icons" ng-click="functions.libProp.importFromLib($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libProp.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.props.length>listRange">
							<div  class="list-controls">
								<i class="material-icons" ng-click="functions.libProp.decreaseRange()">chevron_left</i>
								<p>{{ui.output.libProp.begin}}-{{ui.output.libProp.begin+listRange>lib.props.length ? lib.props.length:ui.lib.prop.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libProp.increaseRange()">chevron_right</i> 
							</div>
						</div>

					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.output.prop.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.prop.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.prop}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
