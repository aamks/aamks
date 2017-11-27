<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.fire.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add FIRE</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="fire">
				<div class="list-item" ng-repeat="fireItem in fires.fires|slice:ui.fires.fires.begin:(ui.fires.fires.begin+listRange)">
					<a ng-click="functions.fire.activate($index)" ng-class="{active: fireItem===fire}"> {{fireItem.id}} </a>
					<i class="material-icons red" ng-click="functions.fire.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="fires.fires.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.fire.decreaseRange()">chevron_left</i>
					<p>{{ui.fires.fire.begin}}-{{ui.fires.fire.begin+listRange>fires.fires.length ? fires.fires.length:ui.fires.fire.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.fire.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: fire && currentFireList.type=='lib'}">
			<div class="form-row" ng-if="!fire">
				<label class='header'>Select or add new fire</label>
			</div>
			<div ng-if="fire && currentFireList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{fire.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.setId(currentFireList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.color" pu-elastic-input /> 
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Fire type</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Fire type:</label>
						<div class="field-container">
							<select ng-model="fire.surf.fire_type" ng-options="element.value as element.label for element in enums.fireType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column-break"></div>
					<div class="form-column" ng-if="fire.surf.fire_type=='constant_hrr'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type" ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='constant_hrr'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type" ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label>Time function:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.time_function" ng-options="element.value as element.label for element in enums.timeFunction" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='ramp'">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in ramps.ramps|rampType:'fire'" ng-model="fire.surf.ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.fire.addNewRamp()" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='tauq'">
						<label>TAU_Q:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_tau_q" pu-elastic-input />
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type" ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Spread rate:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_spread_rate" pu-elastic-input />
							<katex>m/s</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading' || (fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='tauq')">
						<label>Alpha:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_alpha" pu-elastic-input />
							<katex>W/s^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="(fire.surf.fire_type=='radially_spreading' || fire.surf.fire_type=='constant_hrr' || (fire.surf.fire_type=='time_dependent_hrrpua' && !fire.surf.ramp.steps)) && fire.surf.hrr.hrr_type=='hrrpua'">
						<label>Max HRR:</label>
						<div class="field-container">
							{{ fire.totalHRR() }}
							<katex>kW</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading' && fire.surf.hrr.hrr_type=='hrrpua'">
						<label>Max HRR after:</label>
						<div class="field-container">
							{{ fire.totalTime() }}
							<katex>s</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.ramp && fire.surf.ramp.id && fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='ramp'">
						<label>Add step:</label>
						<div class="field-container">
							<i class="material-icons" ng-click="functions.fire.addRampStep()">add_box</i>
						</div>
					</div>
					<div class="form-column-break"></div>
					
					<div class="form-diagram" ng-if="fire.surf.fire_type=='radially_spreading' && fire.surf.hrr.hrr_type=='hrrpua' ">
						<div class="form-diagram-chart">
							<wf-d3 value="fire.totalHRR()" steps="functions.helpers.calculate_sr_points()" xunit="s" yunit="kW" type="curve"></wf-d3>
						</div>
					</div>

					<div class="form-diagram" ng-if="fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='tauq' && fire.surf.hrr.hrr_type=='hrrpua' ">
						<div class="form-diagram-chart">
							<wf-d3 value="fire.totalHRR()" steps="functions.helpers.calculate_tq_points()" xunit="s" yunit="kW" type="curve"></wf-d3>
						</div>
					</div>

					<div class="form-diagram" ng-if="fire.surf.ramp && fire.surf.ramp.id && fire.surf.fire_type=='time_dependent_hrrpua' && fire.surf.hrr.time_function=='ramp'">
						<div class="form-diagram-container">
							<div class="form-diagram-steps" ng-repeat="step in fire.surf.ramp.steps">
								<div class="form-diagram-column">
									<label ng-if="$index==0">T:</label>
									<div class="field-container">
										<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.set_t"/>
										<katex>s</katex>
									</div>
								</div>
								<div class="form-diagram-column">
									<label ng-if="$index==0">HRR:</label>
									<div class="field-container">
										<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.setHRRF(fire)"/>
										<katex>kW</katex>
									</div>
								</div>
								<div class="form-diagram-column">
									<i class="material-icons red" ng-click="functions.fire.removeRampStep($index)">delete_forever</i>
								</div>
							</div>
						</div>
						<div class="form-diagram-chart" ng-if="fire.surf.ramp.steps.length>0">
							<wf-d3 steps="fire.surf.ramp.steps" value="fire.totalHRR()" xunit="s" yunit="kW" type='ramp'></wf-d3>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header" ng-if="fire.surf.fire_type=='time_dependent_hrrpua' || fire.surf.fire_type=='constant_hrr'">Vent XB</label>
					<label class="header" ng-if="fire.surf.fire_type=='radially_spreading'">Vent XB &amp; XYZ</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x1" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x2" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y1" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y2" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z1" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z2" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column-break"></div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>X:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Y:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Z:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="fire && currentFireList.type=='lib'">
				<div class="form-title">
					<label class='header'>Library <id>{{fire.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.setId_lib(currentFireList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.color" pu-elastic-input /> 
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Fire type</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Fire type:</label>
						<div class="field-container">
							<select ng-model="fire.surf.fire_type" ng-options="element.value as element.label for element in enums.fireType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column-break"></div>
					<div class="form-column" ng-if="fire.surf.fire_type=='constant_hrr'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type"  ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='constant_hrr'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value_lib" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type" ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value_lib" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='time_dependent_hrrpua'">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in lib.ramps|rampType:'fire'" ng-model="fire.surf.ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.libFire.addNewRamp()" class="material-icons" style="vertical-align:bottom; margin-bottom:-2px;">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>HRR/MLR:</label>
						<div class="field-container">
							<select ng-model="fire.surf.hrr.hrr_type"  ng-options="element.value as element.label for element in enums.hrrType" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label ng-if="fire.surf.hrr.hrr_type=='hrrpua'">HRR per unit area:</label>
						<label ng-if="fire.surf.hrr.hrr_type=='mlrpua'">MLR per unit area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_value_lib" pu-elastic-input />
							<katex ng-if="fire.surf.hrr.hrr_type=='hrrpua'">kW/m^2</katex>
							<katex ng-if="fire.surf.hrr.hrr_type=='mlrpua'">kg/s\cdot m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Spread rate:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_spread_rate_lib" pu-elastic-input />
							<katex>m/s</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Alpha:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.surf.hrr.set_alpha_lib" pu-elastic-input />
							<katex>W/s^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="(fire.surf.fire_type=='radially_spreading' || fire.surf.fire_type=='constant_hrr' || (fire.surf.fire_type=='time_dependent_hrrpua' && !fire.surf.ramp.steps)) && fire.surf.hrr.hrr_type=='hrrpua'">
						<label>HRR:</label>
						<div class="field-container">
							{{ fire.totalHRR() }}
							<katex>kW</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading' && fire.surf.hrr.hrr_type=='hrrpua'">
						<label>HRR after:</label>
						<div class="field-container">
							{{ fire.totalTime() }}
							<katex>s</katex>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.ramp && fire.surf.ramp.id && fire.surf.fire_type=='time_dependent_hrrpua'">
						<label>Add step:</label>
						<div class="field-container">
							<i class="material-icons" ng-click="functions.fire.addRampStep()" >add_box</i>
						</div>
					</div>
					<div class="form-column-break"></div>

					<div class="form-diagram" ng-if="fire.surf.ramp && fire.surf.ramp.id && fire.surf.fire_type=='time_dependent_hrrpua'">
						<div class="form-diagram-container">
							<div class="form-diagram-steps" ng-repeat="step in fire.surf.ramp.steps">
								<div class="form-diagram-column">
									<label ng-if="$index==0">T:</label>
									<div class="field-container">
										<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.set_t"/>
									</div>
								</div>
								<div class="form-diagram-column">
									<label ng-if="$index==0">F:</label>
									<div class="field-container">
										<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="step.setHRRF(fire)"/>
									</div>
								</div>
								<div class="form-diagram-column">
									<i class="material-icons red" ng-click="functions.fire.removeRampStep($index)">delete_forever</i>
								</div>
							</div>
						</div>
						<div class="form-diagram-chart" ng-if="fire.surf.ramp.steps.length>0">
							<wf-d3 steps="fire.surf.ramp.steps" value="fire.totalHRR()" xunit="s" yunit="kW"></wf-d3>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header" ng-if="fire.surf.fire_type=='time_dependent_hrrpua' || fire.surf.fire_type=='constant_hrr'">Vent XB</label>
					<label class="header" ng-if="fire.surf.fire_type=='radially_spreading'">Vent XB &amp; XYZ</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x1_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x2_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y1_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y2_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z1_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z2_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column-break"></div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>X:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_x_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Y:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_y_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="fire.surf.fire_type=='radially_spreading'">
						<label>Z:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fire.vent.set_z_lib" pu-elastic-input /> 
							<katex>m</unit>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.fires.fire.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.fire.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libFire.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add FIRE</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libFire">
							<div class="list-item" ng-repeat="fireItem in lib.fires|slice:ui.fires.libFire.begin:(ui.fires.libFire.begin+listRange)">
								<a ng-click="functions.libFire.activate($index)" ng-class="{activeLib: fireItem===fire}"> {{fireItem.id}} </a>
								<i class="material-icons" ng-click="functions.libFire.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libFire.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.ventfires.length>listRange">
							<div class="list-controls">
								<i class="material-icons" ng-click="functions.libFire.decreaseRange()">chevron_left</i>
								<p>{{ui.fires.libFire.begin}}-{{ui.fires.libFire.begin+listRange>lib.ventfires.length ? lib.ventfires.length:ui.fires.libFire.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libFire.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.fires.fire.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.fire.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.fire}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
