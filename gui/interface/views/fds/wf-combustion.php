<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Edycja elemenu -->
		<div class="form-box">
			<div class="form-title">
				<label class="header">Combustion</label>
			</div>
			<div class="form-row">
				<div class="form-column">
					<label>Turn on combustion reaction:</label>
					<div class="field-container">
						<input type="checkbox" ng-model="fires.combustion.turnOnReaction" />
					</div>
				</div>
			</div>
			<div class="form-row">
				<div class="form-column">
					<label>Id: </label>
					<div class="field-container">
						<input class="string" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fires.combustion.setId(currentFuelList)" /> 
					</div>
				</div>
				<div class="form-column">
					<label>Fuel specie:</label>
					<div class="field-container">
						<select ng-model="fires.combustion.fuel.spec" ng-change="fires.combustion.changeFuel()" ng-options="spec.id for spec in species" chosen disable-search="true"><option selected value="">No specie</option></select>
					</div>
				</div>
			</div>
			<div class="form-title">
				<label class="header">Chemical reaction definition</label>
			</div>
			<div class="form-row" ng-hide="fires.combustion.fuel.spec">
				<div class="form-column">
					<label>Fuel name:</label>
					<div class="field-container">
						<input class="string" type="text" ng-model="fires.combustion.fuel.id" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column-break"></div>
				<div class="form-column">
					<label>Formula:</label>
					<div class="field-container">
						<input class="string" type="text" ng-model-options="{updateOn:'keyup'}" ng-model="fires.combustion.fuel.formula"/>
					</div>
				</div>
				<div class="form-column" ng-hide="fires.combustion.fuel.formula != ''">
					<label>C:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_c" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column" ng-hide="fires.combustion.fuel.formula != ''">
					<label>H:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_h" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column" ng-hide="fires.combustion.fuel.formula != ''">
					<label>O:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_o" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column" ng-hide="fires.combustion.fuel.formula != ''">
					<label>N:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_n" pu-elastic-input/>
					</div>
				</div>
			</div>
			<div class="form-row">
				<div class="form-column">
					<label>Heat of combustion:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_heat_of_combustion" pu-elastic-input/>
						<katex bind="globalAmpers.reac.heat_of_combustion.units"></katex>
					</div>
				</div>
				<div class="form-column">
					<label>Soot yield:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_soot_yield" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column">
					<label>CO yield:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_co_yield" pu-elastic-input/>
					</div>
				</div>
			</div>

			<div class="form-title">
				<label class="header">Radiataion</label>
			</div>
			<div class="form-row">
				<div class="form-column">
					<label>Turn on radiation:</label>
					<div class="field-container">
						<input type="checkbox" ng-model="fires.radiation.radiation"/>
					</div>
				</div>
				<div class="form-column">
					<label>Radiative fraction:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.combustion.fuel.set_radiative_fraction" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column">
					<label>Radcal ID:</label>
					<div class="field-container">
						<select ng-model="fires.combustion.fuel.fuel_radcal_id" ng-options="element.value as element.label for element in enums.radcals" chosen disable-search="true"></select>
					</div>
				</div>
				<div class="form-column">
					<label>Number of radiation angles:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}"  ng-model="fires.radiation.set_number_radiation_angles" pu-elastic-input/>
					</div>
				</div>
				<div class="form-column">
					<label>Time step increment:</label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="fires.radiation.set_time_step_increment" pu-elastic-input/>
					</div>
				</div>
			</div>

		</div>
<!--}}}-->
	</div>
</div>
