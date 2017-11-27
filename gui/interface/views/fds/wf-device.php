<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.devc.newItem()">
				<i class="material-icons">add_box</i>
				<h2>Add DEVC</h2>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="devc">
				<div class="list-item" ng-repeat="devcItem in output.devcs|slice:ui.output.devc.begin:(ui.output.devc.begin+listRange)">
					<a ng-click="functions.devc.activate($index)" ng-class="{active: devcItem===devc}"> {{devcItem.id}} </a>
					<i class="material-icons red" ng-click="functions.devc.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="output.devcs.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.devc.decreaseRange()">chevron_left</i>
					<p>{{ui.output.devc.begin}}-{{ui.output.devc.begin+listRange>output.devcs.length ? output.devcs.length:ui.output.devc.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.devc.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: devc && currentDevcList.type=='lib'}">
			<div class="form-row" ng-if="!devc">
				<label class="header">Select or add new device</label>
			</div>
			<div ng-if="devc && currentDevcList.type=='file'">
				<div class="form-title">
					<label class='header'><id>{{devc.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.setId(currentDevcList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Device type:</label>
						<div class="field-container">
							<select ng-model="devc.type" ng-options="element.value as element.label for element in enums.devcType" chosen disable-search="true"></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header">Geometry</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Device geometry type:</label>
						<div class="field-container">
							<select ng-model="devc.geometrical_type" ng-options="element.value as element.label for element in enums.devcGeomType" chosen disable-search="true"></select>
						</div>
					</div>
					<!-- XYZ {{{ -->
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>X: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_x" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>Y: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_y" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>Z: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_z" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<!-- }}} -->
					<!-- XB {{{ -->
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>X1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_x1" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>X2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_x2" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Y1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_y1" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Y2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_y2" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Z1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_z1" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Z2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_z2" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
				</div>
				<!-- }}} -->
				<div class="form-row-regular" ng-if="devc.type=='nozzle'" >
					<label>PROP ID:</label>
					<div class="field-container">
						<select ng-model="devc.prop" ng-options="prop.id for prop in output.props|propType:'nozzle'"></select>
					</div>
				</div>
				<div class="form-row-regular" ng-if="devc.type=='sprinkler'" >
					<label>PROP ID:</label>
					<div class="field-container">
						<select ng-model="devc.prop" ng-options="prop.id for prop in output.props|propType:'sprinkler'"></select>
					</div>
				</div>

				<div class="form-title">
					<label class="header">Basic settings</label>
				</div>
				<div class="form-row" ng-if="devc.type=='basic' || devc.type=='complex'" >
					<div class="form-column">
						<label>Quantity:</label>
						<div class="field-container">
						 	<select ng-model="devc.quantity" ng-options="element as element.label for element in enums.devcQuantities" chosen></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.quantity.spec==true">
						<label>Specie:</label>
						<div class="field-container">
						 	<select ng-model="devc.spec_id" ng-options="spec.id for spec in species.species" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.quantity.part==true">
						<label>Particle:</label>
						<div class="field-container">
							<select ng-model="devc.part_id" ng-options="part.id for part in parts.parts" chosen disable-search="true"></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header">Control logic</label>
				</div>
				<div class="form-row" ng-if="devc.type!='aspiration_intake'" >
					<div class="form-column">
						<label>Set point:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_setpoint" pu-elastic-input/>		
						</div>
					</div>
					<div class="form-column">
						<label>Trip direction:</label>
						<div class="field-container">
							<select ng-model="devc.trip_direction" ng-options="element.value as element.label for element in enums.devcTripDirection" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Latch:</label>
						<div class="field-container">
							<select ng-model="devc.latch" ng-options="element.value as element.label for element in enums.devcLatch" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column">
						<label>Initial state:</label>
						<div class="field-container">
							<select ng-model="devc.initial_state" ng-options="element.value as element.label for element in enums.devcInitialState" chosen disable-search="true"></select> 
						</div>
					</div>
				</div>

				<div class="form-title">
					<label class="header">Advanced settings</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Statistics:</label>
						<div class="field-container">
							<select ng-model="devc.statistics.statistics" ng-options="element.value as element.label for element in enums.devcStatistics" chosen disable-search="true"><option selected value="">No statistics</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.statistics.statistics=='volume integral' || devc.statistics.statistics=='mass integral' || devc.statistics.statistics=='area integral' || devc.statistics.statistics=='surface integral'">
						<label>Lower quantity range:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.statistics.set_integral_lower" pu-elastic-input/>		
						</div>
					</div>
					<div class="form-column" ng-if="devc.statistics.statistics=='volume integral' || devc.statistics.statistics=='mass integral' || devc.statistics.statistics=='area integral' || devc.statistics.statistics=='surface integral'">
						<label>Upper quantity range:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.statistics.set_integral_upper" pu-elastic-input/>		
						</div>
					</div>
				</div>
				<div class="form-row" ng-if="devc.type=='aspiration_intake'">
					<div class="form-column">
						<label>Devc Id:</label>
						<div class="field-container">
							<select ng-model="devc.devc_id" ng-options="devc.id for devc in output.devcs|devcType:'aspiration_unit'" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Flow rate:</label>
						<div class="field-container">
							<input  type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_flowrate"/>
						</div>
					</div>
					<div class="form-column">
						<label>Delay:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_delay"/>
						</div>
					</div>

				</div>
				<div class="form-row"  ng-if="devc.type=='aspiration_unit'">
					<label class="head">Advanced settings:</label>
					<div class="form-row-regular">
						<label>Bypass flowrate:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_bypass_flowrate"/>	
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="devc && currentDevcList.type=='lib'">
				<div class="form-title">
					<label class='header'>Library <id>{{devc.id}}</id> definition</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id: </label>
						<div class="field-container">
							<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.setId_lib(currentDevcList)" /> 
						</div>
					</div>
					<div class="form-column">
						<label>Device type:</label>
						<div class="field-container">
							<select ng-model="devc.type" ng-options="element.value as element.label for element in enums.devcType" chosen disable-search="true"></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header">Geometry</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Device geometry type:</label>
						<div class="field-container">
							<select ng-model="devc.geometrical_type" ng-options="element.value as element.label for element in enums.devcGeomType" chosen disable-search="true"></select>
						</div>
					</div>
					<!-- XYZ {{{ -->
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>X: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_x_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>Y: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_y_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="devc.type=='nozzle'|| devc.type=='smoke_detector'|| devc.type=='heat_detector'||  devc.type=='sprinkler'||  devc.type=='aspiration_intake'|| devc.type=='aspiration_unit' || (devc.type=='basic' && devc.geometrical_type=='point') || (devc.type=='complex' && devc.geometrical_type=='point') ">
						<label>Z: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xyz.set_z_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<!-- }}} -->
					<!-- XB {{{ -->
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>X1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_x1_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>X2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_x2_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Y1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_y1_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Y2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_y2_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Z1: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_z1_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
					<div class="form-column" ng-if="((devc.type=='basic' || devc.type=='complex') && (devc.geometrical_type=='volume' || devc.geometrical_type=='plane')) || devc.type=='beam_detector'">
						<label>Z2: </label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="devc.xb.set_z2_lib" pu-elastic-input/> 
							<katex>m</unit>
						</div>
					</div>
				</div>
				<!-- }}} -->
				<div class="form-row-regular" ng-if="devc.type=='nozzle'" >
					<label>PROP ID:</label>
					<div class="field-container">
						<select ng-model="devc.prop" ng-options="prop.id for prop in output.props|propType:'nozzle'"></select>
					</div>
				</div>
				<div class="form-row-regular" ng-if="devc.type=='sprinkler'" >
					<label>PROP ID:</label>
					<div class="field-container">
						<select ng-model="devc.prop" ng-options="prop.id for prop in output.props|propType:'sprinkler'"></select>
					</div>
				</div>

				<div class="form-title">
					<label class="header">Basic settings</label>
				</div>
				<div class="form-row" ng-if="devc.type=='basic' || devc.type=='complex'" >
					<div class="form-column">
						<label>Quantity:</label>
						<div class="field-container">
						 	<select ng-model="devc.quantity" ng-options="element as element.label for element in enums.devcQuantities" chosen></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.quantity.spec==true">
						<label>Specie:</label>
						<div class="field-container">
						 	<select ng-model="devc.spec_id" ng-options="spec.id for spec in species.species" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.quantity.part==true">
						<label>Particle:</label>
						<div class="field-container">
							<select ng-model="devc.part_id" ng-options="part.id for part in parts.parts" chosen disable-search="true"></select>
						</div>
					</div>
				</div>
				<div class="form-title">
					<label class="header">Control logic</label>
				</div>
				<div class="form-row" ng-if="devc.type!='aspiration_intake'" >
					<div class="form-column">
						<label>Set point:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_setpoint_lib" pu-elastic-input/>		
						</div>
					</div>
					<div class="form-column">
						<label>Trip direction:</label>
						<div class="field-container">
							<select ng-model="devc.trip_direction" ng-options="element.value as element.label for element in enums.devcTripDirection" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Latch:</label>
						<div class="field-container">
							<select ng-model="devc.latch" ng-options="element.value as element.label for element in enums.devcLatch" chosen disable-search="true"></select> 
						</div>
					</div>
					<div class="form-column">
						<label>Initial state:</label>
						<div class="field-container">
							<select ng-model="devc.initial_state" ng-options="element.value as element.label for element in enums.devcInitialState" chosen disable-search="true"></select> 
						</div>
					</div>
				</div>

				<div class="form-title">
					<label class="header">Advanced settings</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Statistics:</label>
						<div class="field-container">
							<select ng-model="devc.statistics.statistics" ng-options="element.value as element.label for element in enums.devcStatistics" chosen disable-search="true"><option selected value="">No statistics</option></select>
						</div>
					</div>
					<div class="form-column" ng-if="devc.statistics.statistics=='volume integral' || devc.statistics.statistics=='mass integral' || devc.statistics.statistics=='area integral' || devc.statistics.statistics=='surface integral'">
						<label>Lower quantity range:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.statistics.set_integral_lower_lib" pu-elastic-input/>		
						</div>
					</div>
					<div class="form-column" ng-if="devc.statistics.statistics=='volume integral' || devc.statistics.statistics=='mass integral' || devc.statistics.statistics=='area integral' || devc.statistics.statistics=='surface integral'">
						<label>Upper quantity range:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.statistics.set_integral_upper_lib" pu-elastic-input/>		
						</div>
					</div>
				</div>
				<div class="form-row" ng-if="devc.type=='aspiration_intake'">
					<div class="form-column">
						<label>Devc Id:</label>
						<div class="field-container">
							<select ng-model="devc.devc_id" ng-options="devc.id for devc in output.devcs|devcType:'aspiration_unit'" chosen disable-search="true"></select>
						</div>
					</div>
					<div class="form-column">
						<label>Flow rate:</label>
						<div class="field-container">
							<input  type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_flowrate_lib"/>
						</div>
					</div>
					<div class="form-column">
						<label>Delay:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_delay_lib"/>
						</div>
					</div>

				</div>
				<div class="form-row"  ng-if="devc.type=='aspiration_unit'">
					<label class="head">Advanced settings:</label>
					<div class="form-row-regular">
						<label>Bypass flowrate:</label>
						<div class="field-container">
							<input type="text" class="short" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="devc.set_bypass_flowrate_lib"/>	
						</div>
					</div>
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.output.devc.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.devc.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libDevc.newItem()">
							<i class="material-icons">add_box</i>
							<h2>Add DEVC</h2>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libDevc">
							<div class="list-item" ng-repeat="devcItem in lib.devcs|slice:ui.output.libDevc.begin:(ui.output.libDevc.begin+listRange)">
								<a ng-click="functions.libDevc.activate($index)" ng-class="{activeLib: devcItem===devc}"> {{devcItem.id}} </a>
								<i class="material-icons" ng-click="functions.libDevc.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libDevc.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.devcs.length>listRange">
							<div class="list-controls">
								<i ng-click="functions.libDevc.decreaseRange()">chevron_left</i>
								<p>{{ui.output.libDevc.begin}}-{{ui.output.libDevc.begin+listRange>lib.devcs.length ? lib.devcs.length:ui.lib.devc.begin+listRange}}</p>
								<i ng-click="functions.libDevc.increaseRange()">chevron_right</i> 
							</div>
						</div>
					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.output.devc.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.devc.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.devc}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
