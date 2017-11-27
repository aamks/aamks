<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.jetfan.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add JETFAN</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="jetfan">
				<div class="list-item" ng-repeat="jetfanItem in ventilation.jetfans|slice:ui.ventilation.jetfan.begin:(ui.ventilation.jetfan.begin+listRange)">
					<a ng-click="functions.jetfan.activate($index)" ng-class="{active: jetfanItem===jetfan}"> {{jetfanItem.id}} </a>
					<i class="material-icons red" ng-click="functions.jetfan.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="ventilation.jetfans.length>listRange">
				<div  class="list-controls">
					<i class="material-icons" ng-click="functions.jetfan.decreaseRange()">chevron_left</i>
					<p>{{ui.ventilation.jetfan.begin}}-{{ui.ventilation.jetfan.begin+listRange>ventilation.jetfan.length ? ventilation.jetfans.length:ui.ventilation.jetfan.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.jetfan.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: jetfan && currentJetfanList.type=='lib'}">
			<div class="form-row" ng-if="!jetfan">
				<label class='header'>Click 'New' to add jetfan</label>
			</div>
			<div ng-if="jetfan && currentJetfanList.type=='file'">
				<div class="form-title">
					<label class='header'>{{jetfan.id}} definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.setId(currentVentList)" /> 
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class='header'>Jetfan XB</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>X1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_x1" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>X2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_x2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_y1" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Y2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_y2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_z1" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Z2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.set_z2" pu-elastic-input />
							<katex>m</unit>
						</div>
					</div>
				</div>

				<!-- Flow type -->
				<div class="form-title">
					<label class='header'>Flow</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Flow type:</label>
						<div class="field-container">
							<select ng-model="jetfan.flow.type" ng-change="jetfan.changeFlowType()" ng-options="element.value as element.label for element in enums.jetfanFlowType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.flow.type=='volumeFlow'">
						<label>Volume flow:</label>
						<div class="field-container">
							<input class="short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_volume_flow" pu-elastic-input /> 
							<katex>{m^3}/s</katex>
							<input class="ml+ short" type="text"  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_volume_flow_per_hour" pu-elastic-input /> 
							<katex>{m^3}/h</unit>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.flow.type=='massFlow'">
						<label>Mass flow:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_mass_flow" pu-elastic-input /> 
							<katex>kg/s</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Flow direction:</label>
						<div class="field-container">
							<select class="short" ng-model="jetfan.direction" ng-change="jetfan.set_direction" ng-options="element.value as element.label for element in enums.jetfanDirection" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column">
						<label>Area type:</label>
						<div class="field-container">
							<select ng-model="jetfan.area.type" ng-change="jetfan.changeAreaType()" ng-options="element.value as element.label for element in enums.jetfanAreaType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='area'">
						<label>Area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_area" pu-elastic-input /> 
							<katex>m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='diameter'">
						<label>Diameter:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_diameter" pu-elastic-input /> 
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='perimeter'">
						<label>Perimeter:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_perimeter" pu-elastic-input /> 
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in ramps.ramps|rampType:'vent'" ng-model="jetfan.ramp" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.jetfan.addNewRamp(jetfan)" class="material-icons">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.ramp && jetfan.ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i class="material-icons" ng-click="functions.jetfan.addRampStep()">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="jetfan.ramp && jetfan.ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in jetfan.ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time: </label>
								<div class="field-container">
									<input ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t" class="short" />	
									<katex>s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value: </label>
								<div class="field-container">
									<input ng-if="jetfan.flow.type=='volumeFlow'" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setVolFlow(jetfan)" class="short" />	
									<input ng-if="jetfan.flow.type=='massFlow'" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setMassFlow(jetfan)" class="short" />	
									<katex ng-if="jetfan.flow.type=='volumeFlow'">m^3/s</katex>
									<katex ng-if="jetfan.flow.type=='massFlow'">kg/s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.jetfan.removeRampStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="jetfan.ramp.steps.length>0">
						<wf-d3 ng-if="jetfan.flow.type=='volumeFlow'" steps="jetfan.ramp.steps" value="jetfan.flow.volume_flow" xunit="s" yunit="m3/s"></wf-d3>
						<wf-d3 ng-if="jetfan.flow.type=='massFlow'" steps="jetfan.ramp.steps" value="jetfan.flow.mass_flow" xunit="s" yunit="kg/s"></wf-d3>
					</div>
				</div>

				<!-- Tangential flow -->
				<div class="form-row">
					<div class="form-column">
						<label>Louver:</label>
						<div class="field-container">
							<input type="checkbox" ng-model="jetfan.louver.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>U-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential1" pu-elastic-input /> 
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>V-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential2" pu-elastic-input /> 
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>W-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential3" pu-elastic-input /> 
						</div>
					</div>
				</div>

				<!-- Devc -->
				<div class="form-row">
					<div class="form-column">
						<label>Destruction temperature:</label>
						<div class="field-container">
							<input type="checkbox" ng-model="jetfan.devc.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.devc.active">
						<label>Temperature:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.devc.set_setpoint" pu-elastic-input /> 
							<katex>^{\circ}C</unit>
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="jetfan && currentJetfanList.type=='lib'">
				<div class="form-title">
					<label class='header'>{{jetfan.id}} definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.setId_lib(currentJetfanList)" /> 
						</div>
					</div>
				</div>

				<!-- Flow type -->
				<div class="form-title">
					<label class='header'>Flow</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Flow type:</label>
						<div class="field-container">
							<select ng-model="jetfan.flow.type" ng-change="jetfan.changeFlowType()" ng-options="element.value as element.label for element in enums.jetfanFlowType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.flow.type=='volumeFlow'">
						<label>Volume flow:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_volume_flow_lib" pu-elastic-input /> 
							<katex>{m^3}/s</katex>
							<input class="ml+ short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_volume_flow_per_hour_lib" pu-elastic-input /> 
							<katex>{m^3}/h</unit>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.flow.type=='massFlow'">
						<label>Mass flow:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.flow.set_mass_flow_lib" pu-elastic-input /> 
							<katex>kg/s</unit>
						</div>
					</div>
					<div class="form-column">
						<label>Flow direction:</label>
						<div class="field-container">
							<select ng-model="jetfan.direction" ng-change="jetfan.set_direction_lib" ng-options="element.value as element.label for element in enums.jetfanDirection" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column">
						<label>Area type:</label>
						<div class="field-container">
							<select ng-model="jetfan.area.type" ng-change="jetfan.changeAreaType()" ng-options="element.value as element.label for element in enums.jetfanAreaType" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='area'">
						<label>Area:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_area_lib" pu-elastic-input /> 
							<katex>m^2</katex>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='diameter'">
						<label>Diameter:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_diameter_lib" pu-elastic-input /> 
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.area.type=='perimeter'">
						<label>Perimeter:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="jetfan.area.set_perimeter_lib" pu-elastic-input /> 
							<katex>m</katex>
						</div>
					</div>
					<div class="form-column-break"/>
					<div class="form-column">
						<label>RAMP:</label>
						<div class="field-container">
							<select ng-options="ramp.id for ramp in lib.ramps|rampType:'vent'" ng-model="jetfan.ramp" chosen disable-search="true" chosen disable-search="true"><option selected value="">No RAMP</option></select> 
							<i ng-click="functions.libJetfan.addNewRamp(jetfan)" class="material-icons" style="vertical-align:bottom; margin-bottom:-2px;">add_box</i>
						</div>
					</div>
					<div class="form-column" ng-if="jetfan.ramp && jetfan.ramp['id']">
						<label>Add step:</label>
						<div class="field-container">
							<i class="material-icons" ng-click="functions.jetfan.addRampStep()">add_box</i>
						</div>
					</div>
				</div>

				<div class="form-diagram" ng-if="jetfan.ramp && jetfan.ramp['id']">
					<div class="form-diagram-container">
						<div class="form-diagram-steps" ng-repeat="step in jetfan.ramp.steps">
							<div class="form-diagram-column">
								<label ng-if="$index==0">Time:</label>
								<div class="field-container">
									<input ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.set_t" class="short" />	
									<katex>s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<label ng-if="$index==0">Value:</label>
								<div class="field-container">
									<input ng-if="jetfan.flow.type=='volumeFlow'" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setVolFlow(jetfan)" class="short" />	
									<input ng-if="jetfan.flow.type=='massFlow'" ng-model-options="{getterSetter:true,  updateOn:'blur' }" ng-model="step.setMassFlow(jetfan)" class="short" />	
									<katex ng-if="jetfan.flow.type=='volumeFlow'">m^3/s</katex>
									<katex ng-if="jetfan.flow.type=='massFlow'">kg/s</katex>
								</div>
							</div>
							<div class="form-diagram-column">
								<i class="material-icons red" ng-click="functions.jetfan.removeRampStep($index)">delete_forever</i>
							</div>
						</div>
					</div>
					<div class="form-diagram-chart" ng-if="jetfan.ramp.steps.length>0">
						<wf-d3 ng-if="jetfan.flow.type=='volumeFlow'" steps="jetfan.ramp.steps" value="jetfan.flow.volume_flow" xunit="s" yunit="m3/s"></wf-d3>
						<wf-d3 ng-if="jetfan.flow.type=='massFlow'" steps="jetfan.ramp.steps" value="jetfan.flow.mass_flow" xunit="s" yunit="kg/s"></wf-d3>
					</div>
				</div>

				<!-- Tangential flow -->
				<div class="form-row">
					<div class="form-column">
						<label>Louver:</label>
						<div class="field-container">
							<input type="checkbox" ng-model="jetfan.louver.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>U-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential1_lib" pu-elastic-input /> 
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>V-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential2_lib" pu-elastic-input /> 
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.louver.active">
						<label>W-vector:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.louver.set_tangential3_lib" pu-elastic-input /> 
						</div>
					</div>
				</div>

				<!-- Devc -->
				<div class="form-row">
					<div class="form-column">
						<label>Destruction temperature:</label>
						<div class="field-container">
							<input type="checkbox" ng-model="jetfan.devc.active"/>
						</div>
					</div>
					<div class="form-column" ng-show="jetfan.devc.active">
						<label>Temperature:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="jetfan.devc.set_setpoint_lib" pu-elastic-input /> 
							<katex>^{\circ}C</unit>
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.ventilation.jetfan.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.jetfan.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libJetfan.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add JETFAN</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libJetfan">
							<div class="list-item" ng-repeat="jetfanItem in lib.jetfans|slice:ui.ventilation.libJetfan.begin:(ui.geometry.libJetfan.begin+listRange)">
								<a ng-click="functions.libJetfan.activate($index)" ng-class="{activeLib: jetfanItem===jetfan}">{{jetfanItem.id}} </a>
								<i class="material-icons" ng-click="functions.libJetfan.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libJetfan.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.jetfans.length>listRange">
							<div  class="list-controls">
								<i class="material-icons" ng-click="functions.libJetfan.decreaseRange()">chevron_left</i>
								<p>{{ui.ventilation.libJetfan.begin}}-{{ui.ventilation.libJetfan.begin+listRange>lib.jetfans.length ? lib.jetfans.length:ui.lib.jetfan.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libJetfan.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.ventilation.jetfan.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">
					<div class="help-label" ng-click="functions.jetfan.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.jetfan}}</p>
				</div>
			</div>
		</div>
<!--}}}-->
	</div>
</div>
