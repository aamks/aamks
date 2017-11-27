<div class="single-amper-wrapper">
	<div class="amper-container">
<!-- {{{Lista elementow -->
		<div class="list">
			<div class="list-title" ng-click="functions.specie.newItem()">
				<h2>Add SPECIE</h2>
				<i class="material-icons">add_box</i>
			</div>
			<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="specie">
				<div class="list-item" ng-repeat="specieItem in species.species|slice:ui.species.specie.begin:(ui.species.specie.begin+listRange)">
					<a ng-click="functions.specie.activate($index)" ng-class="{active: specieItem===specie}"> {{specieItem.id}} </a>
					<i class="material-icons red" ng-click="functions.specie.remove($index)">delete_forever</i>
				</div>
			</div>
			<div class="list-bottom" ng-if="species.species.length>listRange">
				<div class="list-controls">
					<i class="material-icons" ng-click="functions.specie.decreaseRange()">chevron_left</i>
					<p>{{ui.species.specie.begin}}-{{ui.species.specie.begin+listRange>species.species.length ? species.species.length:ui.species.specie.begin+listRange}}</p>
					<i class="material-icons" ng-click="functions.specie.increaseRange()">chevron_right</i> 
				</div>
			</div>
		</div>
<!--}}}-->
<!-- {{{Edycja elemenu -->
		<div class="form-box" ng-class="{library: specie && currentSpecieList.type=='lib'}">
			<div class="form-row" ng-if="!specie">
				<label class='header'>Click 'New' to add specie to specie list</label>
			</div>
			<div ng-if="specie && currentSpecieList.type=='file'">
				<div class="form-title">
					<label class='header'>{{specie.id}} DEFINITION</label>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Id:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.setId(currentSpecieList)" /> 
						</div>
					</div>
				</div>
				<div class="form-row">
					<div class="form-column">
						<label>Formula:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.set_formula" ng-disabled="specie.editable==false" pu-elastic-input /> 
						</div>
					</div>
					<div class="form-column">
						<label>Molecular weight:</label>
						<div class="field-container">
							<input class="short" type="text" ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.set_mw" ng-disabled="specie.editable==false" pu-elastic-input />
							<unit>g/mol</unit> 
						</div>
					</div>
				</div>
			</div>
<!--}}}-->
<!-- {{{Edycja elementu biblioteki -->
			<div ng-if="specie && currentSpecieList.type=='lib'">
				<div class="form-title">
					<label class='header'>{{specie.id}} DEFINITION</label>
				</div>
				<div class="form-row-regular">
					<label>ID: </label>
					<div class="field-container">
						<input class="short" type=text ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.setId_lib(currentSpecieList)" /> 
					</div>
				</div>
				<div class="form-row-regular">
					<label>FORMULA:</label>
					<div class="field-container">
						<input class="short" type=text   ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.set_formula_lib"   ng-disabled="specie.editable==false"/> 
					</div>
				</div>
				<div class="form-row-regular">
					<label>MOLAR WEIGHT:</label>
					<div class="field-container">
						<input class="short" type=text  ng-model-options="{getterSetter:true, updateOn:'blur'}" ng-model="specie.set_mw_lib"  ng-disabled="specie.editable==false" />
						 <unit>g/mol</unit> 
					</div>
				</div>

			</div>
		</div>
<!--}}}-->
<!-- {{{Lista elementow biblioteki -->
		<div class="lib-wrapper">
			<div class="lib-drawer" ng-class="ui.species.specie.lib=='closed' ? 'closed' : 'open'">
				<div class="lib-label-wrapper">	
					<div class="lib-label" ng-click="functions.specie.switch_lib()">
						<label>LIBRARY</label>
					</div>
				</div>
				<div class="lib-area">
					<div class="list">
						<div class="list-title" ng-click="functions.libSpecie.newItem()">
							<h2>Add SPECIE</h2>
							<i class="material-icons">add_box</i>
						</div>
						<div class="list-items" scrollbar="{axis:'y', alwaysVisible:true, autoUpdate:true}" scrollname="libSpecie">
							<div class="list-item" ng-repeat="specieItem in lib.species|slice:ui.species.libSpecie.begin:(ui.species.libSpecie.begin+listRange)">
								<a ng-click="functions.libSpecie.activate($index)" ng-class="{activeLib: specieItem===specie}"> {{specieItem.id}} </a>
								<i class="material-icons" ng-click="functions.libSpecie.importItem($index)">content_copy</i>
								<i class="material-icons red" ng-click="functions.libSpecie.remove($index)">delete_forever</i>
							</div>
						</div>
						<div class="list-bottom" ng-if="lib.species.length>listRange">
							<div class="list-controls">
								<i class="material-icons" ng-click="functions.libSpecie.decreaseRange()">chevron_left</i>
								<p>{{ui.species.libSpecie.begin}}-{{ui.species.libSpecie.begin+listRange>lib.species.length ? lib.species.length:ui.lib.specie.begin+listRange}}</p>
								<i class="material-icons" ng-click="functions.libSpecie.increaseRange()">chevron_right</i> 
							</div>
						</div>

					</div>	
				</div>
			</div>
<!--}}}-->
<!-- {{{Pomoc -->
			<div class="help-drawer" ng-class="ui.species.specie.help=='closed' ? 'closed' : 'open'">
				<div class="help-label-wrapper">	
					<div class="help-label" ng-click="functions.specie.switch_help()">
						<label>HELP</label>
					</div>
				</div>
				<div class="help-area">
					<p>{{help.specie}}</p>
				</div>
	
			</div>
		</div>
<!--}}}-->
	</div>
</div>
