<div class="double-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow VENT -->
		<div class="list">
			<div class="list-title" ng-click="functions.vent.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add VENT</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="ventspecie">
				<div class="list-item" ng-repeat="ventItem in species.vents|slice:ui.species.vents.begin:(ui.species.vents.begin+listRange)">
					<a ng-click="functions.vent.activate($index)" ng-class="{active: ventItem===vent}"> {{ventItem.id}} </a>
					<i class="material-icons red" ng-click="functions.vent.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="species.vents.length>listRange">
				<div  class="list-controls">
					<i class="material-icons" ng-click="functions.vent.decreaseRange()">chevron_left</i>
					<p>{{ui.species.vent.begin}}-{{ui.species.vent.begin+listRange>species.vents.length ? species.vents.length:ui.species.vent.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.ventincreaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu VENT -->
		<div class="form-box">
			<div class="form-row" ng-if="!vent">
				<label class='header'>Select or add new vent</label>
			</div>
			<div ng-if="vent && currentVentList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{vent.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.setId(currentVentList)" /> 
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Vent XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1:</label>
						<div class="field-container">
							<input class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_x1" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column">
						<label>X2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_x2" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column">
						<label>Y1:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_y1" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column">
						<label>Y2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_y2" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column">
						<label>Z1:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_z1" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column">
						<label>Z2:</label>
						<div class="field-container">
							<input class="short"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="vent.set_z2" pu-elastic-input/>
							<katex>m</katex>
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Surface:</label>
						<div class="field-container">
							<select ng-change="vent.changeSurfID('{{vent.surf.surf_id.id}}', species.surfs)" ng-model="vent.surf.surf_id" ng-options="surf.id for surf in species.surfs" chosen disable-search="true"><option value="" selected>No SURF</option></select>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
	</div>
	<div class="amper-container">
<!-- {{{Lista elementow SURF -->
		<div class="list">
			<div class="list-title" ng-click="functions.surf.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add SURF</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="surfspecie">
				<div class="list-item" ng-repeat="surfItem in species.surfs|slice:ui.species.surfs.begin:(ui.species.surfs.begin+listRange)">
					<a ng-click="functions.surf.activate($index)" ng-class="{active: surfItem===surf}"> {{surfItem.id}} </a>
					<i class="material-icons" ng-click="functions.surf.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="species.surfs.length>listRange">
				<div  class="list-controls">
					<i class="material-icons" ng-click="functions.surf.decreaseRange()">chevron_left</i>
					<p>{{ui.species.surf.begin}}-{{ui.species.surf.begin+listRange>species.surfs.length ? species.surfs.length:ui.species.surf.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.surf.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu SURF -->
		<div class="form-box" ng-class="{library: surf && currentSurfList.type=='lib'}">
			<div class="form-row" ng-if="!surf">
				<label class='header'>Select or add new surf</label>
			</div>
			<div ng-if="surf && currentSurfList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{surf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.setId(currentSurfList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input class="string" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_color" pu-elastic-input/> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column-break"/>
					<div class="form-column">
						<label>Specie id:</label>
						<div class="field-container">
							<select ng-model="surf.spec" ng-options="specie.id for specie in species.species" chosen><option selected value="">No SPEC</option></select> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Flow type:</label>
						<div class="field-container">
							<select ng-model="surf.flow.type" ng-change="surf.changeFlowType()" ng-options="element.value as element.label for element in enums.surfFlowType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFlux'">
						<label>Mass flux:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_mass_flux" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.mass_flux.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFraction'">
						<label>Mass fraction:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_mass_fraction" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.mass_fraction.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFraction'">
						<label>Mass fraction flow type:</label>
						<div class="field-container">
							<select ng-model="surf.mass_fraction_flow.type" ng-change="surf.changeMassFractionFlowType()" ng-options="element.value as element.label for element in enums.surfMassFractionFlowType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFraction' && surf.mass_fraction_flow.type=='velocity'">
						<label>Velocity:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.mass_fraction_flow.set_velocity" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFraction' && surf.mass_fraction_flow.type=='volumeFlow'">
						<label>Volume flow:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.mass_fraction_flow.set_volume_flow" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.volume_flow.units"></katex>
							<input class="ml+ short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.mass_fraction_flow.set_volume_flow_per_hour" pu-elastic-input /> 
							<katex>{m^3}/h</unit>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFraction' && surf.mass_fraction_flow.type=='totalMassFlux'">
						<label>Total mass flux:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.mass_fraction_flow.mass_flux_total" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.mass_flux_total.units"></katex>
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in ramps.ramps|rampType:'vent'" ng-model="surf.ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.surf.addNewRamp(surf)" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="surf.ramp && surf.ramp['id']">
						<label>Add step:</label>
						<div class="field-container" ng-click="functions.surf.addRampStep()">
							<i class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="surf.ramp && surf.ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in surf.ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time:</label>
								<div class="field-container">
									<input class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t"/>	
									<katex>s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value:</label>
								<div class="field-container">
									<input ng-if="surf.flow.type=='velocity'" class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setVel(surf)"/>	
									<input ng-if="surf.flow.type=='massFlux'" class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setMassFlow(surf)"/>	
									<katex ng-if="surf.flow.type=='velocity'" bind="globalAmpers.surf.vel.units"></katex>
									<katex ng-if="surf.flow.type=='massFlow'" bind="globalAmpers.surf.mass_flux.units"></katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.surf.removeRampStep($index)">delete_forever</i>
							</div>
						</div>
						<div class="form-diagram-chart" ng-if="surf.ramp.steps.length>0">
							<wf-d3 ng-if="surf.flow.type=='velocity'" steps="surf.ramp.steps" value="surf.flow.velocity" xunit="s" yunit="m/s"></wf-d3>
							<wf-d3 ng-if="surf.flow.type=='volumeFlow'" steps="surf.ramp.steps" value="surf.flow.volume_flow" xunit="s" yunit="m3/s"></wf-d3>
							<wf-d3 ng-if="surf.flow.type=='massFlow'" steps="surf.ramp.steps" value="surf.flow.mass_flow" xunit="s" yunit="kg/s"></wf-d3>
						</div>
					</div>
				</div>

				<div class="form-row">
					<div class="form-column">
						<label>Heater:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.heater.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="surf.heater.active">
						<label>Temperature:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.heater.set_temperature" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.tmp_front.units"></katex>
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Louver:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.louver.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="surf.louver.active">
						<label>Tangential velocity horizontal:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="surf.louver.set_tangential1" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel_t.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-show="surf.louver.active">
						<label>Tangential velocity vertical:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="surf.louver.set_tangential2" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel_t.units"></katex>
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elemenu SURF Library -->
			<div ng-if="surf && currentSurfList.type=='lib'">
				<div class="form-title">
					<label class='header'><id>{{surf.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.setId_lib(currentSurfList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Color:</label>
						<div class="field-container">
							<input class="string" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.set_color_lib" pu-elastic-input/> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Flow type:</label>
						<div class="field-container">
							<select ng-model="surf.flow.type" ng-change="surf.changeFlowType()" ng-options="element.value as element.label for element in enums.surfFlowType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='velocity'">
						<label>Velocity:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_velocity_lib" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='volumeFlow'">
						<label>Volume flow:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_volume_flow_lib" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.volume_flow.units"></katex>
							<input class="ml+" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_volume_flow_per_hour_lib" pu-elastic-input /> 
							<katex>{m^3}/h</unit>
						</div>
					</div>
					<div class="form-column" ng-if="surf.flow.type=='massFlow'">
						<label>Mass flow:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.flow.set_mass_flow_lib" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.mass_flux.units"></katex>
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in lib.ramps|rampType:'vent'" ng-model="surf.ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.libSurf.addNewRamp(surf)" class="material-icons" style="vertical-align:bottom; margin-bottom:-2px;">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="surf.ramp && surf.ramp['id']">
						<label>Add step:</label>
						<div class="field-container" ng-click="functions.surf.addRampStep()">
							<i class="material-icons">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="surf.ramp && surf.ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in surf.ramp.steps">
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
									<input ng-if="surf.flow.type=='velocity'" class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setVel(surf)"/>	
									<input ng-if="surf.flow.type=='volumeFlow'" class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setVolFlow(surf)"/>	
									<input ng-if="surf.flow.type=='massFlow'" class="short" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setMassFlow(surf)"/>	
									<katex ng-if="surf.flow.type=='velocity'" bind="globalAmpers.surf.vel.units"></katex>
									<katex ng-if="surf.flow.type=='volumeFlow'" bind="globalAmpers.surf.volume_flow.units"></katex>
									<katex ng-if="surf.flow.type=='massFlow'" bind="globalAmpers.surf.mass_flux.units"></katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.surf.removeRampStep($index)">delete_forever</i>
							</div>
						</div>
						<div class="form-diagram-chart"  ng-if="surf.ramp.steps.length>0">
							<wf-d3 ng-if="surf.flow.type=='velocity'" steps="surf.ramp.steps" value="surf.flow.velocity" xunit="s" yunit="m/s"></wf-d3>
							<wf-d3 ng-if="surf.flow.type=='volumeFlow'" steps="surf.ramp.steps" value="surf.flow.volume_flow" xunit="s" yunit="m3/s"></wf-d3>
							<wf-d3 ng-if="surf.flow.type=='massFlow'" steps="surf.ramp.steps" value="surf.flow.mass_flow" xunit="s" yunit="kg/s"></wf-d3>
						</div>
					</div>
				</div>

				<div class="form-row">
					<div class="form-column">
						<label>Heater:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.heater.active"/>
							<katex bind="globalAmpers.surf.tmp_front.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-show="surf.heater.active">
						<label>Temperature:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="surf.heater.set_temperature_lib" pu-elastic-input/> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Louver:</label>
						<div class="field-container">
							<input type=checkbox ng-model="surf.louver.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="surf.louver.active">
						<label>Tangential velocity horizontal:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="surf.louver.set_tangential1_lib" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel_t.units"></katex>
						</div>
					</div>
					<div class="form-column" ng-show="surf.louver.active">
						<label>Tangential velocity vertical:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="surf.louver.set_tangential2_lib" pu-elastic-input/> 
							<katex bind="globalAmpers.surf.vel_t.units"></katex>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.species.surf.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.surf.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libSurf.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add SURF</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libSpecie">
							<div class="list-item" ng-repeat="surfItem in lib.ventsurfs|slice:ui.species.libSurf.begin:(ui.species.libSurf.begin+listRange)">
								<a ng-click="functions.libSurf.activate($index)" ng-class="{activeLib: surfItem===surf}"> {{surfItem.id}} </a>
								<i class="material-icons" ng-click="functions.libSurf.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libSurf.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.ventsurfs.length>listRange">
							<div  class="list-controls">
								<i class="material-icons" ng-click="functions.libSurf.increaseRange()">chevron_left</i> 
								<p>{{ui.species.libSurf.begin}}-{{ui.species.libSurf.begin+listRange>lib.ventsurfs.length ? lib.ventsurfs.length:ui.species.libSurf.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libSurf.decreaseRange()">chevron_right</i>
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.species.surf.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.surf.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.surf}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
