<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.matl.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add MATL</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="matl">
				<div class="list-item" ng-repeat="matlItem in geometry.matls|slice:ui.geometry.matl.begin:(ui.geometry.matl.begin+listRange)">
					<a ng-click="functions.matl.activate($index)" ng-class="{active: matlItem===matl}"> {{matlItem.id}} </a>
					<i class="material-icons red" ng-click="functions.matl.removePrompt($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="geometry.matls.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.matl.decreaseRange()">chevron_left</i>
					<p>{{ui.geometry.matl.begin}}-{{ui.geometry.matl.begin+listRange>geometry.matls.length ? geometry.matls.length:ui.geometry.matl.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.matl.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: matl && currentMatlList.type=='lib'}">
			<div ng-if="!matl">
				<label class='header'>Select or add new material</label>
			</div>
			<div ng-if="matl && currentMatlList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{matl.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.setId(currentMatlList)" /> 
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>Density: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_density" pu-elastic-input/>
							<unit>kg/m3</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Emissivity: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_emissivity" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>Absorption coefficient: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_absorption_coefficient" pu-elastic-input/>
							<unit>1/m</unit>
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Conductivity:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_conductivity" pu-elastic-input/>
							<unit>W/(m K)</unit>	
						</div>
					</div>
					<div class="form-column">
						<label>Conductivity RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in ramps.ramps|rampType:'matl'" ng-model="matl.conductivity_ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.matl.addNewRamp(matl,'cond')" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="matl.conductivity_ramp && matl.conductivity_ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i ng-click="functions.matl.addConductivityStep()" class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="matl.conductivity_ramp && matl.conductivity_ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in matl.conductivity_ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t"/>	
									<katex>s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setCF(matl)"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.matl.removeConductivityStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="matl.conductivity_ramp.steps.length>0">
						<wf-d3 steps="matl.conductivity_ramp.steps" value="matl.conductivity" xunit="s" yunit="W/m2K"></wf-d3>
					</div>
				</div>

				<div class="form-row">
					<div class="form-column">
						<label>Specific heat: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_specific_heat" pu-elastic-input/>
							<unit>kJ/(kg K)</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Specific heat RAMP: </label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in ramps.ramps|rampType:'matl'" ng-model="matl.specific_heat_ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.matl.addNewRamp(matl,'spec')" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="matl.specific_heat_ramp && matl.specific_heat_ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i ng-click="functions.matl.addSpecificHeatStep()" class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="matl.specific_heat_ramp && matl.specific_heat_ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in matl.specific_heat_ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setSHF(matl)"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.matl.removeSpecificHeatStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="matl.specific_heat_ramp.steps.length>0">
						<wf-d3 steps="matl.specific_heat_ramp.steps" value="matl.specific_heat" xunit="C" yunit="J/(kg*deg)"></wf-d3>				
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="matl && currentMatlList.type=='lib'">
				<div class="form-title">
					<label class='header'>Library <id>{{matl.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.setId_lib(currentMatlList)" /> 
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>Density: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_density_lib" pu-elastic-input/>
							<unit>kg/m3</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Emissivity: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_emissivity_lib" pu-elastic-input/>
						</div>
					</div>
					<div class="form-column">
						<label>Absorption coefficient: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_absorption_coefficient_lib" pu-elastic-input/>
							<unit>1/m</unit>
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Conductivity:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_conductivity_lib" pu-elastic-input/>
							<unit>W/(m K)</unit>	
						</div>
					</div>
					<div class="form-column">
						<label>Conductivity RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in lib.ramps|rampType:'matl'" ng-model="matl.conductivity_ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.libMatl.addNewRamp(matl,'cond')" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="matl.conductivity_ramp && matl.conductivity_ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i ng-click="functions.matl.addConductivityStep()" class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="matl.conductivity_ramp && matl.conductivity_ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in matl.conductivity_ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setCF(matl)"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.matl.removeConductivityStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="matl.conductivity_ramp.steps.length>0">
						<wf-d3 steps="matl.conductivity_ramp.steps" value="matl.conductivity" xunit="s" yunit="W/m2K"></wf-d3>
					</div>
				</div>

				<div class="form-row">
					<div class="form-column">
						<label>Specific heat: </label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="matl.set_specific_heat_lib" pu-elastic-input/>
							<unit>kJ/(kg K)</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Specific heat RAMP: </label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in lib.ramps|rampType:'matl'" ng-model="matl.specific_heat_ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.libMatl.addNewRamp(matl,'spec')" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="matl.specific_heat_ramp && matl.specific_heat_ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i ng-click="functions.matl.addSpecificHeatStep()" class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="matl.specific_heat_ramp && matl.specific_heat_ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in matl.specific_heat_ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value: </label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setSHF(matl)"/>	
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.matl.removeSpecificHeatStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="matl.specific_heat_ramp.steps.length>0">
						<wf-d3 steps="matl.specific_heat_ramp.steps" value="matl.specific_heat" xunit="C" yunit="J/(kg*deg)"></wf-d3>				
					</div>
				</div>

			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.geometry.matl.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.matl.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libMatl.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add MATL</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libMatl">
							<div class="list-item" ng-repeat="matlItem in lib.matls|slice:ui.geometry.libMatl.begin:(ui.geometry.libMatl.begin+listRange)">
								<a ng-click="functions.libMatl.activate($index)" ng-class="{activeLib: matlItem===matl}">{{matlItem.id}} </a>
								<i class="material-icons" ng-click="functions.libMatl.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libMatl.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom">
							<div  class="list-controls" ng-if="lib.matls.length>listRange">
								<i class="material-icons" ng-click="functions.libMatl.decreaseRange()">chevron_left</i>
								<p>{{ui.geometry.libMatl.begin}}-{{ui.geometry.libMatl.begin+listRange>lib.matls.length ? lib.matls.length:ui.lib.matl.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libMatl.increaseRange()">chevron_right</i> 
							</div>
						</div>

					</div>	
				</div>
			</div><!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.geometry.matl.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.matl.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.matl}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>

